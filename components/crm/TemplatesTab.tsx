'use client';

import React from 'react';
import { AiLandingWizard } from '@/components/crm/landing/AiLandingWizard';
import { LandingPageConfig } from '@/lib/landing/types';

export interface TemplatesTabProps {
  templateSuccessMsg?: string | null;
  applyingTemplateId?: string | null;
  handleApplyTemplate?: (templateId: string) => void | Promise<void>;
  assistants?: any[];
  activeAssistant?: any;
  allLandingPages?: any[];
  onSaveLandingPage?: (
    config: LandingPageConfig,
    assistantOption?: 'auto_create' | 'none' | string
  ) => Promise<LandingPageConfig>;
  onOpenEditor?: (config: LandingPageConfig) => void;
  onBackToList?: () => void;
  setActiveTab?: (tab: string) => void;
}

export const TemplatesTab: React.FC<TemplatesTabProps> = ({
  assistants = [],
  activeAssistant,
  allLandingPages = [],
  onSaveLandingPage,
  onOpenEditor,
  onBackToList,
  setActiveTab,
}) => {
  const handleSave =
    onSaveLandingPage ||
    (async (newConfig: LandingPageConfig, assistantOption?: string) => {
      const isAutoCreate = assistantOption === 'auto_create';
      const targetAssistantId = isAutoCreate ? undefined : assistantOption === 'none' ? '' : assistantOption;
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
      if (!res.ok) throw new Error(data.error || 'Failed to generate landing page');
      return data.config || newConfig;
    });

  const handleEditor =
    onOpenEditor ||
    ((newConfig: LandingPageConfig) => {
      if (setActiveTab) {
        setActiveTab('landing_page');
      }
    });

  const handleBack =
    onBackToList ||
    (() => {
      if (setActiveTab) {
        setActiveTab('landing_page');
      }
    });

  return (
    <div className="max-w-6xl space-y-6 mx-auto">
      <AiLandingWizard
        assistants={assistants}
        activeAssistant={activeAssistant}
        allLandingPages={allLandingPages}
        onSaveLandingPage={handleSave}
        onOpenEditor={handleEditor}
        onBackToList={handleBack}
      />
    </div>
  );
};
