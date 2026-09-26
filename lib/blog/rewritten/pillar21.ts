import { faq, h2, h3, note, ol, p, pillar, table, ul } from '../authoring';

export const PILLAR21 = [
  pillar({
    slug: 'voice-ai-vs-web-chat-receptionist',
    title: 'Voice AI vs Web Chat Receptionists: Which Channel Fits Your Business?',
    description: 'Compare AI phone receptionists with website chat assistants: customer preference, quality, cost, privacy, accents and noise, urgency, booking and where each works best.',
    primaryKeyword: 'voice AI vs web chat receptionist',
    secondaryKeywords: ['AI phone receptionist', 'voice assistant for small business', 'phone vs chat customer service', 'AI answering calls'],
    body: [
      p("Customers reach a business in different ways. Some pick up the phone, especially when the problem is urgent or complicated. Others prefer typing, especially for quick questions and bookings, and especially outside working hours. An AI receptionist can serve either channel, and the two are not the same product: a voice assistant answers calls in real time, hears accents and background noise and speaks back, while a web chat assistant reads typed messages and shows buttons and booking cards. This guide compares them honestly: how customers behave, what each does well and badly, cost and complexity, privacy, urgency and the practical choice for a small service business. One point up front: Crescelo's assistant works in website chat and messaging apps today, and answering phone calls is under development and shown on the [roadmap](/roadmap), so we compare the approaches, not a product we do not yet offer."),

      h2("How customers choose a channel"),
      table(["Situation", "Likely channel"], ["Urgent problem: burst pipe, severe pain", "Phone"], ["Complex or emotional matter", "Phone or in person"], ["Quick factual question: price, hours", "Chat or search"], ["Booking outside office hours", "Chat"], ["Someone in a public place or at work", "Chat"], ["Older customers or those with difficulty typing", "Phone"], ["Customers who dislike phone calls", "Chat"]),
      p("Look at how your customers contact you today, and ask them. A business whose customers overwhelmingly phone will not be helped much by chat alone, and one whose enquiries arrive through the website will not need a phone assistant first."),

      h2("What voice AI does well"),
      ul("Answers calls instantly, at any hour, without a queue.", "Feels natural to people who prefer talking.", "Handles urgent situations where typing is awkward.", "Can take messages, route calls and book appointments by voice."),
      h3("Where voice AI struggles"),
      ul("**Accents, dialects and noise:** speech recognition errors on a phone line are common, especially with background sounds.", "**Names, addresses and numbers:** hard to capture accurately by ear; spelling back is clumsy.", "**Interruptions and pauses:** conversation timing is harder than turn-taking in chat.", "**Emotional calls:** an AI voice can feel cold to a distressed caller.", "**Latency:** delays before the AI answers feel awkward.", "**Recording and consent rules:** calls may be recorded, and rules vary by place."),

      h2("What web chat does well"),
      ul("Text is exact: names, addresses and emails are captured as typed.", "Visitors can read at their own pace and scroll back.", "Rich elements: buttons, booking cards, links and images.", "Works quietly in public and at night.", "Easy to keep a transcript and review it."),
      h3("Where web chat struggles"),
      ul("Some customers will not type or do not think of the website.", "Urgent callers may prefer to phone.", "Long conversations are slower than talking.", "Accessibility depends on the widget's quality."),

      h2("Side by side"),
      table(["", "Voice AI receptionist", "Web chat assistant"], ["Availability", "24/7", "24/7"], ["Accuracy on names and numbers", "Lower, prone to mishearing", "High"], ["Setup", "Phone number routing, voice, testing accents", "Content, testing, one snippet"], ["Booking", "Possible, by voice", "Cards and slots in chat"], ["Records", "Recordings and transcripts, with consent rules", "Transcripts"], ["Cost pattern", "Per-minute or per-call costs plus platform", "Subscription plus small AI usage"], ["Best for", "Businesses whose customers mostly phone", "Businesses whose enquiries come through websites and messaging"], ["Risk", "Misheard details, cold tone, consent issues", "Ignored by phone-first customers"]),

      h2("Cost and complexity"),
      p("Voice needs more moving parts than chat: a phone number, call routing, speech recognition, a text-to-speech voice and low latency between them, and its usage cost is often measured in minutes. Chat needs content and a widget. For a small business, chat is usually cheaper and quicker to launch and easier to keep accurate. Voice can be worthwhile when phone volume is high and missing calls costs real money."),

      h2("Privacy and consent"),
      ul("Calls may need a recording notice, and consent rules differ by country and state.", "Voice data is more sensitive than text, and voiceprints can be biometric data in some laws.", "You must tell callers they are speaking to an AI.", "Ask providers where audio is processed and stored, and how long.", "Chat transcripts are also personal data; see the [GDPR checklist for website chatbots](/blog/website-chatbot-gdpr-checklist)."),

      h2("Emergencies"),
      p("Voice is the natural channel for emergencies, and the riskiest for automation. A voice assistant must recognise urgent words reliably despite noise, give approved instructions and hand over to a person fast. Test with realistic accents and noisy recordings. For most small businesses, a human or a proper emergency line should own emergencies whatever the channel. See [handling emergencies in automated chat](/blog/handling-emergencies-automated-chat)."),

      h2("A practical decision"),
      table(["If", "Then"], ["Most enquiries come from the website and messaging", "Start with web chat"], ["Most enquiries are calls and you miss many", "Add call answering, by an AI product you trust or a human service, alongside chat"], ["Your calls are emotionally sensitive", "Prefer people on the phone; use chat for simple admin"], ["You need bookings out of hours", "Chat covers it now; voice can follow"], ["Budget is tight", "Chat first"]),
      p("You do not have to choose forever. Many businesses start with chat, learn what customers ask, then add voice where the numbers justify it. The knowledge base you build for chat is the same content a voice assistant would need."),

      h2("What Crescelo offers today"),
      ul("Website chat widget and hosted pages, on every plan.", "WhatsApp and Telegram, on the Agency plan.", "Booking, lead capture and human handover across those channels.", "Phone answering: under development, with nothing to set up yet."),
      p("See the [roadmap](/roadmap) for status. If phone is your main channel today, consider an answering service or a phone AI product for calls, and read [AI receptionist versus answering service](/blog/ai-receptionist-vs-answering-service)."),

      h2("Worked example: a plumbing company"),
      p("A plumbing company counted its enquiries: sixty percent phone, thirty percent website chat and form, ten percent messaging apps. Calls during jobs went to voicemail, and roughly a third of callers did not leave a message. The owner did two things: added a chat to the website for the thirty percent, and set up a call-answering service for the phone. He also put the chat link in the voicemail greeting: 'Or ask us online and get an instant reply.' Within a month the chat took a growing share of evening enquiries, and the missed-call problem was reduced by the answering service. The lesson is that the channels complement each other, and the shared knowledge base kept answers consistent."),

      h2("Frequently asked questions"),
      faq(
        ["Is a voice AI receptionist better than web chat?", "Neither is better in general. Voice suits phone-first customers and urgent calls; chat is cheaper, more accurate for details and easier to launch."],
        ["Does Crescelo answer phone calls?", "Not yet. Phone answering is under development. Crescelo works in website chat, hosted pages, WhatsApp and Telegram."],
        ["Why is voice AI less accurate for names and numbers?", "Speech recognition can mishear names, addresses and digits, especially with accents and background noise."],
        ["Do I need to tell callers it is an AI?", "Yes, and many places have rules on disclosure and recording. Check what applies to you."],
        ["Which is cheaper?", "Chat usually is, because voice adds telephony and per-minute costs."],
        ["Can I use both?", "Yes. Many businesses use chat for the website and a separate solution for calls, with shared information."],
      ),
      p("Try the chat side in the [playground](/playground), see the [AI assistant feature](/product/ai-assistant) and read [the AI receptionist guide](/blog/virtual-ai-receptionist)."),
    ],
  }),

  pillar({
    slug: 'prevent-front-desk-burnout-ai',
    title: 'Front Desk Burnout: How AI Assistants Lighten the Load Without Replacing Your Team',
    description: 'How front desk burnout builds, what repetitive load and interruptions do to staff, and how an AI assistant helps if introduced well: scope, involvement, boundaries and measures.',
    primaryKeyword: 'prevent front desk burnout',
    secondaryKeywords: ['front desk overload', 'reception staff stress', 'automate repetitive questions', 'AI assistant for receptionists'],
    body: [
      p("Ask a front desk worker what wears them down and you will rarely hear about the hard cases. You will hear about the fortieth call about parking, the constant interruptions while checking someone in, the phone ringing over a queue of people, the evening messages waiting on Monday morning. It is repetition and fragmentation, not difficulty, that drains people. Burnout at the front desk is expensive: mistakes rise, patience falls, good staff leave and the customer experience suffers. An AI assistant can take a real share of the repetitive load, but only if it is introduced with care: scoped sensibly, built with the team, kept honest about what it can and cannot do. This guide explains how front desk overload builds, what an assistant can genuinely take off the plate, how to introduce it so staff see it as help, what to watch out for and how to measure whether it is working."),

      h2("What drains front desk staff"),
      table(["Source", "Effect"], ["Repetitive questions", "The same five answers all day, which is tedious and error-prone"], ["Constant interruptions", "Cannot finish a task; context switching"], ["Simultaneous demands", "Phone, walk-ins and messages at once"], ["After-hours backlog", "A queue of messages to clear before the day starts"], ["Being the first line for complaints", "Emotional load without authority"], ["Scheduling puzzles", "Juggling changes and gaps by hand"], ["Feeling undervalued", "Doing low-recognition work with high responsibility"]),
      p("Any tool that reduces these without adding new burdens helps. Any tool that adds monitoring, blame or extra clicks does not."),

      h2("What an AI assistant can take off the plate"),
      ul("**Repetitive questions:** prices, hours, parking, policies, what to bring, whether a service is offered.", "**After-hours enquiries:** answered and booked overnight, so the morning starts calmer.", "**Simple bookings and changes:** self-serve through the assistant and the change link.", "**Lead capture:** structured details ready for follow-up.", "**Reminders and confirmations:** sent automatically."),
      h3("What it should not take"),
      ul("Complaints, upset customers and sensitive situations.", "Decisions on exceptions, refunds and clinical or legal judgement.", "The warmth of greeting people in person.", "Anything the team would rather keep."),
      p("The aim is fewer interruptions, not fewer humans. A front desk freed from repetition can give more attention to the people in front of them."),

      h2("Introduce it with the team, not at them"),
      ol("Ask the team what they dread answering. Their list becomes the assistant's first content.", "Let them write or review the answers. They know the wording that works.", "Explain what the assistant will and will not do, and what happens to their role.", "Give them a way to correct mistakes quickly and see the fix.", "Involve them in reviewing conversations, so they own its quality.", "Share early results, and adjust based on their feedback."),
      p("Staff who help build the assistant tend to treat it as a colleague. Staff who discover it after the fact tend to treat it as a threat."),

      h2("Be honest about roles"),
      p("Do not promise that no jobs will change. Say clearly what you intend: the assistant handles repetitive first-line work, and people focus on customers in the building, complex cases and relationships. If you plan to redeploy time, say to what. If your intention is to reduce hours, say that too; trust is worth more than a comforting story. In most small businesses the benefit is absorbed by growth: the same team handles more customers with less strain."),

      h2("Boundaries that protect staff"),
      ul("Set clear handover rules so complaints reach a person with authority, not a stressed junior.", "Route urgent alerts to someone on duty, not to whoever is nearest.", "Limit notifications to what matters; alert fatigue is a burden too.", "Give staff a way to pause or mute outside working hours.", "Do not use conversation transcripts to monitor individuals unfairly."),

      h2("Reduce the morning backlog"),
      p("After-hours messages waiting at 9 a.m. are a heavy start. With an assistant, many are already answered or booked, and the rest are sorted by urgency with the conversation attached. Give the team a short routine: read overnight conversations, call the hottest leads, follow up on handovers. See [after-hours appointment booking](/blog/after-hours-appointment-booking) and [speed to lead](/blog/speed-to-lead-service-businesses)."),

      h2("Watch for new sources of strain"),
      ul("**Fixing the assistant's mistakes:** budget time, and make it easy.", "**Angry customers who dislike bots:** make handover fast and the disclosure honest.", "**Extra alerts:** tune them.", "**Unclear ownership:** name someone responsible for the knowledge base.", "**Over-reliance:** keep the team able to answer without it."),
      p("A weekly fifteen-minute review keeps these under control; see [how to review your chatbot's conversations](/blog/audit-website-chatbot-conversations)."),

      h2("Measure the effect on people, not only numbers"),
      table(["Measure", "How"], ["Interruptions per hour", "Sample a few days before and after"], ["Repeat questions handled by staff", "Count in a sample"], ["Overtime and morning backlog", "Track hours and unread messages"], ["Staff feedback", "Short survey: what is better, what is worse"], ["Customer satisfaction", "Reviews and comments"], ["Errors", "Booking mistakes and complaints"]),
      p("Ask the team directly and act on what they say. If they report more stress, find out why before blaming them."),

      h2("Worked example: a five-chair salon"),
      p("The salon's receptionist answered around forty calls a day, half of them about prices and availability, while checking clients in. Twice a week she left in tears of frustration. The owner and receptionist listed the twenty most repeated questions together, wrote the answers, loaded them into the assistant and added its link to the voicemail greeting and social bio. Within a month, calls about prices and availability halved, and the morning started with a short list of overnight bookings. The receptionist reviewed the assistant's conversations for ten minutes on Mondays and fixed two wrong answers. She said the best change was being able to finish a sentence with a client at the desk without the phone ringing. The owner noted that she stayed."),

      h2("A first-month plan"),
      table(["Week", "Action"], ["1", "List the twenty most repeated questions with the team and write the answers"], ["2", "Load them, test with the team and fix wrong answers"], ["3", "Go live on the website and in the voicemail and bio links; start a fifteen-minute weekly review"], ["4", "Survey the team; measure interruptions and backlog; adjust"]),
      p("A small, collaborative start builds confidence. Add booking and lead capture once the basics are trusted."),

      h2("Common mistakes"),
      ul("Introducing it without the team's input.", "Promising no change, then changing roles.", "Leaving complaints to the assistant.", "Sending too many alerts.", "Never asking staff how it feels."),

      h2("Frequently asked questions"),
      faq(
        ["Will an AI assistant replace my receptionist?", "It usually replaces repetitive first-line work, not the person. Complex, sensitive and in-person work remains with your team."],
        ["How do I get staff on board?", "Involve them from the start, let them shape the answers, explain the boundaries and share results."],
        ["What tasks should I automate first?", "The most repeated questions and after-hours enquiries."],
        ["What if customers get frustrated with the assistant?", "Make handover fast and easy, and be open that it is an AI."],
        ["How do I know it reduces burnout?", "Track interruptions, backlog and overtime, and ask the team directly."],
        ["How much time does the assistant need from staff?", "About fifteen minutes a week to review conversations and fix answers."],
      ),
      p("Read [AI receptionist versus human front desk](/blog/ai-receptionist-vs-human-front-desk), see the [human handover feature](/product/human-handover) and try the assistant in the [playground](/playground)."),
    ],
  }),

  pillar({
    slug: 'train-ai-receptionist-service-catalog',
    title: 'Teaching an AI Receptionist Your Services: How to Write a Service Catalog It Can Use',
    description: 'How to prepare a service catalog for an AI assistant: structure, prices, durations, inclusions, exclusions, policies, examples and testing so answers are accurate.',
    primaryKeyword: 'train AI receptionist on services',
    secondaryKeywords: ['service catalog for chatbot', 'chatbot knowledge base pricing document', 'write FAQ for AI assistant', 'prepare documents for AI assistant'],
    body: [
      p("An AI receptionist does not learn your business by osmosis. It answers from the documents you give it, and the quality of those documents decides the quality of its answers. The most important document for a service business is the service catalog: what you offer, for whom, for how much, how long it takes, what is included and what is not, and the rules around it. A well-written catalog produces accurate answers, fewer handovers and confident bookings. A vague one produces guesses, or worse, confident errors. This guide explains how to write a service catalog for an assistant: the structure, what to include for each service, how to write it so it can be found and understood, how to handle prices and exceptions, how to keep it current and how to test it. The same document also improves your website and your team's own consistency."),

      h2("Why structure matters"),
      p("The assistant searches your documents for passages relevant to the question, then writes an answer from them. Passages that are short, focused and clearly titled are found more reliably than long documents with answers buried in the middle. Write for retrieval as well as for reading: one service, one section, with the key facts near the top."),

      h2("A template for each service"),
      table(["Field", "What to write", "Example"], ["Name", "The name customers use", "Cut and colour"], ["What it is", "One or two plain sentences", "A haircut followed by an all-over colour, with a wash and blow-dry"], ["Who it suits", "Typical customers and exclusions", "Most hair types; not suitable if hair has recently been bleached at home"], ["Price", "Fixed price or range, and what changes it", "From $145; long hair adds $25"], ["Duration", "How long, including preparation", "About 3 hours"], ["What is included", "The parts of the service", "Consultation, patch test check, colour, cut, blow-dry"], ["What is not included", "Common extras", "Toner is $20 extra"], ["Preparation", "What the customer should do", "Come with clean, dry hair; patch test 48 hours before"], ["Aftercare", "Short guidance", "Wait 48 hours before washing"], ["Policies", "Deposit, cancellation, lateness", "See booking policy"], ["Common questions", "Two or three real ones with answers", "Can I bring my child? Yes, with an adult"]),
      p("Fill one of these for each main service. Ten services at a page each is a strong catalog."),

      h2("Write in customers' words"),
      ul("Use the names and phrases customers use, not internal codes.", "Add synonyms customers might type: 'balayage', 'highlights', 'colour'.", "State prices with the currency and what they include.", "Avoid abbreviations and jargon, or explain them.", "Write in full sentences for key facts."),
      p("A question like 'how much for a trim?' should find a passage that says 'A trim costs $28' rather than a table cell labelled 'Tr.'."),

      h2("Handle prices carefully"),
      table(["Situation", "How to write it"], ["Fixed price", "State the price and when it applies"], ["Range", "Give the range and what moves it"], ["Depends on assessment", "Say so, and give the process to get a quote"], ["Promotions", "Include dates and remove when they end"], ["Different prices by person or day", "State them clearly, or say who to ask"]),
      p("Never leave old prices in the document set. If a fact changes, update the source on the same day. See [preparing your service menu and pricing documents](/blog/prepare-service-menu-pricing-docs-rag)."),

      h2("Include what you do not do"),
      p("Customers ask about services you do not offer, and an assistant that only knows what you do may improvise. Write a short list of things you do not provide and, where helpful, what to suggest instead: 'We do not offer eyebrow threading; we can recommend a nearby specialist.' This prevents wrong promises and makes the assistant more helpful."),

      h2("Policies and practicalities"),
      ul("Booking, cancellation, lateness and deposit policies, in plain words.", "Opening hours, holidays and how to reach you.", "Address, parking, transport and accessibility.", "Payment methods.", "Who does what, if customers choose a person.", "Emergency or urgent-case rules."),
      p("Keep each in its own short document with a clear title such as 'Cancellation policy'."),

      h2("Tone and voice"),
      p("The catalog can also carry your voice. Write in the tone you want the assistant to use, and add a short style note: warm and plain, no jargon, never promise results. See [brand voice alignment for an AI receptionist](/blog/brand-voice-alignment-ai-receptionist)."),

      h2("Load it and test it"),
      ol("Upload the documents, or paste the text, into the knowledge base.", "Ask ten questions per service in different words, with typos.", "Ask questions the catalog does not answer and check the assistant says it does not know.", "Ask for a discount and a guarantee; it should decline.", "Check prices and durations against the source.", "Fix gaps by editing the document, then retest."),
      p("See [the questions every service business chatbot should answer well](/blog/essential-chatbot-questions-service-business) for a test list, and [how to stop a chatbot from making things up](/blog/grounded-ai-chatbot-hallucinations)."),

      h2("Keep it current"),
      ul("Put a review date on each document.", "Assign an owner.", "Review after any price, service or policy change.", "Review quarterly regardless.", "Use the weekly conversation review to find gaps; see [how to review your chatbot's conversations](/blog/audit-website-chatbot-conversations)."),

      h2("Worked example: a physiotherapy clinic"),
      p("A clinic's first document was a single PDF brochure of twelve pages, mostly marketing text with prices in a table image. The assistant could not read the prices and gave vague answers. The owner rewrote it as one short page per service, with the price, duration, what to expect and who it suits, added a page on insurance and referrals and a page of things the clinic does not treat. She replaced the table image with text. The assistant's answers became specific, handovers on price questions disappeared and new-patient bookings from the chat rose. The rewrite took a morning."),
      table(["Before", "After"], ["One 12-page brochure", "One page per service"], ["Prices in an image", "Prices in text with conditions"], ["No exclusions", "A page on what is not treated"], ["Vague answers", "Specific answers with conditions"]),

      h2("Common mistakes"),
      ul("One long brochure instead of a page per service.", "Prices in images or tables the assistant cannot read.", "Marketing language with no facts.", "Leaving old versions in the knowledge base.", "Never testing questions the catalog does not answer.", "Forgetting policies and practicalities."),
      p("Each of these has a simple fix, and together they explain most disappointing chatbot launches. Spend the time on the catalog before you spend it on anything else."),

      h2("Frequently asked questions"),
      faq(
        ["How do I train an AI receptionist on my services?", "Write a clear service catalog, one section per service with price, duration, inclusions and policies, and load it into the assistant's knowledge base."],
        ["What format should my documents be in?", "Text-based files such as PDF, Word or plain text, or a web page. Avoid putting key facts only in images."],
        ["Should I list services I do not offer?", "Yes, briefly, with a suggestion, so the assistant does not improvise."],
        ["How often should I update the catalog?", "Whenever anything changes, and review it at least quarterly."],
        ["How do I check the assistant learned it?", "Ask ten questions per service, including ones not covered, and compare answers with the source."],
        ["Can the same catalog serve my website?", "Yes. A clear catalog improves your website pages and your team's consistency."],
      ),
      p("Load your own catalog and test it in the [playground](/playground), see the [knowledge base feature](/product/knowledge-base) and [start a free trial](/login?mode=register)."),
    ],
  }),

  pillar({
    slug: 'service-area-verification-ai-chat',
    title: 'Service Area Questions in Chat: How to Answer "Do You Cover My Area?" Accurately',
    description: 'How local service businesses can answer coverage questions in chat: defining your service area, postcodes and radius, edge cases, travel fees, out-of-area replies and lead routing.',
    primaryKeyword: 'service area chatbot',
    secondaryKeywords: ['do you cover my area chatbot', 'postcode coverage check', 'service radius local business', 'out of area enquiries'],
    body: [
      p("'Do you cover my area?' is one of the most common questions a local service business gets, and one of the most wasteful. Every enquiry from outside your area costs time to answer and disappoints someone; every enquiry from inside your area that goes unanswered because the visitor was unsure about coverage is a lost job. An AI assistant can settle the question in seconds, at any hour, if it has a clear, accurate definition of where you work. This guide explains how to define your service area for an assistant, whether to use postcodes, towns or a radius, how to handle borderline places and travel fees, what to say to visitors outside your area, how to route in-area leads and how to keep the information current."),
      note("Crescelo does not perform live geographic lookups. The assistant answers coverage questions from the area description you provide in its documents, and captures the visitor's location so your team can confirm."),

      h2("Why coverage matters"),
      ul("It saves the visitor a wasted call.", "It stops your team quoting for jobs they cannot serve.", "It shapes expectations about travel fees and lead times.", "It protects your reputation for reliable answers."),

      h2("Defining your area"),
      table(["Method", "How to describe it", "Pros", "Cons"], ["Postcodes or ZIP codes", "List the codes or prefixes you serve", "Precise and easy to check", "Long lists; edge cases"], ["Towns and neighbourhoods", "List the places", "Natural for customers", "Ambiguity between similar names"], ["Radius from a point", "'Within 15 miles of Springfield'", "Simple to say", "The assistant cannot measure distance itself; needs a list of places"], ["Zones", "Zone 1: no travel fee; Zone 2: fee; Zone 3: by request", "Handles fees and priorities", "Needs clear boundaries"]),
      p("Because the assistant reads text, the most reliable approach is an explicit list of postcodes, towns or zones, not a radius. If you use a radius, convert it into a list of the places inside it."),

      h2("Write the area document"),
      ol("Start with a plain sentence: 'We serve Springfield and the surrounding towns within about 20 miles.'", "List the postcodes or towns by zone.", "State fees or lead times by zone.", "Say what to do outside the area.", "List exceptions and how to check them.", "Add the phone number for edge cases."),
      table(["Zone", "Places", "Travel fee", "Lead time"], ["1", "Springfield centre, postcodes SP1 to SP5", "None", "Same or next day"], ["2", "Northfield, Eastbrook, SP6 to SP9", "$20", "Within two days"], ["3", "Anything else within 30 miles", "By quote", "By arrangement"]),
      p("Keep it short and current, and make each row unambiguous."),

      h2("How the assistant answers"),
      table(["Visitor says", "Assistant does"], ["Do you cover Northfield?", "Confirms it is in zone 2, states the travel fee and lead time, and offers to book"], ["I am in SP4", "Confirms coverage and offers times"], ["What about Riverton?", "Says it is not listed, explains the closest zone and offers to check with the team"], ["I live 30 miles away. Can you come?", "Explains it is outside the standard area, says a special quote may be possible and captures details"]),
      p("The key behaviour is honesty: if a place is not in the document, the assistant should say it is not sure and offer a person, not guess."),

      h2("Handle the edges"),
      ul("**Borderline addresses:** hand over to a person who can check a map.", "**Places with similar names:** ask for the postcode.", "**Multiple locations:** define the area per branch; see [multi-location AI receptionists](/blog/multi-location-ai-receptionist).", "**Temporary changes:** update the document during storms, holidays or staff shortages.", "**Commercial jobs:** sometimes served further out; state the rule."),

      h2("Out-of-area visitors"),
      p("A polite decline preserves goodwill and can earn a referral. Say clearly that you do not cover the area, and, if you can, suggest an alternative: a colleague, a directory or a professional body. Offer to keep their details in case you expand, with consent. Avoid a curt 'we do not serve your area'. Example: 'I am sorry, we do not currently cover Riverton. You may find a local provider through [directory]. If we expand, we would be glad to help.'"),

      h2("Capture location to route leads"),
      p("Ask for the postcode early in an enquiry, because it decides routing, fees and priority. The assistant can record it with the lead, so your team sees it in the alert. If you have several teams by area, an automation can route on the postcode. See [instant lead routing in chat](/blog/instant-lead-routing-chat) and [webhook automations](/blog/webhook-automations-zapier-make-chat-events)."),

      h2("Test it"),
      ol("List twenty places: ten inside, five borderline, five outside.", "Ask the assistant about each, in different wordings.", "Check that zones, fees and lead times are correct.", "Check the reply for unknown places.", "Ask a question in another language you serve, if relevant.", "Retest after any change to the area document."),

      h2("Worked example: a mobile dog groomer"),
      p("A mobile groomer served three towns and a ring of villages, and spent time each week declining enquiries from farther away. She wrote a short area document with three zones and travel fees, added a polite out-of-area reply and put a note about mornings in the villages on Tuesdays and Thursdays only. The assistant answered coverage questions immediately, and her declined enquiries dropped sharply while bookings in the outer zone rose because customers now knew when she would be there. The update took twenty minutes."),

      h2("A sample conversation"),
      table(["Speaker", "Message"], ["Visitor", "Do you come out to Northfield for a boiler service?"], ["Assistant", "Yes, Northfield is in our second zone. There is a $20 travel fee, and we can usually visit within two days. A boiler service is $110 plus the travel fee. Would you like to see available times? I will need your postcode to confirm."], ["Visitor", "SP7 2AB"], ["Assistant", "Thanks, SP7 is in that zone. I can offer Wednesday between 9 and 12 or Thursday between 1 and 4."]),

      h2("Common mistakes"),
      ul("Using a radius the assistant cannot measure.", "Leaving the area document out of date.", "Curt replies to out-of-area visitors.", "Not capturing the postcode with the lead.", "Guessing for borderline places instead of handing over."),

      h2("Seasonal and temporary changes"),
      p("Service areas are not always fixed. In busy seasons you may narrow the area, after a new hire you may widen it, and during bad weather you may pause outer zones. Update the area document as soon as the plan changes, and note the end date if it is temporary. A visitor told 'yes, we cover you' who then waits a week has had a worse experience than one told the truth at the start."),

      h2("Frequently asked questions"),
      faq(
        ["Can a chatbot check whether I cover someone's area?", "It can if you give it a clear list of the postcodes, towns or zones you serve. Crescelo does not perform live map lookups, so it answers from your document."],
        ["Should I use a radius or a list?", "A list of places or postcodes is more reliable for an assistant than a radius."],
        ["What should it say to someone outside my area?", "A polite decline, a suggestion where possible and an offer to keep their details, with consent."],
        ["How do I handle travel fees?", "State them by zone in the area document."],
        ["What if a place is not on my list?", "The assistant should say it is not sure and offer to check with your team."],
        ["How often should I update the area?", "Whenever it changes, and review it every quarter."],
      ),
      p("Test coverage questions with your own area document in the [playground](/playground), read [AI lead capture for home service contractors](/blog/home-service-contractor-ai-lead-capture) and see the [lead capture feature](/product/lead-capture)."),
    ],
  }),

  pillar({
    slug: 'social-proof-reviews-ai-chat',
    title: 'Using Reviews and Social Proof in Chat Without Overstepping the Truth',
    description: 'How to use real reviews and proof in a website chat: what to share, how to quote honestly, rules on testimonials, handling negative reviews and keeping claims verifiable.',
    primaryKeyword: 'social proof in website chat',
    secondaryKeywords: ['reviews in chatbot', 'testimonials chat widget', 'build trust in chat', 'chatbot reputation'],
    body: [
      p("When a visitor asks 'are you any good?', they want evidence, not adjectives. Reviews, ratings, credentials and examples of past work are the evidence that turns a hesitant visitor into a booking. A chat is a natural place to share it, because the question often comes up mid-conversation, at exactly the moment the visitor is deciding. But social proof is also where businesses cut corners, and where an AI assistant can cause harm: an assistant that invents a five-star rating, misquotes a review or claims awards you never won will destroy the trust you are trying to build and may break advertising rules. This guide explains what proof to prepare for your assistant, how it should present it honestly, what the rules generally say, how to handle negative reviews and how to keep everything verifiable."),
      note("Rules on reviews, testimonials and endorsements differ by country and sector. This is general information, not legal advice. Make sure what your assistant says complies with the rules that apply to you."),

      h2("Types of proof"),
      table(["Proof", "Example", "How to use in chat"], ["Ratings", "4.8 stars from 212 reviews on a named platform", "State the source and date, and link to it"], ["Review quotes", "A short quote with the reviewer's first name and source", "Only real quotes, with permission where needed"], ["Credentials", "Licensed, insured, certified, member of a professional body", "State exactly and provide the number or link where appropriate"], ["Experience", "Years in business, number of clients served", "Only figures you can support"], ["Examples of work", "Before-and-after photos, case studies", "With consent, linked from your site"], ["Guarantees", "A money-back or workmanship guarantee", "Quote the terms exactly"]),

      h2("The cardinal rule: only what is true and current"),
      ul("Every claim should be verifiable by the customer.", "Ratings change; date them or link to the live source.", "Never invent, round up or select misleadingly.", "Do not quote reviews out of context.", "Do not imply endorsements you do not have."),
      p("An assistant should not generate proof. It should retrieve and present what you have supplied and approved."),

      h2("Prepare a proof document"),
      ol("List your review platforms, current ratings and links.", "Add five to ten approved review quotes with source and first name.", "List credentials and where to verify them.", "Add facts about your experience that you can support.", "Add guarantee terms exactly as written.", "State what you never claim."),
      p("Load it into the assistant's knowledge and date it. Review it monthly, since ratings and reviews move."),

      h2("How the assistant should use it"),
      table(["Visitor asks", "Good answer"], ["Are you any good?", "We are rated 4.8 out of 5 from over 200 reviews on Google, and you can read them here. Would you like to see the next available time?"], ["Do you have reviews?", "Yes. Here is our Google page. One recent customer, Sam, wrote: 'Friendly and on time.' You can read more at the link."], ["Are you licensed?", "Yes, we are licensed and insured. Our licence details are on our About page."], ["Is it guaranteed?", "Our workmanship guarantee covers [terms]. The full details are here."], ["Can I see examples?", "Here are some recent projects on our gallery page."]),
      p("The assistant should link to the source rather than paraphrase where possible, and should decline to answer if the proof is not in its documents."),

      h2("Rules to keep in mind"),
      ul("Endorsement and testimonial rules often require that reviews reflect real experiences and that material connections are disclosed.", "Incentivised reviews may need disclosure or may be prohibited on some platforms.", "Buying, faking or suppressing negative reviews is unlawful in many places and against platform rules.", "Claims such as 'best', 'number one' or 'guaranteed' need substantiation.", "Regulated professions often have strict limits on testimonials."),
      p("If in doubt, remove the claim. Trust lost to a misleading statement is hard to recover."),

      h2("Handling negative reviews"),
      p("Every business has some. The assistant should not hide them, and it should not argue. If a visitor asks about complaints, the honest answer is your overall rating and a link. A bad review that you responded to well can even build trust. Make sure you reply to reviews promptly and constructively, and use them to improve. See [collecting reviews and ratings with automated chat](/blog/collect-reviews-ratings-automated-chat)."),

      h2("Ask for reviews the right way"),
      ul("Ask happy customers soon after the visit, with a direct link.", "Ask everyone, not only those you expect to be positive, where the rules require it.", "Never offer payment for positive reviews.", "Thank reviewers."),
      p("The assistant can include a review request in a post-appointment message if you configure one. Keep it short and optional."),

      h2("Beyond reviews: other trust signals"),
      ul("Real photos of your team and premises.", "Clear pricing and policies.", "Response speed and honesty about what you do not know.", "A visible, easy route to a person.", "Privacy and AI disclosure. See [AI transparency and disclosure](/blog/ai-transparency-disclosure-building-trust)."),
      p("The assistant's own honesty is a trust signal. An assistant that says 'I do not know, but I can find out' earns more confidence than one that claims everything."),

      h2("Worked example: a renovation company"),
      p("A renovation company's assistant used to say 'we are the best builders in town' whenever asked. The owner replaced this with a proof document: a link to its 4.7 rating with the review count, three quoted reviews with the customers' consent, its trade licence number and a link to a gallery of finished projects. The assistant now answers 'are you any good?' with the rating, a link and an offer to book a site visit. Customer trust improved, a competitor's complaint about unsupported claims was avoided, and the company noticed that visitors clicked through to read reviews before booking. The change took an hour."),

      h2("A monthly proof review"),
      ul("Update ratings and review counts, with the date.", "Replace old quotes with recent ones, with permission.", "Check that links still work.", "Check credentials and licence details are current.", "Remove anything you can no longer support."),
      p("Fifteen minutes a month keeps your proof honest and your assistant trustworthy."),

      h2("Common mistakes"),
      ul("Letting the assistant claim to be the best.", "Quoting reviews that are old or out of context.", "Hiding negative reviews or arguing about them.", "Using unsupported statistics.", "Forgetting rules on testimonials in regulated professions."),

      h2("Keep it human"),
      p("Proof works best when it sounds like people. A short real line from a customer, the name of the person who did the job and a photo of the result say more than a list of superlatives. Let the assistant share these when they are relevant, and let a real person follow up when a visitor wants to talk to someone who has used you."),

      h2("Frequently asked questions"),
      faq(
        ["Can a chatbot show customer reviews?", "Yes, from content you provide and approve, ideally linking to the source. It should not invent or paraphrase reviews."],
        ["Should the assistant claim we are the best?", "No. Use verifiable facts: ratings, credentials, experience and links."],
        ["How do I handle a visitor asking about bad reviews?", "Be honest: share your overall rating and link to the source, and do not argue."],
        ["Is it legal to use testimonials in chat?", "Generally yes if they are genuine, current and comply with the rules that apply to you. Some professions restrict them."],
        ["How often should I update proof?", "Monthly for ratings and quotes, and whenever credentials change."],
        ["Can the assistant ask for a review?", "It can send a short, optional request after a visit if you configure it."],
      ),
      p("Try a trust question with your own proof document in the [playground](/playground), see the [AI assistant feature](/product/ai-assistant) and read [how to stop a chatbot from making things up](/blog/grounded-ai-chatbot-hallucinations)."),
    ],
  }),
];
