import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import { authorizeConnectorCall, presentedConnectorKey } from '@/lib/connectors/wordpress-auth';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Crescelo-Key',
    },
  });
}

function buildPromptsAndConfig(
  siteName: string,
  websiteType: string,
  objective: string,
  features: string[] = []
) {
  let systemPrompt = '';
  let welcomeMessage = '';
  let starterQuestions: string[] = [];
  const primaryColor = '#2563eb';
  let collectLeadEmail = false;
  let bookingEnabled = false;

  const isWoo = websiteType === 'woocommerce' || features.includes('woocommerce');

  if (isWoo || objective === 'sales') {
    systemPrompt = `You are the AI Sales Concierge and Personal Shopper for ${siteName}.
Your primary mission is to assist customers, recommend the right products, answer technical questions, compare options, handle pre-purchase objections, and guide shoppers to checkout.

Key Operational Instructions:
1. Product Expertise: Guide shoppers based strictly on the products and store details in your knowledge base. Highlight price, key specs, variations, and availability.
2. Direct Recommendations: Compare differences clearly when customers ask "Which one should I buy?" or "What's the difference?".
3. Interactive Product Cards: When recommending a specific product, embed the structured card tag on its own line:
[PRODUCT_CARD:{"id":PRODUCT_ID,"title":"PRODUCT_TITLE","price":"PRICE","url":"PRODUCT_URL","image":"IMAGE_URL","stock":"In Stock"}]
4. Cart Additions: When a customer expresses purchase intent or asks to add an item to their cart, confirm cheerfully and include:
[ADD_TO_CART:{"id":PRODUCT_ID,"title":"PRODUCT_TITLE","price":"PRICE"}]
5. Pre-Sale Reassurance: Answer shipping times, return policies, warranties, and sizing using store documentation.
6. Honest Grounding: If a product is not in your catalog, politely clarify what you do carry. Never invent fake SKUs or prices.`;

    welcomeMessage = `Hi! Welcome to ${siteName}. I'm your AI Shopping Assistant. Looking for a specific product or need a recommendation?`;
    starterQuestions = [
      'What are your most popular products?',
      'Can you help me choose the right item?',
      'What are your shipping and return policies?',
    ];
  } else if (objective === 'booking' || websiteType === 'service_booking') {
    bookingEnabled = true;
    systemPrompt = `You are the AI Scheduling and Client Assistant for ${siteName}.
Your primary goal is to help visitors understand our services, answer pricing and preparation questions, and schedule appointments smoothly.

Key Operational Instructions:
1. Clearly describe available services, pricing, and consultation procedures from the knowledge base.
2. Help prospective clients determine which service or consultation best meets their needs.
3. Guide clients to book their preferred date and time slot using the appointment scheduler in this chat.
4. Provide reassurance regarding location, policies, and what to expect during their visit.`;

    welcomeMessage = `Hello! Welcome to ${siteName}. How can I assist you with our services or booking an appointment today?`;
    starterQuestions = [
      'What services do you offer?',
      'How much does a consultation cost?',
      'Can I schedule an appointment?',
    ];
  } else if (objective === 'leads' || websiteType === 'lead_generation') {
    collectLeadEmail = true;
    systemPrompt = `You are the AI Business Development Representative for ${siteName}.
Your goal is to answer visitor questions about our solutions, qualify project requirements, and collect contact details (name, email, phone) so our senior team can prepare a custom proposal.

Key Operational Instructions:
1. Articulate our core capabilities, case studies, and services with authority.
2. Ask clarifying questions about the client's timeline, budget, and specific project needs.
3. Politely request their contact email and name once interest is established.`;

    welcomeMessage = `Welcome to ${siteName}! Tell me about your project or what you are looking to achieve.`;
    starterQuestions = [
      'What services does your company provide?',
      'How can we work together?',
      'Can I get a quote or proposal?',
    ];
  } else {
    systemPrompt = `You are the 24/7 AI Knowledge and Support Assistant for ${siteName}.
Your goal is to provide fast, accurate, and friendly answers to questions using the documentation, guides, and policies in your knowledge base.
If an answer is unavailable, offer to route their question to the team.`;

    welcomeMessage = `Hello! How can I help you today on ${siteName}?`;
    starterQuestions = [
      'How do I get started?',
      'Where can I find documentation?',
      'How can I contact support?',
    ];
  }

  return {
    systemPrompt,
    welcomeMessage,
    starterQuestions,
    primaryColor,
    collectLeadEmail,
    bookingEnabled,
  };
}

