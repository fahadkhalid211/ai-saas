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
          assistantId: activeAssistant?.id || 'demo-assistant',
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
      await fetchAllLandingPages();
      setLandingConfig(newConfig);
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
          assistantId: activeAssistant.id,
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

  return {
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
    fetchAllLandingPages,
    handlePurchaseExtraLandingPage,
    handleCreateNewLandingPage,
    fetchLandingConfig,
    handleSaveLandingConfig,
  };
}
