'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Check, CalendarDays } from 'lucide-react';

export interface BookingConfig {
  bookingEnabled?: boolean;
  bookingStartHour?: string;
  bookingEndHour?: string;
  bookingSlotDuration?: number;
  bookingAvailableDays?: string[];
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function toMinutes(hhmm: string, fallback: number): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm || '');
  return m ? Number(m[1]) * 60 + Number(m[2]) : fallback;
}
function label(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const suffix = h >= 12 ? 'PM' : 'AM';
  return `${String(h % 12 === 0 ? 12 : h % 12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`;
}
function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * The booking form shown inside the Crescelo assistant: pick a day, pick a free slot, add a name and e-mail.
 * It uses the same endpoints as the customer widget (/api/appointments), so a booking lands in the same place.
 */
export function PlatformBookingCard({ assistantId, config, note }: { assistantId: string; config: BookingConfig; note?: string }) {
  const duration = config.bookingSlotDuration || 30;
  const allowed = config.bookingAvailableDays?.length ? config.bookingAvailableDays : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const days = useMemo(() => {
    const out: Date[] = [];
    const d = new Date();
    for (let i = 0; i < 21 && out.length < 8; i++) {
      const c = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i);
      if (allowed.includes(DAYS[c.getDay()])) out.push(c);
    }
    return out;
  }, [allowed]);

  const [date, setDate] = useState<string>(() => (days[0] ? isoDate(days[0]) : ''));
  const [booked, setBooked] = useState<string[]>([]);
  const [slot, setSlot] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<{ date: string; slot: string } | null>(null);

  const slots = useMemo(() => {
    const start = toMinutes(config.bookingStartHour || '09:00', 540);
    const end = toMinutes(config.bookingEndHour || '17:00', 1020);
    const list: string[] = [];
    for (let t = start; t + duration <= end; t += duration) list.push(`${label(t)} - ${label(t + duration)}`);
    return list;
  }, [config.bookingStartHour, config.bookingEndHour, duration]);

  useEffect(() => {
    if (!date) return;
    let cancelled = false;
    setSlot('');
    fetch(`/api/appointments?assistantId=${encodeURIComponent(assistantId)}&checkDate=${date}`)
      .then((r) => (r.ok ? r.json() : { bookedSlots: [] }))
      .then((d) => !cancelled && setBooked(d.bookedSlots || []))
      .catch(() => !cancelled && setBooked([]));
    return () => {
      cancelled = true;
    };
  }, [assistantId, date]);

  const canSubmit = Boolean(date && slot && name.trim().length >= 2 && /^\S+@\S+\.\S+$/.test(email.trim())) && !busy;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assistantId,
          name: name.trim(),
          email: email.trim(),
          phone: '',
          date,
          timeSlot: slot,
          durationMinutes: duration,
          notes: note || 'Booked from the Crescelo assistant',
          source: 'chat',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(res.status === 409 ? 'That slot was just taken. Please pick another.' : data.error || 'Could not book that slot.');
      setDone({ date, slot });
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="mt-2 rounded-2xl border border-[#abff44]/30 bg-[#abff44]/[0.07] p-3.5 text-[13px] text-[#e8e5dc]" role="status">
        <div className="flex items-center gap-2 font-semibold text-[#abff44]">
          <Check className="w-4 h-4" />
          <span>You are booked</span>
        </div>
        <p className="mt-1.5 leading-relaxed">
          {done.date} at {done.slot}. A confirmation is on its way to {email.trim()}.
        </p>
      </div>
    );
  }

  const field =
    'w-full rounded-xl border border-white/10 bg-[#262624] px-3 py-2 text-[13px] text-[#faf9f5] placeholder-[#8b8981] outline-none focus:border-[#abff44]/50 selection:bg-white/20';

  return (
    <form onSubmit={submit} className="mt-2 rounded-2xl border border-white/10 bg-[#262624]/70 p-3.5 space-y-3" aria-label="Book a time">
      <div className="flex items-center gap-2 text-[12px] font-semibold text-[#faf9f5]">
        <CalendarDays className="w-4 h-4 text-[#abff44]" />
        <span>Pick a day and time</span>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
        {days.map((d) => {
          const v = isoDate(d);
          const on = v === date;
          return (
            <button
              key={v}
              type="button"
              onClick={() => setDate(v)}
              className={`shrink-0 rounded-xl border px-2.5 py-1.5 text-center text-[11px] leading-tight transition ${
                on ? 'border-[#abff44] bg-[#abff44] text-[#08251a] font-semibold' : 'border-white/10 bg-white/[0.04] text-[#d8d5cb] hover:border-white/25'
              }`}
              aria-pressed={on}
            >
              <div>{d.toLocaleDateString(undefined, { weekday: 'short' })}</div>
              <div className="text-[13px]">{d.getDate()}</div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-0.5">
        {slots.map((s) => {
          const taken = booked.includes(s);
          const on = s === slot;
          return (
            <button
              key={s}
              type="button"
              disabled={taken}
              onClick={() => setSlot(s)}
              className={`rounded-lg border px-2 py-1.5 text-[11px] transition ${
                taken
                  ? 'border-white/5 text-[#666560] line-through cursor-not-allowed'
                  : on
                    ? 'border-[#abff44] bg-[#abff44]/15 text-[#faf9f5] font-semibold'
                    : 'border-white/10 bg-white/[0.04] text-[#d8d5cb] hover:border-white/25'
              }`}
              aria-pressed={on}
            >
              {s.split(' - ')[0]}
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        <input className={field} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} aria-label="Your name" autoComplete="name" />
        <input className={field} type="email" placeholder="Your email for the confirmation" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Your email" autoComplete="email" />
      </div>

      {error && <p className="text-[12px] text-rose-300" role="alert">{error}</p>}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-xl bg-[#abff44] py-2.5 text-[13px] font-semibold text-[#08251a] transition hover:brightness-105 active:scale-[0.99] disabled:opacity-35"
      >
        {busy ? 'Booking…' : 'Confirm booking'}
      </button>
    </form>
  );
}
