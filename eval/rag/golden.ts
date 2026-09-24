import type { EvalSet } from '../../lib/rag/eval/harness';

/**
 * Golden set for retrieval evaluation. A small, self-contained knowledge base about the Crescelo product itself
 * (so it is easy to check by eye) and questions written the way visitors actually ask them.
 *
 *   factual      one fact, asked plainly
 *   paraphrase   the same fact in other words
 *   synonym      the question uses different vocabulary from the document
 *   typo         misspellings and clipped wording
 *   numeric      a price, limit or number that is easy to confuse with a neighbouring one
 *   multi        needs two documents
 *   followup     only makes sense with the earlier turns (history)
 *   overview     broad question over a whole topic
 *   unanswerable the knowledge base has nothing on it: the assistant should decline or offer a booking / live agent
 *
 * `contains` narrows the evidence to a passage: a retrieved chunk only counts if it includes that text.
 * Rules for adding cases: the answer must be in the corpus below, not in anyone's head; keep questions natural;
 * add at least one unanswerable question for every new topic.
 */

const pricing = `# Plans and pricing

Crescelo has three plans. Prices are in US dollars and can be paid monthly or annually. Annual billing lowers the effective monthly price by about twenty percent.

## Starter
The Starter plan costs $49 per month, or $39 per month when billed annually. It includes 100 chat sessions each month and 1 assistant. Extra chat sessions beyond the included 100 are billed at $0.50 each. Knowledge storage is 50 MB, roughly 50,000 pages of text.

## Growth
The Growth plan costs $149 per month, or $119 per month when billed annually. It includes 500 chat sessions each month and up to 5 assistants. Extra chat sessions are billed at $0.40 each. Knowledge storage is 500 MB. Growth adds appointment booking with calendar sync, agency white-label branding, voice dictation with a six-language switcher, and priority email and live chat support.

## Agency / Scale
The Agency plan, also called Scale, costs $399 per month, or $319 per month billed annually. It includes 2,000 chat sessions each month and unlimited assistants. Extra chat sessions are billed at $0.30 each. Knowledge storage is 5 GB. It adds the WhatsApp Cloud API and Telegram integrations, outbound webhooks with CRM sync, custom invoice billing, multi-seat team access, and a dedicated account manager with a 99.9 percent uptime target.

## What counts as a chat session
One visitor conversation counts as one chat session, however many messages it contains. A session ends after a period of inactivity.`;

const byok = `# Bring your own AI key

Crescelo does not add a markup to AI usage. You connect your own provider account and pay that provider directly at their wholesale rates. The platform charges only for the plan.

## Supported providers
You can connect OpenAI, Anthropic Claude, Google Gemini, Groq, DeepSeek, or a local Ollama server. A custom OpenAI-compatible base URL is also supported for self-hosted models.

## Where your key is stored
Provider API keys are encrypted at rest with AES-256-GCM and are never shown again in full after saving. Only the last few characters are displayed in the dashboard.

## The free engine
If you have no key yet, choose the Zero-Cost Free Engine. It sends each question to Groq first, falls back to Google Gemini if Groq is busy, and falls back to Ollama on your own machine as the last resort. It has no per-token cost but is shared and rate limited, so it suits testing and small sites better than heavy traffic.

## Choosing a model
Each assistant has its own provider and model setting, so one business can use a fast cheap model for simple questions while another uses a stronger model. You can change the model at any time in AI Settings without retraining anything.`;

const knowledge = `# Adding knowledge to an assistant

An assistant answers only from the material you give it. This is called grounding, and it is why the assistant does not invent prices or policies.

## What you can add
You can upload PDF, Word, plain text, CSV and JSON files, paste text directly, add a web page by URL, or add a YouTube video whose transcript is indexed. Audio and video files are transcribed to text first, and images are read with OCR.

## How documents are processed
Each document is split into passages of about 1,800 characters with a 200 character overlap so that sentences are not cut in half. Every passage is turned into a 384 dimension embedding by a small open source model that runs on our own servers, so embeddings cost nothing. Passages are searched with both meaning and keywords, and the best matches are re-ranked before the assistant answers.

## Keeping knowledge fresh
Re-adding a web page replaces its old passages. Deleting a source removes its passages immediately. A new source becomes searchable as soon as its status shows ready, usually within a minute.

## Storage limits
Each plan has a knowledge storage limit: 50 MB on Starter, 500 MB on Growth and 5 GB on Agency. The dashboard shows how much you have used.`;

