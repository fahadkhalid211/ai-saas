import { T } from '@/lib/i18n/context';
import type { CarouselFeature } from './content-extra';

/** Small original illustrations. Decorative only (aria-hidden at the call site). */

export function ToolArt({ id }: { id: 'answer' | 'book' | 'handover' }) {
  if (id === 'answer') {
    return (
      <div className="mk-art mk-art-answer">
        <p className="mk-art-q"><T>What does a deposit cover?</T></p>
        <p className="mk-art-a">
          <T>It comes off your final bill and is refundable for 24 hours.</T>
          <span><T>Source: Booking policy</T></span>
        </p>
        <div className="mk-art-dots">
          <i />
          <i />
          <i />
        </div>
      </div>
    );
  }
  if (id === 'book') {
    return (
      <div className="mk-art mk-art-book">
        <div className="mk-art-cal">
          {['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'].map((t, i) => (
            <span key={t} className={i === 2 ? 'is-on' : i === 1 ? 'is-off' : ''}>
              <T>{t}</T>
            </span>
          ))}
        </div>
        <p className="mk-art-ok"><T>Booked · Thu 10:00</T></p>
      </div>
    );
  }
  return (
    <div className="mk-art mk-art-hand">
      <p className="mk-art-q"><T>Can I talk to someone?</T></p>
      <p className="mk-art-join">
        <b aria-hidden="true">A</b> <T>Alex joined the chat</T>
      </p>
      <p className="mk-art-a"><T>Hi, happy to help. What are you planning?</T></p>
    </div>
  );
}

export function Glyph({ kind }: { kind: CarouselFeature['glyph'] }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const paths: Record<CarouselFeature['glyph'], React.ReactNode> = {
    doc: (
      <>
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
        <path d="M14 3v5h5M9 13h6M9 17h4" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="6" />
        <path d="m20 20-4.2-4.2" />
      </>
    ),
    words: (
      <>
        <path d="M4 8h9M4 16h9M16 6l4 2-4 2M16 14l4 2-4 2" />
      </>
    ),
    calendar: (
      <>
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3v4M16 3v4M4 10h16M9 15l2 2 4-4" />
      </>
    ),
    bell: (
      <>
        <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" />
        <path d="M10 21h4" />
      </>
    ),
    chat: (
      <>
        <path d="M4 5h16v11H9l-5 4z" />
        <path d="M8 10h8" />
      </>
    ),
    page: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 9h18M7 6.5h.01M10 6.5h.01" />
      </>
    ),
    phone: (
      <>
        <rect x="7" y="3" width="10" height="18" rx="2" />
        <path d="M11 18h2" />
      </>
    ),
    people: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20a6 6 0 0 1 12 0M16 5.5a3 3 0 0 1 0 5M18 20a6 6 0 0 0-2-4.5" />
      </>
    ),
    inbox: (
      <>
        <path d="M4 13l2-8h12l2 8v6H4z" />
        <path d="M4 13h5l1 2h4l1-2h5" />
      </>
    ),
    chart: (
      <>
        <path d="M4 20V5M4 20h16" />
        <path d="M8 16v-4M12 16V8M16 16v-6" />
      </>
    ),
    template: (
      <>
        <rect x="4" y="4" width="7" height="7" rx="1.5" />
        <rect x="13" y="4" width="7" height="4" rx="1.5" />
        <rect x="13" y="10" width="7" height="10" rx="1.5" />
        <rect x="4" y="13" width="7" height="7" rx="1.5" />
      </>
    ),
    key: (
      <>
        <circle cx="8" cy="15" r="4" />
        <path d="m11 12 8-8M16 7l3 3" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 24 24" width="56" height="56" aria-hidden="true" {...common}>
      <T>{paths[kind]}</T>
    </svg>
  );
}
