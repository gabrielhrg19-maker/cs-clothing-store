import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Tenta criar pasta local (ignora se estiver em ambiente read-only)
    await fs.mkdir(uploadsDir, { recursive: true }).catch(() => {});

    let filename = '';
    let buffer: Buffer | null = null;
    let mimeType = 'image/jpeg';

    // Caso 1: Multipart FormData
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ success: false, error: 'Nenhum arquivo enviado' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);

      const originalName = file.name || 'image.jpg';
      let ext = path.extname(originalName).toLowerCase();
      if (!ext || !['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(ext)) {
        ext = file.type?.includes('png') ? '.png' : file.type?.includes('webp') ? '.webp' : '.jpg';
      }
      mimeType = file.type || (ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg');
      filename = `img-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    }

    // Caso 2: JSON com imagem em Base64
    else if (contentType.includes('application/json')) {
      const body = await req.json();
      const base64Data = body.image || body.base64;

      if (!base64Data || typeof base64Data !== 'string') {
        return NextResponse.json({ success: false, error: 'Nenhuma imagem base64 válida' }, { status: 400 });
      }

      const match = base64Data.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (!match) {
        return NextResponse.json({ success: false, error: 'Formato base64 inválido' }, { status: 400 });
      }

      const rawExt = match[1].toLowerCase();
      const ext = rawExt === 'jpeg' ? '.jpg' : `.${rawExt}`;
      mimeType = `image/${rawExt}`;
      buffer = Buffer.from(match[2], 'base64');
      filename = `img-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    }

    if (!buffer || !filename) {
      return NextResponse.json({ success: false, error: 'Arquivo inválido' }, { status: 400 });
    }

    // 1. Tenta gravar no disco local se possível
    try {
      const filePath = path.join(uploadsDir, filename);
      await fs.writeFile(filePath, buffer);
    } catch (fsErr) {
      // Ignora erro de read-only em ambiente de nuvem
    }

    // 2. Grava no MongoDB (se conectado) para persistência em nuvem
    try {
      const db = await getDatabase();
      if (db) {
        await db.collection('uploads').updateOne(
          { filename },
          {
            $set: {
              filename,
              contentType: mimeType,
              data: buffer.toString('base64'),
              size: buffer.length,
              createdAt: new Date().toISOString(),
            },
          },
          { upsert: true }
        );
      }
    } catch (dbErr) {
      console.warn('Aviso: falha ao salvar imagem no MongoDB:', dbErr);
    }

    const fileUrl = `/uploads/${filename}`;
    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error: any) {
    console.error('Erro na rota /api/upload:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro ao processar upload' },
      { status: 500 }
    );
  }
}
