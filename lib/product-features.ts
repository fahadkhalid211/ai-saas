/**
 * The product feature pages (/product/<slug>), one entry each. Written to match what the product does today; where something
 * is not available yet (instant two-way calendar sync, CRM sync, phone calls) the page says so in `notice`.
 */

export interface FeatureStep {
  title: string;
  body: string;
}
export interface FeatureFaq {
  q: string;
  a: string;
}
export interface ProductFeature {
  slug: string;
  name: string;
  eyebrow: string;
  /** The page's H1. */
  title: string;
  intro: string;
  seoTitle: string;
  seoDescription: string;
  /** A short sample chat, shown beside the hero. */
  chat: { visitor: string; assistant: string; footnote?: string };
  benefits: FeatureStep[];
  steps: FeatureStep[];
  /** What you control, as short bullets. */
  controls: string[];
  /** An honest limit or "coming soon" note. */
  notice?: string;
  faq: FeatureFaq[];
  related: string[];
  guides: { label: string; href: string }[];
}

export const PRODUCT_FEATURES: ProductFeature[] = [
  {
    slug: 'ai-assistant',
    name: 'AI website assistant',
    eyebrow: 'The assistant',
    title: 'An assistant that answers from your own business, not from guesswork.',
    intro: 'Crescelo reads your services, prices and policies, then talks to visitors on your website around the clock. It answers from what you wrote, says so when it does not know, and passes the conversation to your team when a person is needed.',
    seoTitle: 'AI Website Assistant for Service Businesses',
    seoDescription: 'An AI website assistant that answers visitor questions from your own documents, books appointments and hands over to your team. Try it free for 14 days.',
    chat: { visitor: 'Do you do beard trims on Saturdays, and how much?', assistant: 'Yes, Saturdays 10 to 4. A beard trim is $15, or $45 with a haircut. Want me to find you a slot?', footnote: 'Answered from the price list you uploaded.' },
    benefits: [
      { title: 'Answers from your content', body: 'Every answer comes from the documents, pages and notes you add. It does not browse the internet to fill gaps in your business.' },
      { title: 'Honest when it does not know', body: 'If your content does not answer a question, the assistant says so and offers a booking form or a person. The gap is logged so you can fill it.' },
      { title: 'Works on any website', body: 'One script tag adds the chat bubble to WordPress, Shopify, Webflow, Wix, Squarespace or plain HTML. Changes apply without touching your site again.' },
      { title: 'Your AI provider, no markup', body: 'Connect OpenAI, Anthropic Claude, Google Gemini, Groq, DeepSeek or a self-hosted model with your own key. Crescelo adds nothing on top of what your provider charges.' },
      { title: 'Tone and rules you set', body: 'Choose how it speaks, what it should never discuss and when it should offer a person, in Behavior and Rules.' },
      { title: 'Test before visitors see it', body: 'The Testing Studio lets you chat as a visitor would, so you can fix gaps before going live.' },
    ],
    steps: [
      { title: 'Add your content', body: 'Upload documents, add your website address or a video or audio file in the Knowledge Base.' },
      { title: 'Connect your AI provider', body: 'Paste a key in AI Settings, or start on the free engine while you test.' },
      { title: 'Test it', body: 'Ask the questions your customers ask in the Testing Studio and fix anything missing.' },
      { title: 'Go live', body: 'Copy the one-line script from Overview and paste it into your site.' },
    ],
    controls: ['Name, colours, position and welcome message', 'Suggested starter questions', 'Tone, topics to avoid and when to offer a person', 'Which AI provider and model answers', 'Which fields the lead form asks for'],
    notice: 'AI can still get things wrong. Review your conversations and fill the gaps the assistant reports; the widget tells visitors they are talking to an AI.',
    faq: [
      { q: 'Will it make things up?', a: 'It is designed to answer only from your content and to say when it does not know. No AI is perfect, so check the conversation history and add missing answers over time.' },
      { q: 'Do I need technical skills?', a: 'No. Adding content, choosing a provider and pasting one script are point-and-click steps, and there is a guide for each.' },
      { q: 'Can it speak to visitors in other languages?', a: 'It replies in the language a visitor writes in, based on what your AI provider supports. Your knowledge should be written in the languages you want it to answer well.' },
      { q: 'What does it cost?', a: 'Plans start with a 14-day free trial (a card is required, charged when the trial ends unless you cancel). AI usage is billed by your own provider.' },
    ],
    related: ['knowledge-base', 'website-widget', 'human-handover'],
    guides: [{ label: 'Add it to WordPress', href: '/guides/add-ai-assistant-to-wordpress' }, { label: 'Connect an AI provider', href: '/support/ai-connectors' }],
  },
  {
    slug: 'appointment-booking',
    name: 'Appointment booking',
    eyebrow: 'The assistant',
    title: 'Book real appointments in the chat, checked against your calendar.',
    intro: 'When a visitor is ready, the assistant offers real available times and checks the one they pick against your existing bookings and calendars before it confirms by email. Your team sees every booking in the dashboard and in a calendar feed.',
    seoTitle: 'Online Appointment Booking in Chat',
    seoDescription: 'Let visitors book appointments inside the chat. Live slots checked against your bookings and calendars, confirmation emails and self-service reschedule links.',
    chat: { visitor: 'Can I get a fade and beard trim tomorrow around 3?', assistant: '3:15 PM tomorrow is open. Shall I book it for you?', footnote: 'The time is checked again at the moment of confirming.' },
    benefits: [
      { title: 'Live availability', body: 'Available times are calculated from your opening hours and slot length, minus what is already booked and any busy time in the Google, Apple or Outlook calendars you link.' },
      { title: 'Checked before confirming', body: 'Every booking is checked against your existing bookings and linked calendars, including overlapping times, before it is confirmed. If a time is just gone, the visitor is offered the next slot.' },
      { title: 'Confirmations and reminders', body: 'Visitors get a confirmation email with a private link to reschedule or cancel, and reminders before the appointment. You are notified by email and in the dashboard.' },
      { title: 'Add to their calendar', body: 'After booking, visitors can add the appointment to Google Calendar, Apple Calendar or any iCal app.' },
      { title: 'Your calendar feed', body: 'Every booking appears in a private feed you subscribe to from Google, Apple or Outlook Calendar. A separate busy-only link shows booked times without guest details.' },
      { title: 'Or use your existing tool', body: 'Prefer Calendly or Cal.com? Send visitors to your booking link instead of the built-in picker.' },
    ],
    steps: [
      { title: 'Turn on booking', body: 'In Add to My Website choose the built-in date picker, Calendly or Cal.com.' },
      { title: 'Set hours and slot length', body: 'Tell the picker when you are open and how long an appointment takes. Optionally link your own calendar so its busy times are blocked.' },
      { title: 'Let visitors book', body: 'The assistant offers times in the chat when someone wants to book.' },
      { title: 'Manage bookings', body: 'See, confirm or cancel appointments under Appointments, and subscribe to the feed.' },
    ],
    controls: ['Opening hours and slot length', 'Built-in picker, Calendly or Cal.com', 'Calendar links that block busy times', 'Confirmation and reminder emails', 'Cancelling or rescheduling any booking'],
    notice: 'Calendar links are read-only: Crescelo reads them to block busy times and refreshes them right before confirming a booking, but never changes your calendar. Google, Apple and Outlook refresh the Crescelo links you subscribe to slowly, so a new booking may show there late. Instant two-way sync is not available yet.',
    faq: [
      { q: 'Can two people book the same time?', a: 'No. Crescelo checks every booking against your existing bookings and calendars before confirming it, and a taken time is no longer offered.' },
      { q: 'Does it sync both ways with Google Calendar?', a: 'Partly. Crescelo reads your calendar link to block busy times, and your bookings reach your calendar through a feed you subscribe to. It does not yet write bookings into Google or Apple events as they happen; that is planned.' },
      { q: 'Can clients cancel or reschedule themselves?', a: 'Yes. Each confirmation email has a private link for that.' },
      { q: 'Can I keep using Calendly?', a: 'Yes. Choose Calendly or Cal.com as the booking option and the assistant sends visitors to your link.' },
    ],
    related: ['ai-assistant', 'lead-capture', 'human-handover'],
    guides: [{ label: 'Calendar booking guide', href: '/support/calendar-booking' }, { label: 'Roadmap', href: '/roadmap' }],
  },
  {
    slug: 'lead-capture',
    name: 'Lead capture',
    eyebrow: 'The assistant',
    title: 'Turn conversations into leads your team can act on.',
    intro: 'The assistant asks for contact details at the right moment, saves every lead with the conversation it came from, and sends it wherever your team works: email, Slack, Google Sheets or your own systems.',
    seoTitle: 'Chatbot Lead Capture for Service Businesses',
    seoDescription: 'Capture leads in the chat and send them to email, Slack, Google Sheets or webhooks. Every lead links back to the conversation it came from.',
    chat: { visitor: 'I would like a quote for a full bathroom refit.', assistant: 'Happy to arrange one. What is your name, best phone number and email?', footnote: 'Leads land in your dashboard and in your channels at once.' },
    benefits: [
      { title: 'Asks at the right time', body: 'Contact details are requested when a visitor shows intent or when the assistant cannot answer, not as a wall in front of the chat.' },
      { title: 'Fields you choose', body: 'Add the questions you need, such as service, budget or preferred time, and mark which are required.' },
      { title: 'Delivered where you work', body: 'Each new lead triggers an email alert and can be posted to Slack, added as a row in Google Sheets or sent to a webhook.' },
      { title: 'Signed webhooks for automation', body: 'Send leads to Zapier, Make, n8n or your own endpoint. Requests are signed so your system can verify they came from Crescelo.' },
      { title: 'Linked to the conversation', body: 'Open a lead and read the chat that produced it, so the follow-up starts with context.' },
      { title: 'Protected from junk', body: 'Submissions are validated and rate limited, and invalid emails or phone numbers are rejected.' },
    ],
    steps: [
      { title: 'Choose your fields', body: 'In Behavior and Rules set which details the assistant collects.' },
      { title: 'Connect your channels', body: 'In Channels and Integrations add Slack, Google Sheets or a webhook, and use the test button.' },
      { title: 'Watch leads arrive', body: 'Each lead appears under Leads with an email alert to your team.' },
      { title: 'Follow up', body: 'Read the conversation, contact the visitor and remove leads you no longer need.' },
    ],
    controls: ['Lead form fields and which are required', 'Email alerts', 'Slack channel, Google Sheet or webhook destination', 'Which events are sent (new lead, new booking)'],
    notice: 'Native two-way sync with HubSpot, Salesforce and Pipedrive is planned, not available yet. Use a webhook through Zapier or Make in the meantime.',
    faq: [
      { q: 'Where do leads go?', a: 'Into the Leads section of your dashboard, by email, and to any of Slack, Google Sheets or a webhook you connect.' },
      { q: 'Can I connect my CRM?', a: 'Through a webhook with Zapier or Make today. Native CRM sync is planned.' },
      { q: 'Can visitors submit fake data?', a: 'Basic validation and rate limits reject junk, but like any form it cannot prove that details are genuine.' },
    ],
    related: ['appointment-booking', 'messaging-channels', 'human-handover'],
    guides: [{ label: 'Integrations', href: '/integrations' }, { label: 'Roadmap', href: '/roadmap' }],
  },
  {
    slug: 'knowledge-base',
    name: 'Knowledge base',
    eyebrow: 'The assistant',
    title: 'Teach it your business in minutes, and keep improving it.',
    intro: 'Add the documents, pages and videos that describe your business. Crescelo indexes them so the assistant can find the right passage for every question, and it shows you what it could not answer so you can close the gap.',
    seoTitle: 'Knowledge Base for Your AI Assistant',
    seoDescription: 'Upload documents, add website pages and video or audio files so your AI assistant answers accurately. See unanswered questions and fix gaps.',
    chat: { visitor: 'How much does it set me back for a full colour?', assistant: 'Full colour starts at $95, depending on hair length. Toner is $25 extra.', footnote: 'Found in the price sheet, even though the visitor used different words.' },
    benefits: [
      { title: 'Many kinds of sources', body: 'PDF and Word documents, CSV spreadsheets, text and Markdown files, website addresses, and video or audio files.' },
      { title: 'Finds meaning, not just words', body: 'Search combines meaning-based and keyword matching, so casual wording still finds your pricing or policy.' },
      { title: 'A list of what is missing', body: 'Every question it could not answer is logged. Write a one-line answer and it is added for good.' },
      { title: 'Fix wrong answers at the source', body: 'Open a source, correct the passage and the assistant uses the fix straight away.' },
      { title: 'Test as you go', body: 'Ask a question in the Testing Studio right after adding a source to see if it is picked up.' },
      { title: 'Storage that fits your plan', body: 'Each plan includes an amount of knowledge storage, shown in Plans and Billing.' },
    ],
    steps: [
      { title: 'Add sources', body: 'Open Knowledge Base and upload files (documents, video or audio), or add a website address.' },
      { title: 'Check indexing', body: 'Each source shows when it has finished processing.' },
      { title: 'Ask it questions', body: 'Use the Testing Studio to see what it answers and which source it used.' },
      { title: 'Close the gaps', body: 'Review unanswered questions and add the answers.' },
    ],
    controls: ['Which sources the assistant uses', 'Corrections to any passage', 'Answers to unanswered questions', 'Deleting sources you no longer want'],
    notice: 'Write prices and policies clearly, one topic per document, ideally in a list or table. The assistant is only as good as the content it is given.',
    faq: [
      { q: 'What file types can I upload?', a: 'PDF and Word documents, CSV spreadsheets, and text or Markdown files. You can also add website addresses, and video or audio files.' },
      { q: 'How often does a website source update?', a: 'A website address is read when you add it. Add it again after big changes to refresh the content.' },
      { q: 'Is my content used to train AI models?', a: 'Your content is stored for your assistant and sent to the AI provider you choose only as needed to answer a question, under that provider’s terms.' },
    ],
    related: ['ai-assistant', 'website-widget', 'lead-capture'],
    guides: [{ label: 'Knowledge base guide', href: '/support/rag-knowledge' }],
  },
  {
    slug: 'website-widget',
    name: 'Website chat widget',
    eyebrow: 'Where it works',
    title: 'One line of code puts your assistant on any website.',
    intro: 'Paste a single script tag and a chat bubble appears in the corner of your site. Change its look, wording and behaviour from the dashboard, and the change is live without editing your site again.',
    seoTitle: 'Website Chat Widget: Install in One Line',
    seoDescription: 'Add an AI chat widget to WordPress, Shopify, Webflow, Wix or any website with one script tag. Match your brand and go live in minutes.',
    chat: { visitor: 'Hi, are you open on Sunday?', assistant: 'We are closed on Sundays. I can book you for Monday from 9 AM.', footnote: 'Appears as a chat bubble on your site.' },
    benefits: [
      { title: 'One script tag', body: 'Works on WordPress, Shopify, Webflow, Wix, Squarespace and plain HTML. The code already contains your assistant ID.' },
      { title: 'Matches your brand', body: 'Set the name, colours, position, welcome message and suggested questions.' },
      { title: 'Works on phones', body: 'The chat adapts to small screens and can be expanded for longer conversations.' },
      { title: 'Clear that it is an AI', body: 'The widget tells visitors they are talking to an AI assistant, and offers a person when you have set that up.' },
      { title: 'Update without redeploying', body: 'Knowledge, styling and behaviour changes apply at once.' },
      { title: 'A hosted page if you have no site', body: 'Crescelo can host a business page with your assistant on it (in beta polish).' },
    ],
    steps: [
      { title: 'Copy the script', body: 'From Overview choose Add to website, or use the Deploy button in the top bar.' },
      { title: 'Paste it in your site', body: 'Put it before the closing body tag, or in your platform’s site-wide footer scripts.' },
      { title: 'Clear the cache', body: 'Purge caching plugins or your host’s cache and reload in a private window.' },
      { title: 'Check it', body: 'View the page source and search for widget.js; the bubble appears within a second or two.' },
    ],
    controls: ['Name, colours and position', 'Welcome message and starter questions', 'Booking option shown in the chat', 'Live handover on or off'],
    faq: [
      { q: 'Will it slow my site down?', a: 'The script is loaded with defer, so it does not hold up your page from rendering.' },
      { q: 'It does not show on my site. What now?', a: 'Check widget.js appears in the page source, clear your caches, and make sure a security plugin is not blocking other domains. The WordPress guide lists every check.' },
      { q: 'Can I use it on several sites?', a: 'Yes. Use the same script on each site, or create a separate assistant for each business.' },
    ],
    related: ['ai-assistant', 'messaging-channels', 'knowledge-base'],
    guides: [{ label: 'WordPress step by step', href: '/guides/add-ai-assistant-to-wordpress' }],
  },
  {
    slug: 'human-handover',
    name: 'Human handover',
    eyebrow: 'Where it works',
    title: 'Step into any conversation when a person is needed.',
    intro: 'The assistant handles the routine. When a visitor asks for a person, or the question is beyond it, your team is notified and can take over the same chat in one click.',
    seoTitle: 'Live Chat Handover from AI to Your Team',
    seoDescription: 'Take over any AI chat in one click. Get notified when a visitor needs a person, reply in the same conversation and hand it back.',
    chat: { visitor: 'I would like to talk to someone about a refund.', assistant: 'Of course. I have notified the team and someone will join this chat shortly.', footnote: 'Your team is alerted by email and in the dashboard.' },
    benefits: [
      { title: 'One-click takeover', body: 'Open the conversation in Chat History and reply as yourself. The visitor sees your messages in the same chat.' },
      { title: 'Alerts when it matters', body: 'You are notified when a visitor asks for a person or when the assistant hands the conversation over.' },
      { title: 'Full context', body: 'You see the whole conversation so far, so nobody repeats themselves.' },
      { title: 'Hand it back', body: 'When you are done, give the conversation back to the assistant or close it.' },
      { title: 'The assistant offers a person', body: 'When it cannot answer, it offers a booking form or a person instead of guessing.' },
      { title: 'Roles for your team', body: 'Give support agents access to conversations and leads without giving them billing or settings.' },
    ],
    steps: [
      { title: 'Visitor asks for a person', body: 'Or the assistant decides it cannot help.' },
      { title: 'Your team is notified', body: 'By email and in the dashboard.' },
      { title: 'Take over', body: 'Open the conversation in Chat History and reply.' },
      { title: 'Hand back or close', body: 'Return the chat to the assistant or end it.' },
    ],
    controls: ['Who on your team can take over', 'When the assistant offers a person', 'Notification emails', 'Closing or returning a conversation'],
    notice: 'Live takeover needs someone from your team to be available in the dashboard; outside those hours the assistant offers a booking or a message form instead.',
    faq: [
      { q: 'Does the visitor know when a person joins?', a: 'Yes. Messages from your team appear in the same chat, marked as coming from your team.' },
      { q: 'What if nobody is online?', a: 'The assistant offers to take the visitor’s details or book a time, so the request is not lost.' },
      { q: 'Can several people help?', a: 'Yes. Add team members with a role that includes conversations.' },
    ],
    related: ['ai-assistant', 'lead-capture', 'appointment-booking'],
    guides: [{ label: 'Help center', href: '/support' }],
  },
  {
    slug: 'messaging-channels',
    name: 'WhatsApp and Telegram',
    eyebrow: 'Where it works',
    title: 'Answer customers on the apps they already use.',
    intro: 'Connect your own WhatsApp Business and Telegram accounts and the same assistant, with the same knowledge and booking, replies there too.',
    seoTitle: 'AI Assistant for WhatsApp and Telegram',
    seoDescription: 'Connect WhatsApp Business (Cloud API) and Telegram bots to your AI assistant so it answers customers and books appointments on the apps they use.',
    chat: { visitor: 'Are you taking new clients this month?', assistant: 'Yes, we have room on Tuesdays and Thursdays. Would you like to book a first session?', footnote: 'The same assistant, answering in WhatsApp.' },
    benefits: [
      { title: 'WhatsApp Business (Cloud API)', body: 'Connect your Meta developer app and phone number; customers message you and the assistant replies.' },
      { title: 'Telegram bots', body: 'Create a bot with BotFather, paste its token and set the webhook from the dashboard.' },
      { title: 'One brain', body: 'The same knowledge base, tone and booking rules apply on every channel.' },
      { title: 'Signed and verified', body: 'Incoming messages are verified before the assistant sees them.' },
      { title: 'Leads and bookings still arrive', body: 'Leads and bookings made in these channels appear in the same dashboard.' },
      { title: 'You own the accounts', body: 'The WhatsApp and Telegram accounts are yours, so you keep control of your numbers and bots.' },
    ],
    steps: [
      { title: 'Create the account', body: 'A Meta developer app for WhatsApp, or a bot with BotFather for Telegram.' },
      { title: 'Connect it', body: 'Enter the details in Channels and Integrations and copy the webhook address it shows.' },
      { title: 'Verify', body: 'Send a message and check the assistant replies.' },
      { title: 'Go live', body: 'Share your WhatsApp number or Telegram link with customers.' },
    ],
    controls: ['Which channels are enabled', 'Greeting and behaviour per assistant', 'Team access to conversations'],
    notice: 'WhatsApp and Telegram are included on the Agency / Scale plan, and you set up the accounts yourself. Phone calls are under development and not available yet.',
    faq: [
      { q: 'Do I need a WhatsApp Business account?', a: 'Yes. It uses Meta’s WhatsApp Cloud API, which you set up with your own Meta developer app.' },
      { q: 'Is there a cost from WhatsApp or Telegram?', a: 'Telegram bots are free to create. WhatsApp conversations may be billed by Meta according to their pricing.' },
      { q: 'Can it answer phone calls?', a: 'Not yet. Phone calls are under development.' },
    ],
    related: ['website-widget', 'ai-assistant', 'lead-capture'],
    guides: [{ label: 'Integrations', href: '/integrations' }, { label: 'Roadmap', href: '/roadmap' }],
  },
  {
    slug: 'mobile-apps',
    name: 'Mobile apps (iOS & Android)',
    eyebrow: 'Where it works',
    title: 'Deploy your AI assistant inside native iOS and Android apps.',
    intro: 'Embed your business assistant into your mobile application using lightweight web views, mobile SDK wrappers, or our fast REST and WebSocket APIs. Keep your knowledge base, appointment booking, and lead qualification synchronized everywhere.',
    seoTitle: 'AI Assistant for Mobile Apps (iOS and Android) | Crescelo',
    seoDescription: 'Integrate your AI business assistant and appointment booking directly into iOS and Android apps with live slot availability and lead capture.',
    chat: { visitor: 'Can I book an appointment for tomorrow afternoon in the app?', assistant: 'Yes, 2:30 PM and 4:00 PM are open tomorrow. Shall I lock in 2:30 PM for you?', footnote: 'Embedded right inside your iOS or Android app.' },
    benefits: [
      { title: 'Native iOS & Android integration', body: 'Embed via lightweight in-app WebViews, native mobile SDK components, or direct REST API endpoints.' },
      { title: 'One synchronized brain', body: 'Updates made to your knowledge base and services in the Crescelo dashboard immediately reflect across both web and mobile.' },
      { title: 'In-app appointment booking', body: 'Clients can view available slots and book appointments directly inside your mobile app without jumping to external browsers.' },
      { title: 'Push notifications & lead sync', body: 'Leads and consultation requests captured inside mobile apps route straight to your dashboard, Slack, and email.' },
      { title: 'Zero duplicate maintenance', body: 'Never maintain two separate bots for your site and your mobile app. One unified assistant handles both.' },
      { title: 'Offline-tolerant & responsive', body: 'Designed for touchscreens with high-DPI responsive design, quick loading, and graceful network reconnection.' },
    ],
    steps: [
      { title: 'Get your assistant ID & API token', body: 'Head to Overview in your Crescelo dashboard to copy your assistant public key and embed URL.' },
      { title: 'Embed in your mobile app', body: 'Drop our embed URL into a WKWebView (iOS Swift/SwiftUI) or WebView (Android Kotlin/Jetpack Compose), or call our Chat API directly.' },
      { title: 'Customize appearance', body: 'Set brand colors, corner radius, and dark mode to match your mobile app design perfectly.' },
      { title: 'Ship & test', body: 'Run a live test booking inside your app simulator, then deploy to the App Store and Google Play.' },
    ],
    controls: ['Theme color & dark mode auto-detection', 'Custom headers & authentication tokens', 'Lead capture field requirements', 'Live calendar slot availability'],
    faq: [
      { q: 'Can I use Crescelo in Flutter or React Native apps?', a: 'Yes. You can use standard webview packages (e.g. webview_flutter or react-native-webview) or integrate directly with our clean HTTP JSON API.' },
      { q: 'Does appointment booking work on mobile?', a: 'Yes. Mobile users can select open slots and receive a confirmation email with a private reschedule or cancel link without leaving the app.' },
      { q: 'Do I need separate plans for web and mobile?', a: 'No. Your existing Crescelo assistant covers your website, mobile apps, and messaging channels concurrently.' },
    ],
    related: ['website-widget', 'ai-assistant', 'appointment-booking'],
    guides: [{ label: 'Integrations', href: '/integrations' }, { label: 'Knowledge Base', href: '/product/knowledge-base' }],
  },
];

export const featureBySlug = (slug: string) => PRODUCT_FEATURES.find((f) => f.slug === slug);
