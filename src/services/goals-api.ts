
import { getApiUrl } from "../config/api";

const BACKEND_URL = getApiUrl();

export interface Goal {
  id: number;
  goal_text: string;
  goal_type: string;
  priority: number;
  status: string;
  parent_goal_id: number | null;
  created_at: string;
  updated_at: string;
  target_date: string | null;
  completion_percentage: number;
  metadata: any;
}

export interface CreateGoalDto {
  goal_text: string;
  goal_type: string;
  priority: number;
  parent_goal_id?: number;
  target_date?: string;
  metadata?: any;
}

export interface UpdateGoalDto {
  goal_text?: string;
  goal_type?: string;
  priority?: number;
  target_date?: string;
  metadata?: any;
}

export interface GoalProgress {
  goal_id: number;
  progress_percentage: number;
  notes?: string;
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
  };
}

class GoalsApiService {
  private baseUrl: string | null;

  constructor() {
    this.baseUrl = BACKEND_URL;
  }

  /**
   * Create a new goal
   */
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

    return await response.json();
  }

  /**
   * Get all goals
   */
  async getAllGoals(filters?: { status?: string; type?: string }): Promise<Goal[]> {
    if (!this.baseUrl) return [];

    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);
      if (filters?.type) params.append("type", filters.type);

      const url = `${this.baseUrl}/api/goals${params.toString() ? `?${params}` : ""}`;
      const response = await fetch(url);

      if (!response.ok) return [];

      return await response.json();
    } catch (error) {
      console.error("Error fetching goals:", error);
      return [];
    }
  }

  /**
   * Get active goals
   */
  async getActiveGoals(): Promise<Goal[]> {
    if (!this.baseUrl) return [];

    try {
      const response = await fetch(`${this.baseUrl}/api/goals/active`);
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error("Error fetching active goals:", error);
      return [];
    }
  }

  /**
   * Get goal tree (hierarchical structure)
   */
  async getGoalTree(): Promise<GoalTree[]> {
    if (!this.baseUrl) return [];

    try {
      const response = await fetch(`${this.baseUrl}/api/goals/tree`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.tree || [];
    } catch (error) {
      console.error("Error fetching goal tree:", error);
      return [];
    }
  }

  /**
   * Get state awareness (system's understanding of goals)
   */
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

  /**
   * Get a single goal by ID
   */
  async getGoal(id: number): Promise<Goal | null> {
    if (!this.baseUrl) return null;

    try {
      const response = await fetch(`${this.baseUrl}/api/goals/${id}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error("Error fetching goal:", error);
      return null;
    }
  }

  /**
   * Update a goal
   */
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

    return await response.json();
  }

  /**
   * Update goal status
   */
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

    return await response.json();
  }

  /**
   * Update goal progress
   */
  async updateGoalProgress(data: GoalProgress): Promise<void> {
    if (!this.baseUrl) throw new Error("Backend URL not configured");

    const response = await fetch(`${this.baseUrl}/api/goals/${data.goal_id}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        progress_percentage: data.progress_percentage,
        notes: data.notes,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to update goal progress: ${error}`);
    }
  }

  /**
   * Delete a goal
   */
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
