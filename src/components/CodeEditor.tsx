
import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  filePath: string | null;
  content: string;
  onChange: (value: string | undefined) => void;
  onSave: () => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ filePath, content, onChange, onSave }) => {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

    // Add save keyboard shortcut (Cmd+S / Ctrl+S)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onSave();
    });
  };

  const getLanguage = (path: string | null): string => {
    if (!path) return 'plaintext';
    const ext = path.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      ts: 'typescript',
      tsx: 'typescript',
      js: 'javascript',
      jsx: 'javascript',
      json: 'json',
      md: 'markdown',
      py: 'python',
      css: 'css',
      html: 'html',
      yml: 'yaml',
      yaml: 'yaml',
      sh: 'shell',
    };
    return languageMap[ext || ''] || 'plaintext';
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header with file name */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-sm text-gray-300">
          {filePath ? filePath : 'No file selected'}
        </span>
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
              fontSize: 14,
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              insertSpaces: true,
              wordWrap: 'on',
              lineNumbers: 'on',
              renderWhitespace: 'selection',
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              smoothScrolling: true,
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <DocumentIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No file selected</p>
              <p className="text-sm mt-2">Select a file from the explorer to start editing</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DocumentIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
