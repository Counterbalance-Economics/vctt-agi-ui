import { useState, useEffect } from "react";
import { Activity, Globe } from "lucide-react";

export interface ModelStats {
  model_name: string;
  answered: number;
  total: number;
  percentage: number;
  offline_count: number;
  avg_latency_ms?: number;
  total_cost_usd?: number;
}

export interface SessionCommitteeStats {
  session_id: string;
  total_questions: number;
  models: ModelStats[];
  generated_at: string;
}

export interface GlobalCommitteeStats {
  questions_analyzed: number;
  time_range_start: string;
  time_range_end: string;
  models: ModelStats[];
  generated_at: string;
}

interface LLMCommitteePanelProps {
  sessionId: string | null;
  backendUrl: string | null;
}

export default function LLMCommitteePanel({ sessionId, backendUrl }: LLMCommitteePanelProps) {
  const [activeTab, setActiveTab] = useState<"session" | "global">("session");
  const [sessionStats, setSessionStats] = useState<SessionCommitteeStats | null>(null);
  const [globalStats, setGlobalStats] = useState<GlobalCommitteeStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch session stats
  useEffect(() => {
    if (!sessionId || !backendUrl || activeTab !== "session") return;

    const fetchSessionStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const cacheBust = `?_cb=${Date.now()}`;
        const url = `${backendUrl}/api/v1/analytics/llm-committee/session/${sessionId}${cacheBust}`;
        console.log("FETCHING SESSION:", url);

        const response = await fetch(url);
        console.log("SESSION RESPONSE STATUS:", response.status, response.statusText);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("SESSION FETCH FAILED - Status:", response.status, "Body:", errorText);
          throw new Error(`Failed to fetch session stats: ${response.status}`);
        }

        const data = await response.json();
        console.log("SESSION STATS DATA:", data);
        setSessionStats(data);
      } catch (err) {
        console.error("LLM COMMITTEE SESSION FETCH FAILED:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch session stats");
      } finally {
        setLoading(false);
      }
    };

    fetchSessionStats();
    const interval = setInterval(fetchSessionStats, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, [sessionId, backendUrl, activeTab]);

  // Fetch global stats
  useEffect(() => {
    if (!backendUrl || activeTab !== "global") return;

    const fetchGlobalStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const cacheBust = `&_cb=${Date.now()}`;
        const url = `${backendUrl}/api/v1/analytics/llm-committee/global?limit=50${cacheBust}`;
        console.log("FETCHING:", url);

        const response = await fetch(url);
        console.log("RESPONSE STATUS:", response.status, response.statusText);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("FETCH FAILED - Status:", response.status, "Body:", errorText);
          throw new Error(`Failed to fetch global stats: ${response.status}`);
        }

        const data = await response.json();
        console.log("GLOBAL STATS DATA:", data);
        setGlobalStats(data);
      } catch (err) {
        console.error("LLM COMMITTEE FETCH FAILED:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch global stats");
        // Set empty fallback data
        setGlobalStats({
          questions_analyzed: 0,
          time_range_start: new Date().toISOString(),
          time_range_end: new Date().toISOString(),
          models: [],
          generated_at: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalStats();
    const interval = setInterval(fetchGlobalStats, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [backendUrl, activeTab]);

  const getContributionColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-400";
    if (percentage >= 40) return "text-yellow-400";
    return "text-red-400";
  };

  const getModelDisplayName = (modelName: string) => {
    const names: Record<string, string> = {
      "grok-3": "Grok-3",
      "grok-3-direct": "Grok-3",
      "claude-3.5": "MIN Ensemble",
      claude: "MIN Ensemble",
      "gpt-5": "GPT-5",
      "gpt-4o": "GPT-4o",
    };
    return names[modelName] || modelName;
  };

  if (!backendUrl) {
    return (
      <div className="pt-4 border-t border-gray-700">
        <h3 className="text-sm font-semibold mb-3">LLM Committee</h3>
        <div className="bg-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-400 text-center">Backend not configured</p>
        </div>
      </div>
    );
  }

  if (!sessionId && activeTab === "session") {
    return (
      <div className="pt-4 border-t border-gray-700">
        <h3 className="text-sm font-semibold mb-3">LLM Committee</h3>
        <div className="bg-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-400 text-center">
            Start a conversation to see committee stats
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4 border-t border-gray-700">
      <h3 className="text-sm font-semibold mb-3">LLM Committee</h3>

      {/* Tabs */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setActiveTab("session")}
          className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            activeTab === "session"
              ? "bg-vctt-gold text-vctt-dark"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          <Activity size={14} />
          Session
        </button>
        <button
          onClick={() => setActiveTab("global")}
          className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            activeTab === "global"
              ? "bg-vctt-gold text-vctt-dark"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          <Globe size={14} />
          Global
        </button>
      </div>

      {/* Content */}
      <div className="bg-gray-800 rounded-lg p-3 min-h-[180px]">
        {loading && !sessionStats && !globalStats && (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-vctt-gold border-t-transparent"></div>
          </div>
        )}

        {error && <div className="text-xs text-red-400 text-center">{error}</div>}

        {/* Session Stats */}
        {activeTab === "session" && sessionStats && !error && (
          <div className="space-y-2">
            <div className="text-xs text-gray-400 mb-3">
              {sessionStats.total_questions === 0
                ? "No questions yet"
                : `${sessionStats.total_questions} question${sessionStats.total_questions !== 1 ? "s" : ""}`}
            </div>
            {sessionStats.models.length === 0 ? (
              <div className="text-xs text-gray-400 text-center py-4">No model data yet</div>
            ) : (
              sessionStats.models.map((model) => (
                <div
                  key={model.model_name}
                  className="flex items-center justify-between text-xs py-1.5 border-b border-gray-700 last:border-0"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-gray-300 font-medium">
                      {getModelDisplayName(model.model_name)}
                    </span>
                    <span className={`font-semibold ${getContributionColor(model.percentage)}`}>
                      {model.answered}/{model.total}
                    </span>
                    <span className={`text-xs ${getContributionColor(model.percentage)}`}>
                      ({model.percentage.toFixed(0)}%)
                    </span>
                  </div>
                  {model.offline_count > 0 && (
                    <span className="text-xs text-red-400">{model.offline_count} offline</span>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Global Stats */}
        {activeTab === "global" && globalStats && !error && (
          <div className="space-y-2">
            <div className="text-xs text-gray-400 mb-3">
              Last {globalStats.questions_analyzed} questions
            </div>
            {globalStats.models.length === 0 ? (
              <div className="text-xs text-gray-400 text-center py-4">No global data yet</div>
            ) : (
              globalStats.models.map((model) => (
                <div
                  key={model.model_name}
                  className="flex items-center justify-between text-xs py-1.5 border-b border-gray-700 last:border-0"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-gray-300 font-medium">
                      {getModelDisplayName(model.model_name)}
                    </span>
                    <span className={`font-semibold ${getContributionColor(model.percentage)}`}>
                      {model.answered}/{model.total}
                    </span>
                    <span className={`text-xs ${getContributionColor(model.percentage)}`}>
                      ({model.percentage.toFixed(0)}%)
                    </span>
                  </div>
                  {model.offline_count > 0 && (
                    <span className="text-xs text-red-400">{model.offline_count} off</span>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-2 text-xs text-gray-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-green-400">●</span> &gt;80%
          </div>
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">●</span> 40-80%
          </div>
          <div className="flex items-center gap-1">
            <span className="text-red-400">●</span> &lt;40%
          </div>
        </div>
      </div>
    </div>
  );
}
