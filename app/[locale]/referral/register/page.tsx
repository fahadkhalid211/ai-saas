'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CresceloMark } from '@/components/brand/CresceloMark';
import {
  Users,
  DollarSign,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Globe,
  Phone,
  Mail,
  Lock,
  User,
  Share2,
  Wallet,
  Check,
} from 'lucide-react';
import { MarketingPlatform } from '@/types/referral';

const PLATFORM_OPTIONS: { id: MarketingPlatform; label: string; icon: string }[] = [
  { id: 'instagram', label: 'Instagram', icon: '📸' },
  { id: 'youtube', label: 'YouTube', icon: '▶️' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵' },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { id: 'twitter', label: 'X / Twitter', icon: '🐦' },
  { id: 'website', label: 'Blog / Website', icon: '🌐' },
  { id: 'newsletter', label: 'Email Newsletter', icon: '✉️' },
  { id: 'discord', label: 'Discord / Community', icon: '💬' },
  { id: 'facebook', label: 'Facebook Groups / Ads', icon: '👥' },
  { id: 'other', label: 'Other Channels', icon: '🚀' },
];

export default function ReferralRegisterPage() {
  const router = useRouter();

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<MarketingPlatform[]>(['instagram', 'youtube']);
  const [socialLinks, setSocialLinks] = useState({
    instagram: '',
    youtube: '',
    tiktok: '',
    twitter: '',
    linkedin: '',
    website: '',
    other: '',
  });
  const [marketingStrategy, setMarketingStrategy] = useState('');
  const [payoutMethod, setPayoutMethod] = useState<'paypal' | 'bank_transfer' | 'wise' | 'crypto'>('paypal');
  const [payoutDetails, setPayoutDetails] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Submission State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const togglePlatform = (platformId: MarketingPlatform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId) ? prev.filter((p) => p !== platformId) : [...prev, platformId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Please enter your phone number.');
      return;
    }
    if (selectedPlatforms.length === 0) {
      setErrorMessage('Please select at least one platform where you plan to market us.');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('Please agree to the referral partner terms to proceed.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/referral/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim(),
          platforms: selectedPlatforms,
          socialLinks,
          marketingStrategy: marketingStrategy.trim(),
          payoutMethod,
          payoutDetails: payoutDetails.trim(),
          customCode: customCode.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to complete registration.');
        setIsLoading(false);
        return;
      }

      // Successfully registered & authenticated -> redirect to dashboard
      router.push('/referral/dashboard');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Network error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const previewCode = customCode.trim()
    ? customCode.toLowerCase().replace(/[^a-z0-9_-]/g, '')
    : name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'your-name';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-lime-400 selection:text-black">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-lime-500/15 via-emerald-500/5 to-transparent blur-3xl opacity-70" />
      </div>

      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <CresceloMark size={28} />
            <span className="font-bold text-lg tracking-tight text-white group-hover:text-lime-400 transition">
              Crescelo <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-lime-400/10 text-lime-400 border border-lime-400/20 ml-1">Partners</span>
            </span>
          </Link>

          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="text-slate-400 hidden sm:inline">Already registered?</span>
            <Link
              href="/referral/login"
              className="px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 transition"
            >
              Partner Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 flex-1 w-full">
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-lime-400/10 text-lime-400 border border-lime-400/30">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Official Referral &amp; Affiliate Program</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Earn <span className="text-lime-400">10% Recurring Commission</span> on Every Client You Refer
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Generate your unique referral link, market across your platforms, and earn a 10% monthly payout for every referred customer as long as their subscription stays active.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-xs flex items-start gap-3">
            <div className="p-2 rounded-lg bg-lime-400/10 text-lime-400 shrink-0">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">10% Lifetime Recurring</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Every month your client pays ($4.90/mo to $29.90/mo per business), you get paid automatically.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-xs flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-400/10 text-blue-400 shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Real-Time Dashboard</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Track link clicks, referred signups, active subscriptions, and pending payouts in real time.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-xs flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-400/10 text-purple-400 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">30-Day Cookie Window</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Visitors who click your link and register within 30 days are permanently attributed to your account.
              </p>
            </div>
          </div>
        </div>

        {/* Registration Form Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {errorMessage && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* SECTION 1: Personal & Contact Information */}
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <User className="h-4 w-4 text-lime-400" />
                  <span>1. Contact &amp; Login Details</span>
                </h2>
                <p className="text-[11px] text-slate-400">
                  You will use these credentials to log into your referral dashboard.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Full Name <span className="text-lime-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-lime-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email Address <span className="text-lime-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="alex@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-lime-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Phone Number <span className="text-lime-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="+1 (555) 019-2834"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-lime-400"
                    />
                    <Phone className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Used for partner verification and urgent payout updates.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Password <span className="text-lime-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-lime-400"
                    />
                    <Lock className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Confirm Password <span className="text-lime-400">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-lime-400"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: Where You Will Market Us & Platforms */}
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-lime-400" />
                  <span>2. Where Will You Market Us?</span>
                </h2>
                <p className="text-[11px] text-slate-400">
                  Select all channels and platforms you use to promote tools and services.
                </p>
              </div>

              {/* Platform Selector Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {PLATFORM_OPTIONS.map((item) => {
                  const isSelected = selectedPlatforms.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => togglePlatform(item.id)}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
                        isSelected
                          ? 'border-lime-400 bg-lime-400/10 text-white'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base">{item.icon}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-lime-400" />}
                      </div>
                      <span className="text-xs font-semibold mt-2">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Social Media Links */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Your Social Media Profiles &amp; Website Links
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400">Instagram Profile URL / Handle</span>
                    <input
                      type="text"
                      placeholder="https://instagram.com/yourhandle"
                      value={socialLinks.instagram}
                      onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-lime-400"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400">YouTube Channel URL</span>
                    <input
                      type="text"
                      placeholder="https://youtube.com/@channel"
                      value={socialLinks.youtube}
                      onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-lime-400"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400">TikTok Handle / URL</span>
                    <input
                      type="text"
                      placeholder="https://tiktok.com/@youraccount"
                      value={socialLinks.tiktok}
                      onChange={(e) => setSocialLinks({ ...socialLinks, tiktok: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-lime-400"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400">Website, Blog, or Newsletter URL</span>
                    <input
                      type="text"
                      placeholder="https://yourwebsite.com"
                      value={socialLinks.website}
                      onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-lime-400"
                    />
                  </div>
                </div>
              </div>

              {/* Promotion Strategy */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  How do you plan to promote Crescelo? (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. YouTube tutorials, Instagram reels, client referrals, agency recommendations, newsletter..."
                  value={marketingStrategy}
                  onChange={(e) => setMarketingStrategy(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-lime-400"
                />
              </div>
            </div>

            {/* SECTION 3: Custom Referral Code & Payout Details */}
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-lime-400" />
                  <span>3. Referral Link &amp; Payout Setup</span>
                </h2>
                <p className="text-[11px] text-slate-400">
                  Customize your link handle and specify where you want your monthly commission sent.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Preferred Referral Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. alexgrowth"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-lime-400 font-mono"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Your link preview:{' '}
                    <span className="font-mono text-lime-400 font-semibold">
                      crescelo.com/ref/{previewCode}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Payout Method
                  </label>
                  <select
                    value={payoutMethod}
                    onChange={(e: any) => setPayoutMethod(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white focus:outline-none focus:border-lime-400"
                  >
                    <option value="paypal">PayPal</option>
                    <option value="bank_transfer">Direct Bank Transfer / Wire</option>
                    <option value="wise">Wise (TransferWise)</option>
                    <option value="crypto">USDT / USDC (Crypto)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Payout Destination Account / Address
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. your-paypal@email.com or IBAN / Routing details"
                    value={payoutDetails}
                    onChange={(e) => setPayoutDetails(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-lime-400"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    You can update your payout details any time inside your partner dashboard.
                  </p>
                </div>
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-400 select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-lime-500 focus:ring-0"
                />
                <span>
                  I agree to the Crescelo Partner &amp; Affiliate Terms. I understand commissions are 10% recurring for each paying client and are paid monthly for active subscriptions.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl bg-lime-400 hover:bg-lime-300 active:bg-lime-500 text-slate-950 font-bold text-sm transition shadow-lg shadow-lime-400/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Creating Partner Account…</span>
                </>
              ) : (
                <>
                  <span>Complete Registration &amp; Open Partner Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} Crescelo. All rights reserved. 10% Recurring Partner Program.</p>
      </footer>
    </div>
  );
}
