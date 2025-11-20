
import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

export default function DeepAgentMode() {
  const [messages, setMessages] = useState<string[]>([
    '🤖 MIN DeepAgent Mode - Autonomous Engineering Co-Pilot',
    'Type commands in natural language. I can execute git, read files, build, deploy, and more.',
    'Example: "Show git status" or "Commit changes with message \'Fixed bug\'"',
    '',
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const socketRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Connect to backend WebSocket
    const backendUrl = 'https://vctt-agi-phase3-complete.abacusai.app';
    socketRef.current = io(`${backendUrl}/stream`);

    socketRef.current.on('connect', () => {
      console.log('🔌 Connected to DeepAgent backend');
      setMessages(prev => [...prev, '✅ Connected to backend - ready for commands', '']);
    });

    socketRef.current.on('disconnect', () => {
      console.log('🔌 Disconnected from backend');
      setMessages(prev => [...prev, '⚠️ Disconnected from backend', '']);
    });

    socketRef.current.on('stream_start', () => {
      setIsProcessing(true);
      setMessages(prev => [...prev, '']);  // Add empty slot for streaming
    });

    socketRef.current.on('stream_chunk', (data: { chunk: string }) => {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] += data.chunk;
        return updated;
      });
    });

    socketRef.current.on('stream_complete', () => {
      setIsProcessing(false);
      setMessages(prev => [...prev, '']);  // Ready for next command
    });

    socketRef.current.on('stream_error', (data: { error: string }) => {
      setMessages(prev => [...prev, `❌ Error: ${data.error}`, '']);
      setIsProcessing(false);
    });

    return () => socketRef.current?.disconnect();
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    if (!input.trim() || isProcessing) return;
    
    setMessages(prev => [...prev, `MIN > ${input}`]);
    socketRef.current.emit('deepagent_command', { input });
    setInput('');
  };

  return (
    <div className="h-screen bg-black text-green-400 font-mono flex flex-col">
      {/* Header */}
      <div className="bg-green-900 bg-opacity-20 border-b border-green-700 px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            🤖 MIN DeepAgent
            <span className="text-sm font-normal text-green-500">Autonomous Engineering Co-Pilot</span>
          </h1>
          <p className="text-xs text-green-500 mt-1">
            {socketRef.current?.connected ? '🟢 Connected' : '🔴 Disconnected'} • Real command execution enabled
          </p>
        </div>
        <a 
          href="/"
          className="text-green-500 hover:text-green-300 text-sm border border-green-700 px-3 py-1 rounded hover:bg-green-900 hover:bg-opacity-20 transition-colors"
        >
          ← Back to Chat
        </a>
      </div>

      {/* Terminal Output */}
      <div className="flex-1 overflow-y-auto p-6 pb-0 space-y-2">
        {messages.map((msg, i) => (
          <pre key={i} className="whitespace-pre-wrap leading-relaxed text-sm">
            {msg || <span className="animate-pulse">▋</span>}
          </pre>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="border-t border-green-900 bg-green-950 bg-opacity-30 p-4">
        <div className="flex items-center gap-3">
          <span className="text-green-500 font-bold">MIN &gt;</span>
          <input
            autoFocus
            disabled={isProcessing}
            className="flex-1 bg-transparent outline-none text-green-400 placeholder-green-700 disabled:opacity-50"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder={isProcessing ? 'Processing...' : 'Tell MIN what to do... (e.g., "Show git status")'}
          />
          {isProcessing && (
            <span className="text-green-600 animate-pulse text-xl">●</span>
          )}
        </div>
        
        {/* Quick Commands */}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => setInput('Show git status')}
            disabled={isProcessing}
            className="text-xs px-2 py-1 border border-green-800 rounded hover:bg-green-900 hover:bg-opacity-30 transition-colors disabled:opacity-50"
          >
            git status
          </button>
          <button
            onClick={() => setInput('What can you do?')}
            disabled={isProcessing}
            className="text-xs px-2 py-1 border border-green-800 rounded hover:bg-green-900 hover:bg-opacity-30 transition-colors disabled:opacity-50"
          >
            help
          </button>
          <button
            onClick={() => setInput('Show current branch')}
            disabled={isProcessing}
            className="text-xs px-2 py-1 border border-green-800 rounded hover:bg-green-900 hover:bg-opacity-30 transition-colors disabled:opacity-50"
          >
            branch info
          </button>
        </div>
      </div>
    </div>
  );
}
