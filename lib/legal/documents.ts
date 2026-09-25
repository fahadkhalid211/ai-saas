import { LEGAL } from './config';

export type Block = string | { list: string[] };
export interface LegalSection {
  id: string;
  heading: string;
  body: Block[];
}
export interface LegalDocument {
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  sections: LegalSection[];
}

const op = LEGAL.operatorLine;

/* ------------------------------------------------------------------ Privacy Policy ------------------------------------------------------------------ */

export const PRIVACY: LegalDocument = {
  slug: 'privacy',
  title: 'Privacy Policy',
  eyebrow: 'Legal',
  summary: 'What personal data Crescelo collects, why, who sees it, how long we keep it, and the rights you have over it.',
  sections: [
    {
      id: 'who-we-are',
      heading: '1. Who we are and what this policy covers',
      body: [
        `Crescelo is operated by ${op} ("Crescelo", "we", "us"). You can reach us at ${LEGAL.email}.`,
        'Crescelo lets businesses put an AI assistant on their website that answers visitor questions from the business’s own content, books appointments, captures leads and hands over to a person. This policy explains how we handle personal data in two different roles:',
        {
          list: [
            'As a controller of the data of people who visit crescelo.com, create an account, contact us or pay us (our "Website and Account Data").',
            'As a processor (service provider) of the data of people who talk to an assistant that one of our customers has installed on the customer’s own website, phone line or messaging channel (the "Visitor Data"). In that case the customer decides why and how the data is used, and the customer’s own privacy notice applies. We process it only on the customer’s instructions under our Data Processing Addendum.',
          ],
        },
        'If you are a visitor who used an assistant on another company’s website and want to see, correct or delete what you told it, contact that company first. We will help them respond.',
      ],
    },
    {
      id: 'data-we-collect',
      heading: '2. Personal data we collect',
      body: [
        'Depending on how you use Crescelo, we collect:',
        {
          list: [
            'Account data: name, work email address, password (stored only as a salted hash), optional profile picture and job title, workspace settings, and team members you invite.',
            'Sign-in with Google: your name, email address and profile picture, which Google sends us with your permission. We do not receive your Google password.',
            'Billing data: plan, invoices, billing name and email, tax details. Card details are entered on Stripe’s pages and are never stored by us.',
            'Content you upload or connect: documents, web pages, FAQs and other knowledge-base material, business hours, services and prices, and integration settings. AI provider keys and webhook secrets you give us are stored encrypted.',
            'Visitor Data (as a processor): the messages a visitor types or speaks to an assistant, the assistant’s replies, contact details a visitor chooses to give (name, email, phone), appointment bookings, call recordings or voicemails and transcripts if the customer enables the phone feature, and a random visitor identifier stored in the visitor’s browser.',
            'Technical and security data: IP address, browser type, device information, pages and API endpoints requested, timestamps, error details and a request identifier. Our operational logs record metadata only, not the text of chat messages or form entries.',
            'Communications: messages you send us through the contact form, support requests and emails.',
          ],
        },
        'We do not knowingly collect special-category data (such as health, biometric or political data). Customers must not use Crescelo to collect it (see the Acceptable Use Policy). If it reaches us anyway, we treat it as confidential and delete it on request.',
      ],
    },
    {
      id: 'why',
      heading: '3. Why we use personal data, and our legal basis',
      body: [
        'Where the GDPR or the UK GDPR applies, we rely on the following bases:',
        {
          list: [
            'To provide the service you asked for (create your account, run your assistants, send confirmations, bill you): performance of a contract.',
            'To keep Crescelo secure and working (fraud and abuse prevention, rate limiting, reCAPTCHA, error diagnosis, audit trails): our legitimate interests in protecting the service and our customers.',
            'To answer your messages and give support: performance of a contract or our legitimate interests.',
            'To send product and security notices about your account: performance of a contract and our legitimate interests. We send marketing email only if you ask for it or the law allows it, and you can unsubscribe in every message.',
            'To meet legal obligations (tax records, responding to lawful requests): legal obligation.',
            'Anything else we ask your permission for: consent, which you can withdraw at any time.',
          ],
        },
        'We do not sell personal data. We do not share personal data for cross-context behavioural advertising. We do not use Website and Account Data or Visitor Data to train AI models. Customers who connect their own AI provider are bound by that provider’s terms on how it handles the text it receives (see section 5), so customers should choose a provider and plan whose data terms suit them.',
      ],
    },
    {
      id: 'ai',
      heading: '4. How the AI assistant handles data',
      body: [
        'When a visitor asks a question, the assistant searches the customer’s knowledge base, selects the most relevant passages and sends them, together with the question and recent turns of the conversation, to the AI model provider the customer has connected (for example Google Gemini, OpenAI, Anthropic, Groq or DeepSeek) to write a reply. The provider processes that text under the customer’s own agreement with it.',
        'Replies are generated automatically and can be wrong. Assistants are designed to say when they do not know and to offer a booking or a live person instead. Businesses using Crescelo are responsible for telling visitors they are talking to an AI and for reviewing important conversations. No decision with legal or similarly significant effect is made about a person solely by the assistant.',
      ],
    },
    {
      id: 'sharing',
      heading: '5. Who we share personal data with',
      body: [
        'We share personal data only as needed to run the service:',
        {
          list: [
            'Our sub-processors (hosting, database, caching, payments, email, sign-in and bot protection). The current list is at /subprocessors.',
            'The AI model provider the customer connects, as described above.',
            'The tools a customer connects (for example a webhook, Slack, Google Sheets or calendar). Data sent there is under the customer’s control and that tool’s own terms.',
            'Professional advisers, and authorities where the law requires it or to protect rights, safety and security.',
            'A buyer or successor if Crescelo is sold or reorganised, with the same protections for your data.',
          ],
        },
      ],
    },
    {
      id: 'transfers',
      heading: '6. International transfers',
      body: [
        `Our providers process data in several countries, including the United States and India. Where personal data leaves the European Economic Area, the United Kingdom or Switzerland, we rely on an appropriate safeguard, such as the European Commission’s Standard Contractual Clauses (with the UK Addendum where relevant), and on our providers’ own transfer mechanisms. You can ask us for a copy of the safeguard that applies.`,
      ],
    },
    {
      id: 'retention',
      heading: '7. How long we keep personal data',
      body: [
        {
          list: [
            'Account data: while your account is open, then deleted within 30 days of closure or of a verified deletion request.',
            'Knowledge base, conversations, leads and appointments: until the customer deletes them or closes the workspace, then deleted within 30 days. Customers control retention of their Visitor Data.',
            `Operational and security logs (metadata only): ${LEGAL.logRetentionDays} days, then deleted automatically.`,
            'Billing records: as long as tax and accounting law requires, usually several years.',
            'Support messages: up to two years after the matter is closed.',
            'Backups: deleted data drops out of encrypted backups as they rotate; we do not restore it into live systems except to recover from failure.',
          ],
        },
      ],
    },
    {
      id: 'security',
      heading: '8. Security',
      body: [
        'We protect personal data with measures that fit the risk, including encryption of traffic between your browser and our application, encryption of stored AI provider keys and secrets (AES-256-GCM), salted password hashing, optional two-factor sign-in, separation of each customer’s data by workspace, rate limiting and bot protection on public endpoints, and access and error logging. No system is perfectly secure. If a breach affecting your personal data occurs we will notify you and the relevant authority as the law requires.',
      ],
    },
    {
      id: 'rights',
      heading: '9. Your rights',
      body: [
        'Depending on where you live you may have the right to: access your personal data and receive a copy; correct it; delete it; restrict or object to processing; receive it in a portable format; withdraw consent; and complain to your data protection authority. Residents of California and some other US states may also ask what we collected, ask us to delete or correct it, and opt out of sale or sharing (we do neither), and we will not discriminate against you for using these rights.',
        `To use a right, email ${LEGAL.email} from the address on your account. We may need to verify your identity, and we aim to reply within 30 days (45 days where US law allows). If your data is Visitor Data, we will pass your request to the business whose assistant you used.`,
      ],
    },
    {
      id: 'cookies',
      heading: '10. Cookies and similar technologies',
      body: [
        'We use the cookies and browser storage needed to sign you in, keep the site secure and remember your preferences, and, only if you accept, Google Analytics to count visits. We do not use advertising or cross-site tracking cookies. Details and your choices are in our Cookie Policy at /cookies.',
      ],
    },
    {
      id: 'children',
      heading: '11. Children',
      body: [
        `Crescelo is a business service for people aged ${LEGAL.minimumAge} and over. We do not knowingly collect personal data from children. Businesses that use assistants must not direct them at children. If you believe a child has given us personal data, contact us and we will delete it.`,
      ],
    },
    {
      id: 'representatives',
      heading: '12. Representatives and complaints',
      body: [
        `Our contact for privacy matters is ${LEGAL.email}. We have not appointed a representative in the EU or UK; if you are in those regions you may contact us directly, and you also have the right to lodge a complaint with your local supervisory authority.`,
      ],
    },
    {
      id: 'changes',
      heading: '13. Changes to this policy',
      body: [
        'We will post any change on this page with a new "last updated" date and, for material changes, notify account holders by email or in the dashboard before they take effect.',
      ],
    },
  ],
};

