
import { MessageSquare, Plus, BarChart3, MessageCircle, TrendingUp } from 'lucide-react';
import type { Session } from '../types';

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
    const days = Math.floor(diffMins / 1440);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const getTrustColor = (trust: number | null) => {
    if (trust === null) return 'text-gray-500';
    if (trust >= 0.8) return 'text-green-400';
    if (trust >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getTrustBgColor = (trust: number | null) => {
    if (trust === null) return 'bg-gray-700';
    if (trust >= 0.8) return 'bg-green-500/20';
    if (trust >= 0.6) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

  return (
    <div className="w-72 min-w-72 max-w-72 bg-gray-900 border-r border-gray-700 flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="p-5 border-b border-gray-700 bg-gradient-to-b from-gray-800 to-gray-900">
        <h1 className="text-2xl font-bold text-vctt-gold mb-4 tracking-tight">VCTT-AGI</h1>
        <div className="space-y-2.5">
          <button
            onClick={onNewSession}
            className="w-full bg-vctt-gold hover:bg-yellow-600 text-gray-900 font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg"
          >
            <Plus size={20} strokeWidth={2.5} />
            New Chat
          </button>
          {onShowAnalytics && (
            <button
              onClick={onShowAnalytics}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] border border-gray-600"
            >
              <BarChart3 size={20} />
              Analytics
            </button>
          )}
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto">
        {sessions.length === 0 ? (
          <div className="p-8 text-center">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <MessageSquare size={40} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm font-medium">No conversations yet</p>
              <p className="text-gray-500 text-xs mt-2">Click "New Chat" to start</p>
            </div>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {sessions.map((session) => {
              const isActive = session.id === currentSessionId;
              const previewText = session.messages.length > 0
                ? session.messages[0].content.substring(0, 60)
                : 'New conversation';
              
              const messageCount = session.message_count ?? session.messages.length;
              const trustScore = session.trust_tau ?? null;

              return (
                <button
                  key={session.id}
                  onClick={() => onSelectSession(session)}
                  className={`w-full p-4 text-left rounded-xl transition-all ${
                    isActive 
                      ? 'bg-gray-800 border-2 border-vctt-gold shadow-lg' 
                      : 'bg-gray-800/50 border border-gray-700 hover:bg-gray-800 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-vctt-gold/20' : 'bg-gray-700'} flex-shrink-0`}>
                      <MessageSquare 
                        size={18} 
                        className={isActive ? 'text-vctt-gold' : 'text-gray-400'} 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white line-clamp-2 leading-snug mb-2">
                        {previewText}
                      </p>
                      
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs text-gray-400 font-medium">
                          {formatTime(session.last_activity || session.created_at)}
                        </span>
                        
                        {messageCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                            <MessageCircle size={12} />
                            {messageCount}
                          </span>
                        )}
                        
                        {trustScore !== null && (
                          <span 
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded ${getTrustBgColor(trustScore)} ${getTrustColor(trustScore)}`}
                          >
                            <TrendingUp size={12} />
                            {Math.round(trustScore * 100)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-5 border-t border-gray-700 bg-gray-800">
        <div className="text-xs text-gray-400 space-y-1">
          <p className="font-medium text-gray-300">© 2025 VCTT-AGI</p>
          <p>Phase 3 - Real LLMs + Committee</p>
        </div>
      </div>
    </div>
  );
}
