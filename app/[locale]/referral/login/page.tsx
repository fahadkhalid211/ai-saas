'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { Lock, Mail, ArrowRight, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';

export default function ReferralLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your partner email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/referral/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Invalid email or password.');
        setIsLoading(false);
        return;
      }

      router.push('/referral/dashboard');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main id="main" className="pt-6 pb-24 flex-1 flex flex-col justify-center">
        <div className="mk-wrap max-w-md mx-auto w-full space-y-6">
          <div className="text-center space-y-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#e6f9c8] text-[#08251a] border-[1.5px] border-[#1a1a1a]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Partner Portal</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1a1a1a]">
              Sign In to Your Dashboard
            </h1>
            <p className="text-xs text-[#55554c] leading-relaxed">
              Access your real-time link clicks, 10% monthly recurring commissions, and payout withdrawal history.
            </p>
          </div>

          <div className="rounded-3xl border-[1.5px] border-[#1a1a1a] bg-[#fffdf6] shadow-[0_6px_0_#1a1a1a] p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-[#ffe7c2] border-[1.5px] border-[#8a4a0a] text-[#8a4a0a] text-xs flex items-center gap-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span className="font-medium">{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#1a1a1a] mb-1.5">Partner Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@agency.com"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border-[1.5px] border-[#1a1a1a] bg-[#fffdf6] text-[#1a1a1a] text-xs placeholder:text-[#55554c]/60 outline-none focus:ring-2 focus:ring-[#abff44] transition font-sans"
                  />
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-[#55554c] pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1a1a1a] mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your partner password"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border-[1.5px] border-[#1a1a1a] bg-[#fffdf6] text-[#1a1a1a] text-xs placeholder:text-[#55554c]/60 outline-none focus:ring-2 focus:ring-[#abff44] transition font-sans"
                  />
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-[#55554c] pointer-events-none" />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mk-btn mk-btn-primary py-3 text-xs font-bold shadow-[0_3px_0_#1a1a1a] hover:translate-y-[-2px] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <span>{isLoading ? 'Signing in...' : 'Sign In to Partner Portal'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>

          <div className="text-center space-y-2 text-xs text-[#55554c]">
            <p>
              New partner?{' '}
              <Link href="/referral/register" className="font-bold text-[#0f6e58] underline underline-offset-4 hover:text-[#08251a]">
                Join the Referral Program &rarr;
              </Link>
            </p>
            <p>
              <Link href="/referral" className="hover:underline">
                &larr; Back to Referral Program Overview
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
