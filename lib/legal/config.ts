/**
 * The facts every legal page relies on, in one place. If any of these change (a company is formed, an address is added,
 * a provider is replaced), change it here and every page follows.
 */
export const LEGAL = {
  /** The person or company that runs the service. */
  operator: 'Fahad Khalid',
  tradeName: 'Crescelo',
  operatorLine: 'Fahad Khalid, trading as Crescelo',
  country: 'Pakistan',
  website: 'https://www.crescelo.com',
  /** One mailbox for everything, so no notice is sent to an address that does not exist. */
  email: 'contact@crescelo.com',
  governingLaw: 'the laws of Pakistan',
  courts: 'the competent courts of Pakistan',
  effectiveDate: 'September 24, 2026',
  lastUpdated: 'September 24, 2026',
  logRetentionDays: 30,
  deletionDays: 30,
  minimumAge: 18,
} as const;

/** Providers that may process personal data on our behalf. Keep in step with lib and the environment variables in use. */
export const SUBPROCESSORS: { name: string; purpose: string; data: string; location: string }[] = [
  { name: 'Vercel Inc.', purpose: 'Application hosting and delivery (serverless functions, CDN)', data: 'All data the application handles in transit; request metadata', location: 'Mumbai, India (primary function region); global edge network' },
  { name: 'Oracle Corporation (Oracle Cloud Infrastructure)', purpose: 'Primary database (PostgreSQL)', data: 'Account data, knowledge-base content, conversations, leads, appointments, logs', location: 'Oracle Cloud region selected by Crescelo' },
  { name: 'Upstash Inc.', purpose: 'Rate limiting and short-lived caching (Redis)', data: 'IP-derived rate-limit keys, cached retrieval results', location: 'Region selected by Crescelo' },
  { name: 'Stripe Payments Europe Ltd. / Stripe, Inc.', purpose: 'Payment processing and subscription billing', data: 'Billing name, email, payment method (handled by Stripe; we do not store card numbers)', location: 'EU / United States' },
  { name: 'Resend, Inc. (or the SMTP provider you configure)', purpose: 'Transactional email (confirmations, notifications, alerts)', data: 'Recipient email address, message content', location: 'United States' },
  { name: 'Google LLC', purpose: 'Sign-in with Google (OAuth), reCAPTCHA bot protection, Google Analytics (only if you accept analytics cookies), Google Sheets if you connect it', data: 'Name, email and profile picture for sign-in; reCAPTCHA signals; rows you choose to send to your sheet', location: 'United States / global' },
  { name: 'AI model providers you connect (Google Gemini, OpenAI, Anthropic, Groq, DeepSeek, or a self-hosted model)', purpose: 'Generating assistant replies', data: 'The visitor question, relevant knowledge-base passages and recent conversation turns', location: 'As set by the provider you choose' },
  { name: 'Groq, Inc. / Google LLC (Crescelo’s own assistant)', purpose: 'Powering the assistant on crescelo.com itself', data: 'Messages typed into the Crescelo website assistant', location: 'United States' },
];