export async function POST(req: NextRequest) {
  try {
    const rateLimit = enforceRateLimit(req, 'wp-register', { windowMs: 60 * 1000, max: 20 });
    if (rateLimit.errorResponse) return rateLimit.errorResponse;

    const body = await req.json().catch(() => ({}));
    const {
      siteUrl = '',
      siteName = 'My WordPress Website',
      adminEmail = '',
      websiteType = 'woocommerce',
      objective = 'sales',
      features = [],
      existingAssistantId = '',
    } = body;

    if (!siteUrl) {
      return NextResponse.json(
        { success: false, error: 'siteUrl is required' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const cleanDomain = siteUrl
      .replace(/^https?:\/\//i, '')
      .replace(/\/.*$/, '')
      .replace(/[^a-z0-9.-]/gi, '')
      .toLowerCase();
    const config = buildPromptsAndConfig(siteName, websiteType, objective, features);

    // Registration only updates an assistant that already exists in a customer's workspace, and only for a caller that
    // holds that assistant's connector key (generated in the dashboard). A domain name is not a credential: the assistant
    // id and its allowed domains are visible on every site that embeds the widget, so matching on them let anyone take
    // an assistant over. Creating assistants anonymously is gone for the same reason.
    const providedKey = presentedConnectorKey(req, body.siteSecret);
    if (!existingAssistantId || typeof existingAssistantId !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Connect this site from your Crescelo dashboard: generate a WordPress key there, paste it into the plugin, and the plugin will connect with it.',
        },
        { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    let assistant = await Database.getAssistantById(existingAssistantId);
    const authResult = assistant ? authorizeConnectorCall(assistant, providedKey) : null;
    if (!assistant || !authResult || !authResult.ok) {
      // One answer for "no such assistant" and "wrong key", so this cannot be used to find assistant ids.
      const denied = authResult && !authResult.ok && authResult.status === 403 ? authResult : null;
      return NextResponse.json(
        { success: false, error: denied ? denied.error : 'Unauthorized: invalid assistant or key.' },
        { status: denied ? 403 : 401, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const isNew = false;
    // The key is the caller's own (it was just checked), so echoing it back reveals nothing new.
    const siteSecret = providedKey;

    const updated = await Database.updateAssistant(assistant.id, {
      name: `${siteName} AI Assistant`,
      description: `WordPress Assistant for ${cleanDomain} (${websiteType} / ${objective})`,
      systemPrompt: config.systemPrompt,
      welcomeMessage: config.welcomeMessage,
      starterQuestions: config.starterQuestions,
      primaryColor: config.primaryColor,
      collectLeadEmail: config.collectLeadEmail,
      bookingEnabled: config.bookingEnabled,
      allowedDomains: Array.from(new Set([...(assistant.allowedDomains || []), cleanDomain])),
    });
    if (updated) assistant = updated;

    const hostUrl = req.nextUrl.origin;

    return NextResponse.json(
      {
        success: true,
        isNew,
        assistantId: assistant.id,
        assistantName: assistant.name,
        siteSecret,
        hostUrl,
        widgetUrl: `${hostUrl}/widget.js`,
        config: {
          welcomeMessage: assistant.welcomeMessage,
          primaryColor: assistant.primaryColor,
          starterQuestions: assistant.starterQuestions,
          bookingEnabled: assistant.bookingEnabled,
          collectLeadEmail: assistant.collectLeadEmail,
        },
      },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Crescelo-Key',
        },
      }
    );
  } catch (error: any) {
    console.error('[WordPressConnector] Registration failed:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to register WordPress assistant' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
