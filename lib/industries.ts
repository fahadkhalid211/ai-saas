/**
 * The industry pages (/use-case/<slug>): one real landing page for each type of business people search for ("AI chatbot for dental
 * clinics"), instead of tabs that share one address. Everything here is written to match what the product does today; where a
 * business in that industry would expect something the product does not do yet (staff-by-staff booking, deposits, SMS reminders,
 * two-way calendar sync), the page says so in `limits`. Sample chats are labelled as examples on the page.
 */

export interface IndustryFaq {
  q: string;
  a: string;
}

export interface Industry {
  slug: string;
  /** The tab on /use-case that used to hold this industry (kept so old #links still land somewhere sensible). */
  tabId: string;
  /** Short name used in links and breadcrumbs. */
  name: string;
  /** Plural description of who it is for, for sentences like "for ___". */
  audience: string;
  /** The page's H1: contains the phrase people search for. */
  title: string;
  intro: string;
  seoTitle: string;
  seoDescription: string;
  /** What goes wrong without an assistant: concrete, specific to the industry. */
  problems: { title: string; body: string }[];
  /** What the assistant does for this industry, in terms of features that exist. */
  does: { title: string; body: string }[];
  /** An example conversation, shown as an illustration (not a customer result). */
  chat: { visitor: string; assistant: string; source: string };
  /** What to add to the knowledge base first: the practical, industry-specific part. */
  knowledge: string[];
  /** Honest limits for this industry. */
  limits: string[];
  faq: IndustryFaq[];
  /** Slugs of blog articles that go deeper (all must exist; a test checks). */
  articles: string[];
  /** Product feature pages most relevant to this industry (slugs). */
  features: string[];
}