/* ------------------------------------------------------------------ Terms of Service ------------------------------------------------------------------ */

export const TERMS: LegalDocument = {
  slug: 'terms',
  title: 'Terms of Service',
  eyebrow: 'Legal',
  summary: 'The agreement between you and Crescelo for using the website, the dashboard, the chat widget and the connected services.',
  sections: [
    {
      id: 'agreement',
      heading: '1. Agreement',
      body: [
        `These Terms are a contract between you and ${op} ("Crescelo", "we", "us"). By creating an account, installing the widget or otherwise using the service you agree to them, together with our Privacy Policy, Acceptable Use Policy, Cookie Policy and Data Processing Addendum. If you do not agree, do not use Crescelo.`,
        `Crescelo is for businesses and professionals. You must be at least ${LEGAL.minimumAge} and able to form a binding contract. If you sign up for an organisation, you confirm you have authority to bind it, and "you" means that organisation.`,
      ],
    },
    {
      id: 'service',
      heading: '2. The service',
      body: [
        'Crescelo provides tools to build an AI website assistant from your own content, embed it on your website or connect it to channels such as phone, WhatsApp and Telegram, take appointment bookings, capture leads, send them to tools you connect, and hand conversations over to a person. Features and limits depend on your plan. We may improve, change or retire features; if we remove a paid feature in a way that materially harms you, we will tell you and, where you have prepaid, refund the unused part of that period.',
        'You bring your own AI model provider account ("BYOK"). Crescelo does not add a markup to AI usage: the provider bills you directly, and your use of that provider is governed by its terms. Crescelo is not responsible for the provider’s pricing, availability, output or data handling.',
      ],
    },
    {
      id: 'accounts',
      heading: '3. Your account',
      body: [
        'Give accurate information and keep it up to date. Keep your password, session and API keys confidential, use two-factor sign-in where offered, and tell us straight away at ' + LEGAL.email + ' if you suspect unauthorised access. You are responsible for activity under your account and for the people you invite. You may not share an account between unrelated businesses or resell access unless you are on a plan that allows agencies to manage client workspaces.',
      ],
    },
    {
      id: 'your-content',
      heading: '4. Your content and your responsibilities',
      body: [
        'You keep all rights in the documents, data, brand assets and other content you provide ("Your Content") and in the conversations and leads your assistants collect ("Visitor Data"). You give us a worldwide, non-exclusive licence to host, copy, index, process and display Your Content only to provide and secure the service and as these Terms allow.',
        'You are responsible for Your Content and for how you use the service, including that you:',
        {
          list: [
            'have the rights and permissions to upload it and to have an AI process it;',
            'tell your visitors clearly that they are talking to an AI assistant, and give them a privacy notice that covers the data you collect through it;',
            'have a lawful basis, and obtain any consent the law requires, before collecting personal data, sending marketing, or recording or transcribing calls and voice messages (many places require every party’s consent to a recording);',
            'comply with the laws that apply to you and your messages, including data-protection, consumer, e-mail and telemarketing laws (for example GDPR, CAN-SPAM, TCPA and CASL);',
            'do not put special-category data, payment-card numbers, government identifiers or other highly sensitive data into knowledge bases or expect the assistant to collect them;',
            'review your assistant’s answers and set up escalation to a person where the stakes are high.',
          ],
        },
        'For Visitor Data you are the controller (or business) and we are your processor (service provider); the Data Processing Addendum applies.',
      ],
    },
    {
      id: 'ai-output',
      heading: '5. AI output',
      body: [
        'AI systems can produce answers that are incomplete, out of date or wrong. Crescelo grounds replies in your content and is designed to say when it does not know, but we do not promise that output is accurate, complete or fit for a particular purpose. Assistant output is not legal, medical, financial or other professional advice, and you must not present it as such or rely on it for emergencies or decisions that could seriously affect a person. You are responsible for what your assistant tells your visitors on your behalf.',
      ],
    },
    {
      id: 'acceptable-use',
      heading: '6. Acceptable use',
      body: [
        'You must follow our Acceptable Use Policy at /acceptable-use. We may investigate and remove content or suspend access that breaks it or the law, and may report unlawful activity to the authorities.',
      ],
    },
    {
      id: 'fees',
      heading: '7. Plans, fees and billing',
      body: [
        'Free trial and automatic renewal: every new account can start a 14-day free trial of all Growth features, once per business. To start it you add a payment card through Stripe and choose a plan; you are not charged during the trial. Unless you cancel before the trial ends, we charge the card automatically for the plan and billing period you chose on the day the trial ends, and then every month or year until you cancel. You can cancel at any time in the billing portal in your dashboard ("Cancel or manage"); if you cancel before the trial ends you are never charged. If a subscription ends, we pause your assistants; your dashboard stays available so you can resubscribe or export your data, and we keep your data for 30 days before deleting it under the Privacy Policy. We may end or change the trial, and may refuse it where we suspect abuse (for example repeated sign-ups by the same business).',
        'Paid plans (currently Starter, Growth and Agency / Scale) are described on our pricing page and are billed in advance, monthly or annually as you choose, through Stripe. Prices exclude taxes; you are responsible for applicable taxes and we may add them where required. Subscriptions renew automatically until cancelled. You can cancel at any time in the billing portal; cancellation takes effect at the end of the period already paid, and you keep access until then.',
        'Fees are non-refundable except where these Terms say otherwise or the law gives you a right to a refund. If a payment fails we may retry it and, after notice, suspend paid features. Usage beyond your plan’s included amounts (for example extra chat sessions) is billed at the rates shown when you enable it. We may change prices for future periods by giving at least 30 days’ notice; if you do not agree, cancel before the change takes effect.',
      ],
    },
    {
      id: 'third-parties',
      heading: '8. Third-party services and integrations',
      body: [
        'Crescelo can connect to services we do not control (AI providers, Google, Stripe, Slack, WhatsApp, Telegram, calendars, email and telephony providers). Using them is subject to their terms and to your own account with them. We are not responsible for them, for outages, or for data you choose to send to them.',
      ],
    },
    {
      id: 'ip',
      heading: '9. Our intellectual property and feedback',
      body: [
        'Crescelo, including its software, design, text, logos and documentation, belongs to us and our licensors and is protected by law. We give you a limited, non-exclusive, non-transferable right to use the service during your subscription. You may not copy, sell, reverse engineer or build a competing product from it, except where the law lets you. If you send us ideas or feedback we may use them freely without payment or credit.',
      ],
    },
    {
      id: 'confidentiality',
      heading: '10. Confidentiality',
      body: [
        'Each of us will keep the other’s non-public information confidential, use it only for the purposes of these Terms, and protect it with reasonable care, except for information that is public, already known, independently developed, or that must be disclosed by law.',
      ],
    },
    {
      id: 'availability',
      heading: '11. Availability and support',
      body: [
        'We work to keep Crescelo available and secure, but the service is provided without a guaranteed uptime unless a written agreement says otherwise. There will be maintenance and occasional interruptions, and services we depend on can fail. Support is by email at ' + LEGAL.email + '.',
      ],
    },
    {
      id: 'suspension',
      heading: '12. Suspension and termination',
      body: [
        'You may stop using Crescelo and close your account at any time. We may suspend or end your access if you materially breach these Terms, if required by law, if you do not pay, or if your use threatens the security or operation of the service or other customers; where practical we will tell you first and give you a chance to fix the issue. After termination you may export your data for 30 days; after that we delete it as described in the Privacy Policy. Sections that by nature should survive (ownership, payment obligations, disclaimers, liability, indemnity, governing law) continue after termination.',
      ],
    },
    {
      id: 'warranty',
      heading: '13. Disclaimers',
      body: [
        'To the fullest extent the law allows, the service is provided "as is" and "as available". We do not give any warranty of merchantability, fitness for a particular purpose, non-infringement, accuracy or uninterrupted or error-free operation. Nothing in these Terms excludes any warranty or right that cannot legally be excluded.',
      ],
    },
    {
      id: 'liability',
      heading: '14. Limitation of liability',
      body: [
        'To the fullest extent the law allows: (a) we are not liable for indirect, incidental, special, consequential or punitive damages, or for lost profits, revenue, goodwill, data or business opportunities, even if we were told they were possible; and (b) our total liability for all claims arising from the service or these Terms is limited to the amount you paid us in the 12 months before the event that gave rise to the claim (or USD 100 if you have paid nothing).',
        'Nothing in these Terms limits liability for death or personal injury caused by negligence, for fraud or fraudulent misrepresentation, or for anything else that cannot be limited by law.',
      ],
    },
    {
      id: 'indemnity',
      heading: '15. Your indemnity',
      body: [
        'You will defend and compensate us and our personnel against third-party claims, losses and reasonable costs arising from Your Content, your Visitor Data collection, your breach of these Terms or of the law, or your assistant’s statements made on your behalf, except to the extent caused by our breach of these Terms.',
      ],
    },
    {
      id: 'law',
      heading: '16. Governing law and disputes',
      body: [
        `These Terms and any dispute about them are governed by ${LEGAL.governingLaw}, without regard to conflict-of-law rules. Before starting a formal proceeding, each of us will try in good faith to resolve the dispute by written notice and discussion for 30 days. If it is not resolved, the dispute will be decided by ${LEGAL.courts}, and each of us submits to their jurisdiction. Either of us may seek urgent relief from any court to protect intellectual property or confidential information. If you are a consumer, you keep any mandatory rights you have under the law of the country where you live.`,
      ],
    },
    {
      id: 'general',
      heading: '17. General',
      body: [
        'These Terms, with the documents they refer to, are the whole agreement about the service and replace earlier understandings. If part of them is unenforceable, the rest stays in force. Not enforcing a right is not a waiver of it. You may not transfer your rights without our written consent. We may transfer ours, including to a company formed to run Crescelo or as part of a sale or reorganisation; if that happens we will tell you, and the new operator takes over these Terms and our Privacy Policy commitments. Neither of us is liable for delay or failure caused by events beyond reasonable control. You may not use the service in breach of applicable export-control or sanctions laws. Notices to you may be sent to your account email or posted in the dashboard; notices to us go to ' + LEGAL.email + '.',
        'We may update these Terms. We will post the new version here with a new date and, for material changes, give account holders at least 30 days’ notice. Continuing to use Crescelo after the change takes effect means you accept it.',
      ],
    },
  ],
};

