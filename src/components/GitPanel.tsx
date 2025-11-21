import React, { useState } from "react";

interface GitPanelProps {
  onPush: () => void;
  onBranchSwitch: (branch: string) => void;
}

export const GitPanel: React.FC<GitPanelProps> = ({ onPush, onBranchSwitch }) => {
  const [currentBranch, setCurrentBranch] = useState("main");
  const [branches] = useState(["main", "develop", "feature/phase-2"]);
  const [commits] = useState([
    { hash: "c25a6a9", message: "feat: Phase 1 - CURSOR KILLER Code Editor", time: "2 min ago" },
    { hash: "0239379", message: "docs: Phase 1 complete", time: "1 min ago" },
  ]);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);

  const handleBranchSwitch = (branch: string) => {
    setCurrentBranch(branch);
    onBranchSwitch(branch);
    setShowBranchDropdown(false);
  };

  return (
    <div className="p-3 bg-gray-900 border-b border-gray-800">
      <div className="flex items-center gap-2 justify-between">
        {/* Branch Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowBranchDropdown(!showBranchDropdown)}
            className="flex items-center gap-2 px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-sm text-gray-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {currentBranch}
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showBranchDropdown && (
            <div className="absolute top-full mt-1 w-48 bg-gray-800 border border-gray-700 rounded shadow-lg z-10">
              {branches.map((branch) => (
                <button
                  key={branch}
                  onClick={() => handleBranchSwitch(branch)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-700 ${
                    branch === currentBranch ? "text-green-400" : "text-gray-300"
                  }`}
                >
                  {branch}
                  {branch === currentBranch && <span className="ml-2 text-xs">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Git Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPush}
            className="relative px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-colors"
          >
            Push
            {commits.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center animate-pulse">
                {commits.length}
              </span>
            )}
          </button>
          <span className="text-xs text-gray-500">{commits.length} commits</span>
        </div>
      </div>

      {/* Recent Commit */}
      {commits[0] && (
        <div className="mt-2 px-3 py-2 bg-gray-950 rounded">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-mono">{commits[0].hash}</span>
            <span className="text-xs text-gray-400 flex-1">{commits[0].message}</span>
            <span className="text-xs text-gray-600">{commits[0].time}</span>
          </div>
        </div>
      )}
    </div>
  );
};
