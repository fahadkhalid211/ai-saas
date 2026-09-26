import { faq, h2, h3, note, ol, p, pillar, table, ul } from '../authoring';

export const PILLAR18 = [
  pillar({
    slug: 'frictionless-self-serve-rescheduling',
    title: 'Self-Serve Rescheduling: Turn Cancellations Into Rebookings With One-Tap Changes',
    description: 'How to let customers change appointments without calling: change links, chat rescheduling, rules and limits, fees, freeing slots, reminders and the numbers to watch.',
    primaryKeyword: 'self-serve appointment rescheduling',
    secondaryKeywords: ['reschedule appointment online', 'easy cancellation link', 'reduce no-shows rescheduling', 'customer self service booking changes'],
    body: [
      p("Most customers who cancel do not mean to leave you. Something changed: a meeting moved, a child fell ill, the car broke down. If changing the booking is easy, they move it and you keep the business. If it takes a phone call during opening hours, many will not bother. They simply do not turn up, and you lose the slot and the customer's goodwill. Making rescheduling effortless is one of the cheapest ways to reduce no-shows and lost revenue, because it turns a would-be no-show into a rebooking, often with enough notice for you to refill the slot. This guide explains how to design self-serve rescheduling: what customers need, how change links and chat can work, what rules to set, how to handle fees fairly, how to free and refill slots, and how to measure the effect."),

      h2("Why changing should be easier than not turning up"),
      ul("A customer with a conflict wants the least effort: one tap and a new time.", "If the change costs more effort than ignoring the appointment, many will ignore it.", "A rebooking keeps the revenue and the relationship; a no-show loses both.", "Early notice lets you offer the slot to someone else."),
      p("The goal is that rescheduling is easier than a no-show, at every hour, on a phone."),

      h2("The change link"),
      p("The simplest tool is a private link in every confirmation and reminder that lets the customer pick a new time or cancel. Crescelo's confirmation email contains a private link to reschedule or cancel; the freed slot becomes available again at once. Good practice for change links:"),
      ul("Put the link in the confirmation and every reminder, near the top.", "Make it work on a phone without logging in.", "Show only genuinely available times.", "Confirm the change immediately by email.", "Make cancelling as easy as rescheduling, with an optional reason.", "Never make the link expire before the appointment."),
      table(["Design choice", "Better"], ["Login required", "No login; the private link is the key"], ["Phone call to change", "Link first, phone as backup"], ["Long form to cancel", "One tap, optional reason"], ["Hidden in small print", "A clear button"]),

      h2("Rescheduling in the chat"),
      p("Customers also ask in the chat: 'Can I move my appointment?' The assistant can offer the right steps, state your policy and, where the tool allows, guide them through picking a new time or pass them to the link. It should recognise the intent in many wordings ('push it back', 'something came up', 'cannot make Thursday') and respond warmly. See [conversational rescheduling and cancellations](/blog/conversational-rescheduling-cancellations)."),
      table(["Customer says", "Assistant does"], ["Can I move my appointment to next week?", "Explains the change is free until [window], and offers the link or next available times"], ["I have to cancel", "Acknowledges, states the policy briefly and offers to rebook instead"], ["Something came up and I am late", "Tells them the lateness rule and whether the appointment can be kept or moved"], ["Can you move me earlier?", "Offers earlier times if any, and adds them to the standby list if that exists"]),

      h2("Rules that keep it fair"),
      ol("**A free change window:** for example, up to 24 hours before.", "**A limit on changes:** for example, one free change per booking, to prevent constant shuffling.", "**A rule for late changes:** whether a fee or deposit applies; see [deposits and booking policies](/blog/deposit-collection-booking-policies-chat).", "**A minimum notice for the new time:** so you can prepare.", "**Exceptions:** genuine emergencies handled by a person."),
      p("Write the rules in plain words, show them before the booking is confirmed and repeat them in the confirmation. See [effective cancellation policies](/blog/effective-cancellation-policies-service-businesses)."),

      h2("Free the slot and refill it"),
      p("A cancelled slot is worth money only if someone takes it. When a customer cancels or moves, the freed time should become bookable immediately. Then tell people who are waiting: a standby list, a note to regulars or a post on social media. See [filling cancelled slots with a standby list](/blog/fill-cancelled-slots-automated-standby-chat). The earlier the cancellation, the easier the refill, which is why easy self-service matters so much."),

      h2("Communication around changes"),
      ul("Confirm every change by email with the new details.", "Send a short reminder before the new time.", "Update your calendar feed; a subscribed calendar refreshes on its own schedule.", "Tell the assistant's knowledge base if your policy changes."),

      h2("Special cases"),
      table(["Case", "Approach"], ["Multi-session packages", "Allow changes to a single session without losing the package, within a limit"], ["Group bookings", "Require a person to handle changes"], ["Same-day changes", "Handle by phone or a person, with a quick message"], ["Customers who keep changing", "A polite note about the policy; a person decides"], ["Deposit already paid", "Move the deposit to the new time automatically or by a person"]),

      h2("A sample conversation"),
      table(["Speaker", "Message"], ["Visitor", "I need to move my appointment on Thursday, my daughter is ill."], ["Assistant", "I am sorry to hear that, I hope she feels better soon. You can change it free of charge until 24 hours before. Here is a link to choose a new time, or I can show you what is free next week."], ["Visitor", "Next Tuesday?"], ["Assistant", "Tuesday has 10:00 and 2:30 free. Which would you like? I will update your booking and email a new confirmation."]),

      h2("Worked example: a barbershop"),
      p("A barbershop received about twelve no-shows a month. Reading its messages, the owner found that many customers had tried to phone to change their booking and given up when nobody answered. He added the change link to every confirmation and reminder, and told the assistant to point people to it. No-shows fell to five a month, and about twenty bookings a month were moved instead of lost. Because the moves came with notice, he refilled many of the freed slots with walk-ins and a short standby list. The change took an hour to set up and cost nothing extra."),

      h2("Measure it"),
      table(["Metric", "Why"], ["Share of changes made through the link", "Whether customers use it"], ["No-show rate", "Should fall"], ["Rescheduled versus cancelled", "Rebookings kept"], ["Slots refilled after a change", "Recovered revenue"], ["Calls about changes", "Should fall"]),
      p("See [how to reduce no-shows](/blog/eliminate-service-no-shows-playbook) for the whole picture."),

      h2("Common mistakes"),
      ul("Making customers phone to change a booking.", "Hiding the change link.", "Applying fees without saying so in advance.", "Not freeing the slot immediately.", "Forgetting to update the calendar and staff.", "Ignoring the customer who changes often; a person should talk to them."),

      h2("Test the change link yourself"),
      p("Make a test booking, open the confirmation on your phone and use the link to move it. Was it obvious? Did it show only real times? Did you get a new confirmation? Try cancelling as well. Then ask a friend to do the same without help. Anything that confuses them will confuse your customers."),

      h2("Tell customers the link exists"),
      p("A change link only helps if customers know about it. Mention it in your confirmation email, your reminders, your website's booking page and the assistant's greeting for existing customers: 'Need to change your booking? Use the link in your confirmation email.' A sentence in the right places saves many phone calls."),

      h2("Frequently asked questions"),
      faq(
        ["How can customers reschedule without calling?", "Include a private change link in every confirmation and reminder, and let the assistant explain how to use it."],
        ["Does Crescelo support self-serve rescheduling?", "Yes. The confirmation email includes a private link to reschedule or cancel, and the freed slot becomes available at once."],
        ["Should rescheduling be free?", "Usually within a notice window, such as 24 hours. Later changes may follow your cancellation policy."],
        ["How do I stop customers changing too often?", "Limit free changes per booking and have a person talk to repeat changers."],
        ["Can the assistant reschedule in the chat?", "It can explain the policy and guide customers to the link or available times. The change itself is made through the booking link."],
        ["How do I know it is working?", "Track no-show rate, share of changes via the link and slots refilled."],
      ),
      p("See the [appointment booking feature](/product/appointment-booking), try a rescheduling conversation in the [playground](/playground) and [start a free trial](/login?mode=register)."),
    ],
  }),

  pillar({
    slug: 'effective-cancellation-policies-service-businesses',
    title: 'Writing a Cancellation Policy That Customers Accept (With Examples for Service Businesses)',
    description: 'How to write a fair cancellation and no-show policy: the elements, plain wording, examples for different businesses, exceptions, legal cautions and how to apply it kindly.',
    primaryKeyword: 'cancellation policy service business',
    secondaryKeywords: ['no show policy example', 'appointment cancellation policy wording', 'late cancellation fee policy', 'cancellation policy template'],
    body: [
      p("Every appointment-based business needs a cancellation policy, and most have one that customers do not read, staff do not enforce and nobody remembers writing. The result is arguments: a customer says they never knew about the fee, a staff member waives it for one person and not another, an owner feels cheated by a no-show and resentful about chasing money. A good policy prevents these problems. It is short, fair and visible, it explains the reason for its rules, it leaves room for genuine emergencies and it is applied consistently. This guide explains what a cancellation policy should contain, gives wording examples for different kinds of business, shows how to present it in your booking flow and chat, explains how to handle exceptions and gives cautions about the law."),
      note("Consumer protection and contract rules on cancellation fees vary by country, state and profession. This is general information, not legal advice. Have your policy reviewed for your location, and make sure customers see and accept it before the booking."),

      h2("The purpose of a policy"),
      ul("**Protect your time and income** when a booked slot goes unused.", "**Set expectations** so nobody is surprised.", "**Encourage early notice,** so you can refill the slot.", "**Treat customers consistently** and fairly."),
      p("A policy is not a punishment. Presented well, it is a promise: 'we reserve your time, and we ask you to tell us early if you cannot come.'"),

      h2("What a policy should include"),
      table(["Element", "Questions to answer"], ["Notice window", "How much notice makes a cancellation free?"], ["What happens after the window", "Is a fee charged? A deposit kept? How much?"], ["No-shows", "What is the rule if the customer does not turn up and does not tell you?"], ["Lateness", "How late is too late, and what then?"], ["Rescheduling", "Is one free change allowed? What about several?"], ["Deposits", "How do they relate to the policy? See [deposit wording](/blog/deposit-collection-booking-policies-chat)"], ["Exceptions", "How do you treat emergencies and illness?"], ["How to cancel", "The exact steps and a way to do it out of hours"]),

      h2("Examples by business type"),
      table(["Business", "Typical policy"], ["Salon or barbershop", "Free changes up to 24 hours before. After that, a deposit for colour appointments may be kept. Late by 15 minutes may mean a shortened service."], ["Clinic or dental practice", "48 hours' notice requested. Repeated no-shows may require a deposit for future bookings."], ["Home services", "Cancel free until the day before. Same-day cancellation or no access may incur a callout fee."], ["Consultants and coaches", "24 to 48 hours' notice. Late cancellation may forfeit the session fee."], ["Fitness classes", "Cancel until a set time before class or lose the credit; waitlists fill spots."], ["Photographers and events", "Deposit non-refundable; rescheduling allowed once with notice."]),
      p("These are illustrations. Your business, your customers and your law decide the right numbers."),

      h2("Wording that customers accept"),
      table(["Harsh", "Fair"], ["24 hours' notice required or you will be charged in full.", "You can change or cancel free of charge up to 24 hours before your appointment. After that we may charge a fee, because the time is reserved for you."], ["No exceptions.", "If something unexpected happens, please tell us and we will do our best to help."], ["Late clients will not be seen.", "If you are more than 15 minutes late we may need to shorten your service or rebook."], ["We reserve the right to ban clients who no-show.", "If appointments are repeatedly missed we may ask for a deposit for future bookings."]),
      ul("Use plain, friendly words.", "Give the reason.", "Offer a route for exceptions.", "Keep it to a few sentences."),

      h2("Show it where customers will see it"),
      ol("On the booking page before confirmation.", "In the confirmation email.", "In reminders, briefly.", "On your website in one clear place.", "In the assistant's knowledge base, so it states the policy exactly."),
      p("A policy shown only in small print is hard to enforce and easy to dispute. Ask customers to accept it at booking if your tool allows, or state it clearly before they confirm. The assistant should quote the policy accurately when asked, and hand exceptions to a person; see [how to reduce no-shows](/blog/eliminate-service-no-shows-playbook)."),

      h2("Apply it consistently, with judgement"),
      ul("Apply the same rules to everyone, with documented exceptions.", "Decide in advance what counts as an emergency.", "Give regulars the benefit of the doubt for one-off mistakes, but track repeats.", "Explain kindly when you apply a fee.", "Record decisions and reasons."),
      p("Consistency is what makes a policy feel fair. Discretion is what makes it humane. Aim for both."),

      h2("Make cancelling easy"),
      p("A policy that punishes late cancellations while making cancelling difficult is unfair, and it increases no-shows. Give customers a private link or a simple way to cancel or move at any hour. See [self-serve rescheduling](/blog/frictionless-self-serve-rescheduling). Crescelo's confirmation emails include a private link to reschedule or cancel."),

      h2("Legal and fairness cautions"),
      ul("Terms must be clear and agreed before the customer is bound.", "Consumer law may limit fees or give cancellation rights, especially for distance bookings.", "Fees must be reasonable and not a penalty in some jurisdictions.", "Regulated professions may restrict charging for missed appointments.", "Do not apply new terms to existing bookings without notice."),
      p("If unsure, ask a local adviser to review the wording once. It is a small cost compared with a dispute."),

      h2("Handling disputes"),
      ol("Listen to the customer's account without arguing.", "Check what they were shown at booking and what your records say.", "Consider the circumstances and the relationship.", "Decide, explain kindly and record.", "If you waive the fee, say it is an exception so expectations stay clear."),
      p("Many disputes end well when the customer feels heard. A short, respectful message often costs less than the fee is worth."),

      h2("A sample conversation"),
      table(["Speaker", "Message"], ["Visitor", "What happens if I cancel on the day?"], ["Assistant", "You can change or cancel free of charge up to 24 hours before your appointment. If you cancel inside 24 hours, we may charge a fee of $25, because the time is reserved for you. If something unexpected happens, please tell us and we will do our best to help. Would you like to move your booking instead?"]),

      h2("Worked example: a dental practice"),
      p("A practice has a no-show rate of 11 percent. It rewrites its policy in plain words: 48 hours' notice requested, a $30 fee for late cancellations, waived for emergencies, and a deposit for patients with repeated no-shows. It adds the policy to confirmations and the assistant's documents, and makes a change link available. Over six months no-shows fall to 6 percent, complaints about fees are rare, and the front desk no longer argues about what was agreed. The improvement came from a clear policy, visible wording and easy changes, not from harsher rules."),

      h2("Review your policy yearly"),
      p("Businesses change, and so should policies. Once a year, look at your no-show and late-cancellation numbers, the complaints you received and the exceptions you granted. Adjust the notice window or wording where the data suggests, update every place the policy appears and let regulars know about any change."),

      h2("Frequently asked questions"),
      faq(
        ["What should a cancellation policy include?", "The notice window, what happens after it, no-show and lateness rules, rescheduling limits, exceptions and how to cancel."],
        ["How much notice should I require?", "Enough to refill the slot, often 24 to 48 hours depending on your business."],
        ["Is a cancellation fee legal?", "Often, if the terms are clear, agreed in advance and reasonable, but rules vary. Check where you operate."],
        ["How do I stop arguments about fees?", "Show the policy before booking, repeat it in the confirmation and apply it consistently with kindness."],
        ["Should I waive fees for emergencies?", "Usually, at your discretion, and say so in the policy so customers feel it is fair."],
        ["Can the assistant explain my policy?", "Yes, if you add it to the knowledge base. It should quote it exactly and pass exceptions to a person."],
      ),
      p("Put your own policy into the assistant and test it in the [playground](/playground), read [how to reduce no-shows](/blog/eliminate-service-no-shows-playbook) and see the [appointment booking feature](/product/appointment-booking)."),
    ],
  }),

  pillar({
    slug: 'fill-cancelled-slots-automated-standby-chat',
    title: 'Filling Cancelled Appointments: Standby Lists, Waitlists and Fast Offers',
    description: 'How to refill cancelled slots: building a standby list, offering openings quickly, wording, fairness rules, tools you can use with your booking system and what to measure.',
    primaryKeyword: 'fill cancelled appointments',
    secondaryKeywords: ['appointment waitlist', 'standby list booking', 'last minute cancellation refill', 'waiting list for appointments'],
    body: [
      p("A cancellation is a small loss, but a repeated one. Every empty slot costs the practitioner's time and the business its revenue, and cancellations often come at short notice, when refilling seems impossible. It is not impossible. Many service businesses have customers who would happily take an earlier or different time if they knew one was free. The trick is to know who they are and to reach them quickly with a simple offer. A standby list, sometimes called a waitlist, is the tool. This guide explains how to build one, how to word offers, how to be fair about who gets a slot, how to do it with the tools you already have, what an AI assistant can and cannot do here and what to measure. It is written for salons, clinics, studios, consultants and any business that books time."),
      note("Crescelo's built-in booking hides taken slots and frees a slot immediately when a customer cancels through the confirmation link. It does not include a waitlist that messages customers automatically. This article explains how to run a standby list alongside it, using the assistant to capture interest and simple tools to notify people."),

      h2("Who wants an earlier or different time"),
      ul("Customers booked weeks ahead who would prefer sooner.", "New customers who could not find a suitable time.", "Regulars with flexible schedules.", "People who arrived when you were fully booked.", "Customers who asked for a specific person or time that was unavailable."),
      p("Everyone on that list is a warm lead for a cancelled slot."),

      h2("How to build the list"),
      ol("**Ask at booking:** 'Would you like us to tell you if an earlier time opens up?'", "**Ask in chat:** when the assistant cannot offer a suitable time, it offers to add the visitor to the standby list.", "**Capture what matters:** name, contact method, service, preferred days and times and how much notice they need.", "**Record consent** to be contacted about openings.", "**Keep it simple:** a shared sheet or a note in your booking system works for small businesses."),
      p("The assistant can capture this as a lead with the preferences in the message, sent to your inbox or a spreadsheet by the lead delivery options. See [conversational lead capture](/blog/conversational-lead-capture)."),

      h2("Fields for a useful standby list"),
      table(["Field", "Why"], ["Name and contact", "To offer the slot"], ["Service wanted", "To match the opening"], ["Preferred days and times", "To offer relevant slots"], ["Notice needed", "Some can come within the hour; others need a day"], ["Person preference", "Some want a specific practitioner"], ["Date added", "For fairness"], ["Consent", "To message them"]),

      h2("Offer the slot quickly"),
      p("Speed decides who gets the slot. The moment a cancellation happens, send offers to matching people, in order of fairness or priority, and give a short time to accept."),
      table(["Message", "Example"], ["Offer", "Hi Sam, a 3:30 p.m. slot with Priya has opened up today for a cut. Reply YES within 20 minutes to take it, or ignore this if it does not suit."], ["Confirmation", "Booked. See you at 3:30 p.m. today. Change or cancel here if needed."], ["Slot gone", "Thanks for replying. That slot was taken, but we will keep you on the list."]),
      ul("State the time, service and person.", "Give a clear deadline.", "Make accepting one reply or tap.", "Confirm immediately, and remove the person from the list.", "If nobody accepts, widen the offer, for example to the wider customer list or social media."),

      h2("Fairness rules"),
      ol("First on the list gets the first offer, unless the slot does not suit them.", "Give regulars or people who have waited longest priority, if you say so.", "Do not offer the same slot to many people at once unless you say 'first to reply'.", "Explain how the list works, so nobody feels overlooked.", "Keep people informed if you cannot fill their request."),
      p("A transparent rule is better than a clever one."),

      h2("Tools you can use"),
      table(["Tool", "How it helps"], ["A spreadsheet", "The simplest standby list for a small business"], ["Text messaging or email tools", "Send offers quickly"], ["Automation tools such as Zapier or Make", "Trigger a message when a booking is cancelled; see [webhook automations](/blog/webhook-automations-zapier-make-chat-events)"], ["Your booking system's waitlist, if it has one", "Automatic offers"], ["Social media or a broadcast list", "Reach many people at short notice for walk-in friendly businesses"]),
      p("With Crescelo, you are notified of bookings and cancellations in your dashboard, and a cancelled slot is bookable again immediately. For automatic messaging when a slot opens, connect your own tools using webhooks on the Agency plan or manage the list manually."),

      h2("What the AI assistant can do"),
      ul("Explain that a waitlist exists and how it works.", "Capture a visitor's interest and preferences when no suitable slot is free.", "Offer the freed slot in the chat if the visitor is talking to it at the time.", "Tell visitors honestly when there is nothing available."),
      p("It cannot notify people on its own unless you connect an automation. Be clear about this in your wording so nobody expects a message you cannot send."),

      h2("Walk-in and last-minute businesses"),
      p("Barbershops and beauty studios can post openings on social media or a broadcast list: 'Two chairs free this afternoon, walk in or book here.' Keep the message short, with a booking link, and post as soon as the slot opens. See [managing walk-ins and appointments](/blog/managing-walk-ins-vs-appointments-salons)."),

      h2("A sample conversation"),
      table(["Speaker", "Message"], ["Visitor", "Do you have anything sooner than next Thursday?"], ["Assistant", "Nothing is free before Thursday right now. If you like, I can add you to our standby list, and the team will contact you if something opens up. What days and times suit you, and what is the best number or email?"], ["Visitor", "Any weekday after 4. sam@example.com"], ["Assistant", "Done, Sam. You are on the list for weekday afternoons after 4. If a slot opens we will email you, and you can take it or ignore it."]),

      h2("Worked example: a physiotherapy clinic"),
      p("A clinic has three to four cancellations a week. It starts a standby list of patients who would like earlier appointments, collected in the chat and at the front desk. When a slot opens, the receptionist emails the first three matching patients with a link and a twenty-minute window. Over two months it refills about half of the cancelled slots, roughly six a month, worth about $500. A few patients who moved earlier free later slots, which are refilled in turn. The clinic did this with a spreadsheet and a template email, and the receptionist spends about ten minutes a day on it."),

      h2("Measure it"),
      table(["Metric", "Why"], ["Cancelled slots", "Baseline"], ["Slots refilled", "Effectiveness"], ["Fill rate", "Refilled divided by cancelled"], ["Time from cancellation to offer", "Speed"], ["Standby list size", "Demand"], ["Revenue recovered", "Value"]),

      h2("Keep the list clean"),
      p("A standby list is only useful if it is current. Remove people who have been booked or who no longer want an earlier slot, and ask new entries to confirm their preferences. Review it weekly, so offers go to people who are still interested."),

      h2("Frequently asked questions"),
      faq(
        ["How do I fill cancelled appointments?", "Keep a standby list of customers who want earlier or different times, and message matching people quickly when a slot opens."],
        ["Can a chatbot manage a waitlist?", "It can capture people's interest and preferences. To message them automatically when a slot opens, connect an automation or manage the list yourself."],
        ["Does Crescelo have a waitlist feature?", "Not built in. A cancelled slot becomes bookable immediately, and you can run a standby list with the assistant capturing interest and your own tools sending offers."],
        ["How do I keep it fair?", "Use a simple, stated rule such as first on the list or longest waiting, and explain it to customers."],
        ["How quickly should I offer a slot?", "As soon as it opens, with a short deadline to accept."],
        ["What if nobody takes the slot?", "Widen the offer to more customers or social media, or use the time for admin and outreach."],
      ),
      p("Try a standby conversation in the [playground](/playground), read [how to reduce no-shows](/blog/eliminate-service-no-shows-playbook) and see the [lead capture feature](/product/lead-capture)."),
    ],
  }),

  pillar({
    slug: 'mobile-ai-chatbot-optimization',
    title: 'Chat on a Phone: A Mobile Checklist Before You Put a Chatbot Live',
    description: 'What to check before a website chatbot goes live on mobile: launcher size, keyboard behaviour, layout, speed, touch targets, orientation, accessibility and real device testing.',
    primaryKeyword: 'mobile chatbot optimization',
    secondaryKeywords: ['chat widget on mobile', 'mobile chatbot UX', 'chatbot keyboard overlap', 'test chatbot on phone'],
    body: [
      p("Most of your visitors are on phones. A chat that looks fine on your laptop can be unusable on a phone: the launcher covers the call button, the keyboard hides the input, the window is too tall, text is too small or the whole page jumps when it opens. Because mobile visitors are often closest to a decision, a broken chat costs bookings at the worst moment. Testing on real phones takes an hour and catches almost every problem. This guide is a practical checklist for mobile chat: the layout and behaviour to check, the speed and accessibility points that matter on small screens, a way to test on real devices and the common bugs to look for."),

      h2("Start with how visitors use their phones"),
      ul("One hand, thumb reach, often on a train, sofa or shop floor.", "Small screens, so anything that covers content is painful.", "A software keyboard that takes half the screen when typing.", "Variable connections: fast Wi-Fi one moment, weak mobile data the next.", "Interruptions: calls, notifications, switching apps."),
      p("Design for these conditions, not for a desk."),

      h2("The launcher"),
      table(["Check", "Why"], ["Large enough to tap comfortably", "Small targets cause mis-taps"], ["Does not cover key buttons", "Call, book, menu and cookie choices must stay reachable"], ["Sits clear of browser bars and safe areas", "Bottom bars and notches hide it"], ["Has a clear label or recognisable icon", "Visitors should know what it does"], ["Does not bounce or flash", "Distracting and can trigger motion sensitivity"]),
      p("If the launcher covers a button on some pages, adjust its offset or hide it there."),

      h2("The open chat window"),
      ul("Uses most of the screen but leaves a clear way to close it.", "The message list scrolls smoothly and shows the latest message.", "The input stays visible when the keyboard is open.", "The page behind does not scroll or jump.", "Text is at least readable size without zooming.", "Buttons and links are easy to tap."),
      p("The keyboard is the most common problem: on some phones the input disappears behind it or the layout jumps. Test on both iPhone and Android in several browsers."),

      h2("Layout and orientation"),
      ul("Works in portrait and landscape.", "Handles long messages, lists and tables without sideways scrolling.", "Booking cards fit the width.", "Images, if any, scale down.", "Nothing is cut off on small phones."),
      p("Test on the smallest phone you can find as well as a large one."),

      h2("Speed on a mobile connection"),
      p("A slow widget hurts your page and your visitors' patience. Check that the chat does not delay the main content, and measure page speed on a mobile profile before and after adding it. The widget's script is loaded from one line on your site, and a well-built widget adds little; still, measure your own pages. See [performance of embedded chat widgets](/blog/performance-optimization-embedded-chat-widgets). Test on a throttled connection to see what a visitor on weak data sees."),

      h2("Touch and interaction"),
      ul("Tap targets are at least a thumb's width, with space between them.", "Quick-reply buttons are easy to hit.", "Long-press or hover is never required.", "Swipe gestures are not the only way to do something.", "Errors are clear and tappable to fix."),

      h2("Accessibility on mobile"),
      p("Phones have their own assistive technology: VoiceOver on iPhone and TalkBack on Android. Turn one on and try to open the chat, read a reply and send a message. Check colour contrast in sunlight, dark mode and large text settings. See [chatbot accessibility and WCAG](/blog/accessibility-wcag-compliance-website-chatbots)."),

      h2("Booking and forms on mobile"),
      ul("Date and time choices are easy to tap; a list of times often beats a tiny calendar.", "Input fields open the right keyboard: numeric for phone numbers, email for addresses.", "Autofill works for name, phone and email.", "Confirmation is clear and visible.", "The change link opens correctly on a phone."),
      p("Try a full booking on a phone, from the first question to the confirmation email."),

      h2("Notifications and interruptions"),
      ul("If a visitor leaves the page and returns, the conversation should still be there.", "A message should never trigger a sound unexpectedly.", "Pop-ups should not appear immediately or repeatedly; see [reducing bounce with proactive chat](/blog/reduce-bounce-rate-proactive-chat)."),

      h2("How to test properly"),
      ol("Use at least two real phones, one iPhone and one Android, and if you can, an older model.", "Test in the browsers your visitors use: Safari and Chrome at least.", "Test on Wi-Fi and on mobile data.", "Run the whole path: open, ask, book, receive the confirmation.", "Open your top five pages and check the launcher on each.", "Rotate the phone.", "Turn on large text and dark mode.", "Ask someone who has never seen it to use it while you watch."),
      table(["Bug to look for", "Typical cause"], ["Input hidden behind the keyboard", "Fixed-height window not resizing"], ["Page scrolls behind the chat", "Scroll lock missing"], ["Launcher covers a button", "Fixed position clash"], ["Text too small", "Font size not scaled"], ["Slow first open", "Script or images loaded late"]),

      h2("A five-minute check to repeat"),
      ul("Open your busiest page on a phone.", "Is the launcher visible and not covering anything?", "Open the chat and type a message; does the keyboard hide the input?", "Close it; does the page behave?", "Repeat on the booking page."),
      p("Do it after every change to your site, the widget or your theme."),

      h2("Worked example: a clinic that found three bugs in an hour"),
      p("A clinic tested its chat on three phones on a Friday afternoon. On an older Android phone the input disappeared behind the keyboard, so nothing could be typed. On an iPhone in landscape the chat window overflowed the screen. And on the contact page the launcher sat directly on top of the tap-to-call button. None of these appeared on the owner's laptop. The developer adjusted the window height for the keyboard, limited the height in landscape and moved the launcher on the contact page. A second round of testing on the same phones confirmed the fixes. The whole exercise took ninety minutes and removed the three problems most likely to have cost bookings from mobile visitors."),
      table(["Bug", "Phone", "Fix"], ["Input hidden by keyboard", "Older Android", "Window resizes with the keyboard"], ["Window overflow", "iPhone, landscape", "Maximum height in landscape"], ["Launcher over the call button", "All phones on the contact page", "Moved launcher on that page"]),

      h2("Common mistakes"),
      ul("Testing only on a laptop with a narrow browser window.", "Never testing with the keyboard open.", "Forgetting the contact and booking pages.", "Ignoring older phones.", "Auto-opening the chat on mobile.", "Not retesting after theme or widget updates."),

      h2("Dark mode and system settings"),
      p("Many people use dark mode, large text or reduced motion. Switch each on and look at the chat: is text still readable, do colours still have enough contrast, does anything overflow when the font grows, do animations stop? A chat that respects the visitor's settings feels considerate; one that ignores them can be unusable for people who depend on them."),

      h2("Frequently asked questions"),
      faq(
        ["How do I test a chatbot on mobile?", "Use real phones, run the whole path from opening the chat to the booking confirmation, and check launcher position, keyboard behaviour and page speed."],
        ["Why does the keyboard hide my chat input?", "The chat window does not resize when the keyboard opens. Report it to your vendor with the phone and browser."],
        ["Should the chat open automatically on mobile?", "No. It covers most of the screen. Show a small bubble instead."],
        ["What is a good launcher size?", "Large enough to tap comfortably with a thumb, without dominating the page."],
        ["Does the chat slow my mobile pages?", "It can. Measure page speed on a mobile profile before and after."],
        ["How often should I test?", "After any change to the widget, theme or page layout, and quarterly otherwise."],
      ),
      p("See the [website widget feature](/product/website-widget), read [chat widget design](/blog/website-chatbot-widget-design) and test in the [playground](/playground)."),
    ],
  }),

  pillar({
    slug: 'performance-optimization-embedded-chat-widgets',
    title: 'Chat Widget Performance: How to Keep a Chatbot From Slowing Your Website',
    description: 'How embedded chat widgets affect page speed, and what to measure and do about it: script loading, Core Web Vitals, layout shift, third-party cost, caching and a testing routine.',
    primaryKeyword: 'chat widget page speed',
    secondaryKeywords: ['chatbot slows website', 'third party script performance', 'Core Web Vitals chat widget', 'lazy load chat widget'],
    body: [
      p("A chat widget is a third-party application running on your page. It has to download code, start running, connect to a server and draw itself, all while your visitor is trying to read your site. Done badly, it delays the content people came for, shifts the layout as it appears and adds weight on slow connections. Done well, it loads quietly after the page and is barely noticeable. Because search engines and visitors both care about speed, it is worth measuring what your widget costs and reducing it. This guide explains how widgets affect performance, what to measure, what your vendor should provide, what you can do on your site and a simple routine to check before and after installation."),

      h2("How a chat widget can slow a page"),
      table(["Cost", "What happens"], ["Download size", "The script and its assets compete with your content for bandwidth"], ["Main-thread work", "Running and drawing the widget can delay interaction"], ["Network requests", "Extra connections to fetch config, fonts, images or start a session"], ["Layout shift", "A widget that appears late can move content"], ["Render blocking", "A script loaded in the wrong place can delay the whole page"], ["Repeat cost on every page", "The widget loads on all pages unless limited"]),
      p("Most of these are manageable with sensible loading."),

      h2("The measures that matter"),
      table(["Measure", "What it tells you", "Rule of thumb"], ["Largest Contentful Paint (LCP)", "How fast the main content appears", "Should not get worse after the widget is added"], ["Interaction to Next Paint (INP)", "How responsive the page is to taps and clicks", "Watch for delays when the widget starts"], ["Cumulative Layout Shift (CLS)", "How much content jumps", "The widget should not move anything"], ["Total blocking time and page weight", "Extra work and bytes", "Compare before and after"], ["Time to interactive for the chat", "How soon the chat works when tapped", "Should feel instant when opened"]),
      p("Google's Core Web Vitals, LCP, INP and CLS, are the standard measures, and you can check them with free tools such as PageSpeed Insights or the Lighthouse panel in your browser. See [Google's guidance on Core Web Vitals](https://web.dev/vitals/)."),

      h2("What your vendor should do"),
      ul("Load the script so it does not block the page, and keep it small.", "Load the heavy parts only when the visitor opens the chat.", "Reserve space or use a fixed launcher so nothing jumps.", "Compress and cache assets, and serve them from a fast network.", "Isolate the widget's styles so they do not affect your page; see [why widgets use Shadow DOM](/blog/shadow-dom-website-chatbot-widgets).", "Avoid extra third-party calls on load."),
      p("Ask for details: how big is the script, when does it load and what does it request on page load? Crescelo's widget is added with one script tag from your dashboard; measure your own pages with and without it, because your theme, other scripts and connection all matter."),

      h2("What you can do on your site"),
      ol("Add the snippet in the footer, just before the closing body tag, so it does not sit ahead of your content.", "Load the chat only on pages where it helps; skip pages where it is not needed.", "Delay the load slightly, for example after the page is idle, if your tool supports it.", "Avoid stacking several chat or popup tools at once.", "Keep your own pages light: compress images, limit other scripts.", "Use a fast host and caching for the rest of the site."),
      p("Some optimisation plugins and tag managers can delay third-party scripts until the visitor interacts. Test carefully: delaying too aggressively can make the chat feel slow to appear. See the [WordPress installation guide](/blog/install-ai-chatbot-wordpress-guide) and the [guide for Webflow, Squarespace and Wix](/blog/embed-ai-chatbot-webflow-squarespace-wix)."),

      h2("A before-and-after test"),
      ol("Pick five key pages: home, services, pricing, contact and a blog post.", "Run each through PageSpeed Insights on mobile and note LCP, INP, CLS and the overall score, before installing the widget.", "Install the widget.", "Run the same pages again, at the same time of day, three times each, because results vary.", "Compare the medians.", "If a metric is worse, investigate: which requests, what timing, which page."),
      table(["Result", "Action"], ["Little or no change", "Fine; keep monitoring"], ["LCP worse", "Check whether the script loads before content; move to the footer"], ["CLS worse", "Check the launcher reserves space or has a fixed position"], ["INP worse", "Check for work at page load; delay if possible"], ["Page weight much higher", "Ask your vendor about size and lazy loading"]),

      h2("Mobile and slow connections"),
      p("Test on a throttled mobile profile, as many visitors have slower connections than you do. A widget that adds a few hundred milliseconds on broadband can add seconds on weak data. Also test after the browser cache is cleared, because first visits are the slowest. See [chat on a phone](/blog/mobile-ai-chatbot-optimization)."),

      h2("Performance and SEO"),
      p("Page speed is one of many ranking signals, and it affects conversions directly: people abandon slow pages. A modest, well-loaded widget should not harm either. If measurements show a harm, address it rather than guessing. Note that the chat's content may not be indexed by search engines; it is an interaction layer, not page content. See [SEO basics for service businesses](/blog/local-seo-conversion-blueprint)."),

      h2("Ongoing monitoring"),
      ul("Re-test key pages after any change to your theme, plugins or widget.", "Watch your Core Web Vitals report in Search Console for changes.", "Check speed after big campaigns, when traffic patterns change.", "Ask your vendor to tell you about widget updates."),

      h2("Worked example: a plumbing website"),
      p("A plumbing company measured its home page at a mobile score of 72 before installing chat. After adding the widget in the footer, the score dropped to 66, mostly from extra work at load. The owner asked the developer to load the chat only on the home, services and contact pages, and to load it after the page became idle. The score returned to 71, with no visible delay in the chat opening for visitors who wanted it. The lesson: a small drop is often fixable by loading the widget later and only where useful."),
      table(["Step", "Mobile score (illustrative)"], ["Before", "72"], ["After installing everywhere", "66"], ["After limiting pages and delaying load", "71"]),

      h2("Questions to ask your chatbot vendor about performance"),
      ol("How large is the script, compressed, and what does it load when the page loads?", "Is the heavier code loaded only when the visitor opens the chat?", "Does the launcher reserve its space so nothing moves?", "Which third-party services does the widget call?", "How is the script cached, and how often does it change?", "Can I limit the widget to selected pages?", "Do you publish any performance results?"),
      p("A vendor who can answer these plainly has thought about performance. One who cannot may not have measured it."),

      h2("A quick performance checklist"),
      ul("Snippet in the footer, once.", "Chat limited to pages where it helps.", "Before-and-after speed tests recorded.", "No layout shift when the launcher appears.", "Heavy code loads only when the chat opens.", "Re-test after any theme, plugin or widget change."),

      h2("Frequently asked questions"),
      faq(
        ["Do chat widgets slow down websites?", "They can, by adding download size, script work and layout shifts. A well-built widget loaded after the page adds little. Measure your own pages before and after."],
        ["Where should I place the chat script?", "In the footer, just before the closing body tag, so it does not delay your content."],
        ["Should I load the chat on every page?", "Only where it helps. Skipping pages where it is not needed reduces cost."],
        ["Can I delay loading the widget?", "Often yes, using your tag manager or optimisation plugin. Test that the chat still appears quickly enough."],
        ["How do I measure the impact?", "Run PageSpeed Insights or Lighthouse on key pages before and after, on mobile, several times, and compare LCP, INP and CLS."],
        ["Does the chat affect SEO?", "Only through speed and user experience. A well-loaded widget should not harm either."],
      ),
      p("See the [website widget feature](/product/website-widget), read [how to add an AI chatbot to your website](/blog/add-ai-chatbot-to-your-website) and test your setup with the [playground](/playground)."),
    ],
  }),
];
