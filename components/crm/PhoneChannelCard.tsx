import { SaveButton } from '@/components/ui/SaveButton';
import React, { useEffect, useState } from 'react';
import { PhoneCall } from 'lucide-react';
import { maskPhone } from '@/lib/voice/text';

interface CallRow {
  id: string;
  from: string;
  startedAt: string;
  durationSeconds?: number;
  outcome?: string;
}

interface PhoneChannelCardProps {
  activeAssistant: any;
  formData: any;
  setFormData: (data: any) => void;
  handleSaveSettings: () => void;
  isSaving: boolean;
  isMasterAdmin: boolean;
}

const OUTCOME_LABEL: Record<string, string> = {
  booked: 'Booked',
  answered: 'Answered',
  transferred: 'Transferred',
  callback: 'Call-back requested',
  abandoned: 'Hung up',
  failed: 'Failed',
};

const fieldClass =
  'w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500';

/** Phone channel settings and recent calls. The dialled number is assigned by the platform admin. */
export const PhoneChannelCard: React.FC<PhoneChannelCardProps> = ({ activeAssistant, formData, setFormData, handleSaveSettings, isSaving, isMasterAdmin }) => {
  const [calls, setCalls] = useState<CallRow[]>([]);
  const assistantId = activeAssistant?.id;
  const hasNumber = Boolean(formData.phoneNumber);

  useEffect(() => {
    if (!assistantId || !hasNumber) return;
    let cancelled = false;
    fetch(`/api/voice/calls?assistantId=${encodeURIComponent(assistantId)}`)
      .then((r) => (r.ok ? r.json() : { calls: [] }))
      .then((d) => {
        if (!cancelled) setCalls(d.calls || []);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [assistantId, hasNumber]);

  const set = (patch: Record<string, unknown>) => setFormData({ ...formData, ...patch });
  const detectedZone = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : '';

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-200 dark:border-sky-900/50">
            <PhoneCall className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Phone calls (AI receptionist)</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Callers to your business number are answered by this assistant, which can answer questions and book appointments.
            </p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={Boolean(formData.phoneEnabled)}
            disabled={!hasNumber}
            onChange={(e) => set({ phoneEnabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 rounded-full peer dark:bg-slate-800 peer-disabled:opacity-50 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          <span className="ml-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">{formData.phoneEnabled ? 'Enabled' : 'Disabled'}</span>
        </label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="phone-number" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Business phone number
            </label>
            {isMasterAdmin ? (
              <input
                id="phone-number"
                type="tel"
                placeholder="+14155550123"
                value={formData.phoneNumber || ''}
                onChange={(e) => set({ phoneNumber: e.target.value })}
                className={`${fieldClass} font-mono`}
              />
            ) : (
              <p className={`${fieldClass} font-mono`}>{formData.phoneNumber || 'Not assigned yet'}</p>
            )}
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {isMasterAdmin
                ? 'International format. Must match the number bought from the carrier. Each number belongs to one assistant.'
                : 'Numbers are assigned by the Crescelo team. Contact support to get one.'}
            </p>
          </div>

          <div>
            <label htmlFor="phone-greeting" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Greeting
            </label>
            <textarea
              id="phone-greeting"
              rows={3}
              maxLength={300}
              placeholder={`Hello, thanks for calling ${activeAssistant?.name || 'us'}. You're speaking with an AI assistant. How can I help?`}
              value={formData.phoneGreeting || ''}
              onChange={(e) => set({ phoneGreeting: e.target.value })}
              className={fieldClass}
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Callers are always told they are speaking with an AI assistant.</p>
          </div>

          <div>
            <label htmlFor="phone-transfer" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Transfer to a person
            </label>
            <input
              id="phone-transfer"
              type="tel"
              placeholder="+14155559999"
              value={formData.phoneTransferNumber || ''}
              onChange={(e) => set({ phoneTransferNumber: e.target.value })}
              className={`${fieldClass} font-mono`}
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Rung when a caller asks for a person, or if the AI service is unavailable. Leave empty to take a message instead.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="phone-after-hours" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Outside opening hours
              </label>
              <select
                id="phone-after-hours"
                value={formData.phoneAfterHours || 'ai'}
                onChange={(e) => set({ phoneAfterHours: e.target.value })}
                className={fieldClass}
              >
                <option value="ai">AI keeps answering</option>
                <option value="voicemail">Take a voicemail</option>
                <option value="forward">Forward to a person</option>
              </select>
            </div>
            <div>
              <label htmlFor="phone-max" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Max call (minutes)
              </label>
              <input
                id="phone-max"
                type="number"
                min={1}
                max={30}
                value={formData.phoneMaxCallMinutes ?? 10}
                onChange={(e) => set({ phoneMaxCallMinutes: Number(e.target.value) })}
                className={fieldClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="phone-language" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Language
              </label>
              <input
                id="phone-language"
                type="text"
                placeholder="en"
                value={formData.phoneLanguage || ''}
                onChange={(e) => set({ phoneLanguage: e.target.value })}
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="phone-timezone" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Business time zone
              </label>
              <input
                id="phone-timezone"
                type="text"
                placeholder={detectedZone || 'America/New_York'}
                value={formData.timezone || ''}
                onChange={(e) => set({ timezone: e.target.value })}
                className={fieldClass}
              />
            </div>
          </div>
          {!formData.timezone && detectedZone ? (
            <button type="button" onClick={() => set({ timezone: detectedZone })} className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 underline cursor-pointer">
              Use {detectedZone}
            </button>
          ) : null}
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            The time zone decides what &quot;today&quot; and opening hours mean when the assistant offers appointment times. Booking uses the days and hours from your booking settings.
          </p>

          <SaveButton onClick={handleSaveSettings} saving={isSaving} idleLabel="Save phone settings" savedLabel="Phone settings saved" />
        </div>
      </div>

      {hasNumber ? (
        <div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-2">Recent calls</h3>
          {calls.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">No calls yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="text-left p-2.5 font-semibold">When</th>
                    <th className="text-left p-2.5 font-semibold">Caller</th>
                    <th className="text-left p-2.5 font-semibold">Length</th>
                    <th className="text-left p-2.5 font-semibold">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {calls.map((c) => (
                    <tr key={c.id}>
                      <td className="p-2.5 whitespace-nowrap">{new Date(c.startedAt).toLocaleString()}</td>
                      <td className="p-2.5 font-mono">{maskPhone(c.from)}</td>
                      <td className="p-2.5">{c.durationSeconds != null ? `${Math.floor(c.durationSeconds / 60)}m ${c.durationSeconds % 60}s` : 'In progress'}</td>
                      <td className="p-2.5">{OUTCOME_LABEL[c.outcome || ''] || c.outcome || 'Answered'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
