
import { useRef, useImperativeHandle, forwardRef } from "react";
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

// FIX #2: Export editor instance type
export interface CodeEditorHandle {
  getEditor: () => monaco.editor.IStandaloneCodeEditor | null;
}

export const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(
  (
    {
      filePath,
      content,
      onChange,
      onSave,
      onCmdK,
      onCursorPositionChange,
    },
    ref
  ) => {
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

    // FIX #2: Expose editor instance to parent
    useImperativeHandle(ref, () => ({
      getEditor: () => editorRef.current,
    }));

    const handleEditorDidMount: OnMount = (editor) => {
      editorRef.current = editor;

    // FIX #2: Reset scroll to top when file opens
    editor.setScrollTop(0);
    editor.revealLine(1);

    // Listen to cursor position changes
    editor.onDidChangeCursorPosition((e: any) => {
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

    // FIX: Add Quick Fix UI (like Cursor) - shows "Fix in Chat" on errors
    const model = editor.getModel();
    if (model) {
      // Register Code Action Provider for all languages
      monaco.languages.registerCodeActionProvider('*', {
        provideCodeActions: (model, _range, context) => {
          // Only show actions if there are diagnostics (errors/warnings)
          if (!context.markers || context.markers.length === 0) {
            return { actions: [], dispose: () => {} };
          }

          const actions: monaco.languages.CodeAction[] = [];
          
          // Get the error text
          const errorMarker = context.markers[0];
          const errorMessage = errorMarker.message;
          const errorCode = model.getValueInRange({
            startLineNumber: errorMarker.startLineNumber,
            startColumn: errorMarker.startColumn,
            endLineNumber: errorMarker.endLineNumber,
            endColumn: errorMarker.endColumn
          });

          // "Fix in Chat" action (Cmd+Shift+I)
          actions.push({
            title: '💬 Fix in Chat (Cmd+Shift+I)',
            kind: 'quickfix',
            diagnostics: context.markers,
            isPreferred: true,
            command: {
              id: 'fix-in-chat',
              title: 'Fix in Chat',
              arguments: [errorMessage, errorCode, errorMarker.startLineNumber]
            }
          });

          // "View Problem" action - simpler approach without edit
          actions.push({
            title: '🔍 View Problem (Cmd+K to fix)',
            kind: 'quickfix',
            diagnostics: context.markers,
            command: {
              id: 'fix-in-chat',
              title: 'Fix in Chat',
              arguments: [errorMessage, errorCode, errorMarker.startLineNumber]
            }
          });

          return {
            actions: actions,
            dispose: () => {}
          };
        }
      });

      // Register command handler for "Fix in Chat"
      editor.addAction({
        id: 'fix-in-chat',
        label: 'Fix in Chat',
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyI],
        run: () => {
          // Trigger Cmd+K modal with error context
          onCmdK();
        }
      });
    }
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
            onChange={(value) => onChange(value || "")}
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
              unicodeHighlight: {
                ambiguousCharacters: false,
                invisibleCharacters: false,
              },
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
});

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
