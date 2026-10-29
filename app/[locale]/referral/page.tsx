import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import {
  Sparkles,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Share2,
  Users,
  Repeat,
  Zap,
  Clock,
  Wallet,
  Globe,
  Video,
  Check,
  Building2,
} from 'lucide-react';
import { verifyPartnerToken } from '@/lib/security/referral-auth';
import { TwitterIcon, LinkedInIcon, YouTubeIcon, InstagramIcon } from '@/components/referral/SocialIcons';

export const dynamic = 'force-dynamic';

export default async function ReferralIndexPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('crescelo_partner_session')?.value;
  if (sessionCookie && verifyPartnerToken(sessionCookie)) {
    redirect('/referral/dashboard');
  }

  return (
    <>
      <Header />
      <main id="main" className="pt-2 pb-16">
        {/* Hero Section */}
        <section className="mk-hero" style={{ marginTop: '0.75rem' }} aria-labelledby="mk-hero-title">
          <div className="mk-hero-glow" aria-hidden="true" />
          <div className="mk-wrap mk-hero-inner">
            <p className="mk-eyebrow">
              Official Affiliate &amp; Referral Program
            </p>
            <h1 id="mk-hero-title" className="mk-h1" style={{ maxWidth: '24ch' }}>
              <span className="mk-echo">
                Earn <span className="mk-echo-em">10% Lifetime Recurring</span> Commission on Every Business Client.
              </span>
            </h1>
            <p className="mk-lead" style={{ maxWidth: '64ch' }}>
              Recommend Crescelo&apos;s 24/7 autonomous AI assistant to businesses, service clinics, agencies, and online brands. For every client you refer, receive 10% each month for the entire lifetime of their subscription.
            </p>

            <div className="mk-cta-row flex flex-col sm:flex-row items-center justify-center gap-3.5 mt-8">
              <Link
                href="/referral/register"
                className="mk-btn mk-btn-primary px-8 py-3.5 inline-flex items-center justify-center gap-2 text-sm shadow-[0_3px_0_var(--mk-ink)] hover:translate-y-[-2px] transition cursor-pointer"
              >
                <span>Get Your Unique Referral Link</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/referral/login"
                className="mk-btn mk-btn-ghost px-7 py-3.5 inline-flex items-center justify-center gap-2 text-sm border-[1.5px] border-white/60 text-white hover:bg-white hover:text-[#08251a] transition cursor-pointer"
              >
                <span>Partner Sign In</span>
              </Link>
            </div>

            <ul className="mk-trust mt-8">
              <li>10% Recurring Every Month</li>
              <li>30-Day Clearance Guarantee</li>
              <li>PayPal, Wise &amp; Bank Payouts</li>
              <li>30-Day Attribution Cookie</li>
              <li>Zero Platform Fees</li>
            </ul>
          </div>
        </section>

        {/* Section: Three Steps to Revenue */}
        <section className="mk-wrap py-20">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[#0f6e58]">
              HOW IT WORKS
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1a1a1a]">
              Three steps from link to monthly passive revenue.
            </h2>
            <p className="text-sm sm:text-base text-[#55554c] leading-relaxed">
              No manual contracts or waiting weeks for review. Instant onboarding gives you your custom attribution slug immediately.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="p-7 rounded-2xl border-[1.5px] border-[#1a1a1a] bg-[#fffdf6] shadow-[0_4px_0_#1a1a1a] space-y-4 hover:translate-y-[-2px] transition">
              <div className="w-10 h-10 rounded-xl bg-[#abff44] text-[#08251a] border-[1.5px] border-[#1a1a1a] flex items-center justify-center font-bold text-sm shadow-[0_2px_0_#1a1a1a]">
                01
              </div>
              <h3 className="text-lg font-bold text-[#1a1a1a]">Register &amp; Claim Your Slug</h3>
              <p className="text-xs sm:text-sm text-[#55554c] leading-relaxed">
                Sign up in 60 seconds with your preferred social channels or agency email. You receive an instant tracking link (<span className="font-mono font-semibold text-[#0f6e58]">crescelo.com/ref/yourname</span>).
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#e8f5f2] border border-[#0f6e58]/30 text-[11px] font-mono font-semibold text-[#0f6e58]">
                  30-day tracking cookie
                </span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-7 rounded-2xl border-[1.5px] border-[#1a1a1a] bg-[#fffdf6] shadow-[0_4px_0_#1a1a1a] space-y-4 hover:translate-y-[-2px] transition">
              <div className="w-10 h-10 rounded-xl bg-[#f0d7ff] text-[#08251a] border-[1.5px] border-[#1a1a1a] flex items-center justify-center font-bold text-sm shadow-[0_2px_0_#1a1a1a]">
                02
              </div>
              <h3 className="text-lg font-bold text-[#1a1a1a]">Promote Across Your Channels</h3>
              <p className="text-xs sm:text-sm text-[#55554c] leading-relaxed">
                Share YouTube reviews, Instagram reels, TikTok walkthroughs, client recommendations, or newsletter spotlights. Every click and registration is attributed to your profile.
              </p>
              <div className="flex items-center gap-2 pt-2 text-[#55554c]">
                <YouTubeIcon className="w-4 h-4 text-[#ff0000]" />
                <InstagramIcon className="w-4 h-4 text-[#e1306c]" />
                <TwitterIcon className="w-4 h-4" />
                <LinkedInIcon className="w-4 h-4 text-[#0077b5]" />
                <Globe className="w-4 h-4 text-[#0f6e58]" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-7 rounded-2xl border-[1.5px] border-[#1a1a1a] bg-[#fffdf6] shadow-[0_4px_0_#1a1a1a] space-y-4 hover:translate-y-[-2px] transition">
              <div className="w-10 h-10 rounded-xl bg-[#abff44] text-[#08251a] border-[1.5px] border-[#1a1a1a] flex items-center justify-center font-bold text-sm shadow-[0_2px_0_#1a1a1a]">
                03
              </div>
              <h3 className="text-lg font-bold text-[#1a1a1a]">Collect 10% Every Single Month</h3>
              <p className="text-xs sm:text-sm text-[#55554c] leading-relaxed">
                When a business subscribes to Starter ($49/mo), Growth ($129/mo), or Scale ($299/mo), you earn 10% each month. As long as they stay subscribed, you get paid.
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#e6f9c8] border border-[#abff44] text-[11px] font-bold text-[#08251a]">
                  Recurring lifetime payout
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Calculator / Earning Potential */}
        <section className="mk-wrap py-12">
          <div className="rounded-3xl border-[1.5px] border-[#1a1a1a] bg-[#fffdf6] shadow-[0_6px_0_#1a1a1a] p-8 sm:p-12 space-y-8">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#0f6e58]">
                MONTHLY EARNING POTENTIAL
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1a1a1a]">
                Compounding Recurring Revenue
              </h2>
              <p className="text-xs sm:text-sm text-[#55554c]">
                Crescelo plans range from $49 to $299 per month. Unlike one-off affiliate deals, each client you refer adds to your predictable monthly cashflow:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="p-6 rounded-2xl border-[1.5px] border-[#1a1a1a] bg-[#fffeeb] shadow-[0_3px_0_#1a1a1a] text-center space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#55554c]">
                  10 Active Clients
                </span>
                <div className="text-3xl font-extrabold font-mono text-[#1a1a1a]">
                  $129<span className="text-sm font-normal text-[#55554c]">/mo</span>
                </div>
                <div className="text-xs font-semibold text-[#0f6e58] bg-[#e8f5f2] py-1 px-3 rounded-full inline-block border border-[#0f6e58]/20">
                  $1,548.00 / year recurring
                </div>
                <p className="text-[11.5px] text-[#55554c] leading-relaxed">
                  Based on 10 business clients on our popular Growth plan ($129/mo).
                </p>
              </div>

              {/* Card 2 - Featured */}
              <div className="p-6 rounded-2xl border-[2px] border-[#1a1a1a] bg-[#abff44] shadow-[0_4px_0_#1a1a1a] text-center space-y-3 relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#1a1a1a] text-[#abff44] text-[10px] font-bold uppercase tracking-wider">
                  Popular Milestone
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#08251a]">
                  50 Active Clients
                </span>
                <div className="text-3xl font-extrabold font-mono text-[#08251a]">
                  $645<span className="text-sm font-normal text-[#08251a]/80">/mo</span>
                </div>
                <div className="text-xs font-bold text-[#08251a] bg-[#fffdf6] py-1 px-3 rounded-full inline-block border border-[#1a1a1a]">
                  $7,740.00 / year recurring
                </div>
                <p className="text-[11.5px] text-[#08251a]/90 leading-relaxed font-medium">
                  A predictable, hands-off passive income stream deposited each month.
                </p>
              </div>

              {/* Card 3 */}
              <div className="p-6 rounded-2xl border-[1.5px] border-[#1a1a1a] bg-[#f0d7ff] shadow-[0_3px_0_#1a1a1a] text-center space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">
                  200 Active Clients
                </span>
                <div className="text-3xl font-extrabold font-mono text-[#1a1a1a]">
                  $2,580<span className="text-sm font-normal text-[#55554c]">/mo</span>
                </div>
                <div className="text-xs font-bold text-[#1a1a1a] bg-[#fffdf6] py-1 px-3 rounded-full inline-block border border-[#1a1a1a]">
                  $30,960.00 / year recurring
                </div>
                <p className="text-[11.5px] text-[#55554c] leading-relaxed">
                  Full-time creator or digital agency recurring partnership income.
                </p>
              </div>
            </div>

            <div className="text-center pt-2">
              <Link
                href="/referral/register"
                className="mk-btn mk-btn-primary px-8 py-3.5 inline-flex items-center gap-2 text-sm shadow-[0_3px_0_#1a1a1a] hover:translate-y-[-2px] transition cursor-pointer"
              >
                <span>Start Earning 10% Monthly</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Section: Program Rules & 30-Day Clearance Holding Period */}
        <section className="mk-wrap py-16">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0f6e58]">
              TRANSPARENT PROGRAM TERMS
            </span>
            <h2 className="text-3xl font-extrabold text-[#1a1a1a]">
              Built for trust, accuracy, and long-term partnerships.
            </h2>
            <p className="text-xs sm:text-sm text-[#55554c]">
              We protect both our partners and our platform with verifiable attribution and prompt payouts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-6 rounded-2xl border-[1.5px] border-[#1a1a1a] bg-[#fffdf6] shadow-[0_3px_0_#1a1a1a] space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#ffe7c2] border border-[#8a4a0a]/30 text-[#8a4a0a] flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#1a1a1a]">30-Day Clearance Guarantee</h3>
              <p className="text-xs text-[#55554c] leading-relaxed">
                When a user upgrades after trial, a pending clock displays in your portal and our admin dashboard for 30 days to safeguard against refunds before funds mature into withdrawable balance.
              </p>
            </div>

            <div className="p-6 rounded-2xl border-[1.5px] border-[#1a1a1a] bg-[#fffdf6] shadow-[0_3px_0_#1a1a1a] space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#e8f5f2] border border-[#0f6e58]/30 text-[#0f6e58] flex items-center justify-center">
                <Repeat className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#1a1a1a]">Recurring Lifetime Payouts</h3>
              <p className="text-xs text-[#55554c] leading-relaxed">
                As long as your referred customer keeps their subscription active, you continue to receive 10% every month. No expiration dates on active client relationships.
              </p>
            </div>

            <div className="p-6 rounded-2xl border-[1.5px] border-[#1a1a1a] bg-[#fffdf6] shadow-[0_3px_0_#1a1a1a] space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#f0d7ff] border border-[#1a1a1a] text-[#1a1a1a] flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#1a1a1a]">Multiple Payout Rails</h3>
              <p className="text-xs text-[#55554c] leading-relaxed">
                Withdraw your accumulated earnings via PayPal, Wise, or direct bank transfer. Submit withdrawal requests right from your partner dashboard whenever your balance reaches $50.
              </p>
            </div>

            <div className="p-6 rounded-2xl border-[1.5px] border-[#1a1a1a] bg-[#fffdf6] shadow-[0_3px_0_#1a1a1a] space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#abff44] border border-[#1a1a1a] text-[#08251a] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#1a1a1a]">Privacy-Preserving Tracking</h3>
              <p className="text-xs text-[#55554c] leading-relaxed">
                Client email addresses are partially masked in reports for data security and GDPR compliance while maintaining exact transparent financial audit records.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="mk-wrap mt-8">
          <div className="rounded-3xl border-[1.5px] border-[#1a1a1a] bg-[#08251a] text-[#fffeeb] p-8 sm:p-14 text-center space-y-6 relative overflow-hidden shadow-[0_6px_0_#1a1a1a]">
            <div className="mk-hero-glow" aria-hidden="true" />
            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#abff44] text-[#08251a]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Instant Partner Approval</span>
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#fffeeb] tracking-tight">
                Ready to turn your network into recurring monthly income?
              </h2>
              <p className="text-xs sm:text-sm text-[#cfe3d6] leading-relaxed">
                Join our partner network today. Get your unique referral link, access your real-time analytics portal, and start receiving 10% monthly commissions.
              </p>
              <div className="pt-2">
                <Link
                  href="/referral/register"
                  className="mk-btn mk-btn-primary px-8 py-3.5 inline-flex items-center gap-2 text-sm shadow-[0_3px_0_#1a1a1a] hover:translate-y-[-2px] transition cursor-pointer"
                >
                  <span>Register as a Referral Partner</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
