import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { denyUnlessMaster } from '@/lib/logging/access';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const denied = await denyUnlessMaster(req);
  if (denied) return denied;

  try {
    await Database.refreshState(0);
    const partners = await Database.getReferralPartners();
    const payouts = await Database.getAllReferralPayouts();
    const recentClicks = await Database.getRecentReferralClicks(150);

    // Compute live stats for each partner
    const partnersWithStats = await Promise.all(
      partners.map(async (partner) => {
        const stats = await Database.getReferralStats(partner.id);
        return {
          id: partner.id,
          name: partner.name,
          email: partner.email,
          phone: partner.phone || '',
          referralCode: partner.referralCode,
          commissionPercent: partner.commissionPercent ?? 10,
          marketingPlatforms: partner.platforms || [],
          socialLinks: partner.socialLinks || {},
          marketingStrategy: partner.marketingStrategy || '',
          payoutMethod: partner.payoutMethod || '',
          payoutDetails: partner.payoutDetails || '',
          status: partner.status || 'active',
          createdAt: partner.createdAt,
          stats: stats || {
            totalClicks: 0,
            totalReferredCustomers: 0,
            activePayingCustomers: 0,
            trialCustomers: 0,
            monthlyRecurringCommission: 0,
            totalEarningsToDate: 0,
            pendingPayout: 0,
            customers: [],
          },
        };
      })
    );

    // Aggregate overall platform numbers
    const summary = {
      totalPartners: partners.length,
      activePartners: partners.filter((p) => (p.status || 'active') === 'active').length,
      totalClicks: partnersWithStats.reduce((sum, p) => sum + (p.stats.totalClicks || 0), 0),
      totalReferredCustomers: partnersWithStats.reduce((sum, p) => sum + (p.stats.totalReferredCustomers || 0), 0),
      activePayingCustomers: partnersWithStats.reduce((sum, p) => sum + (p.stats.activePayingCustomers || 0), 0),
      monthlyRecurringCommission: partnersWithStats.reduce((sum, p) => sum + (p.stats.monthlyRecurringCommission || 0), 0),
      totalEarningsToDate: partnersWithStats.reduce((sum, p) => sum + (p.stats.totalEarningsToDate || 0), 0),
      pendingPayoutsAmount: payouts.filter((p) => p.status === 'pending').reduce((sum, p) => sum + (p.amount || 0), 0),
      pendingPayoutsCount: payouts.filter((p) => p.status === 'pending').length,
    };

    // Attach partner details to payouts
    const enrichedPayouts = payouts.map((p) => {
      const partner = partners.find((pt) => pt.id === p.partnerId);
      return {
        ...p,
        partnerName: partner?.name || 'Unknown Partner',
        partnerEmail: partner?.email || 'unknown@example.com',
        referralCode: partner?.referralCode || '',
      };
    });

    return NextResponse.json({
      success: true,
      summary,
      partners: partnersWithStats,
      payouts: enrichedPayouts,
      recentClicks,
    });
  } catch (error: any) {
    console.error('[Master Referrals API Error]', error);
    return NextResponse.json({ error: error.message || 'Failed to load referral data' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const denied = await denyUnlessMaster(req);
  if (denied) return denied;

  try {
    const body = await req.json().catch(() => ({}));
    const { action, payoutId, status, notes, partnerId, partnerStatus } = body;

    if (action === 'update_payout' && payoutId && status) {
      const res = await Database.updateReferralPayoutStatus(payoutId, status, notes);
      if (!res.success) {
        return NextResponse.json({ error: res.error || 'Failed to update payout' }, { status: 400 });
      }
      return NextResponse.json({ success: true, payout: res.payout });
    }

    if (action === 'update_partner_status' && partnerId && partnerStatus) {
      const updated = await Database.updateReferralPartner(partnerId, { status: partnerStatus });
      if (!updated) {
        return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, partner: updated });
    }

    return NextResponse.json({ error: 'Invalid action or parameters' }, { status: 400 });
  } catch (error: any) {
    console.error('[Master Referrals Action Error]', error);
    return NextResponse.json({ error: error.message || 'Action failed' }, { status: 500 });
  }
}
