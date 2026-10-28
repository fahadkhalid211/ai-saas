export type MarketingPlatform =
  | 'instagram'
  | 'youtube'
  | 'tiktok'
  | 'linkedin'
  | 'twitter'
  | 'website'
  | 'newsletter'
  | 'discord'
  | 'facebook'
  | 'other';

export interface PartnerSocialLinks {
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
  other?: string;
}

export interface ReferralPartner {
  id: string;
  referralCode: string;
  name: string;
  email: string;
  passwordHash: string;
  phone: string;
  platforms: MarketingPlatform[];
  socialLinks: PartnerSocialLinks;
  marketingStrategy?: string;
  payoutMethod?: 'paypal' | 'bank_transfer' | 'crypto' | 'wise';
  payoutDetails?: string;
  commissionPercent: number; // default: 10 (10% recurring)
  status: 'active' | 'pending' | 'suspended';
  clicksCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReferralClick {
  id: string;
  partnerId: string;
  referralCode: string;
  ipHash?: string;
  referrer?: string;
  landingPath?: string;
  userAgent?: string;
  timestamp: string;
}

export interface ReferredCustomer {
  id: string;
  partnerId: string;
  referralCode: string;
  workspaceId: string;
  customerEmail: string;
  customerName?: string;
  planId: 'starter' | 'growth' | 'scale' | string;
  planName: string;
  planPriceMonthly: number;
  billingInterval: 'monthly' | 'annual';
  status: 'trial' | 'active' | 'cancelled' | 'delinquent';
  commissionPercent: number; // 10
  monthlyCommission: number; // e.g. 10% of monthly plan
  totalEarned: number;
  totalPaidOut: number;
  joinedAt: string;
  lastPaymentAt?: string;
}

export interface ReferralPayout {
  id: string;
  partnerId: string;
  amount: number;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  payoutMethod: string;
  payoutDetails: string;
  requestedAt: string;
  processedAt?: string;
  notes?: string;
}

export interface ReferralStats {
  partner: {
    id: string;
    referralCode: string;
    name: string;
    email: string;
    phone: string;
    platforms: MarketingPlatform[];
    socialLinks: PartnerSocialLinks;
    payoutMethod?: string;
    payoutDetails?: string;
    commissionPercent: number;
    status: string;
    createdAt: string;
  };
  totalClicks: number;
  totalReferredCustomers: number;
  activePayingCustomers: number;
  trialCustomers: number;
  monthlyRecurringCommission: number;
  totalEarningsToDate: number;
  pendingPayout: number;
  customers: Array<{
    id: string;
    customerEmailMasked: string;
    planName: string;
    planPriceMonthly: number;
    billingInterval: string;
    status: 'trial' | 'active' | 'cancelled' | 'delinquent';
    monthlyCommission: number;
    totalEarned: number;
    joinedAt: string;
  }>;
  recentClicks: Array<{
    id: string;
    referrer?: string;
    landingPath?: string;
    timestamp: string;
  }>;
  payouts: ReferralPayout[];
}
