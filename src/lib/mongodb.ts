import { MongoClient, Db } from 'mongodb';

let cachedClient: MongoClient | null = null;
let cachedPromise: Promise<MongoClient> | null = null;

export async function getDatabase(): Promise<Db | null> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[MongoDB] MONGODB_URI não configurada nas variáveis de ambiente.');
    return null;
  }

  try {
    if (!cachedPromise) {
      cachedClient = new MongoClient(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 10000,
      });
      cachedPromise = cachedClient.connect();
    }
    const client = await cachedPromise;
    return client.db('cs_clothing_store');
  } catch (err: any) {
    console.error('[MongoDB] Falha na conexão:', err?.message || err);
    cachedPromise = null; // Permite retentar na próxima requisição
    return null;
  }
}

export default getDatabase;
