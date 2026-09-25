import type { BlogPost } from './posts';
import { BATCH1 } from './rewritten/batch1';
import { BATCH2 } from './rewritten/batch2';
import { BATCH3 } from './rewritten/batch3';
import { BATCH4 } from './rewritten/batch4';
import { BATCH5 } from './rewritten/batch5';
import { BATCH6 } from './rewritten/batch6';
import { BATCH7 } from './rewritten/batch7';
import { BATCH8 } from './rewritten/batch8';

/** Articles written for readers. They replace the templated placeholder with the same address and are listed in search. */
export const REWRITTEN_POSTS: BlogPost[] = [...BATCH1, ...BATCH2, ...BATCH3, ...BATCH4, ...BATCH5, ...BATCH6, ...BATCH7, ...BATCH8];
