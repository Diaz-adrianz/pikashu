import fs from 'fs';
import path from 'path';

export const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export function resolveUploadPath(filename: string): string {
  // Prevent directory traversal
  const sanitized = path.basename(filename);
  return path.join(UPLOAD_DIR, sanitized);
}

export function saveUploadFile(file: Buffer | Uint8Array, filename: string): string {
  const filepath = resolveUploadPath(filename);
  fs.writeFileSync(filepath, file);
  return filename;
}
