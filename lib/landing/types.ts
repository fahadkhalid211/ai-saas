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

export interface LandingPageConfig {
  enabled: boolean;
  slug: string;
  businessName: string;
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
  workingHours?: LandingPageWorkingHours[];
  services?: LandingPageServiceItem[];
  galleryImages?: LandingPageGalleryItem[];
  testimonials?: LandingPageTestimonialItem[];
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    tiktok?: string;
  };
}

export const DEFAULT_BARBER_LANDING_CONFIG: LandingPageConfig = {
  enabled: true,
  slug: 'classic-barbershop',
  businessName: 'Crown & Blade Barbershop',
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
