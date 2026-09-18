/**
 * Automated Universal Synonym and Corpus Expansion Engine
 * Provides synonym clustering, morphological normalization,
 * and automated query expansion across business domains.
 */

export const UNIVERSAL_SYNONYM_CLUSTERS: string[][] = [
  // Artificial Intelligence, Tech, Platforms, Tools and Software
  [
    'ai', 'a.i.', 'artificial intelligence', 'machine learning', 'ml', 'deep learning',
    'tech', 'technology', 'technologies', 'platform', 'platforms', 'tool', 'tools',
    'software', 'app', 'apps', 'application', 'applications', 'system', 'systems',
    'solution', 'solutions', 'company', 'companies', 'firm', 'firms', 'provider',
    'providers', 'vendor', 'vendors', 'service', 'services', 'saas', 'model', 'models',
    'agent', 'agents', 'bot', 'bots'
  ],

  // Evaluation, Rankings and Superlatives
  [
    'best', 'top', 'great', 'leading', 'recommended', 'popular', 'preferred',
    'premier', 'primary', 'key', 'main', 'finest', 'choice', 'reviews', 'overview',
    'list', 'options'
  ],

  // Financial, Pricing and Budgets
  [
    'budget', 'budgets', 'cost', 'costs', 'pricing', 'price', 'prices', 'fee',
    'fees', 'rate', 'rates', 'charge', 'charges', 'quote', 'quotes', 'financial',
    'allocation', 'fund', 'funds', 'package', 'packages', 'tier', 'tiers', 'plan',
    'plans', 'subscription', 'subscriptions', 'expense', 'expenses', '$', 'usd', 'eur', 'gbp'
  ],

  // Services, Offerings and Capabilities
  [
    'service', 'services', 'offering', 'offerings', 'feature', 'features',
    'capability', 'capabilities', 'function', 'functions', 'menu', 'catalog',
    'treatment', 'treatments', 'option', 'options', 'product', 'products'
  ],

  // Scheduling, Bookings and Consultations
  [
    'appointment', 'appointments', 'booking', 'bookings', 'reserve', 'reservation',
    'reservations', 'schedule', 'scheduling', 'slot', 'slots', 'book', 'session',
    'sessions', 'consultation', 'consultations', 'meeting', 'meetings'
  ],

  // Operating Hours and Availability
  [
    'hour', 'hours', 'timing', 'timings', 'schedule', 'open', 'opening',
    'close', 'closing', 'time', 'times', 'days', 'availability', 'operating'
  ],

  // Contact, Location and Support
  [
    'location', 'address', 'directions', 'where', 'place', 'street', 'city',
    'office', 'facility', 'headquarters', 'site'
  ],
  [
    'contact', 'contacts', 'phone', 'telephone', 'mobile', 'email', 'call',
    'reach', 'message', 'support', 'help', 'assistance', 'inquiry', 'inquiries'
  ],

  // E-Commerce, Retail and Orders
  [
    'product', 'products', 'item', 'items', 'order', 'orders', 'shipping',
    'delivery', 'return', 'returns', 'refund', 'refunds', 'cart', 'checkout',
    'inventory', 'stock', 'merchandise'
  ],

  // Healthcare, Medical and Dental
  [
    'doctor', 'physician', 'practitioner', 'specialist', 'dentist', 'clinic',
    'hospital', 'care'
  ],
  [
    'dental', 'dentist', 'teeth', 'tooth', 'cleaning', 'whitening', 'cavity',
    'filling', 'crown', 'implant', 'braces', 'extraction'
  ],
  [
    'health', 'medical', 'therapy', 'patient', 'patients', 'diagnosis',
    'treatment', 'treatments', 'prescription', 'checkup', 'exam', 'examination'
  ],

  // Legal and Professional Services
  [
    'legal', 'lawyer', 'lawyers', 'attorney', 'attorneys', 'counsel',
    'litigation', 'lawsuit', 'advocate', 'counselor'
  ],
  [
    'contract', 'contracts', 'agreement', 'agreements', 'clause', 'clauses',
    'settlement', 'dispute', 'compliance', 'case', 'retainer'
  ],

  // Real Estate and Property
  [
    'property', 'properties', 'listing', 'listings', 'home', 'homes', 'house',
    'houses', 'apartment', 'apartments', 'condo', 'realtor', 'broker',
    'lease', 'rent', 'rental', 'mortgage'
  ],

  // Barbershop and Personal Grooming
  [
    'haircut', 'haircuts', 'cut', 'cuts', 'hair', 'trim', 'fade', 'beard',
    'shave', 'styling', 'barber', 'barbershop', 'salon', 'grooming'
  ],

  // Fitness and Wellness
  [
    'gym', 'fitness', 'workout', 'exercise', 'training', 'trainer',
    'coach', 'membership', 'cardio', 'weight', 'weights', 'class', 'classes'
  ]
];

