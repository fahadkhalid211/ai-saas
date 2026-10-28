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
  CheckCircle2,
  UserCheck,
  Video,
  MessageSquare,
  Building2,
  X,
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

    const amountNum = parseFloat(payoutAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setPayoutError('Please enter a valid amount.');
      return;
    }
    if (stats && amountNum > stats.pendingPayout) {
      setPayoutError(`Amount exceeds available unpaid balance ($${stats.pendingPayout.toFixed(2)}).`);
      return;
    }
    if (!payoutDetails.trim()) {
      setPayoutError('Please specify payout account details (e.g. PayPal email or IBAN).');
      return;
    }

    setPayoutLoading(true);
    try {
      const res = await fetch('/api/referral/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountNum,
          method: payoutMethod,
          details: payoutDetails.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setPayoutError(data.error || 'Failed to request payout.');
        setPayoutLoading(false);
        return;
      }

      setPayoutSuccess(`Payout request for $${amountNum.toFixed(2)} submitted successfully!`);
      setPayoutAmount('');
      await fetchDashboardData();
      setTimeout(() => {
        setIsPayoutModalOpen(false);
        setPayoutSuccess(null);
      }, 2000);
    } catch (err: any) {
      setPayoutError(err?.message || 'Failed to submit payout request.');
    } finally {
      setPayoutLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaving(true);
    setSettingsSuccess(null);
    try {
      const res = await fetch('/api/referral/dashboard', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: settingsPhone.trim(),
          payoutMethod: settingsPayoutMethod,
          payoutDetails: settingsPayoutDetails.trim(),
          socialLinks: settingsSocials,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Failed to update settings');
        setSettingsSaving(false);
        return;
      }
      setSettingsSuccess('Partner profile updated successfully!');
      await fetchDashboardData();
      setTimeout(() => setSettingsSuccess(null), 3000);
    } catch (err: any) {
      alert(err?.message || 'Failed to save settings');
    } finally {
      setSettingsSaving(false);
    }
  };

  if (isLoading && !stats) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mb-3" />
        <p className="text-xs text-slate-500 font-medium">Loading your partner portal...</p>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="h-10 w-10 text-rose-500 mb-3" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Unable to load partner dashboard</h2>
        <p className="text-xs text-slate-500 max-w-sm mt-1">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!stats) return null;

  const referralLink = typeof window !== 'undefined'
    ? `${window.location.origin}/ref/${stats.partner.referralCode}`
    : `https://crescelo.com/ref/${stats.partner.referralCode}`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <CresceloMark size={26} />
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                Crescelo <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 ml-1">Partner Portal</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-900 dark:text-white">{stats.partner.name}</span>
              <span className="text-[10px] text-slate-500 font-mono">{stats.partner.email}</span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {/* Banner: Referral Link & Payout Action */}
        <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Welcome back, {stats.partner.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {stats.partner.commissionPercent}% Recurring Commission
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Share your unique link across Instagram, YouTube, TikTok, and your channels. You earn 10% on every client each month for as long as they stay subscribed.
              </p>
            </div>

            <button
              onClick={() => setIsPayoutModalOpen(true)}
              disabled={stats.pendingPayout <= 0}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold transition flex items-center gap-2 self-start sm:self-auto cursor-pointer shadow-xs"
            >
              <Wallet className="h-4 w-4" />
              <span>Request Payout (${stats.pendingPayout.toFixed(2)})</span>
            </button>
          </div>

          {/* Unique Referral Link Box */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Your Unique Referral Link:
              </span>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Referral Code:</span>
                <button
                  onClick={() => handleCopyCode(stats.partner.referralCode)}
                  className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>{stats.partner.referralCode}</span>
                  {copiedCode ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3 text-slate-400" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                readOnly
                value={referralLink}
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs text-slate-900 dark:text-white select-all outline-none"
              />
              <button
                type="button"
                onClick={() => handleCopyLink(referralLink)}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-xs"
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

            {/* Quick Share Buttons */}
            <div className="flex items-center gap-2 pt-1 flex-wrap text-xs font-medium">
              <span className="text-[11px] text-slate-500 mr-1">Quick Share:</span>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out Crescelo to automate customer support with 24/7 AI: ${referralLink}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 transition flex items-center gap-1.5"
              >
                <TwitterIcon className="h-3 w-3 text-sky-500" />
                <span>X / Twitter</span>
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 transition flex items-center gap-1.5"
              >
                <LinkedInIcon className="h-3 w-3 text-blue-600" />
                <span>LinkedIn</span>
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Check out Crescelo for autonomous customer support and booking AI: ${referralLink}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 transition flex items-center gap-1.5"
              >
                <MessageSquare className="h-3 w-3 text-emerald-500" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium">Lifetime Earnings</span>
              <div className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white font-mono">
              ${stats.totalEarningsToDate.toFixed(2)}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              Paid out + pending balance
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium">Recurring Monthly (10%)</span>
              <div className="h-7 w-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              ${stats.monthlyRecurringCommission.toFixed(2)}<span className="text-xs font-normal text-slate-400">/mo</span>
            </div>
            <div className="mt-1 text-[11px] text-emerald-600 font-medium">
              Recurs every billing cycle
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium">Active Paying Clients</span>
              <div className="h-7 w-7 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
                <UserCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white font-mono">
              {stats.activePayingCustomers}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              {stats.trialCustomers} currently in 14d trial
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium">Link Clicks</span>
              <div className="h-7 w-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                <MousePointerClick className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white font-mono">
              {stats.totalClicks}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              {stats.totalClicks > 0
                ? `${((stats.totalReferredCustomers / stats.totalClicks) * 100).toFixed(1)}% conversion rate`
                : 'No clicks yet'}
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium">Available Payout</span>
              <div className="h-7 w-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-indigo-600 dark:text-indigo-400 font-mono">
              ${stats.pendingPayout.toFixed(2)}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              Ready for withdrawal
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-850 rounded-xl w-fit flex-wrap">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Overview &amp; Roster</span>
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'customers'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Referred Clients</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-slate-200 dark:bg-slate-700">
              {stats.customers.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('clicks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'clicks'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MousePointerClick className="h-3.5 w-3.5" />
            <span>Recent Clicks</span>
          </button>
          <button
            onClick={() => setActiveTab('payouts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'payouts'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Wallet className="h-3.5 w-3.5" />
            <span>Payouts &amp; Withdrawals</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Profile &amp; Channels</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW & CLIENT ROSTER */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Referred Client Roster</h3>
                  <p className="text-xs text-slate-500">
                    You receive 10% each month for every active client. Emails are partially masked for customer privacy.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                    <tr>
                      <th className="py-3 px-4">Client Email</th>
                      <th className="py-3 px-4">Subscription Plan</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Client Paid/Mo</th>
                      <th className="py-3 px-4 text-right">Your 10% Commission</th>
                      <th className="py-3 px-4 text-right">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {stats.customers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
                          <p>No referred clients yet.</p>
                          <p className="text-[11px] text-slate-500 mt-1">
                            Share your referral link on Instagram, YouTube, TikTok, or client consultations to start earning.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      stats.customers.map((cust) => (
                        <tr key={cust.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                          <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                            {cust.customerEmailMasked}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold capitalize text-slate-800 dark:text-slate-200">
                              {cust.planName}
                            </span>
                            <span className="text-[10px] text-slate-400 block capitalize">
                              {cust.billingInterval} billing
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                              cust.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : cust.status === 'trial'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                                : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                            }`}>
                              {cust.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                            ${cust.planPriceMonthly}/mo
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            ${cust.monthlyCommission.toFixed(2)}/mo
                          </td>
                          <td className="py-3.5 px-4 text-right text-slate-500 font-mono text-[11px]">
                            {new Date(cust.joinedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ALL CUSTOMERS */}
        {activeTab === 'customers' && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Attributed Client Subscriptions</h3>
              <p className="text-xs text-slate-500">
                Full history of all workspaces linked to your referral code.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Client Email</th>
                    <th className="py-3 px-4">Plan Name</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Plan Price</th>
                    <th className="py-3 px-4 text-right">Monthly (10%)</th>
                    <th className="py-3 px-4 text-right">Lifetime Earned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {stats.customers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No clients registered yet.
                      </td>
                    </tr>
                  ) : (
                    stats.customers.map((cust) => (
                      <tr key={cust.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 font-mono font-semibold">{cust.customerEmailMasked}</td>
                        <td className="py-3.5 px-4 capitalize">{cust.planName}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                            cust.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                          }`}>
                            {cust.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono">${cust.planPriceMonthly}/mo</td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          ${cust.monthlyCommission.toFixed(2)}/mo
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                          ${cust.totalEarned.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: CLICKS */}
        {activeTab === 'clicks' && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Referral Link Clicks</h3>
              <p className="text-xs text-slate-500">
                Track incoming traffic and discover which platforms drive the most visits.
              </p>
            </div>
            <div className="p-8 text-center text-xs text-slate-500">
              <MousePointerClick className="h-8 w-8 mx-auto mb-2 opacity-40 text-blue-500" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">Total Tracked Link Clicks: {stats.totalClicks}</p>
              <p className="text-slate-400 mt-1">
                Clicks set a 30-day attribution cookie on the visitor&apos;s browser.
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: PAYOUTS */}
        {activeTab === 'payouts' && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-500">Available Unpaid Balance</span>
                <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                  ${stats.pendingPayout.toFixed(2)}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Minimum payout withdrawal is $50.00.</p>
              </div>

              <button
                onClick={() => setIsPayoutModalOpen(true)}
                disabled={stats.pendingPayout <= 0}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-semibold text-xs transition shadow-xs cursor-pointer"
              >
                Request Withdrawal
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Payout History</h3>
              </div>
              <div className="p-8 text-center text-xs text-slate-400">
                <Wallet className="h-8 w-8 mx-auto mb-2 opacity-40 text-emerald-500" />
                <p>No payout requests on file yet.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SETTINGS & CHANNELS */}
        {activeTab === 'settings' && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Partner Profile &amp; Channels</h3>
              <p className="text-xs text-slate-500">
                Update your contact phone, social channels, and preferred payout destination.
              </p>
            </div>

            {settingsSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0" />
                <span>{settingsSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-5 max-w-xl">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={settingsPhone}
                  onChange={(e) => setSettingsPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Social Channels
                </label>

                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Instagram Handle / URL</span>
                  <input
                    type="text"
                    value={settingsSocials.instagram || ''}
                    onChange={(e) => setSettingsSocials({ ...settingsSocials, instagram: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                  />
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">YouTube Channel URL</span>
                  <input
                    type="text"
                    value={settingsSocials.youtube || ''}
                    onChange={(e) => setSettingsSocials({ ...settingsSocials, youtube: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                  />
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">TikTok Handle</span>
                  <input
                    type="text"
                    value={settingsSocials.tiktok || ''}
                    onChange={(e) => setSettingsSocials({ ...settingsSocials, tiktok: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                  />
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">LinkedIn Profile</span>
                  <input
                    type="text"
                    value={settingsSocials.linkedin || ''}
                    onChange={(e) => setSettingsSocials({ ...settingsSocials, linkedin: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Default Payout Details (PayPal email or Bank IBAN)
                </label>
                <input
                  type="text"
                  value={settingsPayoutDetails}
                  onChange={(e) => setSettingsPayoutDetails(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={settingsSaving}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs transition shadow-xs cursor-pointer"
              >
                {settingsSaving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Payout Request Modal */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Request Commission Payout</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsPayoutModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {payoutSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs">
                {payoutSuccess}
              </div>
            )}

            {payoutError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
                {payoutError}
              </div>
            )}

            <form onSubmit={handleRequestPayout} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Available Unpaid Balance: <span className="font-mono text-emerald-600 font-bold">${stats.pendingPayout.toFixed(2)}</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-xs">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max={stats.pendingPayout}
                    required
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    placeholder={stats.pendingPayout.toFixed(2)}
                    className="w-full pl-7 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Payout Method</label>
                <select
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="paypal">PayPal</option>
                  <option value="bank_transfer">Bank Transfer (IBAN / ACH)</option>
                  <option value="wise">Wise</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Account / Destination Details</label>
                <input
                  type="text"
                  required
                  value={payoutDetails}
                  onChange={(e) => setPayoutDetails(e.target.value)}
                  placeholder="e.g. payouts@agency.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={payoutLoading || stats.pendingPayout <= 0}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold transition shadow-xs cursor-pointer"
                >
                  {payoutLoading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>&copy; {new Date().getFullYear()} Crescelo. 10% Recurring Partner Program.</p>
      </footer>
    </div>
  );
}
