/**
 * Turns a system-log row into one plain sentence a non-technical reader can follow: who did what, and how it ended.
 * The technical fields (event name, route, status, error and stack) stay on the row; this is shown next to them.
 * Pure and dependency-free, so the server (when writing and exporting) and the dashboard (for older rows) share it.
 */

export interface DescribableLog {
  event: string;
  level?: string | null;
  category?: string | null;
  message?: string | null;
  method?: string | null;
  route?: string | null;
  status?: number | null;
  durationMs?: number | null;
  role?: string | null;
  userId?: string | null;
  errorName?: string | null;
  errorMessage?: string | null;
  meta?: Record<string, any> | null;
}

/** Names the dashboard already knows (from the Customers list), used instead of ids. */
export interface LogNames {
  user?: string | null;
  workspace?: string | null;
}

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : '');
const PLAN: Record<string, string> = { starter: 'Starter', growth: 'Growth', scale: 'Agency' };
const ROLE: Record<string, string> = { owner: 'owner', admin: 'admin', support_agent: 'support agent', billing_manager: 'billing manager', viewer: 'viewer' };
const PROVIDER: Record<string, string> = { google: 'Google', microsoft: 'Microsoft', github: 'GitHub', apple: 'Apple' };

function actor(row: DescribableLog, names?: LogNames): string {
  const meta = row.meta || {};
  if (row.role === 'master' || row.userId === 'master-admin' || str(meta.actorName) === 'Master Admin') return 'The platform owner';
  if (row.role === 'support' || str(meta.actorName) === 'Crescelo Support') return 'The platform owner (support access)';
  const known = str(names?.user) || str(meta.email) || str(meta.actorName);
  if (known && known !== 'Unknown') return known;
  return row.userId ? 'A signed-in user' : 'Someone';
}

function inWorkspace(names?: LogNames): string {
  return str(names?.workspace) ? ` (workspace "${str(names?.workspace)}")` : '';
}

