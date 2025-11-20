import React, { useState, useEffect, useRef } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface SearchResult {
  filePath: string;
  lineNumber: number;
  lineContent: string;
  matchStart: number;
  matchEnd: number;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResultSelect: (filePath: string, lineNumber: number) => void;
}

const BACKEND_URL = "https://vctt-agi-backend.onrender.com";

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onResultSelect }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (query.trim().length > 1) {
      const debounce = setTimeout(() => {
        performSearch();
      }, 300);
      return () => clearTimeout(debounce);
    } else {
      setResults([]);
    }
  }, [query, caseSensitive, useRegex]);

  const performSearch = async () => {
    setIsSearching(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/ide/search-files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          caseSensitive,
          useRegex,
          maxResults: 100,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
        setSelectedIndex(0);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      handleResultClick(results[selectedIndex]);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    onResultSelect(result.filePath, result.lineNumber);
    onClose();
  };

  const highlightMatch = (text: string, start: number, end: number) => {
    const before = text.substring(0, start);
    const match = text.substring(start, end);
    const after = text.substring(end);
    return (
      <>
        {before}
        <span className="bg-yellow-500/30 text-yellow-200 font-semibold">{match}</span>
        {after}
      </>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[70vh]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search in files..."
              className="flex-1 bg-transparent text-white text-sm outline-none"
            />
            {isSearching && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="px-4 py-2 border-b border-gray-800 flex items-center gap-4 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-white">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
              className="rounded"
            />
            <span>Case Sensitive (Aa)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-white">
            <input
              type="checkbox"
              checked={useRegex}
              onChange={(e) => setUseRegex(e.target.checked)}
              className="rounded"
            />
            <span>Use Regex (.*)</span>
          </label>
          {results.length > 0 && (
            <span className="ml-auto text-gray-500">
              {results.length} result{results.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {results.length === 0 && query.trim().length > 0 && !isSearching && (
            <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
              No results found
            </div>
          )}
          {results.length === 0 && query.trim().length === 0 && (
            <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
              Type to search...
            </div>
          )}
          {results.map((result, idx) => (
            <div
              key={`${result.filePath}-${result.lineNumber}-${idx}`}
              onClick={() => handleResultClick(result)}
              className={`px-4 py-2 cursor-pointer border-b border-gray-800 hover:bg-gray-800 transition-colors ${
                idx === selectedIndex ? "bg-gray-800 border-l-2 border-blue-500" : ""
              }`}
            >
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <span className="truncate">{result.filePath}</span>
                <span className="text-gray-600">:</span>
                <span className="text-blue-400">{result.lineNumber}</span>
              </div>
              <div className="text-sm text-gray-300 font-mono">
                {highlightMatch(result.lineContent.trim(), result.matchStart, result.matchEnd)}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
          <span>↑↓ Navigate • Enter Select • Esc Close</span>
        </div>
      </div>
    </div>
  );
};
