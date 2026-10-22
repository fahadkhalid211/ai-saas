'use client';

import React, { useEffect, useState } from 'react';
import { BrandMark } from '@/components/brand/BrandMark';
import '../../brand.css';

type AssistantRow = { id: string; name: string; hasKey?: boolean; apiKey?: string | null };

const card: React.CSSProperties = { width: '100%', maxWidth: '560px', background: '#ffffff', border: '1px solid #e8e6d1', borderRadius: '16px', boxShadow: '0 8px 30px rgba(8, 37, 26, 0.08)', padding: '36px' };
const input: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' };
const label: React.CSSProperties = { display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#08251a', marginBottom: '6px' };
const primary: React.CSSProperties = { background: '#08251a', color: '#abff44', fontWeight: 700, fontSize: '14px', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', width: '100%' };

export default function ShopifyConnectPage() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [assistants, setAssistants] = useState<AssistantRow[]>([]);
  const [assistantId, setAssistantId] = useState('');
  const [shopDomain, setShopDomain] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ total: number; removed: number } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const shop = new URLSearchParams(window.location.search).get('shop');
    if (shop) setShopDomain(shop);
    void loadSession();
  }, []);

  async function loadSession() {
    setCheckingAuth(true);
    try {
      const auth = await (await fetch('/api/auth')).json();
      if (!auth.authenticated) {
        setIsAuthenticated(false);
        return;
      }
      setIsAuthenticated(true);
      const keys = await (await fetch('/api/connectors/wordpress/keys')).json();
      const list: AssistantRow[] = keys.assistants || [];
      setAssistants(list);
      if (list[0]) setAssistantId((current) => current || list[0].id);
    } catch {
      setIsAuthenticated(false);
    } finally {
      setCheckingAuth(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'staff', email: loginEmail.trim(), password: loginPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) await loadSession();
      else setLoginError(data.error || 'Authentication failed. Please check your credentials.');
    } catch (err: any) {
      setLoginError(err?.message || 'Authentication failed');
    }
  }

  /** Reuse the assistant's key if it has one: generating a new one would disconnect a WordPress site that uses it. */
  async function keyFor(id: string): Promise<string> {
    const existing = assistants.find((a) => a.id === id);
    if (existing?.apiKey) return existing.apiKey;
    const res = await fetch('/api/connectors/wordpress/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assistantId: id }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Could not create a connection key.');
    return data.apiKey as string;
  }

  async function connectAndSync() {
    if (!assistantId) return setError('Pick an assistant first.');
    if (!shopDomain.trim()) return setError('Enter your store address, for example my-store.myshopify.com.');
    setBusy(true);
    setError(null);
    setDone(null);
    try {
      setStatus('Creating the connection...');
      const key = await keyFor(assistantId);
      const headers = { 'Content-Type': 'application/json', 'X-Crescelo-Secret': key };

      const connect = await fetch('/api/connectors/shopify/connect', { method: 'POST', headers, body: JSON.stringify({ assistantId, shopDomain }) });
      const connected = await connect.json();
      if (!connect.ok || !connected.success) throw new Error(connected.error || 'Could not connect the store.');

      let offset = 0;
      let removed = 0;
      for (;;) {
        setStatus(offset === 0 ? 'Reading your catalog...' : `Indexed ${offset} products...`);
        const res = await fetch('/api/connectors/shopify/sync', { method: 'POST', headers, body: JSON.stringify({ assistantId, shopDomain, offset, limit: 10 }) });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Sync failed.');
        removed += data.removed || 0;
        if (!data.hasMore) {
          setDone({ total: data.total, removed });
          break;
        }
        offset = data.nextOffset;
      }
      setStatus(null);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong.');
      setStatus(null);
    } finally {
      setBusy(false);
    }
  }

  function copyId() {
    navigator.clipboard.writeText(assistantId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="kx-app" style={{ minHeight: '100vh', background: '#fbfbf4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #f2f0dc' }}>
          <BrandMark size={32} />
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', background: '#eef8f4', color: '#0f6e58', padding: '4px 8px', borderRadius: '6px' }}>
            Shopify Connector
          </span>
        </div>

        {checkingAuth ? (
          <p style={{ textAlign: 'center', color: '#4b5b51', fontSize: '14px' }}>Verifying your Crescelo session...</p>
        ) : !isAuthenticated ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#08251a', margin: 0 }}>Sign in to connect Shopify</h2>
            {loginError && (
              <div role="alert" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '13px' }}>
                {loginError}
              </div>
            )}
            <div>
              <label htmlFor="shopify-email" style={label}>Email Address</label>
              <input id="shopify-email" type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} style={input} />
            </div>
            <div>
              <label htmlFor="shopify-password" style={label}>Password</label>
              <input id="shopify-password" type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} style={input} />
            </div>
            <button type="submit" style={primary}>Sign in</button>
          </form>
        ) : (
          <div>
            <h2 style={{ fontSize: '19px', fontWeight: 800, color: '#08251a', margin: '0 0 6px 0' }}>Connect your Shopify store</h2>
            <p style={{ fontSize: '13.5px', color: '#4b5b51', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              Crescelo reads your public product catalog, so no Shopify password or API token is needed. Remove the storefront password while you sync.
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label htmlFor="shopify-assistant" style={label}>AI Assistant</label>
              <select id="shopify-assistant" value={assistantId} onChange={(e) => setAssistantId(e.target.value)} style={{ ...input, background: '#fff' }}>
                {assistants.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              {assistants.length === 0 && <p style={{ fontSize: '12px', color: '#991b1b', margin: '6px 0 0 0' }}>Create an assistant in the dashboard first.</p>}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="shopify-domain" style={label}>Store address</label>
              <input id="shopify-domain" value={shopDomain} onChange={(e) => setShopDomain(e.target.value)} placeholder="my-store.myshopify.com" style={input} />
            </div>

            {error && (
              <div role="alert" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>
                {error}
              </div>
            )}
            {status && (
              <div role="status" style={{ background: '#eef8f4', color: '#0f6e58', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>
                {status}
              </div>
            )}

            <button type="button" onClick={connectAndSync} disabled={busy || !assistantId} style={{ ...primary, opacity: busy || !assistantId ? 0.6 : 1, cursor: busy ? 'wait' : 'pointer' }}>
              {busy ? 'Working...' : done ? 'Sync again' : 'Connect & sync catalog'}
            </button>

            {done && (
              <div style={{ marginTop: '22px', background: '#faf9ee', border: '1px solid #e8e6d1', borderRadius: '10px', padding: '16px' }}>
                <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 700, color: '#08251a' }}>
                  Done: {done.total} product{done.total === 1 ? '' : 's'} indexed{done.removed ? `, ${done.removed} removed` : ''}.
                </p>
                <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#4b5b51', lineHeight: 1.5 }}>
                  Last step: in Shopify go to Online Store, Themes, Customize, App embeds. Turn on <strong>Crescelo AI Assistant</strong> and paste this Assistant ID.
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input readOnly aria-label="Assistant ID" value={assistantId} style={{ ...input, fontFamily: 'monospace', fontSize: '12.5px' }} />
                  <button type="button" onClick={copyId} style={{ ...primary, width: 'auto', padding: '0 16px' }}>{copied ? 'Copied' : 'Copy'}</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
