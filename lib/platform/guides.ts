import { BILLING_PLANS, EXTRA_LANDING_PAGE_ADDON_PRICE } from '@/lib/billing/plans';
import { TRIAL_DAYS } from '@/lib/billing/trial';

/**
 * Everything the Crescelo assistant knows about the product, written out by hand: the how-to guides from the help center,
 * the dashboard, billing, support and what is and is not available. It is used in three places: as the knowledge the public
 * assistant retrieves from, as the offline answer when no AI provider is reachable, and as the manual the dashboard assistant
 * reads next to the signed-in user's account. Plan prices come from the plan table, so they cannot drift from the pricing page.
 *
 * Rule for editing: only write what the product does today. Two-way calendar sync, CRM sync and custom domains are NOT
 * available yet (see the roadmap) and the guides say so.
 */

export interface Guide {
  id: string;
  title: string;
  category: 'Getting started' | 'AI providers' | 'Knowledge' | 'Website' | 'Booking' | 'Leads' | 'Channels' | 'Team' | 'Billing' | 'Support' | 'Security' | 'Product';
  /** Words and phrases a visitor is likely to use; matching is done on these, the title and the text. */
  keywords: string[];
  /** Markdown-light: short paragraphs, numbered steps, **bold** for labels. */
  body: string;
  /** Pages on the website with more detail. */
  links?: { label: string; href: string }[];
}

const money = (n: number) => `$${n}`;

function plansText(): string {
  return BILLING_PLANS.map((p) => {
    const bots = p.botLimit === 'Unlimited' ? 'unlimited assistants' : `${p.botLimit} assistant${p.botLimit === 1 ? '' : 's'}`;
    const storage = p.knowledgeStorageLimitMb >= 1000 ? `${p.knowledgeStorageLimitMb / 1000} GB` : `${p.knowledgeStorageLimitMb} MB`;
    return `- **${p.name}**: ${money(p.monthlyPrice)}/month, or ${money(p.annualMonthlyPrice)}/month billed annually (${money(p.annualMonthlyPrice * 12)}/year). ${p.chatSessionsLimit.toLocaleString()} chat sessions a month ($${p.overageRate.toFixed(2)} per extra chat), ${bots}, ${storage} of knowledge storage.`;
  }).join('\n');
}

