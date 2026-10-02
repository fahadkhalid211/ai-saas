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

export interface LandingPageMenuItem {
  label: string;
  href: string;
}

export interface LandingPageFeatureItem {
  title: string;
  description: string;
  badge?: string;
  icon?: string;
}

export interface LandingPageHeroSlide {
  id: string;
  imageUrl: string;
  headline: string;
  subheadline: string;
  badge?: string;
  ctaText?: string;
  ctaLink?: string;
}

export interface LandingPagePricingPlan {
  id: string;
  name: string;
  price: string | number;
  period?: string;
  description: string;
  features: string[];
  popular?: boolean;
  isPopular?: boolean;
  badge?: string;
  ctaText?: string;
  ctaLink?: string;
}

export interface LandingPageFaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface LandingPageStatItem {
  id?: string;
  value: string;
  label: string;
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
  menuItems?: LandingPageMenuItem[];
  aboutTitle?: string;
  aboutSubtitle?: string;
  aboutText?: string;
  aboutImageUrl?: string;
  servicesTitle?: string;
  servicesSubtitle?: string;
  featuresTitle?: string;
  featuresSubtitle?: string;
  features?: LandingPageFeatureItem[];
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
  galleryTitle?: string;
  gallerySubtitle?: string;
  galleryImages?: LandingPageGalleryItem[];
  testimonialsTitle?: string;
  testimonialsSubtitle?: string;
  testimonials?: LandingPageTestimonialItem[];
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  };
  logoUrl?: string;
  heroCarouselSlides?: LandingPageHeroSlide[];
  timezone?: string;
  showPricing?: boolean;
  pricingTitle?: string;
  pricingSubtitle?: string;
  pricingPlans?: LandingPagePricingPlan[];
  faqsTitle?: string;
  faqsSubtitle?: string;
  faqs?: LandingPageFaqItem[];
  stats?: LandingPageStatItem[];
  secondaryHeroCtaText?: string;
  founderName?: string;
  founderTitle?: string;
  founderRole?: string;
  founderStory?: string;
  founderImageUrl?: string;
  ctaHeadline?: string;
  ctaSubheadline?: string;
  ctaButtonText?: string;
  footerText?: string;
  designArchetype?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DesignArchetype {
  id: string;
  name: string;
  tagline: string;
  category: string;
  aesthetic: string;
  themeColor: string;
  previewImage: string;
  badge: string;
  features: string[];
  recommendedFor: string[];
}

export const MODERN_DESIGN_ARCHETYPES: DesignArchetype[] = [
  {
    id: 'dark-luxury-glass',
    name: 'Ultra-Modern Dark Glass',
    tagline: 'Deep obsidian canvas with luminous frosted glass cards and neon accents.',
    category: 'High-End Luxury & Modern Tech',
    aesthetic: 'Dark Obsidian & Frosted Glass',
    themeColor: '#6366f1',
    previewImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    badge: 'Aesthetic Trend 2026',
    features: [
      'Backdrop blur frosted cards',
      'High-contrast glowing CTA buttons',
      'Integrated floating AI concierge',
      'Instant calendar time-slot triage',
    ],
    recommendedFor: ['saas', 'ai_tech', 'barbershop', 'gym', 'creative_agency'],
  },
  {
    id: 'minimal-editorial',
    name: 'Minimalist Editorial Luxury',
    tagline: 'Refined Swiss whitespace, sharp typography, and understated prestige.',
    category: 'Editorial & Luxury Boutique',
    aesthetic: 'Clean White & Warm Charcoal',
    themeColor: '#0f172a',
    previewImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
    badge: 'Editorial Excellence',
    features: [
      'Elegant serif headlines & clean grid',
      'Spacious high-ticket service menu',
      'Client trust badges & review carousel',
      'Distraction-free booking flow',
    ],
    recommendedFor: ['real_estate', 'legal', 'healthcare', 'fintech', 'custom'],
  },
  {
    id: 'high-conversion-bold',
    name: 'Dynamic High-Conversion',
    tagline: 'Built for velocity with prominent booking badges and vibrant gradients.',
    category: 'High-Growth & Direct Response',
    aesthetic: 'Vibrant Dynamic & High Impact',
    themeColor: '#2563eb',
    previewImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    badge: 'Top Conversion Rate',
    features: [
      'Sticky booking call-to-actions',
      'Interactive pricing matrix with highlights',
      'Customer review social proof badges',
      'Immediate SMS / Email confirmation hook',
    ],
    recommendedFor: ['gym', 'barbershop', 'ecommerce', 'saas', 'healthcare'],
  },
  {
    id: 'executive-authority',
    name: 'Bespoke Executive Authority',
    tagline: 'Authoritative structure designed for corporate trust, NDAs, and retainers.',
    category: 'Corporate & Professional Advisory',
    aesthetic: 'Deep Navy & Brushed Gold',
    themeColor: '#d97706',
    previewImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    badge: 'Enterprise Grade',
    features: [
      'Structured legal / advisory intake triage',
      'Strict confidentiality & SLA badges',
      'Attorney / Specialist credentials display',
      'Multi-tier consultation booking forms',
    ],
    recommendedFor: ['legal', 'fintech', 'real_estate', 'custom'],
  },
  {
    id: 'creative-studio',
    name: 'Avant-Garde Creative Studio',
    tagline: 'Bold asymmetrical typography, immersive media showcase, and design flair.',
    category: 'Design & Digital Innovation',
    aesthetic: 'Fuchsia Neon & Deep Charcoal',
    themeColor: '#d946ef',
    previewImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    badge: 'Design Award Winner',
    features: [
      'High-impact visual portfolio grid',
      'Interactive service scope estimator',
      'Direct founder discovery call triage',
      'Dynamic social video embeds',
    ],
    recommendedFor: ['creative_agency', 'ecommerce', 'ai_tech', 'custom'],
  },
];

