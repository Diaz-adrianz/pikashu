import { readFileSync, existsSync } from 'fs';
import { NextResponse } from 'next/server';
import { resolveUploadPath } from '@/lib/storage';
import path from 'path';

const types: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

export async function GET(_: Request, ctx: { params: Promise<{ name: string }> }) {
  const { name } = await ctx.params;
  const filepath = resolveUploadPath(name);
  if (!existsSync(filepath)) {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'File not found' } }, { status: 404 });
  }

  const body = readFileSync(filepath);
  return new NextResponse(body, {
    headers: {
      'Content-Type': types[path.extname(filepath).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
