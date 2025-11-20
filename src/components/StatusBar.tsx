
import React from 'react';

interface StatusBarProps {
  branch: string;
  line: number;
  column: number;
  isConnected: boolean;
  lastEditCost: number | null;
  lastEditTokens: number | null;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  branch,
  line,
  column,
  isConnected,
  lastEditCost,
  lastEditTokens,
}) => {
  return (
    <div className="h-6 bg-blue-600 text-white flex items-center justify-between px-4 text-xs font-medium">
      <div className="flex items-center gap-4">
        {/* Git Branch */}
        <div className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
            <path d="M11.5 4a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1v5.5a2.5 2.5 0 0 1-2.5 2.5h-1a.5.5 0 0 1 0-1h1a1.5 1.5 0 0 0 1.5-1.5V6h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h2.5z"/>
            <path d="M4 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM3 4.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-7z"/>
          </svg>
          <span>{branch}</span>
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-300' : 'bg-red-400'}`}></div>
          <span>{isConnected ? 'Connected' : 'Offline'}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Last Edit Cost */}
        {lastEditCost !== null && lastEditTokens !== null && (
          <div className="flex items-center gap-2 px-2 py-0.5 bg-blue-700 rounded">
            <span>Last edit:</span>
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