export const INDUSTRY_DESIGN_ARCHETYPES: Record<string, DesignArchetype[]> = {
  universal: [
    {
      id: 'universal_clean_modern',
      name: 'Universal Clean Precision',
      tagline: 'Clean, balanced typography, crisp borders, and refined white/dark contrast suited for any business.',
      category: 'Universal Multi-Industry',
      aesthetic: 'Clean Modern & Precision Craft',
      themeColor: '#2563eb',
      previewImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
      badge: 'Universal Standard',
      features: [
        'Editable Hero Image & Copy Carousel',
        'Transparent Booking Menu with Timezone',
        'Toggleable Multi-Tier Pricing Matrix',
        'Connected Knowledgebase AI Concierge',
      ],
      recommendedFor: ['universal', 'general', 'custom', 'consulting'],
    },
    {
      id: 'universal_executive_slate',
      name: 'Universal Executive Slate',
      tagline: 'Authoritative deep navy and slate layout with generous whitespace and high-ticket service catalog.',
      category: 'Executive & Professional Services',
      aesthetic: 'Deep Slate & Royal Blue',
      themeColor: '#1e3a8a',
      previewImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
      badge: 'Corporate Standard',
      features: [
        'Structured service and retainer tiers',
        'Client review ratings and social proof',
        'Timezone-aware calendar booking engine',
        'Knowledge-grounded assistant trigger',
      ],
      recommendedFor: ['universal', 'general', 'saas', 'legal'],
    },
    {
      id: 'universal_high_conversion',
      name: 'Universal Direct Response',
      tagline: 'High-contrast conversion engine with prominent CTA buttons, trust badges, and FAQ accordion.',
      category: 'High-Growth & Local Services',
      aesthetic: 'Vibrant Accent & High Contrast',
      themeColor: '#059669',
      previewImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
      badge: 'High Conversion',
      features: [
        'Rapid booking flow with SMS/Email alerts',
        'Flexible monthly and annual pricing toggle',
        'Full image and text customization per section',
        'Direct 24/7 AI chat assistance',
      ],
      recommendedFor: ['universal', 'general', 'clinic', 'gym'],
    },
  ],
  legal: [
    {
      id: 'legal_prestige',
      name: 'Classic Prestige & Chambers Elite',
      tagline: 'Traditional high-trust dark slate & gold, authoritative serif typography, landmark verdicts, and partner credentials.',
      category: 'Corporate Litigation & Advisory',
      aesthetic: 'Deep Navy Slate & Subtle Gold',
      themeColor: '#1e3a8a',
      previewImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
      badge: 'Chambers Band 1',
      features: [
        'Authoritative serif typography & credentials ticker',
        'Five-phase litigation roadmap & landmark verdicts table',
        'Partner roster & confidential case evaluation',
        'Attorney-client privileged intake chat',
      ],
      recommendedFor: ['legal', 'law_firm'],
    },
    {
      id: 'legal_modern',
      name: 'Modern Corporate & Tech Counsel',
      tagline: 'Clean architectural layout with hero image split, streamlined consultation intake, and dynamic practice areas.',
      category: 'Boutique M&A & Venture Law',
      aesthetic: 'Refined Slate & Royal Blue',
      themeColor: '#2563eb',
      previewImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
      badge: 'Corporate Standard',
      features: [
        'Prominent hero firm image with consultation card',
        'Structured corporate retainer schedules',
        'Client confidentiality verification',
        'Direct calendar scheduler for general counsel',
      ],
      recommendedFor: ['legal', 'corporate'],
    },
    {
      id: 'legal_trial',
      name: 'High-Impact Trial & Litigation Squad',
      tagline: 'Emergency injunction readiness, bold courtroom statistics, rapid asset freeze timeline, and 24/7 privileged intake.',
      category: 'Emergency Litigation & Defense',
      aesthetic: 'Obsidian & High-Contrast Blue',
      themeColor: '#3b82f6',
      previewImage: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=800&q=80',
      badge: 'Trial Squad',
      features: [
        'Sub-18 hour emergency TRO filing protocol',
        'Aggressive capital recovered statistics ($850M+ defended)',
        'Delaware Chancery & federal court track record',
        'Instant emergency hotline booking',
      ],
      recommendedFor: ['legal', 'trial'],
    },
  ],
  barbershop: [
    {
      id: 'barber_classic',
      name: 'Vintage Artisan & Hot Towel Shave',
      tagline: 'Classic dark obsidian, scissor tradition, hot lather edge up, and heritage gentleman grooming.',
      category: 'Traditional Barber Craft',
      aesthetic: 'Dark Obsidian & Amber Gold',
      themeColor: '#f59e0b',
      previewImage: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
      badge: 'Artisan Heritage',
      features: [
        'Traditional scissor & straight razor service catalog',
        'Heritage dark wood & warm amber styling',
        'Master barber profiles and specialties',
        'Real-time chair booking with SMS confirmations',
      ],
      recommendedFor: ['barbershop'],
    },
    {
      id: 'barber_modern',
      name: 'Urban Fade & Streetwear Studio',
      tagline: 'High-contrast typography, chair booking speed, precision skin fades, and dynamic portfolio showcase.',
      category: 'Modern Streetwear & Studio',
      aesthetic: 'Matte Charcoal & Electric Amber',
      themeColor: '#d97706',
      previewImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80',
      badge: 'Urban High-Pace',
      features: [
        'High-velocity service menu with duration badges',
        'Visual fade and beard gallery carousel',
        'Walk-in queue estimator and online booking',
        'Instagram portfolio integration',
      ],
      recommendedFor: ['barbershop', 'salon'],
    },
    {
      id: 'barber_vip',
      name: 'Executive Grooming & Private Lounge',
      tagline: 'Minimalist luxury editorial, VIP suite packages, private bookings, and tailored whiskey bar ambience.',
      category: 'Private Club & VIP Lounge',
      aesthetic: 'Minimal Slate & Brushed Bronze',
      themeColor: '#b45309',
      previewImage: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80',
      badge: 'Executive Lounge',
      features: [
        'Exclusive private room VIP reservations',
        'Curated beverage & hot towel experience',
        'Tailored monthly grooming membership tiers',
        'Concierge consultation for beard & scalp care',
      ],
      recommendedFor: ['barbershop', 'luxury'],
    },
  ],
  gym: [
    {
      id: 'gym_power',
      name: 'High-Intensity Athletic & Dark Neon',
      tagline: 'Dark athletic canvas, high-energy rose accents, powerlifting zones, and live class calendar.',
      category: 'Athletics & Strength',
      aesthetic: 'Obsidian & Energetic Rose',
      themeColor: '#e11d48',
      previewImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
      badge: 'High-Intensity',
      features: [
        'Dynamic class schedule & instructor booking',
        'Tiered membership cards with instant checkout',
        'Heavy lifting platform & facility showcase',
        'Free first session lead capture triage',
      ],
      recommendedFor: ['gym', 'fitness'],
    },
    {
      id: 'gym_wellness',
      name: 'Boutique Wellness & Mindful Sanctuary',
      tagline: 'Calm natural tones, holistic yoga and recovery, cold plunge passes, and spa amenities.',
      category: 'Holistic Wellness & Recovery',
      aesthetic: 'Serene Sand & Forest Emerald',
      themeColor: '#059669',
      previewImage: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
      badge: 'Wellness Sanctuary',
      features: [
        'Infrared sauna, cold plunge & yoga passes',
        'Gentle botanical aesthetic with spacious grids',
        'Mindful recovery appointment triage',
        'Holistic member testimonials & amenities guide',
      ],
      recommendedFor: ['gym', 'wellness', 'yoga'],
    },
    {
      id: 'gym_performance',
      name: 'Biometrics & Olympic Performance Lab',
      tagline: 'Sport science telemetry, body composition audits, Olympic coaching, and athlete progression tracking.',
      category: 'Sports Science & Analytics',
      aesthetic: 'Deep Navy & Electric Cyan',
      themeColor: '#0284c7',
      previewImage: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
      badge: 'Performance Lab',
      features: [
        'Biometric DEXA scan & VO2 max audit booking',
        'Olympic lifting platforms & turf lane preview',
        'Coach bio matrix with verified certifications',
        'High-performance athlete protocol roadmap',
      ],
      recommendedFor: ['gym', 'performance'],
    },
  ],
  real_estate: [
    {
      id: 're_luxury',
      name: 'Luxury Estate & Architectural Showcase',
      tagline: 'Full-bleed photography, prestige emerald accents, private property tours, and high-net-worth buyer intake.',
      category: 'Prime Luxury Residences',
      aesthetic: 'Prestige Emerald & Ivory',
      themeColor: '#10b981',
      previewImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      badge: 'Architectural Digest',
      features: [
        'High-resolution architectural photography grid',
        'Private estate walkthrough scheduler',
        'Confidential off-market pocket listing inquiry',
        'Mortgage & property valuation calculator',
      ],
      recommendedFor: ['real_estate', 'luxury'],
    },
    {
      id: 're_urban',
      name: 'Modern Urban Brokerage & Listings',
      tagline: 'Clean property grid, interactive valuation estimation, neighborhood demographics, and buyer strategy.',
      category: 'Urban Brokerage & Condos',
      aesthetic: 'Clean Slate & Cobalt',
      themeColor: '#2563eb',
      previewImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
      badge: 'Top Producer',
      features: [
        'Neighborhood school and transit score cards',
        'Instant online home valuation request form',
        'Buyer advisory consultation calendar',
        'Filterable condo and multi-family listings',
      ],
      recommendedFor: ['real_estate', 'urban'],
    },
    {
      id: 're_investment',
      name: 'Commercial Advisory & Wealth Portfolios',
      tagline: 'Institutional acquisitions, commercial cap rate models, NDA private listings, and multi-family assets.',
      category: 'Commercial Capital & Portfolios',
      aesthetic: 'Charcoal & Champagne Gold',
      themeColor: '#d97706',
      previewImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
      badge: 'Institutional Grade',
      features: [
        'Commercial asset yield & cap rate summaries',
        'Accredited investor NDA download and intake',
        'Direct acquisitions partner meeting scheduler',
        'Industrial, retail & multi-family portfolio',
      ],
      recommendedFor: ['real_estate', 'commercial'],
    },
  ],
  saas: [
    {
      id: 'saas_dark_glow',
      name: 'Silicon Valley AI & Vector Platform',
      tagline: 'Deep obsidian canvas with glowing indigo gradients, interactive API sandbox, and live cluster metrics.',
      category: 'AI Infrastructure & Cloud',
      aesthetic: 'Obsidian & Indigo Neon',
      themeColor: '#6366f1',
      previewImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      badge: 'AI Native 2026',
      features: [
        'Interactive live terminal with curl/Python tabs',
        'Cluster latency and SOC-2 SLA ticker',
        'Single-tenant VPC enterprise deployment request',
        'Automated developer sandbox provisioning',
      ],
      recommendedFor: ['saas', 'ai_tech'],
    },
    {
      id: 'saas_enterprise',
      name: 'Clean B2B Enterprise & Workflow OS',
      tagline: 'Structured enterprise feature matrix, SOC-2 compliance badges, multi-seat pricing tiers, and executive demo booking.',
      category: 'Enterprise Workflow & Governance',
      aesthetic: 'Light Slate & Royal Blue',
      themeColor: '#2563eb',
      previewImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
      badge: 'Enterprise Ready',
      features: [
        'Structured feature comparison table with competitors',
        'Salesforce, HubSpot and Zendesk integration badges',
        'Executive live product demonstration booking',
        'Transparent tier-based seat pricing cards',
      ],
      recommendedFor: ['saas', 'enterprise'],
    },
    {
      id: 'saas_developer',
      name: 'Developer-First Infrastructure & APIs',
      tagline: 'Terminal-inspired syntax highlighting, curl/SDK code toggle, latency benchmarks, and instant developer onboarding.',
      category: 'Developer Tools & Cloud APIs',
      aesthetic: 'Jet Black & Emerald Green',
      themeColor: '#10b981',
      previewImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
      badge: 'Dev Velocity',
      features: [
        'Zero-latency edge API code copy hooks',
        'Interactive webhook and payload testing',
        'Community Discord & GitHub contributor badges',
        'API key registration triage flow',
      ],
      recommendedFor: ['saas', 'developer'],
    },
  ],
  healthcare: [
    {
      id: 'health_clinical',
      name: 'Clinical Serene & Comprehensive Care',
      tagline: 'Gentle clinical blue, digital 3D imaging, pain-free sedation protocols, and transparent insurance acceptance.',
      category: 'Family Dental & Diagnostics',
      aesthetic: 'Calm Sky Blue & Pure White',
      themeColor: '#0284c7',
      previewImage: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
      badge: 'Patient Trusted',
      features: [
        'Digital smile scanning and zero-putty imaging',
        'Comprehensive family cleaning & exam packages',
        'In-network insurance lookup and verification',
        'Same-week appointment reservation flow',
      ],
      recommendedFor: ['healthcare', 'dental'],
    },
    {
      id: 'health_cosmetic',
      name: 'Luxury Cosmetic & Smile Architecture',
      tagline: 'Boutique cosmetic studio, digital shade matching, laser whitening, and transformational smile galleries.',
      category: 'Cosmetic Dentistry & Veneers',
      aesthetic: 'Porcelain White & Teal',
      themeColor: '#0d9488',
      previewImage: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80',
      badge: 'Smile Studio',
      features: [
        'Before-and-after cosmetic smile transformation showcase',
        'Porcelain veneer and clear aligner consultations',
        'Complimentary virtual smile assessment',
        'Private VIP operatory suite tours',
      ],
      recommendedFor: ['healthcare', 'cosmetic'],
    },
    {
      id: 'health_urgent',
      name: 'Rapid Urgent Care & Surgical Triage',
      tagline: 'Same-day relief, emergency toothache hotline, rapid digital trauma triage, and zero-wait check-in.',
      category: 'Emergency Oral Surgery & Care',
      aesthetic: 'Clinical Teal & High-Contrast Slate',
      themeColor: '#0f766e',
      previewImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
      badge: 'Same-Day Triage',
      features: [
        '24/7 emergency toothache triage queue',
        'Same-day pain relief procedure appointments',
        'Transparent emergency pricing without surprises',
        'Digital check-in to bypass waiting room delays',
      ],
      recommendedFor: ['healthcare', 'emergency'],
    },
  ],
  ecommerce: [
    {
      id: 'ecom_editorial',
      name: 'Curated Luxury Fashion & Lookbook',
      tagline: 'Refined editorial lookbook grid, private styling consultations, and signature seasonal drops.',
      category: 'Boutique Apparel & Lookbook',
      aesthetic: 'Warm Monochrome & Neutral Cream',
      themeColor: '#0f172a',
      previewImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
      badge: 'Editorial Vogue',
      features: [
        'High-fashion lookbook grid with editorial styling',
        '1-on-1 virtual stylist consultation bookings',
        'Curated limited-quantity seasonal catalog',
        'Bespoke tailoring and measurement requests',
      ],
      recommendedFor: ['ecommerce', 'fashion'],
    },
    {
      id: 'ecom_d2c',
      name: 'High-Growth Direct-to-Consumer Flagship',
      tagline: 'Vibrant purple & electric accents, conversion-driven product matrix, limited countdowns, and social reviews.',
      category: 'Direct-to-Consumer & Retail',
      aesthetic: 'Vibrant Purple & Electric Violet',
      themeColor: '#9333ea',
      previewImage: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=800&q=80',
      badge: 'Top Velocity',
      features: [
        'Prominent product showcase with quick buy hooks',
        'Customer photo reviews and rating carousel',
        'Limited edition drops and flash sale highlights',
        'Instant chat recommendation concierge',
      ],
      recommendedFor: ['ecommerce', 'retail'],
    },
    {
      id: 'ecom_artisan',
      name: 'Handcrafted & Sustainable Goods',
      tagline: 'Artisanal heritage, founder craftsmanship story, sustainable sourcing highlights, and custom orders.',
      category: 'Artisan Workshop & Sustainable',
      aesthetic: 'Earthy Amber & Warm Terracotta',
      themeColor: '#c2410c',
      previewImage: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=800&q=80',
      badge: 'Artisan Heritage',
      features: [
        'Behind-the-scenes workshop craftsmanship story',
        'Ethical and sustainable materials transparency',
        'Custom commission order consultation form',
        'Artisan creator spotlight and guarantee',
      ],
      recommendedFor: ['ecommerce', 'artisan'],
    },
  ],
  custom: [
    {
      id: 'custom_minimal',
      name: 'Clean Minimalist Canvas',
      tagline: 'Swiss grid typography, generous whitespace, and focused call to action.',
      category: 'General Purpose & Agency',
      aesthetic: 'Clean Slate & Charcoal',
      themeColor: '#2563eb',
      previewImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
      badge: 'Universal Fit',
      features: [
        'Clean modular content blocks',
        'Universal service booking integration',
        'Floating AI concierge',
        'Responsive mobile layout',
      ],
      recommendedFor: ['custom'],
    },
    {
      id: 'custom_dark_luxe',
      name: 'Executive Dark Studio',
      tagline: 'Deep obsidian theme with subtle glowing highlights and floating cards.',
      category: 'Premium Service & Tech',
      aesthetic: 'Obsidian & Deep Indigo',
      themeColor: '#6366f1',
      previewImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      badge: 'Executive Studio',
      features: [
        'Dark mode luxury styling',
        'Luminous borders and tilt effects',
        'Calendar slot reservation',
        'Interactive AI chat intake',
      ],
      recommendedFor: ['custom'],
    },
    {
      id: 'custom_vibrant',
      name: 'High-Impact Vibrant Brand',
      tagline: 'Bold headlines, high-energy accents, and conversion-optimized flow.',
      category: 'High-Growth Business',
      aesthetic: 'Vibrant Cobalt & Cyan',
      themeColor: '#0284c7',
      previewImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
      badge: 'High Energy',
      features: [
        'High-contrast call to actions',
        'Review and social proof badges',
        'Fast mobile appointment booking',
        'Lead capture automation',
      ],
      recommendedFor: ['custom'],
    },
  ],
  crescelo: [
    {
      id: 'crescelo_flagship',
      name: 'Crescelo Editorial Flagship',
      tagline: 'Deep dark green & electric lime, googly-eyed mascot, interactive prompt demo, and smooth stacked problem cards.',
      category: 'AI Assistant & SaaS',
      aesthetic: 'Deep Forest & Electric Lime',
      themeColor: '#abff44',
      previewImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      badge: 'Official Signature',
      features: [
        'Cursor-following mascot with googly pupils',
        'Interactive typing and hold prompt preview',
        'Pinned smooth scroll problem stack',
        'Rotating dual-ring orbit stage',
      ],
      recommendedFor: ['crescelo'],
    },
    {
      id: 'crescelo_minimal',
      name: 'Clean Modern Editorial',
      tagline: 'Warm cream, deep ink, and refined Swiss typography with interactive before/after split slider.',
      category: 'Minimalist Editorial',
      aesthetic: 'Warm Cream & Deep Ink',
      themeColor: '#0f6e58',
      previewImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
      badge: 'Editorial Minimal',
      features: [
        'Draggable before/after comparison slider',
        'Interactive live RAG pipeline playground',
        'Full calendar appointment reservation',
        'Seamless infinite feature carousel',
      ],
      recommendedFor: ['crescelo'],
    },
    {
      id: 'crescelo_high_growth',
      name: 'High-Velocity Conversion Studio',
      tagline: 'High-contrast conversion layout with dynamic pricing tiers, live chat handover, and verified social proof.',
      category: 'Conversion Studio',
      aesthetic: 'Obsidian & Neon Lime',
      themeColor: '#c9f31d',
      previewImage: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&q=80',
      badge: 'High Velocity',
      features: [
        'One-click appointment slot reservation',
        'Live human takeover in active chat',
        'Customer reviews and rating stars',
        'Expandable FAQ accordion',
      ],
      recommendedFor: ['crescelo'],
    },
  ],
};

