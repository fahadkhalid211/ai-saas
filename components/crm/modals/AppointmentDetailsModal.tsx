'use client';

import { T, useT } from '@/lib/i18n/context';
import React from 'react';
import { Calendar, X, ExternalLink, Download } from 'lucide-react';
import { Appointment } from '@/components/crm/AppointmentsTab';
import { generateGoogleCalendarUrl, generateOutlookCalendarUrl, generateSingleIcs } from '@/lib/calendar/ical';

export interface AppointmentDetailsModalProps {
  appt: Appointment | null;
  onClose: () => void;
  onStatusChange: (id: string, status: 'pending' | 'confirmed' | 'cancelled' | 'completed') => void | Promise<void>;
}

export const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  appt,
  onClose,
  onStatusChange,
}) => {
  const __t = useT();
  if (!appt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-5 animate-in fade-in duration-150">
        <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                <T>Appointment Details</T>
              </h3>
              <div className="text-[11px] text-slate-500 font-mono">
                <T>ID:</T> {appt.id}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                <T>Client Name</T>
              </div>
              <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                <T>{appt.name}</T>
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                <T>Email Address</T>
              </div>
              <div className="font-mono text-blue-600 dark:text-blue-400 mt-0.5">
                {appt.email}
              </div>
            </div>
            {appt.phone && (
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                  <T>Phone Number</T>
                </div>
                <div className="font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                  {appt.phone}
                </div>
              </div>
            )}
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                <T>Booking Status</T>
              </div>
              <div className="mt-0.5">
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  appt.status === 'confirmed'
                    ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                    : appt.status === 'pending'
                    ? 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                    : appt.status === 'completed'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                    : 'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200'
                }`}>
                  <T>{appt.status}</T>
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-1.5">
            <div className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 tracking-wider">
              <T>Scheduled Time Slot</T>
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-600" />
              <span>{appt.date}</span>
              <span>•</span>
              <span>{appt.timeSlot}</span>
            </div>
            <div className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold">
              <T>Duration:</T> {appt.durationMinutes >= 60 ? __t("{n1} Hour(s)", { n1: Math.floor(appt.durationMinutes / 60) }) : __t("{durationMinutes} Minutes", { durationMinutes: appt.durationMinutes })}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              <T>Meeting Notes / Visitor Inquiries</T>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
              {appt.notes || <span className="text-slate-400 italic"><T>No notes provided for this booking.</T></span>}
            </div>
          </div>

          {/* Calendar Sync Shortcuts */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 space-y-2">
            <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
              <T>Export &amp; Add to Calendar</T>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href={generateGoogleCalendarUrl(
                  {
                    name: appt.name,
                    email: appt.email,
                    phone: appt.phone,
                    date: appt.date,
                    timeSlot: appt.timeSlot,
                    durationMinutes: appt.durationMinutes,
                    notes: appt.notes,
                  },
                  'Client Consultation',
                  'Our Office'
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-2xs transition"
              >
                <Calendar className="h-3.5 w-3.5 text-blue-600" />
                <span><T>Add to Google Calendar</T></span>
              </a>

              <a
                href={generateOutlookCalendarUrl(
                  {
                    name: appt.name,
                    email: appt.email,
                    phone: appt.phone,
                    date: appt.date,
                    timeSlot: appt.timeSlot,
                    durationMinutes: appt.durationMinutes,
                    notes: appt.notes,
                  },
                  'Client Consultation',
                  'Our Office'
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-2xs transition"
              >
                <Calendar className="h-3.5 w-3.5 text-sky-600" />
                <span><T>Add to Outlook</T></span>
              </a>

              <button
                type="button"
                onClick={() => {
                  const ics = generateSingleIcs(appt, 'Client Consultation');
                  const blob = new Blob([ics], { type: 'text/calendar' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `appointment-${appt.id}.ics`;
                  link.click();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-2xs transition cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-emerald-600" />
                <span><T>Download .ics</T></span>
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500"><T>Change Status:</T></span>
              <select
                value={appt.status}
                onChange={(e) => onStatusChange(appt.id, e.target.value as any)}
                className="text-xs font-semibold rounded-lg px-2 py-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
              >
                <option value="confirmed">{__t("Confirmed")}</option>
                <option value="pending">{__t("Pending")}</option>
                <option value="completed">{__t("Completed")}</option>
                <option value="cancelled">{__t("Cancelled")}</option>
              </select>
            </div>
            <div className="flex gap-2">
              <a
                href={`mailto:${appt.email}?subject=Regarding%20Your%20Scheduled%20Appointment%20(${appt.date}%20at%20${encodeURIComponent(appt.timeSlot)})`}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <span><T>Email Client</T></span>
                <ExternalLink className="h-3 w-3" />
              </a>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-200 dark:border-slate-700 px-3.5 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <T>Close</T>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
