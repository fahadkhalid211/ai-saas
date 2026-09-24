'use client';

import React, { useEffect } from 'react';
import { reportClientError } from '@/lib/logging/client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Root Layout Global Error Boundary caught:', error);
    reportClientError({ kind: 'boundary', message: error.message, name: error.name, stack: error.stack, digest: error.digest });
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen w-full flex items-center justify-center bg-slate-950 font-sans text-slate-100 p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 text-center space-y-6">
          <div className="h-14 w-14 rounded-2xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400 mx-auto text-xl font-bold">
            !
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-white">Application Error</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              A critical error interrupted the application layout. Please restart the session.
            </p>
            {error.message && (
              <div className="p-3 bg-slate-800/80 border border-slate-700/60 rounded-xl text-left">
                <span className="text-[11px] font-mono text-slate-300 break-words">
                  {error.message}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => reset()}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
