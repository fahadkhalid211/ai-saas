import { T } from '@/lib/i18n/context';
import React, { useState } from 'react';
import {
  Calendar,
  RefreshCw,
  Download,
  CheckCircle2,
  Search,
  Phone,
  Globe,
  ExternalLink,
  Bot,
  Clock,
  Trash2,
  X,
  Copy,
  Check,
  Share2,
} from 'lucide-react';

export interface Appointment {
  id: string;
  assistantId: string;
  name: string;
  email: string;
  phone?: string;
  date: string;
  timeSlot: string;
  durationMinutes: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  landingPageName?: string;
  landingPageSlug?: string;
  createdAt: string;
}

export interface AppointmentsTabProps {
  activeAssistant: any;
  setActiveTab: (tab: any) => void;
  appointments: Appointment[];
  isSyncingAppointments: boolean;
  setSelectedAppointmentModal: (apt: Appointment | null) => void;
  handleManualSyncAppointments: () => void;
  handleUpdateAppointmentStatus: (id: string, status: any) => Promise<void>;
  handleDeleteAppointment: (id: string) => Promise<void>;
}

export const AppointmentsTab: React.FC<AppointmentsTabProps> = ({
  activeAssistant,
  setActiveTab,
  appointments,
  isSyncingAppointments,
  setSelectedAppointmentModal,
  handleManualSyncAppointments,
  handleUpdateAppointmentStatus,
  handleDeleteAppointment,
}) => {
  const [appointmentFilter, setAppointmentFilter] = useState<'all' | 'confirmed' | 'pending' | 'completed' | 'cancelled'>('all');
  const [appointmentSearch, setAppointmentSearch] = useState('');
  const [showCalendarSyncModal, setShowCalendarSyncModal] = useState(false);
  const [copiedFeedUrl, setCopiedFeedUrl] = useState(false);

  return (
              <div className="max-w-6xl space-y-6 mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                      <Calendar className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                      <span><T>Appointments</T></span>
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <T>View and manage bookings made by customers through your assistant.</T>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span><T>Live Sync Active</T></span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowCalendarSyncModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold shadow-xs transition cursor-pointer"
                      title="Sync with Google Calendar, Outlook, and Apple Calendar"
                    >
                      <Share2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span><T>Calendar Sync (.ics)</T></span>
                    </button>

                    <button
                      type="button"
                      onClick={handleManualSyncAppointments}
                      disabled={isSyncingAppointments}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-xs disabled:opacity-50 transition cursor-pointer"
                      title="Fetch newest appointments"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isSyncingAppointments ? 'animate-spin text-emerald-600' : 'text-slate-500'}`} />
                      <span>{isSyncingAppointments ? <T>{'Syncing...'}</T> : <T>{'Sync Now'}</T>}</span>
                    </button>

                    <button
                      onClick={() => {
                        const csvHeader = 'ID,Name,Email,Phone,Date,TimeSlot,DurationMinutes,Status,Notes,LandingPage,CreatedAt\n';
                        const csvRows = appointments
                          .map((a) => {
                            return `"${a.id}","${(a.name || '').replace(/"/g, '""')}","${a.email}","${(a.phone || '').replace(/"/g, '""')}","${a.date}","${a.timeSlot}","${a.durationMinutes}","${a.status}","${(a.notes || '').replace(/"/g, '""')}","${(a.landingPageName || '').replace(/"/g, '""')}","${a.createdAt}"`;
                          })
                          .join('\n');
                        const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', `appointments-${activeAssistant?.name || 'export'}-${new Date().toISOString().slice(0, 10)}.csv`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        setTimeout(() => URL.revokeObjectURL(url), 1000);
                      }}
                      disabled={appointments.length === 0}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span><T>Export CSV</T></span>
                    </button>
                  </div>
                </div>

                {/* Key Metrics Overview */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <T>Total Bookings</T>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                      {appointments.length}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5"><T>All-time appointments</T></div>
                  </div>

                  <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs">
                    <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider flex items-center justify-between">
                      <span><T>Confirmed</T></span>
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">
                      {appointments.filter((a) => a.status === 'confirmed').length}
                    </div>
                    <div className="text-[10px] text-emerald-700 dark:text-emerald-400/75 mt-0.5"><T>Ready for call/meeting</T></div>
                  </div>

                  <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 shadow-xs">
                    <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider flex items-center justify-between">
                      <span><T>Pending</T></span>
                      <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                    </div>
                    <div className="text-2xl font-bold text-amber-700 dark:text-amber-300 mt-1">
                      {appointments.filter((a) => a.status === 'pending').length}
                    </div>
                    <div className="text-[10px] text-amber-700 dark:text-amber-400/75 mt-0.5"><T>Awaiting team review</T></div>
                  </div>

                  <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs">
                    <div className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider flex items-center justify-between">
                      <span><T>Completed</T></span>
                      <CheckCircle2 className="h-3 w-3 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">
                      {appointments.filter((a) => a.status === 'completed').length}
                    </div>
                    <div className="text-[10px] text-blue-700 dark:text-blue-400/75 mt-0.5"><T>Consultations finished</T></div>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { id: 'all', label: 'All Slots', count: appointments.length },
                      { id: 'confirmed', label: 'Confirmed', count: appointments.filter((a) => a.status === 'confirmed').length },
                      { id: 'pending', label: 'Pending', count: appointments.filter((a) => a.status === 'pending').length },
                      { id: 'completed', label: 'Completed', count: appointments.filter((a) => a.status === 'completed').length },
                      { id: 'cancelled', label: 'Cancelled', count: appointments.filter((a) => a.status === 'cancelled').length },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setAppointmentFilter(f.id as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                          appointmentFilter === f.id
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span><T>{f.label}</T></span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                          appointmentFilter === f.id ? 'bg-emerald-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}>
                          {f.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search appointments..."
                      value={appointmentSearch}
                      onChange={(e) => setAppointmentSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500"
                    />
                    {appointmentSearch && (
                      <button
                        type="button"
                        onClick={() => setAppointmentSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Appointments Table */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
                  {appointments.length === 0 ? (
                    <div className="p-10 text-center space-y-3">
                      <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white"><T>No appointments booked yet</T></div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        <T>Visitors can book calls, consultations, and demos directly through the AI chat widget or by asking the bot to book a slot.</T>
                      </p>
                      <div className="flex justify-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setActiveTab('widget')}
                          className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition cursor-pointer"
                        >
                          <T>Configure Slot Duration &amp; Hours</T>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('playground')}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                        >
                          <T>Test in Studio</T>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            <th className="py-3 px-5"><T>Client / Contact</T></th>
                            <th className="py-3 px-5"><T>Landing Page / Source</T></th>
                            <th className="py-3 px-5"><T>Date &amp; Time Slot</T></th>
                            <th className="py-3 px-5"><T>Duration</T></th>
                            <th className="py-3 px-5"><T>Meeting Topic / Notes</T></th>
                            <th className="py-3 px-5"><T>Status</T></th>
                            <th className="py-3 px-5"><T>Booked On</T></th>
                            <th className="py-3 px-5 text-right"><T>Actions</T></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {appointments
                            .filter((apt) => {
                              if (appointmentFilter !== 'all' && apt.status !== appointmentFilter) return false;
                              if (!appointmentSearch.trim()) return true;
                              const q = appointmentSearch.toLowerCase();
                              return (
                                apt.name.toLowerCase().includes(q) ||
                                apt.email.toLowerCase().includes(q) ||
                                (apt.phone && apt.phone.toLowerCase().includes(q)) ||
                                apt.date.toLowerCase().includes(q) ||
                                apt.timeSlot.toLowerCase().includes(q) ||
                                (apt.notes && apt.notes.toLowerCase().includes(q))
                              );
                            })
                            .map((apt) => {
                              const durationLabel = apt.durationMinutes >= 60 
                                ? `${Math.floor(apt.durationMinutes / 60)}h${apt.durationMinutes % 60 > 0 ? ` ${apt.durationMinutes % 60}m` : ''}` 
                                : `${apt.durationMinutes}m`;
                              return (
                                <tr key={apt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                                  <td className="py-3.5 px-5">
                                    <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                                      <span><T>{apt.name}</T></span>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <a
                                        href={`mailto:${apt.email}?subject=Regarding%20Your%20Appointment%20on%20${encodeURIComponent(apt.date)}`}
                                        className="text-blue-600 dark:text-blue-400 font-mono text-[11px] hover:underline"
                                      >
                                        {apt.email}
                                      </a>
                                    </div>
                                    {apt.phone && (
                                      <div className="text-slate-500 dark:text-slate-400 font-mono text-[10px] mt-0.5">
                                        <Phone className="h-3 w-3 text-slate-400 inline mr-1" />{apt.phone}
                                      </div>
                                    )}
                                  </td>

                                  {/* Landing Page Source Column Badge */}
                                  <td className="py-3.5 px-5 whitespace-nowrap">
                                    {apt.landingPageName ? (
                                      <a
                                        href={`/site/${apt.landingPageSlug || 'default'}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors"
                                        title={`Booking Source: ${apt.landingPageName} (/site/${apt.landingPageSlug})`}
                                      >
                                        <Globe className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                                        <span>{apt.landingPageName}</span>
                                        <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                                      </a>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                        <Bot className="h-3 w-3 text-slate-400" />
                                        <span><T>Direct Widget</T></span>
                                      </span>
                                    )}
                                  </td>

                                  <td className="py-3.5 px-5 whitespace-nowrap">
                                    <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                                      <Calendar className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                      <span>{apt.date}</span>
                                    </div>
                                    <div className="text-slate-600 dark:text-slate-300 font-medium text-[11px] mt-0.5">
                                      <Clock className="h-3 w-3 text-slate-400 inline mr-1" />{apt.timeSlot}
                                    </div>
                                  </td>

                                  <td className="py-3.5 px-5 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                      {durationLabel}
                                    </span>
                                  </td>

                                  <td className="py-3.5 px-5 max-w-xs">
                                    <div className="text-slate-700 dark:text-slate-300 line-clamp-2">
                                      {apt.notes || <span className="text-slate-400 italic"><T>No notes attached</T></span>}
                                    </div>
                                  </td>

                                  <td className="py-3.5 px-5 whitespace-nowrap">
                                    <select
                                      value={apt.status}
                                      onChange={(e) => handleUpdateAppointmentStatus(apt.id, e.target.value as any)}
                                      className={`text-[11px] font-semibold rounded-lg px-2 py-1 border outline-none cursor-pointer ${
                                        apt.status === 'confirmed'
                                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                                          : apt.status === 'pending'
                                          ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200'
                                          : apt.status === 'completed'
                                          ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-200'
                                          : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                                      }`}
                                    >
                                      <option value="confirmed">Confirmed</option>
                                      <option value="pending">Pending</option>
                                      <option value="completed">Completed</option>
                                      <option value="cancelled">Cancelled</option>
                                    </select>
                                  </td>

                                  <td className="py-3.5 px-5 text-slate-500 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                                    {new Date(apt.createdAt).toLocaleDateString()}{' '}
                                    <span className="text-[10px] opacity-75">
                                      {new Date(apt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </td>

                                  <td className="py-3.5 px-5 text-right whitespace-nowrap">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => setSelectedAppointmentModal(apt)}
                                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 px-2.5 py-1 rounded transition cursor-pointer"
                                      >
                                        <T>Details</T>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteAppointment(apt.id)}
                                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                                        title="Delete appointment"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Calendar Sync & Webcal Modal */}
                {showCalendarSyncModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
                    <div className="w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-5 animate-in fade-in duration-150">
                      <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            <Calendar className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                              <T>Live Calendar Sync (iCal / Webcal)</T>
                            </h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              <T>Real-time two-way synchronization with Google Calendar, Outlook, and Apple Calendar.</T>
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowCalendarSyncModal(false)}
                          className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="space-y-4 text-xs">
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                            <T>Your Live Calendar Subscription Feed URL</T>
                          </label>
                        {(() => {
                          const feedTokenParam = activeAssistant?.calendarFeedToken
                            ? `&token=${encodeURIComponent(activeAssistant.calendarFeedToken)}`
                            : '';
                          return (
                            <>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  readOnly
                                  value={
                                    typeof window !== 'undefined'
                                      ? `${window.location.origin}/api/appointments/calendar?assistantId=${activeAssistant?.id || 'demo-assistant'}${feedTokenParam}`
                                      : `/api/appointments/calendar?assistantId=${activeAssistant?.id || 'demo-assistant'}${feedTokenParam}`
                                  }
                                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 font-mono text-xs text-slate-800 dark:text-slate-200 select-all outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const feedUrl = `${window.location.origin}/api/appointments/calendar?assistantId=${activeAssistant?.id || 'demo-assistant'}${feedTokenParam}`;
                                    navigator.clipboard.writeText(feedUrl);
                                    setCopiedFeedUrl(true);
                                    setTimeout(() => setCopiedFeedUrl(false), 2500);
                                  }}
                                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs transition cursor-pointer shrink-0"
                                >
                                  {copiedFeedUrl ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                  <span>{copiedFeedUrl ? <T>{'Copied!'}</T> : <T>{'Copy Feed'}</T>}</span>
                                </button>
                              </div>

                              {/* Direct Actions */}
                              <div className="flex flex-wrap items-center gap-2 pt-1">
                                <a
                                  href={`/api/appointments/calendar?assistantId=${activeAssistant?.id || 'demo-assistant'}${feedTokenParam}`}
                                  download="appointments.ics"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition cursor-pointer"
                                >
                                  <Download className="h-3.5 w-3.5 text-slate-500" />
                                  <span><T>Download Offline .ics</T></span>
                                </a>

                                <a
                                  href={
                                    typeof window !== 'undefined'
                                      ? `webcal://${window.location.host}/api/appointments/calendar?assistantId=${activeAssistant?.id || 'demo-assistant'}${feedTokenParam}`
                                      : '#'
                                  }
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold transition cursor-pointer"
                                >
                                  <Calendar className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                  <span><T>Subscribe in Apple / Outlook Calendar</T></span>
                                </a>
                              </div>
                            </>
                          );
                        })()}
                        </div>

                        {/* Setup Instructions Cards */}
                        <div className="space-y-2.5 pt-2">
                          <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            <T>How to Subscribe by App</T>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                                <span><T>Google Calendar</T></span>
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                                <T>Open Google Calendar &gt; Other calendars (+) &gt;</T> <strong><T>From URL</T></strong> <T>&gt; Paste your feed URL and click Add calendar.</T>
                              </p>
                            </div>

                            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-sky-500"></span>
                                <span><T>Microsoft Outlook</T></span>
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                                <T>Go to Outlook Calendar &gt;</T> <strong><T>Add Calendar</T></strong> &gt; <strong><T>Subscribe from web</T></strong> <T>&gt; Paste URL &gt; Click Import.</T>
                              </p>
                            </div>

                            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                                <span><T>Apple Calendar</T></span>
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                                <T>In Calendar, click</T> <strong><T>File &gt; New Calendar Subscription</T></strong> <T>&gt; Paste URL &gt; Choose refresh interval.</T>
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                          <button
                            type="button"
                            onClick={() => setShowCalendarSyncModal(false)}
                            className="rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-4 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 transition cursor-pointer"
                          >
                            <T>Close</T>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
  );
};
