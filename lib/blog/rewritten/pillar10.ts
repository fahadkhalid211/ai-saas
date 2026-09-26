import { faq, h2, h3, note, ol, p, pillar, table, ul } from '../authoring';

export const PILLAR10 = [
  pillar({
    slug: 'webhook-automations-zapier-make-chat-events',
    title: 'Chatbot Webhooks and Automation: Connect Chat Events to Zapier, Make and Your Tools',
    description: 'How to use chatbot webhooks with Zapier or Make: which events to send, payload fields, recipes for leads and bookings, signatures, retries and testing.',
    primaryKeyword: 'chatbot webhook Zapier Make',
    secondaryKeywords: ['chatbot automation', 'webhook lead automation', 'Zapier chatbot integration', 'Make.com chatbot workflow'],
    body: [
      p("A chatbot creates events: a new lead, a booking, a request for a person, a conversation that ended. Each of those is a moment when something else should happen: a row in a spreadsheet, a task in your project tool, a message to your team, an email to the customer, a record in a CRM. Webhooks are how the chatbot tells other systems that something happened, and tools such as Zapier and Make turn that signal into action without you writing code. This guide explains webhooks in plain terms, which chat events are worth automating, how to build recipes for leads and bookings, how to keep them secure and how to test them so they do not fail silently."),

      h2("Webhooks in one paragraph"),
      p("A webhook is a message sent automatically from one system to a web address you choose, whenever a chosen event happens. The message is a small package of data, usually in a format called JSON. The receiving system, for example Zapier or Make, listens at that address and starts a workflow when a message arrives. Nothing needs to be checked or polled: the chatbot pushes the news the moment it happens. Crescelo can send outbound webhooks for events such as leads and bookings on the Agency / Scale plan, and signs them so the receiver can verify the source."),

      h2("Which events are worth automating"),
      table(["Event", "Typical automation"], ["New lead captured", "Create a CRM contact, post to Slack, add a spreadsheet row, notify the on-call person"], ["Hot lead (high score)", "Text the owner, create a call task with a deadline"], ["New booking", "Add to a team calendar, send a prep checklist, create a job in your operations tool"], ["Booking cancelled or changed", "Free a resource, notify staff, offer the slot to a waitlist"], ["Handover requested", "Alert a person, open a ticket, assign an owner"], ["Conversation with an unanswered question", "Add to a content to-do list"], ["Negative sentiment or complaint", "Notify a manager for personal follow-up"]),
      p("Start with two or three that save you the most time. A small set of reliable automations beats a large fragile one."),

      h2("What is in the message"),
      p("The payload should carry what the receiver needs and no more. Typical fields:"),
      table(["Field", "Use"], ["Event type and time", "Route by event; log when it happened"], ["Contact name, email, phone", "Create or match a contact"], ["What they asked for", "Populate notes or a task"], ["Conversation link or summary", "Give context"], ["Source page", "Attribution"], ["Booking details", "Date, time and service"], ["Score or label", "Prioritise"], ["Consent", "Whether marketing is allowed"]),
      p("Keep sensitive details out of the payload unless you must send them, and remember every system that receives them becomes part of your privacy responsibilities."),

      h2("Recipe 1: New lead to spreadsheet, Slack and CRM (Zapier)"),
      ol("In Zapier, create a Zap with the trigger 'Webhooks by Zapier' and the event 'Catch Hook'. Copy the web address it gives you.", "Paste the address into the chatbot's webhook settings for the lead event.", "Submit a test lead so Zapier can read the fields.", "Add an action: 'Create or update contact' in your CRM, matching on email.", "Add an action: post a message to a Slack channel with the name, request and conversation link.", "Add an action: append a row to a Google Sheet for reporting.", "Turn the Zap on and submit another test."),

      h2("Recipe 2: Booking to calendar and checklist (Make)"),
      ol("In Make, create a scenario that starts with a 'Custom webhook' module and copy its address.", "Paste it into the chatbot's webhook settings for the booking event and send a test booking.", "Add a module to create an event in your team calendar with the customer name and service.", "Add a module to send the customer a preparation email if you want more than the standard confirmation.", "Add a module to create a task for the person who will serve them.", "Add error handling so a failure sends you an alert."),

      h2("Recipe 3: Handover to a task and alert"),
      ol("Trigger on the handover-requested event.", "Create a task or ticket with the visitor's question and conversation link.", "Assign an owner by rule, such as the person on duty.", "Send a direct message with a link to the conversation.", "Set a reminder if the task is not picked up in ten minutes."),
      p("Handover is where speed matters most; see [live human handover flow design](/blog/live-human-handover-flow-design)."),

      h2("Zapier or Make?"),
      table(["", "Zapier", "Make"], ["Feel", "Simple, linear steps", "Visual scenarios with branching"], ["Best for", "Straightforward 'when this, do that' flows", "Complex flows with routers, loops and data handling"], ["Learning curve", "Gentle", "Steeper but more powerful"], ["Pricing model", "By tasks or actions; check current plans", "By operations; check current plans"]),
      p("Either works with a chatbot webhook. Pick the one your team already knows. Both have free tiers to test with. Check current pricing on their sites."),

      h2("Security"),
      ul("Use HTTPS addresses only.", "Treat the webhook address as a secret: anyone who knows it can send data to it.", "Verify signatures when your tool supports it, so fake messages are rejected.", "Limit who can edit automations, and protect the accounts with two-factor authentication.", "Do not forward personal data to systems you do not need.", "Rotate the address or secret if it is exposed."),
      p("See [setting up team roles and two-factor authentication](/blog/setup-rbac-2fa-team-security) and [SSRF and safe web fetching](/blog/mitigating-ssrf-web-scraper-security) for related safeguards."),

      h2("Reliability: retries, duplicates and failures"),
      ul("**Retries:** a sender may retry if it does not receive a success response, so the same event can arrive twice. Make your automation idempotent: match on a unique ID or email so a repeated message updates instead of duplicating.", "**Failures:** turn on error notifications in your automation tool and read them.", "**Rate limits:** apps have limits; bursts can be delayed.", "**Backups:** keep the email alert on even when automations work, so no lead depends on one route."),

      h2("Testing checklist"),
      ol("Send a test event and confirm it arrives.", "Check the fields map correctly, including empty values.", "Send the same event twice and confirm no duplicate.", "Send an event with special characters and a long message.", "Turn off the destination app and check you receive an error alert.", "Delete test records before going live."),

      h2("A worked example: after-hours lead to morning follow-up"),
      p("A dental clinic gets leads overnight. An automation runs each time the chat captures a lead outside office hours. It creates a contact in the practice's CRM, tags it 'after hours', adds a task for the front desk with the due time set to 9:00 the next morning and posts a short summary into the team channel. When the receptionist arrives, the task list already shows who to call, what they asked and what the assistant told them. Nothing was copied by hand and no lead waited in an inbox nobody opened."),
      table(["Step", "Tool action"], ["Trigger", "Lead created event from the chatbot webhook"], ["Filter", "Only if the time is outside opening hours"], ["Action 1", "Create or update the contact by email"], ["Action 2", "Create a task due at 9:00 next working day"], ["Action 3", "Post a summary in the team channel"]),

      h2("Naming and documenting automations"),
      p("Give each automation a clear name that says what it does, such as 'Chatbot lead to CRM and Slack'. Write a two-line description of the trigger, the actions and the owner. Keep the list in a shared document. When someone leaves or an app changes, you will know what depends on what and what to check."),

      h2("Common mistakes"),
      ul("Building one huge automation instead of small ones that are easy to debug.", "Not handling repeated events.", "Sending more data than the destination needs.", "Forgetting to switch off test automations.", "Having no alert when an automation fails.", "Putting webhook addresses in public documents."),

      h2("When to use a webhook instead of a native integration"),
      p("Native integrations are simple when they exist, but a webhook reaches everything else, which matters as your tools change. If you switch CRM next year, you change the destination in one automation and leave the chatbot untouched. That flexibility is the main reason to prefer webhooks for anything you expect to evolve."),

      h2("Frequently asked questions"),
      faq(
        ["What is a webhook?", "An automatic message a system sends to a web address when something happens, such as a new lead or booking."],
        ["Do I need to code to use webhooks?", "No. Tools such as Zapier and Make receive the webhook and connect it to other apps with a visual builder."],
        ["Does Crescelo support webhooks?", "Yes. Outbound webhooks and CRM pipeline sync are on the Agency / Scale plan, and outgoing webhooks are signed so you can verify them."],
        ["Which events should I automate first?", "New leads and bookings, then handover requests. Start with the ones that save the most time."],
        ["How do I stop duplicates?", "Match on a unique ID or email and use 'create or update' actions."],
        ["Are webhooks secure?", "They can be, if you use HTTPS, keep the address secret, verify signatures and send only what you need."],
      ),
      p("See the [lead capture feature](/product/lead-capture), read [how to send chatbot leads to your CRM](/blog/crm-integration-ai-chatbot-leads) and [start a free trial](/login?mode=register). You can rehearse a lead conversation in the [playground](/playground)."),
    ],
  }),

  pillar({
    slug: 'accessibility-wcag-compliance-website-chatbots',
    title: 'Chatbot Accessibility: WCAG Checklist for Website Chat Widgets',
    description: 'A practical WCAG checklist for website chatbots: keyboard use, screen readers, contrast, focus, motion, timing and testing, so every visitor can use your chat.',
    primaryKeyword: 'chatbot accessibility WCAG',
    secondaryKeywords: ['accessible chat widget', 'WCAG chatbot', 'screen reader chatbot', 'ADA compliant chatbot'],
    body: [
      p("A chat widget is a small application sitting on top of your website, and like any interface it can work well for everyone or shut some visitors out. People who use keyboards instead of mice, screen readers, magnification, voice control or high-contrast settings should be able to open the chat, read replies, type messages, book and reach a person. Accessibility is a matter of fairness and, in many places, of law. It is also good business: an accessible chat is usually a better chat for everybody. This guide turns the Web Content Accessibility Guidelines (WCAG) into a practical checklist for chat widgets, with tests you can run yourself in an hour."),
      note("This article is general information, not legal advice, and it does not claim that any product meets WCAG. Check the official guidelines at the [W3C WCAG overview](https://www.w3.org/WAI/standards-guidelines/wcag/) and test your own site. Legal requirements differ by country and sector."),

      h2("Why chat widgets are often inaccessible"),
      ul("They are built as floating overlays with custom controls that lack proper labels.", "Keyboard focus can get lost or trapped inside the widget.", "New messages appear without being announced to screen readers.", "Colours are chosen for branding, not contrast.", "Small buttons are hard to tap or click.", "Animations and auto-opening chats surprise and distract."),
      p("These are fixable, and most are visible in a short test."),

      h2("The four principles, applied to chat"),
      table(["WCAG principle", "Meaning", "In a chat widget"], ["Perceivable", "Information can be perceived by everyone", "Text alternatives, sufficient contrast, messages announced, resizable text"], ["Operable", "Everyone can use the controls", "Keyboard access, visible focus, no traps, enough time, large targets"], ["Understandable", "Content and operation are clear", "Plain language, predictable behaviour, helpful errors"], ["Robust", "Works with assistive technologies", "Proper roles, names and states in the code"]),

      h2("Checklist: opening and closing the chat"),
      ul("The chat button can be reached and activated with the keyboard (Tab and Enter or Space).", "The button has an accessible name such as 'Open chat', not just an icon.", "Its state is exposed: a screen reader knows whether the chat is open or closed.", "When the chat opens, focus moves into it, ideally to the message input or the chat heading.", "The Escape key closes the chat, and focus returns to the chat button.", "The chat does not open by itself in a way that steals focus or interrupts reading."),

      h2("Checklist: reading messages"),
      ul("New messages are announced to screen readers, for example through a live region, without repeating the whole conversation.", "Each message identifies who wrote it, such as 'Assistant' and 'You', in text and not colour alone.", "Text can be enlarged to 200 percent without loss of content.", "Line length and spacing stay readable.", "Links are distinguishable and have clear names.", "The transcript is scrollable by keyboard."),
      p("The status messages criterion in WCAG 2.2 (4.1.3) is what makes 'assistant is typing' and new replies audible to screen reader users without moving focus."),

      h2("Checklist: writing and sending"),
      ul("The message input has a visible or programmatic label.", "Send works with the Enter key and has a labelled button.", "Quick-reply buttons are real buttons with clear names.", "Errors, such as a failed send, are described in text and announced.", "Required fields, such as booking details, are identified and validated with helpful messages.", "Nothing depends on drag, swipe or hover alone."),

      h2("Checklist: colour, contrast and size"),
      table(["Requirement", "Guideline"], ["Text contrast", "At least 4.5 to 1 for normal text; 3 to 1 for large text"], ["Interface components and icons", "At least 3 to 1 against the background"], ["Focus indicator", "Clearly visible when a control is focused"], ["Touch and click targets", "Large enough; WCAG 2.2 sets a minimum of 24 by 24 pixels with spacing, and larger is kinder"], ["Colour not the only cue", "Do not rely on colour alone to distinguish sender or status"], ["Resize", "Layout works at 200 percent zoom and on narrow screens"]),
      p("Brand colours often fail contrast. Test your chat's colours with a contrast checker and adjust the widget theme, not just your website's."),

      h2("Checklist: motion, timing and interruptions"),
      ul("Respect the user's reduced-motion setting: no animated typing effects or bouncing bubbles that cannot be turned off.", "Avoid auto-playing sound.", "Do not close the chat or time out without warning while someone is typing.", "Do not pop up repeatedly after being dismissed.", "Allow enough time to read and respond."),

      h2("Checklist: booking and forms inside chat"),
      ul("Date and time pickers work with a keyboard and a screen reader; offer a text alternative such as a list of times.", "Slots are described in words, for example 'Thursday 12 June, 10:30 a.m.', not only by position.", "Confirmation is stated clearly and announced.", "Any change or cancellation link is a real link with a meaningful name."),
      p("A visual calendar grid that cannot be used with a keyboard is a common failure. A simple list of available times is often more accessible than a fancy picker."),

      h2("Content and tone"),
      ul("Use plain language and short sentences.", "Avoid jargon and unexplained abbreviations.", "Do not use emojis as the only carrier of meaning, and avoid long strings of them, which screen readers read out.", "Offer a route to a person, and describe it clearly, including phone and email options for people who cannot use chat.", "State that the assistant is an AI in text."),

      h2("How to test in an hour"),
      ol("**Keyboard only.** Put your mouse aside. Tab to the chat button, open it, ask a question, book an appointment, close it. Can you do everything and always see where focus is?", "**Zoom.** Set the browser to 200 percent and check the chat still works.", "**Screen reader.** Use the one on your computer (VoiceOver on Mac, Narrator or NVDA on Windows) and listen to the chat opening, a new reply and a booking confirmation.", "**Contrast.** Check text and button colours with a contrast tool.", "**Reduced motion.** Turn on the setting in your operating system and see if animations stop.", "**Mobile.** Try touch targets on a phone.", "**Automated scan.** Run a free accessibility checker on a page with the chat open, remembering that tools catch only some issues."),
      table(["Test result", "Action"], ["Cannot reach the chat by keyboard", "Report to the vendor; provide another route to contact you"], ["Screen reader silent on new messages", "Report to the vendor with details"], ["Low contrast", "Change theme colours"], ["Auto-opening chat interrupts", "Turn off auto-open"]),

      h2("What to ask your chatbot vendor"),
      ul("Do you test the widget with keyboards and screen readers, and can you share results?", "Which WCAG version and level do you aim for?", "Is there an accessibility statement?", "How do I report an accessibility problem, and how fast are they fixed?", "Can I change colours, size and auto-open behaviour?"),
      p("Be wary of claims of blanket 'compliance'; look for evidence and test yourself. Crescelo lets you customise the widget's colours and behaviour, so you can adjust contrast and turn off features; see the [website widget feature](/product/website-widget). We do not claim that any widget meets a standard without testing on your site."),

      h2("Offer alternatives"),
      p("Whatever you do, a chat should never be the only way to reach you. Publish a phone number, an email or form, and mention them in the chat. Some visitors cannot or will not use chat, and being reachable another way is both kind and, in some places, required."),

      h2("A short accessibility statement for your chat"),
      p("Add a line near the chat or on your accessibility page: 'Our chat assistant is an AI. If you have trouble using it, contact us by phone or email and we will help you in another way. Tell us about any problem so we can fix it.' Then honour it: monitor the inbox, respond quickly and record and fix problems. A visible route for feedback is as important as any technical feature, and it shows visitors that you take access seriously."),

      h2("Ongoing maintenance"),
      p("Accessibility is not a one-time fix. Every time you change the widget's colours, greeting or position, or your vendor updates the widget, re-run the quick tests: keyboard only, 200 percent zoom, a screen reader pass and a contrast check. Put it on the same schedule as your other content reviews."),

      h2("Related reading"),
      ul("[How to add an AI chatbot to your website](/blog/add-ai-chatbot-to-your-website) includes accessibility in the launch checklist.", "[Performance of embedded chat widgets](/blog/performance-optimization-embedded-chat-widgets) covers page speed, which also matters for accessibility.", "[Customizing widget branding with CSS](/blog/customize-widget-branding-css) shows how to adjust colours safely.", "[AI transparency and disclosure](/blog/ai-transparency-disclosure-building-trust) covers telling visitors they are talking to an AI."),

      h2("Frequently asked questions"),
      faq(
        ["Does WCAG apply to chatbots?", "Yes. WCAG applies to web content, including widgets such as chat. Legal obligations depend on your country and sector."],
        ["Is my chatbot ADA compliant?", "That depends on the widget, your site and the law that applies to you. Test with keyboard and screen readers, review the vendor's evidence and take advice. No widget can guarantee legal compliance on its own."],
        ["What is the most common chatbot accessibility problem?", "Poor keyboard support and messages that are not announced to screen readers, followed by low colour contrast."],
        ["How do I make new messages accessible?", "Use a live region so screen readers announce new messages without moving focus, and label who wrote each message."],
        ["Should the chat open automatically?", "Avoid it. Auto-opening can steal focus and interrupt reading; let visitors choose."],
        ["Can I test accessibility myself?", "Yes. Use keyboard only, zoom to 200 percent, a screen reader, a contrast checker and an automated scan."],
      ),
      p("See how to [add a chatbot to your website](/blog/add-ai-chatbot-to-your-website) with a checklist that includes accessibility, try an assistant in the [playground](/playground) and [start a free trial](/login?mode=register)."),
    ],
  }),

  pillar({
    slug: 'chatbot-welcome-message-copywriting',
    title: 'Chatbot Welcome Messages That Get Replies: Copywriting Guide With 30 Examples',
    description: 'How to write a chatbot greeting that gets visitors to reply: clear purpose, tone, timing, page-specific openers, quick replies and 30 examples for service businesses.',
    primaryKeyword: 'chatbot welcome message',
    secondaryKeywords: ['chatbot greeting examples', 'chat widget opening message', 'chatbot copywriting', 'first message chatbot'],
    body: [
      p("The first message your chatbot shows decides whether most visitors ever start a conversation. A vague 'Hi, how can I help?' is easy to ignore. A specific, friendly line that tells the visitor what the assistant can do for them, and makes replying effortless, gets more responses. This guide explains what a good welcome message does, the principles of writing one, how to match the message to the page and to the time of day, how to add quick replies, and gives thirty examples for service businesses that you can adapt. It ends with a way to test which message works best for you."),

      h2("What a welcome message has to do"),
      ol("**Say what the assistant can do.** Visitors do not know if it can book, quote or answer questions.", "**Sound human and on brand.** Warm, plain and specific.", "**Make replying easy.** Give a low-effort way to start, such as a question or buttons.", "**Set honest expectations.** Say it is an AI assistant, and that a person is available if needed.", "**Respect the visitor's attention.** Short, not pushy."),
      p("If the message does these five things, it will beat most generic greetings."),

      h2("Weak versus strong"),
      table(["Weak", "Why it fails", "Stronger"], ["Hi! How can I help you today?", "Vague; gives no reason to reply", "Hi, I am the Brook Salon assistant. Ask me about prices or book a time in one minute."], ["Welcome to our website!", "States the obvious", "Looking for a price or a free time? I can check both."], ["Chat with us", "A command, not an offer", "Questions before you book? I can answer them now."], ["We are online!", "Untrue at 2 a.m. and unhelpful", "I am an AI assistant and I am here any time. A real person is available in office hours."]),

      h2("Principles of a good greeting"),
      ul("**Lead with a benefit:** prices, times, quotes, answers.", "**Be specific to your business:** name it, name the top job.", "**Keep it under 25 words** for the first bubble.", "**Ask one easy question** or offer two or three buttons.", "**Use the visitor's words,** not your internal jargon.", "**Avoid over-promising:** do not claim instant everything.", "**Say it is an AI** clearly but briefly.", "**Match the tone of your brand:** playful for a barbershop, calm for a clinic."),

      h2("Match the message to the page"),
      table(["Page", "Visitor mindset", "Opening message"], ["Home", "Exploring", "Hi, I can tell you what we do, what it costs and find you a time. What would you like to know?"], ["Services", "Comparing options", "Not sure which service suits you? Tell me what you need and I will suggest one."], ["Pricing", "Worried about cost", "Questions about prices or what is included? I can explain and show you the next available time."], ["Contact", "Ready to reach out", "Skip the form: ask me here and I can book you in or take a message."], ["Blog article", "Learning", "Questions about this topic or how it applies to you? Ask away."], ["Booking page", "Ready to book", "Need help picking a time? I can show you what is free this week."]),
      p("Different messages on different pages raise relevance. If your product supports per-page greetings, use them on your three most visited pages first."),

      h2("Match the message to the time"),
      table(["When", "Message idea"], ["Open hours", "Ask me anything, or I can find you a time today. A team member is also on hand."], ["Evening or night", "The team has gone home, but I can answer questions and book you in. Ask away."], ["Weekend", "Open Saturday 9 to 2. I can book you in for then or answer questions now."], ["Holiday", "We are closed until 4 January. I can answer questions and book your first appointment back."]),

      h2("Add quick replies"),
      p("Buttons lower the effort of starting. Offer two to four options that reflect real visitor goals."),
      ul("'See prices'", "'Book a time'", "'Ask a question'", "'Talk to a person'"),
      p("Quick replies also steer visitors toward things the assistant does well. Remove buttons nobody clicks and add the ones that match common conversations from your review. See [micro-copy for quick-reply buttons](/blog/micro-copy-quick-reply-buttons-conversational-prompts)."),

      h2("Thirty examples to adapt"),
      h3("Salons and barbershops"),
      ul("Hi, I am the Brook Barbers assistant. Ask about prices or grab a slot in one minute.", "Need a trim before the weekend? I can show you the free times.", "Not sure what style suits you? Tell me about your hair and I will suggest a service.", "Bringing your child? I can tell you how long a kids' cut takes and book both of you.", "Booked out online? Ask me for the next opening and I will check."),
      h3("Clinics and dental"),
      ul("Hello, I am the practice assistant. I can answer questions about new patients, prices and opening hours, and book you a visit.", "Nervous about your first visit? Ask me anything, and I will explain what happens.", "Looking for a check-up? I can show you the next free appointment.", "Not an emergency line: if you need urgent help, tell me and I will alert the team.", "Insurance questions? I can share the providers we work with."),
      h3("Home services"),
      ul("Something broken? Tell me what happened and where, and I will get the right person to call you.", "Need a quote? Describe the job and I will book an inspection.", "Emergency? Tell me now, and I will alert the on-call engineer.", "Wondering if we cover your area? Give me your postcode.", "Not sure what it might cost? I can give you a ballpark and next steps."),
      h3("Real estate"),
      ul("Interested in a property? Tell me which one and I can share details or book a viewing.", "Thinking of selling? I can explain how we work and book a valuation.", "Searching by area? Tell me what you are after and I will show what fits.", "Want a viewing this weekend? I can check the times."),
      h3("Professional services"),
      ul("Have a question about our services or how we work? Ask me, and I can book an initial call.", "I cannot give advice, but I can explain how we help and arrange a consultation.", "Not sure which service you need? Tell me the situation in a line, no details, and I will point you the right way.", "Want to book a first call? I can show you the times."),
      h3("Studios and classes"),
      ul("Try a class? I can show times and book you a spot.", "Questions about memberships or drop-in prices? Ask me.", "First time here? I can tell you what to bring and what to expect."),
      h3("After hours and general"),
      ul("Our team is offline, but I can help. Ask a question or book a time.", "Ask me anything about our services. If I do not know, I will say so and pass you to the team.", "I am an AI assistant. I can answer questions and book appointments, and a person is available in office hours."),

      h2("Words to avoid"),
      ul("Corporate jargon such as 'leverage' or 'solutions'.", "Over-excitement, exclamation marks everywhere and emoji floods.", "Claims you cannot support: 'instant answers to everything'.", "Anything that sounds like a pop-up ad.", "Pretending to be human."),

      h2("How to test which message wins"),
      ol("Choose your current message as the control.", "Write one alternative that changes one thing, such as specificity or the first question.", "Run each for two weeks, or use an A/B feature if available, on similar traffic.", "Compare the share of visitors who reply and the share who book.", "Keep the winner and try another change."),
      table(["Metric", "Why it matters"], ["Chat open rate", "Whether the greeting attracts attention"], ["Reply rate", "Whether the first message invites a response"], ["Bookings per 100 visitors", "The outcome that counts"]),
      p("See [A/B testing chatbot starter prompts](/blog/ab-test-chatbot-starter-prompts) for a fuller method. Avoid testing many things at once."),

      h2("Voice and tone worksheet"),
      p("Before you write, decide three things: how formal you are, how much humour you allow and what you never say. Write three adjectives for your brand, for example warm, plain and direct, and check each greeting against them. Then read it aloud. If you would not say it to a customer standing at your counter, rewrite it."),

      h2("Related reading"),
      ul("[The questions every service business chatbot must answer well](/blog/essential-chatbot-questions-service-business) is a test list for what happens after the greeting.", "[How to review your chatbot conversations each week](/blog/audit-website-chatbot-conversations) shows which openers lead to real conversations.", "[Conversational lead capture](/blog/conversational-lead-capture) covers what to ask once a visitor replies."),

      h2("Frequently asked questions"),
      faq(
        ["What should a chatbot welcome message say?", "What the assistant can do, in a friendly and specific way, with an easy first step such as a question or buttons."],
        ["How long should it be?", "Under about 25 words for the first bubble, with one clear prompt."],
        ["Should the chatbot say it is an AI?", "Yes. Briefly and clearly. It builds trust and often is a legal expectation."],
        ["Should the greeting change by page?", "Yes if you can. A message that matches what the visitor is looking at is more relevant."],
        ["Should the chat open automatically?", "Usually let visitors choose. If you use auto-open, do it after a delay and only once, and avoid stealing focus."],
        ["How do I know which message is best?", "Test one change at a time and compare reply and booking rates."],
      ),
      p("Try different greetings in the [playground](/playground) with your own documents, see how the [website widget](/product/website-widget) can be customised and [start a free trial](/login?mode=register)."),
    ],
  }),

  pillar({
    slug: 'hipaa-compliance-dental-chatbots',
    title: 'HIPAA and Dental Chatbots: What Practices Should Know Before Using AI Chat',
    description: 'What US dental practices should consider before using an AI chatbot: PHI, business associate agreements, safe use in chat, vendor questions and practical safeguards.',
    primaryKeyword: 'HIPAA chatbot dental',
    secondaryKeywords: ['HIPAA compliant chatbot', 'dental practice AI privacy', 'PHI in chatbot', 'business associate agreement chatbot'],
    body: [
      p("Dental practices in the United States are usually covered entities under HIPAA, the federal law that protects patients' health information. That has consequences for any technology that touches patient information, including a website chatbot. A chatbot can be useful for a practice, answering questions about hours, treatments and new-patient steps and booking appointments, but it must be used in a way that respects the rules. This guide explains, in plain language and without pretending to be legal advice, what practices should think about before using an AI chatbot: what counts as protected health information, when a business associate agreement is needed, how to design the chat to avoid collecting what it should not, what to ask any vendor and a set of practical safeguards."),
      note("This is general information, not legal advice or a statement that any product is HIPAA compliant. HIPAA and state laws are detailed. Ask a qualified healthcare privacy lawyer or compliance adviser about your practice, and read the guidance at [HHS.gov](https://www.hhs.gov/hipaa/index.html). Practices outside the United States have their own rules."),

      h2("What HIPAA covers in plain terms"),
      p("HIPAA regulates how covered entities, such as dental practices, and their business associates handle protected health information, or PHI. PHI is health information that identifies a person, such as a name together with a treatment, an appointment for a specific procedure, insurance details or a description of symptoms. Even the fact that a named person is a patient can be PHI. The rules require safeguards for how PHI is stored and transmitted, limit who can see it and require written agreements with vendors that handle it on your behalf."),
      table(["Term", "Meaning"], ["Covered entity", "A healthcare provider, health plan or clearinghouse subject to HIPAA, such as most dental practices"], ["Business associate", "A vendor that handles PHI on behalf of a covered entity"], ["PHI", "Individually identifiable health information"], ["Business associate agreement (BAA)", "A contract that requires a business associate to safeguard PHI"], ["Minimum necessary", "Use and share only the information needed for the purpose"]),

      h2("Does a website chatbot handle PHI?"),
      p("It depends on what visitors type and what the chatbot collects. A visitor who asks 'what are your opening hours?' provides no PHI. A visitor who writes 'I am John Smith, I have a cracked molar and pain, can I come in today?' has just typed PHI. The chatbot's design decides how often that happens. If you invite health details, or if visitors volunteer them, your chatbot vendor and AI provider may be handling PHI, which brings business associate requirements."),

      h2("Two design approaches"),
      table(["Approach", "What it means", "Consideration"], ["Keep PHI out of the chat", "Design and instruct the assistant to avoid collecting health information; use it for hours, prices, general treatment information and booking basics; move clinical detail to your secure systems", "Reduces exposure, but visitors may still volunteer details; you need safeguards"], ["Use a chat that is set up to handle PHI", "Choose a vendor and AI provider willing to sign a BAA and meet HIPAA safeguards", "Requires careful due diligence and contracts; ask your adviser"]),
      p("Many practices start with the first approach: a chatbot for non-clinical questions and scheduling, with clear guidance to visitors not to share health details in chat."),

      h2("Practical safeguards if you keep PHI out"),
      ul("Put a notice in the chat: 'I am an AI assistant. Please do not share medical details or insurance numbers here. Call us or use our secure form for those.'", "Instruct the assistant to avoid asking for symptoms, history, medications or insurance identifiers.", "Collect only what is needed to book: name and contact details, and the type of visit in general terms.", "Have the assistant hand over anything clinical to a person, and direct emergencies to emergency services or your emergency line.", "Do not let the assistant diagnose, advise on medication or reassure about symptoms.", "Review transcripts to see what visitors volunteer, and refine the notice and instructions.", "Delete transcripts you do not need and limit who can read them."),
      p("Even booking information can identify a patient. Use your practice's secure systems for anything beyond basic scheduling, and check with your adviser whether appointment details in chat are acceptable for your situation."),

      h2("Questions to ask a chatbot vendor"),
      table(["Question", "Why"], ["Will you sign a business associate agreement?", "Required if the vendor handles PHI for you; the answer tells you which approach you can use"], ["Where is data stored and processed?", "Location and security of PHI"], ["Which sub-processors, including the AI provider, see chat content?", "Each may be a subcontractor business associate"], ["Is chat data used to train models?", "PHI should not be used for training"], ["How is data encrypted and access controlled?", "Safeguards required by the Security Rule"], ["Can transcripts be deleted, and how long are they kept?", "Retention and deletion"], ["Do you keep audit logs?", "Accountability"], ["What is your breach notification process?", "Required timelines"]),
      p("Crescelo does not claim any compliance certification. It stores AI provider keys encrypted, isolates customer workspaces, lets you delete conversations, leads and knowledge sources, publishes a [data processing addendum](/dpa) and lists its [sub-processors](/subprocessors). With a bring-your-own-key setup you choose the AI provider, so you decide whether its terms suit your practice. Do not put PHI into any chatbot unless you have confirmed in writing, with your adviser, that the whole chain meets your obligations."),

      h2("The AI provider is part of the chain"),
      p("The model that writes replies receives what visitors type. If PHI could be in that text, the AI provider also matters. Some providers offer business terms that include agreements for regulated data; others do not, or only for certain products or plans. Read their terms, ask their sales or compliance team, and get commitments in writing. Never assume a provider will sign what you need; check first."),

      h2("Marketing, tracking and analytics"),
      p("HIPAA also affects tracking technologies on healthcare websites. Analytics and advertising scripts on pages where visitors read about treatments, or on patient portals, can transmit information to third parties. Regulators have issued guidance on this. Review which scripts run on your site, including the chat widget, and take advice about consent and business associate requirements."),

      h2("Emergencies and clinical questions"),
      p("A chatbot must not triage. If a visitor describes severe pain, swelling, bleeding, difficulty breathing or swallowing, or a knocked-out tooth, the assistant should give your approved instructions, such as contacting emergency services or your emergency line, and alert your team. It should not diagnose or advise. See [dental emergency triage with AI chat](/blog/dental-emergency-triage-ai-chat) and [handling emergencies in automated chat](/blog/handling-emergencies-automated-chat)."),

      h2("A practical launch checklist"),
      ol("Decide, with your privacy officer or adviser, whether the chat will handle PHI.", "If not, write the notice and instructions that keep it out, and test them with realistic messages.", "If yes, get a BAA with every vendor in the chain before you start.", "Review the vendor's security and data practices.", "Turn off any features that collect or store more than you need.", "Train staff on what the assistant does and how to handle handovers.", "Document your decisions, and review them regularly."),

      h2("What the chatbot can safely help with"),
      ul("Opening hours, location, parking and accessibility.", "General descriptions of services, from approved documents.", "New-patient process and what to bring.", "Fees and payment options that you publish.", "Booking appointments with minimal information.", "Directing people to secure channels for clinical questions."),
      p("Used this way, a chatbot can reduce phone volume and after-hours enquiries without collecting sensitive information. See [AI chatbot for dental practices](/blog/ai-patient-scheduling-dental-practices) for how the pieces fit."),

      h2("Staff training points"),
      ul("Explain to the front desk what the assistant will and will not do, and where transcripts are stored.", "Teach them to move any clinical detail that appears in chat into your secure systems.", "Agree what to do when a visitor shares more than they should: reply through a secure route and do not repeat the details in an open channel.", "Make sure everyone knows the emergency handover path."),

      h2("Frequently asked questions"),
      faq(
        ["Is a dental website chatbot covered by HIPAA?", "If it handles protected health information for a covered entity, the vendor may be a business associate. Whether your chat does depends on what it collects and what visitors type."],
        ["Can I use an AI chatbot without a BAA?", "If you can genuinely keep PHI out of it, some practices do. Take advice, design the chat and notice carefully and review transcripts."],
        ["Is Crescelo HIPAA compliant?", "Crescelo does not claim any compliance certification. Do not put PHI into it unless you have confirmed in writing, with your adviser, that your obligations are met."],
        ["Can the chatbot take insurance details?", "It is safer not to collect insurance identifiers in chat. Use your secure systems for those."],
        ["What should the chat say about privacy?", "That it is an AI assistant, that visitors should not share medical details, and where to find your privacy policy."],
        ["Who is responsible for compliance?", "The practice, as the covered entity, remains responsible. Vendors help, but they do not remove your obligations."],
      ),
      p("Try a non-clinical question flow in the [playground](/playground) with your own practice information, and see the [AI assistant feature](/product/ai-assistant). For wider privacy points, read the [GDPR checklist for website chatbots](/blog/website-chatbot-gdpr-checklist)."),
    ],
  }),

  pillar({
    slug: 'service-business-cro-playbook',
    title: 'Website Conversion Rate Optimization for Service Businesses: A Practical Playbook',
    description: 'A practical CRO playbook for service business websites: measure, fix the pages that matter, clarify offers, cut friction, use chat and booking, and test changes properly.',
    primaryKeyword: 'conversion rate optimization for service businesses',
    secondaryKeywords: ['website conversion tips small business', 'increase website enquiries', 'service business website audit', 'local business landing page optimization'],
    body: [
      p("Getting more visitors to your website is expensive. Getting more of the visitors you already have to call, book or enquire is usually cheaper, and it multiplies the value of everything else you do, from search rankings to advertising. That is conversion rate optimization, or CRO. For a service business it is less about clever experiments and more about clear offers, fast answers and easy next steps. This playbook walks through a practical process: measure where you are, fix the pages that matter most, make your offer and proof clear, remove friction, add chat and booking where they help and test changes properly. It is written for small teams with limited time and traffic."),

      h2("Start with the right definition of conversion"),
      p("A conversion is the action that matters to your business: a booked appointment, a phone call, a quote request, a form submission. Decide which one or two you want, and write them down. A visitor who reads three pages and leaves without acting has not converted, however long they stayed."),
      table(["Business", "Primary conversion", "Secondary"], ["Salon or barbershop", "Online booking", "Call, price list view"], ["Clinic or dental", "New patient booking", "Call, contact form"], ["Home services", "Quote or callout request", "Phone call"], ["Professional services", "Consultation booking", "Enquiry form"], ["Fitness studio", "Trial class booking", "Membership enquiry"]),

      h2("Measure before you change anything"),
      ol("Count monthly visitors, and how many reach your key pages: home, services, pricing, contact and booking.", "Count conversions of each type, from every source: bookings, calls, forms, chats.", "Calculate your conversion rate: conversions divided by visitors.", "Split by device. Mobile often converts worse, and often dominates traffic.", "Split by source: search, social, ads, direct, referrals.", "Record the numbers in a sheet, so you can compare after changes."),
      p("Use free analytics, call tracking if you can and your booking system's reports. Even rough numbers show where the biggest gaps are."),

      h2("Fix the pages that matter most first"),
      p("Rank your pages by traffic and by closeness to a decision. Pricing, services and contact pages usually deserve attention before the blog."),
      table(["Page", "What it needs"], ["Home", "A clear promise, the main action, and a path to services and booking"], ["Service pages", "What it is, who it is for, price or range, what is included, proof, next step"], ["Pricing", "Clear numbers, what changes the price, how to get a quote"], ["Contact", "Every way to reach you, hours, and an answer to 'what happens next'"], ["Booking", "Fast, mobile-friendly, few fields, clear confirmation"]),

      h2("Make the offer unmistakable"),
      ul("Say what you do and for whom in the first line, in words a customer uses.", "Put the main action above the fold: a visible button such as 'Book now' or 'Get a quote'.", "State prices or ranges wherever you can; hiding them creates doubt and lost enquiries.", "Explain what happens after they act: 'We reply within an hour', 'Booking takes one minute'.", "Use one main action per page; extra choices dilute it."),
      p("If a new visitor cannot say in five seconds what you offer and what to do next, fix that before anything else."),

      h2("Build trust without exaggeration"),
      ul("Real reviews, with names and sources you can point to.", "Photos of your work, your team and your premises.", "Credentials, licences and insurance you can prove.", "Guarantees you can honour, stated plainly.", "Clear contact details and a real address.", "A privacy policy and a statement of how you handle data."),
      p("Avoid vague superlatives and invented numbers. Specific, checkable proof beats adjectives."),

      h2("Remove friction"),
      table(["Friction", "Fix"], ["Slow pages, especially on mobile", "Compress images, reduce scripts, check page speed"], ["Small tap targets and cramped layouts", "Design for thumbs; large buttons"], ["Long forms", "Ask only for name and a way to reach them; offer more later"], ["Unclear navigation", "Fewer menu items; clear labels"], ["Pop-ups that block reading", "Delay or remove them"], ["Booking that requires an account", "Allow guest booking"], ["No answer to common questions", "Add an FAQ and a chat that answers them"], ["Phone number not tappable", "Make it a click-to-call link"]),
      p("Test your own site on a phone with one hand, on a slow connection. If you find it annoying, so do your visitors."),

      h2("Answer questions at the moment of doubt"),
      p("Most lost conversions are unanswered questions: price, availability, suitability, policy. A chat that answers from your own documents, at any hour, turns hesitation into action. It can also offer a booking or capture a lead in the same conversation. See [why contact forms fail](/blog/why-contact-us-forms-fail) and [conversational lead capture](/blog/conversational-lead-capture). Put the chat where doubts arise: pricing, services and contact pages. See [what an AI website assistant does](/blog/ai-website-assistant)."),

      h2("Make booking effortless"),
      ul("Offer online booking with real availability.", "Keep fields to a minimum.", "Confirm immediately, by email, with a change link.", "Make the booking button visible on every service page and in the header.", "Offer a phone option for those who prefer it."),
      p("See [AI appointment booking](/blog/ai-appointment-booking) and [reducing bounce with proactive chat](/blog/reduce-bounce-rate-proactive-chat)."),

      h2("Local and mobile specifics"),
      p("Most local service traffic is on phones, and much of it comes from Google Maps and local search. Make sure your business profile, website and chat show the same hours, services and phone number. Put the call and directions buttons where thumbs can reach them. See [the local SEO and conversion blueprint](/blog/local-seo-conversion-blueprint) and [converting Google Business Profile traffic in chat](/blog/convert-google-business-traffic-chat)."),

      h2("Test changes properly"),
      ol("Change one thing at a time, so you know what worked.", "Write a hypothesis: 'Adding prices to the service page will increase enquiries.'", "Run the change long enough to collect meaningful numbers, usually several weeks for a small site.", "Compare the same period, allowing for seasonality.", "Keep the change if it helps; revert if it does not.", "Record what you learned."),
      p("Small sites rarely have enough traffic for formal A/B tests on small changes. Focus on big, obvious improvements, and use before-and-after comparisons with care. See [A/B testing chatbot starter prompts](/blog/ab-test-chatbot-starter-prompts) for testing chat messages."),

      h2("A 30-day plan"),
      table(["Week", "Focus"], ["1", "Measure: visitors, conversions, mobile and source splits; list top pages"], ["2", "Fix the top three pages: offer, prices, proof and the main button"], ["3", "Remove friction: speed, forms, tap targets; add chat and booking where doubts arise"], ["4", "Review results, read chat conversations for new questions and plan the next round"]),

      h2("Common mistakes"),
      ul("Redesigning the whole site instead of fixing the pages that matter.", "Hiding prices.", "Offering too many actions on one page.", "Ignoring mobile.", "Chasing traffic while conversion is weak.", "Changing many things and not measuring.", "Never reading customer questions."),

      h2("Worked example: a plumbing company's contact page"),
      p("A two-van plumbing company gets 900 visitors a month and 18 enquiries, a 2 percent rate. The contact page has a long form, no phone number in the header on mobile and no mention of emergency callouts. The owner makes four changes in one afternoon: a tap-to-call button in the mobile header, a shorter form with three fields, a line stating the callout fee and emergency hours, and a chat that answers coverage and price questions. Over the next six weeks enquiries rise to 27 a month on similar traffic, a 3 percent rate. The figures are illustrative, but the pattern is typical: the biggest gains come from plain fixes, not from clever design."),
      table(["Change", "Why it should help"], ["Tap-to-call in the mobile header", "Removes a step for people who want to phone"], ["Three-field form", "Less effort to finish"], ["Callout fee and emergency hours stated", "Removes doubt; filters unsuitable enquiries"], ["Chat for coverage and price", "Answers questions at the moment of hesitation"]),

      h2("A one-page audit checklist"),
      ul("Can a stranger say what we do and for whom in five seconds?", "Is the main action visible without scrolling on a phone?", "Are prices or ranges shown?", "Is there real proof: reviews, photos, credentials?", "Does the page load quickly on mobile data?", "Can someone book or enquire in under two minutes?", "Is there an answer to the top five questions on the page?", "Is the phone number tappable and the address clear?", "Do we know how many people convert, by device and source?"),
      p("Score each yes as one point. Anything under seven tells you where to start."),

      h2("Frequently asked questions"),
      faq(
        ["What is a good conversion rate for a service business?", "It varies widely by industry and traffic source. Measure your own rate and improve it over time rather than chase an average."],
        ["What should I fix first?", "Your pricing, service and contact pages: clear offer, prices or ranges, proof and one obvious action."],
        ["Should I show prices on my website?", "Where you can, yes. Prices or ranges build trust and reduce time-wasting enquiries."],
        ["Does a chatbot increase conversions?", "It can, when visitors have unanswered questions. Measure bookings and enquiries before and after."],
        ["How long should I run a test?", "Long enough to see a meaningful number of conversions, often several weeks for small sites."],
        ["How do I improve mobile conversion?", "Speed up pages, use large buttons, make phone numbers tappable and shorten forms."],
      ),
      p("See how the [AI assistant](/product/ai-assistant) answers questions on your pricing page, try it in the [playground](/playground) and [start a free trial](/login?mode=register)."),
    ],
  }),
];
