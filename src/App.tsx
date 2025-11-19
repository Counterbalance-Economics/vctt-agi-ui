
import { useState, useEffect } from 'react';
import LeftSidebar from './components/LeftSidebar';
import ChatPanel from './components/ChatPanel';
import RightSidebar from './components/RightSidebar';
import AdminPanel from './components/AdminPanel';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import type { Session, Message, VCTTState, StepResponse } from './types';
import { api } from './services/api';

function App() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [vcttState, setVcttState] = useState<VCTTState>({
    Voice: 85,
    Choice: 72,
    Transparency: 91,
    'Trust (τ)': 88,
    Regulation: 'normal'
  });
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [lastResponse, setLastResponse] = useState<StepResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);

  // Load persisted sessions from backend on mount
  useEffect(() => {
    loadBackendSessions();
  }, []);

  const loadBackendSessions = async () => {
    setLoadingSessions(true);
    try {
      const backendSessions = await api.getAllSessions(undefined, 50);
      
      if (backendSessions.length > 0) {
        // Transform backend sessions to UI format
        const uiSessions: Session[] = backendSessions.map(bs => ({
          id: bs.session_id,
          title: 'Session',
          created_at: new Date(bs.created_at),
          messages: [], // Will load on demand
          user_id: bs.user_id,
          message_count: bs.message_count,
          last_activity: new Date(bs.last_activity),
          trust_tau: bs.trust_tau,
          repair_count: bs.repair_count,
        }));
        
        setSessions(uiSessions);
        // Don't auto-select, let user choose
      } else {
        // No backend sessions, create initial empty session
        handleNewSession();
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      // Fallback: create new session
      handleNewSession();
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!currentSession || isLoading) return;

    setIsLoading(true);

    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    const updatedMessages = [...currentSession.messages, userMessage];
    const updatedSession = { ...currentSession, messages: updatedMessages };
    setCurrentSession(updatedSession);
    updateSessionInList(updatedSession);

    try {
      let sessionId = currentSession.id;
      
      // If this is the first message in the session, start a new backend session
      if (currentSession.messages.length === 0) {
        sessionId = await api.startSession('default-user', content);
        // Update session with backend session ID
        updatedSession.id = sessionId;
        setCurrentSession(updatedSession);
        updateSessionInList(updatedSession);
      }
      
      // Call backend API
      const response = await api.sendStep(sessionId, content);
      
      // Add assistant message
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date()
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      const finalSession = { ...updatedSession, messages: finalMessages };
      setCurrentSession(finalSession);
      updateSessionInList(finalSession);

      // Update VCTT state
      setVcttState(response.state);
      setLastResponse(response);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSessionInList = (updatedSession: Session) => {
    setSessions(prev =>
      prev.map(s => s.id === updatedSession.id ? updatedSession : s)
    );
  };

  const handleNewSession = () => {
    const newSession: Session = {
      id: crypto.randomUUID(),
      title: 'New Conversation',
      created_at: new Date(),
      messages: []
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSession(newSession);
  };

  const handleSelectSession = async (session: Session) => {
    // If session has messages already loaded, just select it
    if (session.messages.length > 0) {
      setCurrentSession(session);
      return;
    }

    // Load session history from backend
    setIsLoading(true);
    try {
      const history = await api.getSessionHistory(session.id);
      
      if (history && history.messages) {
        const loadedMessages: Message[] = history.messages.map((m: any) => ({
          id: m.id || crypto.randomUUID(),
          role: m.role,
          content: m.content,
          timestamp: new Date(m.timestamp),
        }));

        const loadedSession: Session = {
          ...session,
          messages: loadedMessages,
        };

        // Update session in list
        setSessions(prev => 
          prev.map(s => s.id === session.id ? loadedSession : s)
        );
        setCurrentSession(loadedSession);

        // Update VCTT state if available
        if (history.internal_state) {
          const state = history.internal_state;
          setVcttState({
            Voice: Math.round((1 - (state.sim?.tension || 0)) * 100),
            Choice: Math.round((1 - (state.sim?.emotional_intensity || 0)) * 100),
            Transparency: Math.round((1 - (state.sim?.uncertainty || 0)) * 100),
            'Trust (τ)': Math.round((state.trust_tau || 0) * 100),
            Regulation: state.regulation || 'normal',
          });
        }
      } else {
        // No history found, just set it as current
        setCurrentSession(session);
      }
    } catch (error) {
      console.error('Error loading session history:', error);
      setCurrentSession(session);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminToggle = (password: string) => {
    if (password === 'vctt2025') {
      setIsAdminMode(!isAdminMode);
      return true;
    }
    return false;
  };

  const handleForceRegulation = (mode: 'normal' | 'clarify' | 'slow_down') => {
    setVcttState(prev => ({ ...prev, Regulation: mode }));
  };

  if (loadingSessions) {
    return (
      <div className="flex h-screen w-screen bg-vctt-dark text-white items-center justify-center">
        <div className="text-center">
          <div className="text-vctt-gold text-2xl font-bold mb-4">VCTT-AGI</div>
          <div className="text-gray-400">Loading sessions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-vctt-dark text-white overflow-hidden">
      {/* Left Sidebar */}
      <LeftSidebar
        sessions={sessions}
        currentSessionId={currentSession?.id}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
      />

      {/* Center Chat Panel */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <ChatPanel
          session={currentSession}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          trustScore={vcttState['Trust (τ)']}
        />
        
        {/* Analytics Dashboard - Overlays center when shown */}
        {showAnalytics && (
          <AnalyticsDashboard onClose={() => setShowAnalytics(false)} />
        )}
      </div>

      {/* Right Sidebar */}
      <RightSidebar
        vcttState={vcttState}
        isAdminMode={isAdminMode}
        onAdminToggle={handleAdminToggle}
        sessionId={currentSession?.id}
        onShowAnalytics={() => setShowAnalytics(true)}
      />

      {/* Admin Panel Overlay */}
      {isAdminMode && lastResponse && (
        <AdminPanel
          response={lastResponse}
          onClose={() => setIsAdminMode(false)}
          onForceRegulation={handleForceRegulation}
        />
      )}
    </div>
  );
}

export default App;
