'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Calendar,
  Users,
  FileText,
  Globe,
  Shield,
  Zap,
  Check,
  ArrowRight,
  ChevronDown,
  Star,
  BookOpen,
  Search,
  Bell,
  Lock,
  BarChart3,
  Phone,
  Mail,
  Smartphone,
  RefreshCw,
} from 'lucide-react';
import { IndustryTemplateProps } from '../types';

// ── Mascot SVG (Crescelo's green face icon) ──────────────────────────────────
function CresceloMascot({ size = 72 }: { size?: number }) {
  return (
    <svg viewBox="0 0 72 72" width={size} height={size} aria-hidden="true">
      <path
        d="M36 4c17 0 30 12 30 30 0 16-9 30-30 34C15 64 6 50 6 34 6 16 19 4 36 4Z"
        fill="#c9f31d"
        stroke="#0f172a"
        strokeWidth="3"
      />
      <circle cx="26" cy="32" r="9" fill="#fff" stroke="#0f172a" strokeWidth="2.5" />
      <circle cx="47" cy="32" r="9" fill="#fff" stroke="#0f172a" strokeWidth="2.5" />
      <circle cx="26" cy="33" r="3.8" fill="#0f172a" />
      <circle cx="47" cy="33" r="3.8" fill="#0f172a" />
      <path d="M27 50c5 5 13 5 18 0" fill="none" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// ── Logo Mark ─────────────────────────────────────────────────────────────────
function LogoMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" aria-hidden="true">
      <rect x="1" y="1" width="20" height="20" rx="6" fill="#0f172a" />
      <path d="M14.6 7.4A5 5 0 1 0 14.6 14.6" stroke="#c9f31d" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// ── Typing animation for hero demo ───────────────────────────────────────────
const DEMO_CONVERSATIONS = [
  {
    q: 'How much is a standard cut?',
    a: 'A standard precision haircut is $40 and takes about 45 minutes. We also offer an Executive Package at $60 that includes a shave.',
  },
  {
    q: 'Are you open on Sundays?',
    a: "Yes! We're open Sunday 10 AM – 4 PM. Mondays we're closed for deep sanitization.",
  },
  {
    q: 'Can I book Saturday at 10?',
    a: "Saturday 10:00 AM is available. I've reserved it — can I grab your name and email to confirm?",
  },
];

function HeroDemo({ accentColor }: { accentColor: string }) {
  const [demoIdx, setDemoIdx] = useState(0);
  const [phase, setPhase] = useState<'typing-q' | 'showing-a' | 'pause'>('typing-q');
  const [displayQ, setDisplayQ] = useState('');
  const [displayA, setDisplayA] = useState('');
  const charRef = useRef(0);
  const aCharRef = useRef(0);

  const current = DEMO_CONVERSATIONS[demoIdx];

  useEffect(() => {
    charRef.current = 0;
    aCharRef.current = 0;
    setDisplayQ('');
    setDisplayA('');
    setPhase('typing-q');
  }, [demoIdx]);

  useEffect(() => {
    if (phase === 'typing-q') {
      if (charRef.current < current.q.length) {
        const t = setTimeout(() => {
          charRef.current += 1;
          setDisplayQ(current.q.slice(0, charRef.current));
        }, 38);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setPhase('showing-a'), 500);
        return () => clearTimeout(t);
      }
    }
    if (phase === 'showing-a') {
      if (aCharRef.current < current.a.length) {
        const t = setTimeout(() => {
          aCharRef.current += 1;
          setDisplayA(current.a.slice(0, aCharRef.current));
        }, 18);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setPhase('pause'), 2200);
        return () => clearTimeout(t);
      }
    }
    if (phase === 'pause') {
      const t = setTimeout(() => setDemoIdx((i) => (i + 1) % DEMO_CONVERSATIONS.length), 600);
      return () => clearTimeout(t);
    }
  }, [phase, displayQ, displayA, current]);

  return (
    <div className="relative mx-auto max-w-md">
      {/* Live badge header */}
      <div
        className="rounded-t-2xl px-4 py-2.5 flex items-center gap-2.5 text-xs font-medium"
        style={{ background: '#1e293b', color: '#94a3b8' }}
      >
        <span className="flex gap-0.5">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: accentColor, animationDelay: `${i * 150}ms` }}
            />
          ))}
        </span>
        <span>Live visitor conversation • {DEMO_CONVERSATIONS[demoIdx] && 'Apex Barbers'}</span>
      </div>

      {/* Chat body */}
      <div
        className="rounded-b-2xl p-5 min-h-[140px] flex flex-col gap-3"
        style={{ background: '#0f172a', border: '1px solid #1e293b', borderTop: 'none' }}
      >
        {displayQ && (
          <div className="self-end max-w-[75%]">
            <div
              className="rounded-2xl rounded-br-sm px-4 py-2.5 text-sm"
              style={{ background: '#334155', color: '#f1f5f9' }}
            >
              {displayQ}
              {phase === 'typing-q' && (
                <span className="inline-block w-0.5 h-3.5 ml-0.5 align-middle animate-pulse" style={{ background: accentColor }} />
              )}
            </div>
          </div>
        )}
        {displayA && (
          <div className="self-start max-w-[80%]">
            <div
              className="rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm"
              style={{ background: '#1e293b', color: '#e2e8f0' }}
            >
              {displayA}
              {phase === 'showing-a' && (
                <span className="inline-block w-0.5 h-3.5 ml-0.5 align-middle animate-pulse" style={{ background: accentColor }} />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Chip suggestions */}
      <div className="mt-3 flex flex-wrap gap-2">
        {DEMO_CONVERSATIONS.map((c, i) => (
          <button
            key={i}
            onClick={() => setDemoIdx(i)}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              background: i === demoIdx ? accentColor : '#1e293b',
              color: i === demoIdx ? '#0f172a' : '#94a3b8',
              border: `1px solid ${i === demoIdx ? accentColor : '#334155'}`,
            }}
          >
            {c.q}
          </button>
        ))}
      </div>
      <p className="mt-2 text-center text-xs" style={{ color: '#64748b' }}>
        Interactive demo — select an inquiry above to see grounded responses.
      </p>
    </div>
  );
}