export function getArchetypesForIndustry(industry?: string): DesignArchetype[] {
  const ind = (industry || 'general').toLowerCase().trim();
  if (ind.includes('universal') || ind === 'general') return INDUSTRY_DESIGN_ARCHETYPES.universal;
  if (ind.includes('crescelo') || ind === 'website_assistant' || ind === 'ai_assistant_saas') return INDUSTRY_DESIGN_ARCHETYPES.crescelo;
  if (ind.includes('legal') || ind.includes('law')) return INDUSTRY_DESIGN_ARCHETYPES.legal;
  if (ind.includes('barber') || ind.includes('salon')) return INDUSTRY_DESIGN_ARCHETYPES.barbershop;
  if (ind.includes('gym') || ind.includes('fitness')) return INDUSTRY_DESIGN_ARCHETYPES.gym;
  if (ind.includes('estate') || ind.includes('property') || ind.includes('realt')) return INDUSTRY_DESIGN_ARCHETYPES.real_estate;
  if (ind.includes('saas') || ind.includes('tech') || ind.includes('software')) return INDUSTRY_DESIGN_ARCHETYPES.saas;
  if (ind.includes('health') || ind.includes('dental') || ind.includes('clinic')) return INDUSTRY_DESIGN_ARCHETYPES.healthcare;
  if (ind.includes('ecom') || ind.includes('retail') || ind.includes('store')) return INDUSTRY_DESIGN_ARCHETYPES.ecommerce;
  return INDUSTRY_DESIGN_ARCHETYPES[ind] || INDUSTRY_DESIGN_ARCHETYPES.custom;
}

