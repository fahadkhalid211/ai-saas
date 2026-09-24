'use client';

import { SaveButton } from '@/components/ui/SaveButton';
import React from 'react';
import { CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

export interface BehaviorTabProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  saveSuccess: boolean;
  saveError: string | null;
  handleSaveSettings: () => void | Promise<void>;
  isSaving: boolean;
}

export const BehaviorTab: React.FC<BehaviorTabProps> = ({
  formData,
  setFormData,
  saveSuccess,
  saveError,
  handleSaveSettings,
  isSaving,
}) => {
  return (
    <div className="max-w-4xl space-y-6 mx-auto">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Behavior &amp; Guardrails</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Set your assistant's name, personality, and what it says when it does not know an answer.
                  </p>
                </div>

                {saveSuccess && (
                  <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-3 text-xs text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Behavior updated successfully!</span>
                  </div>
                )}

                {saveError && (
                  <div className="flex items-center gap-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 p-3 text-xs text-rose-700 dark:text-rose-300">
                    <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
                    <span>{saveError}</span>
                  </div>
                )}

                {/* Template Presets */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Quick Personality Templates</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      {
                        name: 'E-commerce Sales Rep',
                        prompt: 'You are an enthusiastic, knowledgeable sales assistant. Guide customers to the right products, highlight benefits, and confirm exact prices and shipping policies from the provided knowledge.',
                      },
                      {
                        name: 'Customer Support Specialist',
                        prompt: 'You are an empathetic, concise, and problem-solving support agent. Help customers troubleshoot issues, follow return guidelines, and provide clear step-by-step instructions.',
                      },
                      {
                        name: 'Corporate FAQ Bot',
                        prompt: 'You are an executive assistant representing our firm. Provide formal, precise, and verified facts. Never speculate on unannounced policies.',
                      },
                    ].map((t) => (
                      <button
                        key={t.name}
                        type="button"
                        onClick={() => setFormData({ ...formData, systemPrompt: t.prompt })}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition shadow-xs"
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form Inputs */}
                <div className="space-y-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                      System Instructions &amp; Role
                    </label>
                    <textarea
                      rows={5}
                      value={formData.systemPrompt || ''}
                      onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 leading-relaxed font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                        Welcome Message
                      </label>
                      <input
                        type="text"
                        value={formData.welcomeMessage || ''}
                        onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                        Fallback Message
                      </label>
                      <input
                        type="text"
                        value={formData.fallbackMessage || ''}
                        onChange={(e) => setFormData({ ...formData, fallbackMessage: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <SaveButton onClick={handleSaveSettings} saving={isSaving} idleLabel="Save Guardrails" savedLabel="Guardrails Saved" icon={<CheckCircle2 className="h-3.5 w-3.5" />} />
                  </div>
                </div>
              </div>
  );
};
