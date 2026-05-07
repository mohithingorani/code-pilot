export const RUN_COMMANDS: Record<string, string> = {
  python: "python3",
  javascript: "node",
  typescript: "npx ts-node",
  java: "javac && java",
  cpp: "g++ main.cpp -o main && ./main",
  markdown: "cat",
};

export const SHORTCUTS = [
  { keys: "Ctrl+S", action: "Save file" },
  { keys: "Ctrl+Enter", action: "Run code" },
  { keys: "Ctrl+F", action: "Find" },
  { keys: "Ctrl+H", action: "Find & Replace" },
  { keys: "Ctrl+Shift+H", action: "Replace All" },
  { keys: "Ctrl+Shift+L", action: "Toggle minimap" },
  { keys: "Ctrl+K Ctrl+M", action: "Keyboard shortcuts" },
  { keys: "Escape", action: "Close modal / sidebar" },
];