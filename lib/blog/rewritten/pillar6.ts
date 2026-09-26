import { faq, h2, h3, note, ol, p, pillar, table, ul } from '../authoring';

export const PILLAR6 = [
  pillar({
    slug: 'speed-to-lead-service-businesses',
    title: 'Speed to Lead: Why the First Reply Wins Service Business Enquiries',
    description: 'Why response time decides who wins an enquiry, what speed to lead means for service businesses, how to reply in minutes at any hour and how to measure and improve it.',
    primaryKeyword: 'speed to lead',
    secondaryKeywords: ['lead response time', 'respond to leads faster', 'speed to lead service business', 'lead follow up time'],
    body: [
      p("When someone sends an enquiry to a service business, they are usually sending it to two or three businesses at once. They have a problem or a plan, they are ready to act, and they will go with whoever gives them a useful answer first. That is the idea behind speed to lead: the time between an enquiry arriving and a person or system replying. It is one of the few things in marketing you can improve without spending more on advertising, because the demand already exists. You are simply deciding whether to be there when it arrives."),
      p("This guide explains why speed matters, what the research says in general terms, why small businesses find it hard to be fast, how to set a response-time goal, and how to reach minute-level replies at any hour with a mix of people, process and an AI assistant. It also covers how to measure it, so you can see the effect."),

      h2("What speed to lead means"),
      p("Speed to lead is the elapsed time from the moment a lead is created, a form submitted, a chat started, a call missed or a message sent, to the first meaningful response. 'Meaningful' matters: an automated 'we have received your message' is a courtesy, not a response. A response that answers the question or offers a next step is."),
      table(["Term", "Meaning"], ["First response time", "Time to the first reply of any kind"], ["First meaningful response", "Time to a reply that helps: an answer, a price, a booking option"], ["Speed to lead", "Often used for first meaningful response to a new enquiry"], ["Speed to book", "Time from enquiry to a confirmed appointment"]),

      h2("Why speed matters more for service businesses"),
      ul("**Urgency.** A burst pipe, a toothache, a broken lock: the customer wants help now and calls the first business that answers.", "**Comparison shopping.** With services that look similar online, the deciding factor is often who replied.", "**Attention decays.** An enquiry made during a coffee break is forgotten by the evening.", "**Trust.** A quick, clear reply signals that you are organised and will be reliable.", "**Low switching cost.** Nothing stops a customer opening another tab."),
      p("Widely cited research on online lead response, including a well-known Harvard Business Review analysis from 2011, found that businesses that responded to leads within about an hour were far more likely to qualify them than those that waited longer, and that most businesses responded slowly or not at all. Exact figures vary by industry and study, so use them as direction, not as a promise for your business. The pattern is consistent: the sooner you reply, the better your chances."),

      h2("Why small businesses reply slowly"),
      p("It is rarely laziness. The owner is with a customer, the receptionist is on the phone, the team is closed for the night. Enquiries arrive in several places, and nobody owns the check."),
      table(["Cause", "What it looks like"], ["Nobody is available", "Enquiries wait until the next working day"], ["Too many inboxes", "Forms, chat, email, social messages and voicemail are read at different times"], ["No alerts", "Leads sit in a dashboard until someone logs in"], ["No clear owner", "Everyone assumes someone else replied"], ["Repetitive questions", "The team is busy answering the same thing many times"], ["Weekend and holiday gaps", "Nobody covers them"]),

      h2("Set a response-time standard"),
      p("You cannot improve what you have not defined. Choose targets you can actually meet and write them down."),
      table(["Enquiry type", "Suggested target during business hours", "Outside business hours"], ["Live chat", "Instant", "Instant (assistant)"], ["Urgent phone call or emergency message", "Under 5 minutes", "Emergency route or clear instructions"], ["Form or email enquiry", "Under 15 to 30 minutes", "First useful reply within minutes, full follow-up next morning"], ["Booking request", "Confirm immediately", "Confirm immediately (self-service)"], ["Quote request", "Acknowledge in minutes, quote within a set time", "Acknowledge in minutes"]),
      p("A target of minutes for the first meaningful reply is realistic when you combine automation and alerts. A target of 'within 24 hours' is a business decision to lose the impatient customers."),

      h2("Six ways to get faster"),
      h3("1. Put an assistant on the first line"),
      p("An AI assistant answers instantly, at any hour, from your own content. It can answer the price and availability questions that stall most enquiries, offer real appointment times and book. For many service businesses, this closes the gap between the enquiry and the first useful response, especially outside office hours. See [what an AI website assistant is](/blog/ai-website-assistant) and [AI appointment booking](/blog/ai-appointment-booking)."),
      h3("2. Alert the right person the moment a lead arrives"),
      p("A lead should trigger a text or push notification and an email, with the conversation attached, so the person can act from their phone between jobs. See [instant lead routing in chat](/blog/instant-lead-routing-chat)."),
      h3("3. Give each lead an owner"),
      p("Decide who watches enquiries in each time slot, and who is the backup. Ownership matters more than technology."),
      h3("4. Use templates for the common replies"),
      p("Prepare good replies for your top ten questions so a human reply takes thirty seconds. The same text can feed the assistant's knowledge base."),
      h3("5. Let people book without waiting for you"),
      p("Self-service booking removes the back-and-forth. The customer picks a time and gets a confirmation at once."),
      h3("6. Make handover fast when a person is needed"),
      p("When a visitor asks for a person, the notification should reach someone who can act, with the whole conversation. See [live human handover flow design](/blog/live-human-handover-flow-design)."),

      h2("What a fast process looks like end to end"),
      table(["Time", "What happens"], ["0 seconds", "A visitor asks about a service and price; the assistant answers from your documents"], ["30 seconds", "The visitor sees open appointment times and picks one"], ["1 minute", "The booking is confirmed by email; the team is notified"], ["Within 15 minutes", "For a question needing a person, an alert reaches the owner, who replies from their phone"], ["Next morning", "The team reviews overnight conversations and follows up on anything unresolved"]),
      p("Compare that with a form that says 'we will reply within 1 to 2 business days'. The visitor who filled it in on Friday night may have booked elsewhere by Saturday morning."),

      h2("Speed without sacrificing quality"),
      p("A fast wrong answer is worse than a slower right one. Keep quality high by grounding the assistant in your documents, giving it a clear instruction to say when it does not know, and setting rules for handing over sensitive topics. See [how to stop a chatbot from making things up](/blog/grounded-ai-chatbot-hallucinations). Speed and accuracy work together when the content is good."),

      h2("How to measure speed to lead"),
      ol("Log the time each enquiry arrives and the time of the first meaningful response. Many tools record both.", "Calculate the median and the 90th percentile response time each week. The average hides the slow tail.", "Split by channel (chat, form, phone, social) and by time of day.", "Compare conversion rates for fast and slow responses.", "Review the enquiries with the slowest responses to find the cause."),
      table(["Metric", "Why it matters"], ["Median first response time", "Typical experience"], ["90th percentile response time", "The worst experiences, which cost you leads"], ["Share of enquiries answered within target", "Progress against your standard"], ["Out-of-hours response time", "Where an assistant helps most"], ["Booking rate by response time", "Shows the value of speed for your business"]),

      h2("Common mistakes"),
      ul("Relying on an auto-reply as if it were an answer.", "Sending leads to an email inbox nobody checks in the evening.", "Setting a target you cannot meet and ignoring it.", "Measuring average response time only.", "Making speed the goal and letting quality slip.", "Having no plan for weekends and holidays."),

      h2("A one-week improvement plan"),
      ol("Day 1: measure your current response times for a sample of enquiries.", "Day 2: set your targets and assign owners for each time slot.", "Day 3: turn on instant alerts for every enquiry channel.", "Day 4: write templates for your top ten questions.", "Day 5: load your documents into an assistant and test it.", "Day 6: enable booking and test a full booking.", "Day 7: review the week and adjust."),
      p("Try it on your own content in the [playground](/playground), and see how [lead capture](/product/lead-capture) alerts your team instantly. Our guide to [conversational lead capture](/blog/conversational-lead-capture) covers what to ask and when, and [why contact forms fail](/blog/why-contact-us-forms-fail) explains what slows enquiries down."),

      h2("A sample first reply that works"),
      p("Speed only helps if the reply is useful. Compare two replies to the same enquiry sent at 8:40 p.m.: 'Can you fit a kitchen tap repair this week and roughly what does it cost?'"),
      table(["Reply", "Text"], ["Weak", "Thanks for your message. We will get back to you within 1 to 2 working days."], ["Strong", "Yes, we can fit a tap repair this week. Most repairs are $90 to $160 depending on parts, and we will confirm after a quick look. I have Thursday morning or Friday afternoon free. Which suits you, and what is your postcode so we can check we cover it?"]),
      p("The strong reply answers, gives a range, offers times and asks the one question needed to move on. Whether it comes from a person or an assistant, it gives the customer a reason to stop looking."),

      h2("Handling peaks and quiet periods"),
      p("Response times slip during peaks: a promotion, a storm, a holiday rush. Prepare for them. Update your documents with current lead times, let the assistant carry the load, and set alerts for the leads that need a person first. In quiet periods, use the time to review conversations, improve your content and follow up on leads that did not book."),

      h2("Frequently asked questions"),
      faq(
        ["What is speed to lead?", "It is the time between a lead arriving and the first meaningful response from your business. The faster it is, the more likely the lead is to become a customer."],
        ["How fast should I respond to a lead?", "As fast as you can. For chat, instantly; for urgent enquiries within minutes; for forms and emails, aim for under 15 to 30 minutes during business hours and a useful automatic reply outside them."],
        ["Does an automatic reply count?", "Only if it is useful. 'We received your message' is a courtesy. An answer or a booking option is a meaningful response."],
        ["How can a small business reply quickly at night?", "Use an AI assistant that answers and books at any hour, and alerts to your phone for urgent leads."],
        ["What if I cannot reply fast every time?", "Prioritise the most valuable and urgent enquiries, automate the rest and set honest expectations in your first reply."],
        ["How do I know it is working?", "Track the median and 90th percentile response time and compare booking rates for fast versus slow responses."],
      ),
    ],
  }),

  pillar({
    slug: 'document-chunking-strategies-pdf-docx',
    title: 'Document Chunking for RAG: Strategies for PDFs, Word Files and Web Pages',
    description: 'How to split PDFs, Word documents and web pages into chunks for retrieval-augmented generation: sizes, overlap, structure-aware methods, tables and common mistakes.',
    primaryKeyword: 'document chunking strategies RAG',
    secondaryKeywords: ['RAG chunking', 'chunk size for RAG', 'PDF chunking', 'text splitting for retrieval'],
    body: [
      p("Before a chatbot can answer from your documents, the documents have to be cut into pieces it can search. That step, called chunking, quietly decides how good the answers will be. Cut too small and each piece loses its context. Cut too large and the search returns a lot of irrelevant text alongside the useful part. Cut in the wrong place and a price ends up in one chunk and the service it belongs to in another. This guide explains chunking in practical terms: what it is, the main strategies, how to handle PDFs, Word files, web pages and tables, how to choose sizes and overlap, and how to test that yours works."),
      p("It is written for people building or tuning retrieval-augmented generation (RAG) systems, and for business owners who want to understand why the way they write documents affects the answers they get. We describe general practice and say where Crescelo's approach fits."),

      h2("What chunking is and why it matters"),
      p("A RAG system does not read your whole document for each question. It searches an index of small pieces, retrieves the few most relevant, and gives them to a language model to write the answer. Each piece is a chunk. Search quality depends on chunks being self-contained and focused enough to match a question, but large enough to carry meaning."),
      table(["If chunks are", "Problem", "Example"], ["Too small", "Lose context; the answer is split across pieces", "'From $80' in one chunk and 'colour treatment' in another"], ["Too large", "Diluted relevance and wasted context space", "A whole 10-page policy returned for a one-line question"], ["Cut mid-sentence or mid-table", "Broken meaning", "A price table split so headers are separated from rows"], ["Missing titles", "Chunk does not say what it is about", "A passage about 'the deposit' with no service named"]),

      h2("Main chunking strategies"),
      h3("1. Fixed-size chunks with overlap"),
      p("Split text every N characters or tokens, with a small overlap between neighbours. It is simple and works acceptably for uniform text. Its weakness is that it ignores structure and may cut through a sentence or a table."),
      h3("2. Sentence or paragraph-based chunks"),
      p("Split on natural boundaries and group sentences until a size limit is reached. It preserves meaning better than fixed splits and is a good default for prose."),
      h3("3. Structure-aware chunks"),
      p("Use the document's own structure, its headings, sections, lists and tables, to decide chunk boundaries. A section titled 'Cancellation policy' becomes a chunk with that title attached. This is usually the best method for business documents because the structure reflects how the author organised the information."),
      h3("4. Semantic chunking"),
      p("Group sentences by similarity of meaning, starting a new chunk when the topic shifts. It can help with long, unstructured text but is more complex and can produce uneven sizes."),
      h3("5. Parent and child chunks"),
      p("Index small chunks for precise matching, but return the larger parent section for context. It combines precision with completeness and suits long documents."),
      table(["Strategy", "Good for", "Watch for"], ["Fixed size with overlap", "Uniform text, quick starts", "Cutting through sentences and tables"], ["Sentence or paragraph", "Prose, articles, FAQs", "Very short paragraphs"], ["Structure-aware", "Manuals, price lists, policies, web pages", "Documents with poor formatting"], ["Semantic", "Long unstructured text", "Complexity and inconsistent sizes"], ["Parent and child", "Long documents needing context", "More storage and logic"]),

      h2("Choosing a chunk size"),
      p("There is no universal best size, but useful ranges exist. For question answering over business documents, chunks of roughly 200 to 500 words (about 300 to 700 tokens) with 10 to 15 percent overlap are a common starting point. FAQ entries and price lines should be kept whole, even if short. Long policies should be split at headings. Test sizes with real questions rather than trusting a number."),
      ol("Assemble twenty real questions and the passages that answer them.", "Try two or three chunk sizes.", "For each question, check whether the right passage appears in the top three or five results.", "Choose the size where the correct passage appears most often and stays coherent."),

      h2("Overlap: when and how much"),
      p("Overlap repeats a little text between adjacent chunks so that an idea spanning a boundary is not lost. Ten to fifteen percent is typical. Too much overlap wastes storage and can return near-duplicate chunks; none at all risks losing context at boundaries. Structure-aware chunking needs less overlap because the boundaries follow the meaning."),

      h2("Handling different file types"),
      h3("PDFs"),
      p("PDFs are display formats, not structure formats. Text may be in columns, headers and footers may repeat on every page, and scanned PDFs are images with no text at all. Extract the text carefully, remove repeated headers and footers, rejoin hyphenated words split across lines and use text recognition (OCR) for scanned pages. See [OCR text extraction for RAG](/blog/ocr-text-extraction-rag-knowledge-base). Prefer PDFs exported from a text document over scans."),
      h3("Word documents"),
      p("Word files carry real structure: headings, lists and tables. Use the heading styles to define sections and keep each section's title with its text. This gives better chunks than treating the file as plain text."),
      h3("Web pages"),
      p("Web pages include navigation, footers and cookie banners that are not content. Extract the main content, keep the page title and headings, and skip boilerplate. Crawling a sitemap lets you cover a whole site; see [dynamic web scraping and sitemap ingestion](/blog/dynamic-web-scraping-sitemap-ingestion-rag)."),
      h3("Spreadsheets and CSV files"),
      p("Tabular data does not chunk like prose. Turn each row into a short sentence or record that includes its column names, or group rows meaningfully. See [tabular data ingestion for RAG](/blog/tabular-data-ingestion-semantic-csv-rag)."),
      h3("Video and audio"),
      p("Transcripts are long and unstructured. Split by time segments or topic shifts and keep timestamps for reference. See [YouTube transcript ingestion](/blog/youtube-transcript-ingestion-rag)."),

      h2("Tables and lists"),
      p("A table split across chunks is nearly useless: the rows lose their headers. Keep tables whole where possible, repeat header rows in each chunk if a table must be split, or convert rows to sentences such as 'Colour treatment, medium length: $95, 2 hours'. Keep lists together with the sentence that introduces them."),

      h2("Add context to every chunk"),
      p("A chunk that says 'the fee is $50' is ambiguous. Prepend the document title and section heading to each chunk, for example 'Pricing > Consultations: The fee is $50.' That small addition makes matching and answering much more reliable. It costs little and helps both keyword and meaning-based search."),

      h2("Metadata"),
      p("Store useful metadata with each chunk: the source file, page or section, the date and a category. It lets you show sources, filter by topic and remove outdated material. When a document changes, you can replace exactly the chunks that came from it."),

      h2("How chunking interacts with search"),
      p("Chunking and retrieval are partners. Meaning-based (vector) search finds paraphrases; keyword search finds exact terms. Combining them, called hybrid search, and merging the results improves recall. See [hybrid retrieval with dense vectors and sparse keywords](/blog/hybrid-rag-dense-vector-sparse-keyword) and [reciprocal rank fusion](/blog/reciprocal-rank-fusion-rrf-rag). Good chunks make both work better."),

      h2("Writing documents so they chunk well"),
      ul("Use clear headings that state what follows, for example 'Cancellation policy'.", "Keep one topic per section.", "Put the question and its answer close together.", "Use full sentences for key facts.", "Avoid burying facts in images or complex layouts.", "Keep documents short and focused rather than one giant file."),
      p("These habits help human readers too, and they are the easiest way for a business owner to improve answers without touching any technology. See [preparing your service menu and pricing documents](/blog/prepare-service-menu-pricing-docs-rag)."),

      h2("Common chunking mistakes"),
      ul("Using one fixed size for every kind of document.", "Ignoring headings and structure.", "Cutting tables in half.", "Leaving headers, footers and navigation text in the chunks.", "Not testing with real questions.", "Failing to re-chunk after documents change.", "Skipping OCR on scanned files and wondering why nothing is found."),

      h2("How to test your chunking"),
      table(["Test", "What to look for"], ["Ask a question whose answer is in one paragraph", "The paragraph appears among the top results"], ["Ask a question whose answer spans two paragraphs", "Both are returned, or a parent section is"], ["Ask for a specific price or term", "Exact-match text is found"], ["Ask a paraphrased question", "The right passage is still found"], ["Ask about something not in the documents", "No misleading passage is returned; the assistant says it does not know"]),
      p("Keep the questions and rerun the test whenever you change your chunking or add documents."),

      h2("A worked example: chunking a price list"),
      p("Imagine a salon price document with headings for Cuts, Colour and Treatments, and a table under each. A fixed-size splitter might cut the Colour table in half, leaving the row 'Full head, medium length: $95' in a chunk with no heading. A structure-aware approach keeps each table with its heading and prepends the document and section titles, so the chunk reads 'Price list > Colour: Full head, medium length: $95, about 2 hours.' A question such as 'how much for a full head of colour' now matches both by meaning and by the exact words 'colour' and 'full head'. The extra thought at chunking time is what makes the answer reliable later."),

      h2("Re-chunking when documents change"),
      p("Documents change: prices, policies, opening hours. Treat the chunks as derived data that you can rebuild. When a file is updated, remove the old chunks for that file and add the new ones, and check that nothing from the old version remains. Keep a record of when each source was last indexed, and review anything that has not changed in a long time, since old content is a common source of wrong answers."),

      h2("Frequently asked questions"),
      faq(
        ["What is chunking in RAG?", "It is splitting documents into smaller pieces that can be indexed and retrieved to answer questions. The way you chunk strongly affects answer quality."],
        ["What is the best chunk size?", "There is no universal best. A common starting point is about 200 to 500 words with 10 to 15 percent overlap, keeping FAQ entries and price lines whole. Test with real questions."],
        ["Should chunks overlap?", "A small overlap helps ideas that cross a boundary. Structure-aware chunking needs less overlap."],
        ["How do I chunk PDFs with tables?", "Keep tables whole where you can, repeat headers if you must split, or convert rows into sentences that include column names."],
        ["Do headings matter?", "Yes. Attaching the document title and section heading to each chunk helps retrieval and helps the model understand context."],
        ["How do I improve results without changing technology?", "Write documents with clear headings, one topic per section and full-sentence facts, and remove out-of-date material."],
      ),
      p("You can see how a grounded assistant uses your documents in the [playground](/playground), and read how the [knowledge base feature](/product/knowledge-base) handles files, pages and text."),
    ],
  }),

  pillar({
    slug: 'sms-vs-email-appointment-reminders-conversions',
    title: 'SMS vs Email Appointment Reminders: Which Reduces No-Shows Better?',
    description: 'Compare SMS and email appointment reminders on open rates, cost, detail, consent and no-show reduction, with timing, wording and a recommended mix by business type.',
    primaryKeyword: 'SMS vs email appointment reminders',
    secondaryKeywords: ['appointment reminder text messages', 'reduce no shows with reminders', 'best time to send appointment reminders', 'appointment reminder templates'],
    body: [
      p("Reminders are the cheapest way to reduce no-shows, but the channel you choose changes how well they work. Text messages are noticed within minutes, while emails hold more detail and cost almost nothing. Most businesses do best with a combination, timed sensibly and worded like a person would write. This guide compares SMS and email for appointment reminders, explains timing, consent and wording, gives templates you can adapt and shows how to test what works for your customers."),
      note("Rules on text messaging and email marketing differ by country. Reminders for an appointment the customer booked are generally treated differently from marketing, but you should check the laws that apply to you, such as consent requirements for text messages, and keep records of consent. This is general information, not legal advice."),

      h2("Why reminders work"),
      p("Most missed appointments are forgotten, not cancelled on purpose. A timely nudge, with an easy way to change the booking, turns forgetting into either attending or rescheduling. Both outcomes are better than an empty slot. The main choices are which channel, how many reminders and when to send them."),

      h2("SMS reminders: strengths and limits"),
      ul("**Fast attention.** Text messages are usually read within minutes, on the device the customer carries.", "**Short and direct.** A line with the time and a link is easy to act on.", "**Good for same-day reminders.** A message a few hours before catches people before they leave.", "**Two-way potential.** Customers can reply to confirm or ask to change, if you set that up."),
      p("Limits: they cost a small amount per message, length is limited, links must be trusted, some customers find texts intrusive and you need a valid mobile number and, in many places, appropriate consent."),

      h2("Email reminders: strengths and limits"),
      ul("**Room for detail.** Address, map, parking, what to bring, preparation, price and policy all fit.", "**Almost free.** You can send several without cost concerns.", "**A record.** Customers can search for it later and add it to a calendar.", "**Calendar files.** A one-click 'add to calendar' reduces forgetting."),
      p("Limits: they are opened more slowly, may land in spam or be buried, and are less reliable for last-minute reminders."),

      h2("Side by side"),
      table(["", "SMS", "Email"], ["Speed of attention", "Minutes", "Hours or days"], ["Detail", "Short", "As much as you need"], ["Cost", "Small cost per message", "Almost none"], ["Best timing", "Same day, or the day before", "At booking and a few days before"], ["Reply or action", "Reply or tap a link", "Click a link, add to calendar"], ["Consent needs", "Often stricter", "Depends on region"], ["Risk", "Feels intrusive if overused", "Lands in spam or is ignored"]),

      h2("Timing that works"),
      p("A pattern that suits many businesses is below. Adjust it to your service and how far ahead people book."),
      table(["When", "Channel", "Purpose"], ["Right after booking", "Email (with calendar file)", "Confirm details and share policies"], ["2 to 3 days before", "Email or SMS", "First reminder, with a change link"], ["The day before", "SMS", "Short reminder, optional confirm"], ["2 to 3 hours before", "SMS", "Last reminder with address and change link"], ["After the appointment", "Email", "Thanks, review request and rebooking link"]),
      p("For services booked weeks ahead, add a reminder a week before. For same-day bookings, send the confirmation and one short reminder. Three reminders in total is usually plenty; more tends to annoy."),

      h2("Wording that gets replies"),
      table(["Type", "Weak", "Stronger"], ["Day-before reminder", "Reminder: appointment tomorrow.", "Hi Sam, a reminder about your 2:30 p.m. appointment tomorrow at Brook Salon. Need to change it? Tap here and pick another time."], ["Same-day reminder", "You have an appointment today.", "See you at 2:30 p.m. today. Parking is behind the shop. Running late? Let us know."], ["Confirm request", "Reply YES.", "Please reply YES to confirm your 2:30 p.m. appointment tomorrow, or tap here to move it."], ["Follow-up", "Thank you.", "Thanks for visiting, Sam. Ready to book your next one? Here is a link."]),
      ul("Use the customer's first name and your business name.", "State the time, the date and the place.", "Always include an easy way to change or cancel.", "Keep it human, not corporate.", "Avoid all capitals and excessive punctuation, which look like spam."),

      h2("Consent and good practice"),
      ul("Ask for consent to send text messages when you collect the phone number, and say what you will send.", "Keep a record of consent.", "Include a way to opt out.", "Do not mix reminders with promotions without proper permission.", "Send at reasonable hours.", "Use your business name so customers recognise it."),
      p("If you serve customers in several countries, rules differ. Check the requirements for the places you operate, and ask your provider what they handle."),

      h2("Make changing the booking effortless"),
      p("The point of a reminder is not only to prompt attendance, but to capture the customer who cannot come. A link that opens a page to choose another time, or a reply in the chat, turns a likely no-show into a rebooking and frees the slot early. See [frictionless self-serve rescheduling](/blog/frictionless-self-serve-rescheduling) and [conversational rescheduling and cancellations](/blog/conversational-rescheduling-cancellations)."),

      h2("Which mix for which business"),
      table(["Business", "Suggested mix"], ["Salon or barbershop", "Email confirmation, SMS the day before and on the day"], ["Clinic or dental practice", "Email confirmation with preparation notes, SMS a day before, optional confirm request"], ["Consultant or coach", "Email confirmation with video link and questionnaire, SMS or email an hour before"], ["Fitness studio", "SMS or app notification for class reminders, email for policies"], ["Home services", "SMS with arrival window the day before and on the way"]),

      h2("How to test what works for you"),
      ol("Record your current no-show rate for a month.", "Change one thing at a time: add an SMS reminder, change the timing or add a change link.", "Compare the no-show and rescheduling rates after a month.", "Split by service or customer type to see where it works best.", "Keep what helps and drop what does not."),
      p("A short test beats a long argument about which channel is best. Read the complete plan in [how to reduce no-shows](/blog/eliminate-service-no-shows-playbook) and see [how an AI assistant supports confirmations and reminders](/blog/ai-appointment-booking)."),

      h2("Common mistakes"),
      ul("Sending only one reminder, too early.", "Sending too many reminders, too close together.", "Leaving out the change link.", "Using vague wording without the time or place.", "Forgetting to ask for consent.", "Never checking whether reminders arrive."),

      h2("Worked example: choosing a mix for a clinic"),
      p("A small clinic has 200 appointments a month, a no-show rate of around 12 percent, which is 24 missed slots, and an average appointment value of $90. That is about $2,160 a month lost. The clinic currently sends a single email reminder two days before."),
      table(["Change", "Cost", "Expected effect (illustrative)"], ["Add a same-day text reminder", "Small per-message cost", "A modest drop in no-shows, especially among people who do not read email quickly"], ["Add a one-tap reschedule link to every reminder", "Setup time", "Turns some would-be no-shows into rebookings"], ["Add a confirm-or-release request the day before", "Setup time", "Frees slots earlier for the waitlist"], ["Add a standby list", "Setup time", "Fills some of the freed slots"]),
      p("If these steps together recover even a quarter of the missed slots, that is six appointments a month, roughly $540, for a small monthly cost. The figures are illustrative, but the method works with your own: measure the baseline, change one thing at a time and compare."),

      h2("Reminder channels beyond SMS and email"),
      ul("**Messaging apps such as WhatsApp:** familiar and two-way, but need setup and approved templates for reminders outside the reply window. See [the WhatsApp Cloud API guide](/blog/whatsapp-cloud-api-integration-guide).", "**App notifications:** free and immediate if customers have your app, but only useful for businesses with one.", "**Phone calls:** high effort but effective for high-value or older customers who prefer talking.", "**Calendar invitations:** an invite in the customer's own calendar is a reminder they set up themselves."),
      p("Use the channels your customers already use. Ask them at booking how they prefer to be reminded, and respect that choice."),

      h2("Keep records of what you sent"),
      p("Log every reminder: who received it, when, through which channel and whether the customer replied or changed the booking. When a customer says they never got a message, you can check. The same log shows which reminder types get replies, so you can drop the ones that do nothing and strengthen the ones that work."),

      h2("Time zones, language and accessibility"),
      p("State the time zone if customers may be elsewhere, write reminders in the customer's language where you can, and keep the text plain and readable for people using screen readers or large fonts. Avoid relying on images or unusual characters in messages, which may not display on every phone. Test your reminders on a couple of different devices and email apps before you rely on them, and check what a customer sees when they tap the change link on a small screen."),

      h2("What to do when a reminder goes unanswered"),
      p("If you asked for confirmation and did not get it, the day before is the moment to act. Send one more short message, and if the appointment is high value or the customer has missed before, make a quick call. If the slot cannot be confirmed, offer it to your standby list. Be kind and consistent: you are protecting your time, not punishing the customer."),

      h2("Frequently asked questions"),
      faq(
        ["Are text messages better than email for appointment reminders?", "Text messages are noticed faster, so they suit last-minute reminders. Email holds more detail. Most businesses use both."],
        ["How many reminders should I send?", "Usually two or three: a confirmation at booking, one a day or two before and a short one a few hours before."],
        ["When should I send appointment reminders?", "A common pattern is at booking, two to three days before, the day before and a few hours before. Adjust for how far ahead people book."],
        ["Do I need consent to text customers?", "Often yes. Rules vary by country, so check the requirements, ask for consent when you collect the number and keep a record."],
        ["What should a reminder include?", "The date, time, place, your business name and a way to change or cancel. Add preparation notes in email."],
        ["Can an AI assistant send reminders?", "Booking-enabled assistants can send confirmations and reminders. Crescelo's booking on the Growth plan includes confirmation emails."],
      ),
      p("See the [appointment booking feature](/product/appointment-booking) for confirmations and rescheduling, and [start a free trial](/login?mode=register) to try it."),
    ],
  }),

  pillar({
    slug: 'live-chat-hidden-costs-small-business',
    title: 'The Real Cost of Live Chat for Small Businesses (and Cheaper Alternatives)',
    description: 'What live chat really costs a small business: subscription fees, staff time, coverage gaps and missed enquiries, with a worked cost model and ways to reduce it.',
    primaryKeyword: 'cost of live chat for small business',
    secondaryKeywords: ['live chat pricing', 'hidden costs of live chat', 'live chat vs chatbot cost', 'is live chat worth it'],
    body: [
      p("Live chat looks inexpensive: many products advertise a low monthly fee, and a chat bubble on the website feels like good service. But the subscription is only part of the price. Someone has to answer the chats, and that person's time is the largest cost. Coverage gaps, slow replies and the enquiries missed outside working hours add hidden costs that never show up on an invoice. This guide breaks down what live chat really costs a small business, gives you a way to calculate your own figure and looks at alternatives, including mixing live chat with an AI assistant."),

      h2("The visible costs"),
      table(["Cost", "How it appears"], ["Software subscription", "Monthly or annual fee, often per agent or per seat"], ["Add-ons", "Extra features, branding removal, integrations, more chat history"], ["Setup", "A little time to install and configure"]),
      p("These are easy to see and compare. Many providers charge per seat, so costs rise as your team grows, and higher tiers unlock features you may need, such as reports, automation or multiple sites."),

      h2("The hidden costs"),
      h3("1. Staff time"),
      p("Someone must watch the chat and reply, and chats interrupt other work. A receptionist who checks in patients cannot give a chat the attention it needs, and the switching cost is real. If chat volume is small, the time is spread thin; if it is large, you need dedicated staff."),
      h3("2. Coverage gaps"),
      p("Most small businesses cannot staff chat around the clock. Outside working hours, the chat either goes offline or takes a message, which is little better than a form. Many enquiries arrive in the evening and at weekends, precisely when nobody is available."),
      h3("3. Slow or inconsistent replies"),
      p("A chat that promises instant help but replies after ten minutes frustrates visitors more than no chat at all. Quality also varies by who is on shift."),
      h3("4. Training and turnover"),
      p("Agents need to know your prices, policies and tone. When staff change, training starts again."),
      h3("5. Missed opportunities"),
      p("Every unanswered chat or delayed reply is an enquiry that may go elsewhere. This is the hardest cost to see and often the largest."),
      h3("6. Management and quality control"),
      p("Someone should review conversations, correct mistakes and keep answers consistent."),

      h2("A worked cost model"),
      p("Here is an illustrative example. Replace the numbers with your own."),
      table(["Line", "Amount per month"], ["Live chat subscription for 2 agents", "$60"], ["Staff time answering chats: 30 hours at $20", "$600"], ["Management and training time: 4 hours at $30", "$120"], ["Visible plus staff cost", "$780"], ["Enquiries missed outside hours: 30 a month", ""], ["Share that would have booked if answered: 15%", ""], ["Missed bookings: about 4.5 at $70", "about $315 in lost revenue"], ["True cost of the current setup", "about $1,095"]),
      p("The subscription of $60 is about 5 percent of the true cost in this illustration. The point is not the exact figures but the proportion: the fee is small compared with staff time and missed enquiries."),

      h2("How to calculate your own figure"),
      ol("Count the hours per month that someone spends on chat, including interruptions, and multiply by their hourly cost.", "Add the subscription and add-ons.", "Add management, training and review time.", "Estimate the enquiries you miss outside coverage hours and their value.", "Add them up and divide by the number of chats handled to get a cost per chat."),
      p("Cost per chat is a useful number. If a chat costs you several dollars in staff time and most are routine questions, an automated first line will probably save money."),

      h2("When live chat is worth it"),
      ul("Your visitors ask complex, high-value questions that need a human.", "You have staff whose main job is answering enquiries.", "You sell higher-priced services where a personal conversation closes the sale.", "Your hours are long enough that coverage gaps are small."),
      p("In those cases, live chat can pay for itself, especially when combined with tools that make the agents' work faster."),

      h2("Alternatives and complements"),
      table(["Option", "Cost profile", "Good for"], ["AI assistant on the first line", "Subscription plus small AI usage; no wages for routine questions", "Routine questions, bookings and after-hours coverage"], ["Live chat plus AI assistant", "Both, with the AI taking the routine load", "Businesses that want human help for complex cases"], ["Contact form only", "Lowest visible cost, highest missed-enquiry cost", "Very low-traffic sites"], ["Answering service", "Per-minute or per-call fees", "Phone-first businesses"], ["Messaging apps", "App or API costs and staff time", "Customers who prefer messaging"]),
      p("A common approach for small businesses is to let an AI assistant handle the first layer, answering questions and booking appointments at any hour, and to let people take over when a conversation needs them. See [AI receptionist vs answering service](/blog/ai-receptionist-vs-answering-service) and [Crescelo vs traditional live chat](/blog/crescelo-vs-traditional-live-chat)."),

      h2("Pricing pitfalls to watch for"),
      ul("**Per-seat pricing** that rises as you add people.", "**Conversation caps** that force upgrades.", "**Feature gating,** where basic functions such as reporting sit in higher tiers.", "**Annual contracts** that lock you in before you know the result.", "**Branding removal** charged separately.", "**AI add-ons** priced per resolution or per message, which can grow quickly."),
      p("Ask for the total price at your current and at triple your volume, and read what counts as a conversation. See our [platform comparison guide](/blog/website-chatbot-platform-comparison) for a scorecard."),

      h2("Reducing the cost of chat without losing quality"),
      ol("Answer the top twenty questions automatically, from your documents.", "Use saved replies for the rest, so a human reply is fast.", "Limit staffed hours to when volume is highest, and let the assistant cover the rest.", "Route only conversations that need a person to your team.", "Review transcripts and turn repeated questions into documents.", "Check the cost per chat monthly."),

      h2("A note on customer experience"),
      p("Cost is not the only measure. Visitors value speed, accuracy and a way to reach a person. An assistant that answers instantly and hands over gracefully often improves the experience compared with a live chat that is slow or offline. The aim is not to remove people but to use them where they matter. See [live human handover flow design](/blog/live-human-handover-flow-design)."),

      h2("A month with live chat, in practice"),
      p("To make the hidden costs concrete, imagine a small dental practice with live chat during office hours. The chat bubble is visible on every page, and the receptionist watches it between phone calls and check-ins."),
      table(["Time", "What happens", "Hidden cost"], ["9:15 a.m.", "A visitor asks about a first appointment; the receptionist is on the phone", "Reply takes six minutes; the visitor has gone"], ["12:30 p.m.", "The chat is unattended during lunch", "Two enquiries wait until 1:30"], ["3:00 p.m.", "A complex insurance question arrives", "The receptionist answers well, which is where live chat shines"], ["7:45 p.m.", "The chat is offline; a visitor leaves an email address", "Reply next morning, after the visitor booked elsewhere"], ["Saturday", "Nobody is there", "Weekend enquiries wait until Monday"]),
      p("The receptionist did well on the hard question, and the practice still lost several enquiries to timing. That is the pattern in many small businesses: live chat is excellent for the conversations that need a person and expensive for everything else."),

      h2("Questions to ask before buying live chat"),
      ol("Who will answer, and what will they stop doing to answer?", "What are our staffed hours, and what happens outside them?", "How many chats will we get, and how many will be routine questions?", "What does the tool cost at twice our team size and volume?", "Can the tool hand routine questions to automation and keep human effort for the rest?", "How will we measure response time and outcomes?"),

      h2("A staged approach to lower the cost"),
      ol("**Stage 1: Automate the routine.** Load your documents into an AI assistant so common questions and bookings are answered instantly.", "**Stage 2: Add a handover.** Let visitors ask for a person, and notify your team with the conversation.", "**Stage 3: Staff only where it pays.** Keep live agents for the hours and topics where a person adds value.", "**Stage 4: Review monthly.** Compare cost per chat, response time and bookings, and adjust."),
      p("This approach keeps the strengths of live chat, human judgement and warmth, while avoiding paying for people to type the same answers all day. Crescelo's Starter plan is $49 a month; see [pricing](/pricing) and the [ROI guide](/blog/ai-website-assistant-roi-calculator)."),

      h2("Do the sums again every quarter"),
      p("Traffic, team size and prices change, so the right setup today may not be right in six months. Once a quarter, recalculate your cost per chat, look at how many enquiries arrived outside staffed hours and check whether the tool's plan still fits your volume. If you have grown, seat-based pricing may have become expensive; if you have shrunk, you may be paying for capacity you do not use. A ten-minute review protects you from paying for last year's needs."),

      h2("Signs live chat is not working for you"),
      ul("Visitors often start a chat and leave before a reply.", "Agents report that most chats are the same five questions.", "Your chat is offline more often than online.", "You pay per seat for people who rarely use it.", "Enquiries arriving outside hours outnumber those inside them.", "You do not know your response time."),
      p("If several of these are true, add automation to the first line before adding more staff."),

      h2("Frequently asked questions"),
      faq(
        ["How much does live chat cost a small business?", "The software may cost tens of dollars a month, but staff time and missed enquiries usually make the true cost many times higher. Calculate hours spent, add the subscription and estimate lost enquiries."],
        ["Is live chat worth it for a small business?", "It can be if your visitors ask complex, high-value questions and you have staff to answer quickly. For routine questions and out-of-hours coverage, an AI assistant is often cheaper."],
        ["Can an AI chatbot replace live chat?", "It can cover routine questions and bookings, and hand over to a person when needed. Many businesses use both."],
        ["What are the hidden costs of live chat?", "Staff time, coverage gaps, slow replies, training, management and enquiries missed outside working hours."],
        ["How do I calculate the cost per chat?", "Add the subscription, staff time and management time for a month, then divide by the number of chats handled."],
        ["How can I reduce live chat costs?", "Automate common questions, limit staffed hours to peak times, use saved replies and review transcripts to remove repeat questions."],
      ),
      p("See how an assistant can cover the first line in the [playground](/playground), or read about [human handover](/product/human-handover) for the moments a person is needed."),
    ],
  }),

  pillar({
    slug: 'hybrid-rag-dense-vector-sparse-keyword',
    title: 'Hybrid Search for RAG: Combining Vector and Keyword Retrieval',
    description: 'Learn how hybrid retrieval combines dense vector search and sparse keyword search for RAG, why each alone fails, how to merge results and how to test it on your own data.',
    primaryKeyword: 'hybrid search RAG',
    secondaryKeywords: ['dense vs sparse retrieval', 'vector and keyword search', 'BM25 and embeddings', 'RAG retrieval accuracy'],
    body: [
      p("When a chatbot answers from your documents, the quality of the answer depends first on whether the right passage was found. That is the job of retrieval. Two families of search dominate: vector search, which matches meaning, and keyword search, which matches exact words. Each fails in ways the other does not. Hybrid search combines them, and for business content full of names, numbers and product terms, it is usually the most reliable approach. This guide explains how each method works, where each fails, how to merge their results, how to tune the mix and how to test retrieval on your own documents."),
      p("The article is aimed at developers and technically curious owners. We describe general practice and note how Crescelo approaches it."),

      h2("Dense vector search: matching meaning"),
      p("Dense retrieval converts text into a list of numbers, called an embedding, that captures meaning. Texts with similar meaning have similar embeddings. To search, the system embeds the question and finds the chunks whose embeddings are closest. Because it works on meaning, it can match different wording: 'how much does a haircut cost' finds a passage titled 'Cut prices'."),
      ul("**Strengths:** handles paraphrase, synonyms and natural-language questions; works across languages if the model supports them.", "**Weaknesses:** can miss exact identifiers, rare terms, product codes and numbers; can return passages that feel related but do not answer; quality depends on the embedding model."),

      h2("Sparse keyword search: matching words"),
      p("Sparse retrieval matches the actual words in the question against words in the documents, weighting rare words more heavily than common ones. The best-known method is BM25. It is fast, transparent and excellent at exact terms."),
      ul("**Strengths:** exact names, codes, numbers and rare terms; easy to explain why a result matched.", "**Weaknesses:** misses paraphrases and synonyms; sensitive to spelling and wording; treats 'cheap' and 'affordable' as unrelated."),

      h2("Why each alone fails on business content"),
      table(["Question", "Vector only", "Keyword only"], ["'How much is a keratin treatment?'", "Good if a passage discusses keratin pricing", "Good if the word 'keratin' appears"], ["'Do you do a fade for curly hair?'", "Finds related hair-cut passages", "May miss if the page says 'taper' or 'skin fade'"], ["'Is item SKU-4471 in stock?'", "May return similar-looking products", "Finds the exact code"], ["'Can I cancel without a fee?'", "Finds the cancellation policy despite different wording", "Needs the exact words 'cancel' and 'fee'"], ["'What is the deposit for a two-hour colour?'", "Finds deposit and colour passages", "Finds passages with 'deposit' and 'colour'"]),
      p("Real questions mix both kinds: some rely on meaning and some on exact terms. A retrieval system that uses both catches more of them."),

      h2("How hybrid retrieval works"),
      ol("The question is sent to both search methods.", "Each returns its own ranked list of chunks.", "A merging step combines the lists into one ranking.", "The top few chunks go to the language model as context."),
      p("The interesting part is the merge. The two methods produce scores on different scales, so you cannot simply add them. Two approaches are common."),
      h3("Weighted score combination"),
      p("Normalise the scores of each method to a common range and add them with weights, for example 0.6 for vectors and 0.4 for keywords. It is easy to understand but sensitive to how scores are normalised."),
      h3("Reciprocal rank fusion (RRF)"),
      p("Ignore raw scores and use only ranks. Each chunk gets a score of 1 divided by a constant plus its rank in each list, and the scores are added. A chunk that ranks well in both lists rises to the top; one that ranks well in only one still appears. RRF is robust, needs no tuning of score scales and works well in practice. See [reciprocal rank fusion for RAG](/blog/reciprocal-rank-fusion-rrf-rag)."),
      table(["Method", "Pros", "Cons"], ["Weighted scores", "Direct control over the balance", "Needs score normalisation and tuning"], ["Reciprocal rank fusion", "Simple, robust, no score scaling", "Ignores how much better one result is than the next"]),
      p("Crescelo combines vector and keyword retrieval and merges them with reciprocal rank fusion, then can rerank the top results. Embeddings can be computed locally, which keeps your documents' text off third-party embedding services; see [local embeddings on CPU](/blog/local-onnx-embeddings-cpu-bge-small)."),

      h2("Reranking: a second look at the shortlist"),
      p("After merging, a reranker can re-score the top twenty or so candidates by reading the question and each passage together, which is more accurate than comparing embeddings. It costs more per query but only touches a small shortlist, so it is often worth it where accuracy matters. Reranking is optional; hybrid retrieval alone is a big step up."),

      h2("Query preparation"),
      p("Chat questions are often short or depend on earlier messages: 'and how much is it for kids?' is meaningless alone. Before searching, systems can rewrite a follow-up into a standalone question using the conversation history, and can expand a query with synonyms. See [multi-turn query condensation for RAG](/blog/multi-turn-query-condensation-rag) and [domain synonym clusters](/blog/domain-synonym-clusters-rag-search). These steps improve both vector and keyword retrieval."),

      h2("Chunking and metadata still matter"),
      p("Hybrid search cannot rescue badly cut chunks. Make sure chunks are self-contained, carry their titles and keep tables whole; see [document chunking strategies](/blog/document-chunking-strategies-pdf-docx). Store metadata such as source and date so you can show sources, filter and update."),

      h2("Tuning the balance"),
      p("Start with an equal mix and test. Some content leans toward one method."),
      table(["Content type", "Lean toward"], ["Product catalogues with SKUs and codes", "More keyword weight"], ["Conversational FAQs and policies", "More vector weight"], ["Legal or technical text with defined terms", "Balanced, with keyword strong on terms"], ["Multilingual content", "More vector weight, with a multilingual embedding model"], ["Short factual pages such as price lists", "Balanced"]),

      h2("How to test retrieval on your own data"),
      ol("Collect 30 to 50 real questions, and for each note which passage should answer it.", "Run each question through vector-only, keyword-only and hybrid retrieval.", "For each, record whether the right passage is in the top 3 and top 5 results.", "Compute the hit rate for each method and compare.", "Look at the misses: is the problem chunking, wording, or a missing document?", "Repeat after any change to chunking, documents or settings."),
      table(["Metric", "Meaning"], ["Hit rate at k (recall at k)", "How often the right passage appears in the top k results"], ["Mean reciprocal rank", "How high the right passage typically ranks"], ["Precision at k", "How many of the top k results are relevant"]),
      p("You do not need a large test set. Thirty carefully chosen questions reveal most problems. See [benchmarking RAG retrieval metrics for business](/blog/benchmarking-rag-retrieval-metrics-business)."),

      h2("What this means if you are not a developer"),
      p("If you run a business and use a chatbot product, you do not need to tune any of this. What you can do is ask the vendor whether it combines meaning-based and keyword search, whether it can show which passage produced an answer and how it behaves when nothing relevant is found. And you can help retrieval by writing clear documents with headings, exact product and service names and the plain words customers use. The [guide to stopping chatbots from making things up](/blog/grounded-ai-chatbot-hallucinations) explains what happens after retrieval."),

      h2("Common mistakes"),
      ul("Choosing vector-only search because it sounds modern, then missing exact codes.", "Choosing keyword-only search and missing paraphrases.", "Adding weighted scores without normalising them.", "Ignoring chunking quality.", "Not testing with real questions.", "Sending too many chunks to the model, which dilutes the answer."),

      h2("A worked example of merging"),
      p("Suppose a visitor asks: 'Do you take walk-ins for a skin fade on Saturdays?' Vector search returns these chunks in order: A (walk-in policy), B (services list mentioning fades), C (Saturday opening hours). Keyword search returns B (contains 'skin fade' and 'Saturday'), A (contains 'walk-ins'), D (an unrelated blog post about fades). Reciprocal rank fusion with a constant of 60 gives each chunk 1 divided by (60 + rank) from each list."),
      table(["Chunk", "Vector rank", "Keyword rank", "Score", "Final position"], ["A (walk-in policy)", "1", "2", "1/61 + 1/62 = 0.0325", "1"], ["B (services list)", "2", "1", "1/62 + 1/61 = 0.0325", "1 (tie, broken by rank)"], ["C (Saturday hours)", "3", "not returned", "1/63 = 0.0159", "3"], ["D (fade blog post)", "not returned", "3", "1/63 = 0.0159", "4"]),
      p("Chunks A and B, which both methods found, rise to the top, and C, a useful passage that only vector search found, still makes the shortlist. The unrelated post D drops to the bottom. Neither method alone would have ranked the top three so well."),

      h2("Latency and cost of hybrid retrieval"),
      p("Running two searches sounds slower, but in practice both are fast for the size of a small business knowledge base, often a few milliseconds each for thousands of chunks. The larger costs come from embedding the question and from any reranking step, so cache repeated queries and embeddings where you can. Watch the total time from question to first word of the reply, because visitors notice delays of more than a couple of seconds. Measure before optimising: most of the delay in a chat reply usually comes from the language model, not the search."),

      h2("When keyword search saves the day"),
      p("Businesses are full of terms that mean nothing to a meaning-based model: a treatment named after a brand, a service code, a postcode, a staff member's name. Keyword search finds these exactly. If your documents use unusual names, make sure the retrieval you rely on includes keyword matching, and add the plain-language words customers use alongside the internal name so both routes work."),

      h2("Frequently asked questions"),
      faq(
        ["What is hybrid search in RAG?", "It combines vector search, which matches meaning, with keyword search, which matches exact words, and merges the results so the best passages from both are used."],
        ["Is hybrid search better than vector search alone?", "Usually for business content, because it handles both paraphrased questions and exact terms such as names, numbers and codes."],
        ["What is reciprocal rank fusion?", "A simple method for merging ranked lists that uses ranks rather than scores. Chunks that rank well in more than one list rise to the top."],
        ["Do I need a reranker?", "It is optional. It improves accuracy by re-scoring a shortlist, at extra cost per query."],
        ["How do I know if retrieval is good?", "Test with real questions and check whether the correct passage appears in the top few results."],
        ["Does hybrid search reduce hallucinations?", "It helps by finding the right passage more often, so the model has the facts to read. It should be combined with clear instructions to admit when it does not know."],
      ),
      p("You can see grounded answers on your own documents in the [playground](/playground) and read about the [knowledge base feature](/product/knowledge-base)."),
    ],
  }),
];
