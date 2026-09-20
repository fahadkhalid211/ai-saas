export type PipelineState =
  | 'idle'
  | 'ingesting'
  | 'retrieving'
  | 'reasoning'
  | 'validating'
  | 'locking'
  | 'executing'
  | 'complete';

export interface DocumentNode {
  id: string;
  label: string;
  type: 'PDF' | 'DB' | 'DOCS' | 'RULE' | 'POLICY' | 'SCHEDULE' | 'FAQ';
  filename: string;
  relevanceScore: number;
  matched: boolean;
}

export interface PipelineScenario {
  id: string;
  title: string;
  badge: string;
  inputMessage: string;
  sourceChannel: string;
  intent: string;
  intentConfidence: string;
  documents: DocumentNode[];
  contextCapsule: {
    summary: string;
    citations: string[];
    tokenCount: number;
  };
  decisionVector: {
    actionName: string;
    params: Record<string, string>;
  };
  firebreakValidation: {
    contextVerified: boolean;
    rulesVerified: boolean;
    actionValidated: boolean;
    speculationRisk: string;
  };
  mutexAction: {
    lockKey: string;
    lockLatency: string;
    destinations: Array<{
      name: string;
      status: string;
      detail: string;
    }>;
    confirmedOutcome: string;
  };
}

export const PIPELINE_SCENARIOS: PipelineScenario[] = [
  {
    id: 'booking_mutex',
    title: 'Executive Calendar Booking',
    badge: 'Atomic Scheduling',
    inputMessage: 'Can I reserve an executive appointment tomorrow at 10:00 AM?',
    sourceChannel: 'Web Concierge • Desktop / Mobile',
    intent: 'schedule_appointment',
    intentConfidence: '99.6%',
    documents: [
      { id: 'doc-1', label: 'SCHEDULE', type: 'SCHEDULE', filename: 'Executive_Calendar_2026.db', relevanceScore: 0.94, matched: true },
      { id: 'doc-2', label: 'RULES', type: 'RULE', filename: 'Service_Duration_Rules.json', relevanceScore: 0.89, matched: true },
      { id: 'doc-3', label: 'POLICY', type: 'POLICY', filename: 'Rescheduling_Buffer_Policy.md', relevanceScore: 0.82, matched: true },
      { id: 'doc-4', label: 'PRICING', type: 'DOCS', filename: 'Consultation_Rate_Card.pdf', relevanceScore: 0.38, matched: false },
      { id: 'doc-5', label: 'SECURITY', type: 'PDF', filename: 'Compliance_Charter.pdf', relevanceScore: 0.12, matched: false },
    ],
    contextCapsule: {
      summary: 'Target slot 10:00 AM UTC verified open. 45-min duration conforms to executive booking rules. No existing conflicts found.',
      citations: ['Executive_Calendar_2026.db#slot_1000', 'Service_Duration_Rules.json#sec2'],
      tokenCount: 142,
    },
    decisionVector: {
      actionName: 'BookSlot_10AM',
      params: {
        date: '2026-09-22',
        time: '10:00 - 10:45 AM',
        slot_id: 'slot_exec_9921',
        concurrency_lock: 'lock_exec_10am',
      },
    },
    firebreakValidation: {
      contextVerified: true,
      rulesVerified: true,
      actionValidated: true,
      speculationRisk: '0.00%',
    },
    mutexAction: {
      lockKey: 'mutex:slot:2026-09-22:1000',
      lockLatency: '2.4ms',
      destinations: [
        { name: 'CALENDAR SYNC', status: 'CONFIRMED', detail: 'Google Calendar + .ics invite dispatched' },
        { name: 'CRM DATABASE', status: 'UPDATED', detail: 'Appointment linked to visitor session' },
        { name: 'EMAIL DISPATCH', status: 'SENT', detail: 'Instant confirmation with reschedule link' },
        { name: 'HUMAN TAKEOVER', status: 'STANDBY', detail: 'Assigned staff notified in console' },
      ],
      confirmedOutcome: 'Appointment confirmed for tomorrow at 10:00 AM with zero double-booking possibility.',
    },
  },
  {
    id: 'lead_capture',
    title: 'Autonomous In-Chat Lead Ingestion',
    badge: 'CRM Pipeline',
    inputMessage: 'My email is david.vance@acmecorp.com and phone is (415) 555-0194. Send enterprise contract details.',
    sourceChannel: 'WhatsApp Business Channel',
    intent: 'capture_lead_contact',
    intentConfidence: '99.8%',
    documents: [
      { id: 'doc-1', label: 'CRM DEDUPE', type: 'DB', filename: 'Workspace_Accounts.db', relevanceScore: 0.91, matched: true },
      { id: 'doc-2', label: 'POLICY', type: 'POLICY', filename: 'Data_Privacy_GDPR.md', relevanceScore: 0.86, matched: true },
      { id: 'doc-3', label: 'ROUTING', type: 'RULE', filename: 'Enterprise_Territory_Map.json', relevanceScore: 0.79, matched: true },
      { id: 'doc-4', label: 'FAQ', type: 'FAQ', filename: 'SLA_Response_Tiers.faq', relevanceScore: 0.41, matched: false },
    ],
    contextCapsule: {
      summary: 'Verified unique lead record. Contact details parsed via zero-form NLP. Territory matches West Coast enterprise sales tier.',
      citations: ['Workspace_Accounts.db#records', 'Enterprise_Territory_Map.json#tier1'],
      tokenCount: 118,
    },
    decisionVector: {
      actionName: 'IngestQualifiedLead',
      params: {
        email: 'david.vance@acmecorp.com',
        phone: '+14155550194',
        company: 'Acme Corp',
        tier: 'Enterprise',
      },
    },
    firebreakValidation: {
      contextVerified: true,
      rulesVerified: true,
      actionValidated: true,
      speculationRisk: '0.00%',
    },
    mutexAction: {
      lockKey: 'mutex:lead:david.vance@acmecorp.com',
      lockLatency: '1.8ms',
      destinations: [
        { name: 'CRM DATABASE', status: 'PERSISTED', detail: 'Contact created with multi-turn attribution' },
        { name: 'EMAIL DISPATCH', status: 'QUEUED', detail: 'Enterprise collateral dispatched' },
        { name: 'STAFF CHIME', status: 'EMITTED', detail: 'Real-time notification audio chime in console' },
        { name: 'HUMAN TAKEOVER', status: 'READY', detail: 'Account executive auto-assigned' },
      ],
      confirmedOutcome: 'Qualified lead attributed and pushed to CRM with conversation transcript.',
    },
  },
  {
    id: 'grounded_rag',
    title: 'Strict 2-Stage Grounded Retrieval',
    badge: 'Zero Hallucination',
    inputMessage: 'What are your exact encryption, SOC-2 compliance, and enterprise data isolation standards?',
    sourceChannel: 'Custom JS Embedded Widget',
    intent: 'query_security_standards',
    intentConfidence: '99.4%',
    documents: [
      { id: 'doc-1', label: 'SECURITY', type: 'PDF', filename: 'SOC2_Type_II_Charter.pdf', relevanceScore: 0.96, matched: true },
      { id: 'doc-2', label: 'ISOLATION', type: 'DOCS', filename: 'Multi_Tenant_BOLA_Architecture.md', relevanceScore: 0.92, matched: true },
      { id: 'doc-3', label: 'POLICY', type: 'POLICY', filename: 'Data_Retention_Policy.json', relevanceScore: 0.88, matched: true },
      { id: 'doc-4', label: 'SCHEDULE', type: 'SCHEDULE', filename: 'Audit_Schedule_2026.db', relevanceScore: 0.35, matched: false },
    ],
    contextCapsule: {
      summary: 'AES-256 at rest, TLS 1.3 in transit. Full tenant isolation via cryptographic workspace IDs. Strict Zero-Retention BYOK policy verified.',
      citations: ['SOC2_Type_II_Charter.pdf#p4', 'Multi_Tenant_BOLA_Architecture.md#sec1'],
      tokenCount: 164,
    },
    decisionVector: {
      actionName: 'StreamGroundedAnswer',
      params: {
        compliance_tier: 'SOC2_Type_II',
        encryption_standard: 'AES-256_GCM',
        isolation_mode: 'Cryptographic_BOLA',
      },
    },
    firebreakValidation: {
      contextVerified: true,
      rulesVerified: true,
      actionValidated: true,
      speculationRisk: '0.00%',
    },
    mutexAction: {
      lockKey: 'mutex:session:stream_verified',
      lockLatency: '1.2ms',
      destinations: [
        { name: 'STREAM CHANNEL', status: 'DELIVERED', detail: 'Streaming cited facts with document footnotes' },
        { name: 'AUDIT TRAIL', status: 'LOGGED', detail: 'Query + source chunk hash recorded' },
        { name: 'FIREBREAK GATE', status: 'PASSED', detail: 'Zero ungrounded tokens verified' },
        { name: 'HUMAN TAKEOVER', status: 'STANDBY', detail: 'Live escalation available upon request' },
      ],
      confirmedOutcome: 'Factual response streamed with zero hallucination and mathematical source grounding.',
    },
  },
];
