'use client';

import React from 'react';
import { X, QrCode } from 'lucide-react';

export interface CounterQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug?: string;
  assistantId?: string;
}

export const CounterQrModal: React.FC<CounterQrModalProps> = ({
  isOpen,
  onClose,
  slug,
  assistantId,
}) => {
  if (!isOpen) return null;

  const targetUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/site/${slug || assistantId || 'demo-assistant'}`
    : 'http://localhost:3000/site/classic-barbershop';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-sm w-full text-center space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 border border-blue-200 dark:border-blue-800 mx-auto">
          <QrCode className="h-6 w-6" />
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            In-Store Countertop QR Code
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Print and place this on your reception desk for walk-in booking and live prices.
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-center shadow-inner">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(targetUrl)}`}
            alt="Countertop QR Code"
            className="w-52 h-52 rounded-lg"
          />
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition shadow-xs cursor-pointer"
          >
            Print Countertop Display
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
