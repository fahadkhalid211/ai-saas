'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CresceloMark } from '@/components/brand/CresceloMark';
import {
  Users,
  DollarSign,
  TrendingUp,
  MousePointerClick,
  Copy,
  Check,
  Share2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  LogOut,
  RefreshCw,
  Wallet,
  Calendar,
  AlertCircle,
  Clock,
  Globe,
  Phone,
  Mail,
  Sliders,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { ReferralStats, ReferralPayout } from '@/types/referral';
import { TwitterIcon, LinkedInIcon, YouTubeIcon, InstagramIcon } from '@/components/referral/SocialIcons';





export default function ReferralDashboardPage() {
  const router = useRouter();

  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Copy States
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Tab State: 'overview' | 'customers' | 'clicks' | 'payouts' | 'settings'
  const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'clicks' | 'payouts' | 'settings'>('overview');

  // Payout Request State
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('paypal');
  const [payoutDetails, setPayoutDetails] = useState('');
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState<string | null>(null);
  const [payoutError, setPayoutError] = useState<string | null>(null);

  // Settings State
  const [settingsPhone, setSettingsPhone] = useState('');
  const [settingsPayoutMethod, setSettingsPayoutMethod] = useState('');
  const [settingsPayoutDetails, setSettingsPayoutDetails] = useState('');
  const [settingsSocials, setSettingsSocials] = useState<any>({});
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/referral/dashboard');
      if (res.status === 401) {
        router.push('/referral/login');
        return;
      }
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to load referral statistics');
        setIsLoading(false);
        return;
      }

      setStats(data.stats);
      setSettingsPhone(data.stats.partner.phone || '');
      setSettingsPayoutMethod(data.stats.partner.payoutMethod || 'paypal');
      setSettingsPayoutDetails(data.stats.partner.payoutDetails || '');
      setSettingsSocials(data.stats.partner.socialLinks || {});
      setPayoutMethod(data.stats.partner.payoutMethod || 'paypal');
      setPayoutDetails(data.stats.partner.payoutDetails || '');
      setIsLoading(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to connect to server');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/referral/logout', { method: 'POST' });
    router.push('/referral/login');
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutError(null);
    setPayoutSuccess(null);

    const amount = Number(payoutAmount);
    if (!amount || amount <= 0) {
      setPayoutError('Please enter a valid payout amount.');
      return;
    }

    setPayoutLoading(true);
    try {
      const res = await fetch('/api/referral/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          method: payoutMethod,
          details: payoutDetails,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setPayoutError(data.error || 'Payout request failed.');
        setPayoutLoading(false);
        return;
      }

      setPayoutSuccess('Payout request submitted successfully!');
      setPayoutAmount('');
      setPayoutLoading(false);
      // Refresh data
      fetchDashboardData();
      setTimeout(() => setIsPayoutModalOpen(false), 2000);
    } catch (err: any) {
      setPayoutError(err?.message || 'Network error.');
      setPayoutLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaving(true);
    setSettingsSuccess(null);
    try {
      const res = await fetch('/api/referral/dashboard', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: settingsPhone,
          payoutMethod: settingsPayoutMethod,
          payoutDetails: settingsPayoutDetails,
          socialLinks: settingsSocials,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSettingsSuccess('Settings updated successfully.');
        setStats(data.stats);
      }
    } catch {}
    setSettingsSaving(false);
  };

  // Base URL calculation for link display
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://crescelo.com';
  const referralLink = stats ? `${origin}/ref/${stats.partner.referralCode}` : '';
  const queryReferralLink = stats ? `${origin}?ref=${stats.partner.referralCode}` : '';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-lime-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Loading partner dashboard…</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-6 rounded-2xl border border-slate-800 bg-slate-900 text-center space-y-4">
          <AlertCircle className="h-10 w-10 text-red-400 mx-auto" />
          <h2 className="text-base font-bold text-white">Dashboard Error</h2>
          <p className="text-xs text-slate-400">{error || 'Unable to load partner dashboard.'}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition cursor-pointer"
            >
              Try Again
            </button>
            <Link
              href="/referral/login"
              className="px-4 py-2 rounded-xl bg-lime-400 text-slate-950 text-xs font-bold transition cursor-pointer"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-lime-400 selection:text-black">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <CresceloMark size={28} />
              <span className="font-bold text-base tracking-tight text-white group-hover:text-lime-400 transition">
                Crescelo
              </span>
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-semibold text-lime-400 flex items-center gap-1.5 bg-lime-400/10 px-2.5 py-0.5 rounded-full border border-lime-400/20">
              <Sparkles className="h-3 w-3" />
              <span>Partner Dashboard</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-white">{stats.partner.name}</span>
              <span className="text-[10px] text-slate-400">{stats.partner.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-7">
        {/* 1. Header & Referral Link Showcase Card */}
        <div className="p-6 sm:p-7 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                  Welcome back, {stats.partner.name}!
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-lime-400/10 text-lime-400 border border-lime-400/30">
                  {stats.partner.commissionPercent}% Recurring Commission
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Share your unique link across Instagram, YouTube, TikTok, and your channels. You earn 10% on every client each month for as long as they stay subscribed.
              </p>
            </div>

            <button
              onClick={() => setIsPayoutModalOpen(true)}
              disabled={stats.pendingPayout <= 0}
              className="px-4 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 active:bg-lime-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 text-xs font-bold transition flex items-center gap-2 self-start sm:self-auto cursor-pointer shadow-lg shadow-lime-400/10"
            >
              <Wallet className="h-4 w-4" />
              <span>Request Payout (${stats.pendingPayout.toFixed(2)})</span>
            </button>
          </div>

          {/* Unique Referral Link Box */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Your Unique Referral Link:
              </span>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Referral Code:</span>
                <button
                  onClick={() => handleCopyCode(stats.partner.referralCode)}
                  className="font-mono text-xs font-bold text-lime-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 hover:border-lime-400/50 transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>{stats.partner.referralCode}</span>
                  {copiedCode ? <Check className="h-3 w-3 text-lime-400" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                readOnly
                value={referralLink}
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-900 font-mono text-xs text-lime-300 select-all outline-none"
              />
              <button
                type="button"
                onClick={() => handleCopyLink(referralLink)}
                className="px-5 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                {copiedLink ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>

            {/* Social Sharing Shortcuts */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
              <span className="font-semibold text-slate-300">Quick Share:</span>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Build 24/7 autonomous AI assistants that book appointments and handle client chats with @Crescelo:')}&url=${encodeURIComponent(referralLink)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 transition flex items-center gap-1.5"
              >
                <TwitterIcon className="h-3 w-3 text-sky-400" />
                <span>X / Twitter</span>
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 transition flex items-center gap-1.5"
              >
                <LinkedInIcon className="h-3 w-3 text-blue-400" />
                <span>LinkedIn</span>
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Check out Crescelo for autonomous customer support and booking AI: ${referralLink}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 transition flex items-center gap-1.5"
              >
                <span>WhatsApp</span>
              </a>
              <a
                href={`mailto:?subject=${encodeURIComponent('Autonomous AI Assistant for your business')}&body=${encodeURIComponent(`Hey,\n\nI recommend checking out Crescelo for automated 24/7 customer support and appointment booking:\n${referralLink}\n\nYou get a 14-day free trial.`)}`}
                className="px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 transition flex items-center gap-1.5"
              >
                <Mail className="h-3 w-3 text-slate-400" />
                <span>Email</span>
              </a>
            </div>
          </div>
        </div>

        {/* 2. Key Metrics Overview (KPIs) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Monthly Recurring Commission (The Star Metric) */}
          <div className="p-5 rounded-2xl border border-lime-400/30 bg-gradient-to-b from-lime-400/10 to-slate-900 shadow-lg space-y-1">
            <div className="flex items-center justify-between text-xs text-lime-400 font-bold uppercase tracking-wider">
              <span>Monthly Recurring Commission</span>
              <DollarSign className="h-4 w-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              ${stats.monthlyRecurringCommission.toFixed(2)}
              <span className="text-xs font-semibold text-lime-400 ml-1">/mo</span>
            </div>
            <p className="text-[11px] text-slate-400 pt-1">
              Recurring 10% earned every month from active clients
            </p>
          </div>

          {/* Active Paying Customers */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
              <span>Active Paying Clients</span>
              <Users className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {stats.activePayingCustomers}
              <span className="text-xs font-semibold text-slate-500 ml-2">
                ({stats.trialCustomers} in 14d trial)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 pt-1">
              Clients currently paying monthly or annual subscriptions
            </p>
          </div>

          {/* Total Link Clicks */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
              <span>Total Link Clicks</span>
              <MousePointerClick className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {stats.totalClicks}
            </div>
            <p className="text-[11px] text-slate-400 pt-1">
              Visitors who landed on your referral link
            </p>
          </div>

          {/* Total Earned / Available Payout */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
              <span>Available for Payout</span>
              <Wallet className="h-4 w-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              ${stats.pendingPayout.toFixed(2)}
            </div>
            <p className="text-[11px] text-slate-400 pt-1">
              All-time earned: ${stats.totalEarningsToDate.toFixed(2)}
            </p>
          </div>
        </div>

        {/* 3. Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-lime-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>Overview &amp; Clients ({stats.customers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('clicks')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'clicks'
                ? 'bg-lime-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <MousePointerClick className="h-4 w-4" />
            <span>Click Traffic ({stats.totalClicks})</span>
          </button>

          <button
            onClick={() => setActiveTab('payouts')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'payouts'
                ? 'bg-lime-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Wallet className="h-4 w-4" />
            <span>Payout History ({stats.payouts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'bg-lime-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Partner Settings</span>
          </button>
        </div>

        {/* 4. Tab Content */}

        {/* TAB A: OVERVIEW & REFERRED CLIENTS */}
        {activeTab === 'overview' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xs overflow-hidden space-y-4 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="h-4 w-4 text-lime-400" />
                  <span>Referred Clients Breakdown</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Every active client pays you 10% monthly for as long as they stay subscribed.
                </p>
              </div>

              <div className="text-xs text-slate-400">
                Total Referred: <span className="text-white font-bold">{stats.customers.length}</span>
              </div>
            </div>

            {stats.customers.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <Users className="h-10 w-10 text-slate-700 mx-auto" />
                <h4 className="text-sm font-bold text-slate-300">No referred clients yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Share your referral link on Instagram, YouTube, TikTok, or client consultations. As soon as someone signs up, they appear here!
                </p>
                <button
                  onClick={() => handleCopyLink(referralLink)}
                  className="px-4 py-2 rounded-xl bg-lime-400 text-slate-950 text-xs font-bold transition hover:bg-lime-300 cursor-pointer"
                >
                  Copy Referral Link
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-3">Referred Client</th>
                      <th className="py-3 px-3">Subscription Plan</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Your Commission (10%)</th>
                      <th className="py-3 px-3">Customer Since</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                    {stats.customers.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3 px-3 font-semibold text-white">
                          {c.customerEmailMasked}
                        </td>
                        <td className="py-3 px-3 text-slate-300">
                          {c.planName} (${c.planPriceMonthly}/mo)
                        </td>
                        <td className="py-3 px-3">
                          {c.status === 'active' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              Active Paying
                            </span>
                          )}
                          {c.status === 'trial' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                              14-Day Free Trial
                            </span>
                          )}
                          {c.status === 'cancelled' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/30">
                              Cancelled
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-bold text-lime-400">
                          +${c.monthlyCommission.toFixed(2)}/mo
                        </td>
                        <td className="py-3 px-3 text-slate-400 text-[11px]">
                          {new Date(c.joinedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB B: CLICK TRAFFIC */}
        {activeTab === 'clicks' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xs p-5 sm:p-6 space-y-4">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MousePointerClick className="h-4 w-4 text-cyan-400" />
                  <span>Recent Referral Clicks</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Live traffic logs of visitors who clicked your link.
                </p>
              </div>
              <span className="text-xs font-bold text-white">
                Total: {stats.totalClicks} clicks
              </span>
            </div>

            {stats.recentClicks.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-500">
                No clicks recorded yet. Share your referral link to start tracking traffic!
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3">Referrer / Source</th>
                      <th className="py-2.5 px-3">Landing Path</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                    {stats.recentClicks.map((click) => (
                      <tr key={click.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                          {new Date(click.timestamp).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">
                          {click.referrer || 'Direct / Bio Link / Ad'}
                        </td>
                        <td className="py-2.5 px-3 text-cyan-400">
                          {click.landingPath || '/'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB C: PAYOUTS */}
        {activeTab === 'payouts' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xs p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-purple-400" />
                  <span>Payout History</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Available to withdraw: <strong className="text-lime-400">${stats.pendingPayout.toFixed(2)}</strong>
                </p>
              </div>

              <button
                onClick={() => setIsPayoutModalOpen(true)}
                disabled={stats.pendingPayout <= 0}
                className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 text-xs font-bold transition cursor-pointer"
              >
                Request Withdrawal
              </button>
            </div>

            {stats.payouts.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-500">
                No past payout requests found.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                      <th className="py-2.5 px-3">Date Requested</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Method</th>
                      <th className="py-2.5 px-3">Destination</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {stats.payouts.map((p) => (
                      <tr key={p.id}>
                        <td className="py-2.5 px-3 text-slate-400">
                          {new Date(p.requestedAt).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-white">
                          ${p.amount.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 uppercase text-[11px]">
                          {p.payoutMethod}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">
                          {p.payoutDetails}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.status === 'paid'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : p.status === 'rejected'
                                ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {p.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB D: PARTNER SETTINGS */}
        {activeTab === 'settings' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xs p-5 sm:p-7 space-y-6 max-w-2xl">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Settings className="h-4 w-4 text-lime-400" />
                <span>Partner Account Settings</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Update your contact phone number, payout account, and social media links.
              </p>
            </div>

            {settingsSuccess && (
              <div className="p-3 rounded-xl bg-lime-400/10 border border-lime-400/30 text-lime-400 text-xs flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span>{settingsSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={settingsPhone}
                  onChange={(e) => setSettingsPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-lime-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Preferred Payout Method</label>
                <select
                  value={settingsPayoutMethod}
                  onChange={(e) => setSettingsPayoutMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:border-lime-400"
                >
                  <option value="paypal">PayPal</option>
                  <option value="bank_transfer">Direct Bank Transfer / Wire</option>
                  <option value="wise">Wise (TransferWise)</option>
                  <option value="crypto">USDT / USDC (Crypto)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Payout Account Details</label>
                <input
                  type="text"
                  value={settingsPayoutDetails}
                  onChange={(e) => setSettingsPayoutDetails(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-lime-400"
                />
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-3">
                <span className="font-semibold text-slate-300 block">Social Profiles &amp; Channels</span>
                <div>
                  <span className="text-[11px] text-slate-400">Instagram Handle / URL</span>
                  <input
                    type="text"
                    value={settingsSocials.instagram || ''}
                    onChange={(e) => setSettingsSocials({ ...settingsSocials, instagram: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-white"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">YouTube Channel URL</span>
                  <input
                    type="text"
                    value={settingsSocials.youtube || ''}
                    onChange={(e) => setSettingsSocials({ ...settingsSocials, youtube: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-white"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">TikTok Handle / URL</span>
                  <input
                    type="text"
                    value={settingsSocials.tiktok || ''}
                    onChange={(e) => setSettingsSocials({ ...settingsSocials, tiktok: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-white"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">Website / Blog URL</span>
                  <input
                    type="text"
                    value={settingsSocials.website || ''}
                    onChange={(e) => setSettingsSocials({ ...settingsSocials, website: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={settingsSaving}
                className="py-2.5 px-5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold transition cursor-pointer"
              >
                {settingsSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Payout Request Modal */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="max-w-md w-full p-6 rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Wallet className="h-4 w-4 text-lime-400" />
                <span>Request Commission Payout</span>
              </h3>
              <button
                onClick={() => setIsPayoutModalOpen(false)}
                className="text-slate-500 hover:text-white text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {payoutError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{payoutError}</span>
              </div>
            )}

            {payoutSuccess && (
              <div className="p-3 rounded-xl bg-lime-400/10 border border-lime-400/30 text-lime-400 text-xs flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0" />
                <span>{payoutSuccess}</span>
              </div>
            )}

            <form onSubmit={handleRequestPayout} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Amount ($) — Max: ${stats.pendingPayout.toFixed(2)}
                </label>
                <input
                  type="number"
                  step="0.01"
                  max={stats.pendingPayout}
                  required
                  placeholder={`e.g. ${stats.pendingPayout.toFixed(2)}`}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Payout Method</label>
                <select
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white"
                >
                  <option value="paypal">PayPal</option>
                  <option value="bank_transfer">Direct Bank Transfer</option>
                  <option value="wise">Wise</option>
                  <option value="crypto">Crypto (USDT/USDC)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Destination Details</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. paypal-email@domain.com or IBAN"
                  value={payoutDetails}
                  onChange={(e) => setPayoutDetails(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={payoutLoading}
                  className="flex-1 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold transition cursor-pointer disabled:opacity-50"
                >
                  {payoutLoading ? 'Submitting…' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} Crescelo Partner Program &middot; 10% Lifetime Recurring Commission.</p>
      </footer>
    </div>
  );
}