/* ------------------------------------------------------------------ Cookie Policy ------------------------------------------------------------------ */

export const COOKIES: LegalDocument = {
  slug: 'cookies',
  title: 'Cookie Policy',
  eyebrow: 'Legal',
  summary: 'The cookies and browser storage Crescelo uses, what each is for and how to control them.',
  sections: [
    {
      id: 'what',
      heading: '1. What this covers',
      body: [
        'Cookies are small files a website stores in your browser. We also use similar browser storage (localStorage and sessionStorage). This policy covers crescelo.com and the Crescelo dashboard. It also describes what the chat widget stores on the websites of businesses that use it.',
        'We do not use advertising cookies or cross-site tracking. We use Google Analytics only if you accept it (section 3A); until then only the cookies in section 2 are set.',
      ],
    },
    {
      id: 'essential',
      heading: '2. Strictly necessary',
      body: [
        'These are needed for the service to work and are set without asking, as the law permits:',
        {
          list: [
            'kortex_admin_session (cookie, HttpOnly, secure): keeps you signed in to the dashboard. Expires when the session ends or after its set lifetime.',
            'crescelo_oauth (cookie, short-lived): protects the "Sign in with Google" step against forgery. Deleted when sign-in completes.',
            'Security and rate-limit signals: server-side records tied to your IP address, kept briefly, to stop abuse. No cookie is set for this.',
          ],
        },
      ],
    },
    {
      id: 'preferences',
      heading: '3. Preferences',
      body: [
        {
          list: [
            'kortex_theme and kortex_site_theme (localStorage): remember light or dark mode.',
            'kortex_onboarding_completed (localStorage): remembers that you finished the dashboard tour.',
          ],
        },
      ],
    },
    {
      id: 'analytics',
      heading: '3A. Analytics (only with your consent)',
      body: [
        'If you choose "Accept analytics" in the cookie notice, we load Google Analytics, which sets the cookies _ga and _ga_* (up to about 2 years) to count visits, see which pages are used and find problems. IP addresses are anonymised, and Google’s advertising and personalisation features are switched off. If you choose "Reject", Google Analytics is not loaded and no analytics cookies are set. You can change your choice at any time with "Cookie settings" in the footer of the website; withdrawing consent also deletes the analytics cookies.',
      ],
    },
    {
      id: 'widget',
      heading: '4. The chat widget on other websites',
      body: [
        'When a business adds the Crescelo assistant to its website, the widget stores a random visitor identifier (ai_ast_visitor_id, in localStorage) so the conversation can continue if you reload the page, and a conversation identifier in the same way. It does not contain your name or email and is not used for advertising. The business that installed the widget is responsible for its own cookie notice and for asking for consent where the law requires it.',
      ],
    },
    {
      id: 'third',
      heading: '5. Third-party services',
      body: [
        {
          list: [
            'Google reCAPTCHA (on sign-in, registration and contact forms): checks that a request comes from a person. Google may set cookies and process signals such as IP address and browser behaviour under its own privacy policy. We use it to protect the service, which is why it is treated as necessary for security.',
            'Stripe (on checkout and the billing portal, which Stripe hosts): sets cookies needed for secure payment and fraud prevention under Stripe’s own policy.',
            'Sign in with Google: when you choose it, Google’s pages may set their own cookies.',
          ],
        },
      ],
    },
    {
      id: 'control',
      heading: '6. Your choices',
      body: [
        'You can delete or block cookies and clear localStorage in your browser settings. If you block the strictly necessary ones you will not be able to sign in. Browser "Do Not Track" and Global Privacy Control signals are respected: because we do not sell or share personal data for advertising, there is nothing to opt out of.',
        `Questions: ${LEGAL.email}. Last updated ${LEGAL.lastUpdated}.`,
      ],
    },
  ],
};

