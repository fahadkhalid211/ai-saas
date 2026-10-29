import { T } from '@/lib/i18n/context';
import { SaveButton } from '@/components/ui/SaveButton';
import React, { useEffect, useState } from 'react';
import { PhoneCall, Sparkles, Cpu, Radio, Copy, Check, Headphones } from 'lucide-react';
import { maskPhone } from '@/lib/voice/text';
import { VoiceTestModal } from './VoiceTestModal';

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

/** Phone channel settings, voice quality tier (Option A vs B), carrier selection, and recent calls. */
export const PhoneChannelCard: React.FC<PhoneChannelCardProps> = ({
  activeAssistant,
  formData,
  setFormData,
  handleSaveSettings,
  isSaving,
  isMasterAdmin,
}) => {
  const [calls, setCalls] = useState<CallRow[]>([]);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
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

  const carrier = formData.phoneCarrier || 'telnyx';
  const tier = formData.phoneVoiceTier || 'standard';

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://app.crescelo.com';
  const webhookUrl = `${baseUrl}/api/channels/${carrier === 'twilio' ? 'twilio' : 'voice'}`;

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs space-y-6">
      {/* Header with Enable Toggle and Live Browser Test */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-200 dark:border-sky-900/50">
            <PhoneCall className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              <T>Phone calls (AI receptionist)</T>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <T>Callers to your business number are answered by this assistant, which answers questions and books appointments.</T>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsTestModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-xs font-semibold transition-all cursor-pointer"
          >
            <Headphones className="w-3.5 h-3.5" />
            <T>Test Call in Browser</T>
          </button>

          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={Boolean(formData.phoneEnabled)}
              disabled={!hasNumber}
              onChange={(e) => set({ phoneEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 rounded-full peer dark:bg-slate-800 peer-disabled:opacity-50 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            <span className="ml-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              {formData.phoneEnabled ? <T>{'Enabled'}</T> : <T>{'Disabled'}</T>}
            </span>
          </label>
        </div>
      </div>

      {/* Voice Engine Quality Tiers (Option A vs Option B) */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          <T>Voice Quality Tier</T>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Option A: Standard */}
          <div
            onClick={() => set({ phoneVoiceTier: 'standard', phoneVoiceProvider: 'local' })}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              tier === 'standard'
                ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">Option A: Standard AI Voice</span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                Included / Zero API Fee
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Powered by local Whisper + Piper neural engine. Ultra-low cost, fast CPU synthesis, standard voice quality.
            </p>
          </div>

          {/* Option B: Premium Studio */}
          <div
            onClick={() => set({ phoneVoiceTier: 'premium', phoneVoiceProvider: 'cartesia' })}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              tier === 'premium'
                ? 'border-amber-500 bg-amber-50/40 dark:bg-amber-950/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">Option B: Ultra-Realistic Studio</span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                Studio Quality (~2¢/min)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Powered by Deepgram + Cartesia Sonic. Hyper-realistic human inflection, emotional cadence, and sub-100ms response time.
            </p>
          </div>
        </div>
      </div>

      {/* Carrier Selection (Telnyx vs Twilio) */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          <T>Telephony Carrier Provider</T>
        </label>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => set({ phoneCarrier: 'telnyx' })}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                carrier === 'telnyx'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Telnyx (TeXML)
            </button>
            <button
              type="button"
              onClick={() => set({ phoneCarrier: 'twilio' })}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                carrier === 'twilio'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Twilio (TwiML Stream)
            </button>
          </div>

          {/* Webhook copy box */}
          <div className="flex-1 flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[11px] font-mono text-slate-600 dark:text-slate-300">
            <span className="truncate">{webhookUrl}</span>
            <button
              type="button"
              onClick={handleCopyWebhook}
              className="text-slate-500 hover:text-slate-900 dark:hover:text-white shrink-0 p-1 rounded"
              title="Copy webhook URL"
            >
              {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Set this webhook URL in your {carrier === 'twilio' ? 'Twilio Phone Number Voice configuration' : 'Telnyx TeXML Application'}.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="phone-number" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <T>Business phone number</T>
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
              <p className={`${fieldClass} font-mono`}>{formData.phoneNumber || <T>{'Not assigned yet'}</T>}</p>
            )}
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {isMasterAdmin ? (
                <T>{'International format. Must match the number bought from the carrier. Each number belongs to one assistant.'}</T>
              ) : (
                <T>{'Numbers are assigned by the Crescelo team. Contact support to get one.'}</T>
              )}
            </p>
          </div>

          <div>
            <label htmlFor="phone-greeting" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <T>Greeting</T>
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
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              <T>Callers are always told they are speaking with an AI assistant.</T>
            </p>
          </div>

          <div>
            <label htmlFor="phone-transfer" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <T>Transfer to a person</T>
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
              <T>Rung when a caller asks for a person, or if the AI service is unavailable. Leave empty to take a message instead.</T>
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="phone-after-hours" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <T>Outside opening hours</T>
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
                <T>Max call (minutes)</T>
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
                <T>Language</T>
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
                <T>Business time zone</T>
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
            <button
              type="button"
              onClick={() => set({ timezone: detectedZone })}
              className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 underline cursor-pointer"
            >
              <T>Use</T> {detectedZone}
            </button>
          ) : null}
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            <T>The time zone decides what &quot;today&quot; and opening hours mean when the assistant offers appointment times.</T>
          </p>

          <SaveButton onClick={handleSaveSettings} saving={isSaving} idleLabel="Save phone settings" savedLabel="Phone settings saved" />
        </div>
      </div>

      {/* Recent Calls */}
      {hasNumber ? (
        <div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-2">
            <T>Recent calls</T>
          </h3>
          {calls.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <T>No calls yet.</T>
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="text-left p-2.5 font-semibold">
                      <T>When</T>
                    </th>
                    <th className="text-left p-2.5 font-semibold">
                      <T>Caller</T>
                    </th>
                    <th className="text-left p-2.5 font-semibold">
                      <T>Length</T>
                    </th>
                    <th className="text-left p-2.5 font-semibold">
                      <T>Result</T>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {calls.map((c) => (
                    <tr key={c.id}>
                      <td className="p-2.5 whitespace-nowrap">{new Date(c.startedAt).toLocaleString()}</td>
                      <td className="p-2.5 font-mono">{maskPhone(c.from)}</td>
                      <td className="p-2.5">
                        {c.durationSeconds != null ? `${Math.floor(c.durationSeconds / 60)}m ${c.durationSeconds % 60}s` : <T>{'In progress'}</T>}
                      </td>
                      <td className="p-2.5">{OUTCOME_LABEL[c.outcome || ''] || c.outcome || <T>{'Answered'}</T>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}

      {/* In-Browser Voice Call Tester Modal */}
      <VoiceTestModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        assistantName={activeAssistant?.name || 'AI Assistant'}
        greeting={formData.phoneGreeting}
        currentTier={tier}
      />
    </div>
  );
};
