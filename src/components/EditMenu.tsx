
import React, { useState, useRef, useEffect } from "react";

interface EditMenuProps {
  onUndo?: () => void;
  onRedo?: () => void;
  onCut?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onFind?: () => void;
  onReplace?: () => void;
  onFindInFiles?: () => void;
  onReplaceInFiles?: () => void;
  onToggleLineComment?: () => void;
  onToggleBlockComment?: () => void;
  onExpandAbbreviation?: () => void;
}

export const EditMenu: React.FC<EditMenuProps> = ({
  onUndo,
  onRedo,
  onCut,
  onCopy,
  onPaste,
  onFind,
  onReplace,
  onFindInFiles,
  onReplaceInFiles,
  onToggleLineComment,
  onToggleBlockComment,
  onExpandAbbreviation,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const menuItems = [
    { label: "Undo", action: onUndo, shortcut: "⌘Z" },
    { label: "Redo", action: onRedo, shortcut: "⌘Y" },
    { type: "separator" },
    { label: "Cut", action: onCut, shortcut: "⌘X" },
    { label: "Copy", action: onCopy, shortcut: "⌘C" },
    { label: "Paste", action: onPaste, shortcut: "⌘V" },
    { type: "separator" },
    { label: "Find", action: onFind, shortcut: "⌘F" },
    { label: "Replace", action: onReplace, shortcut: "⌘H" },
    { type: "separator" },
    { label: "Find in Files", action: onFindInFiles, shortcut: "⌘⇧F" },
    { label: "Replace in Files", action: onReplaceInFiles, shortcut: "⌘⇧H" },
    { type: "separator" },
    { label: "Toggle Line Comment", action: onToggleLineComment, shortcut: "⌘/" },
    { label: "Toggle Block Comment", action: onToggleBlockComment, shortcut: "⇧⌥A" },
    { type: "separator" },
    { label: "Emmet: Expand Abbreviation", action: onExpandAbbreviation, shortcut: "Tab" },
  ];

  const handleItemClick = (item: any) => {
    if (!item.disabled && item.action) {
      item.action();
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-1.5 text-sm font-medium text-gray-300 hover:bg-gray-800 rounded transition-colors ${
          isOpen ? "bg-gray-800" : ""
        }`}
      >
        Edit
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-72 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 py-1">
          {menuItems.map((item, idx) => {
            if (item.type === "separator") {
              return <div key={idx} className="h-px bg-gray-700 my-1" />;
            }

            return (
              <button
                key={idx}
                onClick={() => handleItemClick(item)}
                className="w-full px-4 py-2 text-sm flex items-center justify-between transition-colors text-gray-200 hover:bg-gray-700"
              >
                <span>{item.label}</span>
                {item.shortcut && (
                  <span className="text-xs text-gray-500 font-mono">{item.shortcut}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
