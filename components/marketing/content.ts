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
    'Crescelo builds a website assistant from your own content. It answers visitor questions, books appointments, captures leads, and hands over to your team when a person is needed.',
  contactEmail: 'contact@crescelo.com',
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
  { label: 'Product', href: '/product', description: 'Autonomous architecture and features' },
  { label: 'Solutions', href: '/use-case', description: 'Tailored by business domain' },
  { label: 'Integrations', href: '/integrations', description: 'Connect calendars, CRM and channels' },
  { label: 'Pricing', href: '/pricing', description: 'Predictable plans, zero token tax' },
  { label: 'Support', href: '/support', description: 'Documentation and help center' },
];

/* ------------------------------ Hero ------------------------------ */

export const HERO = {
  eyebrow: 'Website assistant for service businesses',
  title: ['Answer every visitor.', 'Book the ones who are ready.'],
  body: 'Crescelo reads your services, prices and policies, then talks to visitors on your website. It answers from what you have written, books real appointments, and passes the conversation to your team when it should.',
  primaryCta: 'Start your 14-day free trial',
  secondaryCta: 'See how it works',
  trust: [
    'Answers only from your content',
    'Bring your own AI provider key',
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
  title: 'Most website visitors leave without saying a word.',
  before: [
    {
      title: 'Questions wait for office hours',
      body: 'Someone asks about pricing at 9pm. By the time you reply, they have booked with whoever answered first.',
    },
    {
      title: 'Bookings live in a back-and-forth',
      body: 'Finding a slot over email takes several messages. Each one is a chance for the person to drop off.',
    },
    {
      title: 'The same answers, typed again and again',
      body: 'Opening hours, deposits, service areas. Your team repeats them all week instead of doing the work.',
    },
    {
      title: 'Details get lost between chats and inboxes',
      body: 'Questions, names and phone numbers end up scattered across messages instead of in one place your team can act on.',
    },
  ],
  afterEyebrow: 'The approach',
  afterTitle: 'A front desk that never closes, and knows when to step aside.',
  after: [
    {
      title: 'It answers from your own material',
      body: 'Upload documents, paste pages, add a website URL. Replies are grounded in that content, and it says so when it does not know.',
    },
    {
      title: 'It books into your calendar',
      body: 'Visitors pick a real slot inside the chat. Double bookings are checked before a slot is confirmed.',
    },
    {
      title: 'It hands over cleanly',
      body: 'When a visitor asks for a person, your team takes the live conversation with the full history in view.',
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
  eyebrow: 'Solutions',
  title: 'Shaped around how your business takes enquiries.',
  items: [
    {
      id: 'appointments',
      label: 'Appointment businesses',
      title: 'Salons, clinics and studios',
      body: 'Visitors ask about services and prices, choose a slot, and the booking lands in your calendar with their contact details.',
      points: ['Service list with durations', 'Reminders by email', 'Reschedule from a link'],
    },
    {
      id: 'quotes',
      label: 'Quote-led trades',
      title: 'Contractors and home services',
      body: 'The assistant explains what you cover, asks the questions you need for a quote, and records the enquiry as a lead.',
      points: ['Lead capture with custom fields', 'Inspection bookings', 'Service-area answers'],
    },
    {
      id: 'professional',
      label: 'Professional services',
      title: 'Consultants, agencies and advisers',
      body: 'Answer the first round of questions about scope and process, then move serious enquiries to a call.',
      points: ['Policy and process answers', 'Discovery-call scheduling', 'Human takeover for complex questions'],
    },
    {
      id: 'agencies',
      label: 'Agencies',
      title: 'Building for several clients',
      body: 'Run separate assistants and hosted pages per client, each with its own knowledge and settings.',
      points: ['Multiple assistants', 'Hosted page per client', 'Team roles'],
    },
  ],
};

/* ------------------------------ Metrics ------------------------------ */

/**
 * Only facts about the product itself, taken from the codebase, are counted up.
 * No customer outcomes are claimed.
 */
export const METRICS = {
  eyebrow: 'By the numbers',
  title: 'What is in the product today.',
  items: [
    { value: 11, suffix: '', label: 'Industry starter templates' },
    { value: 5, suffix: '', label: 'Ways to add knowledge: files, URLs, video, text, images' },
    { value: 3, suffix: '', label: 'Channels: web widget, WhatsApp, Telegram' },
    { value: 2, suffix: '', label: 'Search methods combined: meaning and keyword' },
  ],
  footnote: 'Customer results are not shown because we have not published any yet.',
};

/* ---------------------------- Integrations ---------------------------- */

export const INTEGRATIONS = {
  eyebrow: 'Integrations',
  title: 'Connects to the tools you already use.',
  intro: 'Only integrations that exist in the product are listed.',
  hub: 'Crescelo',
  items: [
    { id: 'whatsapp', label: 'WhatsApp', note: 'Answer customers in WhatsApp' },
    { id: 'telegram', label: 'Telegram', note: 'Answer customers in Telegram' },
    { id: 'stripe', label: 'Stripe', note: 'Subscription billing' },
    { id: 'email', label: 'Email (SMTP)', note: 'Booking confirmations and reminders' },
    { id: 'calendar', label: 'Calendar feed', note: 'Subscribe from any calendar app' },
    { id: 'webhooks', label: 'Signed webhooks', note: 'Send events to your systems' },
  ],
};

/* ------------------------------ Security ------------------------------ */

/** Each claim maps to a control that exists in this codebase. No certifications are claimed. */
export const SECURITY = {
  eyebrow: 'Security',
  title: 'Controls you can check, described plainly.',
  intro:
    'We do not hold or claim any compliance certifications at this time. Here is what the product does today.',
  items: [
    { title: 'Passwords are hashed', body: 'Account passwords are stored as salted scrypt hashes, never in plain text.' },
    { title: 'Stored keys are encrypted', body: 'Your AI provider keys are encrypted at rest with AES-256-GCM.' },
    { title: 'Two-factor sign-in', body: 'Accounts can enable time-based one-time codes as a second step.' },
    { title: 'Rate limiting', body: 'Sign-in and public endpoints are rate limited to slow down guessing and abuse.' },
    { title: 'Signed webhooks', body: 'Outgoing webhooks are signed so your systems can verify where they came from.' },
    { title: 'Role-based access', body: 'Team members get roles that limit what they can view and change.' },
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
  title: 'Pick a plan by how many conversations you expect.',
  intro: 'Every plan starts with a 14-day free trial of all Growth features, no credit card needed. Prices in US dollars. Annual billing shows the effective monthly price.',
  note: 'You bring your own AI provider key, so model usage is billed by your provider, not marked up by us.',
};

/* -------------------------------- FAQ -------------------------------- */

export const FAQ = {
  eyebrow: 'FAQ',
  title: 'Questions people ask first.',
  items: [
    {
      q: 'Where does the assistant get its answers?',
      a: 'From the documents, pages and notes you add. If the answer is not in them, it says it does not know instead of inventing one, and the question is logged so you can fill the gap.',
    },
    {
      q: 'Do I need my own AI provider account?',
      a: 'Yes. You add your own provider key, and usage is billed by that provider at their rates. Crescelo does not add a markup on model usage.',
    },
    {
      q: 'Can a person take over a conversation?',
      a: 'Yes. Visitors can ask for a human at any point, your team is notified, and they continue the same conversation with the earlier messages visible.',
    },
    {
      q: 'How does booking avoid double bookings?',
      a: 'The slot is checked again at the moment of confirmation. If it was just taken, the visitor is offered another time.',
    },
    {
      q: 'Is there a free trial?',
      a: 'Yes. Every new account gets a 14-day free trial with all Growth features and no credit card. When it ends, choose a plan to keep your assistant answering visitors. If you do nothing, the assistant pauses and your data is kept for 30 days so you can subscribe later or export it. There is no permanent free plan.',
    },
    {
      q: 'Which channels are supported?',
      a: 'An embeddable web widget, a hosted business page, WhatsApp and Telegram.',
    },
    {
      q: 'Is the service certified for compliance frameworks?',
      a: 'No certifications are claimed at this time. The security section lists the controls that exist today.',
    },
    {
      q: 'Can I cancel?',
      a: 'Billing is handled through Stripe, where you can manage or cancel your subscription.',
    },
  ],
};

/* ---------------------------- Final CTA + footer ---------------------------- */

export const FINAL_CTA = {
  title: 'Put a knowledgeable front desk on your website.',
  body: 'Start a 14-day free trial, add your content, and try it yourself before any visitor does. No credit card needed.',
  primary: 'Start your 14-day free trial',
  secondary: 'Sign in',
};

export const FOOTER = {
  blurb: 'Enterprise-grade website assistants that answer from your content, book appointments and hand over to your team.',
  columns: [
    {
      title: 'Product',
      links: [
        { label: 'Overview', href: '/product' },
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
        { label: 'SaaS & Startups', href: '/use-case#saas' },
      ],
    },
    {
      title: 'Support & Legal',
      links: [
        { label: 'Help Center', href: '/support' },
        { label: 'Contact Support', href: '/support/contact' },
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Cookie Policy', href: '/cookies' },
        { label: 'Acceptable Use', href: '/acceptable-use' },
        { label: 'Data Processing Addendum', href: '/dpa' },
        { label: 'Sub-processors', href: '/subprocessors' },
        { label: 'Sign in', href: LOGIN_HREF },
      ],
    },
  ],
  legalNote: 'AI assistants for service businesses.',
};
