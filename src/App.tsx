
import { useState, useEffect } from 'react';
import LeftSidebar from './components/LeftSidebar';
import ChatPanel from './components/ChatPanel';
import RightSidebar from './components/RightSidebar';
import AdminPanel from './components/AdminPanel';
import type { Session, Message, VCTTState, StepResponse } from './types';
import { api } from './services/api';

function App() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [vcttState, setVcttState] = useState<VCTTState>({
    Voice: 0.85,
    Choice: 0.72,
    Transparency: 0.91,
    'Trust (τ)': 0.88,
    Regulation: 'normal'
  });
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [lastResponse, setLastResponse] = useState<StepResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Create initial session
  useEffect(() => {
    const initialSession: Session = {
      id: crypto.randomUUID(),
      title: 'New Conversation',
      created_at: new Date(),
      messages: []
    };
    setSessions([initialSession]);
    setCurrentSession(initialSession);
  }, []);

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
      const finalSession = { ...currentSession, messages: finalMessages };
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

  const handleSelectSession = (session: Session) => {
    setCurrentSession(session);
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
      <div className="flex-1 flex flex-col min-w-0">
        <ChatPanel
          session={currentSession}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
        />
      </div>

      {/* Right Sidebar */}
      <RightSidebar
        vcttState={vcttState}
        isAdminMode={isAdminMode}
        onAdminToggle={handleAdminToggle}
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