export const INDUSTRIES: Industry[] = [
  {
    slug: 'salons-barbershops',
    tabId: 'salons',
    name: 'Salons & barbershops',
    audience: 'salons, barbershops and spas',
    title: 'AI chatbot for salons and barbershops: answer clients and fill chairs while your hands are busy',
    intro:
      'Clients message at night, on lunch breaks and while you are mid-haircut. Crescelo answers from your own price list and hours, offers real open times and books them in the chat, so the client who asked first is the one who books.',
    seoTitle: 'AI Chatbot for Salons & Barbershops',
    seoDescription: 'Answer price, hours and walk-in questions and book appointments in the chat, even mid-haircut. An AI website assistant for salons, barbershops and spas.',
    problems: [
      { title: 'Calls and DMs go unanswered', body: 'You cannot pick up the phone with colour on your hands. The client messages the next salon, and whoever replies first gets the booking.' },
      { title: 'The same five questions, all day', body: 'Prices, walk-ins, parking, which products you use, whether you do bridal parties. Each one interrupts a client in the chair.' },
      { title: 'Back-and-forth to find a time', body: '"Does 3pm work?" turns into six messages. Every extra step is a chance for the client to give up.' },
    ],
    does: [
      { title: 'Answers from your menu', body: 'Upload your service list and prices. The assistant quotes them, and when something is not on your menu it says so instead of guessing.' },
      { title: 'Books in the chat', body: 'Set your opening hours and an appointment length and the assistant offers the times that are still free. Prefer Calendly or Cal.com? It sends the client to your booking link instead.' },
      { title: 'Confirms and reminds', body: 'Clients get a confirmation email with a private link to reschedule or cancel, and a reminder before the appointment, which cuts no-shows.' },
      { title: 'Hands over for the tricky ones', body: 'Bridal parties, colour corrections and complaints go to you with the whole conversation attached.' },
    ],
    chat: {
      visitor: 'Do you take walk-ins on Saturday, and how much is a skin fade?',
      assistant: 'Walk-ins are welcome on Saturdays from 10 to 4, though booking guarantees your time. A skin fade is $30. Want me to find you a slot?',
      source: 'Answered from the service and price list you upload',
    },
    knowledge: [
      'Your full service menu with prices (and what is included)',
      'Opening hours, including holidays and Saturday cut-offs',
      'Walk-in, late-arrival and cancellation policies',
      'Products you sell and brands you use',
      'Parking, access and how to find you',
      'Bridal, group and special-event packages',
    ],
    limits: [
      'The built-in booking picker uses one appointment length for everything. If your services differ a lot in length, use a Calendly or Cal.com link with an event type for each.',
      'Booking a specific stylist or chair is not built in today; the assistant can hand the client to your team instead.',
      'Deposits and payments are not part of the booking flow, and reminders go by email, not text message.',
    ],
    faq: [
      { q: 'Can the assistant book a particular stylist?', a: 'Not as a built-in feature today. The built-in picker books against your opening hours with one appointment length. If you use Calendly or Cal.com for staff, the assistant can send clients to that link, or hand the conversation to your team.' },
      { q: 'Will two clients be able to book the same time?', a: 'Crescelo checks every booking against the others it holds for that assistant and locks the slot when a client confirms, so two visitors cannot take the same time through the chat. It does not read appointments you add by hand to another calendar.' },
      { q: 'Does it take deposits for long services?', a: 'No. Payments and deposits are not part of the booking flow today. You can state your deposit policy in the knowledge base so the assistant explains it.' },
      { q: 'Can I try it on my own price list first?', a: 'Yes. The playground lets you add a price list and ask it questions like a client would, and the 14-day trial covers every Growth feature.' },
    ],
    articles: ['ai-booking-guide-barbershops-salons', 'barbershop-peak-hours-phone-loss', 'managing-walk-ins-vs-appointments-salons'],
    features: ['appointment-booking', 'ai-assistant', 'website-widget'],
  },
  {
    slug: 'dental-clinics',
    tabId: 'clinics',
    name: 'Dental clinics',
    audience: 'dental practices and clinics',
    title: 'AI chatbot for dental clinics: answer patient questions and book appointments after hours',
    intro:
      'New patients ask about insurance, emergencies and first-visit forms outside opening hours. Crescelo answers from your own practice documents, says when it does not know, captures new-patient details and offers appointment times, and hands anything clinical to your team.',
    seoTitle: 'AI Chatbot for Dental Clinics',
    seoDescription: 'Answer new-patient questions from your own documents, capture enquiries and book appointments in the chat, with a clear handover to your team.',
    problems: [
      { title: 'Front-desk time goes on repeat questions', body: 'Accepted insurance, what to bring, how to prepare for a procedure, how much a check-up costs. Reception answers the same questions every day.' },
      { title: 'Out-of-hours enquiries go cold', body: 'A patient with a toothache searches at 10pm. If nobody answers, they book with whichever practice does.' },
      { title: 'Forms and intake slow the first visit', body: 'Missing details at check-in push appointments back and leave chairs empty.' },
    ],
    does: [
      { title: 'Answers from your practice documents', body: 'Add your fee guide, insurance list, new-patient information and aftercare sheets. The assistant answers from them and says so when a question is outside them.' },
      { title: 'Books or collects the request', body: 'Offer open appointment times with the built-in picker or your Calendly or Cal.com link, or capture the patient\'s name, contact details and the reason for the visit as a lead for your team.' },
      { title: 'Knows when to step back', body: 'Set rules so questions about symptoms, medication or emergencies are not answered with advice: the assistant points to your emergency instructions and offers a person.' },
      { title: 'Hands over with context', body: 'When a patient asks for a person, your team joins the same chat and sees everything already said.' },
    ],
    chat: {
      visitor: 'Do you take new patients, and what should I bring to my first visit?',
      assistant: 'Yes, we are accepting new patients. Please bring photo ID, your insurance card and any recent x-rays. Would you like to book a first visit?',
      source: 'Answered from your new-patient information sheet',
    },
    knowledge: [
      'New-patient information and what to bring',
      'Fee guide and the insurance plans you accept',
      'Treatment explainers written in plain language (check-ups, fillings, whitening)',
      'Opening hours and your emergency instructions',
      'Cancellation and late policy',
      'Directions, parking and accessibility',
    ],
    limits: [
      'The assistant is not a clinician and should never be set up to diagnose or advise on treatment. Keep symptoms and emergencies routed to a person or your emergency number.',
      'Crescelo does not claim HIPAA or other certifications. Read the data processing addendum and sub-processors page before putting patient information through any chat tool.',
      'Booking is by opening hours with one appointment length, or through your Calendly or Cal.com link; it does not manage individual dentists or treatment rooms.',
    ],
    faq: [
      { q: 'Is Crescelo HIPAA compliant?', a: 'Crescelo does not claim HIPAA or any other certification. The security page lists exactly which controls are in place. If you handle protected health information, review the data processing addendum and sub-processors, and keep clinical details out of the chat by design.' },
      { q: 'Can it give advice about symptoms or medication?', a: 'It should not, and you control that: in Behavior and Rules you tell it what it must never discuss and when to offer a person. For a dental emergency it should point patients to your emergency instructions.' },
      { q: 'Can it collect new-patient details before the visit?', a: 'Yes. You choose the fields it asks for (name, phone, preferred time, reason for the visit), and each new lead is emailed to your team and can be sent to Slack, Google Sheets or a webhook.' },
      { q: 'Does it work with my practice management software?', a: 'There is no direct sync with practice management systems. Leads reach your team by email, Slack, Google Sheets or webhooks, which tools like Zapier or Make can pass on.' },
    ],
    articles: ['ai-patient-scheduling-dental-practices', 'dental-new-patient-intake-automation', 'hipaa-compliance-dental-chatbots'],
    features: ['lead-capture', 'appointment-booking', 'human-handover'],
  },
  {
    slug: 'home-services',
    tabId: 'trades',
    name: 'Home services & contractors',
    audience: 'contractors, roofers, plumbers, electricians and other home-service companies',
    title: 'AI chatbot for home services and contractors: capture every estimate request, day or night',
    intro:
      'Customers with a leak or a damaged roof contact several companies and hire the first to respond. Crescelo answers on your site around the clock, asks for the details you need to quote, and sends each job request to you with the conversation attached.',
    seoTitle: 'AI Chatbot for Home Services & Contractors',
    seoDescription: 'Capture estimate requests and job details around the clock, explain what you cover and book inspections. An AI assistant for contractors and trades.',
    problems: [
      { title: 'You are on a roof, not at a desk', body: 'Calls and web forms wait until the end of the day. By then the customer has called the next company on the list.' },
      { title: 'Quote requests arrive half-complete', body: 'A form that says "need a plumber" does not tell you the job, the address or how urgent it is, so you ring back just to ask basics.' },
      { title: 'Out-of-area and out-of-scope enquiries', body: 'You lose time on jobs outside your service area or trade that a few questions would have filtered out.' },
    ],
    does: [
      { title: 'Asks the questions you ask', body: 'Set the fields: type of job, address or postcode, urgency, photos you would like, preferred time. The assistant collects them in the conversation.' },
      { title: 'Explains what you cover', body: 'Add your services, service area and call-out fees. The assistant answers from them and says when a job is outside what you do.' },
      { title: 'Delivers jobs where you work', body: 'Each new lead triggers an email alert and can be posted to Slack, added to Google Sheets or sent to a webhook, linked to the full chat.' },
      { title: 'Books inspections or hands over', body: 'Offer inspection or estimate slots, or route urgent jobs to a person straight away.' },
    ],
    chat: {
      visitor: 'My ceiling is leaking after the storm. Can someone look at it today?',
      assistant: 'Sorry to hear that. Same-day visits are offered for active leaks. Could I take your address and a phone number so the team can call you back?',
      source: 'Answered from your emergency and service-area policy',
    },
    knowledge: [
      'Services you offer, and the ones you do not',
      'Service area (cities, postcodes or a radius)',
      'Call-out fees and how quotes work',
      'Emergency policy and typical response times (only what you can honestly promise)',
      'Licences, insurance and warranties you can state',
      'The questions you always ask before quoting',
    ],
    limits: [
      'The assistant collects details and offers times; it does not give a price for a specific job unless you have written that price down.',
      'There is no built-in dispatch or technician scheduling. Jobs reach you as leads, and bookings use your opening hours or a Calendly or Cal.com link.',
      'There is no direct CRM sync (for example ServiceTitan or Jobber); use email, Slack, Google Sheets or webhooks.',
    ],
    faq: [
      { q: 'Will it quote prices to customers?', a: 'Only prices that are in your knowledge base, such as a call-out fee or a standard price. For anything that needs a site visit it collects the details and passes the job to you rather than inventing a number.' },
      { q: 'Can it handle emergencies after hours?', a: 'It can collect the address and a phone number and alert your team by email or Slack, and you can write a rule that urgent jobs are handed to a person straight away. It cannot dispatch anyone, so state only the response time you can honestly stand behind.' },
      { q: 'Can customers send photos?', a: 'Ask for photos in the conversation and have customers follow up by email or by the number you give, or use a webhook to a tool that accepts attachments. Image uploads inside the chat are not a built-in feature today.' },
      { q: 'Does it work with Jobber, ServiceTitan or my CRM?', a: 'Not directly. Leads go to email, Slack, Google Sheets or a webhook, and Zapier or Make can pass them into most CRMs.' },
    ],
    articles: ['home-service-contractor-ai-lead-capture', 'roofing-emergency-lead-capture-storm-damage', 'plumbing-diagnostic-intake-chat'],
    features: ['lead-capture', 'ai-assistant', 'human-handover'],
  },
  {
    slug: 'real-estate',
    tabId: 'real-estate',
    name: 'Real estate',
    audience: 'real estate agents, brokerages and property managers',
    title: 'AI chatbot for real estate agents: qualify enquiries and book viewings at any hour',
    intro:
      'Buyers and renters browse listings in the evening and message several agents. Crescelo answers from your listing details, asks about budget and timing, and offers viewing times, so the enquiry is qualified and booked before it goes cold.',
    seoTitle: 'AI Chatbot for Real Estate Agents',
    seoDescription: 'Answer listing questions, qualify buyers and tenants and offer viewing times at any hour. An AI website assistant for agents and property managers.',
    problems: [
      { title: 'Enquiries arrive after hours', body: 'People browse listings at night and weekends. The agent who replies first usually gets the viewing.' },
      { title: 'Unqualified leads take your time', body: 'Calls from people with no budget, the wrong area or no timeline use up hours you could spend with serious buyers.' },
      { title: 'Listing questions repeat', body: 'Fees, pets, parking, lease length, school catchments: the answers are on the listing, but people still ask.' },
    ],
    does: [
      { title: 'Answers from your listings', body: 'Add listing sheets, brochures and your area guides. The assistant answers from them and says when something is not covered.' },
      { title: 'Qualifies in the conversation', body: 'It asks about budget, financing and timeline in a natural way and records the answers with the lead, so you start with context.' },
      { title: 'Offers viewing times', body: 'Use the built-in picker for your viewing hours or send visitors to your Calendly or Cal.com link, with confirmation and reschedule emails.' },
      { title: 'Delivers leads to you', body: 'Each enquiry arrives by email and can be sent to Slack, Google Sheets or a webhook, linked to the conversation.' },
    ],
    chat: {
      visitor: 'Is the two-bed on Elm Street still available, and can I see it this Saturday?',
      assistant: 'It is still available. Viewings are Saturday between 11 and 2. Are you pre-approved for financing, and when are you hoping to move?',
      source: 'Answered from your listing sheet and viewing hours',
    },
    knowledge: [
      'Listing sheets or brochures with price, size, fees and conditions',
      'Viewing hours and how to arrange access',
      'Your buying, selling or letting process in plain steps',
      'Area and neighbourhood information you want to stand behind',
      'Fees, deposits and application requirements for rentals',
      'The questions you always ask before a viewing',
    ],
    limits: [
      'There is no live MLS or listing-feed integration. The assistant knows what you add to its knowledge base, so update it when listings change.',
      'Viewing times come from your opening hours or a booking link; there is no per-agent calendar assignment in the built-in picker.',
      'Two-way calendar sync and direct CRM sync are not available yet. Leads go to email, Slack, Google Sheets or webhooks.',
    ],
    faq: [
      { q: 'Does it connect to the MLS or my listing portal?', a: 'No. It answers from the documents and pages you add. Re-upload or re-scan a listing page when details change, and remove sold listings so the assistant does not offer them.' },
      { q: 'Can it qualify buyers before they reach me?', a: 'Yes. You choose the questions (budget, financing, timeline, area) and the assistant asks them as part of the conversation. Answers arrive with the lead.' },
      { q: 'Can it book viewings with different agents?', a: 'The built-in picker books against one set of hours. For several agents, use a Calendly or Cal.com page that handles them, or hand the conversation to your team.' },
      { q: 'Can it answer in other languages?', a: 'It replies in the language the visitor writes in, within the abilities of the AI model you connect. Check that it handles the languages you need by testing in the playground.' },
    ],
    articles: ['ai-assistant-real-estate-lead-capture', 'schedule-property-showings-chat', 'after-hours-real-estate-lead-capture'],
    features: ['lead-capture', 'appointment-booking', 'knowledge-base'],
  },
  {
    slug: 'law-firms',
    tabId: 'legal',
    name: 'Law firms & advisers',
    audience: 'law firms, accountants and advisory practices',
    title: 'AI chatbot for law firms: handle first-round enquiries and book consultations',
    intro:
      'Most website enquiries need the same first answers: what you handle, how fees work and what happens next. Crescelo answers from your own practice information, collects the details you ask for and offers consultation times, and sends anything sensitive straight to a person.',
    seoTitle: 'AI Chatbot for Law Firms & Advisers',
    seoDescription: 'Answer first-round questions about services and fees, collect intake details and book consultations. An AI website assistant for law and advisory practices.',
    problems: [
      { title: 'Billable time goes on first-round calls', body: 'Partners and intake staff field the same questions about areas of practice, fees and availability.' },
      { title: 'Enquiries wait until Monday', body: 'People with a problem contact several firms. A slow first reply often decides who gets the instruction.' },
      { title: 'Intake details arrive incomplete', body: 'A contact form rarely captures the matter type, urgency and conflict-check basics you need.' },
    ],
    does: [
      { title: 'Answers from your practice information', body: 'Add your practice areas, fee explainers and process pages. The assistant answers from them and does not improvise legal content.' },
      { title: 'Collects intake details', body: 'Set the fields: matter type, urgency, preferred contact method, referral source. Each enquiry arrives by email with the conversation.' },
      { title: 'Books a consultation', body: 'Offer consultation slots with the built-in picker or your Calendly or Cal.com link, with confirmation and reschedule emails.' },
      { title: 'Routes sensitive matters to a person', body: 'Write rules so the assistant does not discuss case facts, and offers a person when a visitor asks or the matter is urgent.' },
    ],
    chat: {
      visitor: 'What do you charge for a first consultation on a licensing agreement?',
      assistant: 'A first consultation is 45 minutes at a fixed fee of $350. I cannot advise on your agreement here, but I can book you a call with the team. When suits you?',
      source: 'Answered from your fee schedule',
    },
    knowledge: [
      'Areas of practice, described in plain language',
      'Fee models and consultation fees (fixed, hourly, contingency) as you can state them',
      'What happens after an enquiry: conflict check, engagement, timeline',
      'Opening hours and consultation availability',
      'Jurisdictions you can and cannot act in',
      'A clear statement that the chat is not legal advice',
    ],
    limits: [
      'The assistant is not a lawyer and its answers are not legal advice. State this in your knowledge base and in the greeting, and keep case facts out of the chat.',
      'No attorney-client relationship should be assumed from a chat. Tell visitors not to share confidential details until you have confirmed you can act.',
      'There is no built-in conflict check or case-management sync; enquiries reach you by email, Slack, Google Sheets or webhooks.',
    ],
    faq: [
      { q: 'Does the assistant give legal advice?', a: 'It should not. It answers from the practice information you provide (areas, fees, process) and you can set rules that stop it discussing case facts, with a prompt to book a consultation or speak to a person.' },
      { q: 'Is the conversation confidential?', a: 'Treat website chat as non-privileged and tell visitors not to share sensitive details until you confirm you can act. Crescelo encrypts stored AI keys and rate-limits public endpoints, and publishes a data processing addendum and its sub-processors.' },
      { q: 'Can it run a conflict check?', a: 'No. It can collect the party names and matter type you need, and your team runs the check in your own system.' },
      { q: 'Can it quote fees?', a: 'Only fees you have written into the knowledge base, such as a fixed consultation fee. For anything else it explains how you charge and offers a consultation.' },
    ],
    articles: ['legal-intake-automation-conflict-checks', 'explaining-legal-fees-billing-models-chat', 'confidentiality-attorney-client-privilege-ai-chat'],
    features: ['knowledge-base', 'lead-capture', 'human-handover'],
  },
  {
    slug: 'fitness-studios',
    tabId: 'fitness',
    name: 'Fitness studios & gyms',
    audience: 'gyms, fitness studios and personal trainers',
    title: 'AI chatbot for fitness studios and gyms: turn website visitors into trial-class bookings',
    intro:
      'Prospective members leave when the timetable is buried in a PDF or a callback takes a day. Crescelo answers questions about classes, memberships and what to expect, and books a trial class right in the chat.',
    seoTitle: 'AI Chatbot for Fitness Studios & Gyms',
    seoDescription: 'Answer questions about classes and memberships and book trial classes in the chat. An AI website assistant for gyms, studios and personal trainers.',
    problems: [
      { title: 'The timetable is hard to read', body: 'Visitors cannot tell which class suits a beginner or when the next intro session is, so they leave without booking.' },
      { title: 'Membership questions need a person', body: 'Prices, contract length, freezing, guest passes and cancellation rules fill the front desk\'s day.' },
      { title: 'Leads from social and ads go cold', body: 'Someone enquires from an Instagram link at 9pm and hears back two days later, after they have joined elsewhere.' },
    ],
    does: [
      { title: 'Answers about classes and memberships', body: 'Add your timetable, price list and policies. The assistant answers from them, including which classes suit beginners.' },
      { title: 'Books a trial class', body: 'Offer trial or intro-class times through the built-in picker or your Calendly or Cal.com link, with a confirmation email and a reminder.' },
      { title: 'Captures the lead', body: 'Collect name, contact details and goal, and send each lead to email, Slack, Google Sheets or a webhook.' },
      { title: 'Hands over for sales conversations', body: 'When someone wants to talk through a package, a team member joins the same chat.' },
    ],
    chat: {
      visitor: 'When is your intro HIIT class this week, and can a total beginner come?',
      assistant: 'Intro HIIT is on Wednesday at 6:30pm and is beginner-friendly, with low-impact options. Would you like to reserve a trial spot?',
      source: 'Answered from your class timetable',
    },
    knowledge: [
      'Class timetable with levels and what each class involves',
      'Membership options, prices, contract length and freeze or cancellation rules',
      'Trial and guest-pass policy',
      'What to bring, changing rooms, parking and access',
      'Coach or trainer profiles (as text)',
      'Health and safety information you want shown before a first class',
    ],
    limits: [
      'The built-in picker books time slots, not class capacity. If you need to cap class numbers, use a booking tool such as Calendly or Cal.com and have the assistant send visitors to it.',
      'Memberships and payments are not taken in the chat, and reminders go by email, not text message.',
      'The assistant should not give personal medical or training advice; keep health questions for a person.',
    ],
    faq: [
      { q: 'Can it limit a class to a number of people?', a: 'Not in the built-in picker, which books time slots against your opening hours. Use Calendly or Cal.com for class capacity and let the assistant send visitors to that link.' },
      { q: 'Can it sell memberships?', a: 'It explains your options and captures the enquiry. Taking payment in the chat is not built in today.' },
      { q: 'Can it send reminders by text message?', a: 'No. Reminders are sent by email before the appointment.' },
      { q: 'Does it work on our Instagram or website?', a: 'It runs as a chat widget on your website with one script tag, and as a hosted business page you can link from social profiles. WhatsApp and Telegram are available on the Agency / Scale plan.' },
    ],
    articles: ['boutique-fitness-trial-class-booking-chat', 'ai-appointment-booking', 'conversational-rescheduling-cancellations'],
    features: ['appointment-booking', 'lead-capture', 'website-widget'],
  },
];

