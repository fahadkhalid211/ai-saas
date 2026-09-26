import { faq, h2, h3, note, ol, p, pillar, table, ul } from '../authoring';

export const PILLAR8 = [
  pillar({
    slug: 'telegram-bot-integration-business-chat',
    title: 'Telegram Bot for Business: How to Connect an AI Assistant Step by Step',
    description: 'How to connect a Telegram bot to an AI assistant for your business: BotFather, tokens, webhooks, privacy, message design, testing and when Telegram is the right channel.',
    primaryKeyword: 'Telegram bot for business',
    secondaryKeywords: ['Telegram chatbot for customer service', 'connect Telegram bot AI assistant', 'BotFather setup', 'Telegram customer support bot'],
    body: [
      p("Telegram is a messaging app with hundreds of millions of users, and it is unusually friendly to businesses because bots are a built-in feature. Anyone can create a bot in a couple of minutes, with no business verification and no message-template approval. That makes Telegram one of the easiest channels on which to put an AI assistant, and a good fit if your customers already use it. This guide explains when Telegram makes sense, how to create and connect a bot to an assistant such as Crescelo, how to design messages that work in the app, how to handle privacy, and how to test before you announce it."),

      h2("When Telegram is the right channel"),
      p("Telegram is popular in some regions, industries and communities much more than others. Before you invest, check whether your customers use it."),
      table(["Signal", "Telegram is a good fit if"], ["Your customers", "They already message you or your community on Telegram"], ["Your region", "Telegram is widely used where you operate"], ["Your business", "Crypto, tech, education, creators, local communities, delivery and services with online audiences"], ["Your goal", "Quick answers and simple bookings in an app people keep open all day"], ["Your setup capacity", "You want a channel that takes minutes to set up, not days"]),
      p("If your customers are mainly on WhatsApp or on your website, start there. See [website chat versus WhatsApp bots](/blog/website-chat-vs-whatsapp-bots-service-business) for how to choose."),

      h2("How Telegram bots work"),
      p("A Telegram bot is a special account controlled by software. People find it by its username, open a chat and message it like a contact. When someone sends a message, Telegram forwards it to your assistant through a web address you register, called a webhook. The assistant writes a reply and sends it back through Telegram's interface. There is no phone number to verify and no monthly fee from Telegram for bots."),
      ul("**BotFather** is Telegram's own bot for creating and managing bots.", "The **bot token** is a long secret string that authorises your assistant to act as the bot. Treat it like a password.", "The **webhook** is the web address to which Telegram delivers messages.", "**Commands** such as /start and /help are conventions that let users trigger actions."),

      h2("Step-by-step setup with Crescelo"),
      p("Telegram is included on Crescelo's Agency / Scale plan."),
      ol("**Create the bot.** In Telegram, message @BotFather and send /newbot. Choose a display name and a username ending in 'bot'. BotFather replies with a token. Copy it.", "**Add the token to your assistant.** In Crescelo, open Channels and Integrations, then Telegram, paste the token, verify it and enable the bot.", "**Set the webhook.** Use the button in Crescelo to set the webhook automatically, so Telegram delivers messages to your assistant.", "**Test.** Open your bot in Telegram, press Start and send a question."),
      p("Keep the token private. If it is ever exposed, revoke it in BotFather and generate a new one, then update it in Crescelo."),

      h2("Make the bot look professional"),
      p("Use BotFather to polish the bot before customers see it."),
      ul("**Name and username:** use your business name so people recognise it.", "**Profile picture:** your logo.", "**Description:** what people see before they press Start; say what the bot does in one line, for example 'Ask about our services, prices and opening hours, or book a time.'", "**About text:** a short line on the bot's profile.", "**Commands menu:** list a few helpful commands such as /book and /hours if your setup supports them."),

      h2("Designing messages for Telegram"),
      p("Telegram chats are quick and casual. Good bot replies are short, specific and easy to act on."),
      table(["Do", "Avoid"], ["Short paragraphs and clear line breaks", "Walls of text"], ["One question at a time", "Long forms in a single message"], ["Buttons or a short list of options where supported", "Ambiguous open-ended prompts"], ["A friendly first message that says what the bot does", "A generic greeting with no purpose"], ["A visible way to reach a person", "Trapping people with a bot"]),
      p("Write the greeting separately for Telegram and for your website. A message that works on a page may feel stiff in a chat app."),

      h2("Booking and lead capture on Telegram"),
      p("The same assistant that answers on your website can take bookings and capture leads in Telegram. Crescelo's built-in booking offers slots from your opening hours and locks a slot while it is being booked; confirmations go by email. Because Telegram users sometimes prefer not to share an email, decide what you need at booking: a name and a contact method are usually enough. See [AI appointment booking](/blog/ai-appointment-booking) and [conversational lead capture](/blog/conversational-lead-capture)."),

      h2("Privacy and responsibilities"),
      ul("Tell people they are chatting with an AI assistant, in the bot's description and greeting.", "Link to your privacy policy.", "Collect only what you need, and avoid sensitive details in chat.", "Remember that Telegram is a third-party platform whose own terms and privacy practices apply to conversations.", "Ask your assistant vendor where data is stored and who processes it, and decide how long you keep transcripts."),
      p("If you serve people in Europe or California, see the [GDPR checklist for website chatbots](/blog/website-chatbot-gdpr-checklist); the same principles apply to any chat channel. This is general information, not legal advice."),

      h2("Groups, channels and private chats"),
      p("Bots can be added to groups and channels, but a customer-service assistant belongs in one-to-one chats. Group behaviour is different: many people talk at once, and bots may only see certain messages depending on privacy settings. If you run a community group, use a separate approach for moderation and announcements, and keep the assistant for direct questions. Do not add an assistant that answers from private business documents to a public group without thinking about who can read what it says."),

      h2("Testing before you announce"),
      ol("Send a normal question and check the answer.", "Send a question your documents cannot answer and confirm it says it does not know.", "Book an appointment, if enabled, and check the confirmation.", "Ask for a person and confirm your team is notified.", "Send a sticker, photo or voice note and see what happens; decide whether you want a friendly message asking users to type.", "Test from a second account and on a phone.", "Check that conversations appear in your dashboard."),

      h2("Troubleshooting"),
      table(["Problem", "Likely cause", "Fix"], ["Bot does not reply", "Webhook not set, or token wrong", "Verify the token and set the webhook again from the dashboard"], ["Bot replies to you but not to others", "Bot disabled or plan limit reached", "Check that the bot is enabled and your plan's session limit"], ["Old messages arrive in a burst", "Bot was offline and Telegram queued them", "Expected once after downtime; review and respond"], ["Token exposed", "Shared or committed by mistake", "Revoke in BotFather, create a new token and update it"], ["Answers differ from the website", "Different assistant or old content", "Use the same assistant and refresh the knowledge base"]),

      h2("Example: a language school on Telegram"),
      p("A language school has many students who already use Telegram. It creates a bot called the school's name, loads its course descriptions, prices, timetable and enrolment policy into the assistant and connects the bot. Students ask about levels, start dates and fees, get answers at once and can request a callback from the admissions team. The staff read a short summary each morning and follow up on the requests. Nothing new is asked of students: they use the app they already have open."),
      table(["Question", "Answered from"], ["When does the next beginner course start?", "Timetable document"], ["How much is the evening course?", "Price list"], ["Can I pay in instalments?", "Payment policy"], ["I want to speak to someone", "Handover to admissions"]),

      h2("Keeping it useful after launch"),
      ul("Review the first two weeks of conversations daily and fix wrong answers at the source.", "Add the answers to questions the assistant could not handle.", "Check that handover requests reach a person quickly.", "Update the bot description if your services change.", "Rotate the bot token if a team member who had it leaves."),
      p("A bot that customers find useful tends to be talked about in the communities where they gather, which can bring more customers than any advertising. A bot that answers badly gets muted immediately, so accuracy matters more than reach."),

      h2("Frequently asked questions"),
      faq(
        ["How do I create a Telegram bot for my business?", "Message @BotFather in Telegram, send /newbot, choose a name and username and copy the token. Then paste the token into your assistant's Telegram settings and set the webhook."],
        ["Does Telegram charge for bots?", "Telegram does not charge for creating or running bots. You pay for your assistant platform and AI usage."],
        ["Does Crescelo support Telegram?", "Yes, on the Agency / Scale plan, using your own bot token."],
        ["Is Telegram easier to set up than WhatsApp?", "Yes. It needs no business verification or template approval, only a bot token and a webhook."],
        ["Can a Telegram bot book appointments?", "Yes, if your assistant supports booking. The same booking rules apply as on your website."],
        ["Is a Telegram bot private?", "Conversations are with your bot and pass through Telegram and your assistant vendor. Tell users what you collect and follow privacy rules."],
      ),
      p("See the [messaging channels feature](/product/messaging-channels), try the assistant in the [playground](/playground) and [start a free trial](/login?mode=register). For a wider view of channels, read [unifying web, WhatsApp and Telegram in one inbox](/blog/unifying-web-whatsapp-telegram-inbox)."),
    ],
  }),

  pillar({
    slug: 'configure-calendar-sync-availability-rules',
    title: 'Online Booking Availability Rules: Hours, Slot Length and Calendar Setup',
    description: 'How to set the availability rules behind online booking: opening hours, slot length, lead time, breaks and calendar feeds, with examples and mistakes that cause double bookings.',
    primaryKeyword: 'online booking availability settings',
    secondaryKeywords: ['appointment slot length', 'booking availability rules', 'set opening hours for online booking', 'calendar feed for bookings'],
    body: [
      p("When a visitor opens your booking chat and sees a list of times, those times come from rules you set once and rarely look at again: your opening hours, how long a booking lasts, how much notice you need and how the booking connects to your own calendar. Get these wrong and visitors book times you cannot honour, or see no times at all. This guide explains the availability rules behind online booking, how to choose sensible values for different kinds of business, how calendar feeds and sync work, and the mistakes that cause trouble."),
      note("Different booking products offer different levels of control. Where we describe Crescelo, we describe what it does today. Some features in this article, such as per-service durations, buffers and staff calendars, are things fuller scheduling systems do; Crescelo's built-in picker keeps to opening hours and one slot length, and you can use Calendly or Cal.com links for more complex scheduling."),

      h2("The building blocks of availability"),
      table(["Rule", "What it decides", "Typical mistake"], ["Opening hours", "Which days and hours can be booked", "Leaving lunch breaks or closed days open"], ["Slot length", "How long each bookable time lasts", "Choosing a length shorter than the real service"], ["Lead time", "How soon before a slot it can be booked", "Allowing bookings 10 minutes ahead when you need a day"], ["Booking window", "How far ahead people can book", "Opening a year of slots you cannot promise"], ["Breaks and closures", "Lunch, holidays, training days", "Forgetting a bank holiday"], ["Capacity", "How many bookings can overlap", "Assuming one when you have two staff, or the reverse"], ["Time zone", "How times are shown and stored", "Mixing your zone with the visitor's"]),
      p("Each of these can be simple or sophisticated. The right level depends on your business, and more sophistication is not always better."),

      h2("Choosing your opening hours for booking"),
      p("Booking hours are not always your public opening hours. You might accept bookings from 9 to 5 but only take walk-ins outside them, or you might close bookings an hour before closing so the last customer is not rushed. Set booking hours to what you can genuinely serve."),
      ul("Include the days you are open and no others.", "Exclude lunch or admin time if you cannot serve clients then.", "Leave a buffer at the end of the day.", "Update them for seasonal changes and holidays."),
      p("If your product supports only weekly hours and not one-off closures, remember to adjust your hours before a holiday or use another mechanism to close specific dates."),

      h2("Choosing a slot length"),
      p("The slot length is the block of time each booking occupies. It should match what the service actually takes, including the time before and after that you need."),
      table(["Business", "Common approach"], ["Barbershop with mostly one service", "A single slot length such as 30 minutes"], ["Clinic with standard consultations", "A fixed slot such as 30 or 45 minutes"], ["Coach or consultant", "One slot length per call type, using separate booking links if you offer several"], ["Salon with many services of different lengths", "A scheduling tool with per-service durations, or separate booking links for long and short services"], ["Studio classes", "A fixed schedule with capacity"]),
      p("Crescelo's built-in picker uses one slot length, such as 30, 45 or 60 minutes, per assistant. If your services have very different lengths, either choose the length of your most common service and describe longer services in the chat so the visitor books consecutive slots or contacts you, or use Calendly or Cal.com links for the services that need their own durations."),

      h2("Lead time and booking window"),
      ul("**Lead time:** how much notice you need. A same-day salon may accept bookings an hour ahead; a clinic may need a day; a consultant may need a week.", "**Booking window:** how far ahead you accept bookings. Most small businesses open four to eight weeks."),
      p("Short lead times increase bookings but raise the risk of late arrivals and last-minute changes. Long windows reduce your flexibility. Review both every few months."),

      h2("How slot locking prevents double bookings"),
      p("Availability is only trustworthy if two people cannot book the same slot. A good system checks availability again at the moment of confirmation and locks the slot while the booking is saved, so the second person is offered the next time instead. Crescelo's built-in picker hides slots that are already taken and locks a slot while it is being booked. The mechanics are explained in [how online booking avoids double bookings](/blog/double-booking-prevention-concurrency-mutex)."),

      h2("Your own calendar and the calendar feed"),
      p("You will want bookings to appear in the calendar you already live in. There are two common approaches, and it matters which one you have."),
      table(["Approach", "What it does", "Consequence"], ["One-way feed (read-only)", "Bookings are published as a feed that Google, Apple or Outlook Calendar subscribes to", "Bookings show in your calendar, but events you add there do not change the booking slots"], ["Two-way sync", "The booking system reads your calendar's busy times and writes bookings back", "Personal events block slots automatically"]),
      p("Crescelo provides the one-way feed today: copy the private feed address from the Appointments page and subscribe in Google Calendar (Other calendars, then From URL), Outlook or Apple Calendar. Two-way sync is on the roadmap but not available yet. That has a practical consequence: if you add a personal appointment in your own calendar, the assistant will still offer that time. To keep the two consistent, reduce your booking hours to times you are genuinely free, or block the time using the opening hours settings."),
      p("Calendly and Cal.com links, which Crescelo supports, offer their own calendar connections if you need two-way behaviour. See [seeing AI bookings in Google and Outlook Calendar](/blog/sync-ai-booking-google-outlook-calendar)."),

      h2("Time zones"),
      p("Store times in a standard form and display them in the visitor's zone, stating the zone in the confirmation. Watch for daylight saving changes: a booking made for 9 a.m. should stay at 9 a.m. local time on the day, even if clocks change in between. If you serve visitors in other zones, say so in the chat and in the confirmation, for example '2:30 p.m. Eastern Time (7:30 p.m. UK time)'."),

      h2("Example setups"),
      h3("A single-chair barbershop"),
      p("Hours Tuesday to Saturday 9 to 6, slot length 30 minutes, lead time one hour, window four weeks. Longer services, such as a cut and beard, are described in the knowledge base as two consecutive slots."),
      h3("A physiotherapy clinic"),
      p("Hours Monday to Friday 8 to 5, slot length 45 minutes for a standard session, lead time one day, window six weeks. Initial assessments use a separate booking link with a longer duration through a scheduling tool."),
      h3("A solo consultant"),
      p("Hours chosen around deep-work time, slot length 30 minutes for introductory calls, lead time two days, window three weeks, with a clear time zone in every confirmation."),

      h2("Testing your rules"),
      ol("Open the booking in a private window and look at the first available slot. Is it sooner than you can honour?", "Check the last slot of the day. Does it leave you enough time?", "Check a day you are closed and a holiday.", "Book a slot, then try to book the same slot from another window.", "Look at the confirmation and calendar feed entry.", "Try a booking from another time zone if you serve one."),
      p("Retest whenever you change hours, add services or change your team."),

      h2("Common mistakes"),
      ul("Slot lengths shorter than the service.", "No lead time, so people book while you are already on your way home.", "Forgetting to close for holidays.", "Assuming personal calendar events block bookings when they do not.", "Opening too long a window and then rearranging.", "Not stating the time zone.", "Not testing after changes."),

      h2("Related reading"),
      ul("[AI appointment booking](/blog/ai-appointment-booking) explains what a trustworthy booking system must do end to end.", "[Seeing AI bookings in Google and Outlook Calendar](/blog/sync-ai-booking-google-outlook-calendar) covers feeds, refresh delays and clashes.", "[How to reduce no-shows](/blog/eliminate-service-no-shows-playbook) shows what to send after a booking is made.", "[Frictionless self-serve rescheduling](/blog/frictionless-self-serve-rescheduling) keeps changes from becoming cancellations."),

      h2("A short review routine"),
      p("Availability rules drift as your business changes. Once a quarter, open your booking settings and check that hours match your real week, that the slot length still fits your main service, that holidays are covered and that the lead time still works. Book a test appointment and follow it through to the confirmation and the calendar feed. Ten minutes a quarter prevents most availability problems."),

      h2("Frequently asked questions"),
      faq(
        ["How do I set availability for online booking?", "Set your booking days and hours, the slot length, lead time and booking window, and connect the booking to your calendar through a feed or sync."],
        ["What slot length should I choose?", "Choose the length of your most common service including any time before and after. Use separate booking links or a scheduling tool for services with very different lengths."],
        ["Does the booking block my personal calendar events?", "Only with two-way sync. Crescelo provides a one-way, read-only feed today, so events you add in your own calendar do not block slots yet."],
        ["How do I see bookings in Google Calendar?", "Copy the calendar feed address from the Appointments page and subscribe to it in Google Calendar under Other calendars, From URL."],
        ["How do I stop double bookings?", "Use a booking system that locks a slot while it is being booked and hides slots that are taken."],
        ["What is lead time?", "The minimum notice before a slot that a booking is accepted, for example a day."],
      ),
      p("See how it works in the [appointment booking feature](/product/appointment-booking), read [AI appointment booking](/blog/ai-appointment-booking) and [start a free trial](/login?mode=register)."),
    ],
  }),

  pillar({
    slug: 'sync-ai-booking-google-outlook-calendar',
    title: 'AI Bookings in Google Calendar and Outlook: How Sync Works and What to Expect',
    description: 'How AI chatbot bookings reach Google Calendar, Outlook and Apple Calendar: read-only feeds, two-way sync, Calendly links, limits and how to avoid clashes.',
    primaryKeyword: 'AI booking Google Calendar sync',
    secondaryKeywords: ['chatbot Google Calendar integration', 'Outlook calendar booking chatbot', 'calendar feed iCal booking', 'two-way calendar sync'],
    body: [
      p("The moment a chatbot books an appointment, one question matters most: will it show up in the calendar I actually use? And its mirror: will the chatbot know when I am busy? The answers depend on how the product connects to calendars. Some read and write your Google or Outlook calendar in both directions. Others publish a one-way feed you subscribe to. Others hand over to a scheduling tool. This guide explains the three approaches, what each means in practice, what Crescelo does today, and how to avoid clashes whichever route you use."),

      h2("Three ways bookings reach your calendar"),
      table(["Method", "How it works", "Pros", "Cons"], ["Two-way sync", "The system reads your busy times and writes bookings into your calendar through Google or Microsoft's interfaces", "Personal events block slots automatically", "Requires permissions to your calendar; more setup and more that can break"], ["One-way calendar feed", "The system publishes bookings as an iCal feed you subscribe to from any calendar app", "Simple, works with Google, Apple and Outlook, no permissions to your calendar", "Read-only: your events do not block slots; feeds refresh on the calendar app's schedule"], ["Scheduling tool link", "The chatbot sends visitors to Calendly, Cal.com or similar, which connects to your calendar itself", "Mature scheduling features and sync", "The visitor leaves the chat to finish the booking"]),
      p("None is best in every case. Match the method to how complicated your day is."),

      h2("What Crescelo does today"),
      ul("**Built-in booking:** offers slots from your opening hours and one slot length, hides times already taken and locks a slot while it is booked.", "**Calendar feed:** every booking is added to a private, read-only calendar feed. Copy its address from the Appointments page and subscribe in Google Calendar (Other calendars, From URL), Outlook or Apple Calendar.", "**Add to calendar in chat:** after booking, visitors get options to add the appointment to Google Calendar, Apple Calendar or iCal.", "**Calendly and Cal.com:** the assistant can send visitors to your existing booking link if you prefer.", "**Two-way sync:** not available yet; it is on the roadmap."),
      p("See the current status on the [roadmap](/roadmap). We describe the limits plainly so you can plan around them."),

      h2("What a read-only feed means for you"),
      ol("Bookings made in the chat appear in your calendar app, usually within minutes to a few hours, depending on how often the app refreshes subscribed calendars. Google Calendar can be slow to refresh subscribed feeds.", "Events you add in your own calendar, such as a dentist appointment, do not stop the assistant offering that time.", "Changing or cancelling an event in your calendar app does not change the booking in Crescelo; do that in the Appointments page or through the customer's link."),
      p("Practical consequence: keep your booking hours as the single source of truth for when you can be booked. If you have a personal commitment, reduce your booking hours for that day, or use a scheduling tool with two-way sync for that part of your business."),

      h2("How to subscribe to the feed"),
      h3("Google Calendar"),
      ol("Open Google Calendar on a computer.", "Next to Other calendars, click the plus and choose From URL.", "Paste the feed address and add the calendar.", "Give it a colour so bookings stand out."),
      h3("Outlook"),
      ol("Open Calendar and choose Add calendar, then Subscribe from web.", "Paste the feed address and name the calendar.", "Import and choose a colour."),
      h3("Apple Calendar"),
      ol("In Calendar choose File, then New Calendar Subscription.", "Paste the feed address and set the refresh interval to the shortest option."),
      note("Treat the feed address like a password. Anyone with the link can read your bookings. If it is shared by mistake, regenerate it if your product allows, and subscribe again."),

      h2("Avoiding clashes in practice"),
      table(["Situation", "What to do"], ["You have a personal appointment in your calendar", "Close those hours in the booking settings, or keep a separate personal calendar and accept the risk for short blocks"], ["You take some bookings by phone", "Enter them in the dashboard or reduce booking hours so slots are not offered"], ["You use a second booking system", "Pick one as the source of truth, or divide by service or day"], ["You are away for a week", "Set your hours to closed for those days before you leave"], ["A customer changes their booking in the confirmation link", "The slot is freed automatically and the feed updates"]),

      h2("When two-way sync matters most"),
      ul("You have a busy personal or family calendar that changes often.", "You have several staff, each with their own calendar.", "You take bookings from many sources, such as phone, walk-ins and other platforms.", "You need meeting links created automatically."),
      p("If that is you, a scheduling tool that supports two-way sync is the better fit today, and the assistant can send visitors to it. See [AI website assistant vs Calendly and Acuity](/blog/ai-website-assistant-vs-calendly-acuity)."),

      h2("Confirmations and reminders"),
      p("Whatever calendar method you use, visitors should get a confirmation email with the details and a private link to reschedule or cancel, and a reminder before the appointment. Crescelo sends confirmations and email reminders, and the link frees the slot when a customer cancels. See [reducing no-shows](/blog/eliminate-service-no-shows-playbook) and [automated booking confirmations](/blog/automated-booking-confirmations-ical)."),

      h2("Questions to ask any vendor about calendar sync"),
      ol("Is the sync one-way or two-way?", "Which calendars are supported: Google, Microsoft, Apple?", "How quickly do changes appear?", "What permissions does it need to my calendar?", "What happens if I change or delete an event in my calendar?", "Can each staff member connect their own calendar?", "What happens if the connection breaks?"),

      h2("A worked example of how a booking travels"),
      table(["Step", "What happens", "Where you see it"], ["1", "A visitor books Thursday 10:30 in the chat", "Appointments page in the dashboard"], ["2", "A confirmation email is sent with a private change link", "The visitor's inbox"], ["3", "The booking is added to the private calendar feed", "Your Google, Outlook or Apple calendar after its next refresh"], ["4", "The visitor cancels using the link", "The slot is freed and offered again; the feed updates"], ["5", "You add a dentist visit at 10:30 Thursday in your own calendar", "Nothing changes in the booking system, so keep your booking hours clear of it"]),
      p("Step 5 is where people are caught out. A read-only feed only sends information one way, so anything you add to your calendar must also be reflected in your booking hours."),

      h2("If you have a team"),
      p("Each person's calendar is separate, and a single booking page cannot know who is free. For a team, the practical options today are one booking link per person through a scheduling tool such as Calendly or Cal.com, or a single shared pool of slots where whoever is free takes the booking, coordinated in your dashboard. Decide which suits your business, and write the rule down so that everyone follows it."),

      h2("Checklist before you rely on the feed"),
      ol("Subscribe to the feed in the calendar you check every morning.", "Book a test appointment and time how long it takes to appear.", "Cancel it using the customer link and check it disappears.", "Add a personal event during a bookable time and confirm you understand that it will not block the slot.", "Set your booking hours so they exclude times you know you are unavailable.", "Tell everyone on your team where to look."),

      h2("Why some vendors avoid two-way sync"),
      p("Two-way sync sounds obviously better, but it carries costs. It needs permission to read and write your calendar, which is sensitive, and it must handle edge cases: recurring events, all-day events, tentative events, several calendars, time zones and events that change after a booking. It can also fail silently when tokens expire, leaving you with a booking system that believes you are free when you are not. A read-only feed is simpler and safer, at the price of some manual discipline. Whichever you have, test what happens when a connection breaks, because that is when double bookings appear."),

      h2("Frequently asked questions"),
      faq(
        ["Does Crescelo sync with Google Calendar?", "Bookings appear in Google Calendar through a read-only feed you subscribe to. Two-way sync is not available yet and is on the roadmap."],
        ["Will personal events in my calendar block booking slots?", "Not with a read-only feed. Adjust your booking hours, or use a scheduling tool with two-way sync."],
        ["How often does a subscribed calendar update?", "That depends on the calendar app. Google Calendar can take several hours to refresh subscribed feeds; Outlook and Apple usually refresh more often."],
        ["Can I use Calendly with the assistant?", "Yes. Crescelo supports Calendly and Cal.com links as an alternative to the built-in picker."],
        ["What if I cancel an event in my calendar?", "With a one-way feed, the booking stays in the booking system until it is cancelled there."],
        ["Is the calendar feed private?", "It is a private link. Anyone who has it can read your bookings, so do not share it."],
      ),
      p("Read the [appointment booking feature](/product/appointment-booking) for the details, or try a booking flow in the [playground](/playground). When you are ready, [start a free trial](/login?mode=register)."),
    ],
  }),

  pillar({
    slug: 'conversational-ai-scheduling-vs-forms',
    title: 'Conversational Scheduling vs Booking Forms: Which Converts Better?',
    description: 'Compare chat-based scheduling with traditional booking forms and calendars: conversion, effort, accuracy, accessibility and when each works best for a service business.',
    primaryKeyword: 'conversational scheduling vs booking form',
    secondaryKeywords: ['chatbot booking vs form', 'appointment booking form conversion', 'online booking widget vs chat', 'scheduling chatbot'],
    body: [
      p("A visitor who wants an appointment can meet you in two places: a booking form or calendar page, or a chat that asks a few questions and shows times. Both can work, and each has real strengths. Forms are predictable and familiar. Conversation is friendly and can answer questions on the way to a booking. Which converts better depends on who your visitors are, what they need to know before they commit and how complicated your services are. This guide compares them fairly, explains where each breaks, gives you a way to test on your own site and shows how to offer both."),

      h2("What each format does well"),
      h3("Booking forms and calendar pages"),
      ul("**Familiar:** most people have used one.", "**Visual:** a grid of days and times shows everything at once.", "**Fast for the decided:** a returning customer who knows what they want can book in seconds.", "**Predictable for you:** the same fields every time."),
      h3("Conversational scheduling"),
      ul("**Answers questions on the way:** the visitor can ask about price or preparation without leaving the page.", "**Guides the undecided:** it can ask two or three questions and suggest the right service.", "**Natural language:** 'Thursday after school' or 'as early as possible next week' is easy to say.", "**Works well on mobile:** short messages beat tiny form fields.", "**Captures partial interest:** someone not ready to book can leave contact details instead."),

      h2("Where each one breaks"),
      table(["Format", "Typical failure"], ["Form or calendar", "The visitor has a question the page does not answer and leaves; too many fields; a calendar that is hard to use on a phone"], ["Chat", "Slow or wrong answers; a chat that forces a long conversation when the visitor just wants to pick a time; unclear when a person is available"]),

      h2("Which visitor prefers which"),
      table(["Visitor", "Prefers", "Why"], ["Returning customer who knows the service", "Form or calendar", "Quickest path"], ["First-time visitor with questions", "Chat", "Needs answers first"], ["Someone on a phone in a hurry", "Either, if it is short", "Both need to be thumb-friendly"], ["Someone unsure what to book", "Chat", "Needs guidance"], ["Someone who dislikes chatbots", "Form or calendar", "Wants control"], ["Someone with an unusual request", "Chat with handover", "Needs a person"]),
      p("Because different visitors prefer different formats, offering both usually beats choosing one."),

      h2("What the research and experience suggest"),
      p("Businesses report that adding a chat in front of a booking flow raises bookings when visitors have unanswered questions, and that it makes little difference when visitors already know what they want. There is no universal number, and it would be misleading to promise one. The reliable finding is directional: fewer steps and fewer unanswered doubts mean more completed bookings. Measure your own results rather than trusting an average."),

      h2("How to test on your own site"),
      ol("Record your baseline: visitors to the booking page and completed bookings for the last month.", "Add the chat next to the booking page or calendar for a month, without removing the form.", "Track bookings made in the chat, bookings made through the form and the total.", "Compare the total with the baseline, allowing for seasonality.", "Read the conversations that did not end in a booking to see why.", "Keep what works; adjust what does not."),
      table(["Metric", "Why it matters"], ["Total bookings per 100 visitors", "The number that counts"], ["Bookings by route (chat or form)", "Shows what visitors prefer"], ["Chats that ended without a booking", "Reveals gaps in answers"], ["Completed booking time", "Speed matters"], ["Abandonment on the form", "Shows friction"]),

      h2("Design principles for both"),
      ul("Show times quickly; do not make people click through many screens.", "Ask only for what you need: name and a way to reach them.", "State the price, duration and policy near the choice of time.", "Confirm clearly and send a confirmation with a change link.", "Make it work on a phone and with a keyboard and screen reader.", "Offer a person when the visitor needs one."),
      p("See [how AI appointment booking works](/blog/ai-appointment-booking) and [frictionless self-serve rescheduling](/blog/frictionless-self-serve-rescheduling) for the parts that follow the booking."),

      h2("How to combine them"),
      ol("Keep the booking page or calendar as the home for people who know what they want.", "Place the chat on the same page and on the pages where questions arise, such as pricing and services.", "Let the chat offer real times and confirm the booking, or send the visitor to the calendar with the service selected.", "Use the same availability for both, so they never disagree.", "Send confirmations from one place."),
      p("In Crescelo the chat can book with the built-in slot picker or send visitors to your Calendly or Cal.com link. Bookings appear in your dashboard and in a read-only calendar feed. See the [appointment booking feature](/product/appointment-booking)."),

      h2("Accessibility"),
      p("Calendar grids can be difficult for keyboard and screen reader users, and chat windows must be built carefully. Test both with a keyboard, check contrast and make sure messages are announced to assistive technology. Offering both formats also helps people who find one of them hard. See [accessibility for website chatbots](/blog/accessibility-wcag-compliance-website-chatbots)."),

      h2("Cost and effort"),
      table(["", "Booking form or calendar", "Chat assistant"], ["Setup", "Hours or calendar and services", "Content, testing and calendar rules"], ["Upkeep", "Update services and hours", "Update content and review conversations"], ["Cost", "Often free to low monthly fee", "Subscription plus small AI usage"], ["Extra value", "Simple and predictable", "Answers questions, captures leads, reports on what visitors ask"]),

      h2("A worked example: two ways to book the same haircut"),
      table(["Step", "Booking form", "Chat"], ["1", "Visitor opens the booking page, chooses a service from a list of twelve", "Visitor asks 'Do you do skin fades and how long does it take?'"], ["2", "Picks a date on a calendar and scans for times", "Assistant answers, shows three available times"], ["3", "Fills in name, phone and email fields", "Visitor picks a time; assistant asks for name and number"], ["4", "Wonders about parking, leaves to check the site", "Visitor asks about parking in the same chat; gets the answer"], ["5", "Submits or abandons", "Confirms; gets a confirmation email with a change link"]),
      p("The form is quicker for someone who knows exactly what they want. The chat is quicker for someone with a question. A page offering both serves each."),

      h2("Where a form still wins"),
      ul("Very simple services where nothing needs explaining.", "Returning customers rebooking the same thing every month.", "Customers who distrust chatbots or want to see every option at once.", "Situations where regulation requires a specific form or consent wording."),
      p("Keep the form as the fast lane. Add the chat where visitors hesitate."),

      h2("Where chat wins most clearly"),
      ul("Complex services where visitors do not know what to book.", "Pricing pages, where visitors have cost questions.", "Out-of-hours visits, when nobody can reply to a form until morning.", "Mobile visits, where long forms feel heavy.", "Traffic from social media, where visitors arrive with a question, not a plan."),

      h2("Common design mistakes"),
      ul("Forcing the chat to ask every field even when the visitor wants a calendar.", "Hiding the calendar behind the chat.", "Asking for a phone number before showing any time.", "Sending different confirmations from the form and the chat.", "Letting the two use different availability so they disagree.", "Not telling visitors they are talking to an AI."),
      p("One test catches most of these: book the same appointment both ways, on a phone, and compare the experience honestly."),

      h2("Questions to answer before you decide"),
      ol("What share of visitors to your booking page book today, and what do the others ask when they contact you?", "How many enquiries arrive outside your hours?", "How complicated are your services: could a first-time visitor pick the right one from a list?", "How much of your traffic is on phones?", "Who will keep the chat's content accurate?", "Do you have a person who can join a conversation when needed?"),
      p("If most enquiries are simple and visitors book easily, a good form or calendar is enough. If visitors regularly ask questions before booking, add a chat and measure the difference."),

      h2("Frequently asked questions"),
      faq(
        ["Does a chatbot convert better than a booking form?", "It depends on whether visitors have questions. Chat helps undecided visitors; forms are faster for decided ones. Testing both on your own site gives the answer."],
        ["Should I remove my booking form if I add a chatbot?", "Usually not. Offer both and let visitors choose."],
        ["Can a chatbot show real available times?", "Yes, in products with booking. Crescelo's built-in picker shows slots from your opening hours and hides those already taken."],
        ["What are the downsides of chat booking?", "Slow or wrong answers, or forcing a long chat on someone who just wants to pick a time. Good design and a visible calendar option avoid both."],
        ["How do I measure which works better?", "Compare total bookings per 100 visitors before and after, and track bookings by route."],
        ["Is chat booking accessible?", "It can be, if the widget is built for keyboard and screen readers. Test it and offer an alternative."],
      ),
      p("You can try a sample booking flow in the [playground](/playground). To go deeper, read [AI appointment booking](/blog/ai-appointment-booking) and [start a free trial](/login?mode=register)."),
    ],
  }),

  pillar({
    slug: 'multilingual-ai-website-chatbot',
    title: 'Multilingual AI Chatbot: Serving Customers in More Than One Language',
    description: 'How to run an AI chatbot in several languages: how models handle languages, writing content, testing, local terms, right-to-left text, handover and mistakes to avoid.',
    primaryKeyword: 'multilingual AI chatbot',
    secondaryKeywords: ['chatbot in multiple languages', 'multilingual customer support AI', 'AI chatbot Spanish English', 'translate chatbot answers'],
    body: [
      p("Many service businesses serve customers who speak more than one language: a clinic in a city with large immigrant communities, a salon near a tourist area, a law firm serving clients across borders. A chatbot that answers in the visitor's own language can turn a bounce into a booking. Modern language models can converse in dozens of languages, which makes multilingual support far more accessible than it used to be. But easy does not mean automatic. This guide explains how multilingual chatbots work, how to write your content for them, how to test what matters, and the mistakes that quietly damage trust."),

      h2("How a multilingual assistant works"),
      p("A language model can read a question in one language and reply in that language, even when the source documents are in another. The assistant retrieves passages from your content, usually in one language, and writes an answer in the visitor's language. Some retrieval models understand meaning across languages, which lets a Spanish question find an English passage. This is powerful, and it has limits: the further a language is from the ones the model handles best, the more likely errors are, especially in names, prices, dates and technical terms."),
      table(["Approach", "How it works", "Good for", "Watch for"], ["One set of content, replies in the visitor's language", "The assistant translates as it answers", "Fast to start; small businesses", "Translation errors in prices, policies and legal terms"], ["Content in each language", "You provide documents per language", "Higher stakes or important languages", "Keeping versions in sync"], ["Hybrid", "Core documents in your main language, key policies and prices in others", "Most businesses", "Deciding what to translate"]),

      h2("Decide which languages you really serve"),
      p("Look at your customers, not at a list of possibilities. Check your analytics for browser languages, look at past enquiries and ask your team. Support the languages you can review, or at least sample, because you are responsible for what the assistant says on your behalf. Starting with your two or three most important languages is better than claiming twenty and being unable to check any."),

      h2("Writing content that translates well"),
      ul("**Use clear, plain sentences.** Idioms and jokes do not translate.", "**Keep terms consistent.** Call a service the same thing everywhere, so the assistant does not invent variants.", "**Put prices and numbers in a consistent format,** and state the currency.", "**Avoid ambiguous abbreviations.**", "**Explain local terms:** 'a deposit', 'a patch test', 'a strata report' may not be understood by a visitor from elsewhere.", "**State dates in an unambiguous format,** for example 12 June 2026."),
      p("A glossary document listing key terms and their approved translations helps. Load it into the knowledge base so the assistant uses your preferred wording."),

      h2("Testing each language properly"),
      ol("Ask the ten most common questions in each language, in natural wording, with typos and casual phrasing.", "Ask something your content cannot answer and check that the assistant says it does not know in that language.", "Check prices, dates and times for correctness and formatting.", "Ask the assistant to book an appointment, and check the confirmation email language.", "Ask for a person and check the handover message.", "Have a fluent speaker read the results, not only a translation tool."),
      table(["Check", "Why"], ["Prices and currency", "Errors here cost money"], ["Policy wording", "Cancellation and refund statements must be accurate"], ["Tone and formality", "Some languages have formal and informal address; choose deliberately"], ["Names and places", "Models can mangle unusual names"], ["Safety wording", "Emergency instructions must be exact"]),

      h2("Formality, tone and culture"),
      p("Languages differ in how formal a business should sound. In many languages, a choice between informal and formal 'you' signals respect or friendliness. Decide the tone for each language with a native speaker and put it in the assistant's instructions. Be careful with humour, emojis and idioms. What is friendly in one culture can be odd or rude in another."),

      h2("Right-to-left languages and special characters"),
      p("Arabic, Hebrew and some other languages are written right to left. The chat window must display them properly, including mixed text such as an Arabic sentence containing a phone number or an English brand name. Check that names, numbers and punctuation appear in the right order, and test on phones. Fonts must support the characters you need. Test each script you plan to serve."),

      h2("Language detection and switching"),
      p("Most assistants respond in the language of the visitor's message. Allow visitors to switch language mid-conversation, and do not assume the browser language is the language they want to use. If your product offers a language switcher, place it where people can see it. Crescelo's Growth plan includes a multilingual switcher covering six languages, and the assistant can also reply in the language a visitor writes in, subject to the model you choose. Check the current plan details on the [pricing page](/pricing)."),

      h2("Handover across languages"),
      p("When a visitor asks for a person, make sure someone who speaks their language can help. If you cannot offer that, say so honestly in the visitor's language, and offer a route that works, such as an email answered in their language within a day. A handover to a person who cannot understand the visitor is worse than none."),

      h2("Legal and privacy notices in every language"),
      p("Privacy notices and AI disclosures should be understandable to the people who see them. Provide them in each language you support, or at least in the language of the chat. Where the law requires information in a particular language, provide it. This is general information, not legal advice. See the [GDPR checklist for website chatbots](/blog/website-chatbot-gdpr-checklist)."),

      h2("Quality risks and how to manage them"),
      table(["Risk", "Example", "Mitigation"], ["Mistranslated price or policy", "A refund window stated wrongly", "Provide key policies in each supported language and test them"], ["Made-up answers in a weaker language", "Confident wrong statement", "Ground answers in documents and test unanswerable questions"], ["Inconsistent terms", "Two names for one service", "Use a glossary"], ["Tone mismatch", "Too casual for a formal culture", "Set tone per language"], ["Unsupported language", "Visitor writes in a language you cannot review", "State the languages you support and offer a route to a person"]),

      h2("A rollout plan"),
      ol("Choose two or three languages based on your customers.", "Translate or write the key documents: services, prices, policies and hours.", "Add a glossary.", "Test the ten common questions in each language with a native speaker.", "Set language-specific greetings and tone.", "Prepare handover in each language.", "Launch, and review conversations by language weekly for the first month."),

      h2("A sample exchange in two languages"),
      table(["Speaker", "Message"], ["Visitor (Spanish)", "Hola, cuanto cuesta una limpieza dental y tienen citas el sabado?"], ["Assistant (Spanish)", "Hola. Una limpieza dental cuesta 85 dolares y dura unos 45 minutos. Los sabados atendemos de 9 a 1. Quiere que le muestre los horarios disponibles?"], ["Visitor (Spanish)", "Si, por favor. A las 10 si es posible."], ["Assistant (Spanish)", "Tengo libre el sabado a las 10:00. Me dice su nombre y un telefono para confirmar la cita?"]),
      p("The clinic's documents were in English. The assistant read the English price list and hours and answered in Spanish, then moved to a booking. A fluent speaker should still check a sample like this before launch, particularly the price, the duration and the confirmation email."),

      h2("Keeping translations current"),
      p("Multilingual content doubles the work of updating. When a price changes, change it in every language version, or keep prices only in one master document and let the assistant translate the answer. Decide which approach you can sustain. A simple rule helps: any fact that changes often lives in exactly one place, and any text that rarely changes, such as your process description, can be translated once and reviewed twice a year."),

      h2("Related reading"),
      ul("[How to stop a chatbot from making things up](/blog/grounded-ai-chatbot-hallucinations) matters even more in languages the model handles less well.", "[Bilingual local service chat](/blog/bilingual-local-service-chat) shows how a neighbourhood business applies this.", "[Immigration law multilingual intake](/blog/immigration-law-multilingual-intake-chat) covers a high-stakes example."),

      h2("What to put in the assistant's instructions"),
      ul("Reply in the language the visitor writes in, unless they ask to switch.", "Use the approved terms from the glossary, and never translate the names of services, staff or places.", "State prices with the currency symbol and code, for example $85 USD.", "If unsure of a translation for a policy or safety statement, say so and offer a person.", "Keep a consistent level of formality for each language.", "Never guess in a language you cannot handle well; say which languages you support and offer an alternative."),
      p("Short, specific instructions like these are easier to test than a long description of tone. Test them by asking the same question in each language and comparing the answers side by side."),

      h2("Frequently asked questions"),
      faq(
        ["Can an AI chatbot answer in multiple languages?", "Yes. Modern language models can reply in the visitor's language. Accuracy varies by language, so test each one you serve."],
        ["Do I need to translate my documents?", "Not always, but key policies, prices and safety information should be checked in each language, ideally provided in that language."],
        ["How many languages should I support?", "Support the languages your customers use and that you can review. Start with two or three."],
        ["Does the chatbot detect the visitor's language?", "It usually replies in the language of the visitor's message. Offer a language switcher as well."],
        ["Does Crescelo support multiple languages?", "The Growth plan includes a multilingual switcher for six languages, and the assistant can reply in the visitor's language depending on the model you connect."],
        ["How do I check translation quality?", "Have a fluent speaker read real conversations and test prices, policies and unanswerable questions in each language."],
      ),
      p("Try a question in another language in the [playground](/playground) with your own documents, and read [how the AI assistant](/product/ai-assistant) answers from your content. See also [chatbot accessibility](/blog/accessibility-wcag-compliance-website-chatbots)."),
    ],
  }),
];
