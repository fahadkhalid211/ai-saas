/**
 * Copy and data for the second-generation sections (tools cards, video, carousel,
 * diagonal benefits, path rows, stories, comparison, playground).
 * Placeholders are labelled. Nothing here claims a certification or a real customer result.
 */

/* --------------------------- Tools (three cards) --------------------------- */

export interface ToolCard {
  id: 'answer' | 'book' | 'handover';
  kicker: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  tone: 'lav' | 'mint' | 'lime';
}

export const TOOLS = {
  eyebrow: 'The toolkit',
  titleLines: ['Tools to get you', 'answering, booking'],
  echo: 'and handing over',
  cards: [
    {
      id: 'answer',
      kicker: 'Never leave a question waiting',
      title: 'Knowledge assistant',
      body: 'Answers from your own documents, pages and notes, and says so when it does not know.',
      cta: "Let's answer",
      href: '#carousel',
      tone: 'lav',
    },
    {
      id: 'book',
      kicker: 'Turn interest into appointments',
      title: 'Booking engine',
      body: 'Offers real open slots inside the chat and checks each one again before confirming.',
      cta: "Let's book",
      href: '#playground',
      tone: 'mint',
    },
    {
      id: 'handover',
      kicker: 'A person when it matters',
      title: 'Live handover',
      body: 'Your team takes over the same conversation, with the earlier messages in view.',
      cta: "Let's hand over",
      href: '#how-it-works',
      tone: 'lime',
    },
  ] as ToolCard[],
};

/* ------------------------------ Behind the scenes ------------------------------ */

export const BEHIND = {
  eyebrow: 'Always on',
  titleLines: ['An assistant that works', 'while you sleep'],
  body: 'It answers the first question, offers the next step, and hands the conversation to you with everything already written down.',
  cta: 'Try and stop me',
  ctaHref: '#playground',
  caption: 'Lime: what your visitors experience. Dark: what runs behind it.',
  features: ['Grounded answers', 'Booking', 'Lead capture', 'Live takeover', 'Email reminders'],
  tech: ['Hybrid search', 'Embeddings', 'Re-ranking', 'Related words', 'OCR and extraction', 'Streaming replies', 'Encrypted keys'],
};

/* ------------------------------ Feature carousel ------------------------------ */

export interface CarouselFeature {
  id: string;
  title: string;
  body: string;
  tag: string;
  tone: 'lav' | 'mint' | 'lime' | 'pink' | 'amber' | 'coral';
  glyph: 'doc' | 'search' | 'words' | 'calendar' | 'bell' | 'chat' | 'page' | 'phone' | 'people' | 'inbox' | 'chart' | 'template' | 'key' | 'shield';
}

export const CAROUSEL = {
  eyebrow: 'Everything included',
  title: 'Yes, you can test here. And the rest!',
  intro: 'Every part of the product on one rail. Drag, swipe or use the arrows.',
  items: [
    { id: 'files', tag: 'Knowledge', title: 'Documents and files', body: 'PDF, Word and text files become searchable passages.', tone: 'lav', glyph: 'doc' },
    { id: 'urls', tag: 'Knowledge', title: 'Web pages and video', body: 'Add a website URL or a YouTube video and its transcript is indexed.', tone: 'mint', glyph: 'page' },
    { id: 'search', tag: 'Accuracy', title: 'Hybrid search', body: 'Meaning and keyword search are combined, then re-ranked.', tone: 'lime', glyph: 'search' },
    { id: 'words', tag: 'Accuracy', title: 'Related-word matching', body: '"Cost" finds your page on "pricing".', tone: 'pink', glyph: 'words' },
    { id: 'booking', tag: 'Booking', title: 'In-chat booking', body: 'Visitors pick a real slot and confirm without leaving the chat.', tone: 'amber', glyph: 'calendar' },
    { id: 'reminders', tag: 'Booking', title: 'Email confirmations', body: 'Confirmations and reminders go out by email, with a calendar feed.', tone: 'coral', glyph: 'bell' },
    { id: 'widget', tag: 'Channels', title: 'Website widget', body: 'One script tag puts the assistant on any site.', tone: 'lav', glyph: 'chat' },
    { id: 'hosted', tag: 'Channels', title: 'Hosted business page', body: 'A ready page for the business, with the assistant built in.', tone: 'mint', glyph: 'template' },
    { id: 'messaging', tag: 'Channels', title: 'WhatsApp and Telegram', body: 'The same assistant answers in your messaging apps.', tone: 'lime', glyph: 'phone' },
    { id: 'takeover', tag: 'Team', title: 'Live takeover', body: 'Take over a conversation as it happens, with a sound alert.', tone: 'pink', glyph: 'people' },
    { id: 'leads', tag: 'Team', title: 'Leads and gaps', body: 'Captured contacts and unanswered questions, in one inbox.', tone: 'amber', glyph: 'inbox' },
    { id: 'analytics', tag: 'Insight', title: 'Analytics', body: 'See conversations, bookings and leads over time.', tone: 'coral', glyph: 'chart' },
    { id: 'byok', tag: 'Control', title: 'Your own AI key', body: 'Bring your provider key. Model usage is billed by your provider.', tone: 'lav', glyph: 'key' },
    { id: 'security', tag: 'Control', title: 'Roles and 2FA', body: 'Team roles, two-factor sign-in and encrypted keys.', tone: 'mint', glyph: 'shield' },
  ] as CarouselFeature[],
};

