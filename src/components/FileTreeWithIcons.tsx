
import React, { useState, useEffect } from "react";
import {
  ChevronRightIcon,
  ChevronDownIcon,
  FolderIcon,
  FolderOpenIcon,
  DocumentIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import {
  DocumentTextIcon,
  CodeBracketIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/solid";

interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
  gitStatus?: "M" | "A" | "D"; // Modified, Added, Deleted
}

interface FileTreeProps {
  onFileSelect: (path: string) => void;
  selectedFile: string | null;
  openFiles?: string[];
  loadedFiles?: string[]; // NEW: Files loaded from folder picker
}

const BACKEND_URL = "https://vctt-agi-backend.onrender.com";

export const FileTreeWithIcons: React.FC<FileTreeProps> = ({
  onFileSelect,
  selectedFile,
  openFiles = [],
  loadedFiles = [],
}) => {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["/", "/src", "/src/config"]));
  const [loading, setLoading] = useState(true);
  const [draggedNode, setDraggedNode] = useState<FileNode | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const [recentFiles, setRecentFiles] = useState<string[]>([]);
  const [isRecentExpanded, setIsRecentExpanded] = useState(true);

  useEffect(() => {
    fetchFileTree();
    // Load recent files from localStorage
    const stored = localStorage.getItem("recentFiles");
    if (stored) {
      try {
        setRecentFiles(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse recent files:", e);
      }
    }
  }, []);

  // Rebuild tree when loadedFiles changes
  useEffect(() => {
    if (loadedFiles.length > 0) {
      console.log('🗂️ Building tree from loaded files:', loadedFiles.length);
      const newTree = buildTreeFromPaths(loadedFiles);
      setTree(newTree);
      setLoading(false);
    }
  }, [loadedFiles]);

  // Update recent files when a file is selected
  useEffect(() => {
    if (selectedFile) {
      setRecentFiles((prev) => {
        // Remove if already exists, then add to front
        const filtered = prev.filter((f) => f !== selectedFile);
        const updated = [selectedFile, ...filtered].slice(0, 8); // Keep only last 8
        // Save to localStorage
        localStorage.setItem("recentFiles", JSON.stringify(updated));
        return updated;
      });
    }
  }, [selectedFile]);

  const buildTreeFromPaths = (paths: string[]): FileNode[] => {
    // Build a tree structure from flat file paths
    const root: Record<string, any> = {};

    paths.forEach((path) => {
      const parts = path.split('/').filter(Boolean);
      let current = root;

      parts.forEach((part, index) => {
        if (!current[part]) {
          current[part] = { _files: [], _dirs: {} };
        }
        
        if (index === parts.length - 1) {
          // It's a file
          current[part]._isFile = true;
          current[part]._path = path;
        } else {
          // It's a directory
          current = current[part]._dirs || current[part];
        }
      });
    });

    const convertToFileNodes = (obj: Record<string, any>, parentPath: string = ''): FileNode[] => {
      const nodes: FileNode[] = [];

      Object.keys(obj).forEach((key) => {
        if (key.startsWith('_')) return; // Skip metadata keys

        const item = obj[key];
        const path = parentPath ? `${parentPath}/${key}` : `/${key}`;

        if (item._isFile) {
          nodes.push({
            name: key,
            path: path,
            type: 'file',
          });
        } else {
          const children = convertToFileNodes(item._dirs || item, path);
          nodes.push({
            name: key,
            path: path,
            type: 'directory',
            children: children.length > 0 ? children : undefined,
          });
        }
      });

      return nodes.sort((a, b) => {
        // Directories first, then files
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
    };

    return convertToFileNodes(root);
  };

  const fetchFileTree = async () => {
    try {
      const mockTree: FileNode[] = [
        {
          name: "src",
          path: "/src",
          type: "directory",
          children: [
            { name: "main.ts", path: "/src/main.ts", type: "file" },
            { name: "app.module.ts", path: "/src/app.module.ts", type: "file", gitStatus: "M" },
            {
              name: "config",
              path: "/src/config",
              type: "directory",
              children: [
                { name: "llm.config.ts", path: "/src/config/llm.config.ts", type: "file" },
                { name: "database.ts", path: "/src/config/database.ts", type: "file" },
              ],
            },
            {
              name: "components",
              path: "/src/components",
              type: "directory",
              children: [
                { name: "Button.tsx", path: "/src/components/Button.tsx", type: "file" },
                { name: "Modal.tsx", path: "/src/components/Modal.tsx", type: "file", gitStatus: "A" },
              ],
            },
          ],
        },
        {
          name: "package.json",
          path: "/package.json",
          type: "file",
        },
        {
          name: "README.md",
          path: "/README.md",
          type: "file",
        },
        {
          name: "tsconfig.json",
          path: "/tsconfig.json",
          type: "file",
        },
      ];
      setTree(mockTree);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load file tree:", error);
      setLoading(false);
    }
  };

  const toggleExpanded = (path: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpanded(newExpanded);
  };

  const handleDragStart = (e: React.DragEvent, node: FileNode) => {
    e.stopPropagation();
    setDraggedNode(node);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", node.path);
  };

  const handleDragOver = (e: React.DragEvent, node: FileNode) => {
    e.preventDefault();
    e.stopPropagation();
    if (node.type === "directory" && draggedNode && node.path !== draggedNode.path) {
      e.dataTransfer.dropEffect = "move";
      setDropTarget(node.path);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDropTarget(null);
  };

  const handleDrop = async (e: React.DragEvent, targetNode: FileNode) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTarget(null);

    if (!draggedNode || targetNode.type !== "directory" || targetNode.path === draggedNode.path) {
      setDraggedNode(null);
      return;
    }

    if (draggedNode.type === "directory" && targetNode.path.startsWith(draggedNode.path)) {
      setDraggedNode(null);
      return;
    }

    try {
      const newPath = `${targetNode.path}/${draggedNode.name}`;
      const response = await fetch(`${BACKEND_URL}/api/ide/file-operation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "move",
          path: draggedNode.path,
          newPath: newPath,
        }),
      });

      if (response.ok) {
        await fetchFileTree();
        setExpanded((prev) => new Set([...prev, targetNode.path]));
      }
    } catch (error) {
      console.error("Error moving file/folder:", error);
    } finally {
      setDraggedNode(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedNode(null);
    setDropTarget(null);
  };

  const getFileIcon = (filename: string) => {
    const iconColor = "w-3.5 h-3.5 flex-shrink-0"; // Smaller icons (16px equivalent)

    if ([".md", ".txt"].some((e) => filename.endsWith(e))) {
      return <DocumentTextIcon className={`${iconColor} text-blue-300`} />;
    }
    if ([".ts", ".tsx", ".js", ".jsx", ".py", ".java"].some((e) => filename.endsWith(e))) {
      return <CodeBracketIcon className={`${iconColor} text-blue-400`} />;
    }
    if ([".json", ".yml", ".yaml", ".toml", ".xml"].some((e) => filename.endsWith(e))) {
      return <Cog6ToothIcon className={`${iconColor} text-yellow-400`} />;
    }
    return <DocumentIcon className={`${iconColor} text-gray-400`} />;
  };

  const getFolderIcon = (isOpen: boolean) => {
    const iconColor = "w-3.5 h-3.5 flex-shrink-0"; // Smaller icons (16px equivalent)
    return isOpen ? (
      <FolderOpenIcon className={`${iconColor} text-yellow-500`} />
    ) : (
      <FolderIcon className={`${iconColor} text-yellow-500`} />
    );
  };

  const getGitStatusIcon = (status?: string) => {
    if (!status) return null;
    const icons = {
      M: { icon: "●", color: "text-blue-400", label: "Modified" },
      A: { icon: "+", color: "text-green-400", label: "Added" },
      D: { icon: "−", color: "text-red-400", label: "Deleted" },
    };
    const s = icons[status as keyof typeof icons];
    return s ? (
      <span className={`${s.color} text-xs font-bold mr-1`} title={s.label}>
        {s.icon}
      </span>
    ) : null;
  };

  const renderNode = (node: FileNode, depth: number = 0) => {
    const isExpanded = expanded.has(node.path);
    const isSelected = selectedFile === node.path;
    const isOpen = openFiles.includes(node.path);
    const isDraggedOver = dropTarget === node.path;
    const isBeingDragged = draggedNode?.path === node.path;
    const isHovered = hoveredPath === node.path;

    return (
      <div key={node.path}>
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, node)}
          onDragOver={(e) => handleDragOver(e, node)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, node)}
          onDragEnd={handleDragEnd}
          onMouseEnter={() => setHoveredPath(node.path)}
          onMouseLeave={() => setHoveredPath(null)}
          className={`flex items-center gap-1.5 px-2 py-0.5 cursor-pointer hover:bg-gray-800 transition-colors relative border-b border-gray-800/30 ${
            isSelected ? "bg-blue-900/30 border-l-2 border-cyan-400" : ""
          } ${isDraggedOver ? "bg-blue-900/50 border-l-2 border-blue-500" : ""} ${
            isBeingDragged ? "opacity-50" : ""
          } ${isOpen && !isSelected ? "bg-gray-800/50" : ""}`}
          style={{ paddingLeft: `${depth * 12 + 6}px`, minHeight: "24px" }}
          onClick={() => {
            if (node.type === "directory") {
              toggleExpanded(node.path);
            } else {
              onFileSelect(node.path);
            }
          }}
          title={node.path}
        >
          {node.type === "directory" && (
            <span className="text-gray-400 w-3 h-3 flex-shrink-0">
              {isExpanded ? (
                <ChevronDownIcon className="w-3 h-3" />
              ) : (
                <ChevronRightIcon className="w-3 h-3" />
              )}
            </span>
          )}

          {node.type === "directory" ? getFolderIcon(isExpanded) : getFileIcon(node.name)}

          {getGitStatusIcon(node.gitStatus)}

          <span
            className={`text-sm truncate ${isSelected ? "text-white font-semibold" : "text-gray-300"}`}
          >
            {node.name}
          </span>

          {/* Tooltip on hover */}
          {isHovered && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg z-50 whitespace-nowrap">
              {node.path}
            </div>
          )}
        </div>
        {node.type === "directory" && isExpanded && node.children && (
          <div>{node.children.map((child) => renderNode(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <span>Loading files...</span>
      </div>
    );
  }

  const renderRecentFiles = () => {
    if (recentFiles.length === 0) return null;

    return (
      <div className="border-b border-gray-800">
        <div
          className="flex items-center gap-1.5 px-2 py-1 cursor-pointer hover:bg-gray-800 transition-colors"
          onClick={() => setIsRecentExpanded(!isRecentExpanded)}
        >
          <span className="text-gray-400 w-3 h-3 flex-shrink-0">
            {isRecentExpanded ? (
              <ChevronDownIcon className="w-3 h-3" />
            ) : (
              <ChevronRightIcon className="w-3 h-3" />
            )}
          </span>
          <ClockIcon className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
          <span className="text-xs font-semibold text-gray-400 uppercase">Recent</span>
          <span className="text-xs text-gray-500">({recentFiles.length})</span>
        </div>
        {isRecentExpanded && (
          <div className="pb-2">
            {recentFiles.map((filePath) => {
              const fileName = filePath.split("/").pop() || filePath;
              const isSelected = selectedFile === filePath;
              const isOpen = openFiles.includes(filePath);

              return (
                <div
                  key={`recent-${filePath}`}
                  className={`flex items-center gap-1.5 px-2 py-0.5 cursor-pointer hover:bg-gray-800 transition-colors relative border-b border-gray-800/30 ${
                    isSelected ? "bg-blue-900/30 border-l-2 border-cyan-400" : ""
                  } ${isOpen && !isSelected ? "bg-gray-800/50" : ""}`}
                  style={{ paddingLeft: "24px", minHeight: "24px" }}
                  onClick={() => onFileSelect(filePath)}
                  title={filePath}
                >
                  {getFileIcon(fileName)}
                  <span
                    className={`text-sm truncate ${
                      isSelected ? "text-white font-semibold" : "text-gray-300"
                    }`}
                  >
                    {fileName}
                  </span>
                  <span className="text-xs text-gray-500 ml-auto flex-shrink-0">
                    {filePath.split("/").slice(0, -1).join("/") || "/"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-900 text-gray-100">
      {/* Force all SVGs and icons to be small */}
      <style>{`
        .h-full svg, .h-full img {
          max-width: 24px !important;
          max-height: 24px !important;
        }
      `}</style>
      <div className="p-2 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-400 uppercase">Explorer</h3>
        <button
          className="text-gray-500 hover:text-gray-300 text-xs"
          title="Refresh"
          onClick={fetchFileTree}
        >
          ↻
        </button>
      </div>
      {renderRecentFiles()}
      <div className="py-2">{tree.map((node) => renderNode(node, 0))}</div>
    </div>
  );
};
