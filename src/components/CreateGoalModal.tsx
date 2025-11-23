
import { useState, useEffect } from "react";
import { X, Target } from "lucide-react";
import { CreateGoalDto, Goal } from "../services/goals-api";

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateGoalDto) => Promise<void>;
  editGoal?: Goal | null;
  parentGoals?: Goal[];
}

export default function CreateGoalModal({
  isOpen,
  onClose,
  onSubmit,
  editGoal,
  parentGoals = [],
}: CreateGoalModalProps) {
  const [goalText, setGoalText] = useState("");
  const [goalType, setGoalType] = useState("operational");
  const [priority, setPriority] = useState(5);
  const [parentGoalId, setParentGoalId] = useState<number | undefined>();
  const [targetDate, setTargetDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load edit goal data
  useEffect(() => {
    if (editGoal) {
      setGoalText(editGoal.goal_text);
      setGoalType(editGoal.goal_type);
      setPriority(editGoal.priority);
      setParentGoalId(editGoal.parent_goal_id || undefined);
      setTargetDate(editGoal.target_date || "");
    } else {
      // Reset form
      setGoalText("");
      setGoalType("operational");
      setPriority(5);
      setParentGoalId(undefined);
      setTargetDate("");
    }
  }, [editGoal, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const dto: CreateGoalDto = {
        goal_text: goalText,
        goal_type: goalType,
        priority,
        parent_goal_id: parentGoalId,
        target_date: targetDate || undefined,
      };

      await onSubmit(dto);
      onClose();
    } catch (error) {
      console.error("Error creating goal:", error);
      alert("Failed to create goal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">
              {editGoal ? "Edit Goal" : "Create New Goal"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Goal Text */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Goal Description *
            </label>
            <textarea
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              required
              rows={3}
              placeholder="Describe the goal clearly and concisely..."
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Goal Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Goal Type *
            </label>
            <select
              value={goalType}
              onChange={(e) => setGoalType(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="strategic">Strategic</option>
              <option value="operational">Operational</option>
              <option value="learning">Learning</option>
              <option value="maintenance">Maintenance</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Strategic: High-level objectives | Operational: Day-to-day tasks | Learning:
              Skill development | Maintenance: System upkeep
            </p>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Priority: <span className="text-blue-400 font-semibold">{priority}/10</span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
          </div>

          {/* Parent Goal */}
          {parentGoals.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Parent Goal (Optional)
              </label>
              <select
                value={parentGoalId || ""}
                onChange={(e) =>
                  setParentGoalId(e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">None (Top-level goal)</option>
                {parentGoals.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.goal_text}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Link this goal as a sub-goal of an existing goal
              </p>
            </div>
          )}

          {/* Target Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Target Date (Optional)
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-700 bg-gray-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !goalText.trim()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
          >
            {isSubmitting ? "Saving..." : editGoal ? "Update Goal" : "Create Goal"}
          </button>
        </div>
      </div>
    </div>
  );
}
