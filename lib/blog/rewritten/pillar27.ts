import { faq, h2, ol, p, pillar, table, ul } from '../authoring';

export const PILLAR27 = [
  pillar({
    slug: 'overcoming-price-resistance-website-chat',
    title: 'When a Visitor Says "It Is Too Expensive": Handling Price Objections in Website Chat',
    description: 'How to handle price objections in chat without discounting: understand the concern, explain value honestly, offer options, know when to hand over, and write assistant answers that stay truthful.',
    primaryKeyword: 'handling price objections in chat',
    secondaryKeywords: ['price resistance website chat', 'too expensive objection response', 'chatbot pricing objections', 'sell without discounting'],
    body: [
      p("Sooner or later every service business hears it: 'That is more than I expected.' In a chat window the objection arrives in a few words and can end the conversation just as quickly. What happens next depends on how the reply is written. A defensive answer loses the visitor. A panicky discount trains them to expect one. A shrug says nothing. A good answer treats the objection as information: the visitor is telling you what they compared you with, what they expected or how they feel about the risk. This guide covers how to handle price resistance in website chat, whether the reply comes from a person or from an AI assistant trained on your documents. It explains what price objections usually mean, a simple response framework, honest ways to explain value, options to offer instead of discounts, when to pass the conversation to a person, what the assistant must never do and how to test the wording. The examples are illustrative; adapt the numbers and services to yours."),

      h2("What 'too expensive' usually means"),
      table(["What they say", "What it often means", "What helps"], ["It is too expensive", "It is more than I expected", "Explain what the price includes and how it is made up"], ["Others are cheaper", "I am comparing, and I cannot tell the difference", "Explain the difference honestly, without disparaging others"], ["I cannot afford that", "The budget is fixed", "Offer a smaller option or a phased approach"], ["Can you do it for less?", "I am testing whether the price is negotiable", "Explain your pricing approach; offer options, not a random cut"], ["I need to think about it", "I am not yet convinced of the value or need to consult someone", "Offer information and an easy way to come back"]),
      p("Price objections are rarely about price alone. They are about the relationship between price and confidence that the result is worth it."),

      h2("A four-step response framework"),
      ol("**Acknowledge.** Show you heard: 'That is fair, it is a real investment.'", "**Clarify.** Ask one question to understand: 'What were you expecting, or what are you comparing it with?'", "**Explain value.** Connect the price to what they get, using facts from your documents, not slogans.", "**Offer a next step or option.** A smaller service, a payment approach you genuinely offer, a consultation to scope the work or a follow-up message."),
      p("The order matters. Jumping to value before understanding the concern can sound dismissive."),

      h2("Explain value with facts, not adjectives"),
      ul("What is included: materials, aftercare, follow-up visits, guarantees you actually offer.", "How long it takes and who does it, including qualifications where relevant.", "What happens if it goes wrong: your redo or refund policy, if you have one.", "Typical results or timelines, stated honestly and not as promises.", "What the cheaper alternative usually leaves out, phrased without attacking competitors."),
      table(["Weak answer", "Stronger answer"], ["We are worth it.", "The $140 includes the consultation, the colour, a toner and a free 20-minute check after two weeks."], ["We use quality products.", "We use professional-grade colour that is less likely to damage hair, and we do a patch test first."], ["Trust us.", "We offer a free adjustment within 14 days if you are not happy."]),
      p("Only state guarantees and inclusions that are true and written in your documents. See [preparing your service menu and price list](/blog/prepare-service-menu-pricing-docs-rag)."),

      h2("Options instead of discounts"),
      p("A discount given because someone asked teaches customers to ask, and it erodes the value of your work. Offering a different shape of the same service respects both sides."),
      table(["Option", "Example"], ["A smaller scope", "A single treatment instead of a package; a survey now, the full job later"], ["A phased plan", "Start with the most urgent part and schedule the rest"], ["A different tier", "A standard service instead of the premium one"], ["A payment approach you really offer", "Pay in stages, if you allow it"], ["A consultation", "A short call or visit to fit the work to the budget"]),
      p("Do not invent options for the assistant to mention. If you do not offer payment plans, the assistant must not suggest them. Crescelo's booking does not process payments, so any payment arrangement is handled outside the chat."),

      h2("What an AI assistant must never do"),
      ul("Invent discounts, price matches or special offers.", "Agree to a lower price than the documents state.", "Make guarantees that are not in the documents.", "Pressure the visitor with false urgency such as 'only one slot left'.", "Criticise competitors.", "Ignore the concern and repeat the price."),
      p("Write these limits into the assistant's instructions: 'Never offer discounts or change prices. If a visitor says the price is too high, acknowledge it, explain what the price includes from the documents, mention only the options listed in the price document and offer to pass their request to the team.'"),

      h2("When to hand over to a person"),
      ul("The visitor asks to negotiate.", "A large or complex project where the quote depends on details.", "A returning customer with a history.", "A frustrated visitor who feels the price is unfair.", "Any situation where the right answer is a business decision, not a fact."),
      p("Capture their name, contact details and what they said, so the person who replies can pick up where the chat left off. See [when and how to hand over](/blog/live-human-handover-flow-design)."),

      h2("Sample conversations"),
      table(["Visitor", "Assistant"], ["That seems pricey for a haircut.", "I understand. A cut at our studio is $65 and includes a consultation, a wash, a styled finish and a free tidy-up within two weeks. If you would like something lower, our shorter trim is $40. Would you like to see either?"], ["Can you do a discount?", "I am not able to change prices, but I can pass your request to the team, or show you our other options. Shall I take your contact details?"], ["I found it cheaper elsewhere.", "That is fair to compare. I can tell you what ours includes so you can weigh them up: [list from your documents]. If it helps, I can also share our shorter service."]),

      h2("Fix the causes behind the objection"),
      ul("**Sticker shock:** state price ranges and what changes them early, so nothing is a surprise.", "**Unclear value:** add what is included to each service description.", "**Weak proof:** show real reviews and results; see [using social proof in chat](/blog/social-proof-reviews-ai-chat).", "**Wrong audience:** if many visitors object, check whether your marketing attracts people with a different budget.", "**No smaller option:** consider a lower-cost entry service."),
      p("Read your price objection conversations monthly. Patterns tell you which of these needs work, and each fix reduces future objections."),

      h2("Measure the effect"),
      table(["Measure", "Why"], ["Share of chats where price was raised", "How central price is to your visitors"], ["What happened next", "Whether visitors continued, left or booked"], ["Handovers on price", "Whether staff need better guidance"], ["Objections by service", "Which service pages need clearer value"]),
      p("Compare before and after each change to your price page or instructions, using the method in [the chat analytics playbook](/blog/service-business-chat-analytics-playbook)."),

      h2("Common mistakes"),
      ul("Discounting at the first objection.", "Dumping a long value speech.", "Ignoring the visitor's own words.", "Letting the assistant improvise offers.", "Never reading the objection transcripts.", "Hiding prices until the last moment."),

      h2("Frequently asked questions"),
      faq(
        ["How should a chatbot respond to 'it is too expensive'?", "Acknowledge the concern, ask what they expected, explain what the price includes using facts from your documents and offer only real options or a handover."],
        ["Should the assistant offer discounts?", "No. It should never invent or agree to discounts. Route negotiation requests to a person."],
        ["What are good alternatives to discounting?", "A smaller scope, a phased plan, a different tier or a consultation to fit the work to the budget."],
        ["How do I stop price shock?", "State price ranges and inclusions clearly and early, on your website and in the assistant's answers."],
        ["When should a person take over?", "For negotiation, large or complex projects and frustrated visitors."],
        ["Does Crescelo handle payment plans?", "No. Payments are not part of the built-in booking, so any payment arrangement is handled outside the chat."],
      ),
      p("Try your own price questions in the [playground](/playground), see the [AI assistant feature](/product/ai-assistant) and read [price calculators or chat: which gets better leads](/blog/cost-estimators-vs-conversational-lead-capture)."),
    ],
  }),

  pillar({
    slug: 'cost-estimators-vs-conversational-lead-capture',
    title: 'Price Calculators or a Chat Assistant: Which Gets Better Leads for a Service Business?',
    description: 'Compare online cost estimators with conversational lead capture: how each works, their strengths and weaknesses, lead quality, when to use both and how to test them fairly.',
    primaryKeyword: 'cost estimator vs chatbot lead capture',
    secondaryKeywords: ['online price calculator for services', 'instant quote tool vs chat', 'lead quality calculator vs chat', 'quote form alternatives'],
    body: [
      p("Service businesses that quote by the job, such as cleaners, painters, landscapers, movers and consultants, often face the same website question: should we add a price calculator, or a chat assistant that talks to the visitor and collects their details? Both promise the same outcome, more enquiries with less phone tag. They work quite differently, attract different kinds of visitor and produce leads of different quality. A calculator gives an instant number and can feel efficient, but it also asks the visitor to trust a simplified formula and often ends in a form. A chat assistant can answer questions, explain what affects the price and ask for details in context, but it will not produce an exact quote unless you have decided how. This guide compares the two honestly, explains the strengths and weaknesses of each, shows when each fits, suggests a combined approach and provides a simple way to test them on your own website without guessing."),

      h2("How each one works"),
      table(["", "Cost estimator", "Conversational lead capture"], ["What the visitor does", "Selects options and sees a price or range", "Asks questions in their own words and answers questions from the assistant"], ["What you get", "A number plus the choices behind it, often a form", "A conversation, plus name and contact details"], ["Effort for the visitor", "Low if the options are clear", "Low; typing or tapping suggested questions"], ["Setup effort", "Design the formula and options", "Write documents describing services and pricing rules"], ["Best at", "Standardised jobs with predictable pricing", "Explaining, reassuring and gathering context"]),

      h2("Strengths of calculators"),
      ul("Instant answer to 'roughly how much?', which is the top question for many visitors.", "Structured data: the leads arrive with sizes, options and postcodes already filled in.", "Filters out visitors whose budget is far below your minimum.", "Works well for standardised services, such as a clean by number of rooms."),
      h2("Weaknesses of calculators"),
      ul("Real jobs rarely fit the formula, so the estimate can mislead.", "Visitors may treat the number as a firm quote and be upset later.", "There is no place to ask 'does that include the oven?'; questions remain unanswered.", "A long form before the price loses people; a price before contact details loses the lead.", "They need upkeep as prices change."),

      h2("Strengths of conversational capture"),
      ul("Answers questions that a calculator cannot, such as what is included and what affects the price.", "Feels personal and works well on phones.", "Captures details naturally as the conversation goes, and can ask follow-up questions.", "Handles visitors with unusual jobs.", "Works out of hours and links each lead to the conversation that produced it."),
      h2("Weaknesses of conversational capture"),
      ul("It gives ranges and rules, not an exact calculation, unless you set out the formula in documents.", "Quality depends on the documents; if pricing is missing, the assistant cannot answer.", "Some visitors prefer to tap through options without reading.", "Leads are less structured, although fields you choose can be collected."),
      p("Crescelo's lead capture asks for details you choose, such as service, budget or preferred time, and sends each lead by email, to Slack, to Google Sheets or to a webhook, linked to the chat that produced it."),

      h2("Lead quality: what to expect"),
      table(["Aspect", "Calculator leads", "Chat leads"], ["Volume", "Often lower, because it asks more upfront", "Often higher, because it asks less at the start"], ["Structure", "Very structured", "Structured for the fields you set, plus a transcript"], ["Fit with your prices", "Filtered by the estimate", "Filtered by how clearly the assistant states price ranges"], ["Context", "Options chosen", "The visitor's own words and worries"], ["Follow-up effort", "Low for standard jobs", "Depends; the transcript helps you prepare"]),
      p("These are tendencies, not laws, and they vary by industry. The only reliable answer for your business comes from testing."),

      h2("When to use which"),
      ol("**Standardised, repeatable jobs** with few variables: a calculator can work well, ideally with the assistant available to answer questions.", "**Custom or variable jobs:** a chat that explains the price factors and gathers details for a real quote.", "**High-ticket services:** chat, because trust and reassurance matter more than a number.", "**Very price-sensitive markets:** a calculator, or a clear starting-price statement plus chat.", "**Small teams with little time:** chat that filters and prepares leads, so quotes are faster."),

      h2("The combined approach"),
      p("You do not have to choose. A common pattern is to publish clear starting prices or ranges on your service pages, offer a simple estimator only if your jobs are standardised, and place the assistant beside it to answer questions and capture the details. The assistant explains what the estimate includes and what could change it; the calculator or price document supplies the numbers. Make it clear that any figure is an estimate and how the final quote is confirmed."),
      ul("Publish ranges and what changes them, in the knowledge base as well as on the page.", "Have the assistant ask the two or three questions that most affect price: size, location and timing.", "Offer a callback or a visit for an exact quote.", "Never let the assistant promise a fixed price it is not authorised to give."),

      h2("How to test them fairly"),
      table(["Step", "How"], ["Define the goal", "Qualified enquiries per hundred visitors, and share that turn into customers"], ["Run each for a fixed period", "Two to four weeks each, in similar seasons, or split traffic if your tools allow"], ["Count the same things", "Leads, qualified leads, quotes sent, jobs won, time spent per lead"], ["Read samples", "Look at ten leads from each and judge their quality"], ["Decide", "Keep the approach that produces more won jobs per hour of your time, not the most leads"]),
      p("Beware of counting raw lead volume; a tool that produces many poor leads can cost more time than it saves. See [measuring chat results](/blog/service-business-chat-analytics-playbook)."),

      h2("Data and privacy"),
      p("Both approaches collect personal data. Say why you need it, collect only what you use and follow the rules for your area. See [privacy law for lead capture](/blog/chatbot-lead-capture-gdpr-ccpa-compliance)."),

      h2("Common mistakes"),
      ul("Presenting an estimate as a firm quote.", "Asking for contact details before showing any price information.", "Forgetting to update the formula when prices change.", "Judging by lead volume alone.", "Assuming visitors will read long instructions.", "Not connecting leads to a follow-up process."),

      h2("Frequently asked questions"),
      faq(
        ["Are price calculators better than chatbots for leads?", "Calculators suit standardised jobs; chat suits variable or high-value work and answers questions. Many businesses use both."],
        ["Can a chat assistant give a price?", "It can state prices and ranges from your documents. An exact quote for a custom job usually needs a person."],
        ["Which produces better leads?", "It depends on your services. Test both and compare won jobs per hour of your time."],
        ["How do I stop visitors treating an estimate as a quote?", "Label it clearly as an estimate and explain what could change it and how the final quote is confirmed."],
        ["Can Crescelo send leads to my tools?", "Yes: email alerts, Slack, Google Sheets and signed webhooks for Zapier, Make and similar tools. Native CRM sync is planned."],
        ["Do I need both?", "Not necessarily. Start with clear price information and a chat assistant, and add a calculator only if your jobs are standardised."],
      ),
      p("See the [lead capture feature](/product/lead-capture), try your price questions in the [playground](/playground) and read [how conversational lead capture works](/blog/conversational-lead-capture)."),
    ],
  }),

  pillar({
    slug: 'instant-lead-routing-chat',
    title: 'Getting a New Lead to the Right Person in Minutes: Lead Routing for Small Teams',
    description: 'How to route chat leads quickly: speed matters, routing rules, alerts, ownership, response templates, out-of-hours handling and how to measure time to first contact.',
    primaryKeyword: 'lead routing for small business',
    secondaryKeywords: ['speed to lead', 'route chat leads to team', 'new lead alerts', 'lead response time'],
    body: [
      p("A lead is a perishable thing. A visitor who asks about a quote at lunchtime is comparing you with two other businesses, and the one who replies first, helpfully, often wins. Yet in many small businesses a new enquiry sits in an inbox until someone notices it, then someone else assumes a colleague has replied. Lead routing is the unglamorous process that fixes this: deciding who gets each lead, how they are told and how quickly they respond. You do not need enterprise software to do it well. This guide explains why speed matters, how to design simple routing rules for a small team, how alerts work with a chat assistant, how to write first replies, how to cover evenings and weekends, how to track response time and which mistakes cause leads to fall through the cracks. It uses Crescelo's real capabilities, which are email alerts, Slack, Google Sheets and signed webhooks, and avoids promising features such as SMS alerts or automatic assignment."),

      h2("Why speed matters"),
      ul("Visitors send enquiries to several businesses; the first useful reply often wins.", "Interest fades quickly: a lead who was keen at 12:00 may have moved on by 17:00.", "A fast reply signals that you are attentive and organised.", "Context is fresh: the visitor remembers what they asked."),
      p("Studies from sales research report that responding within minutes gives markedly better contact and conversion than responding hours later. Exact figures vary by source and industry, so treat them as directional. The lesson is consistent: shorten the gap, and make sure someone owns it."),

      h2("The three questions routing answers"),
      table(["Question", "Example answer"], ["Who should get this lead?", "The person responsible for that service or area"], ["How will they be told?", "An email alert plus a message in the team's Slack channel"], ["What if they do not act?", "A second person is alerted after a set time"]),

      h2("Simple routing rules that work"),
      table(["Rule", "When to use it"], ["By service", "Different people handle different services"], ["By location", "Several branches or areas; see [one assistant for several locations](/blog/multi-location-ai-receptionist)"], ["By value", "Large jobs go straight to the owner"], ["By time", "Evening leads go to whoever opens the next morning"], ["Round robin", "Rotate leads evenly among equals"], ["Everyone, first come first served", "Small team with a shared inbox; needs a clear claiming rule"]),
      p("Start with the simplest rule that fits. Add complexity only when a problem shows up."),

      h2("How Crescelo delivers leads"),
      ul("Each new lead appears in the dashboard's Leads section with the conversation that produced it.", "An email alert goes to your team.", "You can also post leads to a Slack channel, add them as rows in a Google Sheet or send them to a webhook.", "Signed webhooks connect to Zapier, Make, n8n or your own systems, where you can apply routing rules such as assigning by service or sending different leads to different people.", "The lead form fields you choose, for example service, area or budget, arrive with each lead, so a routing rule has data to work with."),
      p("There is no built-in automatic assignment or SMS alert. If you need per-service routing, use a webhook into a tool that supports it, or use separate assistants and alert addresses for separate teams."),

      h2("Design a routing flow"),
      ol("List your services, locations and team members.", "Decide who owns each combination and who covers them when absent.", "Choose the collecting fields that the rule needs, such as service and postcode, and make them required.", "Set up alerts: an email to the owner and a Slack post to the team channel.", "Agree on a claim step: the person who takes the lead reacts with a mark in Slack or updates the sheet.", "Set a backup: if nobody has claimed it in fifteen minutes during opening hours, a second person is alerted."),
      p("Write the flow down on one page and pin it where the team can see it."),

      h2("Write good first replies"),
      ul("Reply on the channel the visitor prefers, using the contact details they gave.", "Refer to what they asked; the linked conversation shows you.", "Answer the question and propose a next step: a time for a call, a visit or a booking link.", "Keep it short and human.", "Do not ask them to repeat what they told the assistant."),
      table(["Situation", "Example first reply"], ["Quote request", "Hi Sam, thanks for your enquiry about the bathroom refit. From your chat I can see it is a small room in Northfield. I can visit on Thursday afternoon to give an exact quote. Would 2 pm suit you?"], ["Question the assistant could not answer", "Hi Priya, I am following up on your question about weekend availability. We do work Saturdays, and I can offer 10 am or 1 pm this week."], ["Out-of-hours lead", "Hi Tom, thanks for getting in touch last night. I am in from 8 am and will call you before 9 unless you would rather I email."]),

      h2("Cover evenings and weekends"),
      ul("Let the assistant say when someone will reply, honestly: 'The team replies from 9 am on weekdays.'", "Let it book an appointment or callback slot so the visitor has something concrete.", "Assign one person to check the first thing in the morning, with a fifteen-minute goal.", "Use urgency rules for emergencies: display a phone number for genuine emergencies, and route those enquiries to the on-call person."),
      p("See [handling emergency jobs for contractors](/blog/emergency-dispatch-workflows-ai-chat) for a dedicated approach."),

      h2("Measure time to first contact"),
      table(["Measure", "How", "Target"], ["Time to first reply", "Lead arrival to first message sent", "Set your own, for example within an hour in opening hours"], ["Claim rate", "Share of leads claimed within the target", "As close to all as possible"], ["Contact rate", "Share of leads you actually spoke to", "Rising over time"], ["Win rate by speed", "Compare won leads by how quickly you replied", "Shows whether speed pays"]),
      p("A simple sheet with arrival time and first-reply time is enough. Review it weekly for the first month."),

      h2("Common mistakes"),
      ul("Alerts that go to a shared inbox nobody owns.", "No backup when the owner is away.", "Too many alerts, so people ignore them.", "Replies that ignore the conversation.", "No record of who followed up.", "Promising an automatic routing feature your tools do not have."),

      h2("A one-page routing plan you can copy"),
      table(["Item", "Your answer"], ["Owner for each service", "Name and backup"], ["How they are alerted", "Email plus Slack channel"], ["Claim step", "React in Slack or mark the sheet"], ["Backup after 15 minutes", "Second named person"], ["Out-of-hours owner", "First person in the next morning"], ["First-reply template", "Saved where everyone can find it"]),
      p("Fill this in with your team in a single meeting, test it with a dummy lead and refine it after the first week."),

      h2("Frequently asked questions"),
      faq(
        ["How quickly should I reply to a new lead?", "As quickly as you reliably can. Minutes during opening hours is a strong goal, since the first useful reply often wins the job."],
        ["How does Crescelo notify my team?", "By email alert, and optionally Slack, Google Sheets or a webhook, with the linked conversation."],
        ["Can Crescelo assign leads automatically?", "Not natively. Use a webhook into a tool such as Zapier or Make, or separate assistants for separate teams."],
        ["Does it send SMS alerts?", "No. Alerts go by email, Slack, Sheets or webhook."],
        ["What if nobody claims a lead?", "Set a backup so a second person is alerted after a set time."],
        ["How do I handle out-of-hours leads?", "Tell visitors when to expect a reply, offer a booking or callback and check the queue first thing in the morning."],
      ),
      p("See the [lead capture feature](/product/lead-capture), [pricing](/pricing) and read [scoring chat leads by what visitors said](/blog/chat-behavior-lead-scoring)."),
    ],
  }),

  pillar({
    slug: 'chat-behavior-lead-scoring',
    title: 'Scoring Chat Leads by What Visitors Actually Said: A Simple Manual Method',
    description: 'How to prioritise chat leads with a simple scoring sheet based on real behaviour: intent signals, fit, urgency, red flags, follow-up rules and how to check the scores against outcomes.',
    primaryKeyword: 'chat lead scoring',
    secondaryKeywords: ['prioritise leads small business', 'lead scoring for service businesses', 'lead qualification from chat', 'hot vs cold leads'],
    body: [
      p("Not every enquiry deserves the same effort. One visitor asks about the price of a specific service, gives a postcode you cover and wants Thursday. Another types 'just looking' and leaves an email address nobody will ever use. If you treat both alike, you waste time on the second or reply too slowly to the first. Lead scoring is the practice of giving each lead a rough priority so you know whom to contact first. Enterprise tools use complicated models, but a small business can do it well with a simple sheet, because the chat transcript already contains the signals: what they asked, how specific they were and what they did next. This guide explains what to score, how to build a simple points system, which signals matter for service businesses, which red flags to watch, what follow-up each score should trigger and how to check that your scoring reflects reality. Crescelo does not compute lead scores automatically; this is a manual or spreadsheet method that uses the leads and conversations the platform delivers."),

      h2("Score what people did, not who they are"),
      p("Be careful with assumptions about people. Scoring by their behaviour and stated needs is fair and reliable. Guessing from names, accents or other personal characteristics is neither, and in some places is unlawful discrimination. Use signals a visitor gave you deliberately."),

      h2("Signals that suggest a ready-to-buy lead"),
      table(["Signal", "Why it matters", "Points"], ["Asked about a specific service or price", "They know what they want", "+2"], ["Gave a location you serve", "They are in your area", "+2"], ["Asked about dates or availability", "They are thinking about timing", "+3"], ["Wants it soon", "Urgency", "+3"], ["Booked, or started booking", "Highest intent", "+5"], ["Gave a phone number as well as an email", "Willing to be contacted", "+1"], ["Mentioned budget within your range", "Fit", "+2"], ["Returned for a second conversation", "Persistent interest", "+2"]),
      p("These numbers are examples. The point is the relative order: timing and booking signals matter more than general curiosity."),

      h2("Signals that lower the priority"),
      table(["Signal", "Points"], ["Very general question with no follow-up", "-1"], ["Outside your service area", "-3"], ["Asks for something you do not offer", "-3"], ["Budget far below your minimum", "-2"], ["Details look invalid (fake email, nonsense name)", "-3"], ["Clearly a supplier or salesperson", "-5"]),
      p("Do not delete these leads unread. A low score means 'reply later or with a template', not 'ignore'. People sometimes phrase things vaguely and turn out to be excellent customers."),

      h2("Build a one-page scoring sheet"),
      ol("List the six or eight signals that matter for your business, with points.", "Decide the bands, for example 6 or more is hot, 3 to 5 is warm, below 3 is cool.", "Add columns to your leads sheet: date, source, service, location, signals seen, score, band and follow-up owner.", "Score each new lead in under a minute by skimming the transcript, which Crescelo links to each lead.", "Review the bands weekly and adjust the points."),
      p("Keep the sheet short. If scoring takes longer than the reply, you will stop doing it."),

      h2("Decide the follow-up for each band"),
      table(["Band", "Action", "Target time"], ["Hot", "Call or message personally, offer a specific time", "Within the hour in opening hours"], ["Warm", "Personal email or message with an answer and a booking link", "Same business day"], ["Cool", "Templated reply with useful links and an invitation to ask more", "Within a day or two"], ["Invalid or irrelevant", "No reply, or a polite one where appropriate", "Batch weekly"]),
      p("This connects with [getting a lead to the right person in minutes](/blog/instant-lead-routing-chat). Routing tells you who acts; scoring tells you how urgently."),

      h2("Use the conversation for richer notes"),
      ul("Note their exact words about the problem; quote them in your reply.", "Note objections raised, such as price or timing.", "Note which pages they came from, if you track it; see [which channel brought a chat lead](/blog/attribution-modeling-marketing-channels-chat-leads).", "Note questions the assistant could not answer; they show where to improve your documents."),

      h2("Check your scoring against outcomes"),
      p("A score is a hypothesis. After a couple of months, list the leads you won and lost and compare their scores."),
      table(["Finding", "What to change"], ["Many hot leads did not convert", "Your reply is too slow or the signals are misleading; review the transcripts"], ["Many cool leads converted", "You are underrating some signal; add points for it"], ["Nearly all wins were hot", "Your scoring works; use it to protect your speed on hot leads"], ["No pattern", "Simplify, or collect more useful fields in the lead form"]),
      p("Adjust the points every quarter. Simple and roughly right beats complicated and untested."),

      h2("Collect the fields that make scoring easy"),
      p("Crescelo lets you choose the lead form fields. Ask for the two or three that matter most to your scoring: service wanted, preferred timing and location or postcode. Mark them required where you can, without making the form long. Better fields mean less guesswork, and they also help routing."),

      h2("Privacy and fairness"),
      ul("Tell visitors how you use their information.", "Do not record sensitive attributes you do not need.", "Base scores on stated needs and behaviour.", "Keep scoring notes only as long as you need them.", "See the [GDPR and CCPA guide for lead capture](/blog/chatbot-lead-capture-gdpr-ccpa-compliance)."),

      h2("Common mistakes"),
      ul("Building a complicated model before you have data.", "Ignoring low scores entirely.", "Scoring by personal characteristics.", "Never comparing scores with results.", "Spending longer scoring than replying.", "Expecting the platform to compute scores automatically."),

      h2("A worked example"),
      p("A cleaning company reviews three leads. Priya asked about a deep clean for a three-bedroom house, gave a postcode the company covers, asked about Thursday and started booking: 2 + 2 + 3 + 5 = 12, hot. Tom asked a general question about what cleaners do and left an email: score 0, cool. Alex asked for a price, but lives outside the area: 2 - 3 = -1, low. The owner phones Priya within the hour, sends Tom a helpful template with a booking link, and sends Alex a polite note explaining the service area. The whole scoring exercise took a couple of minutes and directed the owner's time where it counted."),
      table(["Lead", "Signals", "Score", "Band"], ["Priya", "Specific service, area, timing, booking", "12", "Hot"], ["Tom", "General question only", "0", "Cool"], ["Alex", "Price asked, outside area", "-1", "Low"]),
      p("Notice that nothing here required special software: a sheet, a few rules and the transcripts that Crescelo links to each lead."),

      h2("Keep the human in the loop"),
      p("Scores guide attention; they should never replace judgement. If a low-scoring lead mentions a large commercial contract, override the score. If a hot lead turns out to be a competitor gathering prices, note it and adjust. The best scoring systems are a quick first sort that a person can overrule in seconds."),

      h2("Frequently asked questions"),
      faq(
        ["What is lead scoring?", "Giving each lead a rough priority based on signals such as intent, timing and fit so you know whom to contact first."],
        ["Does Crescelo score leads automatically?", "No. It delivers leads with their conversations and fields; a simple manual or spreadsheet scoring method works well on top."],
        ["What signals matter most?", "Asking about dates or availability, wanting the service soon, being in your area and starting a booking."],
        ["Should I ignore low-scoring leads?", "No. Reply with a template or later; do not discard them unread."],
        ["How do I know my scoring is right?", "Compare scores with won and lost leads every quarter and adjust."],
        ["Is scoring fair?", "It is when it is based on what visitors said and did, not on personal characteristics."],
      ),
      p("See the [lead capture feature](/product/lead-capture), try a sample chat in the [playground](/playground) and read [spotting unhappy or ready-to-buy visitors from their messages](/blog/conversation-sentiment-analysis-service-chat)."),
    ],
  }),

  pillar({
    slug: 'collect-reviews-ratings-automated-chat',
    title: 'Asking for Reviews After a Visit Without Being Pushy: A Practical Guide',
    description: 'How to ask customers for reviews: timing, wording, links, channels, rules to follow, handling negative feedback and how a chat assistant supports review collection honestly.',
    primaryKeyword: 'how to ask customers for reviews',
    secondaryKeywords: ['collect reviews service business', 'review request message', 'Google reviews small business', 'ask for feedback after appointment'],
    body: [
      p("Reviews are among the strongest reasons a stranger chooses you. A business with sixty recent, specific reviews looks safer than one with three, and search results and maps reward review volume and freshness. Yet most satisfied customers never leave a review, not because they are unhappy but because nobody asked, or the process was too much bother. Asking is the single biggest lever, and doing it well is a matter of timing, wording and making it easy. This guide explains when to ask, how to word the request, which channels work, how to make the review link a one-tap action, which rules platforms and consumer law impose, how to handle negative feedback gracefully and how a chat assistant helps without pretending to do more than it does. Crescelo's assistant answers questions and books appointments; it does not send review requests on its own, so the requests here are sent from your own email or messaging tools, and the assistant helps by pointing people to reviews and answering questions about them."),

      h2("Why customers do not review"),
      table(["Reason", "What helps"], ["Nobody asked", "Ask every customer"], ["It felt like effort", "Send a direct link that opens the review form"], ["They forgot", "One polite reminder"], ["They were unsure what to write", "Offer a one-line prompt"], ["They were unhappy and unheard", "Give them a way to tell you privately first"]),

      h2("When to ask"),
      ul("**After the result is visible:** a haircut can be reviewed the same day; a garden design after the plants have grown; a dental check-up when the visit is fresh.", "**At a moment of satisfaction:** just after a compliment, a completed job or a rebooking.", "**Not during a problem:** if there is an open complaint, resolve it first.", "**Not too late:** after a few weeks the memory fades."),
      p("A good default is the same day or the next day for quick services, and within a few days for jobs that need time to show results."),

      h2("How to word the request"),
      table(["Element", "Example"], ["Personal thanks", "Thanks for choosing us, Sam."], ["The ask", "If you were happy with your visit, would you mind sharing a review?"], ["Why it matters", "It helps other people in the neighbourhood find us."], ["The link", "One tap: [direct review link]"], ["A prompt", "A line about what you liked, such as the service, the friendliness or the result, is plenty."], ["No pressure", "No worries if you do not have time."]),
      p("Keep it short and warm, and make sure the link works on a phone. Do not script the review or tell customers what to say."),

      h2("Channels"),
      ul("**Email** after the appointment, from your own email tool.", "**A message** from your business number or a messaging app, if the customer has agreed to be contacted that way.", "**In person**, with a printed card or a QR code at the counter.", "**On the receipt or thank-you page**, if you have one.", "**On your website**, where the assistant can point to your review profile when visitors ask about reputation."),
      p("Spread the asks across channels but do not repeat the same request to one person more than once or twice."),

      h2("Make the link a one-tap action"),
      ol("Find your review profile on the platform you want reviews on, for example your Google Business Profile.", "Copy the direct link that opens the review box, not the general profile page.", "Shorten it if needed, and test it on a phone.", "Put it in your templates so nobody has to hunt for it.", "Add a QR code to printed materials."),

      h2("Follow the rules"),
      ul("Review platforms generally forbid paying for reviews or offering rewards for positive ones; do not do it.", "Do not only ask customers you think are happy. Selective asking, known as review gating, breaches the rules of some platforms and consumer protection law in some places.", "Do not write reviews yourself or have staff post them.", "Do not ask family and friends to pretend to be customers.", "Tell customers they are free to leave honest feedback of any kind.", "Consumer authorities in several countries actively pursue fake or manipulated reviews."),
      p("This is general information, not legal advice. Check your platform's guidelines and local rules."),

      h2("Handle negative feedback well"),
      ol("Thank the reviewer and respond promptly and calmly.", "Do not argue or reveal private details.", "Acknowledge the problem and offer to resolve it offline: give a contact route.", "Fix what can be fixed, and update the review response if it is resolved.", "Learn from the pattern: repeated complaints show what to improve."),
      table(["Do", "Do not"], ["Apologise for a bad experience where it was one", "Accuse the reviewer of lying"], ["Keep it short and factual", "Write an essay"], ["Invite them to contact you", "Argue in public"], ["Thank them for the feedback", "Delete or hide legitimate reviews where you have the choice to respond"]),
      p("Prospective customers read responses to bad reviews as closely as the reviews themselves."),

      h2("Where the chat assistant fits"),
      ul("It answers 'Do you have good reviews?' with facts from your documents, such as your rating and a link to your profile, if you have loaded them; see [using social proof in chat](/blog/social-proof-reviews-ai-chat).", "It helps visitors who want to leave feedback find the right link.", "It can capture a complaint as a lead for a person to follow up.", "It does not send scheduled review requests, so send those from your email or messaging tools, ideally as part of the follow-up routine in [after the appointment](/blog/post-appointment-nurture-rebooking-sequences)."),
      p("Never let the assistant claim ratings or review counts that are not in your documents, and update them regularly."),

      h2("A simple monthly routine"),
      ul("Count new reviews and the average rating.", "Reply to every review.", "Note themes in praise and complaints.", "Check that the review link still works.", "Set a target for the next month, such as one review request per completed job."),

      h2("Common mistakes"),
      ul("Asking only happy customers.", "Offering incentives.", "Sending a link to the general profile instead of the review box.", "Asking too early or too often.", "Ignoring negative reviews.", "Letting the assistant quote out-of-date ratings."),

      h2("Templates you can adapt"),
      table(["Moment", "Message"], ["Same day, after a visit", "Hi Sam, thanks for coming in today. If you enjoyed your visit, a quick review would help others find us: [link]. Thank you!"], ["A week later, one reminder", "Hi Sam, just a gentle reminder in case you had a moment to share your experience: [link]. No worries if not."], ["To someone who had a problem", "Hi Sam, we are sorry your visit was not what you hoped. We would like to put it right. Could you reply or call us on 0123 456 789?"]),
      p("The last template matters: a customer who is unhappy and can reach you directly is far more likely to give you a chance to fix things than to write a public complaint."),

      h2("Use reviews inside your own content"),
      ul("Quote a few specific reviews, with permission, on your service pages.", "Ask the assistant's documents to include your rating and review count, with the date they were last updated.", "Share praise with the team; it helps morale.", "Turn frequent complaints into fixes."),

      h2("Frequently asked questions"),
      faq(
        ["How do I ask customers for reviews without being pushy?", "Ask once, shortly after a good experience, with a personal thanks, a direct link and no pressure. One polite reminder is enough."],
        ["Can I offer a discount for a review?", "No. Most platforms forbid incentives for reviews, and doing so can breach consumer law."],
        ["Should I only ask happy customers?", "No. Ask everyone; selective asking is against many platform rules and can be illegal."],
        ["Can Crescelo send review requests?", "No. It answers questions and books appointments; send requests from your own email or messaging tools."],
        ["How should I respond to a bad review?", "Thank them, apologise where warranted, offer to resolve it offline and never argue in public."],
        ["How many reviews do I need?", "There is no fixed number, but steady, recent, specific reviews matter more than a burst followed by silence."],
      ),
      p("See the [AI assistant feature](/product/ai-assistant) and [pricing](/pricing), and read [chat analytics for service businesses](/blog/service-business-chat-analytics-playbook)."),
    ],
  }),
];
