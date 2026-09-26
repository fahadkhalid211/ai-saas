import { faq, h2, ol, p, pillar, table, ul } from '../authoring';

export const PILLAR28 = [
  pillar({
    slug: 'dynamic-web-scraping-sitemap-ingestion-rag',
    title: 'Importing Your Website Into a Chatbot: What to Expect and How to Get Clean Answers',
    description: 'How to add your website to an AI assistant: which pages to import, what gets extracted, JavaScript and login problems, keeping content fresh, and a checklist for clean, accurate answers.',
    primaryKeyword: 'import website into chatbot',
    secondaryKeywords: ['train chatbot on website content', 'website scraping for RAG', 'add URL to knowledge base', 'sitemap ingestion chatbot'],
    body: [
      p("The fastest way to give an AI assistant knowledge of your business is to point it at your website. You already wrote the pages: services, prices, opening hours, policies, frequently asked questions. Importing them takes minutes, and the assistant can start answering from your own words. But 'just add the URL' hides several details that decide whether the result is good. Some pages hold almost no useful text. Some content is loaded by JavaScript that a simple fetch never sees. Menus and footers repeat on every page and clutter the results. Old pages contradict new ones. And a website is written for browsing, not for answering questions, so some things visitors ask are simply not on it. This guide explains what happens when a page is imported, which pages to add first, the problems to expect and how to fix them, how to keep the content fresh and how to test the result. It describes how Crescelo works today: you add page addresses, the platform fetches each page, removes menus and boilerplate and indexes the useful text, and it re-checks added pages periodically."),

      h2("What happens when you add a page"),
      ol("**Fetch:** the platform requests the page from your web server, the way a browser would, but without running interactive scripts. Only public addresses are allowed; addresses that point to private networks are refused for security. See [SSRF and web scraper security](/blog/mitigating-ssrf-web-scraper-security).", "**Extract:** it removes navigation, headers, footers, cookie banners and other boilerplate, keeping the main text.", "**Split:** the text is divided into passages of a manageable size, keeping headings with their content.", "**Index:** each passage is stored for search by both meaning and keywords, so colloquial questions still find your pricing.", "**Refresh:** added pages are re-checked periodically, and changed content is updated."),
      p("The assistant then answers from these passages and says it does not know when nothing relevant is found, instead of inventing an answer."),

      h2("Which pages to import first"),
      table(["Priority", "Pages", "Why"], ["Highest", "Services, prices, booking, opening hours, contact and location", "Most visitor questions are about these"], ["High", "FAQ, policies (cancellation, refunds, delivery), about and team", "They answer the second wave of questions"], ["Medium", "Blog articles and guides that explain your services", "Good for advice questions, but check they are current"], ["Low", "News, event pages, old promotions", "Often out of date"], ["Never", "Login pages, checkout, account pages, admin areas", "No useful content and possibly sensitive"]),
      p("Import the essential pages first, test, then add more. A small, accurate set beats a large, messy one."),

      h2("What a website import cannot see"),
      table(["Problem", "Why it happens", "What to do"], ["Content that loads after the page opens", "It is built by JavaScript in the browser, which a simple fetch does not run", "Add the same information as plain text on a page, or upload a document"], ["Text inside images", "Menus, price lists and banners saved as pictures are not text", "Retype it, or upload the image file where image reading is available on your plan"], ["Pages behind a login", "The fetcher cannot sign in", "Upload the content as a document"], ["Content in tabs or accordions", "It may or may not be in the page source", "Check the result and provide a document if needed"], ["Embedded booking or price tools", "They live in another system", "State the key facts in text on the page"], ["Text in PDFs linked from pages", "The link is not followed automatically", "Add each PDF as a document"]),
      p("If the assistant cannot answer something that is clearly on your website, view the page source or copy the page's text yourself to see what a fetch would receive."),

      h2("Clean up before you import"),
      ul("Give each page a clear title and headings that match how customers ask questions.", "Put key facts in plain sentences, not only in graphics.", "Remove or update outdated pages, and redirect them.", "Make sure prices and hours on different pages agree.", "Avoid pages that are mostly lists of links.", "Add a dedicated FAQ page with real customer questions and short answers."),
      p("What helps a human reader also helps the assistant. Vague marketing copy such as 'we deliver excellence' gives it nothing to answer with."),

      h2("Website content versus other sources"),
      table(["Source", "Best for", "Watch out for"], ["Website pages", "Public facts that change with the site", "Boilerplate, JavaScript content, stale pages"], ["Uploaded documents", "Price lists, policies, internal guidelines", "Old versions left in place"], ["Pasted text", "Short, precise answers and rules", "Needs manual updates"], ["YouTube links", "Explanations and demonstrations already on video; see [turning a video into answers](/blog/youtube-transcript-ingestion-rag)", "Transcripts may contain errors"]),
      p("A good knowledge base mixes them: the website for public facts, documents for detailed pricing and policies."),

      h2("Keep it fresh"),
      ul("Changed prices or hours on the site should reach the assistant. Crescelo re-checks added pages periodically and updates changed content, and if a page cannot be fetched at that time it keeps the previous copy.", "After a big website change, remove and re-add the page, or check that the update was picked up.", "Set a monthly reminder to test your top price and hours questions.", "Tell your team where the assistant's knowledge comes from, so they update the source, not just the chat."),

      h2("Test the result"),
      table(["Question type", "Example", "Check"], ["Facts", "What time do you open on Saturday?", "Matches the site"], ["Prices", "How much is [service]?", "Matches, with conditions"], ["Policies", "Can I get a refund?", "Correct and complete"], ["Not on the site", "Do you do [unlisted service]?", "Says it does not know and offers a next step"], ["Contradictions", "Ask about something described on two pages", "Answers consistently"]),
      p("Read the sources the assistant shows or the unanswered questions list, and fix gaps at the source. See [your unanswered questions are a to-do list](/blog/unanswered-chat-questions-knowledge-gaps)."),

      h2("Legal and etiquette points"),
      ul("Only import sites you own or have permission to use.", "Respect copyright for content that is not yours.", "Do not import pages containing personal data of customers.", "Check that your own privacy notice covers use of website content in an assistant, where relevant."),

      h2("Common mistakes"),
      ul("Importing the whole site at once, including junk pages.", "Assuming JavaScript-generated content is included.", "Leaving old pages that contradict new ones.", "Never testing with real questions.", "Ignoring the unanswered list.", "Importing a competitor's site or content you have no rights to."),

      h2("Frequently asked questions"),
      faq(
        ["Can I train a chatbot on my website?", "Yes. Add your page addresses to the knowledge base and the platform fetches and indexes the useful text, so the assistant answers from it."],
        ["Does it import my whole site automatically?", "You add page addresses; import the important pages first and add more as needed."],
        ["Why does the assistant miss something that is on my site?", "It may be loaded by JavaScript, stored in an image or behind a login. Add it as plain text or a document."],
        ["How does it stay up to date?", "Added pages are re-checked periodically and changed content is updated; a failed check keeps the previous copy."],
        ["Is it safe to import pages?", "Yes for public pages. Private-network addresses are refused, and you should not import pages with customers' personal data."],
        ["Should I import my blog?", "Yes for advice questions, provided the articles are current and consistent with your prices and policies."],
      ),
      p("Try adding a page in the [playground](/playground), see the [knowledge base feature](/product/knowledge-base) and read [preparing your service menu and price list](/blog/prepare-service-menu-pricing-docs-rag)."),
    ],
  }),

  pillar({
    slug: 'youtube-transcript-ingestion-rag',
    title: 'Turning a YouTube Video Into Answers Your AI Assistant Can Use',
    description: 'How to add video knowledge to a chatbot: how transcripts are extracted, which videos work, cleaning errors, what is lost, copyright, and how to check answers from video content.',
    primaryKeyword: 'YouTube transcript chatbot knowledge base',
    secondaryKeywords: ['add YouTube video to chatbot', 'video transcript RAG', 'chatbot from videos', 'use video content for customer support'],
    body: [
      p("Many small businesses have more knowledge in video than in writing. A hairdresser explains aftercare on a short clip, a physiotherapist demonstrates exercises, a software company records a walkthrough for every feature. That knowledge is valuable, but a visitor asking a question on your website will not scroll through twenty videos to find the thirty seconds that answer it. An AI assistant can, if the words in those videos are turned into searchable text. That is what transcript ingestion does: it retrieves the spoken words of a video as text, splits them into passages and adds them to the assistant's knowledge, so a question about aftercare finds the part of the video where you explained it. This guide explains how it works, which videos suit it, what can go wrong, how to clean up the results, what is lost when a video becomes text, the copyright points to respect and how to verify answers. In Crescelo, you paste a YouTube link into the knowledge base and the video's transcript becomes searchable knowledge."),

      h2("How it works"),
      ol("You paste a video link into the knowledge base.", "The platform checks the link and looks up the video's title and channel.", "It retrieves the transcript, using the captions that exist for the video, whether written by the creator or generated automatically.", "It splits the text into passages and indexes them for search by meaning and keywords.", "When a visitor asks a question, the assistant retrieves the best passages and answers from them."),
      p("If a video has no captions available, there is nothing to retrieve, and the import will fail or return little. Videos that have been made private, restricted or removed cannot be read."),

      h2("Which videos work well"),
      table(["Good candidates", "Poor candidates"], ["Talking-head explanations of services, aftercare, policies", "Music videos or videos with little speech"], ["Step-by-step tutorials narrated aloud", "Silent screen recordings with captions only in the picture"], ["Recorded webinars and Q and A sessions", "Highly visual content where the words do not carry the meaning"], ["Product walkthroughs with clear narration", "Very long videos with a few useful minutes and much chat"], ["Videos you made or have permission to use", "Other people's videos you have no right to use"]),
      p("A helpful test: would the video still make sense if you only heard it? If yes, the transcript will carry most of it."),

      h2("Quality issues to expect"),
      ul("**Automatic captions make mistakes,** especially with product names, brand names, place names, technical terms and strong accents. Check for these.", "**No punctuation or speaker labels** in some captions, which makes passages harder to read; the assistant copes, but misinterpretation is more likely.", "**Filler and digressions** dilute the useful content.", "**Out-of-date statements,** such as an old price mentioned in passing in a video from two years ago.", "**Visual-only information,** for example 'as you can see here', which the transcript cannot explain."),
      table(["Problem", "Fix"], ["Wrong names or terms", "Correct the captions on the video, then re-import; or add a short text document with the correct terms"], ["Old prices in a video", "Do not rely on the video for prices; keep prices in one current document and remove the outdated video"], ["Rambling sections", "Publish a short, focused video, or write a summary document"], ["Visual instructions", "Add a written step list beside the video"]),

      h2("Text is better for facts, video for explanation"),
      p("Use video for how-to and explanation, where speech carries the meaning, such as how to care for a new tattoo or how to set up a feature. Use written documents for facts that change or must be exact: prices, hours, policies, contact details. If a video mentions a price, the assistant may quote it without knowing it changed. Keep exact facts in a single, dated document, and instruct the assistant, in your notes, to prefer that document. See [preparing your service menu and price list](/blog/prepare-service-menu-pricing-docs-rag)."),

      h2("Improve results before importing"),
      ol("Check that captions exist and read them for errors.", "Fix names, prices and terms in the captions, or add a supporting document.", "Use clear, descriptive titles; the title helps the assistant know what the video covers.", "Trim long intros in future videos and state the topic early.", "Split long videos into shorter ones by topic where practical."),

      h2("Copyright and permission"),
      ul("Import videos you made, or where you have permission to use the content.", "A video being public on YouTube does not mean its content is free to reuse in your product.", "Do not import competitors' or third parties' videos in ways that breach their rights.", "If a video shows people, consider whether your privacy notices cover using the speech in an assistant.", "Check YouTube's terms and the rights position for your situation."),
      p("This is general information, not legal advice."),

      h2("Verify the answers"),
      table(["Test", "Example", "What to check"], ["A question answered in the video", "How long should I keep the dressing on?", "The answer matches what you said"], ["A question spread across two videos", "Can I exercise after the procedure?", "The answer is consistent"], ["A question the video does not cover", "Is it safe during pregnancy?", "The assistant says it does not know and offers a person"], ["A term likely to be mis-transcribed", "Your product's name", "It is spelled and used correctly"]),
      p("Read the transcript once. It takes a few minutes and reveals most problems. Then run your test questions and correct the source if answers are wrong. Watch the unanswered list for questions people ask that the videos do not cover; see [unanswered questions are a to-do list](/blog/unanswered-chat-questions-knowledge-gaps)."),

      h2("Health and safety content"),
      p("If your videos give health, safety or legal guidance, be cautious. The assistant should present them as general information from your business, not personal advice, and hand over questions about individual circumstances to a qualified person. Keep clinical or safety-critical guidance in reviewed written form as well, so you can confirm it is accurate and current."),

      h2("Common mistakes"),
      ul("Importing videos without captions.", "Trusting automatic captions for names and numbers.", "Relying on videos for prices and hours.", "Leaving old videos that contradict your current practice.", "Importing content you have no rights to.", "Never testing the results."),

      h2("A practical workflow"),
      ol("Choose the five videos customers most often need: aftercare, how it works, what to expect.", "Check captions and correct names and numbers.", "Import them one at a time and ask two or three questions about each.", "Note any gaps and write short text summaries for the important points.", "Review the results after a week using the unanswered questions list."),
      p("Starting small keeps the effort low and lets you see quickly which videos actually help visitors."),

      h2("Frequently asked questions"),
      faq(
        ["Can Crescelo learn from a YouTube video?", "Yes. Paste the link into the knowledge base and the video's transcript becomes searchable knowledge for the assistant."],
        ["What if the video has no captions?", "There is no transcript to retrieve, so it cannot be used. Add captions or write a document with the content."],
        ["Are automatic captions accurate?", "Often, but not always, especially for names and technical terms. Check them before relying on the video."],
        ["Should I put prices in videos?", "Avoid it. Keep exact prices in one current document, because a video's price cannot be updated without re-recording."],
        ["Can I use other people's videos?", "Only with permission. A public video is not automatically free to reuse."],
        ["How do I check the assistant's answers?", "Read the transcript, ask questions the video answers and questions it does not, and confirm the assistant declines to guess."],
      ),
      p("See the [knowledge base feature](/product/knowledge-base), try it in the [playground](/playground) and read [importing your website](/blog/dynamic-web-scraping-sitemap-ingestion-rag)."),
    ],
  }),

  pillar({
    slug: 'local-onnx-embeddings-cpu-bge-small',
    title: 'Small Embedding Models: Running Meaning-Based Search on a Server Without a GPU',
    description: 'What embedding models are, why small ones run on a CPU, trade-offs in accuracy, languages and speed, quantisation, choosing a model, and how to test retrieval before you switch.',
    primaryKeyword: 'small embedding model CPU',
    secondaryKeywords: ['bge-small embeddings', 'run embeddings without GPU', 'ONNX embedding model', 'local embeddings RAG'],
    body: [
      p("When an AI assistant looks for the part of your documents that answers a question, it does not read every document. It compares the meaning of the question with the meaning of each stored passage. That comparison depends on embeddings: lists of numbers, called vectors, that represent the meaning of a piece of text so that passages with similar meaning end up close together. Producing embeddings is done by a model, and the model you choose affects accuracy, languages, speed, cost and privacy. Many people assume this needs an expensive GPU or a paid API. It does not. Small, open embedding models run comfortably on an ordinary server CPU, and for most small business knowledge bases they perform well. This guide explains what embeddings do, why small models are a sensible default, what you give up compared with larger ones, what quantisation means, how language coverage differs, how to choose and how to test a change safely. It also describes Crescelo's approach: a small English model that runs locally by default, with an opt-in multilingual model for workspaces that serve customers in other languages."),

      h2("What an embedding model does"),
      p("Given a piece of text, the model outputs a fixed-length vector, for example 384 numbers. Texts with similar meaning have vectors that point in similar directions, so the system can rank passages by similarity to the question. This is why a visitor can ask 'how much does it set me back?' and find your pricing passage, even though the words differ."),
      table(["Step", "What happens"], ["Indexing", "Each passage of your documents is turned into a vector and stored"], ["Question", "The visitor's question is turned into a vector by the same model"], ["Search", "The system finds stored vectors closest to the question's vector"], ["Combine", "Results are merged with keyword search and reranked; see [reciprocal rank fusion](/blog/reciprocal-rank-fusion-rrf-rag)"]),
      p("The same model must be used to embed the documents and the questions, which is why changing models means re-embedding stored content."),

      h2("Why a CPU is enough"),
      ul("Embedding is much lighter than generating text. It is a single pass through a small network, not a long token-by-token generation.", "Small models have tens of millions of parameters, not billions.", "A question is short, so embedding it takes a fraction of a second.", "Indexing documents happens once, in the background, and can be batched.", "Small models can be compressed (quantised) with little loss of accuracy, making them faster and lighter."),
      p("The heavy computation in a chat is the language model that writes the reply, and that runs at the AI provider. The embedding step can run on your own server without special hardware."),

      h2("What quantisation means"),
      p("Model weights are stored as numbers. Full precision uses 32-bit floating-point numbers. Quantisation stores them with fewer bits, such as 8-bit integers, which reduces memory and speeds up computation on ordinary CPUs at a small cost in accuracy. For embedding models the loss is usually tiny, which is why quantised versions are common for CPU deployment. ONNX is a common portable format for running such models efficiently without a heavy machine learning framework."),

      h2("Small versus large models"),
      table(["Aspect", "Small model (tens of millions of parameters)", "Large model"], ["Hardware", "Ordinary CPU", "Often GPU or a paid API"], ["Speed", "Fast", "Slower or dependent on a service"], ["Cost", "Effectively free to run", "Per-request charges or expensive servers"], ["Privacy", "Text stays on your server", "Text sent to a third party if hosted"], ["Accuracy on small, clear knowledge bases", "Good", "Slightly better in hard cases"], ["Long or highly technical text", "May struggle more", "Better"], ["Languages", "Often English-only", "Multilingual models exist"]),
      p("For a service business with a few dozen pages of clear content, the difference in retrieval quality between a small and a large model is usually modest, especially when hybrid search and reranking are used."),

      h2("Language coverage matters more than size"),
      p("The biggest practical limit of many small models is language. An English-only model represents Spanish or Arabic text poorly, so customers writing in those languages may not find the right passages. Multilingual small models exist and handle many languages at a slightly lower peak English accuracy. Crescelo's default is a small English model. Workspaces serving multilingual customers can switch to a small multilingual model by an opt-in setting, after which stored content is re-embedded. In our own English test set, the default found the right passage among its top five results 95.3% of the time, and the multilingual option 90.7%; in a small cross-language probe the multilingual model handled Spanish and French questions against English passages better. These are results on our own test set, not universal figures, so test with your content."),
      table(["If your customers", "Consider"], ["Write in English only", "The default English model"], ["Write in several languages", "A multilingual model, tested on your questions"], ["Mix languages within a conversation", "A multilingual model"]),

      h2("How to choose"),
      ol("List the languages your customers really use.", "Prepare twenty to fifty real questions with the passages that should answer them.", "Measure how often the right passage appears in the top few results for each candidate model.", "Compare speed and memory on your server.", "Choose the smallest model that meets your accuracy needs, and record the results."),
      p("See [benchmarking retrieval with simple metrics](/blog/benchmarking-rag-retrieval-metrics-business) for how to run this test."),

      h2("Switching models safely"),
      ul("Changing the embedding model requires re-embedding all stored passages, because vectors from different models cannot be compared.", "Test on a small assistant first.", "Keep the old model available until the migration is complete, so search keeps working; Crescelo tags each stored chunk with the model that produced it and re-embeds in the background.", "Avoid a half-migrated state where some passages use the old model and some the new; mixed states give poor results.", "Re-run your test questions afterwards."),

      h2("Privacy and cost benefits"),
      p("Running embeddings locally means your documents and visitors' questions are not sent to an external embedding service, which simplifies your data protection story and removes a per-request cost. The language model that writes replies is a separate matter and depends on the provider you use; see [bring your own AI key explained](/blog/bring-your-own-ai-key-byok-explained)."),

      h2("Common mistakes"),
      ul("Assuming you need a GPU.", "Using an English-only model for multilingual customers.", "Switching models without re-embedding.", "Choosing by benchmark rankings instead of testing your own questions.", "Ignoring memory limits on small servers."),

      h2("Frequently asked questions"),
      faq(
        ["What is an embedding model?", "A model that turns text into a list of numbers representing its meaning, so similar meanings can be found by comparing the numbers."],
        ["Do I need a GPU for embeddings?", "No. Small models run well on an ordinary CPU, especially when quantised."],
        ["Which embedding model does Crescelo use?", "A small English model running locally by default, with an opt-in small multilingual model for workspaces serving other languages."],
        ["Is a small model less accurate?", "Slightly, in hard cases. For clear, modest knowledge bases with hybrid search and reranking, it is usually enough."],
        ["What happens when I change the model?", "Stored passages must be re-embedded with the new model. Do it on a small assistant first and re-test."],
        ["Are my documents sent to a third party for embedding?", "Not when the model runs locally on your platform's server."],
      ),
      p("Try retrieval on your own documents in the [playground](/playground), see the [knowledge base feature](/product/knowledge-base) and [pricing](/pricing)."),
    ],
  }),

  pillar({
    slug: 'grounded-rag-vs-custom-gpts-business-security',
    title: 'A Grounded Business Assistant or a Custom GPT: Which Suits Customer Chat?',
    description: 'Compare a custom GPT with a grounded, embeddable business assistant: control, accuracy, customers, security, cost, branding, booking and lead capture, with a decision checklist.',
    primaryKeyword: 'custom GPT vs chatbot for business',
    secondaryKeywords: ['custom GPT for customer support', 'grounded AI assistant', 'ChatGPT for my website', 'RAG chatbot vs GPT'],
    body: [
      p("Many business owners have tried a custom GPT: you upload a few documents to ChatGPT, give it instructions and share a link. It works surprisingly well in minutes, and it is natural to ask whether that is all you need for customer chat. For internal use and experiments, it may be. For a public-facing assistant on your website that handles real customers, appointments and personal data, the differences start to matter. A grounded business assistant, built to answer from your own content, live on your site, connected to booking and lead capture and managed with security controls, solves a different problem. This guide compares the two honestly. It explains what each does well, where custom GPTs fall short for customer chat, what 'grounded' really means, how they differ on access, branding, data handling, cost and operations, and gives a checklist to decide. It does not claim a custom GPT is bad; it is the wrong tool for some jobs, and the right one for others."),

      h2("What each is"),
      table(["", "Custom GPT", "Grounded business assistant (such as Crescelo)"], ["Where it lives", "Inside the ChatGPT product, reached by a link", "On your website, hosted page or messaging channels"], ["Who uses it", "Anyone with the link, often needing an account with the provider", "Your website visitors, with no account"], ["Knowledge", "Uploaded files and instructions", "Documents, web pages and videos indexed for retrieval"], ["Behaviour", "Instructions guide a general model", "Retrieval limits answers to your content, with rules for when it does not know"], ["Business actions", "Limited", "Booking, lead capture, handover to a person, notifications"], ["Management", "Simple settings", "Dashboard with analytics, roles, channels"]),

      h2("What 'grounded' means"),
      p("A grounded assistant looks up relevant passages in your content before answering and is instructed to answer from them. If nothing relevant is found, it says it does not know and offers a next step, such as booking or a person, instead of guessing. This retrieval-augmented approach reduces made-up answers in areas where accuracy matters: prices, hours, policies. A general model with attached files may also use the files, but it is more likely to blend them with its general knowledge and answer confidently outside your content. See [how to stop a chatbot from making things up](/blog/grounded-ai-chatbot-hallucinations)."),

      h2("Where custom GPTs are a good fit"),
      ul("Internal helpers for you or your team, such as drafting emails in your style.", "Quick prototypes to test how an assistant might answer.", "Personal productivity: summarising documents, brainstorming.", "Sharing a tool with a small group who already use the provider's product."),

      h2("Where they fall short for customer chat"),
      table(["Need", "Custom GPT", "Grounded business assistant"], ["Live on your website for anonymous visitors", "Not designed for this; visitors leave your site and may need an account", "Embedded widget, no account needed"], ["Your branding", "Limited", "Name, colours, position, welcome message; white-label on eligible plans"], ["Bookings", "Not built in", "Built-in booking or links to Calendly or Cal.com"], ["Lead capture and alerts", "Not built in", "Fields you choose; email, Slack, Sheets, webhooks"], ["Human handover with context", "No", "Yes"], ["See what visitors asked", "Limited insight into public conversations", "Conversations, unanswered questions, leads"], ["Control over data and provider", "Tied to one provider's product", "Bring your own key; choose the provider"], ["Access control for your team", "Basic", "Roles and two-factor authentication"], ["Answers only from your content", "Weaker guarantees", "Retrieval with a fallback when it does not know"]),
      p("The important difference is not intelligence; both use similar underlying models. It is the surrounding system: where it appears, what it can do and how you manage and secure it."),

      h2("Security and data handling"),
      ul("**Visitor access:** a public link to a custom GPT exposes it to anyone, and conversations may sit in the provider's product under its terms. A website assistant is embedded on your domain with controls such as rate limits and protection against abuse.", "**Your documents:** in a custom GPT, uploaded files may be retrievable by users through clever prompting. In a business assistant, content is stored in your workspace, isolated from other customers, and answers are limited to what you allow.", "**Secrets:** provider keys should be stored encrypted; see [how a key vault works](/blog/cryptographic-byok-vault-aes-256-gcm).", "**Team access:** roles and two-factor authentication matter once several people manage the assistant; see [securing your chatbot account](/blog/setup-rbac-2fa-team-security).", "**Personal data:** if visitors give names and phone numbers, you need consent wording, retention rules and a data processing agreement; see the [GDPR checklist](/blog/website-chatbot-gdpr-checklist)."),
      p("A prudent rule: do not upload anything to a custom GPT that you would not be comfortable with a determined user extracting."),

      h2("Cost comparison"),
      table(["Cost", "Custom GPT", "Business assistant"], ["Set-up", "Minutes", "An hour or two to load content and test"], ["Ongoing", "Provider subscription for builders; users may need their own accounts", "Platform subscription, plus AI usage at your provider's rate if you bring your own key"], ["Hidden effort", "Manual updates, no analytics", "Reviewing conversations and unanswered questions"], ["Scaling", "Not built for many anonymous visitors", "Built for it, with session limits by plan"]),
      p("If you want a website assistant, the comparison is not really one subscription against another; it is a prototype against a system built for production."),

      h2("A decision checklist"),
      ul("Will anonymous visitors on my website use it? If yes, choose an embeddable assistant.", "Do I need bookings, lead capture or handover? If yes, choose a business assistant.", "Do I need to control the brand experience? Business assistant.", "Is it only for me or my team? A custom GPT may be enough.", "Do I need to see and improve what customers ask? Business assistant.", "Do I have sensitive documents? Check access controls and data terms before uploading anywhere."),

      h2("You can use both"),
      p("Many businesses prototype in a custom GPT, refine their documents and instructions, then move the same content into a grounded assistant for customers. The documents you polish carry over. Try your content in the [playground](/playground) to see how a grounded assistant answers and declines."),

      h2("Common mistakes"),
      ul("Assuming a shared link is a website chatbot.", "Uploading sensitive files to a public assistant.", "Expecting analytics and lead capture from a prototype.", "Skipping tests for questions the documents cannot answer.", "Ignoring the provider's data terms."),

      h2("Frequently asked questions"),
      faq(
        ["Can I use a custom GPT as my website chatbot?", "It is not designed to be embedded for anonymous visitors with bookings, lead capture and management. Use it for prototypes or internal help."],
        ["What does grounded mean?", "The assistant answers from passages retrieved from your content and says it does not know when nothing relevant is found."],
        ["Is a business assistant more accurate?", "Grounding and a fallback for unknown questions reduce made-up answers, especially for prices and policies. You still need to test."],
        ["Which is cheaper?", "A custom GPT is quick to start, but a business assistant is built for production and gives control over usage costs when you bring your own key."],
        ["Is my data safer?", "It depends on the platform. Look for workspace isolation, encrypted keys, roles, two-factor sign-in and a data processing agreement."],
        ["Can I start with a custom GPT?", "Yes. Refine your documents there, then load them into a business assistant."],
      ),
      p("See the [AI assistant feature](/product/ai-assistant), [pricing](/pricing) and [how multi-tenant chatbot platforms keep customers' data apart](/blog/multi-tenant-saas-chatbot-architecture)."),
    ],
  }),

  pillar({
    slug: 'domain-synonym-clusters-rag-search',
    title: 'Synonyms in Search: Helping an AI Assistant Match How Customers Really Talk',
    description: 'How synonyms and query expansion help chatbot search: vocabulary mismatch, hybrid search, expanding queries, building a synonym list for your business, risks and testing.',
    primaryKeyword: 'synonyms in chatbot search',
    secondaryKeywords: ['query expansion RAG', 'vocabulary mismatch search', 'keyword search synonyms', 'improve chatbot retrieval terminology'],
    body: [
      p("A customer types 'how much for a trim?' Your price list says 'Gentleman's haircut: $30'. A visitor asks 'do you fit boilers?' and your service page says 'heating installation'. Someone writes 'cancel' where your policy says 'withdraw from the booking'. The words differ, but the meaning is the same, and a search that relies on matching words will miss it. This is called vocabulary mismatch, and it is one of the most common reasons an assistant answers 'I do not know' when the answer is sitting in the documents. Modern assistants reduce the problem with meaning-based search and by expanding queries with synonyms. Neither is perfect, and you can help them with a few small habits in how you write your content and in how you handle the words your customers use. This guide explains why mismatch happens, how meaning search and keyword search each handle it, what query expansion does, how to build a small synonym list for your business, the risks of over-expanding and how to test the effect."),

      h2("Why customers do not use your words"),
      table(["Your term", "What customers say"], ["Colour service", "Dye, tint, highlights, balayage, root touch-up"], ["Heating installation", "Fit a boiler, new central heating, replace radiators"], ["Consultation", "Chat, initial meeting, first appointment, assessment"], ["Cancellation policy", "Refund, get my money back, change my booking"], ["Residential cleaning", "House clean, home cleaning, tidy my flat"], ["Complimentary", "Free, no charge, included"]),
      p("Professionals use technical vocabulary; customers use everyday words, brand terms or mixed-up versions. Regional differences add more: trainers or sneakers, flat or apartment, cell or mobile."),

      h2("How search copes"),
      table(["Method", "Handles synonyms?", "Weakness"], ["Keyword search (exact words)", "No, unless the words match", "Misses paraphrases"], ["Stemming and lemmatising", "Partly: 'cancelled' matches 'cancel'", "Does not link different words"], ["Meaning-based (vector) search", "Yes, often well", "Can miss rare terms, names and codes"], ["Query expansion with synonyms", "Yes, for the terms you cover", "Needs care so it does not add noise"], ["Hybrid search", "Combines the strengths", "Still benefits from good content"]),
      p("Crescelo combines meaning-based and keyword search and merges results; see [reciprocal rank fusion](/blog/reciprocal-rank-fusion-rrf-rag). A built-in set of everyday synonym groups helps common cases, such as price, cost and fee. Your own business terms are where you can add the most value."),

      h2("What query expansion does"),
      p("Query expansion adds related words to the search so that a question using one term also finds passages using another. For 'cost', it may also search for 'price', 'fee' and 'rate'. It improves recall, meaning how many relevant passages are found, but it can reduce precision if it adds words that are too general or ambiguous. The art is to expand where the meaning is truly equivalent in your business."),
      table(["Good expansion", "Risky expansion"], ["price, cost, fee, charge", "service, product, plan, package (too general and often different things)"], ["cancel, withdraw, call off", "cut, trim, reduce (different meanings by context)"], ["appointment, booking, reservation", "visit, session (may be different services)"], ["colour, dye, tint", "treatment (too broad)"]),

      h2("Build a small synonym list for your business"),
      ol("Read the last fifty conversations and the unanswered questions; note the words visitors used that your documents do not contain.", "Group words that mean the same thing in your context.", "For each group, choose the term you use on your website as the main term.", "Write the alternatives into your content naturally: 'Colour services (also called dye, tint or highlights)'.", "Add plain-language headings that match how people ask: 'How much does it cost?' as well as 'Pricing'.", "Review quarterly as new phrases appear."),
      p("Adding the alternatives into the documents themselves is the most reliable method. It works with every search method, is visible to your team and does not depend on any hidden setting."),

      h2("Write content that matches questions"),
      ul("Use question-style headings that mirror what customers type.", "Include common alternative names in the first sentence of a section.", "Spell out abbreviations and give the short form as well.", "Use both local and international terms if you serve both.", "State numbers and units in the ways customers write them: '30 min' and 'half an hour'."),
      table(["Before", "After"], ["Gentleman's haircut: $30", "Men's haircut (also called a gentleman's cut, trim or short back and sides): $30, about 30 minutes"], ["Heating installation", "Heating installation: new boilers, central heating and radiator replacement, including 'fitting a boiler'"], ["Cancellation policy", "Cancellations and refunds: how to cancel, change or withdraw from a booking, and when you get your money back"]),

      h2("The risks of over-expanding"),
      ul("Broad synonyms can pull in irrelevant passages and confuse the answer.", "Ambiguous words, such as 'cut' or 'plan', mean different things by context.", "Adding too many alternatives to every paragraph makes the text awkward for readers.", "Synonym handling in one language does not carry over to others; multilingual customers need a multilingual model. See [small embedding models and languages](/blog/local-onnx-embeddings-cpu-bge-small)."),

      h2("Test the effect"),
      table(["Test", "How"], ["Collect twenty real questions that used unusual wording", "From conversations and the unanswered list"], ["Ask them before the change", "Note which return the right answer"], ["Update the documents", "Add the alternative words and headings"], ["Ask them again", "Compare"], ["Try a few unrelated questions", "Check that the answers did not get noisier"]),
      p("Use the measures in [benchmarking retrieval with simple metrics](/blog/benchmarking-rag-retrieval-metrics-business) if you want numbers."),

      h2("Common mistakes"),
      ul("Assuming the assistant will always understand any paraphrase.", "Ignoring the unanswered list, which shows the words you missed.", "Stuffing documents with synonyms until they read badly.", "Using internal jargon in customer-facing documents.", "Never re-testing after changes."),

      h2("A worked example"),
      p("A plumbing firm notices that several visitors asked 'do you fit combi boilers?' and got 'I do not know', although its page says 'heating installation, including boiler replacement'. The owner adds a short passage: 'Boiler fitting and replacement (also called fitting a boiler, new boiler, combi boiler installation or swapping an old boiler): we fit most makes, typically in one day, from $2,400.' She also adds the heading 'Do you fit boilers?'. The next time a visitor asks, the assistant finds the passage immediately. The fix took five minutes and depended on nothing but watching real questions and writing the customers' words into the content."),
      table(["Step", "Action"], ["Spot", "Read the unanswered list weekly"], ["Match", "Find the passage that should have answered it"], ["Bridge", "Add the customer's words and a matching heading"], ["Retest", "Ask the original question again"]),
      p("Repeat this loop for a few weeks and the assistant's coverage of your customers' vocabulary grows quickly."),

      h2("Frequently asked questions"),
      faq(
        ["Why does my chatbot miss questions that are answered in my documents?", "Often because the customer used different words from the documents. Add the customer's wording and clear headings to your content."],
        ["What is query expansion?", "Adding related words to a search so that questions and passages using different terms can still match."],
        ["Do I need to configure synonyms?", "Not usually. Start by writing your content in customers' words; hybrid search covers many common paraphrases."],
        ["Where do I find the words my customers use?", "In conversations and the unanswered questions list."],
        ["Can too many synonyms hurt?", "Yes. Broad or ambiguous expansions add noise. Keep to terms that truly mean the same in your business."],
        ["Does it work across languages?", "Not automatically. Multilingual customers need a multilingual embedding model and content in, or understandable to, their languages."],
      ),
      p("Test your wording in the [playground](/playground), see the [knowledge base feature](/product/knowledge-base) and read [what to do when the assistant does not know](/blog/handling-obscure-customer-inquiries-fallbacks)."),
    ],
  }),
];
