'use client';

import React from 'react';

export interface NewAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
  newAssistantName: string;
  setNewAssistantName: (name: string) => void;
}

export const NewAssistantModal: React.FC<NewAssistantModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  newAssistantName,
  setNewAssistantName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Create New Business Assistant</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Create an isolated assistant with its own knowledge base, prompt instructions, and website widget.
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Assistant Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sales Specialist, Store Support AI"
              value={newAssistantName}
              onChange={(e) => setNewAssistantName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition"
            >
              Create Assistant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
