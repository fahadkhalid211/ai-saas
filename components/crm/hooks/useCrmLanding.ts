'use client';

import { useState } from 'react';
import {
  LandingPageConfig,
  DEFAULT_BARBER_LANDING_CONFIG,
  TEMPLATE_LANDING_CONFIGS,
} from '@/lib/landing/types';

interface UseCrmLandingOptions {
  activeAssistant: any;
  playNotificationChime: () => void;
  fetchBilling: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
}

export function useCrmLanding({
  activeAssistant,
  playNotificationChime,
  fetchBilling,
  fetchNotifications,
}: UseCrmLandingOptions) {
  const [viewMode, setViewMode] = useState<'list' | 'create_wizard' | 'editor'>('list');
  const [landingConfig, setLandingConfig] = useState<LandingPageConfig>(DEFAULT_BARBER_LANDING_CONFIG);
  const [isSavingLanding, setIsSavingLanding] = useState(false);
  const [saveLandingSuccess, setSaveLandingSuccess] = useState(false);
  const [saveLandingError, setSaveLandingError] = useState<string | null>(null);
  const [copiedLandingUrl, setCopiedLandingUrl] = useState(false);
  const [showCounterQrModal, setShowCounterQrModal] = useState(false);
  const [presetNotice, setPresetNotice] = useState<string | null>(null);

  const [allLandingPages, setAllLandingPages] = useState<LandingPageConfig[]>([]);
  const [landingPageLimits, setLandingPageLimits] = useState<{
    planTier: string;
    baseLimit: number;
    extraSlots: number;
    totalAllowed: number;
    currentCount: number;
  }>({
    planTier: 'starter',
    baseLimit: 1,
    extraSlots: 0,
    totalAllowed: 1,
    currentCount: 1,
  });
  const [isPurchasingAddon, setIsPurchasingAddon] = useState(false);
  const [addonSuccessMsg, setAddonSuccessMsg] = useState<string | null>(null);
  const [addonErrorMsg, setAddonErrorMsg] = useState<string | null>(null);
  const [showNewPageModal, setShowNewPageModal] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');
  const [newPageIndustry, setNewPageIndustry] = useState('barbershop');
  const [newPageAssistantId, setNewPageAssistantId] = useState('auto_create');

  const [deletingPageId, setDeletingPageId] = useState<string | null>(null);
  const [isDeletingLandingPage, setIsDeletingLandingPage] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState(0);
  const [deleteStatusMessage, setDeleteStatusMessage] = useState('');
  const [pagePendingDelete, setPagePendingDelete] = useState<LandingPageConfig | null>(null);

  const fetchAllLandingPages = async () => {
    try {
      const res = await fetch('/api/landing-page?all=true');
      if (res.ok) {
        const data = await res.json();
        const pagesList = data.landingPages || data.pages;
        if (Array.isArray(pagesList)) {
          setAllLandingPages(pagesList);
        }
        if (data.limits) {
          setLandingPageLimits(data.limits);
        } else if (data.totalAllowed !== undefined) {
          setLandingPageLimits({
            planTier: data.planName || 'starter',
            baseLimit: data.planLimit || 1,
            extraSlots: data.extraSlots || 0,
            totalAllowed: data.totalAllowed || 1,
            currentCount: data.currentCount || (pagesList ? pagesList.length : 1),
          });
        }
      }
    } catch (e) {
      console.warn('Failed to fetch all landing pages', e);
    }
  };

  const handlePurchaseExtraLandingPage = async () => {
    setIsPurchasingAddon(true);
    setAddonSuccessMsg(null);
    setAddonErrorMsg(null);
    try {
      const res = await fetch('/api/billing/addon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addonType: 'extra_landing_page' }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to purchase add-on');
      }
      setAddonSuccessMsg('Extra Landing Page slot unlocked for $100! Your workspace limit has been updated.');
      playNotificationChime();
      await fetchAllLandingPages();
      await fetchBilling();
      await fetchNotifications();
      setTimeout(() => setAddonSuccessMsg(null), 5000);
    } catch (err: any) {
      setAddonErrorMsg(err.message);
    } finally {
      setIsPurchasingAddon(false);
    }
  };

  const handleCreateNewLandingPage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageName.trim() || !newPageSlug.trim()) return;

    try {
      const basePreset = TEMPLATE_LANDING_CONFIGS[newPageSlug] || TEMPLATE_LANDING_CONFIGS[newPageIndustry] || DEFAULT_BARBER_LANDING_CONFIG;
      const cleanSlug = newPageSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      const newConfig: LandingPageConfig = {
        ...basePreset,
        id: 'lp_' + cleanSlug,
        businessName: newPageName,
        slug: cleanSlug,
        industry: newPageIndustry,
      };

      const res = await fetch('/api/landing-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assistantId: newPageAssistantId === 'auto_create' ? undefined : newPageAssistantId,
          createDedicatedAssistant: newPageAssistantId === 'auto_create',
          config: newConfig,
          isNewPage: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create new landing page');
      }

      setShowNewPageModal(false);
      setNewPageName('');
      setNewPageSlug('');
      setNewPageAssistantId('auto_create');
      await fetchAllLandingPages();
      setLandingConfig(data.config || newConfig);
      setPresetNotice('Created new landing page: ' + newConfig.businessName);
      setTimeout(() => setPresetNotice(null), 4000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const fetchLandingConfig = async (astId: string) => {
    try {
      const res = await fetch(`/api/landing-page?assistantId=${encodeURIComponent(astId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.config) setLandingConfig(data.config);
      }
    } catch (e) {
      console.warn('Failed to fetch landing config', e);
    }
  };

  const handleSaveLandingConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssistant) return;
    setIsSavingLanding(true);
    setSaveLandingSuccess(false);
    setSaveLandingError(null);
    try {
      const res = await fetch('/api/landing-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assistantId: landingConfig.assistantId !== undefined ? landingConfig.assistantId : activeAssistant.id,
          config: landingConfig,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaveLandingSuccess(true);
        setTimeout(() => setSaveLandingSuccess(false), 3000);
      } else {
        setSaveLandingError(data.error || 'Failed to update landing page');
      }
    } catch (err: any) {
      setSaveLandingError(err.message || 'Network error saving landing page');
    } finally {
      setIsSavingLanding(false);
    }
  };

  const handleRequestDeleteLandingPage = (pageIdOrSlug?: string | LandingPageConfig) => {
    if (!pageIdOrSlug) {
      setPagePendingDelete(landingConfig);
      return;
    }
    if (typeof pageIdOrSlug === 'object' && pageIdOrSlug !== null) {
      setPagePendingDelete(pageIdOrSlug);
      return;
    }
    const found = allLandingPages.find((p) => p.id === pageIdOrSlug || p.slug === pageIdOrSlug) || landingConfig;
    setPagePendingDelete(found);
  };

  const handleConfirmDeleteLandingPage = async () => {
    if (!pagePendingDelete) return;
    const pageToDelete = pagePendingDelete;
    const target = pageToDelete.id || pageToDelete.slug;
    if (!target) return;

    setIsDeletingLandingPage(true);
    setDeletingPageId(target);
    setDeleteProgress(15);
    setDeleteStatusMessage(`Unbinding live route /site/${pageToDelete.slug}...`);

    try {
      await new Promise((r) => setTimeout(r, 220));
      setDeleteProgress(40);
      setDeleteStatusMessage('Disconnecting isolated AI concierge and booking catalog...');

      const deletePromise = fetch(`/api/landing-page?id=${encodeURIComponent(target)}`, {
        method: 'DELETE',
      });

      await new Promise((r) => setTimeout(r, 260));
      setDeleteProgress(75);
      setDeleteStatusMessage('Purging database records and cloud storage...');

      const res = await deletePromise;
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete landing page');
      }

      setDeleteProgress(100);
      setDeleteStatusMessage(`Landing page "${pageToDelete.businessName}" deleted successfully!`);
      await new Promise((r) => setTimeout(r, 350));

      const remaining = allLandingPages.filter(
        (p) => p.id !== target && p.slug !== target && (p.slug || '').toLowerCase() !== (pageToDelete.slug || '').toLowerCase()
      );
      setAllLandingPages(remaining);

      if (remaining.length > 0) {
        setLandingConfig(remaining[0]);
      } else {
        setLandingConfig(DEFAULT_BARBER_LANDING_CONFIG);
      }

      setPresetNotice(`Deleted landing page "${pageToDelete.businessName}".`);
      setTimeout(() => setPresetNotice(null), 4000);

      // Re-sync with backend
      fetchAllLandingPages();
    } catch (err: any) {
      alert(err.message || 'Failed to delete landing page');
    } finally {
      setIsDeletingLandingPage(false);
      setDeletingPageId(null);
      setPagePendingDelete(null);
      setDeleteProgress(0);
      setDeleteStatusMessage('');
    }
  };

  const handleDeleteLandingPage = (pageIdOrSlug?: string | LandingPageConfig) => {
    handleRequestDeleteLandingPage(pageIdOrSlug);
  };

  const handleSelectPageForEdit = (page: LandingPageConfig) => {
    setLandingConfig({ ...page });
    setViewMode('editor');
  };

  const handleStartCreateWizard = () => {
    setViewMode('create_wizard');
  };

  const handleBackToList = async () => {
    await fetchAllLandingPages();
    setViewMode('list');
  };

  const handleQuickUpdateKnowledgeBase = async (pageIdOrSlug: string, assistantId: string) => {
    const page = allLandingPages.find((p) => p.id === pageIdOrSlug || p.slug === pageIdOrSlug);
    if (!page) return;

    const updatedConfig: LandingPageConfig = {
      ...page,
      assistantId: assistantId || '',
    };

    try {
      const res = await fetch('/api/landing-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assistantId: assistantId || '',
          config: updatedConfig,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update knowledge base');
      }

      setAllLandingPages((prev) =>
        prev.map((p) => (p.id === page.id || p.slug === page.slug ? { ...p, assistantId: assistantId || '' } : p))
      );

      if (landingConfig.id === page.id || landingConfig.slug === page.slug) {
        setLandingConfig((prev) => ({ ...prev, assistantId: assistantId || '' }));
      }

      setPresetNotice(
        assistantId
          ? `Connected knowledge base to "${page.businessName}".`
          : `Disconnected knowledge base from "${page.businessName}".`
      );
      setTimeout(() => setPresetNotice(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to update knowledge base');
    }
  };

  const handleAIGenerateLandingPage = async (
    newConfig: LandingPageConfig,
    assistantOption: 'auto_create' | 'none' | string = 'auto_create'
  ) => {
    try {
      const isAutoCreate = assistantOption === 'auto_create';
      const targetAssistantId = isAutoCreate ? undefined : (assistantOption === 'none' ? '' : assistantOption);

      const res = await fetch('/api/landing-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assistantId: targetAssistantId,
          createDedicatedAssistant: isAutoCreate,
          config: newConfig,
          isNewPage: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate landing page with AI');
      }

      const saved = data.config || newConfig;
      await fetchAllLandingPages();
      setLandingConfig(saved);
      playNotificationChime();
      return saved;
    } catch (err: any) {
      throw err;
    }
  };

  return {
    viewMode,
    setViewMode,
    landingConfig,
    setLandingConfig,
    isSavingLanding,
    saveLandingSuccess,
    saveLandingError,
    copiedLandingUrl,
    setCopiedLandingUrl,
    showCounterQrModal,
    setShowCounterQrModal,
    presetNotice,
    setPresetNotice,
    allLandingPages,
    landingPageLimits,
    isPurchasingAddon,
    addonSuccessMsg,
    addonErrorMsg,
    showNewPageModal,
    setShowNewPageModal,
    newPageName,
    setNewPageName,
    newPageSlug,
    setNewPageSlug,
    newPageIndustry,
    setNewPageIndustry,
    newPageAssistantId,
    setNewPageAssistantId,
    fetchAllLandingPages,
    handlePurchaseExtraLandingPage,
    handleCreateNewLandingPage,
    handleDeleteLandingPage,
    deletingPageId,
    isDeletingLandingPage,
    deleteProgress,
    deleteStatusMessage,
    pagePendingDelete,
    setPagePendingDelete,
    handleRequestDeleteLandingPage,
    handleConfirmDeleteLandingPage,
    fetchLandingConfig,
    handleSaveLandingConfig,
    handleSelectPageForEdit,
    handleStartCreateWizard,
    handleBackToList,
    handleQuickUpdateKnowledgeBase,
    handleAIGenerateLandingPage,
  };
}