// ── Orbit Diagram ─────────────────────────────────────────────────────────────
const ORBIT_INNER = [
  { label: 'Grounded answers', abbr: 'G' },
  { label: 'Booking', abbr: 'B' },
  { label: 'Lead capture', abbr: 'L' },
  { label: 'Live takeover', abbr: 'L' },
  { label: 'Email reminders', abbr: 'E' },
];
const ORBIT_OUTER = [
  { label: 'Hybrid search', abbr: 'H' },
  { label: 'Embeddings', abbr: 'E' },
  { label: 'Re-ranking', abbr: 'R' },
  { label: 'Related words', abbr: 'R' },
  { label: 'OCR & extraction', abbr: 'O' },
  { label: 'Streaming replies', abbr: 'S' },
  { label: 'Encrypted keys', abbr: 'E' },
];

function OrbitDiagram({ accentColor }: { accentColor: string }) {
  return (
    <div className="relative w-[360px] h-[360px] mx-auto">
      {/* Core disc */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ zIndex: 2 }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-sm font-bold"
          style={{ background: accentColor, color: '#0f172a' }}
        >
          {/* Use config.businessName truncated */}
          Crescelo
        </div>
      </div>

      {/* Ring 1 */}
      <div
        className="absolute"
        style={{
          inset: '60px',
          border: '1px dashed #334155',
          borderRadius: '50%',
          animation: 'spin 18s linear infinite',
        }}
      />
      {/* Ring 2 */}
      <div
        className="absolute inset-0"
        style={{
          border: '1px dashed #1e293b',
          borderRadius: '50%',
          animation: 'spin 28s linear infinite reverse',
        }}
      />

      {/* Inner orbit pills */}
      {ORBIT_INNER.map((item, i) => {
        const angle = (i / ORBIT_INNER.length) * 2 * Math.PI - Math.PI / 2;
        const r = 115;
        const x = 180 + r * Math.cos(angle);
        const y = 180 + r * Math.sin(angle);
        return (
          <div
            key={i}
            className="absolute flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{
              left: x,
              top: y,
              transform: 'translate(-50%, -50%)',
              background: accentColor,
              color: '#0f172a',
              zIndex: 3,
              whiteSpace: 'nowrap',
            }}
          >
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ background: '#0f172a', color: accentColor }}
            >
              {item.abbr}
            </span>
            <span>{item.label}</span>
          </div>
        );
      })}

      {/* Outer orbit pills */}
      {ORBIT_OUTER.map((item, i) => {
        const angle = (i / ORBIT_OUTER.length) * 2 * Math.PI - Math.PI / 2;
        const r = 162;
        const x = 180 + r * Math.cos(angle);
        const y = 180 + r * Math.sin(angle);
        return (
          <div
            key={i}
            className="absolute flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{
              left: x,
              top: y,
              transform: 'translate(-50%, -50%)',
              background: '#1e293b',
              color: '#94a3b8',
              border: '1px solid #334155',
              zIndex: 3,
              whiteSpace: 'nowrap',
            }}
          >
            <span
              className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
              style={{ background: '#0f172a', color: '#64748b' }}
            >
              {item.abbr}
            </span>
            <span>{item.label}</span>
          </div>
        );
      })}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Feature Carousel ──────────────────────────────────────────────────────────
