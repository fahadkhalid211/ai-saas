import { T, useT } from '@/lib/i18n/context';
import { SaveButton } from '@/components/ui/SaveButton';
import React, { useEffect, useState } from 'react';
import { WIDGET_TITLE_MAX, starterQuestionsFromText, widgetTitleFor } from '@/lib/widget/title';
import {
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Calendar,
  Check,
  Mail,
  Plus,
  Trash2,
  Send,
} from 'lucide-react';
import { CresceloMark } from '@/components/brand/CresceloMark';
import { CalendarLinksPanel } from '@/components/crm/CalendarLinksPanel';

export interface SupportCustomField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'tel' | 'select';
  required: boolean;
  options?: string[];
}

export interface WidgetTabProps {
  formData: any;
  setFormData: (data: any) => void;
  handleSaveSettings: () => void;
  isSaving: boolean;
  saveSuccess: boolean;
  saveError: string | null;
}

export const WidgetTab: React.FC<WidgetTabProps> = ({
  formData,
  setFormData,
  handleSaveSettings,
  isSaving,
  saveSuccess,
  saveError,
}) => {
  const __t = useT();
  // The starter questions are edited as plain text. Deriving the box from the saved list on every keystroke dropped the
  // empty line that Enter creates, so a second question could never be started.
  const [starterText, setStarterText] = useState<string>((formData.starterQuestions || []).join('\n'));
  useEffect(() => {
    // another assistant was opened, or the saved list changed outside this box
    const saved = (formData.starterQuestions || []).join('\n');
    setStarterText((current) => (starterQuestionsFromText(current).join('\n') === saved ? current : saved));
  }, [formData.id, (formData.starterQuestions || []).join('\n')]);

  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'textarea' | 'tel' | 'select'>('text');
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [newFieldOptions, setNewFieldOptions] = useState('');
  const [showAddFieldForm, setShowAddFieldForm] = useState(false);

  const handleAddCustomField = () => {
    if (!newFieldLabel.trim()) return;
    const currentFields = formData.supportCustomFields || [];
    const newField: SupportCustomField = {
      id: 'field_' + Math.random().toString(36).substring(2, 9),
      label: newFieldLabel.trim(),
      type: newFieldType,
      required: newFieldRequired,
      options:
        newFieldType === 'select'
          ? newFieldOptions
              .split(',')
              .map((o) => o.trim())
              .filter(Boolean)
          : undefined,
    };
    setFormData({
      ...formData,
      supportCustomFields: [...currentFields, newField],
    });
    setNewFieldLabel('');
    setNewFieldType('text');
    setNewFieldRequired(false);
    setNewFieldOptions('');
    setShowAddFieldForm(false);
  };

  const handleRemoveCustomField = (id: string) => {
    const currentFields = formData.supportCustomFields || [];
    setFormData({
      ...formData,
      supportCustomFields: currentFields.filter((f: any) => f.id !== id),
    });
  };

  return (
              <div className="max-w-5xl space-y-6 mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white"><T>Widget &amp; Branding</T></h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <T>Change how the chat button looks on your website — colors, position, greeting, and logo.</T>
                    </p>
                  </div>
                  <SaveButton onClick={handleSaveSettings} saving={isSaving} idleLabel="Save Widget Settings" savingLabel="Saving Settings…" savedLabel="Saved Successfully" icon={<CheckCircle2 className="h-3.5 w-3.5" />} className="self-start sm:self-auto" />
                </div>

                {saveSuccess && (
                  <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-3 text-xs text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span><T>Widget &amp; support settings saved successfully!</T></span>
                  </div>
                )}

                {saveError && (
                  <div className="flex items-center gap-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 p-3 text-xs text-rose-700 dark:text-rose-300">
                    <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
                    <span><T>{saveError}</T></span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Configuration controls */}
                  <div className="space-y-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                    {/* Chat title */}
                    <div>
                      <label htmlFor="widget-title" className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                        <T>Chat title</T>
                      </label>
                      <input
                        id="widget-title"
                        type="text"
                        maxLength={WIDGET_TITLE_MAX}
                        value={formData.widgetTitle || ''}
                        onChange={(e) => setFormData({ ...formData, widgetTitle: e.target.value })}
                        placeholder={formData.name || 'AI Assistant'}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                      />
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        <T>The name visitors see at the top of the chat, up to</T> {WIDGET_TITLE_MAX} <T>characters. Leave it empty to show &ldquo;</T>{formData.name || <T>{'AI Assistant'}</T>}&rdquo;.
                      </p>
                    </div>

                    {/* Brand Color */}
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                        <T>Brand Accent Color</T>
                      </label>
                      <div className="flex items-center gap-3">
                        {['#2563eb', '#7c3aed', '#059669', '#e11d48', '#d97706', '#0f172a'].map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setFormData({ ...formData, primaryColor: c })}
                            style={{ backgroundColor: c }}
                            className={`h-8 w-8 rounded-full border-2 transition ${
                              formData.primaryColor === c ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent'
                            }`}
                          />
                        ))}
                        <input
                          type="text"
                          value={formData.primaryColor || '#2563eb'}
                          onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                          className="w-24 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-mono outline-none"
                        />
                      </div>
                    </div>

                    {/* Launcher Position */}
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                        <T>Launcher Position</T>
                      </label>
                      <div className="flex gap-3">
                        {['bottom-right', 'bottom-left'].map((pos) => (
                          <button
                            key={pos}
                            type="button"
                            onClick={() => setFormData({ ...formData, launcherPosition: pos })}
                            className={`rounded-lg border px-4 py-2 text-xs font-semibold capitalize transition ${
                              formData.launcherPosition === pos
                                ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 text-blue-700 dark:text-blue-400'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {pos.replace('-', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Starter Questions */}
                    <div>
                      <label htmlFor="widget-starters" className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                        <T>Suggested Starter Questions (1 per line)</T>
                      </label>
                      <textarea
                        id="widget-starters"
                        rows={4}
                        value={starterText}
                        onChange={(e) => {
                          setStarterText(e.target.value);
                          setFormData({ ...formData, starterQuestions: starterQuestionsFromText(e.target.value) });
                        }}
                        placeholder={'What are your prices?\nWhat are your opening hours?'}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Lead Capture Toggle */}
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-3.5">
                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-white"><T>Lead Capture Form</T></div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400"><T>Ask visitor for email address during chat</T></div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.collectLeadEmail || false}
                        onChange={(e) => setFormData({ ...formData, collectLeadEmail: e.target.checked })}
                        className="h-4 w-4 rounded accent-blue-600"
                      />
                    </div>

                    {/* Proactive Engagement Popup Automation */}
                    <div className="rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Zap className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                            <span><T>Proactive Chat Popup (Conversion Booster)</T></span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            <T>Automatically pops up a friendly message bubble above the closed launcher to greet visitors.</T>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.proactiveMessageEnabled || false}
                          onChange={(e) => setFormData({ ...formData, proactiveMessageEnabled: e.target.checked })}
                          className="h-4 w-4 rounded accent-blue-600"
                        />
                      </div>

                      {formData.proactiveMessageEnabled && (
                        <div className="space-y-3 pt-2 border-t border-blue-100 dark:border-blue-900/40 animate-in fade-in duration-150">
                          <div>
                            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                              <T>Popup Message Text</T>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Have questions about our pricing or plans? I'm here to help!"
                              value={formData.proactiveMessageText || ''}
                              onChange={(e) => setFormData({ ...formData, proactiveMessageText: e.target.value })}
                              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                              <T>Trigger Delay (Seconds)</T>
                            </label>
                            <div className="flex items-center gap-3">
                              <input
                                type="number"
                                min={1}
                                max={60}
                                value={formData.proactiveMessageDelay ?? 5}
                                onChange={(e) =>
                                  setFormData({ ...formData, proactiveMessageDelay: parseInt(e.target.value) || 5 })
                                }
                                className="w-20 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-mono outline-none"
                              />
                              <span className="text-[11px] text-slate-500 dark:text-slate-400"><T>seconds after page loads</T></span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Interactive Calendar & Appointment Booking */}
                    <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span><T>Interactive Calendar &amp; Appointment Booking</T></span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            <T>Allows visitors to schedule calls, consultations, tours, and demos directly inside the chat widget.</T>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.bookingEnabled || false}
                          onChange={(e) => setFormData({ ...formData, bookingEnabled: e.target.checked })}
                          className="h-4 w-4 rounded accent-emerald-600"
                        />
                      </div>

                      {formData.bookingEnabled && (
                        <div className="space-y-3 pt-2 border-t border-emerald-100 dark:border-emerald-900/40 animate-in fade-in duration-150">
                          <div>
                            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                              <T>Booking Prompt Button Text</T>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Schedule a Free 15-Minute Consultation"
                              value={formData.bookingPromptText || ''}
                              onChange={(e) => setFormData({ ...formData, bookingPromptText: e.target.value })}
                              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                              <T>Booking Provider</T>
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                { id: 'direct', label: 'Direct Date Picker', desc: 'Built-in slot picker' },
                                { id: 'calendly', label: 'Calendly', desc: 'Calendly booking link' },
                                { id: 'cal_com', label: 'Cal.com', desc: 'Cal.com link' },
                              ].map((p) => (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, bookingProvider: p.id as any })}
                                  className={`p-2.5 rounded-lg border text-left transition ${
                                    (formData.bookingProvider || 'direct') === p.id
                                      ? 'border-emerald-600 bg-emerald-100/50 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 font-semibold'
                                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                                  }`}
                                >
                                  <div className="text-xs"><T>{p.label}</T></div>
                                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5"><T>{p.desc}</T></div>
                                </button>
                              ))}
                            </div>
                          </div>

                          {(!formData.bookingProvider || formData.bookingProvider === 'direct') && (
                            <div className="space-y-3 pt-2.5 border-t border-dashed border-emerald-200 dark:border-emerald-800">
                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                    <T>Appointment Slot Duration</T>
                                  </label>
                                  <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60">
                                    {(formData.bookingSlotDuration || 30) >= 60 
                                      ? __t("{n1} Hour(s)", { n1: (formData.bookingSlotDuration || 30) / 60 }) 
                                      : __t("{n1} Mins", { n1: formData.bookingSlotDuration || 30 })}
                                  </span>
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                                  {[
                                    { duration: 15, label: '15 Mins' },
                                    { duration: 30, label: '30 Mins' },
                                    { duration: 45, label: '45 Mins' },
                                    { duration: 60, label: '1 Hour' },
                                    { duration: 90, label: '90 Mins' },
                                    { duration: 120, label: '2 Hours' },
                                  ].map((opt) => (
                                    <button
                                      key={opt.duration}
                                      type="button"
                                      onClick={() => setFormData({ ...formData, bookingSlotDuration: opt.duration })}
                                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold border text-center transition cursor-pointer ${
                                        (formData.bookingSlotDuration || 30) === opt.duration
                                          ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                      }`}
                                    >
                                      <T>{opt.label}</T>
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                                    <T>Daily Start Time</T>
                                  </label>
                                  <input
                                    type="time"
                                    value={formData.bookingStartHour || '09:00'}
                                    onChange={(e) => setFormData({ ...formData, bookingStartHour: e.target.value })}
                                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-mono outline-none focus:border-emerald-500"
                                  />
                                </div>
                                <div>
                                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                                    <T>Daily End Time</T>
                                  </label>
                                  <input
                                    type="time"
                                    value={formData.bookingEndHour || '17:00'}
                                    onChange={(e) => setFormData({ ...formData, bookingEndHour: e.target.value })}
                                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-mono outline-none focus:border-emerald-500"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                                  <T>Available Working Days</T>
                                </label>
                                <div className="flex flex-wrap gap-1.5">
                                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                                    const currentDays: string[] = formData.bookingAvailableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
                                    const isSelected = currentDays.includes(day);
                                    return (
                                      <button
                                        key={day}
                                        type="button"
                                        onClick={() => {
                                          const nextDays = isSelected
                                            ? currentDays.filter((d: string) => d !== day)
                                            : [...currentDays, day];
                                          setFormData({ ...formData, bookingAvailableDays: nextDays });
                                        }}
                                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition cursor-pointer ${
                                          isSelected
                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold'
                                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:text-slate-600'
                                        }`}
                                      >
                                        <span className="flex items-center gap-1">{isSelected && <Check className="h-3 w-3 inline" />}{day.slice(0, 3)}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              <CalendarLinksPanel key={formData.id} assistantId={formData.id} />
                            </div>
                          )}

                          {formData.bookingProvider === 'cal_com' && (
                            <div className="animate-in fade-in duration-150">
                              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                                <T>Cal.com Scheduling URL</T>
                              </label>
                              <input
                                type="url"
                                placeholder="https://cal.com/your-username/30min"
                                value={formData.bookingUrl || ''}
                                onChange={(e) => setFormData({ ...formData, bookingUrl: e.target.value })}
                                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-mono outline-none focus:border-emerald-500"
                              />
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                                <T>Visitors will be presented with a direct button to open your Cal.com event page.</T>
                              </p>
                            </div>
                          )}

                          {formData.bookingProvider === 'calendly' && (
                            <div className="animate-in fade-in duration-150">
                              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                                <T>Calendly Booking URL</T>
                              </label>
                              <input
                                type="url"
                                placeholder="https://calendly.com/your-business/30min"
                                value={formData.bookingUrl || ''}
                                onChange={(e) => setFormData({ ...formData, bookingUrl: e.target.value })}
                                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-mono outline-none focus:border-emerald-500"
                              />
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                                <T>Visitors will be presented with a direct button to open your Calendly booking page.</T>
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Support Handoff & Email Notifications */}
                    <div className="space-y-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                      <div>
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span className="flex items-center gap-1.5"><Mail className="h-4 w-4 text-blue-500 inline" /><span><T>Support Handoff &amp; Lead Email Alerts</T></span></span>
                        </h2>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          <T>When visitors ask to connect with support, the widget displays a sleek form and immediately dispatches an email notification.</T>
                        </p>
                      </div>

                      {/* Receiver Email */}
                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          <T>Receiver Email Address</T>
                        </label>
                        <input
                          type="email"
                          placeholder="e.g. support@yourcompany.com"
                          value={formData.supportReceiverEmail || ''}
                          onChange={(e) => setFormData({ ...formData, supportReceiverEmail: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 font-mono"
                        />
                        <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-1">
                          <T>Support inquiries submitted by visitors are sent directly to this address.</T>
                        </p>
                      </div>

                      {/* CC Emails */}
                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          <T>CC Notification Emails (Optional)</T>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. alerts@company.com, team@company.com"
                          value={(formData.supportCcEmails || []).join(', ')}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              supportCcEmails: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                            })
                          }
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 font-mono"
                        />
                        <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-1">
                          <T>Comma-separated list of additional team emails to CC on every lead/support alert.</T>
                        </p>
                      </div>

                      {/* Form Custom Fields Builder */}
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                              <T>Support Form Custom Fields</T>
                            </span>
                            <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                              <T>Default: Name, Email, Phone (Required) &amp; Comments (Optional).</T>
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowAddFieldForm(!showAddFieldForm)}
                            className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                            <span>{showAddFieldForm ? <T>{'Close'}</T> : <T>{'Add Custom Field'}</T>}</span>
                          </button>
                        </div>

                        {/* Existing custom fields list */}
                        {(formData.supportCustomFields || []).length > 0 ? (
                          <div className="space-y-1.5">
                            {(formData.supportCustomFields || []).map((cf: SupportCustomField) => (
                              <div
                                key={cf.id}
                                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-slate-800 dark:text-slate-200"><T>{cf.label}</T></span>
                                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                    {cf.type}
                                  </span>
                                  {cf.required ? (
                                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 px-1.5 py-0.5 rounded">
                                      <T>Required</T>
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-slate-500 px-1 py-0.5"><T>Optional</T></span>
                                  )}
                                  {cf.type === 'select' && cf.options && cf.options.length > 0 && (
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      ({cf.options.length} <T>options)</T>
                                    </span>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCustomField(cf.id)}
                                  className="text-slate-400 hover:text-rose-600 p-1 transition cursor-pointer"
                                  title="Remove Field"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-400 italic"><T>No custom fields added yet.</T></p>
                        )}

                        {/* Add Field Form */}
                        {showAddFieldForm && (
                          <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/30 space-y-2.5 animate-in fade-in duration-150">
                            <div className="text-[11px] font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wide">
                              <T>New Custom Field</T>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10.5px] font-medium text-slate-600 dark:text-slate-300 block mb-1">
                                  <T>Field Label *</T>
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. Company Name"
                                  value={newFieldLabel}
                                  onChange={(e) => setNewFieldLabel(e.target.value)}
                                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs outline-none focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="text-[10.5px] font-medium text-slate-600 dark:text-slate-300 block mb-1">
                                  <T>Field Type</T>
                                </label>
                                <select
                                  value={newFieldType}
                                  onChange={(e) => setNewFieldType(e.target.value as any)}
                                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs outline-none focus:border-blue-500"
                                >
                                  <option value="text">Single Line Text</option>
                                  <option value="textarea">Paragraph Textarea</option>
                                  <option value="tel">Phone / Number</option>
                                  <option value="select">Dropdown Select</option>
                                </select>
                              </div>
                            </div>

                            {newFieldType === 'select' && (
                              <div>
                                <label className="text-[10.5px] font-medium text-slate-600 dark:text-slate-300 block mb-1">
                                  <T>Dropdown Options (comma-separated)</T>
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. Billing, Technical Support, Sales"
                                  value={newFieldOptions}
                                  onChange={(e) => setNewFieldOptions(e.target.value)}
                                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs outline-none focus:border-blue-500"
                                />
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-1">
                              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                                <input
                                  type="checkbox"
                                  checked={newFieldRequired}
                                  onChange={(e) => setNewFieldRequired(e.target.checked)}
                                  className="rounded accent-blue-600"
                                />
                                <span><T>Required field</T></span>
                              </label>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setShowAddFieldForm(false)}
                                  className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700"
                                >
                                  <T>Cancel</T>
                                </button>
                                <button
                                  type="button"
                                  onClick={handleAddCustomField}
                                  disabled={!newFieldLabel.trim()}
                                  className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-50"
                                >
                                  <T>Add Field</T>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2">
                      <SaveButton onClick={handleSaveSettings} saving={isSaving} idleLabel="Save Widget & Support Settings" savingLabel="Saving Settings…" savedLabel="Saved Successfully" icon={<CheckCircle2 className="h-3.5 w-3.5" />} />
                    </div>
                  </div>

                  {/* Live Preview Frame */}
                  <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/40 p-6 shadow-xs">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-4 font-mono uppercase">
                      <T>Live Widget Preview</T>
                    </div>

                    {/* Simulated Widget Window */}
                    <div className="w-80 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                      <div
                        style={{ backgroundColor: formData.primaryColor || '#2563eb' }}
                        className="p-3.5 text-white flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                            <T>AI</T>
                          </div>
                          <div>
                            <div className="text-xs font-bold leading-tight">{widgetTitleFor(formData)}</div>
                            <div className="text-[10px] opacity-85 flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300"></span> <T>Online</T>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 dark:bg-slate-950 space-y-3 min-h-[220px]">
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl rounded-bl-xs text-xs shadow-xs border border-slate-200/60 dark:border-slate-700 text-slate-800 dark:text-slate-200 max-w-[85%]">
                          {formData.welcomeMessage || <T>{'Hello! How can I assist you today?'}</T>}
                        </div>

                        <div className="space-y-1.5 pt-1">
                          {(formData.starterQuestions || []).slice(0, 2).map((q: string, i: number) => (
                            <div
                              key={i}
                              className="text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-full text-slate-700 dark:text-slate-300 font-medium shadow-2xs"
                            >
                              {q}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                        <div className="flex-1 text-xs text-slate-400 dark:text-slate-300 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-full">
                          <T>Ask a question...</T>
                        </div>
                        <div
                          style={{ backgroundColor: formData.primaryColor || '#2563eb' }}
                          className="h-7 w-7 rounded-full text-white flex items-center justify-center text-xs shadow-xs"
                        >
                          <Send className="h-3 w-3" />
                        </div>
                      </div>

                      {/* Footer branding preview */}
                      <div className="py-2 px-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
                        {formData.whiteLabelEnabled ? (
                          formData.customBrandingText ? (
                            <span className="font-medium text-slate-500 dark:text-slate-400">{formData.customBrandingText}</span>
                          ) : null
                        ) : (
                          <div className="inline-flex items-center gap-1.5 opacity-80">
                            <CresceloMark size={13} motion="draw" />
                            <span><T>Powered by</T> <strong className="font-semibold text-slate-600 dark:text-slate-300"><T>Crescelo</T></strong></span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
  );
};
