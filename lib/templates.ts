import { SupportCustomField } from './db';

export interface BotTemplate {
  id: string;
  aliases?: string[];
  name: string;
  industry: string;
  icon: string;
  tagline: string;
  description: string;
  primaryColor: string;
  systemPrompt: string;
  welcomeMessage: string;
  fallbackMessage: string;
  starterQuestions: string[];
  collectLeadEmail: boolean;
  proactiveMessageEnabled: boolean;
  proactiveMessageText: string;
  proactiveMessageDelay: number;
  bookingEnabled: boolean;
  bookingProvider: 'direct' | 'calendly' | 'cal_com';
  bookingPromptText: string;
  supportCustomFields: SupportCustomField[];
  sampleKnowledge: { title: string; content: string }[];
}

export const BOT_TEMPLATES: BotTemplate[] = [
  {
    id: 'classic-barbershop',
    aliases: ['template_barbershop', 'template_barber', 'barbershop'],
    name: 'Barbershop & Grooming Salon Bot',
    industry: 'Barbershop & Grooming',
    icon: 'Scissors',
    tagline: 'Book haircuts, beard trims, and hot towel shaves 24/7',
    description: 'Specialized for barbershops, hair salons, and men grooming studios. Handles appointment slots, pricing, style questions, and automated reminder triage.',
    primaryColor: '#f59e0b',
    systemPrompt: `You are the digital front-desk concierge for an artisanal barbershop and grooming studio. Your mission is to greet clients warmly, answer questions about haircuts, skin fades, hot towel shaves, beard trims, and styling products, and guide clients to schedule their appointment. Keep answers stylish, concise, and helpful.`,
    welcomeMessage: `Welcome! Looking for a clean fade, beard sculpt, or hot towel shave? How can I assist you today?`,
    fallbackMessage: `I want to make sure you get the best chair and service. Let me connect you with our shop manager:`,
    starterQuestions: [
      'What services and haircuts do you offer?',
      'What are your prices and duration?',
      'How do I book an appointment?',
      'Where are you located and what are your hours?',
    ],
    collectLeadEmail: true,
    proactiveMessageEnabled: true,
    proactiveMessageText: 'Ready for a fresh cut? Book your chair online in under 60 seconds.',
    proactiveMessageDelay: 5,
    bookingEnabled: true,
    bookingProvider: 'direct',
    bookingPromptText: 'Schedule a Haircut or Beard Grooming',
    supportCustomFields: [
      { id: 'barber_pref', label: 'Preferred Barber', type: 'select', required: false, options: ['Any Available Master Barber', 'Senior Stylist', 'Shop Owner'] },
      { id: 'barber_service', label: 'Service Requested', type: 'select', required: true, options: ['Precision Haircut & Skin Fade', 'Beard Sculpt & Razor Lineup', 'Executive Package (Haircut + Shave)', 'Kids Haircut'] },
    ],
    sampleKnowledge: [
      {
        title: 'Barbershop Services, Menu & Pricing',
        content: `Services & Pricing:
1. Precision Haircut & Skin Fade ($40, 45 min): Tailored scissor work, foil skin fade, and hot lather neck shave.
2. Beard Sculpt & Razor Lineup ($25, 30 min): Precision clipper trimming, hot towel conditioning, and straight razor edge.
3. Executive Package ($60, 75 min): Full precision haircut, beard sculpt, hot towel aroma treatment, and styling balm.
4. Kids Haircut ($30, 30 min): Ages 12 and under.
Walk-ins are welcomed subject to chair availability, but online appointments take priority.`,
      },
      {
        title: 'Shop Hours, Location & Policies',
        content: `Hours of Operation:
Tuesday - Friday: 9:00 AM - 7:00 PM
Saturday: 8:30 AM - 6:00 PM
Sunday: 10:00 AM - 4:00 PM
Monday: Closed for deep sanitization.
Cancellation Policy: Appointments can be rescheduled or cancelled up to 2 hours before the scheduled time with no penalty.`,
      },
    ],
  },
  {
    id: 'fitness-gym',
    aliases: ['template_gym', 'gym'],
    name: 'Fitness & Gym Membership Bot',
    industry: 'Fitness & Wellness',
    icon: 'Dumbbell',
    tagline: 'Convert website visitors into gym members & class bookings',
    description: 'Specialized for gyms, CrossFit boxes, and fitness clubs. Answers questions about memberships, operating hours, class schedules, and books free trial day passes.',
    primaryColor: '#e11d48',
    systemPrompt: `You are the friendly, motivating digital front-desk representative for a premium fitness club. Your primary mission is to answer visitor questions about club amenities, membership plans, personal training, and group classes with enthusiasm. When visitors express interest in trying out the gym, encourage them to claim their Free 1-Day Trial Pass or schedule a tour. Always keep answers concise, energetic, and helpful.`,
    welcomeMessage: `Hey there! Welcome to the club. Looking to crush your fitness goals? How can I help you today?`,
    fallbackMessage: `I'd love to get you the exact details on that! Let me connect you with one of our fitness managers:`,
    starterQuestions: [
      'What are your membership plans & pricing?',
      'Can I get a free trial pass?',
      'What group fitness classes do you offer?',
      'What are your opening hours?',
    ],
    collectLeadEmail: true,
    proactiveMessageEnabled: true,
    proactiveMessageText: 'Claim your Free 1-Day VIP Workout Pass today! Ask me how.',
    proactiveMessageDelay: 5,
    bookingEnabled: true,
    bookingProvider: 'direct',
    bookingPromptText: 'Schedule a Free Gym Tour & Fitness Assessment',
    supportCustomFields: [
      { id: 'f_goal', label: 'Primary Fitness Goal', type: 'select', required: true, options: ['Weight Loss', 'Muscle Building', 'Athletic Conditioning', 'General Health'] },
      { id: 'f_exp', label: 'Workout Experience', type: 'select', required: false, options: ['Beginner', 'Intermediate', 'Advanced'] },
    ],
    sampleKnowledge: [
      {
        title: 'Gym Membership Pricing & Plans',
        content: `Membership Tiers:
1. Standard Access ($49/month): Full gym floor access, cardio equipment, and free weight area.
2. Premium All-Access ($79/month): Includes all group fitness classes (HIIT, Yoga, Spin), sauna access, and guest privileges.
3. VIP Elite ($129/month): Includes 2 free monthly personal training sessions, towel service, and access to private locker rooms.
All plans have no long-term contracts and can be cancelled with 30 days notice. Free 1-day guest passes are available for first-time local visitors.`,
      },
      {
        title: 'Club Hours & Class Schedule',
        content: `Hours of Operation:
Monday – Friday: 5:00 AM – 11:00 PM
Saturday – Sunday: 7:00 AM – 8:00 PM
Holidays: 8:00 AM – 4:00 PM
Group classes run daily starting at 6:00 AM, with evening slots at 5:30 PM and 6:30 PM. Childcare services available Mon-Sat from 8:00 AM to 12:00 PM.`,
      },
    ],
  },
  {
    id: 'real-estate',
    aliases: ['template_real_estate', 'real_estate'],
    name: 'Real Estate & Property Lead Bot',
    industry: 'Real Estate',
    icon: 'Home',
    tagline: 'Capture buyer, seller, and renter leads 24/7',
    description: 'Perfect for realtors, property managers, and brokerages. Qualifies buyers, books property viewings, and answers neighborhood questions.',
    primaryColor: '#059669',
    systemPrompt: `You are a licensed real estate concierge AI representing an elite property brokerage. You assist buyers, sellers, and renters with property listings, neighborhood guides, financing basics, and open house schedules. Be professional, polished, and attentive. When a visitor expresses interest in buying or selling, guide them toward scheduling a private showing or property valuation consultation.`,
    welcomeMessage: `Welcome! Whether you are searching for your dream home or looking to sell, I am here to assist. What kind of property are you interested in?`,
    fallbackMessage: `I want to ensure you receive the most accurate MLS and listing data. Let me connect you directly with our lead broker:`,
    starterQuestions: [
      'Show me available homes for sale',
      'How much is my home worth?',
      'How do I schedule a private home tour?',
      'What are typical buyer closing costs?',
    ],
    collectLeadEmail: true,
    proactiveMessageEnabled: true,
    proactiveMessageText: 'Looking for new property listings in your area? Let me know your preferred neighborhood!',
    proactiveMessageDelay: 6,
    bookingEnabled: true,
    bookingProvider: 'direct',
    bookingPromptText: 'Book a Private Property Viewing or Valuation',
    supportCustomFields: [
      { id: 're_type', label: 'Looking To', type: 'select', required: true, options: ['Buy a Home', 'Sell my Property', 'Rent / Lease', 'Commercial Investment'] },
      { id: 're_budget', label: 'Price Range / Budget', type: 'select', required: true, options: ['Under $300k', '$300k - $600k', '$600k - $1.2M', '$1.2M+'] },
      { id: 're_time', label: 'Target Move-In Date', type: 'text', required: false },
    ],
    sampleKnowledge: [
      {
        title: 'Home Buyer & Seller Process Guide',
        content: `Buying Process:
1. Mortgage Pre-approval: Connect with our preferred lenders for competitive rates.
2. Private Home Tours: Available 7 days a week with 24 hours notice.
3. Offer & Closing: We handle negotiations, title search, and closing escrow. Typical closing timeline is 30 to 45 days.
Seller Services: Free comprehensive home valuation, 4K professional photography, 3D virtual tours, and syndication to Zillow, Realtor.com, and MLS.`,
      },
    ],
  },
  {
    id: 'ecommerce-store',
    aliases: ['template_ecommerce', 'ecommerce'],
    name: 'E-Commerce & Online Store Bot',
    industry: 'Retail & E-Commerce',
    icon: 'ShoppingBag',
    tagline: 'Reduce cart abandonment & automate order support',
    description: 'Trained for Shopify and e-commerce stores. Handles order tracking inquiries, shipping times, return policies, and product recommendations.',
    primaryColor: '#7c3aed',
    systemPrompt: `You are an upbeat, knowledgeable shopping assistant for an online retail brand. Help shoppers find the right products, check sizes, understand shipping speeds, and navigate returns. Always recommend relevant product categories when visitors ask what to buy. If a customer has an issue with an existing order, offer immediate return/exchange instructions and connect them with customer care.`,
    welcomeMessage: `Hi there! Welcome to our store. Need help finding a product or have questions about an order?`,
    fallbackMessage: `I want to make sure your order is handled smoothly. Please leave your details and our customer care team will assist right away:`,
    starterQuestions: [
      'Where is my order & tracking info?',
      'What is your return & exchange policy?',
      'Do you offer free shipping?',
      'Can I get a discount code?',
    ],
    collectLeadEmail: true,
    proactiveMessageEnabled: true,
    proactiveMessageText: 'Take 10% off your first order! Ask me for the discount code.',
    proactiveMessageDelay: 4,
    bookingEnabled: false,
    bookingProvider: 'direct',
    bookingPromptText: 'Connect with a Personal Stylist',
    supportCustomFields: [
      { id: 'order_num', label: 'Order Number (if applicable)', type: 'text', required: false },
      { id: 'order_issue', label: 'Topic', type: 'select', required: true, options: ['Order Status & Tracking', 'Returns & Refunds', 'Product Sizing / Fit', 'Wholesale Inquiry'] },
    ],
    sampleKnowledge: [
      {
        title: 'Shipping, Delivery & Returns Policy',
        content: `Shipping Information:
- Standard Shipping (3-5 business days): Free on orders over $50. Otherwise $4.99 flat rate.
- Express Shipping (1-2 business days): $12.99.
- International Shipping: Available to over 40 countries, calculated at checkout.
Returns & Exchanges:
- 30-day hassle-free return policy from delivery date.
- Items must be unworn with original tags attached.
- Store credit and full refunds processed within 3-5 business days after inspection.`,
      },
    ],
  },
  {
    id: 'b2b-saas',
    aliases: ['template_saas', 'saas', 'saas-landing'],
    name: 'B2B SaaS & Software Sales Bot',
    industry: 'Technology & SaaS',
    icon: 'Briefcase',
    tagline: 'Book sales demos & convert technical buyers',
    description: 'Designed for software companies. Explains API features, pricing tiers, security compliance (SOC2/GDPR), and qualifies demo leads.',
    primaryColor: '#2563eb',
    systemPrompt: `You are a technical product specialist and solutions engineer for a modern B2B SaaS platform. Answer user questions about architecture, API integrations, enterprise security, and pricing plans. Frame answers around business ROI and time saved. When engaging prospects, qualify their team size and guide high-intent leads to book a live demo or start a free trial.`,
    welcomeMessage: `Welcome to our platform! How can I help accelerate your workflow today?`,
    fallbackMessage: `For custom enterprise architecture and volume pricing, our solutions team would be glad to meet with you:`,
    starterQuestions: [
      'How does your pricing work?',
      'Can I see a live demo of the product?',
      'What integrations & APIs do you support?',
      'Are you SOC-2 and GDPR compliant?',
    ],
    collectLeadEmail: true,
    proactiveMessageEnabled: true,
    proactiveMessageText: 'Want to see how our software cuts workflow time by 60%? Ask for a quick overview!',
    proactiveMessageDelay: 5,
    bookingEnabled: true,
    bookingProvider: 'direct',
    bookingPromptText: 'Schedule a 20-Minute Product Demo',
    supportCustomFields: [
      { id: 'company_name', label: 'Company / Organization', type: 'text', required: true },
      { id: 'team_size', label: 'Team Size', type: 'select', required: true, options: ['1-10', '11-50', '51-200', '201-1000', '1000+'] },
      { id: 'timeline', label: 'Implementation Timeline', type: 'select', required: false, options: ['Immediately', 'Within 1 month', '1-3 months', 'Just exploring'] },
    ],
    sampleKnowledge: [
      {
        title: 'Platform Pricing & Enterprise Architecture',
        content: `Pricing Plans:
- Starter ($29/mo): Up to 3 team members, core automation workflows, standard email support.
- Pro ($99/mo): Up to 15 team members, advanced integrations, priority webhooks, SLA.
- Enterprise (Custom): Dedicated infrastructure, custom SAML SSO, 99.99% uptime guarantee, 24/7 phone support.
Security: SOC-2 Type II certified, fully GDPR compliant, AES-256 encryption at rest and in transit.`,
      },
    ],
  },
  {
    id: 'legal-law-firm',
    aliases: ['template_legal', 'legal-firm', 'legal', 'law-firm'],
    name: 'Law Firm & Legal Intake Bot',
    industry: 'Legal Services',
    icon: 'Scale',
    tagline: 'Qualify client matters & schedule legal consultations',
    description: 'Built for law firms, solo practitioners, and legal consultancies. Conducts preliminary client intake while clearly providing legal disclaimers.',
    primaryColor: '#0f172a',
    systemPrompt: `You are a respectful, confidential client intake coordinator for an established law firm. You assist potential clients by explaining our practice areas, consultation process, and general office policies. You MUST always maintain that you provide general legal information, not formal legal advice. Never promise case outcomes. Guide visitors to schedule a confidential initial case consultation with an attorney.`,
    welcomeMessage: `Welcome to our legal practice. How may we assist with your legal matter today?`,
    fallbackMessage: `To review your matter in detail and conduct a formal conflict check, please provide your contact details:`,
    starterQuestions: [
      'What legal practice areas do you handle?',
      'How much is an initial consultation?',
      'What documents should I bring to my consultation?',
      'Where is your office located?',
    ],
    collectLeadEmail: true,
    proactiveMessageEnabled: false,
    proactiveMessageText: '',
    proactiveMessageDelay: 5,
    bookingEnabled: true,
    bookingProvider: 'direct',
    bookingPromptText: 'Schedule a Confidential Case Consultation',
    supportCustomFields: [
      { id: 'matter_type', label: 'Practice Area', type: 'select', required: true, options: ['Corporate / Business Law', 'Family & Estate Planning', 'Real Estate / Property', 'Personal Injury', 'Immigration', 'Other'] },
      { id: 'urgency', label: 'How Urgent is This Matter?', type: 'select', required: true, options: ['Immediate (Court deadline / Notice)', 'Within 1-2 weeks', 'General Inquiry'] },
    ],
    sampleKnowledge: [
      {
        title: 'Practice Areas & Consultation Policies',
        content: `Practice Areas: Corporate Formation & Contracts, Real Estate Transactions, Estate Planning (Wills & Trusts), and Civil Litigation.
Consultation Details:
- Initial 30-minute case evaluation available in-person or via secure video conference.
- Strict attorney-client confidentiality maintained on all submitted intake forms.
- Hourly rates and flat-fee retainer schedules provided following initial consultation.`,
      },
    ],
  },
  {
    id: 'dental-clinic',
    aliases: ['template_healthcare', 'clinic', 'healthcare', 'dental'],
    name: 'Dental & Healthcare Clinic Bot',
    industry: 'Healthcare & Medical',
    icon: 'Activity',
    tagline: 'Streamline patient appointments & clinic inquiries',
    description: 'Designed for dental offices, clinics, and wellness practices. Handles hours, accepted insurances, appointment scheduling, and patient FAQs.',
    primaryColor: '#0284c7',
    systemPrompt: `You are a compassionate, professional patient care coordinator for a modern healthcare and dental clinic. You assist new and returning patients with appointment scheduling, accepted insurance plans, office hours, and general procedure explanations. Remind patients that for emergencies, they should immediately call 911 or visit the nearest emergency room. Guide patients to book their next check-up or cleaning.`,
    welcomeMessage: `Hello! Welcome to our clinic. How can our patient care team help you today?`,
    fallbackMessage: `For medical advice or specific appointment requests, please share your details and our reception desk will contact you:`,
    starterQuestions: [
      'Do you accept my dental/health insurance?',
      'How do I schedule a check-up or cleaning?',
      'What are your office hours & location?',
      'What should I do in a dental emergency?',
    ],
    collectLeadEmail: true,
    proactiveMessageEnabled: true,
    proactiveMessageText: 'Accepting new patients! Book your routine exam & cleaning online.',
    proactiveMessageDelay: 5,
    bookingEnabled: true,
    bookingProvider: 'direct',
    bookingPromptText: 'Book an Appointment or Dental Check-Up',
    supportCustomFields: [
      { id: 'patient_type', label: 'Are You a New Patient?', type: 'select', required: true, options: ['New Patient', 'Existing / Returning Patient'] },
      { id: 'ins_provider', label: 'Insurance Provider', type: 'text', required: false },
      { id: 'pref_time', label: 'Preferred Time of Day', type: 'select', required: false, options: ['Morning (8am - 12pm)', 'Afternoon (12pm - 5pm)', 'First Available'] },
    ],
    sampleKnowledge: [
      {
        title: 'Clinic Information, Insurance & Emergency Care',
        content: `Accepted Insurances: Delta Dental, Cigna, MetLife, Aetna, Guardian, Blue Cross Blue Shield, and United Healthcare. Affordable in-house membership plans available for uninsured patients.
Hours: Monday – Thursday: 8:00 AM – 5:00 PM; Friday: 8:00 AM – 2:00 PM.
Emergency Policy: Same-day emergency appointments reserved daily for toothaches, chipped teeth, and trauma.`,
      },
    ],
  },
  {
    id: 'nexus-ai',
    aliases: ['template_nexus_ai', 'nexus_ai', 'ai_tech'],
    name: 'Nexus AI Technology Platform Bot',
    industry: 'AI & Neural Systems',
    icon: 'Sparkles',
    tagline: 'Qualify enterprise AI buyers, schedule architecture calls, and demo autonomous agents',
    description: 'Built for artificial intelligence startups, neural API providers, and autonomous agent platforms. Explains vector retrieval, inference latencies, fine-tuning sprints, and books enterprise demos.',
    primaryColor: '#6366f1',
    systemPrompt: `You are the chief AI technical concierge for Nexus AI, a next-generation neural inference and autonomous agent orchestration platform. You explain vector architectures, model fine-tuning, latency SLAs, and enterprise security compliance. Help developers and CTOs explore capabilities and schedule live interactive product demonstrations.`,
    welcomeMessage: `Welcome to Nexus AI. Ready to deploy autonomous agents and neural inference pipelines? How can I assist you?`,
    fallbackMessage: `For custom neural fine-tuning and enterprise SLAs, our solutions architecture team is ready to connect with you:`,
    starterQuestions: [
      'What models and inference speeds do you support?',
      'How does agent vector retrieval work?',
      'Can I book a live technical demo?',
      'What enterprise security standards do you meet?',
    ],
    collectLeadEmail: true,
    proactiveMessageEnabled: true,
    proactiveMessageText: 'Deploying custom AI agents? Ask for a live architecture walkthrough!',
    proactiveMessageDelay: 5,
    bookingEnabled: true,
    bookingProvider: 'direct',
    bookingPromptText: 'Schedule a Live Agent Architecture Demo',
    supportCustomFields: [
      { id: 'tech_stack', label: 'Current Tech Stack / Framework', type: 'select', required: true, options: ['Python / LangChain / LlamaIndex', 'TypeScript / Node.js / Next.js', 'Go / Rust microservices', 'Enterprise Java / C#'] },
      { id: 'volume', label: 'Expected Monthly Token Volume', type: 'select', required: true, options: ['Under 10M tokens', '10M - 100M tokens', '100M - 1B tokens', '1B+ tokens / Dedicated Cluster'] },
    ],
    sampleKnowledge: [
      {
        title: 'Nexus AI Architecture & Inference Benchmarks',
        content: `Nexus AI Infrastructure:
- Sub-15ms time-to-first-token neural inference across Llama-3.3, DeepSeek, and custom fine-tuned weights.
- Multi-tenant vector memory with reciprocal rank fusion (RRF) and hybrid keyword search.
- Zero data retention policy for enterprise tier. SOC-2 Type II certified and HIPAA BAA available.`,
      },
    ],
  },
  {
    id: 'hyperion-agency',
    aliases: ['template_hyperion_agency', 'hyperion_agency', 'creative_agency', 'design_agency', 'agency'],
    name: 'Hyperion Creative Agency Bot',
    industry: 'Design & Creative Agency',
    icon: 'Palette',
    tagline: 'Capture brand, 3D motion, and digital design leads seamlessly',
    description: 'Tailored for boutique design agencies, 3D studios, and branding consultancies. Explains design sprints, motion reels, deliverables, and schedules discovery calls.',
    primaryColor: '#d946ef',
    systemPrompt: `You are the creative concierge for Hyperion Studio, an award-winning digital design, 3D motion, and brand strategy agency. You assist prospective clients in understanding our creative processes, sprint timelines, pricing ranges, and portfolio case studies. Guide visitors to book an initial creative discovery call.`,
    welcomeMessage: `Welcome to Hyperion Studio. Looking to elevate your brand identity or craft immersive 3D motion? Let us discuss your vision.`,
    fallbackMessage: `Every bespoke creative project begins with an alignment call. Please share your project details and our design directors will reach out:`,
    starterQuestions: [
      'What creative and branding services do you provide?',
      'What is your typical project timeline and budget?',
      'Can I schedule a creative discovery consultation?',
      'Where can I view your recent portfolio reels?',
    ],
    collectLeadEmail: true,
    proactiveMessageEnabled: true,
    proactiveMessageText: 'Ready to bring your brand to life? Schedule a 30-min creative scoping call.',
    proactiveMessageDelay: 5,
    bookingEnabled: true,
    bookingProvider: 'direct',
    bookingPromptText: 'Schedule a Creative Discovery Consultation',
    supportCustomFields: [
      { id: 'project_type', label: 'Creative Scope', type: 'select', required: true, options: ['Full Brand Identity & Guidelines', '3D Motion Design & WebGL', 'Product UI/UX Design System', 'Comprehensive Digital Launch'] },
      { id: 'budget_range', label: 'Estimated Project Budget', type: 'select', required: true, options: ['$5k - $15k', '$15k - $35k', '$35k - $75k', '$75k+'] },
    ],
    sampleKnowledge: [
      {
        title: 'Hyperion Studio Creative Process & Pricing',
        content: `Creative Sprints:
1. Brand Sprint ($3,500, 2 weeks): Visual identity, typography, color palette, logo lockups.
2. 3D Motion Reel ($7,500, 3-4 weeks): 30-second cinema-grade product animation.
3. Full Digital Experience ($15,000+, 6-8 weeks): Custom design system, interactive prototyping, WebGL implementation.`,
      },
    ],
  },
  {
    id: 'aether-finance',
    aliases: ['template_aether_finance', 'aether_finance', 'fintech', 'finance'],
    name: 'Aether Finance & Wealth Management Bot',
    industry: 'Financial Services & Wealth',
    icon: 'TrendingUp',
    tagline: 'Onboard sovereign treasury, family office, and private wealth clients',
    description: 'Designed for wealth management firms, private family offices, and quantitative asset managers. Answers questions regarding discretionary mandates, custody, and schedules confidential reviews.',
    primaryColor: '#14b8a6',
    systemPrompt: `You are the discreet, knowledgeable client intake advisor for Aether Capital, a boutique private wealth and algorithmic treasury firm. You assist accredited investors, family offices, and institutions by providing high-level information regarding asset protection, MPC custody, and treasury review consultations. Maintain strict confidentiality and professionalism at all times.`,
    welcomeMessage: `Welcome to Aether Capital. How may we assist with your institutional treasury or private wealth management needs today?`,
    fallbackMessage: `For confidential treasury allocation and discretionary mandates, our senior partners are available for a private consultation:`,
    starterQuestions: [
      'What wealth management strategies do you provide?',
      'What are your minimum capital requirements?',
      'How do you structure institutional custody & security?',
      'How do I book a confidential portfolio review?',
    ],
    collectLeadEmail: true,
    proactiveMessageEnabled: false,
    proactiveMessageText: '',
    proactiveMessageDelay: 6,
    bookingEnabled: true,
    bookingProvider: 'direct',
    bookingPromptText: 'Schedule a Confidential Portfolio Consultation',
    supportCustomFields: [
      { id: 'investor_type', label: 'Investor Classification', type: 'select', required: true, options: ['Individual Accredited Investor', 'Family Office / Multi-Family Office', 'Corporate Treasury / Enterprise', 'Institutional Fund'] },
      { id: 'aum_tier', label: 'Target Portfolio Allocation', type: 'select', required: true, options: ['$500k - $2M', '$2M - $10M', '$10M - $50M', '$50M+'] },
    ],
    sampleKnowledge: [
      {
        title: 'Aether Capital Advisory Tiers & Custody Standards',
        content: `Mandate Offerings:
- Sovereign Treasury Allocation: Multi-jurisdiction treasury structuring with automated cash-sweep yield optimization.
- Multi-Party Computation (MPC) Custody Setup: Hardware security module (HSM) air-gapped key shards for multi-signature governance.
- Algorithmic Arbitrage Yield Routing: Institutional gateway into regulated low-latency liquidity pools with real-time on-chain proof of reserves.
Security: SOC-2 Type II certified and ISO 27001 audited.`,
      },
    ],
  },
  {
    id: 'custom',
    aliases: ['template_custom', 'custom-template', 'skeleton'],
    name: 'Custom Blank Canvas Modular Skeleton',
    industry: 'Custom & Bespoke Business',
    icon: 'Layers',
    tagline: 'Modular starter blueprint ready to adapt to any industry or service',
    description: 'A clean, modular starter bot with flexible custom fields and starter prompts. Easily customized for consultants, agencies, coaches, or any bespoke business model.',
    primaryColor: '#6366f1',
    systemPrompt: `You are the professional digital concierge for our business. Your goal is to welcome visitors, answer inquiries about our services, pricing, and availability, and guide qualified leads to schedule a consultation. Maintain a helpful, courteous, and efficient tone.`,
    welcomeMessage: `Hello! Welcome to our website. How can I assist you today?`,
    fallbackMessage: `I would be happy to connect you with our team directly. Please leave your contact information below:`,
    starterQuestions: [
      'What services do you provide?',
      'What are your pricing packages and terms?',
      'How do I schedule an appointment or consultation?',
      'What are your business hours?',
    ],
    collectLeadEmail: true,
    proactiveMessageEnabled: true,
    proactiveMessageText: 'Have questions about our custom services? Ask me anything!',
    proactiveMessageDelay: 5,
    bookingEnabled: true,
    bookingProvider: 'direct',
    bookingPromptText: 'Schedule a Custom Consultation',
    supportCustomFields: [
      { id: 'custom_inquiry', label: 'Inquiry Subject', type: 'select', required: true, options: ['Service Consultation', 'Pricing & Proposal Request', 'Partnership / Collaboration', 'General Support'] },
      { id: 'custom_pref', label: 'Preferred Contact Method', type: 'select', required: false, options: ['Email', 'Phone Call', 'Virtual Video Meeting'] },
    ],
    sampleKnowledge: [
      {
        title: 'General Business Policies & Consultations',
        content: `Business Overview:
We offer custom consulting and service tiers tailored to individual and organizational needs.
Initial 30-minute discovery sessions are available Monday through Friday.
All engagements include dedicated account support and milestones.`,
      },
    ],
  },
  {
    id: 'crescelo',
    aliases: ['website_assistant', 'ai_assistant_saas', 'crescelo-template', 'template_crescelo'],
    name: 'Crescelo AI Website Assistant',
    industry: 'Crescelo AI Assistant SaaS',
    icon: 'Bot',
    tagline: 'Answer every visitor. Book the ones who are ready.',
    description:
      'The Crescelo-style landing page template for AI website assistants. Showcases grounded answers, in-chat booking, lead capture, and live handover with the signature dark-lime design.',
    primaryColor: '#c9f31d',
    systemPrompt: `You are a friendly and knowledgeable AI website assistant. Your job is to answer visitor questions accurately using the knowledge provided, help them book appointments, capture their contact information when they show interest, and hand the conversation over to a human team member when needed. Always be concise and helpful. If you don't know the answer, say so clearly and offer to connect the visitor with the team.`,
    welcomeMessage: `Hi there! 👋 I'm your AI assistant. I can answer questions about our services, help you book an appointment, or connect you with our team. What can I help you with?`,
    fallbackMessage: `I want to make sure you get the right help. Let me connect you with our team:`,
    starterQuestions: [
      'What services do you offer?',
      'How does the AI assistant work?',
      'Can I book an appointment right now?',
      'What are your prices?',
    ],
    collectLeadEmail: true,
    proactiveMessageEnabled: true,
    proactiveMessageText: 'Have a question? I can answer from our content — or book you in right now.',
    proactiveMessageDelay: 5,
    bookingEnabled: true,
    bookingProvider: 'direct',
    bookingPromptText: 'Book a Consultation or Demo',
    supportCustomFields: [
      {
        id: 'inquiry_type',
        label: 'What brings you here?',
        type: 'select',
        required: false,
        options: ['Book an appointment', 'Get a quote', 'Learn about services', 'Speak to a person'],
      },
    ],
    sampleKnowledge: [
      {
        title: 'About Our AI Assistant',
        content: `We use an AI website assistant powered by Crescelo. It reads our services, prices, and policies, then answers visitor questions instantly — 24/7. If you want to book an appointment, it will show you available slots and confirm your booking. If you need to talk to a human, just ask and a team member will join the conversation.`,
      },
      {
        title: 'Services & Booking Policy',
        content: `We offer consultations and appointments Monday through Friday, 9am to 6pm. Weekend availability varies. To book, simply tell the assistant your preferred date and time and it will check availability in real time. Cancellations must be made at least 2 hours before the scheduled time.`,
      },
    ],
  },
];

export function findBotTemplate(idOrSlug: string): BotTemplate | undefined {
  if (!idOrSlug) return undefined;
  const clean = idOrSlug.trim().toLowerCase();
  return BOT_TEMPLATES.find(
    (t) =>
      t.id.toLowerCase() === clean ||
      (t.aliases && t.aliases.some((a) => a.toLowerCase() === clean))
  );
}
