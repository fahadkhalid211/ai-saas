import { faq, h2, h3, note, ol, p, pillar, table, ul } from '../authoring';

export const PILLAR12 = [
  pillar({
    slug: 'after-hours-appointment-booking',
    title: 'After-Hours Appointment Booking: How to Capture Customers Who Search When You Are Closed',
    description: 'Why many enquiries arrive out of hours and how to book them: self-service booking, an AI assistant, honest hours messaging, urgent cases and follow-up routines for the morning.',
    primaryKeyword: 'after hours appointment booking',
    secondaryKeywords: ['book appointments outside business hours', 'after hours chatbot', 'out of hours enquiries', 'capture evening website leads'],
    body: [
      p("Ask a service business when its website gets the most visits and you will often hear the same answer: evenings and weekends. That is when people have time to research, compare and decide. It is also when your phone goes to voicemail and your contact form waits until Monday. Every out-of-hours enquiry that meets a closed door is a chance that a competitor with an open one will win. This guide explains why after-hours booking matters, what a good out-of-hours experience looks like, how to set it up with self-service booking and an AI assistant, how to handle urgent cases responsibly, and how to make the morning after run smoothly."),

      h2("Why after-hours enquiries are valuable"),
      ul("**People research when they are free:** evenings, weekends and lunch breaks.", "**Intent is high:** someone searching at 9 p.m. for a dentist or a plumber usually has a real need.", "**Speed decides:** the first business to give a useful answer often wins.", "**Silence signals unreliability:** an unanswered enquiry suggests you may be unresponsive later too."),
      p("You can measure your own case. Look at your website analytics for visits by hour, and at your enquiries by time received. Many owners are surprised by how large the out-of-hours share is."),

      h2("What a bad after-hours experience looks like"),
      table(["Situation", "What the visitor experiences", "What happens next"], ["Contact form only", "'We will reply within 1 to 2 business days'", "Many leave and book elsewhere"], ["Voicemail", "A message to leave and wait", "Fewer people leave one"], ["Live chat offline", "'Leave a message'", "Same as a form"], ["Booking page with no answers", "Times shown, but questions unanswered", "Some book; others abandon"], ["Outdated hours", "Told you are open when you are not", "Frustration and lost trust"]),

      h2("What a good after-hours experience looks like"),
      ol("The visitor is greeted honestly: 'The team is offline until 9 a.m., but I can help now.'", "Their question is answered from your own information: price, service, area, policy.", "They see real available times, including the next morning, and can book in a minute.", "They receive a confirmation with the details and a link to change it.", "If they need a person, they are told when someone will reply and their details are captured.", "Your team sees everything in the morning, with priority marked."),
      p("The goal is that the visitor feels looked after, even though nobody is in the building."),

      h2("Three tools that make it work"),
      h3("1. Self-service booking"),
      p("A booking page or in-chat booking that shows real availability lets visitors act at any hour. Keep the steps short and the confirmation clear. See [AI appointment booking](/blog/ai-appointment-booking) and [conversational scheduling versus forms](/blog/conversational-ai-scheduling-vs-forms)."),
      h3("2. An assistant that answers questions"),
      p("Booking alone does not answer 'do you treat this?' or 'how much?'. An AI assistant that reads your documents can. It should say clearly that it is an AI, answer from your content, admit when it does not know and offer a route to a person. See [what an AI website assistant is](/blog/ai-website-assistant)."),
      h3("3. Lead capture and alerts"),
      p("For visitors who are not ready to book, capture a contact detail and deliver it with the conversation to your team. Decide which leads should trigger an immediate alert to an on-call person and which can wait until morning. See [conversational lead capture](/blog/conversational-lead-capture)."),

      h2("Set honest hours and expectations"),
      ul("Tell the assistant your real opening hours, including holidays, so it never promises what you cannot deliver.", "State when a person will respond: 'We reply by 9:30 a.m. on working days.'", "Never claim 24-hour service if you do not offer it.", "Offer the nearest bookable time, not an exact time you cannot honour."),
      p("Crescelo's built-in booking offers slots from your opening hours and one slot length, hides times already taken and locks a slot while it is being booked, so a visitor at 10 p.m. can secure the first free time tomorrow. See the [appointment booking feature](/product/appointment-booking)."),

      h2("Handling urgent situations responsibly"),
      p("Out-of-hours visitors sometimes have urgent problems: a burst pipe, severe pain, a lockout. An assistant must not pretend to be an emergency service. Decide in advance what it says."),
      ol("Recognise urgent wording, such as flooding, gas smell, severe pain, bleeding or trouble breathing.", "Give approved safety instructions and, for life-threatening matters, tell the visitor to contact emergency services.", "Provide your emergency number or on-call route if you have one, with honest hours.", "Alert your on-call person immediately, with the conversation.", "Do not promise arrival times you cannot guarantee."),
      p("See [handling emergencies in automated chat](/blog/handling-emergencies-automated-chat) and [emergency dispatch workflows](/blog/emergency-dispatch-workflows-ai-chat)."),

      h2("Make the morning easy"),
      p("The value of after-hours capture is realised in the morning. Give your team a routine."),
      table(["Time", "Action"], ["Start of day", "Read overnight conversations; check bookings and leads"], ["First hour", "Call or message leads that asked for a person, hottest first"], ["Same day", "Reply to warm leads; confirm any bookings needing a check"], ["Weekly", "Review what visitors asked out of hours and update your content"]),
      p("Send a short morning digest by email if your setup supports it. See [speed to lead](/blog/speed-to-lead-service-businesses) for why the first hour of the day still matters."),

      h2("Measure the effect"),
      table(["Metric", "How to use it"], ["Share of visits and enquiries out of hours", "Size of the opportunity"], ["Bookings made out of hours", "Direct gain"], ["Leads captured out of hours and follow-up time", "Process quality"], ["Cost per booked appointment before and after", "See [cost per booked appointment](/blog/cost-per-booked-appointment-calculation)"], ["No-show rate for out-of-hours bookings", "Whether confirmations and reminders work"]),

      h2("Common mistakes"),
      ul("Showing 'we are online' when nobody is.", "Offering times you cannot serve.", "Not telling visitors when to expect a reply.", "Letting leads sit until midday.", "Skipping confirmations for late-night bookings.", "Ignoring urgent messages."),

      h2("Worked example: a dental practice"),
      p("A practice with one receptionist closes at 5:30 p.m. Its analytics show that a third of website visits happen after that time and most new-patient enquiries arrive between 7 and 10 p.m. Previously they went to a contact form answered next morning. The owner adds the assistant with the price list, new-patient guide and insurance FAQ, turns on booking, and writes an emergency rule that gives the emergency line and alerts the on-call dentist. In the first month, thirty-one after-hours visitors chat, fourteen book the next available slot and seven leave details for a call. The receptionist starts each day with a list instead of a pile of voicemails. Emergencies are routed properly, and none is left to wait for morning."),
      table(["Outcome", "Number in the month (illustrative)"], ["After-hours chats", "31"], ["Bookings made in chat", "14"], ["Leads left for follow-up", "7"], ["Emergency alerts", "2, both handled by the on-call dentist"]),

      h2("Sample after-hours messages"),
      table(["Situation", "Message"], ["Greeting outside hours", "Hi, the team is offline until 9 a.m., but I can answer questions and book you in now."], ["Booking confirmation", "You are booked for Thursday at 10:30. We will send an email with the address and a link to change it."], ["Lead capture", "I cannot answer that one, so I would like a team member to help. What is the best number or email, and when should we contact you?"], ["Urgent case", "That sounds urgent. If it is an emergency, please call emergency services now. I have alerted our on-call team, and here is our emergency number."]),

      h2("Communicating your out-of-hours service"),
      p("If you now take bookings and answer questions at night, tell people. Add a line to your Google Business Profile description, your website header and your email signature: 'Book or ask a question any time.' Mention it in your voicemail greeting too, with the link. Customers cannot use a service they do not know about, and letting your existing customers know often produces the first after-hours bookings within days."),

      h2("What to review after the first month"),
      ul("How many after-hours conversations became bookings or leads, and how many ended without either.", "Which questions were asked most out of hours, and whether your website answers them.", "Whether any urgent message was missed or handled awkwardly.", "How quickly the morning follow-ups happened.", "Whether the no-show rate for late bookings differs from daytime ones."),
      p("Use the answers to adjust hours, wording and the morning routine. Small changes here compound quickly, because out-of-hours traffic is often the least served part of a business."),

      h2("Frequently asked questions"),
      faq(
        ["How can I take bookings outside business hours?", "Use self-service online booking, ideally with a chat assistant that answers questions and shows real available times, and send instant confirmations."],
        ["Does an AI assistant work at night?", "Yes. It answers and books at any hour, and captures leads for your team to follow up in the morning."],
        ["What about emergencies out of hours?", "Set clear rules: recognise urgent wording, give approved safety instructions, provide your emergency route and alert your on-call person."],
        ["How do I stop customers expecting an instant reply from a person?", "State honestly when a person will respond, for example by 9:30 a.m. on working days."],
        ["Will after-hours bookings no-show more?", "Not necessarily. Clear confirmations and reminders help. Track the rate and adjust."],
        ["How do I know it is worth it?", "Compare out-of-hours bookings and leads with the cost of the tools over a month or two."],
      ),
      p("Try an after-hours conversation on your own documents in the [playground](/playground), and [start a free trial](/login?mode=register) to put it on your site."),
    ],
  }),

  pillar({
    slug: 'ai-transparency-disclosure-building-trust',
    title: 'AI Disclosure for Website Chatbots: How to Tell Visitors and Build Trust',
    description: 'How and why to tell visitors they are talking to an AI: legal trends, wording examples, placement, handover, honesty about limits and how disclosure affects conversion.',
    primaryKeyword: 'AI chatbot disclosure',
    secondaryKeywords: ['tell customers they are talking to AI', 'chatbot transparency', 'AI disclosure wording', 'bot disclosure law'],
    body: [
      p("When a visitor types into your website chat, they deserve to know whether a person or an AI is replying. Being clear about it is fair, builds trust and, in a growing number of places, is required by law. Many owners worry that saying 'I am an AI' will scare people away. In practice, honest disclosure combined with a helpful, fast assistant and an easy way to reach a person tends to be well accepted. This guide explains why disclosure matters, what the rules trend towards, how to word it, where to put it, what else to be honest about and how to test the effect on your own visitors."),
      note("Laws on AI disclosure are developing quickly and differ by country, state and sector. This is general information, not legal advice. Check the rules that apply to you and take advice where unsure."),

      h2("Why disclose"),
      ul("**Fairness:** people are entitled to know who or what they are dealing with.", "**Trust:** discovering later that 'Sarah' was software damages your credibility.", "**Legal direction:** several jurisdictions and sector rules require or encourage disclosing automated interactions, and more are coming.", "**Better conversations:** people who know it is an AI phrase questions simply and forgive limits.", "**Lower risk:** a clear statement sets expectations, so a mistake is less likely to become a complaint."),

      h2("What to disclose"),
      table(["Topic", "What to say"], ["It is an AI", "'I am an AI assistant.'"], ["What it can do", "Answer questions about your services, prices and hours, and book appointments."], ["What it cannot do", "Give advice you are not qualified to give; promise outcomes; handle emergencies."], ["That a person is available", "How to reach one, and when."], ["What data is used", "That conversations are stored to answer and improve the service, with a link to your privacy policy."]),
      p("Keep the language plain and short. Long legal notices in the chat window are ignored; a short line and a link are read."),

      h2("Wording examples"),
      table(["Where", "Example"], ["Greeting", "Hi, I am the Brook Salon AI assistant. I can answer questions and book you in. A team member is available in office hours."], ["Below the input", "AI assistant. Conversations are stored to help us answer you. Privacy policy."], ["When handing over", "I am passing you to a team member now. They can see our conversation, so you will not need to repeat yourself."], ["When it does not know", "I do not have that information, and I would rather not guess. I can take your details so the team can reply, or you can call us on the number below."], ["For sensitive topics", "I cannot give medical advice. For anything urgent, please call emergency services or our emergency line."]),
      p("Choose the tone of your brand. A playful business can be light; a clinic should be calm and clear."),

      h2("Where to place the disclosure"),
      ul("**In the greeting message,** so it is seen at the start.", "**Near the input box,** as a small persistent line.", "**In the chat header,** for example 'AI assistant'.", "**In your privacy policy and cookie information,** for the details.", "**In confirmation emails** if the AI took the booking, a line such as 'Booked by our AI assistant. Reply to this email to reach the team.'"),
      p("Do not hide it in the small print of a page the visitor never opens."),

      h2("Do not pretend to be human"),
      ul("Avoid human names, photos and typing delays that imply a person.", "Do not claim 'I' have experience or feelings in ways that mislead.", "If the visitor asks 'Are you a bot?', answer truthfully.", "Make sure the assistant's instructions say so."),
      p("Giving the assistant a friendly name is fine, as long as it says it is an AI. A name alone is not deception, but denying it is."),

      h2("Be honest about limits and mistakes"),
      p("Honesty goes beyond the label. A trustworthy assistant states when it does not know, avoids guessing, and does not invent prices or policies. It should also be clear when information may be out of date, for example 'Prices are correct as of this month; the team will confirm at booking.' Pair disclosure with the safeguards in [how to stop a chatbot from making things up](/blog/grounded-ai-chatbot-hallucinations), because a disclosed AI that invents answers is still a problem."),

      h2("Handover and human access"),
      p("Disclosure is more credible when a person is really available. Make it easy to ask for one, tell the visitor what will happen and when, and make sure your team is notified with the conversation. A promise of a human that leads nowhere is worse than none. See [live human handover flow design](/blog/live-human-handover-flow-design) and the [human handover feature](/product/human-handover)."),

      h2("Privacy notice and consent"),
      ul("Explain in your privacy policy what the chat collects, why, how long you keep it and who processes it.", "Mention the AI provider and hosting as processors where relevant.", "Do not collect more than you need.", "Give a way to ask for deletion.", "For marketing use of chat data, get separate consent."),
      p("See the [GDPR checklist for website chatbots](/blog/website-chatbot-gdpr-checklist) for a fuller list."),

      h2("Does disclosure hurt conversion?"),
      p("It is a fair question and the answer depends on your audience and how good the assistant is. Many businesses find that clear disclosure has little effect when the assistant is fast and helpful, and that trust rises when the experience is honest. Some visitors prefer a person, so give them an easy route. You can test it: run your greeting with and without an explicit line for a few weeks, and compare the rate of conversations and bookings. Do not test in a way that misleads visitors; test different honest wordings."),
      table(["Test", "What to compare"], ["Short label versus fuller greeting statement", "Chat start rate, booking rate"], ["'AI assistant' header versus none", "Trust signals such as handover requests"], ["Prominent human option versus subtle", "Handover requests and satisfaction"]),

      h2("Checklist"),
      ul("Greeting says it is an AI assistant.", "A persistent label near the input.", "A link to the privacy policy.", "Clear limits: no advice, no emergencies.", "A visible route to a person.", "Honest 'I do not know' behaviour.", "No human name, photo or pretence.", "Confirmation emails mention AI booking where relevant.", "Reviewed when laws or your use change."),

      h2("Worked example: a disclosure that read well"),
      p("A physiotherapy clinic replaced a stiff legal-sounding notice with a two-line greeting: 'Hi, I am the clinic's AI assistant. I can answer questions about appointments, fees and what to expect, and a person is available in office hours. Please do not share medical details here.' Below the input box it added 'AI assistant. Conversations are stored to help us answer you. Privacy policy.' Visitors used the chat as before, some asked for a person and the team appreciated that people no longer shared medical histories in the chat. The clinic reviewed the wording after three months and added a line about opening hours when handovers were answered."),

      h2("How to review your disclosure"),
      ul("Read it aloud: does it sound like your business?", "Ask a friend who does not work for you what they understood.", "Check that it appears on mobile without scrolling.", "Check it still matches your privacy policy.", "Review it whenever your assistant's abilities change, for example when you add booking or a new channel."),

      h2("Keep your records"),
      p("Keep a dated copy of the disclosure wording you used, when you changed it and why. If a customer or regulator ever asks how you told visitors they were talking to an AI, you can show them. It also helps you see whether changes in wording changed behaviour, and makes it easier to keep your privacy policy, greeting and confirmation emails consistent with each other."),

      h2("A short policy for your team"),
      p("Write down three rules for everyone who touches the chat. First, the assistant always says it is an AI and never denies it. Second, a person is always reachable, and requests for one are honoured. Third, nobody edits the greeting or disclosure without checking it against the privacy policy. Share it with new staff and review it whenever your chat changes."),

      h2("Frequently asked questions"),
      faq(
        ["Do I have to tell visitors they are talking to an AI?", "Increasingly yes in many places, and it is good practice everywhere. Check the rules that apply to you."],
        ["Where should the disclosure appear?", "In the greeting, near the input box and in your privacy policy."],
        ["Will disclosure reduce bookings?", "It often has little effect when the assistant is helpful, and it builds trust. You can test wording on your own visitors."],
        ["Can I give the chatbot a name?", "Yes, as long as it says it is an AI and does not deny it when asked."],
        ["What if the chatbot makes a mistake?", "A clear disclosure and an easy handover reduce harm. Also ground the assistant in your documents and review conversations."],
        ["Does the AI provider need to be mentioned?", "Mention your processors in your privacy policy. The chat itself can stay short."],
      ),
      p("See how the [AI assistant](/product/ai-assistant) is designed to answer only from your content, try it in the [playground](/playground) and [start a free trial](/login?mode=register)."),
    ],
  }),

  pillar({
    slug: 'live-human-handover-flow-design',
    title: 'Chatbot to Human Handover: How to Design a Smooth Live Handoff',
    description: 'How to design the handover from an AI chatbot to a person: triggers, notifications, context, expectations, out-of-hours handling and measuring handover quality.',
    primaryKeyword: 'chatbot human handover',
    secondaryKeywords: ['live chat handoff', 'bot to agent transfer', 'escalate chatbot to human', 'human takeover chatbot'],
    body: [
      p("However good an AI assistant is, some conversations need a person: a complaint, a sensitive situation, an unusual request, an urgent problem or a customer who simply prefers to talk to a human. What happens at that moment decides how the customer remembers you. A smooth handover feels like a helpful colleague stepping in with full context. A poor one feels like being dropped: waiting with no explanation, repeating everything, or discovering that nobody is there. This guide explains how to design the handover: when it should trigger, how to notify your team, what context to pass, how to set expectations honestly, what to do out of hours and how to measure how well it works."),

      h2("When the assistant should hand over"),
      table(["Trigger", "Example", "Handover style"], ["The visitor asks for a person", "'Can I talk to someone?'", "Immediate, always honoured"], ["Complaint or anger", "'This is unacceptable'", "Fast, with empathy"], ["Sensitive topic", "Medical, legal or financial situations", "Handover with careful wording"], ["Emergency or safety", "'There is a gas smell'", "Safety instructions first, then urgent alert"], ["Unanswerable question", "The documents do not cover it", "Offer a person or callback"], ["High-value opportunity", "Large job or group booking", "Notify a person to take over"], ["Repeated failure", "Assistant misunderstood twice", "Offer a person"], ["Money or refunds", "A dispute over a charge", "Person decides"]),
      p("Write the triggers down as rules, and test them with realistic messages. Err on the side of handing over sensitive cases."),

      h2("Never make a handover hard"),
      ul("Do not hide the option to reach a person.", "Do not make visitors pass several bot questions before they can ask.", "Do not pretend the assistant is a person.", "Do not promise an immediate answer if nobody is available.", "Do not loop the visitor back to the assistant without acknowledging their request."),
      p("The best assistants say something like: 'Of course. I will pass you to the team. They can see our conversation.'"),

      h2("What the visitor should see and hear"),
      ol("**Acknowledge:** 'I will connect you with a team member.'", "**Explain what happens next:** 'They can see what we discussed, so you will not need to repeat it.'", "**Set an honest expectation:** 'Someone will reply within 15 minutes' or 'We reply by 9:30 a.m. on working days.'", "**Offer an alternative:** 'If it is urgent, call us on this number.'", "**Confirm the channel:** 'We will reply here in the chat, or by email if you leave one.'"),
      p("Silence is the enemy. A visitor who does not know what is happening will leave or try again."),

      h2("What your team should see"),
      table(["Item", "Why it matters"], ["A notification with the reason for handover", "Context in the first second"], ["The full conversation", "So nobody asks the visitor to repeat"], ["Contact details captured", "To follow up if the chat ends"], ["What the assistant already promised", "So the person does not contradict it"], ["The page the visitor was on", "Context on what they were doing"], ["Priority", "Emergencies and complaints first"]),
      p("In Crescelo, a person can take over any conversation from the dashboard in one click and is notified by email, with the whole history attached. See the [human handover feature](/product/human-handover)."),

      h2("How to notify your team"),
      ul("**Email:** reliable, works for everyone, includes the conversation.", "**Team chat such as Slack:** fast for teams who live there; see [webhook automations](/blog/webhook-automations-zapier-make-chat-events).", "**Text or push alerts:** for urgent cases, via an automation.", "**Dashboard notification:** for people already working in it."),
      p("Choose at least two routes for urgent handovers, so a missed email does not cost a customer. Make sure the alert goes to a person who is actually on duty, not to a shared inbox nobody watches."),

      h2("Handover out of hours"),
      p("Nobody is there at 10 p.m., and the assistant should say so honestly. Three good patterns:"),
      ol("Offer a callback or email reply at a set time the next working day, and capture the contact.", "Offer the next available booking so the visitor secures a slot now.", "For emergencies, direct to your emergency line or emergency services with approved wording."),
      p("Then make sure the next morning's team sees these handovers first. See [after-hours appointment booking](/blog/after-hours-appointment-booking)."),

      h2("Taking over and handing back"),
      p("When a person takes over, the assistant should stop replying so visitors do not get two voices. When the person is done, decide whether the assistant resumes or the conversation closes. Give the person a way to end the takeover cleanly. Let them mark the outcome, such as resolved, booked or follow-up needed, so you can review it later."),

      h2("Etiquette for the person who takes over"),
      ul("Greet by name and acknowledge what was said already.", "Read the whole conversation before replying.", "Do not repeat questions the visitor has answered.", "Correct any mistake the assistant made, without blaming it.", "Reply quickly, even if only to say when you will have an answer.", "Close the loop: confirm the outcome."),
      p("See [live human handover etiquette and best practices](/blog/live-human-handover-etiquette-best-practices)."),

      h2("Measure handover quality"),
      table(["Metric", "What it tells you"], ["Handover rate", "Share of conversations passed to a person; a very high rate means the assistant needs better content"], ["Time to first human reply", "Whether the team responds fast enough"], ["Reasons for handover", "Which topics to improve or keep human"], ["Repeat questions after handover", "Whether context passes correctly"], ["Resolution rate after handover", "Whether people actually help"], ["Handovers with no response", "Process failures to fix urgently"]),
      p("Review handover conversations weekly as part of your [chat review routine](/blog/audit-website-chatbot-conversations). Every handover is either a sign that a person was needed or a gap to close."),

      h2("Common mistakes"),
      ul("A handover button that goes nowhere.", "Alerts sent to an unattended inbox.", "Making visitors repeat themselves.", "No expectation set about waiting time.", "The assistant and a person both replying.", "Never reviewing why handovers happen."),

      h2("Worked example: a complaint about a bill"),
      table(["Speaker", "Message"], ["Visitor", "I was charged twice for my appointment. This is ridiculous."], ["Assistant", "I am sorry about that. Billing needs a person to check, so I am passing this to our team now. They can see this conversation, so you will not need to repeat it. Someone will reply within 30 minutes during office hours, and I have noted your contact details. Could you tell me the email you used to book?"], ["Visitor", "sam@example.com"], ["Assistant", "Thank you, Sam. I have passed everything on. If it is urgent, our number is below."]),
      p("The assistant did not try to resolve a billing dispute. It acknowledged the problem, explained the next step, set an expectation, captured the missing detail and flagged the conversation as a complaint. The person who picks it up starts with the whole picture."),

      h2("A handover policy you can adapt"),
      ol("The assistant always hands over when asked.", "It always hands over complaints, refunds and billing disputes.", "It hands over sensitive topics with approved wording and never gives advice.", "For emergencies it gives safety instructions first, then alerts an on-call person.", "Handovers are answered within a stated time in business hours, and by a stated time the next working day otherwise.", "Every handover is logged with a reason and an outcome and reviewed weekly."),
      p("Write it down, share it with your team and revisit it quarterly."),

      h2("Training your team for handovers"),
      p("Handover works best when the people receiving it know what to expect. Spend fifteen minutes walking the team through a real handover: where the alert arrives, how to open the conversation, how to reply and how to close it. Agree who is on duty in each time slot and who covers when they are away. Role-play an awkward case, such as an angry customer, so that the first real one is not the first time anyone has tried it."),

      h2("When to hand back to the assistant"),
      p("Some handovers are brief: a person answers one question and the conversation could continue with the assistant. Decide whether your setup lets the assistant resume, and how the visitor is told. If it does, the person should say so ('I will let the assistant take over booking now'), and the assistant should confirm it has the context. If it does not, the person should finish the conversation, so the visitor never talks to two voices that contradict each other."),

      h2("Frequently asked questions"),
      faq(
        ["When should a chatbot hand over to a human?", "When the visitor asks, for complaints, sensitive topics, emergencies, unanswerable questions, high-value opportunities and repeated failures."],
        ["How does the human see the conversation?", "Good handover passes the full conversation and contact details to the person, so the visitor does not repeat anything."],
        ["What if no one is online?", "Say so honestly, capture contact details, offer a callback or a booking, and direct emergencies to the right route."],
        ["Does Crescelo support human handover?", "Yes. Your team can take over any conversation from the dashboard, with notifications and the whole history."],
        ["How many handovers are normal?", "It varies. Very high rates suggest content gaps, and very low rates may mean people cannot find the option."],
        ["Should the assistant continue after a person joins?", "No. Pause the assistant while a person is talking to avoid two voices."],
      ),
      p("See the [human handover feature](/product/human-handover), try a handover request in the [playground](/playground) and [start a free trial](/login?mode=register)."),
    ],
  }),

  pillar({
    slug: 'website-chatbot-widget-design',
    title: 'Chat Widget Design: How to Make It Help Visitors Instead of Interrupting Them',
    description: 'Design principles for a website chat widget: placement, size, colour, greeting, mobile behaviour, motion, accessibility and speed, with a checklist and testing method.',
    primaryKeyword: 'chat widget design',
    secondaryKeywords: ['chatbot UI best practices', 'website chat widget placement', 'chatbot design for mobile', 'live chat widget customization'],
    body: [
      p("A chat widget lives on top of your website, in a prime position and in front of your visitors' attention. Done well it feels like a helpful assistant waiting quietly in the corner. Done badly it covers the button they wanted, pops up while they are reading and shouts in colours that clash with everything else. Good widget design is mostly restraint: show up when useful, look like part of your brand, stay out of the way on small screens and load without slowing your page. This guide covers placement, size, colour, greeting, mobile behaviour, motion, accessibility and performance, and gives you a checklist to review your own widget."),

      h2("Principles"),
      ul("**Help first, presence second.** The widget exists to answer questions and book, not to be seen.", "**Match your brand.** Colours, name and tone should feel like yours.", "**Stay out of the way.** Never cover key buttons, forms or cookie choices.", "**Be honest.** Say it is an AI and offer a person.", "**Be fast and light.** It must not slow your pages.", "**Be usable by everyone.** Keyboard, screen reader and touch."),

      h2("Placement"),
      table(["Option", "Good for", "Watch for"], ["Bottom right (common default)", "Familiar; most visitors expect it", "Can cover floating buttons, cookie banners or sticky footers"], ["Bottom left", "Sites with a right-side sticky element", "Less conventional; can clash with left menus"], ["Inline on a page", "Contact or booking pages where chat is the main action", "Needs space and a clear heading"], ["Full-page hosted chat", "Links from social media, QR codes and profiles", "One more page to keep on brand"]),
      p("Test the position on your real pages, on a phone. If the widget hides a call-to-action, move it or adjust its offset."),

      h2("Size and shape"),
      ul("A launcher button large enough to tap comfortably, but not so large it dominates.", "A chat window that fits a phone screen and does not cover the entire page unless the visitor opened it.", "Readable text size and generous line spacing inside the chat.", "A clear close button that is easy to find and reach."),
      p("On desktop, a window of about 350 to 400 pixels wide works for most sites. On mobile, use most of the screen but always keep a visible way out."),

      h2("Colour and typography"),
      ul("Use your brand colour for the launcher and sender bubbles, but check contrast: text must be readable on every background.", "Make visitor and assistant messages visually distinct, and label them in text, not colour alone.", "Match fonts where you can, and keep sizes readable.", "Avoid colours that blend into your page background."),
      p("Crescelo's widget settings let you choose colours, the welcome message and booking options, and higher plans allow white-label branding. See the [website widget feature](/product/website-widget)."),

      h2("The greeting and the launcher label"),
      p("The first thing a visitor sees is the launcher and, perhaps, a greeting. A launcher with a short label such as 'Ask or book' explains itself better than an icon alone. The greeting should say what the assistant can do and invite a first step. See [chatbot welcome message copywriting](/blog/chatbot-welcome-message-copywriting) and [micro-copy for quick replies](/blog/micro-copy-quick-reply-buttons-conversational-prompts)."),

      h2("Mobile behaviour"),
      ul("Keep the launcher small until opened.", "When open, use a layout that respects the on-screen keyboard: the input must stay visible when typing.", "Make sure the page behind cannot scroll unexpectedly while the chat is open.", "Give the close control enough size for thumbs.", "Never let the launcher cover the phone or booking button."),
      p("Test on at least one small phone and one large one, in both orientations. See [chat on a phone: what to check before you go live](/blog/mobile-ai-chatbot-optimization)."),

      h2("Motion and sound"),
      ul("Use gentle animation, if any, and respect reduced-motion settings.", "Do not auto-play sound.", "Avoid bouncing, shaking or flashing launchers.", "Do not open the chat automatically, which steals focus and covers content."),
      p("If you want a nudge, a small bubble shown once after a delay is enough. See [reducing bounce with proactive chat](/blog/reduce-bounce-rate-proactive-chat)."),

      h2("Accessibility"),
      p("A widget that only works with a mouse and good eyesight excludes people. Make sure the launcher has an accessible name, the chat can be operated with a keyboard, new messages are announced to screen readers, contrast is sufficient and focus is visible. See [chatbot accessibility and WCAG](/blog/accessibility-wcag-compliance-website-chatbots)."),

      h2("Performance and page speed"),
      ul("The widget script should load after your main content and not block rendering.", "Check page speed before and after installing.", "Avoid loading it on pages where it is not needed.", "Keep images and fonts inside the widget light."),
      p("See [performance of embedded chat widgets](/blog/performance-optimization-embedded-chat-widgets) and [why widgets use Shadow DOM](/blog/shadow-dom-website-chatbot-widgets) to keep styles from clashing."),

      h2("Trust elements"),
      ul("Show that it is an AI assistant, in the greeting and header.", "Link to your privacy policy near the input.", "Offer a visible route to a person.", "Show your business name and logo.", "Avoid fake typing indicators that imply a human."),

      h2("Design review checklist"),
      table(["Check", "Pass if"], ["Does it cover any key button on desktop or mobile?", "No"], ["Does the greeting say what it can do?", "Yes, in under 25 words"], ["Is it clearly an AI?", "Yes"], ["Is contrast sufficient?", "Yes"], ["Does it work by keyboard?", "Yes"], ["Does it respect reduced motion?", "Yes"], ["Does it slow the page?", "No measurable slowdown"], ["Is there a route to a person?", "Yes, visible"], ["Does it look like your brand?", "Yes"]),

      h2("How to test with real visitors"),
      ol("Watch three people use your site on their phones with the chat, without helping them.", "Note where they hesitate, mis-tap or ignore it.", "Change one thing at a time: position, label or greeting.", "Compare chat open rate and bookings after a few weeks.", "Read conversations for signs of confusion."),

      h2("Worked example: fixing a widget that hurt conversion"),
      p("A salon's widget sat bottom right on every page, opened automatically after five seconds and used a pale pink that matched the brand but was hard to read. On mobile it covered the booking button on the services page. Reviewing session recordings, the owner saw visitors close the chat immediately and leave. She made five changes: the widget stopped auto-opening, a small labelled launcher replaced the icon, the colour was darkened for contrast, the launcher moved higher on the services page and the greeting became specific: 'Ask about prices or book a time.' Chat opens rose, and bookings from the services page increased over the following month. None of the changes required a designer; they required looking at the widget the way a visitor sees it."),
      table(["Problem", "Change"], ["Auto-opened after five seconds", "Turned off; small bubble once"], ["Icon only launcher", "Short label"], ["Low contrast", "Darker colour"], ["Covered booking button on mobile", "Moved offset"], ["Generic greeting", "Specific greeting with two actions"]),

      h2("Design for the first ten seconds"),
      p("Most decisions to use or ignore the widget happen in the first ten seconds. In that time the visitor needs to notice it, understand what it offers and feel it is safe to click. A clear label, a specific greeting and an honest AI label do that. Everything else, animations, avatars, clever effects, can wait. If you have to choose between polish and clarity, choose clarity."),

      h2("Design decisions to write down"),
      ul("Where the launcher sits on desktop and on mobile, and on which pages it is hidden.", "The launcher label and greeting text.", "Brand colours used and their contrast ratios.", "What happens when the visitor closes the chat, and when it reappears.", "Who owns changes to the widget, and how they are tested.", "How to switch it off quickly if something goes wrong."),
      p("A one-page design note stops the widget drifting into a mess as several people tweak it over time."),

      h2("Keeping the widget healthy over time"),
      p("Widgets drift. A new promotion adds a banner that collides with the launcher, a theme update changes a colour, a holiday changes your hours and the greeting is now wrong. Add the widget to your regular website checks: once a month, open your top five pages on a phone and a laptop, confirm the launcher is visible and not covering anything, read the greeting for accuracy and send a test message. It takes five minutes and catches most problems before visitors do."),

      h2("Frequently asked questions"),
      faq(
        ["Where should I put my chat widget?", "Bottom right is the default, but check it does not cover other buttons. Test on real pages and on mobile."],
        ["Should the chat open automatically?", "Generally no. A small greeting bubble shown once is friendlier and more accessible."],
        ["How do I make the widget match my brand?", "Set colours, name and greeting in the widget settings, and check contrast."],
        ["Will a widget slow my site?", "A well-built widget loads after your content and adds little. Measure before and after."],
        ["How do I make it mobile friendly?", "Keep the launcher small, respect the keyboard, make the close button easy to hit and test on phones."],
        ["Can I customise the widget in Crescelo?", "Yes: colours, welcome message and booking options in Widget and Styling, and white-label branding on Growth and above."],
      ),
      p("See the [website widget feature](/product/website-widget), try a chat in the [playground](/playground) and [start a free trial](/login?mode=register)."),
    ],
  }),

  pillar({
    slug: 'boutique-fitness-trial-class-booking-chat',
    title: 'AI Chat for Boutique Fitness Studios: Trial Classes, Memberships and Questions',
    description: 'How yoga, Pilates, cycling and other boutique studios use an AI chat to answer membership questions, convert trial class enquiries and route bookings to their class system.',
    primaryKeyword: 'AI chatbot for fitness studios',
    secondaryKeywords: ['trial class booking chatbot', 'gym chatbot', 'yoga studio chatbot', 'boutique fitness lead conversion'],
    body: [
      p("Boutique fitness studios, whether yoga, Pilates, cycling, boxing or barre, live on first visits. A person who books a trial class, has a good time and joins is worth far more than the price of the class. But between the first thought and the first class sit dozens of small doubts: is it suitable for a beginner, what do I wear, how much are memberships, can I cancel, is there parking. An AI chat on your website and social links can answer those doubts instantly, at any hour, and steer the visitor to book. This guide explains how a studio can use it, what to prepare, how to handle the difference between class booking and appointment booking, and how to measure what matters."),

      h2("The questions that stop people booking"),
      table(["Group", "Typical questions"], ["Suitability", "Is it OK for beginners? I have an injury. I am pregnant. Is it too hard?"], ["Practicalities", "What do I wear or bring? Do you have showers, towels, mats? Where do I park?"], ["Price", "How much is a trial? What are memberships and class packs? Is there a joining fee?"], ["Commitment", "Can I pause or cancel? What is the late-cancel policy?"], ["Schedule", "What time are classes? Which suit a first-timer?"], ["Instructors and atmosphere", "Who teaches? Is it friendly? Is it competitive?"]),
      p("Each of these is answerable from a short document. A visitor who gets a warm, clear answer at 10 p.m. is far more likely to book than one who fills a form and waits."),

      h2("What to give the assistant"),
      ol("**Class descriptions:** what each class is, its intensity, who it suits and what to expect.", "**First-timer guide:** what to wear, arrive early, what happens in the first class.", "**Pricing:** trial offers, single classes, class packs and memberships, with conditions.", "**Policies:** booking, cancellation, late arrival and freezing memberships.", "**Timetable summary:** which classes run when, and which are best for beginners.", "**Facilities and practicalities:** parking, showers, lockers, accessibility.", "**Health and safety statements** you are comfortable making, with clear limits."),
      p("Write in your studio's voice, warm and encouraging. See [the questions every service business chatbot should answer well](/blog/essential-chatbot-questions-service-business) for a test list."),

      h2("Class booking versus appointment booking"),
      p("It helps to be clear about a difference. Classes have capacity: a studio might allow 20 people per class, with a waitlist. Appointments have a single client per slot. Most boutique studios manage classes in a dedicated system, such as their class booking software."),
      p("Crescelo's built-in booking picker is designed for appointments, with slots from your opening hours and one slot length. It does not manage class capacity or waitlists. For classes, the practical approaches are these."),
      table(["Approach", "How it works"], ["Assistant answers and links to your class system", "The assistant handles questions, then gives the trial booking link for your class software"], ["Trial as an appointment", "Offer an introductory session or studio tour as a bookable appointment slot with the built-in picker, or with a Calendly or Cal.com link"], ["Lead capture", "The assistant collects name, contact and preferred class, and the team books them into the class system"]),
      p("Choose the one that matches your operation. Many studios use the assistant as the friendly front door, and their class software for the actual booking."),

      h2("Converting trial enquiries"),
      p("The conversation you want looks like this: a visitor asks a question, gets a confident answer, hears about the trial offer and books or leaves contact details. The assistant should mention the trial once it is relevant, not every message, and should make the next step easy."),
      table(["Visitor says", "Assistant does"], ["I have never done Pilates. Is that OK?", "Reassures with facts from your beginner guide; suggests the best first class; offers the trial"], ["How much is it?", "Gives the trial price and membership options; asks whether they want to book a trial"], ["I have a bad back.", "Shares your general guidance, says it cannot give medical advice, suggests speaking to the instructor and offers to pass their details on"], ["Can I bring a friend?", "Explains your policy and how to book two spots"]),
      p("See [conversational lead capture](/blog/conversational-lead-capture) for how to ask for contact details naturally."),

      h2("Memberships, packs and policies"),
      p("Membership questions are where clarity matters most, because misunderstandings cause complaints and cancellations. Write your terms plainly: minimum term, how to pause, notice period, what happens on holiday, how late cancellation and no-shows are treated. Then test the assistant with awkward questions. If a term is complex, have it explain the essentials and hand over to a person for the rest. See [effective cancellation policies for service businesses](/blog/effective-cancellation-policies-service-businesses)."),

      h2("Health and safety boundaries"),
      ul("The assistant must not give medical advice or say whether an exercise is safe for a condition.", "It should encourage people with injuries, pregnancy or health conditions to speak to a doctor and to tell the instructor, in words you approve.", "It should hand over any detailed health disclosure to a person, rather than collecting details in chat.", "It should not promise results such as weight loss."),
      p("Keep sensitive information out of the chat where you can, and follow your local privacy rules. See the [GDPR checklist for website chatbots](/blog/website-chatbot-gdpr-checklist)."),

      h2("Social media and hosted pages"),
      p("Much of a studio's traffic starts on Instagram or TikTok. A link in your bio to a hosted chat page lets a curious follower ask a question and book without hunting through your website. See [booking from your social bio link](/blog/social-bio-link-in-chat-booking) and the [website widget feature](/product/website-widget)."),

      h2("Measure what matters"),
      table(["Metric", "Why"], ["Trial enquiries and bookings from chat", "The top of your funnel"], ["Trial to member conversion", "The real outcome"], ["Questions asked most", "What your website should answer"], ["Unanswered questions", "Content gaps"], ["Out-of-hours enquiries", "Demand you would have missed"]),
      p("Review conversations weekly; see [how to review your chatbot conversations](/blog/audit-website-chatbot-conversations)."),

      h2("A sample conversation with a first-timer"),
      table(["Speaker", "Message"], ["Visitor", "Hi, I have never tried reformer Pilates. Is it very hard, and how much is a first class?"], ["Assistant", "Hi, welcome. Many of our members started as complete beginners. Our Foundations class is the best first step: it is slower, with plenty of guidance. A trial class is $25. Would you like to see this week's Foundations times?"], ["Visitor", "Yes, and do I need my own socks?"], ["Assistant", "Grip socks are required for hygiene, and you can buy a pair at the studio for $8. Foundations runs Tuesday 6:30 p.m., Thursday 9:30 a.m. and Saturday 10:00 a.m. Here is the link to book your trial. Would you like me to take your email so we can send a reminder and what to expect?"]),
      p("The assistant reassured a nervous beginner, recommended the right class, stated the price and practical details, and gave the booking link. It also offered a soft follow-up, which captures the lead if the visitor does not book at once."),

      h2("Ideas to make the trial offer work harder"),
      ul("Mention the trial once the visitor shows interest, not in every message.", "Offer a first-timer guide by email to people who are not ready to book.", "Follow up after a trial with a warm message and a membership suggestion, with your own messaging tools.", "Ask new members how they found you, to learn which channels bring them."),

      h2("A launch checklist for studios"),
      ul("Class descriptions, first-timer guide, prices and policies loaded and tested.", "The trial booking link tested from the chat on a phone.", "Health and safety wording approved by your team, and handover tested.", "Bio link and hosted page set up and tested.", "Someone owns the weekly review of conversations.", "You know how a trial enquiry reaches your team and who follows up within a day."),

      h2("Seasonal peaks: January and September"),
      p("Fitness enquiries spike around New Year and the return to school. Prepare in advance: update prices and offers, add short answers about resolutions and beginner options and check that the trial link and lead alerts work. An assistant that answers instantly during the rush is worth most when your team is busiest, and a quick review of the conversations after the peak shows which objections came up so you can address them in your next campaign."),

      h2("Frequently asked questions"),
      faq(
        ["Can a chatbot book fitness classes?", "It can answer questions and send visitors to your class booking system. Crescelo's built-in picker is for appointments and does not manage class capacity, so use it for trial sessions or link to your class software."],
        ["Can the assistant explain memberships?", "Yes, from your documents. Write your terms clearly and test awkward questions."],
        ["Can it give exercise or health advice?", "It should not. It should encourage visitors to speak to a professional and hand over health questions to a person."],
        ["How does it help convert trials?", "It answers doubts instantly, at any hour, and offers the trial at the right moment."],
        ["Does it work on Instagram links?", "A hosted chat page can be linked from your bio, so followers can ask questions and book."],
        ["What does it cost?", "Plans start at $49 a month; booking is on the Growth plan. See the pricing page."],
      ),
      p("Try it with your own class descriptions and prices in the [playground](/playground), see the [AI assistant feature](/product/ai-assistant), check [pricing](/pricing) and [start a free trial](/login?mode=register)."),
    ],
  }),
];
