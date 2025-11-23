
import { Loader2, Brain } from "lucide-react";

interface MinThinkingSpinnerProps {
  message?: string;
  showPercentage?: boolean;
  percentage?: number;
  size?: "sm" | "md" | "lg";
}

export default function MinThinkingSpinner({
  message = "MIN is thinking...",
  showPercentage = false,
  percentage = 0,
  size = "md",
}: MinThinkingSpinnerProps) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <Brain className={`${sizes[size]} text-blue-400 animate-pulse`} />
        <Loader2 className={`${sizes[size]} text-blue-500 animate-spin absolute inset-0`} />
      </div>
      <div className="flex flex-col">
        <span className={`${textSizes[size]} text-gray-300 font-medium`}>
          {message}
        </span>
        {showPercentage && (
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 font-mono min-w-[3ch]">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
