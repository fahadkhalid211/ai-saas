'use client';

import { useState } from 'react';

export function useCrmBilling() {
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
          // Redirect to live Stripe Checkout session (supporting Google Pay, Apple Pay, Cards)
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
          text: data.error || 'Customer portal is available after active Stripe checkout.',
        });
      }
    } catch (err: any) {
      setPlanChangeMsg({ type: 'error', text: err.message || 'Failed to open customer portal' });
    }
  };

  const handleUpdatePaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingCard(true);
    try {
      const res = await fetch('/api/billing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: {
            brand: cardBrand,
            last4: cardLast4,
            expMonth: parseInt(cardExpMonth, 10) || 12,
            expYear: parseInt(cardExpYear, 10) || 2028,
          },
          billingEmail: billingEmailInput,
        }),
      });
      if (res.ok) {
        setShowPaymentModal(false);
        await fetchBilling();
      }
    } catch (err) {
      console.error('Failed to update payment method:', err);
    } finally {
      setIsUpdatingCard(false);
    }
  };

  const handleDownloadInvoice = (inv: any) => {
    const text = `===========================================
               CRESCELO INVOICE
===========================================
Invoice ID:      ${inv.id}
Date:            ${inv.date}
Status:          ${inv.status.toUpperCase()}
Plan:            ${inv.planName}
Amount Paid:     ${inv.amount}.00 USD
Payment Method:  ${billingData?.paymentMethod?.brand || 'Visa'} ending in •••• ${billingData?.paymentMethod?.last4 || '4242'}
Billing Email:   ${billingData?.billingEmail || 'billing@crescelo.com'}
-------------------------------------------
Chat-Session Based Billing Model
No Per-Message Fees. Pure Customer Outcomes.
Thank you for using Crescelo Business Engine.
===========================================`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${inv.id}.txt`;
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
