
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

export const FileTree: React.FC<FileTreeProps> = ({ onFileSelect, selectedFile }) => {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['/']));
  const [loading, setLoading] = useState(true);

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

  const renderNode = (node: FileNode, depth: number = 0) => {
    const isExpanded = expanded.has(node.path);
    const isSelected = selectedFile === node.path;

    return (
      <div key={node.path}>
        <div
          className={`flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-gray-800 ${
            isSelected ? 'bg-gray-700' : ''
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
            <FolderIcon className="w-4 h-4 text-yellow-500" />
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
