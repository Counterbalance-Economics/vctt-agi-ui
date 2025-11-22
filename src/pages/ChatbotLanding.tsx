
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Terminal } from "lucide-react";
import LeftSidebar from "../components/LeftSidebar";
import ChatPanel from "../components/ChatPanel";
import RightSidebar from "../components/RightSidebar";
import type { Session, VCTTState, Message } from "../types";
import { getApiUrl } from "../config/api";
import { PhaseEvent } from "../services/websocket";

const BACKEND_URL = getApiUrl();
const ADMIN_PASSWORD = "vctt-admin-2024";

export default function ChatbotLanding() {
  const [searchParams] = useSearchParams();
  const sessionParam = searchParams.get('session');
  
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<PhaseEvent | null>(null);
  
  const [vcttState, setVcttState] = useState<VCTTState>({
    Voice: 0.8,
    Choice: 0.75,
    Transparency: 0.7,
    "Trust (τ)": 0.75,
    Regulation: "normal",
  });

  // Resume session from URL param
  useEffect(() => {
    const initSession = async () => {
      if (sessionParam) {
        setIsResuming(true);
        try {
          const res = await fetch(`${BACKEND_URL}/api/sessions/${sessionParam}`);
          const session = await res.json();
          setCurrentSession(session);
          setSessions([session]);
        } catch (error) {
          console.error("Failed to resume session", error);
          await handleNewSession();
        } finally {
          setIsResuming(false);
        }
      } else {
        await handleNewSession();
      }
    };
    
    initSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionParam]);

  const handleNewSession = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const newSession: Session = await res.json();
      setSessions((prev) => [newSession, ...prev]);
      setCurrentSession(newSession);
    } catch (error) {
      console.error("Failed to create session:", error);
      // Fallback: create client-side session
      const fallbackSession: Session = {
        id: Date.now().toString(),
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
      id: Date.now().toString(),
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
      const res = await fetch(`${BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: currentSession.id,
          message: content,
        }),
      });

      const data = await res.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "I received your message!",
        timestamp: new Date(),
      };

      setCurrentSession({
        ...currentSession,
        messages: [...currentSession.messages, userMessage, assistantMessage],
      });

      // Update VCTT state
      if (data.vcttState) {
        setVcttState(data.vcttState);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
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
          onSelectSession={setCurrentSession}
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
