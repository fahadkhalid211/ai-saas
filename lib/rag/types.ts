export interface ExtractedDocument {
  title: string;
  type:
    | 'pdf'
    | 'docx'
    | 'csv'
    | 'json'
    | 'txt'
    | 'description'
    | 'image'
    | 'jpg'
    | 'jpeg'
    | 'png'
    | 'webp'
    | 'video'
    | 'audio'
    | 'youtube'
    | 'web'
    | 'mp4'
    | 'mp3'
    | 'wav'
    | 'webm'
    | 'm4a'
    | string;
  content: string;
  sections?: {
    heading?: string;
    text: string;
    metadata?: Record<string, any>;
  }[];
  metadata?: Record<string, any>;
}

export interface ChunkItem {
  id?: string;
  content: string;
  chunkIndex: number;
  tokenCount: number;
  metadata: {
    sourceTitle: string;
    sourceType: string;
    section?: string;
    page?: number;
    row?: number;
    [key: string]: any;
  };
}

export interface SearchResultChunk extends ChunkItem {
  similarity: number;
  knowledgeSourceId: string;
  /** Cosine similarity between the question and this passage (0..1): an absolute signal, unlike the fused rank score. */
  vectorScore?: number;
  /** True when the passage contains the question's words (full-text match). */
  keywordMatch?: boolean;
}

export interface Citation {
  sourceTitle: string;
  sourceType: string;
  chunkIndex: number;
  preview: string;
  url?: string;
  page?: number;
  row?: number;
}

export interface RetrievalResult {
  condensedQuery: string;
  chunks: SearchResultChunk[];
  contextText: string;
  citations: Citation[];
  /** 0..1: how likely the knowledge base can answer this question (see lib/rag/confidence.ts). */
  confidence?: number;
}
