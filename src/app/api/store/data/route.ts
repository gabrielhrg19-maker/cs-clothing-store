import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { INITIAL_PRODUCTS, DEFAULT_SITE_SETTINGS } from '@/data/products';
import { Product, SiteSettings, Order } from '@/types/store';

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
 * Salva base64 como arquivo físico em public/uploads para não inchar o JSON do banco
 */
async function offloadBase64Images(products: Product[]): Promise<Product[]> {
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
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
                  const filePath = path.join(UPLOADS_DIR, filename);
                  await fs.writeFile(filePath, buffer);
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
 * Lê os dados da loja com múltiplos níveis de segurança e backups.
 * NUNCA apaga dados em caso de erro!
 */
async function readStoreData(): Promise<StoreData> {
  // 1. Tenta ler o arquivo principal
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
    console.warn('Aviso: Falha ao ler arquivo principal store-data.json, tentando backup...', err?.message);
  }

  // 2. Tenta ler o arquivo de backup imediato se o principal falhou
  try {
    const rawBackup = await fs.readFile(BACKUP_FILE_PATH, 'utf-8');
    const parsedBackup = JSON.parse(rawBackup);
    if (parsedBackup && (Array.isArray(parsedBackup.products) || parsedBackup.siteSettings)) {
      console.log('Recuperado com sucesso a partir de store-data.backup.json');
      return {
        products: Array.isArray(parsedBackup.products) ? parsedBackup.products : INITIAL_PRODUCTS,
        siteSettings: parsedBackup.siteSettings
          ? { ...DEFAULT_SITE_SETTINGS, ...parsedBackup.siteSettings }
          : DEFAULT_SITE_SETTINGS,
        orders: Array.isArray(parsedBackup.orders) ? parsedBackup.orders : [],
        lastUpdated: parsedBackup.lastUpdated || new Date().toISOString(),
      };
    }
  } catch (backupErr: any) {
    console.warn('Aviso: Falha ao ler store-data.backup.json', backupErr?.message);
  }

  // 3. Somente se o arquivo realmente não existir pela primeira vez, inicializa sem destruir nada
  const initial = getDefaultData();
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    await fs.mkdir(dir, { recursive: true });
    // Só grava se o arquivo principal realmente não existir
    try {
      await fs.access(DATA_FILE_PATH);
    } catch {
      await fs.writeFile(DATA_FILE_PATH, JSON.stringify(initial, null, 2), 'utf-8');
    }
  } catch (initErr) {
    console.error('Erro na inicialização de store-data.json:', initErr);
  }
  return initial;
}

/**
 * Gravação Atômica Ultra-Segura com Criação de Backups
 */
async function writeStoreData(data: StoreData): Promise<void> {
  const dir = path.dirname(DATA_FILE_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.mkdir(BACKUPS_DIR, { recursive: true });

  const dataToSave: StoreData = {
    ...data,
    lastUpdated: new Date().toISOString(),
  };

  const jsonString = JSON.stringify(dataToSave, null, 2);

  // 1. Cria backup prévio do arquivo atual se ele existir
  try {
    const exists = await fs.access(DATA_FILE_PATH).then(() => true).catch(() => false);
    if (exists) {
      await fs.copyFile(DATA_FILE_PATH, BACKUP_FILE_PATH);

      // Salva snapshot no histórico de backups (limitado aos 10 mais recentes)
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const historyFile = path.join(BACKUPS_DIR, `store-data-${timestamp}.json`);
      await fs.copyFile(DATA_FILE_PATH, historyFile);

      // Limpeza de backups antigos para não acumular
      try {
        const files = await fs.readdir(BACKUPS_DIR);
        const jsonBackups = files.filter(f => f.startsWith('store-data-') && f.endsWith('.json')).sort();
        if (jsonBackups.length > 10) {
          for (const oldFile of jsonBackups.slice(0, jsonBackups.length - 10)) {
            await fs.unlink(path.join(BACKUPS_DIR, oldFile)).catch(() => {});
          }
        }
      } catch (cleanErr) {}
    }
  } catch (backupErr) {
    console.warn('Aviso ao gerar backup prévio:', backupErr);
  }

  // 2. Gravação atômica: primeiro grava em arquivo temporário (.tmp)
  const tempFilePath = `${DATA_FILE_PATH}.tmp-${Date.now()}`;
  await fs.writeFile(tempFilePath, jsonString, 'utf-8');

  // 3. Move o arquivo temporário para o destino final (operação atômica que previne corrupção de arquivo)
  try {
    await fs.rename(tempFilePath, DATA_FILE_PATH);
  } catch (renameErr) {
    // Fallback no Windows em caso de arquivo temporariamente em uso
    await fs.copyFile(tempFilePath, DATA_FILE_PATH);
    await fs.unlink(tempFilePath).catch(() => {});
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

    // Reset com backup de emergência
    if (body.reset) {
      // Salva um backup explícito antes de qualquer reset
      const resetBackupPath = path.join(BACKUPS_DIR, `pre-reset-${Date.now()}.json`);
      await fs.writeFile(resetBackupPath, JSON.stringify(current, null, 2), 'utf-8').catch(() => {});

      const resetData = getDefaultData();
      await writeStoreData(resetData);
      return NextResponse.json({ success: true, ...resetData });
    }

    // Se produtos foram enviados, descarrega imagens base64 para arquivos em /public/uploads
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