export function tokenizeText(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((t) => t.length >= 2);
}

function phraseMatchesCluster(phrase: string, tokens: string[], cluster: string[]): boolean {
  const phraseLower = phrase.toLowerCase().trim();
  if (cluster.some((c) => c === phraseLower || phraseLower.includes(c) || c.includes(phraseLower))) {
    return true;
  }
  return tokens.some((t) =>
    cluster.some((c) => c === t || c.split(/\s+/).includes(t))
  );
}

export function areTermsSynonymous(termA: string, termB: string): boolean {
  const cleanA = termA.trim().toLowerCase();
  const cleanB = termB.trim().toLowerCase();
  if (cleanA === cleanB) return true;

  const tokensA = tokenizeText(cleanA);
  const tokensB = tokenizeText(cleanB);
  if (tokensA.length === 0 || tokensB.length === 0) return false;

  const setB = new Set(tokensB);
  const hasDirectOverlap = tokensA.some((t) => setB.has(t));
  if (hasDirectOverlap) return true;

  for (const cluster of UNIVERSAL_SYNONYM_CLUSTERS) {
    const matchA = phraseMatchesCluster(cleanA, tokensA, cluster);
    const matchB = phraseMatchesCluster(cleanB, tokensB, cluster);
    if (matchA && matchB) {
      return true;
    }
  }

  return false;
}

export function expandQueryWithSynonyms(
  query: string,
  sourceTitles: string[] = []
): {
  originalQuery: string;
  expandedQuery: string;
  synonymKeywords: string[];
} {
  const cleanQuery = query.trim();
  const queryTokens = tokenizeText(cleanQuery);
  const titleSynonyms = new Set<string>();
  const clusterSynonyms = new Set<string>();

  // 1. Cross-reference with assistant knowledge source titles with highest priority
  for (const title of sourceTitles) {
    const titleTokens = tokenizeText(title);
    if (titleTokens.length === 0) continue;

    let conceptMatch = false;
    for (const qToken of queryTokens) {
      for (const tToken of titleTokens) {
        if (areTermsSynonymous(qToken, tToken)) {
          conceptMatch = true;
          break;
        }
      }
      if (conceptMatch) break;
    }

    if (conceptMatch) {
      titleSynonyms.add(title.toLowerCase());
      for (const tToken of titleTokens) {
        if (!queryTokens.includes(tToken)) {
          titleSynonyms.add(tToken);
        }
      }
    }
  }

  // 2. Add relevant universal cluster terms
  for (const cluster of UNIVERSAL_SYNONYM_CLUSTERS) {
    const matchingQueryTokens = queryTokens.filter((t) =>
      cluster.some((c) => c === t || c.split(/\s+/).includes(t))
    );
    if (matchingQueryTokens.length > 0) {
      for (const syn of cluster.slice(0, 5)) {
        if (!queryTokens.includes(syn) && !titleSynonyms.has(syn)) {
          clusterSynonyms.add(syn);
        }
      }
    }
  }

  const combinedSynonyms = [
    ...Array.from(titleSynonyms),
    ...Array.from(clusterSynonyms),
  ];

  const synonymKeywords = combinedSynonyms.slice(0, 10);

  if (synonymKeywords.length === 0) {
    return {
      originalQuery: cleanQuery,
      expandedQuery: cleanQuery,
      synonymKeywords: [],
    };
  }

  const expandedQuery = `${cleanQuery} (${synonymKeywords.join(', ')})`;

  return {
    originalQuery: cleanQuery,
    expandedQuery,
    synonymKeywords,
  };
}