const FEATURES = [
  { tag: 'Knowledge', title: 'Documents & files', desc: 'PDF, Word and text files become searchable passages.', tone: '#818cf8', icon: <FileText size={28} /> },
  { tag: 'Knowledge', title: 'Web pages & video', desc: 'Add a website URL or a YouTube video — its transcript is indexed.', tone: '#34d399', icon: <Globe size={28} /> },
  { tag: 'Accuracy', title: 'Hybrid search', desc: 'Meaning and keyword search combined, then re-ranked.', tone: '#a3e635', icon: <Search size={28} /> },
  { tag: 'Accuracy', title: 'Related-word matching', desc: '"Cost" finds your page on "pricing".', tone: '#f472b6', icon: <RefreshCw size={28} /> },
  { tag: 'Booking', title: 'In-chat booking', desc: 'Visitors pick a real slot and confirm without leaving the chat.', tone: '#fbbf24', icon: <Calendar size={28} /> },
  { tag: 'Booking', title: 'Email confirmations', desc: 'Confirmations and reminders go out by email, with a calendar feed.', tone: '#fb923c', icon: <Bell size={28} /> },
  { tag: 'Channels', title: 'Website widget', desc: 'One script tag puts the assistant on any site.', tone: '#818cf8', icon: <MessageSquare size={28} /> },
  { tag: 'Channels', title: 'Hosted business page', desc: 'A ready page for the business, with the assistant built in.', tone: '#34d399', icon: <Smartphone size={28} /> },
  { tag: 'Channels', title: 'WhatsApp & Telegram', desc: 'The same assistant answers in your messaging apps.', tone: '#a3e635', icon: <Phone size={28} /> },
  { tag: 'Team', title: 'Live takeover', desc: 'Take over a conversation as it happens, with a sound alert.', tone: '#f472b6', icon: <Users size={28} /> },
  { tag: 'Team', title: 'Leads & gaps', desc: 'Captured contacts and unanswered questions, in one inbox.', tone: '#fbbf24', icon: <Mail size={28} /> },
  { tag: 'Insight', title: 'Analytics', desc: 'See conversations, bookings and leads over time.', tone: '#fb923c', icon: <BarChart3 size={28} /> },
  { tag: 'Control', title: 'Your own AI key', desc: 'Bring your provider key. Usage billed by your provider.', tone: '#818cf8', icon: <Lock size={28} /> },
  { tag: 'Control', title: 'Roles & 2FA', desc: 'Team roles, two-factor sign-in and encrypted keys.', tone: '#34d399', icon: <Shield size={28} /> },
];

