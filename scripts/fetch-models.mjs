#!/usr/bin/env node
/**
 * Puts the two small search models into ./models, so the deployed functions read them from disk instead of downloading them
 * from Hugging Face on the first question after a cold start (see lib/rag/bundled-models.ts and next.config.ts).
 *
 * Runs before `next build` (the "prebuild" script). Files already in ./models are kept; files found in the local
 * @xenova/transformers cache are copied; the rest is downloaded. A failure only prints a warning and never stops the build:
 * the app then downloads the model at run time as it did before.
 */
import fs from 'node:fs';
import path from 'node:path';

const MODELS = ['Xenova/bge-small-en-v1.5', 'Xenova/ms-marco-MiniLM-L-6-v2'];
const FILES = ['config.json', 'tokenizer.json', 'tokenizer_config.json', 'onnx/model_quantized.onnx'];
const OUT = path.join(process.cwd(), 'models');
const CACHE = path.join(process.cwd(), 'node_modules', '@xenova', 'transformers', '.cache');

async function download(url, target) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { redirect: 'follow' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      fs.writeFileSync(target + '.part', Buffer.from(await res.arrayBuffer()));
      fs.renameSync(target + '.part', target);
      return;
    } catch (err) {
      lastError = err;
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
  throw lastError;
}

let failed = 0;
for (const model of MODELS) {
  for (const file of FILES) {
    const target = path.join(OUT, model, file);
    if (fs.existsSync(target) && fs.statSync(target).size > 0) continue;
    fs.mkdirSync(path.dirname(target), { recursive: true });
    const cached = path.join(CACHE, model, file);
    try {
      if (fs.existsSync(cached) && fs.statSync(cached).size > 0) {
        fs.copyFileSync(cached, target);
        console.log(`[models] copied ${model}/${file}`);
      } else {
        await download(`https://huggingface.co/${model}/resolve/main/${file}`, target);
        console.log(`[models] downloaded ${model}/${file}`);
      }
    } catch (err) {
      failed++;
      console.warn(`[models] could not fetch ${model}/${file}: ${err?.message || err}. It will be downloaded at run time instead.`);
    }
  }
}
console.log(failed ? `[models] ${failed} file(s) missing: the build continues` : '[models] all search models are in ./models');
