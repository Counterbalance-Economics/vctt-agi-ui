
import { useState } from "react";
import { Goal } from "../services/goals-api";
import {
  Target,
  Clock,
  CheckCircle2,
  Circle,
  Trash2,
  Edit,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: string) => void;
  onProgressUpdate: (id: number, progress: number) => void;
  depth?: number;
}

export default function GoalCard({
  goal,
  onEdit,
  onDelete,
  onStatusChange,
  onProgressUpdate,
  depth = 0,
}: GoalCardProps) {
  const [showProgressInput, setShowProgressInput] = useState(false);
  
  // Get latest progress from progress_entries
  const latestProgress = goal.progress_entries && goal.progress_entries.length > 0
    ? goal.progress_entries[0].progress_percent
    : 0;
  
  const [progressValue, setProgressValue] = useState(latestProgress);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "paused":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "abandoned":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return "text-red-400";
    if (priority >= 3) return "text-yellow-400";
    return "text-green-400";
  };

  const getOwnerIcon = (owner: string) => {
    switch (owner) {
      case "human":
        return <Target className="w-4 h-4" />;
      case "system":
        return <TrendingUp className="w-4 h-4" />;
      case "min":
        return <Circle className="w-4 h-4" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };

  const handleProgressSubmit = () => {
    onProgressUpdate(goal.id, progressValue);
    setShowProgressInput(false);
  };

  return (
    <div
      className={`bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-all ${
        depth > 0 ? "ml-8 mt-2" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="mt-1">{getOwnerIcon(goal.owner)}</div>
          <div className="flex-1">
            <h3 className="text-white font-medium text-lg mb-1">{goal.title}</h3>
            {goal.description && (
              <p className="text-gray-400 text-sm mb-2">{goal.description}</p>
            )}
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <ChevronRight className="w-3 h-3" />
                {goal.owner}
              </span>
              <span className={`flex items-center gap-1 font-semibold ${getPriorityColor(goal.priority)}`}>
                Priority: {goal.priority}/5
              </span>
              <span className="text-xs text-gray-500">
                Created {new Date(goal.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(goal.status)}`}
        >
          {goal.status}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Progress</span>
          <button
            onClick={() => setShowProgressInput(!showProgressInput)}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            Update
          </button>
        </div>
        <div className="relative w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300"
            style={{ width: `${latestProgress}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-500">{latestProgress}% complete</span>
          {showProgressInput && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                value={progressValue}
                onChange={(e) => setProgressValue(Number(e.target.value))}
                className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-white"
              />
              <button
                onClick={handleProgressSubmit}
                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs text-white"
              >
                Save
              </button>
            </div>
          )}
        </div>
        {goal.progress_entries && goal.progress_entries.length > 0 && goal.progress_entries[0].milestone && (
          <p className="text-xs text-gray-500 mt-1">
            Latest: {goal.progress_entries[0].milestone}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-700">
        {goal.status === "active" && (
          <button
            onClick={() => onStatusChange(goal.id, "completed")}
            className="flex items-center gap-1 px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 border border-green-600/30 rounded text-sm text-green-400"
          >
            <CheckCircle2 className="w-4 h-4" />
            Complete
          </button>
        )}
        {goal.status === "active" && (
          <button
            onClick={() => onStatusChange(goal.id, "paused")}
            className="flex items-center gap-1 px-3 py-1.5 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-600/30 rounded text-sm text-yellow-400"
          >
            Pause
          </button>
        )}
        {goal.status === "paused" && (
          <button
            onClick={() => onStatusChange(goal.id, "active")}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/30 rounded text-sm text-blue-400"
          >
            Resume
          </button>
        )}
        <button
          onClick={() => onEdit(goal)}
          className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm text-gray-300"
        >
          <Edit className="w-4 h-4" />
          Edit
        </button>
        <button
          onClick={() => {
            if (confirm("Are you sure you want to delete this goal?")) {
              onDelete(goal.id);
            }
          }}
          className="flex items-center gap-1 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 rounded text-sm text-red-400 ml-auto"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>

      {/* Sub-goals indicator */}
      {goal.child_goals && goal.child_goals.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <span className="text-xs text-blue-400">
            {goal.child_goals.length} sub-goal{goal.child_goals.length > 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
}
