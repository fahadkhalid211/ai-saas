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

## Query preparation (RAG step 3)

Follow-up messages ("and how many assistants does it include?") are now resolved with the previous user question before
searching (`lib/rag/query-prep.ts`). Eval: hit@5 93.0% → 97.7%, follow-ups 50% → 100%, no added latency.

An optional LLM rewriter (`RAG_QUERY_REWRITE=llm`, model via `RAG_REWRITE_MODEL`) also writes alternative phrasings that are
searched and fused. Measured on Groq it did NOT beat the free version (hit@5 93–95%) and added ~1 s, so it is off by default.
Re-measure with `RAG_QUERY_REWRITE=llm npm run rag:eval` if you change models.

## Cross-encoder re-ranker (RAG step 4)

`RAG_RERANKER=cross-encoder` re-orders the candidates with a small local model that reads question and passage together
(`lib/rag/cross-encoder.ts`, default `Xenova/ms-marco-MiniLM-L-6-v2`, ~23 MB, downloaded on first use).

Eval vs step 3 (hit@5 97.7%, MRR 0.771, AUC 0.74):
- MiniLM: MRR 0.812, synonym hit 100%, AUC 0.84, but ~+0.7 s per question on this laptop CPU. A wider candidate pool made it worse.
- `Xenova/bge-reranker-base` (`RAG_RERANK_MODEL`): AUC 0.92 but ~5 s per question — too slow.

Off by default: the gain is modest and the model has not been tried in a Vercel function (cold start, size). Its main value is a
cleaner confidence score for step 5.

### Larger sets, English and Spanish (2026-11-03)

73 English questions (`eval/rag/golden.ts`) and 77 Spanish ones (`eval/rag/golden-es.ts`, a dental clinic knowledge base).
Run the Spanish set with `npm run rag:eval -- --set es`; `RAG_EVAL_CONTEXT=1` embeds each chunk with its document title and section.

| set | setup | hit@5 | MRR | AUC | p50 |
|---|---|---|---|---|---|
| en | bge (default) | 95.2% | 0.766 | 0.92 | 49 ms |
| en | e5 | 88.7% | 0.728 | 0.88 | 59 ms |
| en | bge + cross-encoder | 96.8% | 0.821 | 0.92 | 989 ms |
| en | e5 + cross-encoder | 93.5% | 0.829 | 0.90 | 849 ms |
| es | bge (default) | 87.1% | 0.721 | 0.67 | 38 ms |
| es | e5 | 93.5% | 0.761 | 0.64 | 34 ms |
| es | bge + cross-encoder | 93.5% | 0.837 | 0.66 | 895 ms |
| es | e5 + cross-encoder | 95.2% | 0.836 | 0.61 | 921 ms |

- `EMBEDDING_MODEL` is one setting for the whole platform, so e5 cannot be used for Spanish only. e5 on its own loses 6.5 points on
  English; with the cross-encoder it still loses 3.3 points on English to gain 1.7 on Spanish.
- bge + cross-encoder has the best average (95.2% vs 94.4%) and needs no re-embedding. It lifts Spanish from 87.1% to 93.5%.
- No setup gives a usable answer-or-abstain score in Spanish (AUC 0.61 to 0.67), so do not lean on the confidence gate for Spanish.
- Production confidence is the vector cosine (`lib/rag/confidence.ts`), which the cross-encoder does not change.
- Result files are not kept in the repository; re-run the commands above to reproduce them.

## Confidence and "I don't know" (RAG step 5)

`lib/rag/confidence.ts`: confidence = best question-to-passage cosine among the retrieved passages. The old fused rank score was
on a different scale per retrieval path (0.06 vs 0.9) and separated answerable from unanswerable questions poorly (AUC 0.74);
cosine separates them well (AUC 0.91). Threshold `RAG_CONFIDENCE_MIN` (default 0.58: answers 100% of answerable questions in the eval).

- Below the threshold the model is told the match is weak and to say so instead of stretching a loosely related passage.
- Any reply that says the assistant does not know (or the assistant's fallback message) gets the two ways forward appended:
  the booking form (its card also carries the live-agent button) when booking is on, otherwise a live-agent hand-off.
  Never a request for contact details. Logged as `rag.abstain`; retrieval logs carry `confidence` and `lowConfidence`.
