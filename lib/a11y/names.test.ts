import { describe, expect, it } from 'vitest';
import { iconLabel } from './names';

describe('iconLabel', () => {
  it('names common icon buttons', () => {
    expect(iconLabel('lucide lucide-x w-4 h-4')).toBe('Close');
    expect(iconLabel('lucide lucide-trash-2 h-4')).toBe('Delete');
    expect(iconLabel('lucide lucide-chevron-down')).toBe('Expand');
  });
  it('falls back to a readable version of the icon name', () => {
    expect(iconLabel('lucide lucide-calendar-days')).toBe('Calendar days');
    expect(iconLabel('lucide lucide-user-round-2')).toBe('User round');
  });
  it('says nothing when the svg is not a known icon', () => {
    expect(iconLabel('w-4 h-4')).toBe('');
    expect(iconLabel('')).toBe('');
  });
});