/* ------------------------------ Diagonal benefits ------------------------------ */

export interface DiagonalCard {
  title: string;
  body: string;
  stat: string;
  statLabel: string;
  tone: 'lav' | 'mint' | 'lime' | 'pink' | 'amber';
}

export const DIAGONAL = {
  eyebrow: 'Why teams use it',
  titleLine: 'Less repeating yourself.',
  titleEm: 'More of the work that needs you.',
  cards: [
    { title: 'Save time', body: 'Routine questions are answered without anyone stopping what they are doing.', stat: '24/7', statLabel: 'front desk', tone: 'lav' },
    { title: 'Reduce manual work', body: 'Bookings and lead details arrive already filled in, ready to act on.', stat: '0', statLabel: 'copy-paste steps', tone: 'lime' },
    { title: 'Improve results', body: 'Visitors get an answer while they are still interested, at any hour.', stat: '1', statLabel: 'chat to a booking', tone: 'pink' },
    { title: 'Scale faster', body: 'Add a second site or a new service by adding content, not headcount.', stat: '∞', statLabel: 'sources to add', tone: 'mint' },
    { title: 'Decide with better information', body: 'Unanswered questions show you exactly what your website fails to explain.', stat: '100%', statLabel: 'of gaps logged', tone: 'amber' },
  ] as DiagonalCard[],
  note: 'Figures on these cards describe how the product works, not customer results.',
};

/* ------------------------------ Paths (how it works) ------------------------------ */

export interface PathRow {
  id: 'connect' | 'configure' | 'automate' | 'grow';
  step: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  tone: 'lav' | 'mint' | 'lime' | 'pink';
}

export const PATHS = {
  eyebrow: 'How it works',
  titleLines: ['One assistant.', 'Four steps to live.'],
  echo: 'Four steps to live.',
  rows: [
    { id: 'connect', step: '01', title: 'Connect', body: 'Add your documents, pages and links. Kortex reads and indexes them so answers come from your material.', cta: 'Add knowledge', href: '#carousel', tone: 'lav' },
    { id: 'configure', step: '02', title: 'Configure', body: 'Set the assistant name, tone, services, opening hours and your own AI provider key.', cta: 'See the controls', href: '#playground', tone: 'mint' },
    { id: 'automate', step: '03', title: 'Automate', body: 'Embed the widget or publish the hosted page. Visitors start getting answers and bookings.', cta: 'Try the demo', href: '#playground', tone: 'lime' },
    { id: 'grow', step: '04', title: 'Grow', body: 'Review conversations, fill the gaps it could not answer, and add channels as you need them.', cta: 'See pricing', href: '#pricing', tone: 'pink' },
  ] as PathRow[],
};

/* ------------------------------ Stories carousel ------------------------------ */

/** PLACEHOLDER stories. Replace every card with a real, permissioned customer story before launch. */
export const STORIES = {
  eyebrow: 'Customers',
  title: 'Stories of success',
  notice: 'Placeholder cards. Real customer stories will replace these before launch.',
  items: [
    { stat: 'XX%', label: 'placeholder result', name: 'Customer name', role: 'Role, Company', tone: 'lav' },
    { stat: 'XX hrs', label: 'placeholder result', name: 'Customer name', role: 'Role, Company', tone: 'lime' },
    { stat: 'XX×', label: 'placeholder result', name: 'Customer name', role: 'Role, Company', tone: 'pink' },
    { stat: '$XX', label: 'placeholder result', name: 'Customer name', role: 'Role, Company', tone: 'mint' },
    { stat: 'XX%', label: 'placeholder result', name: 'Customer name', role: 'Role, Company', tone: 'amber' },
  ] as { stat: string; label: string; name: string; role: string; tone: 'lav' | 'mint' | 'lime' | 'pink' | 'amber' }[],
};

/* ------------------------------ Comparison ------------------------------ */

/**
 * The competitor columns describe categories and Chatbase's general positioning in cautious terms.
 * PLACEHOLDER-VERIFY: check every competitor cell against the vendor's current public pages before launch.
 */
