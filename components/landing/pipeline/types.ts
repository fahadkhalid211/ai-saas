export type SubsystemCategory =
  | 'ingress'
  | 'vector_space'
  | 'cognitive_core'
  | 'tools'
  | 'egress';

export interface TopologyNode {
  id: string;
  label: string;
  category: SubsystemCategory;
  badge: string;
  x: number;
  y: number;
  color: string;
  description: string;
  technicalSpec: string;
  telemetryMetrics: Array<{ label: string; value: string }>;
  samplePayload?: string;
  radarArc?: boolean;
}

export interface VectorClusterInfo {
  id: string;
  name: string;
  itemCount: string;
  dimension: string;
  cx: number;
  cy: number;
  color: string;
  docs: string[];
}

export interface TopologyWire {
  id: string;
  sourceId: string;
  targetId: string;
  color: string;
  pulseSpeed?: number;
  curveType?: 'direct' | 'curved';
  activeInScenarios?: Array<'booking' | 'lead' | 'grounded_rag'>;
}

export interface PipelineScenarioData {
  id: 'booking' | 'lead' | 'grounded_rag';
  tabName: string;
  badge: string;
  inboundText: string;
  primaryPath: string[]; // Active node/cluster IDs
  outcome: {
    title: string;
    summary: string;
    metrics: Array<{ label: string; value: string }>;
  };
}

