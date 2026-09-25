import { describe, expect, it } from 'vitest';
import { tidy } from './tidy';

describe('tidy', () => {
  it('splits glued bullets and drops repeats', () => {
    const glued = '- Fatigue  \n- A lump\n- Unexplained bleeding or bruising- Sores that will not heal  \n- Fatigue';
    expect(tidy(glued)).toBe('- Fatigue\n- A lump\n- Unexplained bleeding or bruising\n- Sores that will not heal');
  });
  it('leaves plain sentences alone', () => {
    expect(tidy('We open at 8am - closed Sundays.')).toBe('We open at 8am - closed Sundays.');
  });
});
