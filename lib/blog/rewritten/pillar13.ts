import { faq, h2, h3, note, ol, p, pillar, table, ul } from '../authoring';

export const PILLAR13 = [
  pillar({
    slug: 'eliminate-salon-no-shows-automated-reminders',
    title: 'How Salons and Barbershops Cut No-Shows: Reminders, Deposits and Easy Rescheduling',
    description: 'A practical no-show plan for salons and barbershops: confirmation and reminder timing, deposits for long services, easy rescheduling, waitlists and simple policy wording.',
    primaryKeyword: 'reduce salon no-shows',
    secondaryKeywords: ['barbershop no show policy', 'salon appointment reminders', 'salon deposit policy', 'stop client no shows'],
    body: [
      p("An empty chair is the most expensive thing in a salon. The stylist is paid, the products are ready, the rent is due, and nobody walks in. In salons and barbershops, where a large share of income comes from booked appointments, even a modest no-show rate adds up to thousands of dollars a year. The good news is that most no-shows are not malice. People forget, get busy or feel awkward about cancelling. A small set of habits, a clear confirmation, well-timed reminders, an easy way to move a booking, a fair policy and a way to refill gaps, removes most of the problem without upsetting regulars. This guide gives you a plan built for salons and barbershops, with wording you can copy and a simple way to measure the result."),

      h2("Why salon clients miss appointments"),
      table(["Reason", "What it looks like", "What helps"], ["Forgot", "Booked three weeks ago and life moved on", "Reminders at the right times"], ["Cannot easily change it", "Wants to move it but the shop is closed or never answers", "A change link in every message"], ["Low commitment", "Booked casually online at midnight", "Deposit for long services; clear policy"], ["Double booked elsewhere", "Tried two salons and picked one", "Confirmation request that releases the slot"], ["Not sure about time or place", "Cannot find the address or parking", "Full details and a map link in the confirmation"], ["Anxiety", "Nervous about a big colour change", "Friendly pre-visit information and a chance to ask questions"]),
      p("Look at your own missed appointments for a month and note which reason applies. Most salons find that forgetting and difficulty changing the booking cover the majority."),

      h2("The confirmation: your first and best reminder"),
      p("Send a confirmation immediately after booking, and put everything in it that a client might otherwise ask about."),
      ul("Service, stylist, date, time and how long it will take.", "Price or price range, and what it includes.", "Address, parking and a map link.", "What to bring or do: a patch test for colour, clean hair, a reference photo.", "Your cancellation and lateness policy in one sentence.", "A one-tap link to change or cancel."),
      p("A confirmation that answers questions before they are asked prevents confusion and shows clients that you are organised. Crescelo's booking sends a confirmation email with a private link to reschedule or cancel; you can add your policies to the assistant's knowledge so it states them the same way in chat."),

      h2("A reminder schedule for salons"),
      table(["When", "Channel", "Purpose"], ["At booking", "Email", "Confirmation with all details and the change link"], ["Two to three days before", "Email or text", "First reminder with the change link"], ["The day before", "Text if you use one; otherwise email", "Short reminder; optional confirm request"], ["The morning of the appointment", "Text or email", "Last reminder with the address and running-late instructions"], ["After the visit", "Email", "Thank you, review request and rebooking link"]),
      p("Crescelo sends confirmation emails and email reminders before the appointment; it does not send text messages today, so if you want texts, use your own messaging tool alongside it. Three touches are usually enough: a confirmation, a reminder and a last-minute nudge. See [SMS versus email reminders](/blog/sms-vs-email-appointment-reminders-conversions) for how to choose."),

      h2("Wording that works in a salon"),
      table(["Message", "Example"], ["Reminder", "Hi Sam, a reminder about your cut and colour tomorrow at 2:30 p.m. with Priya at Brook Salon. Need to change it? Tap here and pick another time."], ["Confirm request", "Please tap to confirm your 2:30 p.m. appointment tomorrow, or move it here. If we do not hear from you we may offer the slot to someone on our waiting list."], ["Running late", "See you at 2:30 p.m. If you are running late, message us. After 15 minutes we may need to shorten your service."], ["After a late cancellation", "We are sorry you cannot make it. Since it is inside our 24-hour window we may keep your deposit, but tell us if something unexpected happened and we will do our best to help."]),
      p("Keep the tone warm and human. Clients forgive a strict policy when it is explained kindly and applied with judgement."),

      h2("Deposits: when they help and how to use them"),
      p("A deposit turns a vague intention into a commitment. It works best for services where a missed slot costs you real money: long colour appointments, bridal work, expensive treatments and peak times. It adds friction, so many salons use it selectively: first-time clients, services over a set length, or Saturdays. State clearly what the deposit covers and when it is refunded or deducted."),
      ul("Choose a level that matters but does not scare: a fraction of the service price.", "Take it through your own payment process; Crescelo's booking does not take payments or deposits itself.", "Explain the rule in the confirmation and in the knowledge base so the assistant states it correctly.", "Rules on deposits and fees vary by place; check yours."),
      p("See [deposit collection and booking policies](/blog/deposit-collection-booking-policies-chat) and [the psychology of deposits](/blog/deposit-collection-psychology-show-up-rates)."),

      h2("Make changing the booking effortless"),
      p("A large share of no-shows are people who wanted to move the appointment but found it hard. A link in every message that opens a page where they can pick another time, or a reply in the chat, turns a likely no-show into a rebooking and gives you time to refill the slot. Crescelo's confirmation email includes a private link to reschedule or cancel, and the freed slot becomes available again immediately. See [frictionless self-serve rescheduling](/blog/frictionless-self-serve-rescheduling)."),

      h2("Write a fair policy"),
      note("Sample policy: 'You can change or cancel free of charge up to 24 hours before your appointment. After that we may keep your deposit, because the time is reserved for you. If something unexpected happens, please tell us and we will do our best to help. If you are more than 15 minutes late we may need to shorten your service.'"),
      ul("Keep it short and in plain words.", "Show it at booking, in the confirmation and on your website.", "Apply it consistently, with discretion for genuine emergencies.", "Record repeated no-shows so you can decide about future bookings with facts."),
      p("See [effective cancellation policies for service businesses](/blog/effective-cancellation-policies-service-businesses)."),

      h2("Refill the gaps"),
      p("Some cancellations will still happen, and the earlier you hear about them, the easier it is to fill the slot. Keep a short list of clients who would like an earlier time and message them when a slot opens. Walk-in friendly barbershops can simply announce the free slot on social media. See [filling cancelled slots with a standby list](/blog/fill-cancelled-slots-automated-standby-chat) and [managing walk-ins and appointments](/blog/managing-walk-ins-vs-appointments-salons)."),

      h2("How an AI assistant helps"),
      ul("It answers 'where do I park?' and 'do I need a patch test?' before they turn into confusion on the day.", "It states your policy accurately whenever a client asks.", "It offers real free times so a client who wants to move can rebook in the chat.", "It works in the evening, when most changes of plan happen."),
      p("See [AI chatbots for salons and barbershops](/blog/ai-booking-guide-barbershops-salons) and the [appointment booking feature](/product/appointment-booking)."),

      h2("Measure the result"),
      table(["Metric", "How to calculate", "Target direction"], ["No-show rate", "No-shows divided by booked appointments", "Down"], ["Late cancellation rate", "Cancellations inside your notice window divided by bookings", "Down"], ["Rebooking rate", "Rescheduled divided by cancelled", "Up"], ["Gap fill rate", "Slots refilled divided by slots cancelled", "Up"], ["Lost revenue", "No-shows multiplied by average ticket", "Down"]),
      p("Record your baseline for a month before you change anything, then change one thing at a time so you know what worked."),

      h2("A four-week plan"),
      ol("**Week 1:** count your last three months of no-shows and lost revenue.", "**Week 2:** improve the confirmation and add a reminder pattern with a change link.", "**Week 3:** write your policy and decide where deposits make sense.", "**Week 4:** set up a standby list and review the numbers."),

      h2("Common mistakes in salons"),
      ul("Sending one reminder a week ahead and nothing after.", "Making changes possible only by phone during opening hours.", "Hiding the policy until someone breaks it.", "Applying rules to some clients and not others.", "Not recording no-shows, so patterns stay invisible."),

      h2("Frequently asked questions"),
      faq(
        ["How do I reduce no-shows at my salon?", "Send a clear confirmation, add well-timed reminders with a one-tap change link, use deposits for long services, write a fair policy and keep a standby list."],
        ["Should a barbershop charge a no-show fee?", "It can deter no-shows, but it must be clear in advance and lawful where you are. Many shops start with reminders and easy rescheduling before adding fees."],
        ["Do text reminders work better than email?", "Texts are noticed faster and suit last-minute reminders. Email carries more detail. Many salons use both."],
        ["Does Crescelo take deposits?", "No. Its booking sends confirmations and email reminders with a change link, but payments and deposits go through your own payment process."],
        ["How many reminders should I send?", "Usually two or three: a confirmation, a reminder a day or two before and a short last-minute nudge."],
        ["What if a regular client no-shows once?", "Be understanding, ask if something happened and remind them of the policy. Decide on stricter rules only after repeated misses."],
      ),
      p("See how the [AI assistant](/product/ai-assistant) answers policy questions from your own documents, try it in the [playground](/playground) and [start a free trial](/login?mode=register)."),
    ],
  }),

  pillar({
    slug: 'dental-emergency-triage-ai-chat',
    title: 'Dental Emergencies and AI Chat: How to Route Urgent Messages Safely',
    description: 'How dental practices should handle urgent messages in a website chat: recognising urgency, safe wording, alerts, out-of-hours routes and why the assistant must never triage.',
    primaryKeyword: 'dental emergency chatbot',
    secondaryKeywords: ['dental triage chatbot', 'emergency dentist website chat', 'after hours dental emergency', 'chatbot urgent dental pain'],
    body: [
      p("When someone has a toothache at 11 p.m. or a knocked-out tooth on a Saturday, they turn to the internet. If your practice's website has a chat, that visitor may type their emergency into it. What the chat says next matters. A poorly designed chatbot might reassure someone who needs urgent care, give advice it is not qualified to give, or leave them waiting with no idea what to do. A well-designed one recognises urgency, gives clear approved instructions, alerts your team and never pretends to diagnose. This guide explains how a dental practice should set up its chat for urgent messages: what the assistant should and should not do, how to write the wording with your clinical team, how to route out-of-hours emergencies and how to test the rules."),
      note("This is general information, not medical or legal advice. Your clinical lead should write and approve the emergency wording, and you should check the rules that apply to your practice. Emergency guidance varies by country."),

      h2("The core rule: route, do not triage"),
      p("An AI assistant is not a clinician. It cannot examine a patient, and it must not decide whether a symptom is serious. Its job in an emergency is to recognise that a message may be urgent, give the practice's approved instructions and get a human involved fast. That means three things: never diagnose, never reassure ('that sounds like nothing') and never recommend medication or treatment."),
      table(["The assistant should", "The assistant should not"], ["Recognise urgent wording and act at once", "Decide whether a symptom is serious"], ["Give your approved emergency instructions", "Advise on medication or home treatment"], ["Point to emergency services for life-threatening signs", "Say something is 'probably fine'"], ["Alert your team with the conversation", "Promise an appointment time it cannot guarantee"], ["Tell the visitor honestly what happens next", "Ask for detailed medical history in chat"]),

      h2("Recognising urgent messages"),
      p("Agree a list of triggers with your clinical lead. Typical categories:"),
      ul("**Life-threatening signs:** difficulty breathing or swallowing, swelling spreading to the face, eye or neck, uncontrolled bleeding, head or facial trauma, fever with severe swelling.", "**Urgent dental problems:** severe pain, a knocked-out or broken tooth, a lost filling with pain, an abscess, bleeding that will not stop.", "**Less urgent but time-sensitive:** a broken denture, a lost crown, a cracked tooth without severe pain."),
      p("Recognition uses wording, not medical judgement. Include the many ways people describe problems: 'my face is swollen', 'cannot open my mouth', 'tooth fell out', 'bleeding a lot', 'in agony'. Test with real phrases, misspellings and other languages you serve."),

      h2("Two tiers of response"),
      table(["Tier", "Examples", "Response"], ["1: possibly life-threatening", "Trouble breathing or swallowing, spreading facial swelling, heavy bleeding after injury", "Tell the visitor to contact emergency services now, in plain words. Alert the team. Do not continue a normal booking chat."], ["2: urgent dental", "Severe toothache, knocked-out tooth, abscess signs", "Give your approved instructions and phone number or emergency line, offer the earliest emergency slot if you have one and alert the team."]),
      p("Write the words exactly, and have your clinical lead approve them. For example, tier 1: 'This sounds serious. Please call emergency services now. If it is safe to do so, do not wait for us.' Tier 2: 'I am sorry you are in pain. Please call us on [number] now if we are open. If we are closed, call [emergency dental service or line]. I have alerted our team.'"),

      h2("Out-of-hours routes"),
      p("Practices differ in what they can offer at night. Decide yours and state it honestly."),
      ol("**On-call dentist:** give the emergency number and alert the on-call person by text and email.", "**Emergency dental service:** name the local service, or your reciprocal arrangement.", "**Next morning:** offer the first emergency slot and explain that the team will call when the practice opens.", "**No cover:** say so plainly and direct to emergency services or the nearest urgent care."),
      p("Never promise a callback time you cannot meet. See [after-hours appointment booking](/blog/after-hours-appointment-booking) for the general approach and [handling emergencies in automated chat](/blog/handling-emergencies-automated-chat)."),

      h2("Alerts: the part that saves patients"),
      p("A recognised emergency is only useful if a person sees it. Set up alerts to reach someone who will act, through more than one route."),
      ul("Instant email with the whole conversation.", "A text or push notification to the on-call person, sent by an automation from the chatbot's webhook; see [webhook automations](/blog/webhook-automations-zapier-make-chat-events).", "A dashboard notification for staff who are working in it.", "A backup route if the first person does not respond."),
      p("Test the alerts regularly, including at night. An alert that goes to an unread inbox is worse than none because it creates false comfort. Crescelo can hand any conversation to your team with notifications and the full history; see the [human handover feature](/product/human-handover)."),

      h2("What not to collect in the chat"),
      p("Urgent visitors will type details. The assistant should ask only for what is needed to help: a name, a phone number and, in general terms, what is happening so the team can prioritise. It should not ask for a detailed medical history, medications, insurance numbers or images of the patient's face or mouth in an open chat. Tell the visitor that the team will ask what they need when they call. Follow your privacy rules; see [HIPAA considerations for dental chatbots](/blog/hipaa-compliance-dental-chatbots)."),

      h2("Wording examples for your clinical team to adapt"),
      table(["Situation", "Draft wording"], ["Tier 1", "This sounds like it could be serious. Please call emergency services now. Do not wait for us. If you can, ask someone to stay with you."], ["Severe pain, open", "I am sorry you are in pain. Please call us right now on [number], we can see emergencies today. I have alerted the team, and they will look for your call."], ["Severe pain, closed", "I am sorry you are in pain. We are closed now. Please call [emergency line or service]. I have alerted our on-call team and they will reply when able. If your pain gets worse or you have swelling or trouble breathing, call emergency services."], ["Knocked-out tooth", "Please call us right now on [number] or the emergency line. Time matters. I have alerted the team."], ["Broken denture or lost crown", "That is inconvenient. I can book the earliest appointment for you. Is this causing pain or bleeding?"]),
      p("These are drafts for discussion with your dentists, not clinical guidance."),

      h2("Test the rules before launch"),
      ol("Write twenty realistic urgent messages, including misspellings and casual phrasing.", "Send each to the assistant in the Testing Studio.", "Check that tier 1 messages always produce the emergency-services wording.", "Check that tier 2 messages give the right number and alert the team.", "Check that ordinary messages such as 'do you whiten teeth?' do not trigger emergency wording.", "Test at night, and check the on-call person really receives the alert.", "Repeat after every change to your instructions."),
      p("Repeat the test every quarter and after any change to your emergency arrangements."),

      h2("A sample conversation"),
      table(["Speaker", "Message"], ["Visitor", "my tooth is killing me and my cheek is swollen, its 10pm"], ["Assistant", "I am sorry you are in pain. Swelling can be serious. If you have trouble breathing or swallowing, or the swelling is spreading to your eye or neck, call emergency services now. Otherwise please call our emergency line on [number]. I have alerted our on-call dentist and they will look for your call. Can I take your name and mobile number in case we need to reach you?"], ["Visitor", "Sam, 555-0144"], ["Assistant", "Thank you, Sam. I have passed everything to the team. If anything gets worse, please do not wait: call emergency services."]),
      p("The assistant did not say what the swelling was, did not tell Sam what to take and did not promise a time. It gave safety guidance, an emergency line, an alert and a minimal contact capture. Your clinical lead should write and approve every line like these."),

      h2("Review after every real emergency"),
      p("Whenever an emergency conversation happens, review it the next day with the on-call dentist: did the wording help, did the alert arrive quickly, was the patient seen appropriately, and what would you change? Adjust the triggers and wording, and record the change. Real cases teach more than any test list, and a short review keeps the process safe as your practice and services change."),

      h2("Frequently asked questions"),
      faq(
        ["Can a chatbot triage dental emergencies?", "It should not. It should recognise urgent wording, give your approved instructions, alert your team and never diagnose or reassure."],
        ["What should the chatbot say for a life-threatening symptom?", "Tell the visitor to contact emergency services now, in plain words approved by your clinical lead."],
        ["How do I handle emergencies out of hours?", "Provide your emergency line or service, alert the on-call person and offer the first appointment next morning, being honest about what you can do."],
        ["Should the chatbot ask about symptoms?", "Only in general terms so the team can prioritise. Avoid detailed medical history in an open chat."],
        ["How do I make sure someone sees the alert?", "Use more than one route, send to a person who is on duty, and test it regularly."],
        ["Who writes the emergency wording?", "Your clinical lead. The assistant follows the wording; it does not decide clinical questions."],
      ),
      p("See how the [AI assistant](/product/ai-assistant) is built to hand over rather than guess, try a test conversation in the [playground](/playground) and read [AI chatbots for dental practices](/blog/ai-patient-scheduling-dental-practices)."),
    ],
  }),

  pillar({
    slug: 'dental-new-patient-intake-automation',
    title: 'New Patient Intake for Dental Practices: What to Automate and What to Keep Secure',
    description: 'How dental practices can streamline new patient enquiries and intake: what a website chat can do, what belongs in secure forms, booking, reminders and privacy safeguards.',
    primaryKeyword: 'dental new patient intake',
    secondaryKeywords: ['dental patient onboarding', 'new patient booking dental website', 'dental intake forms online', 'dental practice front desk automation'],
    body: [
      p("The path from 'I need a dentist' to 'I am in the chair' has more steps than most practices realise. A prospective patient asks whether you take new patients, wants a price, worries about insurance, books, receives forms, completes them, remembers to arrive and finally sits down. At each step some people drop away. Automation can smooth the early steps, the questions and the booking, while the sensitive steps, clinical history and identity, stay in secure systems. This guide sets out a sensible division for a dental practice: what a website chat can handle, what should move to secure forms, how booking and reminders fit, what privacy rules to respect and how to measure whether it is working."),
      note("This is general information, not legal advice. Dental practices handle sensitive health information, and rules differ by country. Take advice about your obligations, and see our guide to [HIPAA considerations for dental chatbots](/blog/hipaa-compliance-dental-chatbots)."),

      h2("The new-patient journey"),
      table(["Stage", "What the patient wants", "Where it belongs"], ["1. Research", "Are you accepting new patients? What do you offer?", "Website and chat"], ["2. Price and insurance", "What does a first visit cost? Do you take my insurance?", "Chat, from approved documents"], ["3. Booking", "A time that suits me", "Chat or booking page"], ["4. Confirmation", "Details of the visit and what to bring", "Email confirmation"], ["5. Forms", "Complete medical history and consent", "Secure forms or your patient system"], ["6. Reminder", "Do not forget the visit", "Email or text reminders"], ["7. Arrival", "Check in quickly", "Front desk"]),
      p("Automating stages 1 to 4 and 6 is straightforward and low risk. Stage 5 is where sensitive information appears, and it should never sit in an open chat."),

      h2("What a website chat can safely handle"),
      ul("**Whether you accept new patients,** opening hours, location, parking and accessibility.", "**A description of the first visit:** what happens, how long it takes and what to bring.", "**Fees you publish:** the new-patient exam, cleaning, X-rays and payment options.", "**Insurance information you can state:** which providers you work with, with a clear line that coverage must be confirmed with the insurer.", "**Booking a new-patient appointment** with minimal details: name and a way to reach the patient.", "**Directing people to secure channels** for forms and clinical questions."),
      p("A chat can do all this at any hour, from documents you approve. See [insurance and financing FAQ automation](/blog/dental-insurance-financing-faq-automation)."),

      h2("What should stay out of the chat"),
      ul("Medical and dental history, medications and allergies.", "Symptoms in detail and photos of the mouth or face.", "Insurance member and group numbers.", "Government identifiers and payment card details.", "Anything a clinician needs to assess."),
      p("Give the assistant instructions to steer away from these and to say where they belong: 'For your medical history, we will send you a secure form after you book.' Add a notice in the chat asking visitors not to share health details there."),

      h2("Booking a new-patient visit"),
      p("A first visit usually needs a longer slot than a check-up. With a tool that supports several appointment types, set a new-patient type with its own length. Crescelo's built-in picker uses one slot length, so choose the length of your standard new-patient exam, or use Calendly or Cal.com links for appointment types with different durations. Bookings arrive in your dashboard and a read-only calendar feed. See [AI appointment booking](/blog/ai-appointment-booking) and [configuring availability rules](/blog/configure-calendar-sync-availability-rules)."),
      ol("The visitor asks about a first visit and gets an answer.", "The assistant offers real free times and books the visit.", "The confirmation email explains what to bring and how to change the booking.", "The confirmation also links to your secure new-patient forms, if you use them.", "A reminder goes out before the visit."),

      h2("Secure forms and the handoff"),
      p("Your practice management system or a secure forms provider should collect health history, consent and insurance details, behind proper access controls and with the agreements your rules require. Send the link in the confirmation, not in the chat transcript. If a patient tries to type their history in the chat, the assistant should politely redirect them. Ask any forms vendor about encryption, access controls and business associate or processing agreements."),

      h2("Reminders and reducing no-shows"),
      p("New patients are more likely to forget or drop out than established ones. Send a confirmation immediately, a reminder a day or two before that repeats what to bring and includes a change link, and a last-minute nudge if you use texts. Remind them to complete forms in advance. See [how to reduce no-shows](/blog/eliminate-service-no-shows-playbook)."),

      h2("Consistent, honest messaging"),
      ul("Tell visitors they are talking to an AI assistant.", "Link to your privacy policy.", "Offer a route to a person, and say when the team is available.", "Do not make clinical promises, such as guaranteed outcomes or prices for treatment you have not assessed.", "Keep fee and insurance information current; out-of-date information is a common cause of complaints."),
      p("See [AI transparency and disclosure](/blog/ai-transparency-disclosure-building-trust)."),

      h2("Special cases"),
      h3("Anxious patients"),
      p("Many people avoid the dentist because of fear. The assistant can respond warmly, explain what happens and mention any options you offer, without making clinical promises. See [pediatric dental inquiries](/blog/pediatric-dental-inquiries-chat) for a related example."),
      h3("Cosmetic consultations"),
      p("People interested in whitening, veneers or implants want information before committing. Offer a consultation booking rather than quoting a treatment plan. See [cosmetic dentistry consultation booking](/blog/cosmetic-dentistry-consultation-booking)."),
      h3("Emergencies"),
      p("A visitor who describes an emergency should never be treated as a routine new patient. Use the safe routing described in [dental emergency triage with AI chat](/blog/dental-emergency-triage-ai-chat)."),

      h2("Measure the result"),
      table(["Metric", "Why it matters"], ["New-patient enquiries and how many book", "Conversion of your front door"], ["Out-of-hours bookings", "Demand you would have missed"], ["Forms completed before the visit", "Front desk time saved"], ["New-patient no-show rate", "Whether confirmations and reminders work"], ["Questions the assistant could not answer", "Content gaps to fix"]),
      p("Review conversations weekly for the first month; see [how to review your chatbot's conversations](/blog/audit-website-chatbot-conversations)."),

      h2("A sample conversation"),
      table(["Speaker", "Message"], ["Visitor", "Hi, I have just moved here and need a dentist. Are you taking new patients?"], ["Assistant", "Welcome to the area. Yes, we are welcoming new patients. A new-patient visit includes an exam, X-rays if needed and a chat about your goals, and takes about 60 minutes. Our fee is $95 without insurance. Would you like to see times this week?"], ["Visitor", "Thursday morning?"], ["Assistant", "Thursday has 9:00 and 10:30 free. Which suits you? I will need your name and a mobile number. After you book, we will email a secure link for your medical history, so please do not type health details here."]),
      p("Notice that the assistant stated the fee, offered real times, asked only for booking details and explained where health information goes."),

      h2("Front desk routine after launch"),
      ol("Each morning, check overnight bookings and messages.", "Confirm that new patients received the forms link, and follow up on any who have not completed it a day before the visit.", "Note the questions the assistant could not answer and add them to the knowledge base.", "Once a month, compare new-patient bookings, no-shows and form completion with the previous month."),
      p("This routine takes minutes and keeps the whole intake path reliable."),

      h2("Common mistakes"),
      ul("Asking for medical history in the chat.", "Sending the forms link in an open message instead of the confirmation email.", "Using a slot length that is too short for a new-patient exam.", "Forgetting to update fees and insurers after changes.", "Never checking whether new patients complete forms before the visit.", "Not telling visitors they are talking to an AI."),
      p("Each of these is easy to avoid with a checklist, and the checklist is short: content approved, forms secure, booking length right, reminders on and conversations reviewed weekly."),

      h2("Keep the human touch"),
      p("Automation should make the first contact easier, not colder. A warm greeting, a clear explanation of the visit and an easy route to a person go a long way with people who are nervous about the dentist. Let the team introduce themselves in the confirmation email, and make sure a friendly voice answers when a patient calls."),

      h2("Frequently asked questions"),
      faq(
        ["Can a chatbot handle new patient intake?", "It can answer questions, share fees and insurance information you publish and book the visit. Medical history and consent should go through secure forms, not the chat."],
        ["What should I not collect in a dental chat?", "Health history, medications, detailed symptoms, insurance numbers and payment details."],
        ["How do I get intake forms to patients?", "Include a link to your secure forms in the booking confirmation, and remind patients to complete them before the visit."],
        ["Can the assistant book different appointment types?", "It depends on the tool. Crescelo's built-in picker uses one slot length; use Calendly or Cal.com links for several appointment types."],
        ["Does this reduce front desk work?", "It typically removes repetitive questions and after-hours enquiries, so the team can focus on patients in the practice."],
        ["Is it safe to use a chatbot for a dental practice?", "It can be, if you keep sensitive information out of the chat, tell visitors it is an AI, choose vendors carefully and follow the rules that apply to you."],
      ),
      p("Try a new-patient conversation on your own practice information in the [playground](/playground), see the [AI assistant feature](/product/ai-assistant) and [start a free trial](/login?mode=register)."),
    ],
  }),

  pillar({
    slug: 'dental-insurance-financing-faq-automation',
    title: 'Answering Dental Insurance and Payment Questions Automatically: A Careful Guide',
    description: 'How dental practices can answer insurance and financing questions in chat without overpromising: what to publish, wording that avoids guarantees and when to hand over.',
    primaryKeyword: 'dental insurance FAQ chatbot',
    secondaryKeywords: ['dental financing questions', 'dental practice payment options FAQ', 'insurance questions front desk', 'dental fees chatbot'],
    body: [
      p("'Do you take my insurance?' may be the most common question a dental practice hears, followed closely by 'how much will it cost?' and 'do you offer payment plans?' These questions arrive by phone, by email and in the website chat, often while the front desk is busy with patients. They are also risky to answer casually. Coverage depends on the individual's plan, and a wrong answer can lead to a surprise bill, an angry patient and a complaint. Automating these answers is worthwhile, as long as the assistant states what the practice knows, avoids promises about coverage and hands over when the question needs a person. This guide explains how to write the content, what the assistant should and should not say, how to present fees and payment options, and how to test the answers."),
      note("Insurance and payment rules differ by country, and this is general information, not legal or financial advice. Have your practice manager or adviser review the wording, and keep it current."),

      h2("What patients actually ask"),
      table(["Question", "What the practice can safely say"], ["Do you take my insurance?", "Which insurers or networks you work with, and that coverage depends on the plan and must be confirmed with the insurer"], ["What does my plan cover?", "Nothing specific: refer them to their insurer, and offer that the team can help check benefits at booking"], ["How much is a first visit without insurance?", "Your published self-pay fee"], ["How much for a crown, implant or braces?", "A published range if you have one, or that treatment plans need an examination first"], ["Do you offer payment plans?", "The options you provide and how to apply"], ["Do you accept card, cash, health savings accounts?", "The accepted methods"], ["Can I get a quote in advance?", "How to request an estimate after an assessment"]),
      p("Notice the pattern: state facts you control, and refer everything that depends on an individual plan or clinical assessment."),

      h2("Write the source documents first"),
      p("The assistant can only be as good as the documents. Prepare a short set."),
      ol("**Insurance FAQ:** the list of insurers or networks you are in, how the practice handles claims (direct billing or patient reimbursement) and how patients can check their benefits.", "**Fee guide:** self-pay fees for common services, with dates so they can be kept current.", "**Payment options:** accepted methods, payment plans, financing partners and how to apply.", "**Estimates policy:** when and how you provide written estimates and what they depend on.", "**Cancellation and billing policy:** what happens with late cancellations and unpaid balances."),
      p("Keep each document short and clearly titled, for example 'Which insurance do you accept?' Put the answer near the question, and date anything that changes."),

      h2("Wording that avoids overpromising"),
      table(["Risky", "Safer"], ["Yes, your plan covers that.", "We work with your insurer, but coverage depends on your specific plan. We can help check your benefits when you book, and we recommend confirming with your insurer."], ["It will cost about $200.", "Our fee for a check-up and cleaning without insurance is $150. With insurance, your cost depends on your plan."], ["You will not have to pay anything.", "Many plans cover preventive visits in full, but your plan determines that. We will give you an estimate before treatment."], ["Do not worry about the price.", "I understand cost is a concern. We offer payment plans, and we can talk through options at your visit."]),
      ul("Never state what an individual plan will cover.", "Never guarantee a final cost before an examination.", "Always give a route to a person for individual benefit questions.", "Give figures only if you publish them and keep them current."),

      h2("Present fees and financing clearly"),
      p("Transparent pricing builds trust and filters out mismatched enquiries. If you publish fees, present them simply: service, price, what it includes. For larger treatments, give ranges and explain what affects the cost. For financing, explain the options and where to find details, and avoid quoting interest rates or terms that belong to a third-party lender unless you have current, approved wording. Say that financing is subject to approval where that is the case."),

      h2("Handing over the tricky cases"),
      ul("Questions about a specific plan's benefits or deductibles.", "Disputes about a bill or a claim.", "Complex treatment plans and estimates.", "Payment difficulties and hardship requests.", "Anything the documents do not cover."),
      p("The assistant should say what it can, then offer to pass the question to the billing or front desk team and capture the patient's contact details. See [live human handover flow design](/blog/live-human-handover-flow-design)."),

      h2("Privacy: keep insurance identifiers out of the chat"),
      p("Ask patients not to type member numbers, group numbers or dates of birth in an open chat. Say where to provide them: at booking through a secure form, by phone or at the visit. Include a short notice in the chat. See [new patient intake for dental practices](/blog/dental-new-patient-intake-automation) and [HIPAA considerations for dental chatbots](/blog/hipaa-compliance-dental-chatbots)."),

      h2("Test the answers"),
      table(["Test question", "A good answer"], ["Do you take Delta Dental?", "States your position and that coverage depends on the plan; offers to check benefits"], ["Will insurance cover my crown?", "Does not promise; explains the next step"], ["How much is a cleaning if I have no insurance?", "The published self-pay fee"], ["Can I pay in instalments?", "Describes your payment options"], ["I was billed the wrong amount.", "Empathy and a handover to the billing team"], ["What is the price of a smile makeover?", "Explains it needs a consultation; offers to book one"]),
      p("Run these and a dozen more before launch, and rerun them whenever fees or insurers change. See [the questions every service business chatbot should answer well](/blog/essential-chatbot-questions-service-business)."),

      h2("Keep it current"),
      ul("Put a review date on every fee and insurance document.", "Update the assistant's knowledge on the same day you change a fee or add or drop an insurer.", "Delete old versions so they cannot conflict.", "Review conversations weekly to find questions you did not expect; see [how to review your chatbot's conversations](/blog/audit-website-chatbot-conversations)."),

      h2("A sample conversation"),
      table(["Speaker", "Message"], ["Patient", "Do you take Delta Dental, and how much is a cleaning?"], ["Assistant", "Yes, we work with Delta Dental. Coverage depends on your specific plan, so we recommend confirming your benefits with Delta, and we can help check them when you book. Our self-pay fee for a check-up and cleaning is $150. Would you like to see available times?"], ["Patient", "Will my plan cover all of it?"], ["Assistant", "Many plans cover preventive visits in large part, but I cannot say what yours covers. Your insurer can tell you, and our team can help check your benefits before your visit. If you like, I can take your details so they can do that."]),
      p("The assistant stated what the practice knows, gave a published fee, avoided promising coverage and offered a person. That is the pattern to aim for."),

      h2("A small template for your insurance page"),
      ul("A plain-language sentence: 'We work with the following insurers: ...' with a date.", "A note that coverage depends on the individual plan and that patients should confirm benefits.", "How your team can help check benefits, and what they need from the patient.", "What happens if the plan pays less than expected.", "Your self-pay fees and payment options.", "How to contact the billing team."),
      p("A page like this serves patients and the assistant, and it saves the front desk from typing the same answer many times a week."),

      h2("Common mistakes"),
      ul("Listing insurers that the practice no longer works with.", "Letting the assistant say 'yes, that is covered'.", "Quoting old fees after a price change.", "Leaving financing details unclear, so patients expect terms you do not offer.", "Not giving billing questions a person to talk to."),

      h2("A quarterly review"),
      p("Once a quarter, sit with your billing lead and read the last fifty insurance and payment conversations. Note the questions you did not expect, the answers that were too vague and any complaint that started in the chat. Update the documents, retest the sample questions and record what you changed. Ten quiet minutes here prevent most billing surprises."),

      h2("Frequently asked questions"),
      faq(
        ["Can a chatbot answer dental insurance questions?", "It can share which insurers you work with and your fees, and explain that coverage depends on the plan. It should not promise coverage and should hand individual benefit questions to your team."],
        ["Should the chatbot quote prices for treatments?", "Only for services with published fees. For larger treatments, explain that a consultation is needed and offer to book one."],
        ["How do I stop the chatbot promising coverage?", "Write the documents and the assistant's instructions so that it never states what a plan covers, and test with questions that tempt it to."],
        ["Can it explain payment plans?", "Yes, from your approved documents, including where to apply and that financing is subject to approval."],
        ["Should patients type their insurance number in the chat?", "No. Direct them to a secure form, the phone or the visit."],
        ["How often should I update the information?", "Whenever fees or insurers change, and review it at least quarterly."],
      ),
      p("Try your own insurance and fee documents in the [playground](/playground), and read [how the AI assistant](/product/ai-assistant) answers only from your content."),
    ],
  }),

  pillar({
    slug: 'cosmetic-dentistry-consultation-booking',
    title: 'Booking Cosmetic Dentistry Consultations With Chat: Whitening, Veneers and Implants',
    description: 'How dental practices can turn cosmetic dentistry enquiries into consultation bookings: what to explain, price wording, consultation flow, trust signals and compliance cautions.',
    primaryKeyword: 'cosmetic dentistry consultation booking',
    secondaryKeywords: ['dental implants enquiry chatbot', 'teeth whitening booking online', 'veneers consultation website', 'cosmetic dentist lead conversion'],
    body: [
      p("Cosmetic dentistry enquiries are different from check-up bookings. The patient is often weighing a significant decision and a significant cost, comparing several practices and looking for reassurance as much as information. They want to know what is possible, how it works, how long it takes, what it might cost and whether they can trust you. A website chat can meet those visitors at their moment of curiosity, explain your options in plain language, and steer them toward a consultation, the right next step, rather than a price quote that cannot be honest without an examination. This guide explains how to set up a chat for cosmetic enquiries: what to explain, how to talk about price, how to design the consultation booking, how to build trust responsibly and what to avoid."),
      note("Advertising and health claims rules for dental practices vary by country and professional body. This is general information, not legal advice. Have your dentists and compliance adviser approve all wording, especially about outcomes and before-and-after material."),

      h2("What cosmetic enquirers want to know"),
      table(["Topic", "Typical questions"], ["Options", "What is the difference between whitening, bonding, veneers and crowns? Am I a candidate?"], ["Process", "How many visits? How long does it take? Is it painful?"], ["Cost", "How much are veneers, whitening or implants?"], ["Results", "How will it look? How long does it last?"], ["Trust", "How experienced are your dentists? Can I see examples?"], ["Practicalities", "Do you offer payment plans? Can I book a consultation?"]),
      p("Every one of these has a safe, useful answer from your approved documents, as long as the assistant explains and does not diagnose."),

      h2("Explain options in plain language"),
      p("Write short descriptions for each treatment you offer, in the words a patient would use."),
      ul("What it is and what problem it addresses.", "Who it is typically suitable for, and that suitability needs an examination.", "What the process involves, and roughly how many visits.", "How long results typically last, without guarantees.", "What aftercare is involved.", "Common questions in your own words."),
      p("Avoid jargon and superlatives. Do not promise results such as a 'perfect smile'. Approved wording from your dentists should be the only source."),

      h2("How to talk about price"),
      p("Price is often the first question and the hardest to answer, because the honest answer depends on the patient's teeth and goals. A helpful response avoids both a vague dodge and a misleading figure."),
      table(["Weak", "Better"], ["Contact us for pricing.", "It depends on how many teeth and what your goals are, so we start with a consultation. To give you an idea, whitening starts from $X and veneers are priced per tooth, usually from $Y to $Z. At your consultation we will give you a written estimate."], ["Veneers cost $500.", "Veneers are priced per tooth and vary with the type of material and the work needed. We publish a range and confirm exactly after an examination."], ["Cheapest in town.", "We offer payment plans to spread the cost. Would you like to hear the options?"]),
      ul("Publish ranges only if you can honour them.", "Say what the range depends on.", "Explain that a written estimate follows the consultation.", "Describe financing options factually, and note that approval may apply.", "Never invent or imply a price the practice has not set."),
      p("See [insurance and financing FAQ automation](/blog/dental-insurance-financing-faq-automation) for careful wording on cost."),

      h2("The consultation is the conversion"),
      p("The goal of the chat is a booked consultation. Make it attractive and simple."),
      ol("Explain what happens at a consultation: a conversation about goals, an examination, possibly photos or scans, and a written plan and estimate.", "State how long it takes and whether it is free or charged.", "Offer real available times in the chat.", "Ask for the minimum: name and how to reach the patient, and which treatment they are interested in.", "Confirm by email with what to bring and how to change the booking."),
      p("Crescelo's built-in booking uses one slot length; for consultations that need a longer slot than your standard visit, choose an appropriate length or use a Calendly or Cal.com link for consultations. See [AI appointment booking](/blog/ai-appointment-booking)."),

      h2("Build trust honestly"),
      ul("Introduce your dentists and their qualifications accurately.", "Share real patient reviews with permission and from verifiable sources.", "Show before-and-after images only if you have consent and they comply with your local rules.", "Be clear about limits: not every patient is a candidate, and results vary.", "Explain safety and hygiene practices.", "Give a real way to talk to a person."),
      p("Trust also comes from honesty in the chat: an assistant that says 'that needs your dentist to assess' earns more confidence than one that promises everything."),

      h2("What the assistant must not do"),
      ul("Diagnose or say whether a specific person is suitable for a treatment.", "Promise outcomes, timelines or durability.", "Give a fixed price for a treatment before an examination.", "Pressure the visitor with false urgency or limited-time claims you cannot honour.", "Collect detailed health history or send photos in an open chat."),
      p("Write these rules into its instructions and test them with questions that tempt it, such as 'Am I a good candidate for veneers?'"),

      h2("Handling common cosmetic questions"),
      table(["Question", "Approach"], ["Will whitening damage my teeth?", "Explain generally what your dentists advise and recommend the consultation for personal advice; no medical reassurance"], ["Are implants painful?", "Share your approved description of the process and comfort measures; avoid promises"], ["How long do veneers last?", "Give your approved, cautious statement and mention that care matters"], ["Can I see examples?", "Point to approved examples on your site, and offer to show more at the consultation"], ["I have gum problems. Can I still get veneers?", "Say that it needs assessment, and offer a consultation"]),

      h2("Follow-up for people who are not ready"),
      p("Many cosmetic enquirers take weeks or months to decide. The assistant can offer to send an information guide by email, capture consent and a contact detail, and let your team follow up gently. Do not add anyone to marketing emails without a clear opt-in. See [conversational lead capture](/blog/conversational-lead-capture) and the [lead capture feature](/product/lead-capture)."),

      h2("Measure what matters"),
      table(["Metric", "Why"], ["Cosmetic enquiries and consultations booked", "Conversion"], ["Consultation to treatment acceptance", "The real outcome"], ["Questions asked most", "What your website should explain"], ["Out-of-hours enquiries", "Demand at the moment of interest"], ["Drop-off points in chat", "Where visitors lose interest"]),

      h2("A sample conversation"),
      table(["Speaker", "Message"], ["Visitor", "How much are veneers and would they suit me?"], ["Assistant", "Veneers are priced per tooth and vary with the material and the work needed, so we start with a consultation. Our range is from $X to $Y per tooth, and you will get a written estimate afterwards. Whether they suit you is something our dentists assess at the consultation, and I cannot say from here. It usually takes about 45 minutes. Would you like to see times?"], ["Visitor", "Yes. Do you do payment plans?"], ["Assistant", "We do. Our team can go through the options at your consultation, and financing is subject to approval. I can show you times now, or take your details for a call."]),
      p("The assistant gave a range, explained that suitability needs an assessment, mentioned payment plans with the right caveat and moved to booking."),

      h2("Consultation checklist for the practice"),
      ul("A private room and enough time, without rushing.", "Photos or scans taken with clear consent.", "A written estimate given after the consultation, not before.", "An honest discussion of alternatives and limits.", "A follow-up message a few days later, sent with consent."),
      p("The consultation is where trust is earned, so the chat's job is to get the right patients to it well informed, not to close the sale."),

      h2("Common mistakes"),
      ul("Quoting a price that the practice cannot honour after examination.", "Using before-and-after images without consent or within the wrong rules.", "Letting the assistant say whether someone is a good candidate.", "Making the consultation hard to book.", "Following up too aggressively, or without consent."),

      h2("Keep the promise you make in chat"),
      p("Whatever the assistant says about the consultation, such as its length, cost and what happens, must match what patients actually experience. Brief your team on what the chat says, and review it whenever your process changes. A patient who arrives expecting what they were told is far more likely to trust your recommendations and to go ahead."),

      h2("Frequently asked questions"),
      faq(
        ["Can a chatbot book cosmetic dentistry consultations?", "Yes. It can explain options in plain language, answer common questions from approved documents and book a consultation with real available times."],
        ["Should the chatbot quote prices for veneers or implants?", "Only published ranges that you can honour, with a clear note that a written estimate follows an examination."],
        ["Can it say whether I am a candidate?", "No. Suitability needs an examination. It should offer a consultation."],
        ["How do I keep the wording compliant?", "Have your dentists and a compliance adviser approve it, avoid guarantees and follow your local advertising rules."],
        ["What about patients who are not ready to book?", "Offer an information guide by email with consent and let your team follow up gently."],
        ["Should it show before-and-after photos?", "Only with consent and within your local rules, linking to approved examples on your website."],
      ),
      p("Try a consultation conversation on your own treatment descriptions in the [playground](/playground), read [AI chatbots for dental practices](/blog/ai-patient-scheduling-dental-practices) and [start a free trial](/login?mode=register)."),
    ],
  }),
];