/** What a request to this route does, in words: [signed-in phrasing, visitor phrasing]. */
const ROUTES: Array<[RegExp, Partial<Record<string, string>>]> = [
  [/^\/api\/auth\/oauth\//, { GET: 'used "Continue with Google" to sign in' }],
  [/^\/api\/auth\/2fa/, { GET: 'opened the two-factor settings', POST: 'changed the two-factor settings' }],
  [/^\/api\/auth$/, { GET: 'opened the app (session check)', POST: 'tried to sign in or register', DELETE: 'signed out' }],
  [/^\/api\/master\/auth/, { POST: 'tried to sign in to the master account' }],
  [/^\/api\/master\/customers/, { GET: 'opened the Customers list' }],
  [/^\/api\/master\/support-access/, { POST: 'opened a customer account for support', DELETE: 'left a customer account' }],
  [/^\/api\/master\/logs\/export/, { GET: 'downloaded the system log' }],
  [/^\/api\/master\/logs/, { GET: 'opened the system log' }],
  [/^\/api\/master\/access-codes/, { GET: 'opened the access codes', POST: 'made an access code', PATCH: 'switched an access code on or off', DELETE: 'deleted an access code' }],
  [/^\/api\/assistants\/\[id\]\/spend/, { GET: 'checked the AI spend of an assistant' }],
  [/^\/api\/assistants\/\[id\]/, { GET: 'opened an assistant', PUT: 'saved assistant settings', DELETE: 'deleted an assistant' }],
  [/^\/api\/assistants/, { GET: 'loaded their assistants', POST: 'created an assistant' }],
  [/^\/api\/connectors\/verify/, { POST: 'tested an AI key or connection' }],
  [/^\/api\/chat/, { POST: 'A website visitor sent a chat message' }],
  [/^\/api\/conversations/, { GET: 'opened the conversations', POST: 'replied in a conversation', PATCH: 'updated a conversation', DELETE: 'deleted a conversation' }],
  [/^\/api\/knowledge\/upload/, { POST: 'uploaded a file to the knowledge base' }],
  [/^\/api\/knowledge\/url/, { POST: 'added a web page to the knowledge base' }],
  [/^\/api\/knowledge\/extract/, { POST: 'previewed a file or link for the knowledge base' }],
  [/^\/api\/knowledge/, { GET: 'opened the knowledge base', DELETE: 'removed a knowledge source', PUT: 'edited a knowledge source', PATCH: 'edited a knowledge source' }],
  [/^\/api\/billing\/redeem/, { POST: 'entered an access code' }],
  [/^\/api\/billing\/checkout/, { POST: 'started checkout for a plan' }],
  [/^\/api\/billing\/early-bird/, { POST: 'started a free trial without a card' }],
  [/^\/api\/billing\/portal/, { POST: 'opened the billing portal' }],
  [/^\/api\/billing\/webhook|^\/api\/stripe/, { POST: 'The payment provider sent an update' }],
  [/^\/api\/billing/, { GET: 'checked their plan', POST: 'changed their plan', PUT: 'updated billing details' }],
  [/^\/api\/lead/, { GET: 'opened the leads', POST: 'A website visitor left their contact details', DELETE: 'deleted a lead' }],
  [/^\/api\/appointments/, { GET: 'opened the appointments', POST: 'A booking was requested', PATCH: 'updated an appointment', PUT: 'updated an appointment', DELETE: 'deleted an appointment' }],
  [/^\/api\/audit/, { GET: 'opened the audit trail' }],
  [/^\/api\/team/, { GET: 'opened the team list', POST: 'invited a team member', PUT: 'changed a team member', PATCH: 'changed a team member', DELETE: 'removed a team member' }],
  [/^\/api\/profile\/tour/, { POST: 'was shown the product tour' }],
  [/^\/api\/profile/, { GET: 'opened their profile', PATCH: 'updated their profile or password' }],
  [/^\/api\/analytics/, { GET: 'opened the analytics' }],
  [/^\/api\/notifications/, { GET: 'checked for notifications', POST: 'marked notifications as read' }],
  [/^\/api\/landing-page/, { GET: 'opened the landing pages', POST: 'saved a landing page', PUT: 'saved a landing page', DELETE: 'deleted a landing page' }],
  [/^\/api\/support\/tickets/, { GET: 'opened support tickets', POST: 'sent a support ticket' }],
  [/^\/api\/email\/test/, { GET: 'checked the e-mail settings', POST: 'sent a test e-mail' }],
  [/^\/api\/widget/, { GET: 'A website loaded the chat widget', POST: 'The chat widget reported an event' }],
  [/^\/api\/cron\//, { GET: 'A scheduled background job ran', POST: 'A scheduled background job ran' }],
  [/^\/api\/db-status/, { GET: 'checked the database connection' }],
  [/^\/api\/health/, { GET: 'A health check ran' }],
  [/^\/api\/channels|^\/api\/telegram|^\/api\/whatsapp/, { POST: 'A messaging channel delivered a message', GET: 'A messaging channel checked in' }],
  [/^\/api\/voice/, { POST: 'A phone call event arrived', GET: 'A phone call event arrived' }],
];

function outcome(status: number | null | undefined): string {
  if (status == null) return '';
  if (status >= 200 && status < 300) return 'It worked.';
  if (status >= 300 && status < 400) return 'They were sent on to the next page.';
  switch (status) {
    case 400:
      return 'It was rejected: something in the request was missing or not valid.';
    case 401:
      return 'It was refused: not signed in, or the session had ended.';
    case 402:
      return 'It was refused: the workspace has no active plan.';
    case 403:
      return 'It was refused: this account is not allowed to do that.';
    case 404:
      return 'Nothing was found at that address.';
    case 409:
      return 'It was refused: it conflicts with something that already exists.';
    case 413:
      return 'It was rejected: the file or message was too large.';
    case 429:
      return 'It was refused: too many requests in a short time.';
    default:
      return status >= 500 ? 'It failed because of an error on the server.' : `It was refused (status ${status}).`;
  }
}

function describeRequest(row: DescribableLog, names?: LogNames): string {
  const method = (row.method || 'GET').toUpperCase();
  const route = row.route || '';
  let action = '';
  for (const [pattern, verbs] of ROUTES) {
    if (pattern.test(route)) {
      action = verbs[method] || '';
      break;
    }
  }
  const anonymous = !row.userId;
  let sentence: string;
  if (action && /^[A-Z]/.test(action)) sentence = `${action}.`; // already a full subject ("A website visitor ...")
  else if (action) sentence = `${anonymous ? 'Someone not signed in' : actor(row, names)} ${action}${inWorkspace(names)}.`;
  else sentence = `${anonymous ? 'Someone not signed in' : actor(row, names)} made a ${method} request to ${route || 'the server'}.`;
  const slow = typeof row.durationMs === 'number' && row.durationMs >= 3000 ? ` It took ${(row.durationMs / 1000).toFixed(1)} seconds.` : '';
  // failed requests carry the error text the caller was shown
  const reason = (row.status ?? 0) >= 400 && str(row.message) ? ` They were told: "${str(row.message)}"` : '';
  return `${sentence} ${outcome(row.status)}${reason}${slow}`.trim();
}

type Describer = (who: string, d: Record<string, any>, row: DescribableLog, names?: LogNames) => string;

const EVENTS: Record<string, Describer> = {
  // accounts and sign-in
  'auth.tenant_registered': (who, d, _r, n) => `New sign-up: ${str(d.email) || who} created an account and the workspace "${str(d.businessName) || str(n?.workspace) || 'unnamed'}".`,
  'auth.oauth_provisioned': (who, d, _r, n) => `New sign-up: ${who} created an account with ${PROVIDER[str(d.provider)] || 'a social login'}${inWorkspace(n)}.`,
  'auth.oauth_login': (who, d) => `${who} signed in with ${PROVIDER[str(d.provider)] || 'a social login'}.`,
  'auth.oauth_2fa_challenge': (who) => `${who} signed in with a social login and was asked for their two-factor code.`,
  'auth.tenant_login_success': (who) => `${who} signed in.`,
  'auth.staff_login_success': (who) => `${who} (team member) signed in.`,
  'auth.login_success': (who) => `${who} signed in.`,
  'auth.login_failed': (who, d) => `A sign-in failed for ${str(d.attemptedEmail) || str(d.email) || who}: wrong e-mail or password${str(d.reason) ? ` (${str(d.reason)})` : ''}.`,
  'auth.2fa_failed': (who) => `${who} entered a wrong two-factor code while signing in.`,
  'auth.master_admin_login_success': () => 'The platform owner signed in to the master account.',
  'auth.master_admin_login_failed': () => 'Someone tried to sign in to the master account and failed.',
  'master.support_access_started': (_w, d) => `The platform owner opened the workspace "${str(d.workspaceName) || str(d.targetWorkspaceId)}" for support.`,
  'master.support_access_ended': () => 'The platform owner left the customer workspace and returned to the master account.',
  'support.access_started': () => 'Crescelo Support opened this workspace to troubleshoot it.',
  'support.access_ended': () => 'Crescelo Support left this workspace.',
  'security.2fa_enabled': (who) => `${who} turned on two-factor sign-in.`,
  'security.2fa_disabled': (who) => `${who} turned off two-factor sign-in.`,
  'profile.updated': (who) => `${who} updated their profile.`,
  'team.member_invited': (who, d) => `${who} invited ${str(d.email) || 'a new team member'} as ${ROLE[str(d.role)] || 'a team member'}.`,
  'team.member_removed': (who, d) => `${who} removed ${str(d.email) || str(d.name) || 'a team member'} from the team.`,
  'team.member_updated': (who, d) => `${who} changed the team member ${str(d.email) || str(d.name) || ''}`.trim() + '.',

  // plans and payments
  'billing.access_code_redeemed': (who, d) => `${who} used the access code ${str(d.code)}: ${PLAN[str(d.planId)] || 'a'} plan, ${Number(d.days) > 0 ? `free for ${d.days} days` : 'free with no end date'}.`,
  'billing.checkout_initiated': (who, d) => `${who} started checkout for the ${PLAN[str(d.planId)] || str(d.planName) || 'selected'} plan.`,
  'billing.early_bird_trial_started': (who, d) => `${who} started a free trial without a card (${PLAN[str(d.planId)] || 'plan'}).`,
  'billing.plan_changed': (who, d) => `${who} changed the plan to ${str(d.newPlanName) || PLAN[str(d.newPlanId)] || 'a new plan'}.`,
  'billing.info_updated': (who) => `${who} updated the billing details.`,
  'billing.addon_purchased': (who) => `${who} bought an add-on.`,
  'billing.subscription_updated': (_w, d) => `The payment provider reported a subscription change${str(d.status) ? ` (now ${str(d.status)})` : ''}.`,
  'billing.subscription_ended': () => 'A subscription ended. The workspace is paused until a plan is chosen again.',
  'billing.payment_failed': () => 'A payment failed. The payment provider will try the card again.',
  'billing.service_paused': () => 'A website visitor was turned away: this workspace has no active plan, so its assistant is paused.',
  'billing.trial_card_reused': () => 'A trial was refused: the card had already been used for a free trial.',
  'billing.stripe_not_configured': () => 'A checkout could not start because card payments are not connected on the server.',
  'billing.webhook_received': (_w, d) => `The payment provider sent an update${str(d.type) ? ` (${str(d.type)})` : ''}.`,

  // assistants and knowledge
  'assistant.created': (who, d) => `${who} created the assistant "${str(d.name) || 'unnamed'}".`,
  'assistant.updated': (who, d) => `${who} saved settings for the assistant "${str(d.name) || 'unnamed'}"${str(d.provider) ? ` (AI engine: ${str(d.provider)}${str(d.modelName) ? `, ${str(d.modelName)}` : ''})` : ''}.`,
  'assistant.deleted': (who, d) => `${who} deleted the assistant "${str(d.name) || 'unnamed'}".`,
  'knowledge.uploaded': (who, d) => {
    const titles = Array.isArray(d.titles) ? d.titles.filter(Boolean).slice(0, 3).join(', ') : '';
    return `${who} uploaded ${Number(d.sourcesCount) || 1} file${Number(d.sourcesCount) === 1 || !d.sourcesCount ? '' : 's'} to the knowledge base${titles ? `: ${titles}` : ''}.`;
  },
  'knowledge.scraped': (who, d) => `${who} added the web page ${str(d.url) || str(d.title)} to the knowledge base.`,
  'knowledge.deleted': (who, d) => `${who} removed "${str(d.title) || 'a source'}" from the knowledge base.`,
  'knowledge.corrected': (who) => `${who} corrected an answer in the knowledge base.`,
  'landing_page.deleted': (who) => `${who} deleted a landing page.`,
  'settings.smtp_updated': (who) => `${who} changed the e-mail sending settings.`,
  'mcp.token.created': (who) => `${who} created an access token for external tools.`,
  'mcp.token.revoked': (who) => `${who} revoked an access token for external tools.`,

  // visitors
  'lead.captured': (_w, d) => `A website visitor left their contact details${str(d.name) || str(d.email) ? `: ${[str(d.name), str(d.email)].filter(Boolean).join(', ')}` : ''}.`,
  'lead.deleted': (who) => `${who} deleted a lead.`,
  'appointment.created': (_w, d) => `A booking was made${str(d.serviceName) ? ` for ${str(d.serviceName)}` : ''}${str(d.date) ? ` on ${str(d.date)}${str(d.timeSlot) ? ` at ${str(d.timeSlot)}` : ''}` : ''}.`,
  'appointment.status_updated': (who, d) => `${who} marked an appointment as ${str(d.status) || str(d.newStatus) || 'updated'}.`,
  'appointment.deleted': (who) => `${who} deleted an appointment.`,
  'booking.created': () => 'A booking was made through the assistant.',
  'booking.slot_conflict': () => 'A booking was refused because that time slot had just been taken.',
  'support.ticket_updated': (who) => `${who} updated a support ticket.`,

  // AI
  'llm.completion': (_w, d, row) => `The assistant answered a visitor using ${str(d.provider) || 'the AI engine'}${str(d.model) ? ` (${str(d.model)})` : ''}${typeof row.durationMs === 'number' ? ` in ${(row.durationMs / 1000).toFixed(1)} seconds` : ''}${d.costCap === 'fallback' ? '. The monthly cost cap was reached, so the free model was used' : d.costCap === 'blocked' ? '. The monthly cost cap was reached, so no AI reply was sent' : ''}.`,
  'llm.provider_error': (_w, d) => `The AI engine ${str(d.provider) || ''} could not answer a visitor (wrong key, no connection, or the provider refused).`.replace('  ', ' '),
  'llm.stream_failed': () => 'An AI answer broke off part-way and could not be completed.',
  'rag.retrieval': (_w, d) => `The assistant searched the knowledge base for an answer${typeof d.chunks === 'number' ? ` and found ${d.chunks} matching passage${d.chunks === 1 ? '' : 's'}` : ''}.`,
  'rag.abstain': () => 'The assistant did not know the answer and offered the visitor a booking or a live agent instead.',

  // platform health
  'db.slow_state_load': (_w, _d, row) => `Loading the account data was slow${typeof row.durationMs === 'number' ? ` (${Math.round(row.durationMs)} ms)` : ''}. This usually happens when a server instance has just started.`,
  'db.slow_state_read': (_w, _d, row) => `Reading the account data was slow${typeof row.durationMs === 'number' ? ` (${Math.round(row.durationMs)} ms)` : ''}.`,
  'db.slow_state_write': (_w, _d, row) => `Saving the account data was slow${typeof row.durationMs === 'number' ? ` (${Math.round(row.durationMs)} ms)` : ''}.`,
  'db.postgres_unavailable': () => 'The database could not be reached. The app is retrying.',
  'security.rate_limited': () => 'Requests were blocked for a while because too many arrived from one address in a short time.',
  'security.invalid_signature': () => 'An incoming message was rejected because its signature did not match (it may not be from the real sender).',
  'security.csp_violation': () => "A browser blocked something on a page because the site's security rules do not allow it.",
  'webhook.outbound': () => 'An event was sent to a connected app (webhook).',
  'webhook.outbound_failed': () => 'Sending an event to a connected app (webhook) failed.',
  'cron.reminders_run': () => 'The scheduled job that sends appointment reminders ran.',
  'cron.log_retention': () => 'The scheduled job that deletes old log entries ran.',
  'alerts.email_sent': () => 'An error alert e-mail was sent to the platform owner.',
  'alerts.email_failed': () => 'An error alert e-mail could not be sent.',
  'alerts.email_not_configured': () => 'An error alert could not be e-mailed because no e-mail service is set up.',
  'admin.logs_exported': (_w, d) => `The platform owner downloaded the system log${d.rows != null ? ` (${d.rows} rows)` : ''}.`,
  'console.capture_throttled': (_w, d) => `Some repeated error messages were left out of the log to keep it readable${d.dropped != null ? ` (${d.dropped} skipped)` : ''}.`,
  'http.unhandled_exception': () => 'A request crashed with an unexpected error on the server.',
};

/** The technical cause in one short line, when the row carries an error. */
export function technicalLine(row: DescribableLog): string {
  const name = str(row.errorName);
  const msg = str(row.errorMessage);
  if (!name && !msg) return '';
  return `${name || 'Error'}${msg ? `: ${msg}` : ''}`.slice(0, 300);
}

export function describeLog(row: DescribableLog, names?: LogNames): string {
  try {
    const meta = row.meta || {};
    const details = (meta.details && typeof meta.details === 'object' ? meta.details : meta) as Record<string, any>;
    if (row.event === 'http.request') return describeRequest(row, names);
    const describer = EVENTS[row.event];
    if (describer) return describer(actor(row, names), details, row, names);
    if (row.event === 'console.error' || row.event === 'console.warn') {
      const text = str(row.message) || str(row.errorMessage);
      return `The server reported ${row.event === 'console.error' ? 'an error' : 'a warning'}${text ? `: ${text.split('\n')[0].slice(0, 200)}` : '.'}`;
    }
    if (str(row.message)) return str(row.message);
    // an event nobody has written a sentence for yet: make the code readable
    const [area, ...rest] = row.event.split('.');
    const what = rest.join(' ').replace(/_/g, ' ') || 'event';
    return `${actor(row, names)}: ${area.replace(/_/g, ' ')} ${what}.`;
  } catch {
    return str(row.message) || row.event;
  }
}
