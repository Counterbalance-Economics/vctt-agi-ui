import { useState } from "react";
import { Lock, Unlock, BarChart3, Terminal } from "lucide-react";
import type { VCTTState } from "../types";
import LLMCommitteePanel from "./LLMCommitteePanel";
import { getApiUrl } from "../config/api";

interface RightSidebarProps {
  vcttState: VCTTState;
  isAdminMode: boolean;
  onAdminToggle: (password: string) => boolean;
  sessionId?: string | null;
  onShowAnalytics?: () => void;
}

export default function RightSidebar({
  vcttState,
  isAdminMode,
  onAdminToggle,
  sessionId,
  onShowAnalytics,
}: RightSidebarProps) {
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const backendUrl = getApiUrl();

  const handleUnlock = () => {
    if (onAdminToggle(password)) {
      setShowPasswordInput(false);
      setPassword("");
      setError("");
    } else {
      setError("Invalid password");
    }
  };

  const getRegulationColor = (regulation: string) => {
    switch (regulation) {
      case "normal":
        return "text-green-400";
      case "clarify":
        return "text-yellow-400";
      case "slow_down":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getMetricColor = (value: number) => {
    if (value >= 0.8) return "bg-green-500";
    if (value >= 0.6) return "bg-yellow-500";
    return "bg-red-500";
  };

  const formatMetric = (value: number) => {
    return (value * 100).toFixed(0) + "%";
  };

  return (
    <div className="w-80 bg-vctt-panel border-l border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold">VCTT State</h2>
        <button
          onClick={() =>
            isAdminMode ? onAdminToggle("") : setShowPasswordInput(!showPasswordInput)
          }
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          {isAdminMode ? (
            <Unlock size={20} className="text-vctt-gold" />
          ) : (
            <Lock size={20} className="text-gray-400" />
          )}
        </button>
      </div>

      {/* Password Input */}
      {showPasswordInput && !isAdminMode && (
        <div className="p-4 border-b border-gray-700 bg-gray-800">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
            placeholder="Enter admin password"
            className="w-full bg-vctt-dark border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-vctt-gold mb-2"
          />
          <button
            onClick={handleUnlock}
            className="w-full bg-vctt-gold hover:bg-yellow-600 text-white text-sm font-medium py-2 rounded-lg transition-colors"
          >
            Unlock Admin Mode
          </button>
          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        </div>
      )}

      {/* Admin Mode Indicator */}
      {isAdminMode && (
        <div className="px-4 py-2 bg-vctt-gold text-vctt-dark text-center text-sm font-medium">
          🔓 Admin Mode Active
        </div>
      )}

      {/* Metrics */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Core Metrics */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Voice</span>
              <span className="text-sm text-vctt-gold">{formatMetric(vcttState.Voice)}</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`metric-bar h-full ${getMetricColor(vcttState.Voice)}`}
                style={{ width: `${vcttState.Voice * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Choice</span>
              <span className="text-sm text-vctt-gold">{formatMetric(vcttState.Choice)}</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`metric-bar h-full ${getMetricColor(vcttState.Choice)}`}
                style={{ width: `${vcttState.Choice * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Transparency</span>
              <span className="text-sm text-vctt-gold">{formatMetric(vcttState.Transparency)}</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`metric-bar h-full ${getMetricColor(vcttState.Transparency)}`}
                style={{ width: `${vcttState.Transparency * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Trust (τ)</span>
              <span className="text-sm text-vctt-gold font-bold">
                {formatMetric(vcttState["Trust (τ)"])}
              </span>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`metric-bar h-full ${getMetricColor(vcttState["Trust (τ)"])}`}
                style={{ width: `${vcttState["Trust (τ)"] * 100}%` }}
              />
            </div>
          </div>

          {/* Analytics Button */}
          {onShowAnalytics && (
            <div className="flex justify-center pt-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("🟢 Analytics button clicked - propagation stopped");
                  onShowAnalytics();
                }}
                className="w-full bg-vctt-gold/10 hover:bg-vctt-gold/20 border border-vctt-gold/30 hover:border-vctt-gold text-vctt-gold px-4 py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium text-sm"
              >
                <BarChart3 size={18} />
                View Analytics
              </button>
            </div>
          )}

          {/* DeepAgent Button */}
          <div className="flex justify-center pt-2">
            <a
              href="/deep"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 hover:border-green-500 text-green-400 px-4 py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium text-sm"
            >
              <Terminal size={18} />
              DeepAgent Mode
            </a>
          </div>
        </div>

        {/* LLM Committee */}
        <LLMCommitteePanel sessionId={sessionId || null} backendUrl={backendUrl} />

        {/* Regulation Mode */}
        <div className="pt-4 border-t border-gray-700">
          <h3 className="text-sm font-semibold mb-3">Regulation Mode</h3>
          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <p
              className={`text-lg font-bold uppercase ${getRegulationColor(vcttState.Regulation)}`}
            >
              {vcttState.Regulation}
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="pt-4 border-t border-gray-700 text-xs text-gray-400 space-y-2">
          <p>
            <strong className="text-white">Voice:</strong> Logical coherence
          </p>
          <p>
            <strong className="text-white">Choice:</strong> Emotional balance
          </p>
          <p>
            <strong className="text-white">Transparency:</strong> Clarity of reasoning
          </p>
          <p>
            <strong className="text-white">Trust (τ):</strong> Overall system confidence
          </p>
        </div>
      </div>
    </div>
  );
}