export const GUIDES: Guide[] = [
  {
    id: 'what-is-crescelo',
    title: 'What Crescelo is',
    category: 'Product',
    keywords: ['what is crescelo', 'what crescelo is', 'about', 'overview', 'what does it do', 'features', 'ai website assistant', 'who is it for', 'service business'],
    body: `Crescelo is an AI website assistant for service businesses (salons and barbershops, clinics, real estate, fitness studios, law and professional practices, agencies).\n\nYou add your own documents, services, prices and policies. The assistant then:\n- answers visitors **only from your content**, and says when it does not know, offering a booking form or a person instead of guessing;\n- **books appointments** in the chat with slot locking so two visitors cannot take the same time;\n- **captures leads** and sends them to email, webhooks, Slack or Google Sheets;\n- **hands the conversation to your team** in one click.\n\nYou bring your own AI provider key (OpenAI, Anthropic Claude, Google Gemini, Groq, DeepSeek or a self-hosted Ollama model), so Crescelo adds **no markup** on AI usage.`,
    links: [{ label: 'Product overview', href: '/product' }, { label: 'Roadmap and feature status', href: '/roadmap' }],
  },
  {
    id: 'quick-start',
    title: 'Get live in five steps',
    category: 'Getting started',
    keywords: ['get started', 'getting started', 'start', 'set up', 'setup', 'first steps', 'begin', 'onboarding', 'go live', 'quick start', 'new account'],
    body: `1. **Start your ${TRIAL_DAYS}-day free trial.** Create your account; a card is needed to start, and it is only charged when the trial ends.\n2. **Add knowledge.** Dashboard > **Knowledge Base**: upload documents, add your website address, or paste a YouTube link.\n3. **Connect your AI provider.** Dashboard > **AI Settings**: pick a provider and paste your API key (or keep the free engine to start).\n4. **Test it.** Dashboard > **Testing Studio**: ask the questions your customers ask and fix gaps.\n5. **Go live.** Copy the embed code from **Overview** ("Add to website") or the **Deploy** button in the top bar, and paste it before the closing body tag of your site.`,
    links: [{ label: 'Add it to WordPress', href: '/guides/add-ai-assistant-to-wordpress' }, { label: 'Help center', href: '/support' }],
  },
  {
    id: 'dashboard-map',
    title: 'Where things are in the dashboard',
    category: 'Getting started',
    keywords: ['dashboard', 'where', 'find', 'menu', 'sidebar', 'tabs', 'navigate', 'navigation', 'settings'],
    body: `The left menu is grouped like this:\n- **Get started**: Overview, Knowledge Base, Testing Studio.\n- **Grow and engage**: Leads, Appointments, Chat History, Analytics and KPIs.\n- **Customize and channels**: Widget and Styling (colours, welcome message, booking options), Channels and Integrations (Slack, Google Sheets, webhooks, WhatsApp, Telegram, email), Behavior and Rules.\n- **Settings and account**: AI Settings, Team, Plans and Billing, Security and 2FA, Audit Trail (owners), Support, My Profile, Guides and Docs.\n\nThe assistant picker at the top switches between your assistants.`,
  },
  {
    id: 'connect-openai',
    title: 'Connect OpenAI',
    category: 'AI providers',
    keywords: ['openai', 'gpt', 'gpt-4o', 'gpt-4o-mini', 'chatgpt', 'sk-proj', 'api key'],
    body: `1. Sign in at **platform.openai.com** (the API platform is separate from the ChatGPT app).\n2. Add a payment method and a small prepaid balance under **Settings > Billing** ($5 to $10 covers thousands of chats). Turning on auto-recharge avoids interruptions.\n3. Open **API Keys** > **Create new secret key**, name it, and copy it at once (it starts with sk-; OpenAI shows it only once).\n4. In Crescelo open **AI Settings**, choose **OpenAI**, paste the key, pick a model (gpt-4o-mini is fast and cheap; gpt-4o is stronger for complex answers) and click **Save AI Settings**.\n\nYour key is encrypted at rest. You pay OpenAI directly at their rates; Crescelo adds nothing.`,
    links: [{ label: 'OpenAI connector guide', href: '/support/ai-connectors/openai' }],
  },
  {
    id: 'connect-anthropic',
    title: 'Connect Anthropic Claude',
    category: 'AI providers',
    keywords: ['anthropic', 'claude', 'sonnet', 'haiku', 'sk-ant'],
    body: `1. Create an account in the **Anthropic Console** (console.anthropic.com). A Claude Pro subscription is separate from the developer API.\n2. Open **Plans and Billing**, add a payment method and a small credit balance.\n3. Open **API Keys** > **Create Key**, label it, and copy it immediately (it starts with sk-ant-).\n4. In Crescelo open **AI Settings**, choose **Anthropic Claude**, paste the key, choose a Claude model (Haiku is fast and low-cost, Sonnet gives deeper answers) and click **Save AI Settings**.`,
    links: [{ label: 'Anthropic connector guide', href: '/support/ai-connectors/anthropic' }],
  },
  {
    id: 'connect-gemini',
    title: 'Connect Google Gemini',
    category: 'AI providers',
    keywords: ['gemini', 'google ai', 'google gemini', 'aistudio', 'ai studio', 'free api key', 'aizasy'],
    body: `1. Open **Google AI Studio** (aistudio.google.com/app/apikey) and sign in with a Google account.\n2. Click **Create API key** (in a new project is fine) and copy the key (it starts with AIza).\n3. In Crescelo open **AI Settings**, choose **Google Gemini**, paste the key, select a Gemini Flash model and click **Save AI Settings**.\n\nGemini has a free tier with rate limits, and a very large context window.`,
    links: [{ label: 'Gemini connector guide', href: '/support/ai-connectors/gemini' }],
  },
  {
    id: 'connect-groq',
    title: 'Connect Groq Cloud',
    category: 'AI providers',
    keywords: ['groq', 'llama', 'lpu', 'gsk_', 'fast', 'free tier'],
    body: `1. Open **console.groq.com/keys** and sign in (Google or GitHub works).\n2. Click **Create API Key**, name it, and copy it (it starts with gsk_).\n3. In Crescelo open **AI Settings**, choose **Groq Cloud**, paste the key and click **Save AI Settings**. A Llama model is selected by default.\n\nGroq has a free tier and very fast responses.`,
    links: [{ label: 'Groq connector guide', href: '/support/ai-connectors/groq' }],
  },
  {
    id: 'connect-deepseek',
    title: 'Connect DeepSeek',
    category: 'AI providers',
    keywords: ['deepseek', 'deepseek-chat', 'deepseek-reasoner', 'cheap model'],
    body: `1. Create an account at **platform.deepseek.com** and top up a small prepaid balance.\n2. Open **API keys** > **Create API key** and copy it.\n3. In Crescelo open **AI Settings**, choose **DeepSeek**, paste the key, pick deepseek-chat (everyday conversations) or deepseek-reasoner (multi-step problems) and click **Save AI Settings**.`,
    links: [{ label: 'DeepSeek connector guide', href: '/support/ai-connectors/deepseek' }],
  },
  {
    id: 'connect-ollama',
    title: 'Run a local model with Ollama',
    category: 'AI providers',
    keywords: ['ollama', 'local model', 'offline', 'self-hosted', 'llama3', 'on my own server', 'private model', 'custom model', 'custom base url'],
    body: `1. Install **Ollama** from ollama.com and pull a model, for example \`ollama run llama3.2\`.\n2. Allow your dashboard to reach it by setting the **OLLAMA_ORIGINS** environment variable to * (macOS: \`launchctl setenv OLLAMA_ORIGINS "*"\`; Windows: add it in your account's environment variables; Linux: add it to the systemd service), then restart Ollama.\n3. In Crescelo open **AI Settings**, choose **Local Server (Ollama)**, keep the address http://localhost:11434 (or your server address), enter the model name and click **Save AI Settings**.\n\nAddresses on private networks are refused for security when the server runs in the cloud, so a hosted Crescelo needs a publicly reachable HTTPS address for a self-hosted model.`,
    links: [{ label: 'Ollama connector guide', href: '/support/ai-connectors/ollama' }],
  },
  {
    id: 'free-engine',
    title: 'The free engine (no key needed to start)',
    category: 'AI providers',
    keywords: ['free', 'auto free', 'zero cost', 'no api key', 'cascade', 'without a key', 'default engine'],
    body: `New assistants start on the **Zero-Cost Free Engine**. It tries free provider tiers in order (Groq, then Google Gemini, then a local Ollama if one is running), so you can test without adding a key. For a production site, add your own key in **AI Settings** to avoid free-tier rate limits.`,
    links: [{ label: 'Free engine guide', href: '/support/ai-connectors/auto-free' }],
  },
  {
    id: 'byok-no-markup',
    title: 'Bring your own key: no markup on AI',
    category: 'AI providers',
    keywords: ['byok', 'bring your own key', 'markup', 'token cost', 'zero markup', 'ai cost', 'pay provider', 'wholesale'],
    body: `Crescelo charges for the software, not for AI usage. You paste your own key, and your AI provider bills you directly at their normal rates. Crescelo adds **no markup and takes no share** of tokens. Your keys are stored encrypted.`,
    links: [{ label: 'AI connector guides', href: '/support/ai-connectors' }],
  },
  {
    id: 'knowledge-base',
    title: 'Teach the assistant your business (Knowledge Base)',
    category: 'Knowledge',
    keywords: ['knowledge base', 'upload', 'documents', 'pdf', 'word', 'csv', 'train', 'teach', 'website url', 'scrape', 'crawl', 'youtube', 'rag', 'sources', 'faq', 'price list', 'services'],
    body: `Open **Knowledge Base** and add sources:\n- **Upload files**: PDF and Word documents, CSV spreadsheets, text or Markdown (price sheets, policies, service descriptions, FAQs).\n- **Add a website address**: Crescelo fetches the page, strips menus and boilerplate and indexes the useful text.\n- **Paste a YouTube link**: the video's transcript becomes searchable knowledge.\n\nAnswers use a hybrid of meaning-based and keyword search, so a colloquial question ("how much does it set me back?") still finds your pricing. If nothing in your content answers a question, the assistant says it does not know and offers a booking or a person instead of inventing an answer.\n\nTips: keep one topic per document, use clear headings and put prices in a table or list. Storage limits depend on your plan.`,
    links: [{ label: 'Knowledge base guide', href: '/support/rag-knowledge' }],
  },
  {
    id: 'unanswered-questions',
    title: 'Fix gaps: unanswered questions',
    category: 'Knowledge',
    keywords: ['unanswered', 'gaps', 'does not know', "doesn't know", 'wrong answer', 'incorrect', 'correct', 'fix answer', 'knowledge gap', 'missing answer'],
    body: `Every question the assistant could not answer from your content is logged. Open the **Overview** (Knowledge gaps) or the unanswered list, write a one-sentence answer, and it is added to the knowledge base for good. For a wrong answer, open the source in **Knowledge Base** and use the correction option to fix the passage.`,
  },
  {
    id: 'testing-studio',
    title: 'Test before you go live (Testing Studio)',
    category: 'Getting started',
    keywords: ['test', 'testing studio', 'playground', 'preview', 'try it', 'check answers'],
    body: `Open **Testing Studio** to chat with your assistant exactly as a visitor would. Ask about prices, hours, booking and things it should refuse. Where an answer is missing or wrong, add or fix the knowledge, then ask again.`,
  },
  {
    id: 'embed-widget',
    title: 'Add the chat widget to your website',
    category: 'Website',
    keywords: ['embed', 'widget', 'install', 'script', 'add to website', 'add to my site', 'chat bubble', 'wordpress', 'shopify', 'webflow', 'wix', 'squarespace', 'html', 'deploy', 'code snippet', 'go live'],
    body: `1. Copy your one-line script from **Overview** ("Add to website") or the **Deploy** button in the top bar. It already contains your assistant ID and the right address:\n   \`<script src="https://www.crescelo.com/widget.js" data-assistant="YOUR_ASSISTANT_ID" defer></script>\`\n2. Paste it before the closing \`</body>\` tag (or into the site-wide footer scripts of your platform: WordPress, Shopify, Webflow, Wix, Squarespace, custom HTML).\n3. Clear any site cache and reload in a private window. The chat bubble appears in the corner within a second or two.\n\nChanges to knowledge, colours or behaviour apply at once; you never need to paste the code again.`,
    links: [{ label: 'WordPress step by step', href: '/guides/add-ai-assistant-to-wordpress' }],
  },
  {
    id: 'wordpress',
    title: 'Add it to WordPress',
    category: 'Website',
    keywords: ['wordpress', 'wpcode', 'elementor', 'plugin', 'insert headers and footers', 'cache', 'wp'],
    body: `1. Copy the embed code (Overview > "Add to website").\n2. **Recommended:** install a snippet plugin such as WPCode or Insert Headers and Footers, create an HTML snippet, paste the script and set it to **Site Wide Footer**.\n3. **One page only:** in Elementor drag an **HTML** widget onto the page and paste the script (the text editor and classic block editor strip script tags).\n4. Purge caching plugins and host caches (SiteGround, WP Rocket, Cloudflare), then reload in a private window.\n5. Check: view the page source (Ctrl+U) and search for "widget.js".\n\n**Troubleshooting:** nothing in the source means the snippet was stripped or not published; "widget.js" present but no bubble usually means a security plugin or Content Security Policy blocks other domains; a localhost or vercel.app address only works on your own computer, so use the code from the dashboard on the live site; if it shows but replies fail, check an AI provider key is saved and the site uses HTTPS.`,
    links: [{ label: 'WordPress guide', href: '/guides/add-ai-assistant-to-wordpress' }],
  },
  {
    id: 'widget-styling',
    title: 'Change how the widget looks and what it says',
    category: 'Website',
    keywords: ['colour', 'color', 'brand', 'avatar', 'welcome message', 'starter questions', 'position', 'styling', 'appearance', 'name', 'branding', 'white label'],
    body: `Open **Widget and Styling**: set the assistant name, brand colour, position, welcome message and suggested starter questions, then click **Save Widget Settings**. Use **Behavior and Rules** for how it should answer (tone, what to refuse, when to offer a person) and the lead form fields it asks for.`,
  },
  {
    id: 'booking',
    title: 'Set up appointment booking',
    category: 'Booking',
    keywords: ['booking', 'appointments', 'book', 'schedule', 'slots', 'availability', 'opening hours', 'calendar', 'double booking', 'calendly', 'cal.com', 'slot duration'],
    body: `Open **Widget and Styling** and turn on booking. Choose how visitors book:\n- **Direct date picker**: the built-in slot picker (set your opening hours and the slot length, for example 30 minutes);\n- **Calendly** or **Cal.com**: send visitors to your existing booking link.\n\nWith the built-in picker, availability comes from your hours minus existing appointments, and each slot is **locked while it is being booked**, so two visitors cannot get the same time. If a slot is just taken, the visitor is offered the next one.\n\nBookings appear under **Appointments**, and you are notified by email and in the dashboard.`,
    links: [{ label: 'Calendar booking guide', href: '/support/calendar-booking' }],
  },
  {
    id: 'calendar-feed',
    title: 'See bookings in Google, Apple or Outlook Calendar',
    category: 'Booking',
    keywords: ['google calendar', 'outlook', 'apple calendar', 'ical', 'ics', 'calendar feed', 'subscribe', 'sync', 'two-way', 'add to calendar', 'calendar sync'],
    body: `Every booking is added to your private **calendar feed**. In **Appointments** copy the feed address and subscribe to it in Google Calendar (Other calendars > From URL), Outlook or Apple Calendar. The feed is **read-only**: bookings show up in your calendar, but events you create there do not block Crescelo slots.\n\n**Two-way sync with Google Calendar or Outlook is not available yet**; it is on the roadmap. After a booking, visitors get "Add to Google Calendar, Apple Calendar or iCal" options in the chat.`,
    links: [{ label: 'Roadmap', href: '/roadmap' }, { label: 'Calendar booking guide', href: '/support/calendar-booking' }],
  },
  {
    id: 'reschedule-cancel',
    title: 'Reschedule, cancel and reminders',
    category: 'Booking',
    keywords: ['reschedule', 'cancel appointment', 'cancellation', 'reminder', 'confirmation email', 'manage link', 'no show'],
    body: `Each confirmation email contains a private link. Clients can **reschedule or cancel** themselves, and the freed slot becomes available again immediately. Reminders are sent before the appointment, and you can change or cancel any booking from **Appointments**.`,
  },
  {
    id: 'leads',
    title: 'Capture and receive leads',
    category: 'Leads',
    keywords: ['leads', 'lead capture', 'lead form', 'email alerts', 'notifications', 'contact details', 'inquiries', 'enquiries', 'export leads'],
    body: `The assistant asks for contact details when it makes sense (you choose the fields in **Behavior and Rules**). Every lead appears under **Leads** and triggers an email alert. You can also send each lead automatically to **Slack**, **Google Sheets** or a **webhook** (Zapier, Make or your own system) from **Channels and Integrations**.`,
  },
  {
    id: 'slack',
    title: 'Send leads to Slack',
    category: 'Leads',
    keywords: ['slack', 'slack webhook', 'incoming webhook', 'notify team'],
    body: `1. Go to **api.slack.com/apps** > **Create New App** > From scratch, name it and pick your workspace.\n2. Choose **Incoming Webhooks** (ignore OAuth and scopes), switch it **On**, click **Add New Webhook to Workspace**, pick a channel and allow.\n3. Copy the webhook address (https://hooks.slack.com/services/...).\n4. In Crescelo open **Channels and Integrations > Slack**, paste it and click **Send Live Test Ping**, then save.`,
  },
  {
    id: 'google-sheets',
    title: 'Send leads to Google Sheets',
    category: 'Leads',
    keywords: ['google sheets', 'spreadsheet', 'sheet', 'rows', 'apps script'],
    body: `Create a Google Sheets webhook receiver (an Apps Script web app that appends a row), copy its address, then open **Channels and Integrations > Google Sheets**, paste the address and send the test. Tick the events you want (**lead.created** adds a row for each new lead, **appointment.created** adds a row with the booking date, time and service) and save.`,
  },
  {
    id: 'webhooks',
    title: 'Webhooks, Zapier and Make',
    category: 'Leads',
    keywords: ['webhook', 'zapier', 'make', 'integromat', 'crm', 'automation', 'api', 'signed webhook', 'signature', 'hubspot', 'salesforce'],
    body: `In **Channels and Integrations > Webhooks** add your address (a Zapier or Make catch-hook, or your own endpoint) and a secret. Events such as new leads and bookings are sent as signed requests so your system can verify they came from Crescelo. Addresses on private networks are refused.\n\nNative two-way sync with HubSpot, Salesforce and Pipedrive is **planned, not available yet**; use a webhook through Zapier or Make in the meantime.`,
    links: [{ label: 'Integrations', href: '/integrations' }],
  },
  {
    id: 'email-smtp',
    title: 'Email notifications and sending address',
    category: 'Leads',
    keywords: ['email', 'smtp', 'notification email', 'sender', 'confirmation', 'from address', 'resend'],
    body: `Booking confirmations, reminders and lead alerts are sent by email. Notification settings are in **Channels and Integrations**; the platform owner can configure the sending service (SMTP or Resend).`,
  },
  {
    id: 'whatsapp',
    title: 'Connect WhatsApp',
    category: 'Channels',
    keywords: ['whatsapp', 'whatsapp business', 'meta', 'cloud api', 'phone number id', 'whatsapp bot'],
    body: `WhatsApp uses Meta's **WhatsApp Cloud API**, so you set up the account yourself:\n1. Create a Meta developer app with WhatsApp and get a **phone number ID** and a permanent **access token**.\n2. In Crescelo open **Channels and Integrations > WhatsApp** and enter them plus a verify token.\n3. In the Meta app set the webhook address shown in Crescelo and the same verify token, and subscribe to messages.\n\nWhatsApp is included on the **Agency / Scale** plan.`,
    links: [{ label: 'Integrations', href: '/integrations' }],
  },
  {
    id: 'telegram',
    title: 'Connect a Telegram bot',
    category: 'Channels',
    keywords: ['telegram', 'botfather', 'telegram bot', 'bot token'],
    body: `1. In Telegram message **@BotFather**, send /newbot, choose a name and copy the **bot token**.\n2. In Crescelo open **Channels and Integrations > Telegram**, paste the token, verify it, and enable the bot.\n3. Click the button to **set the webhook** automatically. Messages to your bot are now answered by your assistant.\n\nTelegram is included on the **Agency / Scale** plan.`,
  },
  {
    id: 'phone-voice',
    title: 'Phone calls (coming soon)',
    category: 'Channels',
    keywords: ['phone', 'voice', 'calls', 'telnyx', 'twilio', 'phone number', 'voice worker', 'inbound calls', 'texml', 'speech', 'voice call'],
    body: `**Answering phone calls is under development and is not available yet.** It is on the roadmap: a phone assistant that answers from your knowledge base and books appointments by voice. There is nothing to set up for it today.\n\nWhat works now: the website chat widget, **WhatsApp** and **Telegram**, all answering from the same knowledge and booking appointments.`,
    links: [{ label: 'Roadmap', href: '/roadmap' }],
  },
  {
    id: 'human-handover',
    title: 'Take over a conversation (human handover)',
    category: 'Channels',
    keywords: ['human', 'takeover', 'take over', 'live agent', 'handover', 'handoff', 'live chat', 'escalate', 'talk to a person', 'agent'],
    body: `Open **Chat History** and choose a live conversation, then take over and reply as yourself; the visitor sees your messages in the same chat. You are notified when a visitor asks for a person, and the assistant offers a person whenever it cannot answer. Give the conversation back or close it when you are done.`,
  },
  {
    id: 'analytics',
    title: 'Analytics, chat history and reports',
    category: 'Product',
    keywords: ['analytics', 'kpi', 'reports', 'statistics', 'stats', 'chat history', 'conversations', 'transcripts', 'funnel', 'insights'],
    body: `**Analytics and KPIs** shows conversations, leads, bookings, top questions and widget engagement over time. **Chat History** holds every conversation transcript. Use unanswered questions as a to-do list for new knowledge.`,
  },
  {
    id: 'team-roles',
    title: 'Invite your team and roles',
    category: 'Team',
    keywords: ['team', 'invite', 'add user', 'add member', 'roles', 'permissions', 'owner', 'admin', 'billing manager', 'support agent', 'viewer', 'seats'],
    body: `Open **Team** > add a member with their name, email and role. Roles: **owner** and **admin** manage everything; **billing manager** handles plans and invoices; **support agent** works with conversations and leads; **viewer** can look but not change. A new member receives a temporary password to change at first sign-in. Owners can change roles or remove members at any time, and removed members lose access immediately.`,
  },
  {
    id: 'two-factor',
    title: 'Two-factor sign-in and account security',
    category: 'Security',
    keywords: ['2fa', 'two factor', 'two-factor', 'authenticator', 'google authenticator', 'recovery code', 'security', 'sign out everywhere', 'password', 'change password', 'hacked', 'secure my account'],
    body: `Open **Security and 2FA** > start setup, scan the QR code with an authenticator app (Google Authenticator, Authy, 1Password), enter the 6-digit code and **save the recovery codes**. From then on sign-in (including Google sign-in) asks for a code. To turn it off you must enter a current code.\n\n**Sign out everywhere** ends every session on every device. Changing your password or your 2FA does the same for your other sessions. Change your password in **My Profile**.`,
  },
  {
    id: 'security-privacy',
    title: 'How your data is protected',
    category: 'Security',
    keywords: ['privacy', 'gdpr', 'data', 'encryption', 'encrypted', 'safe', 'data protection', 'delete my data', 'retention', 'dpa', 'sub-processors', 'compliance', 'certification'],
    body: `Passwords are stored as salted hashes; AI provider keys are encrypted with AES-256-GCM; workspaces are isolated from each other; sign-in and public endpoints are rate limited. **No compliance certifications are claimed.** You can delete leads, appointments and knowledge sources from the dashboard, and ask for everything to be deleted by opening a support ticket. Legal documents: privacy policy, terms, cookie policy, acceptable use, data processing addendum and sub-processors are linked in the site footer.`,
    links: [{ label: 'Privacy policy', href: '/privacy' }, { label: 'Data processing addendum', href: '/dpa' }, { label: 'Sub-processors', href: '/subprocessors' }],
  },
  {
    id: 'plans-pricing',
    title: 'Plans and prices',
    category: 'Billing',
    keywords: ['price', 'pricing', 'plans', 'plan', 'cost', 'how much', 'starter', 'growth', 'scale', 'agency', 'annual', 'monthly', 'discount', 'compare plans'],
    body: `${plansText()}\n\nAnnual billing saves about 20%. An extra landing page slot is a one-time ${money(EXTRA_LANDING_PAGE_ADDON_PRICE)} add-on. Chats beyond your monthly allowance are billed at your plan's per-chat rate; the assistant never cuts a visitor off mid-conversation. AI usage is billed by your own AI provider.`,
    links: [{ label: 'Pricing', href: '/pricing' }],
  },
  {
    id: 'free-trial',
    title: `The ${TRIAL_DAYS}-day free trial`,
    category: 'Billing',
    keywords: ['trial', 'free trial', 'free', 'card', 'credit card', 'charged', 'trial ends', 'cancel trial', 'no card'],
    body: `Every new account gets a **${TRIAL_DAYS}-day free trial of all Growth features**. A **card is required to start**; nothing is charged during the trial. When the trial ends the card is **charged automatically** for the plan you chose, and you can **cancel any time before that to pay nothing**. There is no permanent free plan. One trial is allowed per card.`,
    links: [{ label: 'Pricing', href: '/pricing' }],
  },
  {
    id: 'change-plan',
    title: 'Upgrade, downgrade or switch billing period',
    category: 'Billing',
    keywords: ['upgrade', 'downgrade', 'change plan', 'switch plan', 'switch to', 'move to', 'cheaper plan', 'bigger plan', 'annual billing', 'monthly billing'],
    body: `Open **Plans and Billing**, choose the plan and billing period (monthly or annual) and confirm. If you already subscribe, your existing subscription is moved to the new plan (no second subscription is created); during the trial nothing extra is charged, and after it the change is prorated. You can also ask the dashboard assistant, which asks you to confirm before changing anything.`,
  },
  {
    id: 'cancel-invoices',
    title: 'Cancel, update card, invoices and receipts',
    category: 'Billing',
    keywords: ['cancel', 'cancel subscription', 'unsubscribe', 'stop billing', 'update card', 'change card', 'payment method', 'invoice', 'invoices', 'receipt', 'refund', 'billing email', 'manage subscription'],
    body: `In **Plans and Billing** click **Manage subscription** to open the secure Stripe billing portal: cancel (you keep access until the period ends), replace your card, and download invoices. A receipt is emailed for every payment. Cards are only ever entered on Stripe's own pages, never in Crescelo. For a refund question, open a support ticket.`,
  },
  {
    id: 'usage-limits',
    title: 'Chat limits and usage',
    category: 'Billing',
    keywords: ['usage', 'limit', 'chat sessions', 'quota', 'overage', 'used', 'remaining', 'how many chats', 'out of chats', 'storage'],
    body: `**Plans and Billing** shows chats used this period, chats remaining, any overage cost and knowledge storage used. A chat session is one visitor conversation. Beyond the included number, extra chats are billed at your plan's rate; upgrade if you regularly go over.`,
  },
  {
    id: 'support-tickets',
    title: 'Contact support: tickets',
    category: 'Support',
    keywords: ['support', 'contact', 'help', 'ticket', 'talk to someone', 'email', 'phone number', 'report a problem', 'bug', 'complaint', 'refund', 'human support'],
    body: `There is no public support mailbox. Everything goes through **support tickets**:\n- From the website use the **Contact** form (crescelo.com/support/contact); you receive a confirmation email with a private link to follow and answer the ticket.\n- From the dashboard open **Support** > **New ticket** to see all your workspace's tickets and replies.\nWe reply by email with a link back to the ticket; you can add messages or close it. Resolved tickets that get no reply for 7 days close automatically.`,
    links: [{ label: 'Open a support ticket', href: '/support/contact' }, { label: 'Check a ticket', href: '/support/ticket' }],
  },
  {
    id: 'not-available',
    title: 'What is not available yet',
    category: 'Product',
    keywords: ['roadmap', 'not available', 'coming soon', 'planned', 'missing', 'feature request', 'two-way calendar', 'custom domain', 'crm sync', 'hubspot', 'salesforce', 'roadmap status'],
    body: `Available today: the assistant with your knowledge, in-chat booking with slot locking, your own AI provider, embeddable widget and hosted page, leads to email/webhooks/Slack/Google Sheets, live handover, WhatsApp and Telegram (with your own accounts).\n\n**In development:** phone voice calls (an inbound phone assistant), two-way Google Calendar and Outlook sync, custom domains for hosted pages, more messaging channels.\n**Planned:** native HubSpot, Salesforce and Pipedrive sync, expanded agency workspaces, image and menu intake.\n\nDates are goals, not commitments.`,
    links: [{ label: 'Roadmap', href: '/roadmap' }],
  },
  {
    id: 'hosted-page',
    title: 'Hosted business page and templates',
    category: 'Website',
    keywords: ['landing page', 'hosted page', 'business page', 'template', 'templates', 'industry template', 'archetype', 'site', 'domain'],
    body: `Crescelo can host a business page with your assistant on it, and industry starter templates (barbershop, clinic, real estate, fitness, legal and others) pre-fill prompts, services and questions. Landing page studio in the dashboard is in beta polish; custom domain mapping is in development.`,
    links: [{ label: 'Solutions by industry', href: '/use-case' }],
  },
];

export const GUIDE_INDEX = new Map(GUIDES.map((g) => [g.id, g]));
