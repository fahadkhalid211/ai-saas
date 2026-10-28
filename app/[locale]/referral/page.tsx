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

          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/referral/login"
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 transition font-medium"
            >
              Partner Sign In
            </Link>
            <Link
              href="/referral/register"
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition shadow-xs"
            >
              Join Program
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16 flex-1 w-full space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Official Affiliate &amp; Referral Program</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Earn <span className="text-blue-600 dark:text-blue-400">10% Lifetime Recurring</span> Commission on Every Business Client
          </h1>

          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Recommend Crescelo&apos;s 24/7 autonomous AI assistant to businesses, agencies, and store owners. For every paying client you refer, you earn 10% each month for as long as they stay subscribed.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Link
              href="/referral/register"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Get Your Unique Referral Link</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/referral/login"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Partner Sign In</span>
            </Link>
          </div>
        </div>

        {/* How It Works (3 Steps) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
            <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-sm border border-blue-200 dark:border-blue-800">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Register &amp; Get Your Link</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Sign up in 60 seconds with your social media profiles and channels. Instant approval gives you your unique tracking link (<code className="text-blue-600 dark:text-blue-400 font-mono">crescelo.com/ref/yourname</code>).
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-sm border border-indigo-200 dark:border-indigo-800">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Share on Your Channels</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Post tutorials on YouTube, share reels on Instagram or TikTok, recommend to clients, or include in your newsletter. Our 30-day cookie tracks all clicks.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm border border-emerald-200 dark:border-emerald-800">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Get Paid 10% Every Month</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              When a business subscribes, you earn 10% of their subscription every month. If they pay for 2 years, you get paid for 2 years.
            </p>
          </div>
        </div>

        {/* Commission Calculator & Value Table */}
        <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">How Much Can You Earn?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Crescelo plans range from $49 to $299 per month. Here is your monthly recurring revenue potential:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-center space-y-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">10 Active Clients</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">$129.00<span className="text-xs text-slate-500 font-normal">/mo</span></div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">$1,548.00 recurring yearly passive income</p>
            </div>

            <div className="p-5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30 text-center space-y-2">
              <span className="text-xs text-blue-700 dark:text-blue-300 font-bold uppercase tracking-wider">50 Active Clients</span>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">$645.00<span className="text-xs text-slate-500 font-normal">/mo</span></div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">$7,740.00 recurring yearly passive income</p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-center space-y-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">200 Active Clients</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">$2,580.00<span className="text-xs text-slate-500 font-normal">/mo</span></div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">$30,960.00 recurring yearly passive income</p>
            </div>
          </div>

          <div className="text-center pt-2">
            <Link
              href="/referral/register"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-xs cursor-pointer"
            >
              <span>Join as a Referral Partner</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>&copy; {new Date().getFullYear()} Crescelo. All rights reserved. 10% Lifetime Recurring Partner Program.</p>
      </footer>
    </div>
  );
}
