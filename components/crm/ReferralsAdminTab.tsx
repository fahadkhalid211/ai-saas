'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Users,
  DollarSign,
  TrendingUp,
  MousePointerClick,
  Copy,
  Check,
  Search,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Wallet,
  Calendar,
  AlertCircle,
  Clock,
  Globe,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Sliders,
  Filter,
  ArrowRight,
  UserCheck,
  Building,
} from 'lucide-react';
import { T, useT } from '@/lib/i18n/context';
import { TwitterIcon, LinkedInIcon, YouTubeIcon, InstagramIcon } from '@/components/referral/SocialIcons';

interface PartnerWithStats {
  id: string;
  name: string;
  email: string;
  phone: string;
  referralCode: string;
  commissionPercent: number;
  marketingPlatforms: string[];
  socialLinks: Record<string, string>;
  marketingStrategy: string;
  payoutMethod: string;
  payoutDetails: string;
  status: string;
  createdAt: string;
  stats: {
    totalClicks: number;
    totalReferredCustomers: number;
    activePayingCustomers: number;
    trialCustomers: number;
    monthlyRecurringCommission: number;
    totalEarningsToDate: number;
    pendingPayout: number;
    customers: Array<{
      id: string;
      customerEmailMasked: string;
      planName: string;
      planPriceMonthly: number;
      billingInterval: string;
      status: string;
      monthlyCommission: number;
      totalEarned: number;
      joinedAt: string;
    }>;
  };
}

interface EnrichedPayout {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerEmail: string;
  referralCode: string;
  amount: number;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  payoutMethod: string;
  payoutDetails: string;
  requestedAt: string;
  processedAt?: string;
  notes?: string;
}

interface SummaryData {
  totalPartners: number;
  activePartners: number;
  totalClicks: number;
  totalReferredCustomers: number;
  activePayingCustomers: number;
  monthlyRecurringCommission: number;
  totalEarningsToDate: number;
  pendingPayoutsAmount: number;
  pendingPayoutsCount: number;
}

