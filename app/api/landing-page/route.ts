import { NextRequest, NextResponse } from 'next/server';
import { Database, DEFAULT_BARBER_LANDING_CONFIG, getLandingConfigForSlugOrTemplate } from '@/lib/db';
import { BILLING_PLANS } from '@/lib/billing/plans';
import { verifyAdminRequest, getAuthContext } from '@/lib/security/auth';
import { getClientIp } from '@/lib/security/rate-limit';
import { LandingPageConfig } from '@/lib/landing/types';
import { validateLandingPagePayload } from '@/lib/security/validation';

export const dynamic = 'force-dynamic';

async function resolveAssistantForLandingPage(page: LandingPageConfig): Promise<string | null> {
  if (page.assistantId === '' || page.assistantId === 'none') {
    return null;
  }
  if (page.assistantId) {
    const existing = await Database.getAssistantById(page.assistantId);
    if (existing) return existing.id;
  }

  const wsId = page.workspaceId || 'default-workspace';
  const wsAssistants = await Database.getAssistants(wsId);

  // 1. Check if any assistant in the workspace matches this landing page's slug or business name
  const matched = wsAssistants.find((ast) =>
    ast.id === page.slug ||
    ast.id === `ast_${page.slug}` ||
    ast.name.toLowerCase().includes((page.businessName || '').toLowerCase())
  );

  if (matched) {
    page.assistantId = matched.id;
    try {
      await Database.saveLandingPage(page);
    } catch (saveErr) {
      console.warn('[LandingPage] Failed to persist canonical assistantId:', saveErr);
    }
    return matched.id;
  }

  // 2. Only map to demo-assistant if the landing page is explicitly barbershop
  if (page.slug === 'classic-barbershop' || page.industry === 'barbershop') {
    const demo = await Database.getAssistantById('demo-assistant');
    if (demo) return demo.id;
  }

  // 3. Fall back to existing assistants in workspace if available
  if (wsAssistants.length > 0) {
    page.assistantId = wsAssistants[0].id;
    try {
      await Database.saveLandingPage(page);
    } catch (saveErr) {}
    return wsAssistants[0].id;
  }

  const demo = await Database.getAssistantById('demo-assistant');
  if (demo) {
    page.assistantId = demo.id;
    return demo.id;
  }

  return page.assistantId || null;
}

