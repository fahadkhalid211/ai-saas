/**
 * Blog posts system. Supports 200 topic-cluster articles and custom handcrafted posts.
 * Body text supports [label](/internal-path) and [label](https://external.example) links.
 * Factual, high-value, and SEO-optimized for service businesses.
 */

import allGeneratedPosts from './data/all-posts.json';
import { REWRITTEN_POSTS } from './rewritten';
import { seoDescription, seoTitle, withFurtherReading } from './seo';

export type BlogBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string; id: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'note'; text: string }
  | { type: 'table'; headers: string[]; rows: string[][] };

export interface BlogPost {
  slug: string;
  title: string;
  /** The <title> text: the title shortened to fit a search result. Filled in below for every post. */
  seoTitle?: string;
  /** Meta description, 140-160 characters. */
  description: string;
  excerpt: string;
  datePublished: string;
  dateModified: string;
  readMinutes: number;
  tags: string[];
  clusterId?: number;
  clusterName?: string;
  funnel?: 'TOFU' | 'MOFU' | 'BOFU';
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  /** Slugs of other posts to suggest at the end (internal linking). */
  related: string[];
  body: BlogBlock[];
  /** A templated placeholder article that has not been rewritten yet: kept reachable, but hidden from search engines, the hub, the feed and the sitemap. */
  thin?: boolean;
}

const DATE = '2026-09-25';

