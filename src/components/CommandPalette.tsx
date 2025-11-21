// src/components/CommandPalette.tsx
"use client";

import { useState, useEffect } from "react";
import { Command } from "cmdk";
import { GitCommit, GitBranch, Save, Play, Terminal, Upload } from "lucide-react";
import { getModKey } from "../utils/keyboard";

export default function CommandPalette({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");

  const commands = [
    { name: "Git: Commit All", icon: GitCommit, action: () => alert("Commit all") },
    { name: "Git: Push", icon: Upload, action: () => alert("Push") },
    { name: "Format Document", icon: Save, action: () => alert("Format") },
    { name: "Run Tests", icon: Play, action: () => alert("Run tests") },
    { name: "Deploy to Production", icon: Upload, action: () => alert("Deploy") },
    { name: "Toggle Terminal", icon: Terminal, action: () => alert("Toggle terminal") },
    { name: "Change Branch", icon: GitBranch, action: () => alert("Change branch") },
  ];

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (getModKey(e) && e.shiftKey && e.key === "P") {
        e.preventDefault();
        onClose(); // toggle
      }
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-32 bg-black/50"
      onClick={onClose}
    >
      <div className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <Command className="bg-gray-900 rounded-lg shadow-2xl overflow-hidden border border-gray-700">
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Type a command..."
            className="w-full px-4 py-3 bg-transparent text-lg outline-none placeholder-gray-500 text-white"
            autoFocus
          />
          <Command.List className="max-h-96 overflow-y-auto p-2">
            <Command.Empty className="text-center text-gray-500 py-6">
              No results found.
            </Command.Empty>
            {commands
              .filter((cmd) => cmd.name.toLowerCase().includes(search.toLowerCase()))
              .map((cmd) => (
                <Command.Item
                  key={cmd.name}
                  onSelect={() => {
                    cmd.action();
                    onClose();
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded cursor-pointer hover:bg-gray-800 aria-selected:bg-gray-800 text-gray-200"
                >
                  <cmd.icon size={18} />
                  <span>{cmd.name}</span>
                </Command.Item>
              ))}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
