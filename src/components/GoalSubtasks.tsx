
import { useState, useEffect } from 'react';
import { CheckCircle, Circle, Clock, XCircle, AlertCircle } from 'lucide-react';

const API_BASE = 'https://vctt-agi-phase3-complete.abacusai.app';

interface Subtask {
  id: number;
  goal_id: number;
  title: string;
  description: string | null;
  status: string;
  order_index: number;
  estimated_effort: string | null;
  created_by: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Props {
  goalId: number;
  autoRefresh?: boolean;
}

export default function GoalSubtasks({ goalId, autoRefresh = true }: Props) {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubtasks();
    
    if (autoRefresh) {
      const interval = setInterval(fetchSubtasks, 5000); // Poll every 5 seconds
      return () => clearInterval(interval);
    }
  }, [goalId, autoRefresh]);

  const fetchSubtasks = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/goals/${goalId}/subtasks`);
      const data = await response.json();
      setSubtasks(data.subtasks || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch subtasks:', err);
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-400 animate-pulse" />;
      case 'blocked':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'pending':
      default:
        return <Circle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'blocked':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'pending':
      default:
        return 'bg-gray-800/50 text-gray-400 border-gray-700';
    }
  };

  const getEffortBadge = (effort: string | null) => {
    if (!effort) return null;
    
    const colors = {
      low: 'bg-green-500/20 text-green-400',
      medium: 'bg-yellow-500/20 text-yellow-400',
      high: 'bg-red-500/20 text-red-400',
    };
    
    return (
      <span className={`px-2 py-1 text-xs rounded ${colors[effort as keyof typeof colors] || 'bg-gray-800/50 text-gray-400'}`}>
        {effort} effort
      </span>
    );
  };

  const completedCount = subtasks.filter(st => st.status === 'completed').length;
  const progressPercent = subtasks.length > 0 
    ? Math.round((completedCount / subtasks.length) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Clock className="w-5 h-5 animate-spin text-blue-400" />
        <span className="ml-2 text-gray-400">Loading subtasks...</span>
      </div>
    );
  }

  if (subtasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <AlertCircle className="w-10 h-10 text-gray-600 mb-2" />
        <h3 className="text-gray-400 font-medium mb-1">No subtasks yet</h3>
        <p className="text-gray-500 text-sm">MIN will break this goal into subtasks when execution starts</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Progress</span>
          <span className="text-sm font-medium text-white">
            {completedCount} / {subtasks.length} completed ({progressPercent}%)
          </span>
        </div>
        <div className="w-full bg-gray-900/50 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Subtasks List */}
      <div className="space-y-3">
        {subtasks.map((subtask, index) => (
          <div 
            key={subtask.id}
            className={`border rounded-lg p-4 transition-all ${getStatusColor(subtask.status)}`}
          >
            <div className="flex items-start gap-3">
              {/* Status Icon */}
              <div className="flex-shrink-0 pt-0.5">
                {getStatusIcon(subtask.status)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-500">#{index + 1}</span>
                      <h4 className="text-sm font-medium text-white">
                        {subtask.title}
                      </h4>
                    </div>
                    {subtask.description && (
                      <p className="text-sm text-gray-400 mt-1">
                        {subtask.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {getEffortBadge(subtask.estimated_effort)}
                    <span className={`px-2 py-1 text-xs rounded capitalize ${
                      subtask.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      subtask.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                      subtask.status === 'blocked' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-700/50 text-gray-400'
                    }`}>
                      {subtask.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>Created by {subtask.created_by}</span>
                  {subtask.completed_at && (
                    <span>✓ Completed</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