// Coordinated for 1200 x 640 blueprint viewport
export const TOPOLOGY_NODES: TopologyNode[] = [
  // Left: Ingress Channels (X = 140)
  {
    id: 'ing_widget',
    label: 'Website Widget',
    category: 'ingress',
    badge: 'Live Session',
    x: 140,
    y: 110,
    color: '#06b6d4',
    radarArc: true,
    description: 'Embedded client floating messenger handling realtime visitor conversations.',
    technicalSpec: 'Vanilla JS bundle (<42KB), postMessage iframe bridge, local session token.',
    telemetryMetrics: [
      { label: 'Transport', value: 'SSE / Stream' },
      { label: 'Avg TTFT', value: '380ms' },
    ],
    samplePayload: '{"event": "message", "sessionId": "sess_8f2a1b", "channel": "widget"}',
  },
  {
    id: 'ing_whatsapp',
    label: 'WhatsApp API',
    category: 'ingress',
    badge: 'Omnichannel',
    x: 140,
    y: 190,
    color: '#10b981',
    radarArc: true,
    description: 'Cloud API webhook ingestion for inbound mobile customer inquiries.',
    technicalSpec: 'HMAC SHA-256 signature verification, idempotent deduplication buffer.',
    telemetryMetrics: [
      { label: 'Webhook SLA', value: '<120ms' },
      { label: 'Protocol', value: 'HTTPS POST' },
    ],
    samplePayload: '{"object": "whatsapp_business_account", "entry": [{"id": "wa_99182"}]}',
  },
  {
    id: 'ing_telegram',
    label: 'Telegram Bot',
    category: 'ingress',
    badge: 'Direct Bot',
    x: 140,
    y: 270,
    color: '#38bdf8',
    radarArc: true,
    description: 'Instant bot dispatcher for customer service channels and escalations.',
    technicalSpec: 'X-Telegram-Bot-Api-Secret-Token validation, automatic duplicate filter.',
    telemetryMetrics: [
      { label: 'Secret Token', value: 'SHA256 Validated' },
      { label: 'Latency', value: '95ms' },
    ],
    samplePayload: '{"update_id": 982144, "message": {"chat": {"id": 4810294}}}',
  },
  {
    id: 'ing_docs',
    label: 'Document Upload',
    category: 'ingress',
    badge: 'PDF / DOCX',
    x: 140,
    y: 350,
    color: '#818cf8',
    radarArc: false,
    description: 'Multi-document ingestion extracting text passages, policies, and schedules.',
    technicalSpec: 'Recursive chunking (500 tokens, 100 overlap), URL sanitization.',
    telemetryMetrics: [
      { label: 'Chunk Size', value: '500 tokens' },
      { label: 'Overlap', value: '100 tokens' },
    ],
    samplePayload: '{"source": "policies_2026.pdf", "chunks": 42, "checksum": "a7b8e1"}',
  },
  {
    id: 'ing_scraper',
    label: 'Live Web Scraper',
    category: 'ingress',
    badge: 'URL Indexing',
    x: 140,
    y: 430,
    color: '#a78bfa',
    radarArc: false,
    description: 'Automated crawler scraping public website pages, FAQs, and price lists.',
    technicalSpec: 'DOM content extraction, Markdown normalization, change detection hash.',
    telemetryMetrics: [
      { label: 'Extraction', value: 'Semantic DOM' },
      { label: 'Refresh', value: 'Auto-Sync' },
    ],
    samplePayload: '{"url": "https://acme.com/pricing", "status": 200, "pagesIndexed": 12}',
  },
  {
    id: 'ing_youtube',
    label: 'Audio Transcripts',
    category: 'ingress',
    badge: 'Whisper / OCR',
    x: 140,
    y: 510,
    color: '#f43f5e',
    radarArc: false,
    description: 'Multimodal transcript pipeline converting video and audio files into chunks.',
    technicalSpec: 'Time-aligned subtitle parser, multi-language caption alignment.',
    telemetryMetrics: [
      { label: 'Model', value: 'Whisper Large' },
      { label: 'Accuracy', value: 'High Fidelity' },
    ],
    samplePayload: '{"videoId": "OKsaF_AasDA", "segments": 38, "durationSec": 840}',
  },

  // Focus Query Beacon: INTENT RADAR (Center: X = 610, Y = 260)
  {
    id: 'beacon_intent',
    label: "INTENT RADAR",
    category: 'cognitive_core',
    badge: 'Signal Ingestion',
    x: 610,
    y: 260,
    color: '#f59e0b',
    description: 'Real-time query normalization extracting booking times, phone numbers, and intent.',
    technicalSpec: 'Low-latency classification layer extracting temporal entities and contact regex.',
    telemetryMetrics: [
      { label: 'Entity Match', value: 'Named Entity & Regex' },
      { label: 'Confidence', value: '99.4%' },
    ],
    samplePayload: '{"intent": "APPOINTMENT_RESERVATION", "time": "10:00 AM", "date": "tomorrow"}',
  },

  // Center-Right: Cognitive Reasoning Hub & Satellites (X = 780, Y = 260)
  {
    id: 'core_reasoning',
    label: 'Orchestration Core',
    category: 'cognitive_core',
    badge: 'Multi-LLM Hub',
    x: 780,
    y: 260,
    color: '#a855f7',
    description: 'Cognitive reasoning engine cascading across Groq, Gemini Flash, or wholesale BYOK keys.',
    technicalSpec: 'Cascading failover with zero-markup BYOK; dynamic system prompt injection.',
    telemetryMetrics: [
      { label: 'Engine', value: 'Cascading Multi-Cloud' },
      { label: 'Markup', value: '0% Wholesale' },
    ],
    samplePayload: '{"model": "groq/llama-3.3-70b-versatile", "temperature": 0.2, "max_tokens": 512}',
  },
  {
    id: 'core_grounder',
    label: 'Factual Firebreak',
    category: 'cognitive_core',
    badge: 'Anti-Hallucination',
    x: 780,
    y: 150,
    color: '#ec4899',
    description: 'Grounds every token strictly in retrieved document context, rejecting ungrounded speculation.',
    technicalSpec: 'Cross-encoder citation verification; prompts refusal if similarity is below threshold.',
    telemetryMetrics: [
      { label: 'Grounding Mode', value: 'Strict Citations' },
      { label: 'Threshold', value: '0.65 Cosine' },
    ],
    samplePayload: '{"citations": ["faq_sec3.md", "pricing_tier.pdf"], "verified": true}',
  },
  {
    id: 'core_escalation',
    label: 'Escalation Radar',
    category: 'cognitive_core',
    badge: 'Live Takeover',
    x: 870,
    y: 200,
    color: '#3b82f6',
    description: 'Monitors user sentiment and complexity, bridging immediately to human operators when needed.',
    technicalSpec: 'Sentiment scoring, negative valence escalation, and staff alert triggering.',
    telemetryMetrics: [
      { label: 'Trigger', value: 'Sentiment < -0.4' },
      { label: 'Bridge Time', value: '<50ms' },
    ],
    samplePayload: '{"sentiment": "neutral", "escalationNeeded": false}',
  },
  {
    id: 'core_byok',
    label: 'BYOK Engine',
    category: 'cognitive_core',
    badge: 'Zero Markup',
    x: 690,
    y: 190,
    color: '#06b6d4',
    description: 'Allows businesses to bring raw API keys directly without platform compute surcharges.',
    technicalSpec: 'AES-256 encrypted provider keys, direct proxy to OpenAI / Anthropic / Groq endpoints.',
    telemetryMetrics: [
      { label: 'Key Encryption', value: 'AES-256 GCM' },
      { label: 'Platform Tax', value: '$0.00 / token' },
    ],
    samplePayload: '{"provider": "anthropic", "endpoint": "api.anthropic.com", "cost": "raw wholesale"}',
  },

  // Bottom Center: Deterministic Tools (Y = 520)
  {
    id: 'tool_mutex',
    label: 'Booking Lock',
    category: 'tools',
    badge: 'Per-Day Lock',
    x: 680,
    y: 520,
    color: '#10b981',
    description: 'Per-day booking lock (one per assistant and day) held while a booking is checked and saved.',
    technicalSpec: 'Time-range check against bookings and linked calendars under the lock, plus a database overlap check in database mode.',
    telemetryMetrics: [
      { label: 'Lock Scope', value: 'Assistant + Day' },
      { label: 'Max Wait', value: '10s' },
    ],
    samplePayload: '{"lockKey": "lock:asst_1:2026-11-20", "status": "ACQUIRED"}',
  },
  {
    id: 'tool_db',
    label: 'Postgres State Store',
    category: 'tools',
    badge: 'Relational & Audit',
    x: 780,
    y: 520,
    color: '#059669',
    description: 'Persistent database recording conversation history, leads, appointments, and audit events.',
    technicalSpec: 'Schema validation, multi-tenant workspace isolation, BOLA access control.',
    telemetryMetrics: [
      { label: 'Storage', value: 'Relational DB' },
      { label: 'Tenant Guard', value: 'BOLA Verified' },
    ],
    samplePayload: '{"table": "appointments", "op": "INSERT", "status": "confirmed"}',
  },
  {
    id: 'tool_crm',
    label: 'CRM & Webhooks',
    category: 'tools',
    badge: 'Lead Dispatch',
    x: 880,
    y: 520,
    color: '#14b8a6',
    description: 'Outbound webhook dispatcher sending captured leads to CRM endpoints with retry backoff.',
    technicalSpec: 'Exponential retry backoff, webhook secret signing, email notification dispatch.',
    telemetryMetrics: [
      { label: 'Dispatch', value: 'Instant Push' },
      { label: 'Retry SLA', value: '3x Backoff' },
    ],
    samplePayload: '{"lead": {"name": "David Vance", "email": "david@acme.com", "phone": "555-0194"}}',
  },

  // Right: Client Egress & Deliverables (X = 1060)
  {
    id: 'egr_calendar',
    label: 'Calendar Invites',
    category: 'egress',
    badge: 'Google / Outlook',
    x: 1060,
    y: 150,
    color: '#6366f1',
    description: 'Dispatches .ics calendar attachments, Google Calendar links, and email confirmations.',
    technicalSpec: 'RFC 5545 iCalendar standard generation, UTC timestamp normalization.',
    telemetryMetrics: [
      { label: 'Formats', value: '.ics, Google, Outlook' },
      { label: 'Delivery', value: 'With the confirmation email' },
    ],
    samplePayload: '{"calendarEvent": "Appointment at Crescelo", "start": "2026-11-20T10:00:00Z"}',
  },
  {
    id: 'egr_lead_record',
    label: 'CRM Lead Record',
    category: 'egress',
    badge: 'Attributed Profile',
    x: 1060,
    y: 240,
    color: '#8b5cf6',
    description: 'Permanent lead record with full conversational transcript and attribution source.',
    technicalSpec: 'Session ID attribution, contact enrichment, and duplicate resolution.',
    telemetryMetrics: [
      { label: 'Attribution', value: '100% Traceable' },
      { label: 'Export', value: 'JSON / CSV / Webhook' },
    ],
    samplePayload: '{"leadId": "lead_9921", "contact": "david@acme.com", "status": "qualified"}',
  },
  {
    id: 'egr_staff_console',
    label: 'Staff Live Console',
    category: 'egress',
    badge: 'Chime & Push',
    x: 1060,
    y: 330,
    color: '#a855f7',
    description: 'Real-time alert in operator console with audio chime and 1-click takeover button.',
    technicalSpec: 'Browser Web Audio API chime, server-sent events notification channel.',
    telemetryMetrics: [
      { label: 'Audio Chime', value: 'Synthesized 440Hz' },
      { label: 'Takeover', value: '1-Click Active' },
    ],
    samplePayload: '{"notification": "New appointment booked for tomorrow 10:00 AM", "sound": true}',
  },
  {
    id: 'egr_stream',
    label: 'Response Stream',
    category: 'egress',
    badge: 'Sub-Second SSE',
    x: 1060,
    y: 420,
    color: '#06b6d4',
    description: 'Chunked text streaming response back to the active visitor widget.',
    technicalSpec: 'Server-Sent Events (SSE) readable stream with citation footnote attributes.',
    telemetryMetrics: [
      { label: 'Format', value: 'ReadableStream' },
      { label: 'Chunk Speed', value: '45 tokens/sec' },
    ],
    samplePayload: 'data: {"token": "Your appointment is confirmed for tomorrow at 10:00 AM."}',
  },
];

