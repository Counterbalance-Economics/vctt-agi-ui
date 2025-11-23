
import { useState, useEffect } from 'react';
import { 
  Terminal, Clock, FileCode, Play, CheckCircle, XCircle, 
  AlertTriangle, Info, Zap, TrendingUp 
} from 'lucide-react';

const API_BASE = 'https://vctt-agi-phase3-complete.abacusai.app';

interface Activity {
  id: number;
  session_id: string;
  activity_type: string;
  description: string;
  details: any;
  severity: 'info' | 'success' | 'warning' | 'error';
  created_at: string;
}

interface SessionProgress {
  session_id: string;
  current_phase: string;
  progress_percent: number;
  files_modified: number;
  commands_run: number;
  errors_encountered: number;
  last_activity: string;
  last_activity_at: string;
}

interface Props {
  sessionId: string;
  autoRefresh?: boolean;
  maxHeight?: string;
}

export default function SessionActivityFeed({ 
  sessionId, 
  autoRefresh = true,
  maxHeight = '500px'
}: Props) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [progress, setProgress] = useState<SessionProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSessionData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchSessionData, 3000); // Poll every 3 seconds
      return () => clearInterval(interval);
    }
  }, [sessionId, autoRefresh]);

  const fetchSessionData = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/session-activity/session/${sessionId}`);
      if (!response.ok) throw new Error('Failed to fetch session data');
      
      const data = await response.json();
      if (data.success) {
        setActivities(data.activities || []);
        setProgress(data.progress || null);
        setError(null);
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch session activities:', err);
      setError('Failed to load session activities');
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'session_started':
        return <Play className="w-4 h-4 text-blue-400" />;
      case 'file_created':
      case 'file_edited':
        return <FileCode className="w-4 h-4 text-green-400" />;
      case 'command_run':
        return <Terminal className="w-4 h-4 text-purple-400" />;
      case 'progress_update':
        return <TrendingUp className="w-4 h-4 text-blue-400" />;
      case 'checkpoint':
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default:
        return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'error':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'warning':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      default:
        return 'text-gray-400 bg-gray-800/50 border-gray-700';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Clock className="w-5 h-5 animate-spin text-blue-400 mr-2" />
        <span className="text-gray-400">Loading activity...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
        <XCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress Summary */}
      {progress && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" />
              <h3 className="text-white font-medium">Progress</h3>
            </div>
            <span className="text-sm text-gray-400">{progress.current_phase || 'Working'}</span>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">Completion</span>
              <span className="text-xs font-medium text-white">{progress.progress_percent}%</span>
            </div>
            <div className="w-full bg-gray-900/50 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                style={{ width: `${progress.progress_percent}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-lg font-bold text-white">{progress.files_modified}</div>
              <div className="text-xs text-gray-400">Files</div>
            </div>
            <div>
              <div className="text-lg font-bold text-white">{progress.commands_run}</div>
              <div className="text-xs text-gray-400">Commands</div>
            </div>
            <div>
              <div className="text-lg font-bold text-white">{progress.errors_encountered}</div>
              <div className="text-xs text-gray-400">Errors</div>
            </div>
          </div>

          {progress.last_activity && (
            <div className="mt-3 pt-3 border-t border-gray-700">
              <p className="text-xs text-gray-400">{progress.last_activity}</p>
              <p className="text-xs text-gray-500 mt-1">
                {formatTimestamp(progress.last_activity_at)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Activity Feed */}
      <div>
        <h3 className="text-white font-medium mb-3 flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          Recent Activity
        </h3>

        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Info className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No activity yet</p>
          </div>
        ) : (
          <div 
            className="space-y-2 overflow-y-auto pr-2"
            style={{ maxHeight }}
          >
            {activities.map((activity) => (
              <div 
                key={activity.id}
                className={`border rounded-lg p-3 transition-all ${getSeverityColor(activity.severity)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getActivityIcon(activity.activity_type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white leading-snug">
                      {activity.description}
                    </p>
                    
                    {activity.details && Object.keys(activity.details).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300">
                          View details
                        </summary>
                        <pre className="mt-1 text-xs text-gray-400 bg-gray-900/50 rounded p-2 overflow-x-auto">
                          {JSON.stringify(activity.details, null, 2)}
                        </pre>
                      </details>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimestamp(activity.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Auto-refresh indicator */}
      {autoRefresh && (
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <Clock className="w-3 h-3 animate-spin" />
          <span>Auto-refreshing every 3s</span>
        </div>
      )}
    </div>
  );
}
