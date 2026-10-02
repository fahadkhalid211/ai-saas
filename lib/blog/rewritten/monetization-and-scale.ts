import { faq, h2, h3, note, ol, p, pillar, table, ul } from '../authoring';

export const MONETIZATION_AND_SCALE_POSTS = [
  pillar({
    slug: 'how-to-earn-money-with-ai-website-assistants',
    title: 'How to Earn Money with AI Website Assistants: The Complete Monetization Guide',
    description: 'Learn how to monetize AI website assistants using Crescelo: selling client setups, recurring retainer models, after-hours booking revenue, and zero token markup.',
    primaryKeyword: 'how to earn money with AI website assistants',
    secondaryKeywords: [
      'monetize AI chatbots',
      'start an AI automation agency',
      'sell AI website assistants to local businesses',
      'earn recurring revenue with AI chatbots',
      'AI chatbot agency pricing',
    ],
    clusterId: 1,
    clusterName: 'AI Website Chatbots',
    funnel: 'BOFU',
    tags: ['Monetization', 'AI Agency', 'Revenue', 'Business Growth'],
    body: [
      p("The explosion of generative AI has created a massive commercial gap: local service businesses know they need AI to stop missing customer inquiries, but few business owners have the time, technical skill, or patience to configure API keys, vector embeddings, and calendar integrations. For entrepreneurs, agency operators, and freelancers, this gap is one of the highest-margin service opportunities of the decade."),
      p("Earning consistent, high-margin revenue with AI does not require building machine learning models from scratch or writing thousands of lines of Python code. By leveraging [Crescelo](/product)—an application engineered specifically for service business appointment booking, document retrieval, and customer triage—you can build a scalable recurring revenue business or directly unlock thousands of dollars in lost booking revenue for your own practice."),
      p("This comprehensive guide details the exact commercial models, pricing frameworks, and implementation workflows required to earn money with AI website assistants, with every single operational benefit delivered directly through the Crescelo app."),

      h2("The Core Monetization Models Powered by Crescelo"),
      p("There are three primary avenues to generate substantial income using the Crescelo platform: launching an AI Automation Agency (AAA), capturing after-hours revenue for your existing service firm, and providing turnkey hosted landing pages for offline businesses."),
      
      h3("1. The AI Automation Agency (AAA) Retainer Model"),
      p("Local service providers—including dental clinics, law practices, roofing contractors, salons, and accounting firms—regularly spend thousands of dollars per month on paid Google Ads and local SEO. Yet, up to 60% of that incoming traffic bounces without taking action because no one is available to answer questions or schedule appointments after 5:00 PM."),
      p("Using Crescelo's multi-assistant architecture, you can package and sell an 'AI Front Desk as a Service' to local merchants. A standard agency package includes:"),
      ul(
        "**Upfront Onboarding & Knowledge Ingestion ($750 – $2,500):** You gather the client's PDF service menus, FAQ sheets, warranties, and website pages, uploading them directly into Crescelo's knowledge base engine.",
        "**Calendar & Booking Integration:** You connect the client's Google Calendar or Outlook feed directly to Crescelo, configuring specific appointment durations, staff assignments, and slot buffers.",
        "**Monthly Maintenance & Analytics Retainer ($199 – $699/month):** You oversee conversation logs, refine unanswered questions using Crescelo's weekly query audits, update seasonal promotions, and ensure uptime."
      ),

      h3("2. Capturing After-Hours Revenue for Your Own Business"),
      p("If you already own or operate a service business, Crescelo functions as a profit-generation machine that monetizes high-intent visitors while your physical doors are locked. A customer seeking emergency flat roof repairs or a high-ticket cosmetic dental consultation at 10:30 PM will rarely wait until 9:00 AM the next business day to call; they book with the provider who offers instant confirmation on the spot. Learn more about the mechanics in our guide on [how to stop double bookings online](/blog/stop-double-bookings-online)."),
      p("By installing Crescelo's lightweight JavaScript snippet on your website, you capture these high-intent customers immediately through conversational intake, checking real-time slot availability, and holding the reservation on your live calendar. You can also [audit customer conversations each week](/blog/audit-website-chatbot-conversations) to spot new high-value service inquiries."),

      h3("3. Selling Turnkey Hosted Booking Pages to Offline Businesses"),
      p("Thousands of solo practitioners—barbers, personal fitness trainers, mobile detailers, and independent consultants—lack a functional, mobile-optimized website. Instead of spending weeks building a complex WordPress or Webflow site, you can launch a dedicated Crescelo hosted business landing page (`/site/[id]`) for them in under fifteen minutes."),
      p("These hosted pages come pre-equipped with responsive design, an interactive booking assistant, service menu highlights, and direct mobile scheduling, allowing you to charge an immediate setup fee plus an ongoing monthly hosting subscription."),

      h2("Why Crescelo's Zero Token Markup Guarantee Protects Your Margins"),
      p("The biggest pitfall for agencies utilizing legacy chatbot builders is arbitrary token pricing and predatory billing markups. Platforms like Chatbase or Dante AI typically charge 5x to 10x markups on underlying LLM tokens or impose strict monthly message caps that eat away at your retainer profits as your clients' chat volumes grow."),
      p("Crescelo is built on a strict **Zero Token Markup Guarantee**. Through Crescelo's Bring Your Own Key ([BYOK](/blog/bring-your-own-ai-key-byok-explained)) architecture, you or your clients connect direct API accounts with OpenAI, Google Gemini, Anthropic Claude, Groq, or DeepSeek:"),
      ul(
        "**Raw Wholesale Rates:** You pay the AI provider directly for model computation (often less than $0.0015 per conversation using efficient models like GPT-4o mini or Gemini 1.5 Flash).",
        "**Free Inference Cascade:** For zero-cost operations, Crescelo includes a built-in Zero-Cost Inference Engine that cascades across Groq's high-speed free tier, Google AI Studio, and local Ollama instances.",
        "**100% Margin Retention:** When you bill a client $350 per month for their AI assistant, your total software cost remains fixed on [Crescelo's pricing plans](/pricing), leaving you with a 90% to 98% net gross margin."
      ),

      h2("The 2-Minute Pitch: Closing Clients Using the Crescelo Playground"),
      p("Traditional agency sales pitches rely on pitch decks, speculative mockups, and lengthy sales cycles. Crescelo provides a built-in sales conversion tool that allows you to close local clients in a single interaction: the [public playground](/playground)."),
      p("Here is the exact pitch workflow top agencies use to sign new accounts:"),
      ol(
        "Visit the prospective business's website, Instagram profile, or Facebook page, and download their public service menu, price list, or promotional flyer.",
        "Navigate to the [Crescelo Playground](/playground) and upload the flyer or paste their website URL. In less than 120 seconds, Crescelo indexes the material and spawns a fully functional, grounded conversational assistant.",
        "Record a 90-second personalized Loom video or invite the business owner to an interactive screen share. Ask the assistant nuanced, client-specific questions: 'Do you offer bridal makeup packages?' or 'What is your cancellation policy for color treatments?'",
        "Showcase how the assistant answers with absolute accuracy and immediately prompts the visitor to reserve a spot on the calendar.",
        "Deliver the closing proposition: 'This assistant is already built from your documents. We can connect it to your live calendar and install it on your website today.'"
      ),

      h2("Monetization Potential: Agency & Business Economics"),
      p("To understand how quickly recurring revenue compounds when offering Crescelo assistants, examine the cost and revenue dynamics across typical service tiers:"),
      table(
        ["Monetization Model", "Target Client", "Upfront Fee", "Monthly Retainer", "App Features Leveraged", "Net Profit Margin"],
        ["Local Service Assistant", "Barbers, Salons, Spas", "$500 – $1,000", "$199 / mo", "RAG Grounding, Calendar Mutex, Widget", "92% – 96%"],
        ["Medical / Dental Front Desk", "Dentists, Physio, Clinics", "$1,500 – $2,500", "$399 / mo", "Intake Triage, Custom Fields, SMS / Email", "94% – 97%"],
        ["High-Ticket Trades & Roofers", "HVAC, Roofing, Plumbing", "$1,200 – $2,000", "$499 / mo", "Emergency Handover, Webhooks, Lead Capture", "95% – 98%"],
        ["Omnichannel Enterprise", "Multi-location Franchises", "$3,000 – $5,000", "$899 / mo", "WhatsApp, Telegram, Agency Workspaces", "90% – 95%"],
        ["Direct In-House Booking", "Your Own Service Business", "N/A (Owner)", "Captured Bookings", "24/7 After-Hours Scheduling, No Double-Books", "300%+ ROI"]
      ),

      h2("Eliminating Lost Revenue with In-Chat Appointment Booking"),
      p("Most website chatbots are glorified FAQ widgets: they display a paragraph of text and instruct the visitor to 'call our office' or 'navigate to our booking page'. In modern consumer behavior, every additional click or redirect causes a 20% to 40% drop-off in user conversion."),
      p("Crescelo monetizes web traffic by embedding the complete scheduling checkout directly inside the conversation stream. When a visitor asks, 'Can Marcus cut my hair tomorrow around 3:00 PM?', Crescelo executes a sequence of high-value actions:"),
      ul(
        "**Real-Time Schedule Verification:** It queries the connected calendar feed to verify Marcus's active schedule and existing appointments.",
        "**Interactive Slot Selection:** It renders clickable time cards directly in the chat bubble (e.g., 3:15 PM, 3:45 PM).",
        "**Atomic Mutex Concurrency Lock:** When the client confirms, Crescelo places an atomic lock on that precise slot, preventing any concurrent user on another device from reserving the same window.",
        "**Instant iCal & Confirmation Dispatch:** Confirmation emails with calendar invitations (`.ics` files) are dispatched automatically, locking in the booking without any manual staff involvement."
      ),
      p("Capturing just three additional high-ticket appointments per week (such as a $150 salon treatment or a $400 dental cleaning) translates to over $20,000 in found annual revenue for a single business location."),

      h2("Monetizing High-Value Leads with Instant Human Handover"),
      p("While routine inquiries (hours, directions, pricing tiers) should be handled autonomously, high-ticket custom jobs require immediate human closing. For example, a homeowner inquiring about a $15,000 roof replacement following storm damage needs personal attention immediately."),
      p("Crescelo includes native **One-Click Human Handover**:"),
      ol(
        "The AI recognizes high-intent buying signals or direct requests for personal consultation.",
        "It instantly triggers an urgent notification across configured webhooks, Slack channels, or email alerts, delivering the prospect's name, phone number, and conversation summary.",
        "Your team or your client's sales representatives can enter the live chat thread in one click with the full context already visible, greeting the prospect by name and closing the transaction on the spot."
      ),
      p("By bridging the gap between automated 24/7 qualification and human closing, businesses convert leads that would have otherwise bounced to a competitor's contact form."),

      h2("Expanding Revenue Streams: Selling WhatsApp and Telegram Channels"),
      p("Website visitors are only one segment of modern digital commerce. In Europe, Latin America, Asia, and increasingly North America, customer interactions happen heavily within instant messaging apps like WhatsApp and Telegram."),
      p("Crescelo allows agencies to offer an **Omnichannel Assistant Upgrade** without increasing management complexity. Through Crescelo's channel connectors, a single configured knowledge base and calendar engine simultaneously powers:"),
      ul(
        "The embeddable desktop and mobile website widget.",
        "An official WhatsApp Business chat number.",
        "A 24/7 responsive Telegram bot channel.",
        "A standalone hosted business web portal."
      ),
      p("Agencies can package WhatsApp and Telegram integration as a premium $150 to $300 monthly upsell, delivering immense value to clients whose customers prefer messaging over traditional web browsing."),

      h2("How to Get Started and Bill Your First Client in 7 Days"),
      p("Launching an AI assistant revenue stream does not require weeks of software development. Follow this step-by-step action plan using the Crescelo platform:"),
      ol(
        "**Sign Up for a Free Trial:** Create your account on [Crescelo](/login?mode=register) and explore the dashboard tools.",
        "**Pick an Initial Niche:** Focus on service businesses with high average ticket values and appointment dependencies (dental practices, med spas, barbershops, HVAC contractors, or legal intake).",
        "**Gather Public Marketing Material:** Identify 5 local businesses in your city, download their publicly available service menus and price sheets, and test their data in the [Crescelo Playground](/playground).",
        "**Send Video Demos:** Send personalized 60-second video walkthroughs showcasing their custom assistant answering real client questions.",
        "**Deploy with One Line of Code:** When the client agrees, connect their calendar, configure their brand colors in the dashboard, and send them the single-line JavaScript snippet to paste before the closing `</body>` tag of their website.",
        "**Collect Your Setup & Retainer:** Bill the client via Stripe or invoicing, retaining 95%+ of your monthly retainer as recurring profit."
      ),
      note("Ready to monetize your first assistant? [Start a 14-day free trial](/login?mode=register) and deploy your first client bot today."),

      h2("Frequently Asked Questions About Earning Money with AI Assistants"),
      faq(
        [
          "How much can I realistically charge clients for a Crescelo AI assistant?",
          "Most digital agencies charge an initial setup fee of $500 to $2,500 depending on document complexity and calendar workflows, followed by an ongoing monthly retainer between $199 and $699 per location for maintenance, analytics reporting, and knowledge updates."
        ],
        [
          "Do I need programming or coding skills to sell Crescelo assistants?",
          "No. Crescelo is built specifically as a zero-code platform. Adding business knowledge is as simple as uploading PDF files or pasting web links, and calendar integration connects directly with Google Calendar in seconds."
        ],
        [
          "How does Crescelo's zero token markup save me money?",
          "Unlike competitors that markup AI token costs by 500% to 1,000%, Crescelo lets you connect your own provider API keys (OpenAI, Gemini, Anthropic, Groq) or use free inference tiers. You pay raw wholesale rates (pennies per month), allowing you to keep nearly 100% of your client retainers as net profit."
        ],
        [
          "Can I manage multiple client assistants from a single login?",
          "Yes. Crescelo's dashboard architecture allows you to create, manage, and configure separate assistants and workspaces for multiple independent clients from a central interface."
        ],
        [
          "What happens if an assistant cannot answer a client's question?",
          "Crescelo's grounded RAG system instructs the model never to invent facts or hallucinate. When content is missing, it politely admits it does not know and offers an instant calendar booking or human handover, logging the unanswered question so you can update the knowledge base."
        ]
      )
    ],
  }),

  pillar({
    slug: 'how-to-scale-a-service-business-with-ai',
    title: 'How to Scale a Service Business with AI: 10x Your Bookings Without Adding Headcount',
    description: 'Discover how service businesses use Crescelo to scale appointment bookings, eliminate front-desk bottlenecks, and operate 24/7 without extra staff overhead.',
    primaryKeyword: 'how to scale a service business with AI',
    secondaryKeywords: [
      'scale service business with AI',
      'grow appointment bookings with AI',
      'automate service business front desk',
      'scale service business capacity without hiring',
      'AI front desk for service businesses',
    ],
    clusterId: 2,
    clusterName: 'AI Appointment Booking',
    funnel: 'BOFU',
    tags: ['Scaling', 'Service Business', 'Appointment Booking', 'Automation'],
    body: [
      p("For service businesses—salons, medical and dental clinics, law practices, roofing contractors, and consulting firms—growth almost always collides with a painful operational bottleneck: the front desk. When phone lines are tied up, receptionists are occupied with checking in physical clients, or inquiries arrive after hours, high-value bookings vanish."),
      p("Traditionally, the only way to scale booking capacity was to hire more front-desk receptionists, outsource to expensive third-party call centers, or add overhead that erodes operating margins. Today, forward-thinking operators are taking a radically different approach: deploying an autonomous AI website assistant like [Crescelo](/product) to handle customer intake, answer complex pricing questions, and confirm calendar bookings around the clock."),
      p("This playbook outlines the exact operational architecture needed to scale your service business capacity 10x without adding a single dollar to your payroll overhead."),

      h2("The Staffing Ceiling: Why Traditional Service Scaling Breaks Down"),
      p("Service businesses operate on finite human attention. Consider what happens during a typical peak business day at a busy salon, trade office, or healthcare clinic:"),
      ul(
        "**Single-Threaded Intake:** A human receptionist can only answer one phone call or greet one walk-in client at a time. If two people call while a third is standing at the desk, two prospects are sent to voicemail.",
        "**The Voicemail Graveyard:** Over 75% of consumers who reach a voicemail do not leave a message; they immediately hang up and contact the next listing on Google.",
        "**The 5:00 PM Shutdown:** High-intent prospects regularly research and attempt to book appointments between 8:00 PM and 11:00 PM after their own workday ends. If your business cannot confirm a time slot instantly, the booking is lost.",
        "**Repetitive Question Drain:** Reception staff spend up to 4 hours per day answering the exact same 10 basic questions: 'What are your hours?', 'Where do I park?', 'How much for a service?', and 'Do you take my insurance?'"
      ),
      p("When business owners attempt to solve these issues by hiring additional receptionists, they incur substantial fixed costs: salaries, payroll taxes, benefits, training time, and turnover disruptions. Crescelo removes this ceiling entirely by turning your digital presence into an autonomous front desk that scales infinitely."),

      h2("How Crescelo Scales Service Capacity Autonomously"),
      p("Crescelo is engineered specifically to eliminate front-desk bottlenecks while maintaining human-level empathy and brand fidelity. Here is how the application transforms operational throughput:"),
      
      h3("1. Infinite Concurrent Availability (24/7/365)"),
      p("Whether your website receives 5 visitors or 500 visitors simultaneously, Crescelo handles every conversation in real time with sub-second response speeds. It never puts a customer on hold, never calls in sick, and operates with the same cheerful precision at 3:00 AM on Sunday as it does at noon on Tuesday."),

      h3("2. Strict RAG Knowledge Grounding (Zero Hallucinations)"),
      p("The number one fear service business owners have regarding AI is misinformation: an assistant promising discounts that do not exist or quoting the wrong service durations. Crescelo solves this through strict Retrieval-Augmented Generation (RAG). Learn more about why this matters in our guide comparing [grounded RAG vs hallucinating custom GPTs](/blog/grounded-rag-vs-custom-gpts-business-security)."),
      p("You upload your actual operational documents—service pricing menus, doctor intake protocols, cancellation policies, parking instructions, and preparation guidelines. Crescelo restricts every single reply to those verified documents. If a client asks a question not covered in your material, the assistant admits it does not know and immediately offers to schedule a consultation or connect with a staff member."),

      h3("3. Real-Time In-Chat Calendar Booking with Slot Mutex Locks"),
      p("Booking an appointment should not require navigating away to third-party scheduling portals or exchanging five emails. In fact, research shows [why in-chat booking converts higher than external forms](/blog/crescelo-vs-chatbase-dante-ai-booking). Crescelo renders live calendar selection cards directly inside the conversation stream."),
      p("Most importantly, Crescelo incorporates an **atomic concurrency mutex lock**. When a customer selects an open 2:00 PM slot, the system locks that time window during the checkout process. This guarantees that two simultaneous visitors on different phones can never double-book the same provider, completely protecting your schedule integrity. Read our in-depth technical analysis on how to [prevent double-bookings with atomic concurrency mutexes](/blog/stop-double-bookings-online)."),

      h2("Comparing Operational Models: Human Front Desk vs. Crescelo AI"),
      p("To evaluate the economic impact of scaling with an AI website assistant versus traditional staffing, compare the operational parameters side by side:"),
      table(
        ["Operational Dimension", "Human Receptionist", "Outsourced Call Center", "Crescelo AI Assistant"],
        ["Operating Hours", "8 hours/day (40 hrs/wk)", "16 – 24 hours/day", "24/7/365 Uninterrupted"],
        ["Concurrent Inquiries", "1 customer at a time", "Limited by call pool", "Unlimited simultaneous chats"],
        ["Response Time", "2 – 15 minutes (or voicemail)", "30 – 90 seconds", "Instant (< 1 second)"],
        ["Monthly Overhead", "$3,000 – $4,500 + benefits", "$800 – $2,000 / month", "Predictable flat software plan"],
        ["Booking Accuracy", "Prone to manual diary errors", "Script mistakes common", "100% database-verified & mutex-locked"],
        ["Double-Booking Risk", "Moderate (human oversight)", "High (multi-agent latency)", "Zero (atomic slot locking)"],
        ["Scalability Ceiling", "Requires hiring more headcount", "Per-minute overage costs", "Scales infinitely with zero marginal cost"]
      ),

      h2("Multi-Staff & Resource-Aware Scheduling"),
      p("A major challenge when scaling service businesses is coordinating multiple providers and treatment rooms. A salon may have six stylists with varying price tiers; a dental practice may have three hygienists and two surgeons; a home services firm may have four dispatch technicians covering distinct zip codes."),
      p("Crescelo handles multi-provider logic natively inside the chat interface:"),
      ul(
        "**Staff Assignment:** Visitors can choose their preferred provider (e.g., 'Book with Dr. Chen') or select 'First Available' to maximize chair utilization.",
        "**Dynamic Duration & Buffer Times:** Different services automatically allocate distinct time blocks on the calendar (e.g., 30 minutes for a haircut vs. 90 minutes for a full balayage), complete with pre-configured clean-up buffers.",
        "**Territory & Service Filtering:** For home service contractors, the assistant verifies the customer's postal code against your operational territory before allowing an on-site inspection to be scheduled."
      ),

      h2("Omnichannel Growth: Scaling Beyond the Website"),
      p("Scaling your business means meeting customers wherever they choose to communicate. If a client prefers to text you on WhatsApp while commuting or reach out via Telegram, forcing them to visit your desktop website creates friction."),
      p("With Crescelo, you do not need to configure separate chatbots for different marketing platforms. A single unified Crescelo assistant connects directly across all your customer-facing touchpoints:"),
      ol(
        "**Website Widget:** Embedded on your WordPress, Shopify, Webflow, Squarespace, or custom site in one script line.",
        "**Hosted Business Pages:** A dedicated mobile-first URL (`/site/[id]`) that you can place in your Instagram, TikTok, and Google Business Profile links.",
        "**WhatsApp Business:** Direct automated appointment booking and customer service via WhatsApp.",
        "**Telegram:** Instant 24/7 messaging for tech-forward client bases."
      ),
      p("All conversations, customer leads, and calendar appointments flow into your centralized Crescelo dashboard, giving your team a single pane of glass to oversee business activity."),

      h2("Freeing Your Team for High-Leverage Revenue Work"),
      p("The ultimate goal of scaling with AI is not to replace human connection—it is to elevate it. When your staff is no longer trapped answering routine phone calls about opening hours and rescheduling haircuts, their energy shifts to high-impact activities:"),
      ul(
        "Delivering exceptional in-person service experiences that earn 5-star Google reviews.",
        "Upselling premium treatment packages and retail products to clients already in your facility.",
        "Following up with high-value commercial leads flagged by Crescelo's human handover engine, and relying on automatic SMS/email confirmations to [eliminate service no-shows](/blog/eliminate-service-no-shows-playbook)."
      ),
      p("By automating the repetitive 80% of routine inquiries, your existing team operates with the efficiency of an organization twice its size."),

      h2("Step-by-Step Implementation: Scaling Your Business in 24 Hours"),
      p("Deploying Crescelo to scale your service operation requires four straightforward steps:"),
      ol(
        "**Compile Your Business Knowledge:** Gather your current price lists, service descriptions, FAQs, and office policies in PDF or text format.",
        "**Create Your Assistant:** Sign up at [Crescelo](/login?mode=register), name your assistant, and upload your documents into the knowledge base.",
        "**Sync Your Calendar:** Connect your Google Calendar account, select your booking days and hours, and set appointment durations.",
        "**Embed the Widget:** Copy your custom embed code and paste it into your website's header or footer. Your 24/7 autonomous front desk is live."
      ),
      note("Experience the difference in under two minutes: test your own service menu in the [Crescelo Playground](/playground) with no account required."),

      h2("Frequently Asked Questions About Scaling a Service Business with AI"),
      faq(
        [
          "Will an AI assistant alienate customers who prefer speaking to a human?",
          "No. Crescelo is explicitly designed with full transparency: it introduces itself as an automated assistant and offers instant, accurate answers without hold times. For customers who want human support, a single click notifies your team to step into the conversation."
        ],
        [
          "How does Crescelo prevent double-booking appointments during peak hours?",
          "Crescelo uses an atomic concurrency mutex lock at the exact moment a customer confirms a slot. The database validates that the slot is open and locks it before writing the booking, making double-bookings technically impossible."
        ],
        [
          "Can Crescelo manage multiple staff members with different schedules?",
          "Yes. You can assign specific staff members, define individual working hours, and assign custom service durations to each provider directly in the scheduling settings."
        ],
        [
          "What software platforms can I install Crescelo on?",
          "Crescelo installs on virtually any website platform—including WordPress, Shopify, Webflow, Wix, Squarespace, and custom HTML/React websites—by adding a single lightweight script tag."
        ],
        [
          "How quickly does an AI assistant pay for itself?",
          "For most service businesses, capturing just one or two appointments per month that would have otherwise bounced pays for the entire monthly software cost. Most clients see a positive ROI within their first 7 days."
        ]
      )
    ],
  }),
];
