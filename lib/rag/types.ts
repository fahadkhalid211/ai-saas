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
}
