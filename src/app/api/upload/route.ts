import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    // Caso 1: Multipart FormData (Upload de arquivo binário)
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ success: false, error: 'Nenhum arquivo enviado' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Determinar extensão segura
      const originalName = file.name || 'image.jpg';
      let ext = path.extname(originalName).toLowerCase();
      if (!ext || !['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(ext)) {
        ext = file.type?.includes('png') ? '.png' : file.type?.includes('webp') ? '.webp' : '.jpg';
      }

      const filename = `img-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
      const filePath = path.join(uploadsDir, filename);

      await fs.writeFile(filePath, buffer);

      const fileUrl = `/uploads/${filename}`;
      return NextResponse.json({ success: true, url: fileUrl });
    }

    // Caso 2: JSON com imagem em Base64 (converte para arquivo no servidor)
    if (contentType.includes('application/json')) {
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
      const buffer = Buffer.from(match[2], 'base64');

      const filename = `img-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
      const filePath = path.join(uploadsDir, filename);

      await fs.writeFile(filePath, buffer);

      const fileUrl = `/uploads/${filename}`;
      return NextResponse.json({ success: true, url: fileUrl });
    }

    return NextResponse.json({ success: false, error: 'Content-Type não suportado' }, { status: 400 });
  } catch (error: any) {
    console.error('Erro na rota /api/upload:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro ao processar upload' },
      { status: 500 }
    );
  }
}
