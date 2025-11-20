
import React, { useState, useEffect } from 'react';
import { FolderIcon, DocumentIcon, ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

interface FileTreeProps {
  onFileSelect: (path: string) => void;
  selectedFile: string | null;
}

const BACKEND_URL = 'https://vctt-agi-backend.onrender.com';

export const FileTree: React.FC<FileTreeProps> = ({ onFileSelect, selectedFile }) => {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['/']));
  const [loading, setLoading] = useState(true);
  const [draggedNode, setDraggedNode] = useState<FileNode | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  useEffect(() => {
    fetchFileTree();
  }, []);

  const fetchFileTree = async () => {
    try {
      // For now, mock the file tree - we'll connect to backend API later
      const mockTree: FileNode[] = [
        {
          name: 'src',
          path: '/src',
          type: 'directory',
          children: [
            { name: 'main.ts', path: '/src/main.ts', type: 'file' },
            { name: 'app.module.ts', path: '/src/app.module.ts', type: 'file' },
            {
              name: 'config',
              path: '/src/config',
              type: 'directory',
              children: [
                { name: 'llm.config.ts', path: '/src/config/llm.config.ts', type: 'file' },
              ],
            },
          ],
        },
        {
          name: 'package.json',
          path: '/package.json',
          type: 'file',
        },
        {
          name: 'README.md',
          path: '/README.md',
          type: 'file',
        },
      ];
      setTree(mockTree);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load file tree:', error);
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
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', node.path);
  };

  const handleDragOver = (e: React.DragEvent, node: FileNode) => {
    e.preventDefault();
    e.stopPropagation();
    if (node.type === 'directory' && draggedNode && node.path !== draggedNode.path) {
      e.dataTransfer.dropEffect = 'move';
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

    if (!draggedNode || targetNode.type !== 'directory' || targetNode.path === draggedNode.path) {
      setDraggedNode(null);
      return;
    }

    // Prevent dropping a folder into itself or its descendants
    if (draggedNode.type === 'directory' && targetNode.path.startsWith(draggedNode.path)) {
      console.error('Cannot move a folder into itself');
      setDraggedNode(null);
      return;
    }

    try {
      // Call backend to move file/folder
      const newPath = `${targetNode.path}/${draggedNode.name}`;
      const response = await fetch(`${BACKEND_URL}/api/ide/file-operation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'move',
          path: draggedNode.path,
          newPath: newPath,
        }),
      });

      if (response.ok) {
        // Refresh file tree
        await fetchFileTree();
        // Expand target folder to show moved item
        setExpanded(prev => new Set([...prev, targetNode.path]));
      } else {
        console.error('Failed to move file/folder');
      }
    } catch (error) {
      console.error('Error moving file/folder:', error);
    } finally {
      setDraggedNode(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedNode(null);
    setDropTarget(null);
  };

  const renderNode = (node: FileNode, depth: number = 0) => {
    const isExpanded = expanded.has(node.path);
    const isSelected = selectedFile === node.path;
    const isDraggedOver = dropTarget === node.path;
    const isBeingDragged = draggedNode?.path === node.path;

    return (
      <div key={node.path}>
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, node)}
          onDragOver={(e) => handleDragOver(e, node)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, node)}
          onDragEnd={handleDragEnd}
          className={`flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-gray-800 transition-colors ${
            isSelected ? 'bg-gray-700' : ''
          } ${isDraggedOver ? 'bg-blue-900/50 border-l-2 border-blue-500' : ''} ${
            isBeingDragged ? 'opacity-50' : ''
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => {
            if (node.type === 'directory') {
              toggleExpanded(node.path);
            } else {
              onFileSelect(node.path);
            }
          }}
        >
          {node.type === 'directory' && (
            <span className="text-gray-400 w-4 h-4">
              {isExpanded ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
            </span>
          )}
          {node.type === 'directory' ? (
            <FolderIcon className={`w-4 h-4 ${isDraggedOver ? 'text-blue-400' : 'text-yellow-500'}`} />
          ) : (
            <DocumentIcon className="w-4 h-4 text-blue-400" />
          )}
          <span className={`text-sm ${isSelected ? 'text-white font-medium' : 'text-gray-300'}`}>
            {node.name}
          </span>
        </div>
        {node.type === 'directory' && isExpanded && node.children && (
          <div>
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
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

  return (
    <div className="h-full overflow-y-auto bg-gray-900 text-gray-100">
      <div className="p-2 border-b border-gray-800">
        <h3 className="text-xs font-semibold text-gray-400 uppercase">Explorer</h3>
      </div>
      <div className="py-2">
        {tree.map((node) => renderNode(node, 0))}
      </div>
    </div>
  );
};
