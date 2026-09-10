export interface ExtractedDocument {
  title: string;
  type: 'pdf' | 'docx' | 'csv' | 'json' | 'txt' | 'description' | 'image' | 'jpg' | 'jpeg' | 'png' | 'webp';
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
  page?: number;
  row?: number;
}
