export interface SourceCitation {
  title: string;
  episode_id: string;
  source_url: string;
  excerpt: string;
  score: number;
}

export interface Message {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources_json?: SourceCitation[];
  created_at: string;
  meta_info?: {
    provider?: string;
    model?: string;
    intent?: string;
  };
}

export interface Session {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Artifact {
  id: string;
  session_id: string;
  title: string;
  artifact_type: 'markdown' | 'html';
  content: string;
  created_at: string;
}

export interface ModelProvider {
  id: string;
  name: string;
  available: boolean;
  default_model: string;
  models: string[];
  status_message: string;
}
