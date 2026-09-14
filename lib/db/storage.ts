import os from 'os';
import path from 'path';
import fs from 'fs';

/**
 * Resolves the writable database directory.
 * On serverless platforms like Vercel and AWS Lambda, the root deployment directory
 * (/var/task) is strictly read-only. Attempting to mkdir or write there fails with ENOENT or EROFS.
 * /tmp (os.tmpdir()) is the only designated writable path in serverless executions.
 */
export function resolveDataDir(): string {
  if (process.env.DATA_DIR && process.env.DATA_DIR.trim()) {
    return process.env.DATA_DIR.trim();
  }

  const isServerless =
    Boolean(process.env.VERCEL) ||
    Boolean(process.env.VERCEL_ENV) ||
    Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
    Boolean(process.env.LAMBDA_TASK_ROOT) ||
    (typeof process.cwd === 'function' && process.cwd().startsWith('/var/task'));

  if (isServerless) {
    return path.join(os.tmpdir(), '.data');
  }

  return path.join(process.cwd(), '.data');
}

/**
 * Safely ensures that a directory exists without throwing errors in restricted environments.
 */
export function ensureDirectory(dirPath: string): boolean {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    return true;
  } catch (err) {
    console.warn(`[Storage] Directory creation skipped or failed for ${dirPath}:`, err);
    return false;
  }
}

/**
 * Safely writes data atomically to a file using a temporary file.
 * Catches and logs errors gracefully so operations never throw uncaught 500 exceptions.
 */
export function safeAtomicWrite(filePath: string, data: string): boolean {
  try {
    const parentDir = path.dirname(filePath);
    ensureDirectory(parentDir);

    const tmpPath = `${filePath}.${Date.now()}.${Math.random().toString(36).substring(2, 8)}.tmp`;
    fs.writeFileSync(tmpPath, data, 'utf-8');

    try {
      fs.renameSync(tmpPath, filePath);
      return true;
    } catch {
      try {
        fs.copyFileSync(tmpPath, filePath);
        fs.unlinkSync(tmpPath);
        return true;
      } catch {
        fs.writeFileSync(filePath, data, 'utf-8');
        return true;
      }
    }
  } catch (err) {
    console.warn(`[Storage] Failed to persist file ${filePath}, state retained in memory:`, err);
    return false;
  }
}

/**
 * Safely reads a file with UTF-8 encoding.
 * Returns null if the file does not exist or read fails.
 */
export function safeReadFile(filePath: string): string | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    return fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    console.warn(`[Storage] Failed to read file ${filePath}:`, err);
    return null;
  }
}
