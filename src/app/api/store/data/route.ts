import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { INITIAL_PRODUCTS, DEFAULT_SITE_SETTINGS } from '@/data/products';
import { Product, SiteSettings, Order } from '@/types/store';

const DATA_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'store-data.json');

interface StoreData {
  products: Product[];
  siteSettings: SiteSettings;
  orders: Order[];
}

const getDefaultData = (): StoreData => ({
  products: INITIAL_PRODUCTS,
  siteSettings: DEFAULT_SITE_SETTINGS,
  orders: [],
});

async function readStoreData(): Promise<StoreData> {
  try {
    const raw = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      products: Array.isArray(parsed.products) ? parsed.products : INITIAL_PRODUCTS,
      siteSettings: parsed.siteSettings ? { ...DEFAULT_SITE_SETTINGS, ...parsed.siteSettings } : DEFAULT_SITE_SETTINGS,
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
    };
  } catch (err: any) {
    // Se o arquivo não existir ou for inválido, inicializa com os dados padrão
    const initial = getDefaultData();
    try {
      await fs.writeFile(DATA_FILE_PATH, JSON.stringify(initial, null, 2), 'utf-8');
    } catch (writeErr) {
      console.error('Erro ao inicializar store-data.json:', writeErr);
    }
    return initial;
  }
}

async function writeStoreData(data: StoreData): Promise<void> {
  const dir = path.dirname(DATA_FILE_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
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

    if (body.reset) {
      const resetData = getDefaultData();
      await writeStoreData(resetData);
      return NextResponse.json({ success: true, ...resetData });
    }

    const updatedData: StoreData = {
      products: Array.isArray(body.products) ? body.products : current.products,
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