export interface ThemePalette {
  accentBg: string;
  accentHoverBg: string;
  accentText: string;
  accentBorder: string;
  badgeBg: string;
  lightBg: string;
  btnBg: string;
  btnHoverBg: string;
  btnText: string;
  selectionBg: string;
  focusRing: string;
  colorHex: string;
}

export function getThemePalette(themeColor?: string, defaultIndustry?: string): ThemePalette {
  const c = (themeColor || '').toLowerCase().trim();
  const ind = (defaultIndustry || '').toLowerCase().trim();

  // Blue / Cobalt
  if (c === 'blue' || c === '#2563eb' || c === '#1d4ed8' || c === '#1e40af' || c === '#3b82f6' || c === '#1e3a8a') {
    return {
      accentBg: 'bg-blue-600',
      accentHoverBg: 'hover:bg-blue-500',
      accentText: 'text-blue-600 dark:text-blue-400',
      accentBorder: 'border-blue-500/30',
      badgeBg: 'bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 text-white',
      lightBg: 'bg-blue-500/10',
      btnBg: 'bg-blue-600',
      btnHoverBg: 'hover:bg-blue-500',
      btnText: 'text-white',
      selectionBg: 'selection:bg-blue-500 selection:text-white',
      focusRing: 'focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
      colorHex: '#2563eb',
    };
  }

  // Rose / Red
  if (c === 'rose' || c === 'red' || c === '#e11d48' || c === '#f43f5e' || c === '#dc2626') {
    return {
      accentBg: 'bg-rose-600',
      accentHoverBg: 'hover:bg-rose-500',
      accentText: 'text-rose-600 dark:text-rose-400',
      accentBorder: 'border-rose-500/30',
      badgeBg: 'bg-gradient-to-r from-rose-700 via-rose-600 to-rose-700 text-white',
      lightBg: 'bg-rose-500/10',
      btnBg: 'bg-rose-600',
      btnHoverBg: 'hover:bg-rose-500',
      btnText: 'text-white',
      selectionBg: 'selection:bg-rose-500 selection:text-white',
      focusRing: 'focus:border-rose-500 focus:ring-1 focus:ring-rose-500',
      colorHex: '#e11d48',
    };
  }

  // Emerald / Green
  if (c === 'emerald' || c === 'green' || c === '#10b981' || c === '#059669' || c === '#047857') {
    return {
      accentBg: 'bg-emerald-600',
      accentHoverBg: 'hover:bg-emerald-500',
      accentText: 'text-emerald-600 dark:text-emerald-400',
      accentBorder: 'border-emerald-500/30',
      badgeBg: 'bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 text-white',
      lightBg: 'bg-emerald-500/10',
      btnBg: 'bg-emerald-600',
      btnHoverBg: 'hover:bg-emerald-500',
      btnText: 'text-white',
      selectionBg: 'selection:bg-emerald-500 selection:text-white',
      focusRing: 'focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500',
      colorHex: '#10b981',
    };
  }

  // Purple / Violet
  if (c === 'purple' || c === 'violet' || c === '#9333ea' || c === '#7c3aed' || c === '#8b5cf6') {
    return {
      accentBg: 'bg-purple-600',
      accentHoverBg: 'hover:bg-purple-500',
      accentText: 'text-purple-600 dark:text-purple-400',
      accentBorder: 'border-purple-500/30',
      badgeBg: 'bg-gradient-to-r from-purple-700 via-purple-600 to-purple-700 text-white',
      lightBg: 'bg-purple-500/10',
      btnBg: 'bg-purple-600',
      btnHoverBg: 'hover:bg-purple-500',
      btnText: 'text-white',
      selectionBg: 'selection:bg-purple-500 selection:text-white',
      focusRing: 'focus:border-purple-500 focus:ring-1 focus:ring-purple-500',
      colorHex: '#9333ea',
    };
  }

  // Indigo / AI Glow
  if (c === 'indigo' || c === '#6366f1' || c === '#4f46e5') {
    return {
      accentBg: 'bg-indigo-600',
      accentHoverBg: 'hover:bg-indigo-500',
      accentText: 'text-indigo-600 dark:text-indigo-400',
      accentBorder: 'border-indigo-500/30',
      badgeBg: 'bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-700 text-white',
      lightBg: 'bg-indigo-500/10',
      btnBg: 'bg-indigo-600',
      btnHoverBg: 'hover:bg-indigo-500',
      btnText: 'text-white',
      selectionBg: 'selection:bg-indigo-500 selection:text-white',
      focusRing: 'focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500',
      colorHex: '#6366f1',
    };
  }

  // Sky / Cyan
  if (c === 'sky' || c === 'cyan' || c === '#0284c7' || c === '#0ea5e9' || c === '#06b6d4') {
    return {
      accentBg: 'bg-sky-600',
      accentHoverBg: 'hover:bg-sky-500',
      accentText: 'text-sky-600 dark:text-sky-400',
      accentBorder: 'border-sky-500/30',
      badgeBg: 'bg-gradient-to-r from-sky-700 via-sky-600 to-sky-700 text-white',
      lightBg: 'bg-sky-500/10',
      btnBg: 'bg-sky-600',
      btnHoverBg: 'hover:bg-sky-500',
      btnText: 'text-white',
      selectionBg: 'selection:bg-sky-500 selection:text-white',
      focusRing: 'focus:border-sky-500 focus:ring-1 focus:ring-sky-500',
      colorHex: '#0284c7',
    };
  }

  // Teal
  if (c === 'teal' || c === '#0d9488' || c === '#14b8a6' || c === '#0f766e') {
    return {
      accentBg: 'bg-teal-600',
      accentHoverBg: 'hover:bg-teal-500',
      accentText: 'text-teal-600 dark:text-teal-400',
      accentBorder: 'border-teal-500/30',
      badgeBg: 'bg-gradient-to-r from-teal-700 via-teal-600 to-teal-700 text-white',
      lightBg: 'bg-teal-500/10',
      btnBg: 'bg-teal-600',
      btnHoverBg: 'hover:bg-teal-500',
      btnText: 'text-white',
      selectionBg: 'selection:bg-teal-500 selection:text-white',
      focusRing: 'focus:border-teal-500 focus:ring-1 focus:ring-teal-500',
      colorHex: '#0d9488',
    };
  }

  // Slate / Dark Executive
  if (c === 'slate' || c === 'dark' || c === '#0f172a' || c === '#1e293b' || c === '#334155') {
    return {
      accentBg: 'bg-slate-900 dark:bg-slate-100',
      accentHoverBg: 'hover:bg-slate-800 dark:hover:bg-white',
      accentText: 'text-slate-900 dark:text-slate-100',
      accentBorder: 'border-slate-400/30 dark:border-slate-600/40',
      badgeBg: 'bg-slate-900 dark:bg-slate-800 text-white',
      lightBg: 'bg-slate-500/10',
      btnBg: 'bg-slate-900 dark:bg-slate-100',
      btnHoverBg: 'hover:bg-slate-800 dark:hover:bg-white',
      btnText: 'text-white dark:text-slate-950',
      selectionBg: 'selection:bg-slate-800 selection:text-white',
      focusRing: 'focus:border-slate-700 focus:ring-1 focus:ring-slate-700',
      colorHex: '#0f172a',
    };
  }

  // Amber / Warm Gold (Only when explicitly amber, or default for barbershop)
  if (c === 'amber' || c === '#f59e0b' || c === '#d97706' || c === '#b45309' || ind.includes('barber')) {
    return {
      accentBg: 'bg-amber-500',
      accentHoverBg: 'hover:bg-amber-400',
      accentText: 'text-amber-500 dark:text-amber-400',
      accentBorder: 'border-amber-500/30',
      badgeBg: 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950',
      lightBg: 'bg-amber-500/10',
      btnBg: 'bg-amber-500',
      btnHoverBg: 'hover:bg-amber-400',
      btnText: 'text-slate-950',
      selectionBg: 'selection:bg-amber-500 selection:text-black',
      focusRing: 'focus:border-amber-500 focus:ring-1 focus:ring-amber-500',
      colorHex: '#f59e0b',
    };
  }

  // Default fallback to clean enterprise blue
  return {
    accentBg: 'bg-blue-600',
    accentHoverBg: 'hover:bg-blue-500',
    accentText: 'text-blue-600 dark:text-blue-400',
    accentBorder: 'border-blue-500/30',
    badgeBg: 'bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 text-white',
    lightBg: 'bg-blue-500/10',
    btnBg: 'bg-blue-600',
    btnHoverBg: 'hover:bg-blue-500',
    btnText: 'text-white',
    selectionBg: 'selection:bg-blue-500 selection:text-white',
    focusRing: 'focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
    colorHex: '#2563eb',
  };
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

// 11. Custom Blank Canvas & Skeleton Architecture
export const DEFAULT_CUSTOM_SKELETON_CONFIG: LandingPageConfig = {
  enabled: true,
  slug: 'custom',
  businessName: 'Welcome',
  industry: 'custom',
  themeColor: '#6366f1',
  tagline: 'Ask us anything, or book a time that suits you',
  badgeText: 'Welcome',
  heroHeadline: 'Welcome. How can we help?',
  heroSubheadline: 'Ask a question, book a time, or talk to our team. We are here to help.',
  heroCtaText: 'Book a time',
  heroImageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
  aboutTitle: 'About us',
  aboutText: 'Get in touch to learn more about what we do and how we can help.',
  address: '',
  phone: '',
  email: '',
  starterQuestions: [
    'What custom services and solutions do you offer?',
    'What are your pricing tiers and timelines?',
    'How do we schedule a discovery consultation?',
    'Where can I review project specifications?',
  ],
  workingHours: [
    { days: 'Monday – Friday', hours: '9:00 AM – 6:00 PM' },
    { days: 'Saturday', hours: '10:00 AM – 3:00 PM' },
    { days: 'Sunday', hours: 'Closed / By Appointment' },
  ],
  services: [
    {
      id: 'custom_srv_1',
      name: 'Custom Service Tier 1 (Placeholder)',
      description: 'Your primary service offering with comprehensive onboarding, project scoping, and dedicated client milestones.',
      durationMinutes: 45,
      price: 150,
      popular: true,
    },
    {
      id: 'custom_srv_2',
      name: 'Advanced Consultation & Strategy',
      description: 'In-depth consultation session analyzing your specific requirements with bespoke action blueprints.',
      durationMinutes: 60,
      price: 250,
    },
    {
      id: 'custom_srv_3',
      name: 'Turnkey Implementation Package',
      description: 'Turnkey execution tailored specifically to your organizational workflows and delivery milestones.',
      durationMinutes: 90,
      price: 499,
    },
  ],
  testimonials: [
    {
      id: 'custom_test_1',
      clientName: 'Alex Jordan',
      rating: 5,
      comment: 'The customized approach delivered exactly the bespoke results our organization needed on time.',
      clientRole: 'Operations Director',
    },
  ],
  socialLinks: {
    linkedin: 'https://linkedin.com',
    twitter: 'https://x.com',
  },
};

// 12. Crescelo AI Website Assistant
export const DEFAULT_CRESCELO_CONFIG: LandingPageConfig = {
  enabled: true,
  slug: 'crescelo',
  businessName: 'Crescelo',
  industry: 'crescelo',
  themeColor: '#c9f31d',
  tagline: 'Answer every visitor. Book the ones who are ready.',
  badgeText: 'Website assistant for service businesses',
  heroHeadline: 'Answer every visitor. Book the ones who are ready.',
  heroSubheadline: 'Crescelo builds a website assistant from your own content. It answers visitor questions, books appointments, captures leads, and hands over to your team when a person is needed.',
  heroCtaText: 'Book a consultation',
  heroImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  aboutTitle: 'About Crescelo',
  aboutText: 'Crescelo builds a website assistant from your own content. It answers visitor questions, books appointments, captures leads, and hands over to your team when a person is needed.',
  address: 'San Francisco, CA & Remote Worldwide',
  email: 'hello@crescelo.com',
  phone: '+1 (555) 019-2834',
  starterQuestions: [
    'What does Crescelo do?',
    'How does in-chat appointment booking work?',
    'Can I bring my own AI provider key?',
    'How does live human handover work?',
  ],
  workingHours: [
    { days: 'Monday – Friday', hours: '9:00 AM – 6:00 PM EST' },
    { days: 'Saturday', hours: '10:00 AM – 4:00 PM EST' },
    { days: 'Sunday', hours: '24/7 Automated AI Concierge' },
  ],
  services: [
    {
      id: 'cres_srv_1',
      name: 'Starter Assistant Setup',
      description: 'Single assistant grounded on your knowledge base, PDF/URL ingestion, web widget, and basic lead capture.',
      durationMinutes: 30,
      price: 49,
    },
    {
      id: 'cres_srv_2',
      name: 'Growth Booking & Messaging Suite',
      description: 'Full calendar booking engine, multi-channel (Web, WhatsApp, Telegram), automated email confirmations, and live team takeover.',
      durationMinutes: 45,
      price: 149,
      popular: true,
    },
    {
      id: 'cres_srv_3',
      name: 'Scale & Custom Enterprise Deployment',
      description: 'Unlimited documents, hybrid search with re-ranking, dedicated account manager, custom API integrations, and SLA guarantees.',
      durationMinutes: 60,
      price: 399,
    },
  ],
  testimonials: [
    {
      id: 'cres_test_1',
      clientName: 'Jordan K.',
      rating: 5,
      comment: 'The AI answered questions at 11pm that I used to handle myself. Woke up to two booked appointments.',
      clientRole: 'Barbershop Owner',
    },
    {
      id: 'cres_test_2',
      clientName: 'Priya M.',
      rating: 5,
      comment: 'Clients started booking without ever calling. The handover to my team is seamless — they see the whole chat history.',
      clientRole: 'Dental Clinic Manager',
    },
  ],
  socialLinks: {
    linkedin: 'https://linkedin.com/company/crescelo',
    twitter: 'https://x.com/crescelo',
  },
};

// 13. Universal Clean Business Template Default
export const DEFAULT_UNIVERSAL_LANDING_CONFIG: LandingPageConfig = {
  enabled: true,
  slug: 'universal-business',
  businessName: 'Apex Business Solutions',
  industry: 'universal',
  themeColor: '#2563eb',
  tagline: 'Modern Strategy, Execution & Client Growth',
  badgeText: 'Trusted by 500+ Organizations Worldwide',
  heroHeadline: 'Elevate Your Business With Next-Generation Services',
  heroSubheadline: 'We deliver tailored consulting, high-impact implementation, and 24/7 client care. Schedule your appointment or ask our AI concierge anything.',
  heroCtaText: 'Book An Appointment',
  secondaryHeroCtaText: 'Ask AI Concierge',
  heroImageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
  logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
  timezone: 'America/New_York',
  menuItems: [
    { label: 'Services', href: '#services' },
    { label: 'Features', href: '#features' },
    { label: 'About', href: '#about' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Contact', href: '#contact' },
  ],
  heroCarouselSlides: [
    {
      id: 'slide_1',
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80',
      badge: 'Award-Winning Business Advisory',
      headline: 'Elevate Your Business With Next-Generation Services',
      subheadline: 'We combine seasoned industry expertise with seamless digital convenience to accelerate your growth and customer success.',
      ctaText: 'Schedule Consultation',
      ctaLink: '#services',
    },
    {
      id: 'slide_2',
      imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80',
      badge: 'Transparent Delivery & Precision',
      headline: 'Dedicated Team. Proven Results. Zero Compromises.',
      subheadline: 'From tailored strategy audits to daily operational support, our dedicated specialists deliver excellence at every step.',
      ctaText: 'Explore Service Menu',
      ctaLink: '#services',
    },
    {
      id: 'slide_3',
      imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80',
      badge: '24/7 Verified Support & AI Concierge',
      headline: 'Instant Answers & Frictionless Online Booking',
      subheadline: 'Never wait on hold again. Our verified AI assistant answers your questions in real time and syncs appointments directly into your calendar.',
      ctaText: 'Book A Meeting Slot',
      ctaLink: '#services',
    },
  ],
  stats: [
    { id: 'stat_1', value: '99.8%', label: 'Client Satisfaction' },
    { id: 'stat_2', value: '15,000+', label: 'Appointments Booked' },
    { id: 'stat_3', value: '< 60s', label: 'Average Response Time' },
    { id: 'stat_4', value: '24/7', label: 'Knowledge Concierge' },
  ],
  servicesTitle: 'Our Professional Services',
  servicesSubtitle: 'Select a service below to schedule an appointment directly into our verified team calendar.',
  services: [
    {
      id: 'univ_srv_1',
      name: 'Initial Strategic Discovery',
      description: 'A 30-minute deep dive to understand your current challenges, audit requirements, and define an actionable roadmap.',
      durationMinutes: 30,
      price: 0,
      imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80',
      popular: true,
    },
    {
      id: 'univ_srv_2',
      name: 'Comprehensive Advisory & Audit',
      description: 'Full-spectrum review of operations, gap analysis, and tailored recommendations with an executive summary deliverable.',
      durationMinutes: 60,
      price: 150,
      imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80',
      popular: false,
    },
    {
      id: 'univ_srv_3',
      name: 'Dedicated Implementation Sprint',
      description: 'Hands-on guided execution session with our senior specialists to implement solutions and configure systems.',
      durationMinutes: 90,
      price: 295,
      imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80',
      popular: false,
    },
    {
      id: 'univ_srv_4',
      name: 'Quarterly Executive Review',
      description: 'Ongoing performance review, KPI tracking, and strategic refinement for existing clients and long-term partners.',
      durationMinutes: 45,
      price: 120,
      imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
      popular: false,
    },
  ],
  featuresTitle: 'Why Organizations Choose Us',
  featuresSubtitle: 'Built on the principles of speed, uncompromising craft, and client-first communication.',
  features: [
    {
      title: 'Real-Time Calendar Booking',
      description: 'Lock in appointments instantly with timezone intelligence, automated calendar invitations, and zero double-booking.',
      icon: 'Calendar',
      badge: 'Frictionless',
    },
    {
      title: 'Knowledge-Grounded AI Concierge',
      description: 'Our automated assistant is trained on verified company documentation to give accurate, reliable answers at any hour.',
      icon: 'Bot',
      badge: '24/7 Available',
    },
    {
      title: 'Transparent Flat-Rate Pricing',
      description: 'No hidden surcharges, surprise retainers, or fine print. You always know exactly what you are paying for upfront.',
      icon: 'ShieldCheck',
      badge: 'Honest Terms',
    },
    {
      title: 'Enterprise Data Security',
      description: 'Strict confidentiality protocols and privacy controls keep your business data and consultation notes safe.',
      icon: 'Lock',
      badge: 'Certified',
    },
  ],
  aboutTitle: 'About Our Mission & Values',
  aboutSubtitle: 'A relentless commitment to client growth and operational excellence.',
  aboutText: 'Founded with a clear conviction that businesses deserve clear, honest, and prompt service, we bring together senior industry practitioners to solve critical business problems. Whether you need immediate consultation or a trusted long-term advisory partner, we bring the rigor, modern tools, and accountability needed to deliver outcomes that speak for themselves.',
  aboutImageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80',
  showPricing: true,
  pricingTitle: 'Simple, Flexible Pricing Plans',
  pricingSubtitle: 'Choose the level of engagement that fits your business stage. Upgrade, downgrade, or cancel anytime.',
  pricingPlans: [
    {
      id: 'plan_starter',
      name: 'Essential Consultation',
      price: 99,
      period: '/ session',
      description: 'Perfect for small businesses or individuals needing focused advisory on specific challenges.',
      features: [
        'Single 45-minute advisory appointment',
        'Written diagnostic report & next steps',
        'Email follow-up support for 7 days',
        'Access to standard resource library',
      ],
      popular: false,
      ctaText: 'Book Essential',
    },
    {
      id: 'plan_growth',
      name: 'Growth Partnership',
      price: 299,
      period: '/ month',
      description: 'Our most popular tier for growing companies requiring regular strategic advisory and execution guidance.',
      features: [
        'Up to 4 appointments per month',
        'Dedicated senior advisor assignment',
        'Priority booking calendar slots',
        'Direct 24/7 AI knowledgebase concierge',
        'Slack / WhatsApp private channel',
      ],
      popular: true,
      ctaText: 'Start Growth Tier',
    },
    {
      id: 'plan_enterprise',
      name: 'Enterprise Advisory',
      price: 799,
      period: '/ month',
      description: 'Comprehensive, high-touch support designed for established organizations and scaling teams.',
      features: [
        'Unlimited strategic check-ins',
        'Executive committee quarterly presentations',
        'Custom workflow implementation sprint',
        'Guaranteed 1-hour response SLA',
        'Custom NDAs & master service agreements',
      ],
      popular: false,
      ctaText: 'Contact Enterprise',
    },
  ],
  testimonialsTitle: 'Trusted by Industry Leaders',
  testimonialsSubtitle: 'See what our clients have to say about working with our team.',
  testimonials: [
    {
      id: 'univ_test_1',
      clientName: 'Sarah Jenkins',
      clientRole: 'Managing Director, Horizon Retail',
      rating: 5,
      comment: 'Booking a consultation was effortless, and the team provided practical, game-changing recommendations within our first 45 minutes.',
    },
    {
      id: 'univ_test_2',
      clientName: 'Marcus Vance',
      clientRole: 'Founder, Vance Logistics',
      rating: 5,
      comment: 'Their AI concierge answered all my late-night questions accurately, and the meeting calendar integration prevented any back-and-forth emails.',
    },
    {
      id: 'univ_test_3',
      clientName: 'Elena Rostova',
      clientRole: 'Operations Lead, Apex Health',
      rating: 5,
      comment: 'The level of professionalism and prompt communication is unmatched. The pricing is 100% transparent and the results exceeded our expectations.',
    },
  ],
  faqsTitle: 'Frequently Asked Questions',
  faqsSubtitle: 'Everything you need to know about our services, booking process, and policies.',
  faqs: [
    {
      id: 'faq_1',
      question: 'How do appointment bookings work?',
      answer: 'Simply choose a service from our menu, select an available date and time slot that fits your schedule, and provide your contact information. You will receive an instant calendar invite and email confirmation.',
    },
    {
      id: 'faq_2',
      question: 'Can I reschedule or cancel my appointment?',
      answer: 'Yes! Every confirmation email includes a direct management link allowing you to reschedule or cancel your appointment anytime up to 2 hours prior to the scheduled time.',
    },
    {
      id: 'faq_3',
      question: 'What timezone are the appointments booked in?',
      answer: 'Appointments are scheduled in our official business timezone, and our scheduler automatically indicates the corresponding time so you never miss an appointment.',
    },
    {
      id: 'faq_4',
      question: 'How does the AI Concierge work?',
      answer: 'Our AI Concierge is directly linked to our verified company knowledgebase. It can answer questions about our service catalog, pricing, policies, and availability 24 hours a day, 7 days a week.',
    },
    {
      id: 'faq_5',
      question: 'Do you offer custom engagements not listed in the pricing table?',
      answer: 'Yes. If your organization has unique requirements or needs custom service agreements, please book an Initial Discovery call or message our team.',
    },
  ],
  address: '100 Innovation Way, Suite 400, New York, NY 10001',
  phone: '+1 (555) 234-5678',
  email: 'contact@apexsolutions.com',
  workingHours: [
    { days: 'Monday – Friday', hours: '8:30 AM – 6:30 PM EST' },
    { days: 'Saturday', hours: '10:00 AM – 3:00 PM EST' },
    { days: 'Sunday', hours: 'Closed (AI Concierge Active)' },
  ],
  socialLinks: {
    linkedin: 'https://linkedin.com',
    twitter: 'https://x.com',
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
  },
  ctaHeadline: 'Ready to Transform Your Business?',
  ctaSubheadline: 'Schedule your appointment today or start an instant chat with our AI concierge.',
  ctaButtonText: 'Book Your Service Now',
  footerText: 'All rights reserved. Dedicated to delivering high-impact business solutions with speed, clarity, and precision.',
};

// 14. General Business / AI Assistant Default
export const DEFAULT_BUSINESS_LANDING_CONFIG: LandingPageConfig = {
  enabled: false,
  slug: 'general',
  businessName: 'AI Business Concierge',
  industry: 'general',
  themeColor: '#2563eb',
  tagline: 'Professional AI Assistant & Customer Support',
  badgeText: 'Verified Business Concierge',
  heroHeadline: 'Welcome to Our Online Concierge',
  heroSubheadline: 'Get instant answers to your questions, explore our offerings, and connect with our team.',
  heroCtaText: 'Contact Our Team',
  aboutTitle: 'About Us',
  aboutText: 'We provide dedicated support and services to help our clients succeed.',
  address: 'Available Worldwide',
  email: 'contact@business.com',
  starterQuestions: [
    'What services do you offer?',
    'How can I get in touch with your team?',
    'What are your operating hours?',
  ],
  workingHours: [
    { days: 'Monday – Friday', hours: '9:00 AM – 6:00 PM' },
  ],
  services: [],
};

// Preset mapping dictionary
export const TEMPLATE_LANDING_CONFIGS: Record<string, LandingPageConfig> = {
  // Universal Clean Business Template
  'universal': DEFAULT_UNIVERSAL_LANDING_CONFIG,
  'universal-business': DEFAULT_UNIVERSAL_LANDING_CONFIG,
  'clean-universal': DEFAULT_UNIVERSAL_LANDING_CONFIG,
  'template_universal': DEFAULT_UNIVERSAL_LANDING_CONFIG,
  // General / Default
  'general': DEFAULT_BUSINESS_LANDING_CONFIG,
  'default': DEFAULT_BUSINESS_LANDING_CONFIG,
  // Crescelo AI Website Assistant
  'crescelo': DEFAULT_CRESCELO_CONFIG,
  'crescelo-template': DEFAULT_CRESCELO_CONFIG,
  'template_crescelo': DEFAULT_CRESCELO_CONFIG,
  'website_assistant': DEFAULT_CRESCELO_CONFIG,
  'ai_assistant_saas': DEFAULT_CRESCELO_CONFIG,
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
  'real_estate': DEFAULT_REAL_ESTATE_LANDING_CONFIG,
  // E-Commerce
  'ecommerce-store': DEFAULT_ECOMMERCE_LANDING_CONFIG,
  'template_ecommerce': DEFAULT_ECOMMERCE_LANDING_CONFIG,
  'ecommerce': DEFAULT_ECOMMERCE_LANDING_CONFIG,
  // SaaS
  'b2b-saas': DEFAULT_SAAS_LANDING_CONFIG,
  'saas-landing': DEFAULT_SAAS_LANDING_CONFIG,
  'template_saas': DEFAULT_SAAS_LANDING_CONFIG,
  'saas': DEFAULT_SAAS_LANDING_CONFIG,
  // Legal
  'legal-law-firm': DEFAULT_LEGAL_LANDING_CONFIG,
  'legal-firm': DEFAULT_LEGAL_LANDING_CONFIG,
  'law-firm': DEFAULT_LEGAL_LANDING_CONFIG,
  'template_legal': DEFAULT_LEGAL_LANDING_CONFIG,
  'legal': DEFAULT_LEGAL_LANDING_CONFIG,
  // Healthcare
  'dental-clinic': DEFAULT_HEALTHCARE_LANDING_CONFIG,
  'clinic': DEFAULT_HEALTHCARE_LANDING_CONFIG,
  'template_healthcare': DEFAULT_HEALTHCARE_LANDING_CONFIG,
  'healthcare': DEFAULT_HEALTHCARE_LANDING_CONFIG,
  // Premium Webflow & Framer Caliber Pages
  'nexus-ai': DEFAULT_NEXUS_AI_CONFIG,
  'template_nexus_ai': DEFAULT_NEXUS_AI_CONFIG,
  'nexus_ai': DEFAULT_NEXUS_AI_CONFIG,
  'ai_tech': DEFAULT_NEXUS_AI_CONFIG,
  'hyperion-agency': DEFAULT_HYPERION_AGENCY_CONFIG,
  'agency': DEFAULT_HYPERION_AGENCY_CONFIG,
  'template_hyperion_agency': DEFAULT_HYPERION_AGENCY_CONFIG,
  'creative_agency': DEFAULT_HYPERION_AGENCY_CONFIG,
  'design_agency': DEFAULT_HYPERION_AGENCY_CONFIG,
  'aether-finance': DEFAULT_AETHER_FINANCE_CONFIG,
  'template_aether_finance': DEFAULT_AETHER_FINANCE_CONFIG,
  'fintech': DEFAULT_AETHER_FINANCE_CONFIG,
  'finance': DEFAULT_AETHER_FINANCE_CONFIG,
  // Custom Blank Canvas / Skeleton
  'custom': DEFAULT_CUSTOM_SKELETON_CONFIG,
  'custom-template': DEFAULT_CUSTOM_SKELETON_CONFIG,
  'template_custom': DEFAULT_CUSTOM_SKELETON_CONFIG,
  'skeleton': DEFAULT_CUSTOM_SKELETON_CONFIG,
};

export function getLandingConfigForSlugOrTemplate(slugOrId: string): LandingPageConfig {
  const normalized = (slugOrId || '').toLowerCase().trim();
  return TEMPLATE_LANDING_CONFIGS[normalized] || DEFAULT_BUSINESS_LANDING_CONFIG;
}


