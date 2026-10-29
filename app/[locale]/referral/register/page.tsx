'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CresceloMark } from '@/components/brand/CresceloMark';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
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
      setErrorMessage('Please enter your contact phone or WhatsApp number for payout verification.');
      return;
    }
    if (selectedPlatforms.length === 0) {
      setErrorMessage('Please select at least one promotional platform or marketing channel.');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('You must agree to the partner program terms to register.');
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
          customCode: customCode.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to register partner account. Please try again.');
        setIsLoading(false);
        return;
      }

      router.push('/referral/dashboard');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Network error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const previewCode = (customCode.trim() || name.trim() || 'yourname')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 15) || 'partner';

  return (
    <>
      <Header />
      <main id="main" className="pt-4 pb-20">
        <div className="mk-wrap max-w-4xl mx-auto space-y-8">
          {/* Top Headline Banner */}
          <div className="text-center space-y-3 pt-4">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#e6f9c8] text-[#08251a] border-[1.5px] border-[#1a1a1a]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Crescelo Partner Network</span>
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1a1a1a]">
              Join the Referral Program
            </h1>
            <p className="text-xs sm:text-sm text-[#55554c] max-w-xl mx-auto leading-relaxed">
              Earn 10% monthly recurring commission on every active subscriber you refer. Complete the 60-second onboarding below for instant dashboard access.
            </p>
          </div>

          {/* Registration Form Card */}
          <div className="rounded-3xl border-[1.5px] border-[#1a1a1a] bg-[#fffdf6] shadow-[0_6px_0_#1a1a1a] p-6 sm:p-10 space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {errorMessage && (
                <div className="p-4 rounded-xl bg-[#ffe7c2] border-[1.5px] border-[#8a4a0a] text-[#8a4a0a] text-xs flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span className="font-medium">{errorMessage}</span>
                </div>
              )}

              {/* SECTION 1: Personal & Contact Information */}
              <div className="space-y-4">
                <div className="border-b-[1.5px] border-[#1a1a1a]/15 pb-2.5 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#1a1a1a] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-[#abff44] text-[#08251a] border border-[#1a1a1a] inline-flex items-center justify-center text-[11px] font-bold">1</span>
                      <span>Contact &amp; Account Details</span>
                    </h3>
                    <p className="text-xs text-[#55554c] mt-0.5">
                      Your legal identity and dashboard login credentials.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1a1a1a] mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Morgan"
                      className="w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-[#1a1a1a] bg-[#fffdf6] text-[#1a1a1a] text-xs placeholder:text-[#55554c]/60 outline-none focus:ring-2 focus:ring-[#abff44] transition font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1a1a1a] mb-1.5">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-[#1a1a1a] bg-[#fffdf6] text-[#1a1a1a] text-xs placeholder:text-[#55554c]/60 outline-none focus:ring-2 focus:ring-[#abff44] transition font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1a1a1a] mb-1.5">
                      Phone Number (WhatsApp / Mobile) *
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 234-5678"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border-[1.5px] border-[#1a1a1a] bg-[#fffdf6] text-[#1a1a1a] text-xs placeholder:text-[#55554c]/60 outline-none focus:ring-2 focus:ring-[#abff44] transition font-mono"
                      />
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-[#55554c] pointer-events-none" />
                    </div>
                    <span className="text-[10.5px] text-[#55554c] mt-1 block">
                      Used for critical payout notifications and account verification.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1a1a1a] mb-1.5">Preferred Referral Slug (Optional)</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={customCode}
                        onChange={(e) => setCustomCode(e.target.value)}
                        placeholder="alex-agency"
                        className="w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-[#1a1a1a] bg-[#fffdf6] text-[#1a1a1a] text-xs placeholder:text-[#55554c]/60 outline-none focus:ring-2 focus:ring-[#abff44] transition font-mono"
                      />
                    </div>
                    <span className="text-[10.5px] text-[#55554c] mt-1 block">
                      Your link: <code className="text-[#0f6e58] font-mono font-bold">crescelo.com/ref/{previewCode}</code>
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1a1a1a] mb-1.5">Password *</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters..."
                      className="w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-[#1a1a1a] bg-[#fffdf6] text-[#1a1a1a] text-xs placeholder:text-[#55554c]/60 outline-none focus:ring-2 focus:ring-[#abff44] transition font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1a1a1a] mb-1.5">Confirm Password *</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-[#1a1a1a] bg-[#fffdf6] text-[#1a1a1a] text-xs placeholder:text-[#55554c]/60 outline-none focus:ring-2 focus:ring-[#abff44] transition font-sans"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Marketing Channels & Platforms */}
              <div className="space-y-4">
                <div className="border-b-[1.5px] border-[#1a1a1a]/15 pb-2.5">
                  <h3 className="text-sm font-bold text-[#1a1a1a] flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-[#f0d7ff] text-[#08251a] border border-[#1a1a1a] inline-flex items-center justify-center text-[11px] font-bold">2</span>
                    <span>Where Will You Promote Crescelo?</span>
                  </h3>
                  <p className="text-xs text-[#55554c] mt-0.5">
                    Select the channels where you intend to recommend Crescelo.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {PLATFORM_OPTIONS.map((plat) => {
                    const isSelected = selectedPlatforms.includes(plat.id);
                    const Icon = plat.icon;
                    return (
                      <button
                        key={plat.id}
                        type="button"
                        onClick={() => togglePlatform(plat.id)}
                        className={`p-3 rounded-xl border-[1.5px] text-xs font-bold flex flex-col items-center gap-2 transition cursor-pointer text-center ${
                          isSelected
                            ? 'border-[#1a1a1a] bg-[#abff44] text-[#08251a] shadow-[0_2px_0_#1a1a1a]'
                            : 'border-[#1a1a1a] bg-[#fffeeb] text-[#1a1a1a] hover:bg-white'
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="text-[11px] leading-tight">{plat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 3: Social Media Links */}
              <div className="space-y-4">
                <div className="border-b-[1.5px] border-[#1a1a1a]/15 pb-2.5">
                  <h3 className="text-sm font-bold text-[#1a1a1a] flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-[#e6f9c8] text-[#08251a] border border-[#1a1a1a] inline-flex items-center justify-center text-[11px] font-bold">3</span>
                    <span>Social Media Handles &amp; Links</span>
                  </h3>
                  <p className="text-xs text-[#55554c] mt-0.5">
                    Provide your handles or channel URLs for attribution and partner spotlight.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1a1a1a] mb-1.5 flex items-center gap-1.5">
                      <InstagramIcon className="h-3.5 w-3.5 text-pink-600" />
                      <span>Instagram Profile / Handle</span>
                    </label>
                    <input
                      type="text"
                      value={socialLinks.instagram}
                      onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                      placeholder="@alexmarketing or instagram.com/..."
                      className="w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-[#1a1a1a] bg-[#fffdf6] text-[#1a1a1a] text-xs placeholder:text-[#55554c]/60 outline-none focus:ring-2 focus:ring-[#abff44] transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1a1a1a] mb-1.5 flex items-center gap-1.5">
                      <YouTubeIcon className="h-3.5 w-3.5 text-red-600" />
                      <span>YouTube Channel URL</span>
                    </label>
                    <input
                      type="text"
                      value={socialLinks.youtube}
                      onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                      placeholder="youtube.com/@alexchannel"
                      className="w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-[#1a1a1a] bg-[#fffdf6] text-[#1a1a1a] text-xs placeholder:text-[#55554c]/60 outline-none focus:ring-2 focus:ring-[#abff44] transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1a1a1a] mb-1.5 flex items-center gap-1.5">
                      <Video className="h-3.5 w-3.5 text-cyan-600" />
                      <span>TikTok Handle</span>
                    </label>
                    <input
                      type="text"
                      value={socialLinks.tiktok}
                      onChange={(e) => setSocialLinks({ ...socialLinks, tiktok: e.target.value })}
                      placeholder="@alexcreates"
                      className="w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-[#1a1a1a] bg-[#fffdf6] text-[#1a1a1a] text-xs placeholder:text-[#55554c]/60 outline-none focus:ring-2 focus:ring-[#abff44] transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1a1a1a] mb-1.5 flex items-center gap-1.5">
                      <LinkedInIcon className="h-3.5 w-3.5 text-blue-700" />
                      <span>LinkedIn Profile</span>
                    </label>
                    <input
                      type="text"
                      value={socialLinks.linkedin}
                      onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                      placeholder="linkedin.com/in/alexmorgan"
                      className="w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-[#1a1a1a] bg-[#fffdf6] text-[#1a1a1a] text-xs placeholder:text-[#55554c]/60 outline-none focus:ring-2 focus:ring-[#abff44] transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1a1a1a] mb-1.5 flex items-center gap-1.5">
                      <TwitterIcon className="h-3.5 w-3.5" />
                      <span>X / Twitter URL</span>
                    </label>
                    <input
                      type="text"
                      value={socialLinks.twitter}
                      onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                      placeholder="x.com/alexmarketing"
                      className="w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-[#1a1a1a] bg-[#fffdf6] text-[#1a1a1a] text-xs placeholder:text-[#55554c]/60 outline-none focus:ring-2 focus:ring-[#abff44] transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1a1a1a] mb-1.5 flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-[#0f6e58]" />
                      <span>Website / Blog URL</span>
                    </label>
                    <input
                      type="text"
                      value={socialLinks.website}
                      onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })}
                      placeholder="https://alexmarketing.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-[#1a1a1a] bg-[#fffdf6] text-[#1a1a1a] text-xs placeholder:text-[#55554c]/60 outline-none focus:ring-2 focus:ring-[#abff44] transition"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: Marketing Strategy */}
              <div className="space-y-4">
                <div className="border-b-[1.5px] border-[#1a1a1a]/15 pb-2.5">
                  <h3 className="text-sm font-bold text-[#1a1a1a] flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-[#f0d7ff] text-[#08251a] border border-[#1a1a1a] inline-flex items-center justify-center text-[11px] font-bold">4</span>
                    <span>Promotion Strategy</span>
                  </h3>
                  <p className="text-xs text-[#55554c] mt-0.5">
                    Tell us briefly how and to whom you plan to promote Crescelo.
                  </p>
                </div>

                <div>
                  <textarea
                    rows={3}
                    value={marketingStrategy}
                    onChange={(e) => setMarketingStrategy(e.target.value)}
                    placeholder="e.g. I run an agency creating websites for service businesses and barbershops, and share tutorials on YouTube about customer automation."
                    className="w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-[#1a1a1a] bg-[#fffdf6] text-[#1a1a1a] text-xs placeholder:text-[#55554c]/60 outline-none focus:ring-2 focus:ring-[#abff44] transition leading-relaxed font-sans"
                  />
                </div>
              </div>

              {/* SECTION 5: Payout Preferences */}
              <div className="space-y-4">
                <div className="border-b-[1.5px] border-[#1a1a1a]/15 pb-2.5">
                  <h3 className="text-sm font-bold text-[#1a1a1a] flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-[#abff44] text-[#08251a] border border-[#1a1a1a] inline-flex items-center justify-center text-[11px] font-bold">5</span>
                    <span>Payout Method (10% Recurring)</span>
                  </h3>
                  <p className="text-xs text-[#55554c] mt-0.5">
                    Where should we deposit your monthly recurring earnings? (Can be updated anytime in settings)
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPayoutMethod('paypal')}
                    className={`p-3 rounded-xl border-[1.5px] text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                      payoutMethod === 'paypal'
                        ? 'border-[#1a1a1a] bg-[#abff44] text-[#08251a] shadow-[0_2px_0_#1a1a1a]'
                        : 'border-[#1a1a1a] bg-[#fffeeb] text-[#1a1a1a] hover:bg-white'
                    }`}
                  >
                    <DollarSign className="h-4 w-4" />
                    <span>PayPal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayoutMethod('bank_transfer')}
                    className={`p-3 rounded-xl border-[1.5px] text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                      payoutMethod === 'bank_transfer'
                        ? 'border-[#1a1a1a] bg-[#abff44] text-[#08251a] shadow-[0_2px_0_#1a1a1a]'
                        : 'border-[#1a1a1a] bg-[#fffeeb] text-[#1a1a1a] hover:bg-white'
                    }`}
                  >
                    <Building2 className="h-4 w-4" />
                    <span>Bank Transfer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayoutMethod('wise')}
                    className={`p-3 rounded-xl border-[1.5px] text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                      payoutMethod === 'wise'
                        ? 'border-[#1a1a1a] bg-[#abff44] text-[#08251a] shadow-[0_2px_0_#1a1a1a]'
                        : 'border-[#1a1a1a] bg-[#fffeeb] text-[#1a1a1a] hover:bg-white'
                    }`}
                  >
                    <Globe className="h-4 w-4" />
                    <span>Wise</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1a1a1a] mb-1.5">
                    {payoutMethod === 'paypal' && 'PayPal Email Address'}
                    {payoutMethod === 'bank_transfer' && 'IBAN / Routing & Account Details / SWIFT'}
                    {payoutMethod === 'wise' && 'Wise Email Address or Multi-Currency Account'}
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
                    className="w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-[#1a1a1a] bg-[#fffdf6] text-[#1a1a1a] text-xs placeholder:text-[#55554c]/60 outline-none focus:ring-2 focus:ring-[#abff44] transition font-mono"
                  />
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="pt-2 p-4 rounded-xl bg-[#fffeeb] border-[1.5px] border-[#1a1a1a]">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-[#1a1a1a] text-[#08251a] accent-[#abff44] cursor-pointer"
                  />
                  <span className="text-xs text-[#55554c] leading-relaxed">
                    I agree to the Crescelo Partner Program terms. I understand that I receive 10% monthly recurring commission on each referred workspace as long as they maintain an active paid subscription, and that self-referrals for own accounts are prohibited.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t-[1.5px] border-[#1a1a1a]/15 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-[#55554c] flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#0f6e58]" />
                  <span>Instant link creation &amp; immediate access to your partner dashboard.</span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto mk-btn mk-btn-primary px-8 py-3.5 text-xs font-bold shadow-[0_3px_0_#1a1a1a] hover:translate-y-[-2px] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <span>{isLoading ? 'Creating Partner Account...' : 'Complete Registration & Open Dashboard'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>

          <div className="text-center text-xs text-[#55554c]">
            Already have a partner account?{' '}
            <Link href="/referral/login" className="font-bold text-[#0f6e58] underline underline-offset-4 hover:text-[#08251a]">
              Sign in to Partner Portal &rarr;
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
