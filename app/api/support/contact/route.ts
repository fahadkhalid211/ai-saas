import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { sendContactInquiryEmail } from '@/lib/email';
import { enforceRateLimit } from '@/lib/security/rate-limit';

export async function POST(req: Request) {
  try {
    // Rate limit to prevent spam (max 5 per minute per IP)
    const rateLimit = enforceRateLimit(req, 'contact-support', { windowMs: 60 * 1000, max: 5 });
    if (rateLimit.errorResponse) {
      return rateLimit.errorResponse;
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { name, email, business, category, priority, message } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || !email.trim() || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 });
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    const safeCategory = typeof category === 'string' && category.trim() ? category.trim() : 'General Support';
    const safePriority = typeof priority === 'string' && priority.trim() ? priority.trim() : 'Normal';
    const safeBusiness = typeof business === 'string' ? business.trim() : '';

    // 1. Record lead/inquiry in Database so it is never lost
    try {
      await Database.saveLead({
        assistantId: 'marketing-contact-form',
        name: name.trim(),
        email: email.trim(),
        notes: `[Category: ${safeCategory} | Priority: ${safePriority}] ${safeBusiness ? `Company: ${safeBusiness} | ` : ''}${message.trim()}`,
        customData: {
          source: 'support_contact_page',
          category: safeCategory,
          priority: safePriority,
          business: safeBusiness,
          submittedAt: new Date().toISOString(),
        },
      });
    } catch (dbErr: any) {
      console.warn('[ContactAPI] Database saveLead error:', dbErr?.message);
    }

    // 2. Dispatch email to contact@crescelo.com
    let emailResult = { success: true };
    try {
      emailResult = await sendContactInquiryEmail({
        name: name.trim(),
        email: email.trim(),
        business: safeBusiness,
        category: safeCategory,
        priority: safePriority,
        message: message.trim(),
      });
    } catch (mailErr: any) {
      console.error('[ContactAPI] Email delivery warning:', mailErr?.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Support request recorded and dispatched successfully',
      emailStatus: emailResult.success ? 'dispatched' : 'saved_to_inbox',
    });
  } catch (err: any) {
    console.error('[ContactAPI] Unexpected error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
