# Measuring retrieval quality

`npm run rag:eval` loads a fixed knowledge base (14 documents, `eval/rag/golden.ts`) into an isolated local store, asks 51
questions of every kind visitors ask (plain, reworded, synonyms, typos, numbers, two-document, follow-ups, overviews, and
questions the knowledge base cannot answer), and scores the app's real retrieval code. It never touches your database.

| Metric | Meaning |
|---|---|
| hit@5 | a helpful passage is somewhere in the top 5 |
| recall@5 | share of the needed evidence found |
| MRR | 1 = the best passage is always first |
| nDCG@5 | quality of the whole ordering |
| AUC | can the top score tell "we know this" from "we don't"? 0.5 = no, 1 = perfectly |

- Save a run to compare against later: `npm run rag:eval -- --save baseline`, then `npm run rag:eval -- --compare baseline`.
- Gate a change in CI: `npm run rag:eval -- --min-hit 0.9 --min-mrr 0.75` (exit code 1 when quality drops).
- Add cases to `eval/rag/golden.ts` whenever a real conversation goes wrong (`ops/logging.md`: System Logs → `rag.no_results`
  and the unanswered-questions inbox). The test in `lib/rag/eval/golden.test.ts` checks every expected passage really exists.

Live signal: each chat request writes `rag.retrieval` (or `rag.no_results`) to System Logs with chunk count, top scores
and timing, never the question text.

## pgvector store (RAG step 2)

Passages can live in the `kortex_chunks` table (HNSW cosine index + generated `fts` column with GIN), searched and fused by
reciprocal rank inside Postgres in one round trip, instead of one JSON value scanned in memory.

1. `npm run db:apply` (or let the app create the table on first use).
2. `npm run rag:migrate` copies existing passages (idempotent, verifies counts; `-- --dry` to preview).
3. Set `RAG_VECTOR_STORE=pgvector` on Vercel and redeploy. Unset it to go back; nothing is deleted from the old store.
4. `npm run rag:eval -- --pg --compare baseline` measures it in a temporary database that is dropped afterwards.
   Latency shown there includes the network hop from your machine; on Vercel (bom1) it is much lower.
