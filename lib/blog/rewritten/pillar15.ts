import { faq, h2, h3, note, ol, p, pillar, table, ul } from '../authoring';

export const PILLAR15 = [
  pillar({
    slug: 'schedule-property-showings-chat',
    title: 'Booking Property Viewings by Chat: A Guide for Agents and Property Managers',
    description: 'How real estate agents and property managers turn listing enquiries into booked viewings: what the chat should ask, slot rules, confirmations, no-shows, safety and follow-up.',
    primaryKeyword: 'schedule property viewings chatbot',
    secondaryKeywords: ['book property viewing online', 'real estate showing scheduler', 'open house booking chat', 'property viewing no shows'],
    body: [
      p("A property enquiry has a short shelf life. The visitor is looking at a listing on their phone, they like it, and they want to see it. If they have to fill in a form and wait for a reply, they will send the same message to three other agents, and the first to offer a real time often gets the viewing. Chat can close that gap: it answers questions about the listing and offers times in the same conversation, at any hour. This guide explains how agents and property managers can set it up, what to ask before offering a slot, how to handle timing, travel and access, how to reduce no-shows, how to protect the safety of agents and how to follow up so viewings become offers."),

      h2("What a viewing enquiry looks like"),
      table(["Visitor", "Typical message", "What helps"], ["Buyer", "Is this still available? Can I see it this weekend?", "Status, price, a real slot"], ["Renter", "Is it pet friendly? When can I move in? Can I view tomorrow evening?", "Tenancy terms, availability, viewing time"], ["Investor", "What is the yield and can I see it with my agent?", "Facts you publish, a route to a person"], ["Seller", "Can someone value my home?", "A valuation appointment rather than a viewing"]),
      p("The assistant answers from the listing document and offers a time when the visitor is ready. Keep listing information current; a sold property still shown as available is the fastest way to lose trust."),

      h2("What to ask before offering a slot"),
      ol("Which property and, if relevant, which unit or address.", "Whether they are a buyer, renter or investor, because the next steps differ.", "Their preferred day and time window.", "How many people will attend.", "Name and a mobile number to confirm.", "For buyers, whether they have finance arranged or a property to sell; ask gently and only if you need it."),
      p("Three questions are usually enough to book. The rest can wait for the viewing. See [buyer versus seller lead qualification](/blog/buyer-vs-seller-lead-qualification-chat) for how to qualify without interrogating."),

      h2("Slot rules that keep agents sane"),
      table(["Rule", "Why"], ["Viewing windows by agent and area", "Agents cannot be in two places at once"], ["Travel time between viewings", "Back-to-back across town fails"], ["Viewing length", "15 to 30 minutes is typical; longer for larger properties"], ["Notice period", "Access may need tenants' consent or a key"], ["Daylight and safety limits", "Avoid late viewings alone"], ["Open house times", "Group visits at fixed times"]),
      p("Crescelo's built-in booking offers slots from your opening hours with one slot length, and hides taken slots. For properties with different access rules or several agents, use one booking link per agent through Calendly or Cal.com, or a single pool of viewing hours you manage. See [configuring availability rules](/blog/configure-calendar-sync-availability-rules) and [AI appointment booking](/blog/ai-appointment-booking)."),

      h2("Confirmations that reduce no-shows"),
      ul("Address, meeting point and how to find the entrance.", "The agent's name and mobile number.", "Parking and transport notes.", "What to bring: identification for a rental, if required.", "A link to change or cancel.", "A reminder the day before and a short message the morning of the viewing."),
      p("A confirmation with a change link matters most: many missed viewings are people who could not find how to move the time. Crescelo sends confirmations and email reminders with a private link to reschedule or cancel."),

      h2("Open houses and group viewings"),
      p("For open houses, the chat can collect registrations, state the time window and give parking and access details. Registration lets you follow up with everyone who came, and can support safety by knowing who is expected. Group viewings need capacity control; if your booking tool does not manage group capacity, use a registration lead flow instead of individual slots. See [open house registration workflows](/blog/open-house-registration-workflows-chat)."),

      h2("Agent safety"),
      ul("Record the name and phone number of every visitor before a viewing.", "Prefer daylight and, for solo viewings, share the schedule with the office.", "Verify identity where your company requires it.", "Never share the agent's home details or personal numbers.", "Have a check-in routine, such as a text after each viewing."),
      p("Collecting contact details in the chat supports this, and it gives you a record if something goes wrong."),

      h2("After the viewing"),
      ol("Send a thank-you message within a few hours, with the listing link and next steps.", "Ask what they thought and whether they would like to see similar properties.", "For interested buyers, explain how to make an offer.", "For renters, explain the application process.", "Record feedback for the seller or landlord."),
      p("The chat can prompt the visitor to reply with feedback, and pass the reply to the agent. Keep the tone helpful, not pushy."),

      h2("What the assistant should not do"),
      ul("Make claims about the property that are not in the listing.", "Negotiate price or promise the seller will accept an offer.", "Give legal, mortgage or investment advice.", "Guarantee availability.", "Share private information about sellers or tenants."),
      p("Have it say 'I will pass that to the agent' when the question goes beyond the listing."),

      h2("A sample conversation"),
      table(["Speaker", "Message"], ["Visitor", "Is the 2-bed flat on Elm Street still available? Can I see it Saturday?"], ["Assistant", "Yes, 12B Elm Street is still available at $2,150 a month, pets by agreement. Viewings on Saturday are at 10:00, 10:30 or 11:30 with Jordan. Which suits you?"], ["Visitor", "10:30. There will be two of us."], ["Assistant", "Booked for Saturday at 10:30, two people. May I have your name and mobile number? You will get a confirmation with the address and Jordan's contact details."]),

      h2("Measure it"),
      table(["Metric", "Why"], ["Viewings booked from chat", "Direct outcome"], ["Viewing no-show rate", "Confirmation quality"], ["Viewings to offers or applications", "Lead quality"], ["Out-of-hours enquiries converted", "Coverage"], ["Questions the assistant could not answer", "What to add to listings"]),

      h2("Worked example: a busy Saturday for a lettings agency"),
      p("A lettings agency has eight flats to show on Saturday and three agents. The week before, the assistant is told each agent's viewing hours and the flat addresses, and slots are set at twenty minutes. By Thursday, thirty-one viewings are booked, twelve of them after 6 p.m. the evening before. Each visitor receives a confirmation with the address, the agent's name and a change link, and a reminder on Friday. On Saturday morning two visitors cancel using the link, which frees their slots for late enquirers. Agents arrive to a schedule that is realistic, with contact details already collected. The agency records four no-shows, down from around ten in a typical weekend. The improvement came from clear confirmations and easy changes, not from any pressure on tenants."),
      table(["Item", "Before (illustrative)", "With chat and reminders"], ["Viewings booked for the weekend", "22", "31"], ["Booked after office hours", "Few", "12"], ["No-shows", "About 10", "4"], ["Agent time on the phone arranging viewings", "Hours", "Minutes"]),

      h2("Common mistakes"),
      ul("Offering viewing slots without travel time between properties.", "Leaving sold or let properties in the listing documents.", "Not collecting a phone number before a viewing.", "Forgetting to send reminders.", "Letting agents change times without informing visitors.", "Not following up after viewings."),

      h2("Frequently asked questions"),
      faq(
        ["Can a chatbot book property viewings?", "Yes. It answers listing questions and offers real slots, with a confirmation and reminders."],
        ["How do I stop viewing no-shows?", "Send a clear confirmation with a change link, remind the day before and the morning of, and confirm contact details at booking."],
        ["Can it handle several agents?", "With separate booking links per agent through Calendly or Cal.com, or a shared pool you manage. Crescelo's built-in picker uses one slot length and your opening hours."],
        ["What about open houses?", "Use the chat to collect registrations and share the time window and access details."],
        ["Should it verify visitors?", "Collect name and phone number before every viewing, and follow your company's safety policy."],
        ["Can it give mortgage advice?", "No. It can explain your process and refer to a broker."],
      ),
      p("Try a viewing conversation with a listing brochure in the [playground](/playground), read [AI assistants for real estate lead capture](/blog/ai-assistant-real-estate-lead-capture) and [start a free trial](/login?mode=register). See the [appointment booking feature](/product/appointment-booking)."),
    ],
  }),

  pillar({
    slug: 'buyer-vs-seller-lead-qualification-chat',
    title: 'Buyer and Seller Lead Qualification in Chat: Questions That Sort Leads Without Scaring Them',
    description: 'How real estate teams qualify buyers and sellers in a website chat: the few questions that matter, scoring, routing to the right agent and following up at the right pace.',
    primaryKeyword: 'real estate lead qualification chatbot',
    secondaryKeywords: ['qualify real estate leads', 'buyer seller lead routing', 'real estate chatbot questions', 'real estate lead scoring'],
    body: [
      p("A real estate lead can be a buyer ready to make an offer this month, a seller thinking about listing next spring, a renter, an investor or someone idly browsing. Each needs a different response, from a different person, at a different speed. Treat them all the same and you either waste your best agents' time on window shoppers or let hot leads cool. Chat helps because it can ask the few questions that sort leads while helping the visitor, and route them accordingly. This guide explains how to qualify buyers and sellers in chat: what to ask, how to word it so it feels natural, how to score and route, how to keep the tone respectful and how to check that your scoring reflects reality."),

      h2("Why sorting matters"),
      table(["Lead type", "Value and urgency", "Who should respond"], ["Buyer with finance, wants to view now", "High, fast", "Buyer's agent within minutes"], ["Seller considering listing soon", "High, moderate speed", "Listing agent, valuation offer"], ["Early-stage buyer", "Medium, nurture", "Follow-up sequence, then agent"], ["Renter", "Depends on your model", "Lettings team"], ["Investor", "High but specialised", "Senior agent or investment desk"], ["Browser", "Low", "Automated information"]),
      p("Sorting well means the right person calls the right lead first."),

      h2("Buyer questions"),
      table(["Question", "Why it matters", "Natural wording"], ["Which property or area?", "Match and route", "Which property caught your eye, or which area are you looking in?"], ["Budget range?", "Realistic options", "So I can suggest the right homes, roughly what range are you thinking?"], ["Timing?", "Urgency", "Are you looking to move soon, or planning ahead?"], ["Finance arranged?", "Readiness", "Have you spoken to a lender yet, or paying cash?"], ["Need to sell first?", "Dependency", "Do you have a home to sell first?"], ["Must-haves?", "Match", "Anything that is a must, like bedrooms or a garden?"]),
      p("Ask one at a time, starting with what helps the visitor most. Stop when you can route them."),

      h2("Seller questions"),
      table(["Question", "Why it matters", "Natural wording"], ["Property address or area", "Fit with your territory", "Where is the property?"], ["Type and size", "Match and preparation", "What kind of property is it, roughly how many bedrooms?"], ["Timing", "Urgency", "Are you thinking of selling soon, or just curious about value?"], ["Reason", "Motivation", "Is there a particular reason you are thinking of moving?"], ["Other valuations", "Competition", "Have you had a valuation already?"], ["Next step", "Conversion", "Would you like someone to visit for a valuation?"]),
      p("Sellers value discretion. Explain what happens with their details and avoid asking for information you do not need."),

      h2("Signals you can read without asking"),
      ul("A specific property or address is stronger than a general question.", "Asking about viewing times signals intent.", "Mentioning a date such as a lease ending or a school year signals urgency.", "Giving contact details unprompted signals interest.", "Asking about fees or process from a seller signals early comparison."),
      p("See [lead scoring from chat behaviour](/blog/chat-behavior-lead-scoring)."),

      h2("A simple scoring model"),
      table(["Signal", "Points"], ["Specific property and viewing request", "+4"], ["Timing within three months", "+3"], ["Finance arranged or cash", "+2"], ["Gave a phone number", "+2"], ["Seller wants a valuation visit", "+4"], ["General browsing", "0"], ["Outside your area", "-3"]),
      table(["Total", "Label", "Action"], ["7 or more", "Hot", "Call within minutes; text alert"], ["4 to 6", "Warm", "Same-day call or email"], ["1 to 3", "Nurture", "Automated follow-up if they agreed"], ["Negative", "Not a fit", "Polite reply with suggestions"]),
      p("Adjust the numbers to your market and check them against outcomes each quarter. See [AI lead qualification framework](/blog/ai-lead-qualification-framework)."),

      h2("Route to the right person"),
      ul("By area: the agent who covers the postcode.", "By type: buyer's agent, listing agent, lettings, investment.", "By value: senior agents for high-value or complex leads.", "By availability: round-robin among agents on duty."),
      p("Send hot leads by text and email with a summary at the top. Crescelo sends lead emails with instant alerts and can deliver leads to Slack, Google Sheets and webhooks, so an automation can route by area or type. See [instant lead routing in chat](/blog/instant-lead-routing-chat) and [CRM integration](/blog/crm-integration-ai-chatbot-leads)."),

      h2("Keep it respectful and fair"),
      ul("Do not use the chat to steer or exclude people on protected characteristics; follow fair housing and equal opportunity rules that apply where you operate.", "Do not ask intrusive questions about a person's circumstances.", "Give every visitor a courteous answer, whatever their score.", "Tell visitors they are talking to an AI, and offer a person.", "Collect only what you need."),
      p("A low score means lower priority, not a rude reply."),

      h2("Follow-up at the right pace"),
      table(["Lead", "Follow-up"], ["Hot buyer", "Call now; confirm viewing; send similar listings"], ["Warm buyer", "Email with listings and an offer to book a viewing"], ["Early-stage buyer", "Occasional useful updates, with consent"], ["Seller considering", "Offer a market snapshot; follow up after a week"], ["Seller ready", "Valuation visit within days"]),
      p("Do not add anyone to marketing emails without consent. See [GDPR and CCPA for chatbot lead capture](/blog/chatbot-lead-capture-gdpr-ccpa-compliance)."),

      h2("A sample conversation"),
      table(["Speaker", "Message"], ["Visitor", "I am thinking of selling my house on Maple Road but not sure when."], ["Assistant", "Thanks for asking. I can explain how our valuation works, which is free and takes about 30 minutes, with no obligation. Roughly how many bedrooms does the house have, and are you thinking of moving this year or later?"], ["Visitor", "Three bedrooms. Maybe this year."], ["Assistant", "Good to know. Would you like one of our agents to visit for a valuation? I can offer Tuesday or Thursday. What is the best number to reach you?"]),

      h2("Common mistakes"),
      ul("Asking about budget before helping.", "Treating every lead as hot.", "Not routing by area, so leads bounce between agents.", "Never checking whether scores predict outcomes.", "Sending alerts for every lead so agents ignore them."),

      h2("Worked example: two leads on the same morning"),
      p("At 8:40 a.m., a visitor asks about a specific three-bedroom house, says they need to move by August and have a mortgage pre-approval. The assistant scores them as hot, offers Saturday viewing times, books one and texts the buyer's agent with a summary: house, timeline, pre-approved, viewing booked. At 9:10, another visitor asks generally what homes cost in the area and gives no details. The assistant answers helpfully, offers a market guide by email and captures an address with consent. That lead is added to a monthly update list. The agent calls the first lead within ten minutes and never has to sort through the second. The scoring did not judge either person; it simply prioritised the agent's time."),
      table(["Lead", "Signals", "Label", "Action"], ["House-specific buyer", "Property, timeline, finance, viewing request", "Hot", "Text alert; call in minutes"], ["General browser", "No property, no timeline", "Nurture", "Guide by email with consent"]),

      h2("Check the scoring every quarter"),
      ol("List last quarter's leads with their labels.", "Note what happened to each: viewing, offer, listing, nothing.", "Compare conversion by label: did hot leads convert most?", "Look for patterns the scoring missed: warm leads that converted, or hot leads that did not.", "Adjust points and wording, and record the change."),
      p("A scoring model is a hypothesis about your market. Test it against results, and keep it simple enough to explain to your team."),

      h2("Frequently asked questions"),
      faq(
        ["How do I qualify real estate leads in chat?", "Ask a few natural questions about property, timing and readiness, read signals like viewing requests, score the lead and route it to the right agent."],
        ["Should the chat ask about budget?", "Gently and indirectly, for example by asking what range the visitor is considering, and only after helping."],
        ["How do I qualify sellers?", "Ask about location, type, timing and whether they want a valuation visit, and keep their details private."],
        ["Can it route leads by area?", "Yes, by using lead data in an automation or your CRM to assign the right agent."],
        ["How do I avoid bias in scoring?", "Score behaviour and stated needs, never personal characteristics, and review the results regularly."],
        ["How do I know my scoring works?", "Compare labels with outcomes each quarter and adjust."],
      ),
      p("See the [lead capture feature](/product/lead-capture), try a buyer and a seller conversation in the [playground](/playground) and read [AI lead qualification framework](/blog/ai-lead-qualification-framework)."),
    ],
  }),

  pillar({
    slug: 'mortgage-broker-consultation-booking-chat',
    title: 'Mortgage Broker Websites: Booking Consultations by Chat Without Giving Advice',
    description: 'How mortgage brokers can use a chat to explain their process, answer general questions, capture enquiries and book consultations while staying within advice and compliance boundaries.',
    primaryKeyword: 'mortgage broker chatbot',
    secondaryKeywords: ['mortgage consultation booking', 'mortgage broker lead capture', 'mortgage enquiry website chat', 'financial services chatbot compliance'],
    body: [
      p("People approaching a mortgage broker are often anxious, confused by jargon and comparing several firms. They want to know whether a broker can help them, how the process works, what documents they will need and whether they qualify, and they want to speak to a person soon. A website chat can meet them at the moment they search, explain how you work in plain language and book an initial consultation. But mortgage advice is regulated. A chatbot must not recommend products, estimate approval or say what someone can borrow. This guide explains how a broker can use chat responsibly: what it can answer, what it must never do, how to word the disclosure, how to capture an enquiry and how to book a consultation that starts with the right information."),
      note("Mortgage and financial advice are regulated, and rules differ by country. This is general information, not legal or compliance advice. Have your compliance officer approve all wording, and check what your regulator requires for automated communications."),

      h2("What people ask a mortgage broker"),
      table(["Question", "What the chat can do"], ["How does a broker help?", "Explain your role and how you are paid, in the words you approve"], ["What documents do I need?", "Share a checklist"], ["How long does it take?", "Give typical stages, without promising timelines"], ["Can I get a mortgage with a deposit of X?", "Not answer; offer a consultation"], ["What is the best rate?", "Not answer; explain you compare options at the consultation"], ["Do you charge a fee?", "State your fee structure as approved"], ["Can I speak to someone today?", "Offer real consultation times"]),

      h2("The boundary: information, not advice"),
      table(["The assistant can", "The assistant must not"], ["Explain your process and typical steps", "Recommend a product or lender"], ["List documents commonly needed", "Say whether a specific person will be approved"], ["Explain general terms such as deposit or fixed rate in neutral language", "Estimate how much someone can borrow"], ["State your fee and remuneration as approved", "Quote rates unless approved and current"], ["Book a consultation", "Discuss a customer's individual finances in detail"]),
      p("Write these lines into its instructions and test them with tempting questions such as 'Can I afford a $600,000 home on $80,000?'"),

      h2("Disclosure and tone"),
      ul("Say clearly that it is an AI assistant, and that it cannot give advice.", "Say that advice is given by qualified people at the consultation.", "Include any required statements about your status, regulator and how you are paid, as your compliance officer decides.", "Keep the tone warm, reassuring and plain: mortgages are stressful."),
      p("Example: 'I am an AI assistant. I can explain how we work and arrange a free consultation with one of our advisers. I cannot give mortgage advice or say what you could borrow.' See [AI transparency and disclosure](/blog/ai-transparency-disclosure-building-trust)."),

      h2("What to capture in the chat"),
      table(["Field", "Why"], ["Name and preferred contact method", "To reach them"], ["Type of enquiry: first-time buyer, remortgage, buy-to-let, other", "Route to the right adviser"], ["Rough timeframe", "Priority"], ["Whether they have found a property", "Urgency"], ["Preferred consultation time", "Booking"]),
      p("Do not ask for income, credit details, national identifiers or bank information in an open chat. Say that the adviser will ask what is needed during a secure process. See the [GDPR checklist for website chatbots](/blog/website-chatbot-gdpr-checklist)."),

      h2("Booking the consultation"),
      ol("Explain what the consultation is: length, whether free, and what the adviser will cover.", "State what the client should have ready: recent payslips or accounts, identification, details of the property if known.", "Offer real times, including evenings if you have them.", "Confirm by email with the adviser's name, how the call or meeting works and how to change it.", "Send a reminder the day before."),
      p("Crescelo's built-in picker offers slots from your opening hours and one slot length; set it to your consultation length. For advisers with different diaries, use Calendly or Cal.com links per adviser. See [AI appointment booking](/blog/ai-appointment-booking) and [paid discovery call booking](/blog/paid-discovery-call-booking-chat) for a related flow."),

      h2("Handle urgency and complex cases"),
      ul("A buyer with an offer accepted or a deadline: alert an adviser quickly.", "Self-employed, adverse credit or unusual income: do not comment; book a consultation and note the case type.", "Someone in financial difficulty: respond with care and offer to connect them with a person, and, where relevant, to independent support services."),

      h2("A sample conversation"),
      table(["Speaker", "Message"], ["Visitor", "I have a deposit saved and want to buy my first home. What mortgage can I get?"], ["Assistant", "Congratulations on getting this far. I am an AI assistant, so I cannot say what you could borrow or recommend a mortgage, but one of our advisers can look at your situation in a free 30-minute call. They will explain your options and next steps. Would you like to see times this week?"], ["Visitor", "Yes please, evening if possible."], ["Assistant", "I can offer Wednesday at 6:30 p.m. or Thursday at 7:00 p.m. What name and phone number should the adviser use? Please do not share income or financial details here; they will ask when you speak."]),

      h2("Measure it"),
      table(["Metric", "Why"], ["Enquiries and consultations booked", "Conversion"], ["Out-of-hours bookings", "Coverage"], ["Consultation no-show rate", "Reminder quality"], ["Consultations to applications", "Lead quality"], ["Compliance reviews of transcripts", "Risk control"]),
      p("Review transcripts regularly with your compliance lead for wording that drifts into advice."),

      h2("A pre-consultation checklist to send"),
      p("A consultation goes better when the client arrives prepared. Include a short checklist in the confirmation email, with wording approved by your compliance lead."),
      ul("Recent payslips or accounts, as your firm requires.", "Identification documents.", "Details of existing debts and commitments, if relevant.", "The property details, if a property has been found.", "Questions the client wants to ask.", "Who else should attend, for example a partner."),
      p("Keep it short, warm and clear, and say that nothing needs to be sent through the chat."),

      h2("After the consultation"),
      ol("Send a written summary and next steps, as your rules require.", "Record the outcome in your system.", "Follow up if documents are outstanding.", "Ask for feedback and, where permitted, reviews after completion."),
      p("The chat's job ends with a well-informed client in front of an adviser. Everything after that is your process, and the quality of the first conversation makes it smoother."),

      h2("Common mistakes"),
      ul("Letting the assistant hint at what someone could borrow.", "Quoting rates that are out of date.", "Asking for income or credit details in the chat.", "Skipping the disclosure that it is an AI.", "Not reviewing transcripts for advice creeping in.", "Making the consultation hard to book at evenings and weekends."),

      h2("Keep clients informed between steps"),
      p("Mortgage applications take weeks, and silence breeds anxiety. Agree how you will keep clients updated, for example a short message at each stage, and make sure the assistant can tell a client who to contact for a status update. Clients who feel informed are more likely to complete and to recommend you."),

      h2("Frequently asked questions"),
      faq(
        ["Can a chatbot give mortgage advice?", "No. It can explain your process and arrange a consultation, but advice must come from qualified people under the rules of your regulator."],
        ["Can it say what someone can borrow?", "No. That is advice or an estimate that should come from an adviser after assessing the person's circumstances."],
        ["What should it collect in chat?", "Name, contact method, enquiry type and timeframe. Not income, credit or identity details."],
        ["Can it quote rates?", "Only if your compliance officer approves and the rates are current. Many firms prefer not to."],
        ["How do I keep it compliant?", "Have compliance write and approve the wording, test tempting questions and review transcripts regularly."],
        ["Can it book consultations?", "Yes, with available times and an email confirmation."],
      ),
      p("Try a consultation booking on your own process document in the [playground](/playground), see the [appointment booking feature](/product/appointment-booking), and read [AI intake and scheduling for professional services](/blog/ai-intake-scheduling-professional-services) for related compliance points."),
    ],
  }),

  pillar({
    slug: 'legal-intake-automation-conflict-checks',
    title: 'Legal Intake Automation: Capturing Enquiries and Feeding Conflict Checks Safely',
    description: 'How law firms can automate first-contact intake: what to collect, how to prepare for conflict checks, keeping privilege and confidentiality in mind, routing and follow-up.',
    primaryKeyword: 'legal intake automation',
    secondaryKeywords: ['law firm intake chatbot', 'conflict check intake', 'client intake form law firm', 'law firm lead capture'],
    body: [
      p("A law firm's intake process is its front door, and it must do two jobs that pull in opposite directions. It must be quick and welcoming, because a prospective client with a problem will contact several firms and hire the first that responds well. And it must be careful, because the firm needs to check for conflicts of interest, protect confidentiality and avoid creating obligations before it is ready. Many firms lose clients by being slow and expose themselves to risk by being casual. A well-designed automated intake can help with both: capture the basics instantly, at any hour, in a way that supports conflict checks and routing, without inviting confidential detail or giving advice. This guide explains what to collect, what to avoid, how to prepare for conflict checks, how to route matters and how to keep the process compliant."),
      note("Professional conduct rules on advertising, confidentiality, conflicts and client communication vary by jurisdiction. This is general information, not legal advice. Have your ethics or compliance partner approve the design, and check what your regulator or bar requires."),

      h2("What intake has to achieve"),
      table(["Goal", "How automation helps"], ["Respond quickly", "Instant reply and a booking option at any hour"], ["Capture the essentials", "Structured fields, same every time"], ["Enable a conflict check", "Names of the parties, so the check can run before substantive discussion"], ["Route correctly", "Practice area, urgency and location"], ["Protect confidentiality", "Steer visitors away from sharing detail in the chat"], ["Avoid creating a relationship prematurely", "Clear statements that the chat gives no advice"]),

      h2("What to collect"),
      table(["Field", "Purpose", "Notes"], ["Name and contact method", "To reply", "Ask consent to contact"], ["Type of matter, in the visitor's words", "Routing", "A category is enough"], ["Names of other parties involved", "Conflict check", "Ask only if you run checks at intake; explain why"], ["Key dates or deadlines", "Urgency", "For example a hearing or a limitation issue"], ["Location or jurisdiction", "Fit", "Whether you can act"], ["How they found you", "Marketing", "Optional"]),
      p("Keep it to what you need. Do not collect a narrative of the facts, documents, medical information or privileged details in a general chat."),

      h2("What not to collect"),
      ul("The detailed story of the dispute.", "Documents, photos or contracts.", "Financial or medical records.", "Anything the visitor describes as confidential.", "Government identifiers and payment details."),
      p("Tell visitors that these will be discussed with the lawyer. See [confidentiality and privilege with an AI website assistant](/blog/confidentiality-attorney-client-privilege-ai-chat)."),

      h2("Design the opening to prevent oversharing"),
      p("Visitors with legal problems tend to type more than they should. A short notice at the start reduces it: 'I am an AI assistant. I cannot give legal advice, and this chat does not create a lawyer-client relationship. Please do not share confidential details here. I can take your contact details and arrange a consultation.' The assistant should repeat the point kindly if a visitor starts to describe the facts, and steer toward booking."),

      h2("Conflict checks: making them easy"),
      p("A conflict check needs the identity of the parties. Structured intake helps in three ways: the names are captured cleanly, the check can be run by staff or software before the consultation and the lawyer knows whether the firm can act before hearing the story. If names are collected in chat, store them securely, limit access, and delete them if the matter does not proceed, according to your retention policy. If a conflict is found, have a standard, polite response ready, and consider whether the fact that a conflict exists is itself sensitive."),
      ol("Visitor gives their name and the other party's name.", "Intake staff runs the conflict check.", "If clear, the consultation proceeds; if not, a person contacts the visitor with a courteous decline and suggestions.", "The result is recorded in your matter system."),

      h2("Routing by practice area and urgency"),
      table(["Signal", "Route"], ["Family law with safety concerns", "Immediate human contact and appropriate safety wording"], ["Criminal matter, arrest or court date soon", "Urgent alert to the duty lawyer"], ["Immigration deadline", "Immigration team, urgent flag"], ["Business or commercial dispute", "Corporate team"], ["Personal injury", "Fast response; see [personal injury lead triage](/blog/personal-injury-lead-triage-response-time)"], ["Outside your practice areas", "Polite decline with a suggestion to find appropriate help"]),
      p("For situations involving personal safety, the assistant should give your approved wording, including emergency numbers, and alert a person straight away."),

      h2("Consultations"),
      ul("Explain what the initial consultation is, its length and whether it is free or charged.", "Say what to bring or prepare, such as documents and a summary of key dates.", "Offer real times.", "Confirm by email, including the lawyer's name and how the meeting works.", "Send a reminder."),
      p("Crescelo's built-in booking offers slots from your opening hours and one slot length, and you can connect Calendly or Cal.com links per lawyer or practice area. See [AI appointment booking](/blog/ai-appointment-booking)."),

      h2("Fees and honesty"),
      p("Visitors ask about cost early. The assistant can explain your fee structures, for example hourly, fixed fee or contingency, in the words you approve, and say that a specific quote follows a consultation. It must not quote a fee for a specific matter without your approval. See [explaining legal fees and billing models in chat](/blog/explaining-legal-fees-billing-models-chat)."),

      h2("Data protection and retention"),
      ul("Tell visitors they are talking to an AI and link to your privacy policy.", "Collect the minimum.", "Restrict who can read transcripts.", "Set a retention period and delete what you no longer need.", "Ask vendors where data is stored, who processes it and how to delete it.", "Where you serve people in Europe, follow the [GDPR checklist for website chatbots](/blog/website-chatbot-gdpr-checklist)."),

      h2("A sample conversation"),
      table(["Speaker", "Message"], ["Visitor", "My landlord is trying to evict me and I have a hearing in two weeks."], ["Assistant", "I am sorry you are dealing with that. I am an AI assistant and cannot give legal advice, and this chat does not create a lawyer-client relationship. A hearing in two weeks is time-sensitive, so I would like a member of our housing team to contact you quickly. Please do not share details here. What is your name, best phone number and the landlord's name, so we can check we are able to act?"]),
      p("The assistant recognised urgency, stated its limits, asked only for what the conflict check needs and alerted the team."),

      h2("Measure and review"),
      table(["Metric", "Why"], ["Enquiries and response time", "Speed to lead"], ["Conflict checks run before consultations", "Compliance"], ["Consultations booked and attended", "Conversion"], ["Enquiries outside your practice areas", "Marketing and content clarity"], ["Transcripts reviewed for oversharing", "Confidentiality"]),

      h2("A one-week rollout plan"),
      ol("**Day 1:** agree scope and wording with your ethics partner: what may be collected, what may never be said and where each matter type is routed.", "**Day 2:** write the practice-area descriptions, fee structures and consultation information the assistant will use.", "**Day 3:** configure intake fields and alerts, and set consultation types and times.", "**Day 4:** test with realistic scenarios, including urgent and sensitive ones, and a visitor who overshares.", "**Day 5:** have a partner try to break it, then fix what they find.", "**Then:** launch on one practice area or page first, review every transcript for two weeks and widen gradually."),
      p("A staged launch builds confidence and gives you evidence of governance if you are ever asked how the tool was introduced."),

      h2("Common mistakes"),
      ul("Collecting a narrative of the facts.", "Not stating that the chat gives no advice.", "Running conflict checks after a detailed consultation instead of before.", "Leaving alerts for urgent matters on an unwatched inbox.", "Keeping transcripts indefinitely.", "Letting the assistant quote fees for specific matters."),

      h2("Frequently asked questions"),
      faq(
        ["Can a law firm use a chatbot for intake?", "Yes, for capturing basic details and booking consultations, if it gives no advice, discourages confidential detail and complies with your professional rules."],
        ["What should intake collect for a conflict check?", "The names of the parties involved, collected securely and used only for the check."],
        ["Does chatting create a client relationship?", "Your notice should say it does not, and the assistant must not give advice. Rules vary, so have your ethics partner approve the wording."],
        ["How should the chat handle urgent matters?", "Recognise deadlines and safety risks, give approved wording and alert a person immediately."],
        ["Should the chatbot quote fees?", "Only general fee structures you approve, not a quote for a specific matter."],
        ["How long should transcripts be kept?", "Only as long as needed under your retention policy and legal duties."],
      ),
      p("Try an intake conversation on your own practice information in the [playground](/playground), read [AI chatbots for law firms and professional services](/blog/ai-intake-scheduling-professional-services) and [start a free trial](/login?mode=register)."),
    ],
  }),

  pillar({
    slug: 'personal-injury-lead-triage-response-time',
    title: 'Personal Injury Leads: Why Response Time Wins Cases and How to Triage by Chat',
    description: 'How personal injury firms can respond to enquiries in minutes: triage questions, safe wording, urgency signals, intake, follow-up and rules on advertising and solicitation.',
    primaryKeyword: 'personal injury lead response time',
    secondaryKeywords: ['personal injury intake chatbot', 'law firm lead triage', 'personal injury marketing response', 'accident enquiry website chat'],
    body: [
      p("Personal injury is one of the most competitive areas of legal marketing. Someone injured in an accident searches for help, often from a hospital bed or their phone in a car park, and contacts several firms. The first firm to respond with empathy and a clear next step often signs the client. Firms that reply the next morning find the case has gone. Response time is therefore a business-critical measure, and it is one where an automated first response can help. But this is also a sensitive area: visitors may be hurt and distressed, rules on solicitation and advertising are strict, and an automated assistant must never give legal advice or make promises about outcomes. This guide explains how a personal injury firm can use a chat to respond instantly and triage properly: what to say first, what to ask, how to spot urgency, how to route leads and how to stay within the rules."),
      note("Rules on advertising, solicitation and client communication for personal injury lawyers are strict and vary by jurisdiction. This is general information, not legal advice. Have your ethics partner approve the wording and the process."),

      h2("Why speed matters here"),
      ul("Injured people contact several firms and often choose the first that answers.", "Evidence and deadlines are time-sensitive: limitation periods, witness memory, insurance notification.", "A slow response signals that a firm will be slow later.", "Enquiries arrive at night and at weekends, when accidents happen."),
      p("A prompt, compassionate reply is not a marketing trick. It is service, and it often decides who helps the person. See [speed to lead for service businesses](/blog/speed-to-lead-service-businesses)."),

      h2("What the first message should do"),
      ol("Express concern, briefly and sincerely.", "State that it is an AI assistant that cannot give legal advice.", "Check for immediate medical or safety needs and direct to emergency services if needed.", "Explain what happens next: a case manager will contact them, and when.", "Ask for contact details and a good time to call."),
      p("Example: 'I am sorry to hear you were hurt. I am an AI assistant and cannot give legal advice. If you need medical help right now, please call emergency services. Otherwise, I can arrange for a member of our team to call you today. What is your name and the best number?'"),

      h2("Safety first"),
      p("Many visitors will write about injuries that need medical attention. The assistant should never assess medical severity. If a visitor describes severe symptoms, or has not yet been seen by a doctor, the first response should encourage them to seek medical care and give emergency numbers. Legal matters can wait for an hour; health cannot."),

      h2("Triage questions that help the firm"),
      table(["Question", "Purpose"], ["What happened, in a sentence (type of incident)?", "Practice fit and routing"], ["When did it happen?", "Limitation and urgency"], ["Have you received medical treatment?", "Care and evidence"], ["Was anyone else involved or at fault, in general terms?", "Conflict check preparation"], ["Have you spoken to an insurer or another lawyer?", "Status and competition"], ["Where did it happen?", "Jurisdiction"]),
      p("Keep it short and gentle. Do not ask for the full story, medical records, photos of injuries or details that belong in a confidential meeting. For non-personal-injury enquiries, route appropriately. See [legal intake automation and conflict checks](/blog/legal-intake-automation-conflict-checks)."),

      h2("Urgency signals"),
      table(["Signal", "Action"], ["Incident within days", "Priority call within the hour"], ["Deadline approaching", "Urgent alert to a senior case handler"], ["Serious injury or hospitalisation", "Empathetic priority, and a call from an experienced person"], ["Insurer pressing for a statement or settlement", "Priority: the firm may need to advise quickly"], ["Fatality or vulnerable client", "Immediate human contact"]),
      p("The assistant should not draw legal conclusions from these signals; it should flag them so a person can."),

      h2("Alerts and routing"),
      ul("Instant text and email to the on-call case manager for priority leads.", "A shared inbox for the rest, reviewed within an hour.", "Round-robin among available handlers, with a fallback.", "A summary of what the visitor said, with the conversation attached."),
      p("Measure the time from enquiry to first human contact, and target minutes for priority leads. See [instant lead routing in chat](/blog/instant-lead-routing-chat) and [webhook automations](/blog/webhook-automations-zapier-make-chat-events) for texting the on-call phone."),

      h2("Rules on advertising and solicitation"),
      ul("Do not make guarantees about results or compensation.", "Do not use language that pressures or exploits vulnerable people.", "Follow rules on how and when you may contact people who have not contacted you.", "State your status and how you are paid where required.", "Include required disclaimers, as your regulator specifies.", "Do not use testimonials or statistics in ways your rules forbid."),
      p("Have your ethics partner approve everything the assistant says, and review transcripts regularly for wording that drifts."),

      h2("Set expectations honestly"),
      p("Tell people what will happen next and when. 'A case manager will call you within 30 minutes during office hours, or by 9:00 a.m. tomorrow' is better than a vague 'we will be in touch'. If your first call is free and there is no fee unless you win, and that is accurate and permitted, state it as your rules allow. Never promise a result."),

      h2("A sample conversation"),
      table(["Speaker", "Message"], ["Visitor", "I was hit by a car yesterday while crossing the road. My leg is in a cast."], ["Assistant", "I am so sorry, I hope you are being looked after. I am an AI assistant and cannot give legal advice. If you have any new or worsening symptoms, please get medical help straight away. I would like one of our case managers to call you. What is your name and the best number, and is there a good time today?"], ["Visitor", "Sam, 555-0177, any time."], ["Assistant", "Thank you, Sam. I have marked this as a priority and a case manager will call you within 30 minutes. Please do not worry about details for now; they will listen and explain the next steps."]),

      h2("After the first call"),
      ol("Log the outcome and next steps in your matter system.", "Send a written summary and engagement information as your rules require.", "Follow up if the client has not signed within an agreed time, respectfully.", "Ask for a review after the case concludes, if your rules permit."),

      h2("Measure it"),
      table(["Metric", "Why"], ["Time to first human contact", "The key measure"], ["Enquiries outside office hours and outcome", "Coverage"], ["Priority alerts acknowledged within target", "Process reliability"], ["Enquiry to signed client rate", "Effectiveness"], ["Transcript compliance reviews", "Risk"]),

      h2("Worked example: a weekend response"),
      p("A firm receives enquiries on Saturday night. Previously they waited until Monday. Now the assistant replies instantly with the empathetic message, checks for medical needs and captures the visitor's name and number. Priority leads, incidents within a few days or involving hospitalisation, text the on-call case manager, who calls within thirty minutes on Sunday morning. Others are queued for Monday, and the assistant tells them so honestly. Over a quarter the firm signs several clients it would probably have lost, and hears from callers that being answered on a Saturday night mattered to them. The improvement came from a clear process, an on-call rota and honest expectations, not from the software alone."),

      h2("Rota and process checklist"),
      ul("Named on-call case manager for nights and weekends, with a backup.", "A rule for who calls whom and how quickly.", "A script for the first call: listen, check on wellbeing, explain the next steps.", "A record of every call and outcome.", "A weekly review of response times and missed alerts."),
      p("The assistant provides speed; people provide care. The firms that do this well train their case managers to treat the first call as a conversation with someone in distress, not a sales call."),

      h2("Common mistakes"),
      ul("Letting the assistant say anything about the strength of the case.", "Asking for detailed accounts of the accident in chat.", "Ignoring rules on solicitation.", "Sending alerts to an inbox nobody watches on weekends.", "Failing to check for immediate medical needs.", "Promising results or timings the firm cannot guarantee."),

      h2("Frequently asked questions"),
      faq(
        ["Can a chatbot respond to personal injury enquiries?", "Yes, for empathetic first contact, safety wording, basic triage and alerting your team, as long as it gives no advice and follows advertising rules."],
        ["How fast should a firm respond?", "As fast as possible; aim for minutes for priority leads and an instant automated reply at any hour."],
        ["What should the chatbot say about injuries?", "Express concern and encourage medical care if needed. It should never assess severity."],
        ["Can it promise compensation?", "No. It must not promise outcomes or amounts."],
        ["What should it collect?", "Name, contact details, type and date of incident and whether they have had medical treatment, kept brief."],
        ["Who approves the wording?", "Your ethics or compliance partner, with regular transcript reviews."],
      ),
      p("Try an empathetic first-response flow in the [playground](/playground), read [AI chatbots for law firms](/blog/ai-intake-scheduling-professional-services) and see the [human handover feature](/product/human-handover)."),
    ],
  }),
];
