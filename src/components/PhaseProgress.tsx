
import { useEffect, useState } from 'react';

interface PhaseProgressProps {
  phase: string;
  description: string;
  progress: number;
  emoji: string;
  status: 'in_progress' | 'complete' | 'error';
}

export default function PhaseProgress({ phase, description, progress, emoji, status }: PhaseProgressProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());

  useEffect(() => {
    // Smooth progress animation
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
      setLastUpdateTime(Date.now());
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  // Heartbeat: Keep progress creeping if stuck for >8 seconds
  useEffect(() => {
    if (status !== 'in_progress') return;

    const heartbeat = setInterval(() => {
      const timeSinceUpdate = Date.now() - lastUpdateTime;
      
      // If no update for >8 seconds, slowly creep progress to 98%
      if (timeSinceUpdate > 8000) {
        setAnimatedProgress(prev => {
          if (prev >= 98) return 98; // Cap at 98%
          return Math.min(prev + 0.5, 98); // Slow creep
        });
      }
    }, 1000);

    return () => clearInterval(heartbeat);
  }, [lastUpdateTime, status]);

  return (
    <div className="flex justify-start mb-4">
      <div className="bg-vctt-panel border border-vctt-gold rounded-2xl px-6 py-4 max-w-[70%] min-w-[300px]">
        {/* Emoji Spinner */}
        <div className="flex items-center gap-4 mb-3">
          <div className={`text-4xl ${status === 'in_progress' ? 'animate-pulse' : ''}`}>
            {emoji}
          </div>
          <div className="flex-1">
            <div className="text-vctt-gold font-semibold mb-1 capitalize">
              {phase} Agent
            </div>
            <div className="text-gray-300 text-sm">
              {description}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-vctt-gold to-yellow-500 transition-all duration-500 ease-out"
            style={{ width: `${animatedProgress}%` }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer" />
          </div>
        </div>

        {/* Progress Text */}
        <div className="text-right text-xs text-gray-400 mt-2">
          {Math.floor(animatedProgress)}% complete
        </div>
      </div>
    </div>
  );
}
