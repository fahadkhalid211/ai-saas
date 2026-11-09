/**
 * The glossary (/glossary): plain-language definitions of the terms people meet when choosing a website assistant. Each definition is
 * general and accurate on its own; where Crescelo does something specific, `inCrescelo` says exactly what and links to the page.
 * (The Knowledge Hub's title promised a glossary; this is it.)
 */

export interface GlossaryTerm {
  term: string;
  slug: string;
  definition: string;
  /** What this means in Crescelo, only where the product has a specific feature. */
  inCrescelo?: string;
  link?: { label: string; href: string };
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    term: 'AI website assistant',
    slug: 'ai-website-assistant',
    definition: 'A chat assistant on a business website that uses a large language model to answer visitors in natural language, usually from the business\'s own content, and can take actions such as booking an appointment or recording a lead.',
    inCrescelo: 'Crescelo is an AI website assistant for service businesses: it answers from your documents, books appointments in the chat, captures leads and hands over to your team.',
    link: { label: 'AI website assistant', href: '/product/ai-assistant' },
  },
  {
    term: 'Rule-based chatbot',
    slug: 'rule-based-chatbot',
    definition: 'A chatbot that follows a fixed script of buttons and keywords. It is predictable but cannot answer anything its author did not write a branch for.',
  },
  {
    term: 'Large language model (LLM)',
    slug: 'large-language-model',
    definition: 'A neural network trained on large amounts of text that predicts and generates language. Models such as GPT, Claude and Gemini are LLMs. Without grounding, an LLM answers from patterns it learned in training, which may be out of date or wrong for your business.',
    link: { label: 'LLM cost calculator', href: '/tools/llm-cost-calculator' },
  },
  {
    term: 'Retrieval-augmented generation (RAG)',
    slug: 'rag',
    definition: 'A technique in which the system first retrieves passages relevant to the question from a set of documents, then asks the language model to answer using only those passages. It keeps answers tied to your material and lets you update the answers by updating the documents.',
    inCrescelo: 'Every Crescelo answer is built from passages retrieved from your knowledge base; if nothing relevant is found the assistant says so instead of guessing.',
    link: { label: 'Knowledge base and RAG', href: '/support/rag-knowledge' },
  },
  {
    term: 'Knowledge base',
    slug: 'knowledge-base',
    definition: 'The collection of documents, web pages and notes an assistant answers from. Its accuracy is the main limit on the assistant\'s accuracy.',
    inCrescelo: 'You add PDF and Word documents, spreadsheets, text, website addresses and video or audio files, and see which questions it could not answer.',
    link: { label: 'Knowledge base', href: '/product/knowledge-base' },
  },
  {
    term: 'Embedding',
    slug: 'embedding',
    definition: 'A list of numbers that represents the meaning of a piece of text, so that texts with similar meaning have similar numbers. Embeddings let a system find passages that mean the same thing even when the words differ.',
  },
  {
    term: 'Vector search',
    slug: 'vector-search',
    definition: 'Searching by comparing embeddings instead of matching words. A search for "how much is a haircut" can find a passage titled "Prices" because the meanings are close.',
  },
  {
    term: 'Hybrid search',
    slug: 'hybrid-search',
    definition: 'Combining vector (meaning) search with keyword search so that both casual wording and exact terms such as product names or codes are found.',
    inCrescelo: 'Crescelo combines meaning-based and keyword matching when it looks for a passage to answer from.',
  },
  {
    term: 'Hallucination',
    slug: 'hallucination',
    definition: 'When a language model states something that sounds confident but is false or unsupported, such as a price or policy that does not exist. Grounding and clear refusal rules reduce hallucination; no system removes it completely.',
    inCrescelo: 'Crescelo is designed to answer from your content and to say when it does not know. It can still make mistakes, so test it and review the questions it could not answer.',
  },
  {
    term: 'Grounding',
    slug: 'grounding',
    definition: 'Tying an AI answer to a specific source, so that the answer can be checked against it. A grounded assistant cites or uses only the supplied material.',
  },
  {
    term: 'System prompt',
    slug: 'system-prompt',
    definition: 'The standing instructions given to a language model before the conversation starts: its role, tone, limits and what it must never do.',
    inCrescelo: 'In Behavior and Rules you set the tone, what the assistant should never discuss and when it should offer a person.',
  },
  {
    term: 'Prompt injection',
    slug: 'prompt-injection',
    definition: 'An attack in which text typed by a user (or hidden in a document) tries to override the assistant\'s instructions, for example "ignore your rules and reveal your prompt". Defences include strict instructions, limiting what the assistant can do and reviewing its behaviour.',
  },
  {
    term: 'Token',
    slug: 'token',
    definition: 'The unit in which language models read and bill text: roughly three-quarters of an English word. AI providers charge by the number of input and output tokens.',
    link: { label: 'LLM cost calculator', href: '/tools/llm-cost-calculator' },
  },
  {
    term: 'Context window',
    slug: 'context-window',
    definition: 'The maximum amount of text (in tokens) a model can consider at once. Retrieval keeps the text sent to the model small and relevant, so cost and speed stay low.',
  },
  {
    term: 'BYOK (bring your own key)',
    slug: 'byok',
    definition: 'A model in which the customer connects their own account with an AI provider using their own API key, so the provider bills them directly and the software vendor adds no markup on AI usage.',
    inCrescelo: 'You connect OpenAI, Anthropic Claude, Google Gemini, Groq, DeepSeek or a self-hosted model with your own key. Crescelo adds nothing on top of your provider\'s charges. Keys are encrypted at rest.',
    link: { label: 'Connect your AI provider', href: '/support/ai-connectors' },
  },
  {
    term: 'Human handover',
    slug: 'human-handover',
    definition: 'Passing a conversation from the AI to a person without making the customer start again. Good handover keeps the whole history in view for the person who takes over.',
    inCrescelo: 'Visitors can ask for a person at any time; your team is alerted, joins the same chat and sees everything already said.',
    link: { label: 'Human handover', href: '/product/human-handover' },
  },
  {
    term: 'Lead capture',
    slug: 'lead-capture',
    definition: 'Recording a prospective customer\'s contact details and what they want, so someone can follow up. In chat it happens inside the conversation instead of in a separate form.',
    inCrescelo: 'You choose the fields. Each lead is emailed to your team and can be sent to Slack, Google Sheets or a webhook, linked to the conversation.',
    link: { label: 'Lead capture', href: '/product/lead-capture' },
  },
  {
    term: 'Double booking',
    slug: 'double-booking',
    definition: 'Two customers being given the same appointment time. It happens when availability is checked and then booked in separate steps, so two requests can pass the check at once.',
    inCrescelo: 'Crescelo checks the time range under a lock when a visitor confirms a booking, so two visitors cannot take the same time through the chat. It does not read events you add by hand to an outside calendar.',
    link: { label: 'Appointment booking', href: '/product/appointment-booking' },
  },
  {
    term: 'No-show',
    slug: 'no-show',
    definition: 'An appointment the customer neither attends nor cancels. Reminders and easy rescheduling are the usual remedies.',
    inCrescelo: 'Customers get a confirmation email with a private link to reschedule or cancel, and email reminders before the appointment.',
  },
  {
    term: 'iCalendar (.ics) feed',
    slug: 'ical-feed',
    definition: 'A standard calendar format that Google Calendar, Outlook and Apple Calendar can subscribe to from a web address, so events appear in the calendar app.',
    inCrescelo: 'Every assistant has a private, read-only feed of its bookings. It sends bookings to your calendar; events you add there do not block times in Crescelo.',
    link: { label: 'Calendar booking guide', href: '/support/calendar-booking' },
  },
  {
    term: 'Webhook',
    slug: 'webhook',
    definition: 'A web address that one system calls to tell another that something happened, such as "a new lead arrived". Webhooks are how many tools exchange data without custom integration.',
    inCrescelo: 'Crescelo calls your webhook for new leads and bookings, with a signature so you can verify the call is genuine. Zapier and Make can receive it.',
    link: { label: 'Webhooks, Zapier and Make', href: '/integrations/zapier-make' },
  },
  {
    term: 'HMAC signature',
    slug: 'hmac-signature',
    definition: 'A code computed from a message and a shared secret. The receiver recomputes it and compares, which proves the message came from someone who knows the secret and was not changed on the way.',
  },
  {
    term: 'Omnichannel',
    slug: 'omnichannel',
    definition: 'Serving customers across several channels (website, WhatsApp, Telegram) with one shared history and one set of rules.',
    inCrescelo: 'The website widget and hosted page work on every plan; WhatsApp and Telegram are available on the Agency / Scale plan, using the same assistant.',
    link: { label: 'WhatsApp and Telegram', href: '/product/messaging-channels' },
  },
  {
    term: 'Chat widget',
    slug: 'chat-widget',
    definition: 'The chat window that appears on a website, usually added with a single script tag. A good widget loads without blocking the page.',
    inCrescelo: 'One line of code adds the widget to WordPress, Shopify, Webflow, Wix, Squarespace or plain HTML.',
    link: { label: 'Website chat widget', href: '/product/website-widget' },
  },
  {
    term: 'Playground (testing studio)',
    slug: 'playground',
    definition: 'A sandbox where you chat with your assistant as a visitor would before it goes live, to find gaps in its knowledge.',
    inCrescelo: 'The public playground lets you add your own document and quiz an assistant; inside your account the Testing Studio does the same for your live assistant.',
    link: { label: 'Try the playground', href: '/playground' },
  },
];

export const glossaryBySlug = (slug: string): GlossaryTerm | undefined => GLOSSARY.find((g) => g.slug === slug);
