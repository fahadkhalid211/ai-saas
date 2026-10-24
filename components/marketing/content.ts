import { BILLING_PLANS } from '@/lib/billing/plans';

/**
 * All marketing copy and data lives here so presentation components stay dumb.
 * Items marked PLACEHOLDER must be replaced before launch (see README notes in the
 * hand-off report). Nothing here claims a certification, a customer, or a metric
 * that has not been measured.
 */

/**
 * Absolute site origin for canonical/OG URLs. Tolerates a value without a scheme
 * (e.g. "example.vercel.app") and never throws, so a misconfigured env var cannot break the build.
 */
export const PRODUCTION_URL = 'https://www.crescelo.com';

function resolveSiteUrl(): string {
  // Only NEXT_PUBLIC_APP_URL may override the default, and never with a deployment address: a *.vercel.app host in the
  // canonical, sitemap or Open Graph URL tells search engines that a preview deployment is the real website.
  const v = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (v) {
    try {
      const url = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
      if (!/\.vercel\.app$/i.test(url.hostname) && !/^(localhost|127\.)/.test(url.hostname)) return url.origin;
    } catch {
      // fall through
    }
  }
  return PRODUCTION_URL;
}

export const SITE = {
  name: 'Crescelo',
  url: resolveSiteUrl(),
  path: '/',
  description:
    'An AI website assistant for service businesses: answers visitors from your own content, books appointments, captures leads and hands over to your team.',
  /** The public contact route. There is deliberately no published mailbox: requests go through the ticket form. */
  contactPath: '/support/contact',
  /** Official profiles only. Add a profile here when it exists; the footer shows the list only if it is not empty. */
  socials: [] as { label: string; href: string }[],
};

export const LOGIN_HREF = '/login';
export const SIGNUP_HREF = '/login?mode=register';

export interface NavLink {
  label: string;
  href: string;
  description?: string;
}

export const NAV: NavLink[] = [
  { label: 'Product', href: '/product', description: 'Features and how it works' },
  { label: "Who It's For", href: '/use-case', description: 'Tailored by business type' },
  { label: 'Integrations', href: '/integrations', description: 'Connect calendars, CRM and channels' },
  { label: 'Pricing', href: '/pricing', description: 'Predictable plans, zero token tax' },
  { label: 'Try Demo', href: '/playground', description: 'Test with your own flyer in 2 minutes' },
  { label: 'Support', href: '/support', description: 'Documentation and help center' },
];

/* ------------------------------ Hero ------------------------------ */

export const HERO = {
  eyebrow: 'Website assistant for service businesses',
  title: ['Answer every visitor.', 'Book the ones who are ready.'],
  body: 'Instant answers from your content. Real bookings into your calendar.\nYour team steps in only when it matters.',
  primaryCta: 'Start free trial',
  secondaryCta: 'Try free Demo',
  trust: [
    'Answers from your own content, and says when it does not know',
    'Free to start — zero compute cost',
    'Human takeover in one click',
  ],
};

/* ------------------------ Social proof strip ----------------------- */

/**
 * Industries the product is built for: categories, not company names, so nothing implies a real customer.
 */
export const LOGO_STRIP = {
  caption: 'Built for service businesses like these',
  items: [
    'Barbershops',
    'Dental clinics',
    'Roofing contractors',
    'Law firms',
    'Fitness studios',
    'Real estate agents',
    'Salons and spas',
    'Home services',
    'Consultancies',
    'Auto repair',
  ],
};

/* ---------------------- Problem to solution ---------------------- */

