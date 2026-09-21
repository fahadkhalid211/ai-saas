export interface PipelineStageInfo {
  id: string;
  name: string;
  badge: string;
  description: string;
  detail: string;
}

export interface PipelineScenarioData {
  id: 'booking' | 'lead' | 'grounded_rag';
  tabName: string;
  badge: string;
  inputMessage: string;
  stages: PipelineStageInfo[];
  outcome: {
    title: string;
    summary: string;
    metrics: Array<{ label: string; value: string }>;
  };
}

export const PIPELINE_SCENARIOS: PipelineScenarioData[] = [
  {
    id: 'booking',
    tabName: 'Calendar Booking',
    badge: 'Atomic Scheduling',
    inputMessage: 'Can I reserve an appointment tomorrow at 10:00 AM?',
    stages: [
      {
        id: 'input',
        name: 'Visitor Message',
        badge: 'Inbound Payload',
        description: 'Receives raw query from chat widget, WhatsApp, or API webhook.',
        detail: 'Unstructured natural language input parsed into session memory buffer.',
      },
      {
        id: 'embed',
        name: 'Embedding (bge-small)',
        badge: '384-d Vector',
        description: 'Generates normalized dense vector embedding via local transformer pipeline.',
        detail: 'Transforms text into a 384-dimensional representation without remote API roundtrips.',
      },
      {
        id: 'retrieval',
        name: 'Hybrid Retrieval',
        badge: 'Vector + Keyword (RRF)',
        description: 'Combines cosine similarity vectors with BM25 keyword matching via Reciprocal Rank Fusion.',
        detail: 'Scans schedule rules, service durations, and operating hour documents.',
      },
      {
        id: 'rerank',
        name: 'Rerank & Dedupe',
        badge: 'Cross-Scoring',
        description: 'Eliminates redundant chunks and prioritizes verified service constraints.',
        detail: 'Selects top verified document passages to construct the factual grounding prompt.',
      },
      {
        id: 'llm',
        name: 'Grounded LLM Answer',
        badge: 'Constrained Synthesis',
        description: 'Answers strictly from your knowledge base, and admits when information is unavailable.',
        detail: 'Synthesizes slot confirmation and validates against business operating limits.',
      },
      {
        id: 'action',
        name: 'Booking Action',
        badge: 'Slot Lock & DB Uniqueness',
        description: 'Executes per-instance in-memory reservation lock and database uniqueness constraint.',
        detail: 'Prevents double-bookings and immediately syncs calendar invites and confirmation emails.',
      },
    ],
    outcome: {
      title: 'Appointment Reserved & Calendar Synced',
      summary: 'Tomorrow at 10:00 AM - 10:45 AM confirmed. Calendar invite (.ics + Google) dispatched.',
      metrics: [
        { label: 'Lock Mechanism', value: 'Per-Instance + DB Unique' },
        { label: 'Grounding Mode', value: 'Knowledge Base Only' },
        { label: 'Latency (Illustrative)', value: '~380ms total' },
      ],
    },
  },
  {
    id: 'lead',
    tabName: 'Lead Extraction',
    badge: 'CRM Attribution',
    inputMessage: 'My email is david.vance@acmecorp.com and phone is (415) 555-0194.',
    stages: [
      {
        id: 'input',
        name: 'Visitor Message',
        badge: 'Inbound Payload',
        description: 'Raw conversational text containing unstructured contact details.',
        detail: 'Visitor enters contact information naturally without filling multi-step form fields.',
      },
      {
        id: 'embed',
        name: 'Embedding (bge-small)',
        badge: '384-d Vector',
        description: 'Generates embedding vector to determine intent category.',
        detail: 'Semantic vector confirms lead capture intent and maps to workspace lead pipeline.',
      },
      {
        id: 'retrieval',
        name: 'Hybrid Retrieval',
        badge: 'Vector + Keyword (RRF)',
        description: 'Retrieves existing workspace account records and deduplication rules.',
        detail: 'Checks for previous conversations from this visitor to maintain unified attribution.',
      },
      {
        id: 'rerank',
        name: 'Rerank & Dedupe',
        badge: 'Cross-Scoring',
        description: 'Evaluates lead priority and territory routing criteria.',
        detail: 'Ensures no duplicate records exist in the workspace CRM database.',
      },
      {
        id: 'llm',
        name: 'Grounded LLM Answer',
        badge: 'Constrained Synthesis',
        description: 'Acknowledges lead submission warmly and sets expectations on next steps.',
        detail: 'Answers any questions grounded in company policies while recording contact details.',
      },
      {
        id: 'action',
        name: 'CRM Lead Creation',
        badge: 'Database Persistence',
        description: 'Stores verified lead in database with full conversation transcript and emits staff alert.',
        detail: 'Syncs lead to CRM, pushes real-time console chime, and dispatches notification email.',
      },
    ],
    outcome: {
      title: 'Lead Captured & Attributed to Session',
      summary: 'david.vance@acmecorp.com • (415) 555-0194 saved to workspace CRM with attribution.',
      metrics: [
        { label: 'Extraction Method', value: 'Zero-Form In-Chat NLP' },
        { label: 'Attribution Record', value: 'Full Transcript Linked' },
        { label: 'Staff Notification', value: 'Instant Console Chime' },
      ],
    },
  },
  {
    id: 'grounded_rag',
    tabName: 'Grounded Q&A',
    badge: 'Knowledge Verification',
    inputMessage: 'What are your exact encryption and multi-tenant data isolation standards?',
    stages: [
      {
        id: 'input',
        name: 'Visitor Message',
        badge: 'Inbound Payload',
        description: 'Visitor asks technical security and compliance questions.',
        detail: 'Query arrives via embedded website chat widget.',
      },
      {
        id: 'embed',
        name: 'Embedding (bge-small)',
        badge: '384-d Vector',
        description: 'Computes 384-dimensional query vector using local transformer.',
        detail: 'Dense representation capturing semantic meaning of security requirements.',
      },
      {
        id: 'retrieval',
        name: 'Hybrid Retrieval',
        badge: 'Vector + Keyword (RRF)',
        description: 'Dual retrieval across security whitepapers, SOC-2 charters, and policy docs.',
        detail: 'Combines vector semantic similarity with exact keyword matches.',
      },
      {
        id: 'rerank',
        name: 'Rerank & Dedupe',
        badge: 'Cross-Scoring',
        description: 'Ranks candidate passages and filters out low-confidence matches.',
        detail: 'Selects the exact verified paragraphs detailing AES-256 and cryptographic tenant isolation.',
      },
      {
        id: 'llm',
        name: 'Grounded LLM Answer',
        badge: 'Constrained Synthesis',
        description: 'Answers strictly from your knowledge base, and says so when it does not know.',
        detail: 'Locks answer to provided chunk citations; rejects speculation outside the documents.',
      },
      {
        id: 'action',
        name: 'Cited Stream & Escalation',
        badge: 'Document Footnotes',
        description: 'Streams grounded response with document citations and standby human escalation.',
        detail: 'Displays footnotes pointing to verified pages with 1-click option to connect with staff.',
      },
    ],
    outcome: {
      title: 'Grounded Answer Delivered with Source Citations',
      summary: 'Grounded in Security_Whitepaper.pdf. Answers strictly from documents; states unknown if not found.',
      metrics: [
        { label: 'Retrieval Algorithm', value: 'Hybrid Cosine + BM25 RRF' },
        { label: 'Speculation Policy', value: 'Strict Firebreak Enforced' },
        { label: 'Escalation Hook', value: '1-Click Staff Bridge' },
      ],
    },
  },
];
