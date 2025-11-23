
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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [owner, setOwner] = useState<"human" | "system" | "min">("human");
  const [priority, setPriority] = useState(3);
  const [parentGoalId, setParentGoalId] = useState<number | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load edit goal data
  useEffect(() => {
    if (editGoal) {
      setTitle(editGoal.title);
      setDescription(editGoal.description || "");
      setOwner(editGoal.owner);
      setPriority(editGoal.priority);
      setParentGoalId(editGoal.parent_goal_id || undefined);
    } else {
      // Reset form
      setTitle("");
      setDescription("");
      setOwner("human");
      setPriority(3);
      setParentGoalId(undefined);
    }
  }, [editGoal, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const dto: CreateGoalDto = {
        title,
        description: description || undefined,
        owner,
        priority,
        parentGoalId,
        createdBy: "admin", // TODO: Get from auth context
      };

      await onSubmit(dto);
      onClose();
    } catch (error) {
      console.error("Error creating goal:", error);
      alert(`Failed to create goal: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-hidden">
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
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
        <form onSubmit={handleSubmit} className="flex-1 p-6 pb-24 space-y-5 overflow-y-scroll overscroll-contain"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#4B5563 #1F2937' }}>
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Goal Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter a clear, concise goal title..."
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Provide additional details about this goal..."
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Owner */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Owner *
            </label>
            <select
              value={owner}
              onChange={(e) => setOwner(e.target.value as "human" | "system" | "min")}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="human">Human</option>
              <option value="system">System</option>
              <option value="min">MIN (AI Agent)</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Human: User-defined | System: Automated tasks | MIN: AI self-improvement goals
            </p>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Priority: <span className="text-blue-400 font-semibold">{priority}/5</span>
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 - Low</span>
              <span>3 - Medium</span>
              <span>5 - Critical</span>
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
                    {goal.title}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Link this goal as a sub-goal of an existing goal
              </p>
            </div>
          )}
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
            disabled={isSubmitting || !title.trim()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
          >
            {isSubmitting ? "Saving..." : editGoal ? "Update Goal" : "Create Goal"}
          </button>
        </div>
      </div>
    </div>
  );
}
