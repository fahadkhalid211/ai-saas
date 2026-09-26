import { faq, h2, h3, note, ol, p, pillar, table, ul } from '../authoring';

export const PILLAR2 = [
  pillar({
    slug: 'ai-appointment-booking',
    title: 'AI Appointment Booking: How Chatbots Book Real Appointments',
    description: 'How AI appointment booking works inside a website chat: real availability, slot locking, confirmations, reminders and rescheduling, and how to set it up without double bookings.',
    primaryKeyword: 'AI appointment booking',
    secondaryKeywords: ['AI appointment scheduling', 'chatbot appointment booking', 'online booking chatbot', 'automated appointment scheduling'],
    body: [
      p("AI appointment booking means a visitor can ask for a time in a chat, see real free slots from your calendar, choose one and receive a confirmation, without a phone call, a form or a back-and-forth by email. Done well, it captures the customers who would otherwise leave when nobody answers, and it takes the scheduling chore away from your team. Done badly, it double-books people, ignores your buffers and sends confusing confirmations."),
      p("This guide explains how AI appointment booking actually works, what a trustworthy system must do, how it differs from booking forms and calendar links, and how to set one up for a service business. It also covers reminders, rescheduling, deposits and the metrics that show whether it pays for itself."),

      h2("Why booking inside the chat converts better"),
      p("A visitor who has a question is at their most interested. The moment they get an answer is the moment to offer a time. If they must leave the conversation, find a booking page, fill in a form and wait for an email, a share of them will not finish. Putting availability into the chat removes those steps: the question, the answer and the booking happen in one place."),
      ul("**Speed:** the visitor sees open times immediately, instead of waiting for a reply.", "**Fewer steps:** no separate booking page to find or a form to learn.", "**Out-of-hours coverage:** the chat books at midnight as easily as at noon.", "**Natural language:** 'Thursday after 4' or 'next week, early' works, where a calendar grid can feel clumsy on a phone."),
      p("Our comparison of [conversational scheduling and booking forms](/blog/conversational-ai-scheduling-vs-forms) looks at where each format fits."),

      h2("How AI booking works, step by step"),
      ol("**The visitor expresses intent.** They ask about a service or say they want to book. The assistant recognises the intent from ordinary wording.", "**The assistant identifies the service.** It matches the request to a service on your list, which has a duration, price and rules.", "**It reads real availability.** The system checks your calendar, opening hours, holidays, staff, buffers and existing bookings to find genuinely free times.", "**It shows options.** A handful of suitable slots, not a wall of choices.", "**The visitor picks one and gives contact details.** Name and a way to reach them, and only what you need.", "**The slot is locked and confirmed.** The system reserves the time in one indivisible step so nobody else can take it.", "**Confirmations and reminders go out.** Email with a calendar file, and reminders before the appointment, so both sides remember."),
      p("Notice that the language model is not deciding availability. It handles the conversation. The availability, locking and confirmation are ordinary, deterministic software. That split is what makes AI booking reliable: flexible on the words, exact on the calendar."),

      h2("What a trustworthy booking system must get right"),
      h3("1. No double bookings"),
      p("Two visitors can click the same time in the same second. The system must let only one succeed, and offer the other the next time. Reliable systems check again at the moment of confirmation and lock the slot while the booking is saved, backed by a database rule that forbids two bookings in the same slot. This is explained in [how online booking avoids double bookings](/blog/double-booking-prevention-concurrency-mutex) and [how to stop double bookings online](/blog/stop-double-bookings-online)."),
      h3("2. Realistic durations and buffers"),
      p("A colour treatment is not thirty minutes, and a dental check-up needs cleaning time afterwards. Each service needs its own duration and its own buffer before and after. Without these, the calendar fills with times that cannot be honoured. See [service durations and buffer times](/blog/service-durations-buffer-times-ai-scheduling)."),
      h3("3. Correct handling of time zones and hours"),
      p("Opening hours, holidays and time zones must be respected, including daylight saving changes. A visitor in another time zone should see times in their own zone, with the confirmation stating both."),
      h3("4. Staff and resource awareness"),
      p("If different people or rooms provide different services, the system must know who can do what. A booking for the senior stylist should not land on the apprentice's calendar. See [multi-staff scheduling with a chatbot](/blog/multi-staff-scheduling-ai-chatbot)."),
      h3("5. Clear confirmations"),
      p("The visitor should receive an email with the date, time, place, service, price if relevant and how to change or cancel. A calendar file lets them add it in one click. See [automated booking confirmations](/blog/automated-booking-confirmations-ical)."),
      h3("6. A way to change or cancel"),
      p("Plans change. A frictionless way to reschedule keeps the booking instead of losing it. Read about [conversational rescheduling and cancellations](/blog/conversational-rescheduling-cancellations)."),

      h2("Calendar sync: where your availability comes from"),
      p("The assistant needs to know when you are actually free. There are three common ways."),
      table(["Method", "How it works", "Good for"], ["Built-in calendar", "You define working hours and services inside the product; bookings live there", "Businesses starting from scratch"], ["Google or Outlook sync", "The product reads your existing calendar and blocks busy times", "Anyone who already runs their day from a calendar"], ["Scheduling tools such as Calendly or Cal.com", "The assistant hands over to or reads from your existing scheduling tool", "Teams already invested in one of those tools"]),
      p("Crescelo's Growth plan includes appointment booking and calendar sync, including direct scheduling and support for Calendly and Cal.com. The details of setup are in [syncing AI booking with Google and Outlook Calendar](/blog/sync-ai-booking-google-outlook-calendar) and [configuring calendar sync and availability rules](/blog/configure-calendar-sync-availability-rules)."),

      h2("Reducing no-shows with reminders, deposits and easy changes"),
      p("A booked appointment that nobody attends costs you the slot and the revenue. Three tools reduce no-shows, and they work best together."),
      ul("**Reminders.** A confirmation immediately, a reminder a day before and another a few hours before. Compare channels in [SMS vs email reminders](/blog/sms-vs-email-appointment-reminders-conversions).", "**Deposits or card holds.** A small deposit changes behaviour for services with high no-show rates. Handle policy wording carefully; see [deposit collection and booking policies](/blog/deposit-collection-booking-policies-chat).", "**Easy rescheduling.** Many no-shows are simply people who could not find how to move the booking. A link in every message solves that."),
      p("For the full playbook, read [how to eliminate service no-shows](/blog/eliminate-service-no-shows-playbook)."),

      h2("Out-of-hours booking"),
      p("A large share of website visits happen when the office is closed, in the evening and at weekends. A chat that can only take a message loses some of them. One that can offer real morning slots and confirm them captures the visitor at the moment of interest. Our note on [after-hours appointment booking](/blog/after-hours-appointment-booking) covers the set-up and the wording that works."),

      h2("What AI booking costs and what to compare"),
      p("Pricing varies widely, from add-ons in scheduling tools to full assistants with booking built in. When you compare, look at what counts as a booking or a conversation, whether calendar sync is included, whether reminders cost extra and what the AI usage costs. With bring-your-own-key products, you pay the AI provider directly, so the platform price is mostly about features and volume. See the [pricing page](/pricing) for Crescelo's current plans, and [bring-your-own-key versus bundled AI pricing](/blog/byok-vs-bundled-ai-pricing-cost-comparison) for the model."),

      h2("How to set up AI booking for a service business"),
      ol("List your services with durations, prices and any preparation needed.", "Set opening hours, holidays and buffers.", "Add staff and which services each provides, if relevant.", "Connect your calendar and confirm it blocks busy times.", "Write the policies the assistant should state: cancellation window, deposits, lateness.", "Load them into the knowledge base so the assistant can answer questions about them.", "Test bookings as a customer would, including a time that is already taken and a change of mind.", "Watch the first fifty bookings closely and correct any pattern that goes wrong."),

      h2("Metrics that show it is working"),
      table(["Metric", "How to use it"], ["Booking conversion rate (bookings per chat session)", "The headline result; compare to your form or phone conversion"], ["Share of bookings made out of hours", "Shows demand you were missing"], ["No-show rate", "Should fall with reminders and deposits"], ["Reschedule rate", "High rates suggest slots are hard to fit or reminders work well"], ["Cost per booked appointment", "Platform and AI cost divided by bookings; see [cost per booked appointment](/blog/cost-per-booked-appointment-calculation)"]),

      h2("Common mistakes"),
      ul("Letting the AI decide availability instead of reading a real calendar.", "Skipping buffers, so back-to-back bookings become impossible.", "Not testing what happens when two people try the same slot.", "Hiding the way to change or cancel.", "Collecting more personal data than you need.", "Not telling visitors they are using an AI assistant."),

      h2("Try it on your own services"),
      p("You can see how a chat behaves on your own documents, without an account, in the [Crescelo playground](/playground), including a sample booking form. The [appointment booking feature page](/product/appointment-booking) explains what the full version does, and you can [start a free trial](/login?mode=register) to connect your calendar."),

      h2("A worked example: a two-chair salon"),
      p("A salon has two stylists. Cuts take 45 minutes, colour takes 2 hours plus 15 minutes of clean-up, and the salon opens 9 to 6 Tuesday to Saturday. Here is what the booking system has to do when a visitor types: 'Can I get a cut and colour on Friday afternoon?'"),
      ol("It recognises two services and adds their durations: 45 minutes plus 2 hours 15 minutes including the buffer, so a block of three hours.", "It looks for a single stylist with a free three-hour block on Friday between noon and 6, because one person should do both, and shows the two or three best options.", "The visitor picks 1:00 p.m. with the stylist of their choice. The system locks that block for both stylists' calendars as needed and confirms.", "A confirmation email arrives with the address, the two services, the total price and a link to change the booking.", "A reminder goes out the day before, and another three hours before."),
      p("Notice how many rules are invisible to the visitor: durations, buffers, working hours, which stylist, the lock. None of them are decided by the language model. They are settings you entered once. The assistant's job is to understand the request and present the result in plain language."),

      h2("What to write in your booking policies"),
      p("The assistant will state your policies, so write them clearly. Vague policies produce vague answers and arguments later."),
      ul("**Cancellation window:** for example, 'Free to change up to 24 hours before. Later changes may lose the deposit.'", "**Lateness:** how many minutes you wait, and what happens to the appointment length.", "**Deposits:** amount, when charged, when refunded.", "**Preparation:** what to bring, what to avoid, patch tests, fasting, forms to complete.", "**Who to contact** if something changes on the day."),
      p("Put these in a short document titled 'Booking policies' so the assistant finds them when someone asks 'can I cancel?' or 'what if I am late?'."),

      h2("Sample confirmation and reminder messages"),
      p("Clear messages reduce confusion and no-shows. Adapt these to your voice."),
      table(["Message", "Example wording"], ["Confirmation", "Hi Sam, you are booked for a cut and colour on Friday 12 June at 1:00 p.m. with Priya. It takes about 3 hours. Address: 14 High Street. You can change or cancel free of charge until Thursday 1:00 p.m. using this link."], ["Reminder, day before", "A reminder that your appointment is tomorrow at 1:00 p.m. Reply or use the link if you need to move it."], ["Reminder, same day", "See you at 1:00 p.m. today. Parking is behind the shop. Let us know if you are running late."], ["Follow-up", "Thanks for visiting. If you liked your visit, a review helps us a lot. Ready to rebook? Here is a link."]),

      h2("Handling awkward requests"),
      p("Real visitors do not follow scripts. Plan for these."),
      ul("**No availability that week:** the assistant should offer the next available times and a waiting list if you have one.", "**A visitor who wants a time outside your hours:** it should explain your hours and offer the nearest slot, not agree to something you cannot do.", "**A group booking:** either route to a person or use a dedicated service for groups. See [bridal party booking workflows](/blog/bridal-party-booking-workflows-salons) for one example.", "**A visitor who is not sure which service to book:** the assistant should ask two or three questions and recommend, or offer a consultation slot.", "**A request that includes medical or legal detail:** collect only what is needed and hand over where appropriate."),

      h2("Privacy and data: what to collect at booking"),
      p("Collect only what you need to deliver the appointment: name, a contact method, the service and the time. Avoid collecting health details, payment card numbers or identity documents in a chat. Tell visitors they are talking to an AI assistant and link to your privacy policy. If your business is regulated, take professional advice before you go live. This is general information, not legal advice."),

      h2("Frequently asked questions"),
      faq(
        ["Can an AI chatbot really book appointments?", "Yes. The chat shows real free slots from your calendar, the visitor picks one and the booking is confirmed by the booking system. The language model handles the conversation; the calendar logic is ordinary software."],
        ["How do chatbots avoid double bookings?", "By locking a slot at the moment of confirmation, checking availability again just before saving, and using a database rule that stops two bookings in the same slot."],
        ["Does it work with Google Calendar or Outlook?", "Good products sync with them so busy times are blocked automatically. Crescelo's Growth plan includes calendar sync and support for Calendly and Cal.com."],
        ["Can visitors reschedule or cancel in the chat?", "Yes, in products that support it. Every confirmation should include a simple way to change or cancel."],
        ["Is AI appointment booking suitable for medical or legal practices?", "It can be, with care. Avoid collecting sensitive details in the chat, follow your privacy rules and route urgent or clinical questions to a person. This is general information, not legal advice."],
        ["How much does it cost?", "It depends on the product. Expect a monthly subscription plus AI usage. Compare what counts as a booking, whether reminders and calendar sync are included and what happens above your plan limits."],
        ["How long does setup take?", "A simple service business can be live in an afternoon: add services and hours, connect the calendar, test bookings and paste one snippet on the website."],
      ),
    ],
  }),

  pillar({
    slug: 'ai-receptionist-vs-answering-service',
    title: 'AI Receptionist vs Answering Service: Cost, Quality and Which to Choose',
    description: 'Compare an AI receptionist with a live answering service on cost, coverage, quality, booking and privacy, and see which suits a small service business.',
    primaryKeyword: 'AI receptionist vs answering service',
    secondaryKeywords: ['AI receptionist', 'answering service vs AI', 'virtual receptionist vs AI', 'AI receptionist for small business'],
    clusterId: 5,
    clusterName: 'AI Receptionists',
    funnel: 'BOFU',
    tags: ['Comparison', 'Small business', 'AI Receptionists'],
    related: ['add-ai-chatbot-to-your-website', 'stop-double-bookings-online'],
    body: [
      p("If your business misses calls and messages when the team is busy or closed, you have three broad options: a live answering service staffed by people, an AI receptionist, or a mix of the two. They solve overlapping problems with different strengths, costs and risks. This guide compares them honestly so you can choose without paying for the wrong thing."),
      p("We build an AI website assistant, so we have a view, and we say where it fits and where it does not. One point to be clear about early: the AI options differ by channel. Many products answer the phone; others, including Crescelo today, answer visitors in a website chat and messaging apps. Phone answering at Crescelo is under development and listed on the [roadmap](/roadmap). Everything below compares the approaches, and we note where channel matters."),

      h2("What each option is"),
      h3("A live answering service"),
      p("A company employs receptionists who answer calls on behalf of many clients. They use a script you provide, take messages, transfer urgent calls and sometimes book appointments. You pay a monthly fee, often with per-minute or per-call charges."),
      h3("An AI receptionist"),
      p("Software that answers enquiries in natural language, from your documents, and can take actions such as booking, capturing details and notifying you. Depending on the product, it works over voice, web chat or messaging apps. See [what an AI website assistant is](/blog/ai-website-assistant) for the web-chat version."),
      h3("A human front desk"),
      p("Your own employee. The comparison with an AI is covered in [AI receptionist vs human front desk](/blog/ai-receptionist-vs-human-front-desk)."),

      h2("Side-by-side comparison"),
      table(["", "Live answering service", "AI receptionist"], ["Availability", "Often 24/7, but quality varies by hour", "24/7 and consistent"], ["Cost pattern", "Monthly fee plus per-minute or per-call charges that grow with volume", "Monthly subscription plus small AI usage; cost grows slowly with volume"], ["Answering speed", "Seconds to minutes, depending on queue", "Immediate"], ["Product knowledge", "Limited to your script; agents serve many clients", "Reads your full documents, as long as they are accurate"], ["Judgement and empathy", "Human, good with upset or unusual callers", "Limited; should hand over sensitive cases"], ["Booking", "Sometimes; often takes messages instead", "Yes, with live calendar in booking-enabled products"], ["Consistency", "Varies by agent and shift", "Same every time"], ["Languages", "Depends on the service", "Many, depending on the model"], ["Setup", "Script and call routing; days to weeks", "Content and testing; hours to days"], ["Records", "Message summaries", "Full conversation transcripts"]),

      h2("Cost: the numbers that matter"),
      p("Answering services usually charge a base fee that includes a set number of minutes or calls, then extra for more. A quiet month and a busy month are billed differently. AI receptionists usually charge a subscription with a number of conversations included, and the AI usage adds a small amount per conversation. Rather than trust general figures, calculate your own."),
      ol("Count how many enquiries you receive per month across phone, chat and email.", "Ask each provider for the total price at that volume and at double it.", "Add hidden costs: setup fees, per-minute overage, extra languages, booking add-ons.", "Estimate the value of the enquiries you currently miss."),
      p("Our [ROI calculation for an AI website assistant](/blog/ai-website-assistant-roi-calculator) gives a simple way to compare the monthly cost with the value of a few extra bookings. For Crescelo's plans see the [pricing page](/pricing)."),

      h2("Quality: where each one wins"),
      h3("Where a human answering service wins"),
      ul("Upset or distressed callers who need warmth and judgement.", "Unusual situations that nobody wrote a rule for.", "Businesses whose customers strongly prefer to speak to a person.", "Businesses where the phone is the main channel and voice AI is not yet an option."),
      h3("Where an AI receptionist wins"),
      ul("Repetitive questions about prices, hours, services and policies.", "Consistency: the same accurate answer every time.", "Instant response at any hour, with no queue.", "Booking directly into a live calendar.", "Capturing details in a structured way and sending them to your systems.", "Full records and analytics of what customers ask."),

      h2("Risk: what can go wrong with each"),
      table(["Risk", "Answering service", "AI receptionist"], ["Wrong information", "Agent misreads your script", "Model guesses if not grounded in your documents"], ["Missed nuance", "Agent unfamiliar with your business", "Model misses tone or an emergency"], ["Privacy", "Agents hear customer details", "Data stored and processed by the vendor and its sub-processors"], ["Consistency", "Varies by agent", "High"], ["Cost surprises", "Overage charges", "Usage above plan limits"]),
      p("The AI's biggest risk, inventing an answer, is manageable. A grounded assistant answers only from your documents and says it does not know when they do not cover the question. See [how to stop a chatbot from making things up](/blog/grounded-ai-chatbot-hallucinations). Emergencies need a rule: certain words or topics should always hand over to a person; read [handling emergencies in automated chat](/blog/handling-emergencies-automated-chat)."),

      h2("The best answer for many businesses: AI first, human for the hard cases"),
      p("You do not need to choose one. A common setup uses the AI for the everyday first layer and keeps people for what needs them."),
      ol("The AI answers common questions and books standard appointments at any hour.", "Rules hand over emergencies, complaints, and anything about money or safety to a person, with the conversation attached.", "Your team follows up on leads the AI captured, in the morning, with full context.", "You review conversations weekly and improve the content."),
      p("Crescelo supports this: visitors can ask for a person at any time, your team is notified and the whole conversation is attached. See [live human handover flow design](/blog/live-human-handover-flow-design) and the [human handover feature](/product/human-handover)."),

      h2("How to choose: a decision guide"),
      table(["If this is you", "Lean toward"], ["Most enquiries arrive by phone and customers expect a human voice", "A live answering service, possibly with an AI phone product when it meets your bar"], ["Most enquiries arrive through your website and social channels", "An AI web-chat assistant"], ["You want bookings made without back-and-forth", "An AI assistant with live calendar booking"], ["Your calls are emotionally sensitive (crisis, bereavement, complaints)", "People, with AI limited to simple admin"], ["You are very cost-sensitive at high volume", "AI, with humans for escalations"], ["You need multiple languages without hiring", "AI, after testing the languages you need"]),

      h2("Questions to ask any provider"),
      ul("What exactly happens when it does not know or cannot help?", "Can I hear or read real examples from businesses like mine?", "How are urgent and emergency cases handled?", "How are bookings protected from double booking?", "What is stored about my customers, for how long, and can I delete it?", "What is the total price at my volume and at double it?", "What is the contract term and how do I leave?"),

      h2("Privacy and compliance"),
      p("Both options handle personal information about your customers. Whichever you choose, tell customers who they are talking to, keep only what you need, and understand where data goes. If you serve people in Europe or California, see the [GDPR checklist for website chatbots](/blog/website-chatbot-gdpr-checklist). For health or legal contexts, take professional advice; this article is general information, not legal advice."),

      h2("Try before you decide"),
      p("Test an AI assistant on your own content in the [playground](/playground) without signing up, and read [how an AI website assistant works](/blog/ai-website-assistant). If you would like a person to take over when needed, look at the [human handover feature](/product/human-handover). Then [start a free trial](/login?mode=register) to run it against real visitors."),

      h2("A worked cost comparison"),
      p("Numbers vary by provider and country, so use this as a method rather than a price list. Imagine a clinic that receives 300 enquiries a month, evenly spread between phone and website, and wants coverage outside office hours."),
      table(["Line", "Live answering service", "AI receptionist for web chat", "Both"], ["Base fee", "A monthly plan with included minutes", "A monthly subscription with included conversations", "Both fees"], ["Volume charges", "Extra minutes or calls above the allowance", "Extra sessions above the allowance", "Usually lower on each, because the AI takes the routine load"], ["Setup", "Script, call routing, possibly setup fee", "Documents and testing", "Both"], ["What you get", "Calls answered by a person, messages taken", "Instant answers and bookings from the website", "Coverage on phone and web"], ["What you must still do", "Follow up on messages", "Review conversations weekly", "Both"]),
      p("Ask each provider to quote the total at 300 enquiries and at 600, and write down the answer. The second number is the one that surprises people. Then estimate the value of the enquiries you currently miss: how many, and what an average booking is worth. If even a handful of extra bookings a month covers the cost, the decision is easier."),

      h2("Scripts versus knowledge"),
      p("A live answering service works from a script: greetings, questions to ask, who to call for what. It can be very good for taking messages and passing on urgent calls. It is less suited to detailed product or price questions, because the agent serves many clients and does not know yours as you do. An AI receptionist works from knowledge: it reads your whole document set. That makes it stronger on detail, and weaker on empathy. The best setup uses each for its strength."),

      h2("What a good handover looks like"),
      p("Whichever option you choose, the handover to a person decides how customers feel about the experience."),
      ol("The customer never has to repeat their request; the person sees the conversation or a summary.", "The customer knows what will happen next and when: 'Someone will call you within the hour.'", "Urgent items reach a phone that will be answered, not an inbox that will be read tomorrow.", "The response is logged, so nothing is dropped between systems."),

      h2("A five-question test before you sign anything"),
      ul("Ask for a trial period or a month-to-month plan, and avoid long contracts before you have seen real results.", "Call or chat as a customer with an awkward question and see how it goes.", "Ask what happens in an outage and how you will be told.", "Ask how your customers' data is protected and where it is stored.", "Ask for the exit process: how you get your data and how long the notice period is."),

      h2("Frequently asked questions"),
      faq(
        ["Is an AI receptionist cheaper than an answering service?", "Often, especially as volume grows, because AI usage costs little per conversation while answering services charge by minute or call. Compare the total price at your own volume and at double it."],
        ["Can an AI receptionist replace a human completely?", "For repetitive questions and standard bookings it can handle most of the work. Sensitive, urgent or unusual cases should still go to a person."],
        ["Does an AI receptionist answer phone calls?", "Some products do. Crescelo currently answers visitors in website chat and messaging apps; phone answering is under development and listed on the roadmap."],
        ["Will an AI receptionist make mistakes?", "It can. A grounded assistant that answers only from your documents and admits when it does not know reduces mistakes. Test it with questions your content does not cover."],
        ["What about emergencies?", "Set rules so emergency wording always hands over to a person immediately, and tell visitors what to do in urgent situations."],
        ["Can I use both an AI and a live answering service?", "Yes. Use the AI for routine questions and booking, and a human service or your own team for escalations and calls."],
      ),
    ],
  }),

  pillar({
    slug: 'virtual-ai-receptionist',
    title: 'Virtual AI Receptionist: What It Is, What It Does and What It Costs',
    description: 'What a virtual AI receptionist is, how it answers and books for a small business, what it costs, where it fails and how to set one up without losing the human touch.',
    primaryKeyword: 'virtual AI receptionist',
    secondaryKeywords: ['AI receptionist for small business', 'virtual receptionist AI', 'AI front desk', 'automated receptionist'],
    body: [
      p("A virtual AI receptionist is software that does the first-line work of a front desk: greeting visitors, answering common questions, capturing contact details and booking appointments. It does not sit at a desk or take a lunch break, and it answers instantly at any hour. For a small business where the owner or a single team member also does everything else, that first layer is often what gets neglected, and where enquiries are lost."),
      p("This guide explains what a virtual AI receptionist actually does, how it differs from older tools, what to prepare, what it costs and how to keep the human touch. It covers the web-chat version, which is where Crescelo works today; phone answering is a separate channel that is under development at Crescelo, and we say where that matters."),

      h2("What a virtual AI receptionist does"),
      ul("**Greets and orients:** welcomes visitors and states what it can help with.", "**Answers questions** about services, prices, hours, location and policies from your documents.", "**Qualifies enquiries** by asking the questions you would ask, such as which service, when and where.", "**Books and reschedules appointments** into your calendar.", "**Captures leads** and sends them to your email, spreadsheet, Slack or other tools.", "**Escalates to a person** when a case needs one, with the conversation attached.", "**Records everything,** so you can see what customers ask and where the gaps are."),
      p("It is a receptionist for the routine layer. The judgement calls and the relationships still belong to your team."),

      h2("How it differs from the alternatives"),
      table(["Option", "Strength", "Limit"], ["Voicemail or contact form", "Cheap and simple", "No answer, no booking, long wait for a reply"], ["Live answering service", "Human voice at any hour", "Costly at volume, limited product knowledge; see [comparison](/blog/ai-receptionist-vs-answering-service)"], ["Human front desk", "Judgement and warmth", "Only available in working hours and expensive to staff; see [comparison](/blog/ai-receptionist-vs-human-front-desk)"], ["Rule-based chatbot", "Predictable", "Breaks on unexpected wording; see [rule-based vs AI](/blog/rule-based-vs-ai-chatbots)"], ["Virtual AI receptionist", "Instant, consistent, books and captures", "Needs accurate content and human backup for hard cases"]),

      h2("How it works underneath"),
      p("A virtual AI receptionist combines four parts. A knowledge base holds your documents. A retrieval step finds the passages that relate to a question. A language model writes the reply from those passages under instructions to answer only from them. And an action layer books appointments, records leads and notifies people. The action layer is ordinary software, which is why bookings can be exact even though the conversation is flexible. The mechanics are explained in [what an AI website assistant is](/blog/ai-website-assistant)."),

      h2("Training it on your business"),
      p("There is no training in the machine-learning sense. You load your content and tell it how to behave. The quality of the result depends on three things."),
      ol("**Your service catalog:** clear names, prices, durations and what is included. See [training an AI receptionist on your service catalog](/blog/train-ai-receptionist-service-catalog).", "**Your policies:** cancellation, deposits, lateness, emergencies, refunds.", "**Your voice:** how formal, how friendly, what to avoid saying. See [brand voice alignment for an AI receptionist](/blog/brand-voice-alignment-ai-receptionist)."),
      p("Test with the questions customers really ask, in different words and with typos, and fix each failure by improving the source content."),

      h2("Business hours, holidays and locations"),
      p("A receptionist that offers a 9 a.m. slot on a public holiday, or quotes the wrong branch's address, damages trust. Set your opening hours and holidays where the assistant can read them, and give each location its own information if you have more than one. See [business hours logic for AI chat](/blog/business-hours-logic-ai-chat) and [multi-location AI receptionists](/blog/multi-location-ai-receptionist)."),

      h2("Where a virtual receptionist should hand over"),
      p("The best receptionists know their limits. Build clear rules for handing over to a person: complaints, requests for medical, legal or financial advice, urgent or emergency wording, anything involving a refund or dispute, and any visitor who asks for a person. The conversation should go with the handover so nobody has to repeat themselves. See [live human handover flow design](/blog/live-human-handover-flow-design) and [handling emergencies in automated chat](/blog/handling-emergencies-automated-chat)."),

      h2("What it costs"),
      table(["Item", "Typical pattern"], ["Platform subscription", "Monthly fee scaled by number of conversations, assistants and storage"], ["AI usage", "Small cost per conversation, either bundled or paid directly to your AI provider"], ["Setup", "Your time to gather content and test"], ["Extras", "Calendar sync, channels such as WhatsApp, extra assistants, team seats"]),
      p("Crescelo's plans start at $49 a month for one assistant with 100 chat sessions, and Growth at $149 adds booking, calendar sync and white-label options. See the [pricing page](/pricing). The important comparison is against what missing an enquiry costs you; see the [ROI calculator guide](/blog/ai-website-assistant-roi-calculator)."),

      h2("Protecting your front desk team"),
      p("A common worry is that an AI receptionist replaces people. In practice it tends to remove the repetitive load that causes burnout, so staff spend their time on the conversations that need them. Front desks that are constantly interrupted make mistakes and lose patience. Our piece on [preventing front desk burnout with AI](/blog/prevent-front-desk-burnout-ai) explores this. Be open with your team about what the assistant will and will not do."),

      h2("Voice: web chat today, phone later"),
      p("Customers reach businesses by phone, web chat and messaging apps. Crescelo's assistant works in website chat and, on higher plans, WhatsApp and Telegram. Answering phone calls is under development and shown as planned on the [roadmap](/roadmap), so we do not sell it as available. If your customers overwhelmingly call, consider an answering service or phone AI product for the phone today, and use web chat for your website. Our comparison of [voice AI and web chat receptionists](/blog/voice-ai-vs-web-chat-receptionist) explains the trade-offs."),

      h2("Setting one up: a one-afternoon plan"),
      ol("Gather your services, prices, hours and policies into short documents.", "Create the assistant and load the documents.", "Set the greeting and tone.", "Add your calendar and services if you want bookings.", "Test twenty questions, including three the content cannot answer.", "Set handover rules and notification emails.", "Publish the snippet on your site.", "Review the first week of conversations and fix gaps."),
      p("You can rehearse steps 2 to 5 with no account in the [playground](/playground)."),

      h2("Objections you will hear, and honest answers"),
      ul("**'Customers hate talking to bots.'** They hate bots that trap them. They tend to accept an assistant that answers quickly, is clear that it is an AI and lets them reach a person in one step.", "**'It will say something wrong.'** It can, which is why grounding, testing and weekly review matter. Treat the knowledge base like a page on your website: accurate, dated and reviewed.", "**'We are too small.'** Small businesses gain the most, because the person answering enquiries is usually the owner, and every interruption costs billable time.", "**'It sounds robotic.'** Tone is a setting. Give it three sample replies in your own voice and it will follow them.", "**'What if it books the wrong thing?'** Confirmations state the service, time and price, and every booking can be changed or cancelled. Review the first fifty bookings."),

      h2("Common mistakes"),
      ul("Leaving out-of-date prices in the documents.", "Letting the assistant answer medical, legal or financial questions.", "Not telling visitors it is an AI.", "Hiding the option to talk to a person.", "Measuring success by conversation volume instead of bookings and leads.", "Never reviewing transcripts."),

      h2("A day in the life: what it handles"),
      p("To make this concrete, here is how a virtual AI receptionist might spend a normal day for a physiotherapy clinic that is closed on Sundays."),
      table(["Time", "What happens", "What the receptionist does"], ["Sunday 9 p.m.", "A visitor asks whether the clinic treats sports injuries and how much a first session costs", "Answers from the services page and price list and offers Monday morning slots"], ["Sunday 9:10 p.m.", "The visitor picks Monday 10:30 and gives a name and mobile number", "Books, confirms by email and schedules a reminder"], ["Monday 8 a.m.", "Someone asks whether they need a referral", "Answers from the policy document, or says it does not know and offers a message to the team"], ["Monday 12 p.m.", "A patient wants to move a Thursday appointment", "Offers alternative times and updates the booking"], ["Monday 3 p.m.", "A visitor writes that they have severe pain and cannot move", "Recognises urgency, tells them how to seek urgent care and alerts the team immediately"], ["Monday 5 p.m.", "The team reads the day's conversations", "Finds three questions it could not answer and adds the answers to the knowledge base"]),
      p("Notice the last row. The receptionist improves every day because someone reads what customers asked. Without that review, the assistant stays as good as it was on day one."),

      h2("Measuring the result"),
      p("Pick a few numbers before launch and compare them after a month."),
      ul("**Enquiries answered within a minute,** compared with your previous response time.", "**Bookings from the website,** and how many were made outside office hours.", "**Missed or abandoned enquiries,** where visitors asked something and left without an answer.", "**Time your team spends on repetitive questions,** estimated before and after.", "**Handover requests and their causes,** which show what to add to the knowledge base or what genuinely needs a person."),
      p("If the numbers do not improve, the cause is usually content: missing answers, unclear prices, or no booking option. It is rarely the technology. See [how to review your chatbot conversations each week](/blog/audit-website-chatbot-conversations)."),

      h2("Questions to ask before you choose"),
      ol("Does it answer only from my documents, and does it say when it does not know?", "Can it book into my real calendar and prevent double bookings?", "How do I take over a conversation, and will I be notified?", "What does it cost at three times my volume?", "Where is my data stored, and can I delete it?", "Which channels does it cover today, and which are only planned?"),

      h2("Frequently asked questions"),
      faq(
        ["What is a virtual AI receptionist?", "It is software that handles the first layer of a front desk: answering common questions, capturing leads and booking appointments, at any hour, from your own content."],
        ["Can it book appointments?", "Yes, in products with booking. It shows real free slots from your calendar and confirms them, with protection against double booking."],
        ["Will it replace my receptionist?", "It usually takes over repetitive questions and after-hours enquiries, so your team can focus on people who need them. Judgement calls should stay with humans."],
        ["How much does a virtual AI receptionist cost?", "Expect a monthly subscription, from tens to a few hundred dollars for small businesses, plus AI usage. Compare the total against the value of the enquiries you would otherwise miss."],
        ["Does it answer phone calls?", "Some products do. Crescelo answers in website chat and messaging apps today; phone answering is under development."],
        ["Is it safe to give it customer information?", "Check the vendor's privacy policy and sub-processors, tell visitors they are talking to an AI, and collect only what you need."],
      ),
    ],
  }),

  pillar({
    slug: 'ai-receptionist-vs-human-front-desk',
    title: 'AI Receptionist vs Human Front Desk: Cost, Coverage and Quality',
    description: 'A fair comparison of an AI receptionist and a human front desk: cost, coverage, quality, booking and risk, plus how to combine them for the best result.',
    primaryKeyword: 'AI receptionist vs human receptionist',
    secondaryKeywords: ['AI vs human receptionist', 'front desk automation', 'AI receptionist cost', 'replace receptionist with AI'],
    body: [
      p("Should a small business hire a receptionist, use an AI receptionist, or do both? The honest answer is that they are good at different things, and the right mix depends on your volume, your customers and the kind of conversations you have. This guide compares them on cost, coverage, quality and risk, and shows how many businesses combine them so each does what it does best."),
      p("Note on scope: Crescelo's assistant works in website chat and messaging apps today. Phone answering is under development and listed on the [roadmap](/roadmap). Where the comparison depends on voice, we say so."),

      h2("The real cost of a human front desk"),
      p("A salary is only part of the cost. Include employer taxes and benefits, training, holidays and sick cover, equipment, and the management time you spend. Then look at coverage: one person covers one shift. If your business has evening and weekend demand, you either pay for more people or accept that enquiries go unanswered outside those hours. Add the hidden cost of interruptions: a front desk that is also checking people in, taking payments and handling walk-ins cannot always answer the phone or chat on the first attempt."),
      table(["Cost item", "Human front desk", "AI receptionist"], ["Direct cost", "Salary or hourly wage plus employer costs", "Monthly subscription plus small AI usage"], ["Coverage", "The hours you staff", "All hours"], ["Cover for absence", "You must arrange it", "Not needed"], ["Training", "Days to weeks, repeated when staff change", "Content loaded once, then updated as things change"], ["Scaling with volume", "Add people", "Cost rises slowly"], ["Judgement", "High", "Limited"]),
      p("For Crescelo's current plan prices see the [pricing page](/pricing). A framework for comparing cost with value is in the [ROI calculation guide](/blog/ai-website-assistant-roi-calculator)."),

      h2("Coverage: the hours you cannot staff"),
      p("Think about when your customers are online. Many people research services in the evening or on weekends, when a small business is closed. An enquiry that gets an instant answer and a booking option is often won; one that waits until Monday morning is often lost, because the customer has already moved on. An AI receptionist covers those hours without additional wages. Read more in [after-hours appointment booking](/blog/after-hours-appointment-booking)."),

      h2("Quality: what humans do better"),
      ul("**Reading emotion.** A distressed or angry customer needs warmth and judgement.", "**Handling the truly unusual.** A situation nobody wrote a rule for.", "**Building relationships.** Regulars value being recognised.", "**Physical presence.** Greeting people who walk in, handling payments, tidying the waiting area.", "**Making exceptions sensibly.** A discretion call within your policy."),

      h2("Quality: what an AI receptionist does better"),
      ul("**Consistency.** The same accurate answer every time, however busy the day.", "**Speed.** Instant replies, with no queue.", "**Memory of the details.** It reads your whole price list and policy set without forgetting.", "**Availability.** 24 hours a day, every day.", "**Structured capture.** Every enquiry recorded with the same fields.", "**Patience.** It does not tire of the fortieth question about parking.", "**Language range.** Many languages, subject to testing."),

      h2("Risk and how to manage it"),
      table(["Risk", "Human front desk", "AI receptionist", "How to manage"], ["Wrong answer", "Misremembers a price", "Guesses if ungrounded", "Ground the AI in documents and test unanswerable questions"], ["Missed emergency", "Distracted", "Misses subtle wording", "Emergency rules and clear handover"], ["Privacy", "Overhears or mishandles data", "Data held by vendor", "Choose vendors carefully; tell visitors; collect little"], ["Absence", "Sickness or resignation", "Outage", "Backup plans for both"], ["Inconsistency", "Varies by person and day", "Low", "Train, document and review"]),
      p("The main AI-specific risk, an invented answer, is reduced by grounding the assistant in your documents and by testing what it does when it does not know. See [how to stop a chatbot from making things up](/blog/grounded-ai-chatbot-hallucinations)."),

      h2("The combination that works for most businesses"),
      ol("The AI answers routine questions and books standard appointments at any hour.", "Your receptionist is freed from repetitive questions and works with people who need attention.", "Handover rules pass complaints, emergencies and money questions to a person, with the conversation attached.", "Your receptionist reviews the AI's transcripts and improves the knowledge base, which makes the whole front desk better."),
      p("This changes the job rather than removing it. The receptionist becomes the owner of the customer experience, using the AI as a tool. Our note on [preventing front desk burnout with AI](/blog/prevent-front-desk-burnout-ai) describes the effect on staff."),

      h2("Handover done properly"),
      p("The moment a conversation moves from AI to a person is where trust is won or lost. It should be easy to ask for a person, the person should see the whole conversation, and the customer should not have to repeat anything. See [live human handover flow design](/blog/live-human-handover-flow-design) and the [handover feature page](/product/human-handover)."),

      h2("A simple break-even calculation"),
      p("You do not need precise figures to see whether an AI receptionist is worth adding. Use your own numbers in this four-step sum."),
      ol("Estimate how many enquiries per month arrive when nobody can answer quickly, for example 40.", "Estimate what share would have booked if answered at once. Be cautious: 10 to 20 percent is a reasonable starting guess for enquiries about services you actually offer.", "Multiply by the value of an average booking. If 40 enquiries and 15 percent gives 6 bookings at $80 each, that is $480 a month.", "Compare with the monthly cost of the assistant. If the plan costs less than the extra bookings it recovers, it pays for itself before counting the staff time saved."),
      p("The figures above are an illustration, not a forecast. Replace each with your own, and check them after a month using real bookings. If the sum does not work for your business, do not buy it; if it works with cautious numbers, the decision is easy. The same method is explained in [the ROI guide](/blog/ai-website-assistant-roi-calculator)."),

      h2("Signs your front desk is overloaded"),
      ul("Calls go to voicemail during busy periods and nobody calls back the same day.", "Website messages wait until the next working day.", "Staff answer the same five questions dozens of times a week.", "Check-in queues form while someone is on the phone.", "Booking errors creep in because people are rushed.", "Your best staff spend their time on admin instead of customers."),
      p("If three or more of these are true, the routine layer is costing you more than it should, and automating it is likely to pay back. If none are true, you may not need an AI receptionist yet."),

      h2("When to keep a human-only front desk"),
      ul("Your customers are mainly walk-in and the front desk is about hospitality.", "Your enquiries are few and high-value, each deserving personal attention.", "Your conversations are emotionally sensitive by nature.", "You are not able to keep the AI's content accurate."),

      h2("When to add an AI receptionist"),
      ul("Enquiries arrive out of hours, or in bursts that overwhelm the team.", "Most questions are repetitive: prices, hours, services, availability.", "You lose bookings when nobody answers quickly.", "Your team is spending its day on interruptions.", "You want structured records of what customers ask."),

      h2("How to start safely"),
      ol("Run the AI alongside your team for a few weeks, with handover switched on.", "Read every transcript in the first week and correct gaps.", "Compare bookings and leads before and after.", "Adjust the rules: what the AI should always hand over and what it may decide.", "Involve your front desk team in reviewing it, so it reflects how they work."),
      p("Try the assistant on your own documents in the [playground](/playground) and read how the [AI assistant feature](/product/ai-assistant) works. When you are ready, [start a free trial](/login?mode=register)."),

      h2("A worked example: a three-practitioner clinic"),
      p("Consider a small clinic with three practitioners, one part-time receptionist working 9 to 3 and about 400 enquiries a month. Roughly a third arrive outside those hours. The receptionist spends much of her day answering the same twenty questions while also checking people in and taking payments."),
      table(["Before", "After adding an AI receptionist"], ["Out-of-hours enquiries wait until the next morning", "They are answered instantly, and many convert into bookings"], ["The receptionist answers the same questions repeatedly", "The AI handles routine ones; she focuses on patients in the building"], ["Phone rings during check-in and gets missed", "Fewer calls arrive because the website answers first"], ["No record of what people asked", "Transcripts show what to improve on the website and in the documents"], ["Cover needed for holidays", "The AI covers the routine layer while she is away"]),
      p("This is a mixed setup rather than a replacement, and it is the one most businesses end up with."),

      h2("What to tell your team"),
      p("Introducing an AI to a front desk can worry the people who work there. Be direct: explain which tasks it takes over, which stay with them, and how you will judge the result. Involve them in reviewing conversations, because they know which answers are right and which sound off. Staff who own the assistant's quality tend to see it as a tool; staff who feel it was imposed tend to see it as a threat."),

      h2("Checklist for the first 30 days"),
      ol("Week 1: run the AI with handover on; read every conversation daily.", "Week 2: fix the top ten gaps; adjust the greeting and tone.", "Week 3: compare bookings and response times with the previous month.", "Week 4: decide which conversations to let the AI complete alone and which always hand over."),
      ul("Keep a list of things the AI got wrong and what you changed.", "Keep a list of things customers liked, so you can build on them.", "Confirm that urgent handovers reach someone who will act on them."),

      h2("Frequently asked questions"),
      faq(
        ["Is an AI receptionist cheaper than a human?", "For covering routine questions and out-of-hours enquiries, usually yes, because a subscription costs much less than wages and covers all hours. It does not replace the judgement and hospitality a person provides."],
        ["Can an AI receptionist fully replace a human?", "Not in most businesses. It replaces the repetitive first layer. People remain important for sensitive, unusual and in-person work."],
        ["What happens when the AI cannot help?", "A well-configured assistant says so and offers a booking form or a handover to a person, with the conversation attached."],
        ["Will customers accept talking to an AI?", "Most accept it when it is fast, honest about being an AI and gives an easy way to reach a person."],
        ["How do I keep the AI accurate?", "Keep the documents current, review transcripts weekly and fix the gaps you find."],
        ["Does it work by phone?", "Some products do. Crescelo works in website chat and messaging apps today, and phone answering is under development."],
      ),
    ],
  }),

  pillar({
    slug: 'website-chatbot-platform-comparison',
    title: 'Best AI Chatbot for Your Website: How to Compare Platforms in 2026',
    description: 'How to compare AI chatbot platforms for a service business: answers, booking, pricing models, integrations, security and support, with a scorecard you can copy.',
    primaryKeyword: 'best AI chatbot for website',
    secondaryKeywords: ['AI chatbot platform comparison', 'website chatbot comparison', 'best chatbot for small business', 'compare AI chatbot software'],
    body: [
      p("Searching for the best AI chatbot for your website returns dozens of products with similar promises. Feature lists look alike, demos always work, and pricing pages are built to be hard to compare. This guide gives you a method to compare platforms fairly for a service business, a scorecard you can copy, and the questions that expose weak products quickly. It does not crown a single winner, because the best choice depends on your business, and it is honest about where our own product, Crescelo, fits."),

      h2("Start with what you need, not the feature list"),
      p("Before opening any product page, write down your job to be done. Different jobs need different tools."),
      table(["If your main need is", "Look for", "Be careful about"], ["Answering common questions from your documents", "Strong grounding, source visibility, admits when it does not know", "Products that answer from general knowledge"], ["Booking appointments", "Live calendar, slot locking, buffers, reminders, rescheduling", "Chatbots that only collect a request and leave you to schedule"], ["Capturing leads", "Structured capture, instant alerts, CRM and webhook delivery", "Leads trapped in the vendor's dashboard"], ["Customer support with ticketing", "Handover, inbox, integrations with a help desk", "Bots with no way for a person to step in"], ["Multi-channel presence", "Website plus WhatsApp and Telegram in one inbox", "Separate products per channel"]),

      h2("The eight things to compare"),
      h3("1. Answer quality and grounding"),
      p("This matters most. Load the same documents into each product and ask the same twenty questions, including three the documents cannot answer. Note which products admit ignorance and which invent something. Check whether you can see the source behind an answer. See [how to stop a chatbot from making things up](/blog/grounded-ai-chatbot-hallucinations)."),
      h3("2. Booking and calendar"),
      p("If you book appointments, test a real booking, a time that is already taken and a reschedule. Ask how double bookings are prevented, how buffers and durations work and which calendars sync. Our guide to [AI appointment booking](/blog/ai-appointment-booking) lists what a trustworthy system must do."),
      h3("3. Pricing model"),
      p("There are three common models: a flat subscription with a conversation allowance, per-conversation or per-resolution pricing, and platform fees plus AI usage. Each behaves differently as you grow. Ask for the total price at your current volume and at three times that, including overage. Bring-your-own-key products let you pay the AI provider directly, which makes the AI cost visible; see [bring-your-own-key versus bundled pricing](/blog/byok-vs-bundled-ai-pricing-cost-comparison)."),
      h3("4. Integrations"),
      p("Check the tools you already use: calendars, email, Slack, spreadsheets, CRM, WhatsApp and automation tools such as Zapier or Make. Ask whether integrations are included in your plan or cost extra. See [webhook automations with Zapier and Make](/blog/webhook-automations-zapier-make-chat-events) and [CRM integration](/blog/crm-integration-ai-chatbot-leads)."),
      h3("5. Handover to a person"),
      p("You need to step into a conversation. Check for notifications, an inbox, history and the ability to reply as a person. See [live human handover flow design](/blog/live-human-handover-flow-design)."),
      h3("6. Security and privacy"),
      p("Ask where data is stored, who the sub-processors are, how long conversations are kept, whether you can delete them, whether API keys are encrypted and whether the account supports two-factor authentication and roles. If you serve Europe or California, read the [GDPR checklist for website chatbots](/blog/website-chatbot-gdpr-checklist)."),
      h3("7. Performance and accessibility"),
      p("Check that the widget loads without slowing your page and works with a keyboard and screen reader. See [performance of embedded chat widgets](/blog/performance-optimization-embedded-chat-widgets) and [chatbot accessibility](/blog/accessibility-wcag-compliance-website-chatbots)."),
      h3("8. Support and stability"),
      p("Find out how to reach support, how fast they reply and whether the vendor shares a public status or roadmap. A young product with a clear roadmap can be a good bet; a product that hides what is and is not built is not."),

      h2("A scorecard you can copy"),
      p("Score each product from 0 to 5 on each row, multiply by the weight that reflects your priorities, and add up. Weights below suit a service business that books appointments; change them to fit yours."),
      table(["Criterion", "Weight", "Product A", "Product B", "Product C"], ["Grounded, honest answers", "5", "", "", ""], ["Booking with live calendar", "5", "", "", ""], ["Total price at 3x volume", "4", "", "", ""], ["Lead capture and delivery", "4", "", "", ""], ["Handover to a person", "3", "", "", ""], ["Integrations you use", "3", "", "", ""], ["Security and privacy", "3", "", "", ""], ["Speed and accessibility", "2", "", "", ""], ["Support and roadmap clarity", "2", "", "", ""]),

      h2("The types of product on the market"),
      table(["Type", "Examples of the approach", "Strength", "Limit for a service business"], ["Live chat suites with AI added", "Chat inbox first, AI assistant on top", "Strong human inbox", "Often priced per seat or per conversation; booking may be basic"], ["AI answer bots", "Train on your content and answer questions", "Fast to launch", "May lack booking and lead workflows"], ["Marketing automation chatbots", "Flows across social channels", "Good for campaigns", "Less suited to knowledge-heavy questions"], ["Scheduling tools", "Calendars with booking pages", "Excellent scheduling", "Not conversational; see [AI assistant vs Calendly and Acuity](/blog/ai-website-assistant-vs-calendly-acuity)"], ["Purpose-built service business assistants", "Answers, booking, leads and handover together", "Fit for appointment-based businesses", "Narrower than general suites"]),
      p("We name categories rather than rank specific competitors, because their features and prices change frequently. Read the direct comparisons if you are weighing particular names: [Crescelo vs Chatbase and Dante AI](/blog/crescelo-vs-chatbase-dante-ai-booking), [Crescelo vs Tidio and ManyChat](/blog/crescelo-vs-tidio-manychat-comparison) and [Crescelo vs traditional live chat](/blog/crescelo-vs-traditional-live-chat). Always check each vendor's current pricing and features on their own site."),

      h2("Where Crescelo fits"),
      p("Crescelo is built for appointment-based service businesses. It answers from your own documents and says when it does not know, books appointments with slot locking, captures leads and hands over to your team. It uses a bring-your-own-key model: you connect your own AI provider and pay them directly, so the platform adds no markup on AI usage. Plans start at $49 a month, with booking and calendar sync on Growth at $149 and WhatsApp and Telegram on the Agency tier; see the [pricing page](/pricing). Phone answering is under development and listed on the [roadmap](/roadmap). It may not suit you if you need a large help-desk suite or a heavy marketing-automation platform. You can test it against your own documents with no account in the [playground](/playground)."),

      h2("A one-hour test protocol"),
      ol("Choose two or three finalists using the needs table above.", "Load the same set of your real documents into each.", "Ask the same twenty questions: ten common, five worded badly, three not in the documents, two that tempt it to over-promise.", "Run a real booking and a reschedule.", "Submit a test lead and watch how and where it arrives.", "Request a person and see what your team receives.", "Read the pricing page and calculate the total at three times your volume.", "Fill in the scorecard."),

      h2("Red flags"),
      ul("Demos only with the vendor's own content.", "No way to see which passage produced an answer.", "Unclear pricing or 'contact us' for basic tiers when you are a small business.", "Leads only viewable inside the vendor's dashboard, with no export.", "Claims of guaranteed sales or fully replacing your staff.", "No information on data storage or sub-processors."),

      h2("A worked comparison: three fictional products"),
      p("To show how the scorecard works, here is a fictional service business scoring three fictional products. The point is the method, not the names."),
      table(["Criterion (weight)", "Product A", "Product B", "Product C"], ["Grounded answers (5)", "4", "5", "2"], ["Booking with live calendar (5)", "2", "4", "5"], ["Total price at 3x volume (4)", "5", "3", "3"], ["Lead capture and delivery (4)", "3", "4", "4"], ["Handover (3)", "4", "3", "5"], ["Integrations you use (3)", "3", "4", "3"], ["Security and privacy (3)", "3", "4", "3"], ["Speed and accessibility (2)", "4", "3", "3"], ["Support and roadmap clarity (2)", "3", "4", "3"]),
      p("Multiplying each score by its weight and adding gives Product A 4x5 + 2x5 + 5x4 + 3x4 + 4x3 + 3x3 + 3x3 + 4x2 + 3x2 = 20 + 10 + 20 + 12 + 12 + 9 + 9 + 8 + 6 = 106. Product B scores 25 + 20 + 12 + 16 + 9 + 12 + 12 + 6 + 8 = 120. Product C scores 10 + 25 + 12 + 16 + 15 + 9 + 9 + 6 + 6 = 108. The cheapest product did not win, because grounding and booking were weighted heavily. If price mattered most to you, you would weight it higher and the result would change. That is the value of writing your priorities down first."),

      h2("Hidden costs to look for"),
      ul("**Per-seat fees** for each team member who answers chats.", "**Overage charges** when conversations exceed the plan.", "**Add-ons** for booking, extra languages, white-labelling, WhatsApp or API access.", "**AI usage** that is billed separately or bundled with a margin.", "**Setup or onboarding fees.**", "**Storage limits** for documents, which force an upgrade as your content grows.", "**Annual-only discounts** that lock you in before you have tested the product."),

      h2("How to run a fair trial"),
      ol("Write down the twenty questions in advance so you cannot unconsciously favour one product.", "Use the same documents everywhere, including one messy PDF.", "Ask each question twice on different days, to see whether answers are consistent.", "Score answers as correct, partly correct, wrong or admitted ignorance. Admitted ignorance is better than wrong.", "Ask a colleague who did not choose the products to test them cold.", "Record how long setup took, because that is a real cost."),

      h2("Questions about your future, not just today"),
      ul("Can I change the AI model or provider later?", "Can I export my content, conversations and leads?", "How often does the vendor ship improvements, and where can I see them?", "What happens to my data if I cancel?", "Is there a public roadmap that separates what is live from what is planned?"),
      p("Crescelo publishes a [roadmap](/roadmap) that says what is live and what is under development, so you know what you are buying today."),

      h2("Frequently asked questions"),
      faq(
        ["What is the best AI chatbot for a small business website?", "It depends on your main need. For appointment-based businesses, look for grounded answers, live calendar booking, lead capture and handover to a person. Compare a few products on your own documents."],
        ["How much should an AI chatbot cost?", "Small business plans commonly range from tens to a few hundred dollars a month, plus AI usage. Compare the total price at your current and three times your volume."],
        ["Is a free AI chatbot good enough?", "Free tiers are fine for testing. Check limits on conversations, storage and branding, and whether booking and lead delivery are included."],
        ["Do I need my own AI key?", "Not always, but bring-your-own-key products make AI costs transparent and let you switch models. Bundled products are simpler but add a margin."],
        ["How do I stop a chatbot giving wrong answers?", "Choose a product that answers from your documents and admits when it does not know, and test it with questions your content cannot answer."],
        ["Can I switch chatbot later?", "Usually yes, if you keep your source documents. Ask whether you can export conversations and leads."],
      ),
    ],
  }),
];
