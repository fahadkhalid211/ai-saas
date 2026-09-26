/**
 * The embedding model and everything that depends on it. Different models score similarity on different scales (one model
 * gives 0.4 for an unrelated passage, another 0.77), so the cut-offs and the "do I know this?" threshold belong to the model.
 * No imports on purpose: this file is read by the database layer, the embedder and the retrieval code.
 *
 * Choose a model with EMBEDDING_MODEL (the model name below). Vectors are tagged with the profile that made them, and search only
 * compares vectors from the same profile, so switching is safe while `/api/cron/reembed` rebuilds the older ones.
 */

export interface EmbeddingProfile {
  /** Stored on every chunk (metadata.embModel). */
  id: string;
  /** Model repository name for @xenova/transformers. */
  model: string;
  /** Prefixes some models need: e5 models embed "query: ..." and "passage: ...". */
  queryPrefix: string;
  passagePrefix: string;
  /** Minimum cosine similarity for a passage to count as a vector match, with and without a keyword match in the results. */
  vectorCutoffWithKeyword: number;
  vectorCutoffAlone: number;
  /** Below this best-passage score the assistant treats the question as not covered by the knowledge base. */
  confidenceThreshold: number;
  languages: string;
}

export const LEGACY_PROFILE_ID = 'bge-small-en-v1.5';

const PROFILES: EmbeddingProfile[] = [
  {
    id: LEGACY_PROFILE_ID,
    model: 'Xenova/bge-small-en-v1.5',
    queryPrefix: '',
    passagePrefix: '',
    vectorCutoffWithKeyword: 0.18,
    vectorCutoffAlone: 0.22,
    confidenceThreshold: 0.58,
    languages: 'English',
  },
  {
    // Measured with `npm run rag:eval` on the English golden set: hit@5 90.7% (bge-small 95.3%). In a small cross-language probe, Spanish, French and
    // English questions all find English passages (10 of 10; bge-small 8 of 10). Reads up to 512 tokens. Its scores sit between 0.75 and 0.95, hence the high cut-offs.
    id: 'multilingual-e5-small',
    model: 'Xenova/multilingual-e5-small',
    queryPrefix: 'query: ',
    passagePrefix: 'passage: ',
    vectorCutoffWithKeyword: 0.78,
    vectorCutoffAlone: 0.8,
    confidenceThreshold: 0.84,
    languages: 'about 100 languages',
  },
  {
    // hit@5 90.7% on the golden set, with the cleanest answer-or-abstain separation (AUC 0.94). Only reads the first 128 tokens of a passage.
    id: 'paraphrase-multilingual-minilm',
    model: 'Xenova/paraphrase-multilingual-MiniLM-L12-v2',
    queryPrefix: '',
    passagePrefix: '',
    vectorCutoffWithKeyword: 0.2,
    vectorCutoffAlone: 0.26,
    confidenceThreshold: 0.43,
    languages: 'about 50 languages',
  },
];

const slug = (s: string) => s.toLowerCase().replace(/^xenova\//, '').replace(/[^a-z0-9.]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'custom';

/** The profile in use: the one named by EMBEDDING_MODEL, the English default when unset, or a custom model with the default settings. */
export function embeddingProfile(name = process.env.EMBEDDING_MODEL): EmbeddingProfile {
  const wanted = (name || '').trim();
  if (!wanted) return PROFILES[0];
  const found = PROFILES.find((p) => p.model.toLowerCase() === wanted.toLowerCase() || p.id === wanted.toLowerCase());
  if (found) return found;
  return { ...PROFILES[0], id: slug(wanted), model: wanted, languages: 'depends on the model' };
}

export const embeddingProfiles = () => PROFILES.map((p) => ({ id: p.id, model: p.model, languages: p.languages }));

/** The profile a stored chunk was embedded with. Chunks written before profiles existed have no tag and used the English default. */
export const chunkProfileId = (metadata?: Record<string, any> | null) => (metadata && typeof metadata.embModel === 'string' && metadata.embModel) || LEGACY_PROFILE_ID;

export const chunkNeedsEmbedding = (metadata?: Record<string, any> | null, profileId = embeddingProfile().id) => chunkProfileId(metadata) !== profileId;
