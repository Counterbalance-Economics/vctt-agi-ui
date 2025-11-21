
import React, { useRef, useEffect } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

interface CodeEditorProps {
  filePath: string | null;
  content: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCmdK: () => void;
  onCursorPositionChange?: (line: number, column: number) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  filePath,
  content,
  onChange,
  onSave,
  onCmdK,
  onCursorPositionChange,
}) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;

    // Listen to cursor position changes
    editor.onDidChangeCursorPosition((e) => {
      if (onCursorPositionChange) {
        onCursorPositionChange(e.position.lineNumber, e.position.column);
      }
    });

    // Keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onSave();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, () => {
      onCmdK();
    });
  };

  const getLanguage = (path: string): string => {
    const ext = path.split(".").pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      ts: "typescript",
      tsx: "typescript",
      js: "javascript",
      jsx: "javascript",
      json: "json",
      md: "markdown",
      py: "python",
      css: "css",
      scss: "scss",
      html: "html",
      yml: "yaml",
      yaml: "yaml",
    };
    return langMap[ext || ""] || "plaintext";
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header with file name */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-sm text-gray-300">{filePath ? filePath : "No file selected"}</span>
        {filePath && (
          <button
            onClick={onSave}
            className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
          >
            Save (Cmd+S)
          </button>
        )}
      </div>

      {/* Monaco Editor */}
      <div className="flex-1">
        {filePath ? (
          <Editor
            height="100%"
            language={getLanguage(filePath)}
            value={content}
            onChange={onChange}
            onMount={handleEditorDidMount}
            theme="vs-dark"
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              lineNumbers: "on",
              renderWhitespace: "selection",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              folding: true,
              wordWrap: "on",
              tabSize: 2,
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <DocumentIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No file selected</p>
              <p className="text-xs mt-2 text-gray-600">Select a file from the explorer to start editing</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DocumentIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);