// Core handcrafted original posts preserved
const INITIAL_POSTS: BlogPost[] = [
  {
    slug: 'add-ai-chatbot-to-your-website',
    title: 'How to Add an AI Chatbot to Your Website: A Practical Checklist',
    description: 'What to prepare, how to install an AI chat widget on any website, and how to check it works before real visitors use it. A plain checklist for small businesses.',
    excerpt: 'Installing a chatbot takes minutes. Getting good answers takes preparation. Here is the order that works.',
    datePublished: DATE,
    dateModified: DATE,
    readMinutes: 6,
    tags: ['Getting started', 'Website chat', 'AI Website Chatbots'],
    clusterId: 1,
    clusterName: 'AI Website Chatbots',
    funnel: 'TOFU',
    related: ['ai-receptionist-vs-answering-service', 'stop-double-bookings-online'],
    body: [
      { type: 'p', text: 'An AI chatbot on your website can answer the same questions your team answers by phone and email all day: opening hours, prices, what a service includes, whether you have a free slot on Saturday. Installing one is quick. What decides whether it helps or annoys visitors is what you give it to work from and how you test it. This checklist follows the order that avoids the usual problems.' },
      { type: 'h2', id: 'write-down-answers', text: '1. Write down the answers first' },
      { type: 'p', text: 'A good assistant answers from your own content, not from general knowledge. Collect the pages, price lists, policies and FAQs you already have, and add the questions customers actually ask. Look at your last month of emails, calls and messages and list the ten most common questions. If the answer is not written down somewhere, the assistant cannot give it reliably.' },
      { type: 'ul', items: ['Services and prices, including what is not included', 'Opening hours, holidays, address and parking', 'Booking, cancellation and refund rules', 'Anything you never want it to promise (medical, legal or financial advice, discounts you have not approved)'] },
      { type: 'h2', id: 'choose-tool', text: '2. Choose a tool that says "I do not know"' },
      { type: 'p', text: 'The worst chatbot behaviour is inventing an answer. Look for a tool that restricts replies to your content and, when it cannot find an answer, offers a next step instead of guessing: a booking form or a way to reach a person. This is how [Crescelo](/product) works: replies come from your documents, and when it is unsure it offers to book a time or hand over to your team.' },
      { type: 'h2', id: 'connect-ai-provider', text: '3. Connect the AI provider you want to pay' },
      { type: 'p', text: 'Some tools bundle AI usage into their price; others let you bring your own key so the model provider bills you directly. The second option keeps the cost visible. Read [what bring-your-own-key means and when it saves money](/blog/bring-your-own-ai-key-byok-explained) before you decide, and compare current rates on the providers\' own pages, for example [OpenAI](https://openai.com/api/pricing/) and [Google Gemini](https://ai.google.dev/pricing).' },
      { type: 'h2', id: 'install', text: '4. Install the widget' },
      { type: 'p', text: 'Most widgets are one line of JavaScript pasted before the closing body tag. On WordPress, use a header and footer plugin or an HTML block rather than the text editor, which removes script tags; the [WordPress installation guide](/guides/add-ai-assistant-to-wordpress) walks through it, including what to do when the bubble does not appear. Shopify, Webflow, Wix and plain HTML sites use the same snippet in their custom code area.' },
      { type: 'h2', id: 'test', text: '5. Test it like a customer' },
      { type: 'ol', items: ['Ask your ten common questions in different words, including with typos.', 'Ask something that is not in your content and check it says it does not know.', 'Try a booking end to end and confirm the appointment and the confirmation e-mail arrive.', 'Ask for a person and check your team is notified.', 'Open the site on a phone. Make sure the chat window scrolls and does not cover the buttons visitors need.'] },
      { type: 'h2', id: 'be-clear', text: '6. Be clear that it is an AI' },
      { type: 'p', text: 'Tell visitors they are talking to an automated assistant and offer a way to reach a person. It builds trust, and in some places it is a legal requirement; for example, the EU AI Act sets transparency duties for systems that interact with people ([Article 50](https://artificialintelligenceact.eu/article/50/)). If you collect names or emails, link your privacy notice too. Our [privacy checklist for website chatbots](/blog/website-chatbot-gdpr-checklist) covers what to include.' },
      { type: 'h2', id: 'review', text: '7. Review what people ask, every week' },
      { type: 'p', text: 'The questions the assistant could not answer are a to-do list. Add the missing answers to your content and it improves the next day. After a few weeks you will know which questions cost you the most time and which pages of your site fail to answer them.' },
      { type: 'note', text: 'Ready to try it? [Start a 14-day free trial](/login?mode=register) or read how the [product](/product) works first.' },
    ],
  },
  {
    slug: 'ai-receptionist-vs-answering-service',
    title: 'AI Receptionist vs Answering Service: Which Fits a Small Service Business?',
    description: 'Compare an AI receptionist with a human answering service on hours, cost model, accuracy, booking and privacy, and see which suits salons, clinics and trades.',
    excerpt: 'Both catch the calls and chats you would otherwise miss. They differ in cost model, control and what happens on unusual requests.',
    datePublished: DATE,
    dateModified: DATE,
    readMinutes: 6,
    tags: ['Comparison', 'Small business', 'AI Receptionists'],
    clusterId: 5,
    clusterName: 'AI Receptionists',
    funnel: 'BOFU',
    related: ['add-ai-chatbot-to-your-website', 'stop-double-bookings-online'],
    body: [
      { type: 'p', text: 'If you run a salon, clinic, gym, agency or trade business, a missed call or unanswered message is often a lost booking. Two ways to cover those moments are a human answering service and an AI receptionist. Neither is right for everyone. This is how to choose.' },
      { type: 'h2', id: 'what-each-does', text: 'What each one does' },
      { type: 'p', text: 'A human answering service has people take messages or follow a script for your business, usually by phone. An AI receptionist is software that answers visitors on your website, and optionally on WhatsApp, Telegram or a phone line, from the content you give it. It can also book appointments and pass a conversation to a person.' },
      { type: 'h2', id: 'hours-and-cost', text: 'Hours and cost model' },
      { type: 'ul', items: ['Answering services typically charge per minute, per call or per month with allowances, and staffing after hours can cost more.', 'AI assistants are usually priced per plan with a number of included conversations, plus a per-conversation rate beyond that. Check whether AI model usage is bundled or billed separately; with a bring-your-own-key tool the provider bills you directly ([explained here](/blog/bring-your-own-ai-key-byok-explained)).', 'Look at total cost at your real volume, not the headline price. Our [pricing page](/pricing) shows included sessions and overage rates.'] },
      { type: 'h2', id: 'accuracy', text: 'Accuracy and control' },
      { type: 'p', text: 'A trained human can handle an odd request with judgement, but only knows what they were told. An AI assistant answers from your written content and is consistent, but it can only be as good as that content. Choose one that admits when it does not know rather than guessing, and review the unanswered questions to improve it.' },
      { type: 'h2', id: 'booking', text: 'Booking' },
      { type: 'p', text: 'An answering service usually takes a message and someone calls back. An assistant with booking can show real open times and confirm on the spot, with a check that two people cannot take the same slot. If you rely on appointments, this matters more than anything else on this list; see [how to stop double bookings](/blog/stop-double-bookings-online).' },
      { type: 'h2', id: 'privacy', text: 'Privacy and recording' },
      { type: 'p', text: 'Whichever you choose, ask where conversations are stored, who can see them, how long they are kept and which providers process them. If you record calls, many places require every party\'s consent to a recording, so check the rules where your customers are. See how we handle this in our [Privacy Policy](/privacy) and [Data Processing Addendum](/dpa).' },
      { type: 'h2', id: 'which', text: 'Which should you pick?' },
      { type: 'ul', items: ['Mostly phone calls with complex, sensitive conversations: consider a human service, or an assistant that hands over quickly.', 'Mostly website and messaging questions, plus bookings, often outside opening hours: an AI receptionist is a strong fit.', 'Both: use the assistant for the routine 80 percent of questions you can write down and route the rest to a person.'] },
      { type: 'note', text: 'See how it looks for your industry on the [use cases page](/use-case), or [start a 14-day free trial](/login?mode=register).' },
    ],
  },
  {
    slug: 'stop-double-bookings-online',
    title: 'How to Stop Double Bookings on Your Website (and Why It Happens)',
    description: 'Why two visitors can book the same appointment slot, how slot locking and a final check prevent it, and how to keep your calendar in sync with online bookings.',
    excerpt: 'Two people click the same time within the same second. Only one should get it. Here is how good booking systems make sure of that.',
    datePublished: DATE,
    dateModified: DATE,
    readMinutes: 5,
    tags: ['Booking', 'How it works', 'AI Appointment Booking'],
    clusterId: 2,
    clusterName: 'AI Appointment Booking',
    funnel: 'MOFU',
    related: ['ai-receptionist-vs-answering-service', 'add-ai-chatbot-to-your-website'],
    body: [
      { type: 'p', text: 'A double booking looks like a small annoyance and feels like a big one: a customer arrives and the time is taken, or you apologise and lose the sale. It usually is not carelessness. It is a timing problem in how the booking system checks availability.' },
      { type: 'h2', id: 'why', text: 'Why it happens' },
      { type: 'p', text: 'Booking a slot has two steps: check that it is free, then save the booking. If two visitors run the check at nearly the same moment, both see "free", and both go on to save. Without protection, the system happily stores both. The busier the calendar, and the more channels you take bookings from (website chat, phone, messaging), the more likely this becomes.' },
      { type: 'h2', id: 'how-prevented', text: 'How it is prevented' },
      { type: 'ul', items: ['Check again at the moment of confirming, not only when showing the times. If the slot was just taken, offer the next available time.', 'Lock the slot while the booking is being saved, so the second request has to wait and then sees the slot is gone. On systems running on several servers the lock must be shared between them, otherwise two servers can each think they hold it.', 'Let the database enforce it too, with a rule that no two bookings can share a slot, as a final safety net.'] },
      { type: 'p', text: 'Crescelo does the final check and locks each slot as it books; the [calendar booking guide](/support/calendar-booking) explains what happens if a slot is taken while a visitor is choosing.' },
      { type: 'h2', id: 'calendar', text: 'Keeping your own calendar in step' },
      { type: 'p', text: 'Most double bookings that customers actually notice come from two systems that do not know about each other, for example an online booking tool and a paper diary. Subscribe your calendar app to the booking feed so every online booking appears there. Google explains how to [add a calendar by URL](https://support.google.com/calendar/answer/37100), and Outlook and Apple Calendar support the same iCalendar (.ics) format. A subscribed feed is read-only: block time in the booking tool\'s own availability settings rather than by adding events in your calendar. Two-way sync is on our [roadmap](/roadmap), and we say so plainly.' },
      { type: 'h2', id: 'good-habits', text: 'Habits that help' },
      { type: 'ul', items: ['Add buffer time between appointments so a small overrun does not cascade.', 'Send confirmations and reminders with a link to reschedule; fewer no-shows and fewer phone calls.', 'Take every booking through one system, then look at that single calendar.'] },
      { type: 'note', text: 'Want booking inside your website chat? See the [product features](/product) or [start a 14-day free trial](/login?mode=register).' },
    ],
  },
  {
    slug: 'bring-your-own-ai-key-byok-explained',
    title: 'Bring Your Own AI Key (BYOK): What It Is and When It Saves Money',
    description: 'BYOK lets you connect your own OpenAI, Gemini, Claude or Groq key to a chatbot so the AI provider bills you directly. Learn how it works and what to watch for.',
    excerpt: 'With bring-your-own-key, the chatbot company charges for the software and your AI provider charges for usage. Here is what that means in practice.',
    datePublished: DATE,
    dateModified: DATE,
    readMinutes: 5,
    tags: ['Pricing', 'AI providers', 'AI Website Chatbots'],
    clusterId: 1,
    clusterName: 'AI Website Chatbots',
    funnel: 'BOFU',
    related: ['add-ai-chatbot-to-your-website', 'website-chatbot-gdpr-checklist'],
    body: [
      { type: 'p', text: 'Every AI chatbot needs a language model behind it, and running that model costs money per use. There are two common ways a chatbot product handles it. Either the AI cost is bundled into the plan, or you connect your own account with an AI provider and pay them directly. The second approach is called bring your own key, or BYOK.' },
      { type: 'h2', id: 'how-it-works', text: 'How BYOK works' },
      { type: 'ol', items: ['You create an account with an AI provider such as OpenAI, Google Gemini, Anthropic, Groq or DeepSeek, and create an API key.', 'You paste the key into the chatbot product\'s settings. It is stored encrypted and used only to send your assistant\'s requests.', 'The provider bills you for usage at its own rates. The chatbot company bills a separate plan fee for the software.'] },
      { type: 'p', text: 'Crescelo works this way: we add no markup to model usage, and the [connector guides](/support/ai-connectors) show the steps for each provider.' },
      { type: 'h2', id: 'benefits', text: 'Why people choose it' },
      { type: 'ul', items: ['Visible costs: usage shows up in your provider\'s dashboard, not inside a bundled price.', 'Choice: switch model or provider as prices and quality change, or use a free tier while you test.', 'Data terms you can pick: different providers and plan types handle data differently, so you can choose one that fits your requirements.'] },
      { type: 'h2', id: 'watch-for', text: 'What to watch for' },
      { type: 'ul', items: ['You are responsible for the key: keep it secret, set spending limits with the provider, and revoke it if it leaks.', 'Provider rate limits and outages affect your assistant; know where to see them.', 'Rates change. Check the provider\'s current pricing pages, for example [OpenAI API pricing](https://openai.com/api/pricing/), [Gemini API pricing](https://ai.google.dev/pricing) and [Anthropic pricing](https://www.anthropic.com/pricing), rather than relying on a blog post, including this one.'] },
      { type: 'h2', id: 'estimate', text: 'Estimating your cost' },
      { type: 'p', text: 'A typical exchange sends the visitor\'s question, a few passages from your content and recent messages, then receives a short reply. Models bill by the amount of text in and out, so shorter, well-organised content costs less. Start with a small number of conversations, watch the provider\'s usage page for a week, and multiply. Then compare the total with a bundled plan at the same volume; our [pricing page](/pricing) lists the included conversations and overage rates for the software part.' },
      { type: 'h2', id: 'privacy', text: 'Privacy note' },
      { type: 'p', text: 'With BYOK, the text of conversations is processed by the provider you chose under your agreement with it. Read its data terms and mention it in your privacy notice; see our [privacy checklist](/blog/website-chatbot-gdpr-checklist) and the [list of sub-processors](/subprocessors).' },
      { type: 'note', text: 'Set up your first assistant with a [14-day free trial](/login?mode=register).' },
    ],
  },
  {
    slug: 'website-chatbot-gdpr-checklist',
    title: 'Is Your Website Chatbot GDPR-Friendly? A Practical Privacy Checklist',
    description: 'A plain-language checklist for using an AI chatbot on your website: notices, lawful basis, data retention, processors, cookies and visitor rights. Not legal advice.',
    excerpt: 'A chatbot collects personal data the moment someone types their name. Here is what to have in place, in plain language.',
    datePublished: DATE,
    dateModified: DATE,
    readMinutes: 7,
    tags: ['Privacy', 'Compliance', 'Lead Generation'],
    clusterId: 3,
    clusterName: 'Lead Generation',
    funnel: 'MOFU',
    related: ['bring-your-own-ai-key-byok-explained', 'add-ai-chatbot-to-your-website'],
    body: [
      { type: 'note', text: 'This is general information, not legal advice. Rules differ by country and situation; ask a qualified adviser about yours.' },
      { type: 'p', text: 'When a visitor chats with an assistant on your site, they may share names, emails, phone numbers or details about their situation. Under laws such as the EU and UK GDPR, that is personal data, and you are usually the "controller" responsible for it, while the chatbot vendor acts as your "processor". This checklist covers the practical steps.' },
      { type: 'h2', id: 'tell-people', text: '1. Tell people what is happening' },
      { type: 'ul', items: ['Say it is an AI assistant, so no one thinks they are speaking to a person.', 'Show a short notice in or near the chat about storing and processing messages, with a link to your privacy policy.', 'Explain in your privacy policy what you collect through the chat, why, how long you keep it and who processes it.'] },
      { type: 'h2', id: 'lawful-basis', text: '2. Have a lawful basis' },
      { type: 'p', text: 'You need a reason recognised by law to process the data, such as performing a contract, a legitimate interest, or consent. Answering a customer\'s question or booking their appointment often falls under contract or legitimate interest; sending marketing usually needs consent. The [UK ICO guidance on lawful bases](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/) and the [European Commission\'s data protection pages](https://commission.europa.eu/law/law-topic/data-protection_en) explain the options.' },
      { type: 'h2', id: 'processor', text: '3. Sign a processing agreement with your vendor' },
      { type: 'p', text: 'GDPR requires a written agreement with anyone who processes personal data for you. Ours is the [Data Processing Addendum](/dpa), which applies automatically and lists the [sub-processors](/subprocessors) we use. If you connect your own AI provider, that provider is also part of the chain, so read its data terms.' },
      { type: 'h2', id: 'minimise', text: '4. Collect less, keep it shorter' },
      { type: 'ul', items: ['Ask only for what you need to help: usually a name and one contact method.', 'Tell visitors not to enter sensitive details such as health information or card numbers in the chat, and do not build flows that ask for them.', 'Set a retention period, and delete conversations and leads you no longer need.'] },
      { type: 'h2', id: 'cookies', text: '5. Cookies and browser storage' },
      { type: 'p', text: 'Chat widgets often keep an identifier in the browser so a conversation continues after a reload. Describe it in your cookie policy and, where the law requires, ask for consent before using anything that is not strictly necessary. Ours is described in the [Cookie Policy](/cookies).' },
      { type: 'h2', id: 'rights', text: '6. Be ready for visitor requests' },
      { type: 'p', text: 'People can ask to see, correct or delete what you hold about them. Make sure you can find a person\'s conversations and leads and delete them on request. In Crescelo you can export and delete conversations, leads and documents from the dashboard.' },
      { type: 'h2', id: 'transfers', text: '7. Know where data goes' },
      { type: 'p', text: 'If your vendor or its providers are outside your region, there must be a valid transfer safeguard such as standard contractual clauses. Our [Privacy Policy](/privacy) describes the safeguards we use for international transfers.' },
      { type: 'h2', id: 'human', text: '8. Keep a person in the loop' },
      { type: 'p', text: 'Do not let a chatbot make decisions with legal or similarly significant effects on someone. Offer a way to reach a human and review conversations on sensitive topics. See [why an assistant should say "I do not know"](/blog/add-ai-chatbot-to-your-website) instead of guessing.' },
      { type: 'note', text: 'Questions about how Crescelo handles data? Read the [Privacy Policy](/privacy) or [contact us](/support/contact).' },
    ],
  },
];

