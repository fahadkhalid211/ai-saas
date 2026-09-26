import { faq, h2, ol, p, pillar, table, ul } from '../authoring';

export const PILLAR24 = [
  pillar({
    slug: 'service-business-chat-analytics-playbook',
    title: 'Chat Analytics for Service Businesses: The Numbers That Matter and What to Do About Them',
    description: 'A practical playbook for reading chatbot analytics: which metrics matter, how to review conversations weekly, what unanswered questions tell you, benchmarks to avoid and actions for each finding.',
    primaryKeyword: 'chatbot analytics for service businesses',
    secondaryKeywords: ['chat conversation metrics', 'AI assistant reporting', 'measure chatbot ROI', 'chatbot KPIs'],
    body: [
      p("A chatbot that nobody reviews slowly gets worse. Prices change, services are added, seasonal questions arrive and the knowledge base drifts out of date, while the assistant keeps answering with confidence. Analytics is how you notice. But most dashboards offer far more numbers than a small service business can use, and it is easy to stare at a total-conversations chart and learn nothing. This playbook picks the handful of measures that actually change decisions, shows how to read them, and gives a fifteen-minute weekly routine that turns them into improvements. It is written for owners of salons, clinics, trades, studios and similar businesses, and it avoids invented benchmarks: your own trend over time is the only comparison that matters."),

      h2("Start with the question, not the chart"),
      p("Every metric should answer a decision you might make. If a number cannot change what you do, ignore it."),
      table(["Decision", "Metric that informs it"], ["Is the assistant worth keeping?", "Leads captured and bookings made through chat"], ["Is the knowledge base good enough?", "Questions the assistant could not answer"], ["Do I need staff cover at certain times?", "Conversations by day and hour, and handovers"], ["Is the website converting visitors?", "Share of chats that end in a booking or contact"], ["Are answers trustworthy?", "Sampled conversation quality and corrected answers"]),

      h2("The six measures worth tracking"),
      ol("**Conversations started.** The top of the funnel. Useful as a trend, not a target.", "**Leads captured.** Conversations that ended with contact details. Divide by conversations to get a capture rate.", "**Bookings made.** Appointments confirmed through the chat, and the share of chats that produce one.", "**Unanswered or low-confidence questions.** The single most useful list for improving the assistant.", "**Handovers to a person.** How often the assistant passes a conversation to staff, and why.", "**Busy times.** Which days and hours visitors chat, especially outside opening hours."),
      p("Everything else is detail. If you track only these six, you will know whether the assistant earns its place and where to improve it."),

      h2("Reading each measure"),
      h2("Conversations and capture rate"),
      p("A rising conversation count with a flat capture rate means visitors are engaging but not converting. Look at the questions they ask before leaving: often the answer is missing pricing, unclear next steps or no prompt to leave details. A falling count after a website change may mean the widget is hidden or slower to load. Compare against the same weeks in previous months, because service demand is seasonal."),
      h2("Unanswered questions"),
      p("This is the gold list. Each unanswered question is a visitor who wanted something your documents did not contain. Group them: pricing gaps, policy gaps, service gaps, location gaps and things you genuinely do not offer. Then add a short, factual passage for each recurring theme. Ten minutes of writing here usually improves more conversations than any setting."),
      h2("Handovers"),
      p("Some handovers are healthy: complaints, complex cases and people who ask for a human. Too many suggests the assistant lacks information; none at all may mean it is holding on to conversations it should pass on. Read a handful each week and ask whether a person was really needed."),
      h2("Busy times"),
      p("If a quarter of chats arrive after closing, that is demand you were previously missing, and a reason to make sure the assistant can book or capture details out of hours. If chats spike on Monday mornings, plan staff attention for follow-up then."),

      h2("A fifteen-minute weekly routine"),
      ol("Open the list of unanswered questions and pick the top three themes. Write or update a passage for each.", "Read five conversations chosen at random and five that ended in handover. Note anything wrong, cold or confusing.", "Check leads and bookings from the week: did any need manual follow-up? Were details complete?", "Glance at counts against last month, only to spot a sudden change.", "Write down one change to make before next week."),
      p("The habit matters more than the tooling. See [testing starter prompts](/blog/ab-test-chatbot-starter-prompts) for a question set you can reuse in this review."),

      h2("Sampling conversations well"),
      ul("Read a mix: short and long, booked and abandoned, day and night.", "Read the last message of abandoned chats: where did the visitor stop?", "Look for repeated phrasing you have not seen before; that is new demand.", "Note answers that were correct but poorly worded, and fix the source text.", "Keep a running list of corrections and check that they hold."),

      h2("Connect chat to money"),
      p("Put a value on outcomes so the numbers mean something to you. If an average appointment is worth $80 and chat produced twelve bookings this month, that is roughly $960 of business the assistant helped book, before subtracting the cost of the plan. Be modest in attribution: some of those visitors might have booked anyway. Measure honestly by asking new customers how they booked, and by comparing out-of-hours bookings, which the assistant is more clearly responsible for."),
      table(["Outcome", "How to value it"], ["Booking through chat", "Typical appointment value, minus your margin of doubt"], ["Lead captured", "Your lead-to-customer rate times average customer value"], ["Question answered without staff", "Minutes saved times hourly cost, only if you actually reallocate the time"]),

      h2("Benchmarks: use with care"),
      p("You will see published figures for chatbot capture rates and resolution rates. Treat them as anecdotes: definitions differ, industries differ and the sources are often vendors. Your own trend, measured the same way each month, is more reliable. If capture rate improves after you add pricing to the documents, that is a real signal."),

      h2("Common mistakes"),
      ul("Chasing total conversations instead of outcomes.", "Never reading actual conversations.", "Ignoring unanswered questions.", "Comparing week to week without accounting for seasons.", "Treating every handover as a failure.", "Making many changes at once so nothing can be attributed."),

      h2("A worked monthly review"),
      table(["Question", "What to look at", "Possible action"], ["Did chat earn its place?", "Leads and bookings this month against last", "Keep, or improve the weakest step"], ["What did visitors want that we lacked?", "Top unanswered themes", "Write three new passages"], ["Were people passed on well?", "A sample of handovers", "Improve the details staff receive"], ["When should we be ready?", "Busiest days and hours", "Adjust staffing or out-of-hours booking"]),
      p("Write the outcome of each review in two lines and keep the notes. After a few months you will see which changes worked, which is more valuable than any single chart."),

      h2("Frequently asked questions"),
      faq(
        ["Which chatbot metrics matter most?", "Leads captured, bookings made, unanswered questions, handovers and busy times. Together they show value and what to fix."],
        ["How often should I review analytics?", "A fifteen-minute weekly review is enough for most small businesses."],
        ["What is a good capture rate?", "Compare against your own history. Published figures use different definitions and are not reliable targets."],
        ["Why do unanswered questions matter?", "Each is a visitor whose need your documents did not cover, and each fix improves many future conversations."],
        ["Should I read individual conversations?", "Yes. Reading a small sample weekly reveals problems that counts hide."],
        ["How do I measure return on investment?", "Value the bookings and leads the assistant produced, subtract the plan and AI costs and be conservative about attribution."],
      ),
      p("See the [human handover feature](/product/human-handover), try a sample in the [playground](/playground) and read [how to reduce funnel drop-off in chat](/blog/tracking-in-chat-funnel-drop-off) and [first contact resolution](/blog/first-contact-resolution-fcr-ai-chat)."),
    ],
  }),

  pillar({
    slug: 'tracking-in-chat-funnel-drop-off',
    title: 'Where Chat Visitors Drop Off: Finding and Fixing Leaks in the Conversation Funnel',
    description: 'A step-by-step guide to the chat conversion funnel: opening, first answer, interest, contact details and booking. Where visitors leave, how to spot it in transcripts and what to change.',
    primaryKeyword: 'chat funnel drop-off',
    secondaryKeywords: ['chatbot conversion funnel', 'reduce chat abandonment', 'improve chatbot lead capture', 'conversation drop off analysis'],
    body: [
      p("Every chat conversation is a small funnel. A visitor sees the widget, opens it, asks something, reads an answer, decides whether you can help, and then either leaves their details, books or walks away. At each step some people drop out. The skill is to find which step loses the most and fix that one first, rather than tweaking everything. Because chat records what people actually typed and where they stopped, it is easier to diagnose than most website funnels. This guide walks through the stages, what a leak at each stage usually means, how to find it in transcripts without special tooling and which changes tend to help. It avoids invented conversion statistics: the goal is to improve your own numbers, one stage at a time."),

      h2("The stages"),
      table(["Stage", "Question it answers", "What a leak looks like"], ["1. Seen", "Do visitors notice the chat?", "Few opens relative to page views"], ["2. Opened", "Does the greeting invite a first message?", "Opens with no message sent"], ["3. First answer", "Did the first reply satisfy or confuse?", "Visitor leaves right after the first answer"], ["4. Interest", "Did the conversation move toward a decision?", "Chats end after price or availability questions"], ["5. Contact or booking", "Did they take the next step?", "Long chats that never produce details or a booking"], ["6. Follow-up", "Did the lead become a customer?", "Leads that go cold"]),
      p("Work from the top: a leak early hides problems below it, and fixing a late leak matters little if few people get that far."),

      h2("Stage 1 and 2: seen and opened"),
      ul("Place the widget where visitors can see it on the pages that matter, such as pricing, services and contact.", "Write a greeting that offers something specific: 'Ask about prices or book a visit' beats 'Hi, how can I help?'.", "Use suggested questions to make the first message easy, particularly on mobile.", "Check the widget does not cover buttons or cookie banners on small screens.", "Keep loading light so the chat appears quickly."),
      p("See [writing welcome messages](/blog/chatbot-welcome-message-copywriting) for ways to compare options fairly."),

      h2("Stage 3: the first answer"),
      p("The first reply sets the tone. The common failures are answers that are too long, too vague, or that ignore what was asked. Read the first exchange in twenty abandoned chats. If visitors leave straight after, look for:"),
      ul("A wall of text where two sentences would do.", "A generic reply because the documents lack the answer.", "An answer that is correct but does not say what happens next.", "A cold or robotic tone.", "No source or specific fact to build trust."),
      p("Fix the knowledge base first, then the wording in your instructions."),

      h2("Stage 4: interest"),
      p("Visitors asking about price and availability are close to deciding. The leak here is often an evasive price answer or missing availability. If the assistant says 'contact us for pricing' when you actually have a starting price, you lose people who wanted a number. Give ranges and what affects them, and say plainly what you do not quote in chat. Where booking is set up, offer times immediately after a serious question."),

      h2("Stage 5: contact details and booking"),
      table(["Symptom", "Likely cause", "Fix"], ["Long chats, no details", "The assistant never asks", "Add a natural prompt after a helpful answer"], ["Details asked too early", "Visitor leaves at the form", "Ask after giving value, and only for what you need"], ["Booking abandoned partway", "Too many steps or unclear slots", "Shorten the flow; confirm what will happen next"], ["Wrong or fake details", "No reason given", "Explain how the details will be used"]),
      p("See [how to ask for contact details in chat](/blog/conversational-lead-capture) and [privacy law for lead capture](/blog/chatbot-lead-capture-gdpr-ccpa-compliance) so the ask is effective and lawful."),

      h2("Stage 6: follow-up"),
      p("A captured lead is not a customer. Measure how quickly you reply and what share of leads book or buy. Leads that go cold are often failing at the follow-up, not in the chat. Reply the same business day where you can, and reference what they asked about so it feels continuous."),

      h2("Finding leaks without special tools"),
      ol("Choose 30 recent conversations across outcomes.", "Sort them into: no message, left after first answer, left mid-way, gave details, booked.", "Count each group. The biggest group of drop-offs is your first target.", "Read the last two messages of each abandoned chat and note the pattern.", "Change one thing, wait a week or two and repeat the count."),
      p("Small samples are noisy, so favour patterns that repeat over one-off oddities."),

      h2("Change one thing at a time"),
      ul("Record what you changed and when.", "Avoid changing greeting, prompts and documents in the same week.", "Compare against similar periods, since demand varies by season.", "Keep changes that help and undo those that do not."),

      h2("Common mistakes"),
      ul("Fixing the last stage when the leak is the first.", "Making the assistant push for details in every reply.", "Ignoring mobile visitors.", "Treating a lower message count as a success.", "Not reading transcripts."),

      h2("A worked example"),
      p("A dental practice reviews thirty conversations. Eleven visitors opened the chat and never typed, seven left after the first answer, six asked about price and left, four left details and two booked. The biggest group, opens with no message, points to the greeting; the second, leaving after the first answer, points to content. The practice rewrites the greeting to offer 'Ask about prices or book a check-up', adds a plain price range for check-ups and repeats the count a month later. Only one change at each stage, and each traceable to a specific pattern, is how leaks actually get fixed."),
      table(["Finding", "Likely lever", "First change"], ["Many opens, no message", "Greeting and suggestions", "Offer two specific questions"], ["Leave after first answer", "Content and length", "Shorten; add missing facts"], ["Leave after price", "Price clarity", "State ranges and what changes them"], ["Long chats, no details", "The ask", "Prompt once after a useful answer"]),

      h2("Mobile and out-of-hours visitors"),
      p("Check the funnel separately for phones and for evenings. Phone visitors type less, so suggested questions and short replies matter more. Out-of-hours visitors cannot get a person, so the assistant should be able to book or capture a callback request and say when someone will reply. Splitting the sample by device and time often reveals a leak that the overall numbers hide."),

      h2("Frequently asked questions"),
      faq(
        ["What is a chat funnel?", "The sequence from seeing the widget to opening it, asking, getting an answer, deciding and leaving details or booking."],
        ["Where do most visitors drop off?", "It varies by business. Find yours by sorting a sample of recent conversations by where they ended."],
        ["How many conversations do I need to review?", "About thirty gives a useful first picture; more gives more confidence."],
        ["Should the assistant ask for contact details immediately?", "No. Give a helpful answer first, then ask, explaining how the details will be used."],
        ["How do I improve the first answer?", "Fix missing information in the knowledge base, keep replies short and end with a clear next step."],
        ["How often should I repeat this exercise?", "Monthly is enough for most small businesses, alongside the weekly review."],
      ),
      p("See the [lead capture feature](/product/lead-capture), the [appointment booking feature](/product/appointment-booking) and try a flow in the [playground](/playground). Also read [the chat analytics playbook](/blog/service-business-chat-analytics-playbook)."),
    ],
  }),

  pillar({
    slug: 'first-contact-resolution-fcr-ai-chat',
    title: 'First Contact Resolution and AI Chat: Solving the Question in One Conversation',
    description: 'What first contact resolution means for small businesses using AI chat: defining it, what the assistant can resolve, measuring it honestly, common blockers and ways to improve it.',
    primaryKeyword: 'first contact resolution AI chat',
    secondaryKeywords: ['FCR chatbot', 'resolve customer questions first time', 'AI chat resolution rate', 'reduce repeat contacts'],
    body: [
      p("First contact resolution, or FCR, is a simple idea from customer service: the customer's problem is solved in the first conversation, without follow-ups, transfers or repeat contacts. It is one of the few service measures that customers feel directly. Nobody enjoys asking the same question three times or being told to call back tomorrow. For a small business, AI chat makes a high FCR realistic for a large share of routine questions, because the assistant answers instantly from your documents at any hour. It also makes it easy to fool yourself: a conversation that ended is not the same as a problem solved. This guide explains what FCR means in a chat setting, which kinds of questions an assistant can genuinely resolve, how to measure resolution without inflating it, what blocks it and how to improve it. Where numbers are suggested, they are yours to gather, not industry promises."),

      h2("Defining resolution honestly"),
      table(["Counts as resolved", "Does not count"], ["Visitor got the opening hours and did not return with the same question", "Visitor left after an unhelpful answer"], ["Visitor booked an appointment and received a confirmation", "Visitor was told to phone and never did"], ["Visitor received the address and parking details", "Visitor got a vague answer and rephrased three times"], ["Visitor's request was handed to staff with full details and answered", "A handover with no details that forced them to repeat themselves"]),
      p("The test is whether the customer got what they came for, not whether the chat closed. A person who abandons in frustration is a lost conversation, not a resolved one."),

      h2("What an assistant can resolve"),
      ul("**Factual questions:** hours, location, services, prices, policies, preparation and aftercare.", "**Simple actions:** booking, rescheduling through a private link and leaving details for a callback.", "**Guidance:** which service suits a situation, based on your documented advice.", "**Navigation:** where to find a form, a page or a document."),
      p("Matters that need judgement, access to private records or empathy, such as complaints, disputes and clinical or legal advice, should be handed to a person with the context attached. Resolving them in one contact means the handover works, not that the bot solves them."),

      h2("How to measure it"),
      ol("Pick a sample of recent conversations, thirty to fifty.", "For each, decide: resolved, handed over, or unresolved.", "For handovers, check whether staff resolved it and whether the customer had to repeat information.", "Check whether the same visitor came back with the same question within a few days, where you can tell (same contact details or booking).", "Calculate the share resolved without repeat contact."),
      p("Keep the definition stable so you can compare months. A rough measure applied consistently beats a precise one used once."),

      h2("What blocks first contact resolution"),
      table(["Blocker", "Effect", "Fix"], ["Missing information", "The assistant cannot answer, visitor leaves", "Add the passage; review unanswered questions weekly"], ["Outdated information", "Wrong answer; repeat contact to correct it", "Date content and review monthly"], ["Vague answers", "Visitor asks again", "Give specifics and a next step"], ["No booking path", "Visitor told to call", "Enable booking or callback capture"], ["Bad handover", "Customer repeats everything", "Pass the transcript and details to staff"], ["Hard-to-find handover option", "Customer gives up", "Offer a person clearly when asked"]),

      h2("Improve it in four steps"),
      ol("**Fill the gaps.** Use the unanswered list to add missing facts.", "**End with the next step.** Every answer should say what happens next: book, call, visit or wait for a reply.", "**Make handover complete.** Send the conversation, name and contact details, so nobody starts over.", "**Follow up.** For handed-over conversations, reply promptly and confirm the issue was solved."),
      p("See [handing over from bot to human](/blog/live-human-handover-flow-design) for a smooth escalation design."),

      h2("Do not chase the number"),
      ul("Forcing the assistant to answer everything drives up wrong answers.", "Discouraging handover to boost the metric hurts customers.", "Counting every closed chat as resolved makes the figure meaningless.", "A modest, honest rate you can improve beats an inflated one."),

      h2("A worked example"),
      p("A pet groomer reviews forty chats. Twenty-two were simple questions about prices, hours and vaccination rules; the assistant answered them and none returned with the same question, so they count as resolved. Nine ended in a booking. Six were handed to staff with details and were answered the same day. Three were unresolved: a visitor asked about grooming an elderly cat, a service the documents did not mention. The groomer writes a short passage on senior and nervous animals and adds it to the knowledge base. Resolution here rose because a gap was found and filled, not because the metric was redefined."),
      table(["Group", "Count", "Action"], ["Answered, no return", "22", "Keep documents current"], ["Booked", "9", "Check confirmations were sent"], ["Handed over and answered", "6", "Confirm the details reached staff"], ["Unresolved", "3", "Add the missing passage"]),

      h2("The role of staff in resolution"),
      p("Resolution is a team result. When the assistant hands over, staff should see the whole conversation so the customer does not repeat anything, and they should reply quickly with a real answer, not a generic acknowledgement. Agree a reply time, such as the same business day, and check it in the weekly review. A fast, informed reply after a handover often leaves the customer happier than an instant answer from a machine, because it shows the business listened."),
      p("Finally, remember the customer's view. They do not care which channel solved their problem; they care that it was solved once. Design each answer to end with a clear next step, whether that is a booking, a visit or a promised reply, and check that the promise is kept."),

      h2("A weekly checklist"),
      ol("Read the unanswered list and add the top missing facts.", "Check the oldest documents for outdated prices, hours and policies.", "Read three handovers and confirm the customer did not have to repeat anything.", "Look for repeated questions from the same person, a sign the first answer failed.", "Note one improvement for next week."),
      p("Small weekly fixes compound. After a couple of months, the same visitors' questions are answered first time, and staff spend their time on the conversations that really need a person."),

      h2("Signs your resolution is improving"),
      ul("Fewer repeat questions from the same customers.", "Shorter conversations that end with a booking or a clear next step.", "A shrinking unanswered list from week to week.", "Staff report fewer calls asking for information already on the website."),
      p("Note these signs in your monthly review and celebrate progress with the team, since it is their handovers that make the whole approach work."),

      h2("Frequently asked questions"),
      faq(
        ["What is first contact resolution?", "Solving the customer's problem during the first conversation, without follow-ups or repeated contacts."],
        ["Can an AI chatbot achieve high FCR?", "For routine factual questions and simple actions such as booking, yes, when the knowledge base is complete and current."],
        ["How do I measure FCR for chat?", "Sample recent conversations, classify them as resolved, handed over or unresolved and check for repeat contact."],
        ["Is a handover a failure?", "No. It is resolution when the handover passes full context and a person answers promptly."],
        ["What lowers FCR most?", "Missing or outdated information and answers that do not say what happens next."],
        ["Should I set an FCR target?", "Set a direction for improvement against your own baseline rather than copying vendor benchmarks."],
      ),
      p("See the [AI assistant feature](/product/ai-assistant), [pricing](/pricing) and [the chat analytics playbook](/blog/service-business-chat-analytics-playbook). Also read [where visitors drop off in chat](/blog/tracking-in-chat-funnel-drop-off)."),
    ],
  }),

  pillar({
    slug: 'prepare-service-menu-pricing-docs-rag',
    title: 'Preparing Your Service Menu and Price List So an AI Assistant Can Use It',
    description: 'How to format services and prices for a chatbot knowledge base: one section per service, clear price statements, add-ons, packages, conditions, tables that survive extraction and a test plan.',
    primaryKeyword: 'prepare service menu for AI chatbot',
    secondaryKeywords: ['price list for chatbot knowledge base', 'format pricing documents RAG', 'service catalog for AI assistant', 'chatbot pricing answers'],
    body: [
      p("Price questions are among the most common in service business chats, and the ones where a wrong answer hurts most. Visitors ask 'How much is a full set?' or 'Do you charge extra for weekends?' and expect an accurate number in seconds. Whether the assistant gets it right depends less on the AI model than on how your service menu is written down. A price list designed for a printed flyer, with columns, footnotes and asterisks, often loses its meaning when converted into text passages for retrieval. This guide shows how to write and format a service menu and price list so an assistant can find the right entry, state the price correctly and mention the conditions that go with it. It is practical rather than theoretical: follow the layout, test with real questions and fix what fails."),

      h2("Why flyer-style price lists fail"),
      table(["Print habit", "What goes wrong in a knowledge base"], ["Two-column layout", "Text extraction mixes columns; prices end up next to the wrong service"], ["Prices in images", "Text cannot be read unless OCR is applied"], ["Footnotes and asterisks", "The condition is separated from the price it applies to"], ["'From $40*'", "The asterisk's meaning is lost"], ["A single long table for everything", "Retrieval pulls the whole table or the wrong part of it"], ["Abbreviations and codes", "The assistant cannot match the visitor's words"]),
      p("The remedy is to write each service as its own short, self-contained entry."),

      h2("One entry per service"),
      p("Give every service a heading and a compact block that answers the common questions together:"),
      ul("**Name and what it is** in plain words, including terms customers use.", "**Price**, stated as an exact number or a range with what changes it.", "**Duration**, including any preparation or aftercare time.", "**Who it suits** and who it does not.", "**What is included** and what costs extra.", "**Conditions**: deposits, cancellation, patch tests, age limits.", "**How to book** or what the next step is."),
      p("An example entry: 'Full colour, all over. From $95 for short hair, up to $140 for long hair; the final price depends on length and thickness and is confirmed at the consultation. Takes about two hours. Includes shampoo and blow dry. Toner is $15 extra. A patch test is required 48 hours before a first colour. Book online or ask us to find a time.'"),

      h2("Writing prices the assistant can state safely"),
      table(["Situation", "How to write it"], ["Fixed price", "'A standard cut is $35.'"], ["Range", "'Colour is $95 to $140, depending on hair length and thickness.'"], ["Starting price", "'From $60. The price rises with the size of the job; we quote after seeing it.'"], ["Not quoted in chat", "'We quote after an inspection; there is no charge for the visit.' (only if true)"], ["Time-limited offer", "'Introductory price of $25 until 30 June.' with the date"], ["Currency and tax", "Say whether prices include tax."]),
      p("If you do not give a price in chat, say why and what the visitor should do, so the assistant does not improvise."),

      h2("Add-ons, packages and combinations"),
      ul("List add-ons under the service they apply to and as a separate 'add-ons' section for searches.", "Write packages as their own entries, naming what is included and the saving in dollars, not just 'save 10%'.", "State combinations explicitly: 'A cut and colour together takes about three hours and costs $120 to $170.'", "Say whether package prices can be combined with other offers."),

      h2("Conditions that change the answer"),
      ul("Weekend or evening surcharges.", "Travel fees by area (see [service area verification](/blog/service-area-verification-ai-chat)).", "Deposits and cancellation fees.", "Extra charges for long hair, large pets, difficult access or rush jobs.", "Minimum charges and call-out fees."),
      p("Write each condition next to the price it modifies, in the same entry, not in a separate terms page only."),

      h2("Tables: use them carefully"),
      p("Simple tables of service, duration and price can work when they extract cleanly, but test them. If a table's rows get separated, rewrite it as short lines: 'Cut, 30 minutes, $35.' Avoid merged cells, nested tables and tables in images. See [using spreadsheets and tables in RAG](/blog/tabular-data-ingestion-semantic-csv-rag) for how tables are processed."),

      h2("Keep one source of truth"),
      ol("Choose the document that holds current prices.", "Remove old price lists from the knowledge base; do not leave last year's version beside this year's.", "Date the document: 'Prices valid from 1 March 2026.'", "Update it when prices change and re-test the top price questions.", "Make sure the website price page matches, since visitors compare."),
      p("Conflicting documents are one of the main causes of wrong price answers."),

      h2("A test plan"),
      table(["Question", "Check"], ["'How much is [each top service]?'", "Exact price or range correct"], ["'Is [service] cheaper than [other service]?'", "Comparison correct"], ["'Do you charge extra for [condition]?'", "Surcharge stated"], ["'What is included in [package]?'", "Complete list"], ["'How much for [service not on the menu]?'", "Says it does not have the information and offers a next step"], ["'What is the cheapest option?'", "Names the actual lowest price"]),
      p("Run the questions after every price change. See [testing starter prompts](/blog/ab-test-chatbot-starter-prompts)."),

      h2("Common mistakes"),
      ul("Leaving prices in an image or PDF scan.", "Using internal service codes.", "Writing 'from' prices without saying what changes them.", "Storing conditions on a different page.", "Forgetting to remove old prices.", "Not testing comparisons and add-ons."),

      h2("Before and after"),
      table(["Flyer version", "Assistant-ready version"], ["Colour from $95*", "Full colour is $95 for short hair and up to $140 for long hair. The final price depends on length and thickness."], ["*Patch test req.", "A patch test is required 48 hours before a first colour appointment."], ["Toner +15", "Toner is an extra $15."]),
      p("The assistant-ready version repeats the service name and keeps each condition beside its price, so whichever passage is retrieved contains everything needed for a correct answer."),

      h2("Policies that belong beside the prices"),
      ul("Cancellation and late-arrival rules, with the amounts or time limits.", "Payment methods accepted and when payment is due.", "Age, health or safety conditions for particular services.", "Gift vouchers, memberships and how they are redeemed.", "What happens if a customer is unhappy with the result."),
      p("Visitors ask about these right after prices. Write each as a short paragraph under its own heading so the assistant can retrieve and quote it accurately, and review them whenever policy changes. A price answer that omits a deposit or a cancellation fee will cause disputes later, so it is worth the extra few sentences."),
      p("Finally, read the whole document as a customer would. If a stranger could answer every common price question from it in under a minute, the assistant can too."),

      h2("Frequently asked questions"),
      faq(
        ["How should I format a price list for an AI chatbot?", "One short entry per service with the name, price or range, duration, inclusions, conditions and next step."],
        ["Can the assistant read prices in a PDF?", "If the PDF has selectable text, usually yes. Scanned images need OCR. Simple, plain entries are more reliable than complex layouts."],
        ["What if I do not want to publish prices?", "Say so in the document and explain how quotes work, so the assistant explains this rather than guessing."],
        ["How do I stop the assistant quoting old prices?", "Keep only current prices in the knowledge base, date them and re-test after changes."],
        ["Should I use tables?", "Only simple ones, and test them. Short lines are safer."],
        ["Where do I add the documents?", "In the knowledge base of your assistant, by upload, text entry or a page link."],
      ),
      p("See [training an AI receptionist on your service catalog](/blog/train-ai-receptionist-service-catalog), the [knowledge base feature](/product/knowledge-base) and try your price questions in the [playground](/playground)."),
    ],
  }),

  pillar({
    slug: 'post-appointment-nurture-rebooking-sequences',
    title: 'After the Appointment: Follow-Up and Rebooking Habits That Bring Customers Back',
    description: 'How service businesses can follow up after appointments: timing, message content, review requests, rebooking prompts, consent rules and how to use a chat assistant and booking link to make returning easy.',
    primaryKeyword: 'post appointment follow up rebooking',
    secondaryKeywords: ['rebooking reminders service business', 'customer nurture after appointment', 'ask for reviews after service', 'repeat customer follow up'],
    body: [
      p("Most service businesses put their effort into getting the first booking and very little into the second. Yet a returning customer costs far less to win than a new one, and many services are naturally repeatable: haircuts every six weeks, dental check-ups twice a year, boiler services annually, massages monthly. A short, well-timed follow-up after the appointment turns one visit into a habit. This guide covers what to send and when, how to ask for a review without being pushy, how to make rebooking a single step, what the law expects of marketing messages and how a chat assistant with a booking link supports the whole loop. It is honest about what a chat assistant does and does not do: it answers and books; the follow-up messages themselves are usually sent from your own email or messaging tools."),

      h2("The three follow-ups worth doing"),
      table(["Follow-up", "Timing", "Purpose"], ["Thank you and aftercare", "Same day or next morning", "Reassure, give aftercare, invite questions"], ["Review request", "A few days later, once the result is visible", "Collect honest reviews"], ["Rebooking prompt", "Shortly before the customer is typically due", "Bring them back at the right moment"]),
      p("Three light touches beat a stream of promotional messages."),

      h2("1. Thank you and aftercare"),
      ul("Thank them by name and mention the service.", "Give the two or three aftercare points customers most often forget.", "Invite questions and say how to ask: reply to the message or use the chat on your website.", "Keep it short enough to read on a phone."),
      p("This message also reduces unnecessary calls, especially when your assistant has the aftercare instructions in its knowledge base, so a question about what to do tonight gets an accurate answer at any hour."),

      h2("2. The review request"),
      ul("Wait until the customer has had time to see the result.", "Ask once, with a direct link to the review page.", "Ask everyone, not only those who seem happy; selective asking can breach review-platform rules and consumer law in some places.", "Never offer payment or discounts in return for positive reviews.", "Thank people who review, and respond professionally to criticism."),
      p("Reviews feed your reputation and give your assistant real proof to point to; see [using social proof in chat](/blog/social-proof-reviews-ai-chat)."),

      h2("3. The rebooking prompt"),
      p("Work out each service's natural cycle and message a little before it ends. A haircut customer due in six weeks might hear from you at week five: 'It is nearly time for your next cut. Here are the times we have free; book here in a minute.' The essential part is making rebooking one step: a direct link to your booking page, or an invitation to open the chat and ask for a slot."),
      table(["Service", "Example cycle", "Prompt at"], ["Haircut", "5 to 6 weeks", "Week 5"], ["Dental check-up", "6 months", "Month 5"], ["Annual boiler service", "12 months", "Month 11"], ["Massage", "4 weeks", "Week 3 to 4"], ["Pet grooming", "6 to 8 weeks", "Week 5 to 6"]),
      p("These cycles are examples; use the ones your own customers follow."),

      h2("Making rebooking easy"),
      ol("Put a booking link in every message.", "Let the customer pick a time without phoning.", "Offer the same service again by default, with the option to change.", "Send a confirmation with a private link to change or cancel; Crescelo's booking confirmation emails include this, along with reminders before the appointment.", "Make sure the assistant can answer 'Can I book the same again?' correctly."),

      h2("Where the chat assistant fits"),
      ul("It answers aftercare questions from your documents at any hour.", "It books a new appointment when the customer visits your site or a hosted page.", "It captures details for a callback when a person is needed.", "It cannot send scheduled follow-up messages itself; use your email tool, calendar reminders or a simple list for that."),
      p("Be clear about this division of labour so you do not expect features that are not there. Booking confirmations and reminders by email are sent by the platform's booking flow; marketing follow-ups are yours to send."),

      h2("Consent and the rules"),
      ul("Service messages tied to an appointment, such as confirmations and aftercare, are treated differently from marketing in many places. Marketing generally needs consent.", "Get consent when you collect details, and record it.", "Give an easy way to stop receiving messages, and honour it.", "Keep messages accurate and identify your business.", "Rules differ by country and by channel (email, text, phone). Check yours, and read [privacy law for lead capture](/blog/chatbot-lead-capture-gdpr-ccpa-compliance)."),
      p("This is general information, not legal advice."),

      h2("A simple system you can run today"),
      ol("Choose your top three repeat services and their cycles.", "Write three short templates: aftercare, review request, rebooking prompt.", "After each appointment, note the date; set a reminder to send each message.", "Use a spreadsheet or your booking calendar to track who is due.", "Every month, count how many customers rebooked after a prompt and adjust timing."),
      p("Start with the rebooking prompt for your most frequent service, since it produces revenue most directly."),

      h2("Common mistakes"),
      ul("Messaging too often.", "Asking for reviews immediately, before the result shows.", "Sending marketing without consent.", "Making rebooking a phone call.", "Ignoring feedback in replies.", "Expecting the chat assistant to send scheduled messages by itself."),

      h2("A sample set of messages"),
      table(["Message", "Example"], ["Thank you and aftercare", "Thanks for coming in, Sam. For the next 48 hours, avoid hot water on the treated area. Any questions, reply here or ask on our website chat."], ["Review request", "We would love to hear how it went. If you have a minute, you can leave a review here: [link]."], ["Rebooking prompt", "It is nearly time for your next visit. You can pick a time here: [link]."]),
      p("Adjust the wording to your voice, keep each message under a few short sentences and make sure the links work on a phone before you send them."),

      h2("Measuring whether it works"),
      ul("Count how many customers rebook within two weeks of a prompt.", "Compare repeat visit rates before and after you began following up.", "Note the review count and average rating over time.", "Ask new customers how they found you, to see the effect of reviews.", "Adjust the timing if many customers book just before or long after the prompt."),
      p("Small changes, such as sending the prompt a week earlier, can noticeably alter the results, and you will only see it if you keep simple records."),

      h2("Frequently asked questions"),
      faq(
        ["When should I follow up after an appointment?", "Send thanks and aftercare the same or next day, a review request a few days later and a rebooking prompt shortly before the customer is due again."],
        ["How do I ask for reviews without being pushy?", "Ask once, with a direct link, ask everyone and never offer incentives for positive reviews."],
        ["Can Crescelo send follow-up campaigns?", "It sends booking confirmations and reminders. Marketing follow-ups are sent from your own email or messaging tools; the assistant answers questions and books appointments."],
        ["Do I need consent to send follow-ups?", "Appointment-related service messages are treated differently from marketing, but marketing generally needs consent. Rules vary by country, so check yours."],
        ["How do I make rebooking easy?", "Include a booking link in every follow-up and let customers choose a time in one step."],
        ["How do I know it is working?", "Count how many customers rebooked after a prompt, and compare with your baseline."],
      ),
      p("See the [appointment booking feature](/product/appointment-booking), [pricing](/pricing) and read [confirmations and reminders that reduce no-shows](/blog/eliminate-service-no-shows-playbook) and [the chat analytics playbook](/blog/service-business-chat-analytics-playbook)."),
    ],
  }),
];
