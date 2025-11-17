
import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import type { Session } from '../types';
import TrustIndicator from './TrustIndicator';

interface ChatPanelProps {
  session: Session | null;
  isLoading: boolean;
  onSendMessage: (content: string) => void;
  trustScore?: number; // 0-100
}

export default function ChatPanel({ session, isLoading, onSendMessage, trustScore }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with Trust Indicator */}
      {trustScore !== undefined && (
        <div className="border-b border-gray-700 p-4 bg-vctt-panel flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Current Session
          </div>
          <TrustIndicator trustScore={trustScore} compact />
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {!session || session.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-vctt-gold mb-2">
                Welcome to VCTT-AGI
              </h2>
              <p className="text-gray-400">
                Start a conversation to experience coherent AI reasoning
              </p>
            </div>
          </div>
        ) : (
          <>
            {session.messages.map((message) => (
              <div
                key={message.id}
                className={`message-bubble flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-6 py-4 ${
                    message.role === 'user'
                      ? 'bg-vctt-blue text-white'
                      : 'bg-vctt-panel text-white border border-vctt-gold'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs mt-2 opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-vctt-panel border border-vctt-gold rounded-2xl px-6 py-4">
                  <div className="typing-indicator flex space-x-2">
                    <span className="w-2 h-2 bg-vctt-gold rounded-full"></span>
                    <span className="w-2 h-2 bg-vctt-gold rounded-full"></span>
                    <span className="w-2 h-2 bg-vctt-gold rounded-full"></span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-700 p-4 bg-vctt-panel">
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 bg-vctt-dark border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-vctt-gold resize-none min-h-[52px] max-h-[200px]"
            rows={1}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-vctt-gold hover:bg-yellow-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <Send size={24} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