export const STORY = {
  eyebrow: 'The problem',
  title: 'Your website is open 24 hours. Your team is not.',
  before: [
    {
      title: 'Questions arrive after hours',
      body: 'A prospect asks about pricing at 9pm. You reply the next morning. They booked with whoever answered first.',
    },
    {
      title: 'Bookings get stuck in back-and-forth',
      body: '"What time works for you?" turns into five emails. Every exchange is a chance for the person to lose interest.',
    },
    {
      title: 'Your team answers the same ten questions, daily',
      body: 'Opening hours, deposit policy, service areas. Good people spending good time on questions that could be answered automatically.',
    },
    {
      title: 'Leads fall through the cracks',
      body: 'Names and numbers end up scattered across Instagram DMs, missed calls and email threads — nowhere anyone can act on them.',
    },
  ],
  afterEyebrow: 'The fix',
  afterTitle: 'A front desk that answers at 2am and knows exactly when to get you involved.',
  after: [
    {
      title: 'Answers from your own content',
      body: 'Upload your documents, paste your web pages, add a video or audio file. Every reply is grounded in what you wrote — and it says so when it does not know.',
    },
    {
      title: 'Books into your real calendar',
      body: 'Visitors pick a slot inside the chat. The moment they confirm, the time is checked and held — no double bookings.',
    },
    {
      title: 'Hands over without losing context',
      body: 'When a visitor asks for a person, your team joins the live conversation with every earlier message already in view.',
    },
  ],
};

/* ------------------------ Interactive demos ------------------------ */

export const DEMO = {
  eyebrow: 'Try it',
  title: 'See the difference a grounded answer makes.',
  intro: 'See how standard chatbot fluff compares to Crescelo’s grounded response. Drag the slider to inspect.',
  question: 'Do you do same-day repairs on flat roofs?',
  generic: {
    label: 'Generic chatbot',
    text: 'Yes! We offer fast, high quality roof repairs at competitive prices. Contact us for a free quote today.',
    note: 'Sounds confident, commits to things nobody wrote down.',
  },
  bad: {
    title: 'No engagement',
    words: ['Never asks a follow-up', 'Leaves visitors guessing', 'Promises what it cannot check', 'The visitor leaves'],
  },
  good: {
    title: 'Engaged and guided',
    words: ['Asks the next step', 'Answers from your content', 'Offers a real booking', 'The visitor stays'],
  },
  grounded: {
    label: 'Crescelo, from your content',
    text: 'Flat roof repairs are usually scheduled within 2 working days. Same-day visits are only offered for active leaks. Would you like to book an inspection?',
    note: 'Grounded in your uploaded policy doc and automatically offers the booking step.',
  },
};

/* ------------------------------ Use cases ------------------------------ */

export const USE_CASES = {
  eyebrow: 'Who it is for',
  title: 'Built around how your business takes enquiries.',
  items: [
    {
      id: 'appointments',
      label: 'Appointment businesses',
      title: 'Salons, clinics and studios',
      body: 'Visitors ask about services and pricing, choose a slot, and the booking lands in your calendar — complete with their contact details.',
      points: ['Service list with durations and pricing', 'Automated reminders by email', 'Self-service reschedule links'],
    },
    {
      id: 'quotes',
      label: 'Quote-led trades',
      title: 'Contractors and home services',
      body: 'The assistant explains what you cover, gathers the details you need for a quote, and logs the enquiry as a lead — ready for you to follow up.',
      points: ['Lead capture with custom fields', 'Inspection slot booking', 'Service-area and coverage answers'],
    },
    {
      id: 'professional',
      label: 'Professional services',
      title: 'Consultants, agencies and advisers',
      body: 'Answer the first round of scope and process questions automatically, then move serious enquiries to a discovery call with your team.',
      points: ['Policy and process answers from your docs', 'Discovery-call scheduling', 'Seamless human takeover for complex cases'],
    },
    {
      id: 'agencies',
      label: 'Agencies',
      title: 'Building for several clients',
      body: 'Run separate assistants and hosted pages for each client, each with its own knowledge base, branding and settings.',
      points: ['Multiple independent assistants', 'Hosted page per client', 'Team roles and permissions'],
    },
  ],
};

/* ------------------------------ Metrics ------------------------------ */

/**
 * Only facts about the product itself, taken from the codebase, are counted up.
 * No customer outcomes are claimed.
 */
export const METRICS = {
  eyebrow: 'What is inside',
  title: 'Everything you need, already built.',
  items: [
    { value: 11, suffix: '', label: 'Industry starter templates' },
    { value: 5, suffix: '', label: 'Ways to add knowledge: files, URLs, video, text, images' },
    { value: 4, suffix: '', label: 'Channels: web widget, iOS & Android mobile apps, WhatsApp, Telegram' },
    { value: 2, suffix: '', label: 'Search methods combined: semantic and keyword' },
  ],
  footnote: 'Figures describe product capabilities, not projected customer outcomes.',
};

