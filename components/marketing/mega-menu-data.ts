import type { LucideIcon } from 'lucide-react';
import {
  Bot,
  Calculator,
  CalendarCheck,
  UserPlus,
  BookOpen,
  Headphones,
  Phone,
  Globe,
  MessageCircle,
  Scissors,
  Stethoscope,
  Building2,
  Dumbbell,
  Scale,
  Briefcase,
  Newspaper,
  LifeBuoy,
  Map,
  KeyRound,
  Cpu,
  Sparkles,
  HandHelping,
  Plug,
  Zap,
  Play,
  ShoppingBag,
  Wrench,
  Utensils,
  Smartphone,
} from 'lucide-react';

/**
 * The header's mega menus. Every link goes to a page that exists (the link checker in scripts/check-links.mjs covers this file's
 * paths through the pages that reference them); descriptions are one short line so the panels stay scannable.
 */

export type Tone = 'lime' | 'lav' | 'mint' | 'pink' | 'amber' | 'coral';

export interface MegaLink {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  tone: Tone;
  badge?: string;
}

export interface MegaColumn {
  title: string;
  links: MegaLink[];
}

export interface MegaFeature {
  /** A two-line sample chat shown at the top of the card. */
  preview?: { visitor: string; assistant: string };
  eyebrow: string;
  title: string;
  body: string;
  cta: { label: string; href: string };
  secondary?: { label: string; href: string };
}

export interface MegaMenu {
  id: 'product' | 'solutions' | 'resources';
  label: string;
  columns: MegaColumn[];
  feature: MegaFeature;
  /** Small text links under the columns. */
  footerLinks?: { label: string; href: string }[];
}

