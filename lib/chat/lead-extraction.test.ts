import { describe, it, expect, beforeEach, vi } from 'vitest';
import { extractContactDetails, autoCaptureChatLead } from './lead-extraction';
import { Database } from '../db';

describe('In-Chat Lead Extraction & Auto-Capture', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('extractContactDetails', () => {
    it('should extract email and phone from a combined message', () => {
      const msg = 'Please have someone call me at (555) 234-5678 or email me at john.doe@example.com';
      const result = extractContactDetails(msg);

      expect(result).not.toBeNull();
      expect(result?.email).toBe('john.doe@example.com');
      expect(result?.phone).toBe('(555) 234-5678');
    });

    it('should extract name when introduced with "my name is"', () => {
      const msg = 'Hi, my name is Sarah Conner. You can reach me at sarah@sky.net';
      const result = extractContactDetails(msg);

      expect(result).not.toBeNull();
      expect(result?.name).toBe('Sarah Conner');
      expect(result?.email).toBe('sarah@sky.net');
    });

    it('should extract phone number with international country code', () => {
      const msg = 'Call me at +1 718-555-0198 if you have openings';
      const result = extractContactDetails(msg);

      expect(result).not.toBeNull();
      expect(result?.phone).toBe('+1 718-555-0198');
    });

    it('should return null when message has no contact information', () => {
      const msg = 'What are your hours on Tuesday? Do you offer haircuts for kids?';
      const result = extractContactDetails(msg);

      expect(result).toBeNull();
    });

    it('should not treat 4-digit years or zip codes as phone numbers', () => {
      const msg = 'I was born in 1995 and my postal code is 90210.';
      const result = extractContactDetails(msg);

      expect(result).toBeNull();
    });
  });

  describe('autoCaptureChatLead', () => {
    it('should save lead and trigger notification when contact info is provided', async () => {
      const mockSaveLead = vi.spyOn(Database, 'saveLead').mockResolvedValue({
        id: 'lead_test_123',
        assistantId: 'ast_1',
        email: 'test@customer.com',
        phone: '555-123-4567',
        name: 'Jane Doe',
        createdAt: new Date().toISOString(),
      });

      const mockAddNotification = vi.spyOn(Database, 'addNotification').mockResolvedValue({} as any);
      vi.spyOn(Database, 'getLeads').mockResolvedValue([]);

      const captured = await autoCaptureChatLead({
        assistantId: 'ast_1',
        conversationId: 'conv_1',
        userMessage: 'My name is Jane Doe, email is test@customer.com, phone 555-123-4567',
      });

      expect(captured).toBe(true);
      expect(mockSaveLead).toHaveBeenCalledTimes(1);
      expect(mockSaveLead).toHaveBeenCalledWith(
        expect.objectContaining({
          assistantId: 'ast_1',
          email: 'test@customer.com',
          name: 'Jane Doe',
          phone: '555-123-4567',
          customData: expect.objectContaining({
            Type: 'In-Chat Auto Capture',
            attributionConversationId: 'conv_1',
            attributionSource: 'chat',
          }),
        })
      );
      expect(mockAddNotification).toHaveBeenCalledTimes(1);
    });

    it('should deduplicate and not re-save if lead email already exists', async () => {
      const mockSaveLead = vi.spyOn(Database, 'saveLead');
      vi.spyOn(Database, 'getLeads').mockResolvedValue([
        {
          id: 'lead_existing',
          assistantId: 'ast_1',
          email: 'existing@customer.com',
          createdAt: new Date().toISOString(),
        },
      ]);

      const captured = await autoCaptureChatLead({
        assistantId: 'ast_1',
        conversationId: 'conv_1',
        userMessage: 'Send details to existing@customer.com please',
      });

      expect(captured).toBe(false);
      expect(mockSaveLead).not.toHaveBeenCalled();
    });
  });
});
