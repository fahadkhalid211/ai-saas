import type { LucideIcon } from 'lucide-react';
import {
  Bot,
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
          { label: 'AI website assistant', description: 'Answers visitors from your own content', href: '/product', icon: Bot, tone: 'lime' },
          { label: 'Appointment booking', description: 'Live slots that cannot be double-booked', href: '/support/calendar-booking', icon: CalendarCheck, tone: 'mint' },
          { label: 'Lead capture', description: 'Send leads to email, Slack, Sheets or webhooks', href: '/integrations', icon: UserPlus, tone: 'lav' },
          { label: 'Knowledge base', description: 'Upload documents and pages it learns from', href: '/support/rag-knowledge', icon: BookOpen, tone: 'amber' },
        ],
      },
      {
        title: 'Where it works',
        links: [
          { label: 'Website chat widget', description: 'One script tag on any site', href: '/guides/add-ai-assistant-to-wordpress', icon: Globe, tone: 'lime' },
          { label: 'Phone voice agent', description: 'Answer calls with the same knowledge', href: '/support/voice-agent', icon: Phone, tone: 'pink' },
          { label: 'WhatsApp and Telegram', description: 'Reply on the apps customers already use', href: '/integrations', icon: MessageCircle, tone: 'mint' },
          { label: 'Human handover', description: 'Take over any conversation in one click', href: '/product', icon: HandHelping, tone: 'coral' },
        ],
      },
    ],
    feature: {
      eyebrow: '14-day free trial',
      title: 'See it answer your visitors',
      body: 'Add your services and prices, then watch the assistant book a real appointment. Every Growth feature for 14 days.',
      cta: { label: 'Start your free trial', href: '/login?mode=register' },
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
        title: 'By industry',
        links: [
          { label: 'Salons and barbershops', description: 'Fill chairs while your hands are busy', href: '/use-case#salons', icon: Scissors, tone: 'lime' },
          { label: 'Clinics and dental', description: 'Handle intake and appointment questions', href: '/use-case#clinics', icon: Stethoscope, tone: 'mint' },
          { label: 'Real estate', description: 'Qualify buyers and book viewings', href: '/use-case#real-estate', icon: Building2, tone: 'lav' },
        ],
      },
      {
        title: 'More industries',
        links: [
          { label: 'Fitness studios', description: 'Trial classes, memberships and schedules', href: '/use-case#fitness', icon: Dumbbell, tone: 'amber' },
          { label: 'Law and professional practices', description: 'Screen enquiries and book consultations', href: '/use-case#legal', icon: Scale, tone: 'pink' },
          { label: 'SaaS and startups', description: 'Answer product questions and onboard trials', href: '/use-case#saas', icon: Briefcase, tone: 'coral' },
        ],
      },
    ],
    feature: {
      eyebrow: 'Built for service businesses',
      title: 'Find the setup for your industry',
      body: 'See a sample conversation, the questions it handles and how bookings land in your calendar.',
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
          { label: 'Add it to WordPress', description: 'Install the assistant step by step', href: '/guides/add-ai-assistant-to-wordpress', icon: Plug, tone: 'lav' },
          { label: 'Roadmap', description: 'What is live and what is next', href: '/roadmap', icon: Map, tone: 'amber' },
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
      eyebrow: 'Need a hand?',
      title: 'Open a support ticket',
      body: 'Tell us what you need. Every request gets a ticket you can follow, and we answer by email.',
      cta: { label: 'Contact support', href: '/support/contact' },
      secondary: { label: 'Read the guides', href: '/blog' },
    },
    footerLinks: [
      { label: 'Calendar booking guide', href: '/support/calendar-booking' },
      { label: 'Voice agent guide', href: '/support/voice-agent' },
    ],
  },
];

/** Links that sit in the bar without a dropdown. */
export const MEGA_DIRECT_LINKS: { label: string; href: string }[] = [
  { label: 'Integrations', href: '/integrations' },
  { label: 'Pricing', href: '/pricing' },
];