/* ------------------------------------------------------------------ Acceptable Use ------------------------------------------------------------------ */

export const AUP: LegalDocument = {
  slug: 'acceptable-use',
  title: 'Acceptable Use Policy',
  eyebrow: 'Legal',
  summary: 'What you may and may not do with Crescelo. It applies to everyone who uses the service and to every assistant you deploy.',
  sections: [
    {
      id: 'principles',
      heading: '1. Principles',
      body: [
        'Use Crescelo to help real people get accurate answers and services. Do not use it to harm, deceive or exploit anyone, or to break the law. This policy is part of our Terms of Service.',
      ],
    },
    {
      id: 'prohibited',
      heading: '2. You must not',
      body: [
        {
          list: [
            'break any law or regulation, or help someone else to;',
            'create, upload or spread unlawful, defamatory, hateful, harassing, sexually explicit involving minors, or otherwise harmful content;',
            'pretend to be a person, a company or an official body you are not, or let visitors believe they are talking to a human when they are talking to an AI;',
            'send spam, unsolicited bulk messages or messages that breach e-mail, SMS or telemarketing law, or use leads captured by Crescelo in breach of the consent given;',
            'record, transcribe or monitor calls or conversations without the notices and consents the law requires;',
            'collect or process special-category data, payment-card data, passwords, government identifiers or other highly sensitive data through an assistant;',
            'direct an assistant at children, or use it to give medical, legal, financial or safety advice as if it were a qualified professional;',
            'upload content you do not have the right to use, including others’ copyrighted material, trade secrets or personal data;',
            'probe, scan or test the security of Crescelo or other customers’ assistants without our written permission, or try to access data that is not yours;',
            'overload, disrupt or bypass the rate limits, authentication or safeguards of the service, or use automated means to scrape it;',
            'use the service to build malware, phishing, scams, or to manipulate elections or run disinformation;',
            'resell, sublicense or white-label the service except as your plan allows, or use it to build a competing product;',
            'use it in a sanctioned country or for a sanctioned person, or for weapons, illegal drugs or other unlawful trade.',
          ],
        },
      ],
    },
    {
      id: 'ai',
      heading: '3. Responsible AI use',
      body: [
        'You must tell visitors when they are talking to an AI, offer a way to reach a person for anything important, keep human oversight over sensitive conversations, and correct or remove knowledge-base content that is wrong. You are responsible for what your assistant says on your behalf.',
      ],
    },
    {
      id: 'enforcement',
      heading: '4. Reporting and enforcement',
      body: [
        `Report abuse or a security issue to ${LEGAL.email}. If we find or reasonably suspect a breach we may warn you, remove content, limit features, suspend or end your account, and involve the authorities. Where practical we will tell you why and give you a chance to fix it first.`,
      ],
    },
  ],
};

