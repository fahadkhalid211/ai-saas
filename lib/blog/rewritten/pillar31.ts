import { faq, h2, ol, p, pillar, table, ul } from '../authoring';

export const PILLAR31 = [
  pillar({
    slug: 'configure-custom-smtp-resend-booking-emails',
    title: 'Making Sure Booking Confirmations and Lead Alerts Reach the Inbox',
    description: 'How to get booking confirmations, reminders and lead alerts delivered: sending services, from addresses, SPF and DKIM, content, testing, spam folders and troubleshooting steps.',
    primaryKeyword: 'booking confirmation emails deliverability',
    secondaryKeywords: ['emails going to spam booking', 'SMTP vs Resend transactional email', 'lead alert emails not arriving', 'transactional email setup'],
    body: [
      p("A booking is only as good as its confirmation. If the email with the date, the address and the change link never arrives, the customer wonders whether the booking worked, phones you, double-books or simply does not show up. Likewise, if a lead alert lands in your spam folder, a hot enquiry waits for days. Yet email delivery is one of the least visible parts of any booking or chat system, and one of the most common causes of quiet failure. This guide explains how transactional emails, the automatic messages triggered by an action, are sent and why they sometimes fail to arrive. It covers the difference between sending through an email service and through an SMTP relay, the from address, the DNS records that prove you are legitimate, how to write emails that mail providers trust, how to test properly and what to check when messages go missing. In Crescelo, booking confirmations, reminders and lead alerts are sent by email, and the sending service, SMTP or Resend, is configured by the platform operator; the principles below apply to whoever runs it and help you diagnose delivery problems."),

      h2("What are transactional emails"),
      table(["Type", "Trigger", "Example"], ["Booking confirmation", "A visitor books an appointment", "Date, time, place, private link to change or cancel"], ["Reminder", "A set time before the appointment", "Reminder with the same link"], ["Lead alert", "A visitor leaves contact details", "Notification to your team with the conversation"], ["Password and sign-in", "Account actions", "Reset link, verification"]),
      p("They differ from marketing emails: they are expected, individual and time-sensitive. Mail providers generally treat them more favourably, as long as the sender is properly identified."),

      h2("Two ways to send: an email service or an SMTP relay"),
      table(["Option", "What it is", "Good for"], ["Email API service (such as Resend)", "A provider you send through by API, with a dashboard, domain verification and delivery tracking", "Simple setup and good deliverability tooling"], ["SMTP relay", "A standard mail server you connect to with a host, port, username and password", "Using an existing mail provider or company server"]),
      p("Both work. What matters more is that the sending domain is verified and authenticated. Crescelo supports either: the platform operator sets a Resend key or SMTP host, port, user and password, and the from address."),

      h2("The from address matters"),
      ul("Use an address on a domain you own, such as bookings@yourbusiness.com, not a free webmail address. Providers reject or spam-folder mail that claims to be from Gmail or Outlook but is sent by another server.", "Use a consistent, recognisable name: 'Riverside Dental' rather than 'noreply'.", "Set a reply-to address that a person reads, so customers can respond.", "Avoid changing the from address often; providers learn to trust a stable sender.", "Do not use a placeholder test address, such as an onboarding address supplied by the service, for real customers; it is meant for trials and has restrictions."),

      h2("Authenticate your domain: SPF, DKIM and DMARC"),
      p("These three DNS records tell mail providers that the messages are legitimate. Without them, even perfect emails are often treated as suspicious, especially by Gmail and Yahoo, which now expect authentication from senders. In short:"),
      ul("**SPF** lists the servers allowed to send for your domain.", "**DKIM** signs each message so it cannot be forged or altered.", "**DMARC** tells receivers what to do with mail that fails, and sends you reports."),
      p("Your email service shows the exact records to add and a button to verify them. Follow the step-by-step guide: [how to set up SPF, DKIM and DMARC](/blog/how-to-set-up-spf-dkim-dmarc-business-email)."),

      h2("Write emails that providers and people trust"),
      table(["Do", "Avoid"], ["A clear subject: 'Your appointment on Tuesday 14 May at 10:30'", "Vague or shouting subjects, or 'RE:' tricks"], ["Plain text alongside simple HTML", "Images-only emails"], ["Your business name and address in the footer", "Anonymous senders"], ["One or two links, to your own domain", "Many links or shortened URLs"], ["Concise, useful content", "Long marketing copy in a confirmation"], ["A visible way to reply or contact you", "No-reply dead ends"]),
      p("A confirmation should answer: what, when, where, what to bring, how to change it and how to reach you. Crescelo's confirmation includes a private link to change or cancel and an add-to-calendar option, and reminders repeat the essentials."),

      h2("Test properly"),
      ol("Send a real booking through your live flow, not just a test button.", "Try several recipients: Gmail, Outlook, Yahoo and a business address.", "Check inbox, spam and promotions folders.", "Open the message headers and check that SPF, DKIM and DMARC show pass.", "Use an email-testing tool or your service's dashboard to see delivery status.", "Test on a phone: is the layout readable and are the links tappable?", "Repeat after any change to the sending service, the domain or the templates."),

      h2("When emails go missing: a checklist"),
      table(["Symptom", "Likely cause", "What to do"], ["Nothing arrives anywhere", "Sending service not configured or credentials wrong", "Check the configuration and the service's logs"], ["Arrives in spam", "Domain not authenticated, or a new domain with no reputation", "Set SPF, DKIM and DMARC; send low volumes at first"], ["Works for some providers only", "Provider-specific filtering", "Check headers for pass or fail; look at the provider's postmaster tools"], ["Delayed", "Queueing or throttling", "Check rate limits at the service"], ["Bounces", "Invalid recipient address", "Check for typos; validate addresses at capture"], ["Alerts go to the wrong person", "Notification address wrong", "Update the alert recipient in your settings"], ["Reminders never sent", "Reminder feature or schedule not running", "Check settings and that the scheduled job is active"]),

      h2("Protect your reputation"),
      ul("Send only to people who asked for the message.", "Keep bounce rates low by validating addresses at capture.", "Honour requests to stop receiving reminders where you offer them.", "Do not use confirmations for promotions.", "Monitor complaints and delivery reports.", "Warm up a new sending domain gradually."),
      p("Reputation is built over time. A domain that sends a few genuine confirmations each day and never annoys people is trusted quickly."),

      h2("Ask customers to help"),
      p("Mention on your booking page and in the assistant's answers: 'Your confirmation comes from bookings@yourbusiness.com. If you do not see it within a few minutes, please check your spam folder.' Many customers will then move it to the inbox, which trains their provider to trust your messages. See [seven traps that stop visitors booking online](/blog/calendar-friction-audit-scheduling-traps) for other reassurance points."),

      h2("Common mistakes"),
      ul("Using a free webmail address as the sender.", "Skipping domain authentication.", "Testing only with one email provider.", "Sending large batches from a brand new domain.", "Never checking spam folders.", "Using a trial sender address for real customers."),

      h2("Frequently asked questions"),
      faq(
        ["Why are my booking confirmation emails going to spam?", "Most often the sending domain is not authenticated with SPF, DKIM and DMARC, or the from address is a free webmail address or a placeholder."],
        ["Does Crescelo send confirmation and reminder emails?", "Yes. Booking confirmations with a private change link, reminders before the appointment and lead alerts are sent by email."],
        ["What is the difference between SMTP and Resend?", "Resend is an email API service; SMTP is a standard relay you connect to with host, port and credentials. Both need a verified, authenticated sending domain."],
        ["Who configures the sending service in Crescelo?", "The platform operator configures SMTP or Resend; notification settings for your assistant are in Channels and Integrations."],
        ["How do I test delivery?", "Send a real booking to several providers, check spam folders and inspect the headers for SPF, DKIM and DMARC passes."],
        ["Can I use a free email address as the sender?", "It is not recommended. Use an address on your own verified domain."],
      ),
      p("See the [appointment booking feature](/product/appointment-booking), [lead capture](/product/lead-capture) and [pricing](/pricing), and read [preventing no-shows with reminders](/blog/eliminate-service-no-shows-playbook)."),
    ],
  }),

  pillar({
    slug: 'customize-widget-branding-css',
    title: 'Making the Chat Widget Look Like Your Brand: Colours, Name, Position and Tone',
    description: 'How to brand a website chat widget: choosing colours, contrast and accessibility, name and avatar, welcome message, starter questions, position, mobile checks and white-label options.',
    primaryKeyword: 'customize chat widget branding',
    secondaryKeywords: ['brand colours chatbot widget', 'chat widget design tips', 'white label chatbot', 'chat widget accessibility contrast'],
    body: [
      p("A chat widget is a small piece of your website that visitors talk to, and if it looks or sounds foreign, it undermines the rest of the site. A bright default blue on a soft green brand, a generic 'AI Assistant' name and a stiff greeting all signal that this is somebody else's tool bolted on. The good news is that the elements which make a widget feel like yours are few and quick to set: the colour, the name, the welcome message, the starter questions and the position on the page. Get those right and the widget looks like part of the business. This guide covers each in practice: how to choose and test a colour so it looks right and remains readable, how to name the assistant honestly, how to write a welcome message and starter questions that invite a first message, where to put the launcher, what to check on mobile and what white-label options are for. In Crescelo you set these in the Widget and Styling area of the dashboard: assistant name, brand colour, position, welcome message and suggested starter questions, with branding options for eligible plans."),

      h2("What you can change"),
      table(["Setting", "What it affects", "Tip"], ["Assistant name", "The title visitors see", "Honest and friendly; see below"], ["Brand colour", "Launcher, header and buttons", "Match your brand, check contrast"], ["Position", "Which corner the launcher sits in", "Avoid covering important buttons"], ["Welcome message", "The first thing the visitor reads", "Specific and short"], ["Starter questions", "Tappable suggestions", "Your top three questions"], ["Branding line and link", "The 'powered by' area on plans that allow changing it", "Use your own brand where available"]),

      h2("Choose the colour carefully"),
      ol("Start from your brand's main colour, the one used for your primary buttons.", "Check that white text is readable on it. Text and background need enough contrast; the common accessibility target is a ratio of at least 4.5 to 1 for normal text.", "If your colour is pale or bright yellow, choose a darker shade for the widget so text stays legible.", "Look at the widget on your real pages, on a phone and in bright light.", "Do not use colour alone to convey meaning; keep clear labels."),
      table(["Brand colour", "Risk", "Fix"], ["Pale pastel", "White text is hard to read", "Use a darker tone of the same hue"], ["Bright yellow or lime", "Very low contrast with white", "Use a dark colour for the header with light text, or pick a deeper shade"], ["Very dark or black", "Fine for contrast, may look heavy", "Check it against your page background"], ["Two-tone brand", "Which to pick?", "Use the colour that your main buttons use"]),
      p("A free contrast checker will tell you the ratio for any pair of colours. Two minutes of checking prevents the most common accessibility failure in widgets; see [accessibility and WCAG for chatbots](/blog/accessibility-wcag-compliance-website-chatbots)."),

      h2("Name the assistant honestly"),
      ul("Visitors should know they are talking to an AI. A name such as 'Riverside Assistant' or 'Ask Riverside' is friendly and honest.", "Avoid human names and photos that suggest a real person is typing, unless a person actually takes over; some places require disclosure that a chatbot is automated.", "Keep it short so it fits on a phone.", "Use your business's name so visitors recognise it."),
      p("If a human takes over the chat, say so clearly in the conversation. See [when and how to hand over](/blog/live-human-handover-flow-design)."),

      h2("Write a welcome message that starts conversations"),
      table(["Weak", "Better"], ["Hi! How can I help you today?", "Hi, I am Riverside's assistant. Ask me about prices, opening hours or booking a visit."], ["Welcome to our website.", "Hello! Looking for a time this week? I can show what is free."], ["Chat with us!", "Questions about your first appointment? Ask away."]),
      p("The best welcome messages name two or three things the assistant can do, in the words customers use. Keep it to one or two sentences. See [writing chat welcome messages](/blog/chatbot-welcome-message-copywriting)."),

      h2("Starter questions are your most useful pixels"),
      ul("Use the three or four questions customers ask most; your unanswered and popular question lists will tell you.", "Word them as customers would: 'How much is a haircut?' rather than 'Pricing information'.", "Include one action, such as 'Book an appointment'.", "Keep each short enough to fit on one line on a phone.", "Review them each quarter as demand changes."),
      p("Starter questions lower the effort of the first message. On a phone, tapping is far easier than typing, so they often raise the share of visitors who start a conversation."),

      h2("Choose the position"),
      table(["Position", "Considerations"], ["Bottom right", "The convention; visitors expect it"], ["Bottom left", "Useful if the right side has a cookie banner, a back-to-top button or another widget"], ["Elsewhere", "Rarely a good idea"]),
      p("Check pages with sticky footers, cookie banners and forms so the launcher never covers a submit button. On mobile, the launcher should not overlap your call or booking buttons."),

      h2("White-label and branding options"),
      p("Plans that allow it let you replace the platform's branding line with your own text and link, which matters for agencies and businesses that want a fully branded experience. Check the pricing page for which plans include this. If you resell or manage assistants for clients, consistent branding across their sites is part of the service; see [governing chat across many locations](/blog/enterprise-ai-automation-governance-service-franchises)."),

      h2("Check it on real devices"),
      table(["Check", "What good looks like"], ["Phone portrait and landscape", "Launcher visible, chat readable, keyboard does not hide the input"], ["Desktop at normal and narrow widths", "No overlap with other elements"], ["Dark mode on your site", "Colours still readable"], ["Slow connection", "Page content loads first"], ["Keyboard only", "Launcher reachable, chat operable"]),

      h2("Keep the voice consistent"),
      p("The look is only half of the brand; the assistant's replies must sound like you too. Set the tone in the Behavior and Rules area, and see [making the assistant sound like your business](/blog/brand-voice-alignment-ai-receptionist)."),

      h2("Common mistakes"),
      ul("Leaving the default name and greeting.", "Choosing a colour without checking contrast.", "Human names and photos that mislead.", "A welcome message that offers nothing specific.", "Covering important buttons.", "Not checking mobile."),

      h2("A quick branding checklist"),
      ul("Brand colour set and checked for contrast.", "Assistant name short, honest and recognisable.", "Welcome message names two or three things the assistant can do.", "Three or four starter questions, worded as customers ask them.", "Launcher position clear of banners and buttons.", "Tested on a phone and with the keyboard."),
      p("Run through the list whenever you redesign your site, since a new theme can change what the widget sits on top of."),

      h2("Frequently asked questions"),
      faq(
        ["What can I customise in the Crescelo widget?", "The assistant name, brand colour, position, welcome message and starter questions, plus branding options on eligible plans."],
        ["How do I choose a colour that is readable?", "Start from your brand colour, check that text has at least a 4.5 to 1 contrast ratio and darken the shade if needed."],
        ["Should I give the assistant a human name?", "Prefer an honest name that shows it is an assistant. Avoid suggesting a person is typing unless one is."],
        ["Where should the widget sit?", "Bottom right by convention, or bottom left if something else occupies that corner. Make sure it never covers key buttons."],
        ["What makes a good welcome message?", "One or two sentences naming the things the assistant can help with, in customers' words."],
        ["What is white-label?", "Replacing the platform's branding with your own on plans that allow it."],
      ),
      p("Preview the experience in the [playground](/playground), see the [website widget feature](/product/website-widget) and check [pricing](/pricing) for branding options."),
    ],
  }),

  pillar({
    slug: 'brand-voice-alignment-ai-receptionist',
    title: 'Making Your AI Assistant Sound Like Your Business: A Practical Guide to Tone',
    description: 'How to give an AI assistant your brand voice: define tone, write instructions and examples, set do and do-not rules, handle sensitive moments, test the voice and keep it consistent.',
    primaryKeyword: 'AI assistant brand voice',
    secondaryKeywords: ['chatbot tone of voice', 'brand voice for AI receptionist', 'write chatbot instructions', 'AI assistant personality'],
    body: [
      p("Two businesses can have the same information in their knowledge bases and yet their assistants should sound nothing alike. A playful surf shop, a family solicitor and a premium spa each speak to customers differently, and a visitor notices quickly when the assistant on the website does not sound like the person who answers the phone. A mismatch feels off: a stiff, corporate assistant on a relaxed cafe's site, or a jokey one on a funeral director's. Getting the voice right is not decoration; it affects trust, and it often decides whether the visitor keeps typing. The good news is that brand voice can be set with plain-language instructions and a few examples, and you can test and refine it in minutes. This guide walks through defining your tone in four or five words, writing instructions the AI can follow, using examples, setting rules for sensitive moments, testing the result and keeping the voice consistent across channels and locations. In Crescelo, the Behavior and Rules area is where you set tone, topics to avoid and when to offer a person."),

      h2("Step 1: Describe your voice in a few words"),
      p("Start with how you would describe the way your best team member talks to customers. Choose three to five adjectives, and for each, a 'but not'."),
      table(["Business", "Voice", "But not"], ["Independent cafe", "Warm, casual, cheerful", "Silly or unprofessional"], ["Family law practice", "Calm, clear, respectful", "Cold, legalistic or overly reassuring"], ["Premium spa", "Calm, refined, attentive", "Stuffy or salesy"], ["Plumbing firm", "Direct, friendly, practical", "Slangy or vague"], ["Coaching practice", "Encouraging, thoughtful, plain-spoken", "Preachy or clinical"]),
      p("The 'but not' column is what prevents the assistant overshooting into a caricature."),

      h2("Step 2: Write instructions the AI can follow"),
      p("Instructions work best when specific, short and positive. Tell the assistant who it is, who it is talking to and how to talk."),
      table(["Element", "Example instruction"], ["Role", "You are the online assistant for Riverside Dental. You help visitors with questions and booking."], ["Audience", "Visitors are often nervous adults and parents of young children."], ["Tone", "Speak in a warm, calm and reassuring way. Use plain language and short sentences."], ["Length", "Keep answers to two to four sentences unless asked for detail."], ["Address", "Use 'we' for the practice and 'you' for the visitor. Do not use slang or emoji."], ["Structure", "Give the answer first, then the next step."], ["Honesty", "If you do not know, say so and offer to take their details or book a visit."]),
      p("Avoid a long list of contradictory commands. A dozen clear lines beat a page of vague ones."),

      h2("Step 3: Add examples"),
      p("Examples are the fastest way to pass on voice. Write two or three short exchanges in your style and include them in the instructions, or use them as your own reference when testing."),
      table(["Visitor", "On-brand reply", "Off-brand reply"], ["Do you treat scared kids?", "Yes, we see many nervous children. We start with a short, friendly visit just to say hello. Would you like to book one?", "Certainly. Our paediatric protocol accommodates anxious patients. Please provide your details."], ["How much is a check-up?", "A check-up is $65 for adults and $40 for children. It takes about 30 minutes. Shall I show you some times?", "Prices vary. Please contact reception for a personalised quotation."]),
      p("Notice how the on-brand replies are short, give the fact first and finish with a next step."),

      h2("Step 4: Set do and do-not rules"),
      table(["Do", "Do not"], ["Answer from the documents", "Invent prices, hours or guarantees"], ["Be warm and concise", "Use jargon the customer would not use"], ["Offer a next step", "Push for contact details in every message"], ["Admit when you do not know", "Guess or bluff"], ["Hand over complaints and sensitive matters", "Argue, give medical, legal or financial advice"], ["Follow your brand's language, such as 'clients' or 'guests'", "Switch between 'customers', 'patients' and 'users'"]),
      p("Put the safety rules first. Tone is secondary to accuracy."),

      h2("Handle emotional moments"),
      ul("**Complaints:** acknowledge feelings first, then offer to pass it to a person. Never argue.", "**Bad news, such as a cancellation or price rise:** be direct and kind, and give the reason briefly.", "**Fear or anxiety:** be calm, avoid hype, offer a person.", "**Grief or sensitive services:** use gentle, plain language and avoid cheerfulness or emoji.", "**Urgency:** be clear about what to do now and how to reach a person."),
      p("See [de-escalating frustrated customers](/blog/de-escalating-frustrated-customers-ai-guardrails) and [handover design](/blog/live-human-handover-flow-design)."),

      h2("Step 5: Test the voice"),
      ol("Ask ten typical questions and read the replies aloud. Would you say that to a customer?", "Try an angry message, a vague one, an off-topic one and one in a hurry.", "Ask something the documents cannot answer; check that the honesty rule and tone hold.", "Have a colleague who does not know the setup read the conversations and describe the personality.", "Fix the instruction that caused any off-brand reply, and re-test."),
      p("Change one instruction at a time, so you know which change helped."),

      h2("Consistency across channels and locations"),
      ul("Keep one written voice guide and reuse it for every assistant and channel.", "Website, WhatsApp and Telegram replies should feel like the same business, though messaging channels may be a little shorter.", "For multi-location businesses, use the same voice and vary only local facts; see [one assistant for several locations](/blog/multi-location-ai-receptionist).", "Review a sample of conversations each month against the guide."),

      h2("Mirror the voice in the rest of your setup"),
      p("The welcome message, starter questions and button labels are part of the voice too; see [making the chat widget look like your brand](/blog/customize-widget-branding-css) and [writing warm, non-clinical language for coaches](/blog/empathetic-conversational-tone-coaching-chat)."),

      h2("Common mistakes"),
      ul("Very long instructions with contradictions.", "Asking for a personality but forgetting accuracy rules.", "Jokes and emoji in sensitive contexts.", "Never testing.", "Different voices on different channels.", "Letting the tone override honesty."),

      h2("A sample voice guide"),
      table(["Item", "Example"], ["Who we are", "A friendly neighbourhood dental practice"], ["Voice", "Warm, calm, plain-spoken"], ["Never", "Scare people, use jargon, promise outcomes"], ["Always", "Give the answer first and offer a next step"], ["Sample line", "Yes, we see many nervous patients. We will go at your pace."], ["Escalate", "Pain, complaints, anything clinical"]),
      p("One page like this, shared with everyone who writes for the business, keeps the website, emails and assistant sounding alike. Update it when you notice the assistant drifting or when your brand changes."),

      h2("Frequently asked questions"),
      faq(
        ["How do I make my chatbot sound like my brand?", "Describe your voice in a few words with a 'but not', write short specific instructions and examples, set do and do-not rules and test with real questions."],
        ["Where do I set tone in Crescelo?", "In Behavior and Rules, where you can set tone, topics to avoid and when to offer a person."],
        ["How long should instructions be?", "A dozen clear lines are better than a page of vague ones."],
        ["Should the assistant use emoji?", "Only if it suits your brand and audience. Avoid them for sensitive or formal services."],
        ["How do I keep the voice consistent across locations?", "Use one voice guide for all assistants and vary only the local facts."],
        ["Can tone override accuracy?", "Never. The assistant must still answer from your documents and admit when it does not know."],
      ),
      p("Try different instructions in the [playground](/playground), see the [AI assistant feature](/product/ai-assistant) and [pricing](/pricing)."),
    ],
  }),

  pillar({
    slug: 'business-hours-logic-ai-chat',
    title: 'Telling Visitors When You Are Open, and What Happens When You Are Not',
    description: 'How an AI assistant should handle opening hours: stating hours, holidays and exceptions, time zones, after-hours replies, booking hours versus open hours, and testing common questions.',
    primaryKeyword: 'chatbot business hours',
    secondaryKeywords: ['after hours chatbot message', 'opening hours AI assistant', 'holiday hours chatbot', 'out of hours customer chat'],
    body: [
      p("'Are you open now?' is one of the most common questions a business gets, and one of the easiest to get wrong. A visitor asking at nine in the evening about a shop that closed at five deserves a clear answer and a useful next step, not a cheerful 'we are open Monday to Friday'. An assistant that answers only from written documents knows your regular hours, but it does not automatically know the current time in your time zone, that today is a public holiday, that you close early on Fridays or that the Saturday clinic runs different hours. This guide covers how to give the assistant, and your visitors, the right information about hours: how to write hours so they can be found, how to handle holidays and exceptions, what to do about time zones, how to design out-of-hours replies that keep the visitor, how booking hours differ from opening hours and how to test the common questions. It also explains what Crescelo does: booking uses one set of opening hours and one slot length, and the assistant answers hours questions from the content you provide."),

      h2("Write your hours so they can be found"),
      table(["Do", "Avoid"], ["Write hours in plain text, day by day", "Hours only in an image or an embedded map"], ["Use one format: 'Monday to Friday, 9:00 to 17:30'", "Mixing 24-hour and 12-hour formats"], ["State the time zone if you serve several", "Assuming everyone knows where you are"], ["Include hours per location", "One paragraph for all branches; see [several locations](/blog/multi-location-ai-receptionist)"], ["Mention closures: 'Closed on public holidays'", "Leaving holidays unsaid"], ["Say how to reach you outside these hours", "Ending with the hours alone"]),
      p("Put the hours in your knowledge base as a short, dedicated passage titled 'Opening hours', and use the same wording on your website. If the website and the documents disagree, the assistant may quote either."),

      h2("The three kinds of hours"),
      table(["Kind", "Meaning", "Example"], ["Opening hours", "When customers can visit or phone", "Monday to Friday 9 to 5:30"], ["Support or reply hours", "When a person answers chats and emails", "Replies within a few hours on weekdays"], ["Booking hours", "When appointments can be booked", "Slots between 9 and 17:00, 30 minutes each"]),
      p("They are often different, and visitors mix them up. Say each one explicitly: 'We are open until 5:30, and our last appointment is at 5:00. The assistant is available at any time; the team replies from 9 am on weekdays.'"),

      h2("What Crescelo's booking uses"),
      ul("A single set of opening hours, with days of the week and start and end times, and one slot length such as 30 minutes.", "Slots outside these hours are not offered, and slots that are taken are hidden.", "There is no built-in holiday calendar and no separate hours per service, so close days by adjusting the hours, or by telling the assistant about closures in its documents.", "The booking picker does not read your own calendar, so an event you add there does not block slots; see [seven traps that stop visitors booking online](/blog/calendar-friction-audit-scheduling-traps).", "If you need different hours per service or buffers between appointments, consider linking to a scheduling tool such as Calendly or Cal.com."),
      p("Keep booking hours in the settings and opening hours in the documents aligned, so what visitors are told matches what they can book."),

      h2("Holidays and exceptions"),
      ol("Keep a short 'Special hours' passage in the knowledge base with dates: 'Closed 25 and 26 December. Open 9 to 1 on 24 December.'", "Update it a few weeks before each holiday and remove it afterwards, so old exceptions do not linger.", "Adjust booking hours so visitors cannot book slots on closed days.", "Add a line to the assistant's welcome message during a closure if it matters: 'We are closed until Monday 6 January; you can still book online.'", "Test the holiday questions after updating."),
      p("Old exceptions are a hidden source of wrong answers; date every special-hours entry."),

      h2("Time zones"),
      ul("State your time zone next to your hours, especially if you serve customers elsewhere.", "For online or remote services, say whether times are shown in the visitor's zone or yours.", "The assistant cannot reliably know the visitor's local time unless they say it; ask when it matters.", "Confirmation emails should state the time clearly, with the zone if there is any doubt; see [scheduling calls across time zones](/blog/time-zone-global-scheduling-consultants)."),

      h2("Designing the out-of-hours experience"),
      p("Visitors who arrive when you are closed are still interested. The assistant's job is to keep them rather than send them away."),
      table(["Situation", "Helpful reply"], ["'Are you open?' at 9 pm", "We are closed now and open again tomorrow at 9. I can answer questions or show you times to book."], ["'Can I speak to someone?' on Sunday", "The team is not in today, and replies from 9 am on Monday. If you leave your details, someone will get back to you."], ["'I need help urgently'", "For urgent matters please call [number]. For anything else, I can take your details."], ["'Can I book for tomorrow morning?'", "Yes, here are tomorrow's available times."]),
      ul("Tell them when someone will reply, and keep that promise.", "Offer booking or a callback request so they leave with a concrete next step.", "Give an emergency number where relevant, and only if it is real and answered.", "Do not pretend that a person is available when nobody is."),
      p("Out-of-hours chats are often a large share of demand; see [tracking where chat visitors drop off](/blog/tracking-in-chat-funnel-drop-off)."),

      h2("Test the common questions"),
      table(["Question", "Check"], ["What time do you open on Saturday?", "Correct hours"], ["Are you open on bank holidays?", "Answer matches your special hours"], ["Are you open now?", "Explains regular hours and what to do if closed"], ["What is your last appointment?", "Booking hours match the settings"], ["Can I book for a closed day?", "The picker does not offer it, and the assistant explains"], ["What time is that in London?", "Handles zone or asks"]),
      p("Re-run them whenever hours change and before each holiday period."),

      h2("Common mistakes"),
      ul("Different hours in different documents.", "Leaving last year's holiday hours in place.", "Confusing opening hours with booking hours.", "Not telling visitors when a person will reply.", "Promising urgent help that is not available.", "Forgetting to change the booking hours."),

      h2("Frequently asked questions"),
      faq(
        ["How does the chatbot know my opening hours?", "From the content you provide, such as an 'Opening hours' passage in the knowledge base, and, for booking, from the opening hours set in the booking settings."],
        ["Does Crescelo handle holidays automatically?", "No. There is no built-in holiday calendar; adjust booking hours and add dated special hours to your documents."],
        ["Can different services have different hours?", "Not in the built-in booking, which uses one set of hours and one slot length. Link to a scheduling tool for more."],
        ["What should the assistant say when I am closed?", "That you are closed, when you reopen and what the visitor can do now, such as booking or leaving details."],
        ["How do I handle time zones?", "State your zone next to the hours and clarify the zone in confirmations for remote services."],
        ["How often should I check hours?", "Whenever they change and before each holiday, by testing the common questions."],
      ),
      p("See the [appointment booking feature](/product/appointment-booking), the [AI assistant](/product/ai-assistant) and try hours questions in the [playground](/playground)."),
    ],
  }),

  pillar({
    slug: 'local-service-business-tech-stack',
    title: 'A Sensible Set of Tools for a Small Local Business: What You Need and What You Can Skip',
    description: 'Build a simple, affordable software stack for a local service business: website, bookings, payments, accounting, communication, reviews, backups and security, in priority order.',
    primaryKeyword: 'small business software stack',
    secondaryKeywords: ['tools for a local service business', 'what software does a small business need', 'simple tech stack for salons clinics trades', 'business tools checklist'],
    body: [
      p("Small business owners are bombarded with software. Every week brings a new tool that promises to save time, win customers or organise everything. The result is often a pile of overlapping subscriptions, half-set-up accounts and a phone full of apps nobody opens. A local service business, whether a salon, clinic, trade, studio or consultancy, needs remarkably little to run well: a way to be found, a way to be booked, a way to be paid, a way to keep the books, a way to talk to customers and a way to stay safe. This guide sets out a sensible stack in order of priority, with what each layer must do, what to look for, what to skip until you need it and how to keep the total small and manageable. It is not a list of brands, since the right product depends on your country and budget, but a set of criteria you can apply, with pointers to guides on the harder decisions."),

      h2("Principles for a small stack"),
      ul("**Solve problems, not gaps in a feature list.** Add a tool only when a specific problem justifies it.", "**Prefer fewer tools that do the job over many that overlap.**", "**Check that data can be exported** so you are never trapped.", "**Choose tools your team will actually use;** simplicity beats power.", "**Budget total cost,** including time to set up and learn, not just the subscription.", "**Review annually** and cancel what you do not use."),
      p("See [how to choose SaaS software for a small business](/blog/how-to-choose-saas-software-small-business) for a full evaluation process."),

      h2("The stack in priority order"),
      table(["Layer", "Job", "Must have", "Skip for now"], ["1. Website", "Be found, explain what you do, show prices and how to book", "Mobile-friendly, fast, clear services and contact, your hours and location", "Complex e-commerce, animated designs"], ["2. Google Business Profile and directories", "Appear in local searches and maps", "Accurate name, address, phone, hours and photos", "Dozens of minor directories"], ["3. Booking", "Let customers book without phoning", "Clear slots, confirmations, reminders, ability to change", "Complex resource scheduling if you do not need it"], ["4. Payments", "Take money simply", "A trusted card and payment provider, receipts", "Multiple providers"], ["5. Accounting", "Track income, expenses and tax", "Invoicing, bank feeds or easy imports, reports for your accountant", "Advanced forecasting"], ["6. Email and calendar", "Communicate professionally", "A business email on your own domain, shared calendar", "Multiple mailboxes per person"], ["7. Customer chat", "Answer questions and capture enquiries at any hour", "Answers from your own content, lead capture, handover", "Complex automation"], ["8. Reviews and reputation", "Collect and display feedback", "A simple way to request reviews and reply to them", "Expensive reputation suites"], ["9. Security and backups", "Protect accounts and data", "A password manager, two-factor sign-in, backups", "Enterprise security tools"]),
      p("If you are just starting, layers one to five are the essentials. The rest are worth adding as you grow."),

      h2("Layer notes"),
      h2("Website and local search"),
      p("Your website is your shop window and your answer sheet. Put prices or ranges, services, hours, location, how to book and real photos on it. Keep your Google Business Profile up to date, since many local customers find you there first. A website that answers questions also gives a chat assistant good material to use; see [importing your website into a chatbot](/blog/dynamic-web-scraping-sitemap-ingestion-rag)."),
      h2("Booking"),
      p("Online booking removes phone tag and captures customers who would not call. The important features are showing real availability, confirming instantly, sending reminders and allowing changes without a phone call. Crescelo's built-in booking offers a slot picker based on opening hours and one slot length, confirmation emails with a private change link and reminders; for per-service durations or buffers, use a scheduling tool such as Calendly or Cal.com, which the assistant can link to."),
      h2("Payments and accounting"),
      p("Choose a well-known payment provider available in your country and an accounting tool your accountant is happy with. Connect them so income flows in without retyping. Do not choose accounting software by features alone: ask your accountant which they prefer, because it saves you both time."),
      h2("Email, calendar and chat"),
      p("Use email on your own domain and set up SPF, DKIM and DMARC so your messages arrive; see [how to set up SPF, DKIM and DMARC](/blog/how-to-set-up-spf-dkim-dmarc-business-email). A customer chat assistant answers the routine questions, books appointments and captures leads, out of hours as well as during them, and hands over to you when a person is needed. Look for answers from your own content, a clear fallback when it does not know, lead alerts by email or Slack and honest pricing. See [chat analytics for service businesses](/blog/service-business-chat-analytics-playbook)."),
      h2("Reviews"),
      p("Ask every customer for a review with a direct link, and reply to all of them. See [asking for reviews without being pushy](/blog/collect-reviews-ratings-automated-chat)."),
      h2("Security and backups"),
      p("A password manager, two-factor sign-in on every important account and a tested backup are the most valuable and cheapest protections. See [securing your chatbot account](/blog/setup-rbac-2fa-team-security) and [how to back up business data](/blog/how-to-back-up-business-data-3-2-1-rule)."),

      h2("What it costs"),
      table(["Item", "Typical approach"], ["Website and domain", "Modest monthly or annual costs"], ["Booking", "Free tiers or a low monthly fee; may be included in another tool"], ["Payments", "Transaction fees, no monthly fee for basic accounts"], ["Accounting", "A monthly subscription"], ["Email on your domain", "A per-user monthly fee"], ["Chat assistant", "A plan such as Crescelo's Starter at $49, Growth at $149 or Agency at $399, plus AI usage at your provider's rate if you bring your own key"], ["Password manager and backups", "Low monthly fees"]),
      p("Add these up and compare with the time saved and revenue gained. A stack that costs a few hundred dollars a month should pay for itself in enquiries answered and bookings made. See [pricing](/pricing) for Crescelo's current plans."),

      h2("How the tools should fit together"),
      ul("Your website links to booking, and the chat assistant offers booking in the conversation.", "Leads from chat go to email, Slack or a spreadsheet you actually check; see [lead routing](/blog/instant-lead-routing-chat).", "Booking confirmations go from your own domain.", "Payments and accounting connect.", "Reviews are requested from the same follow-up routine as rebooking; see [follow-up after the appointment](/blog/post-appointment-nurture-rebooking-sequences)."),
      p("Draw the flow once on paper. If something depends on a person copying data between tools every day, look for a simpler connection."),

      h2("Yearly review"),
      ol("List every tool and its cost.", "Mark each as used daily, weekly or never.", "Cancel the ones you never use.", "Check that data exports still work.", "Note pain points and search for a single tool that could replace two.", "Review access and roles for each tool."),

      h2("Common mistakes"),
      ul("Buying tools before defining problems.", "Overlapping subscriptions.", "No export path.", "Forgetting security and backups.", "Choosing by feature count.", "Never reviewing."),

      h2("Frequently asked questions"),
      faq(
        ["What software does a local service business need?", "A website, a local search profile, booking, payments, accounting, business email, a customer chat assistant, a review process and basic security and backups."],
        ["What should I buy first?", "The website, local profile, booking, payments and accounting, then add the rest as needed."],
        ["Do I need a chatbot?", "It helps if you receive repeated questions or enquiries outside opening hours. Try one on your own content first."],
        ["How do I avoid overspending?", "Add tools only for specific problems, prefer tools that do several jobs and review subscriptions yearly."],
        ["How should the tools connect?", "Website to booking, chat to booking and leads, payments to accounting, all using your own email domain."],
        ["How often should I review the stack?", "Once a year, and whenever a tool stops earning its cost."],
      ),
      p("See the [AI assistant feature](/product/ai-assistant), the [appointment booking feature](/product/appointment-booking) and try it on your own content in the [playground](/playground)."),
    ],
  }),
];
