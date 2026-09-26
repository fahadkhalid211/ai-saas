import { faq, h2, ol, p, pillar, table, ul } from '../authoring';

export const PILLAR26 = [
  pillar({
    slug: 'conversational-rescheduling-cancellations',
    title: 'Letting Clients Reschedule and Cancel Without Calling You: A Practical Guide',
    description: 'How to let customers change or cancel bookings online: self-service links, cancellation windows, wording, reducing no-shows, filling freed slots and what to avoid.',
    primaryKeyword: 'online rescheduling and cancellations',
    secondaryKeywords: ['let clients reschedule appointments', 'self-service cancellation link', 'reduce no-shows', 'cancellation policy wording'],
    body: [
      p("Every service business knows the pattern: a client needs to move their appointment, the office is closed or the line is busy, they give up trying and simply do not turn up. The slot is wasted, the client feels awkward about returning and you have lost income from something that was easy to prevent. Making it simple to reschedule or cancel is one of the most effective, least glamorous ways to reduce no-shows, because most people who miss appointments did not plan to. They ran out of time or courage to call. This guide covers how to offer self-service changes: what the customer should be able to do, how to word your policy so it is fair and clear, how to handle late changes, how to fill freed slots and how a chat assistant and booking links fit in. It is honest about what Crescelo does today: confirmations include a private link to change or cancel, and reminders go by email before the appointment."),

      h2("Why easy changes reduce no-shows"),
      table(["Barrier to changing a booking", "What the client does", "What helps"], ["Office closed or phone engaged", "Gives up and does not attend", "A link they can use at any hour"], ["Fear of an awkward conversation", "Avoids you altogether", "A no-fuss, no-explanation option"], ["Unclear policy", "Assumes they will be charged, so stays silent", "A short, plain policy stated in the confirmation"], ["Having to search for the booking", "Delays until too late", "The link in every message"], ["No alternative offered", "Cancels and never rebooks", "New times offered straight away"]),
      p("A cancellation you know about a day ahead is a problem you can partly solve. A no-show is a total loss."),

      h2("What clients should be able to do on their own"),
      ul("See their appointment details: date, time, service and place.", "Move it to another available time.", "Cancel it, with a short reason if you want one (optional).", "Add it to their calendar.", "Ask a question about the change, without having to phone."),
      p("Crescelo's confirmation email includes a private link for the client to change or cancel their booking, and you receive the update in the dashboard and calendar feed. Anyone who has the link can act on that booking, so it is meant to be private to the client."),

      h2("Write a policy people can understand"),
      p("A cancellation policy exists to protect your time, not to punish anyone. Keep it short, specific and visible at the moment of booking and in the confirmation."),
      table(["Element", "Example wording"], ["Notice period", "Please let us know at least 24 hours before your appointment so we can offer the time to someone else."], ["How to change", "Use the link in your confirmation email; it takes under a minute."], ["Late changes", "Changes with less than 24 hours' notice may be charged at 50% where a deposit or fee applies."], ["Emergencies", "If something unexpected happens, contact us and we will do our best to help."], ["Repeated no-shows", "After two missed appointments without notice, we may ask for a card or payment in advance."]),
      p("Only include a fee if you actually collect one. Crescelo does not take deposits or payments in its booking flow, so a fee would be handled through your own payment method or process. If you do not charge, say so and rely on courtesy: 'Please tell us if you cannot come; it lets us offer the time to someone waiting.'"),

      h2("Make the link impossible to miss"),
      ol("Include it in the confirmation email, and again in every reminder.", "Repeat it in the calendar event description if your system supports it.", "Have your chat assistant explain how to change a booking whenever asked, and mention the confirmation email.", "Add a line to your website's booking or contact page.", "If you use hosted pages or social bio links, place the instructions there too."),
      p("Reminders matter as much as the change link. Crescelo sends email reminders before the appointment; a reminder that says 'Need to change? Use this link' turns a possible no-show into a rescheduling."),

      h2("Handle the reschedule conversation well"),
      p("When someone tells your chat assistant they cannot make it, the ideal response is short and helpful: acknowledge, point to the private link in their confirmation or offer to book a new time, and do not interrogate. The assistant cannot see or edit an existing booking by guesswork, so it should direct the client to the change link or hand over to staff. Example: 'No problem at all. You can move it using the link in your confirmation email, or tell me which days suit you and I will show available times.'"),
      table(["Client says", "Helpful response"], ["Can I move my appointment to next week?", "Use the link in your confirmation to pick a new time, or I can show you what is free next week."], ["I need to cancel", "Sorry to hear that. You can cancel with the link in your confirmation email. Would you like to book a different day?"], ["I lost my confirmation", "I cannot look up bookings here, but I can pass a message to the team, or you can book a new time and we will remove the old one."], ["I am running late", "Please call or message the team so they know; they will let you know if we can still see you."]),

      h2("Fill the gaps that cancellations leave"),
      ul("Keep a short, informal waiting list of clients who want an earlier time. Crescelo has no built-in waiting list, so a simple spreadsheet or notes list works.", "When a cancellation arrives, message the first person on the list.", "Post the freed slot on your website or social page if it is short notice and you do that kind of thing.", "Note popular days so you can see when cancellations cluster.", "Encourage cancellers to rebook, and make it easy."),

      h2("Late cancellations and no-shows: stay fair"),
      ul("Treat first offences kindly; life happens.", "Apply your policy consistently, so it does not feel personal.", "Check the reason: repeated no-shows may signal confusing reminders or the wrong time slots.", "Ask no-shows for a reason in a brief, friendly message, and offer to rebook.", "Do not use the policy as a weapon against a good long-term client who has had a real emergency."),
      p("Where deposits or fees apply, describe them in your booking terms and check consumer law in your area. See [deposits and show-up rates](/blog/deposit-collection-psychology-show-up-rates) for the trade-offs."),

      h2("Measure what changes"),
      table(["Measure", "How", "What it tells you"], ["No-show rate", "Missed appointments divided by booked", "Whether the process is working"], ["Reschedule rate", "Changes divided by booked", "How many would otherwise have been lost"], ["Time of cancellation", "Hours before the appointment", "Whether the notice period suits your business"], ["Rebooking after cancellation", "Share who book again within two weeks", "Whether you retain them"]),
      p("Review these monthly. A rise in reschedules with a fall in no-shows is a good sign, not a problem."),

      h2("Common mistakes"),
      ul("Hiding the change link in small print.", "Making people phone to cancel.", "A long, legalistic policy.", "Charging fees you never enforce, or enforce unpredictably.", "Failing to offer a new time when someone cancels.", "Letting the assistant promise changes it cannot make."),

      h2("Frequently asked questions"),
      faq(
        ["Can clients reschedule or cancel without calling?", "Yes. In Crescelo, the confirmation email contains a private link to change or cancel the booking, and reminders are sent by email before the appointment."],
        ["Does this reduce no-shows?", "It removes a common reason for them, the hassle of calling. Combine it with reminders and a clear policy."],
        ["Can the chat assistant move a booking for me?", "It points clients to their private change link or offers new times. It cannot modify a booking it cannot identify, so it hands over to staff when needed."],
        ["Does Crescelo charge cancellation fees or take deposits?", "No. Deposits and payments are not part of the built-in booking flow, so any fee is handled through your own process."],
        ["How much notice should I ask for?", "Twenty-four hours is common, but choose what fits how quickly you can refill a slot."],
        ["How do I fill last-minute cancellations?", "Keep a short waiting list and message the people on it when a slot opens."],
      ),
      p("See the [appointment booking feature](/product/appointment-booking), try it in the [playground](/playground) and read [seven traps that stop visitors booking online](/blog/calendar-friction-audit-scheduling-traps) and [follow-up after the appointment](/blog/post-appointment-nurture-rebooking-sequences)."),
    ],
  }),

  pillar({
    slug: 'calendar-friction-audit-scheduling-traps',
    title: 'Seven Traps That Stop Visitors Booking Online (and How to Audit Your Own Booking Flow)',
    description: 'An audit of your online booking flow: seven common friction points, from hidden buttons and slow pages to confusing slots and forced accounts, with tests and fixes for each.',
    primaryKeyword: 'online booking friction audit',
    secondaryKeywords: ['why customers abandon booking', 'improve online scheduling conversion', 'appointment booking UX', 'booking page mistakes'],
    body: [
      p("You have set up online booking. Visitors are coming to your site. Yet fewer of them book than you expected. Before assuming demand is the issue, walk through the process as a first-time customer on a phone. Booking flows leak in small, unglamorous ways: a button that is hard to find, a form that asks too much, a calendar that shows no times, a confirmation that does not arrive. Each leak loses a few percent of visitors, and together they can lose most of them. This guide describes seven of the most common traps, shows how to test for each one in ten minutes, and suggests fixes. It is written for owners of salons, clinics, studios, trades and consultancies who use any scheduling tool, including Crescelo's built-in booking, Calendly or Cal.com. Where it mentions what Crescelo supports, it sticks to the facts: one set of opening hours, one slot length, a locked slot while booking, and a confirmation email with a private change link."),

      h2("How to run the audit"),
      ol("Use a phone on mobile data, not your office computer.", "Start from your home page as if you had never seen the business.", "Try to book your most popular service, timing yourself.", "Write down every moment you hesitated, tapped the wrong thing or felt unsure.", "Repeat with someone who has never used your site."),
      p("Ten minutes of this reveals more than a month of statistics."),

      h2("Trap 1: Nobody can find the booking button"),
      table(["Symptom", "Test", "Fix"], ["The button sits below the fold or only in the menu", "Can you find it in three seconds on a phone?", "Put a clear 'Book' button at the top of the home and service pages"], ["It has a vague label such as 'Contact'", "Would a stranger know what happens next?", "Use 'Book an appointment'"], ["It is hidden in a footer", "Scroll from the top", "Repeat the button at natural decision points"]),
      p("A chat assistant helps here: it can offer to book right after answering a question, at the moment the visitor is ready."),

      h2("Trap 2: Too many steps before seeing times"),
      p("Every screen before the calendar loses people. Asking for an account, a long form, a service quiz and a phone number before showing availability tells the visitor that booking will be a chore. Show available times first and collect details afterwards. Ask only for what you need to serve them: name, contact detail and the service."),

      h2("Trap 3: The calendar shows no availability"),
      ul("Opening hours set too narrowly, so few slots appear.", "A slot length that does not match how long you really need, leaving odd gaps.", "Dates far in the future showing nothing because of a booking window.", "Timezone confusion when visitors travel or book for someone elsewhere."),
      p("Open the calendar as a visitor and see how many days show times. If it looks empty, review your hours and slot length. Remember that Crescelo's built-in picker uses one set of opening hours and one slot length, and it hides slots already taken. It does not read your personal calendar, so a busy morning in Google Calendar will not block slots unless you close those hours in the settings. If you need different lengths per service or buffers between appointments, a tool such as Calendly or Cal.com, which Crescelo can link to, may fit better."),

      h2("Trap 4: Confusing or incomplete slots"),
      table(["Problem", "Effect", "Fix"], ["Times in an unfamiliar format", "Wrong bookings", "Show a clear date, weekday and time"], ["No indication of duration", "Client unsure if it fits", "State how long it takes"], ["A slot disappears when clicked", "Frustration", "Lock the slot while the visitor completes the form, as Crescelo does"], ["Too many options at once", "Decision fatigue", "Offer the next few available times first"]),

      h2("Trap 5: The mobile experience is poor"),
      p("Most bookings are made on phones. Test the flow with one hand. Tap targets should be large enough, forms should use the right keyboard for email and phone fields, and the page should load in a couple of seconds on mobile data. A chat widget should not cover the buttons of the booking form; see [performance of embedded chat widgets](/blog/performance-optimization-embedded-chat-widgets)."),

      h2("Trap 6: No reassurance about what happens next"),
      ul("A visitor who taps 'Book' and sees nothing may book twice or leave.", "Show a clear confirmation screen with the date, time and service.", "Send an email confirmation immediately, with a link to change or cancel and an add-to-calendar option.", "Explain what to bring or do, and how to reach you."),
      p("Crescelo sends a confirmation email with a private change link and offers add-to-calendar options in the chat. Test that the email arrives quickly and is not in spam; see [making sure booking emails reach the inbox](/blog/configure-custom-smtp-resend-booking-emails)."),

      h2("Trap 7: Hidden rules and surprise conditions"),
      p("Nothing loses trust faster than a surprise at the end: a cancellation fee, a required deposit, a service you do not offer at that location. State conditions before the visitor commits, in a sentence, not a legal block. If a service needs a consultation first, say so on the service page and in the assistant's answers."),

      h2("Scoring your audit"),
      table(["Trap", "Pass", "Fail"], ["1. Findability", "Button visible in three seconds", "Hidden or vaguely labelled"], ["2. Steps", "Times shown before details", "Account or long form first"], ["3. Availability", "Times shown for the coming weeks", "Empty or nearly empty calendar"], ["4. Slot clarity", "Date, time and duration obvious", "Ambiguous"], ["5. Mobile", "Easy one-handed", "Awkward or slow"], ["6. Reassurance", "Confirmation on screen and email", "Nothing happens visibly"], ["7. Rules", "Conditions stated before booking", "Surprises at the end"]),
      p("Fix the failures in order. The first two usually have the biggest effect."),

      h2("After the fix: measure"),
      ul("Count visits to the booking page against completed bookings.", "Watch where chat conversations about booking end.", "Ask new customers whether anything was confusing.", "Re-run the audit every quarter and after any website change."),

      h2("A quick fix list for this week"),
      ul("Move the booking button to the top of your home and service pages.", "Widen your opening hours by an hour on your busiest day and see if bookings rise.", "Check that the confirmation email arrives within a minute and includes the location.", "Book once yourself on a phone and delete the test booking.", "Add one sentence about your cancellation policy to the booking page."),
      p("Small changes like these are cheap to try and easy to undo, which makes them a good way to learn what your visitors respond to before larger changes."),

      h2("Frequently asked questions"),
      faq(
        ["Why do visitors abandon online booking?", "Usually friction: a hard-to-find button, too many steps, an empty calendar, poor mobile experience or unclear conditions."],
        ["How do I test my booking flow?", "Book your most popular service on a phone as if you were a stranger, time yourself and note every hesitation."],
        ["Does Crescelo's booking support different lengths per service?", "No. It uses one set of opening hours and one slot length. For per-service durations, link to a scheduling tool such as Calendly or Cal.com."],
        ["Will the chat assistant help people book?", "Yes. It can offer real available times in the chat when a visitor is ready, and send a confirmation email."],
        ["How often should I audit?", "Every quarter and after any change to the site or booking settings."],
        ["What is the most common trap?", "Making visitors work before showing them available times."],
      ),
      p("See the [appointment booking feature](/product/appointment-booking), [pricing](/pricing) and [why contact forms fail](/blog/why-contact-us-forms-fail). For customers who need to change bookings, read [letting clients reschedule without calling](/blog/conversational-rescheduling-cancellations)."),
    ],
  }),

  pillar({
    slug: 'multi-location-ai-receptionist',
    title: 'One AI Assistant for Several Locations: How to Set It Up Without Confusing Customers',
    description: 'How multi-location businesses can use AI chat: one assistant or one per branch, structuring location details, routing, hours, booking, consistency and testing.',
    primaryKeyword: 'multi-location AI receptionist',
    secondaryKeywords: ['AI chatbot for multiple locations', 'franchise chatbot setup', 'branch specific chatbot', 'multi location business chat'],
    body: [
      p("A business with more than one location has a specific problem: customers do not ask 'what are your hours?', they ask 'what are your hours in the Northfield shop?'. A single generic answer is wrong for most of them. Some questions apply to the whole business, such as your brand promise or your return policy, while others belong to one branch: the address, the opening times, who works there, which services are offered and how to book. If an AI assistant mixes these up, it can send a customer to the wrong address or promise a service the nearest branch does not offer. This guide explains the two ways to set up chat for several locations, how to structure the information so the assistant gets it right, how to route conversations and bookings, how to keep the brand voice consistent and how to test before going live. It also explains what Crescelo does and does not do, so you can choose the right structure."),

      h2("The two structures"),
      table(["Approach", "How it works", "Best for"], ["One assistant for the whole business", "A single knowledge base with a clearly labelled section for each location; the assistant asks or infers which branch", "Small groups of two to five locations that share most services and policies"], ["One assistant per location", "Each branch has its own assistant, knowledge base, hosted page or website widget", "Locations with different services, staff, hours or brands, or separate teams managing them"]),
      p("Neither is universally better. One assistant is simpler to maintain and keeps the brand consistent. Separate assistants keep each branch's information clean and let each team manage its own content. Many businesses start with one and split later."),

      h2("Approach 1: one assistant, many locations"),
      p("The key is that every location's facts are labelled with the location's name in the text itself. Retrieval works on passages of text, so a passage reading 'Opening hours: Monday to Friday, 9 to 5' cannot be attributed to a branch unless the branch is named in it."),
      ul("Create one short document per location, starting with its name, address and area.", "Repeat the location name in each section: 'Northfield: opening hours', 'Northfield: parking', 'Northfield: services'.", "Put shared policies, such as refunds and privacy, in a separate company-wide document.", "Add a short instruction: 'If the visitor has not said which location they mean, ask them before giving hours, addresses or availability.'", "List which services each location offers, so the assistant does not promise treatments the branch lacks."),
      table(["Content", "Where it goes"], ["Company story, values, brand voice", "Company-wide document"], ["Refunds, privacy, cancellation rules that apply everywhere", "Company-wide document"], ["Address, hours, phone, parking, transport", "One document per location"], ["Services and prices that differ", "Per-location, labelled clearly"], ["Local promotions and events", "Per-location, with end dates"]),

      h2("Approach 2: one assistant per location"),
      ol("Create an assistant for each branch and give it its own name, welcome message and colours if you want each to feel local.", "Load a knowledge base containing the shared company documents plus that branch's own documents.", "Install each widget on the matching page of your website, or give each branch its own hosted page or link.", "Set each branch's opening hours and booking settings in its own assistant.", "Assign a person at each branch to review the unanswered questions weekly."),
      p("Plans limit how many assistants and hosted pages you can have; Crescelo's Starter, Growth and Agency plans allow one, three and seven hosted pages respectively, so check that your plan covers your number of branches. See [pricing](/pricing)."),

      h2("Routing visitors to the right branch"),
      ul("Ask early: 'Which location are you interested in?', with the branch names as quick-reply suggestions.", "Where a page belongs to a branch, install the branch's assistant on that page so no question is needed.", "For enquiries that cross branches, for example 'Which of your shops is nearest to me?', include a list of areas each branch serves; see [service area verification](/blog/service-area-verification-ai-chat).", "Capture the preferred branch with each lead so the right team follows up.", "Make it easy to switch: 'Would you like information for another location?'"),

      h2("Booking across locations"),
      p("Crescelo's built-in booking uses one set of opening hours and one slot length per assistant, and it hides slots that are taken. It does not assign staff or handle several rooms. For several locations, the cleanest pattern is a separate assistant and booking calendar for each branch, so hours and availability are never mixed. Alternatively, link each location to its own Calendly or Cal.com page. Whichever you choose, make sure the confirmation email names the location and address, because that is the detail customers most often get wrong."),

      h2("Keep the brand consistent"),
      ul("Write the tone instructions once and reuse them for every assistant.", "Use the same core documents for policies and company facts, updated in one master copy.", "Agree on wording for common situations such as complaints and refunds.", "Review each assistant's conversations against the brand guidelines each quarter.", "Decide who can change instructions and documents; see [securing your account with roles](/blog/setup-rbac-2fa-team-security)."),
      p("See [making the assistant sound like your business](/blog/brand-voice-alignment-ai-receptionist) for a tone guide."),

      h2("Handling local differences"),
      table(["Difference", "How to handle it"], ["Different opening hours", "State hours per location, with special dates in the same document"], ["Different services", "List services per location; say 'not available at Northfield' where relevant"], ["Different prices", "Name the location beside each price"], ["Different languages", "Add the language spoken at each location; Growth includes a multilingual switcher"], ["Different contact channels", "Give each branch's own phone and email"]),

      h2("Test before you launch"),
      ol("Ask the same question for each location and check that the answer names the right one.", "Ask without naming a location and confirm the assistant asks which one.", "Ask about a service only one branch offers, at another branch.", "Ask for directions and parking at every location.", "Try a booking at each location and check the confirmation email."),
      p("Repeat after every change, and keep the question list as a regression test."),

      h2("Common mistakes"),
      ul("Putting all hours into one paragraph without location names.", "Forgetting to update one branch's document when something changes.", "Letting each branch write its own tone.", "Not capturing which branch a lead wanted.", "Using one booking calendar for locations with different hours.", "Never asking staff at each branch to review answers."),

      h2("Frequently asked questions"),
      faq(
        ["Should I use one assistant or one per location?", "One assistant suits a few similar locations. Separate assistants suit branches with different services, staff or hours."],
        ["How does the assistant know which location a visitor means?", "By asking, or by being installed on that branch's page. Instruct it to ask when the location is unclear."],
        ["Can one booking calendar cover several locations?", "Not cleanly. Use a separate assistant and calendar per branch, or link to each branch's own scheduling page."],
        ["How many assistants can I have?", "That depends on your plan. Check the pricing page for the current limits."],
        ["How do I keep the brand voice consistent?", "Reuse the same tone instructions and company documents for every assistant, and review conversations regularly."],
        ["What is the biggest risk?", "Location facts that are not labelled with the branch name, so the assistant gives one branch's details for another."],
      ),
      p("Try a multi-location document set in the [playground](/playground), see the [knowledge base feature](/product/knowledge-base) and read [governing AI chat across many locations](/blog/enterprise-ai-automation-governance-service-franchises)."),
    ],
  }),

  pillar({
    slug: 'deposit-collection-psychology-show-up-rates',
    title: 'Do Deposits Reduce No-Shows? What the Evidence Suggests and How to Decide',
    description: 'Do booking deposits cut no-shows? A balanced look at the psychology, trade-offs, alternatives such as reminders and easy rescheduling, and how to test what works for your business.',
    primaryKeyword: 'do deposits reduce no-shows',
    secondaryKeywords: ['booking deposit policy', 'reduce appointment no-shows', 'deposit vs reminder', 'cancellation fee psychology'],
    body: [
      p("Deposits are the most discussed tool for reducing no-shows, and also the most contentious. Supporters say that asking clients to pay something in advance makes them value the appointment and show up. Critics say deposits put off new customers, create refund disputes and add admin work. Both are partly right. The honest answer is that deposits can help in some businesses and hurt in others, and that cheaper measures such as clear reminders and easy rescheduling often deliver much of the benefit with far less friction. This guide explains why deposits might change behaviour, what the trade-offs are, which types of business use them successfully, what alternatives to try first and how to test a change without guessing. It also states plainly that Crescelo's built-in booking does not collect deposits or payments today, so deposits, if you use them, are handled by your own payment method."),

      h2("Why a deposit might change behaviour"),
      ul("**Commitment:** paying something makes the booking feel real, not a casual reservation.", "**Loss aversion:** people dislike losing money they have already paid more than they like the idea of gaining it back.", "**Signalling:** a deposit tells the client that your time is valuable and the slot cannot easily be replaced.", "**Filtering:** it discourages people who were never going to come, at the cost of some who might have."),
      p("Behavioural research on commitment supports these effects in general, but results in a specific business depend on price, customer type and competition. Be careful with claims of precise percentages from vendors; they rarely match your situation."),

      h2("The trade-offs"),
      table(["Benefit", "Cost"], ["Fewer casual bookings that turn into no-shows", "Some genuine customers abandon the booking at the payment step"], ["Income protected when someone fails to attend", "Refunds and disputes to manage"], ["Signals professionalism for high-value services", "May feel unwelcoming for low-cost or first-time services"], ["Helps with expensive materials or specialist time", "Payment processing fees and admin"], ["Discourages serial no-shows", "Requires a clear, fair policy and consistent enforcement"]),
      p("A deposit is an extra step in the booking flow. Every extra step loses some visitors, which is why you should only add one where the cost of no-shows justifies it."),

      h2("Where deposits tend to make sense"),
      ul("Long or expensive appointments, such as several hours of colour work or a tattoo session.", "Services with costly preparation or materials.", "High-demand slots where a no-show blocks someone else.", "Group classes and events with limited places.", "Businesses that have had repeated no-shows despite reminders."),
      h2("Where they may not"),
      ul("Short, low-priced services where the deposit is a large share of the price.", "New businesses building trust, where friction costs more than an occasional gap.", "Services people book on impulse, where a payment step loses conversions.", "Situations where you cannot handle refunds quickly and fairly."),

      h2("Cheaper things to try first"),
      table(["Measure", "Why it helps", "Effort"], ["Email reminders before the appointment", "Removes forgetfulness, the most common cause", "Low; Crescelo sends email reminders"], ["A private link to change or cancel", "Removes the awkwardness of calling", "Low; included in Crescelo's confirmation email"], ["A clear cancellation policy in the confirmation", "Sets expectations kindly", "Low"], ["Confirming by reply for long appointments", "Adds a small commitment", "Medium"], ["A short waiting list to refill slots", "Reduces the cost of a cancellation", "Low"], ["Personal follow-up for repeat no-shows", "Addresses the cause", "Medium"]),
      p("See [letting clients reschedule and cancel without calling](/blog/conversational-rescheduling-cancellations) and [eliminating no-shows with reminders](/blog/eliminate-service-no-shows-playbook). Try these for a couple of months before adding a payment step, and measure the effect."),

      h2("If you do take deposits"),
      ol("Keep the amount modest but meaningful, for example a fixed sum or a small percentage.", "State clearly what it covers, whether it is deducted from the final price and when it is refundable.", "Explain the policy before the client commits, not afterwards.", "Use a reputable payment provider and comply with its terms and local consumer law.", "Refund promptly when the client gives proper notice.", "Be consistent, but allow reasonable exceptions for real emergencies.", "Record deposits in your own system, since Crescelo's booking does not handle payments."),

      h2("Test rather than guess"),
      table(["Step", "How"], ["Baseline", "Measure your no-show rate for two months"], ["Change one thing", "Improve reminders and the change link first"], ["Measure again", "Compare no-shows and rebookings"], ["Then consider a deposit", "Only for the services where no-shows remain costly"], ["Pilot it", "Try it for one service or one day of the week and compare booking volume as well as no-shows"]),
      p("Watch both sides of the ledger: no-shows avoided and bookings lost. A deposit that prevents ten no-shows but deters twenty bookings is not a win."),

      h2("Wording that keeps goodwill"),
      p("Example: 'To hold your appointment we take a $20 deposit, which is deducted from your final bill. If you need to change or cancel, let us know at least 24 hours before and we will refund it in full or move it to a new date.' It is short, fair and tells the client what happens in each case."),

      h2("Common mistakes"),
      ul("Adding a deposit before trying reminders.", "Keeping the policy in fine print.", "Refusing refunds for legitimate emergencies.", "Applying rules unevenly.", "Not measuring conversions after the change.", "Claiming your system collects deposits when it does not."),

      h2("A worked comparison"),
      p("Imagine a studio with 100 bookings a month and eight no-shows, each costing $60 in lost income, a monthly loss of $480. Better reminders and a change link cut no-shows to five, saving $180. A deposit might cut them to two, saving a further $180, but if it also deters five of the hundred bookings at $60 each, that is a $300 loss, more than the gain. The numbers here are illustrative, not predictions; the point is to run the same sum with your own figures before deciding."),
      table(["Scenario", "No-shows", "Bookings", "Approximate monthly result"], ["Today", "8", "100", "Baseline"], ["Reminders and change link", "5", "100", "Better by about $180"], ["Plus deposit", "2", "95", "Depends on your own numbers"]),
      p("Where the sum is close, choose the option that keeps the booking process simplest for customers."),

      h2("Alternatives that keep some commitment"),
      ul("Ask clients to confirm by replying to the reminder for long or expensive appointments.", "Take card details on file, if your payment provider allows it, and state that a fee applies only to late cancellations.", "Offer a small discount or a priority slot to clients who confirm early.", "Require a deposit only from clients who have missed an appointment before, and explain why kindly."),
      p("Targeted measures like these protect your time without adding a payment step for every new customer, and they are easier to explain and to reverse if they do not work."),

      h2("Frequently asked questions"),
      faq(
        ["Do deposits reduce no-shows?", "They can, especially for long or expensive appointments, but they also add friction and may deter bookings. Try reminders and easy rescheduling first, and measure the effect."],
        ["Does Crescelo collect deposits?", "No. The built-in booking does not take payments or deposits. Use your own payment process if you need one."],
        ["What is the cheapest way to reduce no-shows?", "Email reminders and a simple link to change or cancel."],
        ["How much should a deposit be?", "Enough to matter to the client without being a barrier; many businesses use a fixed amount or a modest percentage."],
        ["Are deposits legal?", "Generally yes, but consumer protection rules vary. State terms clearly and check the rules where you operate."],
        ["How do I know whether it worked?", "Compare no-show rate and total bookings before and after, over a few months."],
      ),
      p("See the [appointment booking feature](/product/appointment-booking) and [pricing](/pricing), and read [seven booking traps](/blog/calendar-friction-audit-scheduling-traps) for other reasons visitors do not complete a booking."),
    ],
  }),

  pillar({
    slug: 'reduce-dental-recall-backlog-chat',
    title: 'Bringing Lapsed Patients Back: A Recall Approach for Dental and Health Practices',
    description: 'How dental and health practices can reduce the recall backlog: identify lapsed patients, write respectful messages, make rebooking easy, handle questions and stay within privacy rules.',
    primaryKeyword: 'dental recall backlog',
    secondaryKeywords: ['bring back lapsed patients', 'patient recall messages', 'reactivate dental patients', 'recall appointment reminders'],
    body: [
      p("Most dental and health practices carry a quiet backlog: patients who are overdue for a check-up, a hygiene visit or a follow-up and simply have not booked. Nothing is wrong; life got busy. But regular visits matter for patients' health and are the backbone of a practice's schedule, so a systematic, friendly approach to recall is worth the effort. The difficulty is that recall is unglamorous work. It needs a list, a message, a way to book and follow-up, and front desks are already busy answering the phone. This guide sets out a practical approach: how to identify who is due, how to write respectful messages that do not pressure or make claims about health, how to make rebooking a one-step action, what questions patients ask when they respond, how a website chat assistant helps, and the privacy rules that apply to health information. Crescelo does not send recall campaigns itself; it answers questions and books appointments once the patient responds. That division is explained clearly below."),

      h2("Step 1: Know who is due"),
      table(["Group", "How to find them", "Priority"], ["Overdue for a routine check-up or hygiene visit", "Your practice management system's recall list", "High"], ["Patients with an unfinished treatment plan", "Treatment records", "High, handled by clinical staff"], ["Patients who missed and did not rebook", "Appointment history", "Medium"], ["Long-lapsed patients", "No visit in a year or two", "Medium, with a gentler message"], ["New patients who had one visit only", "Appointment history", "Medium"]),
      p("Your existing practice software usually produces these lists. Start with a manageable batch, such as the fifty most overdue, and work through it steadily instead of sending a flood."),

      h2("Step 2: Write messages patients respond to"),
      ul("Use their name and the practice's name.", "State the reason simply: 'It has been a while since your last visit and you are due for a check-up.'", "Keep any health statements general and accurate; do not frighten or make promises about outcomes.", "Include one clear action: a booking link or a number.", "Offer flexibility: evening or early appointments, if you have them.", "Make it easy to say no: 'If you have moved or no longer wish to hear from us, reply to let us know.'"),
      table(["Message", "Example"], ["First reminder", "Hi Sam, it is Riverside Dental. It has been a while since your last check-up, and you are due a visit. You can pick a time here: [link]. If you would rather call, we are on 0123 456 789."], ["Second reminder, two weeks later", "Hi Sam, a quick reminder that you are due a check-up at Riverside Dental. We have some appointments free next week: [link]."], ["Final, gentle", "Hi Sam, we have not heard from you, so we will pause our reminders. Whenever you are ready, you can book here: [link]."]),
      p("Three messages spread over a month are enough. More becomes nagging."),

      h2("Step 3: Make rebooking one step"),
      ol("Include a direct booking link or invite them to open the website chat.", "Show real available times, not a form that waits for a call back.", "Confirm immediately by email with the date, time, location and a private link to change or cancel.", "Remind them before the appointment; Crescelo sends email reminders for bookings made through its booking flow.", "Offer to book the next recall at the end of each visit, which prevents the backlog forming again."),
      p("The easiest recall is the one booked before the patient leaves the chair."),

      h2("Step 4: Prepare for the questions that follow"),
      p("When patients respond, they often ask practical questions. Have the answers in your knowledge base so the assistant can respond at any hour:"),
      table(["Question", "What to have ready"], ["How long will the visit take?", "Typical duration of a check-up and hygiene visit"], ["How much will it cost?", "Prices or ranges, and what insurance or plans you accept; see [preparing your service menu and price list](/blog/prepare-service-menu-pricing-docs-rag)"], ["Do you have evening or Saturday times?", "Opening hours by day"], ["I am nervous. Can you help?", "How you support anxious patients, in warm, plain language"], ["Do I need to bring anything?", "Forms, previous records, insurance details"], ["Where do I park?", "Address, parking and transport details"]),
      p("Ensure the assistant does not give clinical advice or diagnose. It should explain that clinical questions are for the dentist and offer a booking or a call back."),

      h2("Step 5: Use the website assistant sensibly"),
      ul("It answers routine questions about hours, prices, location and what to expect.", "It books an appointment when the patient is ready.", "It captures a name and contact details for a call back when a person is needed.", "It hands over sensitive or urgent situations, such as pain or swelling, with a clear message directing them to call the practice or emergency services as appropriate."),
      p("Write the escalation wording with your clinical team, and test it. See [when to hand over to a human](/blog/live-human-handover-flow-design)."),

      h2("Privacy and consent"),
      ul("Health-related information is sensitive personal data in many places, with extra obligations.", "Do not put clinical details in messages or in a chat that the assistant might store.", "Keep messages to what is necessary: an appointment is due.", "Follow your local rules on marketing consent and patient communications; recall reminders about care are often treated differently from promotions, but rules vary.", "Give patients a simple way to opt out, and honour it.", "Read the [GDPR checklist for website chatbots](/blog/website-chatbot-gdpr-checklist) and check the rules that apply to your profession and country."),
      p("This is general information, not legal advice."),

      h2("Measure and adjust"),
      table(["Measure", "What it tells you"], ["Messages sent and bookings made", "Response rate for each message"], ["Time from message to booking", "Whether your timing suits patients"], ["Attendance of recall bookings", "Whether reminders and change links work"], ["Backlog size month to month", "Whether you are keeping up"]),
      p("Review monthly and adjust wording, timing and batch size."),

      h2("Common mistakes"),
      ul("Sending a large batch all at once.", "Using clinical or alarming language.", "Not offering a quick way to book.", "Forgetting to book the next recall at each visit.", "Ignoring opt-outs.", "Expecting the chat assistant to send the campaign itself."),

      h2("A four-week recall plan"),
      table(["Week", "Action"], ["1", "Export the overdue list, remove anyone who has opted out or moved, and pick the first batch"], ["2", "Send the first message; have the front desk ready for replies and bookings"], ["3", "Send the second reminder to those who have not responded; review the questions patients asked and update the knowledge base"], ["4", "Send the final gentle message, count results and choose the next batch"]),
      p("Working in weekly batches keeps the schedule manageable, so new bookings do not arrive all at once, and it lets you improve the wording as you learn what patients respond to."),

      h2("Frequently asked questions"),
      faq(
        ["How do I reduce a recall backlog?", "Identify overdue patients from your records, send a short sequence of friendly messages with a one-step booking link and follow up in manageable batches."],
        ["Can Crescelo send recall messages?", "No. It does not send campaigns. You send them from your practice software or email tool, and Crescelo answers patient questions and books appointments."],
        ["How many reminders should I send?", "Two or three over about a month, then pause."],
        ["What should the assistant not do?", "Give clinical advice or diagnoses. It should offer a booking or direct the patient to a clinician."],
        ["Is patient data safe in chat?", "Keep chat to non-clinical information, follow local privacy law and use a provider with a clear data processing agreement."],
        ["How do I prevent future backlogs?", "Book the next recall appointment before the patient leaves."],
      ),
      p("See the [appointment booking feature](/product/appointment-booking), the [AI assistant](/product/ai-assistant) and [pricing](/pricing)."),
    ],
  }),
];
