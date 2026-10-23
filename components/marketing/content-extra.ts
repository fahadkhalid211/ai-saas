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
      kicker: 'No more "I will check and get back to you"',
      title: 'Knowledge assistant',
      body: 'Answers from your own documents, pages and notes — instantly, accurately, and with the source shown.',
      cta: "Let's answer",
      href: '#carousel',
      tone: 'lav',
    },
    {
      id: 'book',
      kicker: 'From "interested" to "confirmed" in one chat',
      title: 'Booking engine',
      body: 'Shows real available slots inside the conversation and double-checks each one before confirming.',
      cta: "Let's book",
      href: '#playground',
      tone: 'mint',
    },
    {
      id: 'handover',
      kicker: 'The right person, at exactly the right moment',
      title: 'Live handover',
      body: 'Your team steps into the same conversation, with the full history visible. No context lost.',
      cta: "Let's hand over",
      href: '#how-it-works',
      tone: 'lime',
    },
  ] as ToolCard[],
};

/* ------------------------------ Behind the scenes ------------------------------ */

export const BEHIND = {
  eyebrow: 'Always on',
  titleLines: ['Working while you sleep,', 'ready when you wake'],
  body: 'While you are with a client, in a meeting, or off the clock, Crescelo handles the enquiry, offers the booking, and writes up the lead — so you come back to work that is already done.',
  cta: 'Try it now',
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
  title: 'One product. Every feature you need.',
  intro: 'Scroll through every capability in Crescelo — from knowledge ingestion to live team handover.',
  items: [
    { id: 'files', tag: 'Knowledge', title: 'Documents and files', body: 'PDF, Word and text files become searchable passages.', tone: 'lav', glyph: 'doc' },
    { id: 'urls', tag: 'Knowledge', title: 'Web pages and video', body: 'Add a website URL or a link to a video or audio file and its text is indexed.', tone: 'mint', glyph: 'page' },
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
    { id: 'security', tag: 'Control', title: 'Team roles and encryption', body: 'Team roles and encrypted keys.', tone: 'mint', glyph: 'shield' },
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
  titleEm: 'More of the work only you can do.',
  cards: [
    { title: 'Reclaim your time', body: 'Routine questions get answered without anyone stopping what they are doing. Your team stays focused.', stat: '24/7', statLabel: 'front desk', tone: 'lav' },
    { title: 'Kill the copy-paste', body: 'Booking details and lead info land in your inbox already filled in, ready to act on — no data entry.', stat: '0', statLabel: 'copy-paste steps', tone: 'lime' },
    { title: 'Catch visitors while they are interested', body: 'People ask questions when they are ready to buy. Answer them instantly instead of the next morning.', stat: '1', statLabel: 'chat to a booking', tone: 'pink' },
    { title: 'Grow without hiring', body: 'Add a second location or a new service by uploading content — not by adding headcount.', stat: '∞', statLabel: 'sources to add', tone: 'mint' },
    { title: 'See exactly what your website misses', body: 'Every question your assistant could not answer is logged. Fix it once, answer it forever.', stat: '100%', statLabel: 'of gaps logged', tone: 'amber' },
  ] as DiagonalCard[],
  note: 'Figures on these cards describe how the product works, not individual customer results.',
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
  titleLines: ['One assistant.', 'Live in four steps.'],
  echo: 'Live in four steps.',
  rows: [
    { id: 'connect', step: '01', title: 'Add your content', body: 'Upload documents, paste web pages, add a video or audio file. Crescelo reads and indexes everything so answers come straight from your material.', cta: 'Add knowledge', href: '#carousel', tone: 'lav' },
    { id: 'configure', step: '02', title: 'Set it up your way', body: 'Name the assistant, set the tone, add your services and hours, connect your own AI key. Takes about ten minutes.', cta: 'See the controls', href: '#playground', tone: 'mint' },
    { id: 'automate', step: '03', title: 'Put it live', body: 'Paste one script tag on your site or share the hosted page. Visitors start getting answers and bookings immediately.', cta: 'Try the demo', href: '#playground', tone: 'lime' },
    { id: 'grow', step: '04', title: 'Learn and improve', body: 'Check which questions went unanswered, fill the gaps, and add more channels as your business grows.', cta: 'See pricing', href: '#pricing', tone: 'pink' },
  ] as PathRow[],
};

/* ------------------------------ Comparison ------------------------------ */

export const COMPARE = {
  eyebrow: 'Compare',
  title: 'Not just another chatbot.',
  intro: 'Crescelo books real appointments, locks slots against your calendar, and answers strictly from your content. Here is how that compares to the alternatives.',
  columns: ['Crescelo', 'Chatbase', 'Typical FAQ bot', 'Basic live-chat widget'],
  rows: [
    { feature: 'Books appointments inside the chat', values: ['Yes', 'No', 'No', 'No'] },
    { feature: 'Answers from your own documents', values: ['Yes (and generates the lead with appointment booking)', 'Yes', 'No', 'No'] },
    { feature: 'AI provider pricing', values: ['0 cost plans available', 'Expensive tokens', 'Expensive tokens', 'Expensive tokens'] },
    { feature: 'WhatsApp and Telegram', values: ['Yes, easy connectors', 'Only in paid plans', 'No', 'No'] },
    { feature: 'Mobile apps (iOS & Android)', values: ['Yes', 'No', 'No', 'No'] },
    { feature: 'Captures leads from the conversation', values: ['Yes', 'Yes', 'No', 'No'] },
    { feature: 'Human takeover of a live chat', values: ['Yes', 'Yes', 'No', 'Yes'] },
  ],
  footnote: 'Based on each vendor\u2019s public documentation as of September 2026. Products change, so check each vendor for current features and plans.',
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
  intro: 'Test the live assistant engine. Each stage activates in real time as your question flows through grounded embeddings, reciprocal rank fusion, and mutex-locked action execution.',
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
  business: 'Apex Barbershop',
  disclaimer: 'Live interactive sandbox: test grounded answers, slot availability, and instant booking confirmation in real time.',
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
