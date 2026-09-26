import { faq, h2, h3, note, ol, p, pillar, table, ul } from '../authoring';

export const PILLAR11 = [
  pillar({
    slug: 'reduce-bounce-rate-proactive-chat',
    title: 'How to Reduce Bounce Rate With Chat: Proactive Messages That Help Instead of Annoy',
    description: 'How to use proactive chat to cut bounce on service business pages: when to trigger, what to say, page-specific prompts, frequency limits and how to measure the effect.',
    primaryKeyword: 'reduce bounce rate chatbot',
    secondaryKeywords: ['proactive chat', 'website bounce rate service business', 'chatbot trigger rules', 'chat pop up best practices'],
    body: [
      p("A bounce is a visitor who arrives, looks at one page and leaves without doing anything. Some bounces are healthy: the visitor found what they needed, such as your phone number. Many are not: they had a question your page did not answer, could not find the price or were not sure the next step was for them. Chat can catch some of those visitors, but only if it is used carefully. A pop-up that fires the instant a page loads is an interruption, and it makes bounce worse. This guide explains what bounce rate does and does not tell you, when proactive chat helps, how to design triggers and messages that feel like service, how to limit frequency and how to measure whether it works."),

      h2("What bounce rate really tells you"),
      p("Bounce rate is the share of visits that end after a single page with no further interaction. Different analytics tools define it differently, and newer tools favour 'engagement' measures instead. A high bounce rate on a contact page may be fine if visitors call you. A high bounce rate on a pricing page is more worrying. Interpret it in the context of the page's job."),
      table(["Page", "High bounce may mean", "Response"], ["Home", "Unclear offer or wrong traffic", "Clarify the promise; check traffic sources"], ["Pricing", "Price shock or unclear inclusions", "Explain what is included; offer help in chat"], ["Service page", "Not convinced, or missing details", "Add proof, FAQs and a chat prompt"], ["Contact", "Fine if they call or you get calls", "Track calls; make phone tappable"], ["Blog article", "Read and left; normal", "Offer a relevant next step, not a hard sell"]),
      p("Do not chase a lower bounce rate for its own sake. The goal is more enquiries and bookings; bounce is a clue."),

      h2("When proactive chat helps"),
      ul("The visitor has been on a high-intent page (pricing, services, booking) for a while without acting.", "The visitor is about to leave, on a desktop, after viewing several pages.", "The visitor has returned to the site more than once.", "The visitor arrived from a source that usually means a question, such as a Google Business Profile or an ad for a specific service.", "Outside office hours, when your contact form will not be answered until morning."),

      h2("When it hurts"),
      ul("On the first second of the first page.", "On pages where reading is the goal, such as long articles.", "On mobile, where a pop-up covers most of the screen.", "On checkout, payment or form pages where it can derail completion.", "Repeatedly after being dismissed.", "When the message is generic and offers nothing."),
      p("The rule: interrupt only when you have something specific and useful to offer, and only once."),

      h2("Trigger ideas that respect the visitor"),
      table(["Trigger", "Sensible setting", "Message idea"], ["Time on page", "20 to 40 seconds on pricing or services", "Questions about prices or what is included? I can explain and show the next free time."], ["Scroll depth", "After reading most of a service page", "Want to know if this suits you? Tell me what you need."], ["Return visit", "Second visit within a week", "Welcome back. Want me to pick up where you left off, or check available times?"], ["Exit intent (desktop)", "When the cursor moves to close the tab", "Before you go: can I answer a quick question?"], ["Out of hours", "Outside opening hours", "Our team is offline, but I can answer questions and book you in."], ["Campaign landing page", "After a short delay", "Interested in [the offer]? Ask me anything, or book a time."]),
      p("Not every widget supports every trigger. Where triggers are limited, a greeting bubble that appears after a short delay, shown once per visit, is a safe default."),

      h2("Write proactive messages that feel like help"),
      table(["Avoid", "Better"], ["Need help?", "Comparing options? I can explain what is included and find you a time."], ["Chat with us now!", "Questions before you book? Ask me, I answer instantly."], ["Wait, do not leave!", "Anything I can clear up before you decide?"], ["Special offer just for you", "Only mention offers that exist and apply to everyone"]),
      ul("Be specific to the page.", "Offer something concrete: an answer, a price, a time.", "Keep it to one short line.", "Make dismissing it easy and respect the choice.", "Say it is an AI assistant, and mention that a person can help."),
      p("See [chatbot welcome message copywriting](/blog/chatbot-welcome-message-copywriting) for wording and thirty examples."),

      h2("Frequency and courtesy limits"),
      ul("Show a proactive message at most once per visit and not again for several days after dismissal.", "Do not open the full chat window automatically; show a small bubble.", "Never steal keyboard focus while someone is reading or typing.", "Respect accessibility settings such as reduced motion.", "Turn off proactive messages on pages where they interrupt tasks."),
      p("See [accessibility for website chatbots](/blog/accessibility-wcag-compliance-website-chatbots) for why auto-opening chats can exclude people."),

      h2("What the assistant does after the click"),
      p("A proactive prompt only helps if the conversation that follows is good. The assistant should answer the visitor's question from your documents, offer a next step such as booking or a callback, ask for contact details only when relevant and hand over to a person when needed. If the reply is slow, wrong or vague, the prompt just adds another reason to leave. Test the whole path, from prompt to booking, before you turn proactive messages on."),

      h2("Measure the effect"),
      ol("Record your baseline: bounce or engagement rate, enquiries and bookings for the pages involved.", "Turn on the proactive message for one page group only.", "Track chat opens, conversations, bookings and enquiries from those pages.", "Compare with the same pages before, or with similar pages without the prompt.", "Read the conversations that started from the prompt to see what visitors asked.", "Adjust the trigger and message, or turn it off if it does not help."),
      table(["Metric", "What it tells you"], ["Prompt views to chat opens", "Whether the message attracts attention"], ["Chat opens to booking or lead", "Whether the conversation delivers"], ["Bounce or engagement change", "Whether visitors stay longer"], ["Complaints or dismissals", "Whether it is annoying"], ["Total bookings per 100 visitors", "The result that counts"]),
      p("Give it several weeks and treat small differences with caution, especially on low-traffic pages."),

      h2("Beyond chat: other ways to reduce bounce"),
      ul("Make the first screen state clearly what you offer and the next action.", "Speed up mobile pages.", "Match landing pages to the ads or links that lead to them.", "Show prices and proof.", "Make phone numbers tappable.", "Fix broken links and confusing navigation."),
      p("A chat helps with unanswered questions, but it cannot rescue a page with an unclear offer. See [the service business CRO playbook](/blog/service-business-cro-playbook)."),

      h2("Example: a proactive prompt on a pricing page"),
      p("A dental practice notices that its pricing page has a high exit rate. Reading conversations, the owner finds the same doubts: do you take my insurance, is the first visit different from a check-up, and is there a payment plan. She adds a small bubble on the pricing page, shown once after thirty seconds: 'Questions about prices, insurance or payment plans? I can answer them now.' She also adds those three answers to the assistant's documents and to the page itself. Over the next month the page's exit rate falls, chats from the page rise and bookings from it increase. The bubble helped, but so did fixing the page: the same questions that visitors asked in chat became content, which reduced the need to ask."),
      table(["Change", "What it addresses"], ["Bubble after thirty seconds on pricing", "Visitors who read but hesitate"], ["Insurance and payment answers added to the page", "The doubts behind the exits"], ["Handover if the assistant cannot answer", "Visitors with unusual cases"]),

      h2("A quick audit of your own triggers"),
      ul("List every place a chat message can appear today.", "For each, ask whether a visitor would welcome it at that moment.", "Remove any that fire before the visitor has had time to read.", "Check them on a phone.", "Check that dismissing one means it does not return the same day."),

      h2("Frequently asked questions"),
      faq(
        ["Does a chatbot reduce bounce rate?", "It can, when it answers questions that would otherwise make visitors leave. A badly timed pop-up can increase bounce instead."],
        ["When should a proactive chat message appear?", "After a visitor has spent time on a high-intent page without acting, on a return visit, at exit intent on desktop or outside office hours. Not on the first second of a page."],
        ["Should the chat open automatically?", "Generally no. Show a small bubble and let the visitor open it."],
        ["How often should proactive messages show?", "Once per visit, and not again for several days after a dismissal."],
        ["Is bounce rate the right metric?", "It is a clue, not the goal. Track enquiries and bookings per visitor."],
        ["Are proactive messages bad for accessibility?", "They can be if they steal focus or interrupt. Avoid auto-opening and respect reduced-motion settings."],
      ),
      p("Try the assistant on your own pages' content in the [playground](/playground), see the [website widget](/product/website-widget) options and [start a free trial](/login?mode=register)."),
    ],
  }),

  pillar({
    slug: 'cost-per-booked-appointment-calculation',
    title: 'Cost Per Booked Appointment: How to Calculate It and Lower It',
    description: 'How to calculate cost per booked appointment for a service business: marketing, software and staff costs, with formulas, worked examples and ways to reduce it.',
    primaryKeyword: 'cost per booked appointment',
    secondaryKeywords: ['cost per appointment calculation', 'cost per lead vs cost per booking', 'appointment booking metrics', 'customer acquisition cost service business'],
    body: [
      p("Cost per lead is a popular number, but it can mislead: ten cheap enquiries that never book are worse than three expensive ones that do. For appointment-based businesses, the number that matters more is the cost of a booked appointment, and beyond it the cost of an attended one. It ties your marketing, software and staff spending to the outcome that actually pays. This guide shows how to calculate it, what to include, worked examples, how to break it down by source and how to bring it down, including with an AI assistant that captures more bookings from the traffic you already pay for."),

      h2("The basic formula"),
      p("Cost per booked appointment = total cost of acquiring bookings in a period ÷ number of appointments booked in that period."),
      table(["Term", "Meaning"], ["Total cost", "Marketing spend plus tools plus the staff time spent handling enquiries and booking"], ["Booked appointments", "Confirmed appointments created in the period, from all sources you count"], ["Period", "Usually a month; longer for seasonal businesses"]),
      p("Use the same definition every month so you can compare. If you want a stricter measure, divide by attended appointments, which accounts for no-shows."),

      h2("What to include in cost"),
      table(["Cost", "Examples", "Include?"], ["Advertising", "Search ads, social ads, sponsored listings", "Yes"], ["Agency or freelancer fees", "SEO, ad management, content", "Yes, for the work that drives bookings"], ["Software", "Website, booking tool, chat assistant, AI usage, CRM", "Yes, the share that supports acquisition and booking"], ["Staff time", "Time answering enquiries, calls, scheduling", "Yes, priced at their hourly cost"], ["Discounts and offers", "Introductory pricing", "Yes if they exist to win bookings"], ["Overheads unrelated to acquisition", "Rent, utilities", "No"]),
      p("Start simple: advertising, tools and estimated staff time. You can refine later."),

      h2("Worked example: a salon"),
      table(["Line", "Amount per month"], ["Advertising", "$300"], ["Website and booking tool", "$40"], ["AI assistant plan and AI usage", "$165"], ["Staff time on enquiries: 12 hours at $15", "$180"], ["Total cost", "$685"], ["Appointments booked", "95"], ["Cost per booked appointment", "about $7.20"]),
      p("If the average appointment is worth $70, acquiring one costs about a tenth of its value. A change that adds ten bookings for the same spend lowers the cost to about $6.50. The figures are illustrative; use your own."),

      h2("Worked example: a home services company"),
      table(["Line", "Amount per month"], ["Local search ads", "$1,200"], ["Website, CRM and chat", "$220"], ["Office staff handling enquiries: 30 hours at $22", "$660"], ["Total cost", "$2,080"], ["Estimates booked", "26"], ["Cost per booked estimate", "$80"], ["Estimate to job rate", "40 percent"], ["Cost per job won", "$200"]),
      p("Here the booked appointment is an estimate, and the cost per job is derived from the conversion rate. Compare it with the profit on an average job to see whether the marketing pays."),

      h2("Break it down by source"),
      p("An overall number hides big differences. Calculate cost per booked appointment for each source you can separate."),
      table(["Source", "Cost", "Bookings", "Cost per booking"], ["Search ads", "$600", "20", "$30"], ["Google Business Profile", "$0 plus staff time", "30", "Low"], ["Social ads", "$400", "8", "$50"], ["Referrals", "$0 plus rewards", "15", "Low"], ["Website chat and booking", "Tool cost", "22", "Depends on tool cost"]),
      p("Use a simple 'how did you hear about us' field in booking or chat to attribute sources, and see [attribution modelling for chat leads](/blog/attribution-modeling-marketing-channels-chat-leads)."),

      h2("From booked to attended to paying"),
      table(["Stage", "Metric"], ["Booked", "Cost per booked appointment"], ["Attended", "Cost per attended appointment = total cost ÷ attended appointments"], ["Paid or won", "Cost per customer or job"], ["Repeat", "Lifetime value versus acquisition cost"]),
      p("No-shows raise cost per attended appointment. Reducing them is often the cheapest improvement; see [how to reduce no-shows](/blog/eliminate-service-no-shows-playbook)."),

      h2("How to lower cost per booking"),
      ol("**Convert more of the traffic you have.** Clear offers, fast answers and easy booking raise bookings without raising spend. See [the service business CRO playbook](/blog/service-business-cro-playbook).", "**Capture out-of-hours enquiries.** A chat that answers and books at any hour recovers enquiries that would otherwise be lost. See [after-hours appointment booking](/blog/after-hours-appointment-booking).", "**Reply faster.** Speed to lead lifts conversion; see [speed to lead](/blog/speed-to-lead-service-businesses).", "**Reduce staff time.** Automate routine questions so staff time per booking falls.", "**Cut waste in ads.** Pause campaigns with high cost per booking, and shift budget to sources that book.", "**Reduce no-shows,** so booked appointments become attended ones."),
      p("Each lever changes the numerator or the denominator: spending less, or booking more."),

      h2("What an AI assistant does to the formula"),
      p("An assistant adds a cost, a subscription and AI usage, and can raise the denominator by recovering bookings you would have missed, and lower the staff time term by handling routine questions. Whether the net effect is positive depends on your numbers. Compare cost per booked appointment for a few months before and after adding it. See [the ROI calculator guide](/blog/ai-website-assistant-roi-calculator). Crescelo's plans start at $49 a month; see [pricing](/pricing)."),

      h2("Pitfalls"),
      ul("Ignoring staff time, which is often the largest cost.", "Counting only paid channels and forgetting that organic bookings still cost effort.", "Mixing periods, so one month's spend is compared with another month's bookings.", "Ignoring no-shows and cancellations.", "Over-attributing every booking to the last click.", "Chasing the lowest number at the expense of customer quality."),

      h2("A step-by-step way to set up your calculation"),
      ol("Choose the period: the last full month, or the last three for seasonal businesses.", "List every advertising and agency cost for that period.", "List every tool that supports getting bookings, and take the monthly cost of each.", "Estimate the hours staff spent answering enquiries and scheduling, and multiply by their hourly cost including employer costs.", "Add them up to get total cost.", "Count appointments booked from all sources in the same period.", "Divide total cost by appointments booked.", "Repeat for each source where you can separate the costs and bookings."),
      p("Put the results in a sheet with one row per month. Within three months you will see a trend, and within six you will see seasonality."),

      h2("Cost per booked appointment and lifetime value"),
      p("A low cost per booking is good, but it means little without knowing what a customer is worth. If a customer books once and never returns, the first appointment must pay back the acquisition cost. If a customer returns eight times a year, you can afford to pay much more to win them. Compare cost per booked appointment with the average gross profit per customer over a sensible period, such as a year. The ratio tells you whether growth is affordable."),
      table(["Business", "Cost per booking", "Customer value over a year", "Comfortable ratio"], ["Barbershop", "$7", "$600 (regular monthly cuts)", "Very comfortable"], ["Dental practice", "$45", "$700", "Comfortable"], ["Home repair", "$80 per estimate", "$450 per job, occasional repeat", "Depends on win rate and margin"], ["Consultant", "$120 per call", "$4,000", "Comfortable if close rate holds"]),
      p("These examples are illustrative, but the logic is general: what you can afford to pay depends on what a customer is worth."),

      h2("A monthly review routine"),
      p("Once a month, update your sheet and ask three questions. Which source had the lowest cost per booking, and can we do more of it? Which had the highest, and is it still worth it? What changed in our process this month, and did the number move? Then choose one action for the next month, such as pausing an underperforming ad group or improving the booking page. One change at a time lets you learn what works."),

      h2("A quick sensitivity check"),
      p("Before you make a decision from your numbers, test how sensitive it is. If cost per booking is $20 and you assumed staff time cost $15 an hour, what if it is really $25? If ten percent of bookings were duplicates, how much does the cost rise? If marketing spend is double next month, how many extra bookings do you need to keep the same cost? Working through three what-if cases takes ten minutes and tells you whether a conclusion is solid or fragile."),

      h2("Putting the number to work"),
      p("A number only helps if it changes a decision. Decide in advance what you will do at different levels: if cost per booking rises above a threshold for two months, review the highest-cost source; if it falls below a comfortable level, consider spending more to grow; if it is stable, focus on reducing no-shows. Writing the rule down before you see the number prevents wishful thinking, and it turns the calculation from a report into a management tool."),

      h2("Frequently asked questions"),
      faq(
        ["What is cost per booked appointment?", "Total acquisition costs in a period divided by the number of appointments booked in that period."],
        ["How is it different from cost per lead?", "A lead may never book. Cost per booked appointment measures the outcome that generates revenue."],
        ["What costs should I include?", "Advertising, agency fees, relevant software and the staff time spent handling enquiries and bookings."],
        ["How do I lower it?", "Convert more of your traffic, answer faster, capture out-of-hours enquiries, reduce staff time on routine questions and cut wasted spend."],
        ["Should I use attended or booked appointments?", "Track both. Attended appointments account for no-shows and give a truer picture of cost."],
        ["Does a chatbot lower cost per booking?", "It can, if it recovers bookings and saves staff time by more than it costs. Measure before and after."],
      ),
      p("Rehearse a booking conversation in the [playground](/playground), see the [appointment booking feature](/product/appointment-booking) and [start a free trial](/login?mode=register)."),
    ],
  }),

  pillar({
    slug: 'integrate-chat-events-ga4-meta-pixel',
    title: 'Track Chatbot Bookings and Leads in Google Analytics 4 and Meta Ads',
    description: 'How to measure chatbot conversions in GA4 and Meta: what to track, options such as thank-you events, server-side events via automation, consent and privacy, and testing.',
    primaryKeyword: 'track chatbot conversions GA4',
    secondaryKeywords: ['chatbot Google Analytics 4 events', 'Meta pixel chatbot', 'measure chat leads', 'conversion tracking for chat'],
    body: [
      p("If you spend money on search or social ads, you need to know whether the visitors they send end up booking. When the booking happens inside a chat widget rather than on a thank-you page, standard conversion tracking can miss it. That makes ads look worse than they are, or hides which campaigns really work. The fix is to record chat outcomes, a lead captured or a booking made, as conversions in your analytics and ad platforms. This guide explains what to track, the practical ways to send those events to Google Analytics 4 and Meta, the role of consent and privacy, and how to test that the numbers are right."),
      note("Analytics and advertising tools change their interfaces and policies often, and privacy law affects what you may track. Check each platform's current documentation and take advice on consent for your region. This is general information, not legal advice."),

      h2("What to track from a chat"),
      table(["Event", "Why it matters", "Priority"], ["Chat opened", "Interest; top of the funnel", "Medium"], ["Lead captured (contact details given)", "A conversion for enquiry businesses", "High"], ["Booking made", "The core conversion for appointment businesses", "High"], ["Handover requested", "Shows demand for a person", "Medium"], ["Booking attended", "Ties ads to real outcomes; needs your own data", "High, if you can"]),
      p("Start with two: lead captured and booking made. Add others once those are reliable."),

      h2("Why chat conversions get missed"),
      ul("The booking happens in a widget, so no new page loads and no thank-you page is visited.", "The chat runs in an isolated frame or separate service, which your analytics script cannot see into.", "Consent settings block tracking scripts for visitors who decline.", "Ad blockers remove tracking scripts for some visitors.", "Cross-device journeys break attribution."),
      p("Accept that tracking will be imperfect, and aim for a consistent, honest measure rather than a perfect one."),

      h2("Four practical approaches"),
      table(["Approach", "How it works", "Pros", "Cons"], ["Thank-you page or redirect", "After booking, send the visitor to a page on your site that fires the conversion", "Works with standard tags", "Interrupts the chat; not always available"], ["Events from your own site's code", "If the widget exposes events that your page can listen for, fire GA4 or Meta events from them", "Real-time and tied to the session", "Depends on what the widget provides; needs a developer"], ["Server-side event via automation", "The chatbot sends a webhook on each lead or booking; Zapier or Make sends an event to GA4 or Meta", "Independent of ad blockers; consistent", "Attribution to the original visit needs an identifier to be passed"], ["Offline import", "Export leads and bookings and upload them as offline conversions", "Accurate; can include attended and paid", "Manual, delayed"]),
      p("Crescelo does not include a built-in GA4 or Meta Pixel connector. It provides an Analytics area for chat sessions, leads and bookings, and outgoing webhooks on the Agency / Scale plan that can feed automation tools. For most small businesses the practical route is the server-side approach or a simple recorded count you compare with ad spend."),

      h2("The server-side route in plain steps"),
      ol("Choose the events: lead captured and booking made.", "In your automation tool, create a scenario triggered by the chatbot's webhook for each event.", "Add an action that sends an event to GA4 through its Measurement Protocol, or to Meta through its Conversions API, with an event name such as 'chat_booking'.", "Include a client or click identifier if you have it, so the event can be linked to the campaign that brought the visitor.", "Mark the event as a key event or conversion in GA4, and as a custom conversion in Meta.", "Test with a test lead and check the event appears in the platform's debug or test view."),
      p("Attribution needs a link between the visit and the conversion. If the chat does not pass the identifier, you will see the conversion but not which campaign produced it. Ask your developer or vendor what is feasible, and consider a 'how did you hear about us' question in the chat for a manual signal."),

      h2("UTM tags and source capture"),
      p("Tag every ad and campaign link with UTM parameters, such as source, medium and campaign. When someone books, the source page and UTM values should be stored with the lead if your setup allows. Even without full technical integration, reading conversations and asking 'how did you find us?' gives you a useful, if rough, attribution signal. See [attribution modelling for chat leads](/blog/attribution-modeling-marketing-channels-chat-leads)."),

      h2("Consent and privacy"),
      ul("Do not fire analytics or advertising events for visitors who have not consented, where consent is required.", "Do not send personal data such as email addresses or phone numbers to analytics or ad platforms unless you have a lawful basis and the platform's rules allow it; use hashed identifiers only as the platform's documentation permits.", "Update your privacy and cookie policies to describe the tracking.", "In health, legal and financial contexts, be extra cautious: tracking pixels on pages about sensitive services can create serious privacy risks."),
      p("See the [GDPR checklist for website chatbots](/blog/website-chatbot-gdpr-checklist) and [HIPAA considerations for dental chatbots](/blog/hipaa-compliance-dental-chatbots)."),

      h2("What to do with the numbers"),
      table(["Metric", "Use"], ["Chat bookings by campaign", "Move budget to campaigns that book"], ["Cost per chat booking", "Compare with other sources; see [cost per booked appointment](/blog/cost-per-booked-appointment-calculation)"], ["Chat starts by page", "Find pages where visitors have questions"], ["Lead to booking rate", "Improve follow-up"]),

      h2("Testing checklist"),
      ol("Make a test booking and lead from a tagged link.", "Check that the event appears in GA4's real-time or debug view.", "Check that Meta's test events tool shows the event.", "Decline consent and confirm that nothing fires where it should not.", "Compare a week of platform numbers with your actual bookings, and note the gap.", "Repeat after any change to the widget, tags or consent tool."),

      h2("A worked example: a salon measuring its ads"),
      p("A salon spends $300 a month on social ads and sees very few bookings in its ad reports, because most people book in the chat, which the pixel cannot see. The owner adds a 'how did you hear about us' quick reply in the chat, sets the ad link's UTM tags and sends each booking event to a spreadsheet through an automation. After a month the spreadsheet shows twenty-two bookings, nine of them from the social campaign, where the ad platform reported only two. Cost per booking from ads becomes about $33 instead of the misleading $150. The decision to keep the ads changed because the measurement did."),
      table(["Before", "After"], ["Ad platform shows 2 conversions", "Sheet shows 9 bookings from the campaign"], ["Looks like $150 per booking", "About $33 per booking"], ["Temptation to stop ads", "Decision to keep and test a second creative"]),

      h2("Naming conventions that save headaches"),
      p("Use consistent names for events and campaigns from the start: for example 'chat_lead' and 'chat_booking' for events, and lowercase, hyphenated UTM values. A mess of names such as 'Booking', 'booking1' and 'chat book' makes reports unusable. Write your naming convention in a shared document, and add a test lead to every new campaign link before spending money on it."),

      h2("Limits to be honest about"),
      p("No measurement setup captures everything. Ad blockers, declined consent, cross-device journeys and people who chat on a phone and book by calling later all leave gaps. Treat your numbers as a consistent estimate and compare them with real booking counts in your own system, which is the source of truth. If the ad platform's numbers are far below your own, trust your own for decisions, and use the platform's for optimisation signals only."),

      h2("A minimal setup for a small business"),
      p("If all of this feels heavy, start small. Add UTM tags to your ad links, add a 'how did you hear about us' quick reply to your chat, and record each booking in a spreadsheet with the answer. After a month, compare bookings by source with your ad spend. That simple method, done consistently, tells you more than a half-working pixel, and you can add technical tracking later when the basics are solid."),

      h2("Frequently asked questions"),
      faq(
        ["How do I track chatbot bookings in Google Analytics 4?", "Send a booking event from a thank-you step, from your page code if the widget exposes events, or from an automation that receives the chatbot's webhook and posts to GA4."],
        ["Does Crescelo have a GA4 or Meta Pixel integration?", "Not built in. It has an Analytics area and webhooks on the Agency / Scale plan that you can connect to automation tools."],
        ["Why do my ads show no conversions from chat?", "Because bookings in a widget do not load a thank-you page, so standard tags do not fire. Send the events another way."],
        ["Can I send emails or phone numbers to Meta or Google?", "Only if allowed by their policies and your lawful basis, and only in the form they document. Avoid it where unsure."],
        ["Do I need consent?", "Often, for analytics and advertising cookies and scripts. Requirements vary by region."],
        ["What if tracking is imperfect?", "Use a consistent measure, compare to real bookings and add a 'how did you hear about us' question for a second signal."],
      ),
      p("Read about [lead capture](/product/lead-capture), try a chat in the [playground](/playground) and [start a free trial](/login?mode=register). For the automation side, see [chatbot webhooks with Zapier and Make](/blog/webhook-automations-zapier-make-chat-events)."),
    ],
  }),

  pillar({
    slug: 'local-seo-conversion-blueprint',
    title: 'Local SEO and Conversion Blueprint: Turn Local Search Visitors Into Bookings',
    description: 'A blueprint for local service businesses: optimise your Google Business Profile and site for local search, then convert visitors with clear pages, reviews, chat and booking.',
    primaryKeyword: 'local SEO for service businesses',
    secondaryKeywords: ['local search conversion', 'Google Business Profile optimization', 'local SEO checklist', 'convert local visitors'],
    body: [
      p("Local search is where many service businesses win or lose customers. Someone types 'dentist near me' or 'plumber open now', looks at a map with three results and picks one. Getting into those results is local SEO. But visibility is only half the job: a visitor who arrives and cannot find your price, hours or a way to book will go to the next name. This blueprint joins the two halves. It covers how to be found locally, what your profile and website must show, how to earn and use reviews, and how to convert visitors with clear pages, fast answers and easy booking, including chat that works at any hour."),

      h2("How local search works, briefly"),
      p("Google's local results depend broadly on three things: relevance (does your business match the search), distance (how close it is to the searcher) and prominence (how well known and trusted it is, including reviews and links). You cannot change distance, but you can improve relevance and prominence, and you can make sure that visitors who find you convert."),
      table(["Factor", "What you control"], ["Relevance", "Accurate categories, services, descriptions and content"], ["Distance", "A correct address and service area"], ["Prominence", "Reviews, quality links, mentions and a strong website"]),

      h2("Step 1: Get your Google Business Profile right"),
      ul("Claim and verify the profile.", "Choose the most accurate primary category and add secondary ones.", "List every service, with descriptions and prices or ranges where you can.", "Keep name, address and phone consistent with your website and other listings.", "Set accurate hours, including holidays.", "Add real photos of your premises, team and work.", "Link to a page that helps the visitor act: booking, services or your assistant.", "Use posts and updates for offers and news, sparingly."),
      p("Do not stuff keywords into the business name; it breaks guidelines and can lead to suspension."),

      h2("Step 2: Make your website match"),
      table(["Page", "Local SEO job", "Conversion job"], ["Home", "Say what you do and where", "One clear action"], ["Service pages", "One page per main service with local wording", "Price, proof, booking"], ["Location or service area pages", "Real information about the areas you serve", "Show you know the area; link to booking"], ["Contact", "Consistent address, phone and hours", "Click-to-call, map, form and chat"], ["About", "Trust and credentials", "Faces and facts"]),
      p("Write for people first. Mention the area naturally, and avoid near-duplicate pages for every suburb, which are weak and can be penalised."),

      h2("Step 3: Earn and use reviews"),
      ul("Ask every happy customer for a review, at the moment they are most satisfied.", "Make it easy: send a direct link.", "Reply to every review, kindly and briefly, including the critical ones.", "Never buy or fake reviews; it is against the rules and can destroy trust.", "Show a selection of real reviews on your site with permission."),
      p("Reviews drive both ranking and conversion. See [social proof and reviews in AI chat](/blog/social-proof-reviews-ai-chat)."),

      h2("Step 4: Prepare for the mobile visitor"),
      p("Most local searches are on phones. A visitor from a map is often close to buying: they want your number, hours, directions and a quick way to book. Make sure the page loads fast, the phone number is a tappable link, the address opens in maps, the hours are visible and the booking action is thumb-sized. Test it on a real phone on mobile data."),

      h2("Step 5: Answer questions instantly"),
      p("Local visitors ask the same questions: are you open now, how much, do you cover my area, can I book today. A chat on your site, and on the hosted page you link from your profile, can answer those from your own documents at any hour and offer a booking. See [converting Google Business Profile traffic in chat](/blog/convert-google-business-traffic-chat) and [service area verification in chat](/blog/service-area-verification-ai-chat)."),

      h2("Step 6: Make booking effortless"),
      ul("Offer online booking with real availability.", "Confirm immediately and send a change link.", "Offer a phone option for those who prefer it.", "Make sure the profile's booking link goes straight to the booking step.", "Keep the fields short."),
      p("See [AI appointment booking](/blog/ai-appointment-booking) and the [appointment booking feature](/product/appointment-booking)."),

      h2("Step 7: Measure what matters"),
      table(["Metric", "Where to find it"], ["Profile views, calls, direction requests, website clicks", "Google Business Profile insights"], ["Rankings for key local searches", "Manual checks from a phone in your area, or a local rank tracker"], ["Website visitors from search and maps", "Analytics"], ["Bookings and enquiries by source", "Booking and chat reports, plus a 'how did you find us' question"], ["Reviews count and rating", "Your profile"]),
      p("Review monthly and change one thing at a time."),

      h2("Common local SEO mistakes"),
      ul("Inconsistent name, address or phone across listings.", "Unverified or duplicate profiles.", "Keyword-stuffed business names.", "Thin location pages copied for every suburb.", "Ignoring reviews.", "A slow, hard-to-use mobile site.", "No clear next step after the click."),

      h2("A 30-day plan"),
      table(["Week", "Focus"], ["1", "Audit your profile and listings; fix name, address, phone, hours and categories"], ["2", "Improve your service and contact pages: prices, proof, tappable phone and booking"], ["3", "Start a review routine; reply to existing reviews; add photos"], ["4", "Add chat and booking where visitors hesitate; review the numbers"]),

      h2("Worked example: a physiotherapy clinic"),
      p("A clinic in a mid-sized town ranks fourth in the map results for 'physiotherapy near me'. Its profile has the wrong category, photos from years ago, and a website link to a slow home page. Over a month it makes changes in order of effort. It corrects the primary category and adds services with descriptions. It adds current photos and a short weekly post. It starts asking every discharged patient for a review with a direct link, and replies to each one. It points the profile link to a fast services page with prices, tappable phone and an assistant that answers insurance and referral questions and offers appointments. Calls, direction requests and bookings all rise, and the clinic climbs to second place. No single change did it; the improvements reinforced each other."),
      table(["Change", "Effort", "Effect"], ["Fix categories and services", "1 hour", "Better relevance for the searches that matter"], ["Fresh photos", "2 hours", "More clicks and trust"], ["Review routine", "10 minutes a week", "Stronger prominence and conversion"], ["Faster services page with chat", "Half a day", "More visitors become bookings"]),

      h2("What to do about competitors"),
      p("Look at the three businesses above you in the map results. Study their categories, services, photos, review counts and how they respond to reviews. Note what they do better and what they do not do at all. You do not need to copy them; find the gaps. If none of them shows prices, showing yours is an advantage. If none answers questions out of hours, a chat that does is one. Revisit the comparison every quarter."),

      h2("Local content that earns attention"),
      ul("Answer the questions customers ask, on your own site: how much, how long, what to expect.", "Write about local situations: seasonal problems, local regulations, local events you serve.", "Share real before-and-after work with permission.", "Sponsor or support local groups and ask for a link where sensible.", "Keep everything truthful and specific; generic filler helps no one."),

      h2("Keeping it going"),
      p("Local SEO is a habit, not a project. Put four recurring tasks in your calendar: a weekly review request routine, a monthly check that hours and details are still correct everywhere, a quarterly look at competitors and a yearly refresh of photos and service descriptions. Assign each to a named person. The businesses that keep their profile and site current tend to hold their rankings, while those that set it up once and forget it slowly slip as competitors keep improving."),

      h2("Questions to ask yourself each quarter"),
      ul("If a stranger searched for what we do in our area today, would they find us, and would they choose us?", "What do our three closest competitors show that we do not?", "What is the most common question customers ask that our website and profile do not answer?", "How fast can a mobile visitor from the map book or call?", "What would make a happy customer more likely to leave a review this month?"),
      p("Write the answers down and pick one improvement for the next month. Small, steady progress beats an annual overhaul."),

      h2("Frequently asked questions"),
      faq(
        ["What is local SEO?", "Improving your visibility in local search results and maps, mainly through your Google Business Profile, your website and reviews."],
        ["How do I rank higher in the map results?", "Complete and verify your profile, keep your details consistent, earn reviews, and have a helpful, fast website that matches what searchers want."],
        ["Do I need a separate page for each suburb?", "Only if you have real, useful information for each. Thin duplicate pages do not help."],
        ["How important are reviews?", "Very. They influence ranking and are often the deciding factor for a customer."],
        ["How can chat help local conversion?", "It answers questions like hours, price and coverage instantly, at any hour, and can book the visitor before they go elsewhere."],
        ["How do I measure local SEO?", "Use profile insights, analytics, booking and chat reports, and ask new customers how they found you."],
      ),
      p("Try the assistant on your own service and price documents in the [playground](/playground), see the [website widget](/product/website-widget) and [start a free trial](/login?mode=register). For the conversion side, read [the service business CRO playbook](/blog/service-business-cro-playbook)."),
    ],
  }),

  pillar({
    slug: 'convert-google-business-traffic-chat',
    title: 'Convert Google Business Profile Visitors With Chat: A Setup Guide for Local Businesses',
    description: 'How to turn Google Business Profile clicks into bookings: link to a hosted chat page, answer local questions, handle out-of-hours, capture leads and measure results.',
    primaryKeyword: 'Google Business Profile chat',
    secondaryKeywords: ['convert Google Maps visitors', 'Google Business Profile website link', 'local business chatbot', 'Google profile booking link'],
    body: [
      p("Your Google Business Profile is often the first thing a local customer sees, and its website button is where a lot of them click next. What they meet after that click decides whether they book. A slow home page with no obvious next step loses them. A page that answers their question in seconds and offers a time wins them. This guide explains how to use a hosted chat page or a well-prepared site page as the destination of your profile link, what to prepare so the assistant answers local questions well, how to handle out-of-hours visitors and calls, how to capture leads and how to measure the results."),

      h2("What Google Business Profile visitors want"),
      table(["Visitor thinks", "Needs"], ["Are they open now?", "Hours, holiday hours, current status"], ["Where exactly are they?", "Address, parking, directions"], ["How much will it cost?", "Prices or ranges"], ["Do they do what I need?", "Services, suitability"], ["Can I go today?", "Availability and booking"], ["Can I trust them?", "Reviews, credentials, photos"]),
      p("These are local, immediate, practical questions from people who are close to a decision. The faster they get answers, the more likely they are to book."),

      h2("Choose the destination for your profile link"),
      table(["Destination", "Pros", "Cons"], ["Your home page", "Familiar; good for brand", "Visitor must find what they need"], ["A service or booking page", "Direct to the action", "Needs to be clear and fast"], ["A hosted page with an assistant", "Answers questions and books in one place; designed for this traffic", "One more page to maintain"], ["A phone call button only", "Simple for some", "No answer after hours"]),
      p("Crescelo offers hosted business pages, a page with your assistant on it that you can link from your profile, social bios and QR codes. See the [website widget feature](/product/website-widget). If you use your own site, place the chat prominently on the page your profile links to."),

      h2("Prepare the assistant for local questions"),
      p("The assistant is only as good as the documents it reads. Load a short local information sheet."),
      ul("Address, parking, public transport and accessibility.", "Opening hours by day, holiday hours and how to reach you outside them.", "Service area: towns, postcodes or a radius, and what you do outside it.", "Prices or ranges for your main services and what is included.", "Booking and cancellation policy.", "Emergency or same-day policy, if you offer it.", "Payment methods.", "What to bring and how long each service takes."),
      p("Use the same facts as on your profile. Mismatched hours or prices between your profile, website and assistant confuse customers and damage trust."),

      h2("Out-of-hours: where the chat pays for itself"),
      p("Many profile visits happen in the evening and at weekends, when nobody can answer the phone. A visitor who finds a closed business often moves on. An assistant that says 'we are closed now, but I can answer questions and book you in for tomorrow' converts a lost visit into an appointment. Set your hours in the assistant so it tells the truth about availability. See [after-hours appointment booking](/blog/after-hours-appointment-booking)."),

      h2("Service area questions"),
      p("Visitors often ask 'do you cover my area?' Give the assistant a clear list of the areas you serve and a rule for the edge: what to say to someone just outside. A clear answer saves a wasted call for both sides. See [service area verification in chat](/blog/service-area-verification-ai-chat)."),

      h2("Capture leads when they are not ready to book"),
      p("Some visitors want an answer and will come back later. Offer to send the price list or callback, ask for one contact detail and deliver the lead to your team by instant email alert. See [conversational lead capture](/blog/conversational-lead-capture) and the [lead capture feature](/product/lead-capture)."),

      h2("Handover for what the assistant cannot handle"),
      p("Some questions need a person: complaints, unusual requests, emergencies. Make sure visitors can ask for one, and that your team is notified with the conversation. Say honestly when someone will reply. See [live human handover flow design](/blog/live-human-handover-flow-design)."),

      h2("Track results"),
      table(["Metric", "Where"], ["Profile website clicks", "Google Business Profile insights"], ["Visits to the hosted page or landing page", "Analytics or the page's stats"], ["Chats started and bookings made", "Chat and booking reports"], ["Out-of-hours bookings", "Booking times"], ["Reviews after visits", "Your profile"]),
      p("Add a UTM tag to the profile link, so visits from your profile are identifiable in analytics. For example, source google, medium organic and campaign business-profile. See [tracking chatbot conversions in GA4 and Meta](/blog/integrate-chat-events-ga4-meta-pixel)."),

      h2("Reviews: close the loop"),
      p("After a visit, a short message with a direct review link brings in the social proof that helps the next searcher. The assistant can also answer 'do you have reviews?' by pointing to your profile. Never fabricate reviews or quote ones you cannot verify. See [social proof and reviews in AI chat](/blog/social-proof-reviews-ai-chat) and [collecting reviews and ratings with automated chat](/blog/collect-reviews-ratings-automated-chat)."),

      h2("A one-hour setup"),
      ol("Update your profile: hours, services, categories, photos.", "Write the local information sheet and load it into the assistant.", "Set up booking and lead alerts.", "Test ten local questions, including 'are you open now' and 'do you cover my area'.", "Create or choose the destination page and add the UTM tag to your profile link.", "Test on a phone, on mobile data.", "Review the first two weeks of conversations."),

      h2("Worked example: a barbershop's profile link"),
      p("A barbershop's profile linked to its home page, which loaded slowly and buried the prices. The owner creates a hosted page with the assistant, loads the price list, hours, walk-in policy and parking information and points the profile link there with a UTM tag. Visitors from the map now see a friendly greeting, ask 'are you open now' and 'how much for a skin fade', and can pick a time. In the first month the owner sees forty chats from the profile link, twenty-one bookings, and six of those came after closing time, appointments that would previously have gone to another shop."),
      table(["Question from a map visitor", "Answered from"], ["Are you open now?", "Hours document with today's hours"], ["How much is a skin fade?", "Price list"], ["Do you take walk-ins?", "Walk-in policy"], ["Where do I park?", "Directions and parking"], ["Can I book for 5?", "Booking flow with real free times"]),

      h2("Keep your profile and assistant in sync"),
      p("Whenever you change hours, prices or services on your profile, change them in the assistant's documents on the same day. Put both on one checklist: profile, website, assistant, and any other listings. A mismatch is one of the most common reasons a local visitor loses trust, and it takes thirty seconds to avoid."),

      h2("What not to do"),
      ul("Do not link to a page that greets mobile visitors with a large pop-up.", "Do not hide your prices or your phone number.", "Do not let the assistant promise things your profile does not state.", "Do not fill your profile description with keywords.", "Do not ignore a bad review; answer it calmly."),

      h2("Seasonal and holiday changes"),
      p("Profiles and assistants both need care around holidays and seasonal shifts. Before a public holiday, update your profile's special hours and the assistant's documents at the same time, and check that the assistant tells visitors accurately when you reopen. In busy seasons, add a line about lead times so nobody is promised a slot you cannot honour. A short seasonal checklist, done twice a year, prevents most of the mismatches that annoy local customers."),

      h2("Quick checklist before you point the link"),
      ul("The hosted or destination page loads in under three seconds on mobile data.", "The greeting names your business and says what the assistant can do.", "Hours, address and phone number are visible without scrolling.", "The assistant answers your five most common local questions correctly.", "A test booking completes and the confirmation arrives.", "Your team knows how handover reaches them."),
      p("If any line fails, fix it before you send real traffic to the page; local visitors rarely give a second chance."),

      h2("Frequently asked questions"),
      faq(
        ["Where should my Google Business Profile website link go?", "To the page that best helps a local visitor act: a booking or services page, or a hosted page where an assistant answers questions and books."],
        ["Can a chatbot help convert Google Maps visitors?", "Yes. It can answer hours, price and coverage questions instantly, at any hour, and offer a booking."],
        ["Should I use my home page or a landing page?", "A focused page usually converts better because it removes steps between the click and the action."],
        ["How do I track visits from my profile?", "Add UTM parameters to the profile's website link and check the source in your analytics."],
        ["What if the assistant does not know an answer?", "It should say so and offer a person or a callback, and you should add the answer to your documents."],
        ["Does Crescelo offer hosted pages?", "Yes. Hosted business pages with your assistant are available, and how many depends on your plan."],
      ),
      p("Try local questions on your own documents in the [playground](/playground), and [start a free trial](/login?mode=register). For the wider picture, read [the local SEO and conversion blueprint](/blog/local-seo-conversion-blueprint)."),
    ],
  }),
];
