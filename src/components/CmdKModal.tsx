
import React, { useState, useEffect, useRef } from 'react';

interface CmdKModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCode: string;
  filePath: string;
  onAccept: (editedCode: string, stats: EditStats) => void;
}

export interface EditStats {
  linesAdded: number;
  linesDeleted: number;
  linesModified: number;
  tokensUsed: number;
  cost: number;
  latency: number;
  trustTau?: number;        // MIN's trust metric (0-1)
  grokConfidence?: number;  // Grok-4.1 verification confidence (0-1)
}

const BACKEND_URL = 'https://vctt-agi-phase3-complete.abacusai.app';

export const CmdKModal: React.FC<CmdKModalProps> = ({
  isOpen,
  onClose,
  selectedCode,
  filePath,
  onAccept,
}) => {
  const [instruction, setInstruction] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [editedCode, setEditedCode] = useState('');
  const [stats, setStats] = useState<EditStats | null>(null);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSubmit = async () => {
    if (!instruction.trim() || isProcessing) return;

    setIsProcessing(true);
    setError('');
    setEditedCode('');
    setStats(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/ide/code-edit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instruction: instruction.trim(),
          originalCode: selectedCode,
          filePath,
          context: {
            language: getLanguageFromPath(filePath),
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      setEditedCode(data.editedCode);
      setStats({
        linesAdded: data.stats.linesAdded || 0,
        linesDeleted: data.stats.linesDeleted || 0,
        linesModified: data.stats.linesModified || data.stats.linesChanged || 0,
        tokensUsed: data.stats.tokensUsed || 0,
        cost: data.stats.costUSD || data.stats.cost || 0,
        latency: data.stats.latencyMs || data.stats.latency || 0,
        trustTau: data.verification?.trustTau,         // MIN's trust metric
        grokConfidence: data.verification?.grokConfidence,  // Grok-4.1 confidence
      });
    } catch (err: any) {
      setError(err.message || 'Failed to process edit');
      console.error('Edit error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAccept = () => {
    if (editedCode && stats) {
      onAccept(editedCode, stats);
      onClose();
      // Reset state
      setInstruction('');
      setEditedCode('');
      setStats(null);
      setError('');
    }
  };

  const handleReject = () => {
    setEditedCode('');
    setStats(null);
    setError('');
    setInstruction('');
  };

  const getLanguageFromPath = (path: string): string => {
    const ext = path.split('.').pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      ts: 'typescript',
      tsx: 'typescript',
      js: 'javascript',
      jsx: 'javascript',
      py: 'python',
      json: 'json',
      md: 'markdown',
      css: 'css',
      html: 'html',
    };
    return langMap[ext || ''] || 'typescript';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">✨</div>
            <div>
              <h2 className="text-lg font-semibold text-white">AI Code Edit</h2>
              <p className="text-sm text-gray-400">MIN Autonomous Engine · {filePath}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Input Section */}
        <div className="px-6 py-4 border-b border-gray-800">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            What would you like me to do?
          </label>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit();
              }}
              placeholder="e.g. Add error handling, Fix the bug, Add comments..."
              disabled={isProcessing}
              className="flex-1 bg-gray-800 text-white rounded px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <button
              onClick={handleSubmit}
              disabled={isProcessing || !instruction.trim()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : 'Apply'}
            </button>
          </div>

          {error && (
            <div className="mt-2 p-3 bg-red-900/20 border border-red-700/50 rounded text-red-400 text-sm">
              ❌ {error}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-auto px-6 py-4">
          {isProcessing && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                <p className="mt-4 text-gray-400">Claude is thinking...</p>
              </div>
            </div>
          )}

          {!isProcessing && !editedCode && !error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-4">🎯</div>
                <p>Enter an instruction to start editing</p>
              </div>
            </div>
          )}

          {editedCode && stats && (
            <div className="space-y-4">
              {/* Stats */}
              <div className="bg-gray-800 rounded p-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-400">+{stats.linesAdded}</div>
                    <div className="text-xs text-gray-400">Added</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-400">-{stats.linesDeleted}</div>
                    <div className="text-xs text-gray-400">Deleted</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">~{stats.linesModified}</div>
                    <div className="text-xs text-gray-400">Modified</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-400">{stats.tokensUsed}</div>
                    <div className="text-xs text-gray-400">Tokens</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-400">${stats.cost.toFixed(4)}</div>
                    <div className="text-xs text-gray-400">Cost</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-cyan-400">{stats.latency}ms</div>
                    <div className="text-xs text-gray-400">Latency</div>
                  </div>
                  {stats.trustTau !== undefined && (
                    <div className="bg-indigo-900/30 border border-indigo-700/50 rounded px-2">
                      <div className="text-2xl font-bold text-indigo-300">τ {stats.trustTau.toFixed(2)}</div>
                      <div className="text-xs text-indigo-400">Trust</div>
                    </div>
                  )}
                  {stats.grokConfidence !== undefined && (
                    <div className="bg-emerald-900/30 border border-emerald-700/50 rounded px-2">
                      <div className="text-2xl font-bold text-emerald-300">{(stats.grokConfidence * 100).toFixed(0)}%</div>
                      <div className="text-xs text-emerald-400">Grok</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Side-by-side Diff */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 rounded overflow-hidden">
                  <div className="px-4 py-2 bg-red-900/30 border-b border-red-700/50 text-red-300 text-sm font-semibold">
                    Original
                  </div>
                  <pre className="p-4 text-xs text-gray-300 overflow-auto max-h-96 font-mono">
                    {selectedCode}
                  </pre>
                </div>
                <div className="bg-gray-800 rounded overflow-hidden">
                  <div className="px-4 py-2 bg-green-900/30 border-b border-green-700/50 text-green-300 text-sm font-semibold">
                    Edited
                  </div>
                  <pre className="p-4 text-xs text-gray-300 overflow-auto max-h-96 font-mono">
                    {editedCode}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {editedCode && stats && (
          <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between">
            <button
              onClick={handleReject}
              className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded font-medium text-sm transition-colors"
            >
              ❌ Reject
            </button>
            <button
              onClick={handleAccept}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium text-sm transition-colors"
            >
              ✅ Accept & Commit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
