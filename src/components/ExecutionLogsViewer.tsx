
import { useState, useEffect } from "react";
import { FileText, RefreshCw, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { getExecutionLogs } from "../services/autonomous-api";
import type { ExecutionLog } from "../services/autonomous-api";

/**
 * Execution Logs Viewer - Phase 3 Full Autonomy
 * 
 * Displays execution logs for a specific goal.
 */

interface ExecutionLogsViewerProps {
  goalId: number;
  isOpen: boolean;
}

export default function ExecutionLogsViewer({ goalId, isOpen }: ExecutionLogsViewerProps) {
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && goalId) {
      loadLogs();
      const interval = setInterval(loadLogs, 5000); // Refresh every 5s

      return () => clearInterval(interval);
    }
  }, [goalId, isOpen]);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await getExecutionLogs(goalId, 50);
      setLogs(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to load execution logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getLogColor = (level: string) => {
    switch (level) {
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      default:
        return 'text-gray-300';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 mt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Execution Logs</h3>
          {isLoading && <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />}
        </div>
        <button
          onClick={loadLogs}
          disabled={isLoading}
          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 rounded text-white text-sm font-medium transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-700 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Logs */}
      {logs.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No execution logs yet</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#4B5563 #1F2937' }}>
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-800/30 border border-gray-700/50 rounded">
              {getLogIcon(log.log_level)}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${getLogColor(log.log_level)}`}>
                  {log.message}
                </p>
                {log.details && Object.keys(log.details).length > 0 && (
                  <pre className="mt-1 text-xs text-gray-500 overflow-x-auto">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {new Date(log.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
