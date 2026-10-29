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
  XCircle,
} from 'lucide-react';
import { ReferralStats, ReferralPayout } from '@/types/referral';
import { TwitterIcon, LinkedInIcon, YouTubeIcon, InstagramIcon } from '@/components/referral/SocialIcons';

export default function ReferralDashboardPage() {
  const router = useRouter();

  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab State: 'overview' | 'customers' | 'clicks' | 'payouts' | 'settings'
  const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'clicks' | 'payouts' | 'settings'>('overview');

  // Interactive States
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Payout Modal State
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState<'paypal' | 'bank_transfer' | 'wise'>('paypal');
  const [payoutDetails, setPayoutDetails] = useState('');
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutError, setPayoutError] = useState<string | null>(null);
  const [payoutSuccess, setPayoutSuccess] = useState<string | null>(null);

  // Settings Tab State
  const [settingsPhone, setSettingsPhone] = useState('');
  const [settingsPayoutMethod, setSettingsPayoutMethod] = useState<'paypal' | 'bank_transfer' | 'wise' | 'crypto'>('paypal');
  const [settingsPayoutDetails, setSettingsPayoutDetails] = useState('');
  const [settingsSocials, setSettingsSocials] = useState<Record<string, string>>({});
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/referral/dashboard', {
        cache: 'no-store',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        if (res.status === 401) {
          router.push('/referral/login');
          return;
        }
        throw new Error(data.error || 'Failed to fetch partner data');
      }

      setStats(data.stats);
      if (data.stats.partner) {
        setSettingsPhone(data.stats.partner.phone || '');
        setSettingsPayoutMethod(data.stats.partner.payoutMethod || 'paypal');
        setSettingsPayoutDetails(data.stats.partner.payoutDetails || '');
        setSettingsSocials(data.stats.partner.socialLinks || {});
        setPayoutMethod(data.stats.partner.payoutMethod === 'bank_transfer' ? 'bank_transfer' : data.stats.partner.payoutMethod === 'wise' ? 'wise' : 'paypal');
        setPayoutDetails(data.stats.partner.payoutDetails || '');
      }
    } catch (err: any) {
      setError(err?.message || 'Error fetching referral statistics');
    } finally {
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
        method: 'PUT',
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
      <div className="min-h-screen bg-[#fffeeb] flex flex-col items-center justify-center p-4">
        <RefreshCw className="h-8 w-8 text-[#0f6e58] animate-spin mb-3" />
        <p className="text-xs text-[#55554c] font-bold">Loading your partner portal...</p>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="min-h-screen bg-[#fffeeb] flex flex-col items-center justify-center p-4 text-center">
        <div className="p-6 rounded-3xl border-[1.5px] border-[#1a1a1a] bg-[#fffdf6] shadow-[0_4px_0_#1a1a1a] max-w-sm">
          <AlertCircle className="h-10 w-10 text-[#ff6c4c] mx-auto mb-3" />
          <h2 className="text-lg font-bold text-[#1a1a1a]">Unable to load partner dashboard</h2>
          <p className="text-xs text-[#55554c] mt-1">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 mk-btn mk-btn-primary px-5 py-2 text-xs font-bold shadow-[0_2px_0_#1a1a1a]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const referralLink = typeof window !== 'undefined'
    ? `${window.location.origin}/ref/${stats.partner.referralCode}`
    : `https://crescelo.com/ref/${stats.partner.referralCode}`;

  return (
    <div className="min-h-screen bg-[#fffeeb] text-[#1a1a1a] flex flex-col justify-between selection:bg-[#abff44] selection:text-[#08251a]">
      {/* Top Navbar */}
      <header className="border-b-[1.5px] border-[#1a1a1a] bg-[#fffdf6]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <CresceloMark size={28} />
              <span className="font-extrabold text-lg tracking-tight text-[#1a1a1a] flex items-center">
                Crescelo
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#abff44] text-[#08251a] border border-[#1a1a1a] ml-2 shadow-[0_1px_0_#1a1a1a]">
                  Partner Portal
                </span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-[#1a1a1a]">{stats.partner.name}</span>
              <span className="text-[10.5px] text-[#55554c] font-mono">{stats.partner.email}</span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl border-[1.5px] border-[#1a1a1a] bg-[#fffdf6] hover:bg-[#fffeeb] text-[#1a1a1a] shadow-[0_2px_0_#1a1a1a] transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {/* Banner: Referral Link & Welcome */}
        <div className="p-6 sm:p-7 rounded-3xl border-[1.5px] border-[#1a1a1a] bg-[#08251a] text-[#fffeeb] shadow-[0_5px_0_#1a1a1a] space-y-5 relative overflow-hidden">
          <div className="mk-hero-glow" aria-hidden="true" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#fffeeb]">
                  Welcome back, {stats.partner.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#abff44] text-[#08251a] border border-[#1a1a1a]">
                  {stats.partner.commissionPercent}% Recurring Commission
                </span>
              </div>
              <p className="text-xs text-[#cfe3d6] mt-1 max-w-2xl leading-relaxed">
                Share your unique link across YouTube, Instagram, TikTok, client consults, and your channels. You earn 10% each month for as long as your referred clients stay subscribed.
              </p>
            </div>

            <button
              onClick={() => setIsPayoutModalOpen(true)}
              disabled={stats.pendingPayout <= 0}
              className="px-5 py-2.5 rounded-xl border-[1.5px] border-[#1a1a1a] bg-[#abff44] hover:bg-[#b8ff5e] disabled:opacity-40 disabled:cursor-not-allowed text-[#08251a] text-xs font-bold transition flex items-center gap-2 self-start sm:self-auto cursor-pointer shadow-[0_2px_0_#1a1a1a]"
            >
              <Wallet className="h-4 w-4" />
              <span>Request Payout (${stats.pendingPayout.toFixed(2)})</span>
            </button>
          </div>

          {/* Unique Referral Link Box */}
          <div className="relative z-10 p-4 rounded-2xl border-[1.5px] border-[#1a1a1a] bg-[#fffdf6] text-[#1a1a1a] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0f6e58]">
                Your Unique Tracking Link:
              </span>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#55554c]">Referral Slug:</span>
                <button
                  onClick={() => handleCopyCode(stats.partner.referralCode)}
                  className="font-mono text-xs font-bold text-[#08251a] bg-[#e6f9c8] px-2 py-0.5 rounded-md border border-[#1a1a1a] transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>{stats.partner.referralCode}</span>
                  {copiedCode ? <Check className="h-3 w-3 text-[#0f6e58]" /> : <Copy className="h-3 w-3 text-[#55554c]" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                readOnly
                value={referralLink}
                className="flex-1 px-3.5 py-2.5 rounded-xl border-[1.5px] border-[#1a1a1a] bg-[#fffeeb] font-mono text-xs font-bold text-[#1a1a1a] select-all outline-none"
              />
              <button
                type="button"
                onClick={() => handleCopyLink(referralLink)}
                className="mk-btn mk-btn-primary px-5 py-2.5 text-xs font-bold shadow-[0_2px_0_#1a1a1a] hover:translate-y-[-2px] transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
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
            <div className="flex items-center gap-2 pt-1 flex-wrap text-xs font-semibold">
              <span className="text-[11px] text-[#55554c] mr-1">Quick Share:</span>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Automate your customer support 24/7 with Crescelo AI: ${referralLink}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg border-[1.5px] border-[#1a1a1a] bg-[#fffeeb] hover:bg-white text-[#1a1a1a] transition flex items-center gap-1.5"
              >
                <TwitterIcon className="h-3 w-3" />
                <span>X / Twitter</span>
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg border-[1.5px] border-[#1a1a1a] bg-[#fffeeb] hover:bg-white text-[#1a1a1a] transition flex items-center gap-1.5"
              >
                <LinkedInIcon className="h-3 w-3 text-[#0077b5]" />
                <span>LinkedIn</span>
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Check out Crescelo for autonomous customer support and instant bookings: ${referralLink}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg border-[1.5px] border-[#1a1a1a] bg-[#fffeeb] hover:bg-white text-[#1a1a1a] transition flex items-center gap-1.5"
              >
                <MessageSquare className="h-3 w-3 text-[#0f6e58]" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* 5 KPI Stat Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Card 1 */}
          <div className="p-4.5 rounded-2xl border-[1.5px] border-[#1a1a1a] bg-[#fffdf6] shadow-[0_3px_0_#1a1a1a]">
            <div className="flex items-center justify-between text-[#55554c]">
              <span className="text-xs font-bold">Lifetime Earnings</span>
              <div className="h-7 w-7 rounded-lg bg-[#fffeeb] border border-[#1a1a1a] text-[#1a1a1a] flex items-center justify-center">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-[#1a1a1a] font-mono">
              ${stats.totalEarningsToDate.toFixed(2)}
            </div>
            <div className="mt-1 text-[11px] text-[#55554c]">
              Paid out + active balance
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-4.5 rounded-2xl border-[1.5px] border-[#1a1a1a] bg-[#e8f5f2] shadow-[0_3px_0_#1a1a1a]">
            <div className="flex items-center justify-between text-[#0f6e58]">
              <span className="text-xs font-bold">Recurring Monthly (10%)</span>
              <div className="h-7 w-7 rounded-lg bg-[#fffdf6] border border-[#1a1a1a] text-[#0f6e58] flex items-center justify-center">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-[#08251a] font-mono">
              ${stats.monthlyRecurringCommission.toFixed(2)}<span className="text-xs font-normal text-[#55554c]">/mo</span>
            </div>
            <div className="mt-1 text-[11px] text-[#0f6e58] font-bold">
              Recurs every billing cycle
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-4.5 rounded-2xl border-[1.5px] border-[#1a1a1a] bg-[#f0d7ff] shadow-[0_3px_0_#1a1a1a]">
            <div className="flex items-center justify-between text-[#1a1a1a]">
              <span className="text-xs font-bold">Active Paying Clients</span>
              <div className="h-7 w-7 rounded-lg bg-[#fffdf6] border border-[#1a1a1a] text-[#1a1a1a] flex items-center justify-center">
                <UserCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-[#1a1a1a] font-mono">
              {stats.activePayingCustomers}
            </div>
            <div className="mt-1 text-[11px] text-[#55554c] font-medium">
              {stats.trialCustomers} in trial {stats.clearingCustomers ? `· ${stats.clearingCustomers} clearing` : ''}
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-4.5 rounded-2xl border-[1.5px] border-[#1a1a1a] bg-[#fffdf6] shadow-[0_3px_0_#1a1a1a]">
            <div className="flex items-center justify-between text-[#55554c]">
              <span className="text-xs font-bold">Link Clicks</span>
              <div className="h-7 w-7 rounded-lg bg-[#ffe7c2] border border-[#1a1a1a] text-[#8a4a0a] flex items-center justify-center">
                <MousePointerClick className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-[#1a1a1a] font-mono">
              {stats.totalClicks}
            </div>
            <div className="mt-1 text-[11px] text-[#55554c]">
              {stats.totalClicks > 0
                ? `${((stats.totalReferredCustomers / stats.totalClicks) * 100).toFixed(1)}% conversion rate`
                : 'No clicks yet'}
            </div>
          </div>

          {/* Card 5 */}
          <div className="p-4.5 rounded-2xl border-[1.5px] border-[#1a1a1a] bg-[#abff44] shadow-[0_3px_0_#1a1a1a]">
            <div className="flex items-center justify-between text-[#08251a]">
              <span className="text-xs font-bold">Available Payout</span>
              <div className="h-7 w-7 rounded-lg bg-[#fffdf6] border border-[#1a1a1a] text-[#08251a] flex items-center justify-center">
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-[#08251a] font-mono">
              ${stats.pendingPayout.toFixed(2)}
            </div>
            <div className="mt-1 text-[11px] text-[#08251a] font-bold">
              Ready for withdrawal
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-xl border-[1.5px] text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-[#1a1a1a] bg-[#abff44] text-[#08251a] shadow-[0_2px_0_#1a1a1a]'
                : 'border-[#1a1a1a]/30 bg-[#fffdf6] text-[#55554c] hover:border-[#1a1a1a] hover:text-[#1a1a1a]'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Overview &amp; Roster</span>
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-3.5 py-2 rounded-xl border-[1.5px] text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'customers'
                ? 'border-[#1a1a1a] bg-[#abff44] text-[#08251a] shadow-[0_2px_0_#1a1a1a]'
                : 'border-[#1a1a1a]/30 bg-[#fffdf6] text-[#55554c] hover:border-[#1a1a1a] hover:text-[#1a1a1a]'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Referred Clients</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-[#1a1a1a] text-[#abff44]">
              {stats.customers.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('clicks')}
            className={`px-3.5 py-2 rounded-xl border-[1.5px] text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'clicks'
                ? 'border-[#1a1a1a] bg-[#abff44] text-[#08251a] shadow-[0_2px_0_#1a1a1a]'
                : 'border-[#1a1a1a]/30 bg-[#fffdf6] text-[#55554c] hover:border-[#1a1a1a] hover:text-[#1a1a1a]'
            }`}
          >
            <MousePointerClick className="h-3.5 w-3.5" />
            <span>Link Clicks</span>
          </button>
          <button
            onClick={() => setActiveTab('payouts')}
            className={`px-3.5 py-2 rounded-xl border-[1.5px] text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'payouts'
                ? 'border-[#1a1a1a] bg-[#abff44] text-[#08251a] shadow-[0_2px_0_#1a1a1a]'
                : 'border-[#1a1a1a]/30 bg-[#fffdf6] text-[#55554c] hover:border-[#1a1a1a] hover:text-[#1a1a1a]'
            }`}
          >
            <Wallet className="h-3.5 w-3.5" />
            <span>Payout History</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-2 rounded-xl border-[1.5px] text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'border-[#1a1a1a] bg-[#abff44] text-[#08251a] shadow-[0_2px_0_#1a1a1a]'
                : 'border-[#1a1a1a]/30 bg-[#fffdf6] text-[#55554c] hover:border-[#1a1a1a] hover:text-[#1a1a1a]'
            }`}
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Profile &amp; Settings</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW & CLIENT ROSTER */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="rounded-2xl border-[1.5px] border-[#1a1a1a] bg-[#fffdf6] shadow-[0_4px_0_#1a1a1a] overflow-hidden">
              <div className="p-4 sm:p-5 border-b-[1.5px] border-[#1a1a1a] bg-[#fffeeb] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#1a1a1a]">Active &amp; Pending Referred Clients</h3>
                  <p className="text-xs text-[#55554c]">
                    Earn 10% monthly recurring commission. Referrals undergo a 30-day clearance following their first charge before funds unlock.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#08251a] text-[#fffeeb] border-b-[1.5px] border-[#1a1a1a] font-bold">
                    <tr>
                      <th className="py-3 px-4">Client Email</th>
                      <th className="py-3 px-4">Subscription Plan</th>
                      <th className="py-3 px-4 text-center">Status &amp; Clearance</th>
                      <th className="py-3 px-4 text-right">Client Paid/Mo</th>
                      <th className="py-3 px-4 text-right">Your 10% Commission</th>
                      <th className="py-3 px-4 text-right">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a1a1a]/15">
                    {stats.customers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-[#55554c]">
                          <Users className="h-8 w-8 mx-auto mb-2 opacity-40 text-[#0f6e58]" />
                          <p className="font-bold">No referred clients yet.</p>
                          <p className="text-[11px] text-[#55554c] mt-1">
                            Share your referral link on YouTube, Instagram, TikTok, or client consultations to start earning.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      stats.customers.map((cust) => (
                        <tr key={cust.id} className="hover:bg-[#fffeeb] transition">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              {cust.isPending && (
                                <span
                                  className="inline-flex items-center justify-center text-[#8a4a0a] animate-pulse shrink-0"
                                  title={
                                    cust.status === 'clearing'
                                      ? `Clearing period: Customer's card was charged. Commission unlocks after 30 days without refund (${cust.daysRemaining ?? 30} days left).`
                                      : `Free trial period: ${cust.daysRemaining ?? 14} days remaining.`
                                  }
                                >
                                  <Clock className="h-3.5 w-3.5" />
                                </span>
                              )}
                              <span className="font-mono font-semibold text-[#1a1a1a]">
                                {cust.customerEmailMasked}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold capitalize text-[#1a1a1a]">
                              {cust.planName}
                            </span>
                            <span className="text-[10px] text-[#55554c] block capitalize">
                              {cust.billingInterval} billing
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {cust.status === 'active' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e8f5f2] text-[#0f6e58] border border-[#0f6e58]/30">
                                <CheckCircle2 className="h-3 w-3" />
                                <span>Active</span>
                              </span>
                            ) : cust.status === 'clearing' ? (
                              <span
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ffe7c2] text-[#8a4a0a] border border-[#8a4a0a]/40"
                                title={`Payment charged successfully. Under 30-day refund clearance guarantee: ${cust.daysRemaining ?? 30} days remaining.`}
                              >
                                <Clock className="h-3 w-3 animate-pulse text-[#8a4a0a]" />
                                <span>Clearing ({cust.daysRemaining ?? 30}d left)</span>
                              </span>
                            ) : cust.status === 'trial' ? (
                              <span
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#f0d7ff] text-[#08251a] border border-[#1a1a1a]/30"
                                title={`In free trial: ${cust.daysRemaining ?? 14} days remaining.`}
                              >
                                <Clock className="h-3 w-3 text-[#1a1a1a]" />
                                <span>In Trial ({cust.daysRemaining ?? 14}d left)</span>
                              </span>
                            ) : cust.status === 'refunded' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ff6c4c]/15 text-[#ff6c4c] border border-[#ff6c4c]/40">
                                <XCircle className="h-3 w-3" />
                                <span>Refunded</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize bg-[#fffeeb] text-[#1a1a1a] border border-[#1a1a1a]/30">
                                {cust.status}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-[#55554c]">
                            ${cust.planPriceMonthly}/mo
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold">
                            {cust.status === 'active' ? (
                              <span className="text-[#0f6e58]">
                                ${cust.monthlyCommission.toFixed(2)}/mo
                              </span>
                            ) : cust.status === 'refunded' || cust.status === 'cancelled' ? (
                              <span className="text-[#55554c] line-through">$0.00</span>
                            ) : (
                              <span className="text-[#8a4a0a]" title="Pending clearance: unlocks after 30-day refund window">
                                ~${cust.monthlyCommission.toFixed(2)}<span className="text-[10px] font-normal text-[#55554c]"> (est.)</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right text-[#55554c] font-mono text-[11px]">
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
          <div className="rounded-2xl border-[1.5px] border-[#1a1a1a] bg-[#fffdf6] shadow-[0_4px_0_#1a1a1a] overflow-hidden">
            <div className="p-4 sm:p-5 border-b-[1.5px] border-[#1a1a1a] bg-[#fffeeb]">
              <h3 className="text-sm font-bold text-[#1a1a1a]">Attributed Client Subscriptions</h3>
              <p className="text-xs text-[#55554c]">
                Full history of all workspaces linked to your referral code.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#08251a] text-[#fffeeb] border-b-[1.5px] border-[#1a1a1a] font-bold">
                  <tr>
                    <th className="py-3 px-4">Client Email</th>
                    <th className="py-3 px-4">Plan Name</th>
                    <th className="py-3 px-4 text-center">Status &amp; Clearance</th>
                    <th className="py-3 px-4 text-right">Plan Price</th>
                    <th className="py-3 px-4 text-right">Monthly (10%)</th>
                    <th className="py-3 px-4 text-right">Lifetime Earned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a1a1a]/15">
                  {stats.customers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#55554c]">
                        No clients registered yet.
                      </td>
                    </tr>
                  ) : (
                    stats.customers.map((cust) => (
                      <tr key={cust.id} className="hover:bg-[#fffeeb] transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            {cust.isPending && (
                              <span
                                className="inline-flex items-center justify-center text-[#8a4a0a] animate-pulse shrink-0"
                                title={
                                  cust.status === 'clearing'
                                    ? `Clearing period: Customer's card was charged. Commission unlocks after 30 days without refund (${cust.daysRemaining ?? 30} days left).`
                                    : `Free trial period: ${cust.daysRemaining ?? 14} days remaining.`
                                }
                              >
                                <Clock className="h-3.5 w-3.5" />
                              </span>
                            )}
                            <span className="font-mono font-semibold text-[#1a1a1a]">
                              {cust.customerEmailMasked}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 capitalize font-bold text-[#1a1a1a]">{cust.planName}</td>
                        <td className="py-3.5 px-4 text-center">
                          {cust.status === 'active' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e8f5f2] text-[#0f6e58] border border-[#0f6e58]/30">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Active</span>
                            </span>
                          ) : cust.status === 'clearing' ? (
                            <span
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ffe7c2] text-[#8a4a0a] border border-[#8a4a0a]/40"
                              title={`Payment charged successfully. Under 30-day refund clearance guarantee: ${cust.daysRemaining ?? 30} days remaining.`}
                            >
                              <Clock className="h-3 w-3 animate-pulse text-[#8a4a0a]" />
                              <span>Clearing ({cust.daysRemaining ?? 30}d left)</span>
                            </span>
                          ) : cust.status === 'trial' ? (
                            <span
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#f0d7ff] text-[#08251a] border border-[#1a1a1a]/30"
                              title={`In free trial: ${cust.daysRemaining ?? 14} days remaining.`}
                            >
                              <Clock className="h-3 w-3 text-[#1a1a1a]" />
                              <span>In Trial ({cust.daysRemaining ?? 14}d left)</span>
                            </span>
                          ) : cust.status === 'refunded' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ff6c4c]/15 text-[#ff6c4c] border border-[#ff6c4c]/40">
                              <XCircle className="h-3 w-3" />
                              <span>Refunded</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize bg-[#fffeeb] text-[#1a1a1a] border border-[#1a1a1a]/30">
                              {cust.status}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-[#55554c]">${cust.planPriceMonthly}/mo</td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold">
                          {cust.status === 'active' ? (
                            <span className="text-[#0f6e58]">
                              ${cust.monthlyCommission.toFixed(2)}/mo
                            </span>
                          ) : cust.status === 'refunded' || cust.status === 'cancelled' ? (
                            <span className="text-[#55554c] line-through">$0.00</span>
                          ) : (
                            <span className="text-[#8a4a0a]" title="Pending clearance: unlocks after 30-day refund window">
                              ~${cust.monthlyCommission.toFixed(2)}<span className="text-[10px] font-normal text-[#55554c]"> (est.)</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-[#1a1a1a] font-bold">
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
          <div className="rounded-2xl border-[1.5px] border-[#1a1a1a] bg-[#fffdf6] shadow-[0_4px_0_#1a1a1a] overflow-hidden">
            <div className="p-4 sm:p-5 border-b-[1.5px] border-[#1a1a1a] bg-[#fffeeb]">
              <h3 className="text-sm font-bold text-[#1a1a1a]">Recent Referral Link Clicks</h3>
              <p className="text-xs text-[#55554c]">
                Track incoming traffic and discover which platforms drive the most visits.
              </p>
            </div>
            <div className="p-12 text-center text-xs text-[#55554c]">
              <MousePointerClick className="h-10 w-10 mx-auto mb-3 text-[#0f6e58]" />
              <p className="font-extrabold text-base text-[#1a1a1a]">Total Tracked Link Clicks: {stats.totalClicks}</p>
              <p className="text-[#55554c] mt-1 max-w-sm mx-auto">
                Clicks set an automatic 30-day attribution cookie on the visitor&apos;s browser.
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: PAYOUTS */}
        {activeTab === 'payouts' && (
          <div className="space-y-5">
            <div className="p-6 rounded-2xl border-[1.5px] border-[#1a1a1a] bg-[#abff44] shadow-[0_4px_0_#1a1a1a] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#08251a]">Available Unpaid Balance</span>
                <div className="text-3xl font-extrabold font-mono text-[#08251a]">
                  ${stats.pendingPayout.toFixed(2)}
                </div>
                <p className="text-xs text-[#08251a]/80 mt-0.5">Minimum payout withdrawal is $50.00.</p>
              </div>

              <button
                onClick={() => setIsPayoutModalOpen(true)}
                disabled={stats.pendingPayout <= 0}
                className="px-6 py-3 rounded-xl border-[1.5px] border-[#1a1a1a] bg-[#08251a] hover:bg-[#0d3a29] disabled:opacity-40 text-white font-bold text-xs transition shadow-[0_2px_0_#1a1a1a] cursor-pointer"
              >
                Request Withdrawal
              </button>
            </div>

            <div className="rounded-2xl border-[1.5px] border-[#1a1a1a] bg-[#fffdf6] shadow-[0_4px_0_#1a1a1a] overflow-hidden">
              <div className="p-4 sm:p-5 border-b-[1.5px] border-[#1a1a1a] bg-[#fffeeb]">
                <h3 className="text-sm font-bold text-[#1a1a1a]">Payout History</h3>
              </div>
              <div className="p-12 text-center text-xs text-[#55554c]">
                <Wallet className="h-10 w-10 mx-auto mb-3 text-[#0f6e58]" />
                <p className="font-bold text-sm text-[#1a1a1a]">No payout requests on file yet.</p>
                <p className="text-[11px] text-[#55554c] mt-1">When you submit a withdrawal request, its status and approval timestamp will appear here.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SETTINGS & CHANNELS */}
        {activeTab === 'settings' && (
          <div className="rounded-2xl border-[1.5px] border-[#1a1a1a] bg-[#fffdf6] shadow-[0_4px_0_#1a1a1a] p-6 sm:p-8 space-y-6">
            <div className="border-b-[1.5px] border-[#1a1a1a]/15 pb-3">
              <h3 className="text-base font-extrabold text-[#1a1a1a]">Partner Profile &amp; Channels</h3>
              <p className="text-xs text-[#55554c]">
                Update your contact phone, social channels, and preferred payout destination.
              </p>
            </div>

            {settingsSuccess && (
              <div className="p-3.5 rounded-xl bg-[#e6f9c8] border-[1.5px] border-[#abff44] text-[#08251a] text-xs font-bold flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-[#0f6e58]" />
                <span>{settingsSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-5 max-w-xl">
              <div>
                <label className="block text-xs font-bold text-[#1a1a1a] mb-1">
                  Phone Number (WhatsApp / Mobile)
                </label>
                <input
                  type="tel"
                  value={settingsPhone}
                  onChange={(e) => setSettingsPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-[#1a1a1a] bg-[#fffeeb] text-[#1a1a1a] text-xs font-mono outline-none focus:ring-2 focus:ring-[#abff44]"
                />
              </div>

              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-[#1a1a1a]">
                  Social Channels
                </label>

                <div>
                  <span className="text-[11px] text-[#55554c] font-semibold">Instagram Handle / URL</span>
                  <input
                    type="text"
                    value={settingsSocials.instagram || ''}
                    onChange={(e) => setSettingsSocials({ ...settingsSocials, instagram: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border-[1.5px] border-[#1a1a1a] bg-[#fffeeb] text-[#1a1a1a] text-xs outline-none focus:ring-2 focus:ring-[#abff44] mt-1"
                  />
                </div>

                <div>
                  <span className="text-[11px] text-[#55554c] font-semibold">YouTube Channel URL</span>
                  <input
                    type="text"
                    value={settingsSocials.youtube || ''}
                    onChange={(e) => setSettingsSocials({ ...settingsSocials, youtube: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border-[1.5px] border-[#1a1a1a] bg-[#fffeeb] text-[#1a1a1a] text-xs outline-none focus:ring-2 focus:ring-[#abff44] mt-1"
                  />
                </div>

                <div>
                  <span className="text-[11px] text-[#55554c] font-semibold">TikTok Handle</span>
                  <input
                    type="text"
                    value={settingsSocials.tiktok || ''}
                    onChange={(e) => setSettingsSocials({ ...settingsSocials, tiktok: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border-[1.5px] border-[#1a1a1a] bg-[#fffeeb] text-[#1a1a1a] text-xs outline-none focus:ring-2 focus:ring-[#abff44] mt-1"
                  />
                </div>

                <div>
                  <span className="text-[11px] text-[#55554c] font-semibold">LinkedIn Profile</span>
                  <input
                    type="text"
                    value={settingsSocials.linkedin || ''}
                    onChange={(e) => setSettingsSocials({ ...settingsSocials, linkedin: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border-[1.5px] border-[#1a1a1a] bg-[#fffeeb] text-[#1a1a1a] text-xs outline-none focus:ring-2 focus:ring-[#abff44] mt-1"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-[#1a1a1a] mb-1">
                  Default Payout Details (PayPal email or Bank IBAN)
                </label>
                <input
                  type="text"
                  value={settingsPayoutDetails}
                  onChange={(e) => setSettingsPayoutDetails(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-[#1a1a1a] bg-[#fffeeb] text-[#1a1a1a] text-xs font-mono outline-none focus:ring-2 focus:ring-[#abff44]"
                />
              </div>

              <button
                type="submit"
                disabled={settingsSaving}
                className="mk-btn mk-btn-primary px-6 py-2.5 text-xs font-bold shadow-[0_2px_0_#1a1a1a] disabled:opacity-50 cursor-pointer"
              >
                {settingsSaving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Payout Request Modal */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a1a1a]/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border-[2px] border-[#1a1a1a] bg-[#fffdf6] p-6 sm:p-7 shadow-[0_8px_0_#1a1a1a] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-[1.5px] border-[#1a1a1a]/15">
              <h3 className="text-base font-extrabold text-[#1a1a1a] flex items-center gap-2">
                <Wallet className="h-5 w-5 text-[#0f6e58]" />
                <span>Request Commission Payout</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsPayoutModalOpen(false)}
                className="p-1 rounded-lg text-[#55554c] hover:text-[#1a1a1a] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {payoutSuccess && (
              <div className="p-3.5 rounded-xl bg-[#e6f9c8] border-[1.5px] border-[#abff44] text-[#08251a] text-xs font-bold">
                {payoutSuccess}
              </div>
            )}

            {payoutError && (
              <div className="p-3.5 rounded-xl bg-[#ffe7c2] border-[1.5px] border-[#8a4a0a] text-[#8a4a0a] text-xs font-medium">
                {payoutError}
              </div>
            )}

            <form onSubmit={handleRequestPayout} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1a1a1a] mb-1">
                  Available Unpaid Balance: <span className="font-mono text-[#0f6e58] font-extrabold">${stats.pendingPayout.toFixed(2)}</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-[#55554c] font-mono text-xs font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max={stats.pendingPayout}
                    required
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    placeholder={stats.pendingPayout.toFixed(2)}
                    className="w-full pl-7 pr-3.5 py-2.5 rounded-xl border-[1.5px] border-[#1a1a1a] bg-[#fffeeb] text-[#1a1a1a] text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-[#abff44]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1a1a1a] mb-1">Payout Method</label>
                <select
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border-[1.5px] border-[#1a1a1a] bg-[#fffeeb] text-[#1a1a1a] text-xs outline-none focus:ring-2 focus:ring-[#abff44] cursor-pointer font-bold"
                >
                  <option value="paypal">PayPal</option>
                  <option value="bank_transfer">Bank Transfer (IBAN / ACH)</option>
                  <option value="wise">Wise</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1a1a1a] mb-1">Account / Destination Details</label>
                <input
                  type="text"
                  required
                  value={payoutDetails}
                  onChange={(e) => setPayoutDetails(e.target.value)}
                  placeholder="e.g. payouts@agency.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-[#1a1a1a] bg-[#fffeeb] text-[#1a1a1a] text-xs font-mono outline-none focus:ring-2 focus:ring-[#abff44]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="px-4 py-2 rounded-xl border-[1.5px] border-[#1a1a1a] bg-[#fffdf6] hover:bg-[#fffeeb] text-[#1a1a1a] text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={payoutLoading || stats.pendingPayout <= 0}
                  className="mk-btn mk-btn-primary px-5 py-2 text-xs font-bold shadow-[0_2px_0_#1a1a1a] disabled:opacity-50 cursor-pointer"
                >
                  {payoutLoading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t-[1.5px] border-[#1a1a1a] py-6 text-center text-xs text-[#55554c] bg-[#fffdf6]">
        <p>&copy; {new Date().getFullYear()} Crescelo. Referral Program.</p>
      </footer>
    </div>
  );
}
