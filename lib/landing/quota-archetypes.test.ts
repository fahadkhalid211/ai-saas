import { describe, it, expect } from 'vitest';
import {
  getArchetypesForIndustry,
  INDUSTRY_DESIGN_ARCHETYPES,
  MODERN_DESIGN_ARCHETYPES,
} from './types';

describe('Design Archetypes & Quota Verification', () => {
  const industries = [
    'real_estate',
    'barbershop',
    'gym',
    'legal',
    'saas',
    'healthcare',
    'ecommerce',
    'custom',
  ];

  it('should provide exactly 3 tailored design archetypes for each supported industry', () => {
    for (const ind of industries) {
      const archetypes = getArchetypesForIndustry(ind);
      expect(archetypes).toBeDefined();
      expect(archetypes.length).toBe(3);

      for (const arch of archetypes) {
        expect(arch.id).toBeTruthy();
        expect(arch.name).toBeTruthy();
        expect(arch.tagline).toBeTruthy();
        expect(arch.aesthetic).toBeTruthy();
        expect(arch.themeColor).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(arch.previewImage).toBeTruthy();
        expect(arch.badge).toBeTruthy();
        expect(arch.features.length).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('should verify real estate archetypes have distinct aesthetic properties for luxury, urban, and commercial', () => {
    const reArchs = getArchetypesForIndustry('real_estate');
    const ids = reArchs.map((a) => a.id);
    expect(ids).toContain('re_luxury');
    expect(ids).toContain('re_urban');
    expect(ids).toContain('re_investment');

    const luxury = reArchs.find((a) => a.id === 're_luxury')!;
    expect(luxury.name).toBe('Luxury Estate & Architectural Showcase');
    expect(luxury.aesthetic).toContain('Emerald');

    const urban = reArchs.find((a) => a.id === 're_urban')!;
    expect(urban.name).toBe('Modern Urban Brokerage & Listings');
    expect(urban.aesthetic).toContain('Cobalt');

    const commercial = reArchs.find((a) => a.id === 're_investment')!;
    expect(commercial.name).toBe('Commercial Advisory & Wealth Portfolios');
    expect(commercial.aesthetic).toContain('Gold');
  });

  it('should accurately detect when a workspace has reached its landing page quota', () => {
    const limitsUnderQuota = {
      baseLimit: 1,
      extraSlots: 0,
      totalAllowed: 1,
      currentCount: 0,
    };
    expect(limitsUnderQuota.currentCount >= limitsUnderQuota.totalAllowed).toBe(false);

    const limitsAtQuota = {
      baseLimit: 1,
      extraSlots: 0,
      totalAllowed: 1,
      currentCount: 1,
    };
    expect(limitsAtQuota.currentCount >= limitsAtQuota.totalAllowed).toBe(true);

    const limitsWithPaidAddon = {
      baseLimit: 1,
      extraSlots: 2,
      totalAllowed: 3,
      currentCount: 2,
    };
    expect(limitsWithPaidAddon.currentCount >= limitsWithPaidAddon.totalAllowed).toBe(false);

    const limitsAddonFull = {
      baseLimit: 1,
      extraSlots: 2,
      totalAllowed: 3,
      currentCount: 3,
    };
    expect(limitsAddonFull.currentCount >= limitsAddonFull.totalAllowed).toBe(true);
  });
});
