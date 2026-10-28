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
  Video,
  MessageSquare,
  Building2,
} from 'lucide-react';
import { MarketingPlatform } from '@/types/referral';
import { TwitterIcon, LinkedInIcon, YouTubeIcon, InstagramIcon } from '@/components/referral/SocialIcons';

interface PlatformOption {
  id: MarketingPlatform;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PLATFORM_OPTIONS: PlatformOption[] = [
  { id: 'instagram', label: 'Instagram', icon: InstagramIcon },
  { id: 'youtube', label: 'YouTube', icon: YouTubeIcon },
  { id: 'tiktok', label: 'TikTok', icon: Video },
  { id: 'linkedin', label: 'LinkedIn', icon: LinkedInIcon },
  { id: 'twitter', label: 'X / Twitter', icon: TwitterIcon },
  { id: 'website', label: 'Blog / Website', icon: Globe },
  { id: 'newsletter', label: 'Email Newsletter', icon: Mail },
  { id: 'discord', label: 'Community / Group', icon: MessageSquare },
  { id: 'facebook', label: 'Agency & Clients', icon: Building2 },
  { id: 'other', label: 'Other Channels', icon: Share2 },
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
      setErrorMessage('You must agree to the partner program terms.');
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <CresceloMark size={28} />
            <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
              Crescelo <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 ml-1">Partners</span>
            </span>
          </Link>

          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">Already registered?</span>
            <Link
              href="/referral/login"
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 transition"
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Partner Registration Form</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Join the Crescelo Partner Program
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Generate your unique affiliate link, recommend Crescelo across your channels, and earn a <span className="text-blue-600 dark:text-blue-400 font-semibold">10% recurring monthly commission</span> for each active paying client.
          </p>
        </div>

        {/* Registration Form Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 sm:p-10 space-y-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-3">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* SECTION 1: Personal & Contact Information */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>1. Contact &amp; Account Details</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your legal identity and login credentials.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Phone Number (WhatsApp / Mobile) *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 234-5678"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 transition font-mono"
                    />
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                  <span className="text-[10.5px] text-slate-500 mt-1 block">
                    Used for critical payout notifications and account verification.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Preferred Referral Code (Optional)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={customCode}
                      onChange={(e) => setCustomCode(e.target.value)}
                      placeholder="alex-agency"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 transition font-mono"
                    />
                  </div>
                  <span className="text-[10.5px] text-slate-500 mt-1 block">
                    Your link: <code className="text-blue-600 dark:text-blue-400">crescelo.com/ref/{previewCode}</code>
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Password *</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Confirm Password *</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: Marketing Channels & Platforms */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>2. Where Will You Market Crescelo?</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select all channels where you plan to share and promote your referral links.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {PLATFORM_OPTIONS.map((plat) => {
                  const isSelected = selectedPlatforms.includes(plat.id);
                  const Icon = plat.icon;
                  return (
                    <button
                      key={plat.id}
                      type="button"
                      onClick={() => togglePlatform(plat.id)}
                      className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-2 transition cursor-pointer text-center ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                      <span className="text-[11px] leading-tight">{plat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 3: Social Media Links */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>3. Social Media Links &amp; Profiles</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Provide your active handles or channel URLs.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <InstagramIcon className="h-3.5 w-3.5 text-pink-500" />
                    <span>Instagram Profile / Handle</span>
                  </label>
                  <input
                    type="text"
                    value={socialLinks.instagram}
                    onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                    placeholder="@alexmarketing or instagram.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <YouTubeIcon className="h-3.5 w-3.5 text-red-500" />
                    <span>YouTube Channel URL</span>
                  </label>
                  <input
                    type="text"
                    value={socialLinks.youtube}
                    onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                    placeholder="youtube.com/@alexchannel"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Video className="h-3.5 w-3.5 text-cyan-500" />
                    <span>TikTok Handle</span>
                  </label>
                  <input
                    type="text"
                    value={socialLinks.tiktok}
                    onChange={(e) => setSocialLinks({ ...socialLinks, tiktok: e.target.value })}
                    placeholder="@alexcreates"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <LinkedInIcon className="h-3.5 w-3.5 text-blue-500" />
                    <span>LinkedIn Profile</span>
                  </label>
                  <input
                    type="text"
                    value={socialLinks.linkedin}
                    onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                    placeholder="linkedin.com/in/alexmorgan"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <TwitterIcon className="h-3.5 w-3.5 text-sky-500" />
                    <span>X / Twitter URL</span>
                  </label>
                  <input
                    type="text"
                    value={socialLinks.twitter}
                    onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                    placeholder="x.com/alexmarketing"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Website / Blog URL</span>
                  </label>
                  <input
                    type="text"
                    value={socialLinks.website}
                    onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })}
                    placeholder="https://alexmarketing.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: Marketing Strategy */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>4. Promotion Strategy</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tell us briefly how and to whom you plan to promote Crescelo.
                </p>
              </div>

              <div>
                <textarea
                  rows={3}
                  value={marketingStrategy}
                  onChange={(e) => setMarketingStrategy(e.target.value)}
                  placeholder="e.g. I run an agency creating websites for Shopify and service businesses, and produce tutorial videos on YouTube and Instagram about customer automation."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 transition leading-relaxed"
                />
              </div>
            </div>

            {/* SECTION 5: Payout Preferences */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>5. Payout Method (10% Recurring)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Where should we send your monthly affiliate commission earnings? (Can be updated anytime)
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPayoutMethod('paypal')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                    payoutMethod === 'paypal'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <DollarSign className="h-4 w-4" />
                  <span>PayPal</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPayoutMethod('bank_transfer')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                    payoutMethod === 'bank_transfer'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Building2 className="h-4 w-4" />
                  <span>Bank (IBAN / ACH)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPayoutMethod('wise')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                    payoutMethod === 'wise'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Globe className="h-4 w-4" />
                  <span>Wise</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {payoutMethod === 'paypal' && 'PayPal Email Address'}
                  {payoutMethod === 'bank_transfer' && 'IBAN / Routing & Account Number / SWIFT'}
                  {payoutMethod === 'wise' && 'Wise Email Address or Account Details'}
                  {payoutMethod === 'crypto' && 'USDT (TRC20) or USDC Wallet Address'}
                </label>
                <input
                  type="text"
                  value={payoutDetails}
                  onChange={(e) => setPayoutDetails(e.target.value)}
                  placeholder={
                    payoutMethod === 'paypal'
                      ? 'payouts@myagency.com'
                      : payoutMethod === 'wise'
                      ? 'alex@wise.com'
                      : 'GB33BUKB20201555555555'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 transition font-mono"
                />
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  I agree to the Crescelo Partner Program terms. I understand that I earn a 10% monthly commission on each referred business as long as they maintain an active paid subscription, and self-referrals for own accounts are prohibited.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Instant code generation &amp; immediate access to partner dashboard.</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-semibold text-xs transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isLoading ? 'Creating Partner Account...' : 'Complete Registration & Open Dashboard'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>&copy; {new Date().getFullYear()} Crescelo. All rights reserved. 10% Recurring Partner Program.</p>
      </footer>
    </div>
  );
}