const booking = `# Appointment booking

Visitors can book a time without leaving the chat. The assistant shows a booking form with days and open slots.

## How slots are calculated
You set the days of the week you are open, the opening and closing hours, and the length of each appointment in minutes. Crescelo builds the list of free slots from those settings and hides any slot that is already taken, so two people can never book the same time. Booking checks are also enforced by the database, not only by the screen.

## Confirmations and reminders
After a booking the visitor receives a confirmation email with an add-to-calendar link. Reminders go out automatically 24 hours and 1 hour before the appointment. Each assistant also has a private calendar feed URL that you can subscribe to in Google Calendar, Apple Calendar or Outlook.

## Cancelling and rescheduling
Every confirmation email contains a private manage link. The visitor can use it to cancel or move the appointment without contacting you.

## Using your own calendar tool
Instead of the built-in booking form you can point the assistant at Calendly or Cal.com by pasting your booking link. In that case slots are managed by that tool.

## Availability by plan
Direct appointment booking with calendar sync is included from the Growth plan upward.`;

const channels = `# Channels and integrations

An assistant can talk to customers in several places at once, all sharing the same knowledge.

## Website widget
Add the assistant to any website with a single script tag. The widget shows a floating launcher, supports your brand colour, and lets you list the domains where it is allowed to run.

## WhatsApp and Telegram
Connect the WhatsApp Cloud API with your Meta access token and phone number, and connect Telegram with a bot token from BotFather. Both are available on the Agency plan. Incoming messages from either channel get the same grounded answers as the website.

## Notifications and data out
New leads and bookings can be sent to a Slack channel, appended as rows to a Google Sheet, or posted to your own URL as a webhook. Every webhook request is signed with an HMAC SHA-256 signature in the X-Crescelo-Signature header so your server can verify it really came from Crescelo.

## Email
Lead and booking notifications are sent by email. You can use the built-in sending service or connect your own SMTP server or Resend account in Channels.`;

const phone = `# AI phone receptionist

Callers to your business number can be answered by the assistant, which speaks with them, answers from your knowledge base and books appointments.

## How a call works
The assistant greets the caller and always says that it is an AI assistant. It listens, answers, and can offer appointment times. If the caller asks for a person, or if the AI service is unavailable, the call is transferred to the phone number you set as your transfer number. Callers can interrupt the assistant while it is speaking.

## Setting it up
The phone number is a local number bought from the carrier and assigned to your assistant by the platform administrator. You choose the greeting, language, your opening hours behaviour, and the maximum call length, which defaults to 10 minutes. Outside opening hours the assistant can keep answering, take a voicemail, or forward the call.

## Cost and privacy
Calls are not recorded by default. The speech recognition and voice run on our own small server, so there are no per-minute AI fees, only the carrier's charge for the number and minutes.`;

const security = `# Security and privacy

## Roles and access
Team members have a role: owner, admin, billing manager, support agent or viewer. Owners and admins manage settings, billing managers see plans and invoices, support agents handle conversations, and viewers can only read. Each workspace is isolated: users can never see another workspace's assistants, leads or conversations.

## Sign-in protection
Accounts can turn on two-factor authentication with an authenticator app. Passwords are stored only as salted scrypt hashes. Sign-in attempts are rate limited, and repeated failures on one account slow down further guesses.

## Encryption
All traffic uses TLS. Provider API keys and other stored secrets are encrypted at rest with AES-256-GCM.

## Audit trail
Owners can open the audit trail to see logins, setting changes and plan updates with the person, time and address.

## What is stored
Conversations and leads are stored for the workspace that owns them. Passwords, API keys and message text are never written to the platform's operational logs, and those logs are deleted after 30 days.`;

