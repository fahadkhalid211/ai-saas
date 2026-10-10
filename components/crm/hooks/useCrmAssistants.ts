'use client';

import { useState } from 'react';
import { showErrorModal, SUBSCRIPTION_REQUIRED_EVENT } from '@/lib/ui/notify';
import { Assistant } from '@/types/crm';

export function useCrmAssistants() {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [activeAssistant, setActiveAssistant] = useState<Assistant | null>(null);
  const [formData, setFormData] = useState<Partial<Assistant>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Modal state
  const [showNewModal, setShowNewModal] = useState(false);
  const [newAssistantName, setNewAssistantName] = useState('');

  /**
   * Loads the workspace's assistants and returns the one that became active (null when none could be loaded).
   * Right after sign-up a request can fail for a moment, so a failed load is tried again a few times instead of
   * leaving the dashboard with no assistant (which made every Save button do nothing).
   */
  const fetchAssistants = async (preferredId?: string, attempts: number = 3): Promise<Assistant | null> => {
    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        const res = await fetch('/api/assistants', { cache: 'no-store' });
        const data = await res.json().catch(() => ({}));
        if (res.ok && Array.isArray(data.assistants) && data.assistants.length > 0) {
          setAssistants(data.assistants);
          const targetId = preferredId || activeAssistant?.id;
          const matched = targetId ? data.assistants.find((a: Assistant) => a.id === targetId) : null;
          const chosen = matched || data.assistants[0];
          setActiveAssistant(chosen);
          setFormData(chosen);
          return chosen;
        }
        if (res.ok) return null; // loaded fine, the workspace simply has no assistant
      } catch (err) {
        console.error('Failed to fetch assistants:', err);
      }
      if (attempt < attempts) await new Promise((r) => setTimeout(r, 1200 * attempt));
    }
    return null;
  };

  const handleCreateAssistant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssistantName.trim()) return;

    try {
      const res = await fetch('/api/assistants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAssistantName.trim(),
          welcomeMessage: `Hello! Welcome to ${newAssistantName.trim()}. How can I assist you?`,
        }),
      });
      const data = await res.json();
      if (data.assistant) {
        setAssistants((prev) => [...prev, data.assistant]);
        setActiveAssistant(data.assistant);
        setShowNewModal(false);
        setNewAssistantName('');
      }
    } catch (err) {
      console.error('Failed to create assistant:', err);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      // The assistant list may not have loaded (a failed request on page load): load it now instead of doing nothing.
      let target = activeAssistant;
      const edits = formData;
      if (!target) {
        target = await fetchAssistants(undefined, 2);
        if (!target) {
          throw Object.assign(new Error('Your assistant could not be loaded, so there is nothing to save to yet.'), {
            hint: 'Check your connection and reload the page. If this keeps happening, contact support from the Support tab.',
          });
        }
      }
      const res = await fetch(`/api/assistants/${target.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...edits, id: target.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        throw Object.assign(new Error('You have been signed out.'), { hint: 'Sign in again, then save your changes.' });
      }
      if (res.status === 402 || data.subscriptionRequired) {
        // No plan yet (or it ended): show the plan screen so the owner can start a trial, pay, or enter an access code.
        window.dispatchEvent(new CustomEvent(SUBSCRIPTION_REQUIRED_EVENT));
        setSaveError(data.error || 'Choose a plan to save changes.');
        setTimeout(() => setSaveError(null), 5000);
        return;
      }
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to save settings');
      }
      if (!data.assistant) {
        throw new Error('The server did not confirm the save.');
      }
      setActiveAssistant(data.assistant);
      setFormData(data.assistant);
      setAssistants((prev) =>
        prev.map((a) => (a.id === data.assistant.id ? data.assistant : a))
      );
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      setSaveError(err?.message || 'Failed to save settings');
      showErrorModal({ title: "Settings weren't saved", message: err?.message || 'Failed to save settings', hint: err?.hint || 'Fix the value above and press Save again. Nothing was changed.' });
      setTimeout(() => setSaveError(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAssistant = async (assistantId: string) => {
    if (assistants.length <= 1) {
      alert('You must have at least one assistant in your workspace. Create a new bot before removing this one.');
      return;
    }

    const ast = assistants.find((a) => a.id === assistantId);
    const confirmed = typeof window !== 'undefined'
      ? window.confirm(`Are you sure you want to permanently delete "${ast?.name || assistantId}"? All of its training documents, knowledge chunks, and conversations will be deleted.`)
      : true;
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/assistants/${assistantId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete assistant');
      }

      const remaining = assistants.filter((a) => a.id !== assistantId);
      setAssistants(remaining);
      if (activeAssistant?.id === assistantId) {
        setActiveAssistant(remaining[0]);
        setFormData(remaining[0]);
      }
      await fetchAssistants(remaining[0]?.id);
    } catch (err: any) {
      alert(err.message || 'Failed to delete assistant');
    }
  };

  return {
    assistants,
    setAssistants,
    activeAssistant,
    setActiveAssistant,
    formData,
    setFormData,
    isSaving,
    saveSuccess,
    saveError,
    showNewModal,
    setShowNewModal,
    newAssistantName,
    setNewAssistantName,
    fetchAssistants,
    handleCreateAssistant,
    handleSaveSettings,
    handleDeleteAssistant,
  };
}
