import { X, AlertTriangle, Zap } from "lucide-react";
import type { StepResponse } from "../types";

interface AdminPanelProps {
  response: StepResponse;
  onClose: () => void;
  onForceRegulation: (mode: "normal" | "clarify" | "slow_down") => void;
}

export default function AdminPanel({ response, onClose, onForceRegulation }: AdminPanelProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-vctt-panel border border-vctt-gold rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-vctt-gold flex items-center gap-2">
            <Zap size={24} />
            Admin Panel
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Agent Logs */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              Agent Execution Logs
            </h3>
            <div className="bg-gray-800 rounded-lg p-4 space-y-2 font-mono text-sm">
              {response.agent_logs?.map((log, idx) => (
                <div key={idx} className="text-green-400">
                  {log}
                </div>
              ))}
            </div>
          </div>

          {/* Repair Loop */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Repair Loop</h3>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-2xl font-bold text-vctt-gold">
                {response.repair_count} / 3 iterations
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {response.repair_count === 0 && "No repairs needed - coherent on first pass"}
                {response.repair_count === 1 && "One clarification cycle executed"}
                {response.repair_count === 2 && "Two repair iterations required"}
                {response.repair_count === 3 && "Maximum repairs reached"}
              </p>
            </div>
          </div>

          {/* Force Regulation */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle size={20} className="text-yellow-400" />
              Force Regulation Mode
            </h3>
            <div className="flex gap-3">
              <button
                onClick={() => onForceRegulation("normal")}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors"
              >
                NORMAL
              </button>
              <button
                onClick={() => onForceRegulation("clarify")}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-3 rounded-lg transition-colors"
              >
                CLARIFY
              </button>
              <button
                onClick={() => onForceRegulation("slow_down")}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg transition-colors"
              >
                SLOW DOWN
              </button>
            </div>
          </div>

          {/* Raw JSON */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Raw JSON Response</h3>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                {JSON.stringify(response.raw_json, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-800">
          <p className="text-xs text-gray-400 text-center">
            ⚠️ Admin mode provides full system visibility and control
          </p>
        </div>
      </div>
    </div>
  );
}