export const VECTOR_CLUSTERS: VectorClusterInfo[] = [
  {
    id: 'vc_policies',
    name: 'Policies & FAQs',
    itemCount: '124 chunks',
    dimension: '384-d',
    cx: 410,
    cy: 160,
    color: '#38bdf8',
    docs: ['Operating_Hours.md', 'Cancellation_Rules.pdf', 'Privacy_Policy.docx'],
  },
  {
    id: 'vc_services',
    name: 'Services & Catalog',
    itemCount: '86 chunks',
    dimension: '384-d',
    cx: 470,
    cy: 290,
    color: '#818cf8',
    docs: ['Service_Menu.xlsx', 'Pricing_Tiers.pdf', 'Package_Addons.md'],
  },
  {
    id: 'vc_rosters',
    name: 'Staff Rosters & Slots',
    itemCount: '48 chunks',
    dimension: '384-d',
    cx: 390,
    cy: 420,
    color: '#34d399',
    docs: ['Barber_Schedules.json', 'Doctor_Availability.ics', 'Room_Capacities.csv'],
  },
];

export const TOPOLOGY_WIRES: TopologyWire[] = [
  // Ingress -> Vector Clusters
  { id: 'w_in1_vc1', sourceId: 'ing_widget', targetId: 'vc_policies', color: '#06b6d4' },
  { id: 'w_in1_vc2', sourceId: 'ing_widget', targetId: 'vc_services', color: '#06b6d4' },
  { id: 'w_in1_vc3', sourceId: 'ing_widget', targetId: 'vc_rosters', color: '#06b6d4' },
  { id: 'w_in2_vc1', sourceId: 'ing_whatsapp', targetId: 'vc_policies', color: '#10b981' },
  { id: 'w_in2_vc3', sourceId: 'ing_whatsapp', targetId: 'vc_rosters', color: '#10b981' },
  { id: 'w_in3_vc1', sourceId: 'ing_telegram', targetId: 'vc_policies', color: '#38bdf8' },
  { id: 'w_in4_vc2', sourceId: 'ing_docs', targetId: 'vc_services', color: '#818cf8' },
  { id: 'w_in5_vc1', sourceId: 'ing_scraper', targetId: 'vc_policies', color: '#a78bfa' },
  { id: 'w_in6_vc2', sourceId: 'ing_youtube', targetId: 'vc_services', color: '#f43f5e' },

  // Vector Clusters -> Intent Beacon
  { id: 'w_vc1_beacon', sourceId: 'vc_policies', targetId: 'beacon_intent', color: '#38bdf8' },
  { id: 'w_vc2_beacon', sourceId: 'vc_services', targetId: 'beacon_intent', color: '#818cf8' },
  { id: 'w_vc3_beacon', sourceId: 'vc_rosters', targetId: 'beacon_intent', color: '#34d399' },

  // Direct Ingress -> Intent Beacon Shortcut
  { id: 'w_in1_beacon', sourceId: 'ing_widget', targetId: 'beacon_intent', color: '#38bdf8' },

  // Intent Beacon -> Orchestration Core
  { id: 'w_beacon_core', sourceId: 'beacon_intent', targetId: 'core_reasoning', color: '#f59e0b' },

  // Orchestration Core <-> Satellites
  { id: 'w_core_grounder', sourceId: 'core_reasoning', targetId: 'core_grounder', color: '#ec4899' },
  { id: 'w_core_escalate', sourceId: 'core_reasoning', targetId: 'core_escalation', color: '#3b82f6' },
  { id: 'w_core_byok', sourceId: 'core_reasoning', targetId: 'core_byok', color: '#06b6d4' },

  // Orchestration Core -> Deterministic Tools
  { id: 'w_core_mutex', sourceId: 'core_reasoning', targetId: 'tool_mutex', color: '#10b981' },
  { id: 'w_core_db', sourceId: 'core_reasoning', targetId: 'tool_db', color: '#059669' },
  { id: 'w_core_crm', sourceId: 'core_reasoning', targetId: 'tool_crm', color: '#14b8a6' },

  // Tools / Core -> Client Deliverables (Egress)
  { id: 'w_tool_calendar', sourceId: 'tool_mutex', targetId: 'egr_calendar', color: '#6366f1' },
  { id: 'w_tool_crm_egr', sourceId: 'tool_crm', targetId: 'egr_lead_record', color: '#8b5cf6' },
  { id: 'w_tool_db_staff', sourceId: 'tool_db', targetId: 'egr_staff_console', color: '#a855f7' },
  { id: 'w_core_calendar', sourceId: 'core_reasoning', targetId: 'egr_calendar', color: '#6366f1' },
  { id: 'w_core_stream', sourceId: 'core_reasoning', targetId: 'egr_stream', color: '#06b6d4' },
  { id: 'w_core_staff', sourceId: 'core_escalation', targetId: 'egr_staff_console', color: '#a855f7' },
];

