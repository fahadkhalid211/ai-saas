import { faq, h2, h3, note, ol, p, pillar, table, ul } from '../authoring';

export const PILLAR9 = [
  pillar({
    slug: 'byok-ai-chatbot-guide',
    title: 'Which AI Model Should You Connect to Your Website Chatbot? A BYOK Guide',
    description: 'How to choose an AI provider and model for a bring-your-own-key website chatbot: OpenAI, Claude, Gemini, Groq, DeepSeek or local models, with cost, speed, quality and privacy trade-offs.',
    primaryKeyword: 'which AI model for chatbot',
    secondaryKeywords: ['bring your own key chatbot', 'OpenAI vs Claude vs Gemini for chatbot', 'cheapest AI model for customer service', 'choose LLM provider for chatbot'],
    body: [
      p("With a bring-your-own-key chatbot, you connect your own account at an AI provider and pay them directly for what the assistant uses. That gives you control over cost and quality, and it also hands you a decision the platform would otherwise make for you: which provider and which model? The choices look intimidating, because there are many providers, dozens of models and prices that change every few months. The good news is that a customer-facing assistant that answers from your own documents needs less from the model than most people expect. This guide explains what actually matters, compares the main provider families, shows a simple way to test models on your own questions and gives sensible starting points for a small business."),
      note("Providers change their models, prices and policies often. This guide describes categories and trade-offs and avoids quoting prices or model names as facts. Check each provider's current documentation before you decide."),

      h2("What the model does in a grounded assistant"),
      p("In an assistant that answers from your documents, the search step finds the right passages, and the model's job is to read them and write a clear, faithful reply in the right tone. That is a reading and writing task, not a knowledge task. The model should follow instructions, stay within the passages, admit when they do not contain the answer and write naturally. Very large, expensive models are not required for that, and a smaller model that follows instructions well is often the best value. See [how an AI website assistant works](/blog/ai-website-assistant) for the whole pipeline."),

      h2("Five criteria for choosing"),
      table(["Criterion", "Why it matters", "How to judge"], ["Faithfulness", "Does it stay within the retrieved passages and admit ignorance?", "Test with questions your documents cannot answer"], ["Instruction following", "Does it follow rules about tone, format and what not to say?", "Test with prompts that tempt it to promise discounts"], ["Speed", "Visitors notice delays; streaming replies help", "Time to first word and to complete answer"], ["Cost", "Adds up with volume", "Estimate cost per conversation; see [BYOK pricing](/blog/byok-vs-bundled-ai-pricing-cost-comparison)"], ["Privacy and terms", "Where data goes and whether it is used for training", "Read the provider's API data terms"]),
      p("Multilingual ability is a sixth criterion if you serve several languages; see [multilingual chatbots](/blog/multilingual-ai-website-chatbot)."),

      h2("The main provider families"),
      p("Crescelo supports several providers, and you paste a key for the one you choose. The list below describes what each family is generally known for, without prices."),
      table(["Provider", "Typical strengths", "Consider it when"], ["OpenAI", "Broad range of models from small and cheap to large; widely supported and well documented", "You want a well-known default with many options"], ["Anthropic (Claude)", "Strong at following instructions and staying grounded; careful tone", "You care about faithful, measured answers"], ["Google (Gemini)", "Fast, low-cost models and generous free tiers for testing", "You want speed and low cost"], ["Groq", "Very fast inference of open models", "You want quick replies at low cost"], ["DeepSeek", "Low-cost models with strong performance for the price", "Cost is the priority; check data and location terms"], ["Ollama (self-hosted)", "Runs open models on your own hardware", "You need data to stay on your own machines and can run a server"]),
      p("A free engine is also available in Crescelo to start and test before you connect your own key. See the provider guides for [OpenAI](/support/ai-connectors/openai), [Gemini](/support/ai-connectors/gemini) and [the others](/support/ai-connectors)."),

      h2("Small, medium or large model?"),
      table(["Model size", "Good for", "Watch for"], ["Small and fast", "Price, hours, services and policy questions; simple booking chat", "May struggle with long, multi-part questions"], ["Mid-range", "Most small business assistants; mix of simple and complex questions", "The usual sweet spot"], ["Large or reasoning-heavy", "Complex, multi-document questions; nuanced tone", "Higher cost and slower replies; often unnecessary for FAQ-style questions"]),
      p("Start small, test on your real questions and step up only if needed. Reasoning-style models that think before answering can be slower and more expensive per reply, and are rarely needed for customer questions from a knowledge base."),

      h2("A one-hour test on your own questions"),
      ol("Write 25 questions: fifteen your documents answer, five they do not, three that tempt the assistant to promise something and two in another language if you serve one.", "Connect the first candidate model and run all questions in the Testing Studio.", "Score each answer: correct, partly correct, wrong or honestly unknown.", "Note speed and how natural the tone feels.", "Switch to the next candidate and repeat.", "Estimate the cost per conversation for each from the provider's pricing.", "Choose the cheapest model that scores well on the honest-unknown and no-promise questions."),
      table(["Question type", "What a good answer looks like"], ["Answered by your documents", "Correct and complete, in your tone"], ["Not in your documents", "Says it does not know and offers a route"], ["Tempts a promise", "Declines to promise; explains what it can do"], ["Another language", "Correct and natural"]),
      p("The honest-unknown score matters more than the correct-answer score, because a model that guesses is dangerous however fluent it sounds. See [how to stop a chatbot from making things up](/blog/grounded-ai-chatbot-hallucinations)."),

      h2("Privacy and data handling"),
      ul("Read each provider's terms for API usage: whether prompts and outputs are stored, for how long and whether they are used to train models.", "Check where data is processed if your customers are in regulated regions.", "Prefer providers that offer clear business terms and a data processing agreement.", "For the strictest cases, a self-hosted model keeps data on your own systems, at the cost of running it.", "Tell visitors they are talking to an AI and link to your privacy policy."),
      p("The [GDPR checklist for website chatbots](/blog/website-chatbot-gdpr-checklist) explains what to document when a provider processes personal data for you. This is general information, not legal advice."),

      h2("Keys, limits and safety"),
      ol("Create a dedicated API key for this assistant, so you can revoke it without affecting anything else.", "Set a monthly spending limit or alert at the provider.", "Paste the key only into the assistant's AI settings, where it is stored encrypted. Crescelo stores provider keys with AES-256-GCM encryption.", "Never put a key in your website code or share it in a chat or email.", "Rotate the key if a team member with access leaves."),
      p("See [how a bring-your-own-key vault works](/blog/cryptographic-byok-vault-aes-256-gcm) for what good key storage looks like."),

      h2("When to switch models"),
      ul("Answers are wrong or ignore your documents even after content fixes.", "Replies are too slow for visitors.", "Costs are higher than the value warrants.", "A provider changes prices, terms or retires a model.", "A new model in your test set clearly outperforms the current one."),
      p("Because you own the key, switching is a settings change. Re-run your 25-question test after any switch, and keep the results so you can compare."),

      h2("Fallbacks and reliability"),
      p("Providers have outages and rate limits. A robust assistant handles them gracefully: it retries, falls back to another provider when configured, and never shows a raw error to a visitor. Crescelo's free engine cascades across free providers for testing, and with your own key you should watch your provider's status and limits. For production, consider keeping a second provider account ready. See [fail-closed pipelines and chat reliability](/blog/fail-closed-security-pipelines-chat-reliability)."),

      h2("Sensible starting points"),
      table(["Business", "Starting point"], ["Solo or small service business, English content", "A small or mid-range model from a major provider, tested on your questions"], ["Multilingual business", "A mid-range model with strong multilingual ability; test each language"], ["Cost-sensitive, high volume", "A small fast model, with a mid-range model held in reserve for hard cases"], ["Strict data control", "A provider with clear business terms, or a self-hosted model if you can run it"], ["Just testing", "The free engine, then your own key"]),

      h2("Mistakes to avoid"),
      ul("Choosing the biggest model by default.", "Choosing on price alone without testing honesty.", "Sharing one key across many projects.", "Forgetting spending limits.", "Never retesting after a model or price change.", "Ignoring the provider's data terms."),

      h2("Frequently asked questions"),
      faq(
        ["Which AI model is best for a website chatbot?", "There is no single best. For a grounded assistant, a small or mid-range model that follows instructions and admits ignorance is usually the best value. Test candidates on your own questions."],
        ["Is a more expensive model more accurate?", "Not necessarily for questions answered from your own documents. Faithfulness and instruction following matter more than size."],
        ["Can I change the model later?", "Yes. With your own key, switching is a settings change. Retest after switching."],
        ["Which providers does Crescelo support?", "OpenAI, Anthropic Claude, Google Gemini, Groq, DeepSeek and self-hosted Ollama-style endpoints, plus a free engine for testing."],
        ["How do I keep my API key safe?", "Use a dedicated key, set a spending limit, store it only in the assistant's encrypted settings and rotate it if access changes."],
        ["Is my customers' data used to train models?", "It depends on the provider and your terms. Read the API data policy of the provider you choose."],
      ),
      p("Try the free engine on your own documents in the [playground](/playground), read about the [AI assistant](/product/ai-assistant) and [start a free trial](/login?mode=register) to connect your own key."),
    ],
  }),

  pillar({
    slug: 'essential-chatbot-questions-service-business',
    title: 'The Questions Every Service Business Chatbot Must Answer Well (Test List)',
    description: 'A ready-to-use list of the questions your website chatbot must answer correctly: prices, hours, availability, policies, trust and edge cases, with how to test and fix each.',
    primaryKeyword: 'questions a service business chatbot should answer',
    secondaryKeywords: ['chatbot FAQ for small business', 'chatbot test questions', 'what to ask a chatbot before launch', 'customer questions service business'],
    body: [
      p("Most chatbot launches fail on the questions nobody thought to test. The assistant handles the demo question perfectly, then a real visitor asks 'do you do weekends?', 'can I bring my dog?' or 'is there a cancellation fee?', and the answer is vague, wrong or missing. The fix is not more technology; it is a better list. This guide gives you a ready-made list of the questions a service business chatbot must answer well, grouped by what the visitor is trying to do, with notes on what a good answer contains, how to test each and how to fix failures. Copy the list, adapt it to your business and use it before launch and every time you change your content."),

      h2("How to use this list"),
      ol("Copy the questions relevant to your business into a spreadsheet.", "For each, write the correct answer in your own words, from your documents.", "Ask the assistant in the Testing Studio, in your own wording and with typos.", "Score: correct, partly correct, wrong, or honestly unknown.", "Fix every failure by improving the source content, then retest.", "Rerun the whole list after any change to prices, policies or hours."),
      p("A list of forty questions takes about half an hour to run and is the most valuable half hour in a chatbot launch."),

      h2("1. Basics: who, what, where"),
      table(["Question", "A good answer contains"], ["What do you do?", "One plain sentence, and the main services"], ["Where are you located?", "Address, area covered, parking or transport"], ["What are your opening hours?", "Days and times, holidays, and how to reach you outside hours"], ["Do you serve my area?", "The area you cover, and a way to check"], ["How long have you been open?", "Only what you have published; otherwise says it does not know"]),

      h2("2. Prices and costs"),
      table(["Question", "A good answer contains"], ["How much is [main service]?", "Price or range, and what is included"], ["Are there extra charges?", "The extras you publish, or says it does not know"], ["Do you offer discounts, packages or memberships?", "Only what exists; never invents a discount"], ["Do you give free quotes or consultations?", "Whether and how"], ["What is your call-out or minimum fee?", "The figure, if published"], ["What payment methods do you accept?", "The accepted methods"]),
      p("Prices are where wrong answers cost the most, so test them first and most often. See [overcoming price resistance in website chat](/blog/overcoming-price-resistance-website-chat)."),

      h2("3. Availability and booking"),
      table(["Question", "A good answer contains"], ["Do you have anything this week or tomorrow?", "Real available times, or a route to see them"], ["Can I book for Saturday morning?", "Available slots or the nearest alternative"], ["How do I book?", "The steps, and an offer to book now"], ["Can I book for someone else or a group?", "What is possible, or a handover"], ["Do you take walk-ins?", "Your walk-in policy"], ["Can I book outside your opening hours?", "Explains the hours and offers the nearest slot"]),

      h2("4. Changes, cancellations and refunds"),
      table(["Question", "A good answer contains"], ["Can I cancel or change my appointment?", "How, and until when it is free"], ["What is your cancellation fee?", "The fee, or that there is none"], ["What if I am late?", "Your lateness policy"], ["Do you give refunds?", "Your refund policy in plain words"], ["Do I need to pay a deposit?", "Whether, how much and when it is refunded"]),

      h2("5. The service itself"),
      table(["Question", "A good answer contains"], ["How long does [service] take?", "Duration"], ["What should I bring or do beforehand?", "Preparation steps"], ["Is [service] suitable for [child, pregnancy, condition]?", "Only what you can safely say; otherwise a handover"], ["Who will I see?", "Staff information you publish"], ["What are the results or what should I expect?", "Realistic expectations, no guarantees"], ["Do you offer [service you do not offer]?", "Says you do not, and suggests what you do offer"]),

      h2("6. Trust and credentials"),
      table(["Question", "A good answer contains"], ["Are you licensed and insured?", "Only what you can truthfully state"], ["Do you have reviews?", "Where to find them, without inventing quotes"], ["Is my information safe?", "A link to your privacy policy and how data is handled"], ["Am I talking to a person?", "Says it is an AI assistant, and how to reach a person"]),
      p("See [AI transparency and disclosure](/blog/ai-transparency-disclosure-building-trust) for wording that builds trust."),

      h2("7. Awkward and edge cases"),
      table(["Question or message", "A good answer"], ["A question your documents do not cover", "Says it does not know and offers a person or form"], ["A request for a discount or price match", "Declines politely; states what you can offer"], ["A demand for a guarantee", "Does not promise; explains what you can commit to"], ["A complaint or angry message", "Empathetic, brief, hands over to a person"], ["Something urgent or an emergency", "Approved safety wording and an immediate alert to your team"], ["Medical, legal or financial advice", "Declines to advise; offers a consultation"], ["An off-topic question", "Brief, polite, back to your services"], ["A message with typos or slang", "Understands and answers"], ["A question in another language", "Answers in that language if you support it, or explains what you support"], ["A request to speak to a person", "Confirms and notifies your team"]),

      h2("How to score and record results"),
      table(["Score", "Meaning", "Action"], ["Correct", "Right, complete, in your tone", "None"], ["Partly correct", "Right but missing a key detail", "Improve the document that holds the detail"], ["Wrong", "Contradicts your documents", "Find the source; fix or remove conflicting text"], ["Honestly unknown", "Says it does not know", "If the information should exist, add it; if not, accept"], ["Invented", "Confident but not in your documents", "Serious: tighten instructions and retest; see [preventing hallucinations](/blog/grounded-ai-chatbot-hallucinations)"]),
      p("Keep a dated copy of results so you can see progress and catch regressions after edits."),

      h2("Fixing failures at the source"),
      ul("**Missing answer:** write the answer in a short, clearly titled document.", "**Wrong answer:** find the passage it used; correct or delete it. Look for older documents that conflict.", "**Vague answer:** add specifics, such as prices, durations and conditions.", "**Answer buried in a long document:** split it into a focused page.", "**Wrong tone:** add a few example replies to the instructions."),
      p("Avoid piling rules onto the assistant to fix content problems. Clean sources beat long instructions. See [preparing your service menu and pricing documents](/blog/prepare-service-menu-pricing-docs-rag)."),

      h2("Turn real conversations into new test questions"),
      p("After launch, your visitors write the best test questions. Each week, copy the questions the assistant could not answer or answered badly into your list. The list grows to reflect real behaviour, and your assistant improves in the places customers actually look. See [how to review your chatbot's conversations each week](/blog/audit-website-chatbot-conversations)."),

      h2("A starter list by business type"),
      table(["Business", "Add these questions"], ["Salon or barbershop", "Do I need a patch test? Do you cut curly hair? Can I bring my child?"], ["Clinic or dental", "Do you take new patients? Which insurance? What if I have pain now?"], ["Home services", "Do you do emergency callouts? Are you insured? Can you send photos of past work?"], ["Real estate", "Is the property still available? Can I view it this week?"], ["Professional services", "How do you charge? Is the first call free? What should I prepare?"], ["Fitness studio", "Can I try a class? What is the cancellation policy for classes?"]),

      h2("A worked example: fixing one failed question"),
      p("A salon tests 'Do you do patch tests?' and the assistant answers 'I do not have that information.' The salon's documents mention patch tests only inside a long PDF about colour aftercare. The fix is not to change the assistant's settings but to add a short page titled 'Do I need a patch test before colour?' with the answer: yes, at least 48 hours before, free of charge, booked as a 10-minute visit. The salon retests three ways of asking the same question, including one with a typo, and all three now succeed. Repeating this for each failure is how a launch list turns into a reliable assistant."),

      h2("Questions your team should add"),
      p("Ask each person who talks to customers to add the five questions they dread most. Front desk staff know which questions cause confusion, technicians know which technical questions come up and the owner knows the awkward ones about pricing and complaints. Adding their questions makes the list truer to your business than any generic template, and it involves the team in making the assistant good."),

      h2("Frequently asked questions"),
      faq(
        ["How many test questions do I need?", "Twenty to forty covers most service businesses. Start with the ten your team hears most and add the awkward cases."],
        ["What if the assistant fails a question?", "Fix the source content first, then retest. Only change the instructions if the content is right and the behaviour is wrong."],
        ["How often should I rerun the list?", "Before launch, after any change to prices or policies and monthly."],
        ["What is the most important thing to test?", "That the assistant says it does not know, and does not invent, when your documents do not cover the question."],
        ["Should the chatbot answer off-topic questions?", "Briefly and politely, then return to your services. You can configure this in the instructions."],
        ["Can I use real customer questions?", "Yes. Real questions from email, calls and chat make the best test list."],
      ),
      p("Run your list in the [playground](/playground) with your own documents, and see [how the AI assistant](/product/ai-assistant) answers from your content. When you are ready, [start a free trial](/login?mode=register)."),
    ],
  }),

  pillar({
    slug: 'audit-website-chatbot-conversations',
    title: 'How to Review Your Chatbot Conversations Each Week (A 15-Minute Routine)',
    description: 'A weekly routine for auditing website chatbot conversations: what to read, what to score, how to fix wrong answers, spot missing content and turn chats into leads and improvements.',
    primaryKeyword: 'audit chatbot conversations',
    secondaryKeywords: ['review chatbot transcripts', 'improve chatbot answers', 'chatbot quality assurance', 'chatbot analytics review'],
    body: [
      p("A chatbot is not a machine you install and forget. It is more like a new team member: capable, fast, occasionally wrong, and much better after someone checks its work. The single habit that separates assistants that keep improving from those that quietly go stale is a short weekly review of real conversations. Fifteen minutes a week is enough for a small business. This guide gives you the routine: what to read, what to look for, how to score conversations, how to turn findings into fixes, and how to turn the same conversations into leads and content ideas."),

      h2("Why weekly review matters"),
      ul("**Visitors ask things you did not expect.** Only real conversations show you.", "**Content goes out of date.** Prices and policies change; the assistant does not know unless you tell it.", "**Mistakes hide.** A wrong answer given to one visitor is invisible until you look.", "**Leads slip through.** Interested visitors sometimes leave details that nobody follows up.", "**Your website has gaps.** Repeated questions show what your pages fail to explain."),
      p("A reviewed assistant becomes more accurate each week. An unreviewed one becomes less accurate as your business changes."),

      h2("The 15-minute routine"),
      table(["Minutes", "Step", "What to do"], ["0 to 3", "Scan the numbers", "How many conversations, bookings, leads and handover requests this week"], ["3 to 8", "Read the flagged conversations", "Unanswered questions, handovers, long conversations and any without a booking or lead"], ["8 to 11", "Spot check five random conversations", "Read start to finish for tone and accuracy"], ["11 to 14", "Fix", "Correct wrong content and add missing answers"], ["14 to 15", "Note", "Write one line: what changed and what to watch next week"]),
      p("Do it at the same time each week, ideally Monday morning, and put it in your calendar. In Crescelo, conversations are in Chat History and the numbers in Analytics."),

      h2("What to look for"),
      h3("Wrong answers"),
      p("Compare each answer with your documents. If it is wrong, find why: was the source outdated, did two documents conflict, or did the assistant ignore a correct passage? The cause tells you the fix."),
      h3("Questions it could not answer"),
      p("These are your content gaps. If the information should exist, write it down and add it. If it should not be shared (for example a private policy), make sure the assistant hands over politely."),
      h3("Handover requests"),
      p("Every time a visitor asks for a person, ask two things: was the request reasonable, and could the assistant have helped first? Repeated handovers on the same topic mean the assistant needs better content there."),
      h3("Abandoned conversations"),
      p("Where did visitors stop replying? A visitor who leaves after a price answer may be telling you the price was unexpected or unclear. See [tracking in-chat funnel drop-off](/blog/tracking-in-chat-funnel-drop-off)."),
      h3("Leads and bookings that went nowhere"),
      p("Check that each lead reached you and was followed up, and that each booking appears in your calendar and confirmations were sent."),
      h3("Tone"),
      p("Read a few replies aloud. If a human receptionist would not say it, adjust the instructions or add example replies."),

      h2("A simple scoring sheet"),
      table(["Conversation", "Accuracy (0-2)", "Helpfulness (0-2)", "Tone (0-2)", "Outcome", "Action"], ["Example: price question", "2", "2", "2", "Booked", "None"], ["Example: parking question", "0", "0", "1", "Left", "Add parking information"]),
      p("Score a sample of ten conversations for the first month, then five a week. Look at the totals over time. A rising average shows the review is working."),

      h2("Turn findings into fixes"),
      table(["Finding", "Fix"], ["Wrong price", "Correct the price in the source document; remove old copies"], ["Missing answer", "Write a short document titled with the question"], ["Answer too vague", "Add specifics: figures, steps, conditions"], ["Contradiction", "Delete or reconcile the conflicting documents"], ["Repeated handover on one topic", "Add content or a clearer rule for that topic"], ["Tone problem", "Add three example replies in the right voice"]),
      p("Retest the fixed question in the Testing Studio to confirm the change worked. See [the questions every service business chatbot should answer well](/blog/essential-chatbot-questions-service-business) for a test list."),

      h2("Use conversations to improve your website and marketing"),
      ul("The most common questions belong on your pricing and FAQ pages.", "The words visitors use are the words to use in your copy.", "The objections they raise are what your pages should address.", "The pages where chats start show where visitors hesitate.", "Interest in a service you barely promote is a signal."),
      p("Many owners find the review teaches them more about their customers than analytics does. See [unanswered chat questions as knowledge gaps](/blog/unanswered-chat-questions-knowledge-gaps) and [unanswered questions as lead opportunities](/blog/unanswered-chat-questions-lead-opportunities)."),

      h2("Privacy in your review"),
      ul("Limit who can read conversations to people who need to.", "Do not copy transcripts into unsecured places.", "Delete transcripts you no longer need, according to your retention policy.", "Do not use personal details from chats for marketing without a lawful basis and consent."),
      p("See the [GDPR checklist for website chatbots](/blog/website-chatbot-gdpr-checklist). This is general information, not legal advice."),

      h2("Team review versus solo review"),
      p("In a team, share the load: one person reads, another fixes content, and a third checks bookings. Rotate the reader so different eyes catch different problems. Keep a shared log of changes so you know what was fixed and why. For a solo owner, keep the routine short and consistent rather than long and occasional."),

      h2("Signals that need action right away"),
      ul("A wrong price or policy stated to a customer: fix at once and consider contacting them.", "An emergency message that was not handed over: review your emergency rules today.", "A complaint that received a generic reply: follow up personally.", "A lead with no follow-up: reply now.", "A sudden rise in unanswered questions: a document may have been removed or a page changed."),

      h2("A sample week, step by step"),
      p("Here is what a Monday review might look like for a small clinic with 60 conversations last week."),
      table(["Finding", "Detail", "Fix"], ["Three visitors asked about parking", "The assistant said it did not know", "Added a short parking page"], ["One visitor was quoted last year's price for a check-up", "An old price list was still uploaded", "Deleted the old file and re-tested"], ["Two visitors asked for a person about insurance", "Reasonable; the assistant lacked detail", "Wrote an insurance FAQ with the accepted providers"], ["A lead left a phone number at 9 p.m.", "Nobody had called back", "Called the visitor first thing; set a morning routine for overnight leads"], ["One reply sounded curt", "Tone of the refund answer", "Added three example replies in a friendlier voice"]),
      p("The whole review took fifteen minutes and made five improvements. Do this consistently and the assistant becomes better at the things your customers actually ask, rather than the things you guessed they would."),

      h2("Metrics worth tracking across weeks"),
      table(["Metric", "Direction you want"], ["Conversations", "Growing if traffic grows"], ["Conversations that reach a booking or lead", "Rising"], ["Unanswered questions", "Falling as you add content"], ["Handover requests", "Stable or falling, with the right ones staying"], ["Wrong answers found in review", "Falling"], ["Time to fix a wrong answer", "Under a day"]),
      p("Chart them on a simple sheet. Trends matter more than any single week."),

      h2("What not to do in a review"),
      ul("Do not read every conversation when volume is high; sample.", "Do not blame the model before checking the content.", "Do not change many things at once, or you will not know what worked.", "Do not forget to retest after a fix.", "Do not skip a week because things seemed fine; that is when drift starts."),

      h2("Setting up the habit"),
      p("The routine only works if it survives busy weeks. Put a recurring fifteen-minute block in your calendar with a title that says exactly what to do, such as 'Read chatbot chats, fix three things'. Keep a running note of fixes so you can see the trend. If you miss a week, do a short version rather than skipping: read only the unanswered questions and handovers. Ask a colleague to cover when you are away, so the habit does not depend on one person, and celebrate small wins, such as the week the number of unanswered questions halves."),

      h2("Frequently asked questions"),
      faq(
        ["How often should I review chatbot conversations?", "Weekly for the first month at least, then weekly or fortnightly. Fifteen minutes is enough for most small businesses."],
        ["How many conversations should I read?", "Read all flagged ones (unanswered, handovers, abandoned) and spot check five others. For high volume, sample."],
        ["What is the most important thing to fix first?", "Wrong prices and policies, because they cost you money and trust."],
        ["How do I find what the assistant could not answer?", "Look for replies where it said it did not know, and for handover requests. These are your content gaps."],
        ["Do I need special tools?", "Not to start. Chat History and a simple spreadsheet are enough."],
        ["Should I tell customers I review conversations?", "Yes, in your privacy notice: say that conversations are stored and used to answer and improve the service."],
      ),
      p("Start your routine by testing in the [playground](/playground), see how the [AI assistant](/product/ai-assistant) works, and [start a free trial](/login?mode=register) when you want it on your site."),
    ],
  }),

  pillar({
    slug: 'ai-lead-qualification-framework',
    title: 'AI Lead Qualification Framework: Score and Route Chat Leads Without Interrogating Visitors',
    description: 'A practical framework to qualify leads in a website chat: what signals to capture, how to score hot, warm and cold leads, how to route them and how to keep the chat friendly.',
    primaryKeyword: 'lead qualification chatbot',
    secondaryKeywords: ['qualify leads with AI', 'lead scoring for service businesses', 'BANT chatbot', 'chatbot lead routing'],
    body: [
      p("Not every enquiry deserves the same response. A visitor who wants a quote for a job this week is worth a phone call in minutes. Someone browsing prices for next year is worth an email. Someone outside your area is worth a polite reply and nothing more. Qualification is the practice of telling these apart, and doing it in a chat means asking the right questions without making the visitor feel interrogated. This guide gives you a simple framework for qualifying leads in a website chat: what to learn, how to learn it naturally, how to score and route leads, and how to check that your scoring reflects reality."),

      h2("What qualification is for"),
      p("Qualification serves two goals. For the business, it decides who gets attention first and how. For the visitor, it gets them to the right next step faster. Done well it feels like good service; done badly it feels like a form disguised as a chat. The framework below is about learning what you need with as few questions as possible."),

      h2("The four things worth knowing"),
      table(["Dimension", "Question it answers", "Example signals"], ["Need", "What do they want?", "Service asked about, description of the problem"], ["Fit", "Can we serve them?", "Location in your area, service you offer, price range acceptable"], ["Timing", "When do they want it?", "'This week', 'ASAP', 'sometime next year'"], ["Ability and authority", "Can they decide and pay?", "Owner or tenant, budget mentioned, decision maker"]),
      p("This resembles the classic BANT model (budget, authority, need, timeline) adapted to service businesses. You rarely need all four, and asking about budget directly often feels rude. Infer where you can."),

      h2("Signals you can read without asking"),
      ul("**What they asked about:** a specific service and price is stronger than a general question.", "**Whether they asked about availability or how to book:** strong intent.", "**How specific the request is:** a detailed job description beats 'do you do roofs?'.", "**Whether they gave contact details unprompted.**", "**The page they started on:** a pricing page is warmer than a blog article.", "**How many questions they asked:** several signals real evaluation.", "**Whether they mention a deadline or an emergency.**"),
      p("See [lead scoring from chat behaviour](/blog/chat-behavior-lead-scoring) for how these signals combine."),

      h2("A simple scoring model"),
      p("Use a small scale you can act on. Points make it explicit."),
      table(["Signal", "Points"], ["Asked about price or availability", "+2"], ["Wants a service this week or urgent", "+3"], ["In your service area", "+1"], ["Gave phone number or email", "+2"], ["Booked or asked to book", "+4"], ["Detailed description of the job", "+1"], ["Outside area or service not offered", "-3"], ["Only browsing, no specifics", "0"]),
      table(["Total", "Label", "Action"], ["6 or more", "Hot", "Call or message within minutes; text alert to the owner"], ["3 to 5", "Warm", "Reply the same day by email or phone"], ["0 to 2", "Cool", "Automatic follow-up and nurture; no urgent alert"], ["Negative", "Not a fit", "Polite response, no follow-up"]),
      p("These numbers are illustrations. Adjust them to your business, then compare labels with what actually happened."),

      h2("Ask questions that feel like help"),
      table(["Instead of", "Try"], ["What is your budget?", "So I can point you to the right option, are you looking at something basic or more comprehensive?"], ["When do you need this?", "Is this something you would like done soon, or are you planning ahead?"], ["Are you the decision maker?", "Would anyone else be involved in choosing, so we can include them in the quote?"], ["Give me your phone number.", "What is the best number to reach you if we need to confirm details?"]),
      p("Each question should be one the visitor could see the value of. If you cannot say why you are asking, drop it."),

      h2("Ordering the questions"),
      ol("Answer what they asked first.", "Offer a next step (booking, quote, callback).", "Ask for the minimum to take that step.", "Ask one qualifying question at a time.", "Stop asking once you know how to route the lead."),
      p("Three or four questions are usually enough. More reduces completion. See [conversational lead capture](/blog/conversational-lead-capture)."),

      h2("Routing by score and type"),
      table(["Lead", "Route", "Speed"], ["Hot, urgent", "Text and email alert to the owner or on-call person", "Minutes"], ["Hot, booking made", "Confirmation sent; team notified", "Immediate"], ["Warm", "Email to the sales inbox; add to a follow-up list", "Same day"], ["Cool", "Nurture email sequence, if consented", "Days"], ["Not a fit", "Polite decline with a helpful suggestion", "Immediate"], ["Complex or sensitive", "Handover to a person with context", "As soon as possible"]),
      p("Instant delivery matters. See [instant lead routing in chat](/blog/instant-lead-routing-chat) and [speed to lead](/blog/speed-to-lead-service-businesses). In Crescelo, leads go to email with instant alerts, and can go to Slack, Google Sheets or webhooks."),

      h2("Different businesses, different signals"),
      table(["Business", "Strong signals"], ["Home services", "Emergency wording, address in area, photos, this-week timing"], ["Dental or clinic", "New patient, urgent pain, insurance question, wants a time"], ["Real estate", "Specific property, pre-approval, viewing request"], ["Professional services", "Matter type, deadline, decision maker, consultation request"], ["Salons", "Specific service, date given, bridal or group booking"]),
      p("See [buyer versus seller lead qualification](/blog/buyer-vs-seller-lead-qualification-chat) and [AI lead capture for home service contractors](/blog/home-service-contractor-ai-lead-capture) for worked examples."),

      h2("Check that your scoring works"),
      ol("Record the label for each lead for a month.", "Note outcomes: booked, quoted, won, lost, no reply.", "Compare: did hot leads convert more than warm and cool ones?", "Adjust points where the labels mislead.", "Repeat quarterly."),
      table(["Metric", "What it shows"], ["Conversion by label", "Whether the scoring predicts outcomes"], ["Response time by label", "Whether hot leads get fast attention"], ["Leads lost with no follow-up", "Process gaps"], ["Share of leads out of area", "Whether your content states your area clearly"]),

      h2("Privacy and honesty"),
      ul("Tell visitors they are talking to an AI assistant.", "Say why you ask for contact details.", "Do not infer or store sensitive characteristics.", "Do not use scoring in ways that unfairly disadvantage people.", "Keep only what you need and delete what you do not."),
      p("See the [GDPR checklist](/blog/website-chatbot-gdpr-checklist). This is general information, not legal advice."),

      h2("Common mistakes"),
      ul("Asking for budget in the first message.", "Making the chat a long form.", "Treating every lead as hot.", "Never checking whether the scores predict anything.", "Sending alerts for every lead so people ignore them.", "Not telling the team what the labels mean."),

      h2("A worked example: three leads in one morning"),
      table(["Lead", "What happened in chat", "Score and route"], ["Maria", "Asked about a boiler that stopped working, gave an address in your area, left her mobile and said she is home all day", "Need, fit, timing and contact: hot; text alert to the on-call engineer; call within ten minutes"], ["Tom", "Asked general prices for a new bathroom, no timing, no contact details", "Warm or cool; assistant offers a brochure by email; follow-up if he leaves an address"], ["An enquiry from 200 miles away", "Asked for an emergency callout", "Not a fit; polite reply explaining your area and suggesting a local search"]),
      p("Each lead got a different response in proportion to its value and urgency. Maria was helped first, Tom was kept warm cheaply and the out-of-area visitor was not left hanging."),

      h2("Rules for keeping scoring fair"),
      ul("Score behaviour and stated needs, not personal characteristics.", "Do not use names, accents or writing style to infer anything.", "Give every visitor a courteous response, whatever their score.", "Review the model periodically for unintended bias, such as penalising leads who write in a second language.", "Let a person override a score at any time."),
      p("Qualification should make service better for everyone, not gatekeep. A low score means lower priority, not a rude reply."),

      h2("Handing a qualified lead to a person"),
      p("When a lead is hot, the handover matters as much as the score. The person who follows up should see a short summary at the top: what the visitor wants, where they are, when they need it and how to reach them, followed by the full conversation. They should also see what the assistant already told the visitor, so they do not contradict it or repeat questions. A good summary takes ten seconds to read and lets the caller start with 'I hear your boiler stopped this morning', which builds trust before the call has really begun."),

      h2("Frequently asked questions"),
      faq(
        ["What is lead qualification?", "It is deciding how promising an enquiry is and how to respond, based on need, fit, timing and ability to buy."],
        ["Can a chatbot qualify leads?", "Yes. It can ask a few natural questions, read signals such as timing and specificity, and route the lead by score."],
        ["How many questions should it ask?", "Usually three or four. Enough to route the lead, not so many that visitors leave."],
        ["Should I ask about budget?", "Often indirectly. Ask about the scope or option they are considering rather than demanding a figure."],
        ["What do I do with cool leads?", "Send helpful follow-up if they have consented, and check them again later."],
        ["How do I know my scoring is right?", "Compare labels with outcomes each month and adjust."],
      ),
      p("See the [lead capture feature](/product/lead-capture), test a lead conversation in the [playground](/playground) and [start a free trial](/login?mode=register)."),
    ],
  }),

  pillar({
    slug: 'crm-integration-ai-chatbot-leads',
    title: 'How to Send Chatbot Leads to Your CRM: Webhooks, Zapier and Make Explained',
    description: 'How to connect an AI chatbot to your CRM and tools: what lead data to send, webhooks, Zapier and Make recipes, deduplication, security and how to test the flow.',
    primaryKeyword: 'integrate chatbot with CRM',
    secondaryKeywords: ['chatbot lead to CRM', 'send chatbot leads to HubSpot', 'webhook chatbot integration', 'Zapier chatbot leads'],
    body: [
      p("A lead that lives only in the chatbot's dashboard is a lead that gets forgotten. The moment a visitor shares contact details, the lead should reach the place your team already works: a customer database, a spreadsheet, a team chat channel or a sales pipeline. This guide explains the ways a chatbot can pass leads to other tools, which data to send, how webhooks work in plain terms, how to use automation tools such as Zapier and Make to reach almost any CRM, how to avoid duplicates and mistakes, and how to test the flow before you rely on it."),

      h2("Why integration matters"),
      ul("**Speed:** leads reach the person who can act, immediately.", "**One source of truth:** your team works from one list.", "**Follow-up:** reminders, tasks and pipelines depend on the lead being in your CRM.", "**Reporting:** you can see which channels and pages produce customers.", "**Less copy and paste:** manual transfers get skipped when you are busy."),
      p("See [speed to lead for service businesses](/blog/speed-to-lead-service-businesses) for why the first hour matters."),

      h2("Ways a chatbot can pass leads on"),
      table(["Method", "How it works", "Good for", "Effort"], ["Email alert", "Each lead is emailed to you with the conversation", "Every business; instant awareness", "None"], ["Slack or team chat", "New leads are posted to a channel", "Teams who live in chat", "Low"], ["Spreadsheet", "Each lead becomes a row in Google Sheets", "Simple tracking, small volumes", "Low"], ["Webhook", "The chatbot sends the lead as data to a web address you provide", "Connecting to almost anything", "Medium"], ["Automation tool (Zapier, Make)", "Receives the webhook and creates records in hundreds of apps", "Reaching a CRM without code", "Low to medium"], ["Native CRM connector", "Built-in link to a particular CRM", "If the product offers it for your CRM", "Low, if available"]),
      p("In Crescelo, leads can go to email with instant alerts, to Slack, to Google Sheets and to webhooks. Outbound webhook dispatch and CRM pipeline sync are part of the Agency / Scale plan. Because webhooks carry the data anywhere, any CRM that accepts data from Zapier, Make or its own API can receive your leads."),

      h2("What data to send with a lead"),
      table(["Field", "Why"], ["Name, email, phone", "To contact them"], ["What they asked for", "Service or question in their words"], ["Conversation summary or link", "So the follower does not start cold"], ["Source page and time", "Attribution and speed measurement"], ["Score or label (hot, warm, cool)", "Prioritise follow-up"], ["Consent status", "Whether they agreed to marketing"], ["Booking details, if any", "Date, time and service"], ["Language", "So you reply in the right one"]),
      p("Send only what the CRM needs. More data means more privacy responsibility."),

      h2("Webhooks in plain terms"),
      p("A webhook is an automatic message from one system to another. When something happens in the chatbot, such as a new lead, it sends a small packet of data to a web address you provide. The receiving system, a CRM or an automation tool, reads the data and acts. Because webhooks can carry sensitive information, they should be signed so the receiver can check they came from the chatbot, and sent only over secure connections. Crescelo signs outgoing webhooks so your systems can verify them. See [webhook automations with Zapier and Make](/blog/webhook-automations-zapier-make-chat-events)."),
      ol("The visitor shares details and the lead is created.", "The chatbot sends a webhook with the lead data to your chosen address.", "Your automation tool receives it and checks the signature if configured.", "It creates or updates a contact and adds the conversation note.", "It notifies the right person or creates a follow-up task."),

      h2("A recipe with Zapier or Make"),
      p("The steps are similar in both tools."),
      ol("Create a new automation with a trigger of the type 'Catch a webhook'. The tool gives you a web address.", "Paste that address into the chatbot's webhook settings.", "Send a test lead so the tool can see the data fields.", "Add an action: 'Create or update contact' in your CRM, mapping name, email, phone and notes.", "Add a second action: create a task or notify a channel for hot leads.", "Turn the automation on and send another test lead."),
      table(["CRM action", "Typical mapping"], ["Create or update contact", "Match on email to avoid duplicates"], ["Add note", "Conversation summary and link"], ["Create deal or opportunity", "Only for warm and hot leads"], ["Assign owner", "By area, service or round-robin"], ["Create task", "Call within a set time for hot leads"]),

      h2("Avoiding duplicates and mess"),
      ul("Match contacts by email or phone so returning visitors do not create new records.", "Update rather than overwrite existing fields; keep the original source.", "Tag leads from the chatbot so you can report on them.", "Do not create a deal for every chat; use score or booking to decide.", "Delete or merge test records before launch."),

      h2("Security and privacy"),
      ul("Use secure (HTTPS) addresses for webhooks and never send leads to an address you do not control.", "Verify webhook signatures where your tool supports it.", "Keep webhook addresses and secrets private; treat them like passwords.", "Limit who can edit automations, and use two-factor authentication on your automation and CRM accounts.", "Record consent, and honour deletion requests across systems.", "Send the minimum data needed."),
      p("See [the GDPR checklist](/blog/website-chatbot-gdpr-checklist) and [setting up team roles and two-factor authentication](/blog/setup-rbac-2fa-team-security). This is general information, not legal advice."),

      h2("Test the whole flow before you rely on it"),
      ol("Submit a test lead in the chat with a name you will recognise.", "Check the email alert arrives.", "Check the row, message or CRM record appears with correct fields.", "Submit the same email again and check it updates, not duplicates.", "Submit a lead with unusual characters and a long message.", "Disconnect the automation and see what happens; confirm you still get the email alert.", "Delete the test records."),
      p("A lead should never depend on a single route. Keep the email alert on even when the CRM link is working."),

      h2("Measure what the integration gives you"),
      table(["Metric", "How to use it"], ["Time from lead to first contact", "Should fall once alerts and tasks exist"], ["Leads by source page", "Shows which pages convert"], ["Lead to customer rate by label", "Checks the scoring"], ["Leads without follow-up", "Finds gaps in your process"]),
      p("See [attribution modelling for chat leads](/blog/attribution-modeling-marketing-channels-chat-leads) and [conversational lead capture](/blog/conversational-lead-capture)."),

      h2("Common mistakes"),
      ul("Sending leads to a shared inbox nobody reads.", "Creating duplicate contacts on every message.", "Forgetting to test failures.", "Putting secrets in shared documents.", "Sending everything, including data you do not need.", "Not telling the team how to recognise chatbot leads."),

      h2("Example: routing leads to the right person"),
      p("A home services company has two crews and a sales coordinator. The automation reads the lead's postcode and service. Emergencies go to the on-call engineer by text. Quote requests create a deal and a task for the coordinator to call within the hour. Out-of-area leads receive an automatic polite reply. Everything is logged in the CRM with the conversation link, so the coordinator sees what the visitor was told before she calls. The setup took an afternoon with a webhook and an automation tool, and it replaced a shared inbox that was often checked late."),

      h2("Where a native connector beats a webhook"),
      p("A native connector, if your product offers one for your CRM, can be simpler and more reliable: fewer moving parts, no automation account to manage, and sometimes richer mapping. A webhook with an automation tool is more flexible and reaches far more systems. If a native connector exists for your CRM and covers what you need, use it. If not, a webhook and an automation tool is a well-trodden path. Whichever you choose, keep the email alert as a safety net."),

      h2("Keeping the integration healthy"),
      p("Integrations break quietly: a password expires, a field is renamed, an automation is switched off. Once a month, send a test lead and check it arrives everywhere. Turn on failure alerts in your automation tool so you hear about errors, and review the run history for skipped or failed runs. Document what the automation does and who owns it, so the knowledge does not live in one person's head."),

      h2("Frequently asked questions"),
      faq(
        ["How do I send chatbot leads to my CRM?", "Use a webhook to an automation tool such as Zapier or Make that creates or updates a contact in your CRM, or use a native connector if your product offers one."],
        ["Does Crescelo integrate with CRMs?", "Leads can go to email, Slack, Google Sheets and webhooks, so any CRM reachable by webhook or automation tool can receive them. Outbound webhooks and CRM pipeline sync are on the Agency / Scale plan."],
        ["What is a webhook?", "An automatic message from the chatbot to another system when something happens, such as a new lead."],
        ["How do I avoid duplicate contacts?", "Match on email or phone and choose 'create or update' actions."],
        ["Is it safe to send leads to a CRM?", "Yes, if you use HTTPS, verify signatures, protect secrets, send only what you need and follow privacy rules."],
        ["Should every chat become a deal?", "No. Create deals for warm and hot leads or bookings, and keep the rest as contacts."],
      ),
      p("See how [lead capture](/product/lead-capture) works, and [start a free trial](/login?mode=register). You can rehearse a lead conversation in the [playground](/playground)."),
    ],
  }),
];
