import { faq, h2, ol, p, pillar, table, ul } from '../authoring';

export const PILLAR30 = [
  pillar({
    slug: 'modern-website-chatbot-architecture',
    title: 'How a Website Chat Widget Is Built: The Moving Parts, Explained for Non-Engineers',
    description: 'A plain-English tour of how an AI website chat widget works: the script, the widget, the server, retrieval, the AI provider, streaming, storage and what can go wrong at each step.',
    primaryKeyword: 'how a website chatbot works',
    secondaryKeywords: ['chatbot architecture explained', 'AI chat widget components', 'how does an AI chatbot work', 'RAG chatbot architecture'],
    body: [
      p("From the outside, an AI chat widget looks simple: a small bubble appears in the corner, you type a question and an answer streams back. Behind that bubble sits a chain of separate parts, each with a job, each able to fail or slow down, and each affecting speed, accuracy, cost and security. You do not need to be an engineer to benefit from understanding them. Knowing the parts helps you ask better questions when comparing products, diagnose problems ('the answers are slow' or 'it ignored my document'), decide where your data goes and judge claims made in marketing pages. This guide walks through the journey of one visitor's question from the click on your website to the answer on the screen, describing each component in plain language: the embed script, the widget, the chat server, retrieval from your documents, the AI provider, streaming, storage and the dashboard. It describes how Crescelo is put together where that is useful, and it flags where things commonly go wrong."),

      h2("The journey in one picture"),
      table(["Step", "What happens", "Where it runs"], ["1. Page loads", "Your website loads a small script", "Visitor's browser"], ["2. Widget appears", "The script fetches your assistant's settings and draws the chat bubble", "Visitor's browser"], ["3. Visitor asks", "The message is sent to the chat server", "Visitor's browser to the platform's server"], ["4. Checks", "The server checks the request is allowed and within limits", "Platform server"], ["5. Retrieval", "The server searches your documents for the best passages", "Platform server and database"], ["6. Generation", "The passages and the question go to the AI model, which writes the reply", "AI provider"], ["7. Streaming", "The reply is sent back word by word", "Server to browser"], ["8. Storage", "The conversation, and any lead or booking, is saved", "Database"]),

      h2("1 and 2: the embed script and the widget"),
      p("You paste one line of code into your website. It loads a script from the platform, which fetches the assistant's settings, such as name, colours, welcome message and starter questions, and draws the chat bubble. Two design choices matter here. First, the widget should not damage your site: Crescelo's widget draws itself inside a Shadow DOM, which keeps its styles separate from your page's, so your site's CSS cannot break the widget and the widget cannot restyle your site; see [why chat widgets use Shadow DOM](/blog/shadow-dom-website-chatbot-widgets). Second, it should be light, so it does not slow your page; see [performance of embedded chat widgets](/blog/performance-optimization-embedded-chat-widgets)."),

      h2("3 and 4: the request and the checks"),
      p("When the visitor sends a message, the widget sends it over the internet to the platform's chat server. Before doing any work, a careful server checks the request:"),
      ul("Is it for a real assistant that is switched on?", "Is the sender within rate limits, so one visitor or script cannot flood the service?", "Is the plan's monthly session allowance still available?", "Does the request look like abuse, such as a huge message or a bot?", "Which workspace owns this assistant, so data is kept apart from other customers?"),
      p("These checks protect both you and the platform. They are also where much of the security work lives; see [keeping one customer's data away from another](/blog/multi-tenant-saas-chatbot-architecture)."),

      h2("5: retrieval, finding the right passages"),
      p("This is where a grounded assistant differs from a general chatbot. Rather than answering from memory, the server searches your documents first. Your content was split into passages and indexed earlier, both by meaning (vector search) and by keywords. The question is used to find the most relevant passages, which are merged and reranked. See [reciprocal rank fusion](/blog/reciprocal-rank-fusion-rrf-rag). Recent messages are considered too, so a follow-up such as 'and on Saturdays?' is understood; see [multi-turn query condensation](/blog/multi-turn-query-condensation-rag)."),
      table(["If retrieval is good", "If retrieval is poor"], ["Answers quote your real prices and policies", "The assistant misses information that is in your documents"], ["It says it does not know when nothing matches", "It may answer from irrelevant passages"], ["Follow-ups make sense", "Follow-ups lose the thread"]),

      h2("6: generation, the AI model writes the reply"),
      p("The server sends the question, the recent conversation, the retrieved passages and your instructions to a language model at an AI provider such as OpenAI, Anthropic, Google, Groq or DeepSeek. With bring-your-own-key, the request uses your account and your key, which the platform stores encrypted; see [bring your own AI key explained](/blog/bring-your-own-ai-key-byok-explained). The model writes the reply from the passages, following your rules about tone and topics. This step is the slowest and the main source of cost. It also has limits: a provider may be busy or rate limited, so a good platform can fall back to another model, and it should detect a reply that stops mid-sentence and ask the model to continue."),

      h2("7: streaming the answer back"),
      p("Instead of waiting for the whole reply, the server sends it to the browser as it is generated, so words appear almost immediately. This uses a one-way connection called Server-Sent Events; see [streaming replies: SSE versus WebSockets](/blog/sse-vs-websockets-ai-chatbot-streaming). It makes a multi-second answer feel quick."),

      h2("8: storage and actions"),
      ul("**Conversation:** each message is saved so you can read the transcript and the visitor can continue where they left off.", "**Leads:** if the visitor gives contact details, the lead is saved and sent to your email, Slack, Google Sheets or a webhook.", "**Bookings:** if they book, the slot is locked, saved and confirmed by email.", "**Unanswered questions:** questions the assistant could not answer are logged so you can fill the gaps.", "**Usage:** sessions and AI usage are counted for your plan."),

      h2("The parts you manage"),
      table(["Part", "What you control"], ["Dashboard", "Settings, knowledge, instructions, leads, conversations, team"], ["Knowledge base", "Which documents, pages and videos the assistant knows"], ["AI provider", "Which provider and model answer, using your key"], ["Channels", "Website widget, hosted page, WhatsApp and Telegram on eligible plans"], ["Integrations", "Email, Slack, Sheets, webhooks"]),

      h2("Where things go wrong"),
      table(["Symptom", "Likely part", "What to check"], ["Widget does not appear", "Embed script", "Is the script installed and the domain allowed?"], ["Slow first reply", "Provider or retrieval", "Try another model; check knowledge base size"], ["Wrong or missing facts", "Knowledge base and retrieval", "Check the document, the wording and the unanswered list"], ["Reply cut off", "Provider limits", "Modern platforms continue replies; report if it persists"], ["Booking confusion", "Booking settings", "Check hours, slot length and confirmations"], ["Invented answers", "Instructions and grounding", "Tighten instructions; test unknown questions"]),

      h2("Questions to ask any vendor"),
      ul("Where does my data live, and how is it separated from other customers?", "Which AI providers can I use, and can I bring my own key?", "How do you make sure answers come from my content?", "What happens when the AI provider is down?", "How are keys and secrets protected?", "Can I export my data and leave?"),

      h2("Frequently asked questions"),
      faq(
        ["How does an AI website chatbot work?", "A script loads a widget on your site; each question goes to a server, which searches your documents, sends the best passages to an AI model and streams the reply back."],
        ["Where does the AI model run?", "At the AI provider you choose, such as OpenAI, Anthropic, Google, Groq or DeepSeek. Your documents are searched on the platform."],
        ["Why do answers come from my documents?", "Because retrieval finds relevant passages first and the model is instructed to answer from them, saying it does not know otherwise."],
        ["Can the widget break my website?", "A well-built widget isolates its styles and loads lightly. Crescelo's widget uses a Shadow DOM."],
        ["What makes replies appear word by word?", "Streaming: the server sends parts of the reply as they are generated."],
        ["What do I control?", "Your documents, instructions, provider and key, channels, integrations and team access."],
      ),
      p("See the [website widget feature](/product/website-widget), try the whole chain in the [playground](/playground) and read [pricing](/pricing)."),
    ],
  }),

  pillar({
    slug: 'multi-tenant-saas-chatbot-architecture',
    title: "Keeping One Customer's Data Away From Another: Multi-Tenant Security in a Chatbot Platform",
    description: 'How multi-tenant chatbot platforms isolate customers: workspace scoping, authorisation checks, IDOR and BOLA risks, per-tenant search, secrets, testing, and questions to ask your vendor.',
    primaryKeyword: 'multi-tenant SaaS data isolation',
    secondaryKeywords: ['tenant isolation chatbot', 'BOLA IDOR prevention', 'SaaS workspace security', 'customer data separation'],
    body: [
      p("Most business software, including chatbot platforms, is multi-tenant: many customers share the same application and database, each in their own workspace. It is efficient and keeps prices low, but it carries one serious risk. If the software ever mixes up whose data is whose, one customer can see another's conversations, leads or documents. For a chatbot, that could mean your visitors' messages, your price list or your customer contact details appearing in someone else's dashboard, or someone else's private notes surfacing in your assistant's answers. Such failures are rarely dramatic hacks; they are usually small mistakes, like a missing ownership check on one endpoint. This guide explains in plain language how tenant isolation works, the classic mistakes known as IDOR and BOLA, the layers of protection a careful platform uses, how retrieval and secrets are kept apart, how such systems are tested and what questions to ask any vendor. It describes the approach Crescelo takes without claiming certifications it does not hold."),

      h2("What multi-tenant means"),
      table(["Model", "How it works", "Trade-off"], ["Multi-tenant", "One application and database, data tagged by workspace", "Efficient and affordable; needs rigorous access checks"], ["Single-tenant", "Each customer gets their own copy of the system", "Stronger separation, higher cost and effort"], ["Hybrid", "Shared application, separate databases or schemas for some customers", "Middle ground for larger customers"]),
      p("Multi-tenant is perfectly safe when it is done carefully, and most modern software-as-a-service works this way. The care is in the details."),

      h2("The core idea: every record belongs to a workspace"),
      p("Every conversation, lead, document, assistant and setting carries the identifier of the workspace that owns it. Every request from a logged-in user carries the identity of their workspace, taken from the session, not from anything the user can type. Every read or write must check that the record's workspace matches the requester's. If any step forgets this check, that step is a hole."),

      h2("IDOR and BOLA: the classic mistakes"),
      p("IDOR stands for insecure direct object reference, and BOLA for broken object level authorisation. Both describe the same flaw: the server accepts an identifier from the request, such as an assistant number, and returns the record without checking that the requester is allowed to see it. An attacker, or a curious customer, simply changes the number in the address and receives someone else's data."),
      table(["Request", "Unsafe behaviour", "Safe behaviour"], ["Get conversation 1234", "Returns it to anyone who asks", "Returns it only if it belongs to the requester's workspace"], ["Update assistant abc", "Applies the change if the id exists", "Checks the assistant belongs to the requester's workspace first"], ["Download lead export", "Uses a workspace id from the address", "Uses the workspace from the authenticated session"], ["List sources", "Lists everything", "Lists only the requester's"]),
      p("Sequential or guessable identifiers make this worse, though unguessable identifiers alone are not a defence: the check must exist regardless."),

      h2("Layers of protection"),
      ol("**Authenticate:** know who is calling. Sessions are checked against the account's current state on every request, so removing a member ends their access immediately.", "**Take the workspace from the session,** never from the request body.", "**Check ownership** of the specific record before reading or changing it. In Crescelo, a guard verifies that an assistant belongs to the caller's workspace before any action on it.", "**Check the role:** within the workspace, roles limit what each member can do; see [securing your chatbot account](/blog/setup-rbac-2fa-team-security).", "**Scope queries** so the database only returns rows for the workspace.", "**Test** that cross-workspace access is refused."),
      p("The platform owner's master-admin role is a deliberate exception, used for support and administration, and it should itself be protected with strong authentication and logging."),

      h2("Isolating search and answers"),
      p("Retrieval brings a special risk: the assistant must only find passages from the right workspace and, within it, from the right assistant. The search is filtered by assistant and workspace before ranking, not afterwards, so another customer's passage can never be a candidate for an answer. If it were filtered after ranking, a stray passage could leak into the context sent to the AI model. Embedding and re-embedding jobs follow the same rule."),

      h2("Secrets and keys"),
      ul("Each customer's AI provider key is stored encrypted and used only for that customer's requests; see [how a key vault works](/blog/cryptographic-byok-vault-aes-256-gcm).", "Keys are never sent to visitors' browsers.", "Public widget requests use tokens tied to a single conversation rather than credentials that unlock the workspace; see [signed visitor tokens](/blog/visitor-capability-tokens-hmac-sha256).", "Outbound webhooks are signed so the receiver can verify them."),

      h2("Rate limits and abuse controls per tenant"),
      p("Isolation is also about fairness. One customer's traffic spike or abuse must not degrade service for others. Per-assistant and per-visitor rate limits, session allowances by plan and spending guards protect the platform and each customer's budget."),

      h2("How to test isolation"),
      table(["Test", "Expected result"], ["Log in as workspace A and request a workspace B record by id", "Refused"], ["Change ids in every endpoint of the dashboard", "Refused or not found"], ["Ask workspace A's assistant about something only in workspace B's documents", "It does not know"], ["Remove a team member and reuse their session", "Refused at once"], ["Try a viewer role on an admin action", "Forbidden"]),
      p("Crescelo's automated tests include cross-workspace and ownership checks for API routes, and they run before each release. Automated tests find many issues; independent security testing adds assurance, and we do not claim formal certifications."),

      h2("Questions to ask your vendor"),
      ul("How is my workspace's data separated from other customers'?", "Do you check ownership on every record access, and do you test for cross-tenant access?", "How is search isolated between customers?", "How are provider keys stored?", "Can support staff see my data, and is that access logged?", "Do you have a data processing agreement and a list of sub-processors?"),
      p("Look for specific answers. See [how your data is protected](/privacy) and the [sub-processors](/subprocessors) page."),

      h2("Common mistakes"),
      ul("Trusting an id from the request without an ownership check.", "Filtering search results after ranking.", "Guessable ids with no authorisation.", "Shared credentials between tenants.", "No tests for cross-tenant access.", "Over-broad admin access."),

      h2("What this means for you as a customer"),
      ul("Use named accounts and the smallest suitable roles for your team, so your own workspace is protected from the inside.", "Turn on two-factor sign-in for owners and admins.", "Keep confidential material out of the knowledge base unless the assistant is meant to use it.", "Ask your vendor for a data processing agreement and a list of sub-processors, and keep copies.", "Tell the vendor at once if you ever see data that is not yours."),
      p("Isolation is the platform's responsibility, and good practice inside your workspace is yours. Together they keep customers' information where it belongs."),

      h2("Frequently asked questions"),
      faq(
        ["What does multi-tenant mean?", "Many customers share one application and database, with each customer's data kept in its own workspace."],
        ["Is multi-tenant software safe?", "Yes, when every request checks that the record belongs to the caller's workspace and this is tested."],
        ["What is BOLA or IDOR?", "A flaw where a server returns a record by id without checking the requester is allowed to see it."],
        ["Can another customer's documents appear in my assistant's answers?", "Not in a properly isolated platform: search is filtered by workspace and assistant before ranking."],
        ["How does Crescelo test this?", "Automated tests check cross-workspace access and ownership for API routes. We do not claim formal security certifications."],
        ["What should I ask a vendor?", "How data is separated, how ownership is checked, how search and keys are isolated and who can access your data."],
      ),
      p("See the [data processing addendum](/dpa), the [human handover feature](/product/human-handover), the [knowledge base feature](/product/knowledge-base), [pricing](/pricing) and read [how a chat widget is built](/blog/modern-website-chatbot-architecture)."),
    ],
  }),

  pillar({
    slug: 'shadow-dom-website-chatbot-widgets',
    title: 'Why Chat Widgets Use Shadow DOM: Protecting Your Website (and the Widget)',
    description: 'What Shadow DOM is and why embedded chat widgets use it: style isolation, fewer conflicts, accessibility notes, trade-offs against iframes, and how to check a widget will not break your site.',
    primaryKeyword: 'Shadow DOM chat widget',
    secondaryKeywords: ['embed chat widget without breaking CSS', 'iframe vs shadow DOM widget', 'chat widget style isolation', 'third party widget conflicts'],
    body: [
      p("Adding a chat widget means putting someone else's code on your website. That raises two worries for the site owner. Will the widget break my page, changing fonts or layouts through stray styles? And will my page break the widget, so that a global style rule turns its buttons into something unrecognisable? Both happen more often than they should, especially on sites built with page builders or heavy themes. Modern browsers offer a mechanism designed for exactly this problem: Shadow DOM. It lets a widget draw itself inside a sealed compartment of the page where its styles and structure are separate from everything else. This guide explains in plain language what Shadow DOM is, how it compares with the older approach of using an iframe, what it does and does not protect, where accessibility and other trade-offs arise, and how to test that any widget will behave on your site. Crescelo's widget uses a Shadow DOM; a separate embedded page option uses an iframe."),

      h2("The problem: styles collide"),
      p("Web pages use CSS rules to control appearance, and rules can apply broadly. A site theme might say that every button is orange with large text, or that all paragraphs have a certain margin. A widget's buttons and text are ordinary page elements, so those rules can reach them and distort the widget. In the other direction, a widget with carelessly written CSS can change the appearance of the site's own elements."),
      table(["Collision", "Symptom"], ["Site styles hit the widget", "Distorted buttons, wrong fonts, overlapping text in the chat"], ["Widget styles hit the site", "Your headings or links change after the widget loads"], ["Class name clash", "Both use a class named 'button' or 'container' with different meanings"], ["Script conflicts", "Two scripts overwrite each other's global variables"]),

      h2("What Shadow DOM is"),
      p("Shadow DOM lets a script attach a hidden, self-contained tree of elements to a host element on the page. Styles defined inside it apply only inside it, and most styles from the page do not leak in. The widget appears on the page like any element, but it has its own sealed styling scope. It is a standard part of modern browsers, not a special plug-in."),
      ul("**Style isolation:** the widget's CSS stays inside; the page's CSS does not restyle it.", "**No class-name clashes:** names inside do not conflict with names outside.", "**Clean markup:** the widget sits under a single host element, keeping your page structure tidy.", "**Some things do pass through,** such as inherited properties like font family and colour unless the widget resets them, which a well-built widget does explicitly."),

      h2("Shadow DOM versus iframe"),
      table(["Aspect", "Shadow DOM", "Iframe"], ["Style isolation", "Strong for CSS", "Complete; separate document"], ["Script isolation", "Shares the page's JavaScript environment", "Separate; cannot touch the page's scripts"], ["Security boundary", "Not a security boundary", "A stronger boundary, particularly across origins"], ["Performance", "Light; part of the page", "Heavier; a separate page load"], ["Integration", "Can respond to page events, size and layout naturally", "Needs messages to communicate with the page"], ["Accessibility and focus", "Behaves like page content when done properly", "Needs care for focus and screen readers across the frame"], ["Best for", "A floating widget that should feel part of the site", "Embedding a whole page or app that must be fully isolated"]),
      p("Neither is universally better. A floating chat bubble suits Shadow DOM. Embedding a full application, such as a booking page or a hosted chat page inside another site, suits an iframe. Crescelo uses a Shadow DOM for its website widget and offers an embeddable page for other placements."),

      h2("What Shadow DOM does not do"),
      ul("It is not a security sandbox: scripts on your page can still reach into an open shadow tree, so it does not stop a malicious script on your own site.", "It does not protect against slow scripts or heavy loads; performance is a separate concern.", "It does not replace good CSS hygiene inside the widget.", "It does not fix accessibility problems by itself."),
      p("Security for the conversation comes from the server side: rate limits, signed tokens and workspace checks; see [signed visitor tokens](/blog/visitor-capability-tokens-hmac-sha256)."),

      h2("Accessibility notes"),
      ul("Keyboard users must be able to reach the launcher, open the chat, move through it and close it.", "Focus should move sensibly when the chat opens and return when it closes.", "The chat should have suitable labels for screen readers.", "Text must have sufficient contrast, including with your custom colours.", "Streaming text should not flood screen readers with repeated announcements.", "Respect reduced-motion preferences."),
      p("Shadow DOM changes how some assistive technology and testing tools find elements, but modern screen readers handle it well. Test with a screen reader and keyboard on your own site. See [accessibility and WCAG for chatbots](/blog/accessibility-wcag-compliance-website-chatbots)."),

      h2("Other practical points"),
      ul("**Page builders and themes:** they are the most common source of style conflicts, so isolation helps most there.", "**Content security policy:** if your site restricts scripts and styles, the widget's host must be allowed.", "**Cookie banners and other floating elements:** check stacking and overlap on mobile.", "**Loading:** the widget should load after your main content so it does not delay your page; see [performance of embedded chat widgets](/blog/performance-optimization-embedded-chat-widgets).", "**Duplicates:** a well-built widget checks that it is not already loaded, so pasting the code twice does not create two chat bubbles."),

      h2("How to test a widget on your site"),
      table(["Test", "What to look for"], ["Load your busiest page on a phone", "Widget appears, does not cover key buttons"], ["Compare the page before and after installing", "No changes in fonts, spacing or colours"], ["Use only the keyboard", "Launcher reachable, chat operable, focus returns"], ["Turn on a screen reader", "Announcements sensible, labels present"], ["Test with your theme's dark mode or high-contrast mode", "Text remains readable"], ["Check page speed before and after", "No large drop"]),
      p("Do this on a staging copy first if you have one."),

      h2("Common mistakes"),
      ul("Assuming any widget is safe for your styles.", "Treating Shadow DOM as a security feature.", "Forgetting mobile tests.", "Installing the code twice.", "Ignoring keyboard and screen reader use.", "Overriding colours without checking contrast."),

      h2("A ten-minute pre-launch checklist"),
      ol("Install the widget on a staging or hidden page first.", "Open the page on a phone and a desktop and take screenshots before and after.", "Tab through the page with the keyboard and open the chat.", "Change the widget colours and check text contrast.", "Reload with a slow connection and confirm the page content appears first.", "Then install on the live site and check again."),
      p("This short routine catches nearly all the problems that owners meet with third-party widgets, and it makes a useful habit for any script you add to your site."),

      h2("Frequently asked questions"),
      faq(
        ["What is Shadow DOM?", "A browser feature that lets a widget draw itself inside a sealed section of the page, so its styles and structure do not clash with your site's."],
        ["Does Crescelo's widget use Shadow DOM?", "Yes. The website widget renders inside a Shadow DOM, and a separate embeddable page option uses an iframe."],
        ["Is Shadow DOM more secure than an iframe?", "No. It isolates styles, not security. An iframe from another origin is a stronger boundary."],
        ["Will the widget change my site's appearance?", "A well-isolated widget should not. Compare the page before and after to confirm."],
        ["Is it accessible?", "It can be, if built with keyboard support, focus management, labels and contrast. Test it on your site."],
        ["Can I use both approaches?", "Yes. Use the floating widget for general pages and an embedded page where you want a full-page experience."],
      ),
      p("See the [website widget feature](/product/website-widget), [pricing](/pricing) and read [how a chat widget is built](/blog/modern-website-chatbot-architecture)."),
    ],
  }),

  pillar({
    slug: 'visitor-capability-tokens-hmac-sha256',
    title: 'Securing Public Chat Endpoints: Signed Tokens Explained in Plain Language',
    description: 'How a public chat widget can be secured without logins: capability tokens, HMAC signatures, scoping to one conversation, constant-time checks, expiry, rate limits and what to ask vendors.',
    primaryKeyword: 'capability tokens HMAC-SHA256',
    secondaryKeywords: ['secure public chat API', 'signed token per conversation', 'HMAC token explained', 'protect chatbot endpoints'],
    body: [
      p("A website chat widget has an unusual security problem. It has to work for anonymous visitors, with no login, yet it talks to a server that holds conversations that must stay private. If the server hands out any conversation to anyone who knows its number, then a visitor could read another visitor's chat by guessing identifiers. If the server demands a full login, the widget cannot work. The usual answer is a capability token: a long, unguessable value that proves the holder is allowed to access one specific thing, and nothing else. It is like a coat-check ticket: it does not say who you are, only that you hold the ticket for that coat. This guide explains capability tokens in plain language, how they can be created with a cryptographic signature (HMAC) so the server does not need to store them, why they are scoped to a single conversation, how they are checked safely, what they cannot protect against and the extra layers a public endpoint needs. Crescelo uses signed tokens of this kind for conversations and for calendar feeds."),

      h2("The problem in one example"),
      p("A visitor is chatting with your assistant, and a member of your team joins the conversation from the dashboard. The visitor's widget must be able to fetch the team member's replies. But it has no login. So the widget needs a way to say 'I am allowed to read conversation 1234' without allowing it to read conversation 1235."),
      table(["Approach", "Problem"], ["Open access by conversation id", "Ids can be guessed or leaked; anyone could read others' chats"], ["Require login for visitors", "Breaks the anonymous widget"], ["Store a random secret per conversation in the database", "Works, but needs storage and lookup"], ["Derive a signed token from the conversation id", "Works with no storage; verifiable by the server"]),

      h2("What is an HMAC"),
      p("HMAC is a way to create a fingerprint of a message using a secret key. Anyone with the secret can compute the fingerprint; nobody without it can produce a matching one, even if they know the message. With SHA-256 as the underlying method, the result is a long string that cannot be guessed or worked backwards to reveal the secret."),
      ul("**Input:** a label and the conversation id, for example the text 'conversation-access' followed by the id.", "**Secret:** a server-side key that never leaves the server.", "**Output:** a token, such as a run of hexadecimal characters.", "**Verification:** the server recomputes the token for the id it was asked about and compares it with the one presented."),
      p("Because the token is derived from the secret and the id, the server does not have to store it. It can regenerate it whenever needed to check a presented token."),

      h2("Scoping: one token, one thing"),
      p("The most important property is scope. A token computed from conversation 1234 is useless for conversation 1235, because the id is part of the input. Different kinds of access use different labels, so a token for a conversation cannot be used as a token for a calendar feed. In Crescelo, a conversation token allows the widget to poll for live-agent replies for that conversation only, and a calendar feed token allows read-only access to an assistant's appointment feed. Neither allows anything else."),
      table(["Token", "Grants", "Does not grant"], ["Conversation access token", "Read replies for one conversation", "Other conversations, dashboard access, settings"], ["Calendar feed token", "Read-only subscription to one assistant's appointments", "Editing bookings, other assistants, conversations"]),

      h2("Checking tokens safely"),
      ul("**Constant-time comparison:** compare the presented token to the expected one in a way that takes the same time however many characters match, so attackers cannot learn the token from timing differences.", "**Reject missing or malformed tokens** without further work.", "**Never log tokens** or include them in error messages.", "**Use enough length:** long random-looking values cannot be guessed by trial.", "**Keep the secret secret:** it lives in the server's environment and is never sent to the browser."),
      p("If the secret is ever exposed, all derived tokens become forgeable, so the secret must be protected and rotated if compromised. Rotating it invalidates existing tokens, which is acceptable for short-lived conversations."),

      h2("Where tokens are used, and where they are not"),
      table(["Use", "Right tool"], ["Widget reading replies for one conversation", "Capability token"], ["A team member using the dashboard", "Authenticated session with roles and optional two-factor sign-in"], ["A webhook sent to your system", "Signed request with a shared secret so the receiver can verify it"], ["A calendar app subscribing to bookings", "Capability token in the feed address"], ["A visitor starting a chat", "Rate limiting and abuse checks, since there is nothing to protect yet"]),
      p("Dashboard sessions are different: they use cookies marked HttpOnly and SameSite, are checked against the account on each request and support role-based access; see [securing your chatbot account](/blog/setup-rbac-2fa-team-security)."),

      h2("What tokens cannot protect against"),
      ul("**A token that leaks:** anyone holding it can use it for that one conversation. Treat calendar feed addresses as private, like a password.", "**Abuse of the open start of a chat:** anyone can start a conversation, so rate limits, size limits, origin checks and bot protection are still needed.", "**Compromised secrets:** protect the server environment.", "**Malicious content:** the server must still validate and sanitise messages.", "**Guessing attacks at scale:** long tokens and rate limits make them impractical."),

      h2("Layers a public endpoint needs"),
      ol("Rate limits per visitor and per assistant.", "Size limits on messages and requests.", "Validation of every input.", "Origin and domain checks for widget use, where appropriate.", "Bot protection on forms where it makes sense.", "Workspace isolation so the assistant only reaches its own workspace's data; see [multi-tenant data isolation](/blog/multi-tenant-saas-chatbot-architecture).", "Logging and alerting on unusual patterns."),
      p("A token is one layer. The point of layering is that no single mistake exposes everything."),

      h2("Questions to ask a vendor"),
      ul("How do you stop one visitor reading another's conversation?", "What is in your public tokens, and what can each one do?", "Are tokens compared in constant time and never logged?", "How are secrets stored and rotated?", "What rate limits and abuse controls protect public endpoints?", "How do team members authenticate, and is two-factor available?"),

      h2("Common mistakes"),
      ul("Using sequential ids as the only protection.", "One token that unlocks everything.", "Sending the server secret to the browser.", "Comparing tokens with ordinary string equality.", "Logging tokens in URLs and error messages.", "Sharing calendar feed addresses publicly."),

      h2("Frequently asked questions"),
      faq(
        ["What is a capability token?", "An unguessable value that proves the holder may access one specific thing, such as a single conversation, without needing a login."],
        ["What is HMAC-SHA256?", "A method of creating a tamper-proof fingerprint of a message using a secret key, so only someone with the key can produce a matching value."],
        ["Does Crescelo use signed tokens?", "Yes, for conversation access by the public widget and for read-only calendar feeds, each scoped to a single item."],
        ["Can a visitor read someone else's chat?", "Not without that conversation's token, which cannot be guessed or derived without the server's secret."],
        ["What if a token leaks?", "It only grants access to that one item, but treat calendar feed addresses as private and tell us if you suspect exposure."],
        ["Are tokens enough on their own?", "No. Public endpoints also need rate limits, validation, origin checks and workspace isolation."],
      ),
      p("See [how your data is protected](/privacy), read [SSRF and web scraper security](/blog/mitigating-ssrf-web-scraper-security) and try the widget in the [playground](/playground). The [AI assistant feature](/product/ai-assistant) page covers what visitors can do."),
    ],
  }),

  pillar({
    slug: 'securing-multi-tenant-workspaces-rbac',
    title: 'Role-Based Access: Who Should See What in Your Chat Dashboard',
    description: 'How to design roles for a chatbot workspace: owner, admin, billing, support and viewer, least privilege, sample role matrix, offboarding, audit and reviewing access regularly.',
    primaryKeyword: 'role-based access control chatbot dashboard',
    secondaryKeywords: ['team roles for chatbot', 'RBAC small business', 'who should access chatbot conversations', 'least privilege dashboard'],
    body: [
      p("Your chat dashboard holds things with different levels of sensitivity. Conversations contain customers' words and contact details. Settings control what your assistant says. Billing pages hold your plan and invoices. AI provider keys can spend money. Not everyone on your team needs to see or change all of it. The receptionist who replies to visitors does not need to change your billing plan; the accountant who downloads invoices does not need to read customer conversations; a contractor updating your knowledge base should not be able to delete the whole workspace. Role-based access control, or RBAC, is the practice of giving each person a role that grants exactly the access they need. This guide explains the idea, describes the roles typically used in a workspace such as Crescelo's (owner, admin, billing manager, support agent and viewer), gives a sample matrix, shows how to assign roles using least privilege, how to handle joiners and leavers, how to use an audit trail and how to review access regularly. Check the exact permissions in your own dashboard, since they can be refined over time."),

      h2("Why roles matter"),
      ul("**Privacy:** fewer people see customers' conversations.", "**Safety:** fewer people can make destructive or costly changes by mistake.", "**Accountability:** named accounts with roles show who did what.", "**Compliance:** data protection rules expect access limited to those who need it.", "**Resilience:** if one account is compromised, the damage is limited to what that role can do."),

      h2("The roles"),
      table(["Role", "Typical purpose", "Typical access"], ["Owner", "The business owner or account holder", "Everything, including billing and team management"], ["Admin", "Someone who manages the assistant day to day", "Assistants, knowledge, settings, leads and conversations; not usually ownership"], ["Billing manager", "Finance or an office manager", "Plans, invoices and payment details; no need for conversations"], ["Support agent", "Front desk or customer service", "Conversations, leads, bookings and handovers; not settings or keys"], ["Viewer", "A manager or a client who needs to look, not touch", "Read-only access to selected areas"]),
      p("In Crescelo's workspace, owners and admins have full access, and other roles are limited to the areas that suit them, for example billing pages for billing managers. Some actions require a specific role, and master administration of the platform is a separate, protected role held by the platform operator."),

      h2("A sample role matrix"),
      table(["Area", "Owner", "Admin", "Billing manager", "Support agent", "Viewer"], ["Conversations and leads", "Yes", "Yes", "No", "Yes", "Read"], ["Bookings", "Yes", "Yes", "No", "Yes", "Read"], ["Knowledge base", "Yes", "Yes", "No", "Limited", "Read"], ["Assistant settings and instructions", "Yes", "Yes", "No", "No", "No"], ["AI provider keys", "Yes", "Yes", "No", "No", "No"], ["Team members and roles", "Yes", "Limited", "No", "No", "No"], ["Billing and plan", "Yes", "No", "Yes", "No", "No"], ["Delete workspace or data", "Yes", "No", "No", "No", "No"]),
      p("This is a suggested pattern for planning, not a statement of exact permissions. Confirm what each role can do in your dashboard before relying on it, and test by signing in as each role."),

      h2("Apply least privilege"),
      ol("Start every new person at the lowest role that lets them do their job.", "Raise access only when there is a specific need, and lower it when the need ends.", "Keep owners to one or two people.", "Give contractors the narrowest role and remove it when the project finishes.", "Prefer separate accounts over shared logins; never share a password.", "Review the sensitive areas separately: provider keys, billing and exports."),

      h2("Joiners, movers and leavers"),
      table(["Event", "Action"], ["Someone joins", "Invite with a named account and the smallest suitable role; turn on two-factor sign-in"], ["Someone changes job", "Change the role the same day"], ["A contractor finishes", "Remove access immediately"], ["An employee leaves", "Remove the account, rotate any shared secrets and review the audit trail"], ["The owner changes", "Transfer ownership deliberately, and remove the previous owner"]),
      p("In Crescelo, sessions are checked against the account's current role and workspace on each request, so demoting or removing a member takes effect immediately, not when their session expires."),

      h2("Add two-factor authentication"),
      p("Roles limit what an account can do; two-factor sign-in reduces the chance of someone else using it. Prioritise owners and admins, since their accounts can change everything. See [securing your chatbot account](/blog/setup-rbac-2fa-team-security) for setup steps."),

      h2("Use the audit trail"),
      ul("Review the log of important actions monthly: changes to settings, sources, keys and members.", "After any incident, check who did what and when.", "Investigate unexpected changes promptly, and ask the person who made them.", "Use it to improve roles: if a support agent keeps needing an admin action, decide whether they need that access or a process change."),

      h2("Review access on a schedule"),
      table(["Frequency", "Check"], ["Monthly", "Audit trail for unusual changes"], ["Quarterly", "The list of members and roles: remove anyone who no longer needs access"], ["Twice a year", "API keys and shared secrets: rotate as needed"], ["After staff changes", "Immediate review of the affected accounts"]),
      p("Put the review in the calendar, since access tends to accumulate silently. Link it to your regular [chat analytics review](/blog/service-business-chat-analytics-playbook)."),

      h2("Data isolation is the other half"),
      p("Roles decide what a person can do inside a workspace. Isolation decides that nobody outside it can see in. A trustworthy platform does both; see [multi-tenant data isolation](/blog/multi-tenant-saas-chatbot-architecture) for the platform side."),

      h2("Common mistakes"),
      ul("Making everyone an owner.", "Sharing one login.", "Leaving contractor access in place.", "Never reviewing roles.", "Giving support staff access to keys and billing.", "Assuming roles replace two-factor sign-in."),

      h2("A worked example"),
      p("A dental practice has six people using the dashboard: the practice owner, an office manager, two receptionists, a part-time marketing freelancer and the practice's accountant. The owner keeps the owner role and turns on two-factor sign-in. The office manager becomes an admin, because they maintain the assistant's documents. The receptionists get the support agent role, so they can read conversations and take handovers but cannot change instructions or see keys. The freelancer is a viewer for the month of a campaign and is removed afterwards. The accountant is a billing manager and never sees a conversation. Each person can do their job, and nobody can reach anything they do not need."),
      table(["Person", "Role", "Why"], ["Practice owner", "Owner", "Ultimate responsibility, billing and team"], ["Office manager", "Admin", "Maintains documents and settings"], ["Receptionists", "Support agent", "Handle conversations and bookings"], ["Freelancer", "Viewer, temporary", "Needs to see, not change; removed after the campaign"], ["Accountant", "Billing manager", "Invoices only"]),

      h2("Handle exceptions deliberately"),
      p("Sometimes a person needs more access than their role allows for a specific task, such as a receptionist who must update opening hours before a holiday. Rather than promoting them permanently, change the setting yourself or grant a higher role temporarily and record when to remove it. Put the removal in the calendar. Temporary access that is never withdrawn is the most common way roles drift away from least privilege over time."),

      h2("Frequently asked questions"),
      faq(
        ["What is role-based access control?", "Giving each team member a role that grants only the access their job needs, such as owner, admin, billing manager, support agent or viewer."],
        ["Which roles does Crescelo have?", "Owner, admin, billing manager, support agent and viewer. Check the dashboard for the exact permissions of each."],
        ["Who should be an owner?", "One or two trusted people, since owners have full control including billing and team management."],
        ["What happens when I remove someone?", "Their access ends immediately, because sessions are checked against the account's current state on every request."],
        ["How often should I review roles?", "Quarterly, and immediately after staff changes."],
        ["Do roles replace two-factor authentication?", "No. Roles limit what an account can do; two-factor sign-in protects the account itself."],
      ),
      p("See [how your data is protected](/privacy), the [human handover feature](/product/human-handover) and [pricing](/pricing)."),
    ],
  }),
];
