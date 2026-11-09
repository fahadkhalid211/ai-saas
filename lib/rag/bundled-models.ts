import path from 'node:path';

/**
 * The search models shipped inside the deployment (scripts/fetch-models.mjs puts them in ./models before the build, and
 * next.config.ts adds them to the server functions that need them). Loading from disk avoids downloading ~57 MB from
 * Hugging Face on the first question after a cold start. Any other model, or a missing file, still downloads at run time.
 */
export const BUNDLED_MODELS = ['Xenova/bge-small-en-v1.5', 'Xenova/ms-marco-MiniLM-L-6-v2'];

/** Makes @xenova/transformers look in ./models first. `env` is the object exported by the package. */
export function useBundledModels(env: { allowLocalModels: boolean; localModelPath: string }): void {
  env.allowLocalModels = true;
  // turbopackIgnore (on process.cwd()): the file tracer would otherwise follow this path and add the whole folder (both models) to every route that
  // embeds; next.config.ts adds exactly the files each route needs.
  env.localModelPath = path.join(/* turbopackIgnore: true */ process.cwd(), 'models');
}
