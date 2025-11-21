
import React, { useState, useRef, useEffect } from "react";

interface FileMenuProps {
  onNewFile: () => void;
  onNewFolder: () => void;
  onOpenFile: () => void;
  onOpenFolder: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onFormatDocument: () => void;
  onCloseTab: () => void;
  onCloseAllTabs: () => void;
}

export const FileMenu: React.FC<FileMenuProps> = ({
  onNewFile,
  onNewFolder: _onNewFolder, // Keep for future use
  onOpenFile,
  onOpenFolder,
  onSave,
  onSaveAs,
  onFormatDocument: _onFormatDocument, // Keep for future use
  onCloseTab,
  onCloseAllTabs: _onCloseAllTabs, // Keep for future use
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
    { label: "New File", action: onNewFile, shortcut: "⌘N" },
    { label: "New Window", action: () => {}, shortcut: "⌘⇧N", disabled: true },
    { label: "New Window with Profile", action: () => {}, disabled: true, hasSubmenu: true },
    { type: "separator" },
    { label: "Open File…", action: onOpenFile, shortcut: "⌘O" },
    { label: "Open Folder…", action: onOpenFolder, shortcut: "⌘⇧O" },
    { label: "Open Workspace from File…", action: () => {}, disabled: true },
    { label: "Open Recent", action: () => {}, disabled: true, hasSubmenu: true },
    { type: "separator" },
    { label: "Add Folder to Workspace…", action: () => {}, disabled: true },
    { label: "Save Workspace As…", action: () => {}, disabled: true },
    { label: "Duplicate Workspace", action: () => {}, disabled: true },
    { type: "separator" },
    { label: "Save", action: onSave, shortcut: "⌘S" },
    { label: "Save As…", action: onSaveAs, shortcut: "⌘⇧S" },
    { label: "Save All", action: () => {}, shortcut: "⌘K S", disabled: true },
    { type: "separator" },
    { label: "Share", action: () => {}, disabled: true, hasSubmenu: true },
    { label: "Auto Save", action: () => {}, disabled: true },
    { label: "Preferences", action: () => {}, disabled: true, hasSubmenu: true },
    { type: "separator" },
    { label: "Revert File", action: () => {}, disabled: true },
    { type: "separator" },
    { label: "Close Editor", action: onCloseTab, shortcut: "⌘W" },
    { label: "Close Folder", action: () => {}, shortcut: "⌘K F", disabled: true },
    { label: "Close Window", action: () => {}, shortcut: "Alt+F4", disabled: true },
    { type: "separator" },
    { label: "Exit", action: () => {}, disabled: true },
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
        File
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 py-1">
          {menuItems.map((item, idx) => {
            if (item.type === "separator") {
              return <div key={idx} className="h-px bg-gray-700 my-1" />;
            }

            return (
              <button
                key={idx}
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
                className={`w-full px-4 py-2 text-sm flex items-center justify-between transition-colors ${
                  item.disabled
                    ? "text-gray-600 cursor-not-allowed"
                    : "text-gray-200 hover:bg-gray-700"
                }`}
              >
                <span>{item.label}</span>
                <div className="flex items-center gap-2">
                  {item.shortcut && (
                    <span className="text-xs text-gray-500 font-mono">{item.shortcut}</span>
                  )}
                  {item.hasSubmenu && (
                    <span className="text-gray-500">›</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
