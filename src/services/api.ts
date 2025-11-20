import type { StepResponse } from "../types";
import { getApiUrl } from "../config/api";
import { mockApi } from "./mockApi";

export interface SessionSummary {
  session_id: string;
  user_id: string;
  created_at: string;
  message_count: number;
  last_activity: string;
  trust_tau: number;
  repair_count: number;
}

export interface TrustMetric {
  session_id: string;
  timestamp: string;
  trust_tau: number;
  contradiction: number;
  regulation: string;
}

export interface AggregateAnalytics {
  overview: {
    total_sessions: number;
    total_messages: number;
    avg_messages_per_session: number;
  };
  trust_metrics: {
    average_trust_tau: number;
    min_trust: number;
    max_trust: number;
  };
  repair_metrics: {
    total_repairs: number;
    avg_repairs_per_session: number;
    max_repairs: number;
  };
  regulation: {
    normal: number;
    clarify: number;
    slow_down: number;
  };
}

class ApiService {
  private baseUrl: string | null;

  constructor() {
    this.baseUrl = getApiUrl();
  }

  async startSession(userId: string, input: string): Promise<string> {
    // Use mock if no backend URL configured
    if (!this.baseUrl) {
      return mockApi.startSession(userId, input);
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/session/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId, input }),
      });

      if (!response.ok) {
        console.error("Backend error, falling back to mock");
        return mockApi.startSession(userId, input);
      }

      const data = await response.json();
      return data.session_id;
    } catch (error) {
      console.error("Network error, falling back to mock:", error);
      return mockApi.startSession(userId, input);
    }
  }

  async sendStep(sessionId: string, input: string): Promise<StepResponse> {
    // Use mock if no backend URL configured
    if (!this.baseUrl) {
      return mockApi.sendStep(sessionId, input);
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/session/step`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ session_id: sessionId, input }),
      });

      if (!response.ok) {
        console.error("Backend error, falling back to mock");
        return mockApi.sendStep(sessionId, input);
      }

      const data = await response.json();

      // Transform backend response to match UI expectations
      const sim = data.internal_state?.sim || {};

      return {
        response: data.response,
        state: {
          Voice: Math.round((1 - (sim.tension || 0)) * 100),
          Choice: Math.round((1 - (sim.emotional_intensity || 0)) * 100),
          Transparency: Math.round((1 - (sim.uncertainty || 0)) * 100),
          "Trust (τ)": Math.round((data.internal_state?.trust_tau || 0) * 100),
          Regulation: data.internal_state?.regulation || "normal",
        },
        repair_count: data.internal_state?.repair_count || 0,
        agent_logs: data.agent_logs || [],
        raw_json: data,
      };
    } catch (error) {
      console.error("Network error, falling back to mock:", error);
      return mockApi.sendStep(sessionId, input);
    }
  }

  async getAllSessions(userId?: string, limit: number = 50): Promise<SessionSummary[]> {
    if (!this.baseUrl) return [];

    try {
      const params = new URLSearchParams();
      if (userId) params.append("user_id", userId);
      params.append("limit", limit.toString());

      const response = await fetch(`${this.baseUrl}/api/v1/analytics/sessions?${params}`);
      if (!response.ok) return [];

      const data = await response.json();
      return data.sessions || [];
    } catch (error) {
      console.error("Error fetching sessions:", error);
      return [];
    }
  }

  async getTrustMetrics(userId?: string): Promise<TrustMetric[]> {
    console.log("🌐 getTrustMetrics: baseUrl=", this.baseUrl);
    if (!this.baseUrl) {
      console.warn("⚠️ No baseUrl configured, returning []");
      return [];
    }

    try {
      const params = new URLSearchParams();
      if (userId) params.append("user_id", userId);

      const url = `${this.baseUrl}/api/v1/analytics/trust-metrics?${params}`;
      console.log("🌐 Fetching:", url);
      const response = await fetch(url);
      console.log("🌐 Response status:", response.status, response.ok ? "✅" : "❌");

      if (!response.ok) {
        console.warn("⚠️ Response not OK, returning []");
        return [];
      }

      const data = await response.json();
      console.log("🌐 Received metrics data:", data);
      const metrics = data.metrics || [];
      console.log("🌐 Extracted metrics array:", metrics);
      return metrics;
    } catch (error) {
      console.error("❌ Error fetching trust metrics:", error);
      return [];
    }
  }

  async getAggregateAnalytics(userId?: string): Promise<AggregateAnalytics | null> {
    console.log("🌐 getAggregateAnalytics: baseUrl=", this.baseUrl);
    if (!this.baseUrl) {
      console.warn("⚠️ No baseUrl configured, returning null");
      return null;
    }

    try {
      const params = new URLSearchParams();
      if (userId) params.append("user_id", userId);

      const url = `${this.baseUrl}/api/v1/analytics/aggregate?${params}`;
      console.log("🌐 Fetching:", url);
      const response = await fetch(url);
      console.log("🌐 Response status:", response.status, response.ok ? "✅" : "❌");

      if (!response.ok) {
        console.warn("⚠️ Response not OK, returning null");
        return null;
      }

      const data = await response.json();
      console.log("🌐 Received data:", data);
      return data;
    } catch (error) {
      console.error("❌ Error fetching aggregate analytics:", error);
      return null;
    }
  }

  async getSessionHistory(sessionId: string): Promise<any> {
    if (!this.baseUrl) return null;

    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/analytics/sessions/${sessionId}/history`
      );
      if (!response.ok) return null;

      return await response.json();
    } catch (error) {
      console.error("Error fetching session history:", error);
      return null;
    }
  }
}

export const api = new ApiService();
