import { faq, h2, h3, note, ol, p, pillar, table, ul } from '../authoring';

export const PILLAR23 = [
  pillar({
    slug: 'bring-your-own-ai-key-byok-explained',
    title: 'Bring Your Own AI Key (BYOK) Explained: What It Is, How It Works and Whether It Suits You',
    description: 'What bring your own key means for AI chatbots: how it works, benefits and duties, security of keys, choosing providers, costs, setup steps and common questions for small businesses.',
    primaryKeyword: 'bring your own key AI',
    secondaryKeywords: ['BYOK chatbot', 'use my own OpenAI key', 'API key AI assistant', 'zero markup AI chatbot'],
    body: [
      p("Bring your own key, usually shortened to BYOK, is a simple idea with a slightly technical name. When an AI chatbot answers a visitor, a language model does the writing, and that model belongs to a provider such as OpenAI, Anthropic, Google, Groq or DeepSeek. The provider charges for every reply. In a BYOK product, you create your own account with the provider, paste your key into the chatbot platform and the provider bills you directly for what your assistant uses. The platform charges only for its software. This guide explains how BYOK works in plain terms, what you gain and what you take on, how keys are kept safe, how to pick a provider and model, what it costs, how to set it up step by step and when a bundled plan may suit you better. It also explains how Crescelo does it: no markup on AI usage, and keys stored encrypted."),

      h2("The idea in one picture"),
      table(["", "Bundled AI", "Bring your own key"], ["You pay the platform for", "Software and AI together", "Software only"], ["Who pays the AI provider", "The platform, out of your fee", "You, directly"], ["Who chooses the model", "The platform", "You"], ["Where the margin is", "In the price of the bundle", "Nowhere on AI: you pay the provider's rate"], ["What you set up", "Nothing extra", "An account with a provider and a key"]),
      p("A key is a long secret string, like a password for software. It lets the platform ask the provider to write replies on your account."),

      h2("Why people choose BYOK"),
      ul("**Visible cost:** the provider's dashboard shows exactly what each day of chats costs.", "**No markup:** you pay wholesale rates instead of a bundle's margin.", "**Choice and change:** you can pick a model and switch when a better or cheaper one appears.", "**Privacy control:** you decide which provider sees your visitors' messages, and can pick one whose terms suit you.", "**Existing accounts and credits:** if you already have an account or credits, you can use them."),
      p("See [BYOK versus bundled pricing](/blog/byok-vs-bundled-ai-pricing-cost-comparison) for a worked cost model."),

      h2("What you take on"),
      ul("Creating and managing an account with a provider, including payment.", "Watching usage and setting spending limits so a surprise bill cannot happen.", "Choosing a model, and revisiting the choice.", "Reading the provider's terms about data and privacy.", "Keeping the key secret and rotating it if it might have leaked."),
      p("None of this is difficult, and each step takes minutes, but it is more than a bundled plan asks of you."),

      h2("How the key is used and protected"),
      ol("You paste the key into the platform's AI settings once.", "The platform encrypts it before storing it. Crescelo stores provider keys encrypted with AES-256-GCM.", "When a visitor asks a question, the server decrypts the key in memory, sends the request to the provider and discards the plaintext.", "The key is never sent to the visitor's browser and never appears in your website code."),
      p("Good practice on your side: create a key just for this assistant, give it only the permissions it needs, set a monthly spending limit at the provider and revoke and replace the key if a team member with access leaves. See [how a bring-your-own-key vault works](/blog/cryptographic-byok-vault-aes-256-gcm) for the technical detail."),

      h2("Which providers"),
      table(["Provider family", "Known for"], ["OpenAI", "A wide range of models, well documented"], ["Anthropic (Claude)", "Careful instruction following and tone"], ["Google (Gemini)", "Fast, low-cost models and free tiers for testing"], ["Groq", "Very fast inference of open models"], ["DeepSeek", "Low-cost models"], ["Self-hosted (Ollama)", "Runs on your own hardware for full data control"]),
      p("Crescelo supports these and offers a free engine so you can test before connecting your own. Model names and prices change often, so check each provider's current pages. See [which AI model to connect](/blog/byok-ai-chatbot-guide)."),

      h2("What it costs in practice"),
      p("For a grounded assistant answering from your documents, the AI cost per conversation is usually a fraction of a cent to a few cents on a small or mid-range model. A small business with a few hundred conversations a month typically sees AI usage in the low single or double digits of dollars, while the platform subscription is the larger part of the bill. Premium models cost many times more for little gain on simple questions, which is why testing a cheaper model is worthwhile. The cost is visible in your provider's dashboard, so you can check it against the conversations you had."),

      h2("Setup in five steps"),
      ol("Choose a provider and create an account; add a payment method or credits.", "Create a new API key named for this assistant.", "Set a monthly spending limit or alert at the provider if offered.", "Paste the key into the assistant's AI settings in the platform.", "Test with twenty real questions, including some the documents cannot answer, and watch the provider's usage page."),
      p("The provider guides in the help centre walk through each provider: [OpenAI](/support/ai-connectors/openai), [Gemini](/support/ai-connectors/gemini) and [the others](/support/ai-connectors)."),

      h2("Privacy: where your visitors' messages go"),
      p("With BYOK, the platform sends the visitor's message and the retrieved passages from your documents to the provider you chose, under your account and that provider's terms. Read those terms: whether API data is stored, for how long, whether it is used for training and where it is processed. Many providers do not train on API data by default for business use, but confirm. Tell visitors they are talking to an AI and link to your privacy policy. See the [GDPR checklist for website chatbots](/blog/website-chatbot-gdpr-checklist)."),

      h2("When a bundled plan may suit you better"),
      ul("You want the simplest setup and never to think about a provider account.", "Your volume is very low and predictable.", "You prefer one invoice.", "Nobody on your team is comfortable managing keys and limits."),
      p("Both models are legitimate. BYOK is best when you value visibility, choice and no markup, and are willing to spend ten minutes on setup."),

      h2("Common mistakes"),
      ul("Sharing one key across several projects.", "Forgetting a spending limit.", "Choosing the most expensive model by default.", "Pasting the key into a chat, email or website code.", "Never checking usage.", "Not reading the provider's data terms."),

      h2("Frequently asked questions"),
      faq(
        ["What does bring your own key mean?", "You connect your own account with an AI provider to the chatbot platform, and the provider bills you directly for AI usage while the platform charges only for its software."],
        ["Is BYOK cheaper?", "Often, especially as volume grows or when a small model is enough, because there is no margin on AI usage. At very low volume the difference may be small."],
        ["Is my API key safe?", "It should be stored encrypted, never sent to visitors and kept out of your website code. Use a dedicated key and set spending limits."],
        ["Which providers does Crescelo support?", "OpenAI, Anthropic Claude, Google Gemini, Groq, DeepSeek and self-hosted endpoints, plus a free engine for testing."],
        ["Can I change providers later?", "Yes. It is a settings change. Retest your questions after switching."],
        ["Do I need technical skills?", "No. You create a key in the provider's dashboard and paste it into the settings."],
      ),
      p("Try the assistant on your documents in the [playground](/playground), see the [AI assistant feature](/product/ai-assistant) and check [pricing](/pricing)."),
    ],
  }),

  pillar({
    slug: 'mitigating-ssrf-web-scraper-security',
    title: 'SSRF and Chatbot Web Scrapers: How Fetching URLs Safely Protects Your Servers',
    description: 'What server-side request forgery is, why chatbots that fetch web pages are exposed, how attackers abuse it and the defences: allow-lists, DNS checks, redirects, timeouts and testing.',
    primaryKeyword: 'SSRF web scraper security',
    secondaryKeywords: ['server side request forgery chatbot', 'prevent SSRF URL fetch', 'safe web scraping server', 'block internal IP requests'],
    body: [
      p("Many AI assistants can read a web page: you paste a link and the platform fetches it, extracts the text and adds it to the knowledge base. It is a convenient feature and a classic security hazard. When a server fetches whatever address a user supplies, an attacker can supply an address that points not to a public website but to something inside the platform's own network: an internal admin service, a database console, a cloud provider's metadata endpoint that hands out credentials. The server dutifully fetches it and returns the contents. This attack is called server-side request forgery, or SSRF, and it has been behind some of the most damaging cloud breaches. This guide explains SSRF in plain terms, why web-fetching features are exposed, how attackers try to bypass simple defences, and the layered protections a careful platform uses, including the ones Crescelo applies. It also gives you questions to ask any vendor whose product fetches URLs on your behalf."),

      h2("SSRF in one paragraph"),
      p("Normally, a browser asks a website for a page. In an SSRF attack, the attacker gets a server to make the request on their behalf, to a place the attacker cannot reach directly but the server can. Servers often sit inside private networks where internal services trust each other and are not exposed to the internet. A URL fetcher that follows any address becomes a bridge into that network."),
      table(["Target an attacker might request", "What it could reveal"], ["http://127.0.0.1/admin", "A local admin interface on the same server"], ["http://10.0.0.5/", "An internal service on the private network"], ["http://169.254.169.254/latest/meta-data/", "Cloud instance metadata, sometimes including temporary credentials"], ["file:///etc/passwd", "Local files, if other schemes are allowed"], ["http://internal-db:5984/", "An internal database with no password"]),

      h2("Why chatbot platforms are exposed"),
      ul("They deliberately fetch user-supplied URLs (knowledge sources, web search, link previews, webhooks).", "They run in cloud environments with metadata services and private networks.", "They may follow redirects, so a harmless public address can bounce to an internal one.", "They may resolve hostnames, so a public-looking name can point to a private address.", "Customers can supply custom AI endpoints, adding another fetch path."),
      p("Every feature that turns a user-provided address into a server-side request is a potential SSRF path."),

      h2("How simple defences fail"),
      table(["Naive defence", "How it is bypassed"], ["Block the text 'localhost' and '127.0.0.1'", "Use 127.1, 0x7f000001, decimal 2130706433 or an IPv6 form such as ::1 or ::ffff:127.0.0.1"], ["Check the hostname against a block-list", "Use a public hostname that resolves to a private address (DNS pointing to 10.x)"], ["Check once, then fetch", "DNS rebinding: the name resolves to a public address at check time and a private one at fetch time"], ["Validate the first URL only", "Redirects from a public site to an internal address"], ["Allow only http and https", "Still allows internal http addresses"]),
      p("Robust defences work on resolved addresses, at connection time, for every hop."),

      h2("The layered defence"),
      ol("**Restrict schemes.** Allow only http and https.", "**Resolve and check the address.** Look up the hostname and reject any that resolves to private, loopback, link-local, reserved or metadata ranges, in IPv4 and IPv6, including IPv4-mapped IPv6.", "**Check every redirect.** Repeat the checks for each hop, and limit the number of redirects.", "**Connect to the checked address.** Use the resolved IP for the connection so DNS cannot change between check and use.", "**Limit size and time.** Cap response size and set short timeouts, so a hostile server cannot exhaust resources.", "**Restrict ports and content types** where possible.", "**Isolate the fetcher.** Run it with minimal network privileges, ideally in a separate environment with no route to internal services.", "**Do not return raw responses.** Extract text only, and never echo internal error details to the user.", "**Log and alert** on blocked attempts."),
      table(["Range to block", "Examples"], ["Loopback", "127.0.0.0/8, ::1"], ["Private networks", "10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, fc00::/7"], ["Link-local and metadata", "169.254.0.0/16, fe80::/10"], ["Current network and reserved", "0.0.0.0/8, multicast and other reserved ranges"], ["IPv4-mapped IPv6", "::ffff:127.0.0.1 and similar"]),

      h2("What Crescelo does"),
      ul("Validates external URLs before fetching them for knowledge sources, rejecting addresses that point to internal, loopback or cloud-metadata ranges.", "Resolves hostnames and checks the resulting addresses, including IPv6 and IPv4-mapped forms.", "Applies the same protection to custom AI provider addresses, so a workspace cannot point its assistant at an internal service.", "Requires secure (HTTPS) addresses for outbound integrations such as webhooks.", "Rate limits the endpoints that fetch, and limits body sizes."),
      p("No single measure is perfect, which is why they are layered. We also keep security tests for the private-address checks. If you find a bypass, please tell us through a support ticket."),

      h2("Questions to ask any vendor"),
      ul("How do you prevent your URL fetcher from reaching internal or metadata addresses?", "Do you check resolved IPs, including IPv6, and every redirect?", "How do you handle DNS rebinding?", "Do custom endpoints and webhooks get the same protection?", "How is the fetcher isolated from your internal network?", "Do you log and alert on blocked requests?"),
      p("Answers such as 'we block localhost' are a warning sign. Look for descriptions of layered defences."),

      h2("If you are building your own"),
      ol("Treat every user-supplied URL as hostile.", "Use a well-tested library or proxy for outbound requests.", "Resolve, validate and pin the IP, and revalidate on redirects.", "Deny by default: allow-list where you can.", "Remove cloud metadata access for the fetching service, or require tokens (for example, use the stricter metadata service versions cloud providers offer).", "Add automated tests with known bypass strings.", "Review any new feature that fetches a URL."),

      h2("What this means for your knowledge base"),
      p("Adding a web page as a knowledge source should be safe: the platform fetches a public page and reads its text. You can help by adding only public pages you control or trust, avoiding addresses that require login and being suspicious of unusual addresses in shared instructions. If a URL ever returns content that looks like an internal system, tell the vendor."),

      h2("Common mistakes"),
      ul("Blocking a few hostnames and calling it done.", "Checking the URL once and ignoring redirects.", "Trusting DNS at check time only.", "Forgetting that custom endpoints and webhooks also fetch URLs.", "Running the fetcher with access to internal services it does not need.", "Returning raw fetched content or error text to the user."),
      p("Each of these has appeared in real incidents. Layered checks, applied to every hop, close most of the gaps, and regular testing with known bypass strings keeps them closed as the code changes."),

      h2("Frequently asked questions"),
      faq(
        ["What is SSRF?", "Server-side request forgery: tricking a server into making a request to an address the attacker cannot reach directly, such as an internal service or a cloud metadata endpoint."],
        ["Why are chatbot URL features risky?", "Because they fetch user-supplied addresses from servers that sit inside cloud networks with sensitive internal services."],
        ["Does blocking localhost prevent SSRF?", "No. Attackers use alternate encodings, DNS tricks and redirects. Defences must work on resolved IP addresses for every hop."],
        ["What does Crescelo do about SSRF?", "It validates external URLs, rejects internal and metadata ranges after resolving hostnames, covers custom AI endpoints and requires HTTPS for outbound integrations."],
        ["Can I safely add web pages to my knowledge base?", "Yes, public pages you trust. The platform should fetch and read them safely."],
        ["How do I report a security issue?", "Open a support ticket describing it, and we will investigate."],
      ),
      p("See [how your data is protected](/privacy), the [knowledge base feature](/product/knowledge-base), [how a bring-your-own-key vault works](/blog/cryptographic-byok-vault-aes-256-gcm), [securing your chatbot account](/blog/setup-rbac-2fa-team-security) and [bring your own key explained](/blog/bring-your-own-ai-key-byok-explained), and try adding a page in the [playground](/playground)."),
    ],
  }),

  pillar({
    slug: 'setup-rbac-2fa-team-security',
    title: 'Securing Your Chatbot Account: Team Roles, Two-Factor Authentication and Access Hygiene',
    description: 'How to secure a chatbot workspace: least-privilege roles, two-factor authentication, strong sign-in, offboarding, API keys, audit trails and a checklist for owners.',
    primaryKeyword: 'RBAC and 2FA chatbot security',
    secondaryKeywords: ['team access chatbot dashboard', 'two factor authentication SaaS', 'least privilege roles', 'secure AI assistant account'],
    body: [
      p("Your chatbot dashboard holds things worth protecting: your customers' conversations and contact details, the documents that make up your knowledge base, your booking calendar and, if you bring your own key, access to an AI provider account that can run up a bill. The account that controls all this is only as safe as its weakest login. Most real-world account compromises are not clever hacks: they are reused passwords, shared logins, former staff who still have access and owners without a second factor. This guide is a practical security guide for owners of a chatbot workspace: how to set roles so people have only the access they need, how two-factor authentication works and how to turn it on, how to sign in safely, how to handle joiners and leavers, how to protect API keys, how to use an audit trail and a checklist you can complete in an afternoon."),

      h2("What is at stake"),
      table(["Asset", "Risk if someone gets in"], ["Conversations and leads", "Customers' personal data exposed; privacy law consequences"], ["Knowledge base", "Content altered so the assistant says wrong things"], ["Assistant settings", "Instructions changed; assistant misused"], ["Bookings and calendar", "Appointments deleted or spammed"], ["AI provider key", "Costs run up on your account"], ["Billing", "Plan changes or cancellation"]),
      p("The impact of a takeover is larger than most owners assume, because a chatbot sits in front of your customers."),

      h2("Least privilege: give people only what they need"),
      p("Roles restrict what each team member can view and change. The principle is least privilege: start with the minimum and add access when there is a reason."),
      table(["Kind of person", "Suggested access"], ["Owner", "Everything, including billing and security; keep to one or two people"], ["Administrators", "Manage assistants, knowledge and settings; not billing or ownership"], ["Support or front desk staff", "See conversations, leads and bookings; handle handovers; not settings or keys"], ["Contractors or agencies", "Only the assistants and tabs they work on, for as long as they work"], ["Billing or finance", "Plans and invoices only"]),
      ul("Review roles when someone's job changes.", "Avoid giving everyone owner rights for convenience.", "Use named accounts for everyone; never share a login.", "Limit who can see AI keys and who can change assistant instructions."),
      p("Crescelo workspaces use roles that restrict what team members can view, edit or change, and owners can see an audit trail of important actions."),

      h2("Two-factor authentication (2FA)"),
      p("A password alone can be guessed, reused from another breach or stolen. A second factor requires something else: a code from an authenticator app on your phone. Even if your password leaks, an attacker cannot sign in without the code. Crescelo supports time-based one-time codes from authenticator apps, and team accounts can require them at sign-in."),
      ol("Install an authenticator app on your phone.", "In the workspace's Security settings, start 2FA setup and scan the QR code.", "Enter the six-digit code to confirm.", "Save the recovery codes somewhere safe and offline; they let you in if you lose your phone.", "Test signing out and back in with a code."),
      ul("Turn it on for owners first, then for everyone.", "Prefer an authenticator app over text messages, which can be intercepted.", "Store recovery codes in a password manager or a locked drawer, not in an email.", "When someone leaves, remove their access; do not rely on their 2FA."),

      h2("Strong sign-in habits"),
      ul("Use a unique, long password from a password manager.", "Never reuse passwords across services.", "If you sign in with Google, protect that Google account with 2FA as well.", "Be careful of phishing: check the address before entering credentials, and do not enter a code you were not expecting.", "Sign out on shared devices."),
      p("The Crescelo dashboard checks a session on every request against your account state, so changing your password or removing a member ends their existing sessions."),

      h2("Joiners, movers and leavers"),
      table(["Event", "Action"], ["New team member", "Create a named account with the smallest role that works; require 2FA"], ["Change of role", "Adjust access the same day"], ["Contractor finishes", "Remove access immediately"], ["Employee leaves", "Remove their account, rotate anything they could see, such as shared passwords and API keys"], ["Owner changes", "Transfer ownership deliberately, and remove the old owner's access"]),
      p("Write this down as a short checklist. Offboarding is where most access problems start."),

      h2("Protect API keys"),
      ul("Use a dedicated key for each assistant, with a spending limit at the provider.", "Never paste keys into chats, emails or website code.", "Restrict who can view or change the AI settings.", "Rotate keys when a person with access leaves or a leak is suspected.", "Crescelo stores provider keys encrypted; see [how a bring-your-own-key vault works](/blog/cryptographic-byok-vault-aes-256-gcm)."),

      h2("Use the audit trail"),
      p("An audit trail records who did what and when: a setting changed, a source deleted, a member added. Use it. Review it monthly for unexpected changes, and after any incident. Owners on Crescelo can see an audit trail of workspace actions. It also helps in a dispute or an investigation, because you can see what happened."),

      h2("Other basics"),
      ul("Keep your devices updated and locked.", "Do not use public Wi-Fi for admin work without a trusted connection.", "Limit who has admin access to your domain and website, since the chat is installed there.", "Be careful with browser extensions.", "Back up important content, such as your knowledge documents."),

      h2("If you think an account is compromised"),
      ol("Change the password and sign out everywhere.", "Remove suspicious members and revoke API keys.", "Check the audit trail for what changed.", "Review recent conversations and leads for unusual activity.", "Restore altered content from your originals.", "Tell affected customers if their data may have been exposed, as your legal obligations require.", "Contact support with the details."),

      h2("A one-afternoon checklist"),
      ul("Two owners at most, both with 2FA.", "Every team member on a named account with the smallest role.", "Recovery codes stored safely.", "Old and shared accounts removed.", "A dedicated AI key with a spending limit.", "Audit trail reviewed.", "A written joiner and leaver checklist."),

      h2("Common mistakes"),
      ul("Making everyone an owner because it is easier.", "Sharing one login across the team.", "Keeping recovery codes in the same inbox as the password reset email.", "Forgetting to remove contractors when a project ends.", "Never looking at the audit trail.", "Leaving the AI key visible to people who do not need it."),
      p("Fixing these takes an afternoon and removes most of the realistic ways an account gets compromised. Put a recurring quarterly reminder in the calendar to review roles and access."),

      h2("Frequently asked questions"),
      faq(
        ["Does Crescelo support two-factor authentication?", "Yes. Accounts can use time-based codes from an authenticator app, and team accounts can require them at sign-in."],
        ["What is least privilege?", "Giving each person only the access they need, so a mistake or compromise causes less damage."],
        ["What if I lose my phone?", "Use the recovery codes you saved when you turned on 2FA, and then set it up again on the new phone."],
        ["Should I share one login with my team?", "No. Use named accounts so you know who did what and can remove access individually."],
        ["How do I remove a former employee's access?", "Remove their account, rotate shared passwords and API keys they could see and review the audit trail."],
        ["Where can I see who changed what?", "In the audit trail, available to workspace owners."],
      ),
      p("See [how your data is protected](/privacy) and the [data processing addendum](/dpa), read [the GDPR checklist](/blog/website-chatbot-gdpr-checklist), see [SSRF protection for web scrapers](/blog/mitigating-ssrf-web-scraper-security), the [AI assistant feature](/product/ai-assistant) and [start a free trial](/login?mode=register) to set up your workspace securely."),
    ],
  }),

  pillar({
    slug: 'cryptographic-byok-vault-aes-256-gcm',
    title: 'How a Bring-Your-Own-Key Vault Protects Your API Keys (AES-256-GCM Explained)',
    description: 'How chatbot platforms store customer API keys safely: encryption at rest with AES-256-GCM, nonces and authentication tags, key management, decrypting in memory, rotation and what to ask a vendor.',
    primaryKeyword: 'API key encryption AES-256-GCM',
    secondaryKeywords: ['BYOK vault', 'store API keys securely SaaS', 'encrypt secrets at rest', 'AES GCM explained'],
    body: [
      p("When you give a chatbot platform your AI provider key, you are handing it a secret that can spend your money. How the platform stores that secret matters more than almost any feature. A key saved in plain text in a database is one leak away from a bill you did not authorise. A key encrypted properly is useless to anyone who steals the database. This guide explains, in plain language and with enough technical detail for developers, how a key vault should work: what encryption at rest means, what AES-256-GCM is and why it is used, the role of nonces and authentication tags, where the encryption key itself lives, how keys are used at request time without being exposed, how rotation works, what encryption does not protect against and the questions to ask any vendor. Crescelo stores provider keys with AES-256-GCM."),

      h2("The threat model"),
      table(["Threat", "Example", "Defence"], ["Database leak", "A backup or a compromised admin exposes stored records", "Encrypt keys at rest"], ["Curious insider", "An employee browsing data", "Encryption, access controls and audit logs"], ["Application bug", "An endpoint accidentally returns a key to the browser", "Never send keys to clients; store them encrypted; return masked values"], ["Log leakage", "A key is written to a log file", "Redact secrets from logs"], ["Stolen backup", "An old backup surfaces", "Encryption with a key stored elsewhere"]),
      p("Encryption at rest is a strong defence against the first, second and fifth. Careful coding covers the third and fourth."),

      h2("What AES-256-GCM is"),
      p("AES is a widely used and heavily studied encryption standard. The 256 refers to the key length in bits, which makes brute-force guessing infeasible. GCM is a mode of operation that provides two things at once: confidentiality (nobody can read the data) and integrity (nobody can alter it without detection). This combination is called authenticated encryption, and it is the standard recommendation for encrypting data at rest."),
      table(["Term", "Meaning"], ["Key", "The secret used to encrypt and decrypt; 256 bits (32 bytes) for AES-256"], ["Nonce or IV", "A number used once for each encryption, so the same plaintext never produces the same ciphertext"], ["Ciphertext", "The encrypted result"], ["Authentication tag", "A short value that proves the ciphertext was not tampered with"]),
      p("To store a key, the platform generates a fresh random nonce, encrypts the key with the master key, and stores the nonce, ciphertext and tag together. To read it, it uses the master key, the nonce and the tag; if the tag does not match, decryption fails, which reveals tampering."),

      h2("Why the nonce must never repeat"),
      p("GCM is fast and safe as long as a nonce is never reused with the same key. Reuse can leak information and allow forgery. The safe approach is to generate a fresh random 12-byte nonce for every encryption, which makes a collision astronomically unlikely at normal volumes, and to store the nonce alongside the ciphertext. Any implementation that derives nonces predictably or reuses them is a serious flaw."),

      h2("Where the master key lives"),
      p("Encryption is only as strong as the protection of the encryption key. Storing the master key in the same database as the encrypted secrets defeats the purpose. Good practice separates them:"),
      ul("Keep the master key in an environment secret or a dedicated key management service, not in the database.", "Give the application access only at runtime.", "Restrict who can read production environment variables.", "Never commit the key to source control.", "Keep offline backups of the master key in a safe place; losing it means losing every stored secret."),
      p("Some platforms derive per-record keys from a master key, so a single leaked record key does not expose everything. Stronger setups use a cloud key management service that performs encryption operations without ever exposing the master key to the application."),

      h2("Using the key at request time"),
      ol("A visitor sends a message; the server needs to call the AI provider.", "The server reads the encrypted key record and decrypts it in memory using the master key.", "It makes the request to the provider, attaching the key.", "It discards the plaintext key immediately; it is never written to logs, error messages or responses.", "The dashboard shows only a masked version, such as the last four characters, when you view settings."),
      p("At no point does the key travel to your visitor's browser or appear in your website's code."),

      h2("Rotation and revocation"),
      ul("If a key might have been exposed, revoke it at the provider and paste a new one; the old ciphertext becomes useless.", "Rotate the master key periodically, re-encrypting stored secrets with the new one, and keep the old one only until migration completes.", "Keep an audit trail of when keys were added, changed or removed, and by whom.", "Tie rotation to events such as staff leaving."),

      h2("What encryption at rest does not protect against"),
      table(["Scenario", "Encryption helps?", "What else is needed"], ["A stolen database backup", "Yes", "Protect the master key separately"], ["An attacker who compromises the running application", "Not fully: the app can decrypt keys", "Least privilege, monitoring, network isolation, spending limits at the provider"], ["A malicious insider with access to the application and environment", "Not fully", "Separation of duties, audit logs"], ["A phishing attack on a customer's account", "No", "2FA and access hygiene; see [securing your chatbot account](/blog/setup-rbac-2fa-team-security)"]),
      p("This is why you should also set a spending limit with your AI provider. If a key is ever misused, the damage is capped."),

      h2("How to check a vendor"),
      ul("Do you encrypt customer API keys at rest? With what algorithm and mode?", "Where is the master key stored, and who can access it?", "Are nonces random and unique per encryption?", "Can support staff see plaintext keys?", "Are keys ever returned to the browser or written to logs?", "How does rotation work, and can I revoke a key immediately?", "Do you have an audit trail for key changes?"),
      p("Be wary of vague answers such as 'we take security seriously'. Specifics are the sign of a real implementation."),

      h2("What you should do on your side"),
      ol("Create a dedicated key for the assistant.", "Set a monthly spending limit at the provider.", "Enable alerts for unusual usage.", "Restrict who on your team can see or change the AI settings.", "Rotate the key if a team member with access leaves.", "Never paste the key into chats, emails or code."),
      p("See [bring your own key explained](/blog/bring-your-own-ai-key-byok-explained) for the wider picture."),

      h2("Frequently asked questions"),
      faq(
        ["How does Crescelo store my API key?", "Encrypted with AES-256-GCM, decrypted only in server memory when needed, and never sent to visitors' browsers."],
        ["What is AES-256-GCM?", "A widely used authenticated encryption method: AES with a 256-bit key in Galois/Counter Mode, providing both confidentiality and tamper detection."],
        ["What is a nonce?", "A number used once per encryption. It must be unique for each encryption with the same key."],
        ["Where should the master key be stored?", "Separately from the encrypted data, in an environment secret or a key management service, with tight access."],
        ["Can encrypted keys still be misused?", "If the running application is compromised, yes. That is why spending limits and access controls matter too."],
        ["Should I rotate my key?", "Yes, after any suspected exposure and when someone with access leaves."],
      ),
      p("See [how your data is protected](/privacy), the [data processing addendum](/dpa), the [AI assistant feature](/product/ai-assistant) and [pricing](/pricing), and read [SSRF protection for web scrapers](/blog/mitigating-ssrf-web-scraper-security)."),
    ],
  }),

  pillar({
    slug: 'sse-vs-websockets-ai-chatbot-streaming',
    title: 'Streaming AI Replies: Server-Sent Events vs WebSockets for Chatbots',
    description: 'How AI chatbots stream replies word by word: Server-Sent Events versus WebSockets, trade-offs for hosting, proxies, reconnection, cost and complexity, with guidance for small teams.',
    primaryKeyword: 'SSE vs WebSockets chatbot streaming',
    secondaryKeywords: ['streaming LLM responses', 'server sent events chat', 'WebSocket vs SSE', 'token streaming web widget'],
    body: [
      p("When you watch a chatbot answer, the words appear one after another, not all at once after a long pause. That streaming effect is more than a nicety. Language models produce text token by token, and a full answer can take several seconds; showing words as they are generated makes the wait feel short and lets the visitor start reading almost immediately. Under the hood, streaming needs a connection that stays open while the server sends pieces of the reply. Two technologies dominate: Server-Sent Events (SSE) and WebSockets. Which one you use affects hosting compatibility, complexity, reliability behind proxies and the cost of running the chat. This guide explains both in plain language, compares them for AI chat, describes how streaming interacts with serverless hosting, error handling and reconnection, and explains why many chat widgets, including Crescelo's, use SSE. It is written for developers and for owners who want to understand what their vendor chose and why."),

      h2("Why streaming matters"),
      table(["Without streaming", "With streaming"], ["Visitor waits several seconds with nothing on screen", "First words appear in a fraction of a second"], ["Feels slow even when the model is quick", "Feels responsive"], ["A timeout loses the whole reply", "Partial replies can be preserved"], ["Users may click again or leave", "Users read as it arrives"]),
      p("Perceived speed matters more than total time. A reply that starts instantly and takes six seconds to finish feels faster than one that arrives complete after four."),

      h2("Server-Sent Events (SSE)"),
      p("SSE is a simple standard: the browser opens a normal HTTP request, the server keeps it open and sends text messages down it as they are ready. It is one-way, from server to browser, which suits a reply being generated. The visitor's message is sent with an ordinary request, and the reply comes back as an event stream."),
      ul("**Simple:** plain HTTP; no special protocol upgrade.", "**Works through most proxies and firewalls** since it looks like a long response.", "**Automatic reconnection** in the browser's built-in support, with a way to resume.", "**Easy to implement** on most server frameworks.", "**Fits serverless and edge hosting** that support streaming responses."),
      h3("Limits of SSE"),
      ul("One direction only: the client cannot push events on the same connection.", "Browsers limit the number of simultaneous connections per domain on older protocols.", "Some proxies buffer responses unless configured not to.", "Text-based, so binary data needs encoding."),

      h2("WebSockets"),
      p("A WebSocket upgrades an HTTP connection into a two-way channel. Both sides can send messages at any time with low overhead. It is ideal for real-time apps such as multiplayer games, collaborative editing and live dashboards."),
      ul("**Two-way:** client and server both send at will.", "**Low latency** for frequent, small messages.", "**Binary support.**", "**Suitable for presence, typing indicators and live agent chat.**"),
      h3("Limits of WebSockets"),
      ul("Needs a long-lived connection to a server that holds state, which is awkward on serverless platforms.", "Some proxies, corporate networks and older infrastructure interfere with upgrades.", "You must build reconnection, heartbeats and message ordering yourself.", "More moving parts to scale and monitor."),

      h2("Side by side for an AI chatbot"),
      table(["Criterion", "SSE", "WebSockets"], ["Direction", "Server to client", "Both"], ["Fit for streaming an AI reply", "Excellent", "Works, more than needed"], ["Complexity", "Low", "Higher"], ["Serverless hosting", "Works well where streaming responses are supported", "Often needs a separate always-on server or managed service"], ["Proxy and firewall friendliness", "High", "Medium"], ["Reconnection", "Built-in support", "You build it"], ["Typing indicators and live human chat", "Awkward", "Natural"], ["Cost to operate", "Low", "Higher for many idle connections"]),
      p("For the core job of streaming a model's answer to a visitor, SSE does everything needed with less machinery."),

      h2("Streaming and serverless hosting"),
      p("Many small businesses' tools run on serverless platforms where each request is a short-lived function. Streaming responses are supported by modern platforms, but functions have time limits and cold starts, and some intermediaries buffer output. WebSockets require a persistent connection that most function platforms do not hold open. That is a major reason SSE is favoured on such hosting. If you need two-way real-time features, they are usually handled by a dedicated real-time service."),

      h2("How a streamed reply flows"),
      ol("The visitor sends a question to the server.", "The server retrieves relevant passages from the knowledge base.", "It calls the language model with streaming turned on.", "As each token or small group of tokens arrives, the server forwards it to the browser as an event.", "The widget appends the text as events arrive.", "At the end, the server sends a final event with metadata such as sources, and closes the stream."),
      p("Crescelo's chat endpoint streams replies as Server-Sent Events: token events as the text is generated, followed by source and completion events."),

      h2("Handling errors and cut-offs"),
      ul("**Connection drops mid-reply:** the client should show what it has, mark the reply incomplete and offer a retry.", "**Model stops early:** a robust server detects a reply that ends mid-sentence and asks the model to continue, so the visitor never sees half a sentence.", "**Provider error:** fall back to another provider or a friendly message; never a raw error.", "**Timeouts:** set sensible limits and send keep-alive messages so proxies do not close idle streams.", "**Duplicate sends:** protect against retries creating two replies."),
      p("Crescelo's server continues a reply that stops unfinished and closes cleanly if it cannot. See [how to stop a chatbot from making things up](/blog/grounded-ai-chatbot-hallucinations) for the accuracy side."),

      h2("Behind proxies and CDNs"),
      p("Streaming can be broken by intermediaries that buffer responses. Configure servers and proxies to disable buffering for stream endpoints, set appropriate headers (such as no-cache and an event-stream content type) and avoid compression that waits for the full response. Test through the same route your visitors use, including your CDN, not only on your laptop."),

      h2("Accessibility and widget behaviour"),
      ul("Announce new text to screen readers without repeating the whole reply on every token; batch updates.", "Respect reduced-motion preferences: avoid typing animations that add delay.", "Keep scroll behaviour predictable while text streams.", "Show a clear indicator when the reply is complete."),
      p("See [chatbot accessibility and WCAG](/blog/accessibility-wcag-compliance-website-chatbots)."),

      h2("When to choose WebSockets"),
      ul("You need live, two-way chat with human agents, typing indicators and presence.", "You have a persistent server and the operational capacity for it.", "Message frequency is high in both directions.", "You need binary data."),
      p("Many products combine approaches: SSE for AI streaming and a real-time service for live agent features."),

      h2("A simple decision guide"),
      table(["If you", "Choose"], ["Only need to stream an AI reply to the browser", "SSE"], ["Run on serverless hosting", "SSE"], ["Need two-way real-time features beyond the AI reply", "WebSockets or a real-time service, with SSE for the AI stream"], ["Are a small team wanting the least complexity", "SSE"]),

      h2("Frequently asked questions"),
      faq(
        ["What is the difference between SSE and WebSockets?", "SSE is a one-way stream from server to browser over ordinary HTTP. WebSockets are a two-way persistent channel."],
        ["Which is better for streaming AI replies?", "SSE is usually enough and simpler, especially on serverless hosting."],
        ["Does Crescelo use WebSockets?", "Its chat streams replies with Server-Sent Events."],
        ["Why does streaming sometimes arrive all at once?", "Usually a proxy or CDN is buffering the response. Disable buffering for the stream endpoint."],
        ["What happens if the connection drops?", "The widget should keep what it has received and offer a retry, and the server should continue unfinished replies."],
        ["Do I need to worry about this as a business owner?", "Not usually. It matters when choosing or building a platform, and when debugging slow-feeling chats."],
      ),
      p("See the [website widget feature](/product/website-widget), read [performance of embedded chat widgets](/blog/performance-optimization-embedded-chat-widgets) and [how a chat widget is built](/blog/modern-website-chatbot-architecture), and try streaming in the [playground](/playground)."),
    ],
  }),
];
