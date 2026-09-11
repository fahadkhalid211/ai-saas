import { SupportCustomField } from './db';

export interface BotTemplate {
  id: string;
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
    id: 'template_gym',
    name: 'Fitness & Gym Membership Bot',
    industry: 'Fitness & Wellness',
    icon: '🏋️‍♂️',
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
    proactiveMessageText: '👋 Claim your Free 1-Day VIP Workout Pass today! Ask me how.',
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
    id: 'template_real_estate',
    name: 'Real Estate & Property Lead Bot',
    industry: 'Real Estate',
    icon: '🏡',
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
    proactiveMessageText: '🏡 Looking for new property listings in your area? Let me know your preferred neighborhood!',
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
    id: 'template_ecommerce',
    name: 'E-Commerce & Online Store Bot',
    industry: 'Retail & E-Commerce',
    icon: '🛍️',
    tagline: 'Reduce cart abandonment & automate order support',
    description: 'Trained for Shopify and e-commerce stores. Handles order tracking inquiries, shipping times, return policies, and product recommendations.',
    primaryColor: '#7c3aed',
    systemPrompt: `You are an upbeat, knowledgeable shopping assistant for an online retail brand. Help shoppers find the right products, check sizes, understand shipping speeds, and navigate returns. Always recommend relevant product categories when visitors ask what to buy. If a customer has an issue with an existing order, offer immediate return/exchange instructions and connect them with customer care.`,
    welcomeMessage: `Hi there! 👋 Welcome to our store. Need help finding a product or have questions about an order?`,
    fallbackMessage: `I want to make sure your order is handled smoothly. Please leave your details and our customer care team will assist right away:`,
    starterQuestions: [
      'Where is my order & tracking info?',
      'What is your return & exchange policy?',
      'Do you offer free shipping?',
      'Can I get a discount code?',
    ],
    collectLeadEmail: true,
    proactiveMessageEnabled: true,
    proactiveMessageText: '🎁 Take 10% off your first order! Ask me for the discount code.',
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
    id: 'template_saas',
    name: 'B2B SaaS & Software Sales Bot',
    industry: 'Technology & SaaS',
    icon: '💼',
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
    proactiveMessageText: '⚡ Want to see how our software cuts workflow time by 60%? Ask for a quick overview!',
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
    id: 'template_legal',
    name: 'Law Firm & Legal Intake Bot',
    industry: 'Legal Services',
    icon: '⚖️',
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
    id: 'template_healthcare',
    name: 'Dental & Healthcare Clinic Bot',
    industry: 'Healthcare & Medical',
    icon: '🦷',
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
    proactiveMessageText: '🦷 Accepting new patients! Book your routine exam & cleaning online.',
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
];
