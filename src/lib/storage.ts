import fs from 'fs';
import path from 'path';

export const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export function resolveUploadPath(filename: string): string {
  // Prevent directory traversal
  const parts = filename.split(/[\\/]+/).filter((p) => p && p !== '.' && p !== '..');
  return path.join(UPLOAD_DIR, ...parts);
}

export function saveUploadFile(
  file: Buffer | Uint8Array,
  filename: string,
  dir?: string
): string {
  const relative = dir ? path.posix.join(dir, filename) : filename,
    filepath = resolveUploadPath(relative);
  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  fs.writeFileSync(filepath, file);
  return relative;
}

export function deleteUploadFile(relative: string) {
  fs.rmSync(resolveUploadPath(relative), { force: true });
}
