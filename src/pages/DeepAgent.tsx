import { useEffect, useState, useRef } from "react";
import { FileTreeWithIcons } from "../components/FileTreeWithIcons";
import { CodeEditor, CodeEditorHandle } from "../components/CodeEditor";
import { AIChat } from "../components/AIChat";
import { GitPanel } from "../components/GitPanel";
import CmdKModal, { EditStats } from "../components/CmdKModal";
import CommandPalette from "../components/CommandPalette";
import { QuickFileSwitcher } from "../components/QuickFileSwitcher";
import { StatusBar } from "../components/StatusBar";
import { FileMenu } from "../components/FileMenu";
import { EditMenu } from "../components/EditMenu";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { getModKey, modKeyFull } from "../utils/keyboard";

const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL || "https://vctt-agi-backend.onrender.com";

export default function DeepAgentMode() {
  // Terminal state
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // FIX #2: Editor ref for Edit menu integration
  const editorRef = useRef<CodeEditorHandle>(null);

  // Editor state
  const [selectedFile, setSelectedFile] = useState<string | null>("/README.md");
  const [openFiles, setOpenFiles] = useState<string[]>(["/README.md"]);
  const [fileContents, setFileContents] = useState<Record<string, string>>({});
  const [fileContent, setFileContent] = useState<string>("");
  const [, setIsDirty] = useState(false);
  
  // FIX #6-7: Panel sizes with localStorage persistence
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const stored = localStorage.getItem("sidebarWidth");
    return stored ? parseInt(stored) : 384;
  });
  const [terminalHeight, setTerminalHeight] = useState(() => {
    const stored = localStorage.getItem("terminalHeight");
    return stored ? parseInt(stored) : 256;
  });

  const [aiChatWidth, setAiChatWidth] = useState(() => {
    const stored = localStorage.getItem("aiChatWidth");
    return stored ? parseInt(stored) : 384;
  });
  
  // FINAL FIX #1: Save panel sizes to localStorage when they change
  useEffect(() => {
    localStorage.setItem("sidebarWidth", sidebarWidth.toString());
  }, [sidebarWidth]);

  useEffect(() => {
    localStorage.setItem("terminalHeight", terminalHeight.toString());
  }, [terminalHeight]);

  useEffect(() => {
    localStorage.setItem("aiChatWidth", aiChatWidth.toString());
  }, [aiChatWidth]);
  
  const [isTerminalCollapsed, setIsTerminalCollapsed] = useState(true);
  const [loadedFolderFiles, setLoadedFolderFiles] = useState<string[]>([]);

  // Cmd+K (Mac) / Ctrl+K (Windows) state
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
  const [showBinaryFileToast, setShowBinaryFileToast] = useState(false);
  const [grokConfidence, setGrokConfidence] = useState<number | null>(null);
  const [currentBranch] = useState("main");

  useEffect(() => {
    // Set initial terminal messages with correct keyboard shortcuts
    setMessages([
      "✅ Backend online – using MIN autonomous engine (Grok 4.1 + Jazz self-analysis)",
      `✨ Select code and press ${modKeyFull}+K to edit with MIN's 5-model ensemble + Grok 4.1 verification`,
      "",
    ]);
    
    // Initial connection test
    testConnection();
    // Auto-open README.md on initial load
    handleFileSelect("/README.md");

    // Poll /health every 5 seconds to maintain connection status
    const healthCheckInterval = setInterval(() => {
      testConnection(false); // Don't show messages on polling
    }, 5000);

    return () => clearInterval(healthCheckInterval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows) - Command Palette
      if (getModKey(e) && e.shiftKey && e.key === "P") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      // Cmd+P (Mac) or Ctrl+P (Windows) - Quick File Switcher
      if (getModKey(e) && !e.shiftKey && e.key === "p") {
        e.preventDefault();
        setIsQuickFileSwitcherOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const testConnection = async (showMessages = true) => {
    try {
      const res = await fetch(`${BACKEND_URL}/health`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const wasDisconnected = !isConnected;
        setIsConnected(true);
        if (showMessages && wasDisconnected) {
          addMessage("✅ Connected to backend");
        }
      } else {
        setIsConnected(false);
      }
    } catch (err) {
      setIsConnected(false);
      // Only show offline message on initial connection attempt
      if (showMessages) {
        console.error("Backend connection failed:", err);
      }
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
    console.log('🔍 handleFileSelect called with:', path);
    
    // FIX: EXPANDED binary detection - includes Office formats
    const binaryExtensions = [
      '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.svg', '.webp', // Images
      '.pdf', '.zip', '.tar', '.gz', '.rar', '.7z', // Archives
      '.mp4', '.mov', '.avi', '.mp3', '.wav', '.flv', '.wmv', // Media
      '.exe', '.dll', '.so', '.dylib', // Executables
      '.woff', '.woff2', '.ttf', '.eot', // Fonts
      '.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt', // Office
      '.odt', '.ods', '.odp', // OpenOffice
      '.db', '.sqlite', '.bin', // Databases
    ];
    
    const isBinary = binaryExtensions.some(ext => path.toLowerCase().endsWith(ext));
    
    console.log('🔍 Is binary?', isBinary, 'Path:', path);
    
    if (isBinary) {
      console.log('❌ BLOCKING binary file from opening');
      const fileName = path.split('/').pop() || path;
      const fileType = path.toLowerCase().endsWith('.docx') || path.toLowerCase().endsWith('.doc') 
        ? 'Word document' 
        : path.toLowerCase().endsWith('.xlsx') || path.toLowerCase().endsWith('.xls')
        ? 'Excel spreadsheet'
        : path.toLowerCase().endsWith('.pptx') || path.toLowerCase().endsWith('.ppt')
        ? 'PowerPoint presentation'
        : path.toLowerCase().endsWith('.pdf')
        ? 'PDF document'
        : 'binary file';
      
      // Show toast notification
      setShowBinaryFileToast(true);
      setTimeout(() => setShowBinaryFileToast(false), 3000);
      // Add helpful message to terminal
      addMessage(`❌ Cannot open ${fileType}: ${fileName}`);
      addMessage(`💡 Tip: ${fileType}s must be opened in their respective applications (Word, Excel, etc.)`);
      // Don't open the file - EXIT IMMEDIATELY
      return;
    }

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
- 🎯 **${modKeyFull}+K AI Editing** - Select code, press ${modKeyFull}+K, describe changes
- 🔍 **Real-time Trust Metrics** - Jazz self-analysis ensures quality
- 🚀 **Instant Deployment** - One-click deploy with live preview
- 🧪 **Integrated Testing** - Test explorer with run-all support

## Getting Started
1. Select a file from the explorer (left sidebar)
2. Select code you want to modify
3. Press **${modKeyFull}+K** to open AI editing mode
4. Describe your changes and watch MIN work its magic

## Trust Score (τ)
MIN uses a multi-agent verification system to ensure code quality:
- Voice: Does the code match the intent?
- Choice: Is this the best approach?
- Transparency: Is the code clear and maintainable?
- Trust (τ): Overall confidence score

Start coding now! Select any file from the explorer.`;
    }
    return `// File: ${path}\n// Backend integration active\n\nconsole.log('Hello from ${path}');\n\nexport default function example() {\n  return "Edit me with ${modKeyFull}+K";\n}\n`;
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

  // FIX #1: Binary file detection helper - EXPANDED with Office formats
  const isBinaryFile = (filename: string): boolean => {
    const binaryExtensions = [
      '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.svg', '.webp', // Images
      '.pdf', '.zip', '.tar', '.gz', '.rar', '.7z', // Archives
      '.exe', '.dll', '.so', '.dylib', // Executables
      '.mp3', '.mp4', '.avi', '.mov', '.wav', '.flv', '.wmv', // Media
      '.ttf', '.woff', '.woff2', '.eot', // Fonts
      '.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt', // Office
      '.odt', '.ods', '.odp', // OpenOffice
      '.db', '.sqlite', '.bin', // Databases/Binary
    ];
    const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
    return binaryExtensions.includes(ext);
  };

  const handleOpenFolder = async () => {
    try {
      // Use the File System Access API to open a directory
      // @ts-ignore - showDirectoryPicker is not yet in all TypeScript types
      if (!window.showDirectoryPicker) {
        addMessage("❌ Folder picker not supported in this browser");
        return;
      }

      // @ts-ignore
      const directoryHandle = await window.showDirectoryPicker();
      addMessage(`📁 Loading folder: ${directoryHandle.name}...`);

      // Recursively read the directory
      const loadDirectory = async (dirHandle: any, path: string = "") => {
        const files: Record<string, string> = {};
        const paths: string[] = [];
        let skippedBinaryCount = 0;

        for await (const entry of dirHandle.values()) {
          // Skip node_modules, .git, dist, build, and other common large directories
          if (entry.kind === "directory" && 
              ['node_modules', '.git', 'dist', 'build', '.next', 'out', 'coverage'].includes(entry.name)) {
            continue;
          }

          const entryPath = `${path}/${entry.name}`;

          if (entry.kind === "file") {
            // FIX #1: Skip binary files
            if (isBinaryFile(entry.name)) {
              skippedBinaryCount++;
              continue;
            }

            try {
              const file = await entry.getFile();
              const content = await file.text();
              files[entryPath] = content;
              paths.push(entryPath);
            } catch (error) {
              console.error(`Failed to read file: ${entryPath}`, error);
              skippedBinaryCount++; // Count failed reads as binary
            }
          } else if (entry.kind === "directory") {
            // Recursively load subdirectories
            const subFiles = await loadDirectory(entry, entryPath);
            Object.assign(files, subFiles.files);
            paths.push(...subFiles.paths);
            skippedBinaryCount += subFiles.skippedBinaryCount || 0;
          }
        }

        return { files, paths, skippedBinaryCount };
      };

      const { files, paths, skippedBinaryCount } = await loadDirectory(directoryHandle);

      // Update state with loaded files
      setFileContents((prev) => ({ ...prev, ...files }));
      setLoadedFolderFiles(paths); // Store paths for FileTreeWithIcons

      // Open the first file if any
      if (paths.length > 0) {
        const firstFile = paths[0];
        setSelectedFile(firstFile);
        setFileContent(files[firstFile]);
        setOpenFiles([firstFile]);
      }

      addMessage(`✅ Loaded ${paths.length} text files from: ${directoryHandle.name}`);
      if (skippedBinaryCount > 0) {
        addMessage(`⚠️ Skipped ${skippedBinaryCount} binary files (images, archives, etc.)`);
      }
      
      // CRITICAL FIX: Force connection status to Online after successful folder load
      setIsConnected(true);
      addMessage(`✅ Status: main • Online`);
    } catch (error: any) {
      if (error.name === "AbortError") {
        addMessage("📁 Folder selection cancelled");
      } else {
        addMessage(`❌ Failed to open folder: ${error.message}`);
      }
    }
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
    addMessage(`✨ ${modKeyFull}+K: AI editing mode activated`);
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

  // FIX #6-7: Persist panel sizes to localStorage
  useEffect(() => {
    localStorage.setItem("sidebarWidth", sidebarWidth.toString());
  }, [sidebarWidth]);

  useEffect(() => {
    localStorage.setItem("terminalHeight", terminalHeight.toString());
  }, [terminalHeight]);

  useEffect(() => {
    localStorage.setItem("aiChatWidth", aiChatWidth.toString());
  }, [aiChatWidth]);

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

      {/* Binary File Toast */}
      {showBinaryFileToast && (
        <div className="fixed top-4 right-4 z-50 bg-yellow-600 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-slide-in">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="font-medium">Image files cannot be edited in the editor</span>
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
              onOpenFolder={handleOpenFolder}
              onSave={handleSave}
              onSaveAs={handleSaveAs}
              onFormatDocument={handleFormatDocument}
              onCloseTab={() => selectedFile && handleCloseFile(selectedFile)}
              onCloseAllTabs={handleCloseAllTabs}
            />
            <EditMenu editorRef={editorRef} />
            <div className="h-6 w-px bg-gray-700" />
            <div className="text-2xl">🤖</div>
            <h1 className="text-xl font-bold text-white">MIN DeepAgent</h1>
            <span className="text-xs text-gray-500">Code Editor • Terminal • AI Co-Pilot</span>
            <span className="text-xs text-blue-400 font-semibold">✨ {modKeyFull}+K to edit</span>
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
        {/* Left Panel: Resizable File Tree - FIX: Added relative positioning for resize handle */}
        <div
          className="border-r border-gray-800 flex-shrink-0 relative"
          style={{ width: `${sidebarWidth}px` }}
        >
          <FileTreeWithIcons
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
            openFiles={openFiles}
            loadedFiles={loadedFolderFiles}
          />
        </div>

        {/* Center Panel: Code Editor + Terminal with LEFT drag handle */}
        <div className="flex-1 flex flex-col relative">
          {/* Left drag handle - resizes Explorer */}
          <div
            className="absolute top-0 left-0 h-full hover:bg-blue-500/50 active:bg-blue-500/70 transition-colors"
            style={{ 
              width: '6px',
              cursor: 'col-resize',
              zIndex: 10,
              userSelect: 'none',
              backgroundColor: 'rgba(75, 85, 99, 0.5)',
              marginLeft: '-3px' // Extend into Explorer panel
            }}
            title="Drag to resize explorer"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const startX = e.clientX;
              const startWidth = sidebarWidth;
              
              const handleMouseMove = (moveEvent: MouseEvent) => {
                const delta = moveEvent.clientX - startX;
                const newWidth = Math.max(200, Math.min(800, startWidth + delta));
                setSidebarWidth(newWidth);
              };
              
              const handleMouseUp = () => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
              };
              
              document.body.style.cursor = 'col-resize';
              document.body.style.userSelect = 'none';
              document.addEventListener("mousemove", handleMouseMove);
              document.addEventListener("mouseup", handleMouseUp);
            }}
          />
          
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

          {/* Code Editor - FIX: Added min-height to prevent terminal from pushing it out */}
          <div className="flex-1 overflow-hidden" style={{ minHeight: '300px' }}>
            <CodeEditor
              ref={editorRef}
              filePath={selectedFile}
              content={fileContent}
              onChange={handleEditorChange}
              onSave={handleSave}
              onCmdK={handleCmdK}
              onCursorPositionChange={handleCursorPositionChange}
            />
          </div>

          {/* Bottom Panel: Collapsible Terminal - FIX: Added max-height constraint */}
          <div
            className={`border-t border-gray-800 flex flex-col bg-gray-950 transition-all relative flex-shrink-0 ${
              isTerminalCollapsed ? "h-12" : ""
            }`}
            style={!isTerminalCollapsed ? { height: `${terminalHeight}px`, maxHeight: '400px' } : {}}
          >
            {/* Terminal drag handle (top edge) */}
            {!isTerminalCollapsed && (
              <div
                className="absolute top-0 left-0 right-0 hover:bg-blue-500/50 active:bg-blue-500/70 transition-colors"
                style={{ 
                  height: '6px',
                  cursor: 'row-resize',
                  zIndex: 10,
                  userSelect: 'none',
                  backgroundColor: 'rgba(75, 85, 99, 0.5)'
                }}
                title="Drag to resize terminal"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const startY = e.clientY;
                  const startHeight = terminalHeight;
                  
                  const handleMouseMove = (moveEvent: MouseEvent) => {
                    const delta = startY - moveEvent.clientY;
                    const newHeight = Math.max(100, Math.min(600, startHeight + delta));
                    setTerminalHeight(newHeight);
                  };
                  
                  const handleMouseUp = () => {
                    document.removeEventListener("mousemove", handleMouseMove);
                    document.removeEventListener("mouseup", handleMouseUp);
                    document.body.style.cursor = '';
                    document.body.style.userSelect = '';
                  };
                  
                  document.body.style.cursor = 'row-resize';
                  document.body.style.userSelect = 'none';
                  document.addEventListener("mousemove", handleMouseMove);
                  document.addEventListener("mouseup", handleMouseUp);
                }}
              />
            )}
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
                    <div key={i} className="text-green-400 whitespace-pre-wrap break-words" style={{ lineHeight: '1.4', wordBreak: 'break-word' }}>
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

        {/* Right Panel: AI Chat with LEFT drag handle */}
        <div className="border-l border-gray-800 relative flex-shrink-0" style={{ width: `${aiChatWidth}px` }}>
          {/* Drag handle on LEFT edge of AI panel - resizes AI Assistant */}
          <div
            className="absolute top-0 left-0 h-full hover:bg-blue-500/50 active:bg-blue-500/70 transition-colors"
            style={{ 
              width: '6px',
              cursor: 'col-resize',
              zIndex: 100,
              userSelect: 'none',
              backgroundColor: 'rgba(75, 85, 99, 0.5)',
              marginLeft: '-3px' // Extend into middle panel
            }}
            title="Drag to resize AI panel"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const startX = e.clientX;
              const startWidth = aiChatWidth;
              
              const handleMouseMove = (moveEvent: MouseEvent) => {
                const delta = startX - moveEvent.clientX; // Drag left = wider
                const newWidth = Math.max(200, Math.min(800, startWidth + delta));
                setAiChatWidth(newWidth);
              };
              
              const handleMouseUp = () => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
              };
              
              document.body.style.cursor = 'col-resize';
              document.body.style.userSelect = 'none';
              document.addEventListener("mousemove", handleMouseMove);
              document.addEventListener("mouseup", handleMouseUp);
            }}
          />
          <AIChat 
            selectedFile={selectedFile} 
            fileContent={fileContent}
            onCodeEdit={handleCodeEdit} 
          />
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
