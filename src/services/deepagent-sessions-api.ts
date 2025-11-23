
import { getApiUrl } from "../config/api";

const BACKEND_URL = getApiUrl();

export interface DeepAgentSession {
  id: number;
  sessionUuid: string;
  goalId: number | null;
  subtaskId: number | null;
  status: 'created' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  context: {
    title: string;
    description: string;
    requirements?: string[];
    files?: string[];
    additionalContext?: any;
  };
  result: any;
  initiatedBy: string;
  deepAgentUrl: string | null;
  errorMessage: string | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  updatedAt: string;
  metadata: any;
  activities: SessionActivity[];
}

export interface SessionActivity {
  id: number;
  session_id: number;
  activity_type: string;
  description: string;
  metadata: any;
  timestamp: string;
}

export interface CreateDeepAgentSessionDto {
  goalId?: number;
  subtaskId?: number;
  initiatedBy: string;
  context: {
    title: string;
    description: string;
    requirements?: string[];
    files?: string[];
    additionalContext?: any;
  };
}

export interface UpdateDeepAgentSessionDto {
  status?: 'in_progress' | 'completed' | 'failed' | 'cancelled';
  result?: any;
  errorMessage?: string;
  metadata?: any;
}

class DeepAgentSessionsApiService {
  private baseUrl: string | null;

  constructor() {
    this.baseUrl = BACKEND_URL;
  }

  async createSession(dto: CreateDeepAgentSessionDto): Promise<DeepAgentSession> {
    if (!this.baseUrl) throw new Error("Backend URL not configured");

    const response = await fetch(`${this.baseUrl}/api/deepagent/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create DeepAgent session: ${error}`);
    }

    return await response.json();
  }

  async getSession(identifier: string | number): Promise<DeepAgentSession> {
    if (!this.baseUrl) throw new Error("Backend URL not configured");

    const response = await fetch(`${this.baseUrl}/api/deepagent/sessions/${identifier}`);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get session: ${error}`);
    }

    return await response.json();
  }

  async updateSession(identifier: string | number, dto: UpdateDeepAgentSessionDto): Promise<DeepAgentSession> {
    if (!this.baseUrl) throw new Error("Backend URL not configured");

    const response = await fetch(`${this.baseUrl}/api/deepagent/sessions/${identifier}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to update session: ${error}`);
    }

    return await response.json();
  }

  async getSessionsForGoal(goalId: number): Promise<DeepAgentSession[]> {
    if (!this.baseUrl) return [];

    try {
      const response = await fetch(`${this.baseUrl}/api/deepagent/goals/${goalId}/sessions`);
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error("Error fetching sessions for goal:", error);
      return [];
    }
  }

  async getSessionsForSubtask(subtaskId: number): Promise<DeepAgentSession[]> {
    if (!this.baseUrl) return [];

    try {
      const response = await fetch(`${this.baseUrl}/api/deepagent/subtasks/${subtaskId}/sessions`);
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error("Error fetching sessions for subtask:", error);
      return [];
    }
  }
}

export const deepAgentSessionsApi = new DeepAgentSessionsApiService();
