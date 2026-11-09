import { faq, h2, h3, note, ol, p, pillar, table, ul } from '../authoring';

export const PILLAR3 = [
  pillar({
    slug: 'crescelo-vs-chatbase-dante-ai-booking',
    title: 'Chatbase and Dante AI Alternatives: Crescelo Compared for Booking and Leads',
    description: 'An honest comparison of Crescelo with Chatbase and Dante AI style knowledge chatbots: answers, booking, leads, handover, pricing model and who each suits best.',
    primaryKeyword: 'Chatbase alternative',
    secondaryKeywords: ['Dante AI alternative', 'Chatbase vs Crescelo', 'AI chatbot with appointment booking', 'chatbot trained on your data'],
    body: [
      p("Chatbase and Dante AI belong to a popular group of products: you give them your content, and they give you a chatbot that answers questions about it. If you are searching for an alternative, the useful question is not which product has the longer feature list, but what you need the chatbot to do. Answering questions from documents is one job. Booking appointments, capturing leads properly and handing over to your team are different jobs, and products are built with different jobs in mind."),
      p("We make Crescelo, so we are not neutral. This comparison tries to be fair: it explains where knowledge-base chatbots are the right tool, where an appointment-focused assistant fits better, and how to test both on your own content. Features and prices on every product change, so check each vendor's current pages before deciding; we describe categories and approaches rather than quote competitor prices."),

      h2("What Chatbase and Dante AI style products do well"),
      p("Products in this group are strong at the core task of turning documents, websites and knowledge bases into a question-answering chatbot quickly."),
      ul("**Fast setup:** paste a website address or upload files and get a working chatbot in minutes.", "**General-purpose flexibility:** they suit documentation sites, support portals, product Q&A and internal knowledge.", "**Embeds and sharing:** website widgets and shareable links.", "**Broad appeal:** they serve startups, agencies, e-commerce and software companies as well as service businesses."),
      p("If your main goal is 'let people ask questions about our documentation and get accurate answers', these tools are a natural fit and you should try them."),

      h2("Where an appointment-focused assistant differs"),
      p("A service business, such as a salon, clinic, law practice or fitness studio, needs the chatbot to do more than answer. It needs to turn the conversation into a booking or a qualified lead. That changes what matters."),
      table(["Need", "Knowledge-base chatbot (typical)", "Crescelo (appointment-focused)"], ["Answer questions from your content", "Core feature", "Core feature, with an instruction to answer only from your content and admit when it does not know"], ["Book appointments in the chat", "Often limited or handled by linking out to a scheduling tool", "Built in: live free slots, slot locking, confirmations (Growth plan)"], ["Capture leads", "Available in some products, often basic", "Structured capture with instant email alerts, webhook and CRM delivery"], ["Hand over to a person", "Varies", "One-click takeover with the full conversation and notifications"], ["Business-hours logic", "Usually not central", "Opening hours and slot length for the built-in picker; Calendly and Cal.com for more complex scheduling"], ["Channels", "Website, sometimes messaging apps", "Website widget, hosted page, WhatsApp and Telegram on the top plan"], ["AI usage", "Usually bundled in the plan or credits", "Bring your own key: you pay your AI provider directly, so no markup"]),
      p("None of these points make one product universally better. They show what each was designed around. If you never book appointments, the booking column is irrelevant to you. If you do, it may decide the choice."),

      h2("Grounding: the feature that matters most for either"),
      p("Whichever product you pick, test how it behaves when your documents do not contain the answer. A good assistant says it does not know and offers a person or a form. A weaker one guesses. Load the same documents into each product, ask three questions that are not covered, and see what happens. Read [how to stop a chatbot from making things up](/blog/grounded-ai-chatbot-hallucinations) for what to look for. You can also test Crescelo without an account in the [playground](/playground)."),

      h2("Pricing models compared"),
      p("Pricing is where products in this space differ most, and where surprises hide."),
      table(["Model", "How it works", "Watch for"], ["Credits or message limits bundled with the plan", "Plan includes a number of AI messages or credits per month", "Running out mid-month, and higher tiers to raise the limit"], ["Per-seat plus usage", "Fee per team member plus conversation charges", "Cost growth as your team grows"], ["Bring your own key (Crescelo)", "Platform subscription with chat sessions included, and you pay your AI provider directly for model usage", "You manage a provider account; you see and control the AI cost"]),
      p("Crescelo's Starter plan is $49 a month with one assistant and 100 chat sessions; Growth is $149 with booking and calendar sync; the Agency tier is $399 with WhatsApp and Telegram. See the [pricing page](/pricing). The reasoning behind bring-your-own-key is in [BYOK versus bundled AI pricing](/blog/byok-vs-bundled-ai-pricing-cost-comparison)."),

      h2("Booking: the biggest difference for service businesses"),
      p("Ask each product these questions, and watch for vague answers."),
      ol("Does the chatbot read my real calendar or only send a link to a scheduling page?", "How does it stop two visitors booking the same slot?", "Can I set durations, buffers and staff for each service?", "What confirmations and reminders are sent, and can I customise them?", "Can visitors reschedule or cancel from the confirmation?"),
      p("If the answer to the first question is 'it links to my scheduling tool', that can be perfectly workable, but the visitor leaves the conversation to finish the booking. Our guide to [AI appointment booking](/blog/ai-appointment-booking) explains what an in-chat booking system must do."),

      h2("Leads and handover"),
      p("For lead capture, check what fields you can collect, how leads reach you (email, webhook, spreadsheet, CRM), whether you get an instant alert and whether you can export them. For handover, check whether you can see conversations live, take over, and whether the visitor is told a person has joined. See [conversational lead capture](/blog/conversational-lead-capture) and [live human handover flow design](/blog/live-human-handover-flow-design)."),

      h2("Who should choose which"),
      table(["If you are", "Consider"], ["A software company with documentation and a help centre", "A knowledge-base chatbot such as those in this group"], ["A service business that lives on appointments", "An appointment-focused assistant such as Crescelo"], ["An agency building chatbots for many clients", "Check white-label options and per-client pricing on each product; Crescelo offers white-label on Growth and above"], ["Someone who wants the cheapest way to test the idea", "Try free plans or trials of several and compare answers on your own content"], ["A business that must keep AI spend visible", "A bring-your-own-key product"]),

      h2("How to compare them fairly in an hour"),
      ol("Choose ten real customer questions and three that your content cannot answer.", "Load identical documents into each product.", "Ask all thirteen questions and score each answer as correct, partly correct, wrong or honestly unknown.", "Try a booking or a lead capture end to end.", "Ask to see how you would take over a conversation.", "Read the pricing page and calculate the total at three times your current volume."),
      p("Repeat the test a few days later, to check that answers are consistent. Then choose using a written scorecard; a template is in our [platform comparison guide](/blog/website-chatbot-platform-comparison)."),

      h2("Migrating from another chatbot"),
      p("If you already run a chatbot trained on your documents, you can keep the same source files. Upload them to the new product, recreate your greeting and tone, set up your services and calendar, and run both side by side for a week before you switch the website snippet. Keep an export of your existing conversations and leads first."),

      h2("Our honest limits"),
      ul("Crescelo is built for appointment-based service businesses, so it is narrower than general-purpose chatbot builders.", "Phone answering is under development and listed on the [roadmap](/roadmap); today it works in website chat and messaging apps.", "Because it is bring-your-own-key, you need an account with an AI provider, or you can use the free engine to start."),

      h2("Three example businesses and what they chose"),
      h3("A dental practice"),
      p("A practice needs to answer questions about treatments, insurance and opening hours, and to book new-patient and check-up appointments. It has two dentists and a hygienist, each with different appointment types. A general knowledge-base chatbot answers the questions well but sends people to a separate booking page. An appointment-focused assistant can carry the conversation through to a booked slot with the right practitioner. The practice also cares about privacy, so it limits what the chat collects and hands anything clinical to the team. See [AI patient scheduling for dental practices](/blog/ai-patient-scheduling-dental-practices)."),
      h3("A software startup"),
      p("A startup with public documentation wants visitors to ask how features work and get answers with links. Booking a demo is one goal among many, and the team already uses a scheduling tool. A knowledge-base chatbot is a natural choice, and the demo link can point to the existing scheduling page."),
      h3("A marketing agency serving local clients"),
      p("An agency builds an assistant for each client. It needs white-label branding, one dashboard for many assistants and predictable costs. Booking matters for the salon and clinic clients but not for the shop clients. It compares per-assistant pricing and white-label limits across products before choosing, and tests each on a client's real documents."),
      p("The lesson is the same in all three: decide by the job, then test with real content."),

      h2("Setup effort compared"),
      p("Knowledge-base chatbots are famously quick to start: add a website address, wait, and chat. Appointment-focused assistants need a little more, because booking needs real information: your services, your hours and how long a booking lasts. That extra step is not wasted effort; it is the information a booking system cannot work without. A realistic plan for Crescelo is an afternoon: gather your documents, load them, set your booking hours and slot length, subscribe to the calendar feed, test and publish. Our [step-by-step guide to adding a chatbot](/blog/add-ai-chatbot-to-your-website) has the full list."),

      h2("Data, privacy and control"),
      ul("**Where your documents live:** ask each vendor where content is stored, which sub-processors handle it and how to delete it.", "**Which AI provider sees your visitors' messages:** with a bring-your-own-key product you choose the provider and can pick one that fits your privacy needs.", "**Keys and secrets:** confirm that API keys are stored encrypted and never exposed to visitors.", "**Team access:** check for roles and two-factor authentication if several people manage the assistant."),
      p("If you serve visitors in Europe or California, review the [GDPR checklist for website chatbots](/blog/website-chatbot-gdpr-checklist) before launch. This is general information, not legal advice."),

      h2("Questions to put to any vendor"),
      ol("Show me an answer with its source passage.", "What happens when the content does not contain the answer?", "How do I book an appointment through the chat, end to end?", "What is the total monthly price at three times my current volume?", "Which parts are live today and which are on a roadmap?", "How do I export my content, conversations and leads?"),

      h2("Frequently asked questions"),
      faq(
        ["What is a good alternative to Chatbase?", "It depends on the job. For appointment-based businesses, look for a chatbot with built-in booking, lead capture and handover, such as Crescelo. For documentation Q&A, other knowledge-base chatbots may fit better."],
        ["Does Crescelo train on my documents?", "It indexes your documents so the assistant can find relevant passages and answer from them. It does not need you to train a model, and you choose your own AI provider."],
        ["Can Crescelo answer from my website and files?", "Yes. You can upload documents, paste text or add website addresses to the knowledge base."],
        ["Does it book appointments in the chat?", "Yes, on the Growth plan and above, with live availability, slot locking and confirmations."],
        ["What does bring your own key mean?", "You connect your own account with an AI provider such as OpenAI, Anthropic, Google, Groq or DeepSeek and pay them directly for model usage, so the platform adds no markup on AI."],
        ["Can I try before I pay?", "You can try the assistant on your own documents in the playground with no sign-up, and start a free trial to put it on your website."],
      ),
      p("See the difference yourself: upload a document in the [playground](/playground), then [start a free trial](/login?mode=register) if it fits."),
    ],
  }),

  pillar({
    slug: 'crescelo-vs-tidio-manychat-comparison',
    title: 'Tidio and ManyChat Alternatives: Crescelo Compared for Service Businesses',
    description: 'Compare Crescelo with Tidio-style live chat suites and ManyChat-style social automation: strengths, booking, lead capture, pricing model and best fit for each.',
    primaryKeyword: 'Tidio alternative',
    secondaryKeywords: ['ManyChat alternative', 'Tidio vs Crescelo', 'chatbot for appointment-based business', 'live chat alternative'],
    body: [
      p("Tidio and ManyChat are popular, and they are built for different things. Tidio-style products combine live chat, a shared inbox and chatbots, often with a focus on online shops. ManyChat-style products automate conversations on social platforms, such as Instagram and Messenger, mainly for marketing. If you run a service business and are comparing them with an AI assistant built around appointments, it helps to see where each approach shines."),
      p("We build Crescelo, so treat this as an informed but interested comparison. Products change quickly: check each vendor's current features and prices before deciding. We describe categories and approaches, not competitors' prices."),

      h2("Three different starting points"),
      table(["Product type", "Started as", "Center of gravity"], ["Live chat suite with chatbots (Tidio-style)", "A live chat widget and inbox for humans", "Agents chatting with visitors, with automation and AI added"], ["Social messaging automation (ManyChat-style)", "Marketing flows on Instagram, Messenger, WhatsApp and similar", "Campaigns, keywords, sequences and broadcasts"], ["AI assistant for service businesses (Crescelo)", "Answering from your content and booking appointments", "Grounded answers, booking, lead capture and handover"]),
      p("A product's starting point shapes its strengths. Live chat suites are excellent for teams who will staff the chat. Social automation is excellent for growing an audience and running campaigns. An assistant built around appointments is strongest where the visitor's goal is to ask a question and book a time."),

      h2("Where a live chat suite fits"),
      ul("You have people who will answer chats during business hours.", "You want a strong shared inbox with roles, canned replies and visitor information.", "You run an online shop and want cart recovery and product recommendations.", "You want automation as a layer on top of human chat."),
      p("The trade-off for a small service business is staffing and cost. If nobody is free to answer, a chat suite's human features go unused, and some suites price per seat or per conversation. See [the real cost of staffing live chat](/blog/live-chat-hidden-costs-small-business) and [Crescelo vs traditional live chat](/blog/crescelo-vs-traditional-live-chat)."),

      h2("Where social automation fits"),
      ul("Your customers find you on Instagram or Facebook and message you there.", "You run campaigns with comment keywords, giveaways or lead magnets.", "You want to build an audience list and send sequences.", "You are comfortable designing flows and maintaining them."),
      p("The trade-off is that flow-based automation follows a script. A visitor who asks something you did not draw a branch for meets a dead end, and knowledge-heavy questions, such as detailed prices and policies, are hard to serve well with a tree. See [rule-based chatbots vs AI assistants](/blog/rule-based-vs-ai-chatbots)."),

      h2("Where an appointment-focused AI assistant fits"),
      ul("Visitors ask open questions about services, prices and policies, and you want answers from your own content.", "You want visitors to book a time without leaving the chat.", "You want leads captured and delivered to you instantly, with the conversation.", "You want a person to be able to step in with the full context.", "You want to control AI cost by connecting your own provider."),
      p("It fits the person who thinks: 'I want my website to answer questions and fill my calendar while I am busy.'"),

      h2("Head-to-head on the tasks service businesses care about"),
      table(["Task", "Live chat suite", "Social automation", "Crescelo"], ["Answer common questions from your documents", "AI add-on, quality varies", "Weak for detailed knowledge; keyword flows", "Core: answers only from your content and says when it does not know"], ["Book appointments in chat", "Basic or via integrations", "Possible via links or integrations", "Built in with live availability and slot locking (Growth)"], ["Capture leads", "Yes, with inbox", "Yes, strong for lists", "Yes, with instant alerts, webhook and CRM delivery"], ["Human takeover", "Core", "Available", "One-click takeover with history"], ["Social platform messaging", "Some channels", "Core strength", "WhatsApp and Telegram on the top tier; Instagram and Messenger are not in scope"], ["Works without staff online", "Only through automation", "Yes, via flows", "Yes"], ["AI cost model", "Bundled or credit-based", "Bundled or add-on", "Bring your own key, no markup"]),
      p("Where we say 'not in scope', we mean it plainly: if your customers mostly message you on Instagram and you want campaign automation, a social automation tool is the right choice, and Crescelo is not a replacement for it."),

      h2("Pricing patterns to compare"),
      ol("**Per seat:** a fee for each team member. Costs rise as your team grows.", "**Per conversation or resolution:** fees scale with usage. Good for low volume, less predictable at high volume.", "**Contact-based:** fees scale with the size of your audience list. Common in social automation.", "**Platform plus your own AI key:** a subscription with included sessions, and you pay the AI provider directly (Crescelo)."),
      p("Ask each vendor for the total price at your current volume and at three times that. Crescelo's plans are $49, $149 and $399 a month; see the [pricing page](/pricing) for what each includes."),

      h2("A test you can run this week"),
      ol("Write down ten questions your customers ask and three your documents cannot answer.", "Set up each product with the same content.", "Ask all thirteen questions. Mark answers correct, wrong or honestly unknown.", "Try a booking or lead capture on each.", "Ask a colleague to chat as a customer and note how each product feels.", "Fill in the [comparison scorecard](/blog/website-chatbot-platform-comparison)."),

      h2("Using them together"),
      p("These tools are not always alternatives. A business can use a social automation tool for Instagram campaigns and an AI assistant on its website to answer questions and book. It can use a live chat inbox for staffed hours and an assistant for the rest. The important thing is that each visitor gets a clear route to an answer or a booking, and that you know where each lead came from. See [attribution for chat leads](/blog/attribution-modeling-marketing-channels-chat-leads)."),

      h2("Example: a physiotherapy clinic deciding between the three"),
      p("A clinic gets most enquiries from its website, some from Instagram and a few from returning patients by phone. The owner wants fewer missed enquiries and more bookings, but has no one free to sit on chat all day."),
      table(["Option", "What it does well for the clinic", "What it does not solve"], ["Live chat suite", "Lets the team chat with visitors when someone is free", "Nobody is free most of the day, so the chat goes unanswered unless automation covers it"], ["Social automation", "Answers Instagram DMs with keyword flows and captures contacts", "Detailed questions about treatments and prices, and booking on the website"], ["AI assistant for appointments", "Answers website questions from the clinic's documents and books slots", "Instagram campaigns and comment automation"]),
      p("The clinic chooses an AI assistant for the website, keeps its simple Instagram auto-replies and adds a handover so the team can step in. Three tools, each doing what it is best at."),

      h2("Questions to ask about staffing"),
      ul("Who will answer chats, and when? If the answer is 'nobody, mostly', choose automation first.", "Do I want to reply in real time, or capture and follow up later?", "How will my team be notified when a visitor needs a person?", "Can I see the full history when I take over?", "What does it cost if two more people join my team?"),

      h2("What the transition looks like"),
      ol("Export any existing chat transcripts and leads.", "Gather the documents that answer your top twenty questions.", "Set up the new assistant and test it alongside the old tool for a week.", "Switch the website snippet once answers and bookings look right.", "Keep social automation running if it serves a purpose the assistant does not."),
      p("You do not have to abandon a tool that works. The goal is that every visitor gets a quick answer and a route to a booking, and that you can measure which channel brought each lead."),

      h2("Cost example at three volumes"),
      p("Comparing prices at one volume is misleading. Ask for the total at your current volume, at double, and at ten times, and write the answers in a table. Products with per-seat pricing grow as you add people; products with per-conversation pricing grow as you add traffic; a bring-your-own-key product grows with the AI usage you generate, which you can see and change by choosing a cheaper model. The best choice for you depends on which of those you expect to grow. See [byok versus bundled AI pricing](/blog/byok-vs-bundled-ai-pricing-cost-comparison) for worked examples."),

      h2("Ten questions that expose the difference"),
      ol("If nobody is online, what does the visitor experience?", "Can it answer a detailed question about my prices from my own documents, and say when it does not know?", "Can the visitor book a time without leaving the conversation?", "How do I find out a lead arrived, and how fast?", "What happens to a conversation that needs a person: who is told, and what do they see?", "Which channels are included in my plan and which cost extra?", "Is the AI cost included, credit-based or billed to me directly?", "What can I export, and can I leave with my data?", "What is on the roadmap and what is live today?", "Can I see how a real customer conversation reads, unedited?"),
      p("Write the answers in a table for each product. Differences that seemed small in marketing pages often become obvious when set side by side."),

      h2("Signs you have chosen the wrong type of tool"),
      ul("You bought a live chat suite, and chats sit unanswered because nobody is free.", "You built social flows, and customers keep asking questions the flows cannot answer.", "You bought an AI assistant, but most of your customers only message you on a platform it does not support.", "Your leads are captured but nobody is notified.", "You keep exporting data manually because the tools do not talk to each other."),
      p("Each of these has a remedy, often a second tool or a different setup, and none is a disaster if you notice in the first month. That is a good reason to use trials and to review real conversations early."),

      h2("Frequently asked questions"),
      faq(
        ["What is a good alternative to Tidio for a service business?", "If you do not have staff to answer chats and you want bookings and leads, consider an AI assistant built for appointments, such as Crescelo. If you want a strong human inbox, a live chat suite may fit better."],
        ["Is Crescelo an alternative to ManyChat?", "Only partly. ManyChat-style tools focus on social platform campaigns. Crescelo focuses on answering website visitors from your content and booking appointments. Some businesses use both."],
        ["Does Crescelo work on Instagram or Messenger?", "No. It works in a website widget, a hosted page and, on the top plan, WhatsApp and Telegram."],
        ["Can it replace live chat entirely?", "It can cover the hours when nobody is online, and your team can take over any conversation when they are available."],
        ["What does it cost compared with a live chat suite?", "It depends on your team size and volume. Crescelo's plans start at $49 a month with no per-seat charges on Starter. Compare the total at your own volume."],
        ["Can I try it before switching?", "Yes. Try the playground with your own documents with no sign-up, then start a free trial."],
      ),
      p("Compare it yourself in the [playground](/playground) and read the [product overview](/product)."),
    ],
  }),

  pillar({
    slug: 'ai-website-assistant-vs-calendly-acuity',
    title: 'Calendly and Acuity Alternative: AI Assistant vs Scheduling Tool',
    description: 'Calendly and Acuity book time; an AI assistant answers questions and books. Learn the difference, when to use each, and how they can work together.',
    primaryKeyword: 'Calendly alternative',
    secondaryKeywords: ['Acuity alternative', 'AI assistant vs Calendly', 'chatbot with scheduling', 'appointment booking alternatives'],
    body: [
      p("Calendly and Acuity Scheduling are excellent at one thing: letting people book a time on your calendar. An AI website assistant does something adjacent: it talks to visitors, answers their questions and, in products with booking, books the appointment. People often ask whether they need one or the other. The short answer is that they solve different parts of the same journey, and many businesses use both."),
      p("This guide explains the difference, shows where each shines, and describes how to combine them without confusing visitors. Details of Calendly and Acuity change, so check their current features; we describe what scheduling tools generally do."),

      h2("What a scheduling tool does"),
      ul("Shows a page or embed with your available times.", "Prevents double bookings and respects your calendar.", "Sends confirmations and reminders.", "Handles time zones, buffers and simple rules.", "Collects a few form fields and sometimes payments."),
      p("A scheduling tool starts when the visitor already knows they want to book. It is a very good form for that decision."),

      h2("What an AI website assistant does"),
      ul("Greets a visitor who may not know what to book yet.", "Answers questions about services, prices, policies and availability.", "Helps the visitor choose the right service.", "Captures contact details from people not ready to book.", "Books an appointment in the chat when they are ready.", "Hands over to a person when needed."),
      p("It begins earlier in the journey, at the question, and it can carry the visitor through to the booking."),

      h2("The journey a visitor takes"),
      table(["Stage", "What the visitor thinks", "Best tool"], ["Discovering", "What do you offer, how much, do you cover my area?", "AI assistant answering from your content"], ["Deciding", "Which service is right for me?", "AI assistant asking two or three questions"], ["Committing", "Fine, I want a time.", "Scheduling: in the chat or on a booking page"], ["Preparing", "What do I bring, can I change it?", "Confirmation and reminders, with answers from the assistant"], ["Changing plans", "I need to move it.", "Scheduling tool link or the assistant"]),
      p("A scheduling tool alone leaves the first two stages to your website copy. An assistant alone needs a calendar behind it for the third. Together they cover the journey."),

      h2("Ways to combine them"),
      h3("Option 1: The assistant books directly into your calendar"),
      p("The assistant offers slots from your opening hours and books inside the chat. This is the simplest experience: no page change. Crescelo's Growth plan includes this built-in booking, plus a read-only calendar feed so bookings show up in your own calendar."),
      h3("Option 2: The assistant hands over to your scheduling tool"),
      p("The assistant answers questions, then shows a link or embed to your Calendly or Acuity page for the booking. Crescelo supports Calendly and Cal.com on Growth, so you can keep the scheduling setup you already trust."),
      h3("Option 3: Keep them separate"),
      p("Your website has a booking page from your scheduling tool, and the assistant answers questions and captures leads for people who are not ready to book. This is the lowest effort and still adds value."),

      h2("When to keep using a scheduling tool on its own"),
      ul("Your visitors already know what they want, for example returning clients with a standard service.", "You mostly book by referral links and email, not from the website.", "Your questions are few and handled by your website copy.", "You need features specific to your scheduling tool, such as team round-robin, intake forms with payments or packages."),

      h2("When to add an AI assistant"),
      ul("Visitors ask questions before booking and some leave without answers.", "Enquiries arrive out of hours.", "Your booking page converts poorly and you suspect people do not know which service to pick.", "You want leads captured from people who do not book yet.", "You want a record of what visitors ask."),

      h2("Cost considerations"),
      p("A scheduling tool is usually inexpensive per user, with paid tiers for teams and extra features. An AI assistant adds a subscription and AI usage. The right comparison is not tool against tool but the value of the bookings the assistant helps you convert. See the [ROI guide](/blog/ai-website-assistant-roi-calculator). Crescelo's plans start at $49 a month; see [pricing](/pricing)."),

      h2("Setup checklist for using both"),
      ol("Keep your scheduling tool as the source of truth for availability, if you already trust it.", "Give the assistant your services, prices and policies as documents.", "Connect the assistant to your calendar or scheduling tool.", "Test a booking from the chat and confirm it appears in the scheduling tool.", "Check that the confirmation email is the one you want, and not two duplicates.", "Decide who sends reminders so visitors are not messaged twice."),

      h2("Where scheduling tools are ahead"),
      p("It is only fair to say where a dedicated scheduling tool is stronger. Products such as Calendly and Acuity have had years to refine the booking itself."),
      ul("Team scheduling features such as round-robin assignment and pooled availability.", "Payment collection at booking, packages, memberships and intake forms in some products.", "Deep calendar integrations and years of edge cases handled: daylight saving, recurring events, multi-day bookings.", "Familiarity: many clients already know how to use a Calendly page."),
      p("An assistant that hands over to your scheduling tool inherits those strengths, which is why many businesses keep their scheduling tool and add an assistant in front of it."),

      h2("Where an assistant is ahead"),
      ul("**Questions before booking:** it answers them, where a booking page cannot.", "**Choosing the service:** it can ask two or three questions and recommend, instead of leaving the visitor to guess from a menu.", "**Capturing people who are not ready:** a booking page asks for a decision; a chat can take an email address and follow up.", "**Explaining policies at the right moment:** deposits, lateness and preparation, in plain language.", "**Out-of-hours coverage:** a chat can answer and book at midnight without you doing anything."),

      h2("A visitor example, side by side"),
      table(["Step", "Scheduling page only", "Assistant plus calendar"], ["Visitor arrives with a question: 'Do you do first-time consultations and how long are they?'", "Reads a services list, may not find the answer, opens another tab", "Asks in the chat and gets the answer in seconds"], ["Visitor unsure which service", "Picks one and hopes", "Assistant asks a couple of questions and recommends"], ["Visitor ready to book", "Chooses a slot on the page", "Chooses a slot in the chat or on your scheduling link"], ["Visitor has a last doubt: 'What if I need to cancel?'", "Reads the small print or does not book", "Assistant states the policy"], ["Visitor not ready", "Leaves", "Leaves an email address for follow-up"]),

      h2("Avoiding the duplicate confirmation problem"),
      p("When two systems both know about a booking, they may both send emails. Decide which system owns confirmations and reminders, and switch the others off. If the assistant hands over to your scheduling tool, let the scheduling tool send them. If the assistant books directly, let it send them. Either way, test one booking and check that the visitor receives exactly one confirmation and one reminder."),

      h2("What to test before you connect them"),
      ol("Book a slot through the assistant and confirm it appears in the calendar.", "Book the same slot through your scheduling page and confirm only one succeeds.", "Cancel through each route and confirm the calendar updates.", "Change time zones on a test device and check the times shown.", "Check what happens if the scheduling tool is down."),

      h2("A decision tree in words"),
      ol("Do visitors usually ask questions before booking? If yes, add an assistant.", "Do you have many different services and people find it hard to choose? If yes, an assistant that recommends helps.", "Do you already have a scheduling tool you like and clients use? If yes, keep it and let the assistant hand over to it.", "Do you have no scheduling tool yet and want one system? Consider an assistant with booking built in.", "Do you need advanced team scheduling or packages? Keep the scheduling tool and connect the assistant to it."),

      h2("What to look for in a combined setup"),
      ul("**One source of truth for availability,** so the assistant and the scheduling page never disagree.", "**Consistent services and durations** in both, so the visitor is not shown two versions of the same thing.", "**One place for leads and bookings,** so nothing gets lost between systems.", "**Clear ownership of reminders,** so visitors get one message, not two.", "**A visible way to reach a person** whichever route the visitor takes."),

      h2("How to run the switch safely"),
      p("If you decide to add an assistant to an existing scheduling setup, do it in stages. First install the assistant with lead capture only and watch what visitors ask for a week. Then connect it to your scheduling link so it can point people to book. Then, if it makes sense, let it book directly. At each stage, compare the number of bookings and the quality of leads against the previous month. This keeps the risk low and lets you show your team what changed."),

      h2("Related reading"),
      ul("[AI appointment booking: how chatbots book real appointments](/blog/ai-appointment-booking) explains what an in-chat booking system must do.", "[How online booking avoids double bookings](/blog/double-booking-prevention-concurrency-mutex) covers the locking behind any reliable calendar.", "[Syncing AI booking with Google and Outlook Calendar](/blog/sync-ai-booking-google-outlook-calendar) shows how availability flows in.", "[How to reduce no-shows](/blog/eliminate-service-no-shows-playbook) works with any scheduling setup."),

      h2("What the numbers to watch look like"),
      table(["Metric", "Why it matters"], ["Visits to the booking page", "Shows how many visitors reach the scheduling step"], ["Conversion from booking page to booking", "Your existing baseline"], ["Chats started and chats that ended in a booking", "The assistant's contribution"], ["Questions the assistant could not answer", "Content gaps that also hurt your booking page"], ["Leads captured but not booked", "People to follow up with"]),
      p("A useful side effect: the questions visitors ask the assistant tell you what your booking page and services list fail to explain. Fixing them raises conversion for both."),

      h2("Frequently asked questions"),
      faq(
        ["Is an AI assistant a replacement for Calendly?", "Not exactly. A scheduling tool is very good at showing available times. An assistant answers questions and can book, and can also hand over to your scheduling tool."],
        ["Can Crescelo work with Calendly?", "Yes. On the Growth plan it supports Calendly and Cal.com, alongside direct scheduling and calendar sync."],
        ["Do I need both?", "Not necessarily. If visitors always know what to book, a scheduling tool is enough. If they ask questions first, an assistant adds value."],
        ["Will visitors get two confirmation emails?", "They might if both systems send one. Decide which sends confirmations and reminders and switch the other off."],
        ["Can the assistant reschedule bookings?", "In products that support it, yes, and it can point to your scheduling tool's link for changes."],
        ["Which is cheaper?", "Scheduling tools are cheaper on their own, but they do not answer questions or capture leads from people who are not ready to book."],
      ),
      p("Try the assistant on your content in the [playground](/playground), read about [booking in the chat](/product/appointment-booking) and [start a free trial](/login?mode=register)."),
    ],
  }),

  pillar({
    slug: 'eliminate-service-no-shows-playbook',
    title: 'How to Reduce No-Shows: A Playbook for Appointment-Based Businesses',
    description: 'A practical playbook to reduce appointment no-shows: confirmations, reminders, deposits, cancellation policies, easy rescheduling, waitlists and how to measure results.',
    primaryKeyword: 'reduce appointment no-shows',
    secondaryKeywords: ['how to reduce no shows', 'no-show policy', 'appointment reminders', 'reduce missed appointments'],
    body: [
      p("A no-show is more than an empty chair. It is lost revenue, wasted preparation, a gap another customer could have filled and, over time, a drag on your team's morale. Most appointment-based businesses, from salons and clinics to consultants and fitness studios, lose a meaningful share of bookings this way. The good news is that no-shows respond well to a small set of practical changes, most of which cost little."),
      p("This playbook walks through why people miss appointments, what works to prevent it, how to write a fair policy, how to fill the gaps that still appear and how to measure progress. It is general guidance: the right mix depends on your business, and you should follow the laws and professional rules that apply to you."),

      h2("Why people miss appointments"),
      p("Understanding the reasons tells you which fix to use."),
      table(["Reason", "Typical fix"], ["They forgot", "Reminders at the right times and on the right channel"], ["Something came up and they could not change it easily", "One-tap rescheduling in every message"], ["The booking felt low-commitment", "A deposit, card hold or clear cancellation policy"], ["They booked several places and chose another", "Confirmation requests and a fast way to release the slot"], ["They were unsure of the time, place or preparation", "Clear confirmations with all the details and a calendar file"], ["They were afraid or unsure about the service", "Pre-appointment information and a chance to ask questions"]),
      p("Notice how many are about convenience and clarity, not bad intent. That is why friendly systems beat strict ones."),

      h2("Fix 1: A confirmation that answers every question"),
      p("The confirmation is your first line of defence. It should be sent immediately and include the service, date, time, address, cost, how long it takes, what to bring, how to change or cancel, and a calendar file. Everything a customer might otherwise need to ask should be in it. See [automated booking confirmations](/blog/automated-booking-confirmations-ical)."),

      h2("Fix 2: Reminders that people actually notice"),
      p("Most businesses send too few reminders or send them at unhelpful times. A common pattern is a reminder two days before, a second on the morning or a few hours before, and an optional confirm-or-change request. Choose the channel your customers read: text messages are often noticed faster than email, but email is better for details. See [SMS vs email appointment reminders](/blog/sms-vs-email-appointment-reminders-conversions)."),
      ul("Keep messages short and human.", "Always include a one-tap way to reschedule or cancel.", "Avoid sending reminders at night.", "Do not send more than three; beyond that they are ignored or annoy."),

      h2("Fix 3: Make changing the booking effortless"),
      p("If moving a booking takes a phone call in office hours, some customers will simply not turn up. A link in every message that opens a page to pick another time, or a reply in the chat, converts a would-be no-show into a rebooking. See [frictionless self-serve rescheduling](/blog/frictionless-self-serve-rescheduling) and [conversational rescheduling and cancellations](/blog/conversational-rescheduling-cancellations)."),

      h2("Fix 4: Deposits and card holds"),
      p("A deposit changes behaviour because the customer has something at stake. It works best for services where a missed slot costs you real money: long appointments, expensive treatments, in-demand times. Deposits also add friction, so consider using them selectively, for example for first-time customers, for the longest services or for peak times. Explain clearly what the deposit is for and when it is refunded. See [deposit collection and booking policies](/blog/deposit-collection-booking-policies-chat) and [the psychology of deposits](/blog/deposit-collection-psychology-show-up-rates). Note that rules on deposits and fees vary by country and profession; take advice where in doubt."),

      h2("Fix 5: A cancellation policy that is fair and visible"),
      p("A policy that customers have not seen cannot be enforced kindly. Write it in plain words, show it at the moment of booking and repeat it in the confirmation. A good policy sets a reasonable notice period, explains what happens after it and allows for genuine emergencies at your discretion. See [effective cancellation policies for service businesses](/blog/effective-cancellation-policies-service-businesses)."),
      note("Sample wording: 'You can change or cancel free of charge up to 24 hours before your appointment. After that we may keep your deposit, because the time is reserved for you. If something unexpected happens, please tell us and we will do our best to help.'"),

      h2("Fix 6: A waitlist and standby list to fill the gaps"),
      p("Some cancellations will still happen. If you learn about them in time, you can fill the slot. Keep a list of people who would like an earlier time, and notify them when a slot opens. Automated systems can do this: when a booking is cancelled, message the standby list and give the slot to the first person who accepts. See [filling cancelled slots with automated standby chat](/blog/fill-cancelled-slots-automated-standby-chat)."),

      h2("Fix 7: Prepare customers with a short questionnaire"),
      p("A brief pre-appointment questionnaire, for example about goals or history, increases commitment and saves time on the day. It also lets you flag issues in advance. See [pre-appointment questionnaires and automated intake](/blog/pre-appointment-questionnaires-automated-intake). Ask only for what you need, and avoid sensitive details in chat or email unless your privacy arrangements allow it."),

      h2("Fix 8: Overbooking, carefully"),
      p("Some businesses deliberately book a little more than capacity to offset expected no-shows, as airlines do. It can work where the numbers are stable and a wait is acceptable, but it can backfire if everyone turns up. Dynamic buffers and standby lists are usually kinder alternatives; compare them in [overbooking versus dynamic buffers](/blog/overbooking-strategies-vs-dynamic-buffers)."),

      h2("How an AI assistant helps"),
      p("An AI assistant that books appointments can support several of these fixes at once: it sends clear confirmations, offers easy rescheduling in the chat, and states your policy accurately when asked. It also answers the 'what should I bring?' and 'where do I park?' questions that otherwise lead to confusion. Crescelo's booking on the Growth plan sends a confirmation email with a private link to reschedule or cancel, and reminders before the appointment; it does not take payments or deposits itself, so use your own payment process for those. You can add your policies to the knowledge base so the assistant states them consistently. See [AI appointment booking](/blog/ai-appointment-booking)."),

      h2("A 30-day plan to cut no-shows"),
      ol("**Week 1: Measure.** Count your appointments and no-shows for the last three months. Calculate the rate and the lost revenue.", "**Week 2: Fix the basics.** Improve the confirmation, add a reminder pattern and add a one-tap reschedule link.", "**Week 3: Set your policy.** Write a fair cancellation policy, show it at booking and add deposits where they make sense.", "**Week 4: Fill gaps.** Set up a standby list and notification process, then review results."),

      h2("How to measure progress"),
      table(["Metric", "How to calculate", "What it tells you"], ["No-show rate", "No-shows divided by booked appointments", "The headline number"], ["Late-cancellation rate", "Cancellations within your notice window divided by bookings", "Whether people change too late"], ["Rebooking rate", "Rescheduled bookings divided by cancellations", "Whether easy rescheduling works"], ["Gap fill rate", "Cancelled slots refilled divided by cancelled slots", "Whether your standby process works"], ["Lost revenue", "No-shows multiplied by average booking value", "The value of improvement"]),
      p("Look at results by service, time of day and customer type. Patterns show where a deposit or extra reminder is worthwhile."),

      h2("Common mistakes"),
      ul("Sending a single reminder and hoping.", "Making rescheduling harder than booking.", "Hiding the policy until someone breaks it.", "Applying strict penalties without discretion for genuine emergencies.", "Ignoring the cost of no-shows because they are hard to see.", "Not measuring, so you cannot tell which fix worked."),

      h2("Example reminder schedule you can copy"),
      table(["When", "Channel", "Message purpose"], ["Immediately after booking", "Email (with calendar file)", "Full details, policy, change link"], ["48 hours before", "Text message or email", "Reminder with one-tap confirm or change"], ["Morning of the appointment or 3 hours before", "Text message", "Short reminder with address and change link"], ["If unconfirmed at 24 hours", "Text message", "'Please confirm your appointment or release the slot for someone else.'"]),
      p("Adjust the timing to your business. A same-day service needs fewer, faster reminders; a specialist consultation booked months ahead needs an extra reminder a week before."),

      h2("Example wording you can adapt"),
      ul("**Friendly reminder:** 'Hi Sam, a quick reminder about your appointment tomorrow at 2:30 p.m. Need to change it? Use this link and we will offer the next available time.'", "**Confirmation request:** 'Please reply YES to confirm your 2:30 p.m. appointment. If we do not hear from you we may offer the slot to someone on our waiting list.'", "**Late-cancel message:** 'We are sorry you cannot make it. Since this is inside our 24-hour window we may keep your deposit, but tell us if something unexpected happened and we will do our best to help.'", "**Waitlist offer:** 'A slot has opened at 4:00 p.m. today. Reply YES to take it.'"),

      h2("Different businesses, different priorities"),
      table(["Business", "Biggest lever", "Why"], ["Salon or barbershop", "Reminder plus easy rescheduling, deposits for long services", "Many bookings are made casually and forgotten"], ["Clinic or dental practice", "Confirmation requests, recall system, waitlist", "Gaps are expensive and patients often need to reschedule"], ["Consultants and coaches", "Prepayment or deposit, pre-call questionnaire", "Each slot is valuable and preparation matters"], ["Fitness studio", "Waitlists and cancellation windows for classes", "Capacity is fixed and demand is high for peak classes"], ["Home services", "Confirmation the day before and a technician arrival window", "The customer must be home"]),

      h2("Do not punish the wrong people"),
      p("Most no-shows come from a small share of customers, and many others have good reasons. A policy that treats everyone as a suspect drives away good customers. Use deposits and stricter rules where they are needed, such as first-time customers or long appointments, and give regulars the benefit of the doubt. Keep a note of repeated no-shows so you can decide about future bookings with facts. Whatever you decide, be consistent and be kind in tone."),

      h2("What to do on the day"),
      ul("Call or message anyone who has not arrived after a short wait, in case they are running late.", "Offer the slot to the standby list once you are sure the customer is not coming.", "Record the no-show so your statistics are accurate.", "Follow up kindly the next day, offering to rebook."),

      h2("Frequently asked questions"),
      faq(
        ["What is a good no-show rate?", "It varies by industry. Rather than aim at an average, measure your own rate and reduce it over time using reminders, easier rescheduling and a clear policy."],
        ["Do deposits reduce no-shows?", "They often do because customers have something at stake. Use them thoughtfully, explain them clearly and check the rules that apply to you."],
        ["How many reminders should I send?", "Usually two or three: a confirmation immediately, a reminder a day or two before and another a few hours before. More than that tends to annoy."],
        ["Are text messages better than email for reminders?", "Text messages are often read faster, while email carries more detail. Many businesses use both."],
        ["Should I charge a no-show fee?", "It can deter no-shows, but it must be clearly agreed in advance and lawful in your area. Many businesses start with reminders and easy rescheduling before adding fees."],
        ["How can I fill a cancelled slot?", "Keep a standby list and notify people when a slot opens, ideally automatically."],
      ),
      p("If you want the confirmations, rescheduling and policy answers handled in your website chat, see the [appointment booking feature](/product/appointment-booking) and [start a free trial](/login?mode=register)."),
    ],
  }),

  pillar({
    slug: 'ai-booking-guide-barbershops-salons',
    title: 'AI Chatbot for Salons and Barbershops: Booking, No-Shows and Upsells',
    description: 'How salons and barbershops use an AI chatbot to answer price questions, book by stylist and service, reduce no-shows and win back busy-hour enquiries.',
    primaryKeyword: 'AI chatbot for salons',
    secondaryKeywords: ['AI booking for barbershops', 'salon chatbot', 'barbershop online booking chatbot', 'AI receptionist for salon'],
    body: [
      p("Salons and barbershops share a problem: the moments when customers most want to book are the moments when your hands are busy. The phone rings while you have foils in your hands. A message arrives at 10 p.m. and is still unanswered at noon. Walk-ins want to know how long the wait is. An AI chatbot on your website, and on your booking links, can handle the repeat questions and book appointments while you work. This guide explains how it fits a salon or barbershop, what to set up, what to watch for and how to keep the personal touch that keeps regulars coming back."),

      h2("The questions that fill a salon's inbox"),
      p("Look at your messages for a week and you will see the same questions over and over."),
      ul("How much is a cut, a colour, a beard trim, a blow-dry?", "Do you do a particular style, treatment or texture?", "Do I need a patch test before colour?", "How long does it take?", "Is there parking? Can I bring a child?", "Do you take walk-ins?", "Can I book with a particular stylist?", "What is your cancellation and deposit policy?", "Do you sell or use certain products?"),
      p("Each has a factual answer that lives in your head or a price list. An assistant that reads those answers can reply instantly at any hour, then offer a time."),

      h2("What to load into the knowledge base"),
      ol("**Price list:** every service with a price or range and what it includes.", "**Durations:** how long each service takes, including extra for long or thick hair.", "**Stylist profiles:** who does what, specialities and availability.", "**Policies:** deposits, cancellations, lateness, patch tests, children and pets.", "**Practical information:** address, parking, transport, opening hours and holidays.", "**Aftercare and product advice:** short, approved answers for common questions."),
      p("Write in your own voice, and keep each topic in a short, clearly titled document. See [hair consultations with a grounded knowledge base](/blog/hair-consultations-grounded-knowledge-base) for how to structure consultation answers safely."),

      h2("Booking by service and by stylist"),
      p("Salon booking is more complicated than a single calendar. A colour needs a long block with processing time, during which the stylist can work with someone else. A barbershop needs fast turnaround between clients. Customers often want a particular person. A good booking system understands these things."),
      table(["Salon reality", "What the system must do"], ["Different services have different durations", "Attach a duration to each service and add extra time when needed"], ["Colour has processing time", "Allow overlapping work where the stylist is free during processing"], ["Customers prefer a stylist", "Offer the requested stylist, or the next available if they have no preference"], ["A chair or basin is shared", "Treat the chair or basin as a resource that can also be booked"], ["Barbers need quick turnaround", "Set short buffers between cuts"], ["Two visitors click the same time", "Lock the slot so only one succeeds"]),
      p("See [stylist preferences and chair allocation](/blog/stylist-preferences-chair-allocation-chat) and [barbershop scheduling and chair turnaround](/blog/barbershop-scheduling-chair-turnaround). The protection against double bookings is described in [how online booking avoids double bookings](/blog/double-booking-prevention-concurrency-mutex)."),

      h2("Walk-ins and appointments together"),
      p("Many barbershops serve both. The chatbot can tell visitors whether walk-ins are welcome, give the current guidance on waits and offer a booked slot for those who prefer certainty. Separating a share of your day for walk-ins and the rest for bookings avoids chaos. See [managing walk-ins and appointments in salons](/blog/managing-walk-ins-vs-appointments-salons)."),

      h2("Reducing no-shows in a salon"),
      p("A missed appointment leaves an empty chair and lost income. The most effective steps are a clear confirmation, a reminder the day before, an easy way to reschedule and, for long services, a deposit. A standby list helps fill cancellations. The complete method is in [how to eliminate service no-shows](/blog/eliminate-service-no-shows-playbook) and [eliminating salon no-shows with automated reminders](/blog/eliminate-salon-no-shows-automated-reminders)."),

      h2("Gentle, honest upselling"),
      p("Good stylists recommend treatments that genuinely suit the customer. The assistant can do the same in a light way: when someone books a colour, it may mention a gloss or a conditioning treatment and give the price and time, without pressure. The key is relevance and honesty. See [upselling salon treatments in chat](/blog/upselling-salon-treatments-chat). Never let the assistant promise results or make health claims you would not make in the chair."),

      h2("Bridal parties, groups and special events"),
      p("Group bookings need a person. The assistant can collect the essentials: the date, the number of people, the services and the location, then pass the lead to you with the conversation. This is where a lead capture with a clear handover works better than trying to book a large group automatically. See [bridal party booking workflows](/blog/bridal-party-booking-workflows-salons)."),

      h2("Social media: booking from your bio link"),
      p("Much of a salon's demand starts on Instagram or TikTok. A link in your bio that opens a hosted page with the assistant lets a visitor ask a question and book without hunting through your site. Crescelo offers hosted business pages for exactly this. See [booking from your social bio link](/blog/social-bio-link-in-chat-booking) and the [website widget page](/product/website-widget)."),

      h2("What it costs"),
      p("Plans depend on volume. Crescelo starts at $49 a month on monthly billing for one assistant and 100 chat sessions, and adds booking and calendar sync on the $149 Growth plan. You connect your own AI provider and pay them directly for usage, which is typically small for a single salon. See [pricing](/pricing). Compare the cost with the value of the extra bookings you would recover; the [ROI guide](/blog/ai-website-assistant-roi-calculator) shows how."),

      h2("Setting it up in an afternoon"),
      ol("Type up your price list, durations and policies into short documents.", "Load them into the assistant and set a friendly greeting.", "Set your opening hours and slot length, and subscribe to the calendar feed in your own calendar.", "Test with twenty real questions, including 'do you do curly cuts' and 'can I bring my child'.", "Test a booking with two people clicking the same slot.", "Add the snippet to your website and the link to your social bio.", "Review conversations for the first two weeks and fix the gaps."),

      h2("Keeping the personal touch"),
      p("Salons are personal businesses. Keep the assistant's tone warm, let it use your salon's name and stylists' names, and make it easy to ask for a person. Let regulars know they can still call or message you directly. The assistant should feel like a receptionist who knows the price list, not a wall between you and your customers."),

      h2("A sample conversation"),
      p("Here is how a good salon assistant handles a typical message, written out so you can compare it with your own experience."),
      table(["Speaker", "Message"], ["Visitor", "Hi, how much is a skin fade and beard trim, and do you have anything Saturday?"], ["Assistant", "Hi! A skin fade is $28 and a beard trim is $15, so $43 together and it takes about 45 minutes. On Saturday I can offer 10:15, 11:30 or 2:00. Which suits you?"], ["Visitor", "11:30 please. Can I bring my son for a cut too?"], ["Assistant", "Of course. A child's cut is $18 and takes 25 minutes. I can book you both back to back from 11:30, or with two barbers at the same time if you prefer. Shall I do back to back?"], ["Visitor", "Back to back is fine."], ["Assistant", "Done. What name and mobile number should I put the booking under? I will send a confirmation with the address and the free-change link."]),
      p("Notice what the assistant did: gave the price from the price list, summed the services, offered real times, handled a related request and asked for the details it needed, in a natural voice."),

      h2("Common mistakes salons make with chatbots"),
      ul("Loading an old price list and never updating it.", "Not telling the assistant about patch test rules, so it books colour without mentioning them.", "Forgetting that a colour needs a long block with processing time.", "Not setting buffers between clients, so schedules are unrealistic.", "Hiding the option to speak to a person.", "Letting the assistant make promises about results.", "Not checking conversations for unanswered questions."),

      h2("Tips for different business types"),
      table(["Business", "Extra thing to set up"], ["Barbershop", "A short slot length and a walk-in policy"], ["Hair salon", "Long colour blocks with processing time and patch test rules"], ["Nail and beauty studio", "Add-on services, repairs and allergy information"], ["Mobile stylist", "Service area and travel time between bookings; see [service area verification](/blog/service-area-verification-ai-chat)"], ["Multi-chair salon", "One booking link per stylist through Calendly or Cal.com, or a single pool of slots"]),

      h2("Measuring the result"),
      ul("**Bookings from the website and bio link** before and after.", "**Out-of-hours bookings,** which are the clearest gain.", "**No-show rate** and rebooking rate.", "**Average ticket size,** if upsell prompts are used.", "**Unanswered questions,** which become your next documents."),
      p("Give it a month and compare with the month before. Small salons often see the biggest benefit from out-of-hours bookings and from not missing calls during busy chairs."),

      h2("Quiet-hour and last-minute strategies"),
      p("Every salon has slow periods. An assistant can help fill them. It can mention available same-day or next-day slots when a visitor asks about timing, and you can offer a small incentive for quiet hours if your business model allows it. Be transparent and consistent: a discount offered only to those who ask can upset regulars, so decide the rules in advance and put them in the knowledge base. Tell the assistant exactly what it may offer and what it may not."),

      h2("Frequently asked questions"),
      faq(
        ["Can an AI chatbot book salon appointments?", "Yes. With a booking-enabled assistant, visitors choose a service, a stylist and a free time, and the booking is confirmed automatically with protection against double booking."],
        ["Can it handle different service lengths and stylists?", "Yes. You set a duration for each service and which stylists provide it, and the system offers times that fit."],
        ["Will it answer price questions correctly?", "It answers from the price list you give it, so keep the list up to date. If a price is not in the documents it should say it does not know."],
        ["Does it work for barbershops with walk-ins?", "Yes. It can explain your walk-in policy and offer booked slots for those who prefer certainty."],
        ["Can it take deposits?", "Deposits depend on the product and your payment setup. Explain the policy clearly and check what your chosen product supports."],
        ["How much does it cost?", "A small salon can start on an entry plan at tens of dollars a month plus a small AI usage cost. Compare it with the value of recovered bookings."],
      ),
      p("Try it with your own price list in the [playground](/playground), then [start a free trial](/login?mode=register) to put it on your website and bio link."),
    ],
  }),
];
