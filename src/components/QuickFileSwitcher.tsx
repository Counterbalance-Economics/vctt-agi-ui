
import React, { useState, useEffect, useRef } from "react";
import { DocumentIcon, FolderIcon } from "@heroicons/react/24/outline";

interface QuickFileSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (path: string) => void;
  files: string[]; // Array of file paths
}

export const QuickFileSwitcher: React.FC<QuickFileSwitcherProps> = ({
  isOpen,
  onClose,
  onFileSelect,
  files,
}) => {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fuzzy search - simple substring match for now
  const filteredFiles = files.filter((file) =>
    file.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setSearch("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredFiles.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && filteredFiles[selectedIndex]) {
        e.preventDefault();
        onFileSelect(filteredFiles[selectedIndex]);
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, filteredFiles, onClose, onFileSelect]);

  if (!isOpen) return null;

  const getFileIcon = (path: string) => {
    const isFolder = !path.includes(".");
    return isFolder ? <FolderIcon className="w-4 h-4" /> : <DocumentIcon className="w-4 h-4" />;
  };

  const getFileName = (path: string) => {
    const parts = path.split("/");
    return parts[parts.length - 1] || path;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-32 bg-black/70"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-gray-900 rounded-lg shadow-2xl border border-gray-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="px-4 py-3 border-b border-gray-800">
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search files..."
            className="w-full bg-transparent text-lg text-white placeholder-gray-500 outline-none"
          />
        </div>

        {/* File List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredFiles.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500">No files found</div>
          ) : (
            <div className="py-2">
              {filteredFiles.slice(0, 50).map((file, idx) => (
                <button
                  key={file}
                  onClick={() => {
                    onFileSelect(file);
                    onClose();
                  }}
                  className={`w-full px-4 py-2 flex items-center gap-3 text-left transition-colors ${
                    idx === selectedIndex
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  {getFileIcon(file)}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{getFileName(file)}</div>
                    <div className="text-xs text-gray-500 truncate">{file}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-gray-800 text-xs text-gray-500 flex items-center justify-between">
          <span>↑↓ Navigate • Enter Select • Esc Close</span>
          <span>{filteredFiles.length} files</span>
        </div>
      </div>
    </div>
  );
};
