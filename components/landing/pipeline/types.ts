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
  // Normalized 2D/3D layout coordinates in scene space (-10 to +10 X, -5 to +5 Y)
  x: number;
  y: number;
  z?: number;
  color: string;
  description: string;
  technicalSpec: string;
  telemetryMetrics?: Array<{ label: string; value: string }>;
  samplePayload?: string;
}

export interface TopologyWire {
  id: string;
  sourceId: string;
  targetId: string;
  color?: string;
  pulseSpeed?: number;
  activeInScenarios?: Array<'booking' | 'lead' | 'grounded_rag'>;
}

export interface VectorClusterInfo {
  id: string;
  name: string;
  itemCount: string;
  dimension: string;
  x: number;
  y: number;
  z: number;
  color: string;
  docs: string[];
}

export interface PipelineScenarioData {
  id: 'booking' | 'lead' | 'grounded_rag';
  tabName: string;
  badge: string;
  inboundText: string;
  primaryPath: string[]; // Node IDs activated along the flow
  activeTools: string[]; // Tool node IDs activated
  activeEgress: string[]; // Egress node IDs activated
  outcome: {
    title: string;
    summary: string;
    metrics: Array<{ label: string; value: string }>;
  };
}

export const TOPOLOGY_NODES: TopologyNode[] = [
  // Ingress Channels (Left: X = -9.5)
  {
    id: 'ing_widget',
    label: 'Website Widget',
    category: 'ingress',
    badge: 'Live Session',
    x: -9.5,
    y: 3.2,
    color: '#06b6d4',
    description: 'Embedded client floating messenger handling realtime visitor conversations.',
    technicalSpec: 'Lightweight vanilla JS bundle (<42KB), postMessage iframe bridge, local session token.',
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
    x: -9.5,
    y: 1.2,
    color: '#10b981',
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
    x: -9.5,
    y: -0.8,
    color: '#38bdf8',
    description: 'Instant bot dispatcher for customer service channels and escalations.',
    technicalSpec: 'X-Telegram-Bot-Api-Secret-Token validation, automatic duplicate filter.',
    telemetryMetrics: [
      { label: 'Secret Token', value: 'SHA256 Validated' },
      { label: 'Latency', value: '95ms' },
    ],
    samplePayload: '{"update_id": 982144, "message": {"chat": {"id": 4810294}}}',
  },
  {
    id: 'ing_sources',
    label: 'Knowledge Ingest',
    category: 'ingress',
    badge: 'URL / PDF / OCR',
    x: -9.5,
    y: -2.8,
    color: '#818cf8',
    description: 'Continuous ingestion pipeline parsing scraped sites, PDFs, and YouTube audio transcripts.',
    technicalSpec: 'Recursive chunking (500 tokens, 100 overlap), URL sanitization, Whisper/OCR extraction.',
    telemetryMetrics: [
      { label: 'Chunk Size', value: '500 tokens' },
      { label: 'Model', value: 'bge-small-en-v1.5' },
    ],
    samplePayload: '{"source": "policies_2026.pdf", "chunks": 42, "checksum": "a7b8e1"}',
  },

  // Focus Intent Beacon (Center-Left: X = -0.5, Y = 1.0)
  {
    id: 'beacon_intent',
    label: "Visitor Intent Beacon",
    category: 'cognitive_core',
    badge: 'Signal Filter',
    x: -0.6,
    y: 1.2,
    color: '#f59e0b',
    description: 'Classifies inbound visitor intent into booking, lead capture, support, or pricing.',
    technicalSpec: 'Low-latency classification layer extracting temporal entities, emails, and phone numbers.',
    telemetryMetrics: [
      { label: 'Extraction', value: 'Named Entity & Regex' },
      { label: 'Confidence', value: '99.4%' },
    ],
    samplePayload: '{"intent": "APPOINTMENT_RESERVATION", "time": "10:00 AM", "date": "tomorrow"}',
  },

  // Central Cognitive Hub & Satellites (Center-Right: X = 2.4)
  {
    id: 'core_reasoning',
    label: 'Orchestration Core',
    category: 'cognitive_core',
    badge: 'Multi-LLM Engine',
    x: 2.4,
    y: 1.2,
    color: '#a855f7',
    description: 'Cognitive reasoning engine cascading across Groq, Gemini Flash, or wholesale BYOK providers.',
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
    x: 2.4,
    y: 3.4,
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
    badge: 'Human Handoff',
    x: 4.2,
    y: 2.4,
    color: '#3b82f6',
    description: 'Monitors user sentiment and complexity, bridging immediately to human operators when needed.',
    technicalSpec: 'Sentiment scoring, negative valence escalation, and staff alert triggering.',
    telemetryMetrics: [
      { label: 'Trigger', value: 'Sentiment < -0.4' },
      { label: 'Bridge Time', value: '<50ms' },
    ],
    samplePayload: '{"sentiment": "neutral", "escalationNeeded": false}',
  },

  // Deterministic Execution Tools (Bottom: Y = -3.2, X = 0.5 to 4.5)
  {
    id: 'tool_mutex',
    label: 'Slot Lock Mutex',
    category: 'tools',
    badge: 'In-Memory Guard',
    x: 0.8,
    y: -3.2,
    color: '#10b981',
    description: 'Per-instance concurrency mutex holding appointment slots during confirmation flow.',
    technicalSpec: '5-minute auto-expiry timer, single-flight lock map, and database uniqueness check.',
    telemetryMetrics: [
      { label: 'Lock Scope', value: 'Assistant + TimeSlot' },
      { label: 'Auto Expiry', value: '300s' },
    ],
    samplePayload: '{"lockKey": "lock:asst_1:2026-11-20:1000", "ttl": 300, "status": "ACQUIRED"}',
  },
  {
    id: 'tool_db',
    label: 'Postgres State Store',
    category: 'tools',
    badge: 'Relational & Audit',
    x: 2.8,
    y: -3.2,
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
    x: 4.8,
    y: -3.2,
    color: '#14b8a6',
    description: 'Outbound webhook dispatcher sending captured leads to HubSpot, Salesforce, or custom endpoints.',
    technicalSpec: 'Exponential retry backoff, webhook secret signing, email notification dispatch.',
    telemetryMetrics: [
      { label: 'Dispatch', value: 'Instant Push' },
      { label: 'Retry SLA', value: '3x Backoff' },
    ],
    samplePayload: '{"lead": {"name": "David Vance", "email": "david@acme.com", "phone": "555-0194"}}',
  },

  // Egress Destinations (Right: X = 9.2)
  {
    id: 'egr_calendar',
    label: 'Calendar Sync',
    category: 'egress',
    badge: 'Google / Outlook',
    x: 9.2,
    y: 3.2,
    color: '#6366f1',
    description: 'Dispatches .ics calendar attachments, Google Calendar links, and email confirmations.',
    technicalSpec: 'RFC 5545 iCalendar standard generation, UTC timestamp normalization.',
    telemetryMetrics: [
      { label: 'Formats', value: '.ics, Google, Outlook' },
      { label: 'Sync Status', value: 'Instant' },
    ],
    samplePayload: '{"calendarEvent": "Appointment at Kortex", "start": "2026-11-20T10:00:00Z"}',
  },
  {
    id: 'egr_lead_record',
    label: 'CRM Lead Record',
    category: 'egress',
    badge: 'Attributed Profile',
    x: 9.2,
    y: 1.2,
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
    x: 9.2,
    y: -0.8,
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
    x: 9.2,
    y: -2.8,
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
    x: -4.8,
    y: 2.8,
    z: 0.5,
    color: '#38bdf8',
    docs: ['Operating_Hours.md', 'Cancellation_Rules.pdf', 'Privacy_Policy.docx'],
  },
  {
    id: 'vc_services',
    name: 'Services & Catalog',
    itemCount: '86 chunks',
    dimension: '384-d',
    x: -3.8,
    y: 0.2,
    z: -0.8,
    color: '#818cf8',
    docs: ['Service_Menu.xlsx', 'Pricing_Tiers.pdf', 'Package_Addons.md'],
  },
  {
    id: 'vc_rosters',
    name: 'Staff Rosters & Slots',
    itemCount: '48 chunks',
    dimension: '384-d',
    x: -4.6,
    y: -2.4,
    z: 0.2,
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
  { id: 'w_in4_vc2', sourceId: 'ing_sources', targetId: 'vc_services', color: '#818cf8' },

  // Vector Clusters -> Intent Beacon
  { id: 'w_vc1_beacon', sourceId: 'vc_policies', targetId: 'beacon_intent', color: '#38bdf8' },
  { id: 'w_vc2_beacon', sourceId: 'vc_services', targetId: 'beacon_intent', color: '#818cf8' },
  { id: 'w_vc3_beacon', sourceId: 'vc_rosters', targetId: 'beacon_intent', color: '#34d399' },

  // Direct Ingress -> Intent Beacon shortcut bus
  { id: 'w_in1_beacon', sourceId: 'ing_widget', targetId: 'beacon_intent', color: '#38bdf8' },

  // Intent Beacon -> Orchestration Core
  { id: 'w_beacon_core', sourceId: 'beacon_intent', targetId: 'core_reasoning', color: '#f59e0b' },

  // Core Satellites
  { id: 'w_core_grounder', sourceId: 'core_reasoning', targetId: 'core_grounder', color: '#ec4899' },
  { id: 'w_core_escalate', sourceId: 'core_reasoning', targetId: 'core_escalation', color: '#3b82f6' },

  // Core -> Tools
  { id: 'w_core_mutex', sourceId: 'core_reasoning', targetId: 'tool_mutex', color: '#10b981' },
  { id: 'w_core_db', sourceId: 'core_reasoning', targetId: 'tool_db', color: '#059669' },
  { id: 'w_core_crm', sourceId: 'core_reasoning', targetId: 'tool_crm', color: '#14b8a6' },

  // Core / Tools -> Egress
  { id: 'w_tool_calendar', sourceId: 'tool_mutex', targetId: 'egr_calendar', color: '#6366f1' },
  { id: 'w_tool_db_egr', sourceId: 'tool_db', targetId: 'egr_staff_console', color: '#a855f7' },
  { id: 'w_tool_crm_egr', sourceId: 'tool_crm', targetId: 'egr_lead_record', color: '#8b5cf6' },
  { id: 'w_core_stream', sourceId: 'core_reasoning', targetId: 'egr_stream', color: '#06b6d4' },
  { id: 'w_core_calendar', sourceId: 'core_reasoning', targetId: 'egr_calendar', color: '#6366f1' },
  { id: 'w_core_staff', sourceId: 'core_escalation', targetId: 'egr_staff_console', color: '#a855f7' },
];

export const PIPELINE_SCENARIOS: PipelineScenarioData[] = [
  {
    id: 'booking',
    tabName: 'Calendar Booking Flow',
    badge: 'Slot Lock & Mutex',
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
    activeTools: ['tool_mutex', 'tool_db'],
    activeEgress: ['egr_calendar', 'egr_stream'],
    outcome: {
      title: 'Appointment Confirmed & Mutex Secured',
      summary: 'Slot locked for 5 minutes in memory, written to Postgres DB, and calendar invites (.ics + Google) generated.',
      metrics: [
        { label: 'Lock State', value: 'Per-Instance Mutex' },
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
    activeTools: ['tool_crm', 'tool_db'],
    activeEgress: ['egr_lead_record', 'egr_staff_console', 'egr_stream'],
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
    activeTools: ['tool_db'],
    activeEgress: ['egr_stream'],
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
