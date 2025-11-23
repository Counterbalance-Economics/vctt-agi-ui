
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://vctt-agi-engine-3q3r.onrender.com';

/**
 * Autonomous Execution API Client - Phase 3 Full Autonomy
 */

export interface ExecutionQueueStatus {
  total: number;
  by_status: Array<{ status: string; count: number; avg_priority: number }>;
  max_parallel: number;
}

export interface ExecutionLog {
  id: number;
  queue_id: number;
  goal_id: number;
  log_level: string;
  message: string;
  details: any;
  timestamp: string;
}

export interface CoachProposal {
  id: number;
  queue_id?: number;
  goal_id: number;
  proposal_type: string;
  title: string;
  description: string;
  rationale?: string;
  estimated_impact?: string;
  auto_approved: boolean;
  status: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

/**
 * Get autonomous execution system status
 */
export async function getExecutionStatus(): Promise<ExecutionQueueStatus> {
  const response = await axios.get(`${API_BASE_URL}/api/autonomous/status`);
  return response.data.status;
}

/**
 * Manually queue a goal for execution
 */
export async function queueGoalForExecution(goalId: number, priority?: number) {
  const response = await axios.post(`${API_BASE_URL}/api/autonomous/queue`, {
    goal_id: goalId,
    priority,
  });
  return response.data;
}

/**
 * Get execution logs for a goal
 */
export async function getExecutionLogs(goalId: number, limit?: number): Promise<ExecutionLog[]> {
  const response = await axios.get(`${API_BASE_URL}/api/autonomous/logs/${goalId}`, {
    params: { limit },
  });
  return response.data.logs;
}

/**
 * Trigger orchestration manually (admin)
 */
export async function triggerOrchestration() {
  const response = await axios.post(`${API_BASE_URL}/api/autonomous/orchestrate`);
  return response.data;
}

export default {
  getExecutionStatus,
  queueGoalForExecution,
  getExecutionLogs,
  triggerOrchestration,
};