export const MEGA_MENUS: MegaMenu[] = [
  {
    id: 'product',
    label: 'Product',
    columns: [
      {
        title: 'The assistant',
        links: [
          { label: 'AI website assistant', description: 'Answers visitors from your own content', href: '/product/ai-assistant', icon: Bot, tone: 'lime' },
          { label: 'Appointment booking', description: 'Live slots checked against your bookings and calendars', href: '/product/appointment-booking', icon: CalendarCheck, tone: 'mint' },
          { label: 'Lead capture', description: 'Send leads to email, Slack, Sheets or webhooks', href: '/product/lead-capture', icon: UserPlus, tone: 'lav' },
          { label: 'Knowledge base', description: 'Upload documents and pages it learns from', href: '/product/knowledge-base', icon: BookOpen, tone: 'amber' },
          { label: 'Try the playground', description: 'Upload your docs and quiz the assistant', href: '/playground', icon: Play, tone: 'pink', badge: 'Try' },
        ],
      },
      {
        title: 'Where it works',
        links: [
          { label: 'Website chat widget', description: 'One script tag on any site', href: '/product/website-widget', icon: Globe, tone: 'lime' },
          { label: 'Mobile apps (iOS & Android)', description: 'Embed in native iOS and Android apps', href: '/product/mobile-apps', icon: Smartphone, tone: 'lav' },
          { label: 'Phone voice agent', description: 'Answering calls is under development', href: '/roadmap', icon: Phone, tone: 'pink', badge: 'Soon' },
          { label: 'WhatsApp and Telegram', description: 'Reply on the apps customers already use', href: '/product/messaging-channels', icon: MessageCircle, tone: 'mint' },
          { label: 'Human handover', description: 'Take over any conversation in one click', href: '/product/human-handover', icon: HandHelping, tone: 'coral' },
        ],
      },
    ],
    feature: {
      preview: { visitor: 'Any openings tomorrow afternoon?', assistant: 'Yes, 3:15 PM is free. Booked for you.' },
      eyebrow: '14-day free trial',
      title: 'See it answer your visitors',
      body: 'Add your prices and services, then watch it book a real appointment.',
      cta: { label: 'Start free trial', href: '/login?mode=register' },
      secondary: { label: 'View pricing', href: '/pricing' },
    },
    footerLinks: [
      { label: 'Compare plans', href: '/pricing' },
      { label: 'Roadmap and feature status', href: '/roadmap' },
    ],
  },
  {
    id: 'solutions',
    label: 'Solutions',
    columns: [
      {
        title: 'Care & Appointments',
        links: [
          { label: 'Salons & Barbershops', description: 'Fill chairs while hands are busy', href: '/use-case#salons', icon: Scissors, tone: 'lime' },
          { label: 'Clinics & Dental', description: 'Handle patient intake and triage', href: '/use-case#clinics', icon: Stethoscope, tone: 'mint' },
          { label: 'Fitness & Gyms', description: 'Trial classes, passes & coach slots', href: '/use-case#fitness', icon: Dumbbell, tone: 'lav' },
        ],
      },
      {
        title: 'Commerce & Property',
        links: [
          { label: 'E-Commerce & Retail', description: 'Product advice & pre-purchase cart', href: '/use-case#ecommerce', icon: ShoppingBag, tone: 'pink' },
          { label: 'Real Estate & Property', description: 'Qualify buyers and book showings', href: '/use-case#real-estate', icon: Building2, tone: 'amber' },
          { label: 'Contractors & Trades', description: 'Emergency repairs & job estimates', href: '/use-case#trades', icon: Wrench, tone: 'coral' },
        ],
      },
      {
        title: 'Advisory, Dining & Tech',
        links: [
          { label: 'Legal & Advisory', description: 'Screen retainers & paid consults', href: '/use-case#legal', icon: Scale, tone: 'lav' },
          { label: 'Restaurants & Dining', description: 'Table reservations & allergen menus', href: '/use-case#restaurants', icon: Utensils, tone: 'mint' },
          { label: 'SaaS & Tech Startups', description: 'Answer API docs and book demos', href: '/use-case#saas', icon: Briefcase, tone: 'lime' },
        ],
      },
    ],
    feature: {
      preview: { visitor: 'Do you take walk-ins on Saturday?', assistant: 'Yes, from 10 to 4. Want a reserved slot instead?' },
      eyebrow: 'Built for service businesses',
      title: 'Find the setup for your industry',
      body: 'See a sample chat and how bookings reach your calendar.',
      cta: { label: 'Explore solutions', href: '/use-case' },
      secondary: { label: 'Talk to us', href: '/support/contact' },
    },
    footerLinks: [
      { label: 'Integrations', href: '/integrations' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  {
    id: 'resources',
    label: 'Resources',
    columns: [
      {
        title: 'Learn',
        links: [
          { label: 'Knowledge Hub', description: 'Guides on AI assistants and booking', href: '/blog', icon: Newspaper, tone: 'lime' },
          { label: 'Help center', description: 'Setup guides and documentation', href: '/support', icon: LifeBuoy, tone: 'mint' },
          { label: 'Integrations', description: 'Connect calendars, CRM and channels', href: '/integrations', icon: Plug, tone: 'lav' },
          { label: 'Add it to WordPress', description: 'Install the assistant step by step', href: '/guides/add-ai-assistant-to-wordpress', icon: Globe, tone: 'mint' },
          { label: 'Roadmap', description: 'What is live and what is next', href: '/roadmap', icon: Map, tone: 'amber' },
          { label: 'LLM cost calculator', description: 'What a chatbot costs per conversation', href: '/tools/llm-cost-calculator', icon: Calculator, tone: 'pink', badge: 'Free' },
        ],
      },
      {
        title: 'Connect your AI provider',
        links: [
          { label: 'OpenAI', description: 'Use your own API key', href: '/support/ai-connectors/openai', icon: Sparkles, tone: 'mint' },
          { label: 'Anthropic Claude', description: 'Connect Claude models', href: '/support/ai-connectors/anthropic', icon: KeyRound, tone: 'pink' },
          { label: 'Google Gemini', description: 'Fast, low-cost answers', href: '/support/ai-connectors/gemini', icon: Zap, tone: 'lime' },
          { label: 'Groq, DeepSeek and Ollama', description: 'Cloud or fully local models', href: '/support/ai-connectors', icon: Cpu, tone: 'lav', badge: 'BYOK' },
        ],
      },
    ],
    feature: {
      preview: { visitor: 'How do I connect my own OpenAI key?', assistant: 'Settings, AI, paste the key. Guide below.' },
      eyebrow: 'Need a hand?',
      title: 'Open a support ticket',
      body: 'Every request gets a ticket you can follow. We reply by email.',
      cta: { label: 'Contact support', href: '/support/contact' },
      secondary: { label: 'Read the guides', href: '/blog' },
    },
    footerLinks: [
      { label: 'Calendar booking guide', href: '/support/calendar-booking' },
    ],
  },
];

/** Links that sit in the bar without a dropdown. */
export const MEGA_DIRECT_LINKS: { label: string; href: string }[] = [
  { label: 'Pricing', href: '/pricing' },
];
