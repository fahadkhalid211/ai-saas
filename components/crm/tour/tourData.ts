// Tour step data — drives the TourGuideModal
export interface TourStep {
  id: string;
  tab: string | null; // null = no tab switch needed
  title: string;
  body: string;
  highlight?: string; // human description of what to look at
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    tab: 'overview',
    title: 'Welcome to your dashboard',
    body: 'This is your command center. From here you can train your assistant, review conversations, and add it to your website. This tour will walk you through everything in about 3 minutes.',
    highlight: 'The Overview tab shows a live snapshot of how your assistant is performing.',
  },
  {
    id: 'sidebar',
    tab: 'overview',
    title: 'Getting around',
    body: 'The left sidebar is organized into four sections: Get Started (your core setup), Grow & Engage (conversations and bookings), Customize (how the assistant looks and behaves), and Settings (account, team, billing).',
    highlight: 'Notice the four sections in the left sidebar.',
  },
  {
    id: 'knowledge',
    tab: 'knowledge',
    title: 'Knowledge Base — teach your assistant',
    body: 'Upload business documents, paste your website URL, or add FAQ text. Your assistant reads all of it and uses it to answer customer questions accurately.',
    highlight: 'Click "Add Source" to upload a PDF, DOCX, CSV, or paste a website link.',
  },
  {
    id: 'knowledge2',
    tab: 'knowledge',
    title: 'What to upload first',
    body: 'Start with your most common questions: pricing, hours, services, policies. A one-page FAQ document is enough to make your assistant useful on day one.',
    highlight: 'The status badge next to each source turns green when the assistant has finished learning from it.',
  },
  {
    id: 'playground',
    tab: 'playground',
    title: 'Test before going live',
    body: 'Use this chat window to ask your assistant the same questions your customers would ask. If an answer is wrong, go back to the Knowledge Base and add more detail.',
    highlight: 'Type a question a real customer might ask and see how the assistant responds.',
  },
  {
    id: 'engine',
    tab: 'engine',
    title: 'Response style',
    body: 'Choose how your assistant communicates: Strict keeps answers factual and conservative, Balanced is warm but accurate, Creative adds a more conversational tone. Most businesses do well with Balanced.',
    highlight: 'The three Response Style cards let you switch tone with one click.',
  },
  {
    id: 'behavior',
    tab: 'behavior',
    title: 'Personality and guardrails',
    body: "Set your assistant's name, a brief description of your business, and what it should say when it doesn't know the answer. This prevents it from making things up.",
    highlight: 'The "Fallback message" field controls what the assistant says when it is unsure.',
  },
  {
    id: 'widget',
    tab: 'widget',
    title: 'Match your brand',
    body: 'Change the chat button color, greeting message, launcher position, and logo so the widget feels like part of your website — not a third-party tool.',
    highlight: 'The preview on the right updates in real time as you change settings.',
  },
  {
    id: 'leads',
    tab: 'leads',
    title: 'Captured leads',
    body: 'Every time the assistant collects a name, email, or phone number from a visitor, it appears here automatically. No forms to manage — it happens in conversation.',
    highlight: 'Leads are listed with the date and the message they sent.',
  },
  {
    id: 'appointments',
    tab: 'appointments',
    title: 'Bookings',
    body: 'If you offer appointments, your assistant can handle the entire booking flow — asking for the date, time, and contact details — and the booking shows up here.',
    highlight: 'Use the status column to mark bookings as confirmed, completed, or cancelled.',
  },
  {
    id: 'conversations',
    tab: 'conversations',
    title: 'Chat history',
    body: 'Every conversation your assistant has is saved here. You can read transcripts, filter by date, and jump into a live conversation to take over from the assistant at any time.',
    highlight: 'Click any conversation row to open the full transcript.',
  },
  {
    id: 'analytics',
    tab: 'analytics',
    title: 'How your assistant is performing',
    body: 'See how many visitors your assistant talked to, how many became leads, and which pages drove the most conversations. Use this to decide where to focus next.',
    highlight: 'The top stat cards give you the numbers at a glance.',
  },
  {
    id: 'channels',
    tab: 'channels',
    title: 'Add more channels',
    body: 'Connect your assistant to WhatsApp, Telegram, or trigger webhooks to Zapier and your CRM whenever a lead is captured or an appointment is booked.',
    highlight: 'Each integration has a simple on/off toggle and a field for your API key or webhook URL.',
  },
  {
    id: 'landing',
    tab: 'landing',
    title: 'Hosted landing pages',
    body: 'Every assistant gets a free hosted page at your domain — perfect for sharing on social media or in email campaigns. Customize the design, add your services, and publish in minutes.',
    highlight: 'Click "Edit Page" to open the landing page builder.',
  },
  {
    id: 'templates',
    tab: 'templates',
    title: 'Start with a template',
    body: 'Instead of configuring everything from scratch, pick an industry template (barbershop, dental clinic, gym, etc.) and your assistant will be pre-configured with relevant prompts and FAQs.',
    highlight: 'Browse by industry using the filter buttons at the top.',
  },
  {
    id: 'team',
    tab: 'team',
    title: 'Invite your team',
    body: 'Add team members and assign them roles: Admins can change settings, Members can view leads and conversations. Everyone gets their own login.',
    highlight: 'Click "Invite Team Member" to send an email invitation.',
  },
  {
    id: 'billing',
    tab: 'billing',
    title: 'Your plan',
    body: 'Your current plan, usage, and upgrade options are all here. Chat sessions reset monthly, and you can upgrade or cancel at any time.',
    highlight: 'The usage bar shows how many of your monthly sessions you have used.',
  },
  {
    id: 'security',
    tab: 'security',
    title: 'Keep your account secure',
    body: 'Enable two-factor authentication to prevent unauthorized access to your dashboard. It takes about 60 seconds to set up.',
    highlight: 'Click "Enable 2FA" and follow the instructions — you will need an authenticator app on your phone.',
  },
  {
    id: 'audit',
    tab: 'audit',
    title: 'Audit trail',
    body: 'Every action taken in your workspace is logged here — logins, settings changes, team invitations, and plan changes. Useful if you share access with others.',
    highlight: 'The log is sorted newest-first and can be filtered by action type.',
  },
  {
    id: 'deploy',
    tab: 'overview',
    title: 'Ready to go live?',
    body: 'Hit the "Deploy" button in the top bar to get your embed code. Paste one line of code into your website and your assistant is live. That is it — you are set up.',
    highlight: 'The blue "Deploy" button is always visible in the top right corner.',
  },
];
