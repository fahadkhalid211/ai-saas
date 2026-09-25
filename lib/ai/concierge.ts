import { answerFromGuides } from '@/lib/platform/knowledge';

/**
 * The offline answer of the Crescelo assistant: built from the hand-written guides in lib/platform/guides.ts, so it works when
 * no AI provider is reachable and can never quote a price or a feature that the guides do not.
 */
export function getPlatformConciergeAnswer(query: string): string {
  return answerFromGuides(query);
}
