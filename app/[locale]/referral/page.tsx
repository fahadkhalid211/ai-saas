import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CresceloMark } from '@/components/brand/CresceloMark';
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
} from 'lucide-react';
import { verifyPartnerToken } from '@/lib/security/referral-auth';

export default async function ReferralIndexPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('crescelo_partner_session')?.value;
  if (sessionCookie && verifyPartnerToken(sessionCookie)) {
    redirect('/referral/dashboard');
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-lime-400 selection:text-black">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-lime-500/15 via-emerald-500/5 to-transparent blur-3xl opacity-80" />
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

          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/referral/login"
              className="px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 transition font-medium"
            >
              Partner Sign In
            </Link>
            <Link
              href="/referral/register"
              className="px-3.5 py-1.5 rounded-lg bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold transition shadow-sm"
            >
              Join Program
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16 flex-1 w-full space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-lime-400/10 text-lime-400 border border-lime-400/30">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Official Affiliate &amp; Referral Program</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Earn <span className="text-lime-400">10% Lifetime Recurring</span> Commission on Every Business Client
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Recommend Crescelo&apos;s 24/7 autonomous AI assistant to businesses, agencies, and store owners. For every paying client you refer, you earn 10% each month for as long as they stay subscribed.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Link
              href="/referral/register"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-extrabold text-sm transition shadow-xl shadow-lime-400/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Get Your Unique Referral Link</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/referral/login"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Partner Sign In</span>
            </Link>
          </div>
        </div>

        {/* How It Works (3 Steps) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-xs space-y-3">
            <div className="h-10 w-10 rounded-xl bg-lime-400/10 text-lime-400 flex items-center justify-center font-black text-sm border border-lime-400/20">
              1
            </div>
            <h3 className="text-base font-bold text-white">Register &amp; Get Your Link</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sign up in 60 seconds with your social media profiles and channels. Instant approval gives you your unique tracking link (<code className="text-lime-400">crescelo.com/ref/yourname</code>).
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-xs space-y-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-400/10 text-cyan-400 flex items-center justify-center font-black text-sm border border-cyan-400/20">
              2
            </div>
            <h3 className="text-base font-bold text-white">Share on Your Channels</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Post tutorials on YouTube, share reels on Instagram or TikTok, recommend to clients, or include in your newsletter. Our 30-day cookie tracks all clicks.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-xs space-y-3">
            <div className="h-10 w-10 rounded-xl bg-purple-400/10 text-purple-400 flex items-center justify-center font-black text-sm border border-purple-400/20">
              3
            </div>
            <h3 className="text-base font-bold text-white">Get Paid 10% Every Month</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              When a business subscribes, you earn 10% of their subscription every month. If they pay for 2 years, you get paid for 2 years.
            </p>
          </div>
        </div>

        {/* Commission Calculator & Value Table */}
        <div className="p-8 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 shadow-2xl space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h3 className="text-xl font-extrabold text-white">How Much Can You Earn?</h3>
            <p className="text-xs text-slate-400">
              Crescelo plans range from $49 to $299 per month. Here is your monthly recurring revenue potential:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950 text-center space-y-2">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">10 Active Clients</span>
              <div className="text-3xl font-extrabold text-lime-400">$129.00<span className="text-xs text-slate-400 font-normal">/mo</span></div>
              <p className="text-[11px] text-slate-500">$1,548.00 recurring yearly passive income</p>
            </div>

            <div className="p-5 rounded-2xl border border-lime-400/30 bg-lime-400/5 text-center space-y-2">
              <span className="text-xs text-lime-400 font-bold uppercase tracking-wider">50 Active Clients</span>
              <div className="text-3xl font-extrabold text-lime-400">$645.00<span className="text-xs text-slate-400 font-normal">/mo</span></div>
              <p className="text-[11px] text-slate-400">$7,740.00 recurring yearly passive income</p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950 text-center space-y-2">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">200 Active Clients</span>
              <div className="text-3xl font-extrabold text-lime-400">$2,580.00<span className="text-xs text-slate-400 font-normal">/mo</span></div>
              <p className="text-[11px] text-slate-500">$30,960.00 recurring yearly passive income</p>
            </div>
          </div>

          <div className="text-center pt-2">
            <Link
              href="/referral/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs transition cursor-pointer"
            >
              <span>Join as a Referral Partner</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} Crescelo. All rights reserved. 10% Lifetime Recurring Partner Program.</p>
      </footer>
    </div>
  );
}
