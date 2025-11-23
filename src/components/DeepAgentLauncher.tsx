
import { useState } from 'react';
import { Terminal, ExternalLink, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { deepAgentSessionsApi, CreateDeepAgentSessionDto, DeepAgentSession } from '../services/deepagent-sessions-api';

interface Props {
  goalId?: number;
  subtaskId?: number;
  taskTitle: string;
  taskDescription: string;
  onSessionCreated?: (session: DeepAgentSession) => void;
  onClose?: () => void;
}

export default function DeepAgentLauncher({
  goalId,
  subtaskId,
  taskTitle,
  taskDescription,
  onSessionCreated,
  onClose
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<DeepAgentSession | null>(null);
  const [requirements, setRequirements] = useState<string[]>([]);
  const [newRequirement, setNewRequirement] = useState('');

  const handleAddRequirement = () => {
    if (newRequirement.trim()) {
      setRequirements([...requirements, newRequirement.trim()]);
      setNewRequirement('');
    }
  };

  const handleRemoveRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const handleCreateSession = async () => {
    try {
      setLoading(true);
      setError(null);

      const dto: CreateDeepAgentSessionDto = {
        goalId,
        subtaskId,
        initiatedBy: 'human',
        context: {
          title: taskTitle,
          description: taskDescription,
          requirements: requirements.length > 0 ? requirements : undefined,
        }
      };

      const createdSession = await deepAgentSessionsApi.createSession(dto);
      setSession(createdSession);
      
      if (onSessionCreated) {
        onSessionCreated(createdSession);
      }

      // Open DeepAgent in a new tab (placeholder - you'll configure this URL)
      // For now, we'll just open the ChatLLM Teams DeepAgent
      const deepAgentUrl = 'https://apps.abacus.ai/chatllm/?appId=appllm_engineer';
      window.open(deepAgentUrl, '_blank');

    } catch (err: any) {
      setError(err.message || 'Failed to create DeepAgent session');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!session) return;

    try {
      setLoading(true);
      await deepAgentSessionsApi.updateSession(session.sessionUuid, {
        status: 'completed',
        result: {
          completedManually: true,
          timestamp: new Date().toISOString(),
        }
      });
      
      if (onClose) {
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to mark session complete');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkFailed = async () => {
    if (!session) return;

    try {
      setLoading(true);
      await deepAgentSessionsApi.updateSession(session.sessionUuid, {
        status: 'failed',
        errorMessage: 'Marked as failed by user',
      });
      
      if (onClose) {
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to mark session failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Terminal className="w-6 h-6 text-blue-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">
            Work in DeepAgent
          </h3>
          <p className="text-sm text-gray-400">
            Open this task in DeepAgent's coding environment to work on it with full tool access
          </p>
        </div>
      </div>

      {/* Task Context */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3">
        <div>
          <label className="text-xs text-gray-400 block mb-1">Task Title</label>
          <div className="text-sm text-white font-medium">{taskTitle}</div>
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">Description</label>
          <div className="text-sm text-gray-300">{taskDescription}</div>
        </div>
      </div>

      {/* Requirements (Optional) */}
      {!session && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-white block">
            Additional Requirements (Optional)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newRequirement}
              onChange={(e) => setNewRequirement(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddRequirement()}
              placeholder="Add a requirement..."
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleAddRequirement}
              disabled={!newRequirement.trim()}
              className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add
            </button>
          </div>

          {requirements.length > 0 && (
            <div className="space-y-2">
              {requirements.map((req, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-800/50 border border-gray-700 rounded px-3 py-2">
                  <span className="text-sm text-gray-300 flex-1">{req}</span>
                  <button
                    onClick={() => handleRemoveRequirement(index)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-300">{error}</div>
        </div>
      )}

      {/* Session Created - Show Actions */}
      {session && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-sm font-medium text-green-300">
              DeepAgent session created successfully!
            </span>
          </div>
          <div className="text-xs text-gray-400">
            Session ID: {session.sessionUuid}
          </div>
          <p className="text-sm text-gray-300">
            DeepAgent has been opened in a new tab. Work on the task there, and when you're done, come back here to mark it complete.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-700">
        {!session ? (
          <>
            <button
              onClick={handleCreateSession}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating Session...</span>
                </>
              ) : (
                <>
                  <ExternalLink className="w-5 h-5" />
                  <span>Open in DeepAgent</span>
                </>
              )}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            )}
          </>
        ) : (
          <>
            <button
              onClick={handleMarkComplete}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Mark Complete</span>
                </>
              )}
            </button>
            <button
              onClick={handleMarkFailed}
              disabled={loading}
              className="px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Mark Failed
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            )}
          </>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-sm text-blue-300">
        <strong>Phase 1 Manual Bridge:</strong> This will create a DeepAgent session and open it in a new tab. 
        Work on the task in DeepAgent, then return here to mark it complete. Future phases will automate this process.
      </div>
    </div>
  );
}
