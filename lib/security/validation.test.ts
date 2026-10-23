import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePhone,
  validateSlug,
  validateDate,
  validateTimeSlot,
  validateUrl,
  validateString,
  validateNumber,
  sanitizeHtml,
  sanitizeInput,
  validateRegistrationPayload,
  validateAppointmentPayload,
  validateLandingPagePayload,
  validateChatPayload,
  sanitizeAttribution,
  ATTRIBUTION_SOURCES,
} from './validation';

describe('Enterprise Validation & Sanitization Suite', () => {
  describe('Attribution (pilot measurement)', () => {
    it('keeps a well-formed conversationId and allowlisted source', () => {
      expect(sanitizeAttribution({ conversationId: 'conv_abc123', source: 'chat' })).toEqual({
        conversationId: 'conv_abc123',
        source: 'chat',
      });
      expect(sanitizeAttribution({ conversationId: '  conv_x-1  ', source: ' PLAYGROUND ' })).toEqual({
        conversationId: 'conv_x-1',
        source: 'playground',
      });
    });

    it('drops malformed or hostile values instead of rejecting', () => {
      expect(sanitizeAttribution({ conversationId: 'conv id with spaces', source: 'hacker' })).toEqual({});
      expect(sanitizeAttribution({ conversationId: '<script>alert(1)</script>' })).toEqual({});
      expect(sanitizeAttribution({ conversationId: 'a'.repeat(65) })).toEqual({});
      expect(sanitizeAttribution({ conversationId: 123, source: { evil: true } })).toEqual({});
      expect(sanitizeAttribution(undefined)).toEqual({});
      expect(sanitizeAttribution(null)).toEqual({});
    });

    it('exposes the documented allowlist', () => {
      expect([...ATTRIBUTION_SOURCES]).toEqual(['chat', 'landing_form', 'admin', 'playground', 'phone', 'direct']);
    });

    it('passes attribution through the appointment validator without failing bookings on bad values', () => {
      const base = {
        assistantId: 'ast_123',
        name: 'Jane Doe',
        email: 'jane@example.com',
        date: '2029-11-20',
        timeSlot: '11:00 AM',
      };

      const good = validateAppointmentPayload({ ...base, conversationId: 'conv_abc123', source: 'chat' });
      expect(good.valid).toBe(true);
      expect(good.sanitized?.conversationId).toBe('conv_abc123');
      expect(good.sanitized?.source).toBe('chat');

      const bad = validateAppointmentPayload({ ...base, conversationId: 'not valid!!', source: 'bogus' });
      expect(bad.valid).toBe(true);
      expect(bad.sanitized?.conversationId).toBeUndefined();
      expect(bad.sanitized?.source).toBeUndefined();
    });
  });

  describe('Email Validation', () => {
    it('accepts valid email addresses', () => {
      expect(validateEmail('test@example.com').valid).toBe(true);
      expect(validateEmail('user.name+tag@sub.domain.org').valid).toBe(true);
    });

    it('rejects malformed email addresses', () => {
      expect(validateEmail('not-an-email').valid).toBe(false);
      expect(validateEmail('@missinguser.com').valid).toBe(false);
      expect(validateEmail('user@nodomain').valid).toBe(false);
      expect(validateEmail('').valid).toBe(false);
      expect(validateEmail(null).valid).toBe(false);
    });
  });

  describe('Phone Validation', () => {
    it('accepts valid phone numbers', () => {
      expect(validatePhone('+1 555-123-4567').valid).toBe(true);
      expect(validatePhone('5551234567').valid).toBe(true);
      expect(validatePhone('(555) 234-5678').valid).toBe(true);
    });

    it('allows empty phone when not required', () => {
      expect(validatePhone('', false).valid).toBe(true);
      expect(validatePhone(null, false).valid).toBe(true);
    });

    it('rejects invalid or too short phone numbers', () => {
      expect(validatePhone('123', true).valid).toBe(false);
      expect(validatePhone('abc-phone', true).valid).toBe(false);
    });
  });

  describe('Slug Validation', () => {
    it('accepts lowercase hyphenated slugs', () => {
      expect(validateSlug('classic-barbershop').valid).toBe(true);
      expect(validateSlug('my-business-123').valid).toBe(true);
    });

    it('rejects slugs with uppercase, spaces, or illegal punctuation', () => {
      expect(validateSlug('Classic Barbershop').valid).toBe(false);
      expect(validateSlug('slug_with_underscores').valid).toBe(false);
      expect(validateSlug('slug!@#').valid).toBe(false);
      expect(validateSlug('').valid).toBe(false);
    });
  });

  describe('Date Validation', () => {
    it('accepts valid future ISO dates', () => {
      expect(validateDate('2029-12-31', false).valid).toBe(true);
    });

    it('rejects past dates when allowPast is false', () => {
      expect(validateDate('2020-01-01', false).valid).toBe(false);
    });

    it('allows past dates when allowPast is true', () => {
      expect(validateDate('2020-01-01', true).valid).toBe(true);
    });

    it('rejects invalid formats and non-existent days', () => {
      expect(validateDate('31-12-2029').valid).toBe(false);
      expect(validateDate('2029-02-31').valid).toBe(false);
      expect(validateDate('invalid-date').valid).toBe(false);
    });
  });

  describe('Time Slot Validation', () => {
    it('accepts valid 24h and 12h time slots', () => {
      expect(validateTimeSlot('09:00').valid).toBe(true);
      expect(validateTimeSlot('14:30').valid).toBe(true);
      expect(validateTimeSlot('10:00 AM').valid).toBe(true);
      expect(validateTimeSlot('2:30 PM').valid).toBe(true);
    });

    it('accepts valid time ranges used in chat booking card and widgets', () => {
      expect(validateTimeSlot('10:00 AM - 10:30 AM').valid).toBe(true);
      expect(validateTimeSlot('09:00 AM - 10:00 AM').valid).toBe(true);
      expect(validateTimeSlot('10:00 - 10:30').valid).toBe(true);
      expect(validateTimeSlot('10:00 AM – 10:30 AM').valid).toBe(true);
      expect(validateTimeSlot('10:00 to 10:30').valid).toBe(true);
      expect(validateTimeSlot('2:00 PM - 3:00 PM').valid).toBe(true);
    });

    it('rejects invalid time slots', () => {
      expect(validateTimeSlot('25:00').valid).toBe(false);
      expect(validateTimeSlot('12:65').valid).toBe(false);
      expect(validateTimeSlot('noon').valid).toBe(false);
      expect(validateTimeSlot('10:00 - 25:00').valid).toBe(false);
    });

    it('rejects 12h times whose hour is not 1-12, which the booking time parser cannot read', () => {
      for (const bad of ['13:00 PM', '0:30 AM', '00:30 AM', '23:00 AM', '10:00 AM - 13:00 PM']) {
        expect(validateTimeSlot(bad).valid, bad).toBe(false);
      }
      expect(validateTimeSlot('12:30 AM').valid).toBe(true);
      expect(validateTimeSlot('12:00 PM').valid).toBe(true);
    });
  });

  describe('URL Validation', () => {
    it('accepts valid http and https URLs', () => {
      expect(validateUrl('https://example.com').valid).toBe(true);
      expect(validateUrl('http://sub.domain.org/path?query=1').valid).toBe(true);
    });

    it('rejects non-http schemes and malformed strings', () => {
      expect(validateUrl('javascript:alert(1)', false).valid).toBe(false);
      expect(validateUrl('ftp://ftp.example.com', false).valid).toBe(false);
      expect(validateUrl('not a url', false).valid).toBe(false);
    });
  });

  describe('String and Number Bounds Validation', () => {
    it('validates string length boundaries', () => {
      expect(validateString('hello', 2, 10, 'Field').valid).toBe(true);
      expect(validateString('a', 2, 10, 'Field').valid).toBe(false);
      expect(validateString('toolongstringhere', 2, 5, 'Field').valid).toBe(false);
    });

    it('validates number limits', () => {
      expect(validateNumber(25, 0, 100, 'Field').valid).toBe(true);
      expect(validateNumber(-1, 0, 100, 'Field').valid).toBe(false);
      expect(validateNumber(150, 0, 100, 'Field').valid).toBe(false);
    });
  });

  describe('Sanitization Layer', () => {
    it('properly escapes dangerous HTML characters in sanitizeHtml', () => {
      const dirty = '<script>alert("xss")</script>&foo';
      const clean = sanitizeHtml(dirty);
      expect(clean).not.toContain('<script>');
      expect(clean).toContain('&lt;script&gt;');
      expect(clean).toContain('&amp;foo');
    });

    it('strips script tags and control characters in sanitizeInput', () => {
      const dirty = '<script>alert(1)</script>Safe Text\x00';
      const clean = sanitizeInput(dirty);
      expect(clean).toBe('Safe Text');
    });
  });

  describe('Payload Validators', () => {
    it('validates and sanitizes business registration payload', () => {
      const validPayload = {
        businessName: 'Elite Salon & Spa',
        email: 'Owner@EliteSalon.com',
        password: 'SecurePassword123!',
        industryTemplateSlug: 'classic-barbershop',
      };
      const res = validateRegistrationPayload(validPayload);
      expect(res.valid).toBe(true);
      expect(res.sanitized?.businessName).toBe('Elite Salon & Spa');
      expect(res.sanitized?.email).toBe('owner@elitesalon.com');

      const invalidPayload = {
        businessName: '',
        email: 'invalid-email',
        password: '123',
      };
      const badRes = validateRegistrationPayload(invalidPayload);
      expect(badRes.valid).toBe(false);
      expect(badRes.errors.businessName).toBeDefined();
      expect(badRes.errors.email).toBeDefined();
      expect(badRes.errors.password).toBeDefined();
    });

    it('validates appointment booking payload', () => {
      const validBooking = {
        assistantId: 'ast_123',
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+1 555-987-6543',
        date: '2029-11-20',
        timeSlot: '11:00 AM',
        durationMinutes: 45,
        price: 75,
        notes: 'First time visiting.',
      };
      const res = validateAppointmentPayload(validBooking);
      expect(res.valid).toBe(true);
      expect(res.sanitized?.durationMinutes).toBe(45);
      expect(res.sanitized?.price).toBe(75);

      const invalidBooking = {
        assistantId: '',
        name: 'A',
        email: 'bademail',
        date: '2020-01-01',
        timeSlot: 'invalid_time',
      };
      const badRes = validateAppointmentPayload(invalidBooking);
      expect(badRes.valid).toBe(false);
      expect(badRes.errors.assistantId).toBeDefined();
      expect(badRes.errors.name).toBeDefined();
      expect(badRes.errors.email).toBeDefined();
      expect(badRes.errors.date).toBeDefined();
      expect(badRes.errors.timeSlot).toBeDefined();
    });

    it('validates chat request payload', () => {
      const validChat = {
        assistantId: 'ast_456',
        messages: [{ role: 'user', content: 'What are your hours?' }],
      };
      const res = validateChatPayload(validChat);
      expect(res.valid).toBe(true);
      expect(res.sanitized?.messages).toHaveLength(1);

      // Support widget format: { assistantId, message, history }
      const widgetChat = {
        assistantId: 'demo-assistant',
        message: 'How does Zero Token Markup work?',
        history: [{ role: 'assistant', content: 'Hello!' }],
      };
      const widgetRes = validateChatPayload(widgetChat);
      expect(widgetRes.valid).toBe(true);
      expect(widgetRes.sanitized?.messages).toHaveLength(2);
      expect(widgetRes.sanitized?.messages[1].content).toBe('How does Zero Token Markup work?');

      const invalidChat = {
        assistantId: '',
        messages: [],
      };
      const badRes = validateChatPayload(invalidChat);
      expect(badRes.valid).toBe(false);
      expect(badRes.errors.assistantId).toBeDefined();
      expect(badRes.errors.messages).toBeDefined();
    });

    it('validates landing page configuration payload', () => {
      const validLanding = {
        businessName: 'Modern Dental Studio',
        slug: 'modern-dental-studio',
        email: 'contact@moderndental.com',
        themeColor: '#2563eb',
        services: [{ name: 'Teeth Cleaning', price: 99, durationMinutes: 30 }],
      };
      const res = validateLandingPagePayload(validLanding);
      expect(res.valid).toBe(true);
      expect(res.sanitized?.slug).toBe('modern-dental-studio');

      const invalidLanding = {
        businessName: '',
        slug: 'Invalid Slug!',
        themeColor: 'not-a-color',
      };
      const badRes = validateLandingPagePayload(invalidLanding);
      expect(badRes.valid).toBe(false);
      expect(badRes.errors.businessName).toBeDefined();
      expect(badRes.errors.slug).toBeDefined();
      expect(badRes.errors.themeColor).toBeDefined();
    });
  });
});