// Combine generated posts, replacing any initial posts with higher priority
const postMap = new Map<string, BlogPost>();
/** Search-result polish that must not depend on how a post was written: display-length title and description, a clean excerpt, cited sources. */
function polish(p: BlogPost): BlogPost {
  const description = seoDescription(p.description);
  return {
    ...p,
    seoTitle: seoTitle(p),
    description,
    excerpt: description,
    body: withFurtherReading(p.body, p),
  };
}

(allGeneratedPosts as unknown as BlogPost[]).forEach((p) => {
  postMap.set(p.slug, { ...polish(p), thin: true });
});
[...INITIAL_POSTS, ...REWRITTEN_POSTS].forEach((p) => {
  postMap.set(p.slug, polish(p));
});

export const BLOG_POSTS: BlogPost[] = Array.from(postMap.values());

/** Articles that are written for readers and are listed in search: everything except the unrewritten placeholders. */
export const PUBLISHED_POSTS: BlogPost[] = BLOG_POSTS.filter((p) => !p.thin);

export function getPost(slug: string): BlogPost | undefined {
  return postMap.get(slug);
}

/** Newest first. */
export function sortedPosts(): BlogPost[] {
  return [...PUBLISHED_POSTS].sort((a, b) => {
    const dComp = b.datePublished.localeCompare(a.datePublished);
    if (dComp !== 0) return dComp;
    return a.title.localeCompare(b.title);
  });
}

export interface ClusterSummary {
  id: number;
  name: string;
  count: number;
}

/** Returns all unique topic clusters with their article counts. */
export function getClusters(): ClusterSummary[] {
  const map = new Map<number, { name: string; count: number }>();
  PUBLISHED_POSTS.forEach((p) => {
    if (p.clusterId && p.clusterName) {
      const cur = map.get(p.clusterId) || { name: p.clusterName, count: 0 };
      cur.count += 1;
      map.set(p.clusterId, cur);
    }
  });

  return Array.from(map.entries())
    .map(([id, info]) => ({ id, name: info.name, count: info.count }))
    .sort((a, b) => a.id - b.id);
}
