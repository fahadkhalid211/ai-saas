'use client';

import { useState, useRef } from 'react';

export function useCrmBilling() {
  const isSubmittingPlanRef = useRef(false);
  const [billingData, setBillingData] = useState<any>(null);
  const [isLoadingBilling, setIsLoadingBilling] = useState(false);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');
  const [changingPlanId, setChangingPlanId] = useState<string | null>(null);
  const [planChangeMsg, setPlanChangeMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cardBrand, setCardBrand] = useState('Visa');
  const [cardLast4, setCardLast4] = useState('4242');
  const [cardExpMonth, setCardExpMonth] = useState('12');
  const [cardExpYear, setCardExpYear] = useState('2028');
  const [billingEmailInput, setBillingEmailInput] = useState('billing@crescelo.com');
  const [isUpdatingCard, setIsUpdatingCard] = useState(false);

  const fetchBilling = async () => {
    setIsLoadingBilling(true);
    try {
      const res = await fetch('/api/billing');
      if (res.ok) {
        const data = await res.json();
        setBillingData(data);
        if (data.billingInterval) setBillingInterval(data.billingInterval);
        if (data.paymentMethod) {
          setCardBrand(data.paymentMethod.brand || 'Visa');
          setCardLast4(data.paymentMethod.last4 || '4242');
          setCardExpMonth(String(data.paymentMethod.expMonth || '12'));
          setCardExpYear(String(data.paymentMethod.expYear || '2028'));
        }
        if (data.billingEmail) setBillingEmailInput(data.billingEmail);
      }
    } catch (err) {
      console.error('Failed to fetch billing data:', err);
    } finally {
      setIsLoadingBilling(false);
    }
  };

  const handleSwitchPlan = async (targetPlanId: string) => {
    if (isSubmittingPlanRef.current || changingPlanId) return;
    isSubmittingPlanRef.current = true;
    setChangingPlanId(targetPlanId);
    setPlanChangeMsg(null);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: targetPlanId,
          billingInterval,
          workspaceId: billingData?.workspaceId || 'default-workspace',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        if (!data.isSandbox && data.url) {
          // Redirect to the live Lemon Squeezy checkout (cards, Apple Pay, Google Pay, PayPal)
          window.location.href = data.url;
          return;
        }
        setPlanChangeMsg({
          type: 'success',
          text: data.message || `Successfully activated ${targetPlanId} plan (Sandbox Google Pay / Card verified)!`,
        });
        await fetchBilling();
      } else {
        setPlanChangeMsg({ type: 'error', text: data.error || 'Failed to initialize checkout session' });
      }
    } catch (err: any) {
      setPlanChangeMsg({ type: 'error', text: err.message || 'Network error updating plan' });
    } finally {
      setChangingPlanId(null);
      isSubmittingPlanRef.current = false;
    }
  };

  const handleOpenCustomerPortal = async () => {
    try {
      const res = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: billingData?.workspaceId || 'default-workspace',
        }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setPlanChangeMsg({
          type: 'error',
          text: data.error || 'Customer portal is available after you subscribe.',
        });
      }
    } catch (err: any) {
      setPlanChangeMsg({ type: 'error', text: err.message || 'Failed to open customer portal' });
    }
  };

  // Cards are only ever entered on Lemon Squeezy's own pages. This opens the customer portal, where the card can be replaced.
  const handleUpdatePaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingCard(true);
    try {
      await handleOpenCustomerPortal();
    } finally {
      setIsUpdatingCard(false);
    }
  };

  const handleDownloadInvoice = (inv: any) => {
    if (!inv) return;
    const invId = inv.id || `inv_${Date.now()}`;
    const invDate = inv.date || new Date().toISOString().split('T')[0];
    const invStatus = String(inv.status || 'paid').toUpperCase();
    const invPlan = inv.planName || 'Crescelo Plan';
    const invAmount = inv.amount !== undefined ? `${inv.amount}.00` : '0.00';
    const brand = billingData?.paymentMethod?.brand || 'Visa';
    const last4 = billingData?.paymentMethod?.last4 || '4242';
    const email = billingData?.billingEmail || 'billing@crescelo.com';

    const text = `===========================================
               CRESCELO INVOICE
===========================================
Invoice ID:      ${invId}
Date:            ${invDate}
Status:          ${invStatus}
Plan:            ${invPlan}
Amount Paid:     ${invAmount} USD
Payment Method:  ${brand} ending in •••• ${last4}
Billing Email:   ${email}
-------------------------------------------
Chat-Session Based Billing Model
No Per-Message Fees. Pure Customer Outcomes.
Thank you for using Crescelo Business Engine.
===========================================`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    billingData,
    isLoadingBilling,
    billingInterval,
    setBillingInterval,
    changingPlanId,
    planChangeMsg,
    setPlanChangeMsg,
    showPaymentModal,
    setShowPaymentModal,
    cardBrand,
    setCardBrand,
    cardLast4,
    setCardLast4,
    cardExpMonth,
    setCardExpMonth,
    cardExpYear,
    setCardExpYear,
    billingEmailInput,
    setBillingEmailInput,
    isUpdatingCard,
    fetchBilling,
    handleSwitchPlan,
    handleOpenCustomerPortal,
    handleUpdatePaymentMethod,
    handleDownloadInvoice,
  };
}
