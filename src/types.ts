
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface VCTTState {
  Voice: number;
  Choice: number;
  Transparency: number;
  'Trust (τ)': number;
  Regulation: 'normal' | 'clarify' | 'slow_down';
}

export interface Session {
  id: string;
  title: string;
  created_at: Date;
  messages: Message[];
}

export interface StepResponse {
  response: string;
  state: VCTTState;
  repair_count: number;
  agent_logs?: string[];
  raw_json?: any;
}
