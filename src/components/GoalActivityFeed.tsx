
import { useState, useEffect } from 'react';
import { Activity, User, Bot, Settings, CheckCircle, XCircle, AlertCircle, MessageSquare } from 'lucide-react';

const API_BASE = 'https://vctt-agi-phase3-complete.abacusai.app';

interface ActivityLog {
  id: number;
  goal_id: number;
  actor: string;
  activity_type: string;
  message: string;
  metadata: any;
  created_at: string;
}

interface Props {
  goalId: number;
  autoRefresh?: boolean;
}

export default function GoalActivityFeed({ goalId, autoRefresh = true }: Props) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
    
    if (autoRefresh) {
      const interval = setInterval(fetchActivities, 5000); // Poll every 5 seconds
      return () => clearInterval(interval);
    }
  }, [goalId, autoRefresh]);

  const fetchActivities = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/goals/${goalId}/activity?limit=50`);
      const data = await response.json();
      setActivities(data.activity || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch activity:', err);
      setLoading(false);
    }
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'started':
        return <Play className="w-4 h-4 text-blue-400" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'blocked':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'progress':
        return <Activity className="w-4 h-4 text-purple-400" />;
      case 'subtask_created':
        return <Settings className="w-4 h-4 text-yellow-400" />;
      case 'question':
        return <AlertCircle className="w-4 h-4 text-orange-400" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-gray-400" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getActorIcon = (actor: string) => {
    if (actor === 'min') {
      return <Bot className="w-5 h-5 text-blue-400" />;
    } else if (actor === 'human') {
      return <User className="w-5 h-5 text-green-400" />;
    } else {
      return <Settings className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Activity className="w-6 h-6 animate-spin text-blue-400" />
        <span className="ml-2 text-gray-400">Loading activity...</span>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Activity className="w-12 h-12 text-gray-600 mb-3" />
        <h3 className="text-gray-400 font-medium mb-1">No activity yet</h3>
        <p className="text-gray-500 text-sm">Activity will appear here when MIN starts working on this goal</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Activity Timeline */}
      <div className="relative space-y-4">
        {/* Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-800" />

        {activities.map((activity) => (
          <div key={activity.id} className="relative flex gap-4">
            {/* Actor Avatar */}
            <div className="relative z-10 flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center">
                {getActorIcon(activity.actor)}
              </div>
            </div>

            {/* Activity Card */}
            <div className="flex-1 bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-800/70 transition-colors">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getActivityIcon(activity.activity_type)}
                  <span className="text-sm font-medium text-gray-300 capitalize">
                    {activity.activity_type.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-gray-500">by {activity.actor}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {formatTimestamp(activity.created_at)}
                </span>
              </div>

              {/* Message */}
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                {activity.message}
              </p>

              {/* Metadata (if present) */}
              {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                <details className="mt-3">
                  <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                    Show details
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-900/50 rounded text-xs text-gray-400 overflow-x-auto">
                    {JSON.stringify(activity.metadata, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Play({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
