'use client';

import { useState } from 'react';
import { showErrorModal } from '@/lib/ui/notify';
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

  const fetchAssistants = async (preferredId?: string) => {
    try {
      const res = await fetch('/api/assistants');
      const data = await res.json();
      if (data.assistants && data.assistants.length > 0) {
        setAssistants(data.assistants);
        const targetId = preferredId || activeAssistant?.id;
        const matched = targetId ? data.assistants.find((a: Assistant) => a.id === targetId) : null;
        const chosen = matched || data.assistants[0];
        setActiveAssistant(chosen);
        setFormData(chosen);
      }
    } catch (err) {
      console.error('Failed to fetch assistants:', err);
    }
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
    if (!activeAssistant) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/assistants/${activeAssistant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to save settings');
      }
      if (data.assistant) {
        setActiveAssistant(data.assistant);
        setFormData(data.assistant);
        setAssistants((prev) =>
          prev.map((a) => (a.id === data.assistant.id ? data.assistant : a))
        );
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      }
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      setSaveError(err?.message || 'Failed to save settings');
      showErrorModal({ title: "Settings weren't saved", message: err?.message || 'Failed to save settings', hint: 'Fix the value above and press Save again. Nothing was changed.' });
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
