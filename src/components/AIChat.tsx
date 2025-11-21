import React, { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIChatProps {
  selectedFile: string | null;
  onCodeEdit?: (filePath: string, newContent: string) => void;
}

export const AIChat: React.FC<AIChatProps> = ({ selectedFile }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "👋 Hi! I'm MIN, your AI coding assistant.\n\nI can:\n• Fix bugs\n• Add features\n• Refactor code\n• Write tests\n• Explain code\n\nJust tell me what you need!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsProcessing(true);

    // Mock AI response - we'll connect to backend in next iteration
    setTimeout(() => {
      const aiResponse = `I understand you want to: "${userMessage}"\n\n${
        selectedFile
          ? `I can help with ${selectedFile}. Backend integration coming soon!`
          : "Please select a file first, then I can help you edit it."
      }`;

      setMessages((prev) => [...prev, { role: "assistant", content: aiResponse }]);
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧠</span>
          <div>
            <h3 className="text-sm font-semibold text-white">AI Assistant</h3>
            <p className="text-xs text-gray-500">Powered by MIN's 5-model ensemble + Grok 4.1 verification</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                msg.role === "user" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-100"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-lg px-4 py-2">
              <p className="text-sm text-gray-400 animate-pulse">MIN is thinking...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Context indicator */}
      {selectedFile && (
        <div className="px-4 py-2 bg-gray-950 border-t border-gray-800">
          <p className="text-xs text-gray-500">
            📄 Context: <span className="text-green-400">{selectedFile}</span>
          </p>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask MIN anything..."
            disabled={isProcessing}
            className="flex-1 bg-gray-800 text-white rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={isProcessing || !input.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>

        {/* Quick prompts */}
        <div className="mt-2 flex flex-wrap gap-2">
          {["Fix bugs", "Add comments", "Refactor", "Add tests"].map((prompt) => (
            <button
              key={prompt}
              onClick={() => setInput(prompt)}
              disabled={isProcessing}
              className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs transition-colors disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
