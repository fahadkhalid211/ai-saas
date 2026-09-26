import { faq, h2, ol, p, pillar, table, ul } from '../authoring';

export const PILLAR29 = [
  pillar({
    slug: 'unanswered-chat-questions-knowledge-gaps',
    title: "Your Assistant's Unanswered Questions Are a To-Do List: How to Turn Them Into Better Answers",
    description: 'How to use the questions your chatbot could not answer: where to find them, grouping themes, writing short answers, deciding what not to add, and a weekly routine that improves accuracy.',
    primaryKeyword: 'chatbot unanswered questions',
    secondaryKeywords: ['fix chatbot knowledge gaps', 'improve chatbot answers', 'missing answers knowledge base', 'chatbot training from conversations'],
    body: [
      p("Every time your assistant says it does not know something, a real customer has told you what they wanted and what your content was missing. That is more useful than any survey. Yet many businesses set up a chatbot, watch the first week, and never look at the list of questions it could not answer. The list quietly grows. Visitors ask about parking, gift vouchers, whether you treat children, and the assistant apologises and offers a person. Each one is a small lost sale or an unnecessary phone call. This guide shows how to turn that list into a to-do list. It explains where the unanswered questions come from, how to sort them into themes, how to write the short answers that fix most of them, which questions you should deliberately not answer, how to check that a fix worked and how to build a fifteen-minute weekly habit. In Crescelo, every question the assistant could not answer from your content is logged, and you can write a short answer that is added to the knowledge base directly from the list."),

      h2("Where the list comes from"),
      p("A grounded assistant looks up passages in your content before answering. When nothing relevant is found, it does not guess: it says it does not know and offers a booking, a form or a person. That event is logged as an unanswered question, along with the wording the visitor used. The list is therefore an honest record of the gaps between what customers ask and what your content contains."),
      table(["What the list shows", "Why it is valuable"], ["The exact words visitors use", "Lets you write content in their language"], ["Frequency", "Shows which gaps matter most"], ["Topics you never thought of", "Reveals blind spots"], ["Seasonal patterns", "Shows what to add before busy periods"], ["Things you do not offer", "Shows demand you could meet, or should explain you do not serve"]),

      h2("Step 1: Group the questions into themes"),
      p("Reading fifty individual questions is tiring; sorting them into five or six themes makes the work obvious."),
      table(["Theme", "Examples", "Typical fix"], ["Practical details", "Parking, accessibility, what to bring", "A short 'visiting us' section"], ["Pricing edge cases", "Do you charge extra for long hair? Is there a student price?", "Add the rule to the price document"], ["Policies", "Refunds, late arrival, children", "A policy paragraph"], ["Services you do not list", "Do you do [unlisted service]?", "Add the service, or say clearly you do not offer it"], ["Advice", "Which option suits me?", "A short guide or comparison"], ["Off-topic", "Weather, jokes, unrelated requests", "Ignore; the assistant should decline politely"]),

      h2("Step 2: Write short, factual answers"),
      ul("Answer the question in one to three sentences.", "Use the customer's words in the heading or first sentence.", "Include the numbers or facts: 'Yes, there is free parking behind the building for up to two hours.'", "Say what happens next if it depends: 'We treat children over five; please call to book a child's appointment.'", "Only write what is true and current."),
      table(["Question", "Weak fix", "Good fix"], ["Is there parking?", "We have plenty of options.", "Free parking behind the building for two hours; spaces on Mill Street are pay and display."], ["Do you treat children?", "Yes.", "Yes, from age five. Children under 12 must be accompanied by an adult."], ["Can I bring a friend?", "Please ask.", "Yes, one guest may wait in reception; guests cannot come into the treatment room."]),
      p("A one-sentence answer added straight from the unanswered list is often enough, and it is stored in the knowledge base for good. For anything longer or more formal, update the relevant document or page, so there is one source of truth."),

      h2("Step 3: Decide what not to answer"),
      p("Not every gap should be filled. Some questions are better handled by a person, and some the assistant should decline."),
      table(["Question type", "What to do"], ["Personal, medical, legal or financial advice", "Leave it to a qualified person; add a rule that the assistant hands over"], ["Complaints and disputes", "Hand over with the details; see [when and how to hand over](/blog/live-human-handover-flow-design)"], ["Confidential business information", "Never add it to the knowledge base"], ["Exact quotes for custom jobs", "Explain how quotes work and capture the details"], ["Off-topic chat", "The assistant declines politely"]),
      p("Write clear instructions for the assistant about these categories, and check its behaviour with test questions."),

      h2("Step 4: Check that the fix worked"),
      ol("Ask the original question, in the visitor's words, in the playground or your own widget.", "Ask two or three variations, including a casual phrase.", "Check that the answer is right and short.", "Check that a related question still gets a correct answer.", "Mark the item done in your notes."),
      p("If the fix did not work, the answer may be too far from the question's wording; add the customer's phrase to the heading. See [synonyms in search](/blog/domain-synonym-clusters-rag-search)."),

      h2("A fifteen-minute weekly routine"),
      table(["Minute", "Task"], ["0 to 3", "Open the unanswered list and scan for repeats"], ["3 to 8", "Pick the top three themes; write or update the answers"], ["8 to 12", "Test the fixes with the original wording"], ["12 to 15", "Note anything that needs a person, such as a policy decision"]),
      p("The first month yields the largest gains because the biggest gaps are fixed first. After that, the list shrinks and the effort drops."),

      h2("Use the list beyond the chat"),
      ul("Add popular questions to your website's FAQ page, which also helps search visibility.", "Tell staff about recurring questions so they can prepare.", "Fix the cause on your website: if everyone asks about parking, put it on the contact page.", "Spot demand: many questions about a service you do not list may point to an opportunity.", "Note the phrases customers use for future marketing copy."),

      h2("Watch for wrong answers too"),
      p("Unanswered questions are the visible gaps. Wrong answers are harder to spot, so sample conversations as well: read five a week and check them against your documents. If you find an incorrect answer, correct the source, then test again. Crescelo lets you correct an answer, and the correction is stored for later questions. Measure trends with [the chat analytics playbook](/blog/service-business-chat-analytics-playbook)."),

      h2("Common mistakes"),
      ul("Never opening the list.", "Writing long answers where one sentence would do.", "Adding contradictory facts in different places.", "Filling every gap, including ones a person should handle.", "Forgetting to test the fix.", "Leaving outdated answers in place."),

      h2("Frequently asked questions"),
      faq(
        ["What is an unanswered question?", "A question the assistant could not answer from your content. It is logged so you can fill the gap."],
        ["Where do I see them in Crescelo?", "In the dashboard's Overview and the unanswered list, where you can write a short answer that is added to the knowledge base."],
        ["How often should I check?", "A fifteen-minute review each week is enough for most small businesses."],
        ["Should I answer every question?", "No. Leave personal advice, complaints and confidential matters to people, and let the assistant decline off-topic requests."],
        ["How long should an answer be?", "One to three sentences with the key facts and what happens next."],
        ["How do I know the fix worked?", "Ask the original question again in the visitor's words, plus a variation, and check the answer."],
      ),
      p("See the [knowledge base feature](/product/knowledge-base), test answers in the [playground](/playground) and read [what an assistant should do when it does not know](/blog/handling-obscure-customer-inquiries-fallbacks)."),
    ],
  }),

  pillar({
    slug: 'handling-obscure-customer-inquiries-fallbacks',
    title: 'What an AI Assistant Should Do When It Does Not Know the Answer',
    description: 'Designing good fallbacks for a chatbot: admitting uncertainty, offering next steps, capturing details, handing over, avoiding guesses, wording examples and testing the edge cases.',
    primaryKeyword: 'chatbot fallback when it does not know',
    secondaryKeywords: ['chatbot I do not know response', 'AI assistant fallback design', 'handle unknown questions chatbot', 'graceful chatbot failure'],
    body: [
      p("Every assistant reaches the limit of what it knows. A visitor asks about a service you have never described, a policy you have not written down or something unrelated to your business altogether. What the assistant does next says more about your business than its correct answers do. A confident guess can mislead a customer, create a dispute or promise something you cannot deliver. A cold 'I do not understand' leaves them stuck. A good fallback does three things: it is honest about not knowing, it points the visitor to a useful next step and it keeps the conversation moving toward something the customer needs, whether that is a booking, a callback or an answer from a person. This guide explains why fallbacks matter, describes the main kinds of 'I do not know' situations, gives wording examples, shows how to design next steps, explains why the assistant should never guess and how to test edge cases. It describes how Crescelo behaves: when nothing in your content answers a question, the assistant says so and offers a booking form or a person, and the gap is logged so you can fill it."),

      h2("Why fallbacks matter"),
      ul("A wrong answer given confidently costs more than an honest gap.", "Visitors forgive 'I do not know' if it comes with a way forward.", "The fallback is the moment a chatbot either loses or saves a customer.", "Each fallback is data: it shows what to add to your content."),

      h2("The kinds of not knowing"),
      table(["Situation", "Example", "Best response"], ["Missing information", "'Do you do wedding hair trials?' (not in the documents)", "Say you do not have that information; offer a callback or a person"], ["Outside your services", "'Can you fix my laptop?' to a hairdresser", "Say it is not something you offer, kindly, and stop"], ["Needs a person's judgement", "'Can I get a discount for my group?'", "Explain that a team member decides, and capture details"], ["Sensitive or personal advice", "'Is this treatment safe with my condition?'", "Explain that only a qualified person can advise; offer a call"], ["Ambiguous", "'How much is it?' without saying what", "Ask a clarifying question"], ["Off-topic", "'Tell me a joke'", "Politely steer back to what you can help with"], ["Account-specific", "'Where is my booking?'", "Say the assistant cannot see personal bookings; point to the confirmation link or a person"]),

      h2("The four parts of a good fallback"),
      ol("**Be honest:** 'I do not have that information.'", "**Do not guess:** avoid phrases like 'probably' when the answer matters.", "**Offer a next step:** book, leave details, call, or ask a person.", "**Stay helpful:** offer related information that you do have."),
      table(["Weak", "Good"], ["I do not understand.", "I do not have information about wedding trials. Would you like to leave your details so the team can reply, or shall I show you our booking times for a consultation?"], ["I am sorry, I cannot help with that.", "That is not something we offer, but I can help with haircuts, colour and treatments. What would you like to know?"], ["Probably yes, but I am not sure.", "I do not want to give you the wrong information. Let me pass your question to the team; can I take your email?"]),

      h2("Choose next steps that fit"),
      table(["Next step", "When to use it", "In Crescelo"], ["Book an appointment", "The visitor wants to proceed and the question can be answered in person", "Offer available times in the chat"], ["Leave details for a callback", "The answer needs a person", "Lead form fields you choose; alerts by email, Slack, Sheets or webhook"], ["Speak to a person now", "Urgent or sensitive", "Handover to your team with the conversation attached"], ["Read a page", "You have the information elsewhere", "Link to it"], ["Try a different question", "Ambiguous request", "Ask a clarifying question"]),
      p("Match the step to the situation. Offering a booking for every unknown question feels pushy; offering a person for every trivial one wastes time."),

      h2("Never guess in the areas that matter"),
      ul("Prices, availability and policies must come from your documents, never from the model's general knowledge.", "Health, legal and financial questions should be handed to a qualified person.", "Promises about results, guarantees and timelines must come from your own content.", "Instruct the assistant explicitly: 'If the answer is not in the documents, say you do not know and offer a next step. Do not invent prices, hours, policies or guarantees.'"),
      p("This is the purpose of a grounded assistant; see [how to stop a chatbot from making things up](/blog/grounded-ai-chatbot-hallucinations). Even so, always test with questions you know the documents cannot answer."),

      h2("Tone: honest without being robotic"),
      ul("Keep the apology short: one 'sorry' is enough.", "Use natural language and avoid corporate wording.", "Show you have understood the question, so they do not feel ignored.", "Avoid repeating the same fallback sentence over and over; if the visitor keeps asking things you cannot answer, escalate.", "Keep the brand voice; see [making the assistant sound like your business](/blog/brand-voice-alignment-ai-receptionist)."),

      h2("Loop protection"),
      p("A visitor who receives 'I do not know' twice in a row is losing patience. Set a rule that after two failed answers, the assistant offers a person or takes details. Otherwise conversations turn into a maze of polite refusals. Crescelo's handover options let you choose when to offer a person; see [handover design](/blog/live-human-handover-flow-design)."),

      h2("Use the gaps"),
      p("Each fallback is a log entry. Review them weekly and fill the ones that recur; see [your assistant's unanswered questions are a to-do list](/blog/unanswered-chat-questions-knowledge-gaps). A good assistant gets better because its gaps are systematically closed."),

      h2("Test your fallbacks"),
      table(["Test", "What good looks like"], ["A question the documents cannot answer", "Honest, no invention, offers a next step"], ["An off-topic question", "Polite decline and redirect"], ["A sensitive question", "Hands over to a person, no advice"], ["An ambiguous question", "Asks a short clarifying question"], ["Three unknowns in a row", "Offers a person or takes details"], ["A question in another language", "Handles it gracefully or explains language support"]),
      p("Keep these as a standing checklist and repeat after any change to instructions or documents."),

      h2("Common mistakes"),
      ul("Letting the assistant guess to avoid saying no.", "Offering no next step.", "Repeating the same canned apology.", "Sending every unknown question to a person.", "Never reading the fallback log.", "Failing to test out-of-scope requests."),

      h2("Frequently asked questions"),
      faq(
        ["What should a chatbot say when it does not know?", "Say honestly that it does not have that information and offer a useful next step, such as a booking, leaving details or speaking to a person."],
        ["Why should the assistant not guess?", "A confident wrong answer about prices, policies or advice can mislead customers and cause disputes."],
        ["What does Crescelo do when it does not know?", "It says so and offers a booking form or a person, and logs the question so you can fill the gap."],
        ["How do I avoid a frustrating loop?", "After two unanswered questions, offer a person or take contact details."],
        ["Should the assistant answer off-topic questions?", "It should politely decline and steer back to what it can help with."],
        ["How do I test fallbacks?", "Ask questions you know the documents cannot answer, sensitive questions and off-topic ones, and check the response."],
      ),
      p("See the [AI assistant feature](/product/ai-assistant), the [human handover feature](/product/human-handover) and try edge cases in the [playground](/playground)."),
    ],
  }),

  pillar({
    slug: 'heatmaps-vs-chat-transcripts-friction',
    title: 'Heatmaps or Chat Transcripts: What Each Tells You About Where Visitors Struggle',
    description: 'Compare website heatmaps with chat transcripts for finding friction: what each shows, blind spots, how to combine them, a workflow for small teams and what to fix first.',
    primaryKeyword: 'heatmaps vs chat transcripts',
    secondaryKeywords: ['website friction analysis', 'understand visitor behaviour', 'chat transcript analysis', 'conversion problems small business'],
    body: [
      p("When a website is not converting, owners tend to reach for one of two kinds of evidence. Heatmaps and session recordings show where visitors click, scroll and hesitate. Chat transcripts show what visitors actually say when they cannot find what they need. Both are useful, and they answer different questions. A heatmap tells you what people did; a transcript tells you why they were confused, in their own words. Used together, they can find friction faster than either alone, and neither needs a large budget or a data team. This guide explains what each shows and what it hides, which problems each is best at revealing, how to combine them in a simple monthly workflow, what to fix first and the privacy points to respect. It is written for small businesses with a website and a chat assistant, and it avoids implying that one replaces the other."),

      h2("What a heatmap shows"),
      ul("**Click maps:** where people click or tap, including things that are not links.", "**Scroll maps:** how far down the page visitors go.", "**Move maps:** where cursors hover on desktop, which loosely tracks attention.", "**Session recordings:** replays of visits, showing hesitation and frustration."),
      table(["Strength", "Limit"], ["Shows real behaviour, not opinions", "Does not say why someone clicked or left"], ["Reveals dead clicks, ignored buttons and buried content", "Mobile behaviour is harder to read"], ["Works without visitors having to say anything", "Needs enough traffic to be reliable"], ["Good at layout and design problems", "Can raise privacy concerns if recordings capture personal data"]),

      h2("What chat transcripts show"),
      ul("The exact questions visitors ask, in their words.", "What they could not find on the page.", "Objections: price, trust, timing.", "Intent: whether they were ready to book or just browsing.", "Where the conversation ended, and what the last message was."),
      table(["Strength", "Limit"], ["Explains the reason behind an action", "Only covers visitors who chose to chat"], ["Reveals missing content and unclear wording", "Does not show what people did on the page"], ["Feeds directly into improving documents", "Needs someone to read a sample"], ["Captures intent and language for marketing copy", "Volume can be small on low-traffic sites"]),

      h2("What each is best for"),
      table(["Question", "Best source"], ["Are people seeing my booking button?", "Heatmap and scroll map"], ["Why do they not book?", "Transcripts"], ["Which page do people give up on?", "Heatmaps and recordings, plus analytics"], ["What information is missing from that page?", "Transcripts"], ["Is a design change working?", "Heatmap before and after"], ["What words do customers use?", "Transcripts"], ["Are mobile visitors struggling?", "Recordings, checked on a phone yourself"]),

      h2("The blind spots"),
      p("A heatmap of a pricing page might show that visitors scroll to the price table and then leave. It cannot tell you whether the price was too high, the conditions were unclear or the visitor simply had the answer they wanted. A transcript that includes 'is that per hour or per visit?' points straight to the confusion. Conversely, transcripts miss the silent majority who never open the chat. A heatmap shows those visitors' behaviour. Neither has the whole picture."),

      h2("A simple monthly workflow"),
      ol("**Pick one page** that matters, such as your services or contact page.", "**Look at the heatmap and scroll map** for that page. Note ignored elements, dead clicks and where most people stop scrolling.", "**Read the chat transcripts** that started on or mentioned that page: what did they ask? Sample twenty.", "**Form a hypothesis:** for example, 'Visitors want the price but it is below the fold.'", "**Make one change:** move the price up, add a sentence, rename a button.", "**Check again in a few weeks:** look at the heatmap and the questions asked."),
      p("One page, one change, one comparison. It is slower than redesigning the whole site, but you learn what works."),

      h2("Common patterns and fixes"),
      table(["Heatmap sign", "Transcript sign", "Likely fix"], ["Many clicks on non-clickable text", "Visitors asking how to do it", "Make it a link or add a button"], ["Scroll stops before the price", "Questions about price early in the chat", "Move price information up"], ["Booking button ignored", "Visitors asking 'can I book online?'", "Make the button clearer; the assistant can offer times"], ["Rapid back-and-forth clicking", "Complaints that a page does not work", "Test on the reported device"], ["Visitors reach the contact page and leave", "Questions about location or parking", "Add the details to the page"]),

      h2("Privacy and consent"),
      ul("Heatmap and recording tools use cookies or similar technologies; get consent where the law requires it.", "Mask form fields and any personal data in recordings.", "Do not record on pages with sensitive information.", "Tell visitors what you collect in your privacy notice.", "Chat transcripts contain what visitors typed: handle them as personal data, limit access and set retention; see [GDPR checklist for website chatbots](/blog/website-chatbot-gdpr-checklist)."),

      h2("If you have no heatmap tool"),
      p("You can learn a lot without one. Look at your analytics for pages with high exit rates, walk through your website on a phone, and read transcripts. Add a heatmap when you have a specific question that behaviour data would answer. Where a chat assistant is present, the questions people ask on each page are a heatmap of confusion in words; see [where and when visitors open the chat](/blog/heatmapping-chat-widget-engagement)."),

      h2("Common mistakes"),
      ul("Looking at heatmaps without asking a specific question.", "Ignoring transcripts because there are 'too few'.", "Changing many things at once.", "Recording visitors without consent or masking.", "Treating a heatmap as proof of why."),

      h2("A worked example"),
      p("A physiotherapy clinic sees that few visitors reach the booking button on its services page. The scroll map shows most people stop about halfway down, above the button. Twenty chat transcripts from that page contain the same questions: 'How long is a session?', 'Do I need a referral?' and 'Is it covered by insurance?'. The clinic moves a short summary of duration, referral rules and insurance to the top of the page and places the booking button beside it. A month later the scroll map shows more visitors reaching the button, and those three questions almost vanish from the chat. Neither source alone would have told the whole story: the heatmap found the problem area, and the transcripts supplied the fix."),
      table(["Evidence", "Finding", "Action"], ["Scroll map", "Most visitors stop before the button", "Move key information and the button up"], ["Transcripts", "Same three questions repeated", "Answer them at the top of the page"], ["Follow-up", "Fewer repeat questions, more clicks", "Keep the change; look at the next page"]),
      p("This pattern applies to any page that matters: find where behaviour stalls, find what people ask, fix the gap and check again."),

      h2("Frequently asked questions"),
      faq(
        ["Are heatmaps or chat transcripts better?", "Neither. Heatmaps show what visitors do, transcripts show what they say and why. Together they find friction faster."],
        ["Do I need a heatmap tool?", "Not to start. Analytics, a phone walkthrough and chat transcripts already reveal a lot. Add a heatmap for specific questions."],
        ["How many transcripts should I read?", "About twenty for a page or topic is enough to see patterns."],
        ["Is recording visitors legal?", "It depends on where you operate. Get consent where required, mask personal data and disclose it in your privacy notice."],
        ["What should I fix first?", "Missing or buried key information such as price, hours and how to book."],
        ["How do I know the fix worked?", "Compare the heatmap and the questions people ask before and after."],
      ),
      p("See the [AI assistant feature](/product/ai-assistant), the [playground](/playground) and read [tracking where chat visitors drop off](/blog/tracking-in-chat-funnel-drop-off)."),
    ],
  }),

  pillar({
    slug: 'attribution-modeling-marketing-channels-chat-leads',
    title: 'Which Marketing Channel Brought That Chat Lead? A Simple Approach to Attribution',
    description: 'How small businesses can track where chat leads come from: asking, UTM links, landing pages, a lead sheet, simple attribution models and their limits, without expensive tools.',
    primaryKeyword: 'marketing attribution for chat leads',
    secondaryKeywords: ['track lead source small business', 'UTM parameters chatbot', 'where do my leads come from', 'simple attribution model'],
    body: [
      p("You run ads, post on social media, appear in search results, hand out flyers and get referrals. A lead arrives through the chat on your website. Which of those efforts earned it? Working that out is called attribution, and it matters because it tells you where to spend the next hour or the next pound. Big companies use complicated models and dedicated tools. A small business can get most of the value from three habits: asking people how they found you, tagging links so your analytics can see them and keeping a simple lead sheet that records the source. This guide explains what attribution is, why it is imperfect, how to collect source information from chat leads, how to use UTM tags, how to compare channels fairly, which simple models to use and what to avoid. It is honest about Crescelo's role: it captures leads and the conversations behind them, and lets you choose form fields, so you can ask 'How did you hear about us?', but it does not automatically track advertising campaigns or marketing sources for you."),

      h2("Why attribution is hard"),
      ul("Customers use several touchpoints: they see an ad, search your name, read a review and then chat.", "Browsers and privacy tools limit tracking.", "Word of mouth and offline sources leave no digital trail.", "The last click is not necessarily the reason they chose you."),
      p("Perfect attribution does not exist. The goal is a good enough picture to decide where to invest."),

      h2("Method 1: just ask"),
      p("The simplest and most useful method is to ask the customer. Add a field to your lead form, or have the assistant ask naturally after a helpful answer: 'By the way, how did you hear about us?' Offer common options plus 'other'."),
      table(["Options to offer", "Notes"], ["Google search", "Includes maps"], ["Social media (which one?)", "Ask which platform if you use several"], ["A friend or family member", "Referral"], ["An advert", "Where?"], ["A flyer or local paper", "Offline"], ["Saw you in person", "Offline"], ["Other", "Free text"]),
      p("Self-reported sources are subjective, but they capture what analytics cannot, such as recommendations and offline exposure. Crescelo lets you choose lead form fields, so you can add this question and see the answer with each lead."),

      h2("Method 2: tag your links with UTM parameters"),
      p("UTM parameters are labels added to a link so analytics tools can see where a visit came from. For links you control, such as ads, newsletters, social posts and your bio link, add them."),
      table(["Parameter", "Meaning", "Example"], ["utm_source", "Where the link was placed", "instagram"], ["utm_medium", "The type of channel", "social, email, cpc"], ["utm_campaign", "The campaign or promotion", "spring-offer"]),
      p("Example: yoursite.com/book?utm_source=instagram&utm_medium=social&utm_campaign=spring-offer. Your website analytics then groups visits by these labels. Keep naming consistent: lowercase, no spaces. Note that Crescelo does not read UTM tags into leads itself, so pair this with the 'how did you hear' question, or compare chat volume with visits from each source in your analytics."),

      h2("Method 3: give channels their own landing pages"),
      p("A dedicated page for each major channel, such as a hosted page for your Instagram bio link, lets you count visits and chats per channel. Crescelo's hosted pages let you create a page with its own assistant and link; using a separate page per channel makes the source clear from where the visitor started. See [Instagram and TikTok bio links that lead straight to booking](/blog/social-bio-link-in-chat-booking)."),

      h2("Method 4: a lead sheet"),
      table(["Column", "Purpose"], ["Date", "When the lead arrived"], ["Name and contact", "Who they are"], ["Service", "What they wanted"], ["Self-reported source", "From the form question"], ["Tagged source", "If known from analytics or the landing page"], ["Outcome", "Won, lost, no reply"], ["Value", "The revenue if won"]),
      p("Crescelo can send leads to Google Sheets, which makes this straightforward. Add the outcome and value columns yourself as jobs are won."),

      h2("Simple attribution models"),
      table(["Model", "How it works", "Use when"], ["First touch", "Credit the first known source", "You want to know what brings new people in"], ["Last touch", "Credit the source just before the lead", "You want to know what closes"], ["Self-reported", "Credit what the customer says", "You are a small business with limited tracking"], ["Split", "Share credit between sources", "You have data on several touchpoints"]),
      p("For most small businesses, the self-reported source combined with tagged links is enough. Do not chase complex models before you have a reliable lead sheet."),

      h2("Compare channels fairly"),
      ul("Divide leads by cost: cost per lead for each paid channel.", "Go further and compute cost per won job, using the outcome column.", "Consider lead quality: a channel with fewer, better leads may be more valuable.", "Allow for time: some channels take weeks to show results.", "Value free channels: search visibility and referrals cost time, not ad spend."),
      table(["Channel", "Leads", "Won", "Spend", "Cost per won job"], ["Search ads", "20", "5", "$400", "$80"], ["Instagram", "12", "2", "$100", "$50"], ["Referrals", "8", "6", "$0", "$0 (but time)"]),
      p("The numbers above are illustrative. Note how the lead count alone would hide the fact that referrals convert best."),

      h2("Privacy and consent"),
      ul("Analytics and advertising cookies need consent in many places.", "Explain why you ask how someone found you; it is optional.", "Do not collect more than you need.", "See [privacy law for lead capture](/blog/chatbot-lead-capture-gdpr-ccpa-compliance)."),

      h2("Common mistakes"),
      ul("Trusting last click alone.", "Ignoring offline and referral sources.", "Inconsistent UTM names.", "Never recording outcomes, so you count leads but not customers.", "Assuming the platform tracks campaigns when it does not.", "Over-engineering before you have data."),

      h2("A worked example"),
      p("A cleaning company asks each chat lead 'How did you hear about us?' and records the answer in a Google Sheet. After three months, the sheet shows 30 leads from search, 18 from social media, 11 from friends and 6 from flyers. Recording the outcome shows that referrals were won far more often than the others, while social leads mostly asked for prices and never replied. The owner decides to add a small thank-you offer for customers who recommend a friend, cut back on social advertising and improve the services page for search visitors. None of this needed special software, only a form question and a spreadsheet kept up to date."),
      table(["Source", "Leads", "Won", "Win rate"], ["Search", "30", "9", "30%"], ["Social media", "18", "2", "11%"], ["Friend or family", "11", "8", "73%"], ["Flyer", "6", "1", "17%"]),
      p("These are illustrative numbers. Your own table will look different, and that is the point: it shows where your next hour or pound is best spent."),

      h2("Frequently asked questions"),
      faq(
        ["How do I know where my chat leads come from?", "Ask them with a lead form question, tag your links with UTM parameters and keep a lead sheet that records the source and outcome."],
        ["Does Crescelo track marketing campaigns?", "No. It captures leads and conversations and lets you add a 'how did you hear about us' field. Use your analytics for campaign tracking."],
        ["What are UTM parameters?", "Labels added to links so analytics tools can group visits by source, medium and campaign."],
        ["Is asking customers reliable?", "It is subjective but captures word of mouth and offline sources that tracking misses. Use it alongside tagged links."],
        ["How do I compare channels?", "Compare cost per won job, not just leads, and consider lead quality."],
        ["Do I need special software?", "No. A lead sheet, consistent link tags and a form question are enough to start."],
      ),
      p("See the [lead capture feature](/product/lead-capture), [pricing](/pricing) and read [chat analytics for service businesses](/blog/service-business-chat-analytics-playbook)."),
    ],
  }),

  pillar({
    slug: 'executive-reporting-ai-assistant-performance',
    title: 'A One-Page Monthly Report on Your AI Assistant: What to Include and How to Read It',
    description: 'How to write a simple monthly report on chatbot performance: the metrics to include, a template, commentary, cost and value, actions, and how to present it to owners or clients.',
    primaryKeyword: 'AI assistant monthly report',
    secondaryKeywords: ['chatbot performance report', 'chatbot ROI report template', 'report chatbot results to owner', 'monthly chat analytics summary'],
    body: [
      p("A chatbot that quietly does its job can be invisible to the people paying for it. The owner sees a monthly subscription and wonders what it delivers. A manager sees fewer phone calls but cannot say how many. An agency runs assistants for clients and needs to show they are worth renewing. A short monthly report solves all of these: one page that says what happened, what it was worth, what needs attention and what will change next month. It does not need charts of everything; the point is to make decisions easy. This guide gives you a simple structure for a one-page report, explains which numbers to include and which to skip, shows how to add honest commentary, how to handle cost and value, how to end with actions and how to present it to different audiences. It uses the kinds of information available from your Crescelo dashboard, such as conversations, leads, bookings and unanswered questions, and avoids inventing metrics the platform does not provide."),

      h2("Principles of a good report"),
      ul("**One page.** If it does not fit, you are including too much.", "**Answers, not data.** Each number should support a point.", "**Compare with last month** so trends are visible.", "**Honest.** Include what did not work.", "**Ends with actions.** A report without decisions is a diary."),

      h2("The template"),
      table(["Section", "Content"], ["1. Headline", "Two sentences: the main result and the main issue"], ["2. Key numbers", "Five or six figures, with change from last month"], ["3. What we learned", "Three to four short observations from conversations"], ["4. Cost and value", "What it cost and what it produced, modestly stated"], ["5. Problems and risks", "Anything that went wrong or needs attention"], ["6. Actions", "What will change next month, and who owns it"]),

      h2("Choose the key numbers"),
      table(["Number", "Why it belongs"], ["Conversations", "The size of the activity"], ["Leads captured", "The direct business output"], ["Bookings made", "The most tangible outcome"], ["Questions answered without staff", "Time saved, estimated with care"], ["Unanswered questions", "Quality and where to improve"], ["Handovers to a person", "Complexity and staff involvement"]),
      p("Use only figures you can get from your dashboard and conversations. Do not include vanity numbers such as total messages, which say little. If you cannot measure something, do not estimate it and present it as fact."),

      h2("Add commentary that a reader can use"),
      p("Numbers need interpretation. For each key number, add a sentence saying what it means."),
      table(["Number", "Weak comment", "Useful comment"], ["Leads: 42 (up from 35)", "Leads increased.", "Leads rose by seven, mostly after we added prices to the services page."], ["Unanswered: 31 (down from 48)", "Fewer unanswered.", "We added answers on parking and children's appointments; the remaining gaps are mostly about wedding packages."], ["Handovers: 9", "Nine handovers.", "Six were complaints or custom quotes, which is appropriate; three were routine and we have fixed the documents."]),

      h2("Cost and value, honestly"),
      ul("**Cost:** the subscription plus AI usage at your provider, if you bring your own key. Include a few minutes of staff time to maintain it.", "**Value:** bookings made through chat, multiplied by their typical value; leads, weighted by your normal conversion rate; staff time saved, only if the time was reallocated.", "**Caveats:** some of those customers might have booked anyway. Say so."),
      table(["Item", "Example"], ["Monthly cost", "$149 plan plus about $12 AI usage"], ["Bookings from chat", "14"], ["Average booking value", "$70"], ["Indicative value", "About $980, before allowing for people who would have booked anyway"]),
      p("A cautious statement is more persuasive than an inflated one. See [chat analytics for service businesses](/blog/service-business-chat-analytics-playbook) for how to value outcomes."),

      h2("Problems and risks"),
      ul("Wrong answers found in the month, and how they were fixed.", "Outages or slow responses.", "Complaints about the assistant.", "Content that is out of date.", "Upcoming changes, such as a price change, that need the documents updated."),
      p("Reporting problems builds trust. A report with no problems either means nothing was checked or something is being hidden."),

      h2("Actions for next month"),
      table(["Action", "Owner", "Due"], ["Add wedding package details to the knowledge base", "Sam", "Week 1"], ["Test the new price list questions", "Priya", "Week 2"], ["Review five handovers", "Owner", "Week 3"], ["Update opening hours for the holiday", "Sam", "Before the 20th"]),
      p("Keep to three to five actions, each with a name and a date."),

      h2("Tailor it to the reader"),
      table(["Reader", "Emphasise"], ["Owner", "Leads, bookings, cost and value"], ["Front desk manager", "Handovers, unanswered questions, workload"], ["Client of an agency", "Outcomes, improvements made, plan for next month"], ["Marketing lead", "Popular questions, sources of leads, content ideas"]),
      p("If you serve several readers, keep the core page the same and add a short section for each."),

      h2("Make it a routine"),
      ol("Choose a fixed day, such as the first Monday.", "Gather the numbers in fifteen minutes from the dashboard.", "Read five conversations to write the commentary.", "Fill the template.", "Share it, and discuss the actions in a short meeting.", "Save the reports, so you can look back over the year."),

      h2("Common mistakes"),
      ul("Reporting everything.", "Numbers without meaning.", "Overstating value.", "Hiding problems.", "No actions.", "Not comparing with the previous month."),

      h2("A filled-in example"),
      table(["Section", "Example"], ["Headline", "Chat produced 42 leads and 14 bookings in March, up from 35 and 11. Wedding-package questions are the biggest gap."], ["Key numbers", "Conversations 310 (+8%); leads 42 (+7); bookings 14 (+3); unanswered 31 (-17); handovers 9 (same)"], ["What we learned", "Visitors ask about parking, children and wedding packages; price questions convert best when a range is stated"], ["Cost and value", "Cost about $161; indicative booking value about $980, before allowing for people who would have booked anyway"], ["Problems", "One wrong answer about Saturday hours, fixed the same day; the opening hours document was out of date"], ["Actions", "Add wedding details; review five handovers; check hours before each holiday"]),
      p("Everything above fits on one page, can be read in two minutes and leads directly to decisions. Notice that it says what went wrong and what was done about it."),

      h2("Store and compare reports"),
      p("Keep every report in one folder. After six months, read them in order: you will see which changes helped, which numbers move with the seasons and whether the same problems keep returning. That history is worth more than any single month, and it makes renewal or budget conversations easy because you can show a trend, not just a snapshot."),

      h2("When the numbers are small"),
      p("A small business may have only a few dozen conversations a month. Do not let that discourage reporting: small numbers still show direction, and every conversation can be read. Focus on the qualitative sections, what visitors asked and what you changed, and avoid drawing firm conclusions from a swing of two or three leads. Say plainly when a change is within normal variation."),

      h2("Frequently asked questions"),
      faq(
        ["What should a chatbot report include?", "Key numbers such as conversations, leads, bookings, unanswered questions and handovers, plus commentary, cost and value, problems and actions."],
        ["How long should it be?", "One page. If it needs more, you are probably including too much."],
        ["How do I calculate value?", "Multiply bookings and likely leads by typical value, subtract cost and be cautious about attribution."],
        ["Where do I get the numbers?", "From the dashboard's conversations, leads and bookings, plus your own sampling of transcripts."],
        ["Should I include bad news?", "Yes. Problems and fixes build trust and show that the assistant is being managed."],
        ["How often should I report?", "Monthly, with a short weekly check on unanswered questions."],
      ),
      p("See the [AI assistant feature](/product/ai-assistant), [pricing](/pricing) and read [where chat visitors drop off](/blog/tracking-in-chat-funnel-drop-off) and [first contact resolution](/blog/first-contact-resolution-fcr-ai-chat)."),
    ],
  }),
];