function FeatureCarousel({ accentColor }: { accentColor: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [offset, setOffset] = useState(0);
  const CARD_W = 256 + 16; // width + gap

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setOffset((prev) => {
        const total = FEATURES.length * CARD_W;
        return (prev + 1) % total;
      });
    }, 24);
    return () => clearInterval(id);
  }, [paused]);

  const doubled = [...FEATURES, ...FEATURES];

  return (
    <div className="overflow-hidden" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div
        ref={trackRef}
        className="flex gap-4 transition-none"
        style={{ transform: `translateX(-${offset}px)`, width: `${doubled.length * CARD_W}px` }}
      >
        {doubled.map((f, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-64 rounded-2xl p-5 flex flex-col gap-3"
            style={{ background: '#1e293b', border: '1px solid #334155' }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: `${f.tone}22`, color: f.tone }}
            >
              {f.icon}
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full self-start" style={{ background: `${f.tone}22`, color: f.tone }}>
              {f.tag}
            </span>
            <h3 className="text-sm font-semibold" style={{ color: '#f1f5f9' }}>{f.title}</h3>
            <p className="text-xs leading-relaxed" style={{ color: '#94a3b8' }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── FAQ Accordion ─────────────────────────────────────────────────────────────
const FAQS = [
  { q: 'Where does the assistant get its answers?', a: 'From the documents, pages and notes you add. If the answer is not in them, it says it does not know instead of inventing one, and the question is logged so you can fill the gap.' },
  { q: 'Do I need my own AI provider account?', a: 'Yes. You add your own provider key, and usage is billed by that provider at their rates. Crescelo does not add a markup on model usage.' },
  { q: 'Can a person take over a conversation?', a: 'Yes. Visitors can ask for a human at any point, your team is notified, and they continue the same conversation with the earlier messages visible.' },
  { q: 'How does booking avoid double bookings?', a: 'The slot is checked again at the moment of confirmation. If it was just taken, the visitor is offered another time.' },
  { q: 'Which channels are supported?', a: 'An embeddable web widget, a hosted business page, WhatsApp and Telegram.' },
  { q: 'Can I cancel?', a: 'Billing is handled through Stripe, where you can manage or cancel your subscription.' },
];

function FaqAccordion({ accentColor }: { accentColor: string }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-2">
      {FAQS.map((f, i) => (
        <div
          key={i}
          className="rounded-xl overflow-hidden"
          style={{ border: `1px solid ${open === i ? accentColor + '44' : '#334155'}` }}
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
            style={{ background: '#1e293b', color: '#f1f5f9' }}
          >
            <span className="text-sm font-medium">{f.q}</span>
            <ChevronDown
              size={16}
              className="flex-shrink-0 transition-transform"
              style={{ transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)', color: accentColor }}
            />
          </button>
          {open === i && (
            <div className="px-5 pb-4 text-sm leading-relaxed" style={{ background: '#1e293b', color: '#94a3b8' }}>
              {f.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main Template ─────────────────────────────────────────────────────────────
export const CresceloTemplate: React.FC<IndustryTemplateProps> = ({
  config,
  isDark,
  onOpenBooking,
  onOpenChat,
}) => {
  const accentColor = config.themeColor || '#c9f31d';
  const bg = '#0f172a';
  const surface = '#1e293b';
  const border = '#334155';
  const text = '#f1f5f9';
  const muted = '#94a3b8';

  const businessName = config.businessName || 'Your Business';
  const heroHeadline = config.heroHeadline || 'Answer every visitor.';
  const heroSubline = config.heroSubheadline || 'Book the ones who are ready.';
  const heroDesc =
    config.aboutText ||
    `${businessName} builds a website assistant from your own content. It answers visitor questions, books appointments, captures leads, and hands over to your team when a person is needed.`;

  return (
    <div className="min-h-screen font-sans" style={{ background: bg, color: text }}>
      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 backdrop-blur-sm"
        style={{ background: `${bg}cc`, borderBottom: `1px solid ${border}` }}
      >
        <a href="#" className="flex items-center gap-2 text-base font-semibold" style={{ color: text }}>
          <LogoMark size={22} />
          <span>{businessName}</span>
        </a>
        <div className="hidden md:flex items-center gap-6 text-sm" style={{ color: muted }}>
          <a href="#problem" className="hover:text-white transition-colors">Problem</a>
          <a href="#toolkit" className="hover:text-white transition-colors">Toolkit</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </div>
        <button
          onClick={onOpenChat}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
          style={{ background: accentColor, color: bg }}
        >
          Chat with us
        </button>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-24 pb-20 px-6">
        {/* Glow blob */}
        <div
          className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full opacity-20 blur-3xl"
          style={{ background: accentColor }}
          aria-hidden="true"
        />

        <div className="relative max-w-6xl mx-auto">
          {/* Eyebrow */}
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-6 text-center"
            style={{ color: accentColor }}
          >
            Website assistant for service businesses
          </p>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl font-extrabold text-center leading-tight mb-4 tracking-tight">
            <span style={{ color: text }}>{heroHeadline}</span>
            <br />
            <span style={{ color: accentColor }}>{heroSubline}</span>
          </h1>

          {/* Sub-description */}
          <p className="text-base md:text-lg text-center max-w-2xl mx-auto mb-8 leading-relaxed" style={{ color: muted }}>
            {heroDesc}
          </p>

          {/* CTA row */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <button
              onClick={() => onOpenBooking()}
              className="px-7 py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 flex items-center gap-2 justify-center"
              style={{ background: accentColor, color: bg }}
            >
              Book a consultation <ArrowRight size={16} />
            </button>
            <button
              onClick={onOpenChat}
              className="px-7 py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 justify-center"
              style={{ background: surface, color: text, border: `1px solid ${border}` }}
            >
              Chat with our assistant
            </button>
          </div>

          {/* Trust row */}
          <ul className="flex flex-wrap justify-center gap-x-8 gap-y-2 mb-14">
            {['Answers only from your content', 'Bring your own AI provider key', 'Human takeover in one click'].map((item) => (
              <li key={item} className="flex items-center gap-2 text-xs" style={{ color: muted }}>
                <Check size={12} style={{ color: accentColor }} />
                {item}
              </li>
            ))}
          </ul>

          {/* Hero demo */}
          <div className="flex flex-col lg:flex-row items-center gap-10 justify-center">
            <CresceloMascot size={80} />
            <HeroDemo accentColor={accentColor} />
          </div>
        </div>
      </section>

      {/* ── Industry strip ─────────────────────────────────────────────────── */}
      <section className="py-10 px-6" style={{ borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}` }}>
        <p className="text-xs text-center mb-6" style={{ color: muted }}>
          Built for teams like these
        </p>
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-3">
          {['Barbershops', 'Dental clinics', 'Roofing contractors', 'Law firms', 'Fitness studios', 'Real estate', 'Salons & spas', 'Home services', 'Consultancies', 'Auto repair'].map((ind) => (
            <span
              key={ind}
              className="px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: surface, color: muted, border: `1px solid ${border}` }}
            >
              {ind}
            </span>
          ))}
        </div>
      </section>

      {/* ── Problem section ────────────────────────────────────────────────── */}
      <section id="problem" className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: accentColor }}>
            The problem
          </p>
          <h2 className="text-4xl font-extrabold leading-tight" style={{ color: text }}>
            Most website visitors leave without saying a word.
          </h2>
        </div>

        <div className="max-w-2xl mx-auto flex flex-col gap-4">
          {[
            { n: '01', title: 'Questions wait for office hours', body: "Someone asks about pricing at 9pm. By the time you reply, they've booked with whoever answered first.", tone: '#818cf8' },
            { n: '02', title: 'Bookings live in a back-and-forth', body: 'Finding a slot over email takes several messages. Each one is a chance for the person to drop off.', tone: '#f472b6' },
            { n: '03', title: 'The same answers, typed again and again', body: 'Opening hours, deposits, service areas. Your team repeats them all week instead of doing the work.', tone: '#fbbf24' },
            { n: '04', title: 'Details get lost between chats and inboxes', body: 'Questions, names and phone numbers end up scattered across messages instead of in one place your team can act on.', tone: '#fb923c' },
          ].map((card) => (
            <div
              key={card.n}
              className="rounded-2xl p-6 flex gap-5 items-start"
              style={{ background: surface, border: `1px solid ${border}` }}
            >
              <span className="text-3xl font-black tabular-nums" style={{ color: `${card.tone}44` }}>
                {card.n}
              </span>
              <div>
                <h3 className="font-semibold mb-1.5 text-base" style={{ color: text }}>{card.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: muted }}>{card.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto text-center mt-20 mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: accentColor }}>
            The approach
          </p>
          <h2 className="text-4xl font-extrabold leading-tight" style={{ color: text }}>
            A front desk that never closes,{' '}
            <span style={{ color: accentColor }}>and knows when to step aside.</span>
          </h2>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-4">
          {[
            { title: 'It answers from your own material', body: 'Upload documents, paste pages, add a website URL. Replies are grounded in that content, and it says so when it does not know.' },
            { title: 'It books into your calendar', body: 'Visitors pick a real slot inside the chat. Double bookings are checked before a slot is confirmed.' },
            { title: 'It hands over cleanly', body: 'When a visitor asks for a person, your team takes the live conversation with the full history in view.' },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl p-6"
              style={{ background: surface, border: `1px solid ${border}` }}
            >
              <h3 className="font-semibold mb-2 text-sm" style={{ color: text }}>{card.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: muted }}>{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Toolkit section ────────────────────────────────────────────────── */}
      <section id="toolkit" className="py-24 px-6" style={{ borderTop: `1px solid ${border}` }}>
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: accentColor }}>
            The toolkit
          </p>
          <h2 className="text-4xl font-extrabold leading-tight" style={{ color: text }}>
            Tools to get you answering, booking,{' '}
            <span style={{ color: accentColor }}>and handing over</span>
          </h2>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-5">
          {[
            {
              kicker: 'Never leave a question waiting',
              title: 'Knowledge assistant',
              desc: "Answers from your own documents, pages and notes, and says so when it doesn't know.",
              tone: '#818cf8',
              cta: "Let's answer",
              onClick: onOpenChat,
              preview: (
                <div className="rounded-xl p-3 text-xs" style={{ background: '#0f172a' }}>
                  <p style={{ color: muted }}>What does a deposit cover?</p>
                  <p className="mt-2" style={{ color: text }}>
                    It comes off your final bill and is refundable for 24 hours.
                    <span className="ml-1 text-[10px]" style={{ color: muted }}>Source: Booking policy</span>
                  </p>
                </div>
              ),
            },
            {
              kicker: 'Turn interest into appointments',
              title: 'Booking engine',
              desc: 'Offers real open slots inside the chat and checks each one again before confirming.',
              tone: '#34d399',
              cta: "Let's book",
              onClick: () => onOpenBooking(),
              preview: (
                <div className="rounded-xl p-3 text-xs" style={{ background: '#0f172a' }}>
                  <div className="grid grid-cols-3 gap-1 mb-2">
                    {['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'].map((t, i) => (
                      <span
                        key={t}
                        className="text-center py-1 rounded-lg text-[10px]"
                        style={{ background: i === 2 ? accentColor : surface, color: i === 2 ? bg : i === 1 ? '#475569' : muted }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <p style={{ color: accentColor }}>✓ Booked · Thu 10:00</p>
                </div>
              ),
            },
            {
              kicker: 'A person when it matters',
              title: 'Live handover',
              desc: 'Your team takes over the same conversation, with the earlier messages in view.',
              tone: accentColor,
              cta: "Let's hand over",
              onClick: onOpenChat,
              preview: (
                <div className="rounded-xl p-3 text-xs" style={{ background: '#0f172a' }}>
                  <p style={{ color: muted }}>Can I talk to someone?</p>
                  <p className="mt-1.5 font-medium" style={{ color: accentColor }}>Alex joined the chat</p>
                  <p className="mt-1" style={{ color: text }}>Hi, happy to help. What are you planning?</p>
                </div>
              ),
            },
          ].map((tool) => (
            <div
              key={tool.title}
              className="rounded-2xl overflow-hidden flex flex-col"
              style={{ border: `1px solid ${border}` }}
            >
              <div className="p-4" style={{ background: `${tool.tone}11` }}>
                {tool.preview}
              </div>
              <div className="p-5 flex flex-col gap-2 flex-1" style={{ background: surface }}>
                <p className="text-xs font-semibold" style={{ color: tool.tone }}>{tool.kicker}</p>
                <h3 className="font-bold text-base" style={{ color: text }}>{tool.title}</h3>
                <p className="text-xs leading-relaxed flex-1" style={{ color: muted }}>{tool.desc}</p>
                <button
                  onClick={tool.onClick}
                  className="mt-3 flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
                  style={{ color: tool.tone }}
                >
                  {tool.cta} <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Always-on / Orbit section ───────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ borderTop: `1px solid ${border}` }}>
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-14">
          <div className="flex-1 max-w-md">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: accentColor }}>
              Always on
            </p>
            <h2 className="text-4xl font-extrabold leading-tight mb-5" style={{ color: text }}>
              An assistant that works{' '}
              <span style={{ color: accentColor }}>while you sleep</span>
            </h2>
            <p className="text-base leading-relaxed mb-7" style={{ color: muted }}>
              It answers the first question, offers the next step, and hands the conversation to you with everything already written down.
            </p>
            <button
              onClick={onOpenChat}
              className="px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all hover:opacity-90"
              style={{ background: accentColor, color: bg }}
            >
              Try and stop me <ArrowRight size={15} />
            </button>
            <p className="mt-4 text-xs" style={{ color: '#475569' }}>
              Lime: what your visitors experience. Dark: what runs behind it.
            </p>
          </div>
          <div className="flex-shrink-0">
            <OrbitDiagram accentColor={accentColor} />
          </div>
        </div>
      </section>

      {/* ── Features carousel ──────────────────────────────────────────────── */}
      <section id="features" className="py-24" style={{ borderTop: `1px solid ${border}` }}>
        <div className="px-6 max-w-3xl mx-auto text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: accentColor }}>
            Everything included
          </p>
          <h2 className="text-4xl font-extrabold leading-tight mb-4" style={{ color: text }}>
            Yes, you can test here. And the rest!
          </h2>
          <p className="text-base" style={{ color: muted }}>Every part of the product on one rail.</p>
        </div>
        <FeatureCarousel accentColor={accentColor} />
        <p className="text-center text-xs mt-4" style={{ color: '#475569' }}>
          Drifts on its own. Hover to pause.
        </p>
      </section>

      {/* ── Comparison section ─────────────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ borderTop: `1px solid ${border}` }}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: accentColor }}>Try it</p>
            <h2 className="text-4xl font-extrabold leading-tight mb-4" style={{ color: text }}>
              See the difference a grounded answer makes.
            </h2>
            <p className="text-base" style={{ color: muted }}>
              Compare a standard chatbot fluff response vs. a grounded, knowledge-backed response.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl p-6" style={{ background: surface, border: `1px solid ${border}` }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ background: '#ef444422', color: '#ef4444' }}>Generic chatbot</span>
              </div>
              <p className="text-xs mb-3 font-medium" style={{ color: muted }}>Visitor asks: "Do you offer any discounts?"</p>
              <div className="rounded-xl p-4 text-sm leading-relaxed" style={{ background: '#0f172a', color: '#94a3b8' }}>
                "Great question! We have many exciting offers and promotions available. Please contact us or check our website for the latest deals and special packages!"
              </div>
              <p className="text-xs mt-3" style={{ color: '#ef4444' }}>❌ Vague, unhelpful, sends them away.</p>
            </div>

            <div className="rounded-2xl p-6" style={{ background: surface, border: `1px solid ${accentColor}44` }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ background: `${accentColor}22`, color: accentColor }}>Crescelo (grounded)</span>
              </div>
              <p className="text-xs mb-3 font-medium" style={{ color: muted }}>Visitor asks: "Do you offer any discounts?"</p>
              <div className="rounded-xl p-4 text-sm leading-relaxed" style={{ background: '#0f172a', color: '#e2e8f0' }}>
                "Yes — we offer a 10% loyalty discount for returning clients, and a student discount with a valid ID. Book Monday–Wednesday for an additional \$5 off. <span style={{ color: accentColor }}>Source: Pricing & Promotions page.</span>"
              </div>
              <p className="text-xs mt-3" style={{ color: accentColor }}>✓ Specific, grounded, cites the source.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Services / Pricing ─────────────────────────────────────────────── */}
      {config.services && config.services.length > 0 && (
        <section id="pricing" className="py-24 px-6" style={{ borderTop: `1px solid ${border}` }}>
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: accentColor }}>
              Services
            </p>
            <h2 className="text-4xl font-extrabold" style={{ color: text }}>
              What we offer
            </h2>
          </div>
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {config.services.slice(0, 6).map((svc) => (
              <div
                key={svc.id}
                className="rounded-2xl p-6 flex flex-col gap-3"
                style={{ background: surface, border: `1px solid ${border}` }}
              >
                <h3 className="font-semibold text-sm" style={{ color: text }}>{svc.name}</h3>
                {svc.description && <p className="text-xs leading-relaxed flex-1" style={{ color: muted }}>{svc.description}</p>}
                <div className="flex items-center justify-between mt-auto pt-3" style={{ borderTop: `1px solid ${border}` }}>
                  {svc.price != null && (
                    <span className="text-lg font-bold" style={{ color: accentColor }}>
                      ${svc.price}
                    </span>
                  )}
                  {svc.durationMinutes && (
                    <span className="text-xs" style={{ color: muted }}>{svc.durationMinutes} min</span>
                  )}
                  <button
                    onClick={() => onOpenBooking(svc.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
                    style={{ background: accentColor, color: bg }}
                  >
                    Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Testimonials / Social proof ─────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ borderTop: `1px solid ${border}` }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: accentColor }}>
              From our customers
            </p>
            <h2 className="text-4xl font-extrabold" style={{ color: text }}>What they say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { quote: "The AI answered questions at 11pm that I used to handle myself. Woke up to two booked appointments.", name: 'Jordan K.', role: 'Barbershop owner' },
              { quote: "Clients started booking without ever calling. The handover to my team is seamless — they see the whole chat history.", name: 'Priya M.', role: 'Dental clinic manager' },
              { quote: "Leads were getting lost across WhatsApp and email. Now they all land in one place with context. Night and day.", name: 'David R.', role: 'Fitness studio founder' },
            ].map((t) => (
              <div
                key={t.name}
                className="rounded-2xl p-6 flex flex-col gap-4"
                style={{ background: surface, border: `1px solid ${border}` }}
              >
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={accentColor} stroke="none" />)}
                </div>
                <p className="text-sm leading-relaxed flex-1" style={{ color: muted }}>"{t.quote}"</p>
                <div>
                  <p className="text-sm font-semibold" style={{ color: text }}>{t.name}</p>
                  <p className="text-xs" style={{ color: muted }}>{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 px-6" style={{ borderTop: `1px solid ${border}` }}>
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: accentColor }}>FAQ</p>
          <h2 className="text-4xl font-extrabold" style={{ color: text }}>Common questions</h2>
        </div>
        <FaqAccordion accentColor={accentColor} />
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ borderTop: `1px solid ${border}` }}>
        <div
          className="max-w-3xl mx-auto rounded-3xl p-12 text-center relative overflow-hidden"
          style={{ background: surface, border: `1px solid ${border}` }}
        >
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ background: `radial-gradient(circle at center, ${accentColor}, transparent 70%)` }}
            aria-hidden="true"
          />
          <CresceloMascot size={64} />
          <h2 className="mt-6 text-4xl font-extrabold leading-tight mb-4" style={{ color: text }}>
            Ready to answer every visitor?
          </h2>
          <p className="text-base mb-8" style={{ color: muted }}>
            Set up your assistant in minutes. No credit card required to start.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => onOpenBooking()}
              className="px-8 py-3.5 rounded-xl font-semibold text-sm flex items-center gap-2 justify-center transition-all hover:opacity-90"
              style={{ background: accentColor, color: bg }}
            >
              Book a demo <ArrowRight size={15} />
            </button>
            <button
              onClick={onOpenChat}
              className="px-8 py-3.5 rounded-xl font-semibold text-sm flex items-center gap-2 justify-center transition-all"
              style={{ background: '#334155', color: text }}
            >
              <MessageSquare size={15} /> Chat now
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="py-10 px-6" style={{ borderTop: `1px solid ${border}` }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: text }}>
            <LogoMark size={18} />
            <span>{businessName}</span>
          </div>
          <div className="flex gap-6 text-xs" style={{ color: muted }}>
            {config.email && <a href={`mailto:${config.email}`} className="hover:text-white transition-colors">{config.email}</a>}
            {config.phone && <a href={`tel:${config.phone}`} className="hover:text-white transition-colors">{config.phone}</a>}
            {config.address && <span>{config.address}</span>}
          </div>
          <p className="text-xs" style={{ color: '#475569' }}>
            © {new Date().getFullYear()} {businessName}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
