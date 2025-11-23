
import { useState, useEffect } from 'react';
import { Play, Pause, AlertCircle } from 'lucide-react';
import MinThinkingSpinner from './MinThinkingSpinner';

const API_BASE = 'https://vctt-agi-phase3-complete.abacusai.app';

interface ExecutionStatus {
  isRunning: boolean;
  currentGoal: {
    id: number;
    title: string;
    status: string;
    priority: number;
  } | null;
  startedAt: string | null;
  lastHeartbeat: string | null;
  totalGoalsProcessed: number;
  totalSubtasksCompleted: number;
  errorMessage: string | null;
}

export default function ExecutionControls() {
  const [status, setStatus] = useState<ExecutionStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Poll execution status every 5 seconds
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/execution/status`);
      const data = await response.json();
      setStatus(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch execution status:', err);
    }
  };

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/execution/start`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to start execution');
      }
      
      await fetchStatus();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/execution/stop`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to stop execution');
      }
      
      await fetchStatus();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!status) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <MinThinkingSpinner message="Loading execution status..." size="sm" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {/* Status Indicator */}
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
          status.isRunning 
            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
            : 'bg-gray-800/50 text-gray-400 border border-gray-700'
        }`}>
          {status.isRunning ? (
            <MinThinkingSpinner 
              message="MIN is Running" 
              size="sm" 
            />
          ) : (
            <>
              <Pause className="w-4 h-4" />
              <span className="font-medium">MIN is Paused</span>
            </>
          )}
        </div>

        {/* Current Goal */}
        {status.isRunning && status.currentGoal && (
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <span className="text-gray-500">Working on:</span>
            <span className="font-medium text-white truncate max-w-[300px]">
              {status.currentGoal.title}
            </span>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-2">
        {status.isRunning ? (
          <button
            onClick={handleStop}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Pause className="w-4 h-4" />
            <span>{loading ? 'Stopping...' : 'Pause MIN'}</span>
          </button>
        ) : (
          <button
            onClick={handleStart}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" />
            <span>{loading ? 'Starting...' : 'Start MIN'}</span>
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-gray-400 ml-auto">
        <div>
          <span className="text-gray-500">Goals:</span>{' '}
          <span className="text-white font-medium">{status.totalGoalsProcessed}</span>
        </div>
        <div>
          <span className="text-gray-500">Subtasks:</span>{' '}
          <span className="text-white font-medium">{status.totalSubtasksCompleted}</span>
        </div>
      </div>

      {/* Error Message */}
      {(error || status.errorMessage) && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg border border-red-500/30">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error || status.errorMessage}</span>
        </div>
      )}
    </div>
  );
}