/* ---------------------------- Integrations ---------------------------- */

export const INTEGRATIONS = {
  eyebrow: 'Integrations',
  title: 'Plugs into the tools you already use.',
  intro: 'Only integrations that exist in the product are listed here.',
  hub: 'Crescelo',
  items: [
    { id: 'mobile', label: 'Mobile apps (iOS & Android)', note: 'Native SDK, in-app WebView, REST API' },
    { id: 'whatsapp', label: 'WhatsApp', note: 'Answer customers in WhatsApp' },
    { id: 'telegram', label: 'Telegram', note: 'Answer customers in Telegram' },
    { id: 'slack', label: 'Slack', note: 'New leads posted to a channel' },
    { id: 'sheets', label: 'Google Sheets', note: 'Every lead added as a row' },
    { id: 'voice', label: 'Phone calls', note: 'Coming soon' },
    { id: 'email', label: 'Email (SMTP)', note: 'Booking confirmations and reminders' },
    { id: 'calendar', label: 'Calendar feed', note: 'Subscribe from Google, Apple or Outlook' },
    { id: 'webhooks', label: 'Webhooks', note: 'Zapier, Make or your own systems' },
  ],
};

/* ------------------------------ Security ------------------------------ */

/** Each claim maps to a control that exists in this codebase. No certifications are claimed. */
export const SECURITY = {
  eyebrow: 'Security',
  title: 'Built to protect your customers and your business.',
  intro:
    'No compliance certifications are claimed at this time. Here is exactly what the product does to keep your data safe.',
  items: [
    { title: 'Passwords are hashed', body: 'Account passwords are stored as salted scrypt hashes, never in plain text.' },
    { title: 'AI keys are encrypted at rest', body: 'Your AI provider keys are encrypted with AES-256-GCM before storage.' },
    { title: 'Rate limiting on all endpoints', body: 'Sign-in and public endpoints are rate limited to slow brute-force attempts.' },
    { title: 'Signed webhooks', body: 'Outgoing webhooks carry a signature your systems can verify to confirm they came from us.' },
    { title: 'Role-based access', body: 'Team members are assigned roles that restrict what they can view, edit or change.' },
  ],
};

/* ------------------------------ Pricing ------------------------------ */

export interface PricingPlan {
  id: string;
  name: string;
  tagline: string;
  monthly: number;
  annualMonthly: number;
  popular: boolean;
  highlights: string[];
}

/** Prices and limits are derived from lib/billing/plans.ts so they cannot drift. */
export const PLANS: PricingPlan[] = BILLING_PLANS.map((p) => ({
  id: p.id,
  name: p.name,
  tagline: p.tagline,
  monthly: p.monthlyPrice,
  annualMonthly: p.annualMonthlyPrice,
  popular: !!p.popular,
  highlights: [
    `${p.chatSessionsLimit.toLocaleString('en-US')} chat sessions per month`,
    `Extra sessions at $${p.overageRate.toFixed(2)} each`,
    p.botLimit === 'Unlimited'
      ? 'Unlimited assistants'
      : `${p.botLimit} ${p.botLimit === 1 ? 'assistant' : 'assistants'}`,
    p.knowledgeStorageLimitMb >= 1000
      ? `${p.knowledgeStorageLimitMb / 1000} GB knowledge storage`
      : `${p.knowledgeStorageLimitMb} MB knowledge storage`,
  ],
}));

export const PRICING = {
  eyebrow: 'Pricing',
  title: 'Simple pricing. No surprises.',
  intro: 'Every plan starts with a 14-day free trial of all Growth features. A card is required to start; you are not charged during the trial. Cancel any time before it ends and you pay nothing. Prices are in US dollars. Annual billing shows the monthly equivalent.',
  note: 'You bring your own AI key — model usage is billed directly by your provider at their rates. We do not mark it up.',
};

/* -------------------------------- FAQ -------------------------------- */

