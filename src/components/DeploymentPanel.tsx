
// src/components/DeploymentPanel.tsx
"use client";

import { Globe, Upload, CheckCircle2, AlertCircle, Clock } from "lucide-react";

export default function DeploymentPanel() {
  const deployments = [
    { id: "dep-7h9k2m", status: "success", url: "https://vcttagiui-git-main-peters-projects-3a28ae0e.vercel.app", time: "2 min ago" },
    { id: "dep-6f4j1l", status: "building", url: null, time: "in progress" },
    { id: "dep-5d3g0k", status: "failed", url: null, time: "18 min ago" },
  ];

  const currentPreview = deployments[0].url;

  return (
    <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col h-full">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h2 className="font-semibold">Deployments</h2>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm transition">
          <Upload size={14} />
          Deploy Now
        </button>
      </div>

      {currentPreview && (
        <div className="p-4 bg-gray-800 border-b border-gray-700">
          <div className="text-xs text-gray-400 mb-1">Current Preview</div>
          <a
            href={currentPreview}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm truncate"
          >
            <Globe size={14} />
            {currentPreview.replace("https://", "")}
          </a>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="p-3 text-xs font-medium text-gray-400 uppercase tracking-wider">History</div>
        {deployments.map((dep) => (
          <div key={dep.id} className="px-4 py-3 hover:bg-gray-800 border-l-4 border-transparent hover:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {dep.status === "success" && <CheckCircle2 size={16} className="text-green-400" />}
                {dep.status === "building" && <Clock size={16} className="text-yellow-400 animate-pulse" />}
                {dep.status === "failed" && <AlertCircle size={16} className="text-red-400" />}
                <span className="text-sm capitalize">{dep.status}</span>
              </div>
              <span className="text-xs text-gray-500">{dep.time}</span>
            </div>
            {dep.url && (
              <a href={dep.url} target="_blank" className="text-xs text-cyan-400 hover:underline mt-1 block truncate">
                {dep.url}
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
