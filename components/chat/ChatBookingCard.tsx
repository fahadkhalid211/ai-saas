'use client';

import { T, useT } from '@/lib/i18n/context';
import React, { useState } from 'react';
import { Calendar, Clock, Check, RefreshCw, ExternalLink } from 'lucide-react';
import { generateGoogleCalendarUrl } from '@/lib/calendar/ical';

interface ChatBookingCardProps {
  assistantId?: string;
  primaryColor?: string;
  businessName?: string;
  onSuccess?: (appointment: any) => void;
  /** Conversation that produced this booking, for attribution. */
  conversationId?: string;
  /** 'playground' marks test bookings so they can be excluded from pilot metrics. */
  source?: 'chat' | 'playground';
}

export function ChatBookingCard({
  assistantId = 'demo-assistant',
  primaryColor = '#2563eb',
  businessName = 'Our Team',
  onSuccess,
  conversationId,
  source = 'chat',
}: ChatBookingCardProps) {
  const __t = useT();
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const [date, setDate] = useState(tomorrow);
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 10:30 AM');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any | null>(null);

  const defaultSlots = [
    '09:00 AM - 09:30 AM',
    '09:30 AM - 10:00 AM',
    '10:00 AM - 10:30 AM',
    '10:30 AM - 11:00 AM',
    '11:00 AM - 11:30 AM',
    '11:30 AM - 12:00 PM',
    '01:00 PM - 01:30 PM',
    '01:30 PM - 02:00 PM',
    '02:00 PM - 02:30 PM',
    '02:30 PM - 03:00 PM',
    '03:00 PM - 03:30 PM',
    '03:30 PM - 04:00 PM',
    '04:00 PM - 04:30 PM',
    '04:30 PM - 05:00 PM',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Please provide your name and email address.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assistantId,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          date,
          timeSlot,
          durationMinutes: 30,
          notes: notes.trim(),
          conversationId,
          source,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to schedule appointment');
      }

      const confirmedAppt = data.appointment || {
        name: name.trim(),
        date,
        timeSlot,
        email: email.trim(),
      };
      setSuccessData(confirmedAppt);
      if (onSuccess) {
        onSuccess(confirmedAppt);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to submit booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successData) {
    const googleCalUrl = generateGoogleCalendarUrl(
      {
        name: successData.name || name,
        email: successData.email || email,
        phone: successData.phone || phone,
        date: successData.date || date,
        timeSlot: successData.timeSlot || timeSlot,
        durationMinutes: 30,
        notes: notes.trim(),
      },
      businessName
    );

    return (
      <div className="mt-3 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-emerald-950/40 text-slate-900 dark:text-slate-100 space-y-3 text-xs shadow-xs">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
          <div className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700">
            <Check className="h-4 w-4" />
          </div>
          <span><T>Appointment Confirmed</T></span>
        </div>
        <p className="text-slate-700 dark:text-slate-300">
          <T>Thank you,</T> <strong>{successData.name || name}</strong><T>! We have reserved your appointment for</T>{' '}
          <strong>{successData.date || date}</strong> <T>at</T> <strong>{successData.timeSlot || timeSlot}</strong>.
        </p>
        <div className="flex items-center gap-2 pt-1">
          <a
            href={googleCalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span><T>Add to Google Calendar</T></span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm text-xs space-y-3.5">
      <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
        <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <span><T>Schedule an Appointment</T></span>
      </div>

      {error && (
        <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-[11px]">
          <T>{error}</T>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              <T>Select Date *</T>
            </label>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              <T>Time Slot *</T>
            </label>
            <select
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-500 text-xs cursor-pointer"
            >
              {defaultSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              <T>Full Name *</T>
            </label>
            <input
              type="text"
              placeholder={__t("Your Name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              <T>Email Address *</T>
            </label>
            <input
              type="email"
              placeholder={__t("name@company.com")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-500 text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              <T>Phone Number (Optional)</T>
            </label>
            <input
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              <T>Meeting Notes (Optional)</T>
            </label>
            <input
              type="text"
              placeholder={__t("Purpose of appointment...")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-500 text-xs"
            />
          </div>
        </div>

        <div className="pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            style={{ backgroundColor: primaryColor }}
            className="w-full py-2.5 rounded-lg text-white font-semibold text-xs shadow-xs hover:opacity-90 active:opacity-100 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span><T>Confirming Appointment...</T></span>
              </>
            ) : (
              <>
                <Clock className="h-3.5 w-3.5" />
                <span><T>Confirm Appointment</T></span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
