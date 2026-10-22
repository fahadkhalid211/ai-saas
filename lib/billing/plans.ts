export interface PlanTier {
  id: 'starter' | 'growth' | 'scale';
  name: string;
  tagline: string;
  popular?: boolean;
  chatSessionsLimit: number;
  overageRate: number; // in dollars, e.g. 0.50
  monthlyPrice: number;
  annualMonthlyPrice: number; // when billed annually
  botLimit: number | 'Unlimited';
  landingPageLimit: number; // included landing pages
  knowledgeStorageLimitMb: number; // included knowledge base storage quota in MB
  features: string[];
  highlight: string;
}


export function getPlanKnowledgeStorageLimitMb(planId: string = 'starter'): number {
  const plan = BILLING_PLANS.find((p) => p.id === planId) || BILLING_PLANS[0];
  return plan.knowledgeStorageLimitMb;
}

/** What paying yearly saves on a plan, as a whole percent (annual price per month against the monthly price). */
export function planAnnualSavingsPercent(p: Pick<PlanTier, 'monthlyPrice' | 'annualMonthlyPrice'>): number {
  return Math.round((1 - p.annualMonthlyPrice / p.monthlyPrice) * 100);
}

/** The saving shown next to "Annual": the smallest across the plans, so it is true for every plan. */
export function annualSavingsPercent(): number {
  return Math.min(...BILLING_PLANS.map(planAnnualSavingsPercent));
}

/** Dollars saved per year on a plan by paying yearly. */
export function planAnnualSavingsDollars(p: Pick<PlanTier, 'monthlyPrice' | 'annualMonthlyPrice'>): number {
  return (p.monthlyPrice - p.annualMonthlyPrice) * 12;
}

export const BILLING_PLANS: PlanTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Ideal for small businesses getting started with automated AI customer support.',
    chatSessionsLimit: 100,
    overageRate: 0.50,
    monthlyPrice: 49,
    annualMonthlyPrice: 39,
    botLimit: 1,
    landingPageLimit: 1,
    knowledgeStorageLimitMb: 50,
    highlight: '$0.49 per chat session',
    features: [
      '100 Chat Sessions / month ($0.50/extra chat)',
      '1 AI Assistant Bot',
      '50 MB Knowledge Storage (~50,000 document pages)',
      'Live Webpage Scraper & URL Indexing',
      'Lead Capture Form & Instant Email Alerts',
      'Testing Studio Playground',
      'Widget Embed (Floating Bubble & Inline Iframe)',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    tagline: 'For growing brands needing high-volume conversations and calendar booking.',
    popular: true,
    chatSessionsLimit: 500,
    overageRate: 0.40,
    monthlyPrice: 149,
    annualMonthlyPrice: 119,
    botLimit: 5,
    landingPageLimit: 3,
    knowledgeStorageLimitMb: 500,
    highlight: '$0.30 per chat session — Save 40%',
    features: [
      '500 Chat Sessions / month ($0.40/extra chat)',
      '5 AI Assistant Bots',
      '500 MB Knowledge Storage (Audio/Video Transcripts & Docs)',
      'Multimodal RAG (Audio & Video Transcripts + Image OCR)',
      'Appointment Booking & Calendar Sync (Direct, Calendly, Cal.com)',
      'Full Agency White-Label (Zero Platform Branding)',
      'Speech-to-Text Voice Dictation & Multilingual Switcher (6 languages)',
      'Visitor Sentiment & Escalation Detector',
      'Priority Email & Live Chat Support',
    ],
  },
  {
    id: 'scale',
    name: 'Agency / Scale',
    tagline: 'Enterprise-grade scale with omnichannel WhatsApp and Telegram integrations.',
    chatSessionsLimit: 2000,
    overageRate: 0.30,
    monthlyPrice: 399,
    annualMonthlyPrice: 319,
    botLimit: 'Unlimited',
    landingPageLimit: 7,
    knowledgeStorageLimitMb: 5000,
    highlight: '$0.20 per chat session — Best ROI',
    features: [
      '2,000 Chat Sessions / month ($0.30/extra chat)',
      'Unlimited AI Assistant Bots',
      '5 GB High-Capacity Knowledge Storage (5,000 MB)',
      'Omnichannel: WhatsApp Cloud API & Telegram Bot integrations',
      'Outbound Webhook Dispatching & CRM Pipeline Sync',
      'Knowledge Gap Correction & Instant Vector Overrides',
      'High-Density Embeddings & Custom LLM Endpoint Base URLs',
      'Dedicated Account Manager & 99.9% Uptime SLA',
      'Custom Invoice Billing & Multi-seat Team Access',
    ],
  },
];