export const FAQ = {
  eyebrow: 'FAQ',
  title: 'Plain answers to the questions that come up first.',
  items: [
    {
      q: 'Where does the assistant get its answers?',
      a: 'From the content you add — documents, pages and notes. If the answer is not in your material, it says so instead of guessing. Every unanswered question is logged so you can fill the gap.',
    },
    {
      q: 'Do I need my own AI provider account?',
      a: 'No. You can get started right away using our free built-in engine with zero setup and no card required. If you prefer to connect your own OpenAI, Google Gemini, Anthropic or Groq account, you can plug in your existing key with zero platform markup.',
    },
    {
      q: 'Can a person take over a live conversation?',
      a: 'Yes. Visitors can ask for a human at any point. Your team gets an alert, joins the same chat thread, and can see everything that was already said.',
    },
    {
      q: 'How does it avoid double bookings?',
      a: 'The slot is checked and locked the moment a visitor confirms. If someone else just took it, they are immediately offered the next available time.',
    },
    {
      q: 'Is there a free trial?',
      a: 'Yes — 14 days with all Growth features. Add a card to start; you are not charged during the trial. Cancel any time before it ends and you pay nothing. After the trial, your plan billing starts automatically.',
    },
    {
      q: 'Which channels does it work on?',
      a: 'An embeddable website widget, native iOS & Android mobile apps, a hosted business page, WhatsApp and Telegram. One assistant, all your business channels.',
    },
    {
      q: 'Can Crescelo be used in mobile apps (iOS & Android)?',
      a: 'Yes. Crescelo works inside mobile apps via our lightweight mobile embed, in-app WebView, or REST API. Your assistant accesses the exact same knowledge base, calendar slots, and booking flow as on your website.',
    },
    {
      q: 'How do I cancel?',
      a: 'Through the Lemon Squeezy customer portal in your account. Cancel any time — no penalty, no waiting.',
    },
  ],
};

/* ---------------------------- Final CTA + footer ---------------------------- */

export const FINAL_CTA = {
  title: 'Ready to stop missing visitors?',
  body: 'Set up your assistant in minutes. Add your content, test it yourself, and put it live — all before your 14-day trial ends. Cancel any time, pay nothing if you do.',
  primary: 'Start free trial',
  secondary: 'Sign in',
};

export const FOOTER = {
  blurb: 'A website assistant that answers from your content, books real appointments and hands off to your team — any time, any channel.',
  columns: [
    {
      title: 'Product',
      links: [
        { label: 'Overview', href: '/product' },
        { label: 'Playground', href: '/playground' },
        { label: 'LLM cost calculator', href: '/tools/llm-cost-calculator' },
        { label: 'Architecture', href: '/product#pipeline-stages' },
        { label: 'Roadmap', href: '/roadmap' },
        { label: 'Integrations', href: '/integrations' },
        { label: 'Pricing', href: '/pricing' },
      ],
    },
    {
      title: 'Solutions',
      links: [
        { label: 'All Industries', href: '/use-case' },
        { label: 'Salons & Spas', href: '/use-case#salons' },
        { label: 'Clinics & Wellness', href: '/use-case#clinics' },
        { label: 'Real Estate', href: '/use-case#real-estate' },
        { label: 'Fitness & Gyms', href: '/use-case#fitness' },
        { label: 'Contractors & Trades', href: '/use-case#trades' },
        { label: 'SaaS & Startups', href: '/use-case#saas' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Blog', href: '/blog' },
        { label: 'Help Center', href: '/support' },
        { label: 'Add it to WordPress', href: '/guides/add-ai-assistant-to-wordpress' },
        { label: 'Contact Support', href: '/support/contact' },
        { label: 'Report a Bug', href: '/report-bug' },
        { label: 'System status', href: '/status' },
        { label: 'Sign in', href: LOGIN_HREF },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Cookie Policy', href: '/cookies' },
        { label: 'Accessibility', href: '/accessibility' },
        { label: 'Acceptable Use', href: '/acceptable-use' },
        { label: 'Data Processing Addendum', href: '/dpa' },
        { label: 'Sub-processors', href: '/subprocessors' },
      ],
    },
  ],
  legalNote: 'AI assistants for service businesses.',
};
