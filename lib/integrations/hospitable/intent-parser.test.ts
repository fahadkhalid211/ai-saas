import { describe, it, expect } from 'vitest';
import {
  detectAvailabilityIntent,
  extractDates,
  extractGuestCount,
} from './intent-parser';

describe('Hospitable Intent Parser', () => {
  describe('detectAvailabilityIntent', () => {
    it('detects availability queries', () => {
      expect(detectAvailabilityIntent('Is this property available next weekend?')).toBe(true);
      expect(detectAvailabilityIntent('What is your availability for check-in on Friday?')).toBe(true);
      expect(detectAvailabilityIntent('Can I book from Dec 20 to Dec 27?')).toBe(true);
      expect(detectAvailabilityIntent('Do you have any vacancies in July?')).toBe(true);
      expect(detectAvailabilityIntent('How much for a 3 night stay?')).toBe(true);
    });

    it('returns false for unrelated queries', () => {
      expect(detectAvailabilityIntent('What time is breakfast served?')).toBe(false);
      expect(detectAvailabilityIntent('Can I bring my pet?')).toBe(false);
      expect(detectAvailabilityIntent('What is the wifi password?')).toBe(false);
    });
  });

  describe('extractDates', () => {
    it('extracts ISO date ranges', () => {
      const res = extractDates('Looking to stay 2026-11-10 to 2026-11-15');
      expect(res).toEqual({
        checkIn: '2026-11-10',
        checkOut: '2026-11-15',
      });
    });

    it('extracts month-day ranges', () => {
      const res = extractDates('Can we book from Dec 15 to Dec 22?');
      expect(res).not.toBeNull();
      expect(res?.checkIn).toMatch(/-\d{2}-15$/);
      expect(res?.checkOut).toMatch(/-\d{2}-22$/);
    });

    it('extracts "next weekend"', () => {
      const res = extractDates('Is the cabin free next weekend?');
      expect(res).not.toBeNull();
      expect(res?.checkIn).toBeDefined();
      expect(res?.checkOut).toBeDefined();
    });
  });

  describe('extractGuestCount', () => {
    it('extracts guest count from text', () => {
      expect(extractGuestCount('We have 4 guests')).toBe(4);
      expect(extractGuestCount('Looking for a place for 2 adults and 1 dog')).toBe(2);
      expect(extractGuestCount('Party of 6 people')).toBe(6);
      expect(extractGuestCount('No guest count here')).toBeUndefined();
    });
  });
});
