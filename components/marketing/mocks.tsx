'use client';

import { T, useT } from '@/lib/i18n/context';
import { useState } from 'react';
export type VisualKind = 'sources' | 'retrieval' | 'calendar' | 'channels' | 'inbox' | 'config';

/* Interactive mock UI using sample content. */

/* ----------------------- Feature visuals ----------------------- */

function SourcesVisual() {
  const __t = useT();
  const rows = [
    { name: 'Price list.pdf', kind: 'PDF', state: 'Ready' },
    { name: 'about-us (web page)', kind: 'URL', state: 'Ready' },
    { name: 'Intro video', kind: 'Video', state: 'Indexing' },
    { name: 'Policies.docx', kind: 'Word', state: 'Ready' },
  ];
  const [selected, setSelected] = useState(0);
  return (
    <div className="mk-mock">
      <p className="mk-mock-label"><T>Knowledge sources</T></p>
      <ul className="mk-rows" role="tablist" aria-label={__t("Knowledge sources")}>
        {rows.map((r, i) => (
          <li key={r.name} role="presentation">
            <button
              type="button"
              role="tab"
              aria-selected={selected === i}
              className={`mk-row ${selected === i ? 'is-active' : ''}`}
              onClick={() => setSelected(i)}
            >
              <span className="mk-row-kind"><T>{r.kind}</T></span>
              <span className="mk-row-name"><T>{r.name}</T></span>
              <span className={`mk-row-state ${r.state === 'Indexing' ? 'is-busy' : ''}`}><T>{r.state}</T></span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RetrievalVisual() {
  const __t = useT();
  const [mode, setMode] = useState<'keyword' | 'hybrid'>('hybrid');
  return (
    <div className="mk-mock">
      <p className="mk-mock-label"><T>Visitor asks: “what does it cost?”</T></p>
      <div className="mk-toggle" role="group" aria-label={__t("Search method")}>
        {(['keyword', 'hybrid'] as const).map((m) => (
          <button key={m} type="button" aria-pressed={mode === m} className={mode === m ? 'is-on' : ''} onClick={() => setMode(m)}>
            <T>{m === 'keyword' ? 'Keyword only' : 'Meaning + keyword'}</T>
          </button>
        ))}
      </div>
      <div className="mk-passage-stack">
        <div className={`mk-passage ${mode === 'hybrid' ? 'is-hit' : 'is-miss'}`}>
          <b><T>Pricing</T></b>
          <span><T>{mode === 'hybrid' ? 'Found: related word “pricing” matches “cost”.' : 'Missed: the word “cost” is not on this page.'}</T></span>
        </div>
        <div className="mk-passage">
          <b><T>About us</T></b>
          <span><T>Ranked lower.</T></span>
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
      <p className="mk-mock-label"><T>Live calendar slot picker</T></p>
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
            <T>{t}</T>
          </button>
        ))}
      </div>
      <p className="mk-logline" aria-live="polite">
        <T>{picked ? `Slot ${picked} would be held, then checked again on confirm.` : 'Greyed slots are already taken.'}</T>
      </p>
    </div>
  );
}

function ChannelsVisual() {
  const __t = useT();
  const chans = ['Web widget', 'Hosted page', 'WhatsApp', 'Telegram'];
  const [active, setActive] = useState(0);
  return (
    <div className="mk-mock">
      <p className="mk-mock-label"><T>One assistant, several places</T></p>
      <div className="mk-toggle mk-toggle-wrap" role="tablist" aria-label={__t("Channel")}>
        {chans.map((c, i) => (
          <button key={c} role="tab" type="button" aria-selected={active === i} className={active === i ? 'is-on' : ''} onClick={() => setActive(i)}>
            <T>{c}</T>
          </button>
        ))}
      </div>
      <p className="mk-bubble mk-bubble-user"><T>Do you have space this week?</T></p>
      <p className="mk-bubble mk-bubble-bot">
        <T>Yes, Thursday has openings.</T>
        <span className="mk-source"><T>Answering in:</T> <T>{chans[active]}</T></span>
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
      <p className="mk-mock-label"><T>Live conversations</T></p>
      <ul className="mk-rows">
        {items.map((it, i) => (
          <li key={it.who}>
            <button type="button" className={`mk-row ${sel === i ? 'is-active' : ''}`} aria-pressed={sel === i} onClick={() => setSel(i)}>
              <span className="mk-row-name"><T>{it.who}</T></span>
              <span className="mk-row-kind"><T>{it.what}</T></span>
              {it.live ? <span className="mk-row-state is-busy"><T>Live</T></span> : null}
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
  const __t = useT();
  const [tone, setTone] = useState<'Friendly' | 'Formal'>('Friendly');
  const [sound, setSound] = useState(true);
  const [handover, setHandover] = useState(true);
  return (
    <div className="mk-mock">
      <p className="mk-mock-label"><T>Assistant configuration</T></p>
      <div className="mk-set">
        <span><T>Tone of voice</T></span>
        <div className="mk-toggle" role="group" aria-label={__t("Tone of voice")}>
          {(['Friendly', 'Formal'] as const).map((t) => (
            <button key={t} type="button" aria-pressed={tone === t} className={tone === t ? 'is-on' : ''} onClick={() => setTone(t)}>
              <T>{t}</T>
            </button>
          ))}
        </div>
      </div>
      <div className="mk-set">
        <span><T>Sound on new message</T></span>
        <Switch on={sound} set={setSound} label="Sound on new message" />
      </div>
      <div className="mk-set">
        <span><T>Offer a person when asked</T></span>
        <Switch on={handover} set={setHandover} label="Offer a person when asked" />
      </div>
      <p className="mk-bubble mk-bubble-bot"><T>{tone === 'Friendly' ? 'Hi! How can I help today?' : 'Good day. How may I assist you?'}</T></p>
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
