
import { getApiUrl } from "../config/api";

const BACKEND_URL = getApiUrl();

// EXACT backend schema
export interface Goal {
  id: number;
  title: string;
  description: string | null;
  status: "proposed" | "active" | "paused" | "completed" | "abandoned";
  priority: number; // 1-5
  owner: "human" | "system" | "min";
  parent_goal_id: number | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  metadata: any;
  child_goals?: Goal[];
  constraints?: any[];
  progress_entries?: ProgressEntry[];
}

export interface ProgressEntry {
  id: number;
  goal_id: number;
  progress_percent: number;
  milestone: string | null;
  notes: string | null;
  recorded_by: string;
  recorded_at: string;
  metadata: any;
}

export interface CreateGoalDto {
  title: string;
  description?: string;
  priority?: number; // 1-5, defaults to 3
  owner: "human" | "system" | "min";
  parentGoalId?: number;
  createdBy: string;
  metadata?: any;
}

export interface UpdateGoalDto {
  title?: string;
  description?: string;
  status?: "proposed" | "active" | "paused" | "completed" | "abandoned";
  priority?: number;
  metadata?: any;
}

export interface GoalProgress {
  goal_id: number;
  progressPercent: number;
  milestone?: string;
  notes?: string;
  recordedBy: string;
}

export interface GoalTree {
  goal: Goal;
  children: GoalTree[];
}

export interface StateAwareness {
  active_goals: Goal[];
  recent_goals: Goal[];
  goal_statistics: {
    total_goals: number;
    active_goals: number;
    completed_goals: number;
    completion_rate: number;
  } | null;
}

class GoalsApiService {
  private baseUrl: string | null;

  constructor() {
    this.baseUrl = BACKEND_URL;
  }

  async createGoal(dto: CreateGoalDto): Promise<Goal> {
    if (!this.baseUrl) throw new Error("Backend URL not configured");

    const response = await fetch(`${this.baseUrl}/api/goals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create goal: ${error}`);
    }

    const data = await response.json();
    return data.goal;
  }

  async getAllGoals(filters?: { status?: string }): Promise<Goal[]> {
    if (!this.baseUrl) return [];

    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);

      const url = `${this.baseUrl}/api/goals${params.toString() ? `?${params}` : ""}`;
      const response = await fetch(url);

      if (!response.ok) return [];

      const data = await response.json();
      return data.goals || [];
    } catch (error) {
      console.error("Error fetching goals:", error);
      return [];
    }
  }

  async getActiveGoals(): Promise<Goal[]> {
    if (!this.baseUrl) return [];

    try {
      const response = await fetch(`${this.baseUrl}/api/goals/active`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.goals || [];
    } catch (error) {
      console.error("Error fetching active goals:", error);
      return [];
    }
  }

  async getGoalTree(): Promise<GoalTree[]> {
    if (!this.baseUrl) return [];

    try {
      const response = await fetch(`${this.baseUrl}/api/goals/tree`);
      if (!response.ok) return [];
      const data = await response.json();
      const goals = data.tree || [];
      
      // Transform backend format (Goal with child_goals) to frontend format (GoalTree)
      const transformGoal = (goal: any): GoalTree => ({
        goal: goal,
        children: (goal.child_goals || []).map(transformGoal)
      });
      
      return goals.map(transformGoal);
    } catch (error) {
      console.error("Error fetching goal tree:", error);
      return [];
    }
  }

  async getStateAwareness(): Promise<StateAwareness | null> {
    if (!this.baseUrl) return null;

    try {
      const response = await fetch(`${this.baseUrl}/api/goals/state-awareness`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error("Error fetching state awareness:", error);
      return null;
    }
  }

  async getGoal(id: number): Promise<Goal | null> {
    if (!this.baseUrl) return null;

    try {
      const response = await fetch(`${this.baseUrl}/api/goals/${id}`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.goal;
    } catch (error) {
      console.error("Error fetching goal:", error);
      return null;
    }
  }

  async updateGoal(id: number, dto: UpdateGoalDto): Promise<Goal> {
    if (!this.baseUrl) throw new Error("Backend URL not configured");

    const response = await fetch(`${this.baseUrl}/api/goals/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to update goal: ${error}`);
    }

    const data = await response.json();
    return data.goal;
  }

  async updateGoalStatus(id: number, status: string): Promise<Goal> {
    if (!this.baseUrl) throw new Error("Backend URL not configured");

    const response = await fetch(`${this.baseUrl}/api/goals/${id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to update goal status: ${error}`);
    }

    const data = await response.json();
    return data.goal;
  }

  async updateGoalProgress(data: GoalProgress): Promise<void> {
    if (!this.baseUrl) throw new Error("Backend URL not configured");

    const response = await fetch(`${this.baseUrl}/api/goals/${data.goal_id}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        progressPercent: data.progressPercent,
        milestone: data.milestone,
        notes: data.notes,
        recordedBy: data.recordedBy,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to update goal progress: ${error}`);
    }
  }

  async deleteGoal(id: number): Promise<void> {
    if (!this.baseUrl) throw new Error("Backend URL not configured");

    const response = await fetch(`${this.baseUrl}/api/goals/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to delete goal: ${error}`);
    }
  }
}

export const goalsApi = new GoalsApiService();
