
import { MessageSquare, Plus, BarChart3, MessageCircle } from 'lucide-react';
import type { Session } from '../types';
import TrustIndicator from './TrustIndicator';

interface LeftSidebarProps {
  sessions: Session[];
  currentSessionId?: string;
  onSelectSession: (session: Session) => void;
  onNewSession: () => void;
  onShowAnalytics?: () => void;
}

export default function LeftSidebar({ sessions, currentSessionId, onSelectSession, onNewSession, onShowAnalytics }: LeftSidebarProps) {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="w-64 min-w-64 max-w-64 bg-vctt-panel border-r border-gray-700 flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold text-vctt-gold mb-4">VCTT-AGI</h1>
        <div className="space-y-2">
          <button
            onClick={onNewSession}
            className="w-full bg-vctt-gold hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Plus size={20} />
            New Chat
          </button>
          {onShowAnalytics && (
            <button
              onClick={onShowAnalytics}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <BarChart3 size={20} />
              Analytics
            </button>
          )}
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto">
        {sessions.length === 0 && (
          <div className="p-4 text-center text-gray-400 text-sm">
            No sessions yet. Start a new chat!
          </div>
        )}
        {sessions.map((session) => {
          const isActive = session.id === currentSessionId;
          const previewText = session.messages.length > 0
            ? session.messages[0].content.substring(0, 50) + '...'
            : 'New conversation';
          
          // Use backend metadata if available
          const messageCount = session.message_count ?? session.messages.length;
          const trustScore = session.trust_tau ? Math.round(session.trust_tau * 100) : null;

          return (
            <button
              key={session.id}
              onClick={() => onSelectSession(session)}
              className={`w-full p-4 text-left border-b border-gray-700 hover:bg-gray-800 transition-colors ${
                isActive ? 'bg-gray-800 border-l-4 border-vctt-gold' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <MessageSquare size={18} className="text-gray-400 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {previewText}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-400">
                      {formatTime(session.last_activity || session.created_at)}
                    </p>
                    {messageCount > 0 && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <MessageCircle size={12} />
                        {messageCount}
                      </span>
                    )}
                  </div>
                  {trustScore !== null && (
                    <div className="mt-2">
                      <TrustIndicator trustScore={trustScore} compact />
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 text-xs text-gray-400">
        <p>© 2025 VCTT-AGI</p>
        <p className="mt-1">Phase 3 - Real LLMs + Committee</p>
      </div>
    </div>
  );
}
