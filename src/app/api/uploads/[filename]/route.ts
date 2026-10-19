import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await context.params;

    // 1. Tenta buscar no sistema de arquivos local (se estiver em dev ou existir em public/uploads)
    const localPath = path.join(process.cwd(), 'public', 'uploads', filename);
    try {
      const fileBuffer = await fs.readFile(localPath);
      const ext = path.extname(filename).toLowerCase();
      const mimeTypes: Record<string, string> = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.webp': 'image/webp',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
      };
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': mimeTypes[ext] || 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } catch {
      // Arquivo não existe no disco local (comum na nuvem / Vercel)
    }

    // 2. Busca no MongoDB (se conectado)
    const db = await getDatabase();
    if (db) {
      const doc = await db.collection('uploads').findOne({ filename });
      if (doc && doc.data) {
        const buffer = Buffer.from(doc.data, 'base64');
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': doc.contentType || 'image/jpeg',
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      }
    }

    return new NextResponse('Imagem não encontrada', { status: 404 });
  } catch (error) {
    console.error('Erro ao servir imagem:', error);
    return new NextResponse('Erro interno ao buscar imagem', { status: 500 });
  }
}
