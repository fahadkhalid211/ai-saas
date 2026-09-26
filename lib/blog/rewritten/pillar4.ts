import { faq, h2, h3, note, ol, p, pillar, table, ul } from '../authoring';

export const PILLAR4 = [
  pillar({
    slug: 'ai-patient-scheduling-dental-practices',
    title: 'AI Chatbot for Dental Practices: Scheduling, Intake and Patient Questions',
    description: 'How dental practices use an AI chatbot to answer patient questions, book appointments by dentist and treatment, handle emergencies safely and protect patient privacy.',
    primaryKeyword: 'AI chatbot for dental practices',
    secondaryKeywords: ['dental chatbot', 'AI scheduling for dentists', 'dental appointment booking online', 'dental practice automation'],
    body: [
      p("A dental practice receives the same questions all day: Do you take my insurance? How much is a check-up? Do you see children? Can I be seen today, I have a toothache? Each call ties up the front desk while patients wait in reception, and each missed call or unanswered message is a new patient who may book elsewhere. An AI chatbot on the practice website can answer the routine questions instantly, book appointments into the right dentist's diary and pass anything urgent or clinical to your team. This guide explains how that works for a dental practice, what to set up, how to handle emergencies and privacy responsibly, and what to measure."),
      note("This article is general information, not legal or medical advice. Dental practices handle sensitive health information and are subject to rules that vary by country and region. Take advice from a qualified professional about your obligations before you go live."),

      h2("What patients ask before they book"),
      p("New patients research before they commit, often outside opening hours. The questions cluster into a few groups."),
      table(["Group", "Typical questions", "Answer from"], ["Cost and payment", "How much is a check-up, whitening, an implant consultation? Do you offer payment plans?", "Fee list and financing document"], ["Insurance", "Do you accept my provider? What does it cover?", "Insurance FAQ, with a clear line on what you cannot confirm"], ["First visit", "What happens at a new-patient appointment? How long does it take? What should I bring?", "New-patient guide"], ["Treatments", "Do you do braces, veneers, root canals, sedation?", "Treatment pages"], ["Practicalities", "Where are you, is there parking, are you wheelchair accessible, do you see children?", "Practice information"], ["Urgent problems", "I have a toothache, a broken tooth, swelling.", "Emergency policy and handover"]),
      p("Every one of these has an answer that already exists in your practice. The assistant's job is to read them accurately and say so when it does not know. See our guides on [dental insurance and financing FAQ automation](/blog/dental-insurance-financing-faq-automation) and [new patient intake automation](/blog/dental-new-patient-intake-automation)."),

      h2("How booking works in a dental practice"),
      p("Dental scheduling has its own rules. Appointment types have different lengths and need different resources: a hygiene visit, a filling and an implant consultation are not interchangeable. Some dentists see certain treatments only. Rooms and equipment matter. A good booking system models these things."),
      ul("**Appointment types with durations:** new-patient exam, hygiene, emergency slot, consultation, follow-up.", "**Practitioner rules:** which dentist or hygienist provides which type.", "**Rooms and equipment** where they limit availability.", "**Buffers** for cleaning and set-up between patients.", "**Protected emergency slots** kept free each day.", "**Real availability from your calendar,** with locking so two patients cannot take the same time."),
      p("See [multi-practitioner dental scheduling](/blog/multi-practitioner-dental-scheduling) for how to model this, and [AI appointment booking](/blog/ai-appointment-booking) for the general mechanism."),

      h2("Handling dental emergencies safely"),
      p("This is the most important design decision. A chatbot must never appear to triage a medical emergency on its own. The safe pattern has three parts."),
      ol("**Recognise urgency.** Words such as severe pain, swelling, bleeding, knocked-out tooth, difficulty swallowing or breathing, or fever with a toothache should trigger the emergency route immediately.", "**Give clear instructions.** State that for a life-threatening problem (trouble breathing or swallowing, severe swelling spreading to the face or neck, heavy bleeding, head injury) the patient should contact emergency services now. For a dental emergency during opening hours, give the practice phone number; out of hours, give your emergency line or the local emergency dental service.", "**Alert the team.** Notify the practice at once with the conversation, so a person can follow up."),
      p("The assistant should not diagnose, recommend medication or reassure. It should route. Write the wording with your clinical team and test it with realistic messages. See [dental emergency triage with AI chat](/blog/dental-emergency-triage-ai-chat) and [handling emergencies in automated chat](/blog/handling-emergencies-automated-chat)."),

      h2("Privacy: what to collect and what not to"),
      p("A chat is not the place for detailed health information. Keep the assistant's questions to what is needed to book: name, a way to contact the patient, the reason for the visit in general terms, and whether they are a new or existing patient. Avoid asking for medical history, medication lists or insurance member numbers in chat. Use your practice management system or secure forms for clinical intake."),
      ul("Tell visitors they are talking to an AI assistant and link to your privacy policy.", "Collect the minimum, and make sure conversations are not kept longer than needed.", "Ask any vendor where data is stored, who processes it, how long it is kept and how to delete it.", "In the United States, dental practices are generally covered entities under HIPAA. Do not put protected health information into any tool unless you have confirmed in writing that the vendor can meet your obligations, including a business associate agreement where required. In other regions, check the equivalent rules."),
      p("Our [HIPAA considerations for dental chatbots](/blog/hipaa-compliance-dental-chatbots) goes into more detail, and the [GDPR checklist for website chatbots](/blog/website-chatbot-gdpr-checklist) applies to practices serving people in Europe."),

      h2("New patients, recalls and existing patients"),
      p("Different patients want different things, and the assistant can serve each appropriately."),
      table(["Patient type", "What they want", "How the assistant helps"], ["New patient", "Price, fit, first-visit information, a slot", "Answers and books a new-patient exam; shares the welcome guide"], ["Existing patient", "Change or confirm an appointment, ask a simple question", "Reschedules, states the policy, hands over anything clinical"], ["Overdue for a check-up", "A gentle nudge and an easy booking", "Recall messages with a link to book; see [reducing your recall backlog](/blog/reduce-dental-recall-backlog-chat)"], ["Parent booking for a child", "A child-friendly explanation and suitable times", "Answers from your paediatric information; see [pediatric dental inquiries](/blog/pediatric-dental-inquiries-chat)"], ["Considering cosmetic work", "Options, cost ranges, a consultation", "Explains what you offer and books a consultation rather than quoting a treatment plan; see [cosmetic consultation booking](/blog/cosmetic-dentistry-consultation-booking)"]),

      h2("What to load into the knowledge base"),
      ol("Fee list and payment options, kept up to date.", "Which insurers you work with, and a line that coverage must be confirmed with the insurer.", "Treatment descriptions in plain language, approved by your dentists.", "The new-patient guide: what happens, how long, what to bring.", "Opening hours, holidays, address, parking, accessibility.", "Cancellation and lateness policy.", "Emergency policy and out-of-hours numbers."),
      p("Write in plain language and avoid guarantees. The assistant should not promise outcomes, prices for a specific treatment plan or insurance coverage."),

      h2("Reducing no-shows and gaps in the diary"),
      p("Empty chairs are expensive in a practice with fixed overheads. The same tools that work elsewhere apply: clear confirmations, reminders, easy rescheduling and a standby list. Recall reminders bring back patients who are overdue. See [how to reduce no-shows](/blog/eliminate-service-no-shows-playbook) and [patient retention with front desk automation](/blog/patient-retention-front-desk-automation-dental)."),

      h2("What it costs and how to judge the return"),
      p("Compare the monthly cost of an assistant with the value of the extra new patients it converts and the front desk time it saves. Take a cautious view: if five extra new-patient bookings a month would cover the plan several times over, the decision is easy; if not, wait. Crescelo's plans start at $49 a month, with booking and calendar sync from the $149 Growth plan; see [pricing](/pricing). You connect your own AI provider and pay them directly for usage, which is typically small. The [ROI guide](/blog/ai-website-assistant-roi-calculator) has the method."),

      h2("A launch checklist for a dental practice"),
      ul("Clinical lead has approved the wording on treatments, emergencies and insurance.", "Emergency handover tested with ten realistic messages.", "The assistant states that it is an AI and links to the privacy policy.", "It does not ask for medical history or insurance numbers.", "Booking tested for each appointment type and practitioner, including two people choosing the same slot.", "Confirmations and reminders reviewed.", "A named person reviews conversations each week for the first month."),

      h2("A sample conversation with a new patient"),
      table(["Speaker", "Message"], ["Patient", "Hi, I have not been to a dentist in years and I am nervous. Do you take new patients and how much is a first visit?"], ["Assistant", "Hello, and thank you for reaching out. Yes, we are welcoming new patients. A new-patient exam with X-rays is $95 and takes about 45 minutes. Many of our patients feel nervous, and the team will take things at your pace. Would you like to see available times?"], ["Patient", "Yes, mornings if possible."], ["Assistant", "I can offer Tuesday at 9:15, Wednesday at 8:30 or Friday at 10:00. Which suits you?"], ["Patient", "Wednesday. Do you take Delta insurance?"], ["Assistant", "Our insurance guide lists the providers we work with, and Delta is on it. Coverage depends on your plan, so please check the details with Delta before your visit. Shall I book Wednesday at 8:30 under your name?"]),
      p("The assistant answered from the price list and insurance guide, acknowledged the patient's nerves in a warm way, avoided promising coverage and moved smoothly to a booking. It did not ask about the patient's health history."),

      h2("What the front desk does differently afterwards"),
      ul("Starts the day by reading overnight conversations and bookings instead of a pile of voicemails.", "Follows up on unanswered questions and adds the answers to the knowledge base.", "Handles the emergency alerts immediately, with context in front of them.", "Spends reception time on patients in the building, not on the same five questions by phone."),

      h2("Common mistakes"),
      ul("Letting the assistant answer clinical questions such as whether a symptom is serious.", "Not testing the emergency route with realistic messages before launch.", "Loading an out-of-date fee list.", "Asking for medical history in the chat.", "Making promises about insurance coverage.", "Forgetting to tell visitors that they are talking to an AI."),

      h2("Phrases the assistant should never use"),
      p("Agree a list of things the assistant must not say, and put it in your instructions and test it. Examples: 'that sounds like nothing to worry about', 'you should take ibuprofen', 'your insurance will cover that', 'this treatment is guaranteed', 'you do not need to see a dentist'. Each of these gives clinical or financial assurance that only a professional who has examined the patient can give. A short list of prohibited statements, written with your clinical lead, is one of the most valuable safety measures you can add."),

      h2("Frequently asked questions"),
      faq(
        ["Can a chatbot book dental appointments?", "Yes. With a booking-enabled assistant, patients choose an appointment type and a free time, and the booking is confirmed with protection against double booking."],
        ["Is it safe to use a chatbot for emergencies?", "The assistant should never triage. It should recognise urgent wording, give clear instructions to contact emergency services or the practice, and alert your team immediately."],
        ["Can it answer insurance questions?", "It can share which insurers you work with and general guidance from your documents, but it should say that coverage must be confirmed with the insurer and should not promise anything."],
        ["Does a dental chatbot need to be HIPAA compliant?", "In the United States, practices are generally covered entities. Do not put protected health information in a tool unless you have confirmed in writing that the vendor meets your obligations. Keep chat questions to what is needed to book."],
        ["How much does it cost?", "Plans for small practices start at tens of dollars a month plus a small AI usage cost. Compare with the value of recovered bookings and saved front desk time."],
        ["Will it replace my receptionist?", "No. It takes routine questions and after-hours bookings so your team can focus on patients in the practice."],
      ),
      p("Try it with your own fee list and new-patient guide in the [playground](/playground), then [start a free trial](/login?mode=register) if it fits."),
    ],
  }),

  pillar({
    slug: 'ai-assistant-real-estate-lead-capture',
    title: 'AI Assistant for Real Estate Agents: Capture Leads and Book Viewings',
    description: 'How real estate agencies use an AI website assistant to answer listing questions, qualify buyers and sellers, book viewings and follow up on leads that arrive out of hours.',
    primaryKeyword: 'AI chatbot for real estate',
    secondaryKeywords: ['real estate lead capture chatbot', 'AI assistant for realtors', 'property viewing booking chatbot', 'real estate website chat'],
    body: [
      p("Real estate is a business of timing. A buyer who sends an enquiry about a listing at 9 p.m. is comparing three agents, and the first useful reply often wins the conversation. Yet agents are out at viewings, on calls and in meetings for much of the day. An AI assistant on your website and listing pages can answer the routine questions, qualify the enquiry, book viewings into your diary and hand you a warm lead with the full conversation. This guide explains how to set one up for an agency or independent agent, what to load into it, how to qualify buyers and sellers, and how to stay within the rules."),
      note("Real estate advertising, agency and privacy rules differ by country and state. This is general information, not legal advice."),

      h2("The enquiries an agency receives"),
      table(["Visitor", "Typical questions", "What the assistant should do"], ["Buyer", "Is this property still available? What is the price, size, tax, service charge? Can I see it this week?", "Answer from listing details, offer viewing slots, capture contact details"], ["Seller", "What is my home worth? How do you market properties? What are your fees?", "Explain your process and fees, capture details, book a valuation appointment"], ["Renter", "Is it pet friendly? What is the deposit? When can I move in?", "Answer from listing and tenancy information, offer a viewing"], ["Investor", "What is the yield? What is the area like?", "Share the information you publish, and route detailed questions to a person"], ["Neighbour or browser", "General local questions", "Answer from your area guides, capture interest"]),
      p("The assistant is strongest on repeatable facts. Anything that requires judgement, valuation or negotiation belongs to you."),

      h2("What to give the assistant"),
      ol("**Listing information:** for each property, price, size, rooms, features, status, address and key terms. See [loading brochures and listing documents](/blog/mls-property-brochure-ingestion-chat).", "**Your services and fees:** how you market, valuation process, commission or fee structure where you publish it.", "**Neighbourhood guides:** schools, transport, amenities, character. See [neighbourhood guides and local knowledge](/blog/neighborhood-guides-local-knowledge-real-estate).", "**Process guides:** how buying, selling or renting works with you, and the documents people need.", "**Availability:** your calendar and viewing windows."),
      p("Keep listing data current. A sold property that the assistant still advertises damages trust faster than an unanswered message. If your listings change daily, set a routine for updating the knowledge base, or rely on pages the assistant re-reads."),

      h2("Qualifying buyers and sellers without interrogating them"),
      p("A good enquiry chat sounds like a helpful colleague, not a form. The assistant asks a few relevant questions in a natural order, and each answer helps you prioritise."),
      table(["Buyer questions", "Why it matters"], ["What are you looking for and where?", "Match with listings and areas"], ["What is your budget range?", "Sets realistic options"], ["When would you like to move?", "Urgency"], ["Are you pre-approved or paying cash?", "Readiness"], ["Do you have a property to sell first?", "Timing and dependency"]),
      table(["Seller questions", "Why it matters"], ["Where is the property and what type is it?", "Fit with your area and service"], ["Why and when are you thinking of selling?", "Timing and motivation"], ["Have you had a valuation before?", "Competition and expectations"], ["Would you like a valuation visit?", "The next step"]),
      p("Do not make the assistant ask everything. Let it ask what is needed to book a viewing or valuation and offer to continue with a person. See [buyer versus seller lead qualification](/blog/buyer-vs-seller-lead-qualification-chat) and [AI lead qualification framework](/blog/ai-lead-qualification-framework)."),

      h2("Booking viewings and valuations"),
      p("A viewing booking needs more than a time. It needs the property, the agent who will attend, travel time between viewings and sometimes access arrangements. Offering real slots inside the chat converts an interested visitor into an appointment before they cool off. See [scheduling property showings in chat](/blog/schedule-property-showings-chat) and [open house registration workflows](/blog/open-house-registration-workflows-chat)."),
      ul("Set separate appointment types: viewing, valuation, buyer consultation.", "Add buffers for travel between properties.", "Assign the right agent by area or property.", "Capture name, phone, email and the property of interest.", "Send a confirmation with the address, agent name and how to change the booking."),

      h2("After-hours enquiries: where the assistant earns its keep"),
      p("Property portals and social media drive enquiries in the evening and at weekends. If the first reply arrives the next afternoon, the buyer has often already spoken to someone else. An assistant answers immediately, books a slot and puts the lead in your inbox for the morning with the conversation attached. See [after-hours real estate lead capture](/blog/after-hours-real-estate-lead-capture)."),

      h2("Handing leads to your team"),
      p("A lead is only useful if you see it quickly and understand it. Configure instant email alerts, and if you use a customer database, send leads there with the conversation. Route by area or property type so the right agent sees it. A summary at the top of each lead, what the person wants, budget, timing, viewing booked, saves you reading the full chat. See [instant lead routing in chat](/blog/instant-lead-routing-chat) and [CRM integration](/blog/crm-integration-ai-chatbot-leads)."),

      h2("Specific segments"),
      h3("Commercial real estate"),
      p("Commercial enquiries are fewer and more complex: use, size, lease terms, timing. The assistant qualifies and passes on rather than trying to advise. See [commercial real estate inquiry qualification](/blog/commercial-real-estate-inquiry-qualification)."),
      h3("Mortgage brokers"),
      p("For brokers working alongside agents, the chat can book consultations and explain your process without giving financial advice. See [mortgage broker consultation booking](/blog/mortgage-broker-consultation-booking-chat)."),
      h3("Property management and tenants"),
      p("For lettings, tenants ask about applications, maintenance and deposits. See [tenant application and property management FAQ](/blog/tenant-application-property-management-faq-chat)."),

      h2("Rules to respect"),
      ul("Do not let the assistant give legal, tax or financial advice, or promise returns.", "State clearly when information is indicative and a person will confirm.", "Follow your local advertising and fair housing or equality rules; the assistant should not steer or discriminate.", "Tell visitors they are talking to an AI and link to your privacy policy.", "Keep personal data to what you need and understand how long it is stored."),

      h2("What it costs and how to think about return"),
      p("The relevant comparison is the commission on one extra transaction, or the value of one extra valuation appointment, against a monthly plan. Because real estate enquiries are high-value, even a small recovery matters. Crescelo's plans start at $49 a month, with booking and calendar sync on the $149 Growth plan; see [pricing](/pricing). You connect your own AI provider and pay it directly for usage."),

      h2("Setup in a day"),
      ol("Collect listings, fee information and area guides into short documents.", "Load them and set a professional but friendly tone.", "Set appointment types and connect your calendar.", "Configure lead alerts and routing.", "Test buyer, seller and renter conversations, and three questions the documents cannot answer.", "Add the widget to your site and listing pages.", "Review the first month of conversations every week."),

      h2("A sample conversation with a buyer"),
      table(["Speaker", "Message"], ["Buyer", "Is the three-bed on Maple Road still available and what are the council tax and service charge?"], ["Assistant", "Yes, 14 Maple Road is currently available at $425,000. It is a three-bedroom semi with a garden and off-street parking. The brochure lists annual property tax of $3,120 and no service charge because it is freehold. Would you like to view it this week?"], ["Buyer", "Saturday morning if possible."], ["Assistant", "Saturday at 10:00 or 11:30 is free with Jordan. Which would you like?"], ["Buyer", "11:30."], ["Assistant", "Booked. May I have your name and mobile number so Jordan can confirm, and are you buying with a mortgage or cash? That helps Jordan prepare."]),
      p("The assistant answered from the listing brochure, offered real slots and asked one qualifying question at the natural moment. The agent receives a booked viewing with the buyer's name, number and funding position."),

      h2("Speed and follow-up: the first hour"),
      p("A useful discipline is to treat the first hour after an enquiry as the most valuable. The assistant covers the first minute. Your team covers the rest: a call or message within the hour, a viewing confirmation and a short note on what the buyer wants. Send yourself a text for hot leads, and check them at set times so no one waits until the next day. If your team is small, agree who looks at leads at what time, and use the conversation summary to prepare for the call."),

      h2("Common mistakes"),
      ul("Leaving sold or withdrawn listings in the knowledge base.", "Letting the assistant estimate a property's value.", "Asking for too much information before offering a viewing.", "Not routing leads to the right agent.", "Forgetting to update viewing availability around holidays.", "Not recording where the enquiry came from."),

      h2("Ideas to make it work harder"),
      ul("Add the assistant to individual listing pages so questions arrive with context.", "Put a link to a hosted chat in portal listings and social posts.", "Load your buying and selling guides so it can answer process questions.", "Invite visitors to get an alert when similar properties are listed, with a clear opt-in.", "Use the weekly review to find which properties get the most questions and adjust your marketing."),

      h2("A weekly review that keeps it sharp"),
      p("Spend fifteen minutes each week on three checks. First, read the conversations that did not end in a booking or lead and note why: a missing answer, a stale listing or a visitor who wanted a person. Second, list the questions the assistant could not answer and add the answers to the knowledge base, starting with the ones asked most. Third, compare viewings booked with viewings attended, and adjust confirmations and reminders if people are not turning up. This small routine is what separates an assistant that gradually improves from one that quietly goes out of date. It also gives you a clear picture of what buyers actually want, which is useful for marketing and for advising sellers."),
      p("Share the findings with your team. Agents often hear the same questions in viewings that the assistant sees online, and putting both together makes your listings and your answers better."),

      h2("Frequently asked questions"),
      faq(
        ["Can an AI chatbot answer questions about my listings?", "Yes, if you load the listing details. It answers from them and should say when it does not know."],
        ["Can it book viewings?", "Yes. With booking enabled it offers real slots and confirms the viewing, with the agent and property recorded."],
        ["Will it replace real estate agents?", "No. It handles routine questions and out-of-hours enquiries so agents can spend time with buyers and sellers."],
        ["Can it estimate property values?", "It should not. Valuation needs a person. Let it explain your process and book a valuation appointment."],
        ["How do I keep listings up to date?", "Update the knowledge base whenever listings change, or use pages the assistant re-reads. Remove sold properties promptly."],
        ["Is it suitable for lettings and property management?", "Yes. Load tenancy information and use it for applications, viewings and common tenant questions."],
      ),
      p("Try it with a listing brochure in the [playground](/playground), then [start a free trial](/login?mode=register) to connect your calendar and website."),
    ],
  }),

  pillar({
    slug: 'ai-intake-scheduling-professional-services',
    title: 'AI Chatbot for Law Firms and Professional Services: Intake and Consultations',
    description: 'How law firms, accountants and consultants use an AI assistant for client intake and consultation booking, with care over confidentiality, advice and conflicts.',
    primaryKeyword: 'AI chatbot for law firms',
    secondaryKeywords: ['legal intake automation', 'law firm chatbot', 'consultation booking chatbot', 'AI intake for professional services'],
    body: [
      p("Professional services firms live on consultations. A prospective client who cannot get a straight answer or a booking quickly will contact another firm, and the enquiry that arrives on a Sunday evening is often the most anxious and the most valuable. An AI assistant can greet visitors, explain what you do and how you charge, capture the basics of the matter and book an initial consultation, while making clear that it is not giving advice. This guide covers how law firms, accountants, financial advisers and consultants can use one responsibly."),
      note("This article is general information, not legal advice. Professional conduct rules on advertising, confidentiality and client communication vary by jurisdiction and profession. Check the rules that apply to you and, where needed, ask your regulator or a professional adviser before deploying any tool that talks to the public."),

      h2("What the assistant should and should not do"),
      table(["It should", "It should not"], ["Explain your practice areas and how the process works", "Give legal, tax or financial advice"], ["State how you charge, in the terms you publish", "Quote a fee for a specific matter unless you have approved it"], ["Capture contact details and a brief description of the enquiry", "Ask for confidential details or documents in the chat"], ["Book an initial consultation", "Promise outcomes or timelines"], ["Say clearly that it is an AI and that no advice is given or lawyer-client relationship formed by the chat", "Pretend to be a lawyer or adviser"], ["Hand over urgent matters to a person", "Assess the merits of a case"]),
      p("This is a front door, not a fee earner. Its value is speed, consistency and capture."),

      h2("Confidentiality and the first message"),
      p("Visitors, especially those with sensitive problems, often type more than they should. Design the opening to prevent that. A short notice such as 'I am an AI assistant. I can explain our services and book a consultation. Please do not share confidential details here; we will discuss your matter in the consultation' sets the right expectation. The assistant should then steer away from details and toward booking. It should also state that the chat does not create a client relationship. Have your professional-conduct or compliance lead approve the wording. See [confidentiality and privilege with an AI website assistant](/blog/confidentiality-attorney-client-privilege-ai-chat)."),

      h2("Intake that saves the first ten minutes"),
      p("Well-designed intake collects just enough to prepare and to check for conflicts, without turning into a legal questionnaire. A sensible minimum is below."),
      table(["Field", "Why"], ["Name and preferred contact method", "To reply and book"], ["Practice area or type of matter, in the visitor's words", "To route to the right person"], ["Urgency or key dates (a hearing, a deadline)", "To prioritise"], ["Other parties' names, if you check conflicts at intake", "Conflict check; ask only if you need it and only what you need"], ["How they found you", "Marketing insight"]),
      p("Send this to your intake team by email or into your case management system with the conversation attached. See [legal intake automation and conflict checks](/blog/legal-intake-automation-conflict-checks)."),

      h2("Speed matters, especially for urgent matters"),
      p("In areas such as personal injury, family or criminal law, immigration and employment, people search when something has just happened, and they contact several firms. Response time is often the deciding factor. An assistant that replies in seconds, explains your process and books a call within the hour can be the difference. See [personal injury lead triage and response time](/blog/personal-injury-lead-triage-response-time)."),

      h2("Different professions, different needs"),
      h3("Law firms"),
      p("Practice area routing, conflict checks, consultation booking and clear no-advice language. Multilingual intake can be valuable for immigration practices; see [immigration law multilingual intake](/blog/immigration-law-multilingual-intake-chat) and [explaining legal fees and billing models](/blog/explaining-legal-fees-billing-models-chat)."),
      h3("Accountants and tax advisers"),
      p("Seasonal peaks matter: an assistant can answer document checklist questions, explain deadlines you publish and book onboarding calls. See [CPA and tax season intake](/blog/cpa-accounting-tax-season-intake)."),
      h3("Financial advisers"),
      p("Regulation is strict. The assistant must not give recommendations or imply a recommendation, and should book consultations and explain your process. See [financial advisor consultation booking and compliance](/blog/financial-advisor-consultation-booking-compliance)."),
      h3("Corporate and B2B practices"),
      p("Routing by client type, size and matter matters more than volume. See [corporate law client routing](/blog/corporate-law-client-routing-chat)."),
      h3("Consultants and thought leaders"),
      p("Convert readers into consultations; see [converting thought leadership traffic into consultations](/blog/convert-thought-leadership-traffic-consultations)."),

      h2("Booking initial consultations"),
      ol("Define consultation types: free 15-minute call, paid 45-minute meeting, in-person or video.", "Set who conducts each and when.", "Set buffers and preparation time.", "Consider a small fee or deposit for longer consultations, where lawful and appropriate in your profession.", "Send a confirmation with what to prepare, who they will meet and how to change the time."),
      p("Booking inside the chat catches the visitor when they are ready. See [AI appointment booking](/blog/ai-appointment-booking)."),

      h2("Data protection"),
      ul("Tell visitors they are talking to an AI and link to your privacy policy.", "Collect the minimum and avoid sensitive details in chat.", "Ask any vendor where data is stored, who processes it and how to delete it.", "Choose your own AI provider where possible so you know who sees the messages; with a bring-your-own-key product you decide.", "Set a retention rule and delete what you no longer need.", "Where you serve people in Europe, read the [GDPR checklist](/blog/website-chatbot-gdpr-checklist)."),

      h2("Measuring the result"),
      ul("Enquiries received outside office hours, and how many booked.", "Time from enquiry to first response.", "Consultations booked from the website, and conversion to clients.", "Enquiries routed to the wrong practice area, which show where the descriptions are unclear.", "Questions the assistant could not answer, which tell you what to publish."),

      h2("What it costs"),
      p("Firms usually compare the plan price with the fee value of a single new client. Even for a modest-fee practice, one recovered consultation a month can pay for a plan several times over; for a high-fee practice it is easier still. Crescelo starts at $49 a month, with booking on the $149 Growth plan; see [pricing](/pricing)."),

      h2("A sample first conversation"),
      table(["Speaker", "Message"], ["Visitor", "I was in a car accident two weeks ago. Can I talk to someone about it?"], ["Assistant", "I am sorry to hear that. I am an AI assistant for the firm, and I cannot give legal advice, but I can tell you how we work and arrange a free consultation with one of our lawyers. Please do not share details of the accident here; the lawyer will go through them with you. Would you like to book a call?"], ["Visitor", "Yes, is tomorrow possible?"], ["Assistant", "I can offer tomorrow at 10:00 or 2:30. What name and number should we use? If anything is urgent, such as an injury that needs care, please contact emergency services or your doctor first."]),
      p("The assistant was empathetic, stated its limits, avoided details, offered real times and included a safety line. The conversation was then handed to the intake team."),

      h2("Wording that protects you"),
      ul("A visible statement that the assistant is an AI and does not give legal, tax or financial advice.", "A statement that using the chat does not create a client relationship.", "A request not to share confidential information in the chat.", "A link to your privacy policy.", "A clear route to a person."),
      p("Have the wording reviewed by whoever handles your firm's compliance, and re-review it when your services change."),

      h2("What to measure"),
      ul("Number of enquiries by practice area and how many were routed correctly.", "Time from enquiry to first personal contact.", "Consultations booked and consultations attended.", "Consultations that became clients.", "Common questions that your website does not answer."),

      h2("Common mistakes"),
      ul("Letting the assistant comment on the merits of a case.", "Asking for detailed facts in the chat.", "Quoting a fee for a specific matter without approval.", "Not testing sensitive scenarios such as domestic abuse or criminal charges.", "Failing to update your descriptions when practice areas change."),
      p("For sensitive situations, decide in advance what the assistant says and where it directs the visitor, for example to emergency services or a support line, and test those scenarios with your team."),

      h2("Keeping records"),
      p("Because professional firms have duties around records, decide up front how long chat transcripts are kept, who can read them and how they are stored. Treat them as part of your intake records where they contain a prospective client's information, and delete them according to your retention policy. Document your decisions."),

      h2("Setting it up in a week"),
      ol("Day 1: agree scope and wording with the partner or compliance lead: what the assistant may say, what it must never say and where it hands over.", "Day 2: write the documents: practice areas, how you work, how you charge, what to prepare for a consultation, opening hours.", "Day 3: load them, set the greeting and the no-advice notice, and configure intake fields and alerts.", "Day 4: set consultation types, calendar and confirmations.", "Day 5: test with sensitive scenarios, urgent matters and unanswerable questions, and have a partner try to break it.", "Then launch quietly, review every conversation for two weeks and adjust."),
      p("A phased launch, first on one practice area or one page, lets you build confidence before you widen it. Keep a log of changes so you can show your regulator or insurer how the tool is governed if asked."),

      h2("Frequently asked questions"),
      faq(
        ["Can a law firm use an AI chatbot?", "Yes, for intake and booking, provided the wording is approved, it does not give advice and it complies with your professional conduct and privacy rules."],
        ["Does chatting with a bot create a lawyer-client relationship?", "Your notice should say it does not, and the assistant should not give advice. Have your compliance lead approve the wording, because the rules differ by jurisdiction."],
        ["Should the chatbot ask about the details of the case?", "Keep it to a general description and urgency. Detailed and confidential information belongs in the consultation."],
        ["Can it check for conflicts of interest?", "It can collect the names you need for a conflict check and pass them to your intake team. The check itself should be done by your usual process."],
        ["Is it suitable for accountants and financial advisers?", "Yes, for explaining your process, listing documents and booking consultations, but it should not give tax or financial advice."],
        ["How is client data protected?", "Ask your vendor about storage, sub-processors and deletion, choose your own AI provider where possible and collect only what you need."],
      ),
      p("Try the wording with your own practice information in the [playground](/playground) and read how the [AI assistant feature](/product/ai-assistant) answers only from your content."),
    ],
  }),

  pillar({
    slug: 'home-service-contractor-ai-lead-capture',
    title: 'AI Lead Capture for Home Service Contractors: Plumbers, HVAC, Roofers and More',
    description: 'How home service contractors use an AI assistant to capture job details, answer pricing questions, handle emergencies and book estimates while their crews are on site.',
    primaryKeyword: 'AI lead capture for home service contractors',
    secondaryKeywords: ['AI chatbot for plumbers', 'HVAC lead capture chatbot', 'roofing contractor chatbot', 'home services AI assistant'],
    body: [
      p("A contractor's phone rings when their hands are full. The plumber is under a sink, the roofer is on a ladder, the electrician is behind a panel. Every missed call is a homeowner who will try the next name on the list, and in home services the first contractor to respond usually wins the job. An AI assistant on your website can answer the routine questions, collect the details of the job, book an estimate or a service call and alert you at once when something is urgent. This guide explains how it fits a trade business, what information to give it, how to handle emergencies and what to measure."),

      h2("What homeowners ask before they call"),
      table(["Question", "What they really want to know"], ["Do you serve my area?", "Whether you will come"], ["How much does a repair or a new install cost?", "A ballpark so they can decide"], ["Are you available today or this week?", "Speed"], ["Are you licensed and insured?", "Trust"], ["Do you do emergency callouts?", "Whether you can help right now"], ["What do you charge for an estimate?", "Whether they are committing"], ["Do you work on my type of system or roof?", "Fit"]),
      p("Contractors know all these answers, but they are rarely written where a visitor can find them at midnight. An assistant reads them from your documents and replies at once."),

      h2("What the assistant needs to know"),
      ol("**Services and trades:** what you do and do not do, by name.", "**Service area:** towns, postcodes or a radius. See [service area verification](/blog/service-area-verification-ai-chat).", "**Pricing guidance:** call-out fee, hourly rate or typical ranges for common jobs, with the caveat that a firm price needs an inspection.", "**Hours and emergency policy:** when you answer, what counts as an emergency, out-of-hours fees.", "**Credentials:** licences, insurance and guarantees you can state truthfully.", "**Process:** how estimates work, how long jobs take, how you schedule."),
      p("Never let the assistant promise a fixed price without inspection, or a guaranteed arrival time. Write what it may say and what must wait for a person."),

      h2("Capturing the job, not just the contact"),
      p("A lead with a phone number and 'need help' costs you a phone call to find out what is wrong. A lead with the job description, address, photos and urgency lets you decide and price before you call. The assistant should ask the questions a good dispatcher would ask."),
      table(["Trade", "Questions that help"], ["Plumbing", "What is happening (leak, blocked, no hot water)? Where? Is the water off? How long? Any photos?"], ["HVAC", "Heating or cooling? Age and type of system? Any error codes? When did it stop?"], ["Roofing", "Leak or storm damage? Roof type and age? Any interior damage? Insurance claim involved?"], ["Electrical", "What is happening? Any burning smell, sparks or tripped breakers? Which room?"], ["Landscaping and tree service", "What work? Size of area? Access? Any hazards such as power lines?"], ["Cleaning", "Type and size of property? Frequency? Any special requirements?"]),
      p("See guides for each trade: [plumbing diagnostic intake](/blog/plumbing-diagnostic-intake-chat), [HVAC seasonal booking](/blog/hvac-seasonal-tune-up-booking-automation), [roofing emergency capture](/blog/roofing-emergency-lead-capture-storm-damage), [electrician scheduling](/blog/electrician-service-call-scheduling-chat), [landscaping and tree service scoping](/blog/landscaping-tree-service-scoping-chat), [pest control](/blog/pest-control-emergency-inspection-chat) and [residential cleaning pricing](/blog/residential-cleaning-pricing-calculator-chat)."),

      h2("Handling emergencies properly"),
      p("Home service emergencies range from an inconvenient leak to a real danger. The assistant must never make a safety judgement, but it should recognise urgent wording and act."),
      ol("**Recognise it:** words such as flooding, burst, gas smell, no heat with vulnerable people, sparks, fire, storm damage.", "**Give safety instructions you have approved:** for example, for a gas smell, leave the building and call the gas emergency number or emergency services; for a burst pipe, turn off the water at the stop valve if it is safe to do so.", "**Alert you immediately** by text and email, with the conversation, address and phone number.", "**Set expectations honestly:** an estimated response time or that someone will call back within a set period."),
      p("Write the safety wording with your own experience and any regulator guidance that applies. See [emergency dispatch workflows in AI chat](/blog/emergency-dispatch-workflows-ai-chat) and [handling emergencies in automated chat](/blog/handling-emergencies-automated-chat)."),

      h2("Booking estimates and service calls"),
      p("For non-urgent work, an estimate or service call booked directly from the chat converts the visitor at the moment of interest. Offer windows rather than exact times if your schedule shifts, for example 'Thursday between 9 and 12'. Set separate appointment types for estimates, service calls and emergencies, with buffers for travel. Send a confirmation with the arrival window, what to prepare and how to change it. See [estimate requests and project scoping](/blog/estimate-requests-project-scoping-chat) and [AI appointment booking](/blog/ai-appointment-booking)."),

      h2("Working with your dispatcher and crew"),
      p("The assistant is not a replacement for a dispatcher. It feeds one. It collects the information, books what can be booked and hands over what needs judgement. Your dispatcher or office manager reviews the day's leads and adjusts. See [dispatcher and AI collaboration](/blog/home-service-dispatcher-ai-collaboration). Set up instant alerts by text and email so leads are seen within minutes, and consider sending them to a shared inbox so someone always sees them."),

      h2("Seasonal peaks and storms"),
      p("Demand in trades comes in waves: the first cold snap, the first heatwave, a storm. During a peak you cannot answer everything by phone. The assistant can keep answering, collect details and queue jobs by urgency. Prepare for peaks by updating your documents with the current lead times and any emergency pricing, so the assistant does not promise what you cannot deliver. See [seasonality management with an AI assistant](/blog/seasonality-management-ai-assistant)."),

      h2("Pricing and cost"),
      p("Compare the monthly cost with the value of the jobs it recovers. If your average job is worth several hundred dollars and the assistant recovers two or three a month that you would have missed, it usually pays for itself. Crescelo's plans start at $49 a month; booking and calendar sync are on the $149 Growth plan; see [pricing](/pricing). See also [the local service business tech stack](/blog/local-service-business-tech-stack) for how the pieces fit together."),

      h2("A one-day setup plan"),
      ol("Write down your services, service area, pricing guidance and emergency policy.", "Load them into the assistant and set a plain, friendly tone.", "Add the intake questions for your trade.", "Set alerts by text and email for new leads.", "Test five typical jobs and two emergencies, plus a question outside your area.", "Add the assistant to your website and your Google Business Profile links.", "Review leads daily for the first two weeks."),

      h2("A sample conversation with a homeowner"),
      table(["Speaker", "Message"], ["Homeowner", "My water heater is leaking from the bottom. Can someone come today?"], ["Assistant", "That sounds stressful. If water is spreading, turn off the water supply to the heater and the power or gas to it if it is safe to do so. I can arrange an emergency visit. Emergency callouts are $120 plus the repair, and we have a technician free this afternoon. What is the address and best mobile number?"], ["Homeowner", "41 Brook Lane, 555-0132."], ["Assistant", "Thanks. I am alerting the team now, and someone will call within 15 minutes to confirm arrival. Could you send a photo of the heater if you can?"]),
      p("The assistant gave safety guidance you approved, stated the callout fee, collected the address and number and alerted the team at once. The plumber sees the job before the call."),

      h2("What a good lead notification contains"),
      table(["Field", "Example"], ["Job type and urgency", "Water heater leak, emergency"], ["Address and area check", "41 Brook Lane, inside service area"], ["Contact details", "Mobile number and preferred contact"], ["Description and photos", "Leaking from bottom, photo attached"], ["Conversation link", "Full chat"], ["What the customer was told", "Callout fee, callback within 15 minutes"]),
      p("If the notification contains these, your dispatcher can decide in seconds who goes and what to bring."),

      h2("Tips for different sizes of business"),
      ul("**One-person business:** use the assistant to answer questions and collect details, and set text alerts so you see hot leads between jobs.", "**Small crew:** route by trade or area, and share the inbox with your office manager.", "**Growing company:** send leads to your job management or CRM system by webhook and review conversion by source."),

      h2("Common mistakes"),
      ul("Promising fixed prices or arrival times.", "Not stating your service area, leading to wasted enquiries.", "Ignoring alerts because they go to an unread inbox.", "Not giving safety wording for emergencies.", "Failing to update lead times during busy periods.", "Not asking for photos, which help you price and prepare."),

      h2("Reviews and repeat business"),
      p("After a completed job, a friendly follow-up asking for a review and offering a maintenance reminder brings in referrals and repeat work. Keep it short and send it once."),

      h2("Your Google Business Profile and local search"),
      p("Many home service customers find you through Google Maps and local search. Your profile can link to a hosted chat page or your website, so visitors who tap through meet the assistant and can ask about pricing, availability and service area straight away. Keep your hours, services and area consistent between your profile, your website and the assistant's documents, because mismatches confuse customers and search engines. Reviews matter too: after a job, a short message asking for a review, sent by you, helps the next customer choose you. See [converting Google Business Profile traffic in chat](/blog/convert-google-business-traffic-chat) and [the local SEO and conversion blueprint](/blog/local-seo-conversion-blueprint)."),

      h2("Frequently asked questions"),
      faq(
        ["Can an AI chatbot take job requests for a plumber or electrician?", "Yes. It asks the questions a dispatcher would, records the answers and address, and sends the lead to you instantly."],
        ["Can it handle emergency calls?", "It should not decide safety. It can recognise urgent wording, give approved safety instructions and alert you immediately, and it should not promise arrival times unless you have set them."],
        ["Can it give a price?", "It can share ranges and call-out fees you have approved, and say that a firm price needs an inspection."],
        ["Will it work when I am on a job site?", "Yes. It works at any hour and alerts you when a lead needs you."],
        ["Does it need a website?", "It works best on a website or a hosted page. You can also share a hosted chat link from your Google Business Profile or social pages."],
        ["What does it cost?", "Plans start at tens of dollars a month. Compare the price with the value of one or two extra jobs a month."],
      ),
      p("Try it with your own price list and service area in the [playground](/playground), then [start a free trial](/login?mode=register). The [lead capture feature](/product/lead-capture) explains how leads reach you."),
    ],
  }),

  pillar({
    slug: 'conversational-lead-capture',
    title: 'Conversational Lead Capture: How to Turn Website Chats Into Qualified Leads',
    description: 'Learn how conversational lead capture works, why it beats static forms for many service businesses, what to ask, when to ask it and how to deliver leads to your team fast.',
    primaryKeyword: 'conversational lead capture',
    secondaryKeywords: ['lead generation chatbot', 'chatbot lead capture', 'lead capture form alternatives', 'capture leads from website chat'],
    body: [
      p("A contact form asks a stranger to fill in fields before they have got anything back. A conversation gives something first: an answer, a price range, an available time, and then asks for contact details when the visitor sees a reason to share them. That difference is the idea behind conversational lead capture. Done well, it collects more enquiries, better information and a clear record of what each person wanted. Done badly, it feels like an interrogation. This guide explains how to design it, what to ask and when, how to deliver leads to your team and how to measure whether it works."),

      h2("Why forms lose visitors"),
      p("Forms are not bad, they are limited. A visitor with a question does not want to fill in six fields to ask it and wait a day for a reply. Common reasons forms underperform:"),
      ul("**Effort first, value later.** The visitor pays with time and personal data before getting anything.", "**No answer to the actual question.** Someone wondering about price or availability is not helped by 'we will get back to you'.", "**Too many fields.** Each extra field lowers completion.", "**Anxiety.** People worry about spam and sales calls.", "**Slow response.** By the time you reply, they have moved on."),
      p("See [why contact us forms fail](/blog/why-contact-us-forms-fail) and [speed to lead for service businesses](/blog/speed-to-lead-service-businesses)."),

      h2("How conversational capture works"),
      ol("**The visitor asks something.** 'How much is a first appointment?'", "**The assistant answers from your content.** A price or a range and what it includes.", "**It offers the next step.** 'Would you like to see available times?' or 'Shall I have someone contact you?'", "**It asks for details when they are relevant.** 'What is the best number to reach you?' after the visitor has shown interest.", "**It confirms and delivers.** The lead reaches you at once, with the conversation, and the visitor knows what happens next."),
      p("The order matters. Value first, then the request. It feels like service, not a toll booth."),

      h2("What to ask, and in what order"),
      p("Ask only what you need for the next step. A useful hierarchy:"),
      table(["Stage", "Ask for", "When"], ["Before any contact", "Nothing", "Answer freely"], ["Interest shown", "First name and one way to reach them", "When the visitor wants a booking, quote or callback"], ["Qualification", "What they need, when, where", "Only the questions that decide who follows up and how"], ["Booking", "Any extra detail for the appointment", "At the point of booking"], ["Nurture", "Consent to receive updates", "If you plan to send them, and only with a clear opt-in"]),
      p("Three or four well-chosen questions beat ten. Every question should have a purpose you could explain to the visitor. See [capturing phone and email in chat](/blog/capture-phone-email-in-chat)."),

      h2("Qualification without interrogation"),
      p("Qualification decides how you follow up: a hot lead deserves a call within minutes; a browsing lead might get an email. The assistant can score using signals rather than pushing questions."),
      ul("**Intent signals:** asked about price, availability or how to book.", "**Timing:** wants something this week or 'sometime'.", "**Fit:** in your area, within your services, in your price range.", "**Behaviour:** number of questions, return visits, time on the chat. See [lead scoring from chat behaviour](/blog/chat-behavior-lead-scoring)."),
      p("A simple three-level scale (hot, warm, browsing) is enough. Send hot leads to a phone as a text alert and the rest to email. See the [AI lead qualification framework](/blog/ai-lead-qualification-framework)."),

      h2("Delivering leads so they get acted on"),
      p("Capture without delivery is wasted. Make sure each lead reaches a person quickly and with context."),
      table(["Delivery", "Good for"], ["Instant email alert", "Every business; include the conversation"], ["Text or push notification", "Hot leads that need a call within minutes"], ["Slack or team chat", "Teams who live there"], ["Spreadsheet row", "Simple tracking"], ["Webhook to CRM or automation", "Anyone with a pipeline; see [webhook automations](/blog/webhook-automations-zapier-make-chat-events) and [CRM integration](/blog/crm-integration-ai-chatbot-leads)"]),
      p("Set a response-time goal, for example within fifteen minutes in business hours, and check it. Crescelo's Starter plan includes lead capture and instant email alerts; higher plans add CRM and webhook delivery. See the [lead capture feature](/product/lead-capture)."),

      h2("Wording that works"),
      table(["Situation", "Weaker wording", "Stronger wording"], ["Asking for contact", "Please enter your email.", "I can send you the price list and a link to book. What is the best email?"], ["Asking for a phone number", "Phone number required.", "Would you like a call back today? What number should we use?"], ["Qualifying", "What is your budget?", "So I can suggest the right option, roughly what range are you thinking of?"], ["Closing", "Thanks, submitted.", "Thanks, Sam. Priya will call you before 5 p.m. today. You will also get an email with what we discussed."]),

      h2("Consent, privacy and honesty"),
      ul("Tell visitors they are talking to an AI assistant.", "Say why you ask for contact details and what you will do with them.", "Link to your privacy policy.", "Do not add people to marketing lists without a clear opt-in.", "Collect only what you need and keep it only as long as needed.", "Offer a way to have their data deleted."),
      p("Rules such as GDPR and CCPA apply to chat data. See [GDPR and CCPA compliance for chatbot lead capture](/blog/chatbot-lead-capture-gdpr-ccpa-compliance) and the [website chatbot GDPR checklist](/blog/website-chatbot-gdpr-checklist). This is general information, not legal advice."),

      h2("Combining chat with forms"),
      p("You do not have to abandon forms. A hybrid works well: the chat is the default, and a form remains for people who prefer it or need to attach details. The assistant can also offer a form for complex requests, such as a detailed quote. What matters is that every route lands in the same place, so you have one list of leads and one view of the source. See [cost estimators versus conversational capture](/blog/cost-estimators-vs-conversational-lead-capture)."),

      h2("Unanswered questions are lead opportunities"),
      p("When the assistant cannot answer, you have two things: a visitor with an unmet need and a gap in your content. Capture the contact and let a person follow up, then add the answer to your knowledge base. Over time this becomes a source of both leads and improvements. See [unanswered chat questions as lead opportunities](/blog/unanswered-chat-questions-lead-opportunities)."),

      h2("How to measure it"),
      table(["Metric", "How to use it"], ["Conversations started", "Traffic that engages"], ["Lead capture rate", "Leads divided by conversations; compare with your form's completion rate"], ["Lead quality", "Share of leads that became customers"], ["Response time", "Minutes from lead to first contact"], ["Source and page", "Which pages produce leads"], ["Cost per lead", "Platform and AI cost divided by leads; compare with other channels"]),
      p("Give it a month, compare with the form's numbers and review the conversations of lost leads to find where people dropped."),

      h2("Setting it up"),
      ol("Decide the three things you need from each lead.", "Write your service and price information into documents.", "Set the greeting and the point at which the assistant offers a callback or booking.", "Configure alerts and delivery.", "Test with realistic questions, including someone who refuses to give details.", "Add the widget to your key pages.", "Review the first fifty conversations."),

      h2("A sample conversation that captures a lead well"),
      table(["Speaker", "Message"], ["Visitor", "Do you do wedding hair trials and how much?"], ["Assistant", "We do. A trial takes about 90 minutes and costs $85, which is deducted from the wedding-day price if you book with us. Would you like to see trial dates or ask about your wedding date first?"], ["Visitor", "Wedding is 14 June, I am not sure about the trial yet."], ["Assistant", "That gives you plenty of time. Would you like me to email you the wedding hair guide with prices and how to book a trial? Just tell me the best email."], ["Visitor", "sam@example.com"], ["Assistant", "Sent, Sam. If you would like Priya, our bridal stylist, to call you about your date, tell me a good time and number and I will pass it on."]),
      p("Here the visitor was not ready to book, and the assistant did not push. It gave value, asked for an email in exchange for a guide and offered a callback. That lead is warm and recorded, where a form would have lost it."),

      h2("Common mistakes"),
      ul("Asking for contact details in the first message.", "Requiring a phone number when an email would do.", "Sending leads to an inbox nobody watches.", "Never replying to leads because the chat seems to have handled them.", "Treating every lead the same instead of prioritising hot ones.", "Adding people to newsletters without consent."),

      h2("Testing your capture flow"),
      ol("Chat as a hot prospect who wants to book today.", "Chat as a browsing visitor who refuses to give details.", "Chat as someone who asks a question your content cannot answer.", "Give an invalid email and see how the assistant handles it.", "Check the lead arrives quickly, with the conversation, in the right place.", "Ask for a person and check the handover works."),
      p("Repeat the test after each change to your assistant's instructions or content, and keep a short record of what you tested."),

      h2("Mistakes in tone that cost leads"),
      p("Even a well-designed flow can lose people through tone. Avoid corporate language and long paragraphs, which feel robotic on a phone. Avoid repeating the same question after the visitor has answered it. Avoid asking for permission repeatedly. Do not use urgency tricks such as fake countdowns. Do read your own conversations aloud once: if a human receptionist would not say it, rewrite the instruction. Keep replies short, specific and warm, and let the visitor set the pace. The best test of a lead capture chat is whether a real customer, reading it afterwards, would feel helped."),

      h2("Frequently asked questions"),
      faq(
        ["What is conversational lead capture?", "It is collecting contact details and needs during a chat that first helps the visitor, instead of asking them to fill in a form before getting anything."],
        ["Is a chatbot better than a contact form?", "For many service businesses, yes: visitors get answers and are asked for details at the right moment. Many businesses keep a form as an option."],
        ["What should a lead capture chatbot ask?", "Only what you need for the next step: a name, a way to contact them, what they want and when. Extra questions lower completion."],
        ["How quickly should I respond to a lead?", "As fast as you can. Response time strongly affects conversion in service businesses, so set alerts and a response goal."],
        ["Is it legal to collect leads in a chat?", "It can be, if you are transparent, collect only what you need, obtain consent where required and follow privacy laws such as GDPR and CCPA. Take advice for your situation."],
        ["Where do the leads go?", "To your email, Slack, a spreadsheet, a webhook or your CRM, depending on the plan and your setup."],
      ),
      p("See it working on your own content in the [playground](/playground), then [start a free trial](/login?mode=register) to switch on lead capture."),
    ],
  }),
];
