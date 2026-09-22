'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { PIPELINE, PLAYGROUND, type PipelineStage } from './content-extra';
import { Eyebrow, Reveal } from './ui';
import { usePrefersReducedMotion } from './hooks';
import { dayKey, isEmail, makeIcs, openDays, respond, slotsFor, type Reply, type Service, type TraceNote } from './playground-engine';

interface Confirmation {
  ref: string;
  service: Service;
  start: Date;
  name: string;
}

interface Msg {
  id: number;
  role: 'user' | 'bot' | 'system';
  text?: string;
  source?: string;
  card?: 'booking';
  confirmed?: Confirmation;
}

type StageState = { state: 'idle' | 'active' | 'done'; note: string };

const STAGES = PIPELINE.stages;
const emptyTrace = (): Record<PipelineStage['id'], StageState> => ({
  input: { state: 'idle', note: '' },
  embed: { state: 'idle', note: '' },
  retrieve: { state: 'idle', note: '' },
  rerank: { state: 'idle', note: '' },
  answer: { state: 'idle', note: '' },
  action: { state: 'idle', note: '' },
});

const fmtWhen = (d: Date) =>
  d.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

/* ------------------------------ Booking card ------------------------------ */

function BookingCard({
  booked,
  disabled,
  onConfirm,
}: {
  booked: Set<string>;
  disabled: boolean;
  onConfirm: (c: { service: Service; start: Date; name: string; email: string }) => string | null;
}) {
  const [service, setService] = useState<Service>(PLAYGROUND.services[0]);
  const [days] = useState(() => openDays(7));
  const [day, setDay] = useState(0);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; slot?: string }>({});
  const slots = slotsFor(days[day], service, booked);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!time) next.slot = 'Choose a time first.';
    if (name.trim().length < 2) next.name = 'Enter your name.';
    if (!isEmail(email)) next.email = 'Enter a valid email, like name@example.com.';
    setErrors(next);
    if (Object.keys(next).length || !time) return;
    const [h, m] = time.split(':').map(Number);
    const start = new Date(days[day]);
    start.setHours(h, m, 0, 0);
    const problem = onConfirm({ service, start, name: name.trim(), email: email.trim() });
    if (problem) {
      setErrors({ slot: problem });
      setTime(null);
    }
  };

  return (
    <form className="mk-bk" onSubmit={submit} noValidate aria-label="Booking form (demo)">
      <fieldset disabled={disabled}>
        <legend>1 · Service</legend>
        <div className="mk-bk-row">
          {PLAYGROUND.services.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={service.id === s.id}
              className={`mk-bk-chip ${service.id === s.id ? 'is-on' : ''}`}
              onClick={() => {
                setService(s);
                setTime(null);
              }}
            >
              {s.name}
              <small>
                {s.minutes} min · ${s.price}
              </small>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset disabled={disabled}>
        <legend>2 · Day</legend>
        <div className="mk-bk-row mk-bk-days">
          {days.map((d, i) => (
            <button
              key={dayKey(d)}
              type="button"
              aria-pressed={day === i}
              className={`mk-bk-day ${day === i ? 'is-on' : ''}`}
              onClick={() => {
                setDay(i);
                setTime(null);
              }}
            >
              <small>{d.toLocaleDateString('en-US', { weekday: 'short' })}</small>
              <b>{d.getDate()}</b>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset disabled={disabled}>
        <legend>3 · Time</legend>
        {slots.length === 0 ? (
          <p className="mk-bk-empty">No times left this day. Try another day.</p>
        ) : (
          <div className="mk-bk-slots">
            {slots.map((s) => (
              <button
                key={s.time}
                type="button"
                disabled={s.taken}
                aria-pressed={time === s.time}
                className={`mk-bk-slot ${time === s.time ? 'is-on' : ''}`}
                onClick={() => setTime(s.time)}
              >
                {s.time}
              </button>
            ))}
          </div>
        )}
        {errors.slot ? (
          <p className="mk-bk-err" role="alert">
            {errors.slot}
          </p>
        ) : null}
      </fieldset>

      <fieldset disabled={disabled}>
        <legend>4 · Your details</legend>
        <div className="mk-bk-fields">
          <label>
            <span>Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={80} aria-invalid={errors.name ? true : undefined} />
            {errors.name ? <em role="alert">{errors.name}</em> : null}
          </label>
          <label>
            <span>Email</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" maxLength={254} aria-invalid={errors.email ? true : undefined} />
            {errors.email ? <em role="alert">{errors.email}</em> : null}
          </label>
        </div>
      </fieldset>

      <div className="mk-bk-foot">
        <p aria-live="polite">
          {time ? (
            <>
              <b>{service.name}</b> · {days[day].toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} at {time} · ${service.price}
            </>
          ) : (
            'Nothing selected yet'
          )}
        </p>
        <button type="submit" className="mk-btn mk-btn-primary mk-btn-sm" disabled={disabled}>
          Confirm booking
        </button>
      </div>
    </form>
  );
}

function ConfirmedCard({ c, onAgain }: { c: Confirmation; onAgain: () => void }) {
  const download = () => {
    const ics = makeIcs({ name: c.name, start: c.start, minutes: c.service.minutes, service: c.service.name });
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'demo-booking.ics';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <div className="mk-bk-done">
      <span className="mk-bk-tick" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="28" height="28">
          <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <div>
        <p className="mk-bk-done-title">Booked for {c.name.split(' ')[0]}</p>
        <p>
          {c.service.name} · {fmtWhen(c.start)} · ${c.service.price}
        </p>
        <p className="mk-bk-ref">Reference {c.ref} (demo)</p>
        <div className="mk-bk-actions">
          <button type="button" className="mk-btn mk-btn-ghost mk-btn-sm" onClick={download}>
            Add to calendar
          </button>
          <button type="button" className="mk-btn mk-btn-sm mk-btn-ghost" onClick={onAgain}>
            Book another
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Playground ------------------------------ */

export function Playground() {
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const idRef = useRef(1);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [trace, setTrace] = useState(emptyTrace);
  const [active, setActive] = useState(-1);
  const [visible, setVisible] = useState(false);
  const [idleIdx, setIdleIdx] = useState(0);
  const [booked, setBooked] = useState<Set<string>>(() => new Set());
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    const timerList = timers.current;
    return () => timerList.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Idle: walk a highlight through the stages so the pipeline is alive before anyone types.
  useEffect(() => {
    if (busy || !visible || reduced || hasRun) return;
    const t = setInterval(() => setIdleIdx((i) => (i + 1) % STAGES.length), 1500);
    return () => clearInterval(t);
  }, [busy, visible, reduced, hasRun]);

  // Keep the chat scrolled to the newest message without moving the page.
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduced ? 'auto' : 'smooth' });
  }, [msgs, busy, reduced]);

  const push = useCallback((m: Omit<Msg, 'id'>) => {
    setMsgs((prev) => [...prev, { ...m, id: idRef.current++ }]);
  }, []);

  const runTrace = useCallback(
    (notes: TraceNote[], done: () => void) => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      setBusy(true);
      setHasRun(true);
      setTrace(emptyTrace());
      const step = reduced ? 90 : 430;
      STAGES.forEach((stage, i) => {
        timers.current.push(
          setTimeout(() => {
            setActive(i);
            setTrace((prev) => {
              const next = { ...prev };
              STAGES.forEach((s, j) => {
                if (j < i) next[s.id] = { ...next[s.id], state: 'done' };
              });
              next[stage.id] = { state: 'active', note: notes.find((n) => n.stage === stage.id)?.note ?? stage.detail };
              return next;
            });
          }, i * step)
        );
      });
      timers.current.push(
        setTimeout(() => {
          setTrace((prev) => {
            const next = { ...prev };
            STAGES.forEach((s) => (next[s.id] = { ...next[s.id], state: 'done' }));
            return next;
          });
          setActive(STAGES.length);
          done();
          setBusy(false);
        }, STAGES.length * step + 200)
      );
    },
    [reduced]
  );

  const send = (raw: string) => {
    const text = raw.trim().slice(0, 300);
    if (!text || busy) return;
    setInput('');
    push({ role: 'user', text });
    const reply: Reply = respond(text);
    runTrace(reply.trace, () => {
      push({ role: 'bot', text: reply.text, source: reply.source, card: reply.card });
      if (reply.lead) {
        const what = [reply.lead.email, reply.lead.phone].filter(Boolean).join(' · ');
        push({ role: 'system', text: `Lead captured: ${what} (demo, not stored)` });
      }
      if (reply.handover) push({ role: 'system', text: 'A team member (Alex) joined the conversation (demo)' });
    });
  };

  const confirmBooking = (c: { service: Service; start: Date; name: string; email: string }): string | null => {
    const [date, time] = [dayKey(c.start), `${String(c.start.getHours()).padStart(2, '0')}:${String(c.start.getMinutes()).padStart(2, '0')}`];
    const key = `${date} ${time}`;
    if (booked.has(key)) return 'That time was just taken. Pick another.';
    setBooked((prev) => new Set(prev).add(key));
    const ref = `KX-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    push({ role: 'user', text: `Book ${c.service.name}, ${fmtWhen(c.start)}` });
    runTrace(
      [
        { stage: 'input', note: 'Booking form submitted with a service, a slot and contact details.' },
        { stage: 'embed', note: 'Name and email validated. Service length read: ' + c.service.minutes + ' minutes.' },
        { stage: 'retrieve', note: 'Opening hours read from the knowledge base.' },
        { stage: 'rerank', note: `Slot ${time} re-checked at the moment of confirmation: still free.` },
        { stage: 'answer', note: 'Confirmation written.' },
        { stage: 'action', note: 'Booking saved to the calendar. A confirmation email would be sent here.' },
      ],
      () => {
        push({ role: 'system', text: `Booking confirmed: ${c.service.name}, ${fmtWhen(c.start)} (demo)` });
        push({ role: 'bot', text: 'You are all booked in. See you then!', confirmed: { ref, service: c.service, start: c.start, name: c.name } });
      }
    );
    return null;
  };

  const lastCardId = [...msgs].reverse().find((m) => m.card)?.id;
  const stageView = (i: number): 'idle' | 'active' | 'done' => {
    if (hasRun) return trace[STAGES[i].id].state;
    return !reduced && visible && idleIdx === i ? 'active' : 'idle';
  };
  const currentNote =
    hasRun && active >= 0 && active < STAGES.length ? trace[STAGES[active].id].note : STAGES[hasRun ? 0 : idleIdx].detail;

  return (
    <section id="playground" className="mk-section mk-pg-section" aria-labelledby="mk-pg-title">
      <div className="mk-wrap">
        <Reveal className="mk-center-head">
          <Eyebrow>{PIPELINE.eyebrow}</Eyebrow>
          <h2 id="mk-pg-title" className="mk-h2 mk-h2-center">
            {PIPELINE.title}
          </h2>
          <p className="mk-lead">{PIPELINE.intro}</p>
        </Reveal>

        <Reveal className="mk-pg" >
          <div ref={rootRef} className="mk-pg-grid">
            {/* Chat */}
            <div className="mk-pg-chat">
              <div className="mk-pg-chat-top">
                <span className="mk-pg-avatar" aria-hidden="true">
                  K
                </span>
                <div>
                  <b>{PLAYGROUND.business}</b>
                  <small>{PLAYGROUND.disclaimer}</small>
                </div>
              </div>
              <div className="mk-pg-log" data-lenis-prevent ref={logRef} role="log" aria-live="polite" aria-label="Demo conversation" tabIndex={0}>
                {msgs.length === 0 ? (
                  <div className="mk-pg-empty">
                    <p>Ask something, or try booking. Watch the pipeline react.</p>
                  </div>
                ) : null}
                {msgs.map((m) =>
                  m.role === 'system' ? (
                    <p key={m.id} className="mk-logline mk-pop">
                      {m.text}
                    </p>
                  ) : (
                    <div key={m.id} className={`mk-pg-row is-${m.role} mk-pop`}>
                      <p className={`mk-bubble ${m.role === 'user' ? 'mk-bubble-user' : 'mk-bubble-bot'}`}>
                        {m.text}
                        {m.source ? <span className="mk-source">Source: {m.source}</span> : null}
                      </p>
                      {m.card === 'booking' ? (
                        <BookingCard booked={booked} disabled={busy || m.id !== lastCardId} onConfirm={confirmBooking} />
                      ) : null}
                      {m.confirmed ? <ConfirmedCard c={m.confirmed} onAgain={() => send('I want to book another time')} /> : null}
                    </div>
                  )
                )}
                {busy ? (
                  <div className="mk-typing" aria-label="Assistant is typing">
                    <i />
                    <i />
                    <i />
                  </div>
                ) : null}
              </div>
              <div className="mk-pg-chips">
                {PLAYGROUND.starters.map((s) => (
                  <button key={s} type="button" className="mk-chip" disabled={busy} onClick={() => send(s)}>
                    {s}
                  </button>
                ))}
              </div>
              <form
                className="mk-pg-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
              >
                <label className="mk-sr" htmlFor="mk-pg-input">
                  Message the demo assistant
                </label>
                <input
                  id="mk-pg-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message"
                  maxLength={300}
                  autoComplete="off"
                  enterKeyHint="send"
                />
                <button type="submit" className="mk-btn mk-btn-primary mk-btn-sm" disabled={busy || !input.trim()}>
                  Send
                </button>
              </form>
            </div>

            {/* Pipeline */}
            <div className="mk-pg-pipe" aria-label="How the assistant processes each message">
              <p className="mk-pg-pipe-title">
                <span className={`mk-live ${busy ? 'is-fast' : ''}`} aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
                {busy ? 'Processing your message' : hasRun ? 'Last message processed' : 'Waiting for a message'}
              </p>
              <ol className="mk-pg-stages">
                {STAGES.map((s, i) => {
                  const st = stageView(i);
                  return (
                    <li key={s.id} className={`mk-pg-stage is-${st}`}>
                      <span className="mk-pg-node" aria-hidden="true">
                        {st === 'done' ? '✓' : i + 1}
                      </span>
                      <div>
                        <b>{s.label}</b>
                        <p>{hasRun && trace[s.id].note ? trace[s.id].note : st === 'active' ? s.detail : ''}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
              <p className="mk-sr" aria-live="polite">
                {currentNote}
              </p>
              <p className="mk-pg-foot">Verified knowledge base: {PLAYGROUND.knowledge.length} indexed passages. Real-time RAG inference.</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
