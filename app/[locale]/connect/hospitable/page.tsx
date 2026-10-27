'use client';

/**
 * /[locale]/connect/hospitable
 *
 * Step-by-step wizard for connecting a Hospitable account to an AI assistant.
 *
 * Steps:
 *  1. Enter Personal Access Token
 *  2. Validate token (shows property count)
 *  3. Trigger initial sync
 *  4. Show webhook setup instructions
 *  5. Done — link to dashboard
 */

import { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 'token' | 'connecting' | 'sync' | 'syncing' | 'webhook' | 'done' | 'error';

interface ConnectResult {
  webhookUrl: string;
  webhookSecret: string;
  propertyCount: number;
  message: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function HospitableConnectPage({
  searchParams,
}: {
  searchParams?: { assistantId?: string };
}) {
  const assistantId = searchParams?.assistantId ?? '';

  const [step, setStep] = useState<Step>('token');
  const [accessToken, setAccessToken] = useState('');
  const [connectResult, setConnectResult] = useState<ConnectResult | null>(null);
  const [syncResult, setSyncResult] = useState<{
    propertiesSynced: number;
    errors: string[];
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState<'url' | 'secret' | null>(null);

  // ── Step 1 → 2: Validate token ──────────────────────────────────────────────

  async function handleConnect() {
    if (!accessToken.trim()) return;
    if (!assistantId) {
      setErrorMessage('No assistantId found in URL. Please return to your dashboard and try again.');
      setStep('error');
      return;
    }

    setStep('connecting');
    setErrorMessage('');

    try {
      const res = await fetch('/api/connectors/hospitable/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assistantId, accessToken: accessToken.trim() }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error ?? 'Connection failed');
        setStep('error');
        return;
      }

      setConnectResult(data);
      setStep('sync');
    } catch (err: any) {
      setErrorMessage(err?.message ?? 'Network error');
      setStep('error');
    }
  }

  // ── Step 3 → 4: Initial sync ────────────────────────────────────────────────

  async function handleSync() {
    setStep('syncing');

    try {
      const res = await fetch('/api/connectors/hospitable/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assistantId }),
      });
      const data = await res.json();

      setSyncResult({
        propertiesSynced: data.propertiesSynced ?? 0,
        errors: data.errors ?? [],
      });

      setStep('webhook');
    } catch (err: any) {
      setErrorMessage(err?.message ?? 'Sync failed');
      setStep('error');
    }
  }

  // ── Copy helpers ────────────────────────────────────────────────────────────

  function copyToClipboard(text: string, kind: 'url' | 'secret') {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(kind);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">H</div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Connect Hospitable</h1>
            <p className="text-sm text-gray-500">Property Management Integration</p>
          </div>
        </div>

        {/* ── STEP: token ── */}
        {step === 'token' && (
          <div className="space-y-6">
            <Notice type="info">
              Hospitable API access requires a <strong>Host, Professional, or Mogul</strong> plan.
              The free Essentials plan does not include API access.
            </Notice>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Personal Access Token
              </label>
              <input
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                placeholder="Paste your Hospitable PAT here"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1.5 text-xs text-gray-500">
                Get your token from{' '}
                <a
                  href="https://app.hospitable.com/settings/developer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Hospitable → Settings → Developer
                </a>
              </p>
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p className="font-medium text-gray-600">Required token scopes:</p>
              <ul className="list-disc ml-4 space-y-0.5">
                <li>property:read</li>
                <li>listing:read</li>
                <li>financials:read</li>
                <li>reviews:read (optional)</li>
              </ul>
            </div>

            <button
              onClick={handleConnect}
              disabled={!accessToken.trim()}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Connect Account
            </button>
          </div>
        )}

        {/* ── STEP: connecting ── */}
        {step === 'connecting' && (
          <div className="text-center py-8 space-y-3">
            <Spinner />
            <p className="text-gray-600 text-sm">Validating token with Hospitable…</p>
          </div>
        )}

        {/* ── STEP: sync ── */}
        {step === 'sync' && connectResult && (
          <div className="space-y-6">
            <Notice type="success">
              ✅ Connected! Found <strong>{connectResult.propertyCount}</strong> propert{connectResult.propertyCount === 1 ? 'y' : 'ies'}.
            </Notice>

            <p className="text-sm text-gray-600">
              Now we&apos;ll sync your properties, availability, pricing, and bookings into the knowledge base.
              This may take a few minutes for large portfolios.
            </p>

            <button
              onClick={handleSync}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 transition"
            >
              Start Initial Sync
            </button>
          </div>
        )}

        {/* ── STEP: syncing ── */}
        {step === 'syncing' && (
          <div className="text-center py-8 space-y-3">
            <Spinner />
            <p className="text-gray-600 text-sm">Syncing properties, calendar &amp; pricing…</p>
            <p className="text-gray-400 text-xs">This can take 30–120 seconds for large portfolios.</p>
          </div>
        )}

        {/* ── STEP: webhook ── */}
        {step === 'webhook' && connectResult && (
          <div className="space-y-5">
            {syncResult && (
              <Notice type="success">
                ✅ Synced <strong>{syncResult.propertiesSynced}</strong> propert{syncResult.propertiesSynced === 1 ? 'y' : 'ies'} into your knowledge base.
                {syncResult.errors.length > 0 && (
                  <span className="block mt-1 text-yellow-700 text-xs">
                    ⚠️ {syncResult.errors.length} error(s): {syncResult.errors.slice(0, 2).join(', ')}
                  </span>
                )}
              </Notice>
            )}

            <div>
              <h2 className="font-semibold text-gray-800 mb-3">Configure Webhooks (Optional but Recommended)</h2>
              <p className="text-sm text-gray-600 mb-4">
                Webhooks enable real-time updates when properties or bookings change in Hospitable. Without them, data syncs every 15 minutes.
              </p>

              <p className="text-xs font-medium text-gray-700 mb-1">In Hospitable: <span className="font-normal">Apps → Webhooks → Add new</span></p>

              <div className="space-y-3">
                <CopyField
                  label="Webhook URL"
                  value={connectResult.webhookUrl}
                  onCopy={() => copyToClipboard(connectResult.webhookUrl, 'url')}
                  copied={copied === 'url'}
                />
                <CopyField
                  label="Webhook Secret"
                  value={connectResult.webhookSecret}
                  onCopy={() => copyToClipboard(connectResult.webhookSecret, 'secret')}
                  copied={copied === 'secret'}
                  sensitive
                />
              </div>

              <p className="text-xs text-gray-500 mt-3">
                Subscribe to: <strong>Properties</strong>, <strong>Reservations</strong>, <strong>Messages</strong>, <strong>Reviews</strong>
              </p>
            </div>

            <button
              onClick={() => setStep('done')}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 transition"
            >
              Done — Go to Dashboard
            </button>
          </div>
        )}

        {/* ── STEP: done ── */}
        {step === 'done' && (
          <div className="text-center space-y-5 py-4">
            <div className="text-5xl">🎉</div>
            <h2 className="text-lg font-semibold text-gray-800">All Set!</h2>
            <p className="text-sm text-gray-600">
              Your Hospitable properties are now synced. Your AI assistant can answer guest questions about availability, pricing, and amenities in real time.
            </p>
            <a
              href={`/dashboard?assistantId=${assistantId}`}
              className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 transition"
            >
              Go to Dashboard
            </a>
          </div>
        )}

        {/* ── STEP: error ── */}
        {step === 'error' && (
          <div className="space-y-4">
            <Notice type="error">
              {errorMessage || 'An unexpected error occurred.'}
            </Notice>
            <button
              onClick={() => { setStep('token'); setErrorMessage(''); }}
              className="w-full border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-50 transition"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-8">
          {(['token', 'sync', 'webhook', 'done'] as const).map((s, i) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full transition-colors ${
                ['token', 'connecting'].includes(step) && i === 0
                  ? 'bg-blue-600'
                  : ['sync', 'syncing'].includes(step) && i === 1
                  ? 'bg-blue-600'
                  : step === 'webhook' && i === 2
                  ? 'bg-blue-600'
                  : step === 'done' && i === 3
                  ? 'bg-blue-600'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
  );
}

function Notice({
  type,
  children,
}: {
  type: 'info' | 'success' | 'error' | 'warning';
  children: React.ReactNode;
}) {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  };
  return (
    <div className={`border rounded-lg px-4 py-3 text-sm ${styles[type]}`}>
      {children}
    </div>
  );
}

function CopyField({
  label,
  value,
  onCopy,
  copied,
  sensitive = false,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
  sensitive?: boolean;
}) {
  const [revealed, setRevealed] = useState(!sensitive);

  return (
    <div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <code className="flex-1 bg-gray-100 border border-gray-200 rounded px-3 py-2 text-xs font-mono truncate">
          {revealed ? value : '•'.repeat(Math.min(value.length, 40))}
        </code>
        {sensitive && (
          <button
            onClick={() => setRevealed((v) => !v)}
            className="text-xs text-gray-500 hover:text-gray-700 px-2 py-2 border border-gray-200 rounded"
          >
            {revealed ? 'Hide' : 'Show'}
          </button>
        )}
        <button
          onClick={onCopy}
          className="text-xs bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition"
        >
          {copied ? '✓' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