export const PIPELINE_SCENARIOS: PipelineScenarioData[] = [
  {
    id: 'booking',
    tabName: 'Calendar Booking Flow',
    badge: 'Booking Lock',
    inboundText: 'Can I book an appointment tomorrow at 10:00 AM?',
    primaryPath: [
      'ing_widget',
      'vc_rosters',
      'vc_services',
      'beacon_intent',
      'core_reasoning',
      'core_grounder',
      'tool_mutex',
      'tool_db',
      'egr_calendar',
      'egr_stream',
    ],
    outcome: {
      title: 'Appointment Checked & Confirmed',
      summary: 'Booking checked against existing bookings and calendars under a per-day lock, saved, and calendar invites (.ics + Google link) generated.',
      metrics: [
        { label: 'Lock State', value: 'Per-day lock' },
        { label: 'Grounding Mode', value: 'Hybrid RRF Citations' },
        { label: 'Total Latency', value: '~360ms' },
      ],
    },
  },
  {
    id: 'lead',
    tabName: 'Lead Extraction Flow',
    badge: 'Zero-Form NLP',
    inboundText: 'My email is david.vance@acmecorp.com and phone is (415) 555-0194.',
    primaryPath: [
      'ing_widget',
      'beacon_intent',
      'core_reasoning',
      'tool_crm',
      'tool_db',
      'egr_lead_record',
      'egr_staff_console',
      'egr_stream',
    ],
    outcome: {
      title: 'Contact Profile Created & Attributed',
      summary: 'NLP parser extracted email and phone from text without forms; dispatched to CRM with staff chime alert.',
      metrics: [
        { label: 'Extraction', value: 'Entity Parser' },
        { label: 'Attribution', value: 'Session Linked' },
        { label: 'Staff Chime', value: 'Emitted' },
      ],
    },
  },
  {
    id: 'grounded_rag',
    tabName: 'Grounded Q&A Flow',
    badge: 'Factual Firebreak',
    inboundText: 'What are your exact encryption standards and multi-tenant data isolation policies?',
    primaryPath: [
      'ing_widget',
      'vc_policies',
      'vc_services',
      'beacon_intent',
      'core_reasoning',
      'core_grounder',
      'egr_stream',
    ],
    outcome: {
      title: 'Grounded Response Streamed with Citations',
      summary: 'Answer grounded strictly in Policies_2026.pdf via 384-d vector embeddings; unverified hallucination rejected.',
      metrics: [
        { label: 'Retrieval', value: 'Hybrid bge-small + BM25' },
        { label: 'Firebreak', value: 'Enforced' },
        { label: 'Citations', value: 'Verified Chunks' },
      ],
    },
  },
];
