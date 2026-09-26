import { faq, h2, h3, note, ol, p, pillar, table, ul } from '../authoring';

export const PILLAR14 = [
  pillar({
    slug: 'plumbing-diagnostic-intake-chat',
    title: 'Plumbing Enquiries by Chat: Diagnostic Questions, Urgency and Callout Booking',
    description: 'How plumbers use a website chat to capture job details, judge urgency, give safe interim advice, state callout fees and book visits, so the call-back starts with facts.',
    primaryKeyword: 'plumber chatbot',
    secondaryKeywords: ['plumbing lead capture', 'emergency plumber website chat', 'plumbing job intake questions', 'book plumber online'],
    body: [
      p("A plumber's phone rings when both hands are inside a cabinet. The caller is stressed, describes the problem badly and hangs up if nobody answers. Someone with a burst pipe will ring the next number on the list within a minute. A website chat cannot fix a pipe, but it can do the work that decides who gets the job: answer straight away, ask the questions a good dispatcher would ask, tell the customer what to do while they wait, state your callout fee and book or alert you. This guide explains how to set that up for a plumbing business: which questions to ask for each type of problem, how to judge urgency, what safe interim guidance to give, how to talk about price, how to book and how to measure whether it is working."),
      note("The safety wording in this article is for your business to adapt and approve. Local regulations and your own insurance and qualifications determine what advice you can give. Never let an assistant give advice beyond what you would give a customer on the phone."),

      h2("What plumbing customers need first"),
      table(["Customer thinks", "What they need to hear"], ["Is this an emergency?", "Whether to shut off water or gas and what to do right now"], ["Will someone come today?", "Your availability and honest arrival window"], ["How much will it cost?", "Callout fee and typical ranges, with the caveat that a firm price needs an inspection"], ["Do you cover my area?", "A quick yes or no with your service area"], ["Can I trust you?", "Licence, insurance and guarantees you can state truthfully"]),
      p("Answering these in seconds, at any hour, is what turns a searching visitor into a booked job."),

      h2("The questions a good dispatcher asks"),
      p("A lead that says 'plumbing problem, please call' costs you a phone call to learn what is wrong. A lead with the details lets you decide, price and prepare before you call. Ask a few targeted questions, one at a time, in plain words."),
      table(["Problem", "Questions that help"], ["Leak", "Where is it (pipe, tap, toilet, ceiling)? How fast is water coming out? Have you turned off the water at the stop valve? Is anything electrical nearby?"], ["Blocked drain or toilet", "Which fixture? One or several blocked? Slow or completely blocked? Any smell or backing up?"], ["No hot water", "Gas, electric or oil system? Any error lights or noises? Since when? Is there cold water?"], ["Boiler or heating", "Make and age if known? Any error code? Is the heating or hot water affected?"], ["Low pressure", "One tap or the whole house? Since when? Recent works nearby?"], ["New install", "What is being installed? Is the supply in place? Any photos or measurements available?"]),
      ul("Ask for the address or postcode early, to check your area.", "Ask for a phone number the customer will answer.", "Ask whether anyone will be home, and access details.", "Invite photos where your process allows: many plumbers ask customers to reply by text or email with a picture."),
      p("Three to five questions are enough. The goal is a lead your dispatcher can act on, not an interrogation."),

      h2("Judging urgency"),
      table(["Level", "Signs", "Response"], ["Emergency", "Water flooding, burst pipe, gas smell, sewage backing up, no heat for vulnerable people", "Safe interim advice, immediate alert to on-call, honest arrival window"], ["Urgent", "Active leak that can be controlled, no hot water, blocked only toilet", "Same-day booking or call within the hour"], ["Routine", "Dripping tap, slow drain, planned install", "Book a convenient slot; estimate"]),
      p("Write these rules with your own experience and keep the wording simple. The assistant should recognise urgency from the customer's words, not decide safety for them."),

      h2("Safe interim guidance"),
      p("What customers do in the first minutes can limit damage. Give only guidance you would give on the phone, and keep it short."),
      ul("**Water leak:** if it is safe to reach, turn off the water at the stop valve, and if water is near electrics, turn off power at the fuse board only if it is safe to do so. Do not touch electrics with wet hands.", "**Gas smell:** do not use switches or naked flames, open windows, leave the building and call the gas emergency number and emergency services from outside.", "**Flooding:** move valuables, and call us straight away.", "**No heating in cold weather:** tell us if someone vulnerable is at home so we can prioritise."),
      p("These are examples for your business to adapt. Where a situation could involve gas or electricity, err strongly on the side of telling the customer to contact the emergency services or the relevant utility."),

      h2("Talking about price honestly"),
      table(["Weak", "Better"], ["We will give you a quote later.", "Our callout fee is $85, which includes the first 30 minutes. Most tap and toilet repairs cost between $120 and $250 including parts, and we confirm a price once we have seen the problem."], ["It could cost anything.", "Simple blockages usually cost from $110; if it turns out to need a camera survey or excavation, we will tell you before doing it."], ["Cheapest around.", "We charge a fair, fixed callout, and we agree the price before any work beyond that."]),
      ul("State the callout fee and what it includes.", "Give ranges for common jobs you can stand behind.", "Say clearly when a firm price needs an inspection.", "Mention out-of-hours or emergency surcharges if they exist, up front."),
      p("Customers accept prices when they are told early and plainly. Surprises cause complaints."),

      h2("Booking the visit"),
      p("For routine and urgent-but-not-emergency jobs, booking straight from the chat converts the visitor while they are ready. Offer time windows you can honour, for example 'between 9 and 12', and confirm by email with what to expect and how to change the booking. Crescelo's booking picker offers slots from your opening hours and one slot length; for a service business with arrival windows, set the slot length to the window you want to promise. Bookings appear in your dashboard and calendar feed. See [AI appointment booking](/blog/ai-appointment-booking) and [electrician service call scheduling](/blog/electrician-service-call-scheduling-chat) for a related example."),
      p("For emergencies, do not rely on a self-service slot. Alert your on-call person and let them confirm the timing."),

      h2("Alerts and dispatch"),
      table(["Lead type", "Alert"], ["Emergency", "Text and email to the on-call plumber, with address, phone and conversation"], ["Urgent", "Email and text to the office, with a call-within-the-hour rule"], ["Routine", "Email, followed up during business hours"], ["Out of area", "Polite reply; no alert"]),
      p("An alert that sits in an inbox is worthless. Send it where a person will see it in minutes, and test it at night. See [emergency dispatch workflows in AI chat](/blog/emergency-dispatch-workflows-ai-chat) and [webhook automations](/blog/webhook-automations-zapier-make-chat-events) for texting the on-call phone."),

      h2("What the assistant should not do"),
      ul("Diagnose complex faults or tell customers to attempt dangerous repairs.", "Promise arrival times it cannot guarantee.", "Quote a fixed price for work that needs inspection.", "Give gas or electrical work instructions.", "Ask customers to send sensitive data in an open chat."),
      p("Write these limits into its instructions and test them."),

      h2("A sample conversation"),
      table(["Speaker", "Message"], ["Customer", "My kitchen tap is leaking under the sink and there is water on the floor."], ["Assistant", "I am sorry, that is stressful. If you can reach it safely, turn off the water at the stop valve under the sink, and keep water away from electrics. Is water still coming out fast, or is it a slow drip?"], ["Customer", "Slow drip, I turned the valve off."], ["Assistant", "Good, that will limit the damage. We can usually visit within a day. Our callout is $85 including the first 30 minutes, and a leak like this is often $120 to $220 with parts. What is your postcode and the best number to reach you? I can offer tomorrow between 9 and 12, or 12 and 3."]),
      p("The assistant gave safe interim guidance, asked one useful question, gave a price range honestly and moved to booking and contact details."),

      h2("Measure it"),
      table(["Metric", "Why"], ["Enquiries outside office hours and how many became jobs", "The main gain"], ["Time from enquiry to first contact", "Response speed"], ["Emergency alerts and time to acknowledge", "Whether the process works"], ["Callout to job conversion", "Whether the price message and follow-up work"], ["Questions asked that you did not expect", "Content gaps"]),
      p("Review the first month's conversations weekly; see [how to review your chatbot's conversations](/blog/audit-website-chatbot-conversations)."),

      h2("Frequently asked questions"),
      faq(
        ["Can a chatbot take plumbing job requests?", "Yes. It asks the questions a dispatcher would ask, records the answers, checks your service area and alerts you, with the conversation attached."],
        ["Should the chatbot give plumbing advice?", "Only short interim guidance you would give on the phone, such as turning off the stop valve. It should never give instructions for gas or electrical work."],
        ["Can it quote prices?", "It can state your callout fee and ranges you can honour, and say that a firm price needs an inspection."],
        ["How does it handle emergencies?", "It recognises urgent wording, gives safe guidance, alerts your on-call plumber and is honest about arrival times."],
        ["Does it work when I am on a job?", "Yes. It answers at any hour and alerts you when a lead needs you."],
        ["Can customers book a visit in the chat?", "Yes. For non-emergency jobs it can offer available slots and confirm by email."],
      ),
      p("See the [lead capture feature](/product/lead-capture), try a plumbing conversation with your own price list in the [playground](/playground) and [start a free trial](/login?mode=register). For the bigger picture, read [AI lead capture for home service contractors](/blog/home-service-contractor-ai-lead-capture)."),
    ],
  }),

  pillar({
    slug: 'hvac-seasonal-tune-up-booking-automation',
    title: 'HVAC Seasonal Tune-Ups: Filling Your Spring and Autumn Schedule With Chat and Reminders',
    description: 'How HVAC companies can fill seasonal tune-up slots: reminder campaigns, a booking chat that answers plan and price questions, capacity control and follow-ups.',
    primaryKeyword: 'HVAC tune-up booking',
    secondaryKeywords: ['HVAC maintenance plan chatbot', 'heating and cooling seasonal booking', 'HVAC lead capture', 'furnace tune up online booking'],
    body: [
      p("HVAC work comes in waves. In a heatwave or the first cold snap, every phone rings at once and emergency calls swamp the schedule. In quieter weeks, crews wait for work. Seasonal tune-ups, a spring air-conditioning check and an autumn heating check, are the tool that smooths those waves: they fill slow periods, reduce breakdowns in busy ones and turn one-off customers into regulars. The challenge is that tune-ups are easy to forget for both sides. Customers do not think about the furnace until it fails, and busy offices forget to contact past customers. This guide explains how to use reminders, a booking chat and simple follow-up habits to fill seasonal schedules, how to describe plans and prices clearly, how to manage capacity and how to measure the result."),

      h2("Why tune-ups are worth the effort"),
      ul("**Smoother workload:** tune-ups can be booked into quieter weeks, balancing the year.", "**Fewer emergencies:** systems that are checked fail less often at the worst moment.", "**Customer loyalty:** a yearly visit keeps your name in front of the customer.", "**Upsell opportunities:** honest recommendations during a visit lead to repair and replacement work.", "**Predictable revenue:** maintenance plans give steady income."),
      p("The point is not to sell things people do not need. It is to make a helpful, well-timed service easy to say yes to."),

      h2("Who to contact and when"),
      table(["Segment", "Message", "Timing"], ["Past customers", "It is time for your annual check", "Six to eight weeks before the season starts"], ["Plan members", "Your included visit is due, here are times", "At the start of the season"], ["Recent installs", "First check after installation, if included", "As your warranty terms suggest"], ["Website visitors", "Answers about tune-ups, with a booking option", "All year"]),
      p("Send reminders before demand peaks, not during. Many companies start spring air-conditioning reminders in early spring and heating reminders in early autumn, adjusted to their climate. Use your own customer records and respect consent rules for marketing messages; see [GDPR and CCPA for chatbot lead capture](/blog/chatbot-lead-capture-gdpr-ccpa-compliance)."),

      h2("What the booking chat should answer"),
      table(["Question", "A good answer"], ["What does a tune-up include?", "A clear checklist of what your technician does"], ["How much is it?", "Price or range, and whether plan members pay less"], ["How long does it take?", "Typical duration"], ["Do I need one every year?", "Your recommendation, in general terms and without scare tactics"], ["What is a maintenance plan?", "What is included, the price and how to join"], ["Can you come this week?", "Real available times"], ["Do you service my brand?", "Brands you service, or that the team will check"]),
      p("Load a short document for each into the assistant's knowledge. Write in plain words and avoid claims you cannot support, such as a specific efficiency saving. See [preparing your service menu and pricing documents](/blog/prepare-service-menu-pricing-docs-rag)."),

      h2("Describe maintenance plans clearly"),
      ul("What visits are included and when.", "What is discounted, such as repairs or parts, and by how much.", "Whether priority service is included and how it works in a busy period.", "The price per year or month and the minimum term.", "How to cancel.", "What is not covered."),
      p("Vague plans create disputes. A one-page plain description helps sales and prevents misunderstandings. The assistant should state it exactly and not improvise."),

      h2("Control capacity"),
      p("The risk of a successful campaign is overload: a hundred tune-up bookings the week the first heatwave hits. Decide how many tune-ups you will book per day and per crew, and set your booking hours and slot length to match. Leave room for emergency calls, and stop offering tune-up slots in weeks when breakdown demand is likely. Crescelo's built-in picker uses your opening hours and one slot length, and hides taken slots; for capacity per crew or per day, use your own scheduling process or Calendly or Cal.com links. See [configuring availability rules](/blog/configure-calendar-sync-availability-rules)."),
      table(["Situation", "Action"], ["Heatwave forecast", "Pause tune-up promotion; protect emergency capacity"], ["Quiet week", "Send a reminder push and offer earlier times"], ["Crew on leave", "Reduce booking hours in advance"], ["Parts delays", "Update lead times in the assistant's documents"]),

      h2("Capture the emergency call too"),
      p("The same chat catches breakdown enquiries. For a system that has stopped, the assistant should recognise urgency, give safe guidance, capture the details and alert your on-call technician. For a gas smell or carbon monoxide alarm, it should tell the customer to leave the building and call the emergency services, not to wait for a technician. See [emergency dispatch workflows in AI chat](/blog/emergency-dispatch-workflows-ai-chat) and [handling emergencies in automated chat](/blog/handling-emergencies-automated-chat)."),

      h2("Reminders after booking"),
      ol("Immediate confirmation with the date, window, what the technician will do and what the customer should prepare, such as access to the unit.", "A reminder the day before with a change link.", "After the visit, a summary of what was done and any recommendations.", "A note for next year: 'We will remind you in March.'"),
      p("Crescelo sends confirmation and reminder emails with a private change link. See [how to reduce no-shows](/blog/eliminate-service-no-shows-playbook)."),

      h2("Measure the season"),
      table(["Metric", "Why"], ["Tune-ups booked per week", "Capacity planning and campaign effect"], ["Booked from reminders versus website", "Which channel works"], ["Plan sign-ups", "Recurring revenue"], ["Repair work generated from tune-ups", "Value beyond the visit"], ["Emergency calls in the season, versus last year", "Whether maintenance helps"], ["No-show rate", "Reminder quality"]),

      h2("What technicians should do on the visit"),
      p("The tune-up is also the moment customers judge you. Technicians should arrive in the window, explain what they will check, leave the area tidy and give a plain summary. Recommendations should be honest and prioritised: what is urgent, what can wait and what is simply worth knowing. Customers who feel informed rather than pressured are far more likely to renew and to refer neighbours."),

      h2("A simple seasonal calendar"),
      table(["When", "Action"], ["Eight weeks before the season", "Update documents, prices and plan descriptions; clean the customer list"], ["Six weeks before", "First reminder to past customers and plan members"], ["Four weeks before", "Second reminder; check capacity"], ["Season start", "Stop promotion if emergencies rise; keep the chat handling questions"], ["End of season", "Review numbers and update for next year"]),

      h2("A worked example: filling the autumn schedule"),
      p("A four-technician HVAC company has 900 past customers and 120 plan members. In early September it sends a short email to each: 'Your annual heating check is due. Book a time that suits you.' The link opens a page with the assistant, which answers questions about what the visit includes and what it costs, and offers times. Booking hours are set to allow two tune-ups per technician per day, leaving the rest of the day for breakdowns. In the first two weeks, 140 tune-ups are booked, about a third of them outside office hours. A second reminder to those who did not respond adds another 60. The busy season arrives with the schedule already full of planned work, and the emergency line is less overloaded than in previous years because more systems were checked."),
      table(["Step", "Number (illustrative)"], ["Customers contacted", "1,020"], ["Tune-ups booked after the first reminder", "140"], ["After the second reminder", "60"], ["Plan sign-ups during the visits", "18"], ["Repair jobs found and completed", "35"]),

      h2("Scripts for the follow-up conversation"),
      ul("**Reminder email:** 'Your annual heating check is due. It takes about an hour and helps avoid breakdowns in the cold. Choose a time here.'", "**In-chat:** 'A tune-up covers filters, safety checks, efficiency and a written report. It is $X for one system, and plan members pay $Y. Would you like to see times?'", "**After the visit:** 'Thank you. Here is a summary of what we checked. We noted [item]; I can send a quote if you wish. We will remind you next autumn.'"),
      p("Keep messages short and helpful, and never invent urgency."),

      h2("Common mistakes"),
      ul("Promoting tune-ups during a heatwave, when crews are needed for breakdowns.", "Vague plan descriptions that lead to disputes about what is included.", "Booking more tune-ups than the crews can complete.", "Forgetting to update prices and lead times in the assistant's documents.", "Sending reminders to customers who asked not to be contacted.", "Never checking whether reminders lead to bookings."),
      p("A short pre-season checklist prevents most of these: documents current, capacity set, reminders scheduled, consent checked and alerts tested."),

      h2("Frequently asked questions"),
      faq(
        ["How do I fill my HVAC tune-up schedule?", "Contact past customers and plan members before the season, make booking easy in a chat or booking page and manage capacity so emergencies are protected."],
        ["Can a chatbot sell maintenance plans?", "It can explain the plan from your document and take an enquiry. Keep the description exact, and let a person handle sign-up and payment."],
        ["Should the chat handle heating emergencies?", "It should recognise urgency, give safe guidance, capture details and alert your on-call technician. For gas or carbon monoxide risks it should direct customers to emergency services."],
        ["How many reminders should I send?", "Usually two before the season, with a confirmation and a day-before reminder for booked visits."],
        ["How do I avoid overbooking?", "Set booking hours and slot length to match crew capacity, and pause promotion when breakdown demand is high."],
        ["Does Crescelo manage crews?", "No. Its built-in picker uses your opening hours and one slot length. For crew-level scheduling, use your own system or Calendly or Cal.com links."],
      ),
      p("Try your own tune-up and plan documents in the [playground](/playground), and see [AI lead capture for home service contractors](/blog/home-service-contractor-ai-lead-capture) and the [appointment booking feature](/product/appointment-booking)."),
    ],
  }),

  pillar({
    slug: 'roofing-emergency-lead-capture-storm-damage',
    title: 'Roofing Leads After a Storm: Capturing Emergency Enquiries With Chat',
    description: 'How roofers can handle the surge of enquiries after storms: fast answers, safe guidance, damage details, insurance questions, triage, honest lead times and follow-up.',
    primaryKeyword: 'roofing lead capture',
    secondaryKeywords: ['roofer chatbot', 'storm damage roof enquiries', 'roof repair emergency website chat', 'roofing contractor lead response'],
    body: [
      p("After a storm, roofers get the busiest days of the year. Hail, high winds and heavy rain leave homeowners with leaks, missing tiles and worried phone calls, and they contact several contractors at once. The business that answers first, sounds organised and gives honest guidance usually gets the job. It is also when the phone cannot keep up, and where door-knocking storm chasers move in. A website chat that answers instantly, gathers the details you need, gives safe guidance and prioritises leads by urgency lets a small roofing company handle the surge without dropping calls. This guide explains how to set one up: what to ask, how to triage, what to say about safety, insurance and price, how to be honest about lead times and how to follow up."),
      note("Safety, insurance and licensing rules differ by place. Your business must decide what it can say. Never let the assistant give advice that could put someone on a roof or near power lines."),

      h2("What storm customers need first"),
      table(["Customer thinks", "What they need"], ["Is my home safe right now?", "Simple safety guidance and reassurance that they should not climb on the roof"], ["Can you come quickly?", "An honest lead time and a way to get on the list"], ["Can you stop the water coming in?", "Whether you offer emergency tarping and when"], ["What about my insurance?", "How you work with claims, without giving legal or insurance advice"], ["Can I trust you?", "Licence, insurance and local references you can state truthfully"]),

      h2("Safe guidance in the first message"),
      ul("Stay off the roof and away from damaged areas.", "Stay clear of fallen power lines and treat every line as live; call the utility or emergency services.", "If ceilings are bulging with water or there is structural damage, move to a safe room and call emergency services if anyone is at risk.", "Move valuables away from leaks and place containers if it is safe.", "Take photos from the ground for insurance, only if it is safe."),
      p("Have your management approve this wording. A short, calm list is better than a long lecture. The assistant should never tell anyone to inspect the roof themselves."),

      h2("The details to capture"),
      table(["Field", "Why"], ["Address and postcode", "Area check and dispatch"], ["What happened and when", "Storm date, for claims and triage"], ["Damage seen: leak, missing shingles or tiles, tree on roof, sagging", "Urgency and crew planning"], ["Is water coming in now?", "Emergency versus routine"], ["Roof type and age if known", "Materials and pricing"], ["Insurance claim planned or open", "Process and paperwork"], ["Contact number and best time", "Callback"], ["Photos (by reply or email)", "Assess before visiting"]),
      p("Ask one question at a time and stop when you have enough to place the lead. See [estimate requests and project scoping](/blog/estimate-requests-project-scoping-chat)."),

      h2("Triage: who gets a call first"),
      table(["Level", "Signs", "Response"], ["1", "Water actively entering, structural damage, tree through the roof", "Alert on-call now; emergency tarp if you offer it"], ["2", "Missing tiles or shingles, small leak that can be contained", "Priority list; call within hours"], ["3", "Inspection wanted, no active leak", "Book an inspection slot"], ["4", "Just browsing prices", "Send information; follow up later"]),
      p("A written triage rule keeps the office consistent when everyone is stressed. See [roofing emergency lead capture in AI chat](/blog/emergency-dispatch-workflows-ai-chat) for dispatch design and [instant lead routing](/blog/instant-lead-routing-chat)."),

      h2("Insurance questions"),
      p("Homeowners will ask about claims. The assistant can explain what your company does, for example that you provide a written estimate and photographs, and that the homeowner should contact their insurer about coverage. It must not say that a claim will be approved, advise on policy interpretation or encourage exaggeration. State your practice honestly: 'We can provide documentation for your claim. Your insurer decides coverage.'"),
      ul("Never promise that insurance will pay.", "Never offer to waive a deductible; in many places that is unlawful.", "Explain how you document damage and provide estimates.", "Refer disputes to a person."),

      h2("Be honest about lead times"),
      p("After a big storm, you may be booked for weeks. Saying so plainly earns more trust than a false promise. Put current lead times in the assistant's documents and update them daily during a surge: 'Emergency tarping is available within 24 hours. Full repairs are currently scheduled about three weeks out. I can add you to the list and call you when your slot is confirmed.' Customers appreciate honesty, and it filters out those who need a faster option so you do not waste their time."),

      h2("Storm chasers and trust"),
      p("Customers are wary of door-knockers and out-of-area crews. Local credentials matter: your address, years in business, licences, insurance and references. Put them in the assistant's knowledge so it can state them accurately, and link to reviews. See [social proof and reviews in AI chat](/blog/social-proof-reviews-ai-chat)."),

      h2("Scheduling inspections and estimates"),
      p("For non-emergency enquiries, offer inspection times in the chat. Crescelo's built-in picker offers slots from your opening hours with one slot length; set it to the inspection window you want. During a surge, reduce your booking hours to what your crews can honour, and update them daily. See [AI appointment booking](/blog/ai-appointment-booking) and [configuring availability rules](/blog/configure-calendar-sync-availability-rules)."),

      h2("Alerts and follow-up"),
      ul("Emergency leads go to the on-call phone by text and email at once.", "All leads land in a shared inbox with the conversation and a triage label.", "Someone calls every lead back within the promised time; use the summary to start the call well.", "Send a written confirmation of the plan, and keep customers updated when schedules move."),
      p("See [webhook automations](/blog/webhook-automations-zapier-make-chat-events) for text alerts and [speed to lead](/blog/speed-to-lead-service-businesses)."),

      h2("Measure the surge"),
      table(["Metric", "Why"], ["Enquiries during the storm week and how many were answered within an hour", "Coverage"], ["Leads by triage level", "Workload mix"], ["Inspections booked and jobs won", "Conversion"], ["Lead times quoted versus delivered", "Honesty and planning"], ["Questions asked that the assistant could not answer", "What to add before the next storm"]),
      p("Afterwards, review the conversations and prepare a storm-response checklist for next time."),

      h2("A storm-response checklist"),
      ol("Update lead times and emergency policy in the assistant's documents.", "Switch on alerts to the on-call phone.", "Set booking hours to real capacity.", "Brief the office on triage rules.", "Post a short message on your website and profiles about current availability.", "Review conversations twice a day in the first week."),

      h2("A worked example: the week after a hailstorm"),
      p("A three-crew roofing company gets 140 enquiries in the four days after a hailstorm, against a normal ten a week. Before the chat, the office answered about half and returned the rest a day late. This time, the assistant answers every visitor at once, gives the safety guidance, asks the four key questions and labels each lead by level. Level 1 leads text the on-call manager. The office works down the level 2 list each morning, and the assistant offers inspection slots only on the days crews can honour. Lead times are updated daily in its documents: tarping within 24 hours, repairs about three weeks. Customers who cannot wait are told honestly, and several return when they have not found faster help elsewhere. The company books more inspections than it can complete in a month, and chooses jobs sensibly instead of drowning."),
      table(["Before", "With the chat"], ["About half of enquiries answered on the day", "Every visitor answered at once"], ["Leads in one undifferentiated pile", "Leads labelled by urgency"], ["Customers promised times the crews could not meet", "Lead times stated honestly and updated daily"], ["Owner on the phone all day", "Owner handles only levels 1 and 2 and the estimates"]),

      h2("After the surge"),
      p("When demand drops, do three things. Follow up with every customer who did not book, in a friendly way, in case their situation changed. Ask completed customers for reviews. And write down what worked and what did not, so the next storm response starts from a checklist instead of a scramble. Keep the assistant's documents updated so that tomorrow's ordinary enquiries are not told about last week's emergency lead times."),

      h2("Frequently asked questions"),
      faq(
        ["Can a chatbot handle roofing enquiries after a storm?", "Yes. It answers instantly, gives safe guidance, captures damage details, triages by urgency and alerts your team."],
        ["Should the chatbot talk about insurance?", "It can explain that you provide documentation and estimates and that the insurer decides coverage. It must not promise approval or advise on policy terms."],
        ["How do I stay honest about lead times?", "Put current lead times in the assistant's documents and update them daily during a surge."],
        ["Can it book roof inspections?", "Yes, with slots from your booking hours, at the length you set."],
        ["Is it safe to give roof advice by chat?", "Only simple safety guidance, such as staying off the roof and away from power lines. Never advise customers to inspect or repair the roof themselves."],
        ["How do I prioritise leads?", "Use a written triage rule: active leaks and structural damage first, then missing tiles, then inspections and browsers."],
      ),
      p("Try a storm conversation with your own lead times and services in the [playground](/playground), see the [lead capture feature](/product/lead-capture) and [start a free trial](/login?mode=register)."),
    ],
  }),

  pillar({
    slug: 'electrician-service-call-scheduling-chat',
    title: 'Electrician Service Calls by Chat: Safe Triage, Scheduling and Clear Pricing',
    description: 'How electricians can use a website chat to triage calls safely, capture fault details, book service visits, explain callout pricing and send urgent leads to the right person.',
    primaryKeyword: 'electrician chatbot',
    secondaryKeywords: ['electrician service call booking', 'emergency electrician website chat', 'electrical fault intake questions', 'electrician lead capture'],
    body: [
      p("Electrical problems are frightening and sometimes dangerous. A customer with a tripped circuit, a burning smell or a flickering panel wants to know two things at once: is this safe, and can someone come today? An electrician who is up a ladder or under a floor cannot answer the phone. A website chat can do the first layer of the job responsibly: recognise danger, give safe instructions, capture the details of the fault, state the callout fee and book or alert the right person. Done badly, an assistant that gives casual electrical advice is a hazard. This guide sets out how to design the chat for an electrical business: what to ask, how to triage, what safe guidance to give, what never to say, how to price honestly and how to book visits."),
      note("Electrical work is regulated and hazardous. The guidance below is for your business to adapt with your own qualifications and local rules. The assistant must not give instructions for electrical repairs and should err on the side of telling customers to stay safe and call emergency services when there is risk of fire or shock."),

      h2("What customers ask"),
      table(["Situation", "What they want"], ["Power outage or tripped breaker", "Is it my fault or the supplier's? Can you come?"], ["Burning smell, sparks, hot outlets", "Is it dangerous? What do I do now?"], ["Flickering lights, buzzing", "Is it serious? How much to check?"], ["New outlets, lighting, EV charger", "How much? How long? Do I need a permit?"], ["Safety inspection or landlord certificate", "What do you check? How much?"], ["Smoke alarm or consumer unit upgrade", "Options and cost"]),

      h2("Triage: recognise danger first"),
      table(["Level", "Signs", "Response"], ["Danger", "Burning smell, smoke, sparks, exposed live wires, water near electrics, someone received a shock", "Tell the customer to stay away, switch off at the main only if safe, leave the building if there is smoke and call emergency services; alert on-call"], ["Urgent", "Total loss of power to the home, tripping circuits that will not reset, hot outlets without smoke", "Safe interim guidance and same-day callout where possible"], ["Routine", "New fittings, upgrades, inspections", "Book a convenient visit and estimate"]),
      p("Write the danger wording yourself and keep it simple: 'If you smell burning, see smoke or sparks, or someone has had a shock, please leave the area, call emergency services and do not touch anything electrical.' The assistant should not attempt to assess the fault."),

      h2("Safe guidance that is appropriate"),
      ul("If it is safe to do so, switch off the affected circuit at the consumer unit, but do not open it or touch wiring.", "Do not use sockets or appliances that are hot, damaged or smell of burning.", "Keep away from water and wet surfaces near electrics.", "Do not attempt repairs.", "For a power cut affecting the street, check with the supplier before calling us."),
      p("Never give step-by-step repair instructions. If guidance seems complicated, say that a qualified electrician should look at it."),

      h2("Capture what you need to dispatch"),
      table(["Field", "Why"], ["What is happening and when it started", "Urgency and skill needed"], ["Address and postcode", "Area check"], ["Home or business; tenant or owner", "Access and authorisation"], ["Any warnings: smells, sparks, tripping", "Safety flags"], ["Age and type of installation if known", "Preparation"], ["Contact number and best times", "Callback"], ["Photos (by reply)", "Preview the job"]),
      p("Two to four questions, one at a time, are enough. See [estimate requests and project scoping](/blog/estimate-requests-project-scoping-chat)."),

      h2("Pricing without surprises"),
      ul("State the callout fee and what it covers.", "Give ranges for common jobs you can stand behind, for example adding a socket or replacing a light fitting.", "Say clearly when a price needs an inspection, such as fault finding or a rewire.", "Mention out-of-hours rates before booking.", "Say whether you include parts and VAT or sales tax."),
      p("A written estimate for larger jobs builds trust. The assistant should point to how to request one rather than inventing a figure."),

      h2("Booking service calls"),
      p("For non-urgent jobs, an online booking converts the visitor immediately. Offer windows you can honour, and confirm by email with what to expect: access to the consumer unit, a clear working area and who will attend. Crescelo's built-in picker offers slots from your opening hours with one slot length; set it to the visit window you want. For different job types with different durations, use Calendly or Cal.com links. See [AI appointment booking](/blog/ai-appointment-booking) and [configuring availability rules](/blog/configure-calendar-sync-availability-rules)."),
      p("For danger or urgent situations, do not offer a self-service slot; alert your on-call electrician and let them confirm the plan."),

      h2("Alerts and routing"),
      table(["Lead", "Route"], ["Danger", "Emergency guidance, then instant alert to on-call by text and email"], ["Urgent", "Alert to the office with a rule to call within the hour"], ["Routine", "Email and booking confirmation"], ["Commercial enquiry", "Notify the commercial lead with details"]),
      p("Test the alert path, including at night. See [emergency dispatch workflows in AI chat](/blog/emergency-dispatch-workflows-ai-chat)."),

      h2("Certificates, permits and compliance"),
      p("Customers often ask whether work needs a certificate or permit, especially for landlords, new circuits and EV chargers. Put your approved explanation in the knowledge base: what you provide (for example an electrical installation certificate), when permits are required in your area and how long approval takes. If the rules are complex or vary, have the assistant say so and offer a callback. Never state a regulation you have not checked."),

      h2("What the assistant must never do"),
      ul("Tell customers how to repair or bypass anything electrical.", "Reassure that a burning smell or sparks is harmless.", "Advise resetting a repeatedly tripping breaker.", "Promise arrival times it cannot guarantee.", "Quote a fixed price for fault finding without inspection."),

      h2("A sample conversation"),
      table(["Speaker", "Message"], ["Customer", "My kitchen sockets stopped working and the breaker keeps tripping."], ["Assistant", "Thanks for telling me. If you smell burning, see sparks or scorch marks, or anything feels hot, please leave it alone, do not touch it and call emergency services. If not, please do not keep resetting the breaker. Can you tell me if there is any smell or heat, and roughly when it started?"], ["Customer", "No smell. Started this morning."], ["Assistant", "Thank you. That needs a qualified electrician to test the circuit. Our callout is $95 and fault finding is quoted after we see it. I can offer today between 2 and 5. What is your postcode and the best number?"]),

      h2("Measure the result"),
      table(["Metric", "Why"], ["Enquiries out of hours and converted", "Coverage"], ["Danger and urgent flags and time to acknowledge", "Safety process"], ["Callout to job conversion", "Pricing and follow-up effectiveness"], ["Bookings from chat versus phone", "Channel value"], ["Questions the assistant could not answer", "Content gaps"]),

      h2("Setting up your danger rules: a short exercise"),
      p("Sit down with your most experienced electrician and list the twenty phrases customers use when something is seriously wrong: 'burning smell', 'sparks', 'smoke', 'shock', 'buzzing panel', 'hot socket', 'melted plug', 'water in the fuse box', 'tripping constantly'. For each, agree what the assistant says and who is alerted. Add misspellings and slang. Then test each phrase in the Testing Studio, and repeat the test whenever you change the instructions. This exercise takes an hour and is the most important safety step in the whole setup."),

      h2("Landlords, tenants and business customers"),
      p("Landlords need safety certificates and reports, and often ask for several properties at once; tenants need access arranged. Business customers need discretion and minimal downtime. Capture the role and property details in the chat, and route these leads to the person who handles them. Explain your certification services in plain language and give a fee or range where you can, and state lead times honestly."),

      h2("Common mistakes"),
      ul("Letting the assistant reassure customers about signs of danger.", "Offering a self-service slot for an emergency.", "Not testing the danger phrases before launch.", "Quoting fixed prices for fault finding.", "Leaving alerts on an inbox nobody watches at night."),
      p("Fixing these takes an afternoon, and it is worth doing before the first customer uses the chat."),

      h2("Frequently asked questions"),
      faq(
        ["Can a chatbot triage electrical faults?", "It can recognise dangerous wording, give safe instructions to stay away and call emergency services, and alert your team. It must not diagnose or give repair instructions."],
        ["What should it say about a burning smell?", "That the customer should leave the area, not touch anything electrical and call emergency services. Your business should approve the exact wording."],
        ["Can customers book an electrician in the chat?", "Yes, for non-urgent jobs, with available slots and an email confirmation."],
        ["Should it quote prices?", "It can state the callout fee and ranges you can honour, and say that fault finding needs an inspection."],
        ["Does it handle EV charger and certificate questions?", "It can share your approved explanations of what you provide and how permits work in your area, and hand over anything complex."],
        ["How do I keep it safe?", "Write strict rules, test dangerous scenarios before launch and never let it advise on repairs."],
      ),
      p("Try scenarios with your own callout fees in the [playground](/playground), read [AI lead capture for home service contractors](/blog/home-service-contractor-ai-lead-capture) and see the [AI assistant feature](/product/ai-assistant)."),
    ],
  }),

  pillar({
    slug: 'pest-control-emergency-inspection-chat',
    title: 'Pest Control by Chat: Identifying the Problem, Booking Inspections and Handling Urgent Calls',
    description: 'How pest control companies use a website chat to identify pests, gather details, give safe guidance, explain treatment and pricing, and book inspections quickly.',
    primaryKeyword: 'pest control chatbot',
    secondaryKeywords: ['pest control lead capture', 'exterminator website chat', 'pest inspection booking online', 'wasps rodents bed bugs enquiry'],
    body: [
      p("Nobody searches for a pest controller because they are curious. They search because something is in the kitchen, the loft or the bed, and they want it gone now. That urgency is your advantage and your challenge: the first company that answers with confidence usually wins the job, and the customer's anxiety means they will pay attention to the clearest reply. A website chat can meet them at midnight, ask the right identification questions, give calm and safe guidance, explain what treatment involves and what it costs, and book an inspection before they call a competitor. This guide explains how a pest control business can set up a chat that does that well: what to ask for each pest, what safe advice to give, how to talk about treatment and price, how to handle commercial and urgent cases and how to measure the results."),
      note("Pest control involves chemicals, health risks and regulation. Your business must decide what advice it can give, and follow local licensing and product rules. The assistant should never advise customers on using pesticides themselves."),

      h2("What customers ask"),
      table(["Enquiry", "What the customer wants"], ["I saw a mouse or droppings", "How serious is it? Can you come quickly? How much?"], ["Wasp nest or bees", "Is it dangerous? Can you remove it today?"], ["Bed bugs suspected", "How do I know? How do you treat it? Will neighbours find out?"], ["Ants, cockroaches, fleas", "Cause, treatment and cost"], ["Termites or wood damage", "Inspection, report and options"], ["Commercial premises", "Compliance, regular contracts, discretion"]),

      h2("Identify the pest with a few questions"),
      p("A lead that says 'pests, please call' costs you a call. A lead with a few identification details lets you send the right technician with the right equipment. Ask simply."),
      table(["Pest", "Questions"], ["Rodents", "What did you see or hear (droppings, gnawing, noises)? Where in the property? For how long? Pets or children present?"], ["Wasps and bees", "Where is the nest and how high? How big? Has anyone been stung? Any allergies?"], ["Bed bugs", "Bites or marks? Blood spots on sheets? Live insects seen? Which rooms?"], ["Ants and cockroaches", "Where do you see them? What time of day? How many?"], ["Fleas", "Pets in the home? Bites? Recent moves or visitors?"], ["Termites", "Signs of damaged wood, mud tubes or winged insects? Any previous treatments?"]),
      p("Then ask for the address, a number and the best time. Photos help; invite them by reply. See [estimate requests and project scoping](/blog/estimate-requests-project-scoping-chat)."),

      h2("Triage: which calls are urgent"),
      table(["Level", "Examples", "Response"], ["Urgent", "Wasp nest near entrances with allergy risk, someone stung and having a reaction, rodents in a food business, bed bugs affecting sleep", "Prompt callback and, where possible, same-day or next-day visit"], ["Priority", "Active infestation in a home, nest in a garden", "Book the earliest slot"], ["Routine", "Prevention, contract quotes, general enquiries", "Book an inspection at a convenient time"]),
      p("For any allergic reaction, difficulty breathing, swelling of the face or throat after a sting, the assistant should tell the customer to call emergency services immediately. It should not assess medical severity. See [handling emergencies in automated chat](/blog/handling-emergencies-automated-chat)."),

      h2("Safe guidance and what not to say"),
      ul("Keep children and pets away from the affected area and any nest.", "Do not disturb, spray or try to remove a wasp or bee nest yourself.", "Do not use bug bombs or pesticides in the home without professional advice, especially in bedrooms and food areas.", "For suspected bed bugs, do not move items between rooms; wash bedding on a hot cycle if you can and wait for an inspection.", "For rodents, keep food in sealed containers and do not touch droppings without protection."),
      p("Keep these short, and have your technicians approve the wording. The assistant should never recommend specific chemicals or doses."),

      h2("Explain treatment and price honestly"),
      table(["Question", "Approach"], ["How much will it cost?", "Give ranges for common jobs and what they include, and say that the price is confirmed after an inspection"], ["How long does it take?", "Typical timeline, including follow-up visits where needed"], ["Is it safe for children and pets?", "Your approved safety statement and any preparation steps"], ["Do you guarantee the result?", "Only what your warranty states, with its terms"], ["Will you use marked vehicles?", "Your discretion policy, if you offer one"]),
      ul("Explain what the inspection includes and whether it is free.", "State whether treatments include follow-up visits.", "Be clear about what customers must do to prepare.", "Avoid guarantees you cannot back."),

      h2("Book the inspection"),
      p("The goal of the chat is an inspection booked at a time the customer will actually be home. Offer real windows, confirm by email with preparation instructions and give a way to change the booking. Crescelo's built-in picker offers slots from your opening hours and one slot length, so set it to the inspection window; use Calendly or Cal.com if you need different visit types. See [AI appointment booking](/blog/ai-appointment-booking)."),
      p("For urgent cases, alert your dispatcher at once and let them confirm timing."),

      h2("Commercial customers"),
      p("Restaurants, hotels and property managers need discretion, compliance documentation and regular service. The assistant can explain your commercial service in general terms, capture the business name, contact, premises type and concerns, and route the lead to your commercial team. Do not discuss sensitive details of a customer's premises in an open chat. See [commercial janitorial RFP capture](/blog/commercial-janitorial-rfp-capture-chat) for a similar flow."),

      h2("Seasonal patterns"),
      table(["Season", "Typical enquiries", "Preparation"], ["Spring and summer", "Wasps, ants, fleas", "Update wasp and nest guidance; check capacity"], ["Autumn and winter", "Rodents seeking warmth", "Rodent prevention content"], ["Year-round", "Bed bugs, cockroaches, commercial contracts", "Discreet handling policies"]),
      p("Update the assistant's documents with seasonal information and current lead times. See [seasonality management with an AI assistant](/blog/seasonality-management-ai-assistant)."),

      h2("A sample conversation"),
      table(["Speaker", "Message"], ["Customer", "There is a wasp nest above our front door and we have a toddler."], ["Assistant", "I understand, that is worrying. Please keep the toddler and pets away from the door and do not try to remove or spray the nest. If anyone has been stung and has trouble breathing or swelling, call emergency services. We can usually treat nests within a day. Removal starts from $X and includes a follow-up check. What is your postcode, and is anyone in the household allergic to stings?"], ["Customer", "No allergies. SW4 7QT."], ["Assistant", "Thank you. I have flagged this as priority for our team. What is the best number to reach you, and are you home today?"]),

      h2("Measure the results"),
      table(["Metric", "Why"], ["Enquiries outside office hours and converted", "Coverage"], ["Time from enquiry to first contact", "Speed"], ["Inspection to treatment conversion", "Quality of the message"], ["Priority alerts and response time", "Process"], ["Repeat and contract customers gained", "Long-term value"]),

      h2("Preparing customers for the visit"),
      p("A good preparation message reduces wasted visits and improves results. In the confirmation email, tell customers what to expect and what to do: clear access to the areas to be inspected, keep pets and children away, do not use over-the-counter products beforehand because they can disperse the pests and make inspection harder, and let the technician know about allergies, pregnancy or sensitive occupants. Keep it short, and have your technicians approve it."),

      h2("Follow-up and prevention"),
      p("Pest problems return if the cause is not addressed. After treatment, send a short summary of what was done, what to watch for and what preventative steps help, such as sealing entry points and storing food properly. Offer a follow-up visit if your service includes one, and invite customers to a maintenance plan without pressure. Ask for a review when the problem is solved and the customer is relieved. Word of mouth is the strongest source of pest control work, because people trust a recommendation from a neighbour who has just had the same problem."),

      h2("Common mistakes"),
      ul("Letting the assistant recommend products or doses.", "Promising guarantees that the warranty does not support.", "Discussing a commercial customer's problems in an open chat.", "Forgetting to give allergy and safety guidance for stings.", "Not updating seasonal information and lead times."),
      p("A quick review of the conversations each week will show whether any of these are creeping in."),

      h2("Frequently asked questions"),
      faq(
        ["Can a chatbot identify pests?", "It can ask identification questions and capture photos or descriptions so your technician can prepare. It should not give a definitive diagnosis."],
        ["What safety advice should it give?", "Short, approved guidance: keep children and pets away, do not disturb nests and do not use pesticides yourself. Direct allergic reactions to emergency services."],
        ["Can it quote prices?", "It can give ranges you can honour and say that the price is confirmed after an inspection."],
        ["Can it book inspections?", "Yes, with available slots and an email confirmation."],
        ["How should it handle commercial customers?", "Capture business details and route to your commercial team without discussing sensitive premises details in chat."],
        ["What about urgent nests or infestations?", "Recognise urgency, give safe guidance, alert your dispatcher and offer the earliest visit."],
      ),
      p("Try a pest conversation with your own services and prices in the [playground](/playground), see the [lead capture feature](/product/lead-capture) and read [AI lead capture for home service contractors](/blog/home-service-contractor-ai-lead-capture)."),
    ],
  }),
];
