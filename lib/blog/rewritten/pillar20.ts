import { faq, h2, h3, note, ol, p, pillar, table, ul } from '../authoring';

export const PILLAR20 = [
  pillar({
    slug: 'why-contact-us-forms-fail',
    title: 'Why Contact Forms Fail Service Businesses (and What to Do Instead)',
    description: 'The reasons contact forms lose enquiries: slow replies, unanswered questions, friction and trust gaps, with fixes such as shorter forms, instant answers, chat and booking.',
    primaryKeyword: 'why contact us forms fail',
    secondaryKeywords: ['contact form conversion', 'website enquiry form problems', 'improve contact page', 'replace contact form with chat'],
    body: [
      p("The contact form is the default answer to 'how do people reach us?' It is easy to build, familiar to visitors and feels safe to the business. Yet for many service businesses, the contact form is where enquiries go to die. Visitors fill in a form, hear nothing for a day and book somewhere else. Others start and abandon it because it asks too much. Many never try because they have a question the form cannot answer. This guide explains the specific reasons contact forms fail, how to measure how yours is doing, which fixes cost almost nothing and how to combine a form with chat and booking so that the visitor who wants an answer gets one and the visitor who prefers a form still has it. It is not an argument to delete your form, but to stop treating it as your only front door."),

      h2("The seven ways forms fail"),
      table(["Failure", "What the visitor experiences"], ["Slow reply", "'We will get back to you within 1 to 2 business days' while a competitor answers in minutes"], ["Unanswered question", "They want to know a price or whether you cover their area; the form asks for a message and gives nothing back"], ["Too many fields", "Six or eight boxes for a first contact; some give up"], ["No reassurance", "No indication of what happens next, or who will contact them"], ["Poor mobile experience", "Tiny fields, awkward keyboards, no autofill"], ["Errors and spam checks", "A CAPTCHA fails, a field rejects their phone format, the message vanishes"], ["Broken delivery", "The form submits but the email lands in spam or nobody reads it"]),
      p("Any one of these can lose an enquiry. Together they explain why a site with plenty of traffic can produce few leads."),

      h2("Speed is the biggest one"),
      p("Someone who fills in a form is in the middle of a decision. They may have sent the same message to two or three businesses. Research on online lead response, including a widely cited Harvard Business Review analysis from 2011, points in the same direction: businesses that responded within about an hour were far more likely to reach a qualified conversation than those that waited longer, and most responded slowly or not at all. Exact figures vary, but the direction is clear. A form that promises a reply 'within two business days' has already lost a share of its enquiries. See [speed to lead for service businesses](/blog/speed-to-lead-service-businesses)."),

      h2("The unanswered question problem"),
      p("Many visitors do not want to send a message to a stranger; they want a fact. How much does it cost? Are you open Saturday? Do you cover my postcode? Can I bring my child? A form gives them nowhere to get that fact without committing to a conversation. Those visitors leave, and you never know they were there. This is where a chat that answers from your own documents helps most: it answers the small question instantly, and the visitor decides for themselves whether to go further."),

      h2("Measure your form"),
      ol("Count visits to the contact page and submissions per month: that is your form conversion rate.", "Compare with the traffic to pricing and services pages, which indicate intent.", "Check how quickly enquiries are answered: median and slowest.", "Test the form yourself on a phone, with a real email, and see what happens.", "Check that notification emails arrive and are not in spam.", "Ask new customers how they contacted you and what nearly stopped them."),
      table(["Metric", "Warning sign"], ["Form conversion below one or two percent of contact page visits", "Friction or lack of trust"], ["Median reply time over a few hours", "Speed problem"], ["Many started but not completed", "Too many fields or errors"], ["Submissions with junk or spam", "Missing protection or bad targeting"]),

      h2("Free fixes for the form itself"),
      ul("**Cut the fields.** Name, a way to reach them and a message is usually enough. Ask for the rest later.", "**Say what happens next.** 'We reply within one working hour' or 'Priya will call you today.' Only promise what you deliver.", "**Show your phone number** and hours next to the form for people who prefer to call.", "**Make it work on mobile:** large fields, autofill and the right keyboard types.", "**Reduce CAPTCHA friction,** using invisible checks where possible.", "**Confirm submission** on screen and by email, with a copy of what they sent.", "**Route notifications to a monitored inbox** and to a phone."),
      p("These changes take an afternoon and often lift completed enquiries noticeably."),

      h2("What to add: instant answers and booking"),
      p("The bigger step is to give visitors a faster path than a form. A chat assistant that answers common questions from your documents, at any hour, and offers a booking or a callback in the same conversation removes the wait. Visitors who want only an answer get it. Visitors who are ready to act can book. Those who want a person can ask for one. A form can remain for visitors who prefer it. Crescelo does exactly this: it answers from your content, books appointments with real free times, captures leads with instant alerts and hands over to your team. See [conversational lead capture](/blog/conversational-lead-capture) and [AI appointment booking](/blog/ai-appointment-booking)."),
      table(["Visitor", "Best path"], ["Wants a quick fact", "Chat answer"], ["Ready to book", "Booking in chat or on a page"], ["Wants a person", "Callback request or handover"], ["Prefers to write", "Short contact form"], ["Is outside opening hours", "Chat and booking, with a morning follow-up"]),

      h2("Make every route land in one place"),
      p("More routes are only useful if you can see them together. Send form submissions, chat leads and bookings to the same inbox or CRM, tagged by source. Then you can see which route produces customers, and nobody has to check three places. See [how to send chatbot leads to your CRM](/blog/crm-integration-ai-chatbot-leads) and [attribution for chat leads](/blog/attribution-modeling-marketing-channels-chat-leads)."),

      h2("Follow-up is part of the form"),
      ul("Reply fast, and by the channel the visitor chose.", "Answer the question they asked, not a template.", "Offer a next step: a time, a quote or a call.", "Follow up once if there is no reply, then stop.", "Record outcomes, so you know which enquiries convert."),

      h2("Worked example: a plumbing company's contact page"),
      p("A plumbing company had a six-field form that promised a reply 'within one business day'. It received about twelve enquiries a month from around 900 contact page visits. The owner cut the form to three fields, added a tap-to-call button, promised a reply within two hours and set up a text alert. She also added a chat that answered coverage and callout questions. Enquiries rose to twenty-six a month, and about a third came through the chat outside office hours. Response time fell from most of a day to under an hour. The improvement did not come from a clever design; it came from fewer fields, faster answers and more ways to reach the business."),
      table(["Item", "Before (illustrative)", "After"], ["Monthly enquiries", "12", "26"], ["Form fields", "6", "3"], ["Median reply time", "Most of a day", "Under an hour"], ["Enquiries outside office hours", "Waited until morning", "Answered instantly"]),

      h2("A quick redesign checklist"),
      ul("Three fields at most for a first contact.", "Phone number and hours visible.", "A clear promise about reply time that you meet.", "A chat or booking option next to the form.", "Notifications tested and monitored.", "Everything tagged by source."),

      h2("Frequently asked questions"),
      faq(
        ["Why do contact forms have such low conversion?", "Because they ask visitors to commit before they get anything back, respond slowly and do not answer the questions that stop people."],
        ["Should I remove my contact form?", "Not necessarily. Keep it for people who prefer it, and add faster options such as chat and booking."],
        ["How many fields should a contact form have?", "Usually three: name, a way to reach them and a message."],
        ["How fast should I reply to a form enquiry?", "As fast as you can; aim for minutes to an hour in business hours, and an instant automated helpful reply outside them."],
        ["Does a chatbot replace a contact form?", "It can handle many enquiries better, but many businesses keep both, with all leads going to one place."],
        ["How do I know my form is failing?", "Measure form conversion, reply times and abandonment, and test it on a phone."],
      ),
      p("See the [lead capture feature](/product/lead-capture), try an enquiry conversation in the [playground](/playground) and read [speed to lead](/blog/speed-to-lead-service-businesses)."),
    ],
  }),

  pillar({
    slug: 'chatbot-lead-capture-gdpr-ccpa-compliance',
    title: 'Chatbot Lead Capture and Privacy Law: GDPR and CCPA Basics for Small Businesses',
    description: 'What the GDPR and CCPA mean for chatbot lead capture: lawful basis, notices, consent, minimising data, retention, rights requests, marketing opt-ins and a practical checklist.',
    primaryKeyword: 'GDPR CCPA chatbot lead capture',
    secondaryKeywords: ['chatbot consent lead capture', 'collect email in chatbot legally', 'CCPA chatbot notice', 'privacy law lead generation chat'],
    body: [
      p("A chatbot that captures leads collects personal data: names, phone numbers, email addresses and whatever the visitor types about their problem. If any of your visitors live in the European Union, the United Kingdom or California, privacy laws such as the GDPR and the CCPA apply, whatever the size of your business or where it is located. The rules are not designed to stop you collecting leads. They are designed to make sure you tell people what you are doing, collect only what you need, use it for stated reasons and give people control. A chat that does these things is also a better chat: visitors trust it more. This guide covers the essentials for lead capture in plain language: what counts as personal data, the legal basis for collecting it, what to say in the chat, how consent works for marketing, how long to keep data, how to handle requests and a practical checklist."),
      note("This is general information, not legal advice. Privacy law is detailed and depends on your facts, your location and your visitors' locations. Read the official guidance and ask a qualified adviser about your situation."),

      h2("What counts as personal data in a lead"),
      ul("Name, email address and phone number.", "IP address and device information.", "The content of the conversation, if it identifies a person.", "Location, if collected.", "A visitor identifier stored in the browser.", "Booking details and preferences."),
      p("Even a first name and an email address are personal data. Treat all of it with care."),

      h2("The basics of GDPR for lead capture"),
      table(["Principle", "In practice"], ["Lawful basis", "Have a legal reason: legitimate interests, contract steps or consent"], ["Transparency", "Tell people what you collect, why, who processes it and how long you keep it"], ["Purpose limitation", "Use the data for the reason you gave, not something else"], ["Data minimisation", "Collect only what you need"], ["Storage limitation", "Delete data when you no longer need it"], ["Security", "Protect it appropriately"], ["Rights", "Let people see, correct and delete their data"]),
      p("For most service business chats, replying to an enquiry and arranging a booking rest on legitimate interests or taking steps at the visitor's request, while marketing emails need separate consent. See the [GDPR checklist for website chatbots](/blog/website-chatbot-gdpr-checklist) for the full list."),

      h2("The basics of CCPA and similar US laws"),
      ul("California's law gives residents the right to know what is collected, to delete it, to correct it and to opt out of its sale or sharing.", "It applies to businesses meeting certain size or data thresholds, so many small businesses are out of scope, but state laws are spreading.", "It requires a privacy notice at or before collection and a clear way to make requests.", "It restricts selling or sharing personal information and requires honouring opt-outs.", "It has specific rules for children's data and sensitive data."),
      p("If you serve US visitors, check which state laws apply to you, and keep your notice accurate. Do not sell or share chat data for advertising unless you have handled the requirements."),

      h2("What to say in the chat"),
      ol("Say it is an AI assistant.", "Say what you collect and why, in one sentence, and link to your privacy policy.", "Ask for contact details only when relevant, and explain the purpose: 'What is the best number for the team to confirm your booking?'", "Do not add anyone to marketing lists by default.", "Offer a way to reach a person."),
      p("Example notice below the input: 'AI assistant. Conversations are stored to answer you and arrange bookings. Privacy policy.' Keep it short and visible."),

      h2("Consent for marketing"),
      ul("Ask separately, with a clear, unticked opt-in: 'Tick to receive occasional tips and offers. You can unsubscribe at any time.'", "Do not bundle it with booking or the chat itself.", "Record when and how consent was given.", "Make unsubscribing as easy as subscribing.", "Do not email people who only asked a question and did not opt in."),
      p("This matters in practice: many complaints about unsolicited email start with chat data used for marketing without consent."),

      h2("Minimise what you collect"),
      table(["Need", "What is enough"], ["Reply to an enquiry", "Name and a way to reach them"], ["Book an appointment", "Name, contact method, service and time"], ["Send a quote", "Contact method and the job details"], ["Qualify a lead", "A few relevant answers, not a life history"]),
      p("Discourage sensitive information: health, finances, identifiers. Add a line asking visitors not to share them in the chat."),

      h2("Retention: how long to keep it"),
      ul("Keep leads only as long as they are useful: for example, a set period after the last contact.", "Delete conversations you do not need, and leads that went nowhere.", "Keep records the law requires, such as invoices, in the right place.", "Write your retention period in your privacy policy.", "Use the tools to delete: Crescelo lets you delete leads, appointments and knowledge sources from the dashboard, and you can ask for everything to be deleted through a support ticket."),

      h2("Handling requests from visitors"),
      ol("Provide a contact route in your privacy policy.", "Verify the person's identity before sharing or deleting data.", "Find their data across your chat, email and CRM.", "Reply within the legal time, generally one month for the GDPR.", "Record the request and what you did."),
      p("A simple written procedure, and a named person, make this manageable."),

      h2("Vendors and where data goes"),
      ul("Your chatbot vendor, AI provider, email service and CRM may all process the data.", "Have data processing agreements in place; Crescelo publishes a [data processing addendum](/dpa) and a list of [sub-processors](/subprocessors).", "Ask where data is stored and whether it leaves the UK or EU.", "With a bring-your-own-key setup, you choose the AI provider, so read its business terms.", "List processors in your privacy policy."),

      h2("Cookies and browser storage"),
      p("A chat widget may store an identifier in the visitor's browser so a conversation continues. Describe this in your cookie policy and check whether consent is needed where you operate. Analytics and advertising scripts generally need consent. See our [cookie policy](/cookies) for how we describe ours."),

      h2("A practical checklist"),
      ul("Data map of what the chat collects and where it goes.", "Lawful basis noted for each purpose.", "AI disclosure and privacy notice visible in the chat.", "Marketing consent separate and unticked.", "Minimal fields; warning against sensitive details.", "Retention period set and deletion possible.", "Requests procedure and a contact route.", "Processor agreements and sub-processor list.", "Cookie policy matches the widget.", "Annual review."),

      h2("Where to go next"),
      p("The product pages explain the tools behind these practices: [lead capture](/product/lead-capture) covers where leads go, and the [AI assistant](/product/ai-assistant) page explains how answers come only from your content. Together with a clear privacy notice, they let you capture leads without collecting more than you should."),

      h2("Related guides"),
      ul("[Capturing phone and email in chat](/blog/capture-phone-email-in-chat) covers timing and wording.", "[Why contact forms fail](/blog/why-contact-us-forms-fail) explains what chat can do better.", "[Speed to lead](/blog/speed-to-lead-service-businesses) shows why fast follow-up matters."),

      h2("Frequently asked questions"),
      faq(
        ["Do GDPR and CCPA apply to my chatbot?", "If you collect personal data from people in the EU, UK or California, yes, in most cases, wherever your business is based, subject to thresholds for the CCPA."],
        ["Do I need consent to capture a lead in chat?", "Not always. Replying to an enquiry can rest on legitimate interests or steps requested by the visitor. Marketing needs separate consent."],
        ["Can I add chat leads to my newsletter?", "Only with a clear, separate opt-in."],
        ["What should I tell visitors?", "That it is an AI, what you collect and why, and where to read your privacy policy."],
        ["How long can I keep chat leads?", "As long as needed for a defined purpose, then delete. Set a retention period."],
        ["How do I handle a deletion request?", "Verify identity, find and delete the data across your systems, reply within the time limit and record what you did."],
      ),
      p("See [conversational lead capture](/blog/conversational-lead-capture) for design, read our [privacy policy](/privacy) and try a lead conversation in the [playground](/playground)."),
    ],
  }),

  pillar({
    slug: 'capture-phone-email-in-chat',
    title: 'How to Ask for a Phone Number or Email in Chat Without Scaring Visitors Away',
    description: 'When and how a chatbot should ask for contact details: timing, wording, choosing phone or email, validation, refusals, consent and what to do with the data.',
    primaryKeyword: 'capture contact info in chatbot',
    secondaryKeywords: ['ask for email in chat', 'chatbot phone number request', 'lead capture wording chat', 'get contact details from website visitors'],
    body: [
      p("The moment a chatbot asks for contact details is the most delicate in the conversation. Ask too early and the visitor feels interrogated. Ask too late and they have already left. Ask clumsily and they type a fake number, close the window or lose trust. Yet capturing a contact detail is what turns a chat into a lead, and getting it right is a matter of timing, wording and honesty more than technology. This guide explains when to ask, what to say, whether to ask for a phone number or an email, how to handle refusals, how to validate what visitors give you, what consent you need and what to do with the details once you have them."),

      h2("The golden rule: give first, ask second"),
      p("People share details when they see a reason to. The assistant should answer the question first, then offer a next step that needs contact details: a booking, a quote, a callback, a guide by email. The request feels natural when it is the price of something the visitor wants."),
      table(["Order", "Feels like"], ["Ask for name and email before answering anything", "A toll gate"], ["Answer, then offer a callback and ask for a number", "Service"], ["Answer, offer to send the price list by email, ask for an email", "A fair exchange"]),

      h2("Choose the right detail"),
      table(["Detail", "Best when", "Watch for"], ["Phone number", "Urgent or high-value enquiries; callbacks", "Some visitors do not want calls; consent and hours"], ["Email address", "Sending information, quotes or confirmations", "Slower response; spam filters"], ["Name only", "Conversation continuity", "Not enough to follow up"], ["Preferred contact method", "Any enquiry", "Respecting the choice"]),
      p("Ask what the visitor prefers when you can: 'Would you like a call or an email?' Then ask only for that."),

      h2("When to ask"),
      ul("When the visitor asks for a callback, a quote, availability or a booking.", "When the conversation cannot be finished in chat and needs a person.", "When the assistant cannot answer and wants to pass the question on.", "After the visitor has shown interest, such as asking about price twice.", "Before the visitor leaves, if they have shown intent and there is a natural pause."),
      p("Do not ask in the first message or before the visitor has received any value."),

      h2("Wording that works"),
      table(["Weak", "Better"], ["Enter your email.", "I can email you the price list and a link to book. What is the best address?"], ["Phone number required.", "Would you like a call back today? What number should the team use?"], ["Please provide contact details.", "So the team can confirm this, what is the best number or email to reach you?"], ["Submit your details to continue.", "I can hold that time for you. What name should I put it under?"]),
      ul("Say what the detail is for.", "Keep the ask short.", "Offer a choice of channel.", "Say what happens next: 'Priya will call you within the hour.'", "Thank them, and repeat the detail back for confirmation."),

      h2("Handle refusals gracefully"),
      p("Some visitors will decline. Accept it and keep helping. 'No problem, you can also book yourself here, or call us on this number.' A visitor who refuses today may come back tomorrow, and pushing loses them. Offer an alternative route that needs no details: a booking link, a phone number and hours."),

      h2("Validate without annoying"),
      ul("Check that an email looks like an email and a number has the right number of digits, and ask kindly to correct it.", "Accept common formats for phone numbers, with or without spaces and country codes.", "Do not reject unusual but valid addresses.", "Confirm by reading it back: 'That is sam@example.com, correct?'", "For bookings, send a confirmation email; a bounce tells you it was wrong."),
      p("Fake details usually mean the visitor did not see a reason to share. Improve the reason, not the validation."),

      h2("Consent and honesty"),
      ul("Tell visitors they are talking to an AI and link to your privacy policy.", "Say how you will use the detail.", "Do not add people to marketing lists without a separate, clear opt-in.", "For calls or texts, respect the rules on consent where you operate.", "Delete details you do not need."),
      p("See [chatbot lead capture and privacy law](/blog/chatbot-lead-capture-gdpr-ccpa-compliance) and the [GDPR checklist for website chatbots](/blog/website-chatbot-gdpr-checklist)."),

      h2("What to do with the details"),
      ol("Deliver the lead instantly to the person who will follow up, with the conversation attached.", "Reply within the time you promised.", "Record the source and outcome.", "Keep it secure and delete it when it is no longer needed."),
      p("Crescelo sends leads to your email with instant alerts, and can deliver them to Slack, Google Sheets or webhooks. See the [lead capture feature](/product/lead-capture) and [instant lead routing in chat](/blog/instant-lead-routing-chat)."),

      h2("A sample conversation"),
      table(["Speaker", "Message"], ["Visitor", "How much does a deep clean of a three-bed house cost?"], ["Assistant", "A deep clean of a three-bedroom house is usually $220 to $290 depending on size and condition, and takes about four hours. Would you like a firm quote? I can have someone call you today, or email you a link to book. Which do you prefer?"], ["Visitor", "Email is fine."], ["Assistant", "Great. What is the best email? I will send the price details and a booking link."], ["Visitor", "sam@example.com"], ["Assistant", "Thanks, Sam. I have sent it to sam@example.com, so please check your inbox. If you would rather talk, our number is on the page."]),

      h2("Worked example: a cleaning company"),
      p("A cleaning company's chat asked for name, phone and email in its first message. Most visitors left, and about one in five gave a number that turned out to be wrong. The owner changed the flow: answer first, then offer a quote by email or a call, and ask for only the chosen detail. Chats that ended with contact details rose from about one in ten to about one in four, and wrong details became rare. The same visitors were asked less, and gave more."),
      table(["Change", "Result (illustrative)"], ["Ask after answering", "More visitors continue"], ["Offer a choice of channel", "Higher completion"], ["Ask for one detail", "Fewer fake details"], ["Say what happens next", "More trust"]),

      h2("Common mistakes"),
      ul("Asking in the first message.", "Asking for phone and email and name at once.", "Requiring details to get a price.", "Not saying what will happen next.", "Never following up on leads.", "Adding contacts to newsletters without consent."),

      h2("Frequently asked questions"),
      faq(
        ["When should a chatbot ask for an email or phone number?", "After it has answered the question and when a next step needs a contact detail, such as a callback, a quote or a booking."],
        ["Should I ask for phone or email?", "Ask which the visitor prefers. Phone suits urgent or high-value enquiries; email suits information and quotes."],
        ["What if the visitor refuses?", "Accept it and offer a route that needs no details, such as a booking link or your phone number."],
        ["How do I stop fake details?", "Give a clear reason for asking and ask for one detail, and confirm by reading it back or sending a confirmation email."],
        ["Do I need consent to collect a contact detail?", "You need a lawful basis and transparency. Marketing needs a separate opt-in."],
        ["Where do the details go?", "To your inbox, and with Crescelo optionally to Slack, Google Sheets or a webhook."],
      ),
      p("Try a contact capture in the [playground](/playground), read [conversational lead capture](/blog/conversational-lead-capture) and [start a free trial](/login?mode=register)."),
    ],
  }),

  pillar({
    slug: 'hosted-business-pages-lead-generation',
    title: 'Hosted Business Pages With Chat: A Landing Page for Social Links, QR Codes and Profiles',
    description: 'How a hosted business page with an AI assistant works for lead generation: where to use it, what to put on it, links from social bios, QR codes and profiles, and how to measure it.',
    primaryKeyword: 'hosted business landing page AI chat',
    secondaryKeywords: ['link in bio chatbot page', 'QR code chatbot landing page', 'business page with chat and booking', 'social media booking page'],
    body: [
      p("Not every visitor arrives through your website. They tap the link in your Instagram bio, scan a QR code on a flyer, click the website button on your Google profile or follow a link in an email signature. Where you send them matters. A cluttered home page, a slow site or a page with no clear next step loses people at the most valuable moment: they have just shown interest. A hosted business page, a simple page built around your assistant, gives those visitors a fast, focused place to ask questions and book. This guide explains what a hosted page is, where to use it, what to put on it, how to set it up well, how to promote the link and how to measure whether it brings leads. Crescelo includes hosted business pages, with limits depending on your plan."),

      h2("What a hosted business page is"),
      p("A hosted page is a standalone web page, on Crescelo's domain or yours, that presents your business and your assistant. Visitors can read a short introduction, ask questions in the chat, book a time and contact you, without needing your full website. You share its link wherever you want people to land. It is not a replacement for a website; it is a focused doorway."),
      table(["Use", "Why a hosted page helps"], ["Instagram or TikTok bio link", "Followers get answers and a booking option in one tap"], ["Google Business Profile", "Local searchers find prices, hours and booking without hunting"], ["QR codes on flyers, windows and receipts", "Scanning opens a page designed for phones"], ["Email signatures and messages", "A direct route to ask a question or book"], ["Ads and campaigns", "A page that matches the ad's promise"], ["Businesses without a website", "A working online presence quickly"]),

      h2("Why it can convert better than a home page"),
      ul("**Focus:** one purpose, ask and book.", "**Speed:** a light page loads fast on mobile data.", "**Relevance:** it can be written for the source of the visitor.", "**Fewer distractions:** no menu with twenty links.", "**Immediate answers:** the assistant is the main feature, not a corner widget."),
      p("A visitor from a social link often has one question. A page that answers it in seconds beats one that makes them search."),

      h2("What to put on the page"),
      ol("**A clear headline:** what you do and where, in a line.", "**A short introduction:** two or three sentences with your strongest point.", "**The assistant:** prominent, with a greeting that invites a specific question.", "**Key facts:** hours, area, phone number and address.", "**Proof:** a few real reviews or credentials you can support.", "**A booking or contact action:** obvious and reachable with a thumb."),
      p("Keep it short. If a visitor has to scroll for the main action, cut something."),

      h2("Write for the source"),
      table(["Source", "Page emphasis"], ["Social bio", "Personality, services and a quick booking route"], ["Google profile", "Hours, area, prices and a call button"], ["QR code on a flyer", "The offer on the flyer, and how to claim it"], ["Email signature", "Simple contact and booking"], ["A specific ad", "The same promise and price as the ad"]),
      p("You may want a separate page for each source, if your plan allows several. Crescelo's plans include hosted pages: one on Starter, three on Growth and seven on the Agency plan."),

      h2("Prepare the assistant for that traffic"),
      ul("Load the documents visitors from that source will ask about: prices, offers, hours, area.", "Write a greeting that fits: 'Thanks for stopping by from Instagram. Ask about prices or book a time.'", "Test ten realistic questions on a phone.", "Set alerts so leads reach you instantly.", "Make sure the booking flow works on mobile."),
      p("See [the questions every service business chatbot should answer well](/blog/essential-chatbot-questions-service-business) and [chatbot welcome message copywriting](/blog/chatbot-welcome-message-copywriting)."),

      h2("Promote the link"),
      ul("Put it in your social bios and pinned posts.", "Add it to your Google Business Profile as the website or booking link, with a UTM tag.", "Create a QR code for printed materials and premises.", "Add it to email signatures, invoices and receipts.", "Share it in direct messages when someone asks a question."),
      p("See [converting Google Business Profile traffic in chat](/blog/convert-google-business-traffic-chat) and [booking from your social bio link](/blog/social-bio-link-in-chat-booking)."),

      h2("Measure it"),
      table(["Metric", "Where"], ["Visits by source", "Analytics with UTM tags, or the page's own statistics"], ["Chats started and bookings made", "Chat and booking reports"], ["Leads captured", "Your inbox or CRM"], ["Time from click to booking", "Chat records"], ["Which questions people ask", "Chat history, to improve the page and documents"]),
      p("Tag each link with its source so you can see where bookings come from. See [tracking chatbot conversions](/blog/integrate-chat-events-ga4-meta-pixel)."),

      h2("Worked example: a mobile hairdresser"),
      p("A mobile hairdresser had no website, only an Instagram account. She created a hosted page with her assistant, loaded her price list, service area and cancellation policy, and put the link in her bio. Followers who asked 'do you come to me?' and 'how much for a cut and colour?' got answers at once and could book. Over two months she took forty bookings from the page, about half of them after 9 p.m., and stopped replying to repetitive direct messages. The page took an evening to set up."),

      h2("Keeping the page fresh"),
      p("A hosted page is only as good as its content. Review it monthly: are the hours, prices and offers correct, is the greeting still right for the season, do the reviews shown still reflect current service? Update the assistant's documents on the same day as the page. Check the page on a phone after any change, and test the booking flow once a month. A page that promised a summer offer in November is worse than no page."),

      h2("Common mistakes"),
      ul("Putting too much on the page.", "Linking to it without a source tag, so you cannot measure it.", "Loading the assistant with website content that does not match the page's purpose.", "Forgetting to test on a phone.", "Letting details go out of date.", "Sending traffic to the home page and the hosted page inconsistently, so you cannot compare."),

      h2("How the page and your main site fit together"),
      p("Treat the hosted page as a spoke, not a replacement for your website. Link to it from where visitors need a quick answer, and link from it to your full site for people who want more. Keep hours, prices and policies identical in both, and update them together. If you later build a bigger site, the same assistant can serve both, so answers stay consistent wherever a visitor arrives."),

      h2("Frequently asked questions"),
      faq(
        ["What is a hosted business page?", "A standalone page presenting your business and your assistant, which you share by link or QR code."],
        ["Do I need a website to use one?", "No. It can serve as a simple online presence, and it also works alongside a full website."],
        ["How many hosted pages can I have in Crescelo?", "One on Starter, three on Growth and seven on the Agency plan."],
        ["Where should I share the link?", "Social bios, your Google Business Profile, QR codes, email signatures and messages."],
        ["How do I know it works?", "Tag links by source, and track chats, bookings and leads from the page."],
        ["Can it take bookings?", "Yes, through the assistant's booking on plans that include it."],
      ),
      p("See the [website widget feature](/product/website-widget), try the assistant in the [playground](/playground) and [start a free trial](/login?mode=register)."),
    ],
  }),

  pillar({
    slug: 'ab-test-chatbot-starter-prompts',
    title: 'A/B Testing Chatbot Greetings and Starter Prompts: A Practical Method for Small Sites',
    description: 'How to test different chatbot greetings and starter prompts on a small site: what to change, how long to run, what to measure, sample sizes, pitfalls and a simple test log.',
    primaryKeyword: 'A/B test chatbot greeting',
    secondaryKeywords: ['chatbot starter prompts', 'test chat widget message', 'improve chat open rate', 'conversion testing small business'],
    body: [
      p("The greeting and the starter buttons of your chatbot decide whether visitors start a conversation at all. Small changes, more specific wording, a different first question or a rearranged button, can move the share of visitors who open the chat. But guessing what works is unreliable, and testing properly on a small website is harder than the tools suggest: traffic is low, results are noisy and it is easy to mistake luck for a win. This guide gives a practical method for small sites: what to test first, how to run a fair comparison with or without special software, how long to run it, what to measure, how to avoid common traps and how to keep a simple log so that your learning accumulates. It also explains what Crescelo does and does not offer for testing, so you plan around it."),

      h2("What is worth testing"),
      table(["Element", "Example change", "Likely effect"], ["Greeting text", "Generic 'How can I help?' versus a specific offer", "Chat open and reply rate"], ["First question or prompt", "'Ask about prices' versus 'Book a time'", "Direction of the conversation"], ["Starter buttons", "Two options versus four", "Reply rate"], ["Timing", "Bubble after 10 seconds versus 30", "Open rate and annoyance"], ["Placement or label", "Icon versus 'Ask or book'", "Discoverability"], ["Tone", "Formal versus friendly", "Reply rate and satisfaction"]),
      p("Test the biggest lever first: the greeting's clarity about what the assistant can do. Small wording tweaks come later."),

      h2("Decide what success means"),
      ul("**Chat open rate:** chats opened divided by visitors who saw the launcher.", "**Reply rate:** visitors who send a message divided by those who opened.", "**Booking or lead rate:** conversions per 100 visitors.", "**Quality:** are the conversations useful?"),
      p("The final measure is bookings and leads per visitor. A greeting that gets more opens but fewer bookings is not a winner."),

      h2("Two ways to test"),
      table(["Method", "How", "Pros", "Cons"], ["Split test", "Show version A to half the visitors and B to the other half at the same time", "Fair; controls for seasonality", "Needs a tool or code that can split visitors"], ["Before and after", "Run version A for a period, then version B", "Simple; needs no special tool", "Affected by seasonality and other changes"]),
      p("Crescelo does not include a built-in A/B testing tool, so on a small site the practical method is before and after, done carefully: change one thing, keep everything else stable and compare periods of equal length. If you have a developer or use a testing tool that can show different greetings to different visitors, a split test is better."),

      h2("Run a fair before-and-after test"),
      ol("Write your hypothesis: 'A specific greeting will raise the share of visitors who reply.'", "Record the baseline for two to four weeks: visitors, chat opens, replies and bookings.", "Change one thing only.", "Run for the same length of time, ideally covering the same days of the week.", "Compare the same metrics.", "Check that traffic sources and promotions were similar in both periods.", "Decide, record and move on to the next test."),
      ul("Avoid testing during a holiday or campaign that changes traffic.", "Do not change the site, offers or prices at the same time.", "Keep the assistant's content stable."),

      h2("How much data is enough"),
      p("On a small site, a few dozen chat opens tell you very little. Random variation can produce a difference of several percentage points with no real cause. A rough rule: do not decide on fewer than a couple of hundred visitors per version, and treat small differences with suspicion. If your traffic is very low, test big changes only, because only big changes are visible, and rely on judgement plus reading conversations to refine the rest."),
      table(["Traffic per version", "What you can conclude"], ["Under 100 visitors", "Almost nothing; use as a hunch"], ["100 to 500", "Only large differences are meaningful"], ["500 to 2,000", "Moderate differences may be real"], ["Over 2,000", "Smaller differences become visible"]),

      h2("Ideas for greetings and prompts"),
      ul("Lead with a specific outcome: 'Ask about prices or book a time in one minute.'", "Ask a concrete question: 'Looking for a haircut, colour or a beard trim?'", "Offer options as buttons: 'See prices', 'Book a time', 'Ask a question'.", "Mention out-of-hours availability: 'The team is offline, but I can help now.'", "Match the page: a pricing-page greeting versus a home-page greeting."),
      p("See [chatbot welcome message copywriting](/blog/chatbot-welcome-message-copywriting) for thirty examples and [micro-copy for quick replies](/blog/micro-copy-quick-reply-buttons-conversational-prompts)."),

      h2("Read the conversations too"),
      p("Numbers tell you what happened; conversations tell you why. After each test, read a sample of chats that started from each version. Did a greeting attract questions that the assistant could not answer? Did one bring in more off-topic messages? A version that gets fewer but better conversations may be the real winner."),

      h2("A simple test log"),
      table(["Date", "Change", "Hypothesis", "Baseline", "Result", "Decision"], ["1 June", "Greeting: specific offer", "Raises reply rate", "Reply rate 9%", "Reply rate 13%", "Keep"], ["1 July", "Bubble delay 10s to 30s", "Fewer dismissals", "Dismissals 40%", "Dismissals 31%", "Keep"], ["1 August", "Four buttons to two", "Raises replies", "13%", "12%", "No change; revert"]),
      p("A log turns scattered experiments into knowledge. Review it each quarter."),

      h2("Pitfalls"),
      ul("Changing several things at once.", "Stopping the test when the first numbers look good.", "Ignoring seasonality.", "Testing tiny changes on tiny traffic.", "Optimising open rate while bookings fall.", "Forgetting to record what you learned."),

      h2("Worked example: a salon tests two greetings"),
      p("A salon's chat greeted visitors with 'Hi, how can I help you today?' Over four weeks, 1,200 visitors saw the launcher, 96 opened the chat and 41 sent a message. The owner changed the greeting to 'Ask about prices or book a time in one minute' and added two buttons, 'See prices' and 'Book a time'. Over the next four weeks, with similar traffic and no other changes, 1,180 visitors saw the launcher, 128 opened the chat and 74 sent a message, and bookings from chat rose from six to eleven. The sample is small, so the owner treated the result as encouraging, not proven, kept the new greeting and planned to check again after the school holidays. The habit that mattered was recording the baseline before changing anything."),
      table(["Version", "Visitors", "Chats opened", "Replies", "Bookings from chat"], ["Original greeting", "1,200", "96", "41", "6"], ["Specific greeting with buttons", "1,180", "128", "74", "11"]),

      h2("Frequently asked questions"),
      faq(
        ["Can I A/B test my chatbot greeting?", "Yes, with a tool that splits visitors, or with a careful before-and-after comparison. Crescelo does not have a built-in split test."],
        ["How long should a test run?", "Long enough to collect a few hundred visitors per version and to cover a full week or two of traffic patterns."],
        ["What should I measure?", "Chat open rate, reply rate and bookings or leads per visitor, plus a read of the conversations."],
        ["What should I test first?", "The greeting's clarity about what the assistant can do."],
        ["Is a small difference meaningful?", "Rarely on a small site. Treat small differences as noise unless you have plenty of data."],
        ["How do I keep track of tests?", "Keep a simple log with the change, hypothesis, baseline, result and decision."],
      ),
      p("Try different greetings in the [playground](/playground), see the [website widget feature](/product/website-widget) and read [how to review your chatbot's conversations](/blog/audit-website-chatbot-conversations)."),
    ],
  }),
];
