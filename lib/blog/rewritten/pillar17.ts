import { faq, h2, h3, note, ol, p, pillar, table, ul } from '../authoring';

export const PILLAR17 = [
  pillar({
    slug: 'handling-emergencies-automated-chat',
    title: 'Handling Emergencies in Automated Chat: Rules Every Service Business Needs',
    description: 'How to make an AI chat safe when visitors describe emergencies: triggers, approved wording, alerts, out-of-hours routes, testing and the mistakes that put customers at risk.',
    primaryKeyword: 'chatbot emergency handling',
    secondaryKeywords: ['emergency protocol chatbot', 'urgent messages website chat', 'chatbot safety rules', 'AI assistant emergency escalation'],
    body: [
      p("Most conversations with a business chatbot are ordinary: prices, hours, bookings. But every service business also receives the occasional message that is not ordinary. A burst pipe, a gas smell, severe tooth pain, a client in crisis, a customer who says they are going to hurt themselves. What the assistant does in those moments is the true test of whether it is safe to put in front of the public. An assistant that carries on with a booking flow, reassures someone who needs help or promises a technician it cannot send can cause real harm and real liability. This guide explains how to design emergency handling: the principles, how to write the triggers and the wording, how to alert people, what to do out of hours, how to test, and how to review after a real incident. It applies to any business, and links to industry-specific guides where relevant."),
      note("This is general information, not legal, medical or safety advice. Emergency handling must be written and approved by people qualified for your industry, and must follow local rules and your insurance requirements."),

      h2("The principles"),
      ol("**Safety before sales.** In an emergency, drop the booking flow and help.", "**Route, do not diagnose.** The assistant is not a professional and must not assess severity or give treatment or repair instructions.", "**Give approved wording only.** Write it in advance with qualified people.", "**Get a human involved fast.** Alert someone who will act, by more than one route.", "**Be honest about what you can do.** Never promise arrival times or outcomes you cannot guarantee.", "**Direct to emergency services when in doubt.** It is always better to over-refer than to under-refer."),
      p("These principles are simple. The work is in turning them into rules the assistant follows reliably."),

      h2("Write the triggers"),
      p("Start by listing the emergencies your business could meet, and the words people use. Ask your staff: what are the frightening messages you have received?"),
      table(["Business", "Examples of urgent messages"], ["Plumbing and heating", "Flooding, burst pipe, gas smell, no heat with vulnerable people at home"], ["Electrical", "Burning smell, sparks, smoke, shock, exposed wires"], ["Dental and medical practices", "Severe pain, swelling, bleeding, trouble breathing, injury"], ["Roofing and building", "Water pouring in, structural damage, tree through the roof"], ["Pest control", "Stings with a reaction, nests near entrances with allergic occupants"], ["Legal and professional", "Deadlines within days, safety risks, distress"], ["Any business", "A person who says they are in danger or may harm themselves"]),
      p("Include misspellings, slang and phrases in the languages you serve. 'my kitchen is flooding', 'water everywhere', 'smoke coming from the plug', 'i cant breathe' all need to be caught."),

      h2("Two tiers of response"),
      table(["Tier", "When", "What the assistant does"], ["1: danger to life or safety", "Anything suggesting immediate risk", "Tells the visitor plainly to contact emergency services, gives short safety instructions you approved, alerts your on-call person, and stops the normal flow"], ["2: urgent but not life-threatening", "A situation that needs fast professional help", "Gives approved interim guidance, gives your emergency number or route, captures name and phone, alerts the team, and is honest about timing"]),
      p("Keep the wording short, calm and specific. The person reading it may be frightened."),

      h2("Wording templates for your team to adapt"),
      table(["Situation", "Template"], ["Tier 1", "This sounds serious. Please call emergency services now. If it is safe, move away from the danger. I have alerted our team, but please do not wait for us."], ["Tier 2, open", "I am sorry this is happening. Please call us right now on [number], as we are open and can help. I have alerted the team, and they will look for your call."], ["Tier 2, closed", "I am sorry this is happening. We are closed, but our emergency line is [number]. I have alerted our on-call person, and they will reply as soon as they can. If it gets worse, or anyone is at risk, call emergency services."], ["Personal crisis", "I am concerned about how you are feeling. You deserve support from a person. If you are in immediate danger, please call emergency services. In [country], you can also contact [crisis line]. I have asked a member of our team to reach out."]),
      p("These are drafts. Your industry and region determine the right words, the right numbers and what is appropriate to say."),

      h2("Alerts that reach a person"),
      ul("Instant email to a monitored address with the whole conversation.", "A text or push notification to the on-call phone; see [webhook automations](/blog/webhook-automations-zapier-make-chat-events).", "A second route if the first is not acknowledged within minutes.", "A named person on duty at all hours you promise coverage."),
      p("An alert that nobody sees is worse than no alert, because it creates false comfort. Test the route at night, on weekends and when the usual person is away. Crescelo can hand any conversation to your team with notifications and full history; see the [human handover feature](/product/human-handover) and [live human handover flow design](/blog/live-human-handover-flow-design)."),

      h2("Out-of-hours honesty"),
      p("If you have no out-of-hours cover, say so and give the visitor a real alternative: an emergency service, a utility's emergency line or a local provider. If you have on-call cover, say who and how quickly, and only what you can deliver. Never tell someone 'we will be there in 30 minutes' unless you can. See [after-hours appointment booking](/blog/after-hours-appointment-booking)."),

      h2("What the assistant must never do"),
      ul("Diagnose or reassure ('that sounds like nothing').", "Give repair, medical or treatment instructions.", "Continue a sales or booking flow after a danger signal.", "Promise arrival times or outcomes.", "Ask for sensitive details or images in an open chat.", "Argue with a visitor who says they are in danger."),

      h2("Test the rules"),
      ol("Write thirty realistic emergency messages for your business, with typos and casual phrasing.", "Add ten borderline messages that should not trigger emergency wording, such as 'do you do emergency callouts?'.", "Run all forty in the Testing Studio.", "Check the response wording, the alert and the stop of the normal flow.", "Test at night that the on-call person receives the alert.", "Repeat after any change to the assistant's instructions, and every quarter."),
      table(["Test type", "Pass condition"], ["Clear emergency", "Tier 1 wording and alert every time"], ["Urgent but not life-threatening", "Tier 2 wording and alert"], ["Not an emergency", "Normal answer; no false alarm"], ["Other language", "Understood and handled"], ["Repeated messages", "Assistant stays on the emergency path"]),

      h2("Review every real incident"),
      p("After any real emergency conversation, review it within a day: what did the visitor say, what did the assistant do, how fast did a person respond, what happened next and what would you change? Adjust triggers and wording, and record the change. Real cases teach more than any test list."),

      h2("A sample conversation"),
      table(["Speaker", "Message"], ["Visitor", "theres a burning smell coming from the fuse box"], ["Assistant", "This could be dangerous. Please leave the area, do not touch anything electrical and call emergency services now. I have alerted our on-call electrician and they will contact you as soon as possible. What is your name and phone number?"]),
      p("The assistant did not offer a booking, did not diagnose and did not promise a time. It gave safety guidance, alerted a person and asked for contact details."),

      h2("Common mistakes"),
      ul("Emergency rules written by marketing, not by qualified staff.", "Alerts sent to an unwatched inbox.", "No testing at night.", "Triggers that only catch formal wording.", "Wording that promises more than you can deliver.", "Never reviewing real incidents."),

      h2("Frequently asked questions"),
      faq(
        ["Can a chatbot handle emergencies?", "It should recognise urgent wording, give approved safety wording, alert a person and never diagnose or reassure. It is a route to help, not the help itself."],
        ["Who should write the emergency wording?", "Qualified people in your industry, such as your clinical lead, senior technician or safety officer."],
        ["What if nobody is on call?", "Say so honestly and direct the visitor to emergency services or another appropriate route."],
        ["How do I test emergency handling?", "Write realistic urgent and borderline messages, run them in the testing area, and check the wording and alerts, including at night."],
        ["Should the assistant continue booking after an emergency signal?", "No. Stop the normal flow and focus on safety and alerts."],
        ["How often should I review the rules?", "After every real incident and at least every quarter."],
      ),
      p("See how the [AI assistant](/product/ai-assistant) hands over rather than guesses, test your rules in the [playground](/playground) and read [dental emergency triage](/blog/dental-emergency-triage-ai-chat) and [electrician service call scheduling](/blog/electrician-service-call-scheduling-chat) for industry examples."),
    ],
  }),

  pillar({
    slug: 'live-human-handover-etiquette-best-practices',
    title: 'Live Handover Etiquette: How Your Team Should Take Over From the AI Assistant',
    description: 'What your team should do when they take over a chat from an AI: reading the history, greeting, correcting mistakes, tone, response times, closing the loop and training.',
    primaryKeyword: 'live chat handover best practices',
    secondaryKeywords: ['chatbot to agent handoff etiquette', 'taking over AI chat', 'human takeover script', 'live agent best practices'],
    body: [
      p("Designing when the AI hands over is half of a good handover. The other half is what your team does when they arrive. A visitor who has been chatting with an assistant and then meets a person is in a delicate moment. If the person says 'How can I help?' as though the conversation never happened, the visitor feels ignored. If the person is slow, curt or contradicts what the assistant said, trust drops. If the person reads the history, greets them by name, picks up the thread and solves the problem, the visitor remembers the business as helpful and organised. This guide is for the people who take over: what to check before you type, how to greet, how to handle mistakes made by the assistant, how to keep the right tone, how fast to respond, how to close the loop and how to train and review your team."),

      h2("Before you type: read the conversation"),
      ol("Read the whole conversation, not just the last message.", "Note the visitor's name, the problem in their own words and what they already tried.", "Check what the assistant told them: prices, times, promises.", "Note the reason for the handover: request, complaint, sensitive topic or unanswerable question.", "Check any contact details captured.", "Decide what you can do and what you need to find out."),
      p("Thirty seconds of reading prevents most of the mistakes that make handovers feel bad."),

      h2("Greeting that shows you have read it"),
      table(["Weak", "Better"], ["Hi, how can I help?", "Hi Sam, this is Priya from the team. I have read your conversation with our assistant, and I understand you want to move your Thursday appointment and you were charged twice. Let me look at both."], ["Hello.", "Hi Sam, thank you for your patience. I am Priya and I have your chat in front of me."], ["What is your problem?", "I am sorry about the double charge. Let me check that now."]),
      ul("Use their name.", "Say who you are.", "Show that you know the situation.", "Acknowledge feelings when relevant, briefly and sincerely."),

      h2("Speed and expectations"),
      p("Handover is a promise: a person is coming. Keep it. Reply within the time the assistant stated, and if you cannot solve the problem immediately, say what you will do and when. A quick 'I am checking this now and will reply in ten minutes' is far better than a long silence. If you are the wrong person, say who will take over and pass the conversation on properly."),

      h2("Correct the assistant without blaming it"),
      p("The assistant may have said something wrong or incomplete. Correct it plainly: 'I need to correct something. The price I see for that service is $95, not $85.' Do not blame the software or the customer, and do not make a fuss. Then record the error so the knowledge base can be fixed. See [how to review your chatbot's conversations each week](/blog/audit-website-chatbot-conversations)."),

      h2("Tone"),
      ul("Warm and plain, like a good receptionist.", "Short paragraphs; avoid jargon.", "Match the customer's level of formality, within your brand.", "Do not over-apologise, but do own real mistakes.", "Never argue; stay calm when someone is angry.", "Avoid canned phrases that ignore what the customer said."),
      p("See [de-escalating frustrated customers with AI guardrails](/blog/de-escalating-frustrated-customers-ai-guardrails)."),

      h2("Privacy and sensitive information"),
      ul("Do not ask for sensitive details in an open chat; move to a secure route.", "Verify identity before discussing account details, where relevant.", "Do not copy the conversation into unsecured places.", "Follow your privacy policy for how long chats are kept."),

      h2("Closing the loop"),
      ol("Confirm the outcome: what was done and what happens next.", "Ask whether there is anything else.", "Record the outcome in your system: resolved, booked, follow-up needed.", "If a follow-up is promised, put it in your task list, with a time.", "Note anything the assistant should learn for the future."),
      p("A handover that ends with 'thanks, bye' and no record leaves the next person without context."),

      h2("Hand back to the assistant, or not"),
      p("Decide with your team whether the conversation returns to the assistant after you finish, or ends. If it returns, say so: 'I will let the assistant help you with booking, and I am still here if you need me.' If you take over, keep control until the end so the visitor does not hear two voices."),

      h2("Handling out-of-hours takeovers"),
      p("When a handover arrives outside your hours, the first person in the next morning should start with an apology for the wait if the assistant promised a time, and with the conversation history in front of them. Prioritise by urgency: emergencies first, then complaints, then routine requests. See [live human handover flow design](/blog/live-human-handover-flow-design) for how to design the process around it."),

      h2("Training your team"),
      ul("Practise with three real past conversations: read, greet, resolve, close.", "Agree a standard for greeting and response times.", "Share examples of good handovers and bad ones.", "Make it easy to record assistant errors.", "Review a sample of handovers each week for the first month, then monthly."),
      table(["Skill", "How to practise"], ["Reading fast", "Time yourself on past conversations"], ["Tone", "Read replies aloud; ask a colleague to review"], ["Correcting the assistant", "Role-play awkward corrections"], ["Difficult conversations", "Role-play a complaint"]),

      h2("A sample handover"),
      table(["Speaker", "Message"], ["Assistant", "I am passing you to a team member now. They can see our conversation."], ["Team member", "Hi Sam, this is Priya. I have read your chat about the appointment on Thursday and the double charge, and I am sorry for the trouble. I can see two payments of $60 on the 4th. I have asked accounts to refund one and you should see it in three to five working days. I have also moved your appointment to Friday at 10:30. Is there anything else I can do?"]),

      h2("Measure handover quality"),
      table(["Metric", "Why"], ["Time to first human reply", "Whether the promise is kept"], ["Repeat questions after handover", "Whether context passed"], ["Resolution and satisfaction", "Whether people helped"], ["Assistant errors found", "Content to fix"], ["Handovers with no reply", "Process failures"]),

      h2("A one-page handover checklist"),
      ul("Read the full conversation.", "Greet by name and say who you are.", "Show what you have understood.", "Correct any mistake the assistant made, calmly.", "Say what you will do and by when.", "Do it, and confirm the outcome.", "Record the result and any content fix needed.", "Ask whether there is anything else."),
      p("Print this and keep it beside the screen for the first month. Once the routine is habit, the handover feels natural and the customer barely notices the join between assistant and person."),

      h2("Common mistakes"),
      ul("Starting with 'How can I help?' as if nothing was said.", "Contradicting the assistant without explanation.", "Leaving the visitor waiting with no update.", "Asking for information already given.", "Forgetting to record the outcome."),

      h2("When the visitor has left"),
      p("Sometimes a visitor closes the chat before you arrive. Use the contact details the assistant captured to reach them, by the method they chose, and refer to the conversation: 'You asked our assistant about moving your appointment; I have done that for you.' If no contact details exist, record the case so you can respond if they return."),

      h2("Frequently asked questions"),
      faq(
        ["What should I do first when I take over a chat?", "Read the whole conversation, note what the visitor wants and what the assistant said, then greet them by name and show you have read it."],
        ["How fast should I respond?", "Within the time the assistant promised, or sooner. If you need longer, say when you will reply."],
        ["What if the assistant gave the wrong answer?", "Correct it plainly without blaming anyone, and record it so the knowledge base can be fixed."],
        ["Should the assistant continue after I join?", "Usually not. Keep control until the end to avoid two voices, unless you deliberately hand back."],
        ["How do I train my team?", "Practise with real past conversations, agree standards for greetings and response times and review samples regularly."],
        ["How do I take over in Crescelo?", "You can take over any conversation from the dashboard in one click, with notifications and the whole history."],
      ),
      p("See the [human handover feature](/product/human-handover), try a handover in the [playground](/playground) and read [emergencies in automated chat](/blog/handling-emergencies-automated-chat)."),
    ],
  }),

  pillar({
    slug: 'de-escalating-frustrated-customers-ai-guardrails',
    title: 'Frustrated Customers and AI Chat: Guardrails That De-Escalate Instead of Inflame',
    description: 'How to configure an AI assistant to handle angry visitors: recognise frustration, respond with empathy, avoid defensiveness, stop loops, hand over fast and learn from complaints.',
    primaryKeyword: 'chatbot angry customers',
    secondaryKeywords: ['de-escalation chatbot', 'frustrated customer AI chat', 'complaint handling chatbot', 'sentiment escalation'],
    body: [
      p("Nothing tests a chatbot like an angry customer. Someone who has been waiting, was charged twice or feels ignored arrives with strong feelings and little patience. A well-designed assistant lowers the temperature: it listens, acknowledges, does not argue and gets a person involved quickly. A poorly designed one makes things worse: it repeats itself, offers irrelevant options, cheerfully ignores the complaint or blames the customer. Because angry conversations are where reputations are made or lost, they deserve deliberate design. This guide explains how to set up an assistant to recognise frustration, respond with empathy, avoid the behaviours that inflame, stop loops, hand over quickly and turn complaints into improvements."),

      h2("What frustration looks like in chat"),
      table(["Signal", "Example"], ["Explicit anger or complaint", "'This is ridiculous', 'I want to speak to a manager'"], ["Repetition", "The same question asked three times"], ["Shouting or heavy punctuation", "'WHY DID NOBODY REPLY???'"], ["Expressions of urgency or loss", "'I have been waiting an hour', 'I lost money'"], ["Threats to leave or review", "'I will never use you again'"], ["Sarcasm", "'Great, another useless bot'"], ["Short, terse replies after a long exchange", "'no.' 'wrong.'"]),
      p("The assistant should treat these as signals to change approach, not as noise."),

      h2("The right first response"),
      ol("**Acknowledge the feeling.** 'I am sorry, that sounds frustrating.'", "**Show you understand the problem.** Restate it briefly.", "**Offer a clear next step.** Usually a person, sometimes a quick fix.", "**Stay calm and short.** No long paragraphs, no jargon."),
      table(["Weak", "Better"], ["I understand you are upset. How can I help you today?", "I am sorry, being charged twice is frustrating. I want to get this sorted properly, so I am passing you to a team member now who can check your payments. They will see this conversation."], ["Please calm down.", "I can hear how frustrating this has been. Let me get someone who can fix it."], ["That is not possible.", "I cannot change that myself, but I can ask a team member to look at it right away."]),

      h2("Behaviours to design out"),
      ul("**Cheerfulness that ignores the complaint.** An exclamation-mark reply to an angry message enrages people.", "**Defensiveness.** Never argue about who is right.", "**Blaming the customer.** 'You should have read the policy' ends the relationship.", "**Loops.** The same suggestion repeated, or the same question re-asked.", "**Over-apologising.** A single sincere apology beats five hollow ones.", "**Making promises the assistant cannot keep.** 'I will fix this' when it cannot."),
      p("Write these into the assistant's instructions as things to avoid, with examples of better wording."),

      h2("Hand over quickly"),
      p("Frustrated customers should not have to ask twice. Set a rule: after one clear sign of anger, or two failed attempts to answer, offer a person. If the visitor asks for one, hand over immediately. Tell them what will happen and when. During office hours, notify your team at once with the conversation. Outside them, be honest about when a person will reply, and capture contact details. See [live human handover flow design](/blog/live-human-handover-flow-design) and [handover etiquette](/blog/live-human-handover-etiquette-best-practices)."),

      h2("Do not let the assistant handle refunds and disputes"),
      ul("Refunds, credits and disputes need human authority.", "The assistant can explain your policy in neutral terms and collect the details, but a person decides.", "It should never promise a refund or a discount.", "It should never argue that a charge was correct."),
      p("Say plainly: 'I cannot approve refunds, but I can pass this to the team with all the details.'"),

      h2("Sentiment detection and its limits"),
      p("Some products detect negative sentiment and can trigger a handover or alert. It can help, but it is not perfect: sarcasm, cultural differences and short messages can fool it, and a calm complaint can be serious. Treat it as an additional signal, not a replacement for simple rules such as keywords ('complaint', 'refund', 'manager') and repeated requests. Crescelo's Growth plan includes visitor sentiment and escalation detection; combine it with clear rules and regular review. See [conversation sentiment analysis for service chat](/blog/conversation-sentiment-analysis-service-chat)."),

      h2("Protect your team and the visitor"),
      ul("Abusive language toward staff is not acceptable; the assistant can set a calm boundary and offer to continue when things are respectful.", "Threats of harm should be escalated according to your policy.", "Visitors in distress deserve care and, where appropriate, appropriate support information.", "Do not collect sensitive information in an angry chat; move to a secure route."),

      h2("Learn from complaints"),
      ol("Tag every complaint conversation with its cause: wrong information, delay, billing, quality, missing content.", "Review them weekly; see [how to review your chatbot's conversations](/blog/audit-website-chatbot-conversations).", "Fix the source: update documents, correct wrong answers, adjust handover rules.", "Follow up with the customer where appropriate.", "Track whether complaints on the same topic fall."),
      p("Complaints are free consulting about where your service and content fail."),

      h2("Test with hostile messages"),
      table(["Test", "Pass"], ["'This is useless, I want a person'", "Immediate empathetic handover"], ["Repeated questions and rising anger", "Stops looping; offers a person"], ["Swearing", "Calm boundary; still helps or hands over"], ["'Refund me now'", "Explains it cannot approve; passes to a person"], ["Sarcasm: 'Wow, so helpful'", "Acknowledges; offers a person"], ["A threat to leave a bad review", "Calm, helpful, no defensiveness"]),
      p("Run them before launch and after changes."),

      h2("A sample conversation"),
      table(["Speaker", "Message"], ["Visitor", "I have been waiting 40 minutes for a callback and nobody has phoned. This is a joke."], ["Assistant", "I am sorry, 40 minutes is a long wait and that is not the service we want to give. I am asking a team member to look at your request now and call you as soon as possible. Could you confirm the best number to reach you?"], ["Visitor", "555-0122"], ["Assistant", "Thank you. I have marked this as urgent and passed it to the team with our conversation. If you do not hear from them in 15 minutes, please reply here and I will escalate again."]),

      h2("Worked example: a delayed booking confirmation"),
      p("A visitor writes at 5 p.m. that they booked an appointment yesterday and have received no confirmation, and their event is tomorrow. They are angry. The assistant apologises once, states that it understands the worry given the timing, checks the booking and, finding it cannot see an email status, offers to have a team member confirm the booking immediately. It captures the phone number, flags the conversation as urgent and tells the visitor that if nothing has arrived within thirty minutes they can reply and it will escalate again. A team member calls within ten minutes and confirms the booking. The visitor later thanks the business in a review. The assistant did not solve the problem itself; it recognised the emotion, avoided defensiveness and got the right person moving quickly."),

      h2("Common mistakes"),
      ul("Cheerful replies to angry messages.", "Repeating the same options in a loop.", "Arguing about policy while the customer is upset.", "Offering refunds the assistant cannot approve.", "Slow handover after clear signs of anger.", "Never reviewing complaints for patterns."),

      h2("Keep a library of good responses"),
      p("Collect the best replies to angry messages, from your team and from reviewed transcripts, and use them as examples in the assistant's instructions. Real, well-judged wording teaches tone far better than abstract rules, and it keeps the assistant sounding like your business instead of a script."),

      h2("Frequently asked questions"),
      faq(
        ["How should a chatbot respond to an angry customer?", "Acknowledge the feeling, show it understands the problem, offer a clear next step, usually a person, and stay calm and brief."],
        ["Should the assistant handle refund requests?", "No. It can collect details and explain policy in neutral terms, but a person decides."],
        ["Can it detect frustration automatically?", "Some products can. Combine sentiment detection with simple rules such as keywords and repeated requests."],
        ["What should it never say to an upset customer?", "Anything defensive, blaming, dismissive or cheerful in a way that ignores the complaint."],
        ["How fast should a handover happen?", "Immediately when asked, and after one clear sign of anger or two failed attempts."],
        ["How do I learn from complaints?", "Tag, review weekly and fix the source content and rules."],
      ),
      p("Test hostile messages on your own content in the [playground](/playground), read [Crescelo's human handover](/product/human-handover) and [start a free trial](/login?mode=register)."),
    ],
  }),

  pillar({
    slug: 'multi-staff-scheduling-ai-chatbot',
    title: 'Scheduling With Several Staff Members: Options for Chatbot Booking',
    description: 'How businesses with several practitioners can offer online booking through chat: shared pools, per-person links, preferences, round-robin, capacity and limits of simple booking tools.',
    primaryKeyword: 'multi staff scheduling chatbot',
    secondaryKeywords: ['booking with multiple staff', 'stylist preference booking', 'team scheduling online', 'round robin appointment booking'],
    body: [
      p("Booking gets harder the moment a second person joins your team. Customers may want a specific stylist, therapist or adviser, or they may not mind who they see. Each person has a different calendar, skills, working days and speed. A business with five practitioners is not five times as complex as a business with one; it is a different problem: who is free, who can do this service, who does the customer prefer, and how do you avoid double booking anyone. Chatbot booking can handle some of this and not all of it, depending on the booking tool behind it. This guide explains the models for multi-staff scheduling, what each needs, which fit which kinds of business, how Crescelo's booking fits today and how to choose an approach that will not create chaos."),
      note("Crescelo's built-in booking picker offers slots from your opening hours and one slot length, hides taken slots and locks a slot while it is being booked. It does not assign bookings to individual staff or manage separate staff calendars. This article explains how to handle multi-staff businesses using per-person links and other approaches."),

      h2("The scheduling models"),
      table(["Model", "How it works", "Good for", "Watch for"], ["Single pool of slots", "One shared set of times; whoever is free serves the booking", "Small teams where anyone can do the job", "Customers cannot choose a person; capacity must be managed by you"], ["Booking link per person", "Each practitioner has their own booking page or link", "Customers who choose a specific person", "The chat must send visitors to the right link"], ["Round robin", "The system assigns the next available person", "Teams serving similar customers", "Requires a tool that supports it"], ["Skills-based routing", "The system matches service to qualified staff", "Businesses with specialities", "Needs service and staff data in the tool"], ["Resource-based", "Rooms, chairs or equipment are the limiting factor", "Salons with chairs, clinics with rooms", "Needs a tool that models resources"]),
      p("Choose the simplest model that matches how your customers actually book."),

      h2("What customers want"),
      ul("**A specific person:** regulars often want the same stylist or practitioner.", "**The earliest time:** new customers usually want the first free slot, whoever it is.", "**A skill:** 'someone who does curly cuts' or 'a specialist in sports injuries'.", "**Continuity:** returning to the same person for follow-up."),
      p("Ask in the chat: 'Do you have a preference for who you see, or shall I find the earliest time?' The answer decides which route to use."),

      h2("How to handle it with a simple booking tool"),
      p("With a single-pool tool like Crescelo's built-in picker, you can still serve a team by combining approaches:"),
      ol("**Use the single pool for customers who do not mind.** Set booking hours to times when at least one person is available, and assign the booking to whoever is free when it is made, using your dashboard and calendar feed.", "**Use per-person links for customers who care.** Give each practitioner a Calendly or Cal.com link, and have the assistant offer the right link when a customer names a person.", "**Describe your team in the knowledge base.** Who does what, when they work, and what each specialises in, so the assistant can recommend and route.", "**Keep the rules in one place.** A shared document with names, days and services prevents confusion."),
      p("This is manageable for small teams. For larger teams with complex rules, a dedicated scheduling system is the right home for the calendar, and the assistant's role is to answer questions and hand over to it. See [AI website assistant vs Calendly and Acuity](/blog/ai-website-assistant-vs-calendly-acuity) and [configuring availability rules](/blog/configure-calendar-sync-availability-rules)."),

      h2("Stylist and practitioner preferences"),
      p("In salons and clinics, preference is personal. The assistant can capture it and route accordingly. 'I would like to see Priya' leads to Priya's link. 'Anyone is fine' leads to the shared pool. 'Someone who does balayage' leads to the specialists' links. Store specialities in the knowledge base in plain words, and update them when staff change. See [stylist preferences and chair allocation](/blog/stylist-preferences-chair-allocation-chat)."),

      h2("Avoiding double booking a person"),
      ul("Each person's availability must live in one system, not two.", "If personal calendars are separate from the booking system, decide which is the source of truth.", "A read-only feed shows bookings in a personal calendar but does not make personal events block slots; adjust booking hours to reflect real availability. See [AI bookings in Google and Outlook Calendar](/blog/sync-ai-booking-google-outlook-calendar).", "Two-way sync tools reduce clashes; check what your tool offers."),
      p("Double bookings are avoided by locking a slot at the moment of booking. See [how online booking avoids double bookings](/blog/double-booking-prevention-concurrency-mutex)."),

      h2("Capacity and fairness"),
      ul("Decide how bookings are distributed: by preference, by rotation or by availability.", "Protect breaks and admin time in booking hours.", "Balance workloads so no one is overloaded.", "Handle absence: when someone is off, their link should close or redirect."),
      p("Fairness matters to staff, especially where income depends on bookings. Agree rules in advance and apply them openly."),

      h2("What the assistant should say"),
      table(["Customer message", "Response"], ["I want to book with Priya.", "Sure. Priya has Tuesday at 10:00 and Thursday at 2:30. Which would you like?"], ["Anyone is fine, earliest please.", "The earliest available is tomorrow at 9:30. Shall I book it?"], ["Who does colour?", "Priya and Sam do colour. Priya works Tuesday to Friday and Sam on Saturdays. Would you like to see times with either?"], ["Priya is not available.", "I can offer Sam, who does the same service, or show Priya's next opening on Tuesday week."]),

      h2("A rollout plan"),
      ol("Write who does what and when, in a short document.", "Choose your model: shared pool, links per person or a dedicated tool.", "Set up each person's link or booking hours.", "Load the team information into the assistant.", "Test: a preference request, an 'anyone' request, a skill request and an unavailable person.", "Watch the first weeks and adjust."),

      h2("Worked example: a five-person salon"),
      p("A salon has five stylists. Regulars nearly always ask for their own stylist; new customers usually want the first available time. The owner gives each stylist a Calendly link, sets the shop's shared booking hours for anyone-will-do bookings and loads a short team document into the assistant: who does colour, who does barbering, who works which days. When a visitor asks for a person, the assistant sends that stylist's link. When the visitor says 'anyone', it offers the earliest shared slot, and the front desk assigns the booking each morning. Bookings for a named stylist go straight into that stylist's diary, and shared bookings are handed out by the front desk based on workload. The setup took an afternoon and reduced phone calls about who is free. It is not fully automatic, but it is reliable and simple to maintain."),

      h2("Common mistakes"),
      ul("Two systems holding the same person's calendar.", "Offering a person's link when they are on leave.", "Letting the assistant promise a specific person when only a pool exists.", "Forgetting to update the team document when staff change.", "Overloading the same stylist because of a popular link."),

      h2("Frequently asked questions"),
      faq(
        ["Can a chatbot book with a specific staff member?", "It can send visitors to the right person's booking link, or book from a shared pool. Crescelo's built-in picker does not assign staff, so use per-person Calendly or Cal.com links for preferences."],
        ["How do I handle a customer with a preferred stylist?", "Capture the preference and give the stylist's link, and store each person's schedule and specialities in the knowledge base."],
        ["Can it do round-robin?", "Only if the booking tool supports it. Crescelo's built-in picker uses a single pool."],
        ["How do I stop double booking staff?", "Keep availability in one system and use a booking tool that locks slots."],
        ["What if someone is off sick?", "Close or redirect their link and update booking hours."],
        ["When should I use a dedicated scheduling system?", "When you have many staff with complex rules, resources or capacity. The assistant can still answer questions and hand over."],
      ),
      p("See the [appointment booking feature](/product/appointment-booking), read [AI appointment booking](/blog/ai-appointment-booking) and try a booking conversation in the [playground](/playground)."),
    ],
  }),

  pillar({
    slug: 'deposit-collection-booking-policies-chat',
    title: 'Deposits and Booking Policies in Chat: Wording, Fairness and How to Collect',
    description: 'How to explain deposits, cancellation and late policies in chat: when deposits help, fair wording, refunds, payment options, legal cautions and how to keep the assistant consistent.',
    primaryKeyword: 'booking deposit policy',
    secondaryKeywords: ['appointment deposit wording', 'cancellation fee policy', 'deposit refund policy service business', 'no show fee wording'],
    body: [
      p("A deposit changes the meaning of a booking. Without one, a booking is a casual intention that costs the customer nothing to abandon. With one, it is a commitment with something at stake, and both sides take it seriously. Deposits, cancellation fees and late policies are among the most effective ways to reduce no-shows, and among the most sensitive: badly explained, they upset customers and cause disputes; well explained, they are accepted as fair. A chat is a good place to explain policies because visitors can ask questions and get the same, accurate answer every time. This guide explains when deposits help, how to write policies fairly, how to word them for chat, how to handle refunds, how the assistant should and should not talk about them, and how payment fits with a booking tool that may not take payments itself."),
      note("Rules on deposits, cancellation fees and consumer rights vary by country, state and profession. This is general information, not legal advice. Check the rules that apply to you, and make sure your terms are clear and agreed before the booking."),

      h2("When deposits help"),
      table(["Situation", "Why a deposit helps"], ["Long or expensive services", "A missed slot costs real money"], ["High no-show history", "Commitment reduces casual booking"], ["Peak times and popular slots", "Protects scarce capacity"], ["Custom or prepared work", "Time and materials are committed in advance"], ["New customers", "You have no relationship yet"]),
      p("They help less, and can deter customers, for cheap, quick services and for regulars with a good record. Many businesses apply deposits selectively."),

      h2("The building blocks of a policy"),
      table(["Element", "Question to answer"], ["Deposit amount", "How much, and is it a percentage or a fixed sum?"], ["What it covers", "Is it deducted from the final price or separate?"], ["When it is taken", "At booking or later?"], ["Cancellation window", "Until when can the customer cancel free of charge?"], ["What happens after the window", "Is the deposit kept? Partly?"], ["Lateness", "How late is too late, and what then?"], ["Emergencies", "How do you treat genuine exceptions?"], ["Rescheduling", "Is one free change allowed?"]),
      p("Answer every one in a sentence, and write them down. Vague policies cause the arguments they are meant to prevent."),

      h2("Wording that customers accept"),
      table(["Harsh", "Fair"], ["No refunds.", "You can change or cancel free of charge up to 24 hours before. After that we may keep your deposit, because the time is reserved for you."], ["Deposits are non-negotiable.", "We ask for a small deposit to secure your time. It comes off your final bill."], ["You will be charged if you do not show.", "If you cannot make it, please let us know. If we hear from you inside 24 hours, we may keep your deposit, but tell us if something unexpected happened and we will do our best to help."], ["Late clients will be turned away.", "If you are more than 15 minutes late we may need to shorten your service or rebook, so please message us if you are running behind."]),
      ul("Use plain words and a warm tone.", "Explain the reason: the time is reserved for you.", "Offer a route for genuine emergencies.", "Show it before payment and again in the confirmation."),

      h2("How the assistant should talk about policies"),
      ul("State the policy exactly as written; never improvise a fee or exception.", "If asked for an exception, say that a team member will consider it, and hand over.", "Explain the reason gently.", "Do not threaten or pressure.", "If a visitor disputes a charge, hand over to a person."),
      p("Load the policy into the knowledge base as a short, clearly titled document, and test the assistant with questions such as 'What if I cancel tomorrow?' and 'Can I get my deposit back?'"),

      h2("Collecting the deposit"),
      p("Crescelo's booking does not take payments or deposits itself. It offers slots, confirms bookings by email with a private link to change or cancel, and sends reminders. If you use deposits, take them through your own payment process, such as a payment link from your payment provider, an invoice or your point-of-sale system, and reference the policy in the confirmation. Some businesses collect the deposit when the customer arrives at a consultation instead of at the booking. Whichever you choose, make it clear before the booking is confirmed."),
      table(["Method", "Pros", "Cons"], ["Payment link sent after booking", "Simple; works with any provider", "Manual step; customer may not pay"], ["Payment collected on a booking page", "Automatic", "Requires a booking tool with payments"], ["Invoice", "Familiar for professional services", "Slower"], ["Card held on file", "No upfront cost to the customer", "Needs a provider that supports it and clear consent"]),
      p("See [AI appointment booking](/blog/ai-appointment-booking) and [the psychology of deposits and show-up rates](/blog/deposit-collection-psychology-show-up-rates)."),

      h2("Refunds and exceptions"),
      ol("Decide in advance what qualifies as an exception: illness, emergency, bereavement.", "Ask for a short explanation, not proof, unless the amount is large.", "Apply rules consistently but with kindness.", "Record the reason and the decision.", "Refund promptly when you agree to; late refunds create disputes."),
      p("A rigid policy applied without judgement loses good customers. The most successful businesses combine clear rules with visible flexibility."),

      h2("Legal and fairness cautions"),
      ul("Terms must be clear and agreed before the customer is bound.", "Consumer protection rules may limit fees or require refunds in some circumstances.", "Deposits in regulated professions may be restricted.", "Do not use hidden or surprise fees.", "Keep your website, chat and confirmation consistent."),
      p("If in doubt, take advice. See [effective cancellation policies for service businesses](/blog/effective-cancellation-policies-service-businesses)."),

      h2("A sample conversation"),
      table(["Speaker", "Message"], ["Visitor", "Do I need to pay anything to book the colour appointment, and what if I cannot make it?"], ["Assistant", "Colour appointments take a $30 deposit, which comes off your final bill. You can change or cancel free of charge up to 24 hours before. After that we may keep the deposit, because the time is reserved for you, though if something unexpected happens please tell us and we will do our best to help. Would you like to see available times?"]),

      h2("Measure it"),
      table(["Metric", "Why"], ["No-show rate before and after", "Effectiveness"], ["Bookings lost after mentioning the deposit", "Whether it deters"], ["Disputes and complaints about fees", "Clarity"], ["Late cancellations and how many were excused", "Fairness"]),

      h2("Worked example: a colour salon introduces deposits"),
      p("A salon loses about eight colour appointments a month to no-shows, roughly $1,000 in lost revenue. It introduces a $30 deposit for colour services only, deducted from the final bill, with free changes up to 24 hours before. It writes the policy in the confirmation, adds it to the assistant's documents and sends payment links after booking. In the first two months, no-shows drop to two a month, and a handful of customers decline to book because of the deposit. The owner judges the trade worth it, waives the deposit for long-standing regulars and keeps a note of every exception. The lesson is that a deposit works best with clear wording, a visible route for genuine emergencies and a willingness to use discretion."),
      table(["Item", "Before (illustrative)", "After"], ["No-shows for colour per month", "8", "2"], ["Estimated lost revenue", "$1,000", "$250"], ["Bookings declined because of the deposit", "0", "A few"], ["Complaints about the policy", "0", "One, resolved kindly"]),

      h2("Frequently asked questions"),
      faq(
        ["Should I charge a deposit?", "For long or expensive services, peak times and no-show-prone situations, often yes. For cheap, quick services, it may deter more than it helps."],
        ["How do I word a cancellation policy?", "Plainly and warmly: explain the window, what happens after it and that genuine emergencies are considered."],
        ["Does Crescelo take deposits?", "No. Its booking sends confirmations and reminders; take deposits through your own payment process."],
        ["Can the assistant grant exceptions?", "No. It states the policy and passes exception requests to a person."],
        ["Are deposits legal?", "Usually, if terms are clear and agreed in advance, but rules vary. Check the law where you operate."],
        ["How do I handle refunds?", "Decide what qualifies, apply rules consistently with kindness and refund promptly when agreed."],
      ),
      p("Test your own policy wording in the [playground](/playground), read [how to reduce no-shows](/blog/eliminate-service-no-shows-playbook) and see the [appointment booking feature](/product/appointment-booking)."),
    ],
  }),
];