export function ReferralsAdminTab() {
  const __t = useT();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [partners, setPartners] = useState<PartnerWithStats[]>([]);
  const [payouts, setPayouts] = useState<EnrichedPayout[]>([]);
  const [recentClicks, setRecentClicks] = useState<any[]>([]);

  // Navigation sub-tab: 'partners' | 'payouts' | 'customers' | 'clicks'
  const [activeSubTab, setActiveSubTab] = useState<'partners' | 'payouts' | 'customers' | 'clicks'>('partners');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<PartnerWithStats | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/master/referrals', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch referral program data');
      setSummary(data.summary || null);
      setPartners(data.partners || []);
      setPayouts(data.payouts || []);
      setRecentClicks(data.recentClicks || []);
      if (selectedPartner) {
        const refreshed = (data.partners || []).find((p: PartnerWithStats) => p.id === selectedPartner.id);
        if (refreshed) setSelectedPartner(refreshed);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading referral data');
    } finally {
      setLoading(false);
    }
  }, [selectedPartner]);

  useEffect(() => {
    fetchData();
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleUpdatePayoutStatus = async (payoutId: string, status: 'pending' | 'approved' | 'paid' | 'rejected') => {
    if (!confirm(`Are you sure you want to set this payout request status to "${status.toUpperCase()}"?`)) return;
    setIsProcessingAction(true);
    try {
      const res = await fetch('/api/master/referrals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_payout', payoutId, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update payout');
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Error updating payout');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleTogglePartnerStatus = async (partnerId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    if (!confirm(`Are you sure you want to mark this affiliate partner as "${nextStatus}"?`)) return;
    setIsProcessingAction(true);
    try {
      const res = await fetch('/api/master/referrals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_partner_status', partnerId, partnerStatus: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update partner');
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Error updating partner status');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Filtered partners
  const filteredPartners = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return partners;
    return partners.filter((p) => {
      return (
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.phone.toLowerCase().includes(q) ||
        p.referralCode.toLowerCase().includes(q) ||
        (p.marketingPlatforms || []).some((plat) => plat.toLowerCase().includes(q))
      );
    });
  }, [partners, searchQuery]);

  // All referred customers across all partners
  const allReferredCustomers = useMemo(() => {
    const list: Array<any> = [];
    partners.forEach((p) => {
      (p.stats.customers || []).forEach((c) => {
        list.push({
          ...c,
          partnerId: p.id,
          partnerName: p.name,
          partnerEmail: p.email,
          referralCode: p.referralCode,
        });
      });
    });
    return list.sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime());
  }, [partners]);

  const filteredCustomers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return allReferredCustomers;
    return allReferredCustomers.filter((c) => {
      return (
        c.customerEmailMasked.toLowerCase().includes(q) ||
        c.planName.toLowerCase().includes(q) ||
        c.partnerName.toLowerCase().includes(q) ||
        c.referralCode.toLowerCase().includes(q)
      );
    });
  }, [allReferredCustomers, searchQuery]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[11px] font-bold uppercase tracking-wider">
              <T>Platform Administration</T>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
              <T>10% Recurring Commission</T>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            <T>Referral &amp; Affiliate Program</T>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            <T>Inspect all registered partners, submitted promotional channels, phone numbers, referral clicks, recurring subscriptions, and payout requests.</T>
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-purple-600' : 'text-slate-500'}`} />
          <span><T>Refresh</T></span>
        </button>
      </div>

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-medium"><T>Affiliate Partners</T></span>
              <div className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white font-mono">
              {summary.totalPartners}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>{summary.activePartners} <T>active</T></span>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-medium"><T>Monthly Recurring (10%)</T></span>
              <div className="h-7 w-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              ${summary.monthlyRecurringCommission.toFixed(2)}<span className="text-xs font-normal text-slate-400">/mo</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              <T>Active recurring commission</T>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-medium"><T>Referred Customers</T></span>
              <div className="h-7 w-7 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
                <UserCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white font-mono">
              {summary.totalReferredCustomers}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
              <span>{summary.activePayingCustomers} <T>active paying</T></span>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-medium"><T>Total Link Clicks</T></span>
              <div className="h-7 w-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                <MousePointerClick className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white font-mono">
              {summary.totalClicks}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              {summary.totalClicks > 0
                ? `${((summary.totalReferredCustomers / summary.totalClicks) * 100).toFixed(1)}% conversion rate`
                : 'No clicks yet'}
            </div>
          </div>

          <div className={`p-4 rounded-2xl border shadow-xs ${
            summary.pendingPayoutsCount > 0
              ? 'border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20'
              : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900'
          }`}>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-medium"><T>Pending Payouts</T></span>
              <div className="h-7 w-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white font-mono">
              ${summary.pendingPayoutsAmount.toFixed(2)}
            </div>
            <div className="mt-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
              {summary.pendingPayoutsCount} <T>requests waiting</T>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 flex-wrap gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl">
          <button
            onClick={() => setActiveSubTab('partners')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'partners'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span><T>Affiliate Partners</T></span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-slate-200 dark:bg-slate-700">
              {partners.length}
            </span>
          </button>
          <button
            onClick={() => setActiveSubTab('payouts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'payouts'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Wallet className="h-3.5 w-3.5" />
            <span><T>Payout Requests</T></span>
            {summary && summary.pendingPayoutsCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-amber-500 text-white font-bold animate-pulse">
                {summary.pendingPayoutsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveSubTab('customers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'customers'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span><T>Referred Customers</T></span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-slate-200 dark:bg-slate-700">
              {allReferredCustomers.length}
            </span>
          </button>
          <button
            onClick={() => setActiveSubTab('clicks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'clicks'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MousePointerClick className="h-3.5 w-3.5" />
            <span><T>Recent Clicks</T></span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-slate-200 dark:bg-slate-700">
              {recentClicks.length}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={__t("Search partner, email, code, phone...")}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* SUB-TAB 1: PARTNERS DIRECTORY */}
      {activeSubTab === 'partners' && (
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                <tr>
                  <th className="py-3 px-4"><T>Partner / Contact</T></th>
                  <th className="py-3 px-4"><T>Referral Code</T></th>
                  <th className="py-3 px-4"><T>Promotional Platforms</T></th>
                  <th className="py-3 px-4 text-center"><T>Clicks</T></th>
                  <th className="py-3 px-4 text-center"><T>Referred Clients</T></th>
                  <th className="py-3 px-4 text-right"><T>10% Recurring</T></th>
                  <th className="py-3 px-4 text-center"><T>Status</T></th>
                  <th className="py-3 px-4 text-right"><T>Actions</T></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPartners.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      <T>No referral partners match your filter.</T>
                    </td>
                  </tr>
                ) : (
                  filteredPartners.map((partner) => (
                    <tr
                      key={partner.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition group cursor-pointer"
                      onClick={() => setSelectedPartner(partner)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{partner.name}</span>
                          {partner.stats.activePayingCustomers > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[9.5px] font-bold">
                              PRODUCING
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-slate-400" />
                            {partner.email}
                          </span>
                          {partner.phone && (
                            <span className="flex items-center gap-1 font-mono text-[10.5px]">
                              <Phone className="h-3 w-3 text-slate-400" />
                              {partner.phone}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-purple-600 dark:text-purple-400">
                        <div className="flex items-center gap-1.5">
                          <span>{partner.referralCode}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(partner.referralCode, partner.id);
                            }}
                            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 transition"
                            title="Copy code"
                          >
                            {copiedCode === partner.id ? (
                              <Check className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 flex-wrap max-w-xs">
                          {(partner.marketingPlatforms || []).slice(0, 4).map((p) => (
                            <span
                              key={p}
                              className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300 capitalize"
                            >
                              {p}
                            </span>
                          ))}
                          {(partner.marketingPlatforms || []).length > 4 && (
                            <span className="text-[10px] text-slate-400">
                              +{(partner.marketingPlatforms || []).length - 4}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {partner.stats.totalClicks}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {partner.stats.totalReferredCustomers}
                        </span>
                        {partner.stats.activePayingCustomers > 0 && (
                          <div className="text-[10px] text-emerald-600 font-semibold">
                            {partner.stats.activePayingCustomers} paying
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        ${partner.stats.monthlyRecurringCommission.toFixed(2)}
                        <span className="text-[10px] font-normal text-slate-400">/mo</span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          partner.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}>
                          {partner.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPartner(partner);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-600 dark:text-purple-400 font-semibold text-[11px] transition"
                        >
                          <T>View Details</T>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: PAYOUT REQUESTS */}
      {activeSubTab === 'payouts' && (
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                <T>Affiliate Payout Requests</T>
              </h2>
              <p className="text-xs text-slate-500">
                <T>Review withdrawal requests against accumulated 10% recurring subscription earnings.</T>
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                <tr>
                  <th className="py-3 px-4"><T>Partner</T></th>
                  <th className="py-3 px-4"><T>Amount</T></th>
                  <th className="py-3 px-4"><T>Payout Method &amp; Details</T></th>
                  <th className="py-3 px-4"><T>Requested Date</T></th>
                  <th className="py-3 px-4 text-center"><T>Status</T></th>
                  <th className="py-3 px-4 text-right"><T>Manage</T></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payouts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <Wallet className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      <T>No payout requests on file.</T>
                    </td>
                  </tr>
                ) : (
                  payouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{payout.partnerName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{payout.partnerEmail}</div>
                        <div className="text-[10px] text-purple-600 font-bold">Code: {payout.referralCode}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-sm text-slate-900 dark:text-white">
                        ${payout.amount.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold capitalize text-slate-800 dark:text-slate-200">
                          {payout.payoutMethod}
                        </span>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate max-w-xs">
                          {payout.payoutDetails}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(payout.requestedAt).toLocaleDateString()}
                        <div className="text-[10px] text-slate-400">
                          {new Date(payout.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-bold capitalize ${
                          payout.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : payout.status === 'approved'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                            : payout.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 animate-pulse'
                        }`}>
                          {payout.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {payout.status === 'pending' || payout.status === 'approved' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleUpdatePayoutStatus(payout.id, 'paid')}
                              disabled={isProcessingAction}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] shadow-xs transition cursor-pointer"
                            >
                              <T>Mark Paid</T>
                            </button>
                            {payout.status === 'pending' && (
                              <button
                                type="button"
                                onClick={() => handleUpdatePayoutStatus(payout.id, 'approved')}
                                disabled={isProcessingAction}
                                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px] transition cursor-pointer"
                              >
                                <T>Approve</T>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleUpdatePayoutStatus(payout.id, 'rejected')}
                              disabled={isProcessingAction}
                              className="px-2 py-1 rounded-lg border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[11px] transition cursor-pointer"
                            >
                              <T>Reject</T>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            {payout.status === 'paid' ? 'Processed' : 'Closed'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: REFERRED CUSTOMERS */}
      {activeSubTab === 'customers' && (
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                <tr>
                  <th className="py-3 px-4"><T>Referred Customer</T></th>
                  <th className="py-3 px-4"><T>Attributed Partner</T></th>
                  <th className="py-3 px-4"><T>Plan</T></th>
                  <th className="py-3 px-4 text-center"><T>Status</T></th>
                  <th className="py-3 px-4 text-right"><T>Client Paid/Mo</T></th>
                  <th className="py-3 px-4 text-right"><T>10% Commission</T></th>
                  <th className="py-3 px-4 text-right"><T>Joined Date</T></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <UserCheck className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      <T>No customer subscriptions have been attributed yet.</T>
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                        {cust.customerEmailMasked}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{cust.partnerName}</div>
                        <div className="text-[10px] text-purple-600 font-mono font-bold">{cust.referralCode}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold capitalize text-slate-800 dark:text-slate-200">
                          {cust.planName}
                        </span>
                        <span className="text-[10px] text-slate-400 block capitalize">
                          {cust.billingInterval}
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
      )}

      {/* SUB-TAB 4: RECENT CLICKS */}
      {activeSubTab === 'clicks' && (
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                <tr>
                  <th className="py-3 px-4"><T>Timestamp</T></th>
                  <th className="py-3 px-4"><T>Referral Code</T></th>
                  <th className="py-3 px-4"><T>Referrer URL / Source</T></th>
                  <th className="py-3 px-4"><T>Landing Path</T></th>
                  <th className="py-3 px-4"><T>Device / User-Agent</T></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                {recentClicks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-sans text-xs">
                      <MousePointerClick className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      <T>No clicks logged yet.</T>
                    </td>
                  </tr>
                ) : (
                  recentClicks.map((click) => (
                    <tr key={click.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(click.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-purple-600 dark:text-purple-400">
                        {click.referralCode}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 truncate max-w-xs">
                        {click.referrer || <span className="text-slate-400 italic">Direct / Untracked</span>}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {click.landingPath || '/'}
                      </td>
                      <td className="py-3 px-4 text-slate-400 truncate max-w-xs font-sans text-[11px]">
                        {click.userAgent || 'Unknown'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PARTNER DETAIL MODAL / DRAWER */}
      {selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                    selectedPartner.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                  }`}>
                    {selectedPartner.status}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    ID: {selectedPartner.id}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {selectedPartner.name}
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    {selectedPartner.email}
                  </span>
                  {selectedPartner.phone && (
                    <a
                      href={`tel:${selectedPartner.phone}`}
                      className="flex items-center gap-1 font-mono text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {selectedPartner.phone}
                    </a>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPartner(null)}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 transition"
              >
                ✕
              </button>
            </div>

            {/* Referral Link & Code Box */}
            <div className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/60 dark:bg-purple-950/20 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide">
                  <T>Assigned Referral Link</T>
                </span>
                <div className="font-mono text-xs font-bold text-slate-900 dark:text-white mt-0.5 select-all">
                  https://crescelo.com/ref/{selectedPartner.referralCode}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(`https://crescelo.com/ref/${selectedPartner.referralCode}`, 'modal-link')}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition shrink-0"
              >
                {copiedCode === 'modal-link' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedCode === 'modal-link' ? <T>Copied Link</T> : <T>Copy Link</T>}</span>
              </button>
            </div>

            {/* Partner Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide"><T>Promotional Platforms</T></span>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedPartner.marketingPlatforms || []).map((p) => (
                    <span
                      key={p}
                      className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300 capitalize"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide"><T>Social Media Links</T></span>
                <div className="space-y-1 text-xs">
                  {selectedPartner.socialLinks?.instagram && (
                    <div className="flex items-center gap-1.5">
                      <InstagramIcon className="h-3.5 w-3.5 text-pink-500 shrink-0" />
                      <span className="text-slate-500 text-[11px]">IG:</span>
                      <a
                        href={selectedPartner.socialLinks.instagram.startsWith('http') ? selectedPartner.socialLinks.instagram : `https://instagram.com/${selectedPartner.socialLinks.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline truncate"
                      >
                        {selectedPartner.socialLinks.instagram}
                      </a>
                    </div>
                  )}
                  {selectedPartner.socialLinks?.youtube && (
                    <div className="flex items-center gap-1.5">
                      <YouTubeIcon className="h-3.5 w-3.5 text-red-500 shrink-0" />
                      <span className="text-slate-500 text-[11px]">YT:</span>
                      <a
                        href={selectedPartner.socialLinks.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline truncate"
                      >
                        {selectedPartner.socialLinks.youtube}
                      </a>
                    </div>
                  )}
                  {selectedPartner.socialLinks?.tiktok && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 text-[11px] font-bold">TikTok:</span>
                      <span className="text-slate-700 dark:text-slate-300 truncate">
                        {selectedPartner.socialLinks.tiktok}
                      </span>
                    </div>
                  )}
                  {selectedPartner.socialLinks?.linkedin && (
                    <div className="flex items-center gap-1.5">
                      <LinkedInIcon className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      <span className="text-slate-500 text-[11px]">LinkedIn:</span>
                      <a
                        href={selectedPartner.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline truncate"
                      >
                        {selectedPartner.socialLinks.linkedin}
                      </a>
                    </div>
                  )}
                  {selectedPartner.socialLinks?.website && (
                    <div className="flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span className="text-slate-500 text-[11px]">Web:</span>
                      <a
                        href={selectedPartner.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline truncate"
                      >
                        {selectedPartner.socialLinks.website}
                      </a>
                    </div>
                  )}
                  {Object.keys(selectedPartner.socialLinks || {}).length === 0 && (
                    <span className="text-slate-400 italic text-[11px]"><T>No social links provided.</T></span>
                  )}
                </div>
              </div>
            </div>

            {/* Marketing Strategy */}
            {selectedPartner.marketingStrategy && (
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide"><T>Promotion Strategy &amp; Audience</T></span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {selectedPartner.marketingStrategy}
                </p>
              </div>
            )}

            {/* Payout Information */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide"><T>Payout Method &amp; Destination</T></span>
                <div className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5 capitalize">
                  {selectedPartner.payoutMethod || 'Not specified'}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {selectedPartner.payoutDetails || 'No payout account details entered yet'}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400"><T>Pending Unpaid Balance</T></span>
                <div className="text-base font-bold font-mono text-emerald-600">
                  ${selectedPartner.stats.pendingPayout.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleTogglePartnerStatus(selectedPartner.id, selectedPartner.status)}
                disabled={isProcessingAction}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  selectedPartner.status === 'active'
                    ? 'border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {selectedPartner.status === 'active' ? <T>Suspend Partner</T> : <T>Reactivate Partner</T>}
              </button>

              <button
                type="button"
                onClick={() => setSelectedPartner(null)}
                className="px-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                <T>Close</T>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
