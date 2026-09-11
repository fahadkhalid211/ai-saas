import { spawn } from 'child_process';

export interface OcrResult {
  text: string;
  confidence: number;
}

// Dedicated Node.js OCR runner script to execute outside Next.js bundler thread context
const OCR_RUNNER_SCRIPT = `
const Tesseract = require('tesseract.js');
let input = [];
process.stdin.on('data', chunk => input.push(chunk));
process.stdin.on('end', async () => {
  try {
    const buffer = Buffer.concat(input);
    const mod = Tesseract.default || Tesseract;
    const ret = await mod.recognize(buffer, 'eng');
    const out = {
      text: (ret && ret.data && ret.data.text) ? ret.data.text : '',
      confidence: (ret && ret.data && ret.data.confidence) ? ret.data.confidence : 0,
    };
    process.stdout.write(JSON.stringify(out));
    process.exit(0);
  } catch (err) {
    process.stderr.write((err && err.message) ? err.message : 'OCR failed');
    process.exit(1);
  }
});
`;

/**
 * Extracts text from an image buffer using Tesseract OCR in a standalone Node subprocess.
 * Running in a subprocess avoids Turbopack/Webpack worker_threads deadlock in Next.js.
 */
export async function extractTextFromImage(buffer: Buffer, timeoutMs = 15000): Promise<OcrResult> {
  return new Promise((resolve, reject) => {
    let settled = false;

    const child = spawn(process.execPath, ['-e', OCR_RUNNER_SCRIPT], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
    });

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        try {
          child.kill();
        } catch (_) {}
        reject(new Error(`OCR recognition timed out after ${timeoutMs / 1000}s`));
      }
    }, timeoutMs);

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (d) => {
      stdout += d.toString();
    });

    child.stderr.on('data', (d) => {
      stderr += d.toString();
    });

    child.on('error', (err) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        reject(new Error(`Failed to start OCR engine: ${err.message}`));
      }
    });

    child.on('close', (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);

      if (code !== 0) {
        reject(new Error(`OCR engine exited with code ${code}: ${stderr.trim() || 'OCR extraction failed'}`));
        return;
      }

      try {
        const parsed = JSON.parse(stdout.trim() || '{}');
        resolve({
          text: parsed.text || '',
          confidence: parsed.confidence || 0,
        });
      } catch (e: any) {
        reject(new Error(`Failed to parse OCR response: ${e.message}`));
      }
    });

    child.stdin.write(buffer);
    child.stdin.end();
  });
}
