import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { isEmailConfigured } from '@/lib/email';

/**
 * Things that give a new account something of value (starting a trial, redeeming an access code) wait until its address is
 * confirmed. Accounts that existed before confirmation was introduced, Google sign-ins and invited team members are already
 * confirmed. And when no e-mail service is set up there is no way to deliver the link, so nothing is held back: refusing
 * would lock every new customer out over a setting only the site owner can fix.
 *
 * Returns the response to send, or null when the request may go on.
 */
export async function emailConfirmationRequired(memberId: string): Promise<NextResponse | null> {
  const member = await Database.findTeamMember(memberId);
  if (!member || member.emailVerified !== false) return null;
  if (!(await isEmailConfigured())) return null;
  return NextResponse.json(
    {
      error: `Please confirm your email address first. We sent a link to ${member.email}: open it, then try again. If it has not arrived, use "Send again" in the yellow bar at the top of the dashboard.`,
      emailVerificationRequired: true,
    },
    { status: 403 },
  );
}
