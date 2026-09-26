import { faq, h2, h3, note, ol, p, pillar, table, ul } from '../authoring';

export const PILLAR22 = [
  pillar({
    slug: 'reciprocal-rank-fusion-rrf-rag',
    title: 'Reciprocal Rank Fusion (RRF) for RAG: Merging Search Results the Simple Way',
    description: 'How reciprocal rank fusion merges vector and keyword results for RAG: the formula, a worked example, choosing the constant, weighting, limits and how to test it on your data.',
    primaryKeyword: 'reciprocal rank fusion RAG',
    secondaryKeywords: ['RRF hybrid search', 'merge vector and keyword search', 'rank fusion formula', 'hybrid retrieval scoring'],
    body: [
      p("Hybrid search runs two kinds of retrieval and has to combine their results: one that matches meaning (vector search) and one that matches words (keyword search such as BM25). The awkward part is that the two produce scores on different scales. A vector similarity of 0.62 and a keyword score of 14.3 cannot simply be added. Reciprocal rank fusion, or RRF, sidesteps the problem with a beautifully simple idea: ignore the scores and use only the ranks. A passage that appears near the top of either list scores well, and one that appears near the top of both scores best. This guide explains RRF in plain terms, shows the formula and a worked example, discusses the constant everyone asks about, describes weighted variants and limits, and shows how to check on your own data that the merge helps. It builds on our guide to [hybrid search for RAG](/blog/hybrid-rag-dense-vector-sparse-keyword)."),

      h2("The problem RRF solves"),
      table(["Method", "Score you get", "Scale"], ["Vector search (cosine similarity)", "For example 0.71", "Between about 0 and 1, but depends on the embedding model"], ["Keyword search (BM25)", "For example 12.6", "Unbounded; depends on query length and corpus"], ["Full-text search rank in a database", "For example 0.08", "Depends on the function and normalisation"]),
      p("Adding or averaging these is meaningless. Normalising them is possible but fragile, because the distributions change with the query and the data. RRF avoids the issue by throwing away the scores and keeping only the order."),

      h2("The formula"),
      p("For each passage, RRF adds up a contribution from every list in which it appears. The contribution is one divided by a constant plus the passage's rank in that list. With rank starting at 1 and a constant k, a passage's score is the sum over lists of 1 / (k + rank)."),
      table(["Rank in a list", "Contribution with k = 60"], ["1", "1 / 61 = 0.0164"], ["2", "1 / 62 = 0.0161"], ["5", "1 / 65 = 0.0154"], ["10", "1 / 70 = 0.0143"], ["20", "1 / 80 = 0.0125"], ["Not in the list", "0"]),
      p("The differences between adjacent ranks are small, which is intentional: RRF rewards appearing in several lists more than it rewards being first in one."),

      h2("A worked example"),
      p("A visitor asks: 'Do you do skin fades for kids on Saturdays?' Vector search and keyword search each return five passages. Passages are labelled A to F."),
      table(["Passage", "Vector rank", "Keyword rank", "RRF score (k = 60)"], ["A: kids' cuts policy", "1", "3", "1/61 + 1/63 = 0.0323"], ["B: skin fade service", "3", "1", "1/63 + 1/61 = 0.0323"], ["C: Saturday hours", "2", "not listed", "1/62 = 0.0161"], ["D: parking", "4", "not listed", "1/64 = 0.0156"], ["E: fade blog post", "not listed", "2", "1/62 = 0.0161"], ["F: prices", "5", "5", "1/65 + 1/65 = 0.0308"]),
      p("Passages A and B, found by both methods, top the ranking. F is not first in either list but appears in both, so it scores higher than C, D or E, which each appear in only one. This is the behaviour you want: agreement between two very different retrieval methods is a strong signal of relevance."),

      h2("What the constant k does"),
      p("The constant controls how quickly the reward falls with rank. A small k, such as 1 or 10, makes the top ranks count far more than lower ranks. A large k, such as 60, flattens the curve, so a passage that is ranked tenth in two lists can beat one ranked first in only one. The value 60 comes from the original research and is a widely used default because it performs well across many datasets. It is a good place to start and rarely needs tuning."),
      table(["k", "Effect", "When to consider"], ["Small (about 5 to 20)", "Strongly favours top-ranked items", "When one method is clearly more reliable"], ["60 (default)", "Balanced", "Most cases"], ["Large (100 or more)", "Nearly flat; favours agreement between lists", "When lists are noisy"]),

      h2("Weighting the lists"),
      p("Plain RRF treats every list as equal. Sometimes you know that one method should count more: keyword search for a product catalogue full of codes, vector search for conversational FAQs. A weighted variant multiplies each list's contribution by a weight, for example 1.0 for vectors and 0.6 for keywords. Start with equal weights, and only add weights if an evaluation on your own questions shows a benefit. Some systems also add a small bonus for the vector similarity score itself, as a tie-breaker, without letting scores dominate."),

      h2("Why it works so well in practice"),
      ul("**Scale independence:** it does not care what the scores mean.", "**Robustness:** an odd score in one list cannot swamp the rest.", "**Simplicity:** a few lines of code, with one parameter.", "**Fusion of any number of lists:** you can add a third retriever, such as a title match, without redesign.", "**Speed:** the arithmetic is trivial next to the searches."),

      h2("Limits of RRF"),
      ul("It ignores how much better rank 1 is than rank 2. Two nearly identical candidates and one runaway winner look the same.", "It cannot rescue a list that does not contain the right passage at all.", "Candidates missing from every list are invisible; retrieval depth matters, so take at least 15 to 25 from each method.", "It does not judge relevance itself; a reranker can do that as a second step."),
      p("These are reasons to see RRF as the merge step in a pipeline, not a complete solution. See [document chunking strategies](/blog/document-chunking-strategies-pdf-docx) for the step before, and reranking below for the step after."),

      h2("Reranking after fusion"),
      p("A common pipeline retrieves 20 to 30 candidates with each method, merges them with RRF to a shortlist of 10 to 20, then reranks the shortlist with a model that reads the question and each passage together, and finally passes the top few to the language model. Reranking costs more per query but only touches a small set, and it can correct cases where the fusion order was slightly off. Crescelo's retrieval combines vector and keyword search, merges with reciprocal rank fusion, and applies a lighter reranking step, with an optional cross-encoder for higher accuracy."),

      h2("How to test that fusion helps on your data"),
      ol("Collect 30 to 50 real questions and note which passage should answer each.", "Run three retrievals: vector only, keyword only and RRF.", "For each question, check whether the right passage is in the top 3 and top 5.", "Compute hit rate and mean reciprocal rank for each method.", "Look at the questions where RRF lost to a single method and see why.", "Try k = 20, 60 and 100 and one weighting, and keep changes only if they help consistently."),
      table(["Metric", "Meaning"], ["Hit rate at 5", "Share of questions whose right passage is in the top 5"], ["Mean reciprocal rank", "Average of 1 divided by the rank of the right passage"], ["nDCG", "Rewards putting relevant passages higher"]),
      p("On a small English test set of our own, hybrid retrieval with fusion put the needed passage in the top five for about 95 percent of questions. Your numbers will differ with your content, which is why testing on your data matters. See [benchmarking RAG retrieval for business](/blog/benchmarking-rag-retrieval-metrics-business)."),

      h2("Implementation notes for developers"),
      ul("Fuse by a stable passage identifier so duplicates merge.", "Keep ranks 1-based and be consistent.", "Break ties deterministically, for example by the better vector similarity.", "Return each passage's per-method rank and score for debugging.", "Do the fusion inside the database if you can, to save round trips, or in application code for flexibility.", "Cache repeated queries; retrieval results for the same question rarely change."),

      h2("Frequently asked questions"),
      faq(
        ["What is reciprocal rank fusion?", "A method that merges ranked lists by giving each passage the sum of 1 / (k + rank) across the lists, ignoring the original scores."],
        ["What value of k should I use?", "60 is a well-tested default. Tune it only if your own evaluation shows a benefit."],
        ["Why not add the scores together?", "Vector and keyword scores are on different scales and distributions, so simple addition or averaging is unreliable."],
        ["Can I weight one retriever more?", "Yes, with a weighted variant. Start equal, and add weights only if testing supports it."],
        ["Do I still need a reranker?", "It is optional but often improves the final ordering, especially for the top few results."],
        ["Does Crescelo use RRF?", "Yes. Its retrieval merges vector and keyword results with reciprocal rank fusion."],
      ),
      p("See how retrieval feeds answers in the [AI assistant](/product/ai-assistant), try grounded answers in the [playground](/playground) and read [why chatbots make things up](/blog/grounded-ai-chatbot-hallucinations)."),
    ],
  }),

  pillar({
    slug: 'multi-turn-query-condensation-rag',
    title: 'Follow-Up Questions in RAG: Query Condensation and Rewriting for Chat',
    description: 'Why chat follow-ups break retrieval and how to fix it: resolving references, rewriting questions, using history, choosing rules or a model, risks and testing on real conversations.',
    primaryKeyword: 'multi-turn query condensation RAG',
    secondaryKeywords: ['conversational RAG follow-up questions', 'query rewriting chatbot', 'RAG chat history retrieval', 'standalone question rewriting'],
    body: [
      p("People do not talk to a chatbot in complete, self-contained questions. They say 'how much is it?', 'and for kids?', 'what about Saturday?', 'explain in detail'. Each of those makes perfect sense in context and none of them makes sense alone. A retrieval system that searches on the literal words of the latest message will return nothing useful for 'explain in detail', because the words carry no topic. This is one of the most common causes of a chatbot that seems to forget the conversation. The fix is to turn each follow-up into a standalone question before searching: query condensation, sometimes called query rewriting. This guide explains the problem, the main techniques from simple rules to model-based rewriting, the risks, how to combine them, how to test on real conversations and how Crescelo approaches it."),

      h2("The problem in one example"),
      table(["Turn", "Visitor says", "Search should use"], ["1", "How much is a colour treatment?", "How much is a colour treatment?"], ["2", "And with a cut?", "How much is a colour treatment with a cut?"], ["3", "What about for short hair?", "How much is a colour treatment with a cut for short hair?"], ["4", "Explain in detail", "Explain in detail the colour treatment with a cut for short hair"]),
      p("If retrieval sees only 'And with a cut?' it may find passages about haircuts, not the colour price. If it sees only 'Explain in detail' it may find nothing. The conversation supplies the missing context; the retrieval step has to use it."),

      h2("Why it matters more in chat"),
      ul("Chat messages are short and elliptical.", "Pronouns and references are constant: 'it', 'that one', 'the second option'.", "Visitors change topic without warning.", "Follow-ups are often the most valuable turns, where the visitor is closest to a decision."),
      p("A retrieval system that ignores history fails exactly when the visitor is engaged."),

      h2("Technique 1: rules that add the previous topic"),
      p("The simplest approach detects that a message cannot stand alone and prepends the previous user question. Signals include very short messages, pronouns, openers such as 'and', 'what about', 'how about', 'why', and phrases like 'in detail' or 'more'. It is instant, free and predictable."),
      table(["Strengths", "Weaknesses"], ["No model calls; no latency", "Crude: may add the wrong topic when the visitor changed subject"], ["Deterministic and easy to test", "Cannot resolve complex references"], ["Works offline and on cheap hardware", "Rules need maintenance across languages"]),

      h2("Technique 2: model-based rewriting"),
      p("A small language model reads the conversation and writes a standalone question, and sometimes several alternative phrasings. It handles subtle references and topic changes better than rules. The costs are an extra model call, added latency and the risk that the rewrite adds facts that were not in the conversation. Mitigations: use a small fast model, keep a strict timeout, cache results, instruct it to change as little as possible and fall back to the rules if it fails."),
      table(["Strengths", "Weaknesses"], ["Handles complex references", "Adds latency and cost"], ["Fixes typos and expands abbreviations", "May hallucinate context"], ["Can produce alternative phrasings for better recall", "Needs a fallback when it fails"]),

      h2("Technique 3: use both"),
      p("A robust pipeline applies the cheap rules first and, where enabled, a bounded model rewrite second, searching with both the condensed query and the original and fusing the results. If the rewrite fails or times out, the rules still work. Crescelo follows this pattern: it resolves follow-ups using the previous question by default, and can optionally use a small model to write a standalone question and alternative phrasings, each searched and fused, with a short timeout and caching so a failure falls back to the rules."),

      h2("What history to include"),
      ul("The last one or two user questions are usually enough.", "Include the assistant's last reply if the visitor refers to something it said ('the second option').", "Do not include the whole conversation: it dilutes the query and costs tokens.", "Reset context when the visitor clearly changes topic."),
      p("Cap the amount of history, and prefer the most recent turns."),

      h2("Broad and overview requests"),
      p("Some messages are not follow-ups but broad requests: 'tell me everything', 'what do you offer?', 'give me an overview'. Searching on those words finds little. A good system recognises them and retrieves a spread of passages across the knowledge base instead of a keyword match. Crescelo treats these as overview questions and pulls a representative set of passages. See [how to review your chatbot's conversations](/blog/audit-website-chatbot-conversations) for spotting such questions in your own logs."),

      h2("Risks and how to control them"),
      table(["Risk", "Example", "Control"], ["Wrong topic carried over", "Visitor moves from prices to parking, rule adds 'colour treatment'", "Only add context when the message is short or referential; drop it when the new message has its own topic words"], ["Invented detail in a rewrite", "Model adds 'for children' that no one said", "Instruct it to add nothing new; compare with the original"], ["Latency", "Extra model call", "Small model, timeout, caching"], ["Cost", "Rewrite on every message", "Only rewrite when needed"], ["Language drift", "Rewrite in the wrong language", "Keep the visitor's language"]),

      h2("How to test on real conversations"),
      ol("Collect twenty real multi-turn conversations, or write realistic ones.", "For each follow-up, note the passage that should be retrieved.", "Run retrieval with the raw message, with the rule-based condensation and with the model rewrite.", "Measure how often the right passage is in the top five for each.", "Read the failures: was the topic wrong, the rewrite invented or the passage missing?", "Repeat after any change to the rules, the model or the prompts."),
      p("Follow-ups are often underrepresented in test sets. Make sure yours includes them; our own retrieval evaluation showed that follow-up questions were the weakest category, which is exactly where condensation earns its keep."),

      h2("What the visitor should see"),
      p("Condensation is invisible, and it should be. The visitor asks 'and for kids?' and gets a sensible answer about kids for the same service, without repeating themselves. If the assistant is unsure what they mean, it should ask a clarifying question instead of guessing. See [the questions every service business chatbot should answer well](/blog/essential-chatbot-questions-service-business)."),

      h2("Common mistakes"),
      ul("Searching on the raw follow-up and blaming the knowledge base.", "Passing the whole conversation to the search, which drowns the topic.", "Rewriting every message even when it stands alone.", "Never testing multi-turn conversations.", "Letting a rewrite change the visitor's language."),

      h2("Frequently asked questions"),
      faq(
        ["What is query condensation?", "Turning a follow-up message into a standalone question, using the conversation history, before searching the knowledge base."],
        ["Why does my chatbot fail on follow-up questions?", "Because retrieval searches on the literal words of the latest message, which lack the topic. Condensing the question fixes this."],
        ["Do I need a language model for it?", "Not necessarily. Simple rules handle many follow-ups; a model handles complex ones."],
        ["How much history should I use?", "The last one or two user questions, plus the assistant's last reply if referred to."],
        ["Can rewriting make things worse?", "Yes, if it carries over the wrong topic or invents detail. Constrain it, cache it and fall back to rules."],
        ["How does Crescelo handle follow-ups?", "It resolves them using the previous question by default and can optionally use a small model to write standalone questions and alternatives."],
      ),
      p("See a follow-up in action in the [playground](/playground), read [hybrid search for RAG](/blog/hybrid-rag-dense-vector-sparse-keyword) and see the [AI assistant](/product/ai-assistant) feature."),
    ],
  }),

  pillar({
    slug: 'ocr-text-extraction-rag-knowledge-base',
    title: 'OCR for Your Chatbot Knowledge Base: Getting Text Out of Scans, Photos and Menus',
    description: 'How to get scanned documents, photos and images into a chatbot knowledge base: OCR basics, when vision models are better, quality checks, languages, tables and preparing files.',
    primaryKeyword: 'OCR knowledge base chatbot',
    secondaryKeywords: ['extract text from scanned PDF for RAG', 'OCR for AI assistant', 'image to text chatbot knowledge', 'scanned menu price list AI'],
    body: [
      p("Many small businesses keep their most useful information in the least searchable form: a photographed price list, a scanned brochure, a menu saved as an image, a PDF exported from a design tool with the text outlined. To a person these are perfectly readable. To an AI assistant they are blank: a picture of text is not text. Unless something converts the image into words, the assistant cannot answer questions about it, and it may confidently answer from older documents instead. This guide explains how text is extracted from images and scans, the two main approaches, optical character recognition (OCR) and vision AI models, how to choose between them, how to check the quality of what comes out, how to handle languages and tables and how to prepare files so the result is good. It also gives you a simple rule: whenever you can, provide the text itself."),

      h2("Why image-only files are a problem"),
      table(["File", "What is inside", "What the assistant sees without OCR"], ["Scanned PDF", "A picture of each page", "Nothing"], ["Photo of a price list", "Pixels", "Nothing"], ["Menu exported as a JPEG", "An image", "Nothing"], ["PDF from a design tool with outlined text", "Shapes that look like letters", "Nothing or gibberish"], ["A normal text PDF or Word file", "Real text", "The text"]),
      p("The first test is simple: open the file and try to select and copy a sentence. If you cannot, it is an image."),

      h2("Approach 1: classic OCR"),
      p("OCR software analyses an image, finds lines and characters and outputs text with a confidence score. Open-source engines such as Tesseract are widely used, work offline and cost nothing per page. They are good on clean, printed text in common languages, and weaker on handwriting, unusual fonts, low-resolution photos, curved pages and complex layouts."),
      table(["Strengths", "Weaknesses"], ["Free and local", "Sensitive to image quality, skew and shadows"], ["Fast on clean scans", "Struggles with tables, columns and handwriting"], ["Gives a confidence score", "Needs the right language pack"], ["No data leaves your servers", "Errors in numbers and prices can be subtle"]),

      h2("Approach 2: vision AI models"),
      p("Multimodal models can look at an image and describe it: transcribe the text, read a table, explain a diagram and note what a logo or badge means. They handle photos, layouts and messy pages better than classic OCR, and they can add useful context. The costs are per-image usage charges, some latency and a privacy consideration, since the image is sent to a model provider. With a bring-your-own-key setup, you choose the provider and pay them directly."),
      table(["Strengths", "Weaknesses"], ["Handles complex layouts, tables and photos", "Costs per image"], ["Understands diagrams and visual context", "Can occasionally misread or invent"], ["Better on imperfect images", "Sends the image to a provider"]),

      h2("How Crescelo handles images and scans"),
      p("Crescelo can read text from images and scanned documents when they are added to the knowledge base. It uses OCR for text extraction and, for images, can use a vision model through your connected provider to transcribe and describe the content. Image OCR and multimodal ingestion are part of the Growth plan. OCR reads English by default, so for other languages check the current language settings or provide text versions. Provider usage for vision is billed by your provider under your key."),

      h2("Choosing between them"),
      table(["Situation", "Better choice"], ["Clean scan of a typed document", "Classic OCR"], ["Phone photo of a menu or board", "Vision model"], ["Complex table or price grid", "Vision model, then check"], ["Sensitive document you do not want to send to a provider", "Local OCR"], ["Large batch on a small budget", "Local OCR"], ["Diagrams or product images", "Vision model"]),

      h2("Always check what came out"),
      ol("Open the extracted text next to the original.", "Check every price, number, date and phone number; these are where mistakes hurt.", "Look for missing sections, merged columns and scrambled table rows.", "Check names and unusual words.", "Fix errors in the source text or re-scan.", "Ask the assistant the questions the document answers and compare."),
      p("OCR confidence scores help: low-confidence pages deserve a closer look. But a high confidence score does not guarantee that a price is right, so check the numbers yourself."),

      h2("Prepare files to get good results"),
      ul("Scan at a reasonable resolution, such as 200 to 300 dots per inch for documents.", "Keep pages straight, evenly lit and free of shadows.", "For photos, shoot straight on, close enough to read, in good light.", "Avoid compression that blurs small text.", "Split multi-page scans into a clear order.", "Prefer the original digital file if you have it: export a PDF with real text, not a flattened image."),
      p("Better still, retype the key facts. A one-page text document of your prices is more reliable than any OCR of a photo."),

      h2("Tables and layouts"),
      p("Tables are the hardest case. OCR can flatten them into a stream of numbers in reading order, and the association between a row label and its price can be lost. Vision models do better, but check every row. For important price lists, convert them to plain text sentences such as 'Colour treatment, medium length: $95, about 2 hours'. See [document chunking strategies](/blog/document-chunking-strategies-pdf-docx) and [preparing your service menu and pricing documents](/blog/prepare-service-menu-pricing-docs-rag)."),

      h2("Languages"),
      ul("OCR needs the right language pack and script.", "Mixed-language documents can produce errors.", "Right-to-left and non-Latin scripts need engines that support them.", "Accented characters must be preserved, since they change words and names."),
      p("If you serve customers in several languages, test each. See [multilingual chatbots](/blog/multilingual-ai-website-chatbot)."),

      h2("Privacy and cost"),
      ul("Scans may contain personal or confidential information: remove or redact what the assistant does not need.", "Decide whether images may be sent to a provider, and check its terms.", "Vision models cost per image, so process only what you need.", "Delete source images after extraction if you do not need them."),

      h2("Worked example: a restaurant menu"),
      p("A restaurant's menu existed only as a photo of a chalkboard and a design-tool PDF with outlined text. Uploaded as they were, the assistant knew nothing about prices or allergens. The owner photographed the board straight on in good light, used a vision model to transcribe it, and checked every price against the board. She also retyped the allergen notes as text. Now the assistant answers 'is the salmon gluten free?' and 'how much is the tasting menu?' correctly, and she keeps a plain text version for future updates. The photo took a minute; the checking took twenty."),

      h2("Frequently asked questions"),
      faq(
        ["Can a chatbot read scanned PDFs and photos?", "Only if the text is extracted first with OCR or a vision model. Otherwise the file looks blank to the assistant."],
        ["How do I know if my PDF is an image?", "Try to select and copy text. If you cannot, it is an image and needs OCR."],
        ["Is OCR accurate?", "On clean printed text, usually. Check numbers, names and tables, because errors there are costly."],
        ["Does Crescelo support OCR?", "Yes. Image text extraction and multimodal ingestion are available on the Growth plan and above."],
        ["Should I use OCR or retype?", "For important facts such as prices, retype or export real text. Use OCR for the bulk."],
        ["Is it safe to send images to a vision model?", "Check the provider's terms and remove sensitive content first. With your own key, you choose the provider."],
      ),
      p("See the [knowledge base feature](/product/knowledge-base), try uploading a document in the [playground](/playground) and read [how to add your knowledge to a chatbot](/blog/deploy-ai-website-assistant-step-by-step)."),
    ],
  }),

  pillar({
    slug: 'tabular-data-ingestion-semantic-csv-rag',
    title: 'Spreadsheets and CSV in a Chatbot Knowledge Base: How to Make Tabular Data Answerable',
    description: 'How to turn CSV and spreadsheet data into answers: why tables retrieve badly, row-to-sentence conversion, summaries, column names, sizes, counts and what not to upload.',
    primaryKeyword: 'CSV RAG chatbot',
    secondaryKeywords: ['spreadsheet knowledge base AI', 'tabular data ingestion', 'price list CSV chatbot', 'structured data RAG'],
    body: [
      p("Businesses keep a great deal of knowledge in spreadsheets: price lists, product catalogues, class timetables, member lists, service areas, staff rotas. It is natural to upload the file to a chatbot and expect it to answer questions about it. Often it does not, or it answers wrongly. The reason is that retrieval systems are built for prose. A table of rows and columns, flattened into text, loses the link between a row's label and its values, and a question like 'how many members joined in March?' is a calculation, not a lookup. This guide explains why tabular data is awkward for retrieval, how to prepare a spreadsheet so that an assistant can answer questions about it, when to convert rows to sentences, how summaries help with counts and totals, what sizes to expect, what you should not upload and how to test. Crescelo reads CSV and similar files and adds a dataset overview to help with broad questions."),

      h2("Why tables are hard for retrieval"),
      table(["Problem", "Example"], ["Lost headers", "A chunk contains '95, 120, 2 hours' with no idea which service or column"], ["Split rows", "A row is cut across two chunks"], ["Meaningless numbers", "The number 95 alone says nothing"], ["Calculations", "Totals, averages and counts cannot be found; they must be computed"], ["Large tables", "Thousands of rows overwhelm the search and the model"], ["Ambiguous columns", "'Type' or 'Status' means different things in different sheets"]),
      p("Retrieval finds passages that resemble the question. A row of numbers resembles nothing a visitor would type."),

      h2("Technique 1: turn each row into a sentence"),
      p("Convert every row into a short sentence that includes the column names. The sentence is searchable, understandable and self-contained."),
      table(["Row in the sheet", "Sentence for the assistant"], ["Colour | medium | 95 | 2 hours", "Colour treatment, medium length hair: $95, takes about 2 hours."], ["Class | Pilates | Tue 18:30 | Studio A | 12 places", "Pilates class on Tuesday at 18:30 in Studio A, 12 places."], ["Item | SKU-4471 | In stock | $34", "Item SKU-4471 is in stock and costs $34."]),
      p("Crescelo's file parsing for CSV keeps column names with each row, so rows are searchable and readable. Where you can, tidy the header names first: 'Price (USD)' is better than 'P'."),

      h2("Technique 2: add a summary block"),
      p("Questions about counts, totals and breakdowns cannot be answered by retrieving a few rows. Add summary text that answers the common ones: how many rows, the main categories and their counts, ranges of prices or dates, and the most common values. Crescelo adds a dataset overview for uploaded tables, describing the columns and summarising categories, and prioritises it for questions about counts and overviews. You can improve on it by writing your own summary in a text document."),
      table(["Question", "Needs"], ["What is the cheapest service?", "A sorted list or a summary line"], ["How many classes do you run a week?", "A count in the summary"], ["What does the price list cover?", "An overview of categories"], ["Price of colour for long hair", "The specific row sentence"]),

      h2("Technique 3: split big tables by topic"),
      p("A single sheet with a thousand rows is unwieldy. Split it into meaningful parts: by category, by location or by date. Give each part a clear title. A file called 'Colour prices' retrieves better than one giant 'Prices' file with everything in it."),

      h2("Technique 4: keep the source of truth elsewhere for calculations"),
      p("An assistant is not a spreadsheet. For calculations that must be exact, such as totals, live stock or balances, use a system built for it, and let the assistant answer descriptive questions from the data. Do not rely on a language model to add columns of figures. If the answer is a simple aggregate, put the aggregate in the text."),

      h2("What not to upload"),
      ul("Personal data such as member lists with names, emails and phone numbers, unless you need the assistant to answer about individuals and have the legal basis.", "Financial records and anything confidential.", "Live data that changes hourly, such as stock levels, unless you can keep it updated.", "Huge exports of everything, when only a small part is useful.", "Files with merged cells, multiple header rows or notes in cells, without cleaning."),
      p("If a dataset contains personal information, tell visitors what the assistant uses and follow your privacy rules. See the [GDPR checklist for website chatbots](/blog/website-chatbot-gdpr-checklist)."),

      h2("Prepare the file"),
      ol("Use one header row with clear names.", "Remove blank rows and columns, merged cells and decorative formatting.", "Put units in the header: 'Duration (minutes)', 'Price (USD)'.", "Keep one table per sheet, or one topic per file.", "Save as CSV (UTF-8) or a simple spreadsheet format.", "Add a short text note describing what the file contains and its date."),

      h2("Test it"),
      table(["Test question", "What to check"], ["What does [specific item] cost?", "Correct row and value"], ["Do you have anything under $50?", "Reasonable list or a summary; not invented"], ["How many items are there in total?", "Correct count or an honest 'I do not know'"], ["A question with a typo", "Still finds the right row"], ["A question not covered by the data", "Says it does not know"]),
      p("Fix problems by improving the file, not by adding rules. See [how to stop a chatbot from making things up](/blog/grounded-ai-chatbot-hallucinations)."),

      h2("Worked example: a class timetable"),
      p("A studio uploaded its timetable spreadsheet, and the assistant answered 'what time is Pilates on Tuesday?' wrongly. The sheet had merged cells for days, a blank column and abbreviated headers. The owner cleaned the sheet into one row per class with the columns 'Class', 'Day', 'Start time', 'Room' and 'Places', and added a short note: 'Timetable valid from 1 September. Classes marked Beginner are suitable for first-timers.' After re-uploading, the assistant answered correctly, including 'which classes are good for beginners?', because the note gave it the meaning. Ten minutes of cleaning fixed the problem."),

      h2("Common mistakes"),
      ul("Uploading a raw export with merged cells and abbreviations.", "Expecting the assistant to add up columns.", "Leaving stale versions of the same sheet in the knowledge base.", "Uploading personal data that is not needed.", "Skipping tests with real questions."),

      h2("Frequently asked questions"),
      faq(
        ["Can a chatbot answer questions from a CSV file?", "Yes, for lookups, if rows are searchable with their column names. For counts and totals, add summaries."],
        ["Why does my chatbot give wrong prices from my spreadsheet?", "Often because headers were lost or rows split. Clean the file, keep column names with each row and test."],
        ["Should I convert rows into sentences?", "Where possible, yes. Sentences are easier to retrieve and understand."],
        ["Can it do calculations?", "Do not rely on it for exact arithmetic. Provide summaries or use a system built for calculations."],
        ["How big can the file be?", "Limits depend on your plan's knowledge storage. Split large files by topic and upload only what you need."],
        ["Is it safe to upload member lists?", "Only if you have a lawful basis and the assistant needs it. Prefer to leave personal data out."],
      ),
      p("See the [knowledge base feature](/product/knowledge-base), try uploading a table in the [playground](/playground) and read [preparing your service menu and pricing documents](/blog/prepare-service-menu-pricing-docs-rag)."),
    ],
  }),

  pillar({
    slug: 'benchmarking-rag-retrieval-metrics-business',
    title: 'How to Measure Chatbot Retrieval Quality: Hit Rate, MRR and a Test Set Any Business Can Build',
    description: 'A practical guide to measuring RAG retrieval for a business chatbot: building a test set, hit rate, recall, MRR, nDCG, abstain tests, reading results and tracking improvement.',
    primaryKeyword: 'RAG retrieval metrics',
    secondaryKeywords: ['evaluate RAG chatbot', 'hit rate MRR nDCG', 'retrieval test set', 'measure chatbot accuracy'],
    body: [
      p("It is easy to ask a chatbot five questions, like the answers and declare it good. It is much harder, and much more valuable, to know how often it finds the right information across all the questions your customers actually ask, and whether it improves or worsens when you change something. Retrieval quality, whether the right passage is found before the model writes an answer, is the foundation of accuracy, and it can be measured with a small test set and a few simple metrics. This guide explains how to build that test set from your own business, the metrics that matter (hit rate, recall, mean reciprocal rank, nDCG and abstain behaviour), how to run the test, how to read the numbers, how to compare changes fairly and what good looks like. It uses the same ideas as the evaluation we run on Crescelo's own retrieval."),

      h2("Why measure retrieval separately"),
      p("A chatbot answer can be wrong for two reasons: the right passage was never retrieved, or it was retrieved and the model misused it. They need different fixes. Measuring retrieval on its own tells you which problem you have. If the right passage is usually in the top five, improving answers is a matter of instructions and model choice. If it is often missing, no instruction will help; you must fix content, chunking or search."),

      h2("Build a test set"),
      ol("Collect 30 to 100 real questions from emails, calls, chat logs and your team. Include typos and slang.", "For each question, identify the passage or passages in your documents that answer it.", "Add different question types: factual, numeric, paraphrased, follow-up, overview and questions that need several passages.", "Add 10 to 20 questions your documents do not answer, to test abstaining.", "Record everything in a spreadsheet: question, type, the document and section that answers it."),
      table(["Question type", "Example"], ["Factual", "How long is a first appointment?"], ["Numeric", "How much is a colour treatment?"], ["Paraphrase", "What does it cost to dye my hair?"], ["Synonym", "Do you do teeth whitening or bleaching?"], ["Typo", "hw much for a colur"], ["Follow-up", "And for kids?"], ["Overview", "What services do you offer?"], ["Unanswerable", "Do you sell gift cards for pets?"]),
      p("A test set of fifty well-chosen questions reveals most problems. More is better, but quality matters more than quantity."),

      h2("The metrics"),
      table(["Metric", "Question it answers", "How to compute"], ["Hit rate at k", "Is the right passage in the top k results?", "Questions with a hit divided by all questions"], ["Recall at k", "How much of the needed evidence was found?", "Needed passages found divided by needed passages"], ["Precision at k", "How many of the returned passages help?", "Helpful passages divided by k"], ["Mean reciprocal rank (MRR)", "How high is the first right passage?", "Average of 1 divided by its rank"], ["nDCG at k", "Are the most relevant passages ranked highest?", "Discounted gain, normalised to the ideal order"]),
      p("For a chatbot, hit rate at 5 and MRR are the most useful starting pair: one says whether the answer is found, the other how high it ranks."),

      h2("Abstain behaviour"),
      p("A good assistant should know when it does not know. Measure this separately: for the unanswerable questions, how often does retrieval return confident-looking passages that would tempt the model to answer? A useful test is to compare the best similarity score for answerable questions with the best score for unanswerable ones. If the two groups separate well, you can set a threshold below which the assistant says it does not know. A measure called AUC summarises how well a score separates the groups; 0.5 means no separation and 1.0 means perfect."),
      table(["Group", "Best similarity score (example)"], ["Answerable questions", "0.73 on average"], ["Unanswerable questions", "0.56 on average"]),
      p("In our own evaluation of Crescelo's default retrieval, answerable questions scored around 0.73 and unanswerable ones around 0.56, which separated well enough to support a confidence gate. Each embedding model scores similarity on its own scale, so each needs its own threshold."),

      h2("Run the test"),
      ol("Load your documents into a test assistant.", "For each question, run retrieval and record the top five passages.", "Mark whether each contains the needed evidence.", "Compute hit rate at 3 and 5, MRR and, if you like, recall and nDCG.", "Break results down by question type.", "List the failures and study them."),
      p("You can do this by hand in a spreadsheet for fifty questions. Developers can automate it with a script that calls the retrieval function and compares results with the test set. We run an evaluation harness on Crescelo's own retrieval that computes these metrics on a golden set."),

      h2("Read the results"),
      table(["Pattern", "Likely cause", "Fix"], ["Low hit rate overall", "Documents missing, poorly chunked or retrieval misconfigured", "Add content; improve chunking; check search"], ["Good on factual, poor on paraphrase", "Weak meaning-based search", "Improve embeddings or synonyms; use hybrid search"], ["Good on paraphrase, poor on codes and names", "Weak keyword search", "Ensure keyword matching is included"], ["Poor on follow-ups", "History ignored", "Add query condensation; see [follow-up questions in RAG](/blog/multi-turn-query-condensation-rag)"], ["Poor on overview questions", "Broad queries find nothing specific", "Retrieve a spread of passages for overview intents"], ["High hit rate but low MRR", "Right passage found but ranked low", "Add reranking"], ["Unanswerable questions score high", "Weak abstain separation", "Adjust the threshold; tighten instructions"]),

      h2("Compare changes fairly"),
      ul("Change one thing at a time: chunk size, embedding model, fusion constant or synonym list.", "Run the same test set before and after.", "Look at metrics by question type, not only the overall number.", "Watch for regressions: a change that helps one type may hurt another.", "Keep a log of changes and results.", "Beware of small test sets: a difference of one or two questions is noise."),
      table(["Change", "Hit rate at 5", "MRR", "Decision"], ["Baseline", "93%", "0.70", "-"], ["Smaller chunks", "91%", "0.72", "Mixed; keep old"], ["Add synonym list", "95%", "0.74", "Keep"], ["Add reranking", "95%", "0.79", "Keep"]),
      p("The numbers above are illustrative. What matters is the habit of measuring."),

      h2("What good looks like"),
      p("There is no universal target, because it depends on your content and questions. As a rough guide for a small business knowledge base, a hit rate at 5 above about 90 percent on a realistic test set is a solid result, and the remaining misses are worth examining one by one. On our own golden set of business questions, Crescelo's default retrieval places the needed evidence in the top five about 95 percent of the time, with follow-ups and overview questions the weakest areas. Your own set will show your own strengths and gaps."),

      h2("Beyond retrieval: measure answers too"),
      ul("**Faithfulness:** does the answer stick to the retrieved passages?", "**Completeness:** does it include the key facts?", "**Refusal quality:** does it admit ignorance when it should?", "**Tone:** does it sound like your business?"),
      p("These are harder to compute automatically; a weekly human review of a sample is the practical method. See [how to review your chatbot's conversations](/blog/audit-website-chatbot-conversations)."),

      h2("Frequently asked questions"),
      faq(
        ["What is hit rate in RAG?", "The share of test questions for which the needed passage appears in the top k results."],
        ["How many test questions do I need?", "Thirty to one hundred real questions is enough to reveal most problems."],
        ["What is MRR?", "Mean reciprocal rank: the average of 1 divided by the rank of the first correct passage, so higher means the right passage ranks nearer the top."],
        ["Why test unanswerable questions?", "To check the assistant can tell when its knowledge does not contain the answer, which protects against confident wrong answers."],
        ["How often should I run the test?", "After any change to documents, chunking, embedding model or search settings, and quarterly otherwise."],
        ["Does Crescelo measure retrieval quality?", "We do, internally: we run an evaluation harness that reports hit rate, recall, MRR, nDCG and abstain separation on a golden set whenever we change retrieval."],
      ),
      p("Try your own questions in the [playground](/playground), read [hybrid search for RAG](/blog/hybrid-rag-dense-vector-sparse-keyword) and see the [AI assistant](/product/ai-assistant) feature."),
    ],
  }),
];
