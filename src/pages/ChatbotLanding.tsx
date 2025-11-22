
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Terminal } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import LeftSidebar from "../components/LeftSidebar";
import ChatPanel from "../components/ChatPanel";
import RightSidebar from "../components/RightSidebar";
import type { Session, VCTTState, Message } from "../types";
import { getApiUrl } from "../config/api";
import { PhaseEvent } from "../services/websocket";
import { api } from "../services/api";

const BACKEND_URL = getApiUrl();
const ADMIN_PASSWORD = "vctt-admin-2024";

export default function ChatbotLanding() {
  const [searchParams] = useSearchParams();
  const sessionParam = searchParams.get('session');
  
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<PhaseEvent | null>(null);
  
  const [vcttState, setVcttState] = useState<VCTTState>({
    Voice: 0.8,
    Choice: 0.75,
    Transparency: 0.7,
    "Trust (τ)": 0.75,
    Regulation: "normal",
  });

  // Load conversation history on mount
  useEffect(() => {
    const loadConversationHistory = async () => {
      try {
        console.log("🔄 Loading conversation history...");
        const sessionSummaries = await api.getAllSessions(undefined, 50);
        console.log(`📚 Loaded ${sessionSummaries.length} conversations`);
        
        // Convert session summaries to Session format
        const loadedSessions: Session[] = sessionSummaries.map((summary: any) => ({
          id: summary.session_id,
          title: "Chat", // Will be updated when clicked
          messages: [], // Will be loaded on demand
          created_at: new Date(summary.created_at),
          last_activity: summary.last_activity ? new Date(summary.last_activity) : new Date(summary.created_at),
          message_count: summary.message_count,
          trust_tau: summary.trust_tau,
        }));
        
        setSessions(loadedSessions);
      } catch (error) {
        console.error("❌ Failed to load conversation history:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadConversationHistory();
  }, []);

  // Resume session from URL param or create new session
  useEffect(() => {
    const initSession = async () => {
      // Wait for history to load first
      if (isLoadingHistory) return;

      if (sessionParam) {
        setIsResuming(true);
        try {
          console.log(`🔄 Resuming session: ${sessionParam}`);
          const data = await api.getSessionHistory(sessionParam);
          
          if (!data) {
            throw new Error("Session not found");
          }
          
          const session: Session = {
            id: data.session_id,
            title: data.messages.length > 0 ? data.messages[0].content.substring(0, 30) : "Chat",
            messages: data.messages || [],
            created_at: new Date(data.created_at),
          };
          
          setCurrentSession(session);
          
          // Add to sessions if not already there
          setSessions(prev => {
            const exists = prev.some(s => s.id === session.id);
            return exists ? prev : [session, ...prev];
          });
        } catch (error) {
          console.error("❌ Failed to resume session", error);
          await handleNewSession();
        } finally {
          setIsResuming(false);
        }
      } else {
        // No session param - create new session
        await handleNewSession();
      }
    };
    
    initSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionParam, isLoadingHistory]);

  // Handle selecting a session from sidebar - load full history
  const handleSelectSession = async (session: Session) => {
    try {
      console.log(`🔄 Loading session: ${session.id}`);
      
      // If session already has messages, just switch to it
      if (session.messages && session.messages.length > 0) {
        setCurrentSession(session);
        return;
      }
      
      // Otherwise, load full history from backend
      const data = await api.getSessionHistory(session.id);
      
      if (data) {
        const fullSession: Session = {
          id: data.session_id,
          title: data.messages.length > 0 ? data.messages[0].content.substring(0, 30) : "Chat",
          messages: data.messages || [],
          created_at: new Date(data.created_at),
        };
        
        setCurrentSession(fullSession);
        
        // Update sessions array with full data
        setSessions(prev => prev.map(s => s.id === fullSession.id ? fullSession : s));
      } else {
        // Fallback: just set the session summary
        setCurrentSession(session);
      }
    } catch (error) {
      console.error("❌ Failed to load session:", error);
      // Fallback: just set the session summary
      setCurrentSession(session);
    }
  };

  const handleNewSession = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/session/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: "anonymous",
          input: "Hello", // Initial greeting
        }),
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      }
      
      const data = await res.json();
      const newSession: Session = {
        id: data.session_id,
        title: "New Chat",
        messages: [],
        created_at: new Date(),
      };
      setSessions((prev) => [newSession, ...prev]);
      setCurrentSession(newSession);
    } catch (error) {
      console.error("Failed to create session:", error);
      // Fallback: create client-side session
      const fallbackSession: Session = {
        id: uuidv4(),
        title: "New Chat",
        messages: [],
        created_at: new Date(),
      };
      setSessions([fallbackSession]);
      setCurrentSession(fallbackSession);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!currentSession) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    // Optimistically update UI
    setCurrentSession({
      ...currentSession,
      messages: [...currentSession.messages, userMessage],
    });
    setIsLoading(true);

    // Simulate phase updates
    const phases: PhaseEvent[] = [
      { phase: "Voice", description: "Understanding intent...", progress: 25, emoji: "🎯", status: "in_progress", timestamp: new Date().toISOString() },
      { phase: "Choice", description: "Evaluating options...", progress: 50, emoji: "🤔", status: "in_progress", timestamp: new Date().toISOString() },
      { phase: "Transparency", description: "Generating response...", progress: 75, emoji: "✨", status: "in_progress", timestamp: new Date().toISOString() },
      { phase: "Trust", description: "Verifying quality...", progress: 100, emoji: "✅", status: "complete", timestamp: new Date().toISOString() },
    ];

    for (const phase of phases) {
      setCurrentPhase(phase);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/session/step`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: currentSession.id,
          input: content,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      }

      const data = await res.json();
      
      const assistantMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: data.response || "I received your message!",
        timestamp: new Date(),
      };

      setCurrentSession({
        ...currentSession,
        messages: [...currentSession.messages, userMessage, assistantMessage],
      });

      // Update VCTT state from internal_state
      if (data.internal_state) {
        setVcttState({
          Voice: data.internal_state.vctt?.voice || 0.8,
          Choice: data.internal_state.vctt?.choice || 0.75,
          Transparency: data.internal_state.vctt?.transparency || 0.7,
          "Trust (τ)": data.internal_state.vctt?.trust || 0.75,
          Regulation: data.internal_state.regulation || "normal",
        });
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: "Sorry, I'm having trouble connecting to the backend. Please try again.",
        timestamp: new Date(),
      };
      setCurrentSession({
        ...currentSession,
        messages: [...currentSession.messages, userMessage, errorMessage],
      });
    } finally {
      setIsLoading(false);
      setCurrentPhase(null);
    }
  };

  const handleAdminToggle = (password: string) => {
    if (password === ADMIN_PASSWORD) {
      setIsAdminMode(!isAdminMode);
      return true;
    }
    return false;
  };

  return (
    <div className="h-screen bg-vctt-dark text-white flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="bg-vctt-panel border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-vctt-gold">VCTT-AGI</h1>
            <span className="text-sm text-gray-400">Voice • Choice • Transparency • Trust</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/deep"
              className="flex items-center gap-2 px-4 py-2 bg-vctt-blue hover:bg-blue-600 rounded-lg transition-colors font-medium"
              title="Open DeepAgent IDE"
            >
              <Terminal size={18} />
              <span>Open IDE</span>
            </Link>
            <Link
              to="/admin/coach"
              className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
            >
              🧠 Coach
            </Link>
            <Link
              to="/admin/safety"
              className="text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors"
            >
              🛡️ Safety
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content: 3-column layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Sessions */}
        <LeftSidebar
          sessions={sessions}
          currentSessionId={currentSession?.id}
          onSelectSession={handleSelectSession}
          onNewSession={handleNewSession}
        />

        {/* Center: Chat */}
        <div className="flex-1 flex flex-col">
          <ChatPanel
            session={currentSession}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            trustScore={Math.round(vcttState["Trust (τ)"] * 100)}
            currentPhase={currentPhase}
            isResuming={isResuming}
          />
        </div>

        {/* Right: VCTT State */}
        <RightSidebar
          vcttState={vcttState}
          isAdminMode={isAdminMode}
          onAdminToggle={handleAdminToggle}
          sessionId={currentSession?.id}
        />
      </div>
    </div>
  );
}
