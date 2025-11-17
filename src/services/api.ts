
import type { StepResponse } from '../types';
import { getApiUrl } from '../config/api';
import { mockApi } from './mockApi';

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
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId, input }),
      });

      if (!response.ok) {
        console.error('Backend error, falling back to mock');
        return mockApi.startSession(userId, input);
      }

      const data = await response.json();
      return data.session_id;
    } catch (error) {
      console.error('Network error, falling back to mock:', error);
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
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId, input }),
      });

      if (!response.ok) {
        console.error('Backend error, falling back to mock');
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
          'Trust (τ)': Math.round((data.internal_state?.trust_tau || 0) * 100),
          Regulation: data.internal_state?.regulation || 'normal'
        },
        repair_count: data.internal_state?.repair_count || 0,
        agent_logs: data.agent_logs || [],
        raw_json: data
      };
    } catch (error) {
      console.error('Network error, falling back to mock:', error);
      return mockApi.sendStep(sessionId, input);
    }
  }
}

export const api = new ApiService();
