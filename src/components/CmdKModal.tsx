
// src/components/CmdKModal.tsx
"use client";

import { useState } from "react";
import { DiffEditor } from "@monaco-editor/react";
import { Check, X, RefreshCw } from "lucide-react";

interface JazzAnalysis {
  voice: number;
  choice: number;
  transparency: number;
  trust: number;
  suggestions: string[];
}

interface CodeEditResponse {
  editedCode: string;
  jazzAnalysis?: JazzAnalysis;
  verification: { trustTau: number; grokConfidence: number };
  cost?: number;
  tokensUsed?: number;
  latency?: number;
  linesAdded?: number;
  linesDeleted?: number;
  linesModified?: number;
}

export interface EditStats {
  cost: number;
  tokensUsed: number;
  latency: number;
  linesAdded: number;
  linesDeleted: number;
  linesModified: number;
  trustTau?: number;
  grokConfidence?: number;
}

export default function CmdKModal({
  original,
  onApply,
  onClose,
}: {
  original: string;
  onApply: (code: string, stats: EditStats) => void;
  onClose: () => void;
}) {
  const [instruction, setInstruction] = useState("");
  const [stage, setStage] = useState<"idle" | "thinking" | "streaming" | "jazz" | "done">("idle");
  const [edited, setEdited] = useState("");
  const [jazz, setJazz] = useState<JazzAnalysis | null>(null);
  const [trust, setTrust] = useState(0);
  const [responseData, setResponseData] = useState<CodeEditResponse | null>(null);

  const handleSubmit = async () => {
    if (!instruction.trim()) return;
    setStage("thinking");
    setEdited("");
    setJazz(null);
    setTrust(0);
    setResponseData(null);

    const res = await fetch("/api/ide/code-edit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filePath: "temp.ts",
        originalCode: original,
        instruction,
        language: "typescript",
      }),
    });

    const data: CodeEditResponse = await res.json();
    setResponseData(data);
    if (data.editedCode) {
      setEdited(data.editedCode);
      setTrust(data.verification.trustTau);
      if (data.jazzAnalysis) {
        setJazz(data.jazzAnalysis);
        setStage("jazz");
        setTimeout(() => setStage("done"), 1200);
      } else {
        setStage("done");
      }
    }
  };

  const handleAccept = () => {
    if (!edited || !responseData) return;
    
    const stats: EditStats = {
      cost: responseData.cost ?? 0,
      tokensUsed: responseData.tokensUsed ?? 0,
      latency: responseData.latency ?? 0,
      linesAdded: responseData.linesAdded ?? 0,
      linesDeleted: responseData.linesDeleted ?? 0,
      linesModified: responseData.linesModified ?? 0,
      trustTau: responseData.verification?.trustTau,
      grokConfidence: responseData.verification?.grokConfidence,
    };
    
    onApply(edited, stats);
  };

  const handleRefined = async () => {
    if (!jazz?.suggestions?.length) return;
    setStage("thinking");
    setInstruction(prev => `${prev} → ${jazz.suggestions[0]}`);
    // Re-run the same flow with the refined prompt
    await handleSubmit();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-900 rounded-lg w-[900px] max-h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Cmd+K • AI Edit</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>

        {/* Progress + Trust Bar */}
        <div className="px-4 pt-3">
          <div className="flex items-center gap-3 text-sm">
            <span className={stage === "thinking" ? "animate-pulse" : ""}>Thinking</span>
            <span>→</span>
            <span className={stage === "streaming" ? "animate-pulse" : ""}>Generating</span>
            <span>→</span>
            <span className={stage === "jazz" ? "animate-pulse text-cyan-400" : ""}>Jazz Analysis</span>
            {stage === "done" && <Check className="text-green-400" size={18} />}
          </div>
          <div className="mt-2 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                trust >= 0.95 ? "bg-green-500" : trust >= 0.85 ? "bg-yellow-500" : "bg-red-500"
              }`}
              style={{ width: `${trust * 100}%` }}
            />
          </div>
          <div className="mt-1 text-right text-xs text-gray-400">
            Trust τ: {(trust * 100).toFixed(1)}%
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-b border-gray-700">
          <input
            type="text"
            value={instruction}
            onChange={e => setInstruction(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSubmit()}
            placeholder="e.g. make this async with error handling"
            className="w-full bg-gray-800 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            autoFocus
          />
        </div>

        {/* Diff */}
        {edited && (
          <div className="flex-1 overflow-hidden">
            <DiffEditor
              height="400px"
              original={original}
              modified={edited}
              language="typescript"
              theme="vs-dark"
              options={{ readOnly: true, renderSideBySide: false }}
            />
          </div>
        )}

        {/* Jazz Analysis */}
        {jazz && (
          <div className="p-4 bg-gray-800 border-t border-gray-700">
            <div className="text-sm font-medium mb-2">Jazz Team Self-Review</div>
            <div className="grid grid-cols-4 gap-3 text-xs">
              <div>Voice <span className="text-cyan-400">{(jazz.voice*100).toFixed(0)}%</span></div>
              <div>Choice <span className="text-cyan-400">{(jazz.choice*100).toFixed(0)}%</span></div>
              <div>Transparency <span className="text-cyan-400">{(jazz.transparency*100).toFixed(0)}%</span></div>
              <div>Trust τ <span className="text-green-400">{(jazz.trust*100).toFixed(1)}%</span></div>
            </div>
            {jazz.suggestions.length > 0 && (
              <div className="mt-2 text-xs text-gray-300">
                Suggestion: {jazz.suggestions[0]}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="p-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600">Cancel</button>
          {jazz?.suggestions && jazz.suggestions.length > 0 && (
            <button
              onClick={handleRefined}
              className="px-4 py-2 bg-cyan-600 rounded hover:bg-cyan-500 flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Apply Refined
            </button>
          )}
          <button
            onClick={handleAccept}
            disabled={!edited}
            className="px-6 py-2 bg-green-600 rounded hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Check size={16} />
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
