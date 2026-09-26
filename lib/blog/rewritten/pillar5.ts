import { faq, h2, h3, note, ol, p, pillar, table, ul } from '../authoring';

export const PILLAR5 = [
  pillar({
    slug: 'grounded-ai-chatbot-hallucinations',
    title: 'How to Stop an AI Chatbot From Making Things Up (Hallucinations)',
    description: 'Why AI chatbots invent answers and how to prevent it: ground replies in your documents, make it admit ignorance, test unanswerable questions and review conversations.',
    primaryKeyword: 'prevent AI chatbot hallucinations',
    secondaryKeywords: ['AI chatbot hallucination', 'stop chatbot making things up', 'grounded chatbot', 'RAG chatbot accuracy'],
    body: [
      p("An AI chatbot that invents an answer is worse than no chatbot. A made-up price, a refund policy you never wrote or an opening time that is wrong turns a helpful assistant into a liability, and customers remember it. This behaviour is called hallucination: the model produces fluent, confident text that is not grounded in fact. It is not a bug you can switch off, but it is something you can reduce dramatically with the right design, and you can measure how well a product does it before you trust it."),
      p("This guide explains why hallucinations happen, the techniques that prevent them, how to test any chatbot for them in ten minutes, and how to keep your own assistant accurate over time. It applies to any product; we say where Crescelo does things and where the limits are."),

      h2("Why chatbots make things up"),
      p("A language model is trained to predict plausible text. When it does not have a fact, it does not naturally stop; it continues with the most plausible-sounding words. That works well for general knowledge and badly for your specific business, which the model never saw."),
      table(["Cause", "What happens", "Example"], ["No information about your business", "The model fills the gap with something plausible", "Invents a cancellation fee"], ["Vague or conflicting documents", "It blends two passages or picks one wrongly", "Quotes an old price from a previous list"], ["Question outside the documents", "It answers from general knowledge instead of admitting it does not know", "Explains a medical treatment you do not offer"], ["Pressure to be helpful", "It agrees with the visitor's assumption", "Confirms a discount the visitor says was promised"], ["Missing or poor retrieval", "The right passage was not found, so the model improvises", "Says 'we do not offer that' when a page covers it"]),
      p("Notice that several causes are about your content and retrieval, not the model itself. That is good news: you can fix them."),

      h2("The core defence: grounding"),
      p("Grounding means every answer is built from passages of your own content, and the assistant is instructed to answer only from them. In practice, it works like this. The visitor's question is used to search your knowledge base. The best passages are passed to the model together with an instruction such as: 'Answer using only the information below. If the answer is not in it, say you do not have that information and offer to connect the visitor with a person.' The model then writes a reply based on those passages rather than on its general memory."),
      p("This approach is called retrieval-augmented generation, or RAG. It does not make hallucination impossible, but it changes the model's task from recalling to reading, which it does much better. The mechanics are described in [what an AI website assistant is](/blog/ai-website-assistant) and [hybrid search for RAG](/blog/hybrid-rag-dense-vector-sparse-keyword)."),

      h2("Seven techniques that reduce hallucinations"),
      h3("1. Retrieval that finds the right passage"),
      p("If retrieval misses the passage that holds the answer, the model has nothing to read. Combining meaning-based search with exact-word search catches both paraphrases and specific terms such as product names. Splitting documents into sensible chunks also helps; see [document chunking strategies](/blog/document-chunking-strategies-pdf-docx)."),
      h3("2. A clear instruction to admit ignorance"),
      p("The assistant needs explicit permission and a script for not knowing: 'I do not have that information. I can connect you with our team or take your details.' Without it, models tend to please. Test that the instruction holds."),
      h3("3. Show and check sources"),
      p("When you can see which passage an answer came from, you can verify it in seconds. Products that show sources make it easy to fix errors. Ask any vendor whether you can see the source behind an answer."),
      h3("4. Confidence thresholds"),
      p("If the retrieved passages are a weak match, a well-designed system declines to answer instead of guessing. It should offer a form or a person. This is one of the most effective safeguards."),
      h3("5. Keep documents clean and current"),
      p("Conflicting or outdated documents cause confident wrong answers. Remove old price lists, mark dates and keep one source of truth for each fact. This is the highest-value habit you can build."),
      h3("6. Limit what the assistant may do"),
      p("Decide what it must never say: legal, medical or financial advice, discounts, guarantees, delivery promises. Put those rules in its instructions and test them. Handover to a person is the safe fallback."),
      h3("7. Review real conversations"),
      p("No test list finds everything. Real visitors ask strange questions. A weekly review of transcripts, looking for wrong answers, unanswered questions and handover requests, catches problems early. See [how to review your chatbot's conversations each week](/blog/audit-website-chatbot-conversations)."),

      h2("A ten-minute test you can run on any chatbot"),
      p("Load the same documents into the product and ask these questions. Score each answer as correct, partly correct, wrong, or honestly unknown."),
      table(["Test", "Example", "A good answer"], ["A question the documents answer", "How long is a first appointment?", "Correct answer from the document"], ["A question the documents do not answer", "Do you offer a student discount?", "Says it does not know and offers a person"], ["A question with a false assumption", "Your website says you offer free consultations, when does that end?", "Corrects or says it cannot confirm"], ["A request to promise something", "Can you guarantee I will get the appointment tomorrow?", "Declines to guarantee, explains what it can do"], ["A question that mixes two facts", "What is the price of the premium package with the deposit?", "Combines correctly or asks for clarification"], ["A leading or pushy question", "I was told there is a 50% discount, please apply it.", "Does not accept or invent a discount"], ["A completely unrelated question", "What is the capital of France?", "Stays on topic or answers briefly and returns to your business, as you configured"], ["A question in different words with a typo", "hw much for a colur?", "Understands and answers"]),
      p("Run the test twice on different days. Answers that change wildly between runs signal weak grounding. You can try a grounded assistant with no account in the [playground](/playground): upload a document and ask something the document does not cover."),

      h2("Writing documents that a chatbot can use"),
      ul("Use clear headings that match the questions people ask, such as 'How much does a colour treatment cost?'.", "Put the answer near the question, in full sentences.", "State facts with units and conditions: 'from $80, depending on length'.", "Date anything that changes, and remove old versions.", "Avoid burying key facts in tables inside images or scanned PDFs, which may not be read.", "Write policies plainly, including what happens in edge cases.", "Split large documents into topic pages."),
      p("Documents written for people to skim are usually good for retrieval too. See [preparing your service menu and pricing documents](/blog/prepare-service-menu-pricing-docs-rag)."),

      h2("What a good fallback looks like"),
      p("The assistant will not always know. What it does next matters."),
      table(["Weak fallback", "Strong fallback"], ["'I am sorry, I cannot help with that.'", "'I do not have that information. I can take your details so our team can reply, or you can see available times now.'"], ["Repeats the same answer", "Offers a different route: a form, a booking or a person"], ["Guesses and hedges", "States that it is not sure and does not guess"], ["Dead end", "Always leaves a next step"]),
      p("See [handling obscure customer inquiries with fallbacks](/blog/handling-obscure-customer-inquiries-fallbacks) and [live human handover flow design](/blog/live-human-handover-flow-design)."),

      h2("Guardrails for sensitive topics"),
      p("In health, legal, financial and safety topics, a wrong answer can cause harm. Do not rely on the model's judgement. Write explicit rules: the assistant explains your services and process but does not advise, it states it is an AI, and it hands over urgent or sensitive matters to a person. Test those rules with realistic messages. See [handling emergencies in automated chat](/blog/handling-emergencies-automated-chat) and [AI transparency and disclosure](/blog/ai-transparency-disclosure-building-trust)."),

      h2("Measuring accuracy over time"),
      ul("**Correction rate:** how many answers you had to fix each week; it should fall.", "**Unanswered rate:** how many questions the assistant said it could not answer; these are content gaps.", "**Handover rate:** how often visitors asked for a person, and why.", "**Complaints or corrections from customers:** treat every one as a test case.", "**Spot checks:** read twenty random conversations a month."),
      p("Crescelo lets you review conversations and correct answers, and it is designed to say when it does not know rather than guess. It cannot promise perfection, and neither can any product. A process of review is what keeps accuracy high."),

      h2("Common mistakes"),
      ul("Judging a chatbot only on questions it is expected to know.", "Leaving old documents in the knowledge base.", "Writing the assistant's instructions once and never testing them again.", "Giving the assistant a personality so eager to please that it agrees with anything.", "Ignoring unanswered questions.", "Not telling visitors they are talking to an AI, which raises the cost of any mistake."),

      h2("Frequently asked questions"),
      faq(
        ["What is an AI hallucination?", "It is when a language model produces confident text that is not true or not supported by the information it was given, such as inventing a price or a policy."],
        ["Can hallucinations be eliminated completely?", "Not entirely. They can be greatly reduced by grounding the model in your documents, instructing it to admit when it does not know, testing and reviewing conversations."],
        ["What is RAG?", "Retrieval-augmented generation: the system searches your documents for relevant passages and gives them to the model, which writes an answer from them instead of from general memory."],
        ["How do I test my chatbot for hallucinations?", "Ask questions your documents answer, questions they do not, questions with false assumptions and requests to promise things. Score whether it answers correctly or admits it does not know."],
        ["Why does my chatbot sometimes say it does not know something that is in my documents?", "Usually retrieval missed the passage, or the document is poorly structured. Rewrite the source with clear headings and check retrieval."],
        ["Should the chatbot be allowed to use general knowledge?", "For a business assistant, it is safer to answer only from your content, and offer a person for anything else. You can allow limited general knowledge if you test it carefully."],
      ),
      p("See how grounding feels in practice in the [playground](/playground), or read [how the AI assistant feature](/product/ai-assistant) answers from your content. When you are ready, [start a free trial](/login?mode=register)."),
    ],
  }),

  pillar({
    slug: 'whatsapp-cloud-api-integration-guide',
    title: 'WhatsApp Cloud API for Business: A Setup Guide for an AI Assistant',
    description: 'How to connect the WhatsApp Cloud API to an AI assistant: Meta account, phone number ID, access token, webhook, message rules, templates, costs and testing.',
    primaryKeyword: 'WhatsApp Cloud API integration',
    secondaryKeywords: ['WhatsApp Business API chatbot', 'WhatsApp AI assistant', 'WhatsApp Cloud API setup', 'WhatsApp chatbot for business'],
    body: [
      p("WhatsApp is where many customers already talk. Connecting an AI assistant to a business WhatsApp number lets people ask about prices, book appointments and get answers in an app they use every day, using the same knowledge as your website chat. The technical route is Meta's WhatsApp Cloud API. This guide explains what it is, what you need, how to set it up step by step with an assistant such as Crescelo, how the messaging rules work, what it costs and how to test before you announce it."),
      note("Meta's products, policies and prices change often. Use this guide for the shape of the process, and check Meta's current documentation for exact screens and fees."),

      h2("What the WhatsApp Cloud API is"),
      p("The WhatsApp Cloud API is Meta's hosted interface for businesses to send and receive WhatsApp messages by software. It replaces the older approach of running your own servers. A chatbot or assistant connects to it: when a customer sends a message to your business number, Meta forwards it to your assistant's webhook; the assistant replies through the API. It is different from the free WhatsApp Business app on a phone, which is for manual use by one person."),
      table(["", "WhatsApp Business app", "WhatsApp Cloud API"], ["Who uses it", "One person on a phone", "Software and teams"], ["Automation", "Simple quick replies and away messages", "Full assistants, integrations, templates"], ["Setup", "Install and verify a number", "Meta developer app, business account, tokens and webhook"], ["Best for", "Very small businesses talking by hand", "Businesses that want an assistant to answer and book"]),

      h2("What you need before you start"),
      ul("A **Meta Business account** (Business Manager) for your company, ideally verified.", "A **Meta developer app** with the WhatsApp product enabled.", "A **phone number** for WhatsApp that is not already tied to a personal WhatsApp account; you can start with the test number Meta provides.", "A **permanent access token** created for your app through a system user, so it does not expire in a day.", "The **phone number ID** shown in the app's WhatsApp settings.", "An AI assistant with a **knowledge base** ready to answer questions."),
      p("If you run more than one brand, use a separate number and assistant for each."),

      h2("Step-by-step setup with Crescelo"),
      p("WhatsApp is included on Crescelo's Agency / Scale plan. You set up the Meta side yourself and connect it to your assistant."),
      ol("**Create a Meta developer app.** In Meta for Developers, create an app of the business type and add the WhatsApp product.", "**Get your phone number ID and a permanent token.** Note the phone number ID from the WhatsApp settings. Create a system user in Business Settings, give it access to the app and generate a permanent access token with messaging permissions.", "**Enter them in Crescelo.** Open Channels and Integrations, then WhatsApp. Enter the phone number ID and access token, and choose a verify token, which is a secret string you invent.", "**Set the webhook in Meta.** In the WhatsApp configuration of your Meta app, set the callback URL shown in Crescelo and the same verify token. Meta calls it to confirm ownership.", "**Subscribe to message events.** Subscribe the webhook to the messages field so incoming messages are delivered.", "**Send a test message.** Send a WhatsApp message to your number from your own phone and check that the assistant answers."),
      p("Keep the access token secret. In Crescelo it is stored encrypted, and you should never paste it into a public place."),

      h2("How messaging rules work"),
      p("WhatsApp limits how businesses can contact people, to protect users from spam."),
      table(["Situation", "Rule of thumb"], ["A customer messages you first", "You can reply freely for a window after their last message (currently 24 hours)"], ["You want to message after that window", "You must use a pre-approved message template"], ["You want to start a conversation", "Only with a template and only to people who have opted in to hear from you"], ["Marketing messages", "Require opt-in and use templates; check Meta's category rules"]),
      p("Because an assistant mainly replies to customers who message first, most of its conversations fall within the free reply window. Anything proactive, such as appointment reminders after the window closes, needs an approved template. Check Meta's current documentation for the exact windows and categories."),

      h2("What it costs"),
      p("Meta charges businesses for some kinds of messages, and the pricing model and rates have changed over time and differ by country and category. Replies to customers within the reply window have historically been free or cheap, while template messages such as reminders and marketing are charged. Check Meta's current pricing page for your region before you plan volumes. Separately, you pay your assistant platform and, with a bring-your-own-key product, your AI provider for the model usage. Crescelo's Agency plan is $399 a month and includes WhatsApp and Telegram; see [pricing](/pricing)."),

      h2("Designing a good WhatsApp experience"),
      ul("**Short messages.** WhatsApp is fast and mobile. Keep replies concise, with line breaks.", "**Same knowledge as your website.** Customers should get the same answers in either place.", "**Booking in the chat.** Offer times and confirm. The confirmation can carry the address and change link.", "**Clear handover.** Make it easy to ask for a person and ensure someone will see it.", "**Language.** Customers on WhatsApp often write in their own language; test the ones you serve.", "**Opt-in and opt-out.** Respect requests to stop messages, and record consent for proactive messages."),
      p("The unified inbox matters if you use several channels; see [unifying web, WhatsApp and Telegram in one inbox](/blog/unifying-web-whatsapp-telegram-inbox) and [website chat versus WhatsApp bots](/blog/website-chat-vs-whatsapp-bots-service-business)."),

      h2("Testing before you announce the number"),
      ol("Send a normal question and check the answer.", "Send a question your documents cannot answer and check it admits it.", "Send a booking request and confirm the booking is created and the confirmation arrives.", "Ask for a person and confirm your team is notified.", "Send an image or voice note and see how the assistant responds; decide what you want it to do.", "Test at a slow connection and from a second phone.", "Check that messages appear in your conversation history."),

      h2("Privacy and compliance"),
      p("WhatsApp conversations contain phone numbers and personal information. Tell customers they are talking to an AI assistant, link to your privacy policy, collect only what you need and keep the data only as long as necessary. Meta is involved in processing WhatsApp messages, so include it in your privacy documentation. If you serve people in Europe, read the [GDPR checklist for chatbots](/blog/website-chatbot-gdpr-checklist). This is general information, not legal advice."),

      h2("Troubleshooting"),
      table(["Problem", "Likely cause", "Fix"], ["Meta cannot verify the webhook", "Verify token does not match, or the URL is wrong", "Copy the callback URL and token from the assistant exactly"], ["Messages do not arrive", "Webhook not subscribed to messages", "Subscribe to the messages field in the app configuration"], ["The assistant replies to you but not to others", "App is in development mode or number not live", "Move the app to live mode and use a real business number"], ["Token stops working", "Temporary token expired", "Create a permanent token with a system user"], ["Replies fail after a day", "Outside the reply window", "Use an approved template for proactive messages"], ["Duplicate replies", "Webhook registered twice", "Remove duplicate subscriptions"]),

      h2("Telegram as a simpler alternative"),
      p("If your customers use Telegram, its bot setup is simpler: create a bot with BotFather, get a token and connect it. Crescelo supports Telegram on the same plan. See [Telegram bot integration for business chat](/blog/telegram-bot-integration-business-chat)."),

      h2("What customers actually message you about"),
      p("On WhatsApp, messages tend to be short, quick and casual. Understanding the typical patterns helps you configure the assistant well."),
      table(["Message type", "Example", "What the assistant should do"], ["Quick question", "Are you open tomorrow?", "Answer briefly from your hours"], ["Price request", "How much for a full service?", "Give the price or range and offer to book"], ["Booking request", "Can I come in Thursday morning?", "Offer real times and confirm"], ["Change request", "Need to move my appointment", "Offer new times or the change link"], ["Media", "A photo of the problem", "Acknowledge and pass to your team if the assistant cannot use it"], ["Voice note", "A spoken question", "Say what it can handle and ask the customer to type, unless you have voice support"]),
      p("Write your assistant's greeting for WhatsApp differently from your website greeting: shorter, friendlier and clear about what it can do. Include your business name so customers know they have the right number."),

      h2("A rollout plan that avoids embarrassment"),
      ol("Start with the Meta test number and a few internal testers.", "Connect your real number only when answers and bookings look right.", "Announce it quietly first, for example to existing customers who already message you.", "Add a WhatsApp link or button to your website, Google Business Profile and social pages once you are confident.", "Review conversations daily for the first two weeks and fix gaps.", "Add reminder templates for appointments after the core flow works."),
      p("Making WhatsApp the only way to reach you is risky. Keep other routes open, including the website chat and a phone number, until you have confidence in the setup."),

      h2("Frequently asked questions"),
      faq(
        ["What is the WhatsApp Cloud API?", "It is Meta's hosted interface that lets businesses send and receive WhatsApp messages using software, such as an AI assistant."],
        ["Can I connect an AI assistant to WhatsApp?", "Yes. You create a Meta developer app, get a phone number ID and access token, and connect them to your assistant, which then answers incoming messages."],
        ["Does Crescelo support WhatsApp?", "Yes, on the Agency / Scale plan, using the WhatsApp Cloud API with your own Meta credentials."],
        ["Is WhatsApp automation free?", "Not entirely. Meta charges for some message types, and prices vary. Check Meta's current pricing. You also pay for your assistant platform and AI usage."],
        ["Can the assistant message customers first?", "Only with approved templates and where customers have opted in. Replies to customers who message you are freer."],
        ["Can I use my existing WhatsApp number?", "A number tied to the personal or Business app usually has to be migrated. Meta's documentation explains the options; using a new number is often simpler."],
      ),
      p("If you would like the same answers on WhatsApp as on your site, read about the [messaging channels feature](/product/messaging-channels) and [start a free trial](/login?mode=register)."),
    ],
  }),

  pillar({
    slug: 'byok-vs-bundled-ai-pricing-cost-comparison',
    title: 'Bring Your Own Key vs Bundled AI Pricing: Which Costs Less for a Chatbot?',
    description: 'Compare bring-your-own-key and bundled AI chatbot pricing with a worked cost model: token costs per conversation, margins, control, security and when each wins.',
    primaryKeyword: 'bring your own key AI chatbot pricing',
    secondaryKeywords: ['BYOK AI', 'AI chatbot pricing comparison', 'token cost per conversation', 'bundled AI credits'],
    body: [
      p("When you pay for an AI chatbot, two things are being bought: the software and the AI that writes the replies. Some vendors bundle both into one price. Others, using a bring-your-own-key (BYOK) model, charge for the software and let you connect your own account with an AI provider such as OpenAI, Anthropic, Google, Groq or DeepSeek, which bills you directly. The difference affects how much you pay as you grow, how much control you have and how well you can see where the money goes. This guide explains both models, builds a simple cost model with worked numbers and shows when each one wins."),
      note("All model prices below are illustrative, not quotes. AI providers change prices often and offer many models at very different rates. Always check the provider's current pricing page."),

      h2("The two models in plain terms"),
      table(["", "Bundled AI", "Bring your own key"], ["What you pay the platform", "One subscription that includes AI usage or credits", "A subscription for the software only"], ["Who bills for AI", "The platform", "Your AI provider, directly"], ["Where the margin sits", "In the bundle: the platform buys AI and sells it with a margin", "Nowhere on AI: you pay the provider's rate"], ["Choice of model", "Whatever the platform offers", "Any model your provider offers"], ["Cost visibility", "Often opaque; limited by credits or message counts", "Fully visible in your provider's dashboard"], ["Setup", "Simplest", "One extra step: create an account and paste a key"]),
      p("Crescelo uses the BYOK model: it charges for the software, you paste your own key, and your provider bills you at normal rates. Crescelo adds no markup and takes no share of tokens. Keys are stored encrypted. There is also a free engine you can use to start and test."),

      h2("What a conversation actually costs in AI terms"),
      p("A chat reply costs money in proportion to the text the model reads (input tokens) and writes (output tokens). A token is roughly three quarters of an English word. For a grounded assistant, each reply reads the visitor's question, a few retrieved passages from your documents and some recent conversation, then writes a short answer."),
      p("Here is an illustrative worked example."),
      table(["Item", "Assumption"], ["Messages per chat session", "6 replies from the assistant"], ["Input tokens per reply", "2,500 (instructions, retrieved passages, history)"], ["Output tokens per reply", "250"], ["Total input per session", "15,000 tokens"], ["Total output per session", "1,500 tokens"]),
      p("Now apply three illustrative price levels per million tokens."),
      table(["Model tier (illustrative)", "Input price per million", "Output price per million", "Cost per session", "Cost per 1,000 sessions"], ["Small, fast model", "$0.15", "$0.60", "about $0.003", "about $3"], ["Mid-range model", "$1.00", "$4.00", "about $0.021", "about $21"], ["Premium model", "$5.00", "$20.00", "about $0.105", "about $105"]),
      p("The calculation for the mid-range row: 15,000 input tokens at $1.00 per million is $0.015, plus 1,500 output tokens at $4.00 per million is $0.006, total $0.021. The takeaway is not the exact figures, which change, but the spread: the same conversation can cost 30 times more on a premium model than on a small one. For most customer-facing questions from a knowledge base, a small or mid-range model gives good answers, and BYOK lets you choose."),

      h2("How bundled pricing hides or changes this"),
      p("Bundled plans typically include a monthly number of conversations, messages or credits. The platform buys AI at wholesale prices, decides which model you get and prices the bundle with a margin and a buffer for heavy users. That has real benefits: simplicity, no provider account, predictable bills and no key to manage. The costs are less obvious."),
      ul("**Margin on usage.** You pay more than the provider's rate for each conversation.", "**Model limits.** You may not be able to choose a cheaper or better model for your use case.", "**Overage cliffs.** Going past the included volume can trigger large jumps or forced upgrades.", "**Opaque credits.** A message may consume different credits depending on model, length or features.", "**Lock-in.** Moving vendors means leaving your model choice and usage history behind."),

      h2("How BYOK pricing behaves as you grow"),
      p("With BYOK, the platform subscription is mostly about features and volume of chat sessions. The AI cost tracks your actual usage at the provider's price. If your volume triples, you pay three times the AI cost, which for a small model is still small. If a cheaper model becomes good enough, you switch and your cost drops immediately, without renegotiating anything. If a better model arrives, you can try it the same day."),
      table(["Monthly chat sessions", "AI cost, small model (illustrative)", "AI cost, mid-range model (illustrative)"], ["300", "about $1", "about $6"], ["1,000", "about $3", "about $21"], ["5,000", "about $15", "about $105"], ["20,000", "about $60", "about $420"]),
      p("Add your platform subscription to see the total. For many small businesses, the AI usage is a small fraction of the total; for high-volume operations it is significant, and control over it matters."),

      h2("When bundled pricing is the better choice"),
      ul("You want the simplest possible setup and do not want to manage a provider account.", "Your volume is low and predictable, so the bundle's margin costs little.", "You prefer a single invoice.", "You value not having to choose a model."),

      h2("When BYOK is the better choice"),
      ul("You want to see and control exactly what AI costs.", "Your volume is growing or unpredictable.", "You want to choose or change models, including cheaper fast models for routine questions.", "You have privacy or data-location preferences and want to pick the provider.", "You already have an AI provider account or credits.", "You want to avoid a margin on every conversation."),

      h2("Security and privacy considerations"),
      p("With BYOK, your visitors' messages go from the platform to the AI provider you chose, under your account and that provider's terms. That is an advantage if you want control, and a responsibility because you need to accept the provider's terms and understand their data handling. Check whether your provider uses API data for training (many do not by default for business API use, but confirm) and where it processes data. Keys should be stored encrypted by the platform, never in browser code. In Crescelo, provider keys are stored encrypted with AES-256-GCM. See [how a bring-your-own-key vault works](/blog/cryptographic-byok-vault-aes-256-gcm) and [BYOK explained](/blog/bring-your-own-ai-key-byok-explained). No product should claim you never need to read the provider's privacy terms."),

      h2("How to set up a key safely"),
      ol("Create an account with your chosen provider and add a payment method or credits.", "Create a new API key just for this assistant, so you can revoke it independently.", "Set a monthly spending limit or budget alert at the provider, if offered.", "Paste the key into the assistant's AI settings. Never share it in chats or emails.", "Test with a few questions and check usage in the provider's dashboard.", "Review usage monthly and revisit the model choice."),
      p("The provider guides in the help centre cover each provider, including [OpenAI](/support/ai-connectors/openai), [Gemini](/support/ai-connectors/gemini) and [others](/support/ai-connectors)."),

      h2("How to compare quotes fairly"),
      ol("For bundled products, ask what is included in terms of conversations, and what an extra conversation costs.", "For BYOK products, estimate your monthly sessions and use the worked model above with the provider's current prices.", "Add the platform subscription in each case.", "Compare the totals at your current volume and at three times that.", "Consider setup effort and the value of control, and pick what suits you."),
      p("Crescelo's plans are $49, $149 and $399 a month, with 100, 500 and 2,000 chat sessions included; see the [pricing page](/pricing) for what each includes. The platform-versus-platform comparison is in our [chatbot platform comparison](/blog/website-chatbot-platform-comparison)."),

      h2("Picking a model without overspending"),
      p("With BYOK you choose the model, and that choice is the biggest lever on cost. A simple approach is to start with a small or mid-range model and test it on your real questions. Keep a list of twenty questions, run them on two models and compare the answers. If the cheaper model answers correctly and stays within the documents, use it. If it struggles on longer or more complex questions, step up. Do not assume the most expensive model is better for grounded question answering: when the answer is in the retrieved text, a good small model often reads it just as well. Revisit the choice every few months, because models and prices change quickly."),
      table(["Question type", "Usually fine on a small model", "Consider a stronger model"], ["Prices, hours and policies from documents", "Yes", "Rarely needed"], ["Simple booking conversation", "Yes", "Rarely needed"], ["Long, multi-part questions across several documents", "Sometimes", "Often helps"], ["Nuanced tone or many languages", "Test carefully", "May help"]),

      h2("Watch out for hidden usage"),
      ul("**Long system prompts and history** add input tokens to every reply. Keep instructions tight and trim history.", "**Very large retrieved passages** increase input cost. Use focused documents.", "**Retries and errors** can cost tokens without producing a useful reply. Monitor your provider dashboard.", "**Test conversations** count too, so keep tests short.", "**Bots or abuse** can run up usage. Rate limits and spending caps protect you."),

      h2("Frequently asked questions"),
      faq(
        ["What does bring your own key mean?", "You create an account with an AI provider and paste your API key into the chatbot platform. The provider bills you directly for AI usage, and the platform charges only for its software."],
        ["Is BYOK cheaper than bundled AI?", "Often, especially as volume grows or when a small model is enough, because there is no margin on AI usage. At low volume the difference may be small, and bundled plans can be simpler."],
        ["How much does an AI chatbot conversation cost?", "It depends on the model and the length of the conversation. With a small model it can be a fraction of a cent to a few cents per session; premium models can cost many times more."],
        ["Is my API key safe?", "It should be stored encrypted by the platform and never exposed to visitors. Use a dedicated key, set spending limits and revoke it if you suspect a problem."],
        ["Can I change models later?", "With BYOK, yes. You can switch model or provider whenever a better or cheaper option appears."],
        ["Do I need technical skills to use my own key?", "No. You create the key in the provider's dashboard and paste it into the settings. Guides walk through each provider."],
      ),
      p("You can try a free engine to test your assistant, then connect your own provider when you are ready. Start in the [playground](/playground) or [start a free trial](/login?mode=register)."),
    ],
  }),

  pillar({
    slug: 'website-chatbot-gdpr-checklist',
    title: 'GDPR Checklist for Website Chatbots: What Small Businesses Must Do',
    description: 'A practical GDPR checklist for website chatbots: lawful basis, transparency, consent, data minimisation, retention, processors, transfers and visitor rights.',
    primaryKeyword: 'GDPR compliance for chatbots',
    secondaryKeywords: ['website chatbot GDPR', 'chatbot privacy policy', 'AI chatbot data protection', 'chatbot consent EU'],
    clusterId: 3,
    clusterName: 'Lead Generation',
    funnel: 'MOFU',
    tags: ['Privacy', 'Compliance', 'Lead Generation'],
    related: ['bring-your-own-ai-key-byok-explained', 'add-ai-chatbot-to-your-website'],
    body: [
      p("A website chatbot collects personal data: what people type, their contact details, sometimes their location or device information. If any of your visitors are in the European Union or the United Kingdom, data protection law applies to that chat, whatever size your business is. The good news is that compliance for a typical service business chatbot comes down to a clear set of practical steps. This checklist walks through them, explains what each one means in plain language and points out the questions to ask your chatbot vendor."),
      note("This is general information, not legal advice. Data protection law is detailed and depends on your facts. Read the official guidance, and ask a qualified adviser about your situation. For the text of the regulation see the [GDPR information site](https://gdpr.eu/)."),

      h2("Why chatbots need special attention"),
      p("A chat feels informal, so visitors type more than they would in a form, including sensitive details. An AI assistant may also send that text to a third-party AI provider, store transcripts and use analytics. Each of these is a data-processing activity that needs a legal basis, transparency and safeguards. Treat the chatbot like any other system that handles customer information."),

      h2("Step 1: Know what data the chatbot handles"),
      p("Start with a simple map. What does the chatbot collect and where does it go?"),
      table(["Data", "Where it comes from", "Where it goes"], ["Messages typed by visitors", "The chat", "Your platform vendor, and the AI provider that writes replies"], ["Name, email, phone number", "The chat or a lead form", "Your vendor, your email or CRM, your team"], ["Booking details", "The booking flow", "Your calendar, confirmation emails"], ["Technical data (IP address, browser)", "The visit", "Your vendor's logs and security systems"], ["A visitor identifier stored in the browser", "The widget", "Your vendor, to continue a conversation"]),
      p("Write this down. It becomes the backbone of your privacy notice and your record of processing."),

      h2("Step 2: Decide your lawful basis"),
      p("Under GDPR you need a lawful basis for each purpose. For a service chatbot the usual candidates are these."),
      ul("**Legitimate interests:** answering visitors' questions and running a support tool. You should be able to show that it is necessary, that you have balanced it against visitors' rights and that people would reasonably expect it.", "**Contract:** taking steps at the visitor's request before entering a contract, such as booking an appointment.", "**Consent:** for optional extras such as marketing emails or non-essential cookies. Consent must be freely given, specific and easy to withdraw."),
      p("Do not rely on a pre-ticked box or on silence. Keep marketing consent separate from the chat itself."),

      h2("Step 3: Be transparent"),
      ul("Tell visitors they are talking to an AI assistant.", "Show a short notice in or near the chat that explains what is collected and links to your privacy policy.", "Explain in the privacy policy what you collect through the chat, why, how long you keep it and who processes it.", "Give contact details for privacy requests."),
      p("Example notice: 'You are chatting with an AI assistant. We store this conversation to answer you and improve our service. Read our privacy policy.'"),

      h2("Step 4: Collect only what you need"),
      p("Data minimisation is a core principle. Design the flow so it asks for what is necessary and no more. A booking needs a name and a way to reach the person. It does not need a date of birth. Discourage visitors from typing sensitive information: add a line such as 'Please do not share medical or financial details here.' Configure the assistant so it does not ask for special-category data, such as health information, unless you have a specific lawful basis and safeguards."),

      h2("Step 5: Sort out processors and the AI provider"),
      p("Your chatbot vendor is a processor acting on your behalf, and so may be the AI provider and the email service. You need a data processing agreement with each that handles personal data for you. Ask each vendor for one, and for their list of sub-processors. Crescelo publishes a [data processing addendum](/dpa) and a list of [sub-processors](/subprocessors). With a bring-your-own-key setup, you choose the AI provider, so you should accept its business terms and check how it treats API data."),
      table(["Question", "Why it matters"], ["Do you provide a data processing agreement?", "Required when a vendor processes personal data for you"], ["Who are your sub-processors, and where are they?", "You need to know who handles the data"], ["Is API data used to train models?", "Affects confidentiality"], ["Where is data stored and processed?", "Relevant to transfers outside the UK or EU"], ["How long are conversations kept and can I delete them?", "Retention and deletion rights"], ["How are keys and data protected?", "Security of processing"]),

      h2("Step 6: International transfers"),
      p("If data is stored or processed outside the UK or EU, for example by a US-based vendor or AI provider, you need a lawful transfer mechanism, such as an adequacy decision or standard contractual clauses. Vendors should tell you which they use. This is one of the most technical areas; ask your vendor for their transfer documentation and take advice if needed."),

      h2("Step 7: Retention and deletion"),
      ul("Decide how long you keep transcripts. Keep them only as long as they are useful, for example to answer follow-ups and improve the assistant.", "Delete leads and conversations you no longer need.", "Make sure you can delete a person's data on request, including from the vendor's systems.", "Document your retention period in your privacy policy."),
      p("Crescelo lets you delete leads, appointments and knowledge sources from the dashboard, and you can request deletion of everything by opening a support ticket."),

      h2("Step 8: Respect visitor rights"),
      p("People can ask to see their data, correct it, delete it, restrict or object to processing and receive a copy. You generally must reply within one month. Prepare a simple process: who receives requests, how you verify identity, how you find a person's chat data and how you confirm deletion. Include a contact route in your privacy policy. See our [contact form](/support/contact), which creates a support ticket, as an example of a trackable route."),

      h2("Step 9: Cookies and browser storage"),
      p("A chat widget may store an identifier in the visitor's browser so that a conversation continues after a reload. Whether it needs consent depends on whether it is strictly necessary for a service the visitor requested, and on local rules. Describe what the widget stores in your cookie policy, and ask the vendor whether it is strictly necessary. Analytics and marketing cookies generally require consent. See our [cookie policy](/cookies) for an example of how we describe it."),

      h2("Step 10: Security"),
      ul("Use a vendor that encrypts data in transit and at rest and isolates customer workspaces.", "Protect your account with strong passwords and two-factor authentication.", "Give team members the least access they need.", "Store API keys only in the platform's encrypted settings.", "Have a plan for a data breach, including who tells the regulator and affected people within the required time."),
      p("See [setting up team roles and two-factor authentication](/blog/setup-rbac-2fa-team-security)."),

      h2("Step 11: Special situations"),
      ul("**Children:** avoid collecting data from children unless you have safeguards, and consider whether the service is meant for them.", "**Health, legal and financial services:** these carry extra obligations. Keep chat to booking and general information, and take advice.", "**Marketing:** do not add people to email lists from a chat without a separate, clear opt-in.", "**Automated decisions:** if the chatbot makes decisions that significantly affect people, further rules apply."),

      h2("A copy-and-use checklist"),
      ul("Data map of what the chatbot collects and where it goes.", "Lawful basis chosen for each purpose.", "AI disclosure and privacy link visible in the chat.", "Privacy policy updated to mention the chatbot, transcripts, processors and retention.", "Minimal data collection; warning against sharing sensitive details.", "Data processing agreements with the chatbot vendor and other processors.", "Sub-processors and international transfers reviewed.", "Retention period set and deletion possible.", "Process for handling visitor requests.", "Cookie policy and consent settings match what the widget stores.", "Security controls, including two-factor authentication.", "Regular review of transcripts and the checklist itself."),

      h2("A short privacy notice you can adapt"),
      p("Use plain language and keep it short. For example: 'This chat is run by an AI assistant. We collect the messages you send and any contact details you choose to give us so we can answer you, arrange appointments and improve our service. Our AI and hosting providers process this data on our behalf. We keep chats for [period]. You can ask to see or delete your data at any time. Please do not share sensitive information here. Full details are in our privacy policy.' Adapt the wording, add your details, and have it reviewed."),

      h2("Related guides"),
      ul("[Bring your own AI key, explained](/blog/bring-your-own-ai-key-byok-explained) covers where your data goes when you choose the AI provider.", "[Chatbot lead capture and GDPR and CCPA](/blog/chatbot-lead-capture-gdpr-ccpa-compliance) goes deeper on collecting contact details.", "[AI transparency and disclosure](/blog/ai-transparency-disclosure-building-trust) explains how to tell visitors it is an AI.", "[How to stop a chatbot from making things up](/blog/grounded-ai-chatbot-hallucinations) reduces the risk of wrong statements about your business."),

      h2("Documents to keep on file"),
      ul("Your data map and record of processing for the chatbot.", "Data processing agreements with the chatbot vendor, AI provider and other processors.", "A note of your lawful basis and any balancing test for legitimate interests.", "Your privacy policy and cookie policy versions.", "Your retention schedule and deletion log.", "A log of visitor requests and how you handled them."),
      p("Keeping these on file makes it easier to answer a regulator or a customer who asks how you handle their data."),

      h2("Frequently asked questions"),
      faq(
        ["Does GDPR apply to my website chatbot?", "Yes, if you process personal data of people in the EU or UK, wherever your business is based. Chat messages and contact details are personal data."],
        ["Do I need consent for a chatbot?", "Not always. Many chatbot uses rely on legitimate interests or contract, but consent is needed for marketing and for non-essential cookies. Be transparent in every case."],
        ["Do I have to tell visitors it is an AI?", "It is best practice and increasingly required. Tell people they are talking to an AI, and give them a way to reach a person."],
        ["Is the AI provider a processor?", "Usually yes, when it processes personal data on your behalf. You need appropriate terms with it, and you should check how it treats API data."],
        ["How long can I keep chat transcripts?", "Only as long as you need them for a defined purpose. Set a retention period and delete data afterwards."],
        ["What if someone asks me to delete their chat?", "You should be able to find and delete it, including with your vendor, and confirm within the legal time limit, generally one month."],
      ),
      p("Read our [privacy policy](/privacy) to see how we handle data, and see [how the AI assistant answers only from your content](/product/ai-assistant). To try it with your own documents, use the [playground](/playground)."),
    ],
  }),

  pillar({
    slug: 'ai-website-assistant-roi-calculator',
    title: 'ROI of an AI Website Assistant: A Calculator You Can Use With Your Own Numbers',
    description: 'How to calculate the return on an AI website assistant: recovered enquiries, bookings, staff time and cost, with formulas, worked examples and a way to test the result.',
    primaryKeyword: 'ROI of AI chatbot',
    secondaryKeywords: ['AI chatbot ROI calculator', 'chatbot return on investment', 'cost of AI assistant vs benefit', 'AI receptionist ROI'],
    body: [
      p("Before you pay for an AI website assistant, it makes sense to ask whether it will pay for itself. The honest answer is that it depends on your numbers: how many visitors and enquiries you get, how many you currently lose, what a booking is worth and what the assistant costs. This guide gives you a straightforward method and formulas to work it out with your own figures, worked examples for three types of business and a way to check the result after a month, so you are judging real outcomes and not promises."),
      note("The figures in this article are illustrations to show how the method works, not forecasts or benchmarks. Use your own numbers, and be cautious in your assumptions."),

      h2("The simple version: one formula"),
      p("Monthly return = (extra bookings or sales recovered × average value per booking) + (staff time saved × hourly cost) − monthly cost of the assistant."),
      p("If the result is positive, it pays for itself. To turn it into a ratio, divide the benefit by the cost. The work is in estimating the two benefit terms honestly."),

      h2("Step 1: Find your baseline"),
      ol("**Website visitors per month**, from your analytics.", "**Enquiries per month** by every route: forms, calls, messages, emails.", "**Bookings per month** that come from the website.", "**Enquiries you cannot answer in time:** out-of-hours messages, missed calls, forms answered a day later.", "**Average value of a booking** (revenue or gross profit; use the number you trust).", "**Time your team spends on repetitive questions** each week."),
      p("If you do not know some of these, estimate cautiously and mark them as estimates. You can improve them by tracking for a few weeks."),

      h2("Step 2: Estimate the recovered enquiries"),
      p("The assistant helps most where enquiries are currently lost. Think in three buckets."),
      table(["Bucket", "How it helps", "How to estimate"], ["Out-of-hours enquiries", "Answers and books at once", "Number arriving outside working hours × share that would book if answered"], ["Busy-hour enquiries", "Answers while your team is occupied", "Number missed or delayed × share that would book"], ["Visitors who leave with a question", "Answers the question that stopped them", "Visitors who reach your pricing or contact page and leave × a small share"]),
      p("Use conservative conversion rates. If you are not sure, assume that only 10 percent of extra conversations become bookings. You can adjust upward once you have real data."),

      h2("Step 3: Estimate the staff time saved"),
      p("If your team answers the same twenty questions repeatedly, count the minutes. Ten questions a day at three minutes each is 30 minutes a day, or around 10 hours a month. If the assistant handles most, multiply the hours saved by the hourly cost of the person who would have answered. Be realistic: some questions still need a person, and you will spend time reviewing the assistant."),

      h2("Step 4: Add up the cost"),
      table(["Cost", "Notes"], ["Platform subscription", "For example $49, $149 or $399 a month for Crescelo; see [pricing](/pricing)"], ["AI usage", "With bring-your-own-key, paid to your provider; see [BYOK vs bundled pricing](/blog/byok-vs-bundled-ai-pricing-cost-comparison)"], ["Setup time", "Your time to gather content and test; a few hours"], ["Ongoing review", "Ten to fifteen minutes a week"]),

      h2("Worked example 1: a two-chair salon"),
      table(["Line", "Number"], ["Enquiries per month outside working hours", "40"], ["Share that would book if answered at once (cautious)", "15%"], ["Extra bookings", "6"], ["Average booking value", "$70"], ["Extra revenue per month", "$420"], ["Staff time saved (4 hours at $15)", "$60"], ["Benefit", "$480"], ["Cost: Growth plan plus AI usage", "about $165"], ["Net monthly return", "about $315"]),
      p("Even with cautious assumptions, the assistant covers its cost about three times over in this illustration. If the salon books only two extra appointments, the result is roughly break-even."),

      h2("Worked example 2: a dental practice"),
      table(["Line", "Number"], ["New-patient enquiries missed or delayed per month", "25"], ["Share that would book if answered at once", "20%"], ["Extra new patients", "5"], ["Average first-year value of a new patient", "$600"], ["Extra revenue per month", "$3,000"], ["Cost: Growth plan plus AI usage", "about $165"], ["Return ratio", "roughly 18 times the cost"]),
      p("High-value patients make the arithmetic easy, which is why practices often see the strongest returns. The caveat is quality: the assistant must answer accurately and hand emergencies to a person."),

      h2("Worked example 3: a home services contractor"),
      table(["Line", "Number"], ["Missed calls and forms unanswered within an hour", "30 per month"], ["Share that would become estimates", "20%"], ["Estimates", "6"], ["Estimate to job conversion", "40%"], ["Extra jobs", "about 2.4"], ["Average job value", "$450"], ["Extra revenue per month", "about $1,080"], ["Cost: Starter or Growth plus AI usage", "about $60 to $165"], ["Net", "clearly positive at these numbers"]),
      p("A small number of extra jobs can carry the cost, and instant lead alerts add to the effect by shortening response time."),

      h2("What can make the return smaller"),
      ul("Very low traffic, so few enquiries are lost to begin with.", "A low-value booking with thin margins.", "An assistant with poor content that answers badly or too rarely.", "No one acting on leads that the assistant captures.", "Setup that is never tested, so bookings fail or confirmations do not arrive."),
      p("The strongest lever is your own follow-through: read the conversations, fix gaps and respond to leads quickly."),

      h2("Step 5: Check the result after a month"),
      ol("Record bookings and leads from the chat.", "Tag those that came out of hours or during busy periods; these are the clearest gains.", "Ask new customers how they found you and whether the chat helped.", "Compare with the same month before, and with seasonality in mind.", "Read a sample of conversations to see missed opportunities.", "Recalculate with real numbers."),
      p("If the result is below your estimate, look first at content and follow-up before blaming the tool. See [how to review your chatbot's conversations each week](/blog/audit-website-chatbot-conversations) and [cost per booked appointment](/blog/cost-per-booked-appointment-calculation)."),

      h2("Beyond the direct numbers"),
      ul("**Better data:** you learn what customers ask and where your website fails to answer.", "**Consistency:** the same accurate answers at every hour.", "**Team morale:** fewer interruptions.", "**Speed to lead:** faster first response, which affects conversion; see [speed to lead](/blog/speed-to-lead-service-businesses).", "**Resilience:** coverage during holidays and peaks."),
      p("These are harder to price, so do not count them in your first calculation, but they are real."),

      h2("A blank calculator to copy"),
      p("Copy this into a spreadsheet and fill in your own numbers. Each row has a formula in the third column."),
      table(["Line", "Your number", "How to work it out"], ["A. Enquiries lost or delayed per month", "", "Out-of-hours plus busy-hour plus abandoned visitors"], ["B. Share that would book if answered at once", "", "Start with 10 to 15 percent and adjust with data"], ["C. Extra bookings per month", "", "A × B"], ["D. Average value per booking", "", "Revenue or gross profit, whichever you trust"], ["E. Extra revenue per month", "", "C × D"], ["F. Hours saved per month", "", "Repetitive questions per week × minutes each × 4 ÷ 60"], ["G. Hourly cost of your time or staff", "", "Wage plus overhead"], ["H. Staff time value", "", "F × G"], ["I. Monthly cost", "", "Platform plus AI usage plus review time"], ["J. Net monthly return", "", "E + H − I"], ["K. Return ratio", "", "(E + H) ÷ I"]),
      p("If K is above 1, the assistant covers its cost on your assumptions. Test how sensitive the answer is by halving B. If the result is still positive, you have a comfortable margin; if it turns negative, you need more evidence before buying."),

      h2("Break-even: how many bookings do you need?"),
      p("Break-even is the number of extra bookings per month that covers the cost. Divide your monthly cost by the value of a booking. If the total cost is $165 and a booking is worth $70, you need about 2.4 extra bookings, so three. If a booking is worth $600, you need a fraction of one. This is the most useful number to write down before buying, because it turns a fuzzy question into a specific target that you can check after a month."),
      table(["Monthly cost", "Value per booking", "Bookings needed to break even"], ["$60", "$50", "2"], ["$60", "$300", "1"], ["$165", "$70", "3"], ["$165", "$450", "1"], ["$430", "$120", "4"], ["$430", "$800", "1"]),

      h2("Traps in ROI calculations"),
      ul("**Counting all chats as new business.** Many chats come from people who would have booked anyway. Count only the extra ones.", "**Using revenue rather than margin** when your margin is thin.", "**Ignoring the cost of your time** to set up and review.", "**Forgetting seasonality,** which can make one month look better or worse than it is.", "**Attributing everything to the assistant** when other changes happened at the same time.", "**Over-precision.** A range is more honest than a single number."),
      p("A sensible way to present the result to a partner or team is a range: pessimistic, expected and optimistic, each with its assumptions."),

      h2("Deciding whether to try it"),
      p("Because the assistant has a low setup cost and monthly plans, the risk of trying it is small compared with the potential return in many businesses. A reasonable approach is to run it for one to three months, measure against the baseline you wrote down, and keep it if it beats the break-even. You can test how it answers on your own content first, at no cost, in the [playground](/playground)."),

      h2("Frequently asked questions"),
      faq(
        ["How do I calculate the ROI of an AI chatbot?", "Estimate the extra bookings or sales it recovers multiplied by their value, add staff time saved, subtract the monthly cost, and compare the benefit with the cost."],
        ["What conversion rate should I assume?", "Be conservative. Assume a small share of recovered enquiries become bookings, then replace the assumption with real data after a month."],
        ["How quickly does an AI assistant pay back?", "It depends on your traffic and booking value. Businesses with high-value bookings and many out-of-hours enquiries can see payback quickly; low-traffic sites take longer or may not benefit."],
        ["Should I count staff time saved?", "Yes, but carefully. Count only the time that is genuinely freed, and remember you will spend some time reviewing the assistant."],
        ["What costs should I include?", "The platform subscription, AI usage, the time to set up and a few minutes a week for review."],
        ["What if the numbers do not work?", "Do not buy it yet. Track your enquiries and lost opportunities for a month, then recalculate."],
      ),
      p("Try the assistant on your own documents in the [playground](/playground) to judge answer quality first, then [start a free trial](/login?mode=register) to measure real results."),
    ],
  }),
];
