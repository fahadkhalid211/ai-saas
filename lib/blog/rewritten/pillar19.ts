import { faq, h2, h3, note, ol, p, pillar, table, ul } from '../authoring';

export const PILLAR19 = [
  pillar({
    slug: 'double-booking-prevention-concurrency-mutex',
    title: 'How Online Booking Systems Prevent Double Bookings (Slot Locking Explained)',
    description: 'A plain and technical explanation of how booking systems stop two people taking the same slot: race conditions, locks, database constraints, retries and how to test your own system.',
    primaryKeyword: 'prevent double booking online scheduling',
    secondaryKeywords: ['double booking race condition', 'slot locking booking system', 'concurrency appointment booking', 'how to avoid double bookings'],
    body: [
      p("Two customers open your booking page at the same moment. Both see 3:00 p.m. on Thursday as free. Both click Book within a second of each other. What should happen is simple: one gets the slot, the other is offered the next time. What often happens in poorly built systems is that both bookings succeed, and you discover the clash when two people turn up. This is called a race condition, and it is one of the most common defects in online booking. It is also invisible in testing, because a single tester never clicks at the same instant as another. This guide explains why double bookings happen, the techniques that prevent them, how a chat assistant fits in, what to ask a vendor and how to test your own system. It starts in plain language and goes as deep as a technically curious owner or developer would want."),

      h2("Why double bookings happen"),
      p("Booking has three steps: show the free times, let the customer choose one, and save the booking. Between showing a time and saving it, the world can change. Another customer may have taken it. A naive system checks availability when it displays the times and never checks again."),
      table(["Moment", "System A (naive)", "System B (careful)"], ["Customer 1 sees 3:00 free", "Free", "Free"], ["Customer 2 sees 3:00 free", "Free", "Free"], ["Customer 1 clicks Book", "Saves the booking", "Checks again, locks the slot, saves"], ["Customer 2 clicks Book a moment later", "Saves a second booking for 3:00", "Checks again, finds it taken, offers the next time"], ["Result", "Double booking", "One booking, one polite alternative"]),
      p("The difference is the second check, made at the moment of saving and made safe against simultaneous requests."),

      h2("The techniques"),
      h3("1. Check again at confirmation"),
      p("Never trust the availability shown earlier. Before saving, look at the current bookings for that slot. This alone removes most double bookings, but not all: two requests can both pass the check in the same instant, before either has saved."),
      h3("2. Lock the slot while saving"),
      p("A lock makes the check-and-save step indivisible. The first request takes the lock for that slot, checks, saves and releases. The second request has to wait, then checks again and finds the slot taken. On one server this can be an in-memory lock. On several servers, which is normal in cloud hosting, the lock must be shared, for example through the database or a shared cache, otherwise each server believes it holds the only lock."),
      h3("3. Let the database enforce it"),
      p("The strongest protection is a rule in the database itself that two bookings cannot share the same slot, such as a unique constraint on the combination of resource and start time. Even if application code has a bug, the database rejects the second booking. The application then catches the rejection and offers the next time. This is the safety net for every other technique."),
      h3("4. Hold a slot briefly during checkout"),
      p("If booking involves several steps, such as entering details or paying, systems sometimes hold the slot for a few minutes so nobody else can take it while the customer types. The hold expires if the booking is not completed."),
      h3("5. Handle failure kindly"),
      p("When a customer loses the race, the experience matters. 'That time was just taken. Here are the next available times' is far better than an error message. In a chat, the assistant can say it in one friendly line and show alternatives."),

      h2("Layers, not a single trick"),
      table(["Layer", "What it does", "What it catches"], ["Check at confirmation", "Rejects slots already taken", "Most clashes"], ["Shared lock", "Serialises simultaneous requests", "Near-simultaneous clicks"], ["Database constraint", "Refuses duplicates at the source", "Bugs and unusual timing"], ["Graceful retry", "Offers the next time", "Keeps the customer"]),
      p("A trustworthy booking system has at least the first three. Crescelo's built-in booking hides slots that are already taken and locks a slot while it is being booked, so two visitors cannot get the same time, and a visitor who loses the race is offered the next one."),

      h2("Where the AI fits in"),
      p("An AI assistant should never decide availability itself. A language model can misread or invent times. The safe design is that the assistant handles the conversation and the booking engine handles the calendar: the assistant asks the engine for free slots, presents them, and asks the engine to book the chosen one. If the engine says the slot is gone, the assistant relays that and offers more. This separation is what makes chat booking reliable. See [AI appointment booking](/blog/ai-appointment-booking) and [stop double bookings online](/blog/stop-double-bookings-online) for the practical view."),

      h2("Other ways double bookings sneak in"),
      ul("**Two systems, one calendar.** Bookings made in a booking tool and by phone into a separate diary clash unless both use the same source of truth.", "**Personal events not blocking slots.** A read-only calendar feed shows bookings in your calendar but does not block slots when you add events there; adjust booking hours to match your real availability. See [AI bookings in Google and Outlook Calendar](/blog/sync-ai-booking-google-outlook-calendar).", "**Time zone and daylight saving errors.** A booking stored in the wrong zone can overlap another.", "**Resource confusion.** Two staff or rooms treated as one, or one treated as two.", "**Manual changes.** Staff overriding the system without updating it."),

      h2("How to test your own system"),
      ol("Open the booking page in two browser windows, or on two devices.", "Select the same slot in both without booking.", "Click Book in one, then immediately in the other.", "Check that only one booking exists, and that the second window shows a helpful message.", "Repeat with two people clicking at the same instant, if you can arrange it.", "Test through the chat as well as the booking page.", "Try booking a slot that a phone booking has just taken."),
      p("If both succeed, the system has a race condition. Report it to your vendor with these steps, or fix it with the layers above. A developer can also write an automated test that fires many simultaneous requests at the same slot and checks that exactly one succeeds."),

      h2("What to ask a vendor"),
      ul("How do you prevent two bookings for the same slot?", "Is there a database rule as well as application checks?", "What happens if two servers process requests at once?", "How does the customer who loses the race experience it?", "Can you show a test or a description of your concurrency handling?"),
      p("A confident answer names the layers. A vague 'we handle that' deserves a test."),

      h2("Recovery: when a double booking happens anyway"),
      ol("Contact both customers promptly and apologise.", "Offer the customer who booked second the earliest alternative, and consider a small gesture.", "Find the cause so it does not repeat.", "Record the incident and what you changed."),
      p("Treat it as a defect to fix, not bad luck. The cost of two disappointed customers is larger than the cost of a fix."),

      h2("Frequently asked questions"),
      faq(
        ["How do booking systems avoid double bookings?", "By checking availability again when the customer confirms, locking the slot while it is saved and using a database rule that forbids two bookings in the same slot."],
        ["What is a race condition in booking?", "A defect where two simultaneous requests both see a slot as free and both succeed. It is fixed with locks and database constraints."],
        ["Can an AI chatbot cause double bookings?", "Not if it only relays the booking engine's results. It becomes risky only if the model decides availability itself."],
        ["Does Crescelo prevent double bookings?", "Its built-in booking hides taken slots and locks a slot while it is being booked, so two visitors cannot get the same time."],
        ["How do I test for double booking?", "Open the booking page twice, select the same slot in both and confirm in quick succession. Only one should succeed."],
        ["What if I take bookings by phone as well?", "Enter phone bookings into the same system, or reduce booking hours so slots are not offered twice."],
      ),
      p("See how [booking works in Crescelo](/product/appointment-booking), try a booking flow in the [playground](/playground) and read [AI appointment booking](/blog/ai-appointment-booking)."),
    ],
  }),

  pillar({
    slug: 'stop-double-bookings-online',
    title: 'How to Stop Double Bookings: A Practical Guide for Service Business Owners',
    description: 'A non-technical guide to preventing double bookings: one source of truth, real-time availability, phone and walk-in bookings, staff calendars, buffers and a weekly check.',
    primaryKeyword: 'how to stop double bookings',
    secondaryKeywords: ['avoid double booking appointments', 'double booking prevention small business', 'scheduling conflicts service business', 'online booking mistakes'],
    clusterId: 2,
    clusterName: 'AI Appointment Booking',
    funnel: 'MOFU',
    tags: ['Booking', 'Small business', 'AI Appointment Booking'],
    related: ['add-ai-chatbot-to-your-website', 'ai-receptionist-vs-answering-service'],
    body: [
      p("A double booking is a small disaster with a big cost. Two customers arrive for the same slot, one of them is disappointed, a practitioner is flustered, and you may lose both customers' goodwill and future business. It usually happens for ordinary reasons: a booking taken on the phone that never reached the online calendar, a page that shows stale availability, a staff member who changed a time in one place but not another. This guide is for owners and managers, not developers. It explains the common causes in plain words, gives you a checklist to close each gap, shows how to handle bookings from several channels, covers walk-ins, breaks and buffers, and gives you a weekly routine that catches problems before customers do. For the technical side, see [how online booking systems prevent double bookings](/blog/double-booking-prevention-concurrency-mutex)."),

      h2("The five usual causes"),
      table(["Cause", "How it happens", "Fix"], ["Two calendars", "Phone bookings go in a paper diary; online bookings in a system", "One source of truth"], ["Stale availability", "The page shows times that were taken minutes ago", "Real-time availability with a re-check at confirmation"], ["Simultaneous clicks", "Two customers pick the same time at once", "A booking system that locks the slot"], ["Manual overrides", "Staff move or add bookings without updating the system", "Everything through the same tool"], ["Wrong availability", "Booking hours do not match who is actually working", "Regular review of hours and holidays"]),

      h2("Rule 1: one source of truth"),
      p("Decide where bookings live and put every booking there, whichever way it arrives. That means phone bookings, walk-ins you agree to and bookings made by staff. If a receptionist takes a call, they enter it into the same system the website uses, immediately. If your team also keeps a personal calendar, that calendar should display the system's bookings, not be a second place to record them."),
      ul("Retire the paper diary or use it only as a backup.", "Give staff a quick way to add a booking on their phone.", "Make the rule visible: 'if it is not in the system, it does not exist.'"),

      h2("Rule 2: a system that checks at the moment of booking"),
      p("Availability shown on a page is a snapshot. A good booking system checks again the moment a customer confirms, and locks the slot while saving. Ask your vendor how they do it. Crescelo's built-in booking hides slots that are already taken and locks a slot while it is being booked, so two visitors cannot get the same time, and the second is offered the next one."),

      h2("Rule 3: keep availability honest"),
      ul("Set opening hours and booking hours to match the real week, including days closed.", "Update for holidays, training days and staff leave before they happen.", "If your tool has only one slot length, choose the length that fits your main service, and describe longer services so customers book consecutive slots or contact you.", "If your calendar feed is read-only, remember that events you add in your own calendar do not block slots; close those times in your booking hours."),
      p("See [configuring availability rules](/blog/configure-calendar-sync-availability-rules) for the settings that matter."),

      h2("Rule 4: handle several channels"),
      table(["Channel", "How to keep it in sync"], ["Website booking or chat", "The booking system is the source"], ["Phone", "Enter into the system while on the call"], ["Walk-ins", "Add them as they arrive, or reserve walk-in windows outside bookable time"], ["Social media messages", "Send people to the booking link instead of taking bookings in messages"], ["Third-party marketplaces", "Use one that syncs, or keep its slots separate and limited"]),
      p("Every extra channel is another place a booking can be recorded only half-way. Limit channels you cannot connect."),

      h2("Rule 5: staff and resources"),
      ul("If several people take bookings, each person's time must be tracked separately, either with per-person booking links or a tool that supports staff calendars.", "If rooms, chairs or equipment are limited, track them as well; a booking can be free for the person but not for the room.", "Make sure a person on leave has no bookable time."),
      p("Crescelo's built-in booking uses your opening hours and one slot length; for per-person calendars, use Calendly or Cal.com links per person. See [multi-staff scheduling with a chatbot](/blog/multi-staff-scheduling-ai-chatbot)."),

      h2("Rule 6: buffers and realistic lengths"),
      p("Many apparent double bookings are really overruns: a service takes longer than its slot and collides with the next. Set slot lengths to include clean-up and notes, and add a gap after long or unpredictable services. See [service durations and buffer times](/blog/service-durations-buffer-times-ai-scheduling)."),

      h2("Rule 7: make changes easy and visible"),
      p("When customers change or cancel, the system should free the slot immediately and confirm the new time. A private change link in every confirmation means fewer phone changes that might be recorded wrongly. See [self-serve rescheduling](/blog/frictionless-self-serve-rescheduling)."),

      h2("A weekly five-minute check"),
      ol("Open next week's schedule and scan for overlaps.", "Check that holidays and leave are reflected.", "Compare the phone diary or notes with the system.", "Look at last week's cancellations and changes for anything odd.", "Book a test appointment and confirm it appears in the right places."),
      p("Five minutes a week catches nearly every problem while it is still small."),

      h2("If it happens anyway"),
      ol("Call both customers as soon as you know, and apologise plainly.", "Offer the later booker the earliest alternative, and consider a gesture such as a small discount.", "Find out how it happened and fix that step.", "Tell your team what changed.", "Note it, so you can see whether the fix works."),

      h2("How an assistant helps"),
      p("A chat that books from real availability removes many manual steps. The assistant asks the booking engine for free times and books the chosen one, so it cannot invent a slot. It also answers 'am I booked?' questions and points to the change link, which reduces phone calls that lead to manual mistakes. See [AI appointment booking](/blog/ai-appointment-booking) and the [appointment booking feature](/product/appointment-booking)."),

      h2("Worked example: a salon that found the cause"),
      p("A salon had two double bookings in a month and could not explain them. The owner traced each to its source. One came from a phone booking written in the front-desk diary but not entered into the online system. The other came from a stylist who moved a client to a different time in her own calendar but not in the booking tool. The fix was not technical: phone bookings were entered into the system while the caller was still on the line, and stylists agreed to make every change in one place. The owner also began a five-minute weekly check of next week's schedule. In the following six months, there were no double bookings."),

      h2("Frequently asked questions"),
      faq(
        ["What is the main cause of double bookings?", "Recording bookings in more than one place, followed by systems that do not re-check availability at the moment of confirmation."],
        ["How do I avoid double bookings between phone and online?", "Enter phone bookings into the same system the website uses, immediately."],
        ["Do calendar feeds block my personal events?", "Not with a read-only feed. Adjust your booking hours so slots are not offered when you are busy."],
        ["Can two people book the same slot at once?", "Not in a system that locks the slot while saving. Test yours by trying it from two windows."],
        ["What should I do if a double booking happens?", "Contact both customers quickly, offer an alternative and fix the cause."],
        ["How often should I check my schedule?", "A five-minute weekly review is enough for most small businesses."],
      ),
      p("Try a booking conversation in the [playground](/playground), and [start a free trial](/login?mode=register) to see booking with slot locking on your own hours."),
    ],
  }),

  pillar({
    slug: 'automated-booking-confirmations-ical',
    title: 'Booking Confirmations That Work: Email Details, Calendar Files and Change Links',
    description: 'What a good booking confirmation contains, how calendar files and links work, timing, wording, deliverability, and mistakes that cause confusion and no-shows.',
    primaryKeyword: 'booking confirmation email',
    secondaryKeywords: ['appointment confirmation email template', 'add to calendar link ical', 'booking confirmation best practices', 'ics calendar file booking'],
    body: [
      p("The moment after someone books is when their attention is highest and their doubts are strongest. Did it go through? What time exactly? Where do I go? What if I need to change it? A good confirmation answers all of that in seconds, and a poor one creates confusion that turns into phone calls, wrong arrivals and no-shows. Confirmations are also the cheapest marketing and service tool you have: they are opened at very high rates, they set the tone for the relationship and they can carry everything the customer needs. This guide explains what a great confirmation contains, how calendar files and add-to-calendar links work, when to send messages, how to word them, how to keep them reliably delivered and which mistakes to avoid."),

      h2("What a confirmation must contain"),
      table(["Item", "Why it matters"], ["Service and duration", "Confirms what was booked and how long to allow"], ["Date, day and time with time zone", "The most important detail"], ["Practitioner or location", "So they go to the right place and person"], ["Address, map link, parking and transport", "Removes the most common reason for late arrivals"], ["Price and what it includes", "Avoids surprises at payment"], ["What to bring or do beforehand", "Preparation"], ["Cancellation and lateness policy, briefly", "Sets expectations"], ["A private link to change or cancel", "Turns would-be no-shows into rebookings"], ["Contact details", "For urgent questions"]),
      p("Put the date, time and place at the top, in large plain text. The rest can follow."),

      h2("The subject line"),
      p("A clear subject line is easy to find later. Use the pattern 'Your [service] on [day, date] at [time]'. Example: 'Your haircut on Thursday 12 June at 2:30 p.m. is confirmed'. Avoid vague subjects such as 'Booking received' or marketing-style headlines."),

      h2("Calendar files and add-to-calendar links"),
      p("Many people forget appointments because they never reach their calendar. Two features help:"),
      ul("**An attached calendar file (with an .ics extension):** opening it adds the event to Google Calendar, Apple Calendar, Outlook and others. It includes the time, place and description.", "**An add-to-calendar link or button:** one tap opens the calendar app with the details filled in. After booking in the Crescelo chat, visitors get options to add the appointment to Google Calendar, Apple Calendar or iCal."),
      p("Test the calendar file on both iPhone and Android and with the main email apps, because some behave differently. Make sure the time zone is correct, especially for customers in other zones or around daylight saving changes."),

      h2("Change and cancel links"),
      p("A private link that lets the customer move or cancel without logging in is the single most useful item in a confirmation. It should open a simple page showing available times and confirm the change by email. Crescelo's confirmation email contains a private link to reschedule or cancel, and the freed slot becomes available again immediately. See [self-serve rescheduling](/blog/frictionless-self-serve-rescheduling)."),

      h2("Timing"),
      table(["When", "Message"], ["Immediately after booking", "Confirmation with all details"], ["A few days before", "Reminder with the change link"], ["The day before or morning of", "Short reminder with address and running-late instructions"], ["After the appointment", "Thank you and rebooking link"]),
      p("Crescelo sends confirmations and email reminders before the appointment. See [SMS versus email reminders](/blog/sms-vs-email-appointment-reminders-conversions) for choosing channels and [how to reduce no-shows](/blog/eliminate-service-no-shows-playbook) for the whole plan."),

      h2("Wording that works"),
      table(["Weak", "Better"], ["Your booking has been received.", "You are booked: haircut with Priya, Thursday 12 June at 2:30 p.m., 45 minutes. Brook Salon, 14 High Street."], ["Please contact us to cancel.", "Need to change it? Tap here to pick a new time. It is free until 24 hours before."], ["Arrive on time.", "Please arrive 5 minutes early. If you are running late, message us; after 15 minutes we may need to shorten your service."]),
      ul("Use the customer's first name.", "Keep paragraphs short.", "Make the key details stand out.", "Avoid marketing clutter."),

      h2("Deliverability: making sure it arrives"),
      ul("Send from your own domain, with authentication set up (SPF, DKIM and DMARC) so mailbox providers trust it.", "Use a reliable sending service; Crescelo supports configuring an email sending service such as SMTP or Resend.", "Avoid spam-trigger wording and huge images.", "Ask customers to check spam if they do not see it, and offer another route if you notice bounces.", "Monitor bounces and complaints."),
      p("See [configuring custom SMTP and Resend for booking emails](/blog/configure-custom-smtp-resend-booking-emails)."),

      h2("Accessibility and readability"),
      ul("Use real text, not text in images.", "Keep contrast good and font sizes readable on phones.", "Make links and buttons large and clearly labelled.", "Include a plain-text version."),

      h2("Mistakes that cause confusion"),
      ul("Times without a time zone for customers in other zones.", "A calendar file with the wrong time.", "No address or a vague location.", "Hidden change links in tiny print.", "Sending nothing until the day before.", "Contradicting the website's policy."),

      h2("A confirmation template"),
      p("Subject: Your cut and colour on Friday 12 June at 1:00 p.m. is confirmed. Body: Hi Sam, you are booked with Priya on Friday 12 June at 1:00 p.m. (about 3 hours) at Brook Salon, 14 High Street. Parking is behind the shop. Please arrive 5 minutes early. Total price from $145. Need to change it? Use this link, free until 24 hours before. Add to your calendar here. See you soon."),

      h2("Worked example: a clinic's confirmation rewrite"),
      p("A physiotherapy clinic's old confirmation said only 'Your appointment has been booked' with a date. New patients regularly went to the wrong entrance, arrived late for forms or phoned to ask about parking. The clinic rewrote the message: date and time at the top, the practitioner's name, the exact entrance and parking instructions with a map link, what to wear and bring, a note about arriving ten minutes early and a link to change the booking. It also added the add-to-calendar option. Within two months phone calls about directions and changes fell noticeably, late arrivals dropped and no-shows fell from nine percent to six. The rewrite took an afternoon and cost nothing."),
      table(["Before", "After"], ["'Your appointment is booked.'", "Full details, entrance, parking, preparation"], ["No calendar option", "Add to calendar with correct time zone"], ["Change by phone only", "Private change link"], ["Frequent calls about directions", "Far fewer"]),

      h2("A checklist for your own confirmation"),
      ul("Read it on a phone: can you see the date, time and place without scrolling?", "Open the calendar file: is the time correct in your zone and another?", "Click the change link: does it show real times?", "Check the sender name and address look trustworthy.", "Send a test to Gmail, Outlook and Apple Mail and look at spam folders.", "Ask a new customer if anything was unclear."),

      h2("Frequently asked questions"),
      faq(
        ["What should a booking confirmation include?", "Service, date, time with time zone, place, price, preparation, policy in brief and a link to change or cancel."],
        ["What is an ICS file?", "A calendar file that adds an event to most calendar apps when opened, including the time, place and description."],
        ["Does Crescelo send confirmations?", "Yes, an email with a private link to reschedule or cancel, plus reminders before the appointment, and add-to-calendar options in the chat."],
        ["When should I send reminders?", "A few days before and again the day before or morning of, with the change link."],
        ["Why do confirmations end up in spam?", "Usually missing email authentication or a poor sending setup. Configure your domain and a reliable sending service."],
        ["Should the confirmation include my policy?", "Yes, briefly, with a link to the full text."],
      ),
      p("See the [appointment booking feature](/product/appointment-booking), test a booking in the [playground](/playground) and read [AI appointment booking](/blog/ai-appointment-booking)."),
    ],
  }),

  pillar({
    slug: 'service-durations-buffer-times-ai-scheduling',
    title: 'Appointment Lengths and Buffers: How to Set Durations That Keep Your Day on Time',
    description: 'How to choose service durations and buffer times for online booking: measuring real times, buffers for cleaning and notes, back-to-back risks, tool limits and adjusting over time.',
    primaryKeyword: 'appointment duration and buffer time',
    secondaryKeywords: ['service duration online booking', 'buffer time between appointments', 'scheduling buffer', 'appointment length settings'],
    body: [
      p("Most schedules fail quietly. The first appointment overruns by ten minutes, the second starts late, the third is rushed and by afternoon everyone is apologising. The cause is rarely a big mistake; it is a series of optimistic durations and no breathing room. Online booking makes this more visible, because a customer chooses a slot without knowing what your day looks like. Setting realistic durations and buffers is one of the most valuable configuration steps in any booking system, and it costs nothing. This guide explains how to measure how long services really take, how to choose slot lengths, what a buffer is for, how to handle different services in a simple tool, what to do when your tool has one slot length, and how to review and adjust over time."),

      h2("Duration versus slot"),
      table(["Term", "Meaning"], ["Service duration", "How long the customer is with you"], ["Preparation and clean-up", "Time before and after that you need"], ["Buffer", "A gap in the schedule that absorbs overruns"], ["Slot length", "The block of time a booking occupies in the calendar"]),
      p("A slot should cover the service plus the preparation and clean-up it needs. The buffer is extra breathing room on top."),

      h2("Measure before you guess"),
      ol("For two weeks, record the actual start and end time of each service.", "Note the preparation before and clean-up after.", "Calculate the average and the longest typical time for each service.", "Look at which services overrun most often.", "Note which practitioners are faster or slower."),
      p("Most businesses discover that some services routinely take longer than the price list says. Base slot lengths on measured reality."),

      h2("Choosing slot lengths"),
      table(["Approach", "When to use it"], ["Slot equals average duration", "Consistent services with little variation"], ["Slot equals typical duration plus a margin", "Services that sometimes overrun"], ["Slot equals the longest common duration", "One-slot-length tools with mixed services"], ["Different lengths per service", "Tools that support per-service durations"]),
      p("When in doubt, allow slightly more than the average. A customer who finishes early is happy; one who is rushed is not."),

      h2("What buffers are for"),
      ul("**Overruns:** absorb the minutes a service runs long.", "**Preparation:** set up the room, tools and notes.", "**Clean-up:** hygiene between customers.", "**Travel:** for mobile and home services, time to reach the next address.", "**A breather:** a moment to stand, eat or think."),
      table(["Business", "Typical buffer need"], ["Salon or barbershop", "A few minutes to clean and reset, more after colour"], ["Dental or medical", "Cleaning and notes between patients"], ["Home services", "Travel and parking time between jobs"], ["Consultants", "Time to write notes and reset"], ["Fitness and therapy", "Room reset and cleaning"]),

      h2("Back-to-back risks"),
      p("Fully packed schedules look efficient and are fragile: one overrun cascades. Break long runs with a buffer, schedule difficult or variable services earlier in the day, and keep a flexible gap in the afternoon. Protect lunch and administration time in the booking hours."),

      h2("If your tool has one slot length"),
      p("Crescelo's built-in booking picker uses your opening hours and one slot length per assistant, such as 30, 45 or 60 minutes. It does not have per-service durations or automatic buffers. To work well with mixed services:"),
      ol("Set the slot length to your most common service, including the preparation and clean-up it needs.", "Describe longer services in the knowledge base, for example 'a colour takes 2 hours, so we book it as three 45-minute slots' and have the assistant explain how to book consecutive slots or contact you.", "Use Calendly or Cal.com links for services that need their own durations and buffers.", "Adjust booking hours to leave gaps at natural times."),
      p("See [configuring availability rules](/blog/configure-calendar-sync-availability-rules) and [AI appointment booking](/blog/ai-appointment-booking)."),

      h2("Communicating duration to customers"),
      ul("State how long each service takes in the service description and the confirmation.", "Say what is included, so expectations are realistic.", "Explain lateness rules: if a customer is late, does the service shorten?", "Ask customers to tell you about extras that change the duration, such as long hair or a repair."),

      h2("Review and adjust"),
      table(["Signal", "Adjustment"], ["Staff often running late", "Lengthen the slot or add a buffer"], ["Customers waiting", "Same"], ["Gaps that never fill", "Shorten the slot or offer more start times"], ["A service always finishes early", "Shorten it, and use the time for more bookings"], ["Complaints about feeling rushed", "Allow more time"]),
      p("Review durations every quarter, and whenever you change a service, a practitioner or a process."),

      h2("Worked example: a barbershop"),
      p("A barbershop's price list says a cut takes 30 minutes. Timing shows the average is 32 minutes plus five minutes to sweep and reset, and beard trims often add ten. The owner sets the slot to 40 minutes, and mentions in the assistant's documents that a cut with a beard trim takes two slots. Running late becomes rare, customers stop waiting on the bench, and the shop's evening finishes on time. The change cost nothing except ten minutes' thought, and the chairs generate the same revenue with less stress."),

      h2("Common mistakes"),
      ul("Using the price-list time instead of the real time.", "Forgetting preparation and clean-up.", "Packing the day with no gaps.", "Never revisiting durations.", "Not telling customers how long things take.", "Using one length for services that differ greatly, without a workaround."),

      h2("A worked example: a dental hygienist"),
      p("A hygienist books 45-minute appointments. Timing over two weeks shows the appointment itself averages 38 minutes, but notes, cleaning instruments and greeting the next patient add 12 more, so the real cycle is 50 minutes. The 45-minute slot leaves her five minutes behind by the third patient of each session, and she is late by lunchtime. She changes the slot to 50 minutes and moves the first patient after lunch to start ten minutes later. She loses one appointment slot a day but gains calm, on-time patients and fewer complaints. Over a month, revenue is almost unchanged because fewer patients cancel after waiting. The point is that a realistic slot is not a loss of capacity; it is an honest description of it."),

      h2("Choosing buffers by risk"),
      table(["Service risk", "Buffer approach"], ["Very predictable", "Small or no buffer"], ["Variable length", "A buffer after each, or a gap every few bookings"], ["Messy or messy-prone (colour, repair)", "Extra clean-up time in the slot"], ["Travel between jobs", "Realistic travel time, with a margin for traffic"], ["Emotionally demanding", "A short pause for the practitioner"]),
      p("Buffers are cheaper than apologies. A five-minute gap costs a few dollars of theoretical revenue and saves the goodwill of the customer who would otherwise wait."),

      h2("Frequently asked questions"),
      faq(
        ["How long should an appointment slot be?", "Long enough for the service plus preparation and clean-up, based on measured times. Add a margin if the service varies."],
        ["What is a buffer time?", "A gap between appointments that absorbs overruns and gives time to prepare and clean."],
        ["Does Crescelo support buffers and per-service durations?", "Not in the built-in picker, which uses one slot length. Use Calendly or Cal.com links for services that need their own settings."],
        ["How do I handle a long service with one slot length?", "Book consecutive slots, and explain how in the assistant's documents."],
        ["How often should I review durations?", "Quarterly, and whenever a service or process changes."],
        ["Should I tell customers how long a service takes?", "Yes, in the description and the confirmation."],
      ),
      p("Rehearse a booking with your own slot length in the [playground](/playground), see the [appointment booking feature](/product/appointment-booking) and [start a free trial](/login?mode=register)."),
    ],
  }),

  pillar({
    slug: 'overbooking-strategies-vs-dynamic-buffers',
    title: 'Overbooking vs Dynamic Buffers: Two Ways to Handle No-Shows (and When Each Backfires)',
    description: 'Compare overbooking with flexible buffers and standby lists to manage no-shows: how each works, the maths, risks, suitable businesses and safer alternatives for service firms.',
    primaryKeyword: 'overbooking appointments no shows',
    secondaryKeywords: ['dynamic buffers scheduling', 'overbooking strategy service business', 'manage no shows without overbooking', 'appointment capacity planning'],
    body: [
      p("Airlines sell more seats than the plane holds because some passengers never show. Some service businesses try the same trick: book slightly more appointments than capacity, expecting a few no-shows to balance it out. When it works, revenue rises. When it does not, two customers arrive for one chair, one waits and one goes home annoyed. There are gentler ways to manage no-shows without gambling with customer goodwill, including flexible buffers, standby lists and easier changes. This guide explains overbooking, when it might make sense, the maths behind it, the risks and the safer alternatives, so you can choose a strategy that fits your business and your customers."),

      h2("What overbooking is"),
      p("Overbooking means accepting more bookings than you can serve if everyone comes. It relies on a predictable no-show rate: if roughly one in ten customers does not arrive, booking eleven into ten slots keeps the average day full. The expected gain is real, and so is the risk on the days when everyone turns up."),
      table(["Term", "Meaning"], ["No-show rate", "Share of booked appointments not attended"], ["Overbooking level", "How many extra bookings you accept"], ["Overflow", "The day when more people arrive than you can serve"], ["Cost of overflow", "The price of a waiting or turned-away customer"]),

      h2("The simple maths"),
      p("Suppose you have 10 slots, a 10 percent no-show rate and each attended appointment earns $70. Without overbooking, you expect nine attended, so $630. If you book 11, the number attending averages about 9.9, but you can only serve 10, so the average served rises to about 9.6 and you earn roughly $670. On some days all 11 attend, and one customer must wait, be turned away or get a shorter service. If that happens on about one day in three, you have created many unhappy customers to earn around $40 extra a day."),
      table(["Bookings accepted", "Expected attendees (10% no-show)", "Chance of overflow beyond 10"], ["10", "9.0", "None"], ["11", "9.9", "About one in three"], ["12", "10.8", "More than half"]),
      p("These figures are illustrative and depend on your real rate and its variation. The lesson is that overbooking trades steady revenue gains for a real chance of disappointed customers."),

      h2("When overbooking can be reasonable"),
      ul("Very high, stable no-show rates.", "Short, flexible services where a wait is acceptable.", "Businesses that can absorb overflow, for example with an extra practitioner on call.", "Walk-in cultures where waiting is expected.", "Where the cost of an empty slot is far higher than the cost of a short wait."),
      p("It is a poor fit for services where a wait is unacceptable, appointments are long or personal or customers are anxious, such as medical and dental care, high-end salons and consultations."),

      h2("The risks"),
      ul("Customers waiting or turned away, which damages trust and reviews.", "Staff stress, rushed work and mistakes.", "Complaints and reputation damage on the busy days.", "Legal or professional issues in regulated services.", "Higher no-shows if customers learn that overbooking is normal."),

      h2("Dynamic buffers"),
      p("A dynamic buffer keeps some capacity flexible instead of overbooking. You leave a gap or two in the day that you fill on the day, from a standby list, walk-ins or late bookings. Or you shorten or lengthen the slots for particular services depending on how busy the day looks. The idea is to absorb variation without promising more than you can deliver."),
      table(["Technique", "How it works", "Benefit"], ["Flexible gaps", "Leave one or two slots unbookable in advance, and release them the day before", "Room for overruns and late bookings"], ["Same-day release", "Open a few slots each morning for last-minute bookings", "Captures spontaneous demand"], ["Standby list", "Fill cancellations from a list of waiting customers", "Recovers no-show slots without overflow"], ["Variable buffers", "More buffer after long or unpredictable services", "Protects the rest of the day"]),
      p("See [filling cancelled slots with a standby list](/blog/fill-cancelled-slots-automated-standby-chat) and [service durations and buffer times](/blog/service-durations-buffer-times-ai-scheduling)."),

      h2("Reduce no-shows instead of planning for them"),
      p("The safest way to protect revenue is to make no-shows rarer. Clear confirmations, well-timed reminders, easy rescheduling, fair policies and, where sensible, deposits reduce no-shows without risk to the customer experience. Every percentage point you remove is revenue without overflow. See [how to reduce no-shows](/blog/eliminate-service-no-shows-playbook) and [self-serve rescheduling](/blog/frictionless-self-serve-rescheduling)."),

      h2("Choosing a strategy"),
      table(["Your situation", "Consider"], ["High no-show rate and flexible service", "Careful, small overbooking with a plan for overflow"], ["Medical, dental or personal services", "Reminders, deposits and standby lists; avoid overbooking"], ["Walk-in tolerant business", "Reserve walk-in windows; release same-day slots"], ["Busy business with steady demand", "Buffers and easy rescheduling"], ["New business building trust", "Avoid overbooking; protect every customer's experience"]),

      h2("If you do overbook: guardrails"),
      ol("Start small: one extra booking at peak times only.", "Use your own measured no-show rate for each time and service.", "Have a plan for overflow: an extra practitioner, a small apology gift, an offer of a priority slot next time.", "Tell customers honestly if a wait is possible.", "Track overflow days and customer feedback.", "Stop if complaints rise."),

      h2("Where an AI assistant fits"),
      p("An assistant can support a safer approach: it explains your policy and offers the change link, captures standby interest when no slot is free and offers freed slots when it can. It should never be told to overbook silently. Crescelo's built-in booking offers slots from your opening hours with one slot length, and hides those already taken, so it does not overbook by design. See [AI appointment booking](/blog/ai-appointment-booking)."),

      h2("A worked example: a barbershop tries a flexible gap"),
      p("A barbershop with a ten percent no-show rate considered overbooking on Saturdays. Instead it left two 30-minute gaps unbookable in advance and released them at 8 a.m. on the day. It also kept a short standby list of customers who could come at short notice. On a typical Saturday, one or two customers cancelled or failed to show, and the gaps plus the standby list filled the freed time within the hour. Nobody was ever double booked, and average takings on Saturdays rose slightly because the gaps sold as same-day slots. The owner concluded that the flexible gap captured most of the benefit of overbooking without any of the risk."),
      table(["Strategy", "Revenue effect", "Risk of overflow"], ["No strategy", "Baseline", "None"], ["Overbook by one", "Slightly higher", "About one day in three"], ["Flexible gap plus standby", "Slightly higher", "None"]),

      h2("How to try a flexible gap"),
      ol("Choose the busiest day and make two slots unbookable in advance.", "Announce same-day availability to regulars or on social media each morning.", "Keep a standby list for cancellations.", "Track how often the gaps fill and how much revenue they bring.", "Adjust the number of gaps over a month."),

      h2("Frequently asked questions"),
      faq(
        ["What is overbooking in appointments?", "Accepting more bookings than capacity, expecting some customers not to attend. It can raise revenue but risks disappointing customers on the days everyone comes."],
        ["Is overbooking a good idea for a small service business?", "Usually not for personal or long appointments. Reminders, easy rescheduling and standby lists are safer ways to protect revenue."],
        ["What is a dynamic buffer?", "Flexible spare capacity that you fill on the day from a standby list, walk-ins or late bookings instead of overbooking in advance."],
        ["How do I calculate how much to overbook?", "Use your measured no-show rate and its variation, and test whether the chance of overflow is acceptable. Most businesses find it is not."],
        ["Does Crescelo overbook?", "No. Its built-in booking hides taken slots and offers slots from your opening hours."],
        ["What is the best way to protect revenue from no-shows?", "Reduce them with confirmations, reminders, easy rescheduling and fair policies, and refill cancellations from a standby list."],
      ),
      p("Read the [no-show playbook](/blog/eliminate-service-no-shows-playbook), see the [appointment booking feature](/product/appointment-booking) and try the [playground](/playground)."),
    ],
  }),
];
