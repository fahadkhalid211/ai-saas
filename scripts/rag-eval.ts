/**
 * Retrieval-quality evaluation.
 *
 *   npm run rag:eval                       measure the current pipeline on eval/rag/golden.ts
 *   npm run rag:eval -- --k 5              cut-off (default 5)
 *   npm run rag:eval -- --save baseline    also write eval/rag/results/baseline.json (commit it to track progress)
 *   npm run rag:eval -- --compare baseline show deltas against a saved run
 *   npm run rag:eval -- --min-hit 0.85 --min-mrr 0.6   exit 1 if quality drops below these (CI gate)
 *
 * It runs in an ISOLATED local store (empty DATABASE_URL, temp data dir, no Redis), never touching your real
 * database, and it uses the same parse/chunk/embed/retrieve code the app uses.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Isolation first: these must be set before any app module is imported.
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'crescelo-rag-eval-'));
process.env.DATABASE_URL = '';
process.env.POSTGRES_URL = '';
process.env.NEXT_PUBLIC_SUPABASE_URL = '';
process.env.UPSTASH_REDIS_REST_URL = '';
process.env.UPSTASH_REDIS_REST_TOKEN = '';
process.env.DATA_DIR = dataDir;
process.env.LOG_ALERTS = 'false';
process.env.LOG_LEVEL = 'error';
process.env.ADMIN_API_KEY ||= 'rag-eval-local-key-'.padEnd(40, 'x');

const args = process.argv.slice(2);
const flag = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? undefined : args[i + 1];
};

async function main() {
  const k = Number(flag('k') ?? 5);
  const resultsDir = path.join(process.cwd(), 'eval', 'rag', 'results');

  const { GOLDEN } = await import('../eval/rag/golden');
  const { evaluate, formatReport } = await import('../lib/rag/eval/harness');
  const { ingestCorpus } = await import('../lib/rag/eval/ingest');
  const { retrieveRelevantContext } = await import('../lib/rag/retrieval');

  console.log(`Loading ${GOLDEN.corpus.length} documents (first run downloads the embedding model)...`);
  const t0 = performance.now();
  const { assistantId, docBySource } = await ingestCorpus(GOLDEN);
  console.log(`Ready in ${((performance.now() - t0) / 1000).toFixed(1)} s. Asking ${GOLDEN.cases.length} questions...\n`);

  // Warm the embedding pipeline so latency numbers reflect steady state, not model loading.
  await retrieveRelevantContext(assistantId, 'warm up', [], k);

  const report = await evaluate(
    GOLDEN,
    async (c) => {
      const result = await retrieveRelevantContext(assistantId, c.query, c.history ?? [], k);
      return {
        chunks: result.chunks.map((ch) => ({
          text: ch.content,
          docId: docBySource.get(ch.knowledgeSourceId ?? '') ?? null,
          score: ch.similarity ?? 0,
        })),
      };
    },
    { k }
  );

  let previous;
  const compare = flag('compare');
  if (compare) {
    const file = path.join(resultsDir, `${compare}.json`);
    if (fs.existsSync(file)) previous = JSON.parse(fs.readFileSync(file, 'utf8'));
    else console.warn(`No saved run named "${compare}" (looked for ${file})`);
  }
  console.log(formatReport(report, previous));

  const save = flag('save');
  if (save) {
    fs.mkdirSync(resultsDir, { recursive: true });
    fs.writeFileSync(path.join(resultsDir, `${save}.json`), JSON.stringify(report, null, 2));
    console.log(`\nSaved eval/rag/results/${save}.json`);
  }

  const minHit = flag('min-hit');
  const minMrr = flag('min-mrr');
  const failed: string[] = [];
  if (minHit && report.answerable.hitAtK < Number(minHit)) failed.push(`hit@${k} ${report.answerable.hitAtK.toFixed(3)} < ${minHit}`);
  if (minMrr && report.answerable.mrr < Number(minMrr)) failed.push(`MRR ${report.answerable.mrr.toFixed(3)} < ${minMrr}`);
  fs.rmSync(dataDir, { recursive: true, force: true });
  if (failed.length) {
    console.error(`\nQuality gate failed: ${failed.join('; ')}`);
    process.exit(1);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error('Evaluation failed:', err);
  fs.rmSync(dataDir, { recursive: true, force: true });
  process.exit(2);
});