const liveAgent = `# Live agent handover

## When a person should take over
Visitors can ask to talk to a live agent at any time, and the assistant also offers this when it cannot answer. The assistant never asks visitors to type their email or phone number into the chat. Instead it offers two options: book a time with the booking form, or talk to a live agent.

## What your team sees
A request for a live agent marks the conversation as waiting for an agent and sends a notification with a sound alert to your dashboard. A team member opens Chat History, reads the conversation so far, and takes over. While a person is in control the assistant stays quiet, and the visitor sees the agent's name in the chat.

## Handing back
When the agent finishes, they end the takeover and the assistant resumes answering.

## Leads
Contact details that a visitor chooses to enter in the booking form are saved as a lead, together with the conversation and where the visitor came from.`;

const analytics = `# Analytics and knowledge gaps

## The analytics page
The analytics page shows conversations, leads captured and bookings over time, a breakdown of where visitors came from, and which pages start the most conversations. Date ranges of 7, 14, 30 and 90 days are available and reports can be exported as CSV.

## Unanswered questions inbox
Whenever the assistant cannot answer, or the retrieved material does not support an answer, the question is added to the unanswered questions inbox. Open it, type the correct answer, and with one click it is added to the knowledge base so the next visitor gets it.

## Sentiment escalation
On the Growth plan and above, the assistant watches for frustrated visitors and offers a live agent early.

## Improving answers over time
Check the unanswered inbox weekly. Adding a short answer for each repeated question is the fastest way to raise the share of questions the assistant answers correctly.`;

const whiteLabel = `# White-label and agencies

## Removing Crescelo branding
On the Growth plan and above you can turn on white-label mode. The small Powered by Crescelo line under the chat widget is replaced with your own text and link, or removed.

## Serving several clients
Agencies create a separate assistant for each client, each with its own knowledge, colours, widget, booking settings and connected channels. The Growth plan allows up to 5 assistants and the Agency plan allows unlimited assistants.

## Team seats
Invite colleagues to your workspace and give each a role. Multi-seat access with several team members is part of the Agency plan.`;

const gettingStarted = `# Getting started

## Create your assistant
Sign up, name your business and pick an industry template such as barbershop, dental clinic, real estate, gym or law firm. The template fills in a starting prompt, sample questions and a starter knowledge base.

## Teach it
Open Knowledge Base and add your own documents, pages and videos. Then open the Testing Studio to ask questions and see exactly which passages the assistant used for each answer.

## Put it on your site
Open Widget and Styling, choose a colour and position, and copy the one-line embed script into your website before the closing body tag. The widget appears immediately.

## Go live checklist
Add your opening hours and services, connect an AI key or use the free engine, set the transfer number for phone calls if you use them, and test a booking end to end.`;

const roadmap = `# Roadmap

## Coming soon
Hosted landing pages, where every assistant gets a ready-made web page for the business with the chat built in, are planned for a future release and are not available yet. Until then the assistant is added to your existing website with the widget.

## Under consideration
More voice languages, deeper CRM integrations and shared inboxes are on the wish list. Requests can be sent through the contact form.`;

const troubleshooting = `# Troubleshooting

## The assistant says it does not know
This means the knowledge base does not contain the answer. Open the unanswered questions inbox, add the answer, and it will be used from then on. Check that the source shows ready and is not still processing.

## The widget does not appear
Make sure the script tag is on the page and the website's domain is listed in the allowed domains for the assistant. If the list is empty the widget runs everywhere.

## Too many messages
Each visitor can send up to 35 messages per minute. Beyond that, the assistant asks them to wait a moment. This protects your AI usage from abuse.

## Emails are not arriving
Check the spam folder, then open Channels and send a test email to confirm your sending service works.`;

