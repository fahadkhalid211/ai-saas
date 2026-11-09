/**
 * One landing page per integration people search for (/integrations/<slug>): "WhatsApp AI chatbot", "Slack lead notifications",
 * "Google Sheets chatbot leads". Written from what the product does today (see lib/product-features.ts and the roadmap); each page says
 * which plan it needs and what is not available.
 */

export interface IntegrationPageFaq {
  q: string;
  a: string;
}

export interface IntegrationPageData {
  slug: string;
  name: string;
  /** The page's H1: contains the phrase people search for. */
  title: string;
  intro: string;
  seoTitle: string;
  seoDescription: string;
  does: { title: string; body: string }[];
  steps: { title: string; body: string }[];
  /** Plan and prerequisites, stated plainly. */
  needs: string[];
  limits: string[];
  faq: IntegrationPageFaq[];
  /** Product feature pages and guides to link to. */
  features: string[];
  links: { label: string; href: string }[];
}

export const INTEGRATION_PAGES: IntegrationPageData[] = [
  {
    slug: 'whatsapp',
    name: 'WhatsApp',
    title: 'WhatsApp AI chatbot for business: answer customers and book appointments on WhatsApp',
    intro:
      'Connect your own WhatsApp Business number through Meta\'s Cloud API and the same Crescelo assistant that answers on your website replies on WhatsApp too, from the same knowledge base and with the same booking rules.',
    seoTitle: 'WhatsApp AI Chatbot for Business (Cloud API)',
    seoDescription: 'Connect your WhatsApp Business number through Meta\'s Cloud API so your Crescelo assistant answers customers and books appointments on WhatsApp.',
    does: [
      { title: 'Answers from your content', body: 'Customers message your WhatsApp number and the assistant replies from the same documents and pages as your website chat, and says when it does not know.' },
      { title: 'Books appointments', body: 'The same booking rules apply on WhatsApp: the assistant offers open times or your Calendly or Cal.com link.' },
      { title: 'Captures leads', body: 'Contact details collected on WhatsApp land in the same Leads section, with the conversation attached, and trigger the same email and Slack alerts.' },
      { title: 'Visible to your team', body: 'WhatsApp conversations appear in the same dashboard as your website chats, so your team can read the full history and follow up.' },
    ],
    steps: [
      { title: 'Create the Meta app', body: 'In Meta for Developers, create an app with the WhatsApp product and add a phone number to your WhatsApp Business account.' },
      { title: 'Connect it in Crescelo', body: 'Under Channels and Integrations, enter the details Meta gives you and copy the webhook address Crescelo shows.' },
      { title: 'Verify the webhook', body: 'Paste them into your Meta app. Incoming messages are verified before the assistant sees them.' },
      { title: 'Send a test message', body: 'Message your number from your own phone and check the assistant replies, then share the number with customers.' },
    ],
    needs: [
      'The Agency / Scale plan (WhatsApp is not included on Starter or Growth).',
      'A WhatsApp Business account and a Meta developer app that you set up and own.',
    ],
    limits: [
      'You set up and own the Meta app and phone number. Crescelo does not provide a WhatsApp number.',
      'Meta can charge for WhatsApp conversations under its own pricing, and its messaging rules apply. These are outside Crescelo.',
      'Phone calls are not available; they are under development.',
    ],
    faq: [
      { q: 'Do I need a WhatsApp Business account?', a: 'Yes. Crescelo uses Meta\'s WhatsApp Cloud API, which you set up with your own Meta developer app and phone number.' },
      { q: 'Which plan includes WhatsApp?', a: 'WhatsApp and Telegram are included on the Agency / Scale plan.' },
      { q: 'Does WhatsApp cost extra?', a: 'Meta may bill WhatsApp conversations according to its pricing, separately from Crescelo. Crescelo adds no markup to AI usage either, which your AI provider bills directly.' },
      { q: 'Where do WhatsApp leads and bookings appear?', a: 'In the same dashboard as website chats: the Leads section, the appointments list and the conversation history.' },
    ],
    features: ['messaging-channels', 'appointment-booking', 'human-handover'],
    links: [{ label: 'Pricing', href: '/pricing' }, { label: 'Help center', href: '/support' }],
  },
  {
    slug: 'telegram',
    name: 'Telegram',
    title: 'Telegram AI chatbot for business: let your assistant answer and book on Telegram',
    intro:
      'Create a bot with BotFather, paste its token into Crescelo and your assistant answers Telegram messages from your own content, books appointments and captures leads, exactly as it does on your website.',
    seoTitle: 'Telegram AI Chatbot for Business',
    seoDescription: 'Connect a Telegram bot to your Crescelo assistant so it answers customers from your own content, books appointments and captures leads on Telegram.',
    does: [
      { title: 'Answers from your content', body: 'The Telegram bot uses the same knowledge base, tone and rules as your website assistant.' },
      { title: 'Books appointments', body: 'Customers can pick a time in the conversation, with the same locking and confirmations as on the website.' },
      { title: 'Captures leads', body: 'Contact details arrive in the Leads section with the conversation, and can go on to email, Slack, Google Sheets or a webhook.' },
      { title: 'Verified messages', body: 'Incoming updates are checked before the assistant sees them.' },
    ],
    steps: [
      { title: 'Create a bot', body: 'Message BotFather on Telegram, create a bot and copy its token.' },
      { title: 'Paste the token', body: 'In Channels and Integrations, enter the token for your assistant.' },
      { title: 'Set the webhook', body: 'Use the button in the dashboard to point the bot at Crescelo.' },
      { title: 'Test and share', body: 'Message the bot, check the reply, then share its link with customers.' },
    ],
    needs: [
      'The Agency / Scale plan (Telegram is not included on Starter or Growth).',
      'A Telegram bot that you create and own with BotFather.',
    ],
    limits: [
      'You own and manage the bot; Crescelo does not create one for you.',
      'Telegram is a messaging app, not a website widget: customers must use Telegram to reach the bot.',
    ],
    faq: [
      { q: 'Does a Telegram bot cost anything?', a: 'Telegram bots are free to create. Crescelo\'s Agency / Scale plan is needed to connect it.' },
      { q: 'Is the Telegram assistant the same as the website one?', a: 'It uses the same knowledge base, behavior and booking rules, so answers stay consistent across channels.' },
      { q: 'Can I run WhatsApp and Telegram together?', a: 'Yes. Both are included on the Agency / Scale plan and share the same assistant and dashboard.' },
    ],
    features: ['messaging-channels', 'lead-capture', 'knowledge-base'],
    links: [{ label: 'WhatsApp integration', href: '/integrations/whatsapp' }, { label: 'Pricing', href: '/pricing' }],
  },
  {
    slug: 'slack',
    name: 'Slack',
    title: 'Slack lead notifications from your website chatbot: new leads in the channel your team already watches',
    intro:
      'Add an incoming-webhook URL for a Slack channel and Crescelo posts each new lead there as soon as it is captured, with the contact details and a link back to the conversation.',
    seoTitle: 'Slack Lead Notifications from Your Website Chatbot',
    seoDescription: 'Post new chatbot leads to a Slack channel the moment they are captured, with contact details and a link to the conversation. Set up with a Slack webhook.',
    does: [
      { title: 'Posts new leads and bookings', body: 'When a visitor leaves their details or books a time, a formatted message appears in your chosen Slack channel.' },
      { title: 'Links back to the chat', body: 'Every lead is linked to the conversation that produced it, so your follow-up starts with context.' },
      { title: 'One channel per assistant', body: 'Each assistant can post to its own channel, which suits agencies running several clients.' },
      { title: 'Test button', body: 'Send a test message from the dashboard before relying on it.' },
    ],
    steps: [
      { title: 'Create a Slack webhook', body: 'In Slack, add the Incoming Webhooks app to your workspace and create a webhook for a channel.' },
      { title: 'Paste it in Crescelo', body: 'In Channels and Integrations, paste the webhook URL for the assistant.' },
      { title: 'Test', body: 'Use the test button and check the message arrives.' },
      { title: 'Go live', body: 'New leads now post to the channel automatically.' },
    ],
    needs: ['A Slack workspace where you can add an incoming webhook.'],
    limits: [
      'Slack receives lead notifications from Crescelo; it is not a two-way chat. You cannot reply to a visitor from inside Slack today.',
      'Email alerts still go out to your team as well.',
    ],
    faq: [
      { q: 'Can I reply to a visitor from Slack?', a: 'No. Slack gets the notification and a link. Open the conversation in the dashboard to take over and reply.' },
      { q: 'What does the Slack message contain?', a: 'The lead\'s contact details and the fields you collect, with a link to the conversation.' },
      { q: 'Can I send leads to Slack and Google Sheets at once?', a: 'Yes. Slack, Google Sheets, email and webhooks can all receive the same lead.' },
    ],
    features: ['lead-capture', 'human-handover', 'ai-assistant'],
    links: [{ label: 'Google Sheets integration', href: '/integrations/google-sheets' }, { label: 'Webhooks, Zapier and Make', href: '/integrations/zapier-make' }],
  },
  {
    slug: 'google-sheets',
    name: 'Google Sheets',
    title: 'Send chatbot leads to Google Sheets: every lead and booking as a new row',
    intro:
      'Connect a Google Sheet and each new lead from your website assistant is added as a row, so your team can sort, filter and share them with no extra software.',
    seoTitle: 'Send Chatbot Leads to Google Sheets',
    seoDescription: 'Add every chatbot lead and booking to a Google Sheet automatically as a new row. Connect a sheet with a short script, no extra software needed.',
    does: [
      { title: 'One row per lead or booking', body: 'Name, contact details, the fields you collect and the time are added to your sheet as a new row.' },
      { title: 'No extra tools', body: 'It works with a Google Sheet you already own, with no automation subscription needed.' },
      { title: 'Share with your team', body: 'Use ordinary Sheets sharing, filters and formulas to work the leads.' },
      { title: 'Linked to the conversation', body: 'Each lead links back to the chat that produced it in the dashboard.' },
    ],
    steps: [
      { title: 'Open your sheet', body: 'Create or open the Google Sheet that should receive leads.' },
      { title: 'Paste the script', body: 'Add the short Google Apps Script Crescelo provides and deploy it as a web app.' },
      { title: 'Paste the address in Crescelo', body: 'In Channels and Integrations, paste the web app address and use the test button.' },
      { title: 'Watch rows arrive', body: 'New leads now appear in the sheet as they are captured.' },
    ],
    needs: ['A Google account and a Google Sheet you can edit.'],
    limits: [
      'Rows are added as leads arrive; the sheet is not a two-way sync, so editing a row does not change the lead in Crescelo.',
      'You manage the sheet\'s sharing and access. Take care with personal data in shared sheets.',
    ],
    faq: [
      { q: 'Is there a native Google Sheets sync?', a: 'Crescelo adds rows through a Google Apps Script web app that you deploy from your own sheet. It is not a two-way sync.' },
      { q: 'Are bookings sent to the sheet as well as leads?', a: 'Yes. A lead or a booking triggers a row. Bookings also appear in your dashboard and your calendar feed.' },
      { q: 'Is my data safe in a Google Sheet?', a: 'Once a lead is in your sheet, Google and your sharing settings govern it. Keep sheets private to people who need them.' },
    ],
    features: ['lead-capture', 'ai-assistant', 'knowledge-base'],
    links: [{ label: 'Slack integration', href: '/integrations/slack' }, { label: 'Webhooks, Zapier and Make', href: '/integrations/zapier-make' }],
  },
  {
    slug: 'zapier-make',
    name: 'Zapier, Make & webhooks',
    title: 'Chatbot webhooks for Zapier and Make: send leads and bookings to your CRM or any system',
    intro:
      'Crescelo can call a webhook address whenever something happens, such as a new lead, and the call is signed so your system can check it came from Crescelo. Use it with Zapier, Make, n8n or your own endpoint to reach tools Crescelo does not connect to directly.',
    seoTitle: 'Chatbot Webhooks for Zapier, Make & Your CRM',
    seoDescription: 'Send leads and bookings from your website chatbot to Zapier, Make, n8n or your CRM with signed webhooks. A no-code route to the tools you already use.',
    does: [
      { title: 'Signed webhook calls', body: 'Each call carries a signature your system can verify, so you know it came from Crescelo and was not altered.' },
      { title: 'Reach any tool', body: 'Zapier and Make connect webhooks to thousands of apps, including CRMs such as HubSpot, Pipedrive or Salesforce.' },
      { title: 'Leads and bookings', body: 'Crescelo calls the address you configure for new leads and bookings, and you can test it from the dashboard.' },
      { title: 'Your own endpoint', body: 'Developers can receive the call on their own server and do anything with it.' },
    ],
    steps: [
      { title: 'Create the receiving end', body: 'In Zapier, Make or n8n create a "catch webhook" trigger and copy its address.' },
      { title: 'Paste it in Crescelo', body: 'In Channels and Integrations, add the address as a webhook for your assistant.' },
      { title: 'Send a test', body: 'Use the test button so your automation tool sees a sample payload and you can map the fields.' },
      { title: 'Build the next step', body: 'Create the contact, deal or row in the tool you want, then switch the automation on.' },
    ],
    needs: ['A Zapier, Make, n8n account or your own server that can receive an HTTPS request.'],
    limits: [
      'Native two-way sync with HubSpot, Salesforce and Pipedrive is planned, not available yet. Webhooks are the route today.',
      'Zapier and Make are separate services with their own pricing; Crescelo does not include them.',
    ],
    faq: [
      { q: 'Does Crescelo integrate with HubSpot or Salesforce?', a: 'Not directly yet; native CRM sync is planned. Send leads through a webhook to Zapier or Make and have them create the contact.' },
      { q: 'How do I know a webhook really came from Crescelo?', a: 'Each request is signed. Your system recomputes the signature with your secret and compares it before trusting the data.' },
      { q: 'What if my endpoint is down?', a: 'The lead is still saved in your Leads section and emailed to your team, so it is not lost. A failed delivery is recorded in the logs.' },
    ],
    features: ['lead-capture', 'ai-assistant', 'human-handover'],
    links: [{ label: 'Slack integration', href: '/integrations/slack' }, { label: 'Roadmap', href: '/roadmap' }],
  },
];

export const integrationPageBySlug = (slug: string): IntegrationPageData | undefined => INTEGRATION_PAGES.find((i) => i.slug === slug);
