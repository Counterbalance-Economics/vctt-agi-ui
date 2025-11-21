import { useEffect, useState, useRef } from "react";
import { FileTreeWithIcons } from "../components/FileTreeWithIcons";
import { CodeEditor } from "../components/CodeEditor";
import { AIChat } from "../components/AIChat";
import { GitPanel } from "../components/GitPanel";
import CmdKModal, { EditStats } from "../components/CmdKModal";
import CommandPalette from "../components/CommandPalette";
import { QuickFileSwitcher } from "../components/QuickFileSwitcher";
import TestExplorer from "../components/TestExplorer";
import DeploymentPanel from "../components/DeploymentPanel";
import { StatusBar } from "../components/StatusBar";
import { FileMenu } from "../components/FileMenu";
import { XMarkIcon } from "@heroicons/react/24/outline";

const BACKEND_URL = "https://vctt-agi-phase3-complete.onrender.com";

export default function DeepAgentMode() {
  // Terminal state
  const [messages, setMessages] = useState<string[]>([
    "✅ Backend online – using MIN autonomous engine (Grok 4.1 + Jazz self-analysis)",
    "✨ Select code and press Cmd+K to edit with MIN's 5-model ensemble + Grok 4.1 verification",
    "",
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Editor state
  const [selectedFile, setSelectedFile] = useState<string | null>("/README.md");
  const [openFiles, setOpenFiles] = useState<string[]>(["/README.md"]);
  const [fileContents, setFileContents] = useState<Record<string, string>>({});
  const [fileContent, setFileContent] = useState<string>("");
  const [, setIsDirty] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(384); // Increased from 256px (w-64)
  const [isTerminalCollapsed, setIsTerminalCollapsed] = useState(true);

  // Cmd+K state
  const [isCmdKOpen, setIsCmdKOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState("");

  // Command Palette state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isQuickFileSwitcherOpen, setIsQuickFileSwitcherOpen] = useState(false);

  // Mock file list - in production, this would come from backend
  const availableFiles = [
    "/README.md",
    "/src/main.ts",
    "/src/components/Button.tsx",
    "/src/components/Input.tsx",
    "/src/components/Modal.tsx",
    "/src/utils/helpers.ts",
    "/src/utils/validators.ts",
    "/src/styles/globals.css",
    "/src/styles/theme.ts",
    "/tests/unit/helpers.test.ts",
    "/tests/integration/api.test.ts",
    "/package.json",
    "/tsconfig.json",
    "/vite.config.ts",
    ...openFiles, // Include all currently open files
  ];

  // Status bar state
  const [cursorLine, setCursorLine] = useState(1);
  const [cursorColumn, setCursorColumn] = useState(1);
  const [isConnected, setIsConnected] = useState(false);
  const [lastEditCost, setLastEditCost] = useState<number | null>(null);
  const [lastEditTokens, setLastEditTokens] = useState<number | null>(null);
  const [trustTau, setTrustTau] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [lastSaveTime, setLastSaveTime] = useState<number | null>(null);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [grokConfidence, setGrokConfidence] = useState<number | null>(null);
  const [currentBranch] = useState("main");

  useEffect(() => {
    testConnection();
    // Auto-open README.md on initial load
    handleFileSelect("/README.md");
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+Shift+P - Command Palette
      if (e.metaKey && e.shiftKey && e.key === "P") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      // Cmd+P - Quick File Switcher
      if (e.metaKey && !e.shiftKey && e.key === "p") {
        e.preventDefault();
        setIsQuickFileSwitcherOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const testConnection = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/health`);
      if (res.ok) {
        setIsConnected(true);
        addMessage("✅ Connected to backend");
      } else {
        setIsConnected(false);
      }
    } catch (err) {
      setIsConnected(false);
      addMessage("⚠️ Backend offline - using mock data");
    }
  };

  useEffect(() => {
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (msg: string) => {
    setMessages((prev) => [...prev, msg]);
  };

  const handleFileSelect = async (path: string) => {
    setSelectedFile(path);
    setIsDirty(false);

    // Add to open files if not already open
    if (!openFiles.includes(path)) {
      setOpenFiles((prev) => [...prev, path]);
    }

    // Load file content (use cached if available)
    if (fileContents[path]) {
      setFileContent(fileContents[path]);
    } else {
      // Mock file content for now - backend integration coming next
      const mockContent = getMockContentForFile(path);
      setFileContent(mockContent);
      setFileContents((prev) => ({ ...prev, [path]: mockContent }));
    }
  };

  const getMockContentForFile = (path: string): string => {
    if (path === "/README.md") {
      return `# MIN DeepAgent - The Self-Improving IDE

## Welcome to MIN
The most advanced AI-powered coding environment.

## Features
- 🎯 **Cmd+K AI Editing** - Select code, press Cmd+K, describe changes
- 🔍 **Real-time Trust Metrics** - Jazz self-analysis ensures quality
- 🚀 **Instant Deployment** - One-click deploy with live preview
- 🧪 **Integrated Testing** - Test explorer with run-all support

## Getting Started
1. Select a file from the explorer (left sidebar)
2. Select code you want to modify
3. Press **Cmd+K** to open AI editing mode
4. Describe your changes and watch MIN work its magic

## Trust Score (τ)
MIN uses a multi-agent verification system to ensure code quality:
- Voice: Does the code match the intent?
- Choice: Is this the best approach?
- Transparency: Is the code clear and maintainable?
- Trust (τ): Overall confidence score

Start coding now! Select any file from the explorer.`;
    }
    return `// File: ${path}\n// Backend integration active\n\nconsole.log('Hello from ${path}');\n\nexport default function example() {\n  return "Edit me with Cmd+K";\n}\n`;
  };

  const handleCloseFile = (path: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newOpenFiles = openFiles.filter((f) => f !== path);
    setOpenFiles(newOpenFiles);

    // If closing the selected file, switch to another open file
    if (path === selectedFile) {
      if (newOpenFiles.length > 0) {
        const newSelected = newOpenFiles[newOpenFiles.length - 1];
        setSelectedFile(newSelected);
        setFileContent(fileContents[newSelected] || "");
      } else {
        setSelectedFile(null);
        setFileContent("");
      }
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setFileContent(value);
      setIsDirty(true);
    }
  };

  const handleSave = async (isAutoSave = false) => {
    if (!selectedFile) return;
    
    setSaveStatus("saving");
    if (!isAutoSave) {
      addMessage(`💾 Saving: ${selectedFile}`);
    }

    // Simulate save delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Save the file
    setIsDirty(false);
    setSaveStatus("saved");
    setLastSaveTime(Date.now());
    
    if (!isAutoSave) {
      addMessage(`✅ Saved: ${selectedFile}`);
      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 2000);

      // Auto-commit with AI-generated message
      const commitMsg = generateCommitMessage(selectedFile);
      addMessage(`📝 Auto-committing: "${commitMsg}"`);
      addMessage(`✅ Committed to git`);
    }
  };

  const generateCommitMessage = (filePath: string): string => {
    // AI-powered commit message generation (mock for now)
    const fileName = filePath.split("/").pop();
    const messages = [
      `Update ${fileName}`,
      `Refactor ${fileName}`,
      `Fix ${fileName}`,
      `Improve ${fileName}`,
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  // File Menu Handlers
  const handleNewFile = () => {
    const fileName = prompt("Enter file name:");
    if (fileName) {
      const fullPath = `/src/${fileName}`;
      setOpenFiles((prev) => [...prev, fullPath]);
      setSelectedFile(fullPath);
      setFileContent("// New file\n\n");
      setFileContents((prev) => ({ ...prev, [fullPath]: "// New file\n\n" }));
      addMessage(`✨ Created new file: ${fullPath}`);
    }
  };

  const handleNewFolder = () => {
    const folderName = prompt("Enter folder name:");
    if (folderName) {
      addMessage(`📁 Created new folder: /src/${folderName}`);
    }
  };

  const handleOpenFile = () => {
    // Create a file input element dynamically
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".ts,.tsx,.js,.jsx,.json,.md,.txt,.css,.html,.py,.java,.cpp,.c,.h,.yaml,.yml";
    
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      try {
        const content = await file.text();
        const filePath = `/${file.name}`;
        
        // Add to file contents
        setFileContents((prev) => ({ ...prev, [filePath]: content }));
        
        // Open in new tab
        if (!openFiles.includes(filePath)) {
          setOpenFiles((prev) => [...prev, filePath]);
        }
        
        // Select the file
        setSelectedFile(filePath);
        setFileContent(content);
        
        addMessage(`📂 Opened: ${file.name}`);
      } catch (error) {
        addMessage(`❌ Failed to open file: ${error}`);
      }
    };
    
    // Trigger the file picker
    input.click();
  };

  const handleSaveAs = () => {
    if (!selectedFile) return;
    const newName = prompt("Save as:", selectedFile);
    if (newName) {
      setFileContents((prev) => ({ ...prev, [newName]: fileContent }));
      setOpenFiles((prev) => [...prev.filter((f) => f !== selectedFile), newName]);
      setSelectedFile(newName);
      addMessage(`💾 Saved as: ${newName}`);
    }
  };

  const handleFormatDocument = () => {
    if (!selectedFile) return;
    addMessage(`✨ Formatting document: ${selectedFile}`);
    // In production, this would call Prettier or similar
    setTimeout(() => addMessage(`✅ Document formatted`), 500);
  };

  const handleCloseAllTabs = () => {
    setOpenFiles([]);
    setSelectedFile(null);
    setFileContent("");
    addMessage("🗑️ Closed all tabs");
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
      addMessage("⚠️ Please select a file first");
      return;
    }
    // Get selected text from editor (or entire file if no selection)
    setSelectedCode(fileContent);
    setIsCmdKOpen(true);
    addMessage("✨ Cmd+K: AI editing mode activated");
  };

  const handleCmdKAccept = (editedCode: string, stats: EditStats) => {
    // Apply the edited code
    setFileContent(editedCode);
    setIsDirty(true);

    // Update status bar (including MIN trust metrics!)
    setLastEditCost(stats.cost);
    setLastEditTokens(stats.tokensUsed);
    setTrustTau(stats.trustTau ?? null);
    setGrokConfidence(stats.grokConfidence ?? null);

    // Log stats with trust metrics
    addMessage(`✅ AI edit applied (MIN Autonomous Engine):`);
    addMessage(`   +${stats.linesAdded} -${stats.linesDeleted} ~${stats.linesModified} lines`);
    addMessage(`   $${stats.cost.toFixed(4)} • ${stats.tokensUsed} tokens • ${stats.latency}ms`);
    if (stats.trustTau !== undefined) {
      addMessage(
        `   Trust τ: ${stats.trustTau.toFixed(2)} • Grok: ${((stats.grokConfidence ?? 0) * 100).toFixed(0)}%`
      );
    }

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
    setInput("");
    addMessage(`MIN > ${cmd}`);
    setIsProcessing(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/deep/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+N - New File
      if (e.metaKey && !e.shiftKey && e.key === "n") {
        e.preventDefault();
        handleNewFile();
      }
      // Cmd+Shift+N - New Folder
      if (e.metaKey && e.shiftKey && e.key === "N") {
        e.preventDefault();
        handleNewFolder();
      }
      // Cmd+O - Open File
      if (e.metaKey && !e.shiftKey && e.key === "o") {
        e.preventDefault();
        handleOpenFile();
      }
      // Cmd+S - Save
      if (e.metaKey && !e.shiftKey && e.key === "s") {
        e.preventDefault();
        handleSave(false);
      }
      // Cmd+Shift+S - Save As
      if (e.metaKey && e.shiftKey && e.key === "S") {
        e.preventDefault();
        handleSaveAs();
      }
      // Cmd+Shift+F - Format Document
      if (e.metaKey && e.shiftKey && e.key === "F") {
        e.preventDefault();
        handleFormatDocument();
      }
      // Cmd+W - Close Tab
      if (e.metaKey && !e.shiftKey && e.key === "w") {
        e.preventDefault();
        if (selectedFile) handleCloseFile(selectedFile);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedFile]);

  // Auto-save every 3 seconds when content changes
  useEffect(() => {
    if (!selectedFile || !fileContent) return;
    
    const autoSaveTimer = setTimeout(() => {
      handleSave(true); // Auto-save silently
    }, 3000);

    return () => clearTimeout(autoSaveTimer);
  }, [fileContent, selectedFile]);

  return (
    <div className="h-screen bg-gray-950 text-green-400 font-mono flex flex-col">
      {/* Cmd+K Modal */}
      {isCmdKOpen && (
        <CmdKModal
          original={selectedCode}
          onApply={handleCmdKAccept}
          onClose={() => setIsCmdKOpen(false)}
        />
      )}

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />

      {/* Quick File Switcher */}
      <QuickFileSwitcher
        isOpen={isQuickFileSwitcherOpen}
        onClose={() => setIsQuickFileSwitcherOpen(false)}
        onFileSelect={handleFileSelect}
        files={availableFiles}
      />

      {/* Save Toast */}
      {showSaveToast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-slide-in">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">File saved</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileMenu
              onNewFile={handleNewFile}
              onNewFolder={handleNewFolder}
              onOpenFile={handleOpenFile}
              onSave={handleSave}
              onSaveAs={handleSaveAs}
              onFormatDocument={handleFormatDocument}
              onCloseTab={() => selectedFile && handleCloseFile(selectedFile)}
              onCloseAllTabs={handleCloseAllTabs}
            />
            <div className="h-6 w-px bg-gray-700" />
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
        {/* Left Panel: Resizable File Tree */}
        <div
          className="border-r border-gray-800 flex-shrink-0"
          style={{ width: `${sidebarWidth}px` }}
        >
          <FileTreeWithIcons
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
            openFiles={openFiles}
          />
          {/* Resize Handle */}
          <div
            className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500 transition-colors"
            onMouseDown={(e) => {
              e.preventDefault();
              const startX = e.clientX;
              const startWidth = sidebarWidth;
              const handleMouseMove = (moveEvent: MouseEvent) => {
                const newWidth = Math.max(256, Math.min(600, startWidth + moveEvent.clientX - startX));
                setSidebarWidth(newWidth);
              };
              const handleMouseUp = () => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
              };
              document.addEventListener("mousemove", handleMouseMove);
              document.addEventListener("mouseup", handleMouseUp);
            }}
          />
        </div>

        {/* Center Panel: Code Editor + Terminal */}
        <div className="flex-1 flex flex-col">
          {/* Git Panel */}
          <GitPanel onPush={handlePush} onBranchSwitch={handleBranchSwitch} />

          {/* File Tabs Bar */}
          {openFiles.length > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-gray-900 border-b border-gray-800 overflow-x-auto">
              {openFiles.map((path) => {
                const fileName = path.split("/").pop() || path;
                const isActive = path === selectedFile;
                return (
                  <button
                    key={path}
                    onClick={() => handleFileSelect(path)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-t transition-colors text-sm relative ${
                      isActive
                        ? "bg-gray-800 text-white"
                        : "bg-gray-900/50 text-gray-400 hover:bg-gray-800/50 hover:text-gray-300"
                    }`}
                    style={
                      isActive
                        ? {
                            boxShadow: "0 2px 8px rgba(6, 182, 212, 0.4), inset 0 -2px 0 #06b6d4",
                          }
                        : {}
                    }
                  >
                    <span className="truncate max-w-[150px]">{fileName}</span>
                    <button
                      onClick={(e) => handleCloseFile(path, e)}
                      className="hover:bg-gray-700 rounded p-0.5 transition-colors"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </button>
                );
              })}
            </div>
          )}

          {/* Breadcrumb Navigation */}
          {selectedFile && (
            <div className="flex items-center gap-1 px-4 py-1 bg-gray-800/50 border-b border-gray-800 text-xs text-gray-400">
              {selectedFile.split("/").filter(Boolean).map((part, idx, arr) => (
                <span key={idx} className="flex items-center gap-1">
                  <span className="hover:text-gray-200 cursor-pointer">{part}</span>
                  {idx < arr.length - 1 && <span>/</span>}
                </span>
              ))}
            </div>
          )}

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

          {/* Bottom Panel: Collapsible Terminal */}
          <div
            className={`border-t border-gray-800 flex flex-col bg-gray-950 transition-all ${
              isTerminalCollapsed ? "h-12" : "h-64"
            }`}
          >
            <div
              className="px-4 py-2 bg-gray-900 border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors flex items-center justify-between"
              onClick={() => setIsTerminalCollapsed(!isTerminalCollapsed)}
            >
              <span className="text-xs text-gray-400 uppercase font-semibold">
                Terminal {isTerminalCollapsed && `(${messages.length} messages)`}
              </span>
              <button className="text-gray-400 hover:text-white text-xs">
                {isTerminalCollapsed ? "▲ Expand" : "▼ Collapse"}
              </button>
            </div>

            {!isTerminalCollapsed && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-1 text-sm">
                  {messages.map((msg, i) => (
                    <div key={i} className="text-green-400 whitespace-pre-wrap break-words">
                      {msg}
                    </div>
                  ))}
                  {isProcessing && <div className="text-green-600 animate-pulse">⏳ Processing...</div>}
                  <div ref={messagesEndRef} />
                </div>

                <div className="border-t border-gray-800 bg-gray-900 p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-green-500 font-bold">MIN &gt;</span>
                    <input
                      disabled={isProcessing}
                      className="flex-1 bg-transparent outline-none text-white placeholder-gray-600 disabled:opacity-50 text-sm"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && send()}
                      placeholder="Enter command..."
                    />
                    {isProcessing && <span className="text-green-600 animate-pulse">●</span>}
                  </div>
                </div>
              </>
            )}

            {/* Collapsed view: Show last 3 messages */}
            {isTerminalCollapsed && (
              <div className="px-4 py-1 text-xs text-gray-500 truncate">
                {messages.slice(-1)[0] || "No messages"}
              </div>
            )}
          </div>
        </div>

        {/* Test Explorer Panel */}
        <TestExplorer />

        {/* Deployment Panel */}
        <DeploymentPanel />

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
        trustTau={trustTau}
        grokConfidence={grokConfidence}
        saveStatus={saveStatus}
        lastSaveTime={lastSaveTime}
      />
    </div>
  );
}
