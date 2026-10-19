import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { INITIAL_PRODUCTS, DEFAULT_SITE_SETTINGS } from '@/data/products';
import { Product, SiteSettings, Order } from '@/types/store';
import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

const DATA_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'store-data.json');
const BACKUP_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'store-data.backup.json');
const BACKUPS_DIR = path.join(process.cwd(), 'src', 'data', 'backups');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

interface StoreData {
  products: Product[];
  siteSettings: SiteSettings;
  orders: Order[];
  lastUpdated?: string;
}

const getDefaultData = (): StoreData => ({
  products: INITIAL_PRODUCTS,
  siteSettings: DEFAULT_SITE_SETTINGS,
  orders: [],
  lastUpdated: new Date().toISOString(),
});

/**
 * Salva base64 como arquivo físico e/ou no MongoDB para não inchar o documento de produtos
 */
async function offloadBase64Images(products: Product[]): Promise<Product[]> {
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true }).catch(() => {});
    const db = await getDatabase();

    return await Promise.all(
      products.map(async (prod, prodIdx) => {
        if (!Array.isArray(prod.images)) return prod;

        const updatedImages = await Promise.all(
          prod.images.map(async (img, imgIdx) => {
            if (typeof img === 'string' && img.startsWith('data:image/')) {
              try {
                const match = img.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
                if (match) {
                  const rawExt = match[1].toLowerCase();
                  const ext = rawExt === 'jpeg' ? '.jpg' : `.${rawExt}`;
                  const buffer = Buffer.from(match[2], 'base64');
                  const filename = `prod-${Date.now()}-${prodIdx}-${imgIdx}${ext}`;

                  // 1. Tenta salvar no disco local
                  try {
                    const filePath = path.join(UPLOADS_DIR, filename);
                    await fs.writeFile(filePath, buffer);
                  } catch {}

                  // 2. Salva no MongoDB
                  if (db) {
                    try {
                      await db.collection('uploads').updateOne(
                        { filename },
                        {
                          $set: {
                            filename,
                            contentType: `image/${rawExt}`,
                            data: buffer.toString('base64'),
                            size: buffer.length,
                            createdAt: new Date().toISOString(),
                          },
                        },
                        { upsert: true }
                      );
                    } catch (dbErr) {
                      console.warn('Erro ao salvar imagem no MongoDB:', dbErr);
                    }
                  }

                  return `/uploads/${filename}`;
                }
              } catch (e) {
                console.warn('Erro ao descarregar imagem base64:', e);
              }
            }
            return img;
          })
        );

        return { ...prod, images: updatedImages };
      })
    );
  } catch (err) {
    console.warn('Erro geral ao processar imagens:', err);
    return products;
  }
}

/**
 * Lê os dados da loja:
 * 1. Tenta primeiro no MongoDB (se conectado). Se for primeira vez, auto-popula com os dados locais.
 * 2. Se MongoDB não estiver configurado, lê do arquivo local com proteção de backup.
 */
async function readStoreData(): Promise<StoreData> {
  // 1. Tenta ler do MongoDB
  try {
    const db = await getDatabase();
    if (db) {
      const doc = await db.collection('store_data').findOne({ _id: 'main' as any });
      if (doc && (Array.isArray(doc.products) || doc.siteSettings)) {
        return {
          products: Array.isArray(doc.products) ? doc.products : INITIAL_PRODUCTS,
          siteSettings: doc.siteSettings
            ? { ...DEFAULT_SITE_SETTINGS, ...doc.siteSettings }
            : DEFAULT_SITE_SETTINGS,
          orders: Array.isArray(doc.orders) ? doc.orders : [],
          lastUpdated: doc.lastUpdated || new Date().toISOString(),
        };
      }

      // Se o MongoDB estiver conectado mas vazio (primeira vez), lê o local e sobe para o MongoDB
      console.log('MongoDB vazio: inicializando banco com os dados existentes...');
      const localData = await readLocalStoreData();
      try {
        await db.collection('store_data').updateOne(
          { _id: 'main' as any },
          { $set: { ...localData, lastUpdated: new Date().toISOString() } },
          { upsert: true }
        );
      } catch (insertErr) {
        console.warn('Erro ao popular MongoDB inicialmente:', insertErr);
      }
      return localData;
    }
  } catch (mongoErr) {
    console.warn('Aviso: falha na conexão MongoDB, usando fallback local:', mongoErr);
  }

  // 2. Fallback local
  return await readLocalStoreData();
}

/**
 * Leitura de segurança do arquivo local
 */
