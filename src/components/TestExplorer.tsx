// src/components/TestExplorer.tsx
"use client";

import { Play, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useState } from "react";

interface Test {
  name: string;
  status: "pass" | "fail" | "pending";
  file: string;
  line: number;
}

const mockTests: Test[] = [
  { name: "should render without crashing", status: "pass", file: "App.test.tsx", line: 8 },
  { name: "should match snapshot", status: "pass", file: "App.test.tsx", line: 15 },
  { name: "should handle button click", status: "fail", file: "Button.test.tsx", line: 22 },
  { name: "should validate form", status: "pending", file: "Form.test.tsx", line: 10 },
  { name: "should fetch data", status: "pass", file: "Api.test.tsx", line: 5 },
];

export default function TestExplorer() {
  const [tests] = useState(mockTests);
  const passed = tests.filter((t) => t.status === "pass").length;
  const failed = tests.filter((t) => t.status === "fail").length;
  const pending = tests.filter((t) => t.status === "pending").length;

  const jumpToTest = (file: string, line: number) => {
    alert(`Jump to ${file}:${line}`);
    // TODO: integrate with editor navigation
  };

  return (
    <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col h-full">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h2 className="font-semibold">Test Explorer</h2>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded text-sm">
          <Play size={14} />
          Run All
        </button>
      </div>

      <div className="p-3 text-xs text-gray-400">
        {failed > 0 && <span className="text-red-400">{failed} failed • </span>}
        {pending > 0 && <span className="text-yellow-400">{pending} pending • </span>}
        <span className="text-green-400">{passed} passed</span>
        <span className="ml-2">({tests.length} total)</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tests.map((test, i) => (
          <div
            key={i}
            onClick={() => jumpToTest(test.file, test.line)}
            className="px-4 py-2 hover:bg-gray-800 cursor-pointer border-l-4 border-transparent hover:border-gray-700"
          >
            <div className="flex items-center gap-2">
              {test.status === "pass" && <CheckCircle2 size={16} className="text-green-400" />}
              {test.status === "fail" && <XCircle size={16} className="text-red-400" />}
              {test.status === "pending" && <AlertCircle size={16} className="text-yellow-400" />}
              <span className="text-sm">{test.name}</span>
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {test.file}:{test.line}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
