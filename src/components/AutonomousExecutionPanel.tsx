
import { useState, useEffect } from "react";
import { Play, Pause, Activity, Zap, AlertCircle } from "lucide-react";
import { getExecutionStatus, triggerOrchestration } from "../services/autonomous-api";
import type { ExecutionQueueStatus } from "../services/autonomous-api";

/**
 * Autonomous Execution Panel - Phase 3 Full Autonomy
 * 
 * Displays real-time status of the autonomous execution system.
 */

export default function AutonomousExecutionPanel() {
  const [status, setStatus] = useState<ExecutionQueueStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 10000); // Refresh every 10s

    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    try {
      const data = await getExecutionStatus();
      setStatus(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to load execution status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTriggerOrchestration = async () => {
    setIsOrchestrating(true);
    try {
      await triggerOrchestration();
      await loadStatus(); // Refresh status
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsOrchestrating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-5 h-5 text-blue-400 animate-pulse" />
          <h3 className="text-lg font-semibold text-white">Autonomous Execution System</h3>
        </div>
        <p className="text-gray-400">Loading status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900/50 border border-red-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <h3 className="text-lg font-semibold text-white">Autonomous Execution System</h3>
        </div>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  const queuedCount = status?.by_status.find(s => s.status === 'queued')?.count || 0;
  const processingCount = status?.by_status.find(s => s.status === 'processing')?.count || 0;
  const utilization = status ? (processingCount / status.max_parallel) * 100 : 0;

  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Autonomous Execution System</h3>
        </div>
        <button
          onClick={handleTriggerOrchestration}
          disabled={isOrchestrating}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-white text-sm font-medium transition-colors flex items-center gap-2"
        >
          {isOrchestrating ? (
            <>
              <Pause className="w-4 h-4 animate-pulse" />
              Processing...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Trigger Now
            </>
          )}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-white mb-1">{queuedCount}</div>
          <div className="text-xs text-gray-400">Queued Tasks</div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-400 mb-1">{processingCount}</div>
          <div className="text-xs text-gray-400">Processing</div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400 mb-1">
            {utilization.toFixed(0)}%
          </div>
          <div className="text-xs text-gray-400">Utilization</div>
        </div>
      </div>

      {/* Capacity Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Parallel Capacity</span>
          <span className="text-white font-medium">
            {processingCount} / {status?.max_parallel || 0}
          </span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
            style={{ width: `${utilization}%` }}
          />
        </div>
      </div>

      {/* Info */}
      <p className="mt-4 text-xs text-gray-500">
        🤖 MIN automatically executes active goals every 30 seconds
      </p>
    </div>
  );
}
