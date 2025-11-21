import React from "react";

interface StatusBarProps {
  branch: string;
  line: number;
  column: number;
  isConnected: boolean;
  lastEditCost: number | null;
  lastEditTokens: number | null;
  trustTau?: number | null; // MIN's trust metric (0-1)
  grokConfidence?: number | null; // Grok-4.1 confidence (0-1)
  saveStatus?: "idle" | "saving" | "saved"; // Save status
  lastSaveTime?: number | null; // Timestamp of last save
}

export const StatusBar: React.FC<StatusBarProps> = ({
  branch,
  line,
  column,
  isConnected,
  lastEditCost,
  lastEditTokens,
  trustTau,
  grokConfidence,
  saveStatus = "idle",
  lastSaveTime,
}) => {
  const getTimeSinceLastSave = () => {
    if (!lastSaveTime) return "";
    const seconds = Math.floor((Date.now() - lastSaveTime) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };
  return (
    <div className="h-6 bg-blue-600 text-white flex items-center justify-between px-4 text-xs font-medium">
      <div className="flex items-center gap-3">
        {/* Git Branch */}
        <div className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
            <path d="M11.5 4a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1v5.5a2.5 2.5 0 0 1-2.5 2.5h-1a.5.5 0 0 1 0-1h1a1.5 1.5 0 0 0 1.5-1.5V6h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h2.5z" />
            <path d="M4 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM3 4.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-7z" />
          </svg>
          <span>{branch}</span>
        </div>

        {/* Separator */}
        <span className="text-white/50">•</span>

        {/* Connection Status */}
        <div className="flex items-center gap-1">
          <div
            className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-300" : "bg-red-400"}`}
          ></div>
          <span>{isConnected ? "Online" : "Offline"}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Save Status */}
        {saveStatus === "saving" && (
          <div className="flex items-center gap-1 text-yellow-300">
            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Saving...</span>
          </div>
        )}
        {saveStatus === "saved" && lastSaveTime && (
          <div className="text-green-300">
            Saved {getTimeSinceLastSave()}
          </div>
        )}

        {/* Trust & Confidence Metrics (NEW!) */}
        {trustTau !== null && trustTau !== undefined && (
          <div className="flex items-center gap-1 px-2 py-0.5 bg-indigo-700 rounded">
            <span className="font-bold">τ: {trustTau.toFixed(2)}</span>
          </div>
        )}
        {grokConfidence !== null && grokConfidence !== undefined && (
          <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-700 rounded">
            <span className="font-bold">Grok: {(grokConfidence * 100).toFixed(0)}%</span>
          </div>
        )}

        {/* Last Edit Cost */}
        {lastEditCost !== null && lastEditTokens !== null && (
          <div className="flex items-center gap-2 px-2 py-0.5 bg-blue-700 rounded">
            <span className="font-bold">${lastEditCost.toFixed(4)}</span>
            <span className="text-blue-200">•</span>
            <span>{lastEditTokens} tokens</span>
          </div>
        )}

        {/* Line/Column */}
        <div>
          Ln {line}, Col {column}
        </div>
      </div>
    </div>
  );
};
