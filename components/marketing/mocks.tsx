'use client';

import { useState } from 'react';
export type VisualKind = 'sources' | 'retrieval' | 'calendar' | 'channels' | 'inbox' | 'config';

/* Interactive mock UI using sample content. */

/* ----------------------- Feature visuals ----------------------- */

function SourcesVisual() {
  const rows = [
    { name: 'Price list.pdf', kind: 'PDF', state: 'Ready' },
    { name: 'about-us (web page)', kind: 'URL', state: 'Ready' },
    { name: 'Intro video', kind: 'YouTube', state: 'Indexing' },
    { name: 'Policies.docx', kind: 'Word', state: 'Ready' },
  ];
  const [selected, setSelected] = useState(0);
  return (
    <div className="mk-mock">
      <p className="mk-mock-label">Knowledge sources</p>
      <ul className="mk-rows" role="tablist" aria-label="Knowledge sources">
        {rows.map((r, i) => (
          <li key={r.name} role="presentation">
            <button
              type="button"
              role="tab"
              aria-selected={selected === i}
              className={`mk-row ${selected === i ? 'is-active' : ''}`}
              onClick={() => setSelected(i)}
            >
              <span className="mk-row-kind">{r.kind}</span>
              <span className="mk-row-name">{r.name}</span>
              <span className={`mk-row-state ${r.state === 'Indexing' ? 'is-busy' : ''}`}>{r.state}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RetrievalVisual() {
  const [mode, setMode] = useState<'keyword' | 'hybrid'>('hybrid');
  return (
    <div className="mk-mock">
      <p className="mk-mock-label">Visitor asks: “what does it cost?”</p>
      <div className="mk-toggle" role="group" aria-label="Search method">
        {(['keyword', 'hybrid'] as const).map((m) => (
          <button key={m} type="button" aria-pressed={mode === m} className={mode === m ? 'is-on' : ''} onClick={() => setMode(m)}>
            {m === 'keyword' ? 'Keyword only' : 'Meaning + keyword'}
          </button>
        ))}
      </div>
      <div className="mk-passage-stack">
        <div className={`mk-passage ${mode === 'hybrid' ? 'is-hit' : 'is-miss'}`}>
          <b>Pricing</b>
          <span>{mode === 'hybrid' ? 'Found: related word “pricing” matches “cost”.' : 'Missed: the word “cost” is not on this page.'}</span>
        </div>
        <div className="mk-passage">
          <b>About us</b>
          <span>Ranked lower.</span>
        </div>
      </div>
    </div>
  );
}

function CalendarVisual() {
  const [picked, setPicked] = useState<string | null>(null);
  const times = ['09:00', '10:30', '11:00', '14:00', '15:30', '16:00'];
  const taken = new Set(['11:00', '15:30']);
  return (
    <div className="mk-mock">
      <p className="mk-mock-label">Live calendar slot picker</p>
      <div className="mk-slots">
        {times.map((t) => (
          <button
            key={t}
            type="button"
            disabled={taken.has(t)}
            aria-pressed={picked === t}
            className={`mk-slot ${picked === t ? 'is-picked' : ''} ${taken.has(t) ? 'is-taken' : ''}`}
            onClick={() => setPicked(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <p className="mk-logline" aria-live="polite">
        {picked ? `Slot ${picked} would be held, then checked again on confirm.` : 'Greyed slots are already taken.'}
      </p>
    </div>
  );
}

function ChannelsVisual() {
  const chans = ['Web widget', 'Hosted page', 'WhatsApp', 'Telegram'];
  const [active, setActive] = useState(0);
  return (
    <div className="mk-mock">
      <p className="mk-mock-label">One assistant, several places</p>
      <div className="mk-toggle mk-toggle-wrap" role="tablist" aria-label="Channel">
        {chans.map((c, i) => (
          <button key={c} role="tab" type="button" aria-selected={active === i} className={active === i ? 'is-on' : ''} onClick={() => setActive(i)}>
            {c}
          </button>
        ))}
      </div>
      <p className="mk-bubble mk-bubble-user">Do you have space this week?</p>
      <p className="mk-bubble mk-bubble-bot">
        Yes, Thursday has openings.
        <span className="mk-source">Answering in: {chans[active]}</span>
      </p>
    </div>
  );
}

function InboxVisual() {
  const items = [
    { who: 'Visitor 1042', what: 'Asked for a person', live: true },
    { who: 'Visitor 1041', what: 'Booked Thu 10:00', live: false },
    { who: 'Visitor 1039', what: 'Question not in sources', live: false },
  ];
  const [sel, setSel] = useState(0);
  return (
    <div className="mk-mock">
      <p className="mk-mock-label">Live conversations</p>
      <ul className="mk-rows">
        {items.map((it, i) => (
          <li key={it.who}>
            <button type="button" className={`mk-row ${sel === i ? 'is-active' : ''}`} aria-pressed={sel === i} onClick={() => setSel(i)}>
              <span className="mk-row-name">{it.who}</span>
              <span className="mk-row-kind">{it.what}</span>
              {it.live ? <span className="mk-row-state is-busy">Live</span> : null}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Switch({ on, set, label }: { on: boolean; set: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} className={`mk-switch ${on ? 'is-on' : ''}`} onClick={() => set(!on)}>
      <span />
    </button>
  );
}

function ConfigVisual() {
  const [tone, setTone] = useState<'Friendly' | 'Formal'>('Friendly');
  const [sound, setSound] = useState(true);
  const [handover, setHandover] = useState(true);
  return (
    <div className="mk-mock">
      <p className="mk-mock-label">Assistant configuration</p>
      <div className="mk-set">
        <span>Tone of voice</span>
        <div className="mk-toggle" role="group" aria-label="Tone of voice">
          {(['Friendly', 'Formal'] as const).map((t) => (
            <button key={t} type="button" aria-pressed={tone === t} className={tone === t ? 'is-on' : ''} onClick={() => setTone(t)}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="mk-set">
        <span>Sound on new message</span>
        <Switch on={sound} set={setSound} label="Sound on new message" />
      </div>
      <div className="mk-set">
        <span>Offer a person when asked</span>
        <Switch on={handover} set={setHandover} label="Offer a person when asked" />
      </div>
      <p className="mk-bubble mk-bubble-bot">{tone === 'Friendly' ? 'Hi! How can I help today?' : 'Good day. How may I assist you?'}</p>
    </div>
  );
}

export function FeatureVisual({ kind }: { kind: VisualKind }) {
  switch (kind) {
    case 'sources':
      return <SourcesVisual />;
    case 'retrieval':
      return <RetrievalVisual />;
    case 'calendar':
      return <CalendarVisual />;
    case 'channels':
      return <ChannelsVisual />;
    case 'config':
      return <ConfigVisual />;
    default:
      return <InboxVisual />;
  }
}
