'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BrandMark } from '@/components/brand/BrandMark';
import '../../brand.css';

export default function WordPressConnectPage() {
  const router = useRouter();

  // Query params
  const [siteUrl, setSiteUrl] = useState('');
  const [siteName, setSiteName] = useState('');
  const [returnUrl, setReturnUrl] = useState('');
  const [stateParam, setStateParam] = useState('');

  // Auth & Workspace state
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [assistants, setAssistants] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedAssistantId, setSelectedAssistantId] = useState('new');
  const [userEmail, setUserEmail] = useState('');

  // Auth toggle: 'login' | 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login form state (if not authenticated)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Register form state (for new users)
  const [registerBusinessName, setRegisterBusinessName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // Connecting state
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Manual API Key Tab
  const [activeTab, setActiveTab] = useState<'oauth' | 'manual'>('oauth');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const site = params.get('site_url') || '';
    const name = params.get('site_name') || 'WordPress Website';
    setSiteUrl(site);
    setSiteName(name);
    setRegisterBusinessName(name);
    setReturnUrl(params.get('return_url') || '');
    setStateParam(params.get('state') || '');

    // Check auth
    checkAuthAndLoadAssistants();
  }, []);

  const checkAuthAndLoadAssistants = async () => {
    setCheckingAuth(true);
    try {
      const res = await fetch('/api/auth');
      const data = await res.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        setUserEmail(data.member?.email || 'Administrator');

        // Fetch user assistants
        const astRes = await fetch('/api/assistants');
        const astData = await astRes.json();
        if (astData.assistants && Array.isArray(astData.assistants)) {
          setAssistants(astData.assistants);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleInlineLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) return;

    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'staff',
          email: loginEmail.trim(),
          password: loginPassword.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await checkAuthAndLoadAssistants();
      } else {
        setLoginError(data.error || 'Authentication failed. Please check your credentials.');
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Authentication failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleInlineRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = registerEmail.trim();
    const password = registerPassword.trim();
    const businessName = registerBusinessName.trim() || siteName || 'WordPress Business';

    if (!email || !password) return;

    if (password.length < 6) {
      setRegisterError('Password must be at least 6 characters.');
      return;
    }

    if (registerConfirmPassword && password !== registerConfirmPassword.trim()) {
      setRegisterError('Passwords do not match.');
      return;
    }

    setIsRegistering(true);
    setRegisterError(null);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'register',
          businessName,
          email,
          password,
          industryTemplateSlug: 'general',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await checkAuthAndLoadAssistants();
      } else {
        setRegisterError(data.error || 'Registration failed. Please check your details.');
      }
    } catch (err: any) {
      setRegisterError(err?.message || 'Registration failed');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleAuthorize = async () => {
    if (!returnUrl) {
      setAuthError('Missing return_url parameter. Please launch the connection from your WordPress admin.');
      return;
    }

    setIsAuthorizing(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/connectors/wordpress/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assistantId: selectedAssistantId,
          siteUrl,
          siteName,
          returnUrl,
          state: stateParam,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setAuthError(data.error || 'Authorization failed. Please try again.');
        setIsAuthorizing(false);
        return;
      }

      // Redirect user back to their WordPress dashboard!
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Connection failed.');
      setIsAuthorizing(false);
    }
  };

  const handleGenerateManualKey = async () => {
    if (!selectedAssistantId || selectedAssistantId === 'new') {
      alert('Please select an existing assistant to generate a permanent API key for.');
      return;
    }

    setIsGeneratingKey(true);
    try {
      const res = await fetch('/api/connectors/wordpress/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assistantId: selectedAssistantId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setGeneratedKey(data.apiKey);
      } else {
        alert(data.error || 'Failed to generate key');
      }
    } catch (err: any) {
      alert(err.message || 'Key generation error');
    } finally {
      setIsGeneratingKey(false);
    }
  };

  const copyKeyToClipboard = () => {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="kx-app" style={{ minHeight: '100vh', background: '#fbfbf4', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '520px', background: '#ffffff', border: '1px solid #e8e6d1', borderRadius: '16px', boxShadow: '0 8px 30px rgba(8, 37, 26, 0.08)', padding: '36px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #f2f0dc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BrandMark size={32} />
          </div>
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', background: '#eef8f4', color: '#0f6e58', padding: '4px 8px', borderRadius: '6px' }}>
            WordPress Connector
          </span>
        </div>

        {checkingAuth ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#4b5b51', fontSize: '14px' }}>
            Verifying your Crescelo session...
          </div>
        ) : !isAuthenticated ? (
          // ================= AUTH (LOGIN OR CREATE ACCOUNT) =================
          <div>
            {/* Segmented Mode Selector */}
            <div style={{ display: 'flex', background: '#f2f0dc', padding: '4px', borderRadius: '10px', marginBottom: '22px' }}>
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setLoginError(null); setRegisterError(null); }}
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  background: authMode === 'login' ? '#ffffff' : 'transparent',
                  color: authMode === 'login' ? '#08251a' : '#6b6b5c',
                  boxShadow: authMode === 'login' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('register'); setLoginError(null); setRegisterError(null); }}
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  background: authMode === 'register' ? '#ffffff' : 'transparent',
                  color: authMode === 'register' ? '#08251a' : '#6b6b5c',
                  boxShadow: authMode === 'register' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                ✨ Create Account
              </button>
            </div>

            {authMode === 'login' ? (
              // ---------------- LOGIN FORM ----------------
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#08251a', margin: '0 0 6px 0' }}>
                  Sign in to Connect WordPress
                </h2>
                <p style={{ fontSize: '13.5px', color: '#4b5b51', margin: '0 0 20px 0', lineHeight: 1.5 }}>
                  Sign in to your Crescelo account to link <strong>{siteName || 'your website'}</strong>.
                </p>

                {loginError && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                    {loginError}
                  </div>
                )}

                <form onSubmit={handleInlineLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#08251a', marginBottom: '4px' }}>Email Address</label>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      placeholder="admin@example.com"
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#08251a', marginBottom: '4px' }}>Password</label>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    style={{
                      marginTop: '8px',
                      background: '#08251a',
                      color: '#abff44',
                      fontWeight: 700,
                      fontSize: '14px',
                      padding: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: isLoggingIn ? 'not-allowed' : 'pointer',
                      opacity: isLoggingIn ? 0.7 : 1,
                      transition: 'background 0.15s ease',
                    }}
                  >
                    {isLoggingIn ? 'Authenticating...' : 'Sign in & Authorize'}
                  </button>
                </form>

                <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#6b6b5c' }}>
                  New to Crescelo?{' '}
                  <button
                    type="button"
                    onClick={() => { setAuthMode('register'); setLoginError(null); }}
                    style={{ background: 'none', border: 'none', color: '#0f6e58', fontWeight: 700, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                  >
                    Create a free account
                  </button>
                </div>
              </div>
            ) : (
              // ---------------- CREATE ACCOUNT FORM ----------------
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#08251a', margin: '0 0 6px 0' }}>
                  Create Account & Connect Site
                </h2>
                <p style={{ fontSize: '13.5px', color: '#4b5b51', margin: '0 0 20px 0', lineHeight: 1.5 }}>
                  Set up your Crescelo account to connect <strong>{siteName || 'your website'}</strong> in seconds.
                </p>

                {registerError && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                    {registerError}
                  </div>
                )}

                <form onSubmit={handleInlineRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#08251a', marginBottom: '4px' }}>Business or Website Name</label>
                    <input
                      type="text"
                      value={registerBusinessName}
                      onChange={(e) => setRegisterBusinessName(e.target.value)}
                      required
                      placeholder={siteName || 'The Penthouse Living'}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#08251a', marginBottom: '4px' }}>Email Address</label>
                    <input
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                      placeholder="admin@thepenthouseliving.com"
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#08251a', marginBottom: '4px' }}>Password (min 6 characters)</label>
                    <input
                      type="password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder="Create a secure password"
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#08251a', marginBottom: '4px' }}>Confirm Password</label>
                    <input
                      type="password"
                      value={registerConfirmPassword}
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                      required
                      placeholder="Repeat your password"
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isRegistering}
                    style={{
                      marginTop: '8px',
                      background: '#08251a',
                      color: '#abff44',
                      fontWeight: 700,
                      fontSize: '14px',
                      padding: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: isRegistering ? 'not-allowed' : 'pointer',
                      opacity: isRegistering ? 0.7 : 1,
                      transition: 'background 0.15s ease',
                      boxShadow: '0 4px 14px rgba(8, 37, 26, 0.12)',
                    }}
                  >
                    {isRegistering ? 'Creating Account & Setting Up...' : 'Create Account & Continue →'}
                  </button>
                </form>

                <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#6b6b5c' }}>
                  Already have a Crescelo account?{' '}
                  <button
                    type="button"
                    onClick={() => { setAuthMode('login'); setRegisterError(null); }}
                    style={{ background: 'none', border: 'none', color: '#0f6e58', fontWeight: 700, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                  >
                    Sign in here
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          // ================= AUTHORIZATION FORM =================
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', borderBottom: '1px solid #f2f0dc', paddingBottom: '8px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('oauth')}
                style={{
                  background: activeTab === 'oauth' ? '#08251a' : 'none',
                  color: activeTab === 'oauth' ? '#abff44' : '#4b5b51',
                  fontWeight: 700,
                  fontSize: '13px',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                ⚡ 1-Click Connect
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('manual')}
                style={{
                  background: activeTab === 'manual' ? '#08251a' : 'none',
                  color: activeTab === 'manual' ? '#abff44' : '#4b5b51',
                  fontWeight: 700,
                  fontSize: '13px',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                🔑 Manual API Key
              </button>
            </div>

            {activeTab === 'oauth' ? (
              <div>
                <h2 style={{ fontSize: '19px', fontWeight: 800, color: '#08251a', margin: '0 0 6px 0' }}>
                  Authorize WordPress Connection
                </h2>
                <p style={{ fontSize: '13.5px', color: '#4b5b51', margin: '0 0 20px 0', lineHeight: 1.5 }}>
                  Signed in as <strong>{userEmail}</strong>. Confirm the connection for:
                </p>

                {/* Website Card */}
                <div style={{ background: '#faf9ee', border: '1px solid #e8e6d1', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#08251a' }}>{siteName || 'WordPress Website'}</div>
                  <div style={{ fontSize: '12px', color: '#0f6e58', marginTop: '2px', wordBreak: 'break-all' }}>{siteUrl || 'Local / Staging Site'}</div>
                </div>

                {/* Assistant Selection */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#08251a', marginBottom: '6px' }}>
                    Select AI Assistant
                  </label>
                  <select
                    value={selectedAssistantId}
                    onChange={(e) => setSelectedAssistantId(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13.5px', color: '#08251a', background: '#fff' }}
                  >
                    <option value="new">✨ Auto-create New Assistant for this site</option>
                    {assistants.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.id})
                      </option>
                    ))}
                  </select>
                  <p style={{ fontSize: '11.5px', color: '#6b6b5c', margin: '4px 0 0 0' }}>
                    Your website will synchronize knowledge and chat interactions through this assistant.
                  </p>
                </div>

                {authError && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                    {authError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                  <button
                    type="button"
                    onClick={handleAuthorize}
                    disabled={isAuthorizing}
                    style={{
                      flex: 1,
                      background: '#08251a',
                      color: '#abff44',
                      fontWeight: 700,
                      fontSize: '14px',
                      padding: '12px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: isAuthorizing ? 'not-allowed' : 'pointer',
                      opacity: isAuthorizing ? 0.7 : 1,
                      boxShadow: '0 4px 14px rgba(8, 37, 26, 0.15)',
                    }}
                  >
                    {isAuthorizing ? 'Connecting to WordPress...' : '✓ Authorize & Complete Connection'}
                  </button>
                </div>
              </div>
            ) : (
              // ================= MANUAL API KEY GENERATION =================
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#08251a', margin: '0 0 8px 0' }}>
                  Generate Manual WordPress API Key
                </h3>
                <p style={{ fontSize: '13px', color: '#4b5b51', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                  Generate an API key for your assistant and paste it into the WordPress plugin settings tab.
                </p>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#08251a', marginBottom: '4px' }}>Target Assistant</label>
                  <select
                    value={selectedAssistantId}
                    onChange={(e) => setSelectedAssistantId(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px' }}
                  >
                    <option value="">-- Choose Assistant --</option>
                    {assistants.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateManualKey}
                  disabled={isGeneratingKey || !selectedAssistantId || selectedAssistantId === 'new'}
                  style={{
                    background: '#1c8a72',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '13px',
                    padding: '9px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    marginBottom: '16px',
                  }}
                >
                  {isGeneratingKey ? 'Generating Key...' : 'Generate New API Key'}
                </button>

                {generatedKey && (
                  <div style={{ background: '#faf9ee', border: '1px solid #e8e6d1', borderRadius: '8px', padding: '14px', marginTop: '10px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#08251a', marginBottom: '6px' }}>Your WordPress API Key</div>
                    <code style={{ display: 'block', background: '#fff', border: '1px solid #cbd5e1', padding: '8px 10px', borderRadius: '6px', fontSize: '12.5px', color: '#0f6e58', wordBreak: 'break-all' }}>
                      {generatedKey}
                    </code>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                      <button
                        type="button"
                        onClick={copyKeyToClipboard}
                        style={{ background: '#08251a', color: '#abff44', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        {copiedKey ? '✓ Copied!' : 'Copy API Key'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