const billing = `# Billing

## Payments
Payments are handled by Stripe. You can pay by card and change plan at any time from Plans and Billing; the change applies immediately and is prorated.

## Invoices
Every payment produces an invoice you can download from Plans and Billing. Invoices show the plan, billing period and any extra chat sessions.

## Extra chat sessions
If you use more chat sessions than your plan includes, the extra sessions are billed at your plan's overage rate at the end of the period. There is no automatic service interruption when you pass the limit.

## Cancelling
You can cancel at any time. The plan stays active until the end of the period you already paid for. Annual plans are not refunded for the unused months.`;

export const GOLDEN: EvalSet = {
  name: 'crescelo-product-kb',
  description: 'Product knowledge base with 14 documents and questions of every kind visitors ask.',
  corpus: [
    { id: 'pricing', title: 'Plans and pricing', text: pricing },
    { id: 'byok', title: 'Bring your own AI key', text: byok },
    { id: 'knowledge', title: 'Adding knowledge to an assistant', text: knowledge },
    { id: 'booking', title: 'Appointment booking', text: booking },
    { id: 'channels', title: 'Channels and integrations', text: channels },
    { id: 'phone', title: 'AI phone receptionist', text: phone },
    { id: 'security', title: 'Security and privacy', text: security },
    { id: 'live-agent', title: 'Live agent handover', text: liveAgent },
    { id: 'analytics', title: 'Analytics and knowledge gaps', text: analytics },
    { id: 'white-label', title: 'White-label and agencies', text: whiteLabel },
    { id: 'getting-started', title: 'Getting started', text: gettingStarted },
    { id: 'roadmap', title: 'Roadmap', text: roadmap },
    { id: 'troubleshooting', title: 'Troubleshooting', text: troubleshooting },
    { id: 'billing', title: 'Billing', text: billing },
  ],
  cases: [
    // ---- factual
    { id: 'f01', type: 'factual', query: 'What does the Starter plan cost?', relevant: [{ doc: 'pricing', contains: 'The Starter plan costs $49 per month' }] },
    { id: 'f02', type: 'factual', query: 'Which AI providers can I connect?', relevant: [{ doc: 'byok', contains: 'OpenAI, Anthropic Claude, Google Gemini, Groq, DeepSeek' }] },
    { id: 'f03', type: 'factual', query: 'How are my API keys stored?', relevant: [{ doc: 'byok', contains: 'encrypted at rest with AES-256-GCM' }] },
    { id: 'f04', type: 'factual', query: 'What file types can I upload to the knowledge base?', relevant: [{ doc: 'knowledge', contains: 'PDF, Word, plain text, CSV and JSON files' }] },
    { id: 'f05', type: 'factual', query: 'When do appointment reminders go out?', relevant: [{ doc: 'booking', contains: '24 hours and 1 hour before' }] },
    { id: 'f06', type: 'factual', query: 'How do I add the widget to my website?', relevant: [{ doc: 'channels', contains: 'single script tag' }] },
    { id: 'f07', type: 'factual', query: 'How do I verify a webhook really came from Crescelo?', relevant: [{ doc: 'channels', contains: 'X-Crescelo-Signature' }] },
    { id: 'f08', type: 'factual', query: 'Does the phone assistant say it is an AI?', relevant: [{ doc: 'phone', contains: 'always says that it is an AI assistant' }] },
    { id: 'f09', type: 'factual', query: 'Does the platform support two-factor authentication?', relevant: [{ doc: 'security', contains: 'two-factor authentication with an authenticator app' }] },
    { id: 'f10', type: 'factual', query: 'How long are operational logs kept?', relevant: [{ doc: 'security', contains: 'deleted after 30 days' }] },
    { id: 'f11', type: 'factual', query: 'What is the maximum call length for the phone assistant?', relevant: [{ doc: 'phone', contains: 'defaults to 10 minutes' }] },
    { id: 'f12', type: 'factual', query: 'Are hosted landing pages available?', relevant: [{ doc: 'roadmap', contains: 'not available yet' }] },

    // ---- paraphrase
    { id: 'p01', type: 'paraphrase', query: 'Can two customers end up booked at the same time?', relevant: [{ doc: 'booking', contains: 'two people can never book the same time' }] },
    { id: 'p02', type: 'paraphrase', query: 'What happens when someone wants to speak with a real person in the chat?', relevant: [{ doc: 'live-agent', contains: 'waiting for an agent' }] },
    { id: 'p03', type: 'paraphrase', query: 'My assistant keeps saying it has no idea, how do I fix that?', relevant: [{ doc: 'troubleshooting', contains: 'does not contain the answer' }] },
    { id: 'p04', type: 'paraphrase', query: 'What if the customer cannot make their appointment any more?', relevant: [{ doc: 'booking', contains: 'cancel or move the appointment' }] },
    { id: 'p05', type: 'paraphrase', query: 'Is there any way to use it without paying for AI tokens?', relevant: [{ doc: 'byok', contains: 'Zero-Cost Free Engine' }] },
    { id: 'p06', type: 'paraphrase', query: 'Can I take my plan away partway through the year?', relevant: [{ doc: 'billing', contains: 'cancel at any time' }] },
    { id: 'p07', type: 'paraphrase', query: 'How does the assistant avoid making up answers?', relevant: [{ doc: 'knowledge', contains: 'grounding' }] },
    { id: 'p08', type: 'paraphrase', query: 'What does my team see when a visitor asks for a person?', relevant: [{ doc: 'live-agent', contains: 'sound alert' }] },

    // ---- synonym
    { id: 's01', type: 'synonym', query: 'What are the fees for the middle tier?', relevant: [{ doc: 'pricing', contains: 'The Growth plan costs $149' }] },
    { id: 's02', type: 'synonym', query: 'Is it possible to rebrand the chat window as my own?', relevant: [{ doc: 'white-label', contains: 'white-label mode' }] },
    { id: 's03', type: 'synonym', query: 'Which messaging apps does it work with?', relevant: [{ doc: 'channels', contains: 'WhatsApp Cloud API' }] },
    { id: 's04', type: 'synonym', query: 'How do I make it read my company brochures?', relevant: [{ doc: 'knowledge', contains: 'upload' }] },
    { id: 's05', type: 'synonym', query: 'Can my receptionist line be answered by the bot after hours?', relevant: [{ doc: 'phone', contains: 'Outside opening hours' }] },

    // ---- typo / clipped wording
    { id: 't01', type: 'typo', query: 'how much is the growht plan', relevant: [{ doc: 'pricing', contains: 'The Growth plan costs $149' }] },
    { id: 't02', type: 'typo', query: 'whatsap and telegram integraton', relevant: [{ doc: 'channels', contains: 'Telegram' }] },
    { id: 't03', type: 'typo', query: 'appointmnt reminder emails', relevant: [{ doc: 'booking', contains: 'Reminders go out automatically' }] },

    // ---- numeric (neighbouring numbers are easy to confuse)
    { id: 'n01', type: 'numeric', query: 'How much does an extra chat session cost on the Growth plan?', relevant: [{ doc: 'pricing', contains: 'Extra chat sessions are billed at $0.40 each' }] },
    { id: 'n02', type: 'numeric', query: 'How many chat sessions are included in Agency?', relevant: [{ doc: 'pricing', contains: 'includes 2,000 chat sessions' }] },
    { id: 'n03', type: 'numeric', query: 'How much knowledge storage do I get on Starter?', relevant: [{ doc: 'pricing', contains: 'Knowledge storage is 50 MB' }] },
    { id: 'n04', type: 'numeric', query: 'What is the annual price of the Agency plan per month?', relevant: [{ doc: 'pricing', contains: '$319 per month billed annually' }] },
    { id: 'n05', type: 'numeric', query: 'How many messages per minute can one visitor send?', relevant: [{ doc: 'troubleshooting', contains: '35 messages per minute' }] },

    // ---- multi-document
    { id: 'm01', type: 'multi', query: 'Which plan lets me remove your branding and how much is it?', relevant: [{ doc: 'white-label', contains: 'white-label mode' }, { doc: 'pricing', contains: 'The Growth plan costs $149' }] },
    { id: 'm02', type: 'multi', query: 'I run an agency with ten clients. Which plan and what does it cost?', relevant: [{ doc: 'white-label', contains: 'unlimited assistants' }, { doc: 'pricing', contains: 'Agency plan, also called Scale, costs $399' }] },
    { id: 'm03', type: 'multi', query: 'Can I book appointments on the cheapest plan and how do reminders work?', relevant: [{ doc: 'booking', contains: 'included from the Growth plan' }, { doc: 'booking', contains: 'Reminders go out automatically' }] },
    { id: 'm04', type: 'multi', query: 'How do I connect my own AI key and where does it get stored?', relevant: [{ doc: 'byok', contains: 'connect your own provider account' }, { doc: 'byok', contains: 'encrypted at rest' }] },

    // ---- follow-ups that need the earlier turns
    {
      id: 'u01',
      type: 'followup',
      query: 'and how many assistants does it include?',
      history: [
        { role: 'user', content: 'Tell me about the Growth plan' },
        { role: 'assistant', content: 'The Growth plan costs $149 per month and includes 500 chat sessions.' },
      ],
      relevant: [{ doc: 'pricing', contains: 'up to 5 assistants' }],
    },
    {
      id: 'u02',
      type: 'followup',
      query: 'what if I go over that limit?',
      history: [
        { role: 'user', content: 'How many chat sessions does the Starter plan include?' },
        { role: 'assistant', content: 'Starter includes 100 chat sessions each month.' },
      ],
      relevant: [{ doc: 'pricing', contains: 'billed at $0.50 each' }],
    },
    {
      id: 'u03',
      type: 'followup',
      query: 'can callers interrupt it?',
      history: [
        { role: 'user', content: 'Tell me about the phone receptionist' },
        { role: 'assistant', content: 'It answers calls, answers questions and books appointments.' },
      ],
      relevant: [{ doc: 'phone', contains: 'interrupt the assistant' }],
    },
    {
      id: 'u04',
      type: 'followup',
      query: 'does that work on WhatsApp too?',
      history: [
        { role: 'user', content: 'How does the live agent handover work?' },
        { role: 'assistant', content: 'The conversation is marked as waiting and your team takes over from the dashboard.' },
      ],
      relevant: [{ doc: 'channels', contains: 'same grounded answers as the website' }],
    },

    // ---- overview
    { id: 'o01', type: 'overview', query: 'Give me an overview of everything the phone feature does', relevant: [{ doc: 'phone' }] },
    { id: 'o02', type: 'overview', query: 'Summarise your security features', relevant: [{ doc: 'security' }] },

    // ---- unanswerable: nothing in the knowledge base
    { id: 'x01', type: 'unanswerable', query: 'What is the weather in Karachi today?', relevant: [] },
    { id: 'x02', type: 'unanswerable', query: 'Do you offer a mobile app for iPhone?', relevant: [] },
    { id: 'x03', type: 'unanswerable', query: 'Who is the CEO of Crescelo?', relevant: [] },
    { id: 'x04', type: 'unanswerable', query: 'Can you write me a poem about spring?', relevant: [] },
    { id: 'x05', type: 'unanswerable', query: 'Do you integrate with Salesforce natively?', relevant: [] },
    { id: 'x06', type: 'unanswerable', query: 'What is your refund policy for the annual plan after 90 days?', relevant: [] },
    { id: 'x07', type: 'unanswerable', query: 'How many employees does the company have?', relevant: [] },
    { id: 'x08', type: 'unanswerable', query: 'Is there an on-premise installation option?', relevant: [] },
  ],
};
