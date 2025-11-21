
// Utility for cross-platform keyboard shortcuts
export const isMac = typeof window !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
export const isWindows = typeof window !== "undefined" && navigator.platform.toUpperCase().indexOf("WIN") >= 0;

export const modKey = isMac ? "⌘" : "Ctrl";
export const modKeyFull = isMac ? "Cmd" : "Ctrl";
export const altKey = isMac ? "⌥" : "Alt";

// For event checking
export const getModKey = (e: KeyboardEvent) => (isMac ? e.metaKey : e.ctrlKey);

export function formatShortcut(keys: string): string {
  return keys
    .replace(/Cmd/g, modKeyFull)
    .replace(/⌘/g, modKey)
    .replace(/Alt/g, altKey);
}
