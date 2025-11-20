export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export interface VCTTState {
  Voice: number;
  Choice: number;
  Transparency: number;
  "Trust (τ)": number;
  Regulation: "normal" | "clarify" | "slow_down";
}

export interface Session {
  id: string;
  title: string;
  created_at: Date;
  messages: Message[];
  // Backend metadata (optional, populated when loaded from backend)
  user_id?: string;
  message_count?: number;
  last_activity?: Date;
  trust_tau?: number;
  repair_count?: number;
}

export interface StepResponse {
  response: string;
  state: VCTTState;
  repair_count: number;
  agent_logs?: string[];
  raw_json?: any;
}
