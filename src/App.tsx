
import { useState, useEffect } from 'react';
import LeftSidebar from './components/LeftSidebar';
import ChatPanel from './components/ChatPanel';
import RightSidebar from './components/RightSidebar';
import AdminPanel from './components/AdminPanel';
import AnalyticsModal from './components/AnalyticsModal';
import type { Session, Message, VCTTState, StepResponse } from './types';
import { api } from './services/api';
import { websocketService, type PhaseEvent } from './services/websocket';

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
  const [currentPhase, setCurrentPhase] = useState<PhaseEvent | null>(null);
  const [isResuming, setIsResuming] = useState(false);

  // Debug: Log showAnalytics state changes
  useEffect(() => {
    console.log('📊 showAnalytics changed to:', showAnalytics);
  }, [showAnalytics]);

  // Sync current session ID to URL
  useEffect(() => {
    if (currentSession?.id) {
      const url = new URL(window.location.href);
      url.searchParams.set('session', currentSession.id);
      window.history.replaceState({}, '', url.toString());
    }
  }, [currentSession?.id]);

  // Load persisted sessions from backend on mount
  useEffect(() => {
    loadBackendSessions();
  }, []);

  const loadBackendSessions = async () => {
    setLoadingSessions(true);
    try {
      // Check URL for session to resume
      const urlParams = new URLSearchParams(window.location.search);
      const sessionToResume = urlParams.get('session');

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
        
        // If there's a session ID in URL, try to resume it
        if (sessionToResume) {
          const sessionToLoad = uiSessions.find(s => s.id === sessionToResume);
          if (sessionToLoad) {
            console.log('🔄 Resuming session from URL:', sessionToResume);
            setIsResuming(true);
            await handleSelectSession(sessionToLoad);
            setIsResuming(false);
          }
        }
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
    setCurrentPhase(null); // Reset phase tracker

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
      
      // Try WebSocket streaming first, fallback to REST on any error
      const useStreaming = true; // Enable streaming by default
      
      if (useStreaming) {
        try {
          let accumulatedContent = '';
          let streamingSucceeded = false;

          await new Promise<void>((resolve, reject) => {
            websocketService.streamQuery(
              sessionId,
              content,
              // onChunk
              (chunk: string) => {
                accumulatedContent += chunk;
                console.log('📦 Received chunk:', chunk.substring(0, 50) + '...');
              },
              // onPhase
              (phase: PhaseEvent) => {
                console.log('📊 Phase update:', phase.phase, phase.progress + '%');
                setCurrentPhase(phase);
              },
              // onComplete
              () => {
                console.log('✅ Streaming complete, accumulated:', accumulatedContent.length, 'chars');
                streamingSucceeded = true;
                setCurrentPhase(null);
                
                // Add final assistant message
                const assistantMessage: Message = {
                  id: crypto.randomUUID(),
                  role: 'assistant',
                  content: accumulatedContent || 'Response completed',
                  timestamp: new Date()
                };

                const finalMessages = [...updatedMessages, assistantMessage];
                const finalSession = { ...updatedSession, messages: finalMessages };
                setCurrentSession(finalSession);
                updateSessionInList(finalSession);
                
                websocketService.removeAllListeners();
                resolve();
              },
              // onError
              (error: string) => {
                console.error('❌ WebSocket error:', error);
                setCurrentPhase(null);
                websocketService.removeAllListeners();
                reject(new Error(error));
              }
            );
          });

          // If streaming succeeded, we're done
          if (streamingSucceeded) {
            setIsLoading(false);
            return;
          }
        } catch (wsError) {
          console.warn('⚠️ WebSocket streaming failed, falling back to REST:', wsError);
          setCurrentPhase(null);
        }
      }
      
      // Fallback to REST API
      console.log('📡 Using REST API fallback');
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
      setCurrentPhase(null);
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
      <div className="flex h-screen w-screen bg-vctt-panel text-white items-center justify-center">
        <div className="text-center">
          <div className="text-vctt-gold text-2xl font-bold mb-4">VCTT-AGI</div>
          <div className="text-gray-400">Loading sessions...</div>
        </div>
      </div>
    );
  }

return (
  <>
    <div className="flex h-screen w-screen bg-vctt-panel text-white overflow-hidden">
      {/* Left Sidebar */}
      <LeftSidebar
        sessions={sessions}
        currentSessionId={currentSession?.id}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
      />

      {/* Center Chat Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatPanel
          session={currentSession}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          trustScore={vcttState['Trust (τ)']}
          currentPhase={currentPhase}
          isResuming={isResuming}
        />
      </div>

      {/* Right Sidebar */}
      <RightSidebar
        vcttState={vcttState}
        isAdminMode={isAdminMode}
        onAdminToggle={handleAdminToggle}
        sessionId={currentSession?.id}
        onShowAnalytics={() => setShowAnalytics(true)}
      />
    </div>

    {/* Analytics Modal - Rendered outside main container for proper centering */}
    {showAnalytics && (
      <AnalyticsModal onClose={() => setShowAnalytics(false)} />
    )}

    {/* Admin Panel Overlay */}
    {isAdminMode && lastResponse && (
      <AdminPanel
        response={lastResponse}
        onClose={() => setIsAdminMode(false)}
        onForceRegulation={handleForceRegulation}
      />
    )}
  </>
);
}

export default App;
