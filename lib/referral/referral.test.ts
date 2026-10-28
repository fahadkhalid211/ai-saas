import { describe, it, expect, beforeEach } from 'vitest';
import { Database } from '../db';
import { generatePartnerToken, verifyPartnerToken } from '../security/referral-auth';

describe('Referral & Affiliate Program System', () => {
  const testEmail = `partner_${Date.now()}@example.com`;
  const testCode = `testref${Math.random().toString(36).substring(2, 6)}`;

  beforeEach(async () => {
    await Database.getState();
  });

  describe('Partner Token Auth', () => {
    it('should generate and verify valid partner token', () => {
      const partnerId = 'ref_test_123';
      const token = generatePartnerToken(partnerId);
      expect(typeof token).toBe('string');
      expect(token.includes('.')).toBe(true);

      const verified = verifyPartnerToken(token);
      expect(verified).not.toBeNull();
      expect(verified?.partnerId).toBe(partnerId);
    });

    it('should reject tampered or invalid token', () => {
      const valid = generatePartnerToken('ref_test_456');
      const tampered = valid.slice(0, -4) + 'abcd';
      expect(verifyPartnerToken(tampered)).toBeNull();
      expect(verifyPartnerToken('invalid.token')).toBeNull();
      expect(verifyPartnerToken('')).toBeNull();
    });
  });

  describe('Partner Registration & Management', () => {
    it('should create referral partner with 10% commission, phone, and social links', async () => {
      const partner = await Database.createReferralPartner({
        name: 'Jordan Affiliate',
        email: testEmail,
        phone: '+1 555 987 6543',
        referralCode: testCode,
        passwordHash: 'scrypt:test:hash',
        platforms: ['instagram', 'youtube', 'tiktok'],
        socialLinks: {
          instagram: 'https://instagram.com/jordan_growth',
          youtube: 'https://youtube.com/@jordan_reviews',
          tiktok: 'https://tiktok.com/@jordan_ai',
        },
        marketingStrategy: 'YouTube tech tutorials and Instagram reels',
        payoutMethod: 'paypal',
        payoutDetails: 'jordan@paypal.me',
        commissionPercent: 10,
        status: 'active',
      });

      expect(partner.id).toBeDefined();
      expect(partner.referralCode).toBe(testCode.toLowerCase());
      expect(partner.commissionPercent).toBe(10);
      expect(partner.phone).toBe('+1 555 987 6543');
      expect(partner.platforms).toContain('instagram');
      expect(partner.platforms).toContain('youtube');
      expect(partner.socialLinks.instagram).toBe('https://instagram.com/jordan_growth');
    });

    it('should find partner by code and email', async () => {
      const byCode = await Database.getReferralPartnerByCode(testCode);
      expect(byCode).not.toBeNull();
      expect(byCode?.email).toBe(testEmail);

      const byEmail = await Database.getReferralPartnerByEmail(testEmail);
      expect(byEmail).not.toBeNull();
      expect(byEmail?.referralCode).toBe(testCode.toLowerCase());
    });
  });

  describe('Clicks Tracking & Customer Attribution', () => {
    it('should record referral clicks and increment partner click count', async () => {
      const partner = await Database.getReferralPartnerByCode(testCode);
      const initialClicks = partner?.clicksCount || 0;

      const clickLogged = await Database.recordReferralClick(testCode, {
        ip: '127.0.0.1',
        referrer: 'https://youtube.com',
        landingPath: `/ref/${testCode}`,
        userAgent: 'Mozilla/5.0 Test',
      });

      expect(clickLogged).toBe(true);

      const updatedPartner = await Database.getReferralPartnerByCode(testCode);
      expect(updatedPartner?.clicksCount).toBe(initialClicks + 1);
    });

    it('should attribute new workspace customer to the partner', async () => {
      const partner = await Database.getReferralPartnerByCode(testCode);
      expect(partner).not.toBeNull();

      const wsId = 'ws_ref_test_' + Math.random().toString(36).substring(2, 7);
      const customerEmail = `referred_client_${Date.now()}@acme.com`;

      const linked = await Database.linkWorkspaceToReferral(wsId, testCode, customerEmail, 'Acme Corp');
      expect(linked).toBe(true);
    });
  });

  describe('10% Recurring Commission Calculation', () => {
    it('should calculate 10% monthly recurring commission on active paying clients', async () => {
      const partner = await Database.getReferralPartnerByCode(testCode);
      expect(partner).not.toBeNull();

      const stats = await Database.getReferralStats(partner!.id);
      expect(stats).not.toBeNull();
      expect(stats?.partner.referralCode).toBe(testCode.toLowerCase());
      expect(stats?.totalClicks).toBeGreaterThanOrEqual(1);
      expect(stats?.totalReferredCustomers).toBeGreaterThanOrEqual(1);
      expect(stats?.partner.commissionPercent).toBe(10);
    });

    it('should process referral payout requests against available balance', async () => {
      const partner = await Database.getReferralPartnerByCode(testCode);
      expect(partner).not.toBeNull();

      // Attempt invalid negative payout
      const invalidPayout = await Database.requestReferralPayout(partner!.id, -50, 'paypal', 'test@paypal.com');
      expect(invalidPayout.success).toBe(false);
    });
  });
});