export const industryBySlug = (slug: string): Industry | undefined => INDUSTRIES.find((i) => i.slug === slug);

/** The industry page that replaces a tab of the /use-case page, for links such as /use-case#clinics. */
export const industryForTab = (tabId: string): Industry | undefined => INDUSTRIES.find((i) => i.tabId === tabId);

/** The industry whose page best fits an article, for the "where this fits" card at the end of an article. */
export function industryForArticle(slug: string, text: string): Industry | undefined {
  const t = `${slug} ${text}`.toLowerCase();
  const rules: [RegExp, string][] = [
    [/dental|dentist|patient|clinic|orthodon/, 'dental-clinics'],
    [/salon|barber|stylist|beauty|\bspa\b|hair/, 'salons-barbershops'],
    [/roof|plumb|electric|contractor|hvac|pest|landscap|home-service|trades?\b|handyman/, 'home-services'],
    [/real-estate|realtor|property|brokerage|showing|tenant|listing/, 'real-estate'],
    [/\blaw\b|legal|lawyer|attorney|solicitor|accountant|\bcpa\b|financial-advis|immigration|advisory/, 'law-firms'],
    [/fitness|gym\b|yoga|pilates|personal-train|studio class|trial-class/, 'fitness-studios'],
  ];
  for (const [re, slugName] of rules) if (re.test(t)) return industryBySlug(slugName);
  return undefined;
}
