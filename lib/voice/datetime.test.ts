import { describe, it, expect } from 'vitest';
import { filterByDayPart, parseDayPart, parseSpokenDate, parseSpokenTime, parseYesNo, pickSlot, wordsToDigits } from './datetime';

const TODAY = '2026-09-21'; // Monday

describe('wordsToDigits', () => {
  it('converts spoken numbers', () => {
    expect(wordsToDigits('ten thirty')).toBe('10 30');
    expect(wordsToDigits('twenty five')).toBe('25');
    expect(wordsToDigits('half past two')).toBe('half past 2');
  });
});

describe('parseSpokenDate', () => {
  it('handles relative days', () => {
    expect(parseSpokenDate('tomorrow please', TODAY)).toBe('2026-09-22');
    expect(parseSpokenDate('today', TODAY)).toBe('2026-09-21');
    expect(parseSpokenDate('the day after tomorrow', TODAY)).toBe('2026-09-23');
    expect(parseSpokenDate('in three days', TODAY)).toBe('2026-09-24');
  });
  it('handles weekdays', () => {
    expect(parseSpokenDate('Thursday', TODAY)).toBe('2026-09-24');
    expect(parseSpokenDate('next friday', TODAY)).toBe('2026-09-25');
    expect(parseSpokenDate('monday', TODAY)).toBe('2026-09-28'); // same weekday means next week
    expect(parseSpokenDate('this monday', TODAY)).toBe('2026-09-21');
  });
  it('handles month and day', () => {
    expect(parseSpokenDate('September 30th', TODAY)).toBe('2026-09-30');
    expect(parseSpokenDate('the twenty second of october', TODAY)).toBe('2026-10-22');
    expect(parseSpokenDate('march 3', TODAY)).toBe('2027-03-03'); // already passed this year
    expect(parseSpokenDate('february 30', TODAY)).toBeNull();
  });
  it('handles numeric dates and ordinals', () => {
    expect(parseSpokenDate('9/25', TODAY)).toBe('2026-09-25');
    expect(parseSpokenDate('the 28th', TODAY)).toBe('2026-09-28');
    expect(parseSpokenDate('2026-10-05', TODAY)).toBe('2026-10-05');
  });
  it('returns null when no date is said', () => {
    expect(parseSpokenDate('I want a haircut', TODAY)).toBeNull();
  });
});

describe('parseSpokenTime', () => {
  it('reads clock times', () => {
    expect(parseSpokenTime('2:30 pm')?.minutes).toBe(870);
    expect(parseSpokenTime('ten thirty am')?.minutes).toBe(630);
    expect(parseSpokenTime('half past two in the afternoon')?.minutes).toBe(870);
    expect(parseSpokenTime('quarter to three pm')?.minutes).toBe(885);
    expect(parseSpokenTime('12 pm')?.minutes).toBe(720);
    expect(parseSpokenTime('12 am')?.minutes).toBe(0);
  });
  it('returns null without a time', () => {
    expect(parseSpokenTime('whenever')).toBeNull();
  });
});

describe('pickSlot', () => {
  const offered = ['10:00', '13:30', '16:00'];
  it('picks by ordinal', () => {
    expect(pickSlot('the second one', offered)).toBe('13:30');
    expect(pickSlot('the first', offered)).toBe('10:00');
    expect(pickSlot('the last one please', offered)).toBe('16:00');
  });
  it('picks by time, resolving bare hours against what is offered', () => {
    expect(pickSlot('10 am', offered)).toBe('10:00');
    expect(pickSlot('one thirty', offered)).toBe('13:30');
    expect(pickSlot('four', offered)).toBe('16:00');
    expect(pickSlot('four pm', offered)).toBe('16:00');
  });
  it('does not guess when the time is not on offer', () => {
    expect(pickSlot('11 am', offered)).toBeNull();
    expect(pickSlot('anything', offered)).toBeNull();
  });
});

describe('day part and yes/no', () => {
  it('detects and filters day parts', () => {
    expect(parseDayPart('sometime in the afternoon')).toBe('afternoon');
    expect(filterByDayPart(['09:00', '13:00', '18:00'], 'afternoon')).toEqual(['13:00']);
    expect(filterByDayPart(['09:00', '13:00', '18:00'], 'morning')).toEqual(['09:00']);
  });
  it('reads confirmations', () => {
    expect(parseYesNo('yes that is right')).toBe('yes');
    expect(parseYesNo('yeah go ahead')).toBe('yes');
    expect(parseYesNo('no, change the time')).toBe('no');
    expect(parseYesNo('hmm maybe')).toBeNull();
  });
});
