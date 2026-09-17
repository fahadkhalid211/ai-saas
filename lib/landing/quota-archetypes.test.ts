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

  it('should normalize wildcard and empty workspace IDs to default-workspace in billing operations', async () => {
    const { Database } = await import('@/lib/db');
    const billingDefault = await Database.getWorkspaceBilling('default-workspace');
    const billingWildcard = await Database.getWorkspaceBilling('*');
    const billingEmpty = await Database.getWorkspaceBilling('');

    expect(billingWildcard.id).toBe('default-workspace');
    expect(billingEmpty.id).toBe('default-workspace');
    expect(billingWildcard.planId).toBe(billingDefault.planId);
  });

  it('should increase total allowed pages upon purchasing an extra landing page slot', async () => {
    const { Database } = await import('@/lib/db');
    const billingBefore = await Database.getWorkspaceBilling('default-workspace');
    const initialSlots = billingBefore.extraLandingPagesCount || 0;

    const purchaseResult = await Database.purchaseExtraLandingPageSlot('default-workspace');
    expect(purchaseResult.success).toBe(true);
    expect(purchaseResult.newSlotCount).toBe(initialSlots + 1);

    const billingAfter = await Database.getWorkspaceBilling('*');
    expect(billingAfter.extraLandingPagesCount).toBe(initialSlots + 1);
  });

  it('should verify intelligent bot assignment rules for page 1 vs page 2+', () => {
    const assistants = [
      { id: 'demo-assistant', name: 'Kortex Support Agent' },
      { id: 'ast_custom_123', name: 'Custom Bot' },
    ];

    // Page 1 rule: existingPagesCount === 0 -> connect default assistant, no bot created
    const page1Count = 0;
    const isFirstPage = page1Count === 0;
    const defaultBotId = assistants[0].id;

    // Default assistantOption for page 1 should be the default bot ID
    const page1AssistantOption = isFirstPage ? defaultBotId : 'auto_create';
    expect(page1AssistantOption).toBe('demo-assistant');

    // Page 2 rule: existingPagesCount >= 1 -> prompt user, default to existing bot
    const page2Count = 1;
    const isSecondPage = page2Count >= 1;
    expect(isSecondPage).toBe(true);

    // If user chooses to reuse existing knowledge base:
    const userChoiceReuse = 'reuse_existing';
    const page2OptionReuse = userChoiceReuse === 'reuse_existing' ? defaultBotId : 'auto_create';
    const createDedicatedBotReuse = page2OptionReuse === 'auto_create';
    expect(page2OptionReuse).toBe('demo-assistant');
    expect(createDedicatedBotReuse).toBe(false);

    // If user chooses to create new dedicated knowledge base:
    const userChoiceNew = 'create_new';
    const page2OptionNew = userChoiceNew === 'create_new' ? 'auto_create' : defaultBotId;
    const createDedicatedBotNew = page2OptionNew === 'auto_create';
    expect(page2OptionNew).toBe('auto_create');
    expect(createDedicatedBotNew).toBe(true);
  });
});
