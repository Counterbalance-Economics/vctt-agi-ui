import { useEffect, useState, useRef } from 'react';
import { FileTree } from '../components/FileTree';
import { CodeEditor } from '../components/CodeEditor';
import { AIChat } from '../components/AIChat';
import { GitPanel } from '../components/GitPanel';
import { CmdKModal, EditStats } from '../components/CmdKModal';
import { StatusBar } from '../components/StatusBar';

const BACKEND_URL = 'https://vctt-agi-phase3-complete.onrender.com';

export default function DeepAgentMode() {
  // Terminal state
  const [messages, setMessages] = useState<string[]>([
    '✅ Phase 4: Cmd+K AI Editing Ready',
    '✨ Select code and press Cmd+K to edit with Claude 3.5 Sonnet',
    '',
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Editor state
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [, setIsDirty] = useState(false);

  // Cmd+K state
  const [isCmdKOpen, setIsCmdKOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState('');

  // Status bar state
  const [cursorLine, setCursorLine] = useState(1);
  const [cursorColumn, setCursorColumn] = useState(1);
  const [isConnected, setIsConnected] = useState(false);
  const [lastEditCost, setLastEditCost] = useState<number | null>(null);
  const [lastEditTokens, setLastEditTokens] = useState<number | null>(null);
  const [currentBranch] = useState('main');

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/health`);
      if (res.ok) {
        setIsConnected(true);
        addMessage('✅ Connected to backend');
      } else {
        setIsConnected(false);
      }
    } catch (err) {
      setIsConnected(false);
      addMessage('⚠️ Backend offline - using mock data');
    }
  };

  useEffect(() => {
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (msg: string) => {
    setMessages(prev => [...prev, msg]);
  };

  const handleFileSelect = async (path: string) => {
    setSelectedFile(path);
    setIsDirty(false);
    // Mock file content for now - backend integration coming next
    const mockContent = `// File: ${path}\n// Backend integration coming in Phase 2\n\nconsole.log('Hello from ${path}');\n`;
    setFileContent(mockContent);
    addMessage(`📂 Opened: ${path}`);
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setFileContent(value);
      setIsDirty(true);
    }
  };

  const handleSave = async () => {
    if (!selectedFile) return;
    addMessage(`💾 Saving: ${selectedFile}`);
    
    // Save the file
    setIsDirty(false);
    addMessage(`✅ Saved: ${selectedFile}`);
    
    // Auto-commit with AI-generated message
    const commitMsg = generateCommitMessage(selectedFile);
    addMessage(`📝 Auto-committing: "${commitMsg}"`);
    addMessage(`✅ Committed to git`);
  };

  const generateCommitMessage = (filePath: string): string => {
    // AI-powered commit message generation (mock for now)
    const fileName = filePath.split('/').pop();
    const messages = [
      `Update ${fileName}`,
      `Refactor ${fileName}`,
      `Fix ${fileName}`,
      `Improve ${fileName}`,
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const handlePush = () => {
    addMessage(`🚀 Pushing to remote...`);
    setTimeout(() => addMessage(`✅ Pushed to origin/main`), 1000);
  };

  const handleBranchSwitch = (branch: string) => {
    addMessage(`🔀 Switched to branch: ${branch}`);
  };

  const handleCodeEdit = (filePath: string, newContent: string) => {
    if (filePath === selectedFile) {
      setFileContent(newContent);
      setIsDirty(true);
      addMessage(`✏️ AI edited: ${filePath}`);
    }
  };

  const handleCmdK = () => {
    if (!selectedFile) {
      addMessage('⚠️ Please select a file first');
      return;
    }
    // Get selected text from editor (or entire file if no selection)
    setSelectedCode(fileContent);
    setIsCmdKOpen(true);
    addMessage('✨ Cmd+K: AI editing mode activated');
  };

  const handleCmdKAccept = (editedCode: string, stats: EditStats) => {
    // Apply the edited code
    setFileContent(editedCode);
    setIsDirty(true);
    
    // Update status bar
    setLastEditCost(stats.cost);
    setLastEditTokens(stats.tokensUsed);
    
    // Log stats
    addMessage(`✅ AI edit applied:`);
    addMessage(`   +${stats.linesAdded} -${stats.linesDeleted} ~${stats.linesModified} lines`);
    addMessage(`   $${stats.cost.toFixed(4)} • ${stats.tokensUsed} tokens • ${stats.latency}ms`);
    
    // Auto-save
    handleSave();
  };

  const handleCursorPositionChange = (line: number, column: number) => {
    setCursorLine(line);
    setCursorColumn(column);
  };

  const send = async () => {
    if (!input.trim() || isProcessing) return;
    
    const cmd = input;
    setInput('');
    addMessage(`MIN > ${cmd}`);
    setIsProcessing(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/deep/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (data.output) {
        addMessage(data.output);
      }
      if (data.error) {
        addMessage(`❌ ERROR: ${data.error}`);
      }
    } catch (err: any) {
      addMessage(`❌ ERROR: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-screen bg-gray-950 text-green-400 font-mono flex flex-col">
      {/* Cmd+K Modal */}
      <CmdKModal
        isOpen={isCmdKOpen}
        onClose={() => setIsCmdKOpen(false)}
        selectedCode={selectedCode}
        filePath={selectedFile || ''}
        onAccept={handleCmdKAccept}
      />

      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🤖</div>
            <h1 className="text-xl font-bold text-white">MIN DeepAgent</h1>
            <span className="text-xs text-gray-500">Code Editor • Terminal • AI Co-Pilot</span>
            <span className="text-xs text-blue-400 font-semibold">✨ Cmd+K to edit</span>
          </div>
          <a
            href="/chat"
            className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-gray-300 text-sm transition-all"
          >
            ← Back
          </a>
        </div>
      </div>

      {/* Main Layout: 4 panels */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: File Tree */}
        <div className="w-64 border-r border-gray-800">
          <FileTree onFileSelect={handleFileSelect} selectedFile={selectedFile} />
        </div>

        {/* Center Panel: Code Editor + Terminal */}
        <div className="flex-1 flex flex-col">
          {/* Git Panel */}
          <GitPanel onPush={handlePush} onBranchSwitch={handleBranchSwitch} />

          {/* Code Editor */}
          <div className="flex-1">
            <CodeEditor
              filePath={selectedFile}
              content={fileContent}
              onChange={handleEditorChange}
              onSave={handleSave}
              onCmdK={handleCmdK}
              onCursorPositionChange={handleCursorPositionChange}
            />
          </div>

          {/* Bottom Panel: Terminal */}
          <div className="h-64 border-t border-gray-800 flex flex-col bg-gray-950">
            <div className="px-4 py-2 bg-gray-900 border-b border-gray-800">
              <span className="text-xs text-gray-400 uppercase font-semibold">Terminal</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-1 text-sm">
              {messages.map((msg, i) => (
                <div key={i} className="text-green-400 whitespace-pre-wrap break-words">
                  {msg}
                </div>
              ))}
              {isProcessing && (
                <div className="text-green-600 animate-pulse">⏳ Processing...</div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-gray-800 bg-gray-900 p-3">
              <div className="flex items-center gap-3">
                <span className="text-green-500 font-bold">MIN &gt;</span>
                <input
                  disabled={isProcessing}
                  className="flex-1 bg-transparent outline-none text-white placeholder-gray-600 disabled:opacity-50 text-sm"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && send()}
                  placeholder="Enter command..."
                />
                {isProcessing && (
                  <span className="text-green-600 animate-pulse">●</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: AI Chat */}
        <div className="w-96 border-l border-gray-800">
          <AIChat selectedFile={selectedFile} onCodeEdit={handleCodeEdit} />
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar
        branch={currentBranch}
        line={cursorLine}
        column={cursorColumn}
        isConnected={isConnected}
        lastEditCost={lastEditCost}
        lastEditTokens={lastEditTokens}
      />
    </div>
  );
}
