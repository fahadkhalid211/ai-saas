'use client';

import { T, useT } from '@/lib/i18n/context';
import React from 'react';
import { CreditCard, X, RefreshCw, Check } from 'lucide-react';

export interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
  cardBrand: string;
  setCardBrand: (brand: string) => void;
  cardLast4: string;
  setCardLast4: (last4: string) => void;
  cardExpMonth: string | number;
  setCardExpMonth: (month: string) => void;
  cardExpYear: string | number;
  setCardExpYear: (year: string) => void;
  billingEmailInput: string;
  setBillingEmailInput: (email: string) => void;
  isUpdatingCard: boolean;
}

export const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  cardBrand,
  setCardBrand,
  cardLast4,
  setCardLast4,
  cardExpMonth,
  setCardExpMonth,
  cardExpYear,
  setCardExpYear,
  billingEmailInput,
  setBillingEmailInput,
  isUpdatingCard,
}) => {
  const __t = useT();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-5 animate-in fade-in duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white"><T>Update Payment Details</T></h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1"><T>Card Brand</T></label>
            <select
              value={cardBrand}
              onChange={(e) => setCardBrand(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
            >
              <option value="Visa">{__t("Visa")}</option>
              <option value="Mastercard">{__t("Mastercard")}</option>
              <option value="American Express">{__t("American Express")}</option>
              <option value="Discover">{__t("Discover")}</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1"><T>Last 4 Digits</T></label>
            <input
              type="text"
              maxLength={4}
              value={cardLast4}
              onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, ''))}
              placeholder="4242"
              required
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-mono text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1"><T>Exp Month</T></label>
              <input
                type="number"
                min={1}
                max={12}
                value={cardExpMonth}
                onChange={(e) => setCardExpMonth(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-mono text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1"><T>Exp Year</T></label>
              <input
                type="number"
                min={2026}
                max={2040}
                value={cardExpYear}
                onChange={(e) => setCardExpYear(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-mono text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1"><T>Billing Email Address</T></label>
            <input
              type="email"
              value={billingEmailInput}
              onChange={(e) => setBillingEmailInput(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-mono text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
            >
              <T>Cancel</T>
            </button>
            <button
              type="submit"
              disabled={isUpdatingCard}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isUpdatingCard ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              <span><T>Save Card</T></span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
