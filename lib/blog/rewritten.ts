import type { BlogPost } from './posts';
import { BATCH1 } from './rewritten/batch1';
import { BATCH2 } from './rewritten/batch2';

/** Articles written for readers. They replace the templated placeholder with the same address and are listed in search. */
export const REWRITTEN_POSTS: BlogPost[] = [...BATCH1, ...BATCH2];
