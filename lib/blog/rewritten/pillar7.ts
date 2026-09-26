import { faq, h2, h3, note, ol, p, pillar, table, ul } from '../authoring';

export const PILLAR7 = [
  pillar({
    slug: 'crescelo-vs-traditional-live-chat',
    title: 'AI Assistant vs Traditional Live Chat: Which Is Right for Your Business?',
    description: 'Compare an AI assistant with traditional live chat on coverage, cost, quality, booking and lead capture, and see when each wins and how to combine them.',
    primaryKeyword: 'AI chatbot vs live chat',
    secondaryKeywords: ['live chat vs chatbot', 'live chat alternative', 'AI assistant vs live chat software', 'chatbot or live chat for small business'],
    body: [
      p("Traditional live chat puts a person on the other end of the chat bubble. An AI assistant puts software there, reading your documents and replying instantly, with a person available when needed. Both promise the same thing, a visitor gets an answer without picking up the phone, but they get there in opposite ways, with different costs, strengths and risks. This guide compares them across the things a small business cares about, shows a worked cost example and explains how many businesses combine the two so each does what it does best."),
      p("We build Crescelo, an AI assistant, so read this knowing our interest. We say where live chat is the better tool, because sometimes it is."),

      h2("What each one is"),
      h3("Traditional live chat"),
      p("A chat window connected to an inbox where human agents reply in real time. Good products add canned replies, visitor information, routing, ticketing and reports. The quality of the experience depends entirely on who is online and how fast they type. Some products now add AI features, but the core model is people answering people."),
      h3("An AI assistant"),
      p("A chat window connected to a knowledge base and a language model. It answers from your own documents, books appointments, captures leads and hands over to your team when it should. It is available at all hours and replies in seconds. A person can join any conversation. See [what an AI website assistant is](/blog/ai-website-assistant) for the mechanics."),

      h2("Side-by-side comparison"),
      table(["", "Traditional live chat", "AI assistant"], ["Availability", "Only when an agent is online", "All hours"], ["First response", "Seconds to minutes, depending on queue", "Seconds"], ["Consistency", "Varies by agent and shift", "Same accurate answer each time, if content is good"], ["Handles complex or emotional cases", "Strong", "Limited; should hand over"], ["Staff needed", "Yes, for every hour covered", "Light weekly review"], ["Cost pattern", "Per seat plus staff time", "Subscription plus small AI usage"], ["Scales with volume", "Add agents", "Cost rises slowly"], ["Booking", "Basic, often a link", "In the chat with live availability (Crescelo Growth)"], ["Records", "Transcripts", "Transcripts plus questions the assistant could not answer"], ["Setup", "Install widget, train agents", "Load content, test, install widget"]),

      h2("Where live chat is the better tool"),
      ul("Visitors ask complex or high-value questions that need judgement and empathy.", "Your sales process is consultative and a personal conversation closes deals.", "You have staff whose main job is chat and who can keep response times low.", "The questions are so varied that no documentation covers them."),
      p("If that describes you, live chat with good agents is hard to beat. The mistake is to assume every enquiry deserves that level of attention."),

      h2("Where an AI assistant is the better tool"),
      ul("Most questions are repeatable: prices, hours, services, availability, policies.", "Enquiries arrive outside the hours you can staff.", "You want bookings and leads captured without waiting for someone.", "Your team is small and cannot watch a chat all day.", "You want to know what customers ask and where your website fails to answer."),
      p("For a salon, clinic, contractor or agency with a small team, this is usually most of the volume."),

      h2("The cost most comparisons miss"),
      p("Live chat software looks cheap. The cost is the person answering. Here is an illustrative month for a small business receiving 300 chats, where each takes about six minutes including the switching cost of stopping other work."),
      table(["Line", "Live chat only", "AI first, human for the hard cases"], ["Chats needing a human", "300", "About 60 (illustrative)"], ["Staff time at 6 minutes each", "30 hours", "6 hours"], ["Staff cost at $20 an hour", "$600", "$120"], ["Software", "About $60", "Assistant plan $49 to $149 plus small AI usage"], ["Coverage outside staffed hours", "None", "Full"], ["Approximate total", "about $660 plus missed enquiries", "about $170 to $270"]),
      p("These are illustrations, not benchmarks; use your own numbers. The direction matters: automating the routine layer cuts staff time sharply and adds coverage. Our [real cost of live chat](/blog/live-chat-hidden-costs-small-business) walks through the full calculation, and the [ROI guide](/blog/ai-website-assistant-roi-calculator) shows how to judge the return."),

      h2("Handover: the feature that makes the combination work"),
      p("The strongest setups are not either-or. The assistant handles the first layer, and the visitor can ask for a person at any time. When they do, your team is notified with the whole conversation and can take over from their phone or desk. The visitor does not repeat anything. In Crescelo this is the [human handover feature](/product/human-handover). See [live human handover flow design](/blog/live-human-handover-flow-design) for how to design it well."),
      ol("The visitor asks for a person, or the assistant recognises it should hand over.", "Your team gets an alert with the conversation attached.", "A person joins and replies as themselves.", "When done, the assistant can resume or the conversation is closed and recorded."),

      h2("Quality and trust"),
      p("Visitors accept AI when it is fast, honest about being AI and easy to escape. They reject it when it traps them or invents answers. Ground the assistant in your documents, instruct it to say when it does not know, and test it with questions your content cannot answer. See [how to stop a chatbot from making things up](/blog/grounded-ai-chatbot-hallucinations). Live chat has its own quality risk, which is inconsistency: the same question answered differently by two agents."),

      h2("Metrics to compare"),
      table(["Metric", "Live chat", "AI assistant"], ["First response time", "Depends on staffing", "Seconds"], ["Chats missed", "Those outside coverage or when agents are busy", "Few"], ["Bookings from chat", "Manual or via link", "Direct"], ["Cost per chat", "Staff time plus software", "Subscription plus AI usage, spread over chats"], ["Customer satisfaction", "Strong when agents are good", "Strong when answers are accurate and handover is easy"], ["Content gaps found", "Anecdotal", "Listed from unanswered questions"]),

      h2("How to decide"),
      ol("Count your chats and enquiries per month and the hours they arrive.", "Sample fifty and mark which are routine and which need a person.", "Estimate the enquiries lost outside staffed hours.", "If most are routine, start with an assistant on the first line.", "If most need judgement, keep live chat and add automation for the simple ones.", "Review after a month using response time, bookings and cost per chat."),

      h2("Migrating from live chat to an assistant"),
      p("You do not have to turn live chat off. Export your best canned replies and past transcripts, turn them into documents, load them into the assistant and test with real past questions. Run both for a few weeks, with the assistant on the first line and agents receiving handovers. When answers are reliable, reduce staffed hours to when volume justifies them."),

      h2("Common mistakes"),
      ul("Buying live chat and not staffing it.", "Buying an assistant and never reviewing conversations.", "Hiding the way to reach a person.", "Comparing only the software price.", "Letting the assistant answer sensitive topics without rules for handover.", "Judging either tool on volume instead of bookings and leads."),

      h2("A day in each model"),
      p("Compare how the same Tuesday looks for a small physiotherapy clinic under each model."),
      table(["Time", "Live chat only", "AI first with handover"], ["8:10 a.m.", "Chat is offline until 9; a visitor leaves an email address", "Assistant answers the price question and offers 10:30 that day; booked"], ["10:20 a.m.", "Receptionist is with a patient; a chat waits five minutes", "Assistant replies at once; the receptionist is not interrupted"], ["1:00 p.m.", "Lunch: chat unattended", "Assistant answers; one insurance question is handed to the team"], ["3:30 p.m.", "A worried parent asks a sensitive question; the receptionist answers with care", "Assistant recognises the topic and hands over; the receptionist joins with the whole conversation"], ["9:00 p.m.", "Offline; three enquiries wait until morning", "Assistant answers two and books one; the third asked for a call and is flagged"]),
      p("Neither model is perfect. The AI-first day loses nothing where empathy matters, because the handover exists, and gains coverage where the live chat day had gaps."),

      h2("Signs it is time to add an assistant to live chat"),
      ul("Chats often wait more than a minute for a reply.", "Your chat is offline more hours than it is online.", "Agents report that most chats are the same few questions.", "Evening and weekend enquiries go unanswered.", "You cannot tell which questions your website fails to answer.", "You pay per seat for people who spend most of their time on other work."),

      h2("Signs live chat should stay the centre"),
      ul("Most conversations are consultative sales where the agent's judgement matters.", "You already have well-staffed hours matching your visitors' hours.", "Your customers expect a named person.", "Your team enjoys and is good at chat."),
      p("Even then, an assistant on the edges, for after-hours and simple questions, tends to help without displacing anyone."),

      h2("Questions to ask a live chat vendor"),
      ol("What does the price become when I add a second and third agent?", "Are canned replies, routing and reports included or extra?", "What automation exists, and does it answer from my own documents?", "Can visitors book an appointment without leaving the chat?", "What happens to chats when nobody is online?", "Can I export transcripts and visitor data if I leave?"),
      p("Ask an assistant vendor the equivalents: what happens when it does not know, how do I take over, and what does it cost at twice my volume. Comparing the answers side by side is more informative than comparing feature lists."),

      h2("Frequently asked questions"),
      faq(
        ["Is an AI assistant better than live chat?", "For routine questions, bookings and out-of-hours coverage, usually yes. For complex, emotional or high-value conversations, a person is better. Many businesses use both."],
        ["Can an AI assistant replace live chat agents?", "It can take the routine load so agents handle fewer, more valuable conversations. It does not remove the need for people in sensitive or complex cases."],
        ["What does live chat really cost?", "The subscription is small; the main cost is staff time and missed enquiries outside coverage hours."],
        ["Can visitors talk to a person through an AI assistant?", "Yes. In Crescelo a visitor can ask for a person at any time, and your team is notified with the whole conversation."],
        ["Which is faster to set up?", "Both take hours. Live chat needs staffing plans; an assistant needs good content and testing."],
        ["Can I keep my existing live chat?", "Yes. You can run the assistant on the first line and route to your live chat team, or replace live chat gradually."],
      ),
      p("Try the assistant on your own documents in the [playground](/playground), compare it with your current setup, and read the [product overview](/product). When you are ready, [start a free trial](/login?mode=register)."),
    ],
  }),

  pillar({
    slug: 'website-chat-vs-whatsapp-bots-service-business',
    title: 'Website Chat vs WhatsApp Bots: Which Channel Should a Service Business Use?',
    description: 'Compare website chat and WhatsApp bots for service businesses on reach, setup, cost, rules, booking and trust, and learn how to run both from one assistant.',
    primaryKeyword: 'website chat vs WhatsApp chatbot',
    secondaryKeywords: ['WhatsApp bot for business', 'website chatbot vs WhatsApp', 'best chat channel for service business', 'WhatsApp vs live chat'],
    body: [
      p("Customers now reach a service business in several places: the website, WhatsApp, Telegram, Instagram, the phone. It is tempting to add a bot on every channel, but each has its own rules, costs and audiences, and a bot that is poorly suited to a channel frustrates people. This guide compares the two channels service businesses ask about most, website chat and WhatsApp, on reach, setup, cost, messaging rules, booking and trust, and shows how to decide which to start with and how to run both without doubling your workload."),
      note("Messaging platforms change their rules and prices often. Check Meta's current WhatsApp documentation and pricing before you plan volumes."),

      h2("Who uses which channel"),
      p("The right channel depends on where your customers already are. Website chat reaches everyone who visits your site, including first-time visitors who do not know you. WhatsApp reaches people who already have your number or a link, and who prefer messaging in an app they use daily. In many countries WhatsApp is the default way to talk to businesses; in others it is less common. Ask your customers, and look at how they contact you today."),
      table(["Question", "Points toward website chat", "Points toward WhatsApp"], ["Where do new customers first meet you?", "Search and your website", "Social media, referrals, Google Business Profile links"], ["Do customers already message you?", "Rarely", "Often"], ["How do they prefer to book?", "Online, on their own", "By messaging, as with a friend"], ["Do you serve people in countries where WhatsApp dominates?", "No", "Yes"], ["Are you trying to convert cold traffic?", "Yes", "Less so"]),

      h2("Setup and effort"),
      table(["", "Website chat", "WhatsApp"], ["Accounts needed", "Your assistant account", "Meta business account, developer app, a phone number and access token"], ["Install", "Paste one snippet on your site", "Configure a webhook and verify tokens"], ["Time to launch", "An afternoon", "A day, plus number verification and template approval"], ["Testing", "Immediate", "Test number first, then live number"], ["Ongoing", "Update content", "Update content, manage templates and opt-ins"]),
      p("Website chat is faster to launch. WhatsApp needs more setup but reaches people where they already talk. See the [WhatsApp Cloud API setup guide](/blog/whatsapp-cloud-api-integration-guide) for the steps."),

      h2("Rules and consent"),
      p("Website chat is initiated by the visitor on your site, so the rules are mostly your own privacy notices. WhatsApp has platform rules: businesses can freely reply to customers who message first within a reply window, but must use pre-approved templates to message after that window, and need opt-in for proactive messages. Marketing messages have extra requirements. Respect opt-outs. Check the current rules before you build reminders or campaigns on WhatsApp."),

      h2("Cost"),
      ul("**Website chat:** your assistant platform and AI usage. No per-message platform fee.", "**WhatsApp:** your assistant platform and AI usage, plus Meta's charges for some message types, which vary by country and category and have changed over time."),
      p("With a bring-your-own-key assistant you pay your AI provider directly for usage on both channels. Crescelo's Agency plan at $399 a month includes WhatsApp and Telegram; website chat is on every plan. See [pricing](/pricing)."),

      h2("Booking and lead capture on each channel"),
      p("Both channels can carry the same conversation: answer a question, offer times, confirm and capture details. The differences are in the experience."),
      table(["Task", "Website chat", "WhatsApp"], ["Showing available times", "Buttons or a booking card in the window", "Text list of times; interactive lists may be available"], ["Sharing images and documents", "Possible, depends on widget", "Natural; customers send photos easily"], ["Follow-up after the chat", "Email captured in the chat", "The number is already there; reminders need templates"], ["Session continuity", "Browser identifier; may be lost on a new device", "Persistent in the customer's app"], ["Trust", "Your own domain", "A familiar app, with a verified business badge for some"]),

      h2("Quality of experience"),
      ul("**Website chat** works best with short answers and guided next steps such as a booking card.", "**WhatsApp** rewards a personal, brief tone; people expect quick, informal replies.", "Both need a clear way to reach a person and a statement that they are talking to an AI."),
      p("Write greetings separately for each channel. A long formal greeting suits neither, and WhatsApp users notice immediately."),

      h2("Run both from one assistant"),
      p("The biggest mistake is building two separate bots that give different answers. Use one knowledge base and one set of rules, and connect both channels to it, so a price is the same everywhere. Use a single inbox where your team sees conversations from all channels. See [unifying web, WhatsApp and Telegram in one inbox](/blog/unifying-web-whatsapp-telegram-inbox) and the [messaging channels feature](/product/messaging-channels)."),
      ol("Build and test the assistant on website chat first.", "Add WhatsApp once answers and bookings are reliable.", "Keep the greeting and tone appropriate to each channel.", "Give each channel the same handover rules.", "Review conversations from both channels in one place."),

      h2("Telegram and other channels"),
      p("Telegram is simpler to set up than WhatsApp because bots are a native feature, and it is popular in some regions and communities. If your customers use it, add it after the main channels. See [Telegram bot integration for business chat](/blog/telegram-bot-integration-business-chat). Instagram and Messenger belong to social automation tools; see [Crescelo vs Tidio and ManyChat](/blog/crescelo-vs-tidio-manychat-comparison) for that comparison."),

      h2("Decision guide"),
      table(["If this describes you", "Start with"], ["Most customers find you through search and your website", "Website chat, then add WhatsApp"], ["Customers already message you on WhatsApp", "WhatsApp, with the same assistant on your site"], ["You serve a WhatsApp-heavy country", "Both, WhatsApp first if your traffic comes from social and referrals"], ["You want the fastest launch", "Website chat"], ["You need reminders and follow-ups by message", "WhatsApp, with approved templates"]),

      h2("Privacy"),
      p("Both channels handle personal information. Tell people they are talking to an AI, link to your privacy policy, collect only what you need and understand which providers process the data. WhatsApp involves Meta as well as your assistant vendor and AI provider. See the [GDPR checklist for website chatbots](/blog/website-chatbot-gdpr-checklist). This is general information, not legal advice."),

      h2("Example: a barbershop with both channels"),
      p("A barbershop gets most new customers from Instagram and Google, and most repeat customers message on WhatsApp to rebook. The owner adds the assistant to the website for first-time visitors and connects WhatsApp for regulars."),
      table(["Customer", "Channel", "What the assistant does"], ["First-time visitor from Google", "Website chat", "Answers price and style questions, offers times, captures a name and number"], ["Regular customer", "WhatsApp", "Recognises the rebooking request, offers usual slots and confirms"], ["Customer who ran late", "WhatsApp", "Tells them the current status from the schedule and hands over to the barber if needed"], ["Someone asking about a group booking", "Either", "Collects details and hands over to the owner"]),
      p("The same documents, the same booking rules and the same handover serve both channels, so the owner reviews one set of conversations."),

      h2("Mistakes to avoid when adding WhatsApp"),
      ul("Announcing the number before testing answers and bookings.", "Using a personal number that you need for daily use.", "Sending proactive messages without opt-in or approved templates.", "Writing long formal replies that feel out of place in a chat app.", "Forgetting to tell customers that they are speaking to an AI.", "Letting messages sit unanswered when a person is needed."),
      p("Start with customers who already message you, and expand once the assistant has proved itself."),

      h2("How to test which channel your customers prefer"),
      ol("Look at the last fifty enquiries and count how many came by each route.", "Ask new customers how they would prefer to book, in a short line on your confirmation email.", "Add a WhatsApp button next to the website chat for a month and compare use.", "Track bookings by source so you can see which channel converts.", "Adjust your effort to follow the numbers, not your assumptions."),
      p("Customers surprise businesses. A clinic might expect elderly patients to prefer the phone and discover that many message on WhatsApp all day. A short experiment settles it."),

      h2("A launch plan for adding a second channel"),
      p("Add WhatsApp only after the website assistant has run for a few weeks and you trust its answers. Start with a small group of existing customers, review every conversation for the first week, and only then publish the number widely. Keep the phone number and other routes open while you learn how customers use the new channel, and set expectations about response times in the greeting."),
      table(["Week", "Focus"], ["1", "Test with staff and a few friendly customers on the Meta test number"], ["2", "Move to the real number and invite existing customers"], ["3", "Add the link to your website, Google profile and signature"], ["4", "Review results and decide about templates and reminders"]),

      h2("Frequently asked questions"),
      faq(
        ["Should I use WhatsApp or website chat for my service business?", "Start where your customers already are. Website chat reaches new visitors; WhatsApp reaches people who prefer messaging. Many businesses use both with one assistant."],
        ["Is a WhatsApp bot harder to set up?", "Yes. It needs a Meta business account, a developer app, a phone number, a token and a webhook. Website chat needs one snippet on your site."],
        ["Can one assistant serve both channels?", "Yes. Use one knowledge base and connect both channels, so answers are consistent."],
        ["Does WhatsApp cost extra?", "Meta charges for some message types, and prices vary. Replies to customers who message you are generally cheaper than proactive messages."],
        ["Can a WhatsApp bot book appointments?", "Yes. It can offer times and confirm in the chat, and send reminders using approved templates."],
        ["Which plan includes WhatsApp in Crescelo?", "The Agency / Scale plan includes WhatsApp Cloud API and Telegram integrations."],
      ),
      p("See the [messaging channels feature](/product/messaging-channels), try the assistant in the [playground](/playground) and [start a free trial](/login?mode=register)."),
    ],
  }),

  pillar({
    slug: 'off-the-shelf-vs-custom-built-ai-chatbots',
    title: 'Build vs Buy: Off-the-Shelf or Custom-Built AI Chatbot?',
    description: 'Should you build a custom AI chatbot or buy one? Compare cost, time, maintenance, security and control, and see what a custom build really involves.',
    primaryKeyword: 'build vs buy AI chatbot',
    secondaryKeywords: ['custom AI chatbot development cost', 'off the shelf chatbot', 'build your own chatbot', 'custom vs platform chatbot'],
    body: [
      p("Every few months a business owner asks whether it would be cheaper to have a developer build a custom chatbot than to pay for a platform. On paper the answer looks obvious: the model APIs are cheap, and a prototype takes a weekend. In practice, the model is a small part of a chatbot that customers can rely on. This guide breaks down what a custom build really involves, what an off-the-shelf platform gives you, how the costs compare over a year and when each choice makes sense."),

      h2("What is inside a business chatbot"),
      p("A demo shows a chat window and a model. A working business assistant has many more parts, and each is real engineering."),
      table(["Component", "What it does", "Why it is harder than it looks"], ["Content ingestion", "Reads PDFs, Word files, web pages and text", "Messy formats, scanned files, tables and updates"], ["Chunking and indexing", "Splits content and stores it for search", "Poor chunking causes wrong answers; see [chunking strategies](/blog/document-chunking-strategies-pdf-docx)"], ["Retrieval", "Finds the right passages", "Needs hybrid search and tuning; see [hybrid retrieval](/blog/hybrid-rag-dense-vector-sparse-keyword)"], ["Grounding and guardrails", "Makes the model answer only from your content", "Testing and constant refinement; see [preventing hallucinations](/blog/grounded-ai-chatbot-hallucinations)"], ["Chat widget", "The window on your site", "Style isolation, mobile, accessibility, performance"], ["Booking engine", "Real availability, slot locking, confirmations", "Concurrency, time zones, buffers; see [double booking prevention](/blog/double-booking-prevention-concurrency-mutex)"], ["Lead capture and delivery", "Stores leads and alerts you", "Email, webhooks, CRM"], ["Human handover", "Lets your team join", "Notifications, inbox, history"], ["Security and privacy", "Keys, access, isolation, data deletion", "Ongoing responsibility"], ["Analytics and review", "Shows conversations and gaps", "Dashboards and tooling"], ["Channels", "WhatsApp, Telegram and others", "Each has its own API and rules"]),
      p("A weekend prototype covers two or three rows. A production assistant covers all of them and keeps covering them as models, APIs and browsers change."),

      h2("What buying gives you"),
      ul("**Speed:** live in hours or days.", "**A complete feature set** that already handles the components above.", "**Maintenance done for you:** model changes, browser changes, security patches.", "**Predictable cost:** a subscription instead of development invoices.", "**Support** and documentation.", "**Continuing improvement** as the vendor ships features."),
      p("The trade-offs are less control over unusual features, dependence on the vendor's roadmap and the need to accept their data practices. Review a vendor's privacy policy, sub-processors and export options before you commit."),

      h2("What building gives you"),
      ul("**Full control** over behaviour, design and data location.", "**Custom integrations** with internal systems that a platform does not support.", "**Ownership** of the code and no per-seat fees.", "**Differentiation** if the chatbot is the product you sell."),
      p("These are real advantages for the right business. The cost is the engineering and maintenance burden."),

      h2("A cost comparison over one year"),
      p("These are illustrative ranges to show the shape of the comparison. Get real quotes."),
      table(["Item", "Buy a platform", "Build a custom assistant"], ["Initial development", "None", "Weeks to months of developer time"], ["Setup", "Hours to days", "Included in development"], ["Subscription or hosting", "Monthly plan", "Servers, databases, monitoring"], ["AI usage", "Your own key or bundled", "Model API costs"], ["Maintenance", "Included", "Ongoing developer time for fixes and updates"], ["Security and compliance work", "Shared with the vendor", "Entirely yours"], ["Feature additions", "Vendor roadmap", "Each one is a project"]),
      p("A typical small business platform costs from tens to a few hundred dollars a month. A custom build that reaches the same level of function can run to many months of developer effort, plus maintenance that never ends. Unless the chatbot is core to what you sell or you have unusual requirements, the platform is almost always cheaper for the first few years."),

      h2("Hidden costs of building"),
      ul("**Maintenance:** models, libraries and APIs change; something breaks every few months.", "**Quality tuning:** getting answers right is an ongoing process, not a one-off task.", "**Security:** you are responsible for key storage, isolation between customers and incident response.", "**Bus factor:** if the developer leaves, who understands it?", "**Opportunity cost:** time spent on the chatbot is not spent on your business."),

      h2("Hybrid approach: buy the platform, customise the edges"),
      p("Many businesses land here. Use a platform for the core, and extend it with your own logic where needed: webhooks to your systems, automation tools such as Zapier or Make, custom widget styling, your own AI provider. See [webhook automations with Zapier and Make](/blog/webhook-automations-zapier-make-chat-events) and [customising widget branding with CSS](/blog/customize-widget-branding-css). This gives you speed and maintenance from the vendor and flexibility where it matters."),

      h2("When building makes sense"),
      ul("The chatbot is your product, or a core differentiator.", "You have strict requirements on data location or on-premises hosting that no platform meets.", "You need deep integration with proprietary systems.", "You have a development team with capacity and a plan for maintenance.", "Your volume is so large that per-conversation platform economics no longer work."),

      h2("When buying makes sense"),
      ul("You are a service business and the chatbot supports your work rather than being it.", "You want to be live this week.", "You do not have developers, or their time is better used elsewhere.", "You want maintenance and security handled.", "You want to try before you commit."),

      h2("A decision framework"),
      ol("Write down the three jobs the chatbot must do.", "Check whether platforms you can trial already do them.", "Test two platforms on your own documents for an hour each.", "If a platform covers eighty percent of the need, buy and extend.", "If none does and the gap is essential, price a custom build honestly, including maintenance for three years.", "Decide with numbers, not with the excitement of a demo."),
      p("Our [platform comparison guide](/blog/website-chatbot-platform-comparison) provides a scorecard, and you can try Crescelo on your content in the [playground](/playground)."),

      h2("Security when you choose a platform"),
      p("Whichever route you take, ask about key storage, workspace isolation, two-factor authentication, data deletion and sub-processors. Crescelo stores AI provider keys encrypted, isolates workspaces and lists its legal documents, including a [data processing addendum](/dpa) and [sub-processors](/subprocessors); it does not claim compliance certifications. Read [how a bring-your-own-key vault works](/blog/cryptographic-byok-vault-aes-256-gcm) to see what good looks like."),

      h2("A realistic timeline for a custom build"),
      table(["Phase", "What happens", "Typical effort"], ["Discovery", "Requirements, content audit, choice of models and architecture", "Days to weeks"], ["Prototype", "Basic chat with retrieval over a few documents", "Days"], ["Hardening", "Guardrails, evaluation set, fallbacks, error handling", "Weeks"], ["Product features", "Widget, booking, leads, handover, admin", "Weeks to months"], ["Security and privacy", "Key storage, isolation, deletion, logging, review", "Weeks"], ["Launch and tuning", "Real traffic, fixes, content improvements", "Ongoing"]),
      p("The prototype phase is the one that looks cheap, and it misleads: most of the effort and cost sits after it. That is why estimates for custom builds so often grow, and why platforms that have already done this work are attractive."),

      h2("Questions to ask a developer or agency"),
      ul("Who will maintain it in a year, and what will that cost per month?", "How will we measure answer accuracy, and how often?", "How are keys, data and customer workspaces protected?", "What happens if the model provider changes prices or deprecates a model?", "How will bookings avoid double booking under load?", "What do we own at the end, and how do we move it if we change supplier?"),
      p("If the answers are vague, treat the estimate as a lower bound."),

      h2("Example: two businesses, two decisions"),
      h3("A three-location dental group"),
      p("The group wants patients to ask about treatments, insurance and hours, and to book with the right dentist. It has no developers. It chooses a platform, loads its documents, connects calendars and limits what the chat collects. Time to launch: two weeks including approvals. Total cost is a monthly plan plus AI usage."),
      h3("A software company selling a chatbot product"),
      p("The company's product is a chatbot for a niche industry, with proprietary data sources and customers who need on-premises hosting. Here the chatbot is the product, so it builds. It has an engineering team, an evaluation process and a support function. Buying a platform would make its product a reseller of someone else's."),
      p("The same question gives opposite answers because the businesses are different. Be honest about which one you are."),

      h2("Frequently asked questions"),
      faq(
        ["Is it cheaper to build my own AI chatbot?", "Rarely for a service business. The model API is cheap, but ingestion, retrieval, guardrails, booking, handover, security and maintenance add up to a lot of engineering."],
        ["How long does it take to build a custom chatbot?", "A prototype takes days. A reliable business assistant with booking and handover takes months, and needs ongoing maintenance."],
        ["Can I customise an off-the-shelf chatbot?", "Yes, through settings, styling, webhooks, integrations and your choice of AI provider."],
        ["What are the risks of building my own?", "Wrong answers, security gaps, maintenance burden and dependence on a few people."],
        ["When should a business build a custom chatbot?", "When the chatbot is a core product, when strict data requirements rule out platforms, or when integration needs are unique and you have the team to maintain it."],
        ["How can I test a platform quickly?", "Load your real documents, ask thirty real questions including some it cannot answer, and try a booking. The playground lets you do this without an account."],
      ),
      p("See [how the AI assistant feature](/product/ai-assistant) works and [start a free trial](/login?mode=register) to compare it with your build option."),
    ],
  }),

  pillar({
    slug: 'ai-chatbot-vs-outsourced-offshore-receptionists',
    title: 'AI Chatbot vs Outsourced or Offshore Receptionists: Cost, Quality and Risk',
    description: 'Compare an AI chatbot with outsourced or offshore receptionist services on cost, quality, hours, training, privacy and control, and how to decide or combine them.',
    primaryKeyword: 'AI vs outsourced receptionist',
    secondaryKeywords: ['offshore receptionist', 'virtual receptionist service vs AI', 'outsourced front desk', 'AI receptionist vs call center'],
    body: [
      p("Outsourcing reception to a virtual or offshore team is a popular way for small businesses to cover the phone and chat without hiring in-house. An AI chatbot is another way to cover the same ground. The two differ in cost pattern, quality control, hours, privacy and how well they know your business. This guide compares them fairly, shows the questions to ask an outsourcing provider, describes the risks of each and explains how many businesses use both."),
      note("Whether a service is 'offshore', 'nearshore' or local varies by provider. This article compares the general model of outsourced human receptionists with AI, not any specific company."),

      h2("How outsourced reception works"),
      p("A provider employs receptionists, sometimes in another country, who answer on behalf of many clients. They follow a script and knowledge sheet you provide, take messages, transfer urgent calls, and in some plans book appointments or answer chat. You pay a monthly fee, often with included hours or calls and extra charges beyond them."),
      h2("How an AI chatbot works alongside"),
      p("An AI assistant reads your documents and replies in chat, capturing leads and booking appointments. It works on the website and messaging channels. Phone answering is a separate channel; Crescelo's voice feature is under development and shown on the [roadmap](/roadmap), so today the comparison is mainly about chat and messaging."),

      h2("Side-by-side"),
      table(["", "Outsourced receptionists", "AI chatbot"], ["Hours", "Often 24/7 or extended", "24/7"], ["Channels", "Phone first, some chat", "Web chat and messaging apps"], ["Speed", "Depends on queue", "Seconds"], ["Product knowledge", "Script and notes; agents serve many clients", "Reads all your documents"], ["Empathy and judgement", "Human", "Limited; hands over sensitive cases"], ["Consistency", "Varies by agent", "High"], ["Cost pattern", "Base plan plus per-minute or per-call charges", "Subscription plus small AI usage"], ["Scales", "Costs grow with volume", "Cost rises slowly"], ["Booking", "Depends on plan", "Live calendar booking (Growth)"], ["Records", "Message summaries or call notes", "Full transcripts and analytics"], ["Training", "Days to weeks, repeated as agents change", "Load content once, update as needed"]),

      h2("Cost: how to compare properly"),
      p("Outsourcing prices are hard to compare because they mix base fees, included minutes, overage charges, setup fees and extras such as bilingual agents or appointment booking. Ask each provider for a total price at your current volume and at double."),
      table(["Line to request", "Why"], ["Base monthly fee and what it includes", "The starting point"], ["Price per additional minute, call or chat", "Overage is where bills grow"], ["Setup or onboarding fee", "One-off cost"], ["Extras: booking, languages, after-hours, call transfers", "Often priced separately"], ["Minimum contract length and cancellation terms", "Lock-in risk"], ["Total at 2x volume", "Growth check"]),
      p("For the AI side, the platform subscription is fixed, and AI usage is small per conversation. See [bring-your-own-key versus bundled pricing](/blog/byok-vs-bundled-ai-pricing-cost-comparison). Our [ROI guide](/blog/ai-website-assistant-roi-calculator) shows how to weigh either against the value of enquiries you would otherwise miss."),

      h2("Quality: what each does well and badly"),
      h3("Outsourced receptionists"),
      ul("**Good at:** a human voice, taking messages, handling upset callers, following a call script.", "**Weaker at:** deep knowledge of your services, consistent wording across agents, being the same person each time, and detailed price or policy questions.", "**Risks:** language and accent mismatch with your customers, high turnover at the provider, and a script that becomes stale."),
      h3("AI chatbot"),
      ul("**Good at:** accurate answers from your documents, instant replies, structured lead capture, booking, consistency.", "**Weaker at:** empathy, unusual situations and judgement.", "**Risks:** wrong answers if not grounded, and poor handling of sensitive cases without handover rules."),
      p("See [how to stop a chatbot from making things up](/blog/grounded-ai-chatbot-hallucinations) and [live human handover flow design](/blog/live-human-handover-flow-design) for the safeguards that matter."),

      h2("Privacy and data"),
      p("Outsourcing gives more people access to customer information, sometimes in other countries, and you need an agreement that covers confidentiality, data location and how calls or chats are recorded and stored. An AI assistant sends data to your assistant vendor and your AI provider, so you need to understand those processors. In both cases, tell customers who they are talking to and link to your privacy policy. If you serve people in Europe or California, see the [GDPR checklist for website chatbots](/blog/website-chatbot-gdpr-checklist). This is general information, not legal advice."),

      h2("Control and accountability"),
      p("With outsourcing, quality depends on the provider's training and management of agents you do not see. With an assistant, you control the content, the rules and the review process, and you can read every conversation. Neither removes your responsibility for what is said on your behalf."),

      h2("Using both"),
      p("Many small businesses combine them: an outsourced service for phone calls, and an AI assistant for the website and messaging. The assistant handles the chat channels and out-of-hours enquiries; the outsourced team handles calls that need a person. Keep information consistent by sharing the same price list and policies with both, and by reviewing complaints from either side."),
      ol("List the channels your customers use and the volume on each.", "Cover chat and messaging with the assistant.", "Cover phone with a provider if phone volume justifies it.", "Give both the same documents and escalation rules.", "Review both monthly against bookings, response times and customer feedback."),

      h2("Questions to ask an outsourcing provider"),
      ul("Where are the agents, and what languages do they speak fluently?", "How are agents trained on my business, and how do updates reach them?", "What is the turnover, and will I get the same people?", "How are calls recorded, stored and protected?", "What are the overage rates and the contract terms?", "Can I listen to sample calls or read sample chats?", "How are urgent matters escalated to me, and how fast?"),

      h2("Questions to ask an AI provider"),
      ul("Does it answer only from my documents and admit when it does not know?", "Can I see the source of each answer?", "How is booking protected against double booking?", "How do I take over a conversation?", "What does it cost at twice my volume?", "Where is my data stored and can I delete it?"),

      h2("Decision guide"),
      table(["If", "Then"], ["Almost all enquiries arrive by phone", "Consider an outsourced service for calls, and add chat for the website"], ["Most enquiries arrive through the website and messaging", "Start with an AI assistant"], ["Your calls are sensitive and emotional", "Prefer trained people and keep AI to simple tasks"], ["You want the lowest cost at growing volume", "AI first, humans for escalation"], ["You need many languages", "Test AI in those languages; check an outsourcer's fluency in each"]),

      h2("A worked comparison for a small clinic"),
      p("Imagine a clinic with 250 enquiries a month: 120 by phone, 100 by website and 30 by messaging apps. Phone calls need a person, so the clinic considers an outsourced service for those and an AI assistant for the rest."),
      table(["Channel", "Volume", "Best fit", "Reason"], ["Phone", "120", "Outsourced service", "Voice; some callers need reassurance"], ["Website chat", "100", "AI assistant", "Routine questions, bookings at any hour"], ["Messaging apps", "30", "AI assistant", "Same knowledge, instant replies"]),
      p("The outsourced service now handles 120 calls instead of 250 enquiries, which usually lowers its bill, and the assistant covers the rest. Both use the same price list and policies, and the clinic reviews complaints from each every month."),

      h2("Red flags in a receptionist provider"),
      ul("Unwillingness to share sample calls or transcripts.", "A script that is never updated after the first week.", "High agent turnover and no continuity.", "Vague answers about data storage or call recording.", "Long minimum contracts before you have seen results.", "Charges that are difficult to predict."),

      h2("Setting expectations with customers"),
      p("Whichever option you choose, be honest with customers about who they are talking to. Say so in the greeting of a chat, and make sure a phone caller knows they are speaking to a receptionist service acting for you. Give a clear way to reach you directly when something is urgent. Customers forgive limits they are told about far more readily than surprises."),

      h2("How to run a fair trial of each"),
      ol("Choose ten realistic customer questions and three difficult ones.", "Give the outsourcer and the assistant the same documents.", "Test them at different times of day, including nights and weekends.", "Compare answers for accuracy, tone and next steps.", "Measure response time and what happens to urgent cases.", "Ask a colleague to test blind and rate the experience."),
      table(["Score", "Outsourced service", "AI assistant"], ["Accuracy", "", ""], ["Tone", "", ""], ["Speed", "", ""], ["Handling of urgent case", "", ""], ["Total cost at current volume", "", ""], ["Total cost at double volume", "", ""]),

      h2("Frequently asked questions"),
      faq(
        ["Is an AI chatbot cheaper than an outsourced receptionist?", "For chat and routine questions, usually, because AI usage costs little per conversation while outsourcing charges by minute or call. Compare totals at your volume."],
        ["Can an AI chatbot answer the phone?", "Some products can. Crescelo works in website chat and messaging apps today; phone answering is under development."],
        ["Are offshore receptionists lower quality?", "Not necessarily; quality varies by provider. Check language fluency, training and turnover, and listen to samples."],
        ["Can I use an outsourced service and an AI together?", "Yes. Use the AI for web chat and out-of-hours enquiries and the service for phone calls, with shared information."],
        ["Which is better for privacy?", "Neither is automatically better. Check agreements, data location and the processors involved for each."],
        ["How do I compare them?", "Ask for total price at current and double volume, test real questions, and check what happens to urgent or unusual cases."],
      ),
      p("Try the assistant on your own documents in the [playground](/playground), and compare with our guide to [AI receptionist vs answering service](/blog/ai-receptionist-vs-answering-service)."),
    ],
  }),

  pillar({
    slug: 'deploy-ai-website-assistant-step-by-step',
    title: 'How to Deploy an AI Website Assistant: A Step-by-Step Launch Plan',
    description: 'A complete launch plan for an AI website assistant: content, AI provider, testing, booking, handover, embed code, go-live checks and the first 30 days after launch.',
    primaryKeyword: 'deploy AI website assistant',
    secondaryKeywords: ['launch AI chatbot', 'AI assistant setup guide', 'chatbot go-live checklist', 'how to set up an AI receptionist'],
    body: [
      p("Launching an AI website assistant is not a single step but a short project: gather content, connect an AI provider, test, configure booking and handover, install the widget and watch the first weeks. Done in order, it takes an afternoon of work and a few minutes a week afterwards. Done out of order, you launch an assistant that guesses. This guide is a complete runbook, with the exact stages, the checks at each one and the mistakes that cause most bad launches. Where steps are specific to Crescelo we say so; the plan applies to any product."),

      h2("Overview: seven stages"),
      table(["Stage", "Goal", "Typical time"], ["1. Prepare content", "Documents that answer real questions", "1 to 2 hours"], ["2. Create the assistant and add knowledge", "Assistant reading your content", "20 minutes"], ["3. Connect an AI provider", "Model that writes replies", "10 minutes"], ["4. Test in a private area", "Confidence that answers are right", "1 hour"], ["5. Configure booking, leads and handover", "Actions that turn chats into business", "30 to 60 minutes"], ["6. Install the widget", "Assistant live on your site", "10 minutes"], ["7. Review and improve", "Accuracy that grows", "15 minutes a week"]),

      h2("Stage 1: Prepare your content"),
      p("Content decides quality more than any setting. Gather what you already use to answer customers, then improve it."),
      ol("Collect your price list, service descriptions, policies, opening hours, FAQ and terms.", "Read each document critically: remove anything out of date, resolve conflicts between documents and make sure each service has a name, a price or range and what is included.", "List the ten questions your team answers most often and check each is answered in writing.", "Write down what the assistant must never say: advice you are not qualified to give, discounts you have not approved, guarantees.", "Split large documents into short, clearly titled pages."),
      p("More detail on writing for retrieval is in [preparing your service menu and pricing documents](/blog/prepare-service-menu-pricing-docs-rag) and [document chunking strategies](/blog/document-chunking-strategies-pdf-docx)."),

      h2("Stage 2: Create the assistant and add knowledge"),
      p("In Crescelo, start a free trial, then open the dashboard. In the Knowledge Base you can upload files, paste text or add your website address. Give the assistant a name, a greeting and a tone. Keep the greeting short and specific to the job, for example 'Ask about our services or book a time'. If you offer bookings, say so."),
      ul("Upload documents one topic at a time so you can see each was read.", "Add your website address if your site already holds the answers; check that the pages were read correctly.", "Note which sources you added and when, so you know what to refresh later."),

      h2("Stage 3: Connect an AI provider"),
      p("Crescelo uses a bring-your-own-key model: paste a key from a provider such as OpenAI, Anthropic, Google, Groq or DeepSeek, and the provider bills you directly, with no markup. A free engine is available to start and test. If you connect your own, create a dedicated key for this assistant, set a spending limit with the provider and store the key only in the assistant's AI settings. See [which AI model to connect](/blog/byok-ai-chatbot-guide) and [BYOK versus bundled pricing](/blog/byok-vs-bundled-ai-pricing-cost-comparison)."),

      h2("Stage 4: Test before anyone else sees it"),
      p("Use the Testing Studio, the private area inside the dashboard. Treat it as a customer would."),
      table(["Test", "What to check"], ["Ten common questions, in different words and with typos", "Correct, complete answers"], ["Three questions your content cannot answer", "It says it does not know and offers a person or a form"], ["A request for a discount or guarantee", "It declines and does not promise"], ["A booking", "Real times, confirmation and email"], ["A request for a person", "Your team is notified"], ["A question in another language you serve", "Understandable and correct answer"], ["A rude or off-topic message", "Polite, brief, back on topic"]),
      p("Fix each failure by improving the source content, not by piling instructions on the assistant. Retest after each change. See [how to stop a chatbot from making things up](/blog/grounded-ai-chatbot-hallucinations) and [the ten questions every service business chatbot should answer well](/blog/essential-chatbot-questions-service-business)."),

      h2("Stage 5: Configure the actions"),
      h3("Appointment booking"),
      p("On the Growth plan and above, add your services with durations and prices, opening hours, holidays, buffers and staff, and connect your calendar. Test two people choosing the same slot. See [AI appointment booking](/blog/ai-appointment-booking) and [configuring calendar sync and availability rules](/blog/configure-calendar-sync-availability-rules)."),
      h3("Lead capture"),
      p("Decide what you need from a lead: usually a name, a way to reach them and what they want. Turn on instant email alerts, and, if you use them, webhooks or CRM delivery. See [conversational lead capture](/blog/conversational-lead-capture)."),
      h3("Handover"),
      p("Set who is notified when a visitor asks for a person, and how. Decide which topics always hand over: complaints, emergencies, anything about money or safety. See [live human handover flow design](/blog/live-human-handover-flow-design)."),
      h3("Honesty and privacy"),
      p("Make sure the chat says it is an AI assistant and links to your privacy policy. See the [GDPR checklist for website chatbots](/blog/website-chatbot-gdpr-checklist) if you serve people in Europe."),

      h2("Stage 6: Install the widget"),
      p("Copy the embed snippet from the Overview page (Add to website) or the Deploy button in the top bar, and paste it just before the closing body tag of your site. Platform-specific steps are in the guides for [WordPress](/blog/install-ai-chatbot-wordpress-guide) and [Webflow, Squarespace and Wix](/blog/embed-ai-chatbot-webflow-squarespace-wix), and the general version is in [how to add an AI chatbot to your website](/blog/add-ai-chatbot-to-your-website)."),
      ol("Publish the change.", "Open the live site in a private window.", "Ask two questions and try a booking.", "Check on a phone.", "Check page speed before and after."),

      h2("Stage 7: The first 30 days"),
      table(["When", "What to do"], ["Day 1", "Read every conversation; fix errors immediately"], ["Days 2 to 7", "Read conversations daily; add answers for unanswered questions"], ["Week 2", "Check bookings and leads; confirm emails and alerts work"], ["Week 3", "Review handover requests; adjust rules"], ["Week 4", "Compare with your baseline; decide what to improve next"]),
      p("Set a recurring ten-minute weekly review. See [how to review your chatbot's conversations each week](/blog/audit-website-chatbot-conversations)."),

      h2("Go-live checklist"),
      ul("Content reviewed and current.", "Ten common questions tested; three unanswerable questions tested.", "Discount and guarantee requests declined.", "Booking tested end to end, including a clash.", "Confirmation emails arrive.", "Handover notifies the right person.", "AI disclosure and privacy link visible.", "Tested on phone and desktop.", "Page speed checked.", "Weekly review scheduled."),

      h2("Common launch mistakes"),
      ul("Skipping content preparation.", "Testing only the questions you expect.", "Forgetting to test booking failures.", "Not telling anyone on your team how handover works.", "Hiding the widget on mobile by accident.", "Launching on every page without checking the main ones.", "Never reading conversations."),

      h2("If something goes wrong"),
      p("Removing the snippet from your site removes the assistant instantly, and your content and conversations stay in your dashboard. Keep a note of what you changed so you can undo it. If answers are wrong, correct the source content and retest before restoring."),

      h2("A sample test script you can copy"),
      p("Print this and tick each line as you test. It takes about forty minutes."),
      table(["#", "Test", "Pass if"], ["1", "Ask 'How much is [your main service]?'", "Correct price and what is included"], ["2", "Ask the same in different words with a typo", "Same correct answer"], ["3", "Ask about your opening hours on a holiday", "Correct, or says it does not know"], ["4", "Ask something your content never mentions", "Admits it does not know and offers a route"], ["5", "Ask for a discount", "Declines politely"], ["6", "Ask it to confirm you a same-day appointment when none exists", "Does not promise; offers real times"], ["7", "Book two appointments at the same time from two windows", "Only one succeeds"], ["8", "Ask for a person", "Team notified with the conversation"], ["9", "Type an angry message", "Calm reply and a route to a person"], ["10", "Open the site on a phone", "Chat fits and is usable"]),

      h2("Who should own the assistant"),
      p("Name one person as owner. Their job is small but important: read the weekly conversations, keep the documents current, answer handovers quickly and decide when to change rules. Without an owner, an assistant slowly goes stale. In a small business the owner is often the same person who wrote the price list. Give them ten minutes in their calendar every week."),

      h2("What to tell your team"),
      ul("What the assistant will and will not do.", "How they will be notified when a visitor wants a person.", "Where to see conversations and bookings.", "How to correct a wrong answer.", "What to do in an emergency message."),
      p("A short briefing prevents confusion and makes staff allies of the assistant instead of skeptics."),

      h2("Five days instead of one afternoon"),
      p("If you prefer to spread the work, this schedule keeps each day light and gives you time to think between steps."),
      table(["Day", "Work"], ["Monday", "Collect and clean your documents; write the ten common questions"], ["Tuesday", "Create the assistant, load content and connect the AI provider"], ["Wednesday", "Test with the script and fix content gaps"], ["Thursday", "Configure booking, lead alerts and handover; brief your team"], ["Friday", "Install the widget, run the live checks and watch the first conversations"]),
      p("A staged launch also gives you a natural stopping point: if Wednesday's tests fail, delay Friday. There is no prize for launching early with wrong answers."),

      h2("Frequently asked questions"),
      faq(
        ["How long does it take to deploy an AI website assistant?", "A small business can be live in an afternoon: an hour or two for content, an hour for testing and configuration and minutes for installation."],
        ["Do I need a developer?", "Not for a standard site. You paste one snippet into your site's settings or footer."],
        ["What should I test before going live?", "Common questions, questions your content cannot answer, discount and guarantee requests, a booking, a handover and the mobile view."],
        ["What happens if the assistant gives a wrong answer?", "Find the source passage or missing document, correct it and retest. Weekly review catches these early."],
        ["Can I turn it off quickly?", "Yes. Remove the snippet and it disappears from your site at once; your data stays in the dashboard."],
        ["How much time does it need after launch?", "About ten to fifteen minutes a week to review conversations and update content."],
      ),
      p("Rehearse the first stages in the [playground](/playground) without an account, then [start a free trial](/login?mode=register). The [help centre](/support) has product guides for each step."),
    ],
  }),
];