async function getPublicAssistantConfig(assistantId: string, fallbackName?: string) {
  let assistant = await Database.getAssistantById(assistantId);
  if (!assistant && assistantId !== 'demo-assistant') {
    assistant = await Database.getAssistantById('demo-assistant');
  }
  if (!assistant) {
    return {
      id: assistantId,
      name: fallbackName || 'AI Concierge',
      welcomeMessage: `Hello! Welcome to ${fallbackName || 'our service'}. How can I help you today?`,
      primaryColor: '#2563eb',
      launcherPosition: 'bottom-right',
      starterQuestions: [
        'What services do you offer?',
        'How can I book an appointment?',
        'What are your pricing packages?',
      ],
      collectLeadEmail: true,
      bookingEnabled: true,
      bookingProvider: 'direct',
      bookingPromptText: 'Schedule an Appointment',
    };
  }

  return {
    id: assistant.id,
    name: assistant.name,
    welcomeMessage: assistant.welcomeMessage,
    primaryColor: assistant.primaryColor || '#2563eb',
    launcherPosition: assistant.launcherPosition || 'bottom-right',
    starterQuestions: assistant.starterQuestions || [],
    collectLeadEmail: assistant.collectLeadEmail || false,
    supportCustomFields: assistant.supportCustomFields || [],
    whiteLabelEnabled: assistant.whiteLabelEnabled || false,
    customBrandingText: assistant.customBrandingText || '',
    customBrandingUrl: assistant.customBrandingUrl || '',
    proactiveMessageEnabled: assistant.proactiveMessageEnabled || false,
    proactiveMessageText: assistant.proactiveMessageText || '',
    proactiveMessageDelay: assistant.proactiveMessageDelay ?? 5,
    bookingEnabled: assistant.bookingEnabled || false,
    bookingProvider: assistant.bookingProvider || 'direct',
    bookingUrl: assistant.bookingUrl || '',
    bookingPromptText: assistant.bookingPromptText || 'Schedule an Appointment',
    bookingSlotDuration: assistant.bookingSlotDuration || 30,
    bookingStartHour: assistant.bookingStartHour || '09:00',
    bookingEndHour: assistant.bookingEndHour || '17:00',
    bookingAvailableDays: assistant.bookingAvailableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get('all');
    const assistantId = searchParams.get('assistantId');
    const slug = searchParams.get('slug');
    const domain = searchParams.get('domain');

    // 1. List all landing pages for dashboard hub
    if (all === 'true') {
      const ctx = await getAuthContext(req);
      if (!ctx.authenticated) {
        return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
      }

      const targetWsId = (!ctx.workspaceId || ctx.workspaceId === '*') ? 'default-workspace' : ctx.workspaceId;
      const landingPages = await Database.getLandingPages(targetWsId);
      const billing = await Database.getWorkspaceBilling(targetWsId);
      const plan = BILLING_PLANS.find((p) => p.id === billing.planId) || BILLING_PLANS[0];
      const planLimit = plan.landingPageLimit || 1;
      const extraSlots = billing.extraLandingPagesCount || 0;
      const totalAllowed = planLimit + extraSlots;

      const limits = {
        planTier: plan.name || 'starter',
        baseLimit: planLimit,
        extraSlots,
        totalAllowed,
        currentCount: landingPages.length,
      };

      return NextResponse.json({
        success: true,
        landingPages,
        pages: landingPages,
        limits,
        planLimit,
        extraSlots,
        totalAllowed,
        currentCount: landingPages.length,
        planName: plan.name,
      });
    }

    // 2. Lookup by custom domain
    if (domain) {
      const page = await Database.getLandingPageBySlugOrDomain(domain);
      if (page) {
        const astId = await resolveAssistantForLandingPage(page);
        const assistant = astId ? await getPublicAssistantConfig(astId, page.businessName) : null;
        return NextResponse.json({
          assistantId: astId,
          assistantName: page.businessName,
          config: page,
          assistant,
        });
      }
      return NextResponse.json({ error: 'Landing page not found for domain' }, { status: 404 });
    }

    // 3. Lookup by slug or custom domain
    if (slug) {
      let page = await Database.getLandingPageBySlugOrDomain(slug);
      if (!page) {
        const allPages = await Database.getLandingPages();
        page = allPages.find((p) => p.assistantId === slug || p.id === slug) || null;
      }

      if (page) {
        const astId = await resolveAssistantForLandingPage(page);
        const assistant = astId ? await getPublicAssistantConfig(astId, page.businessName) : null;
        return NextResponse.json({
          assistantId: astId,
          assistantName: page.businessName,
          config: page,
          assistant,
        });
      }

      const ast = await Database.getAssistantBySlug(slug);
      if (ast) {
        const config = ast.landingPageConfig || getLandingConfigForSlugOrTemplate(slug);
        const assistant = await getPublicAssistantConfig(ast.id, ast.name);
        return NextResponse.json({
          assistantId: ast.id,
          assistantName: ast.name,
          config,
          assistant,
        });
      }

      const preset = getLandingConfigForSlugOrTemplate(slug);
      const defaultAst = await Database.getAssistantById('demo-assistant');
      const astId = defaultAst?.id || 'demo-assistant';
      const assistant = await getPublicAssistantConfig(astId, preset.businessName);
      return NextResponse.json({
        assistantId: astId,
        assistantName: preset.businessName,
        config: preset,
        assistant,
      });
    }

    if (!assistantId) {
      return NextResponse.json({ error: 'assistantId, slug, domain, or all=true required' }, { status: 400 });
    }

    const ast = await Database.getAssistantById(assistantId);
    if (ast) {
      const config = ast.landingPageConfig || getLandingConfigForSlugOrTemplate(assistantId);
      const assistant = await getPublicAssistantConfig(ast.id, ast.name);
      return NextResponse.json({
        assistantId: ast.id,
        assistantName: ast.name,
        config,
        assistant,
      });
    }

    const preset = getLandingConfigForSlugOrTemplate(assistantId);
    const defaultAst = await Database.getAssistantById('demo-assistant');
    const astId = defaultAst?.id || assistantId;
    const assistant = await getPublicAssistantConfig(astId, preset.businessName);
    return NextResponse.json({
      assistantId: astId,
      assistantName: preset.businessName,
      config: preset,
      assistant,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch landing page config' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getAuthContext(req);
    if (!ctx.authenticated) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }

    const body = await req.json();
    const { assistantId, config: rawConfig, isNewPage, createDedicatedAssistant } = body;

    const validation = validateLandingPagePayload(rawConfig);
    if (!validation.valid || !validation.sanitized) {
      const firstError = Object.values(validation.errors)[0] || 'Invalid landing page configuration';
      return NextResponse.json({ error: firstError, errors: validation.errors }, { status: 400 });
    }

    const config = validation.sanitized;

    const targetWorkspaceId = (ctx.memberId === 'master-admin' && config.workspaceId)
      ? config.workspaceId
      : (ctx.workspaceId && ctx.workspaceId !== '*' ? ctx.workspaceId : (config.workspaceId || 'default-workspace'));

    // Quota validation if creating a new landing page
    if (isNewPage) {
      const existingPages = await Database.getLandingPages(targetWorkspaceId);
      const billing = await Database.getWorkspaceBilling(targetWorkspaceId);
      const plan = BILLING_PLANS.find((p) => p.id === billing.planId) || BILLING_PLANS[0];
      const maxAllowed = (plan.landingPageLimit || 1) + (billing.extraLandingPagesCount || 0);

      if (existingPages.length >= maxAllowed) {
        return NextResponse.json({
          error: `Landing page quota reached (${existingPages.length} / ${maxAllowed} pages). Upgrade your plan or purchase an extra slot for $100.`,
          quotaReached: true,
          currentCount: existingPages.length,
          maxAllowed,
        }, { status: 403 });
      }
    }

    let finalAssistantId = config.assistantId !== undefined ? config.assistantId : assistantId;

    // Only auto-create a dedicated assistant for this new landing page if explicitly requested
    if (isNewPage && createDedicatedAssistant === true) {
      try {
        const newBotId = 'ast_' + config.slug.replace(/[^a-z0-9]/g, '_') + '_' + Math.random().toString(36).substring(2, 6);
        const industryLabel = config.industry || 'services';
        const createdAssistant = await Database.createAssistant({
          id: newBotId,
          workspaceId: targetWorkspaceId,
          name: `${config.businessName} Concierge`,
          description: `Dedicated AI assistant and booking concierge for ${config.businessName} (${industryLabel}).`,
          systemPrompt: `You are the exclusive AI assistant for ${config.businessName}. You answer questions, help clients book services, and provide accurate details based solely on ${config.businessName}'s knowledge base and service catalog. Never discuss or confuse details from other businesses or industries.`,
          welcomeMessage: `Welcome to ${config.businessName}! How can I assist you today?`,
          fallbackMessage: `I do not have that specific information in the ${config.businessName} knowledge base. Would you like me to connect you with our team?`,
          primaryColor: config.themeColor || '#2563eb',
          starterQuestions: config.starterQuestions && config.starterQuestions.length > 0
            ? config.starterQuestions
            : [
                `What services does ${config.businessName} offer?`,
                `How can I book an appointment?`,
                `What are your hours and location?`,
              ],
          collectLeadEmail: true,
          bookingEnabled: true,
          bookingProvider: 'direct',
          bookingPromptText: 'Schedule an Appointment',
        });
        finalAssistantId = createdAssistant.id;
      } catch (err) {
        console.warn('[LandingPage POST] Failed to create dedicated assistant:', err);
      }
    } else if (isNewPage && (finalAssistantId === undefined || finalAssistantId === '')) {
      // Connect to the workspace's default knowledge base/assistant for page 1 or when no assistant is passed
      const wsAssistants = await Database.getAssistants(targetWorkspaceId);
      if (wsAssistants.length > 0) {
        finalAssistantId = wsAssistants[0].id;
      } else {
        const demo = await Database.getAssistantById('demo-assistant');
        finalAssistantId = demo ? demo.id : 'demo-assistant';
      }
    } else if (finalAssistantId === 'none') {
      finalAssistantId = '';
    }

    const savedConfig = await Database.saveLandingPage({
      ...config,
      workspaceId: targetWorkspaceId,
      assistantId: finalAssistantId,
    });

    // Also update assistant config if assistantId provided
    if (finalAssistantId) {
      await Database.updateLandingPageConfig(finalAssistantId, savedConfig);
    }

    const ip = getClientIp(req);
    await Database.addAuditLog({
      actor: { id: ctx.memberId, name: ctx.role, ip },
      action: isNewPage ? 'landing_page.created' : 'landing_page.updated',
      targetType: 'landing_page',
      targetId: savedConfig.id || savedConfig.slug,
      details: { businessName: savedConfig.businessName, slug: savedConfig.slug, customDomain: savedConfig.customDomain },
    });

    return NextResponse.json({ success: true, config: savedConfig });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to save landing page' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const ctx = await getAuthContext(req);
    if (!ctx.authenticated) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');
    if (!id && !slug) {
      return NextResponse.json({ error: 'Landing page id or slug required' }, { status: 400 });
    }

    const targetId = id || slug || '';
    const deleted = await Database.deleteLandingPage(targetId, slug || undefined, ctx.workspaceId);
    if (!deleted) {
      return NextResponse.json({ error: 'Landing page not found or forbidden' }, { status: 404 });
    }

    const ip = getClientIp(req);
    await Database.addAuditLog({
      actor: { id: ctx.memberId || 'admin', name: ctx.role || 'Master Admin', ip },
      action: 'landing_page.deleted',
      targetType: 'landing_page',
      targetId: targetId,
      details: { id: targetId, slug: slug || '' },
    });

    return NextResponse.json({ success: true, message: 'Landing page deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to delete landing page' }, { status: 500 });
  }
}
