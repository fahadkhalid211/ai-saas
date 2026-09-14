export interface LandingPageServiceItem {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  imageUrl?: string;
  popular?: boolean;
}

export interface LandingPageGalleryItem {
  id: string;
  url: string;
  caption: string;
}

export interface LandingPageTestimonialItem {
  id: string;
  clientName: string;
  rating: number;
  comment: string;
  clientRole?: string;
}

export interface LandingPageWorkingHours {
  days: string;
  hours: string;
}

export interface LandingPageSeoConfig {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogImageUrl?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
}

export interface LandingPageAnalyticsConfig {
  googleAnalyticsId?: string; // e.g. G-XXXXXXXXXX
  metaPixelId?: string; // e.g. 123456789012345
}

export interface LandingPageConfig {
  id?: string;
  workspaceId?: string;
  assistantId?: string;
  enabled: boolean;
  slug: string;
  businessName: string;
  industry?: string;
  themeColor?: string;
  tagline: string;
  badgeText?: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroCtaText: string;
  heroImageUrl?: string;
  aboutTitle?: string;
  aboutText?: string;
  address?: string;
  phone?: string;
  email?: string;
  googleMapsUrl?: string;
  customDomain?: string;
  seo?: LandingPageSeoConfig;
  analytics?: LandingPageAnalyticsConfig;
  starterQuestions?: string[];
  workingHours?: LandingPageWorkingHours[];
  services?: LandingPageServiceItem[];
  galleryImages?: LandingPageGalleryItem[];
  testimonials?: LandingPageTestimonialItem[];
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

// 1. Classic Barbershop & Men's Grooming
export const DEFAULT_BARBER_LANDING_CONFIG: LandingPageConfig = {
  enabled: true,
  slug: 'classic-barbershop',
  businessName: 'Crown & Blade Barbershop',
  industry: 'barbershop',
  themeColor: '#f59e0b',
  tagline: 'Master Fades, Traditional Hot Towel Shaves & Modern Men\'s Grooming',
  badgeText: 'Top Rated in New York · 5.0 Stars (280+ Reviews)',
  heroHeadline: 'Look Sharp. Feel Confident. The Premier Grooming Experience.',
  heroSubheadline: 'Step into Crown & Blade where traditional craftsmanship meets modern style. Book your chair in under 60 seconds with our AI appointment assistant.',
  heroCtaText: 'Book Your Haircut Now',
  heroImageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80',
  aboutTitle: 'Craftsmanship & Tradition Since 2018',
  aboutText: 'At Crown & Blade, we believe a haircut is more than just maintenance—it is a confidence ritual. Our master barbers specialize in precision scissor work, flawless skin fades, and luxurious hot-lather razor shaves tailored to your facial structure and lifestyle.',
  address: '452 Atlantic Avenue, Brooklyn, NY 11217',
  phone: '+1 (718) 555-0198',
  email: 'appointments@crownandblade.com',
  googleMapsUrl: 'https://maps.google.com/?q=452+Atlantic+Avenue+Brooklyn+NY',
  starterQuestions: [
    'What are your haircut & beard prices?',
    'Can I book an appointment for tomorrow?',
    'Where is your shop located?',
    'Do you accept walk-ins?',
  ],
  workingHours: [
    { days: 'Monday – Friday', hours: '9:00 AM – 8:00 PM' },
    { days: 'Saturday', hours: '9:00 AM – 7:00 PM' },
    { days: 'Sunday', hours: '10:00 AM – 5:00 PM' },
  ],
  services: [
    {
      id: 'srv_1',
      name: 'Master Haircut & Styling',
      description: 'Consultation, precision scissor or clipper cut, neck shave, wash, and premium product styling.',
      durationMinutes: 40,
      price: 45,
      popular: true,
    },
    {
      id: 'srv_2',
      name: 'Beard Sculpt & Hot Towel Treatment',
      description: 'Beard trimming, crisp straight razor cheek/neck lineup, organic beard oil, and hot herbal steam towel.',
      durationMinutes: 30,
      price: 35,
    },
    {
      id: 'srv_3',
      name: 'The Crown Signature Package',
      description: 'Full master haircut + luxury hot lather straight razor face shave + clarifying scalp scrub and cold towel finish.',
      durationMinutes: 65,
      price: 75,
      popular: true,
    },
    {
      id: 'srv_4',
      name: 'Traditional Straight Razor Shave',
      description: 'Multi-step pre-shave oil, hot lather, classic straight razor shave with aftershave balm soothing treatment.',
      durationMinutes: 35,
      price: 40,
    },
    {
      id: 'srv_5',
      name: 'Kids & Junior Cut (Under 12)',
      description: 'Patient, fun, and sharp styling for young gentlemen with complimentary styling cream.',
      durationMinutes: 30,
      price: 30,
    },
  ],
  galleryImages: [
    {
      id: 'gal_1',
      url: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=800&q=80',
      caption: 'Precision Low Skin Fade & Textured Top',
    },
    {
      id: 'gal_2',
      url: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80',
      caption: 'Traditional Hot Towel Straight Razor Shave',
    },
    {
      id: 'gal_3',
      url: 'https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&w=800&q=80',
      caption: 'Beard Sculpting & Defined Lineup',
    },
    {
      id: 'gal_4',
      url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80',
      caption: 'Vintage Leather Chairs & Shop Interior',
    },
  ],
  testimonials: [
    {
      id: 'test_1',
      clientName: 'Marcus Vance',
      rating: 5,
      comment: 'Best fade in Brooklyn, hands down. The AI booking assistant got me a chair in 30 seconds without phone tag. The hot towel finish is unbeatable.',
      clientRole: 'Client since 2021',
    },
    {
      id: 'test_2',
      clientName: 'David K.',
      rating: 5,
      comment: 'The Crown Signature package is worth every penny. Clean shop, punctual barbers, and the 24h & 1h reminders ensure I never miss my slot.',
      clientRole: 'Regular Client',
    },
    {
      id: 'test_3',
      clientName: 'Julian Rossi',
      rating: 5,
      comment: 'Super easy booking, master craftsmanship, and top notch vibe. You leave feeling like a million bucks.',
      clientRole: 'Client',
    },
  ],
  socialLinks: {
    instagram: 'https://instagram.com/crownandblade',
    facebook: 'https://facebook.com/crownandblade',
  },
};

// 2. Fitness, Athletic Club & Gym
export const DEFAULT_GYM_LANDING_CONFIG: LandingPageConfig = {
  enabled: true,
  slug: 'fitness-gym',
  businessName: 'IronPulse Athletic Club & Fitness',
  industry: 'gym',
  themeColor: '#e11d48',
  tagline: 'Elite Strength Zones, High-Intensity Classes & Performance Coaching',
  badgeText: 'Top Rated Fitness Club · 24/7 Access · Free 1-Day Pass',
  heroHeadline: 'Transform Your Body. Elevate Your Strength.',
  heroSubheadline: 'Join Brooklyn\'s premier athletic club. State-of-the-art free weight platforms, infrared recovery saunas, and science-backed personal training.',
  heroCtaText: 'Claim Free 1-Day VIP Pass',
  heroImageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
  aboutTitle: 'Engineered for Serious Lifters and Fitness Enthusiasts',
  aboutText: 'At IronPulse, we eliminate gimmicks and deliver a powerhouse training environment. Featuring Eleiko competition barbells, turf sprint tracks, cold plunge recovery suites, and NASM-certified master trainers.',
  address: '880 Broadway, New York, NY 10003',
  phone: '+1 (212) 555-0144',
  email: 'memberships@ironpulsefitness.com',
  googleMapsUrl: 'https://maps.google.com/?q=880+Broadway+New+York+NY',
  starterQuestions: [
    'What are your membership plans & pricing?',
    'Can I get a free trial pass?',
    'What group fitness classes do you offer?',
    'What are your opening hours?',
  ],
  workingHours: [
    { days: 'Monday – Friday', hours: '5:00 AM – 11:00 PM' },
    { days: 'Saturday – Sunday', hours: '7:00 AM – 9:00 PM' },
    { days: 'Holidays', hours: '8:00 AM – 4:00 PM' },
  ],
  services: [
    {
      id: 'gym_1',
      name: 'Standard Gym Floor Access',
      description: 'Full cardio suite, free weights, Olympic lifting platforms, and locker room access.',
      durationMinutes: 60,
      price: 49,
      popular: true,
    },
    {
      id: 'gym_2',
      name: 'All-Access Plus & Group HIIT Classes',
      description: 'Includes all daily classes: HIIT, Power Yoga, Spin, and Kettlebell Conditioning plus infrared sauna.',
      durationMinutes: 60,
      price: 79,
      popular: true,
    },
    {
      id: 'gym_3',
      name: 'VIP 1-on-1 Personal Training Session',
      description: 'Private 60-minute tailored workout with a Master Strength Coach and nutrition guidance.',
      durationMinutes: 60,
      price: 85,
    },
    {
      id: 'gym_4',
      name: 'Body Composition & Fitness Assessment',
      description: 'Comprehensive InBody 570 scan, posture analysis, mobility screening, and customized goal roadmap.',
      durationMinutes: 45,
      price: 40,
    },
    {
      id: 'gym_5',
      name: 'Hydro-Recovery & Infrared Sauna Day Pass',
      description: 'Contrast therapy cold plunge, full-spectrum infrared sauna session, and recovery compression boots.',
      durationMinutes: 45,
      price: 30,
    },
  ],
  galleryImages: [
    {
      id: 'gym_gal_1',
      url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80',
      caption: 'Olympic Lifting Platforms & Heavy Dumbbell Zone',
    },
    {
      id: 'gym_gal_2',
      url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
      caption: 'High-Energy Group HIIT & Functional Conditioning',
    },
    {
      id: 'gym_gal_3',
      url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
      caption: 'Dedicated Personal Coaching & Technique Assessment',
    },
    {
      id: 'gym_gal_4',
      url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
      caption: 'Contrast Therapy Cold Plunge & Recovery Lounge',
    },
  ],
  testimonials: [
    {
      id: 'gym_test_1',
      clientName: 'Sarah Jenkins',
      rating: 5,
      comment: 'IronPulse is on a completely different level. The equipment is always clean, trainers are world-class, and the booking chatbot booked my trial pass instantly.',
      clientRole: 'Member 2 Years',
    },
    {
      id: 'gym_test_2',
      clientName: 'Tyrone Bennett',
      rating: 5,
      comment: 'Best strength facility in NYC. The 5 AM opening allows me to get heavy squats in before market open. Highly recommend the recovery sauna.',
      clientRole: 'Competitive Powerlifter',
    },
    {
      id: 'gym_test_3',
      clientName: 'Elena Rostova',
      rating: 5,
      comment: 'Down 22 lbs in 4 months with coach Liam. Super motivating community and frictionless online booking.',
      clientRole: 'Group Fitness Enthusiast',
    },
  ],
  socialLinks: {
    instagram: 'https://instagram.com/ironpulsefitness',
    facebook: 'https://facebook.com/ironpulsefitness',
  },
};

// 3. Real Estate Brokerage & Property Advisory
export const DEFAULT_REAL_ESTATE_LANDING_CONFIG: LandingPageConfig = {
  enabled: true,
  slug: 'real-estate',
  businessName: 'Prestige Realty & Luxury Estates',
  industry: 'real_estate',
  themeColor: '#059669',
  tagline: 'Curated Architectural Homes, Penthouses & Prime Residential Properties',
  badgeText: 'Over $250M in Verified Closed Transactions · Licensed Brokerage',
  heroHeadline: 'Discover Your Exceptional Sanctuary in New York',
  heroSubheadline: 'Connecting discerning buyers, sellers, and investors with premier residential listings and off-market opportunities across Manhattan and Brooklyn.',
  heroCtaText: 'Book a Private Showing',
  heroImageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
  aboutTitle: 'Boutique Representation. Unrivaled Market Intelligence.',
  aboutText: 'Prestige Realty provides bespoke advisory backed by proprietary neighborhood valuation models. Whether acquiring a landmark brownstone or listing a waterfront penthouse, our clients enjoy absolute discretion and dealmaking expertise.',
  address: '590 Madison Avenue, 24th Floor, New York, NY 10022',
  phone: '+1 (212) 555-0182',
  email: 'advisory@prestigerealtyny.com',
  googleMapsUrl: 'https://maps.google.com/?q=590+Madison+Avenue+New+York+NY',
  starterQuestions: [
    'Show me available luxury listings',
    'How do I book a private home tour?',
    'What is my property worth today?',
    'What are typical buyer closing costs?',
  ],
  workingHours: [
    { days: 'Monday – Friday', hours: '8:30 AM – 7:00 PM' },
    { days: 'Saturday', hours: '10:00 AM – 5:00 PM (By Appointment)' },
    { days: 'Sunday', hours: '11:00 AM – 4:00 PM (Open House Windows)' },
  ],
  services: [
    {
      id: 're_1',
      name: 'Private Luxury Property Tour',
      description: 'Exclusive 60-minute walkthrough of curated residential properties accompanied by a licensed senior broker.',
      durationMinutes: 60,
      price: 0,
      popular: true,
    },
    {
      id: 're_2',
      name: 'Comprehensive Home Valuation Consultation',
      description: 'In-depth comparative market analysis (CMA), recent comp review, and strategic pricing guidance.',
      durationMinutes: 45,
      price: 0,
      popular: true,
    },
    {
      id: 're_3',
      name: 'Buyer Acquisition Strategy Session',
      description: 'Personalized buyer profile assessment, off-market search briefing, and pre-approval roadmap.',
      durationMinutes: 45,
      price: 0,
    },
    {
      id: 're_4',
      name: 'Real Estate Investment Portfolio Review',
      description: 'Cap rate analysis, 1031 exchange guidance, and multi-family cash flow projections.',
      durationMinutes: 60,
      price: 0,
    },
  ],
  galleryImages: [
    {
      id: 're_gal_1',
      url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
      caption: 'TriBeCa Penthouse Living Space with Wraparound Terrace',
    },
    {
      id: 're_gal_2',
      url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80',
      caption: 'Chef’s Marble Kitchen with Custom Walnut Cabinetry',
    },
    {
      id: 're_gal_3',
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      caption: 'Modern Waterfront Villa with Private Infinity Pool',
    },
    {
      id: 're_gal_4',
      url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      caption: 'Architectural Townhouse Master Suite & Fireplace',
    },
  ],
  testimonials: [
    {
      id: 're_test_1',
      clientName: 'Harrison Sterling',
      rating: 5,
      comment: 'Found our dream Brooklyn Heights brownstone off-market within 3 weeks. The AI concierge scheduled our initial viewing seamlessly.',
      clientRole: 'Homebuyer',
    },
    {
      id: 're_test_2',
      clientName: 'Victoria Montgomery',
      rating: 5,
      comment: 'Sold our SoHo loft $120k over asking in 10 days. Supreme professionalism, staging mastery, and flawless communication.',
      clientRole: 'Property Seller',
    },
  ],
  socialLinks: {
    instagram: 'https://instagram.com/prestigerealtyny',
    facebook: 'https://facebook.com/prestigerealtyny',
  },
};

// 4. E-Commerce & Retail Brand
export const DEFAULT_ECOMMERCE_LANDING_CONFIG: LandingPageConfig = {
  enabled: true,
  slug: 'ecommerce-store',
  businessName: 'LuxeAura Modern Essentials',
  industry: 'ecommerce',
  themeColor: '#7c3aed',
  tagline: 'Minimalist Lifestyle Goods, Sustainable Apparel & Clean Living Essentials',
  badgeText: 'Ethically Sourced · Over 50,000 Happy Customers Worldwide',
  heroHeadline: 'Elevate Everyday Living with Timeless Simplicity',
  heroSubheadline: 'Thoughtfully crafted apparel and sustainable everyday essentials designed to last decades, not seasons. Enjoy complimentary carbon-neutral shipping.',
  heroCtaText: 'Explore New Arrivals',
  heroImageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
  aboutTitle: 'Conscious Design Meets Uncompromising Craft',
  aboutText: 'Founded with the belief that less is truly more, LuxeAura partners with master artisans using organic cotton, recycled alloys, and zero-waste packaging to redefine everyday luxury.',
  address: '120 Wooster Street, SoHo, New York, NY 10012',
  phone: '+1 (800) 555-0177',
  email: 'care@luxeaura.com',
  googleMapsUrl: 'https://maps.google.com/?q=120+Wooster+Street+New+York+NY',
  starterQuestions: [
    'Where is my order & tracking info?',
    'What is your return & exchange policy?',
    'Do you offer free shipping?',
    'Can I get a discount code?',
  ],
  workingHours: [
    { days: 'Online Store Support', hours: '24/7 Live AI Concierge & Chat' },
    { days: 'SoHo Flagship Store', hours: 'Tuesday – Sunday: 11:00 AM – 7:00 PM' },
    { days: 'Monday', hours: 'Showroom Closed for Private Appointments' },
  ],
  services: [
    {
      id: 'ecom_1',
      name: 'Virtual Personal Styling Session',
      description: '1-on-1 video styling session with an expert capsule wardrobe consultant. Receive custom outfit boards.',
      durationMinutes: 30,
      price: 0,
      popular: true,
    },
    {
      id: 'ecom_2',
      name: 'Custom Sizing & Tailoring Fitting',
      description: 'In-showroom private measurement and bespoke hem/cuff adjustment for ordered garments.',
      durationMinutes: 30,
      price: 35,
    },
    {
      id: 'ecom_3',
      name: 'Wholesale & Corporate Gifting Consultation',
      description: 'Bespoke corporate bundles with custom debossing, sustainable packaging, and volume pricing.',
      durationMinutes: 45,
      price: 0,
    },
  ],
  galleryImages: [
    {
      id: 'ecom_gal_1',
      url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80',
      caption: 'Organic Heavyweight Linen Capsule Collection',
    },
    {
      id: 'ecom_gal_2',
      url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      caption: 'Precision Minimalist Wristwatch & Accessories',
    },
    {
      id: 'ecom_gal_3',
      url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
      caption: 'Hand-Crafted Ceramic Tableware & Home Goods',
    },
  ],
  testimonials: [
    {
      id: 'ecom_test_1',
      clientName: 'Chloe Dupont',
      rating: 5,
      comment: 'The quality of the merino knit is extraordinary. Had a question about sizing and the AI chatbot gave me exact garment measurements in 2 seconds.',
      clientRole: 'Verified Buyer',
    },
    {
      id: 'ecom_test_2',
      clientName: 'Brandon Cole',
      rating: 5,
      comment: 'Shipping arrived in 2 days in plastic-free packaging. LuxeAura has become my go-to brand for timeless staples.',
      clientRole: 'Verified Buyer',
    },
  ],
  socialLinks: {
    instagram: 'https://instagram.com/luxeaura',
    facebook: 'https://facebook.com/luxeaura',
  },
};

// 5. B2B SaaS & Enterprise Software
export const DEFAULT_SAAS_LANDING_CONFIG: LandingPageConfig = {
  enabled: true,
  slug: 'b2b-saas',
  businessName: 'CloudFlow Enterprise Intelligence',
  industry: 'saas',
  themeColor: '#2563eb',
  tagline: 'AI-Powered Workflow Automation, Data Orchestration & Unified API Infrastructure',
  badgeText: 'SOC-2 Type II Certified · 99.99% Guaranteed Uptime SLA',
  heroHeadline: 'Automate Mission-Critical Enterprise Workflows at Scale',
  heroSubheadline: 'The developer-first automation engine used by high-velocity engineering and operations teams. Eliminate manual data entry, sync systems in real-time, and ship faster.',
  heroCtaText: 'Schedule a 20-Minute Product Demo',
  heroImageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
  aboutTitle: 'Built for High-Scale Enterprise Reliability',
  aboutText: 'CloudFlow connects fragmented databases, legacy ERPs, and modern SaaS APIs with sub-millisecond execution engines, end-to-end telemetry, and uncompromising security standards.',
  address: '100 Montgomery St, Suite 1800, San Francisco, CA 94104',
  phone: '+1 (415) 555-0163',
  email: 'sales@cloudflowsystems.io',
  googleMapsUrl: 'https://maps.google.com/?q=100+Montgomery+St+San+Francisco+CA',
  starterQuestions: [
    'How does your pricing work?',
    'Can I see a live demo of the product?',
    'What integrations & APIs do you support?',
    'Are you SOC-2 and GDPR compliant?',
  ],
  workingHours: [
    { days: 'Solutions Architecture & Demos', hours: 'Monday – Friday: 8:00 AM – 6:00 PM EST' },
    { days: 'Core Cloud Operations', hours: '24/7/365 Monitored Infrastructure & Uptime' },
  ],
  services: [
    {
      id: 'saas_1',
      name: '1-on-1 Solutions Architecture Demo',
      description: 'Live interactive walkthrough tailored to your company tech stack, data pipelines, and workflow automation goals.',
      durationMinutes: 30,
      price: 0,
      popular: true,
    },
    {
      id: 'saas_2',
      name: 'Enterprise Security & Compliance Review',
      description: 'Dedicated consultation with our security team covering SOC-2, HIPAA, GDPR, encryption, and custom SAML SSO.',
      durationMinutes: 45,
      price: 0,
    },
    {
      id: 'saas_3',
      name: 'Data Migration & Pipeline Strategy Audit',
      description: 'Technical assessment of current ETL bottlenecks, API rate limits, and custom connector requirements.',
      durationMinutes: 45,
      price: 0,
    },
  ],
  galleryImages: [
    {
      id: 'saas_gal_1',
      url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
      caption: 'Real-Time Pipeline Execution & Error Telemetry Dashboard',
    },
    {
      id: 'saas_gal_2',
      url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
      caption: 'Unified API Gateway with Automated Schema Validation',
    },
  ],
  testimonials: [
    {
      id: 'saas_test_1',
      clientName: 'Alex Rivera',
      rating: 5,
      comment: 'CloudFlow saved our engineering team 35+ hours every week. The setup was effortless and API reliability has been 100%.',
      clientRole: 'VP of Engineering at FinScale',
    },
    {
      id: 'saas_test_2',
      clientName: 'Kavita Patel',
      rating: 5,
      comment: 'Replaced 4 fragile custom cron jobs with one CloudFlow pipeline. The booking bot made setting up the enterprise demo trivial.',
      clientRole: 'Head of Operations at NexusCorp',
    },
  ],
  socialLinks: {
    instagram: 'https://instagram.com/cloudflowsystems',
    facebook: 'https://facebook.com/cloudflowsystems',
  },
};

// 6. Law Firm & Legal Counsel
export const DEFAULT_LEGAL_LANDING_CONFIG: LandingPageConfig = {
  enabled: true,
  slug: 'legal-law-firm',
  businessName: 'Vance & Montgomery Legal Counsel',
  industry: 'legal',
  themeColor: '#0f172a',
  tagline: 'Corporate Formation, Commercial Litigation & Strategic Wealth Protection',
  badgeText: 'Top Ranked Attorneys · Over 30 Years of Combined Trial Experience',
  heroHeadline: 'Decisive Legal Counsel When Everything is on the Line',
  heroSubheadline: 'Trial-tested courtroom toughness combined with refined corporate dealmaking. Schedule a confidential initial case evaluation with our senior legal team.',
  heroCtaText: 'Schedule Case Consultation',
  heroImageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
  aboutTitle: 'Unwavering Integrity & Proven Legal Advocacy',
  aboutText: 'At Vance & Montgomery, we advocate tirelessly for founders, business owners, and families. From complex equity agreements to high-stakes arbitration, we safeguard your assets and deliver clear outcomes.',
  address: '1221 Avenue of the Americas, 35th Floor, New York, NY 10020',
  phone: '+1 (212) 555-0139',
  email: 'intake@vancemontgomery.com',
  googleMapsUrl: 'https://maps.google.com/?q=1221+Avenue+of+the+Americas+New+York+NY',
  starterQuestions: [
    'What legal practice areas do you handle?',
    'How much is an initial consultation?',
    'What documents should I bring?',
    'Where is your office located?',
  ],
  workingHours: [
    { days: 'Monday – Friday', hours: '8:30 AM – 6:30 PM' },
    { days: 'Weekend Emergency Line', hours: 'Available 24/7 for Retained Corporate Clients' },
  ],
  services: [
    {
      id: 'leg_1',
      name: 'Initial Confidential Case Evaluation',
      description: '30-minute formal consultation to assess liability, review claims, and establish strategic options.',
      durationMinutes: 30,
      price: 150,
      popular: true,
    },
    {
      id: 'leg_2',
      name: 'Corporate Entity Formation & Operating Agreement',
      description: 'Full legal structure drafting (LLC/C-Corp), founder vesting provisions, and compliance documentation.',
      durationMinutes: 60,
      price: 350,
    },
    {
      id: 'leg_3',
      name: 'Estate Planning & Asset Protection Review',
      description: 'Revocable trusts, healthcare proxies, power of attorney, and wealth transfer protection.',
      durationMinutes: 60,
      price: 300,
    },
    {
      id: 'leg_4',
      name: 'Commercial Contract & IP Rights Audit',
      description: 'Detailed contract audit, non-disclosure terms, IP assignment, and dispute risk identification.',
      durationMinutes: 45,
      price: 250,
    },
  ],
  galleryImages: [
    {
      id: 'leg_gal_1',
      url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
      caption: 'Executive Conference Room & Case War Room',
    },
    {
      id: 'leg_gal_2',
      url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
      caption: 'Extensive Precedent Law Library & Research Archives',
    },
  ],
  testimonials: [
    {
      id: 'leg_test_1',
      clientName: 'Arthur Pendelton',
      rating: 5,
      comment: 'Vance & Montgomery handled our multi-million dollar corporate restructuring with surgeon precision. Worth every dollar.',
      clientRole: 'CEO, Horizon Industrial',
    },
    {
      id: 'leg_test_2',
      clientName: 'Grace Lin, Esq.',
      rating: 5,
      comment: 'Exceptional litigation strategy and impeccable ethics. Their client intake and booking bot gave me immediate appointment confirmation.',
      clientRole: 'Managing Director',
    },
  ],
  socialLinks: {
    instagram: 'https://instagram.com/vancemontgomerylaw',
    facebook: 'https://facebook.com/vancemontgomerylaw',
  },
};

// 7. Healthcare & Dental Clinic
export const DEFAULT_HEALTHCARE_LANDING_CONFIG: LandingPageConfig = {
  enabled: true,
  slug: 'dental-clinic',
  businessName: 'Beacon Dental & Healthcare Center',
  industry: 'healthcare',
  themeColor: '#0284c7',
  tagline: 'Gentle Modern Dentistry, Preventive Healthcare & Advanced Cosmetic Aesthetics',
  badgeText: 'Accepting New Patients · Delta, MetLife, Cigna & PPO In-Network',
  heroHeadline: 'Modern Healthcare & Dentistry Designed Around Your Comfort',
  heroSubheadline: 'Experience stress-free healthcare with 3D digital imaging, gentle ultrasonic cleanings, and a caring clinical team dedicated to your family\'s wellness.',
  heroCtaText: 'Book New Patient Exam',
  heroImageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80',
  aboutTitle: 'Compassionate Patient-Centered Care',
  aboutText: 'At Beacon Dental, we replace anxiety with empathy. Our clinic features ceiling streaming monitors with noise-canceling headphones, warm scented towelettes, and virtually pain-free dental technology.',
  address: '350 Fifth Avenue, Suite 410, New York, NY 10118',
  phone: '+1 (212) 555-0125',
  email: 'appointments@beacondentalcare.com',
  googleMapsUrl: 'https://maps.google.com/?q=350+Fifth+Avenue+New+York+NY',
  starterQuestions: [
    'Do you accept my dental/health insurance?',
    'How do I schedule a check-up or cleaning?',
    'What are your office hours & location?',
    'What should I do in a dental emergency?',
  ],
  workingHours: [
    { days: 'Monday – Thursday', hours: '8:00 AM – 6:00 PM' },
    { days: 'Friday', hours: '8:00 AM – 3:00 PM' },
    { days: 'Saturday', hours: '9:00 AM – 2:00 PM (By Appointment)' },
  ],
  services: [
    {
      id: 'dent_1',
      name: 'Comprehensive Exam, Digital X-Rays & Cleaning',
      description: 'Complete oral health evaluation, low-radiation panoramic digital X-rays, ultrasonic scaling, and polish.',
      durationMinutes: 50,
      price: 120,
      popular: true,
    },
    {
      id: 'dent_2',
      name: 'Professional In-Office Laser Teeth Whitening',
      description: 'Clinically proven laser acceleration brightening enamel up to 8 shades in a single comfortable visit.',
      durationMinutes: 60,
      price: 299,
      popular: true,
    },
    {
      id: 'dent_3',
      name: 'Emergency Dental Pain & Toothache Relief',
      description: 'Same-day urgent appointment for severe toothache, chipped crown, infection, or mouth trauma.',
      durationMinutes: 40,
      price: 95,
    },
    {
      id: 'dent_4',
      name: 'Clear Aligners & Orthodontic Consultation',
      description: 'Digital 3D intraoral scan, treatment simulation, and customized clear aligner progression plan.',
      durationMinutes: 30,
      price: 0,
    },
    {
      id: 'dent_5',
      name: 'Pediatric Dental Checkup & Fluoride Treatment',
      description: 'Gentle, cheerful dental visit for young children with cavity protection and habit counseling.',
      durationMinutes: 30,
      price: 85,
    },
  ],
  galleryImages: [
    {
      id: 'dent_gal_1',
      url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80',
      caption: 'Ultra-Modern Operatory with Ergonomic Memory Foam Chair',
    },
    {
      id: 'dent_gal_2',
      url: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80',
      caption: 'Digital 3D Intraoral Scanning & Smile Design Suite',
    },
  ],
  testimonials: [
    {
      id: 'dent_test_1',
      clientName: 'Jonathan Meyer',
      rating: 5,
      comment: 'I used to dread the dentist, but Beacon completely changed that. Painless cleaning, friendly staff, and the automated appointment reminders are super helpful.',
      clientRole: 'Patient since 2020',
    },
    {
      id: 'dent_test_2',
      clientName: 'Amira Al-Mansoor',
      rating: 5,
      comment: 'Got my emergency toothache seen the exact same afternoon thanks to the AI bot. Incredible patient care.',
      clientRole: 'Patient',
    },
  ],
  socialLinks: {
    instagram: 'https://instagram.com/beacondentalcare',
    facebook: 'https://facebook.com/beacondentalcare',
  },
};

export const DEFAULT_NEXUS_AI_CONFIG: LandingPageConfig = {
  enabled: true,
  slug: 'nexus-ai',
  businessName: 'Nexus AI Autonomous Intelligence',
  industry: 'nexus_ai',
  themeColor: 'cyan',
  tagline: 'Sub-15ms Multimodal Agentic Infrastructure',
  badgeText: 'Nexus v3.2 Engine Live · Sub-15ms Multimodal Inference',
  heroHeadline: 'Autonomous Intelligence Engineered for Enterprise Scale',
  heroSubheadline:
    'Deploy self-orchestrating AI agent clusters with native tool synthesis, hybrid vector cognition, and real-time human operator takeover.',
  heroCtaText: 'Schedule Architecture Review',
  address: '400 Spear Street, Suite 500, San Francisco, CA 94105',
  phone: '+1 (415) 890-2144',
  email: 'enterprise@nexus.ai',
  services: [
    {
      id: 'nexus_svc_1',
      name: 'Enterprise Architecture & Latency Benchmark',
      description: 'Comprehensive evaluation of existing LLM bottlenecks, token latency profiling, and tailored distributed GPU cluster design.',
      durationMinutes: 45,
      price: 0,
      popular: true,
    },
    {
      id: 'nexus_svc_2',
      name: 'Cognitive Vector Knowledge Graph Ingestion',
      description: 'Bespoke pipeline integration for enterprise data silos, implementing BM25+HNSW hybrid retrieval and strict access ACLs.',
      durationMinutes: 60,
      price: 500,
    },
    {
      id: 'nexus_svc_3',
      name: 'Dedicated Private Enclave Deployment (VPC)',
      description: 'Full white-glove setup of isolated bare-metal inference nodes within your AWS/GCP/Azure tenant with SOC-2 SLA.',
      durationMinutes: 90,
      price: 1500,
    },
  ],
  testimonials: [
    {
      id: 'nexus_test_1',
      clientName: 'Dr. Aris Thorne',
      rating: 5,
      comment: 'Nexus cut our multi-agent latency from 2.4 seconds to 38 milliseconds. The live supervisor takeover is a game changer.',
      clientRole: 'VP of AI Research',
    },
  ],
  socialLinks: {
    twitter: 'https://x.com/nexus_ai',
    linkedin: 'https://linkedin.com/company/nexus-ai',
  },
};

export const DEFAULT_HYPERION_AGENCY_CONFIG: LandingPageConfig = {
  enabled: true,
  slug: 'hyperion-agency',
  businessName: 'Hyperion Creative Bureau',
  industry: 'creative_agency',
  themeColor: 'amber',
  tagline: 'Hyper-Aesthetic Brands & Immersive Digital Flagships',
  badgeText: 'Independent Design & Technology Bureau · Zurich & New York',
  heroHeadline: 'Crafting hyper-aesthetic brands & digital flagships',
  heroSubheadline:
    'We partner with ambitious founders and iconic houses to build digital products that command cultural relevance and commercial momentum.',
  heroCtaText: 'Initiate Project Inquiry',
  address: 'Talstrasse 14, 8001 Zurich, Switzerland',
  phone: '+41 44 210 88 00',
  email: 'inquiries@hyperion.studio',
  services: [
    {
      id: 'hyp_svc_1',
      name: 'Quarterly Flagship Discovery & Creative Intake',
      description: '1-on-1 strategic positioning session with an Executive Creative Director to define project roadmap and aesthetic direction.',
      durationMinutes: 45,
      price: 0,
      popular: true,
    },
    {
      id: 'hyp_svc_2',
      name: 'Comprehensive Brand Architecture & Typographic System',
      description: 'Complete visual identity overhaul: bespoke typography, motion choreography guidelines, and unified design tokens.',
      durationMinutes: 60,
      price: 1200,
    },
    {
      id: 'hyp_svc_3',
      name: 'Immersive WebGL Flagship Sprint',
      description: 'Ultra-fast Next.js digital experience with custom GLSL shaders, 3D interaction physics, and headless commerce integration.',
      durationMinutes: 90,
      price: 2500,
    },
  ],
  testimonials: [
    {
      id: 'hyp_test_1',
      clientName: 'Chloe Delacroix',
      rating: 5,
      comment: 'Hyperion redefined our entire digital presence. Our conversion rate tripled within 30 days of launch.',
      clientRole: 'Chief Brand Officer',
    },
  ],
  socialLinks: {
    instagram: 'https://instagram.com/hyperion.studio',
    twitter: 'https://x.com/hyperion_studio',
  },
};

export const DEFAULT_AETHER_FINANCE_CONFIG: LandingPageConfig = {
  enabled: true,
  slug: 'aether-finance',
  businessName: 'Aether Sovereign Capital',
  industry: 'fintech',
  themeColor: 'emerald',
  tagline: 'Sovereign Wealth Management & Algorithmic Yield',
  badgeText: 'Institutional Sovereign Wealth & Bullion Infrastructure',
  heroHeadline: 'Sovereign Capital In The Algorithmic Era',
  heroSubheadline:
    'Direct treasury management, on-chain asset segregation, and zero-counterparty algorithmic yield for private family offices and ultra-high-net-worth founders.',
  heroCtaText: 'Schedule Private Consultation',
  address: 'One St. Peter Square, Geneva, 1204 Switzerland',
  phone: '+41 22 990 14 00',
  email: 'private@aethercapital.ch',
  services: [
    {
      id: 'aeth_svc_1',
      name: 'Sovereign Treasury Allocation & Yield Review',
      description: 'Confidential assessment of institutional liquidity, tokenized T-bill yield routing, and multi-jurisdiction asset protection.',
      durationMinutes: 45,
      price: 0,
      popular: true,
    },
    {
      id: 'aeth_svc_2',
      name: 'Multi-Party Computation (MPC) Custody Setup',
      description: 'Bespoke deployment of hardware security module (HSM) air-gapped key shards for multi-signature governance.',
      durationMinutes: 60,
      price: 750,
    },
    {
      id: 'aeth_svc_3',
      name: 'Algorithmic Treasury Arbitrage Onboarding',
      description: 'Direct institutional gateway connection into low-latency yield pools with real-time on-chain proof of reserves.',
      durationMinutes: 90,
      price: 2000,
    },
  ],
  testimonials: [
    {
      id: 'aeth_test_1',
      clientName: 'Henrik Van Der Bilt',
      rating: 5,
      comment: 'Aether provides the cryptographic certainty that traditional private banking simply cannot offer in the digital era.',
      clientRole: 'Managing Partner, Family Office',
    },
  ],
  socialLinks: {
    linkedin: 'https://linkedin.com/company/aether-sovereign',
    twitter: 'https://x.com/aether_capital',
  },
};

// Preset mapping dictionary
export const TEMPLATE_LANDING_CONFIGS: Record<string, LandingPageConfig> = {
  // Barbershop
  'classic-barbershop': DEFAULT_BARBER_LANDING_CONFIG,
  'template_barber': DEFAULT_BARBER_LANDING_CONFIG,
  'barbershop': DEFAULT_BARBER_LANDING_CONFIG,
  // Gym
  'fitness-gym': DEFAULT_GYM_LANDING_CONFIG,
  'template_gym': DEFAULT_GYM_LANDING_CONFIG,
  'gym': DEFAULT_GYM_LANDING_CONFIG,
  // Real Estate
  'real-estate': DEFAULT_REAL_ESTATE_LANDING_CONFIG,
  'template_real_estate': DEFAULT_REAL_ESTATE_LANDING_CONFIG,
  // E-Commerce
  'ecommerce-store': DEFAULT_ECOMMERCE_LANDING_CONFIG,
  'template_ecommerce': DEFAULT_ECOMMERCE_LANDING_CONFIG,
  'ecommerce': DEFAULT_ECOMMERCE_LANDING_CONFIG,
  // SaaS
  'b2b-saas': DEFAULT_SAAS_LANDING_CONFIG,
  'template_saas': DEFAULT_SAAS_LANDING_CONFIG,
  'saas': DEFAULT_SAAS_LANDING_CONFIG,
  // Legal
  'legal-law-firm': DEFAULT_LEGAL_LANDING_CONFIG,
  'template_legal': DEFAULT_LEGAL_LANDING_CONFIG,
  'legal': DEFAULT_LEGAL_LANDING_CONFIG,
  // Healthcare
  'dental-clinic': DEFAULT_HEALTHCARE_LANDING_CONFIG,
  'template_healthcare': DEFAULT_HEALTHCARE_LANDING_CONFIG,
  'healthcare': DEFAULT_HEALTHCARE_LANDING_CONFIG,
  // Premium Webflow & Framer Caliber Pages
  'nexus-ai': DEFAULT_NEXUS_AI_CONFIG,
  'template_nexus_ai': DEFAULT_NEXUS_AI_CONFIG,
  'nexus_ai': DEFAULT_NEXUS_AI_CONFIG,
  'ai_tech': DEFAULT_NEXUS_AI_CONFIG,
  'hyperion-agency': DEFAULT_HYPERION_AGENCY_CONFIG,
  'template_hyperion_agency': DEFAULT_HYPERION_AGENCY_CONFIG,
  'creative_agency': DEFAULT_HYPERION_AGENCY_CONFIG,
  'design_agency': DEFAULT_HYPERION_AGENCY_CONFIG,
  'aether-finance': DEFAULT_AETHER_FINANCE_CONFIG,
  'template_aether_finance': DEFAULT_AETHER_FINANCE_CONFIG,
  'fintech': DEFAULT_AETHER_FINANCE_CONFIG,
  'finance': DEFAULT_AETHER_FINANCE_CONFIG,
};

export function getLandingConfigForSlugOrTemplate(slugOrId: string): LandingPageConfig {
  const normalized = (slugOrId || '').toLowerCase().trim();
  return TEMPLATE_LANDING_CONFIGS[normalized] || DEFAULT_BARBER_LANDING_CONFIG;
}

