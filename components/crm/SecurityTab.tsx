import React from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, KeyRound, Copy } from 'lucide-react';

export interface SecurityTabProps {
  twoFactorEnabled: boolean;
  twoFactorSuccess: string | null;
  twoFactorError: string | null;
  twoFactorLoading: boolean;
  twoFactorSetupData: {
    secret: string;
    otpUrl: string;
    recoveryCodes: string[];
  } | null;
  twoFactorCodeInput: string;
  setTwoFactorCodeInput: (code: string) => void;
  handleDisable2fa: () => void;
  handleStart2faSetup: () => void;
  handleConfirm2faEnable: () => void;
}

export const SecurityTab: React.FC<SecurityTabProps> = ({
  twoFactorEnabled,
  twoFactorSuccess,
  twoFactorError,
  twoFactorLoading,
  twoFactorSetupData,
  twoFactorCodeInput,
  setTwoFactorCodeInput,
  handleDisable2fa,
  handleStart2faSetup,
  handleConfirm2faEnable,
}) => {
  return (
    <div className="max-w-5xl space-y-6 mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <ShieldCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span>Security</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Protect your account with two-factor authentication and review login activity.
          </p>
        </div>
      </div>

      {twoFactorSuccess && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 font-medium">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{twoFactorSuccess}</span>
        </div>
      )}

      {twoFactorError && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2 font-medium">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{twoFactorError}</span>
        </div>
      )}

      {/* 2FA Status Card */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${twoFactorEnabled ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'}`}>
              <KeyRound className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Two-Factor Authentication (TOTP)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Requires Google Authenticator, Authy, or Apple Keychain 6-digit codes on login.
              </p>
            </div>
          </div>

          <div>
            {twoFactorEnabled ? (
              <button
                type="button"
                onClick={handleDisable2fa}
                disabled={twoFactorLoading}
                className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-semibold hover:bg-rose-100 transition cursor-pointer"
              >
                Disable 2FA
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStart2faSetup}
                disabled={twoFactorLoading}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Enable 2FA Protection</span>
              </button>
            )}
          </div>
        </div>

        {/* 2FA Setup Flow */}
        {twoFactorSetupData && !twoFactorEnabled && (
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-6">
            <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Step 1: Scan QR Code or Copy Secret Key
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm shrink-0">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(twoFactorSetupData.otpUrl)}`}
                  alt="2FA QR Code"
                  className="w-44 h-44 rounded-lg"
                />
              </div>

              <div className="space-y-3 flex-1 text-xs">
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Open your authenticator app (Google Authenticator, Microsoft Authenticator, or 1Password) and scan the QR code to the left.
                </p>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Manual Base32 Secret Key</label>
                  <div className="flex items-center gap-2">
                    <code className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs font-bold tracking-widest">
                      {twoFactorSetupData.secret}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(twoFactorSetupData.secret);
                        alert('Secret copied to clipboard!');
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Recovery Codes */}
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 mb-1">Emergency Recovery Backup Codes</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {twoFactorSetupData.recoveryCodes.map((code: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 font-mono text-[10.5px] rounded text-slate-700 dark:text-slate-300 text-center">
                        {code}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Verification Input */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Step 2: Verify 6-Digit Code
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={twoFactorCodeInput}
                  onChange={(e) => setTwoFactorCodeInput(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-40 font-mono text-center text-lg font-bold tracking-widest bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleConfirm2faEnable}
                  disabled={twoFactorCodeInput.length !== 6 || twoFactorLoading}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  {twoFactorLoading ? 'Verifying...' : 'Confirm & Activate 2FA'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-900 dark:text-white">Sign out everywhere</span>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Ends every session of your account on every device, including this one. Use it if a device is lost or you think someone else got in.</p>
        </div>
        <button
          type="button"
          onClick={async () => {
            try { await fetch('/api/auth?all=1', { method: 'DELETE' }); } catch {}
            window.location.href = '/login';
          }}
          className="shrink-0 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
        >
          Sign out everywhere
        </button>
      </div>

      {/* Enterprise Security Checkup Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white">AES-256 GCM Secret Vault</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">Active</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            All LLM provider API keys and webhook secrets are encrypted at rest with PBKDF2 salt derivation.
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white">IP Rate Limiting &amp; Anti-DDoS</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">Active</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Sliding window throttling limits abusive requests on chat, upload, and calendar booking endpoints.
          </p>
        </div>
      </div>
    </div>
  );
};
