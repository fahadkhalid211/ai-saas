import type { BlogPost } from './posts';
import { BATCH1 } from './rewritten/batch1';
import { BATCH2 } from './rewritten/batch2';
import { BATCH3 } from './rewritten/batch3';
import { BATCH4 } from './rewritten/batch4';
import { BATCH5 } from './rewritten/batch5';
import { BATCH6 } from './rewritten/batch6';
import { BATCH7 } from './rewritten/batch7';
import { BATCH8 } from './rewritten/batch8';
import { BATCH9 } from './rewritten/batch9';
import { BATCH10 } from './rewritten/batch10';
import { BATCH11 } from './rewritten/batch11';
import { BATCH12 } from './rewritten/batch12';
import { PILLAR1 } from './rewritten/pillar1';
import { PILLAR2 } from './rewritten/pillar2';
import { PILLAR3 } from './rewritten/pillar3';
import { PILLAR4 } from './rewritten/pillar4';
import { PILLAR5 } from './rewritten/pillar5';
import { PILLAR6 } from './rewritten/pillar6';
import { PILLAR7 } from './rewritten/pillar7';

/** Articles written for readers. They replace the templated placeholder with the same address and are listed in search. */
export const REWRITTEN_POSTS: BlogPost[] = [...BATCH1, ...BATCH2, ...BATCH3, ...BATCH4, ...BATCH5, ...BATCH6, ...BATCH7, ...BATCH8, ...BATCH9, ...BATCH10, ...BATCH11, ...BATCH12,
  // in-depth versions of the highest-value articles: listed last so they replace the shorter ones
  ...PILLAR1,
  ...PILLAR2,
  ...PILLAR3,
  ...PILLAR4,
  ...PILLAR5,
  ...PILLAR6,
  ...PILLAR7,
];
