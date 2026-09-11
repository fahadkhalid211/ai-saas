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
  features: string[];
  highlight: string;
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
    highlight: '$0.49 per chat session',
    features: [
      '100 Chat Sessions / month ($0.50/extra chat)',
      '1 AI Assistant Bot',
      'Standard RAG Knowledge Base (PDF, DOCX, TXT, CSV)',
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
    highlight: '$0.30 per chat session — Save 40%',
    features: [
      '500 Chat Sessions / month ($0.40/extra chat)',
      '5 AI Assistant Bots',
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
    highlight: '$0.20 per chat session — Best ROI',
    features: [
      '2,000 Chat Sessions / month ($0.30/extra chat)',
      'Unlimited AI Assistant Bots',
      'Omnichannel: WhatsApp Cloud API & Telegram Bot integrations',
      'Outbound Webhook Dispatching & CRM Pipeline Sync',
      'Knowledge Gap Correction & Instant Vector Overrides',
      'High-Density Embeddings & Custom LLM Endpoint Base URLs',
      'Dedicated Account Manager & 99.9% Uptime SLA',
      'Custom Invoice Billing & Multi-seat Team Access',
    ],
  },
];