export const COMPARE = {
  eyebrow: 'Compare',
  title: 'How Kortex differs from other chatbot tools.',
  intro: 'A summary of approach, not a benchmark. Competitor details come from public information and should be re-checked before you rely on them.',
  columns: ['Kortex', 'Chatbase', 'Typical FAQ bot', 'Basic live-chat widget'],
  rows: [
    { feature: 'Books appointments inside the chat', values: ['Yes, with open-slot picker', 'Via integrations or links', 'Link out to a form', 'A human arranges it'] },
    { feature: 'Checks a slot again before confirming', values: ['Yes', 'Depends on the integration', 'No', 'No'] },
    { feature: 'Answers from your own documents', values: ['Yes, and says when it does not know', 'Yes', 'Fixed question list', 'Not a focus'] },
    { feature: 'AI provider pricing', values: ['Your own key, billed by your provider', 'Bundled into message credits', 'Varies', 'Per-seat plans'] },
    { feature: 'Captures leads from the conversation', values: ['Yes, email and phone are detected', 'Yes', 'Limited', 'Form fields'] },
    { feature: 'Human takeover of a live chat', values: ['Yes, with an alert', 'Yes', 'Often unsupported', 'Yes'] },
    { feature: 'WhatsApp and Telegram', values: ['Yes', 'Varies by plan', 'Varies', 'Varies'] },
  ],
  footnote: 'Marked "Depends" or "Varies" where capability differs by plan or setup. Verify competitor entries before publishing.',
};

/* ------------------------------ Pipeline + playground ------------------------------ */

export interface PipelineStage {
  id: 'input' | 'embed' | 'retrieve' | 'rerank' | 'answer' | 'action';
  label: string;
  short: string;
  detail: string;
}

export const PIPELINE: { eyebrow: string; title: string; intro: string; stages: PipelineStage[] } = {
  eyebrow: 'Under the hood',
  title: 'Watch it think.',
  intro: 'Send a message to the sample assistant. Each stage lights up as your question moves through the same steps the real product uses. The demo runs in your browser and nothing is saved.',
  stages: [
    { id: 'input', label: 'Visitor message', short: 'Message', detail: 'The question arrives from the widget or a messaging app.' },
    { id: 'embed', label: 'Understand', short: 'Understand', detail: 'The question is turned into a meaning vector and its keywords are read.' },
    { id: 'retrieve', label: 'Retrieve', short: 'Retrieve', detail: 'Meaning and keyword search look through your knowledge together.' },
    { id: 'rerank', label: 'Rank and dedupe', short: 'Rank', detail: 'The best passages are re-ordered and duplicates removed.' },
    { id: 'answer', label: 'Grounded answer', short: 'Answer', detail: 'The reply is written only from the chosen passages, with the source shown.' },
    { id: 'action', label: 'Book or capture', short: 'Act', detail: 'If the visitor wants to book, slots are offered and checked. Contact details become a lead.' },
  ],
};

export const PLAYGROUND = {
  eyebrow: 'Try it',
  business: 'Sample Barbershop',
  disclaimer: 'Demo with sample data. It runs in your browser: nothing is sent or saved.',
  starters: ['How much is a beard trim?', 'Are you open on Sundays?', 'Do you take walk-ins?', 'I want to book a haircut'],
  services: [
    { id: 'cut', name: 'Standard cut', minutes: 30, price: 35 },
    { id: 'beard', name: 'Beard trim', minutes: 20, price: 15 },
    { id: 'combo', name: 'Cut and beard', minutes: 45, price: 45 },
  ],
  hours: 'Mon–Fri 9:00–17:00, Sat 9:00–16:00, closed Sunday',
  knowledge: [
    { id: 'prices', source: 'Price list', text: 'A standard cut is $35 and takes about 30 minutes. A beard trim is $15 and takes 20 minutes. Cut and beard together is $45 and takes 45 minutes. Prices include tax.' },
    { id: 'hours', source: 'Opening hours', text: 'We are open Monday to Friday from 9:00 to 17:00 and Saturday from 9:00 to 16:00. We are closed on Sundays and public holidays.' },
    { id: 'walkins', source: 'Booking policy', text: 'Walk-ins are welcome when a chair is free, but booking ahead guarantees your time. Cancel or reschedule up to 24 hours before your visit at no charge.' },
    { id: 'deposit', source: 'Booking policy', text: 'A $10 deposit is taken when booking online and is deducted from your final bill. It is refundable until 24 hours before the visit.' },
    { id: 'parking', source: 'Find us', text: 'There is free street parking on Market Street and a public car park two minutes away. The shop is step-free and wheelchair accessible.' },
    { id: 'payment', source: 'Price list', text: 'We accept card and cash. Gift vouchers are available at the shop.' },
  ],
  /** Words treated as related for retrieval, mirroring the product's related-word matching. */
  synonyms: [
    ['cost', 'price', 'pricing', 'charge', 'fee', 'much', 'how much', 'rate'],
    ['open', 'hours', 'opening', 'close', 'closed', 'sunday', 'saturday', 'weekend', 'when'],
    ['walk', 'walk-in', 'walkin', 'drop', 'appointment', 'queue'],
    ['cancel', 'reschedule', 'refund', 'deposit', 'change'],
    ['park', 'parking', 'car', 'access', 'wheelchair', 'where', 'address', 'location'],
    ['pay', 'card', 'cash', 'voucher', 'gift', 'payment'],
    ['cut', 'haircut', 'trim', 'beard', 'shave'],
  ] as string[][],
};
