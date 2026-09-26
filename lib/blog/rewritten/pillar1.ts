import { faq, h2, h3, note, ol, p, pillar, table, ul } from '../authoring';

export const PILLAR1 = [
  pillar({
    slug: 'ai-website-assistant',
    title: 'AI Website Assistant: What It Is, How It Works and How to Choose One',
    description: 'A complete guide to AI website assistants for service businesses: what they do, how they work, what they cost, where they fail and how to choose and launch one.',
    primaryKeyword: 'AI website assistant',
    secondaryKeywords: ['AI chatbot for website', 'AI assistant for small business website', 'website chat assistant', 'AI customer service for small business'],
    body: [
      p("An AI website assistant is a chat window on your website that answers visitor questions in plain language, collects contact details and, in the better products, books appointments. It reads your own content, such as your services, prices, policies and FAQs, and replies from that instead of from general knowledge. For a business that lives on enquiries and bookings, it is the difference between a visitor who leaves with an unanswered question and one who leaves with an appointment."),
      p("This guide is written for owners and managers of appointment-based businesses: salons, clinics, agencies, fitness studios, legal and property practices, home services. It explains how these assistants actually work, what to prepare, what they cost, where they go wrong and how to compare products without being fooled by a demo. It is long on purpose. If you only want the short version, jump to the checklist near the end."),

      h2("What an AI website assistant actually does"),
      p("Most service businesses answer the same questions again and again: are you open on Saturday, how much is this, do you cover my area, can I move my appointment, do you take my insurance. Each of those questions arrives at a bad moment, usually when nobody is free to answer. A visitor who does not get an answer within a minute or two tends to open another tab and try a competitor. An assistant handles that first layer around the clock."),
      ul("**Answers questions** from your documents, so replies match what you would say yourself.", "**Books appointments** by showing real free time slots and confirming the booking in the chat.", "**Captures leads** by asking for a name, phone number or email when a visitor is interested, and sending them to you.", "**Hands over to a person** when the question needs one, with the whole conversation attached.", "**Works in the visitor's language** where the underlying model supports it."),
      p("What it is not: a replacement for your team, a magic sales engine, or a way to skip writing down how your business works. The quality of the assistant is capped by the quality of what you give it to read."),

      h2("How it works behind the chat bubble"),
      p("Understanding the moving parts makes you a better buyer. There are five of them, and every serious product has all five in some form."),
      h3("1. Your knowledge base"),
      p("You give the assistant documents: a price list, service descriptions, policies, opening hours, FAQ pages, even a link to your website. The system splits them into short passages and stores them so they can be searched. This is called a knowledge base, and it is the assistant's only source of truth about your business."),
      h3("2. Retrieval"),
      p("When a visitor asks a question, the system first searches the knowledge base for the passages most likely to contain the answer. Good systems combine two kinds of search: one that matches meaning (so 'how much for a cut' finds the page titled 'Haircut pricing') and one that matches exact words (so a product code or a place name is not missed). This step is usually called retrieval-augmented generation, or RAG. You can read more about the trade-offs in our piece on [hybrid search for RAG](/blog/hybrid-rag-dense-vector-sparse-keyword)."),
      h3("3. The language model"),
      p("The retrieved passages and the visitor's question go to a large language model, which writes the reply. The instruction it receives says, in effect: answer only from these passages, and if they do not contain the answer, say so. That single instruction is what separates a useful assistant from one that invents prices."),
      h3("4. Actions"),
      p("Beyond talking, an assistant can do things: show a booking calendar, lock a time slot so two people cannot book it, send a confirmation email, record a lead, or notify your team. These actions are ordinary software, not AI, and they are where most of the business value sits."),
      h3("5. The channels"),
      p("The chat can live in a bubble on your website, in a full-page hosted version, and in some products inside WhatsApp or Telegram. The same knowledge and rules serve all of them."),

      h2("Why grounding matters more than the model"),
      p("A model on its own knows a great deal about the world and nothing about your business. Left alone, it will guess, and a guess about your price or your refund policy is worse than no answer at all. Grounding means every reply is built from passages in your own content, and the assistant is instructed to say 'I do not have that' when the passages do not cover the question."),
      p("When you compare products, do not ask which model they use. Ask what happens on a question your documents do not cover, and then test it yourself. Ask something absurd, ask something that sounds plausible but is not in your content, and ask for a discount you do not offer. The way a product refuses tells you more than any feature list. We go deeper on this in [how to stop a chatbot from making things up](/blog/grounded-ai-chatbot-hallucinations)."),
      note("You can try grounding on your own documents without an account in the [Crescelo playground](/playground): upload a file or paste some text, then ask it something that is not in there."),

      h2("What it costs, in plain terms"),
      p("There are usually two separate costs, and vendors describe them differently, which makes comparison hard."),
      table(["Cost", "What it pays for", "How vendors price it"], ["Platform", "The software, hosting, booking and lead tools, support", "Monthly subscription, often tiered by conversations, assistants or storage"], ["AI usage", "The language model that writes each reply", "Bundled into the price with a margin, or billed to you directly at the provider's rate"]),
      p("With a bring-your-own-key setup, you connect your own account at an AI provider such as OpenAI, Anthropic, Google, Groq or DeepSeek, and pay them directly for what you use. The platform adds nothing on top. For most small businesses the AI usage is small compared with the subscription, but it grows with volume, so it is worth knowing which model you are paying for. Our guide to [bring-your-own-key pricing](/blog/byok-vs-bundled-ai-pricing-cost-comparison) works through the numbers."),
      p("Crescelo's plans start at $49 a month for one assistant and 100 chat sessions, with Growth at $149 for booking and calendar sync, and a larger tier for agencies and multi-channel use. See the current details on the [pricing page](/pricing), because prices can change."),

      h2("What to prepare before you switch one on"),
      ol("Collect the documents you already have: price list, service descriptions, policies, opening hours, FAQ page and any terms you send to customers.", "Write down the ten questions your team answers most often and check each one is answered somewhere in those documents. If it is not, write the answer down. This step alone improves your website even without an assistant.", "Decide what the assistant must never promise: medical, legal or financial advice, discounts you have not approved, guaranteed arrival times.", "Decide when a person should take over: complaints, emergencies, anything involving money or safety.", "Set up your calendar and services if you want bookings: durations, buffers between appointments, staff, opening hours and holidays."),
      p("Then test it the way a customer would. Ask your ten questions in different words, with typos, and in a hurry. Ask something that is not in your content. Try a booking from start to finish and check that the confirmation arrives. Open the site on a phone and make sure the chat window scrolls and does not cover the button a visitor needs. Our [ten questions every service business chatbot should answer well](/blog/essential-chatbot-questions-service-business) is a good starting list."),

      h2("Where AI website assistants still go wrong"),
      ul("**Out-of-date content.** If your prices change and the document does not, the assistant repeats the old price. Treat the knowledge base like a page on your website and review it on a schedule.", "**Questions that need judgement.** Complaints, refunds and unusual requests should go to a person. A good assistant recognises this and offers the handover instead of improvising.", "**Long, messy source documents.** A 60-page PDF with the answer buried in a footnote is hard to search. Shorter, clearly titled pages retrieve better.", "**Over-promising by the vendor.** Beware of claims that an assistant will replace your staff or double your sales. It will answer more enquiries faster, and how much that is worth depends on your traffic and margins.", "**Ignoring the conversations.** The transcripts show what customers really ask and what your site fails to explain. If nobody reads them, you lose the best part of the product. See [how to review your chatbot's conversations each week](/blog/audit-website-chatbot-conversations)."),

      h2("Rule-based chatbot or AI assistant?"),
      p("Older chatbots follow a script you draw: if the visitor clicks A, show B. They are predictable and cheap, but they break the moment a visitor phrases something in an unexpected way. AI assistants read free text and can cope with that, at the cost of needing careful grounding. For a handful of fixed journeys a script is fine. For open questions from real customers an assistant is the better tool. The full comparison is in [rule-based chatbots vs AI assistants](/blog/rule-based-vs-ai-chatbots)."),

      h2("Privacy, consent and honesty"),
      p("A chat collects personal information, so it falls under privacy law wherever your visitors live. In practice that means telling visitors they are talking to an AI, linking to your privacy policy, collecting only what you need, and being able to delete a person's data when they ask. If you serve people in the European Union or California, read our [GDPR checklist for website chatbots](/blog/website-chatbot-gdpr-checklist) before you go live. This is general information, not legal advice."),

      h2("How to compare products without being fooled by a demo"),
      p("Every demo works, because the vendor chose the questions. Use this short protocol on any product you are considering."),
      ol("Load your real documents, not the vendor's sample content.", "Ask the same ten questions on every product and compare the answers side by side.", "Ask three questions that your documents do not answer. Note which products admit it and which invent something.", "Try a real booking, including a time that is already taken.", "Check what you can export and what happens to your data if you leave.", "Read the pricing page twice: what counts as a conversation, what happens over the limit, and what the AI usage costs."),
      table(["Question to ask", "Why it matters"], ["Can I see the sources behind each answer?", "Lets you find and fix wrong answers quickly"], ["What happens when it does not know?", "The most important safety behaviour"], ["Which AI providers can I use, and can I bring my own key?", "Controls cost and lets you change model later"], ["How are double bookings prevented?", "A booking tool that double-books costs you customers"], ["How do I take over a conversation?", "You need a way to step in"], ["Where is my data stored and can I delete it?", "Legal and trust question"]),

      h2("How to know it is working"),
      p("Look at three numbers after the first few weeks: how many conversations ended with a booking or a lead, how many questions the assistant could not answer, and what visitors said when they asked for a person. The unanswered questions are a to-do list for your knowledge base. The handover requests show you where the assistant should be more helpful or where a human is genuinely needed. For a fuller framework, see the [ROI calculation for an AI website assistant](/blog/ai-website-assistant-roi-calculator)."),

      h2("A practical launch checklist"),
      ul("Documents loaded and reviewed for accuracy and dates.", "Ten common questions tested, including with typos.", "Three unanswerable questions tested; the assistant admits it does not know.", "Booking tested end to end, with the confirmation email received.", "Handover tested; your team is notified.", "AI disclosure and privacy link visible in the chat.", "Tested on a phone and on your slowest page.", "A weekly ten-minute review of conversations in your calendar."),

      h2("Frequently asked questions"),
      faq(
        ["What is an AI website assistant?", "It is a chat window on your website that answers visitors from your own documents, captures leads and, in many products, books appointments. It uses a language model to write replies but is told to answer only from the content you provide."],
        ["Is an AI website assistant the same as a chatbot?", "It is a modern kind of chatbot. Older chatbots follow fixed scripts. An AI assistant reads free text and writes replies, which makes it more flexible but means it needs careful grounding in your content."],
        ["How much does an AI assistant for a small business cost?", "Expect a monthly platform subscription, from tens to a few hundred dollars depending on volume, plus AI usage. With a bring-your-own-key product you pay the AI provider directly at their rates instead of a marked-up bundle."],
        ["Will it make things up?", "It can if it is not grounded. A well-built assistant answers only from your documents and says it does not know when they do not cover the question. Always test with questions your content does not answer."],
        ["Can it book appointments?", "Yes, in products that include booking. The assistant shows real free slots from your calendar and confirms the booking, with protection so two people cannot take the same time."],
        ["Do I need technical skills?", "No. You upload or paste your content, connect an AI provider if the product asks for one and paste one line of code on your website. Most people are live within an afternoon."],
        ["Is it safe for customer data?", "It can be, if the vendor is transparent about storage, lets you delete data and you tell visitors they are talking to an AI. Check the vendor's privacy policy and sub-processors before you start."],
      ),
      p("Ready to see it on your own content? Try the [playground](/playground) with no sign-up, read how the [AI assistant feature](/product/ai-assistant) works, or [start a free trial](/login?mode=register) when you want it on your site."),
    ],
  }),

  pillar({
    slug: 'add-ai-chatbot-to-your-website',
    title: 'How to Add an AI Chatbot to Your Website: A Step-by-Step Guide',
    description: 'A practical guide to adding an AI chatbot to any website: what to prepare, how to install the widget, how to test it and how to keep it accurate after you launch.',
    primaryKeyword: 'how to add an AI chatbot to your website',
    secondaryKeywords: ['add chatbot to website', 'install AI chat widget', 'website chatbot setup', 'embed chatbot on website'],
    clusterId: 1,
    clusterName: 'AI Website Chatbots',
    funnel: 'TOFU',
    tags: ['Getting started', 'Website chat', 'AI Website Chatbots'],
    related: ['ai-receptionist-vs-answering-service', 'stop-double-bookings-online'],
    body: [
      p("Adding an AI chatbot to your website takes minutes. Getting good answers takes preparation. Most disappointing chatbot launches are not a technology problem: the owner pasted the code, skipped the preparation, and the assistant then had nothing accurate to say. This guide gives you the order that works, the exact steps to install the widget on any site, and the tests to run before real visitors see it."),
      p("It applies to any modern chatbot product. Where a step is specific to Crescelo we say so. If you are still deciding whether you need one, read [what an AI website assistant is and how it works](/blog/ai-website-assistant) first."),

      h2("Before you start: what you need"),
      ul("**Access to your website's code or settings.** Either your CMS (WordPress, Wix, Squarespace, Webflow, Shopify) or the ability to edit the HTML of your pages.", "**Your business content.** Price list, service descriptions, policies, opening hours and FAQs, as documents or web pages.", "**About an hour.** Half of it collecting content, half of it testing."),
      p("You do not need a developer for a standard installation. If your site is built on a hosted platform, you will paste a single snippet into a settings box, and the platform-specific guides for [WordPress](/blog/install-ai-chatbot-wordpress-guide) and [Webflow, Squarespace and Wix](/blog/embed-ai-chatbot-webflow-squarespace-wix) cover each one."),

      h2("Step 1: Decide what the chatbot is for"),
      p("Write one sentence. For example: 'Answer questions about services and prices, and book consultations.' A narrow job produces a better assistant than 'do everything'. The job decides what content to load and which features to switch on."),
      table(["Goal", "What the chatbot needs", "Feature to enable"], ["Answer common questions", "FAQ, prices, policies, opening hours", "Knowledge base"], ["Book appointments", "Services, durations, calendar", "Booking and calendar sync"], ["Collect enquiries out of hours", "Lead questions, contact details", "Lead capture and alerts"], ["Support customers", "Help articles, troubleshooting steps", "Knowledge base and human handover"]),

      h2("Step 2: Gather and clean your content"),
      p("The assistant can only be as accurate as what it reads. Collect the documents your team already uses to answer customers, then read them with a critical eye."),
      ol("Remove anything out of date: old prices, expired offers, former staff.", "Make sure each service has a clear name, a price or price range, and what is included.", "State policies plainly: cancellation, refunds, deposits, late arrivals.", "Add the answers to the ten questions your team hears most often. If they are not written down anywhere, write them now.", "Prefer several short, clearly titled documents over one enormous PDF. Short pages are easier to search accurately."),
      p("Formats that usually work: PDF, Word, plain text, Markdown, CSV and web page addresses. If a page is only an image, check the product supports text recognition (OCR) or retype the key facts."),

      h2("Step 3: Create the assistant and add your content"),
      p("In Crescelo, open the dashboard, go to the Knowledge Base, and upload files, paste text or add your website address. The system reads and indexes them, usually within a minute. Then set the assistant's name, greeting and tone under its settings. Keep the greeting short and specific: 'Hi, I can answer questions about our services and book you in' works better than 'How can I help you today?'."),
      p("Connect an AI provider if your plan requires one. With a bring-your-own-key setup you paste your provider's API key once and pay the provider directly; the guide to [choosing which AI model to connect](/blog/byok-ai-chatbot-guide) explains the options. To try things first, the free engine is enough for testing."),

      h2("Step 4: Test before you publish"),
      p("Use the testing area inside the product, not your live site. Ask questions the way real customers do."),
      ul("Your ten most common questions, in different wording, with typos and in slang.", "A question that is not in your content. The assistant should say it does not know and offer a person or a form.", "A request for something you do not offer, such as a discount. It should not promise it.", "A booking from start to finish, including a time that is already taken.", "A request to speak to a person."),
      p("Fix each failure by changing the content, not the assistant's settings. If it answered wrongly, find the source passage and correct it. If it could not answer, add the missing answer to your documents."),

      h2("Step 5: Install the widget on your website"),
      p("The install is one snippet of code, usually a `script` tag. Where you paste it depends on your platform."),
      h3("WordPress"),
      p("Use a plugin that lets you add code to the footer, or paste the snippet into your theme's footer through the theme editor. Full steps are in the [WordPress installation guide](/blog/install-ai-chatbot-wordpress-guide)."),
      h3("Wix, Squarespace and Webflow"),
      p("Each has a 'custom code' or 'code injection' area in the site settings. Paste the snippet into the footer or 'before the closing body tag' box and publish. Details are in the [site builder guide](/blog/embed-ai-chatbot-webflow-squarespace-wix)."),
      h3("Shopify and other platforms"),
      p("Add the snippet to the theme's main layout file just before the closing body tag. Many platforms have a 'scripts' or 'header and footer' setting that does the same job without editing files."),
      h3("A custom-coded site"),
      p("Paste the snippet into the HTML of every page where you want the chat, just before the closing body tag, or into a shared layout file so it appears everywhere."),
      note("After publishing, open your live site in a private window and clear your cache if the chat does not appear. Ad blockers and cookie banners can also hide it during testing."),

      h2("Step 6: Check it on real devices"),
      ol("Open the site on a phone. The chat window should fit the screen, scroll and not cover your call-to-action buttons.", "Check the page speed before and after. A well-built widget loads without blocking your page. See our note on [performance of embedded chat widgets](/blog/performance-optimization-embedded-chat-widgets).", "Try the chat with a screen reader or keyboard only, if accessibility matters to you. The [accessibility guide for chatbots](/blog/accessibility-wcag-compliance-website-chatbots) lists what to check.", "Send yourself a test booking and lead and confirm the emails arrive."),

      h2("Step 7: Be honest with visitors"),
      p("Say it is an AI assistant, link to your privacy policy, and offer a way to reach a person. This is good practice and in many places a legal requirement. If you serve visitors in Europe or California, run through the [GDPR checklist for website chatbots](/blog/website-chatbot-gdpr-checklist)."),

      h2("Step 8: Keep it accurate after launch"),
      p("Launch is the beginning. Put a weekly ten-minute review in your calendar. Read the conversations, note every question the assistant could not answer and add the answers to your knowledge base. Update the content whenever prices, hours or policies change. The habit is described in [how to review your chatbot's conversations each week](/blog/audit-website-chatbot-conversations)."),

      h2("Common mistakes to avoid"),
      ul("Pasting the code without loading any content.", "Loading everything, including outdated pages, without reading it.", "Never testing questions the content cannot answer.", "Hiding the option to reach a human.", "Placing the chat where it covers important buttons on mobile.", "Forgetting to update the content after a price change.", "Judging success by chat volume instead of bookings and leads."),

      h2("Bubble, full page or inline: choose how visitors meet the chat"),
      p("Most chatbots offer three ways to show up, and the right choice depends on the job."),
      table(["Format", "What it is", "Best for"], ["Floating bubble", "A small button in the corner that opens a chat window", "General questions on any page; the default for most sites"], ["Inline embed", "The chat sits inside a page, such as a contact or booking page", "Pages where the chat is the main action"], ["Full-page hosted chat", "A standalone page on the vendor's domain or yours", "Links from social media, email signatures and QR codes"]),
      p("A bubble is the easiest to start with. Once it works, add a full-page link to your Instagram bio, email signature and Google Business Profile, so visitors from those places land straight in the conversation. Crescelo offers the floating bubble, an inline frame and hosted business pages, described on the [website widget page](/product/website-widget)."),

      h2("What it costs to add a chatbot"),
      p("The install itself is free. What you pay for is the product. Expect a monthly subscription that scales with the number of conversations, the number of assistants and the amount of content you store. On top of that comes the AI usage, either bundled or billed to you directly. As a reference point, Crescelo's Starter plan is $49 a month for one assistant and 100 chat sessions, and the Growth plan at $149 adds appointment booking and calendar sync. Check the [pricing page](/pricing) for current numbers. A useful way to judge value is to compare the monthly cost with the value of one extra booking per month; our [ROI calculation](/blog/ai-website-assistant-roi-calculator) shows how."),

      h2("What to measure in the first 30 days"),
      ul("**Conversations started** and how many reached a useful answer.", "**Bookings and leads** created from the chat.", "**Unanswered questions**, which tell you what your content is missing.", "**Handover requests**, which show where a person is needed.", "**Drop-off**, meaning where visitors stop replying. Our [guide to tracking in-chat funnel drop-off](/blog/tracking-in-chat-funnel-drop-off) explains the stages."),
      p("Do not judge the first week on volume. A quiet chat that converts is better than a busy one that does not. After a month you will have enough conversations to see patterns, and the biggest improvements usually come from adding ten missing answers to the knowledge base."),

      h2("Security and access basics"),
      ul("Keep your API keys private and store them only in the product's settings, never in page code.", "Give team members their own logins and turn on two-factor authentication for the account that controls the assistant.", "Restrict which domains the widget is allowed to load on, if your product offers it.", "Ask the vendor how conversations are stored, how long they are kept and how to delete them."),
      p("For more on protecting the account, see [setting up team access and two-factor authentication](/blog/setup-rbac-2fa-team-security)."),

      h2("Accessibility and inclusion"),
      p("A chat window is part of your website, so it should work for people who use a keyboard, a screen reader or magnification. Check that the chat can be opened and closed with the keyboard, that messages are announced to screen readers, that text has enough contrast and that nothing depends on colour alone. The Web Content Accessibility Guidelines are the standard reference. Our [checklist for accessible chatbots](/blog/accessibility-wcag-compliance-website-chatbots) turns them into practical checks."),

      h2("Frequently asked questions"),
      faq(
        ["How long does it take to add an AI chatbot to a website?", "The installation takes a few minutes. Preparing and testing your content is what takes time, typically an hour or two for a small business."],
        ["Do I need a developer?", "Not for a standard site. You paste one snippet into your site's settings or footer. A developer is only useful for unusual custom setups."],
        ["Will a chatbot slow down my website?", "A well-built widget loads after your page and adds little weight. Check page speed before and after, and choose a product that loads its script asynchronously."],
        ["Can I add a chatbot to WordPress, Wix, Squarespace or Shopify?", "Yes. Each has a place to paste a code snippet. The guides linked above walk through each platform."],
        ["What content should I give the chatbot?", "Your services, prices, policies, opening hours and FAQs, in short clear documents. Remove anything out of date first."],
        ["How do I stop the chatbot giving wrong answers?", "Ground it in your own content, test it with questions your content does not answer, and review conversations weekly to fix gaps."],
        ["Is a chatbot free?", "Some products have free tiers or trials. Costs usually come from the platform subscription and the AI usage. See the pricing page of any product for current details."],
      ),
      p("When you are ready, try it on your own documents in the [playground](/playground), then [start a free trial](/login?mode=register) to put it on your site."),
    ],
  }),

  pillar({
    slug: 'install-ai-chatbot-wordpress-guide',
    title: 'How to Add an AI Chatbot to WordPress: Plugin and Code Methods',
    description: 'Step-by-step ways to install an AI chatbot on WordPress with a plugin, a theme footer or a child theme, plus caching, speed and troubleshooting tips.',
    primaryKeyword: 'install AI chatbot on WordPress',
    secondaryKeywords: ['WordPress AI chatbot', 'add chatbot to WordPress', 'WordPress chat widget', 'WordPress AI assistant plugin'],
    body: [
      p("WordPress powers a large share of small business websites, and adding an AI chatbot to it is one of the easiest installations you will do. The chatbot itself lives on the vendor's servers. Your site only needs a small snippet that loads it. This guide shows three ways to add that snippet, how to handle caching plugins, how to check the effect on speed and what to do when the chat does not appear."),
      p("If you have not chosen a chatbot yet, start with [how an AI website assistant works](/blog/ai-website-assistant). If you already have the snippet from your dashboard, read on."),

      h2("Before you install: get your embed snippet"),
      p("Every chatbot product gives you a short snippet of code, usually a single `script` tag that looks like a web address wrapped in HTML. In Crescelo you find it on the Overview page under 'Add to website', or under the Deploy button in the top bar. Copy it exactly. Do not edit the assistant ID in it, because that ties the chat to your account and your content."),
      p("Also finish the preparation first: load your services, prices and policies and test the assistant in the testing area. The order matters, because the chat becomes public the moment the snippet goes live. The full preparation list is in our [step-by-step guide to adding an AI chatbot](/blog/add-ai-chatbot-to-your-website)."),

      h2("Method 1: A header and footer plugin (easiest and safest)"),
      p("This is the best method for most people because it survives theme changes and does not touch code files."),
      ol("In WordPress, go to Plugins, then Add New Plugin.", "Search for a plugin that inserts headers and footers, such as one named 'Insert Headers and Footers' or 'WPCode'. Choose a well-maintained one with recent updates and many active installations.", "Install and activate it.", "Open its settings. Find the box labelled 'Scripts in Footer' or add a new footer snippet.", "Paste the snippet from your chatbot dashboard and save.", "Visit your site in a private browser window. The chat bubble should appear within a few seconds."),
      p("Advantages: no theme edits, easy to switch off, works with block themes. Disadvantage: one more plugin to keep updated."),

      h2("Method 2: Paste into the theme footer"),
      p("If you prefer not to add a plugin, place the snippet in your theme's footer file just before the closing body tag."),
      ol("Go to Appearance, then Theme File Editor. On some sites this is disabled for safety; if so, use Method 1 or Method 3.", "Select the file called Theme Footer (footer.php).", "Find the closing `</body>` tag. Paste the snippet on the line above it.", "Click Update File."),
      note("A theme update can overwrite this change. To avoid that, use a child theme (Method 3) or the plugin method. Always take a backup before editing theme files."),

      h2("Method 3: A child theme (best for developers)"),
      p("A child theme keeps your customisations separate from the main theme so updates do not erase them. Add the snippet in the child theme's functions file using the standard hook that prints code in the footer."),
      ul("Create or open your child theme's functions.php.", "Register a function on the wp_footer action that prints the snippet.", "Save and check the front end.", "Optionally, wrap it so it only runs on selected pages, such as your services and contact pages, using WordPress's conditional tags."),
      p("This method gives you the most control, including hiding the chat on checkout, account or landing pages where it would distract from the main call to action."),

      h2("Block themes and the Site Editor"),
      p("Newer 'block themes' do not have a classic footer.php. Use the plugin method, or add a Custom HTML block to the site footer template in the Site Editor. Open Appearance, then Editor, then Patterns or Templates, edit the footer, add a Custom HTML block and paste the snippet. Save and test."),

      h2("Caching, optimisation and security plugins"),
      p("Most WordPress problems with third-party widgets come from a plugin that changes how scripts load."),
      table(["Symptom", "Likely cause", "What to try"], ["Chat not visible after install", "Page cache serving the old page", "Clear the site cache and the CDN cache, then reload in a private window"], ["Chat appears late or flickers", "Script delayed by an optimisation plugin", "Exclude the chat script from 'delay JavaScript' settings, or accept a short delay for speed"], ["Chat blocked with a console error", "Content security policy or firewall rule", "Allow the chatbot's domain for scripts and connections in your security plugin"], ["Chat appears twice", "Snippet added in two places", "Remove one copy from the plugin or theme"], ["Chat hidden behind other elements", "Another fixed element has a higher layer", "Adjust the offset in the widget's position settings"]),

      h2("Check the effect on speed"),
      p("A widget adds some weight, so measure it. Run your key pages through a tool such as PageSpeed Insights before and after installing and compare the main numbers. A well-built widget loads after your page content, so it should not delay what visitors see first. If you see a large drop, exclude the chat from pages where it is not needed or check that the script loads asynchronously. Our note on the [performance of embedded chat widgets](/blog/performance-optimization-embedded-chat-widgets) explains what to look for."),

      h2("WooCommerce and membership sites"),
      p("On shops and membership sites, decide where the chat helps. It is useful on product and pricing pages and on the contact page. It can distract on the checkout page, where you want a visitor to finish paying. Conditional loading in a child theme, or the page targeting feature of a header and footer plugin, lets you show the chat on some pages only."),

      h2("Keeping the assistant accurate as your site changes"),
      p("Your WordPress pages change: prices, hours, offers. The chatbot only knows what you gave it. If your product can read your website address, re-index after big changes. Otherwise re-upload the changed documents. Put a reminder in your calendar to review the assistant's conversations weekly; our guide to [reviewing chatbot conversations](/blog/audit-website-chatbot-conversations) shows what to look for."),

      h2("Troubleshooting checklist"),
      ol("Confirm the snippet is exactly as copied, including the assistant ID.", "Confirm it appears in the page source: view the page source and search for the snippet.", "Clear the site, browser and CDN caches.", "Temporarily disable optimisation plugins to see if one is blocking it.", "Open the browser console (right-click, Inspect, Console) and look for red errors mentioning the chat domain.", "Test in a private window with extensions off. Some ad blockers hide chat widgets.", "Check the assistant is switched on and the domain is allowed in its settings."),

      h2("Using Google Tag Manager instead"),
      p("If you already manage scripts with Google Tag Manager, you can load the chatbot from there. Create a new tag of the 'Custom HTML' type, paste the snippet, set the trigger to 'All Pages' (or to specific pages) and publish the container. This keeps all your third-party scripts in one place and makes it easy to switch the chat on or off without touching WordPress. One caution: if your visitors must consent before third-party scripts run, wire the trigger to your consent tool so the chat only loads after consent where the law requires it."),

      h2("WordPress multisite and staging sites"),
      p("On a multisite network, add the snippet in each subsite, or in a network-wide must-use plugin if every site should show the same assistant. Use a separate assistant for each brand or language site so the knowledge stays clean. On a staging copy of your site, install the snippet only if you want to test; otherwise remove it before pushing to production, or you may count test conversations in your statistics."),

      h2("Cookie banners and consent"),
      p("Many WordPress sites use a consent plugin. A chat widget may store an identifier in the visitor's browser so a conversation continues after a reload. Describe this in your cookie policy and, where the law requires consent for non-essential storage, configure your consent plugin to control the chat script. Vendors differ on whether the identifier is strictly necessary; ask yours, and read the [GDPR checklist for website chatbots](/blog/website-chatbot-gdpr-checklist) before you go live in Europe."),

      h2("Rolling back safely"),
      p("If anything goes wrong, undoing the change should take seconds. With the plugin method, empty the footer box and save. With a theme edit, remove the line you pasted. With Tag Manager, pause the tag. Because the chatbot lives on the vendor's servers, removing the snippet removes it from the site instantly, and your assistant, content and conversations remain safe in your dashboard."),

      h2("Tips for shops, bookings and lead-generation sites"),
      ul("**Service businesses:** show the chat on the services, pricing and contact pages, and connect booking so visitors can reserve a time inside it.", "**Shops:** use it for delivery, returns and product questions, and hide it on the checkout page.", "**Lead-generation sites:** enable lead capture so every enquiry arrives by email with the conversation attached.", "**Membership and course sites:** load your course outline and FAQ into the knowledge base to answer 'what is included' questions."),
      p("The [lead capture feature](/product/lead-capture) and [appointment booking feature](/product/appointment-booking) pages explain how each works."),

      h2("Frequently asked questions"),
      faq(
        ["What is the easiest way to add a chatbot to WordPress?", "Use a header and footer plugin and paste your chatbot's snippet into the footer box. It does not touch theme files and survives theme updates."],
        ["Do I need a special WordPress chatbot plugin?", "Not necessarily. Many chatbot products give you a snippet that works on any site, so a general footer plugin is enough. Some vendors also provide their own plugin."],
        ["Will a chatbot slow down my WordPress site?", "It can add some weight. A widget that loads after your content has little effect on what visitors see first. Measure with a speed testing tool before and after."],
        ["Why can I not see the chat after installing?", "Most often the page cache is serving the old version, or an optimisation plugin is delaying or blocking the script. Clear caches and check the plugin settings."],
        ["Can I show the chat on some pages only?", "Yes. Use a child theme with conditional tags, or the page targeting options in a header and footer plugin."],
        ["Does it work with page builders like Elementor?", "Yes. Use the footer plugin method, or add an HTML widget to a global footer template in the builder."],
      ),
      p("Once your snippet is live, test a full booking or lead in your own site. If you need help, the [help centre](/support) and [support tickets](/support/contact) are there. New to this? [Start a free trial](/login?mode=register) and use the [playground](/playground) to rehearse first."),
    ],
  }),

  pillar({
    slug: 'embed-ai-chatbot-webflow-squarespace-wix',
    title: 'Embed an AI Chatbot in Webflow, Squarespace and Wix: Step-by-Step',
    description: 'Exact steps to add an AI chat widget to Webflow, Squarespace and Wix, with notes on plans, custom code limits, page targeting and troubleshooting.',
    primaryKeyword: 'embed AI chatbot Webflow Squarespace Wix',
    secondaryKeywords: ['add chatbot to Squarespace', 'add chatbot to Wix', 'add chatbot to Webflow', 'custom code website builder chatbot'],
    body: [
      p("Website builders such as Webflow, Squarespace and Wix make it easy to run a site without writing code, but they handle third-party scripts in slightly different ways. Adding an AI chatbot means pasting one snippet into the right box, and the right box is named differently on each platform. This guide gives the exact steps for each of the three, tells you which plan you need where it matters and lists the problems people hit most often."),
      p("If you are still choosing a product, read [what an AI website assistant does](/blog/ai-website-assistant). If you have your snippet already, pick your platform below. The general preparation, meaning content, testing and honesty about AI, is covered in our [complete guide to adding a chatbot](/blog/add-ai-chatbot-to-your-website)."),

      h2("What you are pasting and why it works on any builder"),
      p("A chatbot widget is loaded from the vendor's server by a short piece of code. You paste that code into a place on your site that runs on every page, and the builder outputs it in your pages. Your builder does not need to know anything about chatbots. The same snippet works everywhere; only the place you paste it changes. Copy your snippet from your chatbot dashboard (in Crescelo: Overview, then Add to website) and keep it exactly as it is."),

      h2("Webflow: add the chat with custom code"),
      p("Webflow lets you add code site-wide or on a single page. Custom code in site settings requires a paid Site plan, which most live sites already have; you can test on the free staging domain with the site-level code."),
      h3("Site-wide installation"),
      ol("Open your project and go to Site settings.", "Choose the Custom code tab.", "Scroll to the box named 'Footer code' (before the closing body tag).", "Paste the snippet and click Save changes.", "Publish the site to your domain. The change does not appear until you publish."),
      h3("A single page only"),
      ol("Open the page in the Designer and go to Page settings (the gear icon in the Pages panel).", "Scroll to 'Custom code' and paste the snippet in the 'Before </body> tag' box.", "Save and publish."),
      p("Tip: Webflow does not run custom code in the Designer preview. Test on the published site, not in the editor."),

      h2("Squarespace: code injection"),
      p("Squarespace uses 'Code Injection'. On many plans (Business and above, and current Commerce plans) custom code is available; check your plan if you do not see the option, as availability has changed between plan versions."),
      ol("From the site dashboard open Website, then Pages, then Custom code (some versions: Settings, Advanced, Code Injection).", "Find the 'Footer' box.", "Paste the snippet.", "Click Save. Visit the live site in a private window."),
      p("For a single page, open the page's settings, choose Advanced, and paste the snippet into 'Page Header Code Injection'. Squarespace 7.0 and 7.1 differ slightly in menu names, so look for words like 'Code Injection' or 'Advanced' if your menu differs."),
      note("Squarespace does not show injected code while you are logged in and editing. Log out or use a private window to see the chat."),

      h2("Wix: custom code in settings"),
      p("Wix has a 'Custom Code' tool in the site settings. It requires a Premium plan with a connected domain for some code types; check your plan if the option is unavailable."),
      ol("From your Wix dashboard, open Settings.", "Under Advanced, choose Custom Code.", "Click 'Add Custom Code' at the top right.", "Paste the snippet into the code box.", "Give it a name such as 'Chatbot'.", "Under 'Add Code to Pages' choose 'All pages' (or select specific pages).", "Under 'Place Code in', select 'Body - end'.", "Click Apply, then publish the site."),
      p("On the Wix Editor you can also add an 'Embed a site' or 'HTML iframe' element, but the Custom Code method is better for a floating chat bubble because it appears on every page without adding an element to each."),

      h2("Which pages should show the chat?"),
      p("A chat that appears everywhere is not always the best design. Think about what each page is for."),
      table(["Page", "Show chat?", "Why"], ["Home", "Yes", "First questions and quick routes to booking"], ["Services and pricing", "Yes", "Where price and fit questions happen"], ["Contact and booking", "Yes", "Answers last doubts before someone submits"], ["Blog articles", "Yes, if relevant", "Turns readers with questions into leads"], ["Checkout or payment", "Usually no", "Avoid distractions from completing payment"], ["Legal pages", "Optional", "Not a conversion page"]),
      p("Page-level installation on each builder is described above. A simpler route is to install everywhere and use the widget's settings to hide it on chosen addresses, if your product supports that."),

      h2("Testing after you publish"),
      ol("Open your live domain in a private or incognito window. Builders often hide custom code in edit mode.", "Wait a few seconds for the chat bubble to appear.", "Open the chat and ask two questions. Ask one that is not in your content and check the assistant says it does not know.", "Run a test booking and lead and confirm that the emails and your dashboard show them.", "Open the site on a phone and check the chat fits the screen.", "Test on a slow connection if you can; the chat should not delay the page. See our piece on the [performance of embedded chat widgets](/blog/performance-optimization-embedded-chat-widgets)."),

      h2("Troubleshooting"),
      table(["Problem", "Cause", "Fix"], ["Chat not showing", "Not published, or viewing in edit mode", "Publish and view in a private window"], ["Option for custom code missing", "Plan does not include it", "Check your plan or upgrade, or use a plan-level embed option"], ["Chat shows on some pages only", "Code added per page", "Move it to site-wide footer code"], ["Two chat bubbles", "Snippet pasted twice", "Delete the duplicate"], ["Chat covers a cookie banner or button", "Both fixed at the bottom", "Move the widget to the other side or raise its offset"], ["Console error about blocked script", "Content security setting or extension", "Allow the vendor domain or test without extensions"]),

      h2("Colours, name and greeting"),
      p("Set the widget to match your brand before you publish: colour, name, avatar and a specific greeting. Builders let you choose your own fonts and colours, so a widget that clashes is noticeable. A short greeting that states the job ('Ask about our services or book a time') works better than a generic one. Refine over time using what visitors actually type."),

      h2("Keep the content in step with your site"),
      p("Builders make it easy to change a price on a page and forget the chatbot. Whenever you edit prices, hours or policies, update the assistant's knowledge as well. If your chatbot reads your website address, re-index after edits. Review conversations weekly, as described in [reviewing your chatbot's conversations](/blog/audit-website-chatbot-conversations)."),

      h2("Custom domains, HTTPS and mixed content"),
      p("The chat script should always load over a secure connection. Modern builders serve your site over HTTPS by default, and reputable chatbot vendors serve their scripts the same way, so no action is needed. If you see a warning about mixed content, the snippet probably contains an address starting with http instead of https. Copy a fresh snippet from your dashboard rather than retyping it."),

      h2("Using Google Tag Manager on a site builder"),
      p("All three builders support Google Tag Manager. If you already use it, you can add the chatbot there as a Custom HTML tag with an 'All Pages' trigger. This gives you one place to add and remove scripts, and lets you connect the chat to your consent tool. If you do not use Tag Manager today, the platform's custom-code box is simpler and just as reliable."),

      h2("Cookie consent and analytics on builders"),
      p("Each builder has its own cookie banner tool. Widget storage and analytics scripts may need consent in some regions. Configure the banner to list the chatbot under the right category, and ask your vendor what is stored in the browser. Our [GDPR checklist for website chatbots](/blog/website-chatbot-gdpr-checklist) covers the questions to ask."),

      h2("Shopify, Framer, Carrd and others"),
      p("The same idea applies everywhere: find the site-wide footer code area and paste the snippet. In Shopify, edit the theme's main layout file and add it before the closing body tag. In Framer, use the site settings' custom code area for the end of the body. In Carrd, use an Embed element set to 'Code' with the placement at the end of the body. If a platform has no code area at all, it may not support third-party widgets; check before you choose a chatbot."),

      h2("A five-minute go-live checklist for builders"),
      ol("Snippet copied fresh from the dashboard.", "Pasted in the footer or 'end of body' box, once.", "Site published, not just saved.", "Live site opened in a private window, chat visible.", "One real question, one unanswerable question, one booking, one handover tested.", "Phone view checked.", "Cookie and privacy notices updated to mention the chat."),
      p("If you would like to try the assistant before touching your site, the [playground](/playground) lets you upload documents and chat with no account. The [help centre](/support) has product-specific guides."),

      h2("Frequently asked questions"),
      faq(
        ["Can I add a chatbot to Wix without coding?", "Yes. Use Settings, Advanced, Custom Code, paste the snippet, choose 'Body - end' and apply it to all pages. It needs a plan that allows custom code."],
        ["Where do I paste the chatbot code in Squarespace?", "Open Code Injection in the site settings and paste it into the Footer box. Log out or use a private window to see it, because injected code is hidden in edit mode."],
        ["Does Webflow allow chatbot scripts?", "Yes. Add the snippet in Site settings, Custom code, Footer code, then publish. It will not run in the Designer preview."],
        ["Why does my chatbot not show up after I pasted the code?", "Usually because the site was not published, or you are viewing the editor. Publish and check the live domain in a private window."],
        ["Does a chatbot hurt my SEO or speed?", "A well-built widget loads after your content, so its effect is small. Measure page speed before and after and check the widget loads asynchronously."],
        ["Can I show the chatbot on only some pages?", "Yes. Each builder lets you add code to a single page, or you can install it site-wide and hide it in the widget settings if supported."],
      ),
      p("You can rehearse everything first in the [Crescelo playground](/playground) with no sign-up, then [start a free trial](/login?mode=register) to put the assistant on your site. The [website widget page](/product/website-widget) lists what you can customise."),
    ],
  }),

  pillar({
    slug: 'rule-based-vs-ai-chatbots',
    title: 'Rule-Based Chatbots vs AI Assistants: Differences, Costs and How to Choose',
    description: 'Decision-tree bots and AI assistants solve different problems. Compare how each handles questions, upkeep, cost, risk and bookings, and which one suits your website.',
    primaryKeyword: 'rule-based chatbot vs AI chatbot',
    secondaryKeywords: ['rule based chatbot', 'AI chatbot vs traditional chatbot', 'decision tree chatbot', 'AI assistant vs chatbot'],
    body: [
      p("The word chatbot covers two quite different things. A rule-based bot follows a script you draw: if the visitor clicks A, show B. An AI assistant reads what the visitor typed and writes a reply from your content. They look similar in a chat window and behave very differently once real customers start using them. Choosing the wrong one is a common and expensive mistake, either because a rigid script frustrates visitors or because an ungrounded AI says things you never approved."),
      p("This guide compares the two on the things that matter to a business: what each can and cannot do, how much work it takes to keep them accurate, the risks, the costs and a practical way to decide. We also cover the hybrid approach that many businesses end up using."),

      h2("The short comparison"),
      table(["", "Rule-based chatbot", "AI assistant"], ["Input", "Buttons and keywords you anticipated", "Free text in the visitor's own words"], ["Answers", "Exactly what you wrote for each branch", "Written fresh each time, from your documents"], ["Handles the unexpected", "Poorly: dead ends and 'I did not understand'", "Well, within what your content covers"], ["Setup work", "Design every branch and every reply", "Provide documents, then test and fix gaps"], ["Upkeep", "Edit the tree when anything changes", "Update the documents; the assistant follows"], ["Predictability", "Very high", "High if grounded, lower if not"], ["Main risk", "Frustrating visitors who go off-script", "Saying something wrong or unapproved"], ["Best for", "A few fixed journeys", "Open questions and varied wording"]),

      h2("How a rule-based chatbot works"),
      p("A rule-based bot, also called a decision-tree or flow bot, is a diagram. Each box is a message, and the arrows are the visitor's choices, usually buttons. Some also match keywords: if the message contains 'price', show the price reply. Everything the bot can say, you wrote in advance. That has real advantages: it cannot invent anything, it is easy to audit, and it is cheap to run because no language model is involved."),
      p("The weakness is that people do not follow your diagram. They write two questions in one message, use words you did not list, misspell, or ask something you never thought of. A tree meets that with a dead end or a loop. Every new question means a new branch, so a bot that started simple grows into a tangle that nobody wants to maintain."),

      h2("How an AI assistant works"),
      p("An AI assistant uses a language model to read the visitor's message and write a reply. To keep it from guessing, good products retrieve relevant passages from your own documents first and instruct the model to answer only from them. That gives you the flexibility of natural language with answers anchored in your content. The mechanics are covered in [what an AI website assistant is](/blog/ai-website-assistant)."),
      p("Its weaknesses are the mirror image. A poorly grounded model can produce confident nonsense, and its wording can change from one visit to the next. Good products reduce both problems with grounding, clear instructions and a handover to a person when it is unsure. See [how to stop a chatbot from making things up](/blog/grounded-ai-chatbot-hallucinations)."),

      h2("Where a rule-based bot is the better tool"),
      ul("You have a small number of fixed journeys: pick a service, pick a day, leave your number.", "The wording must be exactly approved every time, for example in regulated settings.", "Your budget or infrastructure does not allow AI usage costs.", "The bot is a menu rather than a conversation, such as a triage form with buttons."),
      p("In these cases a script is fine and perfectly predictable. It never says something you did not approve."),

      h2("Where an AI assistant earns its place"),
      ul("Visitors ask open questions about services, prices, policies and availability.", "Your questions change often and you do not want to redraw a tree each time.", "You want to capture leads in a natural conversation instead of a rigid form.", "You want booking inside the chat, with the assistant understanding requests like 'sometime after school on Thursday'.", "You serve visitors in more than one language."),
      p("Real customers do not follow your tree. An assistant reads the intent and finds the answer in your content, or says it does not know and offers a person."),

      h2("The hybrid approach: guardrails around an assistant"),
      p("The best setups combine both. The AI handles open conversation, while fixed rules handle what must be exact. For example, the assistant answers questions freely from your documents, but a booking always uses a real calendar with slot locking, a lead always goes through defined fields, and certain topics (medical advice, legal advice, refunds) always trigger a handover to a person. This is how Crescelo works: the language is flexible and the actions are deterministic. Read how bookings are protected in [how online booking avoids double bookings](/blog/double-booking-prevention-concurrency-mutex)."),

      h2("Cost comparison"),
      table(["Cost item", "Rule-based", "AI assistant"], ["Software", "Usually low monthly fee or free tier", "Monthly platform fee"], ["Usage", "None", "AI usage per conversation, paid to the provider or bundled"], ["Setup time", "Hours to days designing flows", "Hours collecting and testing content"], ["Ongoing work", "Editing branches", "Reviewing conversations and updating documents"], ["Cost of a wrong answer", "Low: cannot invent", "Higher if ungrounded; low if grounded and monitored"]),
      p("AI usage is typically a small part of the total for a small business, but it scales with volume and with the model you choose. With a bring-your-own-key product you see and control that cost directly. Our [pricing comparison of bring-your-own-key and bundled AI](/blog/byok-vs-bundled-ai-pricing-cost-comparison) works through examples."),

      h2("A decision framework"),
      ol("List the top twenty questions your visitors ask. If most have short fixed answers and a handful of buttons covers them, a rule-based bot may be enough.", "Now list the questions you did not think of. If your team hears surprises weekly, you need free text.", "Decide what must never be improvised. Put those topics behind fixed replies or a handover regardless of the tool.", "Check your appetite for review work. AI assistants need light weekly upkeep; trees need editing when anything changes.", "Test with real questions. Run your own list of questions through a trial of each. The result usually decides it."),

      h2("Migrating from a script to an assistant"),
      p("If you already have a decision-tree bot, you do not need to throw its content away. The text in your branches is already approved wording. Export it into documents (a page per topic), load them into the assistant's knowledge base and keep your fixed flows for the actions that must be exact. Then compare a week of real conversations before switching off the old bot."),

      h2("Three real-world scenarios"),
      h3("A hair salon"),
      p("A salon has forty regular questions: prices for cuts and colour, whether a patch test is needed, parking, deposit rules, whether walk-ins are welcome. A script could cover the prices with buttons, but a customer who writes 'how much for balayage on shoulder-length hair and do you do toner too?' breaks it. An assistant reads the price list and answers in one message, then offers to book. Here the AI wins on flexibility, and the booking calendar stays deterministic."),
      h3("A dental clinic"),
      p("A clinic must be careful with medical advice and privacy. The assistant can explain opening hours, new-patient steps and insurance questions from approved documents, while fixed rules hand over anything that sounds like an emergency or a request for clinical advice. This is a good example of the hybrid model. Our [dental chatbot guide](/blog/ai-patient-scheduling-dental-practices) covers the details."),
      h3("A single-purpose lead form"),
      p("A roofing contractor mainly wants to collect a name, phone number, address and a short description of the problem. A guided flow with a few questions may be enough, and it never gets confused. If visitors often ask 'do you cover my postcode' or 'how much for a small repair', an assistant adds value on top of the form."),

      h2("Common myths"),
      ul("**'AI chatbots always hallucinate.'** Ungrounded ones do. Grounded ones answer from your documents and admit when they cannot.", "**'Rule-based bots are cheaper in every way.'** They are cheaper to run, but design and upkeep time is real, and dead ends cost you visitors.", "**'An AI assistant is set and forget.'** It needs light, regular review, like a page on your website.", "**'Visitors prefer buttons.'** Some do, for simple choices. Many prefer typing a question in their own words, and a good design offers both."),

      h2("Metrics to compare when you test both"),
      table(["Metric", "Why it matters"], ["Answer rate (questions answered without a person)", "Shows how often the bot is actually useful"], ["Dead ends or 'I did not understand' replies", "Reveals frustration in rule-based bots"], ["Bookings and leads per 100 conversations", "The business outcome"], ["Handover requests", "Where visitors want a person"], ["Time to first useful answer", "Speed matters for enquiries"], ["Unanswered questions", "A to-do list for your content"]),

      h2("What to ask a vendor about any chatbot"),
      ol("Can I see exactly what it will say, and where each answer comes from?", "What happens when it does not know?", "Can I take over a conversation?", "How are bookings protected against double booking?", "What does it cost at ten times my current volume?", "Can I export my content and conversations?"),
      p("If you would like to see a grounded assistant behave on your content, try the [playground](/playground). To compare vendors more broadly, read our [website chatbot platform comparison](/blog/website-chatbot-platform-comparison)."),

      h2("Frequently asked questions"),
      faq(
        ["What is the difference between a rule-based chatbot and an AI chatbot?", "A rule-based chatbot follows a script of buttons and keywords you wrote in advance. An AI chatbot reads free text and writes a reply, ideally from your own documents."],
        ["Are rule-based chatbots obsolete?", "No. They are still the right tool for a few fixed journeys and where every word must be pre-approved. Many businesses combine them with AI."],
        ["Can an AI chatbot say things I did not approve?", "It can if it is not grounded. Products that answer only from your documents, admit when they do not know and hand over to a person reduce that risk a lot."],
        ["Which is cheaper?", "Rule-based bots have no AI usage cost, but take design and maintenance time. AI assistants have usage costs but less upkeep. The total depends on volume and how often your content changes."],
        ["Can I use both together?", "Yes, and it is common. Let the AI handle open questions while fixed flows and rules handle bookings, leads and sensitive topics."],
        ["Which is better for appointment booking?", "A hybrid: an assistant that understands how people phrase requests, plus a deterministic booking engine that shows real free slots and prevents double bookings."],
      ),
      p("See the difference on your own content in the [playground](/playground), or read how the [AI assistant feature](/product/ai-assistant) combines flexible answers with fixed actions. When you are ready, [start a free trial](/login?mode=register)."),
    ],
  }),
];
