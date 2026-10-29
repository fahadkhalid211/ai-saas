'use client';

import { useEffect } from 'react';
import { captureReferralFromUrl } from '@/lib/analytics/referral-client';

export function ReferralTracker() {
  useEffect(() => {
    captureReferralFromUrl();
  }, []);

  return null;
}