/* ------------------------------------------------------------------ Data Processing Addendum ------------------------------------------------------------------ */

export const DPA: LegalDocument = {
  slug: 'dpa',
  title: 'Data Processing Addendum',
  eyebrow: 'Legal',
  summary: 'How Crescelo processes personal data on behalf of customers. It forms part of the Terms of Service and applies automatically when a customer uses Crescelo to process personal data.',
  sections: [
    {
      id: 'scope',
      heading: '1. Scope and roles',
      body: [
        `This Addendum applies to personal data in Customer Content and Visitor Data that ${op} ("Crescelo", the processor or service provider) processes for the customer ("Customer", the controller or business) through the service. Terms such as "personal data", "controller", "processor", "data subject" and "personal data breach" have the meanings in the GDPR and, where relevant, the UK GDPR, the CCPA/CPRA and similar laws ("Data Protection Laws").`,
        'For personal data of the Customer’s own team members and billing contacts, Crescelo acts as a controller as described in its Privacy Policy.',
      ],
    },
    {
      id: 'details',
      heading: '2. Details of the processing',
      body: [
        {
          list: [
            'Subject matter and purpose: hosting, indexing and processing Customer Content so the Customer’s assistants can answer visitors, book appointments, capture leads, hand conversations to people and deliver data to the Customer’s connected tools.',
            'Duration: the term of the agreement plus the deletion period in section 9.',
            'Categories of data subjects: the Customer’s website visitors, callers, leads and customers; the Customer’s staff.',
            'Types of personal data: names, contact details, messages and voice content, appointment details, IP address and device data, and any other data the visitor chooses to provide. The Customer must not submit special-category data.',
            'Nature of processing: storage, retrieval, transmission, analysis by AI models, and deletion.',
          ],
        },
      ],
    },
    {
      id: 'instructions',
      heading: '3. Instructions',
      body: [
        'Crescelo will process personal data only on the Customer’s documented instructions, which are these Terms, this Addendum, and the Customer’s use and configuration of the service, unless the law requires otherwise (in which case Crescelo will tell the Customer beforehand where permitted). Crescelo will tell the Customer if it believes an instruction breaches Data Protection Laws. The Customer confirms it has a lawful basis and has given all required notices to process the data, including that visitors are told they are talking to an AI.',
      ],
    },
    {
      id: 'confidentiality',
      heading: '4. Confidentiality and personnel',
      body: [
        'Crescelo will ensure that people authorised to process personal data are bound by confidentiality and only access it as needed to provide the service.',
      ],
    },
    {
      id: 'security',
      heading: '5. Security',
      body: [
        'Crescelo will keep appropriate technical and organisational measures, including: encryption of data in transit between users and the application; encryption of stored provider keys and secrets; hashed passwords; logical separation of each Customer’s data by workspace with access checks on every request; optional two-factor sign-in; rate limiting and bot protection; access, audit and error logging (metadata only); least-privilege access for personnel; and regular review of dependencies and configuration.',
      ],
    },
    {
      id: 'subprocessors',
      heading: '6. Sub-processors',
      body: [
        'The Customer gives general authorisation for Crescelo to use the sub-processors listed at /subprocessors, including the AI model provider the Customer connects. Crescelo will bind sub-processors to data-protection terms no less protective than this Addendum and remains responsible for their performance. Crescelo will post any new sub-processor on that page at least 14 days before it starts processing Customer personal data; the Customer may object on reasonable data-protection grounds within that period, and if the parties cannot resolve it the Customer may terminate the affected service and receive a pro-rata refund of prepaid fees.',
      ],
    },
    {
      id: 'assistance',
      heading: '7. Assistance',
      body: [
        'Taking into account the nature of the processing, Crescelo will reasonably help the Customer to respond to data-subject requests (the dashboard lets the Customer export and delete conversations, leads and documents), and to meet its obligations on security, breach notification, impact assessments and prior consultation. Crescelo may charge reasonable fees for assistance that goes beyond the normal operation of the service.',
      ],
    },
    {
      id: 'breach',
      heading: '8. Personal data breach',
      body: [
        'Crescelo will notify the Customer without undue delay, and where feasible within 72 hours, after becoming aware of a personal data breach affecting Customer personal data, and will give the information it has to help the Customer meet its own notification duties, updating it as the investigation continues.',
      ],
    },
    {
      id: 'deletion',
      heading: '9. Return and deletion',
      body: [
        `On termination the Customer may export its data for ${LEGAL.deletionDays} days. After that Crescelo will delete Customer personal data within a further ${LEGAL.deletionDays} days, except copies that the law requires it to keep (which stay protected) and backups, which are overwritten in the normal rotation. On request Crescelo will confirm deletion in writing.`,
      ],
    },
    {
      id: 'audit',
      heading: '10. Audits',
      body: [
        'Crescelo will give the Customer the information reasonably needed to show compliance with this Addendum and will allow and contribute to audits, including inspections, by the Customer or its appointed auditor, on reasonable written notice, no more than once a year (unless a regulator requires otherwise or after a breach), during business hours, under confidentiality and at the Customer’s cost.',
      ],
    },
    {
      id: 'transfers',
      heading: '11. International transfers',
      body: [
        'Crescelo may process personal data in countries outside the Customer’s. Where personal data subject to the GDPR is transferred to a country without an adequacy decision, the parties agree that the Standard Contractual Clauses (Commission Implementing Decision (EU) 2021/914), Module Two (controller to processor), are incorporated by reference, with: clause 7 (docking) included; clause 9(a) option 2 (general authorisation, 14 days’ notice); clause 11 optional language omitted; clause 17 option 1 governed by the law of Ireland; clause 18 courts of Ireland; Annex I as sections 2 and 3 above with the Customer as exporter and Crescelo as importer; and Annex II as section 5 above. For transfers subject to the UK GDPR, the UK International Data Transfer Addendum is incorporated in the same way. For Swiss transfers the same clauses apply with references read as to Swiss law.',
      ],
    },
    {
      id: 'us',
      heading: '12. US state laws',
      body: [
        'Where the CCPA/CPRA or similar law applies, Crescelo is a service provider/processor: it will not sell or share personal data, will not retain, use or disclose it outside the direct business relationship or for any purpose other than the business purposes in this Addendum, will not combine it with other data except as the law permits, will comply with applicable obligations and give the same level of protection, and will tell the Customer if it can no longer meet its obligations.',
      ],
    },
    {
      id: 'general',
      heading: '13. Order of precedence and contact',
      body: [
        `If this Addendum conflicts with the Terms on data protection, this Addendum prevails. Liability under it is subject to the limits in the Terms, except where the law or the Standard Contractual Clauses provide otherwise. Send questions or a signed copy request to ${LEGAL.email}. Last updated ${LEGAL.lastUpdated}.`,
      ],
    },
  ],
};

export const LEGAL_DOCUMENTS: Record<string, LegalDocument> = { privacy: PRIVACY, terms: TERMS, cookies: COOKIES, 'acceptable-use': AUP, dpa: DPA };
