import { faq, h2, h3, note, ol, p, pillar, table, ul } from '../authoring';

export const PILLAR16 = [
  pillar({
    slug: 'cpa-accounting-tax-season-intake',
    title: 'Tax Season Intake for Accountants: Handling the Surge With Chat and Clear Checklists',
    description: 'How accounting firms manage tax-season enquiries: instant answers on fees and documents, intake by client type, deadlines, capacity control and secure document handling.',
    primaryKeyword: 'accountant chatbot tax season',
    secondaryKeywords: ['CPA client intake', 'tax preparer website chat', 'accounting firm lead capture', 'tax season enquiries automation'],
    body: [
      p("For most accounting firms, the year is lopsided. A few frantic months of tax preparation bring more enquiries than the team can answer, followed by quiet stretches. In the rush, the same questions arrive hundreds of times: what do you charge, what documents do I need, can you meet my deadline, do you take new clients. Staff answer them between client meetings, phone calls go to voicemail and new enquiries wait days. Every unanswered enquiry is a potential client who filed with someone else. A website chat can absorb the repetitive questions, sort enquiries by type and capacity, and book onboarding calls, so the team's time goes to preparing returns. This guide explains how an accounting firm can use chat in tax season: what to answer, how to intake by client type, how to be honest about capacity and deadlines, how to handle documents securely and how to prepare before the rush."),
      note("Tax rules, deadlines and professional obligations differ by country. This is general information, not tax or legal advice. Keep the assistant's answers to information you have approved, and follow your regulator's rules on client communication and data."),

      h2("The questions that flood in"),
      table(["Question", "What the assistant can say"], ["How much do you charge?", "Your published fees or starting prices, and what affects them"], ["What documents do I need?", "Your checklist by client type"], ["Are you taking new clients?", "Your current capacity, honestly"], ["Can you file by the deadline?", "Your cut-off dates for submitting information"], ["Can you help with back taxes or an audit?", "Whether you offer it, and how to book a consultation"], ["Do you do business, self-employed or rental income returns?", "The client types you serve"], ["Is my information secure?", "How you handle documents, and where to upload them"]),
      p("These are informational and repeatable. The assistant answers from your documents and hands over anything specific to a person's tax situation."),

      h2("Intake by client type"),
      table(["Client type", "What to ask", "Route to"], ["Individual employee", "Number of income sources, homeowner or renter, dependants", "Standard preparer"], ["Self-employed or freelancer", "Business type, revenue range, expenses tracked?", "Self-employed team"], ["Rental property owner", "Number of properties, records available", "Property specialist"], ["Small business owner", "Business type and year-end, bookkeeping status", "Business team or a consultation"], ["Behind on filings or facing a notice", "Which years, any notices received", "Senior adviser; urgent flag"], ["New to the country or complex situations", "Countries involved, income types", "Specialist consultation"]),
      p("A few questions suffice to route the enquiry. Avoid asking for figures or personal financial details in chat."),

      h2("What the assistant must not do"),
      ul("Give tax advice or say what a person owes or will receive.", "Interpret tax rules for someone's individual case.", "Promise refunds or outcomes.", "Collect tax identifiers, bank details or documents in chat.", "Quote a fixed price for a return it has not seen."),
      p("Tell visitors that these are handled securely after they become a client. See [AI transparency and disclosure](/blog/ai-transparency-disclosure-building-trust) for wording."),

      h2("Be honest about capacity and deadlines"),
      p("In tax season you cannot accept everyone. Say so early, and put current capacity and cut-off dates in the assistant's documents: 'We are accepting new individual clients until March 15. After that, we can offer extension filings.' Update the document as capacity changes. Honesty about capacity avoids disappointed clients and lets you steer late enquiries toward extension or next-season services. Consider a waiting list for overflow, and a polite referral message for enquiries you cannot serve."),

      h2("Documents and security"),
      ul("Never ask for tax documents or identifiers in the chat.", "Send clients to your secure portal or upload method after they engage.", "Give them the checklist in advance, in the confirmation email.", "Explain how you protect their information, in plain terms you can stand behind.", "Ask any tool vendor where data is stored and who processes it."),
      p("See the [GDPR checklist for website chatbots](/blog/website-chatbot-gdpr-checklist) for what to ask a vendor. This is general information, not legal advice."),

      h2("Book onboarding calls"),
      p("For clients who are a fit, the next step is an onboarding call or a document drop-off. Offer real times in the chat, confirm by email with the checklist and the secure upload link, and send a reminder. Crescelo's built-in booking offers slots from your opening hours and one slot length; set it to the length of your onboarding call, or use Calendly or Cal.com links per team. See [AI appointment booking](/blog/ai-appointment-booking)."),

      h2("Prepare before the rush"),
      table(["When", "Action"], ["Two months before", "Update fees, capacity, checklists and cut-off dates in the assistant's documents"], ["One month before", "Test twenty questions; set alerts and booking hours"], ["Season start", "Watch conversations daily; update capacity"], ["Cut-off dates", "Change the messaging to extensions and late filing"], ["After the season", "Review what visitors asked; plan improvements"]),

      h2("A sample conversation"),
      table(["Speaker", "Message"], ["Visitor", "Do you do self-employed tax returns and how much?"], ["Assistant", "Yes, we prepare self-employed returns. Fees start at $450 and depend on the complexity, for example the number of income sources and whether you have rental income. We are accepting new self-employed clients until March 10. Would you like to book a 20-minute onboarding call? After you book, we will send a checklist and a secure link for your documents. Please do not send documents or tax numbers in this chat."]),

      h2("Measure it"),
      table(["Metric", "Why"], ["Enquiries and response time in the peak", "Coverage"], ["Onboarding calls booked", "Conversion"], ["New clients by type", "Mix and capacity"], ["Questions the assistant could not answer", "Content gaps"], ["Hours of staff time saved on repeat questions", "Value"]),

      h2("Common mistakes"),
      ul("Letting the assistant say what someone will owe or be refunded.", "Accepting documents in chat.", "Not updating capacity, so visitors are promised what you cannot deliver.", "Skipping the checklist, so clients arrive unprepared.", "Ignoring after-season enquiries."),

      h2("Worked example: a five-person firm in February"),
      p("A five-person firm receives about 220 enquiries in February, compared with 30 in a normal month. In previous years the partners answered most of them between client meetings and lost roughly a third to slow replies. This year the assistant answers each one at once. It shares the fee guide and document checklist, explains that new individual clients are accepted until March 10, and books onboarding calls with the two preparers who still have space. Self-employed and rental clients are routed to the relevant preparer, and anyone with an unresolved notice is flagged for a partner. By the end of the month the firm has booked forty-two onboarding calls and declined the overflow politely with an extension offer. The partners spent their evenings on returns, not on replying to the same five questions."),
      table(["Item", "Before (illustrative)", "With chat"], ["Enquiries answered within an hour", "About half", "Nearly all"], ["Onboarding calls booked from the website", "Few", "42"], ["Partner time on repeat questions", "Hours daily", "Minutes"], ["Overflow handled", "Ignored or late", "Polite decline with an alternative"]),

      h2("Common mistakes"),
      ul("Saying yes to everyone and then missing deadlines.", "Not updating the assistant when capacity changes.", "Allowing documents or tax identifiers to be typed into the chat.", "Failing to send the checklist, so clients arrive unprepared.", "Turning the assistant off after the season, when planning enquiries continue."),

      h2("Frequently asked questions"),
      faq(
        ["Can a chatbot help with tax season enquiries?", "Yes. It can answer questions about fees, documents and capacity, sort enquiries by client type and book onboarding calls. It must not give tax advice."],
        ["Should clients send documents in the chat?", "No. Send them to a secure portal or upload method after they engage."],
        ["How do I handle capacity limits?", "State them in the assistant's documents and update as they change, with a waiting list or referral message for overflow."],
        ["Can it quote fees?", "It can share published starting prices and what affects them, not fixed prices for returns it has not seen."],
        ["Does it work after the season?", "Yes. Update it for year-round services such as bookkeeping and planning."],
        ["What does it cost?", "Plans start at $49 a month; booking is on the Growth plan. See the pricing page."],
      ),
      p("Try a tax-season conversation with your own fees and checklist in the [playground](/playground), see the [AI assistant feature](/product/ai-assistant) and read [AI intake for professional services](/blog/ai-intake-scheduling-professional-services)."),
    ],
  }),

  pillar({
    slug: 'financial-advisor-consultation-booking-compliance',
    title: 'Financial Advisors and Website Chat: Booking Consultations Within Compliance Rules',
    description: 'How financial advisors can use chat to explain their services, capture enquiries and book consultations without giving advice, with disclosure, record keeping and approval basics.',
    primaryKeyword: 'financial advisor chatbot',
    secondaryKeywords: ['financial adviser lead capture', 'wealth management website chat', 'advisor consultation booking', 'compliant chatbot financial services'],
    body: [
      p("Financial advice is a relationship business built on trust and heavily shaped by regulation. Prospects want to know whether an adviser can help them, how the adviser is paid and what a first meeting involves, and they want answers quickly, often outside office hours. A website chat can provide those answers and book an introductory meeting. But the same regulation that makes trust important makes automated communication risky: anything that looks like personalised advice or a recommendation can breach the rules, and communications may need to be approved, recorded and kept. This guide explains how an advisory firm can use chat carefully: what to allow and forbid, how to handle disclosure, what to collect, how to book consultations and how to work with compliance so the assistant is an asset rather than a liability."),
      note("Financial services regulation varies by country and by the type of firm. This is general information, not legal or compliance advice. Involve your compliance officer from the start, and check your regulator's rules on advertising, electronic communications and record keeping."),

      h2("What prospects ask"),
      table(["Question", "What the chat can do"], ["What do you do and who do you help?", "Describe services and client types in approved language"], ["How are you paid?", "State your fee model as approved: fees, commissions or both"], ["What is a first meeting like?", "Explain length, cost and what to prepare"], ["Should I invest in X?", "Not answer; explain that advice is given by qualified advisers"], ["What return can I expect?", "Not answer; explain that you do not predict or promise returns"], ["Can you help with retirement, mortgages, insurance?", "Say what you offer, and route to the right adviser"], ["Are you regulated?", "State your regulatory status and how to verify it"]),

      h2("The line between information and advice"),
      table(["Allowed", "Not allowed"], ["Describing services and the process", "Recommending an investment, product or strategy"], ["Explaining general concepts in neutral terms", "Suggesting what a person should do with their money"], ["Stating fees and status as approved", "Quoting performance or predicting returns"], ["Booking an introductory meeting", "Commenting on an individual's circumstances"], ["Directing to your disclosures", "Guaranteeing results"]),
      p("Write these boundaries into the assistant's instructions, and test them with tempting questions such as 'Should I put my savings in property or stocks?'"),

      h2("Disclosure and required statements"),
      ul("Say that it is an AI assistant and cannot give advice.", "State that advice is given by authorised advisers at a consultation.", "Include statements your regulator requires on risk, status and how you are paid, as your compliance officer decides.", "Link to your privacy policy and your regulatory disclosures.", "Make clear that using the chat does not create an advisory relationship."),
      p("Have compliance approve the greeting, the disclosure lines and any standard statements the assistant may use. See [AI transparency and disclosure](/blog/ai-transparency-disclosure-building-trust)."),

      h2("What to collect"),
      table(["Field", "Purpose"], ["Name and contact method", "Reply"], ["Area of interest: retirement, investments, protection, business, other", "Route to the right adviser"], ["Timeframe", "Priority"], ["Preferred meeting time", "Booking"], ["Consent to be contacted", "Compliance"]),
      p("Do not collect account numbers, national identifiers, detailed financial positions or documents in an open chat. Tell prospects the adviser will explain what is needed during an appropriate process. See the [GDPR checklist for website chatbots](/blog/website-chatbot-gdpr-checklist)."),

      h2("Book the introductory meeting"),
      ol("Explain the meeting: length, format, cost or no cost, and what the adviser will cover.", "Say what to bring or think about, without asking for figures.", "Offer real times, including evenings if you have them.", "Confirm by email with the adviser's name, their credentials and how to change the time.", "Send a reminder."),
      p("Crescelo's built-in picker offers slots from your opening hours with one slot length, and confirmation emails include a private link to reschedule or cancel. For different advisers or meeting types, use Calendly or Cal.com links. See [AI appointment booking](/blog/ai-appointment-booking) and [paid discovery call booking](/blog/paid-discovery-call-booking-chat)."),

      h2("Record keeping and approval"),
      ul("Ask compliance whether chat transcripts count as records you must keep, and for how long.", "Store transcripts securely with limited access, and delete them at the end of the retention period.", "Keep versions of the assistant's instructions and documents, with dates, so you can show what it was allowed to say.", "Review transcripts regularly for wording that drifts toward advice.", "Re-approve the wording when regulations or your services change."),
      p("Governance is what turns a chatbot from a risk into a controlled communication channel."),

      h2("Vulnerable clients and sensitive moments"),
      p("Some visitors are recently bereaved, in financial distress or facing a big decision. The assistant should respond with care, avoid pressure and offer a person. Do not use urgency or fear to push a booking. If someone appears to be in crisis, provide appropriate support information rather than a sales flow."),

      h2("A sample conversation"),
      table(["Speaker", "Message"], ["Visitor", "I am 58 and want to retire in five years. What should I do with my pension?"], ["Assistant", "That is a big and important question. I am an AI assistant, so I cannot give advice or say what you should do, and this chat does not create an advisory relationship. One of our authorised advisers can talk it through with you in a free 30-minute introductory meeting. Would you like to see times this week? Please do not share account or financial details here."]),

      h2("Measure it"),
      table(["Metric", "Why"], ["Enquiries and meetings booked", "Conversion"], ["Meeting no-show rate", "Reminder quality"], ["Meetings to clients", "Lead quality"], ["Transcripts reviewed and issues found", "Compliance"], ["Out-of-hours enquiries", "Coverage"]),

      h2("A compliance review routine"),
      p("Treat the assistant like any other client communication. Before launch, have your compliance officer read every document the assistant uses and every instruction it follows, and test a list of tempting questions: 'Which fund should I buy?', 'Is this a good time to invest?', 'What return will I get?' After launch, review a sample of transcripts every week for the first month and monthly afterwards, looking for anything that sounds like advice, a promise or an unapproved statement. Record what you reviewed and what you changed. When rules or your services change, repeat the process. This routine is what allows a regulated firm to use automation with confidence."),
      table(["When", "Check"], ["Before launch", "Documents, instructions, disclosures and tempting-question tests approved"], ["First month", "Weekly transcript sample review"], ["Ongoing", "Monthly review and record of changes"], ["On any rule or service change", "Re-approval of wording"]),

      h2("Common mistakes"),
      ul("Letting the assistant comment on markets or products.", "Omitting required disclosures.", "Collecting account or identity details in the chat.", "Failing to keep records of the assistant's instructions and transcripts.", "Using urgency to push bookings with vulnerable prospects."),

      h2("Working with your compliance officer"),
      p("Bring compliance in as a partner, not a gatekeeper at the end. Show them the assistant working in the testing area, walk through the disclosure and the forbidden topics together, and ask what they would like changed. Compliance officers often help design better controls, such as a standard statement the assistant always uses, or a rule that certain words trigger a handover. Their involvement also gives your firm a documented approval trail."),

      h2("Frequently asked questions"),
      faq(
        ["Can a financial advisor use a chatbot?", "Yes, to explain services, capture enquiries and book meetings, provided it gives no advice, uses approved wording and complies with record-keeping rules."],
        ["Can the chatbot recommend products?", "No. Recommendations are advice and must come from authorised advisers."],
        ["Do chat transcripts need to be kept?", "Possibly. Ask your compliance officer what your regulator requires."],
        ["What should the chat say about risk and returns?", "That it does not predict or promise returns, with any required risk statements approved by compliance."],
        ["What should it collect?", "Name, contact method, area of interest and timeframe, with consent. Not account numbers or detailed finances."],
        ["How do I keep it compliant?", "Involve compliance from the start, test tempting questions and review transcripts regularly."],
      ),
      p("Try a consultation booking conversation in the [playground](/playground), read [AI chatbots for law firms and professional services](/blog/ai-intake-scheduling-professional-services) for related principles and [start a free trial](/login?mode=register)."),
    ],
  }),

  pillar({
    slug: 'explaining-legal-fees-billing-models-chat',
    title: 'Explaining Legal Fees in Chat: Hourly, Fixed and Contingency Without Quoting Cases',
    description: 'How law firms can explain fee structures in a website chat: hourly, fixed, retainer and contingency models, what to say and avoid, estimates, transparency and handover.',
    primaryKeyword: 'explain legal fees chatbot',
    secondaryKeywords: ['law firm fee questions', 'contingency fee explanation', 'legal billing transparency', 'law firm chatbot pricing'],
    body: [
      p("'How much will it cost?' is the question prospective clients most fear asking and most want answered. For law firms it is also a difficult one: costs depend on the matter, the other side and how long things take. Firms that dodge the question lose enquiries to competitors that answer, and firms that answer carelessly create disputes. A website chat can explain how the firm charges in plain language, at any hour, without quoting for a specific case, and lead prospects to a consultation where a proper estimate can be given. This guide explains how to do that: the fee models and how to describe them, what to say and never say, how to handle requests for numbers, how to talk about estimates and how to keep the chat consistent with your engagement terms."),
      note("Rules on fee disclosure, advertising fees and contingency arrangements vary by jurisdiction and profession. This is general information, not legal advice. Have your ethics or compliance partner approve the wording."),

      h2("The common fee models"),
      table(["Model", "How it works", "Typical use"], ["Hourly", "Client pays for time spent, at rates by seniority", "Complex or uncertain matters"], ["Fixed fee", "An agreed price for a defined scope", "Routine work: wills, simple conveyancing, incorporation"], ["Capped fee", "Hourly, up to an agreed maximum unless scope changes", "Where the client needs a ceiling"], ["Retainer", "Regular payment for ongoing access or work", "Business clients, ongoing advice"], ["Contingency or conditional fee", "Fee depends on the outcome, where permitted", "Some injury and claim matters"], ["Free initial consultation", "Short first meeting without charge", "Marketing and assessment"]),
      p("Describe only the models your firm offers, with the terms you have approved."),

      h2("Explain in plain words"),
      table(["Jargon", "Plain wording"], ["We bill on a time and materials basis", "You pay for the time we spend on your matter, at our hourly rates."], ["Flat fee engagement", "We agree a price in advance for a defined piece of work."], ["Contingent on recovery", "You pay nothing unless your claim succeeds. If it does, our fee is taken as a percentage of what is recovered, plus certain costs, as set out in our agreement."], ["Disbursements", "Costs we pay to third parties on your behalf, such as court fees, which are extra."]),
      p("If a model has caveats, such as costs that clients may still owe, state them. Hidden caveats cause the disputes you want to avoid."),

      h2("What the assistant can and cannot say"),
      table(["Can say", "Must not say"], ["How the firm charges, in general", "What a specific matter will cost"], ["Published fixed fees for routine services", "That a case will be cheap, quick or 'straightforward'"], ["That estimates are given after a consultation", "That the fee is guaranteed unless it is written in an engagement letter"], ["Typical costs the firm publishes and stands behind", "Comparisons that disparage other firms"], ["That additional costs may apply, and which types", "Anything that contradicts the engagement terms"]),
      p("Write these limits into the instructions and test with questions like 'What will a divorce cost me?'"),

      h2("When a prospect asks for a number"),
      p("Give them something useful without promising. A good answer names the model, gives a published range if you have one, explains what affects the cost and offers the next step. Example: 'For a straightforward uncontested divorce we charge a fixed fee from $X. It can be higher if there are children or property to divide, and we confirm the fee in writing after a short consultation. Would you like to book one?'"),
      ul("Give ranges only if you can honour them.", "Say what moves the price.", "Offer a consultation for a firm estimate.", "Never contradict what a lawyer will say later."),

      h2("Estimates, updates and transparency"),
      p("Fee disputes often grow from surprise. Encourage a habit of transparency, and have the assistant reflect it: written estimates after the consultation, updates when costs approach the estimate and agreement before scope changes. The assistant can explain your practice in general terms so that expectations are set from the first contact."),

      h2("Free consultations: be precise"),
      ul("State the length of the free consultation and what it covers.", "Say what is not included, such as detailed advice or document review.", "Explain how the consultation leads to an engagement.", "Do not describe a consultation as free if any part is charged."),
      p("Booking the consultation in the chat is the natural next step. Crescelo's built-in picker offers slots from your opening hours with one slot length; set it to your consultation length. See [AI appointment booking](/blog/ai-appointment-booking)."),

      h2("Contingency fees: extra care"),
      p("Where contingency fees are permitted, describe them accurately: when the fee is payable, the percentage in general terms as approved, and that clients may still be responsible for certain costs. Some jurisdictions restrict what can be said in advertising about contingency arrangements. Have the wording approved and keep it consistent across your website, your chat and your engagement letter."),

      h2("Consistency with your documents"),
      ol("Put the fee explanations in one approved document per model.", "Load them into the assistant's knowledge, dated.", "Update them whenever rates or terms change.", "Remove old versions.", "Review transcripts for statements that go beyond the document."),
      p("See [legal intake automation and conflict checks](/blog/legal-intake-automation-conflict-checks) and [confidentiality and privilege with an AI assistant](/blog/confidentiality-attorney-client-privilege-ai-chat)."),

      h2("A sample conversation"),
      table(["Speaker", "Message"], ["Visitor", "How much would it cost to write a will?"], ["Assistant", "We offer wills for a fixed fee, starting from $X for a single person and $Y for a couple, which covers the meeting, drafting and signing. It can be higher for complex situations such as trusts or overseas property, and we confirm the fee in writing before we begin. I am an AI assistant and cannot give legal advice. Would you like to book a short call to talk through what you need?"]),

      h2("Measure it"),
      table(["Metric", "Why"], ["Fee questions asked and consultations booked", "Conversion"], ["Handovers on fee questions", "Where the wording falls short"], ["Complaints about fee surprises", "Whether transparency works"], ["Enquiries lost after fee answers", "Whether pricing is competitive or unclear"]),

      h2("A quick checklist for your fee documents"),
      ul("One page per fee model you actually use.", "Plain-language description, with examples of what is and is not included.", "Any published fixed fees, with the date they were last confirmed.", "How estimates are given and updated.", "What extra costs may apply, such as court fees or expert reports.", "How to raise a concern about fees."),
      p("These documents also serve as the source for your website's fees page, so the chat, the website and the engagement letter say the same thing. Consistency is your protection: when a client says 'your website told me...', you want the answer to be the same everywhere."),

      h2("Common mistakes"),
      ul("Letting the assistant say a matter will be cheap or quick.", "Publishing fixed fees that only apply to simple cases without saying so.", "Using jargon that clients do not understand.", "Forgetting to mention extra costs.", "Not updating fee documents when rates change."),

      h2("Frequently asked questions"),
      faq(
        ["Can a chatbot explain legal fees?", "Yes, in general terms and from approved documents. It must not quote a fee for a specific matter."],
        ["Should the chatbot give prices?", "Only published fixed fees or ranges the firm will honour, with a note that a written estimate follows a consultation."],
        ["How do I explain contingency fees?", "In plain words, as your rules allow, including when the fee is payable and that some costs may still apply."],
        ["What about free consultations?", "State exactly what is included and how long it lasts."],
        ["How do I stop the chatbot promising a price?", "Write clear rules, test with tempting questions and review transcripts."],
        ["Who approves the fee wording?", "Your ethics or compliance partner, and it should match your engagement letters."],
      ),
      p("Try a fee conversation on your own fee documents in the [playground](/playground), see the [AI assistant feature](/product/ai-assistant) and read [AI chatbots for law firms](/blog/ai-intake-scheduling-professional-services)."),
    ],
  }),

  pillar({
    slug: 'consultant-client-intake-automation',
    title: 'Client Intake for Consultants: Qualify High-Value Enquiries Without Wasting Discovery Calls',
    description: 'How independent consultants and small agencies can use chat to qualify enquiries, filter poor fits, capture project details and book discovery calls with people ready to buy.',
    primaryKeyword: 'consultant client intake',
    secondaryKeywords: ['consultant lead qualification', 'discovery call booking', 'agency intake form alternative', 'high ticket client intake'],
    body: [
      p("For a consultant or a small agency, time is the product. Every discovery call that goes nowhere is an hour that could have been billable or restful. Yet enquiries arrive as vague one-liners: 'Can you help with our marketing?', 'How much is a website?' Answering each properly takes time, and ignoring them loses good clients. A chat on your website can do the sorting for you. It explains what you do and what you do not, asks the few questions that show whether someone is a fit, shares how you work and price, and books discovery calls only with people who are ready. This guide explains how to set that up: what to publish, which questions to ask, how to filter kindly, how to book the call and how to follow up."),

      h2("What makes an enquiry high value"),
      table(["Signal", "Good sign", "Warning sign"], ["Problem", "Specific, with a business reason", "Vague, no outcome named"], ["Budget", "Realistic for your work", "Far below your minimum, or 'as cheap as possible'"], ["Timeline", "Clear and workable", "Yesterday, or 'no rush' for months"], ["Authority", "Decision maker or reporting to one", "Gathering quotes for someone else"], ["Fit", "Your niche and method", "Outside your expertise"]),
      p("The aim is not to be selective for its own sake but to spend your time where you can help most."),

      h2("Publish the things that filter"),
      p("The best filter is information. State on your site and in the assistant's documents:"),
      ul("Who you work with and who you do not.", "Typical project types, sizes and durations.", "Your minimum engagement or starting fee.", "How you work: process, communication and what you need from clients.", "Current availability and lead time.", "Examples and results you can share."),
      p("Visitors who see a $10,000 minimum will either qualify themselves out or arrive prepared, saving you both time. Hiding your prices attracts enquiries you cannot serve."),

      h2("Questions that qualify without interrogating"),
      table(["Question", "Natural wording", "What it tells you"], ["What are you trying to achieve?", "What outcome would make this project a success?", "Clarity of the problem"], ["What is the scope?", "Roughly what do you have in mind, for example a one-off project or ongoing support?", "Size and type"], ["What is the timeline?", "When would you like to start?", "Urgency and feasibility"], ["What is the budget range?", "Our projects usually start around $X. Does that fit what you had in mind?", "Fit with your minimum"], ["Who decides?", "Who else would be involved in choosing?", "Authority"]),
      p("Offer your minimum as information rather than asking for a number: it feels fairer, and it filters gently."),

      h2("Filter kindly"),
      p("When an enquiry is not a fit, the assistant should say so respectfully and, where possible, help. Options: point to a lower-cost resource such as a guide, refer to a colleague or a directory, invite them to return when their situation changes, or offer an email list if they consent. Never be curt. A polite decline builds your reputation and sometimes turns into a referral later."),

      h2("Booking the discovery call"),
      ol("Explain what the call is: length, format, whether it is free or paid and what you will cover.", "State what to prepare, such as a short brief or goals.", "Offer real times and confirm by email with a video link or dial-in.", "Ask for a short pre-call summary if it helps.", "Send a reminder and a change link."),
      p("If your calls are paid, say so plainly, and explain what the fee covers. See [paid discovery call booking](/blog/paid-discovery-call-booking-chat) and [eliminating unpaid consulting requests](/blog/eliminating-unpaid-consulting-requests-chat). Crescelo's built-in booking offers slots from your opening hours and one slot length; use Calendly or Cal.com if you need different call types. See [AI appointment booking](/blog/ai-appointment-booking)."),

      h2("Time zones and availability"),
      p("Consultants often serve clients in other time zones. State your working hours and time zone, confirm times in both zones in the confirmation and set booking hours that protect your deep-work time. See [time zone scheduling for consultants](/blog/time-zone-global-scheduling-consultants)."),

      h2("Capture the brief"),
      p("A good intake creates a short brief for you: who they are, what they want, scope, timeline, budget fit and how they found you. Deliver it to your email with the conversation, so you can read for two minutes and decide whether to invest in the call. Crescelo sends lead emails with instant alerts and can send leads to Slack, Google Sheets or a webhook for your CRM. See [conversational lead capture](/blog/conversational-lead-capture)."),

      h2("Follow up without pressure"),
      table(["Lead", "Follow-up"], ["Booked a call", "Confirmation, prep note and reminder"], ["Qualified but not booked", "A short note a day later with a link to times"], ["Not ready", "Offer a resource and check in later, with consent"], ["Not a fit", "A kind decline and a suggestion"]),

      h2("A sample conversation"),
      table(["Speaker", "Message"], ["Visitor", "We need help with our marketing. What do you charge?"], ["Assistant", "Thanks for reaching out. I am an AI assistant for the studio. We work with B2B software companies on positioning and content, and projects usually start around $8,000. What outcome would make this project a success for you, and roughly when would you like to start?"], ["Visitor", "We want more qualified demos. Start next month. That is within budget."], ["Assistant", "That sounds like a good fit. I can offer a 30-minute discovery call on Tuesday or Thursday. Could you tell me your company name and role so Priya can prepare?"]),

      h2("Common mistakes"),
      ul("Hiding prices, then wasting calls on unsuitable enquiries.", "Asking too many questions before offering a call.", "Being cold to people who are not a fit.", "Booking calls into the middle of your focus time.", "Never reviewing what enquiries ask for."),

      h2("A worked example: a brand strategy studio"),
      p("A two-person brand strategy studio was taking six discovery calls a week and winning one. Half of those calls were with startups that could not afford its minimum project. It added a short chat to its website with its minimum stated up front, three qualifying questions and a clear description of its process. Discovery calls dropped to four a week, and the studio won two. Founders who were not a fit received a friendly note and a link to a free brand workbook, and several returned six months later, funded and ready. The studio's calendar became calmer, and the calls it did take started with clients who already understood how it worked."),
      table(["Item", "Before (illustrative)", "After"], ["Discovery calls per week", "6", "4"], ["Wins per week", "1", "2"], ["Calls with poor fits", "About 3", "About 1"], ["Follow-ups from filtered leads later", "None", "Several"]),

      h2("Protect your energy"),
      p("An intake chat is also a boundary. It lets you answer at your own pace, decline politely and keep your calendar for the work that matters. Many consultants find that this alone makes the business calmer, because they no longer feel obliged to reply to every enquiry within minutes."),

      h2("A quarterly tune-up"),
      p("Every quarter, look at the last fifty enquiries. Which types did you win, and which wasted your time? What did visitors ask that your site did not answer? Did your minimum or availability change? Update the assistant's documents and questions to match. A consultancy's positioning shifts over time, and an intake that reflects last year's offer will attract last year's clients."),

      h2("Frequently asked questions"),
      faq(
        ["How do I stop wasting discovery calls?", "Publish who you serve and your minimum, use a short intake to qualify and book calls only with people who fit."],
        ["Should I show my prices?", "At least a starting point. It filters and builds trust."],
        ["Can a chatbot decline poor-fit enquiries?", "Yes, kindly, with a helpful suggestion. Have a person review the tone."],
        ["What should intake ask?", "The goal, scope, timeline, budget fit and who decides, in natural wording."],
        ["Can I charge for discovery calls?", "Yes, if you explain what the fee covers. Some consultants find it improves quality."],
        ["How do I handle time zones?", "State your hours and zone, and confirm times in both zones."],
      ),
      p("Try an intake conversation with your own services in the [playground](/playground), see the [lead capture feature](/product/lead-capture) and [start a free trial](/login?mode=register)."),
    ],
  }),

  pillar({
    slug: 'executive-coaching-client-qualification-chat',
    title: 'Executive Coaching Enquiries: Qualifying Clients and Booking Chemistry Calls by Chat',
    description: 'How coaches can use a chat to explain their approach, qualify enquiries, handle sponsor and self-funded clients, protect confidentiality and book chemistry calls.',
    primaryKeyword: 'executive coach client qualification',
    secondaryKeywords: ['coaching chemistry call booking', 'coach website chatbot', 'coaching lead capture', 'executive coaching enquiry'],
    body: [
      p("Coaching is personal. Prospective clients want to know whether a coach understands their situation, whether the chemistry will work and whether the investment makes sense, and coaches want to work with people who are ready to change. Enquiries come through websites, referrals and events, and the first conversation is usually a 'chemistry call'. Too many of those calls are with people who are curious but not ready, or who cannot afford the work, and the coach is left giving free advice. A chat can help with the early part: explain the approach, answer common questions, share the structure and fees, ask a few questions that show readiness, and book chemistry calls with people who are a good match. It should do so warmly, because a cold, transactional first impression is a poor start for a relationship business. This guide explains how."),

      h2("What prospective clients ask"),
      table(["Question", "What to say"], ["What is coaching and how is it different from therapy or consulting?", "Your plain-language definition and boundaries"], ["What is your approach and experience?", "Your method, training and the kinds of clients you serve"], ["How does it work?", "Session length, frequency, duration and format"], ["How much does it cost?", "Your fee structure, or a range and what it includes"], ["Who pays: me or my employer?", "How you work with sponsors, and how confidentiality is handled"], ["Can I try a session?", "Your chemistry call or trial arrangement"], ["Is it confidential?", "Your confidentiality commitments and their limits"]),

      h2("Boundaries: coaching is not therapy"),
      ul("The assistant should not diagnose or offer mental health advice.", "If a visitor describes distress, crisis or thoughts of self-harm, it should respond with care, share appropriate support resources and offer to connect them with a person.", "It should explain that coaching is future-focused and that it may not be suitable for certain needs.", "It should not promise outcomes."),
      p("Write these lines with care and test them with sensitive messages. A caring, clear response matters more than any sales flow."),

      h2("Readiness questions that feel natural"),
      table(["Question", "Wording", "What it shows"], ["What prompted you to look for a coach now?", "What is happening that made now the right time?", "Motivation and urgency"], ["What would success look like?", "If we worked together for six months, what would be different?", "Clarity of goals"], ["Have you worked with a coach before?", "Have you had coaching or mentoring before?", "Experience and expectations"], ["Who is funding it?", "Is this something you are arranging yourself, or through your organisation?", "Sponsor process"], ["What is your timeline?", "When would you like to start?", "Availability fit"]),
      p("Three or four questions are enough. Avoid probing personal history in a chat; that belongs in the conversation with you."),

      h2("Self-funded and sponsored clients"),
      table(["Client", "Process"], ["Self-funded", "Explain fees and terms clearly; offer a chemistry call"], ["Employer-sponsored", "Explain how sponsor agreements work: who signs, who receives reports and what stays confidential; capture the sponsor's contact if appropriate"], ["HR-led programme", "Route to your programme team or a proposal conversation"]),
      p("Sponsored engagements involve a third party, so clarity about confidentiality is essential. The assistant should not promise anything about what will be shared; it should say that terms are agreed in writing and explained on the call."),

      h2("Book the chemistry call"),
      ol("Explain what it is: length, format and cost, usually free.", "Set expectations: this is a conversation to see whether you are a match, not a coaching session.", "Offer real times, in the visitor's time zone if needed.", "Confirm by email with the video link and a short pre-call question or two.", "Send a reminder and a change link."),
      p("Crescelo's built-in booking offers slots from your opening hours with one slot length, and you can connect Calendly or Cal.com. See [paid discovery call booking](/blog/paid-discovery-call-booking-chat) and [AI appointment booking](/blog/ai-appointment-booking)."),

      h2("Fees and value"),
      p("Coaching is a considered purchase. Being open about fees respects the visitor and filters enquiries. State your packages in plain terms: what is included, the duration and the investment. If you offer sliding scales or pro bono places, describe how they work. Avoid pressure tactics, false scarcity or promises of transformation."),

      h2("Confidentiality and data"),
      ul("Tell visitors the chat is an AI assistant and link to your privacy policy.", "Ask them not to share sensitive personal information in the chat.", "Collect only what you need to book: name, contact and a line about what they are looking for.", "Keep transcripts secure and delete them when no longer needed.", "Follow the code of ethics of your coaching body, and the privacy law that applies to you."),
      p("See the [GDPR checklist for website chatbots](/blog/website-chatbot-gdpr-checklist) and [empathetic conversational tone for coaching chat](/blog/empathetic-conversational-tone-coaching-chat)."),

      h2("A sample conversation"),
      table(["Speaker", "Message"], ["Visitor", "I have just been promoted to director and I feel out of my depth. Do you coach new leaders?"], ["Assistant", "Congratulations, and it is very common to feel that way at first. Yes, we work with newly promoted leaders, usually over six months with sessions every two weeks. I am an AI assistant, and Priya would be your coach. Would you like a free 30-minute chemistry call to see if it feels right? What has been the hardest part so far?"], ["Visitor", "Managing people who used to be my peers."], ["Assistant", "That is a classic challenge, and one Priya works on a lot. I can offer Wednesday at 5 p.m. or Friday at 9 a.m. What name and email should I use?"]),

      h2("Follow-up and nurture"),
      ul("After the call, send a thank-you with next steps and no pressure.", "For those not ready, offer a resource and permission to check in later.", "Ask for feedback on the process, to improve it.", "Invite clients who complete their programme to share testimonials, only with consent."),

      h2("Measure it"),
      table(["Metric", "Why"], ["Enquiries and chemistry calls booked", "Conversion"], ["Calls to clients", "Quality of the filter"], ["Enquiries outside your niche", "Clarity of your website"], ["Out-of-hours enquiries", "Coverage"], ["Sensitive messages handled", "Care and safety"]),

      h2("A worked example: a leadership coach"),
      p("A leadership coach was getting two chemistry calls a week, many with people who wanted free advice or who were looking for therapy. She added a chat that explained her approach and boundaries, stated her package range and asked two readiness questions. Visitors seeking therapy were redirected kindly to appropriate resources, and those interested in coaching booked calls. Her chemistry calls fell to one or two a week, and more became clients. The chat also gave her a record of what people were asking for, which she used to write two new articles that brought in more of the right clients. She noted that the greatest benefit was calm: every call began with a person who understood what she offered."),

      h2("Common mistakes"),
      ul("Turning a warm chat into a sales funnel.", "Answering personal distress with a booking prompt.", "Promising transformation.", "Hiding fees.", "Not explaining sponsor confidentiality clearly.", "Booking calls without time zone clarity."),

      h2("A short pre-launch checklist"),
      ul("Your approach, boundaries and confidentiality terms are written in your own voice.", "Sensitive-message rules are tested: distress, crisis and requests for therapy.", "Fees and packages are stated plainly.", "The chemistry call is described honestly.", "Alerts and booking work, and time zones are clear."),

      h2("Frequently asked questions"),
      faq(
        ["Can a chatbot qualify coaching clients?", "Yes, with a few warm questions about motivation, goals and timing, and it can book chemistry calls."],
        ["Should it discuss personal problems?", "No. It should keep to booking and general information, respond with care to distress and offer a person and appropriate resources."],
        ["How do I handle employer-sponsored coaching?", "Explain that terms are agreed in writing and that confidentiality will be explained on the call, and route to the right person."],
        ["Should I show my fees?", "Being clear about fees respects visitors and filters enquiries."],
        ["What about confidentiality?", "Ask visitors not to share sensitive details in the chat, and keep transcripts secure."],
        ["Is a chemistry call free?", "Usually, but say exactly what it includes and its length."],
      ),
      p("Try a chemistry-call booking in the [playground](/playground), read [AI chatbots for professional services](/blog/ai-intake-scheduling-professional-services) and [start a free trial](/login?mode=register)."),
    ],
  }),
];
