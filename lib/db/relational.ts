/**
 * Relational layer for the 6 high-frequency transactional collections.
 *
 * Activated via DB_RELATIONAL_MODE=true. All functions accept and return
 * the same TypeScript shapes as the Database.* blob-path methods so call
 * sites in index.ts can switch cleanly between the two paths.
 *
 * Requires: schema-relational-v2.sql has been run against the database.
 */

import { Pool, PoolClient } from 'pg';
import { getPostgresPool } from './postgres';
import type {
  MessageData,
  ConversationData,
  LeadData,
  AppointmentData,
  InAppNotificationData,
  UnansweredQueryData,
} from './index';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pool(): Pool | null {
  return getPostgresPool();
}

async function withPool<T>(fn: (client: PoolClient) => Promise<T>): Promise<T | null> {
  const pg = pool();
  if (!pg) return null;
  const client = await pg.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

export async function relationalInsertMessage(msg: MessageData): Promise<boolean> {
  const result = await withPool(async (client) => {
    await client.query(
      `INSERT INTO kortex_messages
         (id, conversation_id, role, content, citations, tokens_used, sender_name, attachment, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO NOTHING`,
      [
        msg.id,
        msg.conversationId,
        msg.role,
        msg.content,
        JSON.stringify(msg.citations ?? []),
        msg.tokensUsed ?? 0,
        msg.senderName ?? null,
        msg.attachment ? JSON.stringify(msg.attachment) : null,
        msg.createdAt,
      ]
    );
    return true;
  });
  return result === true;
}

export async function relationalGetMessagesByConversation(
  conversationId: string
): Promise<MessageData[]> {
  const result = await withPool(async (client) => {
    const { rows } = await client.query<{
      id: string;
      conversation_id: string;
      role: string;
      content: string;
      citations: any;
      tokens_used: number;
      sender_name: string | null;
      attachment: any;
      created_at: string;
    }>(
      `SELECT id, conversation_id, role, content, citations, tokens_used, sender_name, attachment, created_at
       FROM kortex_messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC`,
      [conversationId]
    );
    return rows.map((r) => ({
      id: r.id,
      conversationId: r.conversation_id,
      role: r.role as MessageData['role'],
      content: r.content,
      citations: Array.isArray(r.citations) ? r.citations : [],
      tokensUsed: r.tokens_used,
      ...(r.sender_name ? { senderName: r.sender_name } : {}),
      ...(r.attachment ? { attachment: r.attachment } : {}),
      createdAt: r.created_at,
    }));
  });
  return result ?? [];
}

// ---------------------------------------------------------------------------
// Conversations
// ---------------------------------------------------------------------------

function convToRow(conv: ConversationData) {
  return [
    conv.id,
    conv.assistantId,
    conv.visitorId ?? null,
    conv.visitorEmail ?? null,
    conv.visitorName ?? null,
    conv.sentiment ?? null,
    conv.escalated ?? false,
    conv.resolved ?? false,
    conv.isLiveTakeover ?? false,
    conv.assignedAgentName ?? null,
    conv.status ?? 'bot',
    conv.createdAt,
    conv.updatedAt ?? conv.createdAt,
  ];
}

function rowToConv(r: Record<string, any>): ConversationData {
  return {
    id: r.id,
    assistantId: r.assistant_id,
    visitorId: r.visitor_id ?? undefined,
    visitorEmail: r.visitor_email ?? undefined,
    visitorName: r.visitor_name ?? undefined,
    sentiment: r.sentiment ?? undefined,
    escalated: r.escalated ?? false,
    resolved: r.resolved ?? false,
    isLiveTakeover: r.is_live_takeover ?? false,
    assignedAgentName: r.assigned_agent_name ?? undefined,
    status: r.status ?? 'bot',
    createdAt: r.created_at,
    updatedAt: r.updated_at ?? undefined,
  };
}

export async function relationalUpsertConversation(conv: ConversationData): Promise<boolean> {
  const result = await withPool(async (client) => {
    await client.query(
      `INSERT INTO kortex_conversations
         (id, assistant_id, visitor_id, visitor_email, visitor_name,
          sentiment, escalated, resolved, is_live_takeover, assigned_agent_name,
          status, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       ON CONFLICT (id) DO UPDATE SET
         assistant_id        = EXCLUDED.assistant_id,
         visitor_id          = EXCLUDED.visitor_id,
         visitor_email       = EXCLUDED.visitor_email,
         visitor_name        = EXCLUDED.visitor_name,
         sentiment           = EXCLUDED.sentiment,
         escalated           = EXCLUDED.escalated,
         resolved            = EXCLUDED.resolved,
         is_live_takeover    = EXCLUDED.is_live_takeover,
         assigned_agent_name = EXCLUDED.assigned_agent_name,
         status              = EXCLUDED.status,
         updated_at          = EXCLUDED.updated_at`,
      convToRow(conv)
    );
    return true;
  });
  return result === true;
}

export async function relationalUpdateConversation(
  id: string,
  patch: Partial<ConversationData>
): Promise<boolean> {
  const sets: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (patch.assistantId !== undefined) { sets.push(`assistant_id = $${idx++}`); values.push(patch.assistantId); }
  if (patch.visitorEmail !== undefined) { sets.push(`visitor_email = $${idx++}`); values.push(patch.visitorEmail); }
  if (patch.visitorName !== undefined) { sets.push(`visitor_name = $${idx++}`); values.push(patch.visitorName); }
  if (patch.sentiment !== undefined) { sets.push(`sentiment = $${idx++}`); values.push(patch.sentiment); }
  if (patch.escalated !== undefined) { sets.push(`escalated = $${idx++}`); values.push(patch.escalated); }
  if (patch.resolved !== undefined) { sets.push(`resolved = $${idx++}`); values.push(patch.resolved); }
  if (patch.isLiveTakeover !== undefined) { sets.push(`is_live_takeover = $${idx++}`); values.push(patch.isLiveTakeover); }
  if (patch.assignedAgentName !== undefined) { sets.push(`assigned_agent_name = $${idx++}`); values.push(patch.assignedAgentName); }
  if (patch.status !== undefined) { sets.push(`status = $${idx++}`); values.push(patch.status); }

  sets.push(`updated_at = $${idx++}`);
  values.push(new Date().toISOString());
  values.push(id);

  if (sets.length === 0) return false;

  const result = await withPool(async (client) => {
    const res = await client.query(
      `UPDATE kortex_conversations SET ${sets.join(', ')} WHERE id = $${idx}`,
      values
    );
    return (res.rowCount ?? 0) > 0;
  });
  return result === true;
}

export async function relationalGetConversationById(
  id: string
): Promise<ConversationData | null> {
  const result = await withPool(async (client) => {
    const { rows } = await client.query(
      `SELECT * FROM kortex_conversations WHERE id = $1 LIMIT 1`,
      [id]
    );
    if (rows.length === 0) return null;
    return rowToConv(rows[0]);
  });
  return result ?? null;
}

export async function relationalGetConversations(
  assistantId?: string,
  limit = 500
): Promise<ConversationData[]> {
  const result = await withPool(async (client) => {
    let query: string;
    let params: any[];
    if (assistantId) {
      query = `SELECT * FROM kortex_conversations WHERE assistant_id = $1 ORDER BY updated_at DESC LIMIT $2`;
      params = [assistantId, limit];
    } else {
      query = `SELECT * FROM kortex_conversations ORDER BY updated_at DESC LIMIT $1`;
      params = [limit];
    }
    const { rows } = await client.query(query, params);
    return rows.map(rowToConv);
  });
  return result ?? [];
}

// ---------------------------------------------------------------------------
// Leads
// ---------------------------------------------------------------------------

export async function relationalInsertLead(lead: LeadData): Promise<boolean> {
  const result = await withPool(async (client) => {
    await client.query(
      `INSERT INTO kortex_leads (id, assistant_id, email, name, phone, notes, custom_data, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [
        lead.id,
        lead.assistantId,
        lead.email,
        lead.name ?? null,
        lead.phone ?? null,
        lead.notes ?? null,
        lead.customData ? JSON.stringify(lead.customData) : null,
        lead.createdAt,
      ]
    );
    return true;
  });
  return result === true;
}

export async function relationalGetLeads(assistantId?: string): Promise<LeadData[]> {
  const result = await withPool(async (client) => {
    let query: string;
    let params: any[];
    if (assistantId) {
      query = `SELECT * FROM kortex_leads WHERE assistant_id = $1 ORDER BY created_at DESC`;
      params = [assistantId];
    } else {
      query = `SELECT * FROM kortex_leads ORDER BY created_at DESC`;
      params = [];
    }
    const { rows } = await client.query(query, params);
    return rows.map((r) => ({
      id: r.id,
      assistantId: r.assistant_id,
      email: r.email,
      name: r.name ?? undefined,
      phone: r.phone ?? undefined,
      notes: r.notes ?? undefined,
      customData: r.custom_data ?? undefined,
      createdAt: r.created_at,
    }));
  });
  return result ?? [];
}

// ---------------------------------------------------------------------------
// Appointments
// ---------------------------------------------------------------------------

function aptToRow(apt: AppointmentData) {
  return [
    apt.id,
    apt.assistantId,
    apt.name,
    apt.email,
    apt.phone ?? null,
    apt.date,
    apt.timeSlot,
    apt.durationMinutes ?? 30,
    apt.status,
    apt.notes ?? null,
    apt.serviceId ?? null,
    apt.serviceName ?? null,
    apt.price ?? null,
    apt.manageToken ?? null,
    apt.cancellationReason ?? null,
    apt.landingPageName ?? null,
    apt.landingPageSlug ?? null,
    JSON.stringify(apt.remindersSent ?? {}),
    apt.createdAt,
    apt.updatedAt ?? apt.createdAt,
  ];
}

function rowToApt(r: Record<string, any>): AppointmentData {
  return {
    id: r.id,
    assistantId: r.assistant_id,
    name: r.name,
    email: r.email,
    phone: r.phone ?? undefined,
    date: r.date,
    timeSlot: r.time_slot,
    durationMinutes: r.duration_minutes ?? 30,
    status: r.status,
    notes: r.notes ?? undefined,
    serviceId: r.service_id ?? undefined,
    serviceName: r.service_name ?? undefined,
    price: r.price ?? undefined,
    manageToken: r.manage_token ?? undefined,
    cancellationReason: r.cancellation_reason ?? undefined,
    landingPageName: r.landing_page_name ?? undefined,
    landingPageSlug: r.landing_page_slug ?? undefined,
    remindersSent: r.reminders_sent ?? {},
    createdAt: r.created_at,
    updatedAt: r.updated_at ?? undefined,
  };
}

export async function relationalUpsertAppointment(apt: AppointmentData): Promise<boolean> {
  const result = await withPool(async (client) => {
    await client.query(
      `INSERT INTO kortex_appointments
         (id, assistant_id, name, email, phone, date, time_slot, duration_minutes,
          status, notes, service_id, service_name, price, manage_token,
          cancellation_reason, landing_page_name, landing_page_slug,
          reminders_sent, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
       ON CONFLICT (id) DO UPDATE SET
         status              = EXCLUDED.status,
         notes               = EXCLUDED.notes,
         cancellation_reason = EXCLUDED.cancellation_reason,
         reminders_sent      = EXCLUDED.reminders_sent,
         updated_at          = EXCLUDED.updated_at`,
      aptToRow(apt)
    );
    return true;
  });
  return result === true;
}

export async function relationalUpdateAppointment(
  id: string,
  patch: Partial<AppointmentData>
): Promise<boolean> {
  const sets: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (patch.status !== undefined) { sets.push(`status = $${idx++}`); values.push(patch.status); }
  if (patch.notes !== undefined) { sets.push(`notes = $${idx++}`); values.push(patch.notes); }
  if (patch.cancellationReason !== undefined) { sets.push(`cancellation_reason = $${idx++}`); values.push(patch.cancellationReason); }
  if (patch.date !== undefined) { sets.push(`date = $${idx++}`); values.push(patch.date); }
  if (patch.timeSlot !== undefined) { sets.push(`time_slot = $${idx++}`); values.push(patch.timeSlot); }
  if (patch.remindersSent !== undefined) { sets.push(`reminders_sent = $${idx++}`); values.push(JSON.stringify(patch.remindersSent)); }

  sets.push(`updated_at = $${idx++}`);
  values.push(new Date().toISOString());
  values.push(id);

  if (sets.length === 0) return false;

  const result = await withPool(async (client) => {
    const res = await client.query(
      `UPDATE kortex_appointments SET ${sets.join(', ')} WHERE id = $${idx}`,
      values
    );
    return (res.rowCount ?? 0) > 0;
  });
  return result === true;
}

export async function relationalGetAppointments(assistantId?: string): Promise<AppointmentData[]> {
  const result = await withPool(async (client) => {
    let query: string;
    let params: any[];
    if (assistantId) {
      query = `SELECT * FROM kortex_appointments WHERE assistant_id = $1 ORDER BY created_at DESC`;
      params = [assistantId];
    } else {
      query = `SELECT * FROM kortex_appointments ORDER BY created_at DESC`;
      params = [];
    }
    const { rows } = await client.query(query, params);
    return rows.map(rowToApt);
  });
  return result ?? [];
}

export async function relationalGetAppointmentById(id: string): Promise<AppointmentData | null> {
  const result = await withPool(async (client) => {
    const { rows } = await client.query(
      `SELECT * FROM kortex_appointments WHERE id = $1 LIMIT 1`,
      [id]
    );
    if (rows.length === 0) return null;
    return rowToApt(rows[0]);
  });
  return result ?? null;
}

export async function relationalGetAppointmentByToken(token: string): Promise<AppointmentData | null> {
  const result = await withPool(async (client) => {
    const { rows } = await client.query(
      `SELECT * FROM kortex_appointments WHERE manage_token = $1 LIMIT 1`,
      [token]
    );
    if (rows.length === 0) return null;
    return rowToApt(rows[0]);
  });
  return result ?? null;
}

export async function relationalDeleteAppointment(id: string): Promise<boolean> {
  const result = await withPool(async (client) => {
    const res = await client.query(
      `DELETE FROM kortex_appointments WHERE id = $1`,
      [id]
    );
    return (res.rowCount ?? 0) > 0;
  });
  return result === true;
}

export async function relationalGetUpcomingConfirmedAppointments(): Promise<AppointmentData[]> {
  const result = await withPool(async (client) => {
    const { rows } = await client.query(
      `SELECT * FROM kortex_appointments WHERE status = 'confirmed' ORDER BY date ASC`
    );
    return rows.map(rowToApt);
  });
  return result ?? [];
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export async function relationalInsertNotification(
  notif: InAppNotificationData
): Promise<boolean> {
  const result = await withPool(async (client) => {
    await client.query(
      `INSERT INTO kortex_notifications
         (id, assistant_id, title, message, type, metadata, read, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [
        notif.id,
        notif.assistantId ?? null,
        notif.title,
        notif.message,
        notif.type,
        notif.metadata ? JSON.stringify(notif.metadata) : null,
        notif.read ?? false,
        notif.createdAt,
      ]
    );
    return true;
  });
  return result === true;
}

export async function relationalGetNotifications(
  assistantId?: string,
  limit = 50
): Promise<InAppNotificationData[]> {
  const result = await withPool(async (client) => {
    let query: string;
    let params: any[];
    if (assistantId) {
      query = `SELECT * FROM kortex_notifications
               WHERE assistant_id = $1 OR assistant_id IS NULL
               ORDER BY created_at DESC LIMIT $2`;
      params = [assistantId, limit];
    } else {
      query = `SELECT * FROM kortex_notifications ORDER BY created_at DESC LIMIT $1`;
      params = [limit];
    }
    const { rows } = await client.query(query, params);
    return rows.map((r) => ({
      id: r.id,
      assistantId: r.assistant_id ?? undefined,
      title: r.title,
      message: r.message,
      type: r.type as InAppNotificationData['type'],
      metadata: r.metadata ?? undefined,
      read: r.read,
      createdAt: r.created_at,
    }));
  });
  return result ?? [];
}

export async function relationalMarkNotificationRead(id: string): Promise<boolean> {
  const result = await withPool(async (client) => {
    const res = await client.query(
      `UPDATE kortex_notifications SET read = true WHERE id = $1`,
      [id]
    );
    return (res.rowCount ?? 0) > 0;
  });
  return result === true;
}

export async function relationalMarkAllNotificationsRead(assistantId?: string): Promise<boolean> {
  const result = await withPool(async (client) => {
    let query: string;
    let params: any[];
    if (assistantId) {
      query = `UPDATE kortex_notifications SET read = true WHERE assistant_id = $1 OR assistant_id IS NULL`;
      params = [assistantId];
    } else {
      query = `UPDATE kortex_notifications SET read = true WHERE read = false`;
      params = [];
    }
    await client.query(query, params);
    return true;
  });
  return result === true;
}

// ---------------------------------------------------------------------------
// Unanswered Queries
// ---------------------------------------------------------------------------

export async function relationalInsertUnansweredQuery(
  uq: UnansweredQueryData
): Promise<boolean> {
  const result = await withPool(async (client) => {
    await client.query(
      `INSERT INTO kortex_unanswered_queries
         (id, assistant_id, query, visitor_id, resolved, suggested_answer, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO NOTHING`,
      [
        uq.id,
        uq.assistantId,
        uq.query,
        uq.visitorId ?? null,
        uq.resolved ?? false,
        uq.suggestedAnswer ?? null,
        uq.createdAt,
      ]
    );
    return true;
  });
  return result === true;
}

export async function relationalGetUnansweredQueries(
  assistantId: string
): Promise<UnansweredQueryData[]> {
  const result = await withPool(async (client) => {
    const { rows } = await client.query(
      `SELECT * FROM kortex_unanswered_queries
       WHERE assistant_id = $1
       ORDER BY created_at DESC
       LIMIT 500`,
      [assistantId]
    );
    return rows.map((r) => ({
      id: r.id,
      assistantId: r.assistant_id,
      query: r.query,
      visitorId: r.visitor_id ?? undefined,
      resolved: r.resolved ?? false,
      suggestedAnswer: r.suggested_answer ?? undefined,
      createdAt: r.created_at,
    }));
  });
  return result ?? [];
}

export async function relationalResolveUnansweredQuery(
  id: string,
  suggestedAnswer?: string
): Promise<boolean> {
  const result = await withPool(async (client) => {
    const res = await client.query(
      `UPDATE kortex_unanswered_queries
       SET resolved = true, suggested_answer = COALESCE($2, suggested_answer)
       WHERE id = $1`,
      [id, suggestedAnswer ?? null]
    );
    return (res.rowCount ?? 0) > 0;
  });
  return result === true;
}

export async function relationalDeleteUnansweredQuery(id: string): Promise<boolean> {
  const result = await withPool(async (client) => {
    const res = await client.query(
      `DELETE FROM kortex_unanswered_queries WHERE id = $1`,
      [id]
    );
    return (res.rowCount ?? 0) > 0;
  });
  return result === true;
}