async function readLocalStoreData(): Promise<StoreData> {
  try {
    const raw = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed && (Array.isArray(parsed.products) || parsed.siteSettings)) {
      return {
        products: Array.isArray(parsed.products) ? parsed.products : INITIAL_PRODUCTS,
        siteSettings: parsed.siteSettings
          ? { ...DEFAULT_SITE_SETTINGS, ...parsed.siteSettings }
          : DEFAULT_SITE_SETTINGS,
        orders: Array.isArray(parsed.orders) ? parsed.orders : [],
        lastUpdated: parsed.lastUpdated || new Date().toISOString(),
      };
    }
  } catch (err: any) {
    console.warn('Aviso: Falha ao ler store-data.json, tentando backup...', err?.message);
  }

  try {
    const rawBackup = await fs.readFile(BACKUP_FILE_PATH, 'utf-8');
    const parsedBackup = JSON.parse(rawBackup);
    if (parsedBackup && (Array.isArray(parsedBackup.products) || parsedBackup.siteSettings)) {
      return {
        products: Array.isArray(parsedBackup.products) ? parsedBackup.products : INITIAL_PRODUCTS,
        siteSettings: parsedBackup.siteSettings
          ? { ...DEFAULT_SITE_SETTINGS, ...parsedBackup.siteSettings }
          : DEFAULT_SITE_SETTINGS,
        orders: Array.isArray(parsedBackup.orders) ? parsedBackup.orders : [],
        lastUpdated: parsedBackup.lastUpdated || new Date().toISOString(),
      };
    }
  } catch (backupErr: any) {}

  return getDefaultData();
}

/**
 * Gravação Atômica: grava no MongoDB (se disponível) e no disco local
 */
async function writeStoreData(data: StoreData): Promise<void> {
  const dataToSave: StoreData = {
    ...data,
    lastUpdated: new Date().toISOString(),
  };

  // 1. Salva no MongoDB para persistência definitiva em nuvem
  try {
    const db = await getDatabase();
    if (db) {
      await db.collection('store_data').updateOne(
        { _id: 'main' as any },
        {
          $set: {
            products: dataToSave.products,
            siteSettings: dataToSave.siteSettings,
            orders: dataToSave.orders,
            lastUpdated: dataToSave.lastUpdated,
          },
        },
        { upsert: true }
      );
      console.log('Dados salvos com sucesso no MongoDB Atlas!');
    }
  } catch (mongoSaveErr) {
    console.error('Erro ao salvar no MongoDB:', mongoSaveErr);
  }

  // 2. Tenta salvar no disco local com backups (se ambiente permitir escrita)
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    await fs.mkdir(dir, { recursive: true });
    await fs.mkdir(BACKUPS_DIR, { recursive: true }).catch(() => {});

    const jsonString = JSON.stringify(dataToSave, null, 2);

    // Backup
    try {
      const exists = await fs.access(DATA_FILE_PATH).then(() => true).catch(() => false);
      if (exists) {
        await fs.copyFile(DATA_FILE_PATH, BACKUP_FILE_PATH).catch(() => {});
      }
    } catch {}

    const tempFilePath = `${DATA_FILE_PATH}.tmp-${Date.now()}`;
    await fs.writeFile(tempFilePath, jsonString, 'utf-8');
    try {
      await fs.rename(tempFilePath, DATA_FILE_PATH);
    } catch {
      await fs.copyFile(tempFilePath, DATA_FILE_PATH);
      await fs.unlink(tempFilePath).catch(() => {});
    }
  } catch (fsErr) {
    // Em produção na Vercel (read-only filesystem), isso é esperado se não houver disco gravável
    console.log('Escrita em disco ignorada (ambiente serverless/read-only).');
  }
}

export async function GET() {
  try {
    const data = await readStoreData();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Erro ao ler dados da loja:', error);
    return NextResponse.json(getDefaultData(), { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const current = await readStoreData();

    // Reset
    if (body.reset) {
      const resetData = getDefaultData();
      await writeStoreData(resetData);
      return NextResponse.json({ success: true, ...resetData });
    }

    // Processa imagens base64 se houver
    let sanitizedProducts = current.products;
    if (Array.isArray(body.products)) {
      sanitizedProducts = await offloadBase64Images(body.products);
    }

    const updatedData: StoreData = {
      products: sanitizedProducts,
      siteSettings: body.siteSettings
        ? {
            ...current.siteSettings,
            ...body.siteSettings,
            advantages: body.siteSettings.advantages !== undefined
              ? body.siteSettings.advantages
              : current.siteSettings.advantages,
            categories: body.siteSettings.categories !== undefined
              ? body.siteSettings.categories
              : current.siteSettings.categories,
          }
        : current.siteSettings,
      orders: Array.isArray(body.orders) ? body.orders : current.orders,
      lastUpdated: new Date().toISOString(),
    };

    await writeStoreData(updatedData);
    return NextResponse.json({ success: true, ...updatedData });
  } catch (error: any) {
    console.error('Erro ao salvar dados da loja:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro ao persistir dados' },
      { status: 500 }
    );
  }
}
