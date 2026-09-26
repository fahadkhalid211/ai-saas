import { faq, h2, ol, p, pillar, table, ul } from '../authoring';

export const PILLAR25 = [
  pillar({
    slug: 'how-to-choose-saas-software-small-business',
    title: 'How to Choose SaaS Software for Your Small Business: A Step-by-Step Evaluation Guide',
    description: 'A practical process for choosing business software: define the problem, list must-haves, shortlist, run a real trial, check security and costs, and plan for switching later.',
    primaryKeyword: 'how to choose SaaS software',
    secondaryKeywords: ['choosing business software', 'software evaluation checklist', 'SaaS buying guide small business', 'compare software tools'],
    body: [
      p("Choosing business software feels like it should be easy: search, compare a few feature lists, pick the one with the most ticks. In practice it is one of the most expensive small decisions a business makes, because the real cost is not the subscription. It is the hours spent setting it up, the data you put into it, the habits your team builds around it and the pain of leaving later. Many small businesses end up paying for three overlapping tools that nobody fully uses. This guide gives you a repeatable process for choosing software that fits: define the problem before you look at products, separate must-haves from nice-to-haves, build a short list, test with real work, check security and total cost, and plan your exit before you sign up. It works for a CRM, an accounting tool, a scheduling system, a chatbot or anything else you pay for monthly."),

      h2("Step 1: Write down the problem, not the product"),
      p("Start with one or two sentences describing what is going wrong today. 'We lose about a third of enquiries because nobody replies out of hours' is a problem. 'We need a chatbot' is a solution you have already chosen. Writing the problem first keeps you from buying features you will never use, and it gives you a way to judge success later."),
      table(["Vague request", "Better problem statement"], ["We need a CRM", "Leads are tracked in three spreadsheets and follow-ups are forgotten"], ["We need scheduling software", "Customers phone to book and we double-book about twice a month"], ["We need an AI assistant", "The same ten questions take two hours of staff time each day"], ["We need accounting software", "Invoicing takes a full day each month and payments are chased manually"]),

      h2("Step 2: Set must-haves, nice-to-haves and deal-breakers"),
      ul("**Must-haves:** without these the tool does not solve the problem. Keep to five or fewer.", "**Nice-to-haves:** helpful but you could live without them.", "**Deal-breakers:** for example, data stored outside your region, no export, no two-factor sign-in or a price that grows unpredictably."),
      p("This list is your scorecard. Products that fail a must-have are out, however impressive their marketing pages look."),

      h2("Step 3: Ask who else needs to be involved"),
      p("Software is used by people. Before shortlisting, name who will use it daily, who will administer it and who pays. Ask the daily users what annoys them about the current way of working; their answers are often more useful than any feature list. Tools chosen by one person and imposed on a team frequently sit unused."),

      h2("Step 4: Build a shortlist of three"),
      ol("Ask peers in your industry what they use and what they regret.", "Search for the problem, not the category, and read comparison pages with care since many are written by vendors.", "Check independent review sites, and read the three-star reviews, which are usually the most honest.", "Look at the vendor's own documentation and pricing page: clear, specific pages usually mean a mature product.", "Pick three. More than that and you will not test any properly."),

      h2("Step 5: Test with your real work"),
      p("A demo shows the product at its best. A trial with your own data shows how it behaves on an ordinary Tuesday. Give each shortlisted tool the same tasks:"),
      table(["Test", "What it reveals"], ["Set up from scratch without help", "How much the onboarding really costs in time"], ["Import a real spreadsheet or your documents", "Whether your data fits and imports cleanly"], ["Complete your three most common tasks", "Whether daily use is quick or clumsy"], ["Ask support a real question", "Response time and quality before you are a customer"], ["Let a colleague try it with no instructions", "How intuitive it is"]),
      p("Set a time limit, such as a week, and score each tool against your must-have list afterwards while the experience is fresh."),

      h2("Step 6: Check security and privacy"),
      ul("Does it support two-factor authentication and role-based access for your team?", "Where is data stored, and who are the sub-processors?", "Can you export all of your data in a common format, and delete it on request?", "Is there a data processing agreement if you handle personal data?", "How are stored credentials and API keys protected?", "Does the vendor publish a security or privacy page with specifics?"),
      p("Do not accept claims of certifications that you cannot verify; ask for evidence or check the vendor's public documents. For personal data, see the [GDPR checklist for website chatbots](/blog/website-chatbot-gdpr-checklist), and for team access, [securing your account with roles and two-factor authentication](/blog/setup-rbac-2fa-team-security)."),

      h2("Step 7: Work out the total cost"),
      table(["Cost", "Questions to ask"], ["Subscription", "Per user, per month, per feature? What happens when the team grows?"], ["Usage charges", "Are there limits on messages, contacts, storage or API calls, and what do overages cost?"], ["Set-up time", "Hours to configure, import data and train staff, multiplied by your hourly cost"], ["Add-ons", "Which of the features you need are in higher tiers?"], ["Integrations", "Do connections to other tools cost extra?"], ["Exit", "What does it cost in time to move away?"]),
      p("Where a product passes through a third-party cost, such as an AI provider, check whether the vendor adds a margin. Some offer a bring-your-own-key model with no markup; see [BYOK versus bundled pricing](/blog/byok-vs-bundled-ai-pricing-cost-comparison)."),

      h2("Step 8: Plan your exit before you enter"),
      ul("Confirm you can export your data in an open format such as CSV.", "Check the cancellation process and notice period.", "Prefer monthly billing until you are sure, even if annual is cheaper.", "Keep a copy of your key data outside the tool.", "Note how the contract handles price increases."),

      h2("Step 9: Decide, then run a pilot"),
      p("Pick the tool with the best score against your must-haves, not the one you liked most in the demo. Roll it out to a small group first, define what success looks like, such as 'replies to enquiries within an hour' and check after a month. Write down what you learned; it makes the next software decision faster."),

      h2("Common mistakes"),
      ul("Buying on features instead of the problem.", "Skipping a trial with real data.", "Ignoring the cost of staff time.", "Locking into an annual plan too early.", "Letting one enthusiast choose for everyone.", "Never reviewing whether the tool still earns its cost."),

      h2("Frequently asked questions"),
      faq(
        ["How do I choose the right software for my business?", "Define the problem, list must-haves, shortlist three products, test them with real work, check security and total cost, and plan your exit."],
        ["How many products should I compare?", "Three is a good number: enough to compare, few enough to test properly."],
        ["Should I choose the cheapest option?", "Not necessarily. Include set-up time, limits and the cost of switching, which often exceed the subscription."],
        ["What should I check about security?", "Two-factor sign-in, roles, where data is stored, export and deletion, and how credentials are protected."],
        ["Is an annual plan worth it?", "Only after a successful pilot. Start monthly if you can."],
        ["How often should I review my software?", "Once or twice a year: cancel what is unused and check that what remains still solves the original problem."],
      ),
      p("If you are considering an AI assistant, try it on your own documents in the [playground](/playground), see the [features](/product/ai-assistant) and compare [pricing](/pricing). You can also read [how to measure chat results](/blog/service-business-chat-analytics-playbook)."),
    ],
  }),

  pillar({
    slug: 'how-to-set-up-spf-dkim-dmarc-business-email',
    title: 'How to Set Up SPF, DKIM and DMARC So Your Business Emails Reach the Inbox',
    description: 'Step-by-step guide to email authentication for small businesses: what SPF, DKIM and DMARC do, how to add the DNS records, test them and fix common problems safely.',
    primaryKeyword: 'how to set up SPF DKIM DMARC',
    secondaryKeywords: ['email authentication', 'emails going to spam fix', 'DMARC record setup', 'business email deliverability'],
    body: [
      p("If your business emails land in spam, or if a customer tells you they received a message from 'you' that you never sent, the cause is usually email authentication. Mail providers such as Gmail, Outlook and Yahoo check whether a message really comes from the domain it claims. Three DNS settings, SPF, DKIM and DMARC, provide that proof. Since large providers began requiring authentication from bulk senders, and treating unauthenticated mail with more suspicion, setting these up has moved from nice-to-have to essential, even for small businesses that send a few hundred emails a month. The good news is that it is a one-off job of about an hour, needs no coding and can be done safely in stages. This guide explains what each record does in plain language, gives step-by-step instructions, shows how to test and lists the mistakes that most often cause problems."),

      h2("What the three records do"),
      table(["Record", "Plain-language job", "Where it lives"], ["SPF", "Lists which servers are allowed to send email for your domain", "A TXT record on your domain"], ["DKIM", "Adds a digital signature to each message, proving it was not altered and came from you", "A TXT (or CNAME) record with a selector name"], ["DMARC", "Tells receivers what to do when SPF or DKIM checks fail, and where to send reports", "A TXT record at _dmarc.yourdomain"]),
      p("Think of SPF as a guest list, DKIM as a tamper-proof seal and DMARC as the instruction to the doorman about what to do with anyone who is not on the list or has a broken seal."),

      h2("Before you start: list every service that sends your email"),
      ul("Your mailbox provider, such as Google Workspace or Microsoft 365.", "Your website contact form or booking system.", "Your newsletter tool.", "Your invoicing or accounting software.", "Your customer support and chat tools.", "Any CRM that emails on your behalf."),
      p("Each one needs to be covered by SPF and, ideally, signed with DKIM. Forgetting one is the most common reason legitimate email gets blocked after tightening the rules."),

      h2("Step 1: Find where your DNS is managed"),
      p("DNS records are edited where your domain's name servers point: often your registrar (where you bought the domain) or a service such as Cloudflare. Log in there and find the DNS or 'zone' settings. Take a screenshot or export of the existing records before changing anything."),

      h2("Step 2: Set up SPF"),
      ol("Check whether you already have an SPF record: a TXT record beginning with v=spf1. You may have only one per domain.", "Collect the include statements each sender requires from their documentation, for example include:_spf.google.com for Google Workspace.", "Combine them into one record, for example: v=spf1 include:_spf.google.com include:sendgrid.net ~all", "Save it as a TXT record at the root of your domain."),
      table(["Ending", "Meaning"], ["~all (soft fail)", "Mail from unlisted servers is suspicious but usually still delivered; a good starting point"], ["-all (hard fail)", "Mail from unlisted servers should be rejected; use once you are sure the list is complete"], ["?all or +all", "Neutral or allow everything: avoid, it defeats the purpose"]),
      p("SPF allows at most ten DNS lookups. Every include counts, and some contain more. If you exceed the limit, SPF fails for everything, so remove services you no longer use."),

      h2("Step 3: Set up DKIM"),
      ol("In each sending service's settings, find 'domain authentication', 'DKIM' or 'sender verification'.", "The service gives you one or more DNS records to add, usually CNAME or TXT records with a selector name such as selector1._domainkey.", "Add them exactly as shown; do not add your domain name twice, a common error with some DNS panels.", "Return to the service and click Verify. It can take from minutes to a day for DNS to update."),
      p("For your main mailbox provider, turn on DKIM signing in its admin console; in Google Workspace this is under Gmail authentication, and in Microsoft 365 in the Defender portal. Repeat the process for each service that sends email as your domain."),

      h2("Step 4: Set up DMARC gradually"),
      p("Start with a monitoring-only policy so nothing is blocked while you find gaps. Create a TXT record named _dmarc with a value such as:"),
      p("v=DMARC1; p=none; rua=mailto:dmarc-reports@yourdomain.com"),
      table(["Policy", "Effect", "When to use"], ["p=none", "Monitor only; report failures", "Start here for two to four weeks"], ["p=quarantine", "Failing mail goes to spam", "When reports show only legitimate mail passes"], ["p=reject", "Failing mail is refused", "Once you are confident; the strongest protection against spoofing"]),
      p("The rua address receives daily reports from mail providers. They are XML and hard to read, so use a free or low-cost report viewer if you want to make sense of them. Review them to find any sender you forgot to authenticate."),

      h2("Step 5: Test everything"),
      ul("Send a test email from each service to a Gmail address, open the message, choose 'Show original' and check that SPF, DKIM and DMARC all say PASS.", "Use a free online checker to look up your records and spot syntax errors.", "Send tests from the contact form, the booking system, invoices and newsletters, not only from your mailbox.", "Check the DMARC reports after a few days."),

      h2("Common problems and fixes"),
      table(["Problem", "Likely cause", "Fix"], ["SPF says permerror", "Two SPF records, or more than ten lookups", "Merge into one record and remove unused includes"], ["DKIM fails on forwarded mail", "Forwarding altered the message", "Normal in some cases; DMARC passes if SPF or DKIM aligns"], ["Newsletter still lands in spam", "Sender not authenticated, or a poor list", "Verify the domain in the tool and clean your list"], ["Records not found", "Added to the wrong domain or with the domain name duplicated", "Check the record host names"], ["Legitimate mail rejected after p=reject", "A forgotten sender", "Return to p=none, find the sender in reports, authenticate it"]),

      h2("Beyond the three records"),
      ul("Use a domain name for sending that matches your website.", "Keep your list clean and honour unsubscribes.", "Avoid sudden spikes in volume from a new domain.", "Monitor your reputation with the free tools that mailbox providers offer.", "Add a BIMI logo later if you want to show your brand in inboxes; it needs a strict DMARC policy first."),

      h2("Frequently asked questions"),
      faq(
        ["What are SPF, DKIM and DMARC?", "SPF lists servers allowed to send for your domain, DKIM signs each message and DMARC tells receivers how to handle mail that fails and sends you reports."],
        ["Do I need all three?", "Yes. Together they prove your email is genuine, and major providers expect them, especially from bulk senders."],
        ["Can I break my email by setting them up?", "Only if you jump straight to a strict DMARC policy. Start with p=none, review reports and tighten gradually."],
        ["How long do DNS changes take?", "Often minutes, sometimes up to a day or so depending on the record's time-to-live."],
        ["Why do I have to authenticate every tool?", "Each service that sends email as your domain is a separate sender, and any unlisted one can fail the checks."],
        ["How do I know it is working?", "Send tests to Gmail, view the original message headers and look for PASS on all three, and read your DMARC reports."],
      ),
      p("Booking and lead notifications from a chat assistant are email too, so authenticate your domain before turning them on. See [how bookings and reminders work](/product/appointment-booking), read [why contact forms fail](/blog/why-contact-us-forms-fail) and [start a trial](/login?mode=register). Related: [protect your team accounts](/blog/setup-rbac-2fa-team-security) and [choose software carefully](/blog/how-to-choose-saas-software-small-business)."),
    ],
  }),

  pillar({
    slug: 'how-to-back-up-business-data-3-2-1-rule',
    title: 'How to Back Up Your Business Data with the 3-2-1 Rule (and Test That It Works)',
    description: 'A plain-English guide to backing up small business data: what to protect, the 3-2-1 rule, cloud and SaaS data, automation, encryption, restore tests and a recovery checklist.',
    primaryKeyword: 'how to back up business data',
    secondaryKeywords: ['3-2-1 backup rule', 'small business backup plan', 'back up SaaS data', 'ransomware protection backups'],
    body: [
      p("Most small businesses do not think about backups until the day they need one: a laptop is stolen, a staff member deletes a folder, ransomware encrypts the shared drive, or a cloud account is locked. On that day the question is simple: can you get your data back, and how long will it take? Studies of small business failures consistently show that data loss is a leading contributor to serious disruption, and the cheap insurance is a backup routine that someone has actually tested. This guide gives you a practical plan without jargon. You will learn what data to protect, how the 3-2-1 rule works, how to handle data that lives in cloud services (which people wrongly assume is backed up), how to automate and encrypt backups, how to test restores and what to do in an emergency."),

      h2("Step 1: List what you must not lose"),
      table(["Category", "Examples", "Where it lives"], ["Financial records", "Invoices, accounting data, tax documents", "Accounting software, laptops, email"], ["Customer data", "Contacts, orders, bookings, conversations", "CRM, booking system, chat tools"], ["Documents", "Contracts, proposals, price lists, policies", "Shared drives, laptops"], ["Website", "Pages, images, database, settings", "Hosting provider, CMS"], ["Email", "Mailboxes and attachments", "Email provider"], ["Configuration", "Passwords, DNS records, licence keys", "Password manager, registrar"]),
      p("Rank them by how painful the loss would be. Start by protecting the top three."),

      h2("Step 2: Understand the 3-2-1 rule"),
      ul("**3** copies of your data: the original and two backups.", "**2** different types of storage, for example an external drive and cloud storage.", "**1** copy off-site, away from your office, so a fire, flood or theft cannot destroy everything."),
      p("Modern advice adds a fourth idea: keep at least one copy that cannot be changed or deleted from your normal computers, called an immutable or offline copy. Ransomware often encrypts every connected drive, including backups, so an isolated copy is your last line of defence."),

      h2("Step 3: Do not assume the cloud is a backup"),
      p("Cloud services keep your data available, but that is different from protecting it. If someone deletes a record, if a sync error overwrites files or if ransomware syncs encrypted files back to the cloud, the service faithfully keeps the damage. Most software-as-a-service providers operate on a shared-responsibility model: they keep the service running, and you are responsible for your content."),
      table(["Service type", "Backup approach"], ["Email and shared drives", "Third-party backup tools, or scheduled exports"], ["Accounting and CRM", "Regular exports to CSV or the tool's export function; keep the files"], ["Website", "Host backups plus your own periodic copy of files and database"], ["Booking and chat tools", "Export contacts, bookings and knowledge documents regularly"], ["Password manager", "An encrypted export stored offline"]),
      p("Always confirm that any tool you rely on lets you export your data; see [how to choose SaaS software](/blog/how-to-choose-saas-software-small-business)."),

      h2("Step 4: Choose your tools"),
      ol("For laptops and desktops, use the operating system's built-in backup to an external drive, plus an automatic cloud backup service.", "For servers or a shared drive, use a network storage device with snapshots and replicate to the cloud.", "For cloud accounts, use a reputable backup service that supports them, or scheduled exports.", "For an offline copy, rotate an encrypted external drive kept off-site, or use immutable cloud storage."),
      p("Pick tools that run without anyone remembering. A backup that depends on a person clicking a button will eventually stop."),

      h2("Step 5: Automate and encrypt"),
      ul("Schedule daily backups for changing data and weekly for the rest.", "Encrypt backups so a lost drive is not a data breach.", "Store encryption keys and passwords separately from the backups, in a password manager and a sealed printed copy.", "Set alerts for failed backups and check them."),
      p("For customer personal data, an unencrypted backup drive that goes missing can be a reportable breach in many places. See the [GDPR checklist](/blog/website-chatbot-gdpr-checklist)."),

      h2("Step 6: Decide how much loss you can tolerate"),
      table(["Term", "Meaning", "Example"], ["Recovery point objective (RPO)", "How much recent data you can afford to lose", "One day of bookings"], ["Recovery time objective (RTO)", "How long you can be without the system", "Four hours for the booking system, two days for old archives"]),
      p("These two numbers determine how often you back up and how quickly you need to restore. A clinic that cannot lose appointments needs more frequent backups than a business with a static brochure site."),

      h2("Step 7: Test a restore"),
      p("An untested backup is a hope, not a plan. Every quarter, pick a file, a mailbox item and one system export and restore them to a different location. Time the process and note any problems. Once a year, rehearse a bigger scenario: a laptop is lost, and a staff member needs to be working again on a spare machine by the end of the day."),

      h2("Step 8: Write a one-page recovery plan"),
      ul("Who to call and in what order.", "Where the backups are and how to access them, including passwords.", "The order in which to restore systems.", "How to contact customers if service is disrupted.", "Which accounts to lock and which passwords to change after an incident.", "Where the printed copy of this plan is kept."),
      p("Keep a copy outside the systems it describes, since you cannot read an online document if your accounts are down."),

      h2("Protecting against ransomware"),
      ul("Keep an offline or immutable backup.", "Enable two-factor sign-in everywhere; see [team roles and two-factor authentication](/blog/setup-rbac-2fa-team-security).", "Keep systems updated.", "Train staff to spot phishing.", "Limit who can delete or overwrite shared files."),

      h2("A simple starter setup"),
      table(["Item", "Suggested setup", "Frequency"], ["Laptops and desktops", "Automatic cloud backup plus an external drive", "Continuous or daily"], ["Shared documents", "Version history plus a weekly export to a second location", "Weekly"], ["Accounting and CRM", "Export to CSV and store in the backup location", "Monthly, and before big changes"], ["Website", "Host backups plus a copy of files and database", "Weekly, and before updates"], ["Passwords and DNS records", "Encrypted export stored offline", "After every change"]),
      p("Assign one person to own the backup routine and one deputy, so it does not depend on a single individual. Put a recurring reminder in the calendar for the quarterly restore test, and write down the result each time. If a restore fails, treat it as the most valuable thing the test could have found, fix it that day and test again."),

      h2("Frequently asked questions"),
      faq(
        ["What is the 3-2-1 backup rule?", "Keep three copies of your data, on two different types of storage, with one copy off-site."],
        ["Is Google Drive or Dropbox a backup?", "Not by itself. They sync changes, including deletions and encrypted files, so add a separate backup or version history you have tested."],
        ["How often should I back up?", "Daily for data that changes daily, weekly for the rest. Decide based on how much loss you can tolerate."],
        ["Do I need to encrypt backups?", "Yes, especially if they contain customer data and could be lost or stolen."],
        ["How do I know my backup works?", "Test a restore every quarter and time it."],
        ["Are the tools I use for customer chats and bookings included?", "Check each tool's export options and export your contacts, bookings and documents regularly."],
      ),
      p("Crescelo lets you keep your own copies of your source documents; see the [knowledge base feature](/product/knowledge-base) and [pricing](/pricing). For a related process, read [preparing your service menu and price list](/blog/prepare-service-menu-pricing-docs-rag)."),
    ],
  }),

  pillar({
    slug: 'how-to-create-customer-onboarding-process',
    title: 'How to Create a Customer Onboarding Process That Reduces Churn (With Templates)',
    description: 'Build a customer onboarding process step by step: define the first success, map the journey, write welcome messages, set milestones, measure activation and fix drop-offs.',
    primaryKeyword: 'how to create a customer onboarding process',
    secondaryKeywords: ['customer onboarding checklist', 'reduce churn onboarding', 'SaaS onboarding flow', 'welcome email sequence'],
    body: [
      p("The first days after someone signs up decide whether they stay. A customer who reaches a first useful result quickly tends to keep paying; one who logs in, feels lost and drifts away rarely returns. That is true for software subscriptions, and it is equally true for service businesses: a new client who does not know what to expect, what to prepare or how to reach you is more likely to cancel or never rebook. Onboarding is the process that guides a new customer from 'I signed up' to 'I got value'. Many small businesses leave it to chance, which means every customer has a different experience. This guide shows you how to design a simple onboarding process: define what success looks like, map the steps, write the messages, set milestones, measure activation and fix the places where people get stuck. It includes templates you can adapt today."),

      h2("Step 1: Define the first success"),
      p("Ask: what is the smallest result that proves to the customer that this was worth it? That is your activation moment. It should be concrete and quick."),
      table(["Business", "First success"], ["Project management software", "First project created with a teammate invited"], ["AI chat assistant", "Documents uploaded and a test question answered correctly"], ["Accounting tool", "First invoice sent"], ["Salon or clinic", "First appointment attended and the next one booked"], ["Agency", "Kick-off call held and access provided"]),
      p("Everything in your onboarding should push the customer toward that moment as directly as possible and remove anything that delays it."),

      h2("Step 2: Map the journey"),
      ol("**Before the start:** what happens between the decision and the first day? Confirmation, payment, what to bring or prepare.", "**Day one:** welcome, first step and where to get help.", "**First week:** the actions that lead to the first success.", "**First month:** building the habit, and checking in.", "**Beyond:** review, feedback and the next step, such as an upgrade or a rebooking."),
      p("Draw this as a simple list on one page. For each step, write who does it (the customer, you or automation) and what could go wrong."),

      h2("Step 3: Remove friction"),
      ul("Cut form fields that you do not need on day one.", "Offer sample data or templates so the customer does not start from an empty screen.", "Give one clear next action at each point, not a menu of ten.", "Provide a short guide or video only where people actually get stuck.", "Make help easy to find: a chat assistant on your website and in the product can answer setup questions at any hour."),

      h2("Step 4: Write the messages"),
      h2("The welcome message"),
      p("Send it immediately after sign-up or booking. Thank them, tell them the single thing to do next, say how long it takes and how to get help. Example: 'Welcome, Sam. The quickest way to see results is to upload your price list; it takes about five minutes. Here is the link. If you get stuck, reply to this email and we will help.'"),
      h2("The check-in"),
      p("Two or three days later, ask a specific question: 'Have you managed to add your first document?' Offer help if not. Keep it short and personal."),
      h2("The milestone message"),
      p("When the customer reaches the first success, acknowledge it and point to the next step. 'Your assistant answered its first ten questions. Next, try adding your booking hours.'"),
      h2("The early feedback request"),
      p("After a couple of weeks, ask one question: 'What almost stopped you from getting started?' The answers show you where onboarding leaks."),

      h2("Step 5: Set milestones and triggers"),
      table(["Milestone", "Trigger if not reached", "Response"], ["First step completed within 24 hours", "Not started", "Friendly nudge with a link and an offer of help"], ["First success within a week", "Not reached", "Personal email or call to unblock"], ["Second use within two weeks", "No return", "Share a helpful tip or short case example"], ["First month check", "Any", "Feedback request and suggestion for the next step"]),
      p("Not every trigger needs to be automated. For a small customer base, a calendar reminder to send a personal note works well and feels better."),

      h2("Step 6: Measure activation"),
      ul("**Activation rate:** the share of new customers who reach the first success.", "**Time to first success:** how long it takes, on average.", "**Drop-off point:** the step where most people stop.", "**Early cancellations:** how many leave in the first thirty days and why."),
      p("Track these in a simple spreadsheet. Improve one step at a time, and compare each new group of customers with the last. See [how to find funnel drop-off in chat](/blog/tracking-in-chat-funnel-drop-off) for a similar method."),

      h2("Step 7: Talk to the customers who leave"),
      p("Ask people who cancelled or went quiet what happened. Keep it non-defensive: 'What did you hoped to achieve, and what got in the way?' Look for patterns. Frequent answers such as 'I could not work out how to add my data' point to a fix: a template, a shorter form or a better guide."),

      h2("For service businesses"),
      ul("Send a confirmation with what to bring, how to get there and what to expect.", "Send a reminder that includes a way to change the appointment.", "After the first visit, follow up with aftercare and offer the next booking; see [follow-up and rebooking habits](/blog/post-appointment-nurture-rebooking-sequences).", "Make the first visit as smooth as possible, since it shapes everything that follows."),

      h2("A one-page onboarding checklist"),
      ul("Define the first success.", "Write the five steps to reach it.", "Draft four messages: welcome, check-in, milestone, feedback.", "Choose two measures: activation rate and time to first success.", "Review monthly and change one thing."),

      h2("A worked example"),
      p("A small physiotherapy clinic noticed that many new patients cancelled after the first visit. It defined its first success as 'the patient attends the second appointment'. It added a confirmation email listing what to wear and where to park, a same-day message with three exercises to try, and a prompt to book the follow-up before leaving. It asked new patients what almost stopped them from returning. Within a few months, second visits rose noticeably, because each step removed a small point of uncertainty."),
      table(["Before", "After"], ["No message between booking and visit", "Confirmation with what to expect"], ["Aftercare given verbally", "Written aftercare the same day"], ["Rebooking left to the patient", "Follow-up booked at the first visit"]),
      p("You do not need special software to start. A checklist, four templates and a monthly look at the numbers are enough to improve the experience for every new customer."),

      h2("Frequently asked questions"),
      faq(
        ["What is customer onboarding?", "The process of guiding a new customer from sign-up to their first real result, so they see value and stay."],
        ["What is an activation moment?", "The first concrete result that proves value, such as the first invoice sent or the first question answered correctly."],
        ["How long should onboarding take?", "As short as possible. Aim for the first success within the first session or the first week."],
        ["Should onboarding be automated?", "Automate the routine parts, but keep personal contact for customers who are stuck."],
        ["How do I know if onboarding is working?", "Track the share of new customers who reach the first success and how many cancel in the first month."],
        ["Can a chatbot help with onboarding?", "Yes. An assistant trained on your setup guides can answer common questions any time of day."],
      ),
      p("You can test an assistant that answers setup questions in the [playground](/playground), see the [AI assistant feature](/product/ai-assistant) and read about [resolving questions on first contact](/blog/first-contact-resolution-fcr-ai-chat)."),
    ],
  }),

  pillar({
    slug: 'how-to-write-standard-operating-procedures-sops',
    title: 'How to Write Standard Operating Procedures (SOPs) Your Team Will Actually Follow',
    description: 'Learn to write clear SOPs: choose which processes to document, capture how work is really done, use simple templates, test with a newcomer and keep them updated.',
    primaryKeyword: 'how to write standard operating procedures',
    secondaryKeywords: ['SOP template', 'document business processes', 'process documentation small business', 'employee training documents'],
    body: [
      p("In many small businesses, the most important knowledge lives in someone's head: how to open the shop, how to handle a refund, which supplier to call when the boiler part is late. That works until the person is ill, leaves or gets too busy to answer the fifth question of the day. Standard operating procedures, or SOPs, are written instructions for repeatable tasks. Done well, they make training faster, reduce mistakes, keep quality consistent and free the owner from being the only source of answers. Done badly, they become a thick manual that nobody opens. This guide shows how to write SOPs people use: which processes to document first, how to capture what really happens, a simple template, how to write clearly, how to test with a newcomer, where to store the documents and how to keep them current. As a bonus, the same documents make an excellent knowledge base for an AI assistant."),

      h2("Step 1: Choose what to document first"),
      p("Do not try to write everything. Start with processes that are frequent, risky or often asked about."),
      table(["Criterion", "Examples"], ["Done often", "Opening and closing, taking bookings, invoicing"], ["Costly if done wrong", "Refunds, safety checks, handling personal data"], ["Only one person knows", "Ordering from key suppliers, payroll steps"], ["New staff struggle with", "Using the till, handling complaints"], ["Customers ask about", "Cancellations, deposits, aftercare"]),
      p("Pick five. Finishing five useful SOPs beats starting fifty."),

      h2("Step 2: Capture how the work is really done"),
      ol("Ask the person who does the task best to walk you through it while you watch.", "Write down every step, including the ones they do without thinking.", "Note the tools used, the decisions made and what can go wrong.", "Take screenshots or photos where they help.", "Ask: what do new people usually get wrong?"),
      p("Recording a screen or phone video while they work is a quick way to gather the details. You can turn it into text afterwards."),

      h2("Step 3: Use a simple template"),
      table(["Section", "What to write"], ["Title", "The task in plain words: 'Process a refund'"], ["Purpose", "One sentence on why it matters"], ["Who does it", "Role, not name"], ["When", "The trigger: 'When a customer asks for money back'"], ["What you need", "Tools, logins, forms"], ["Steps", "Numbered, one action each"], ["Common mistakes", "What to avoid"], ["If something goes wrong", "Who to ask or what to do"], ["Last reviewed", "Date and owner"]),
      p("Keep to one page where possible. If a process needs more, split it into smaller SOPs and link them."),

      h2("Step 4: Write clearly"),
      ul("Start each step with a verb: 'Open', 'Check', 'Send'.", "One action per step.", "Use the words your team uses, and define any jargon.", "Say what good looks like: 'The receipt shows the refund amount and today's date.'", "Include exact wording for customer messages where consistency matters.", "Use short sentences and lists rather than paragraphs.", "Add a screenshot only if it clarifies."),
      p("Decisions need a rule. Instead of 'use judgement', write 'if the amount is under $50, approve it; if it is over, ask the manager'."),

      h2("Step 5: Test it with a newcomer"),
      p("The real test of an SOP is whether someone who has never done the task can follow it alone. Give the document to a new or unrelated team member and watch without helping. Note every place they hesitate or ask a question, then fix those steps. Repeat until they succeed. Most first drafts fail this test; that is normal and is exactly what the test is for."),

      h2("Step 6: Store SOPs where people will find them"),
      ul("Use one shared location, such as a shared drive or a wiki, with clear names.", "Organise by area: front desk, operations, finance.", "Make them searchable, and link them from the places where work happens.", "Keep a single current version; archive old ones instead of leaving copies around.", "Give access to the people who need it, and restrict who can edit."),
      p("If staff regularly ask the same questions, an internal assistant trained on your SOPs can answer them instantly. Crescelo's knowledge base can ingest documents and pages; test it in the [playground](/playground). For customer-facing documents, see [preparing your service menu and price list](/blog/prepare-service-menu-pricing-docs-rag)."),

      h2("Step 7: Assign owners and review dates"),
      table(["Item", "Recommendation"], ["Owner", "One named person responsible for each SOP"], ["Review", "Every six to twelve months, and whenever the process changes"], ["Change log", "A short note of what changed and when"], ["Retirement", "Delete or archive SOPs for processes you no longer do"]),
      p("A wrong SOP is worse than none, because people follow it confidently. Owners and review dates prevent slow decay."),

      h2("Step 8: Train with SOPs, and use feedback"),
      ul("Use SOPs as the training script for new hires and check off tasks as they are learned.", "Encourage staff to suggest improvements; they know where the steps are unclear.", "When a mistake happens, fix the SOP as well as the mistake.", "Celebrate updates so keeping documents current becomes a habit."),

      h2("Common mistakes"),
      ul("Writing documents no one asked for.", "Describing the ideal process rather than the real one.", "Long paragraphs instead of steps.", "No owner, so nothing is updated.", "Hiding them in a location no one checks.", "Never testing with a newcomer."),

      h2("An example SOP"),
      table(["Section", "Example"], ["Title", "Process a refund"], ["Purpose", "Return money quickly and consistently while protecting the business"], ["Who", "Front desk staff"], ["When", "A customer asks for money back within 14 days"], ["Steps", "1. Ask for the order or booking number. 2. Check it in the system. 3. If the amount is under $50, approve it. 4. Refund to the original payment method. 5. Send the refund confirmation message. 6. Note the reason in the log."], ["Common mistakes", "Refunding to a different method; forgetting the log entry"], ["If unsure", "Ask the manager before approving over $50"]),
      p("Notice how short it is. A new team member can follow it on their first day, and the manager can change the limit in one place when policy changes."),

      h2("Rolling SOPs out to the team"),
      ol("Explain why: fewer interruptions, easier training and more consistent service.", "Introduce one SOP at a time, and let people use it for a week before adding another.", "Ask the team what is unclear and fix it straight away.", "Name a champion for each area who keeps the documents current.", "Review the set together every quarter and retire what is no longer used."),
      p("People follow procedures they helped shape. Involving the team in writing and improving them is the difference between a living system and a binder on a shelf."),

      h2("Frequently asked questions"),
      faq(
        ["What is an SOP?", "A standard operating procedure is a written set of steps for carrying out a repeatable task the same way each time."],
        ["How many SOPs does a small business need?", "Start with the five most important processes and add more as needs arise."],
        ["How long should an SOP be?", "Ideally one page. Split larger processes into linked SOPs."],
        ["How do I keep SOPs up to date?", "Assign an owner, set a review date and update whenever the process changes."],
        ["Can SOPs be used for an AI assistant?", "Yes. Clear, current documents are also the best source for a chatbot's knowledge base, provided customer-facing ones are separate from internal ones."],
        ["What is the best format?", "Numbered steps with a short purpose and a list of common mistakes, plus screenshots where useful."],
      ),
      p("See how [reducing repeated questions helps your team](/blog/prevent-front-desk-burnout-ai), the [knowledge base feature](/product/knowledge-base), [pricing](/pricing) and [how to create a customer onboarding process](/blog/how-to-create-customer-onboarding-process)."),
    ],
  }),
];
