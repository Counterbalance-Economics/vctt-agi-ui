
import { useState } from "react";
import { GoalTree } from "../services/goals-api";
import { ChevronDown, ChevronRight, Target, CheckCircle2, Circle } from "lucide-react";

interface GoalTreeViewProps {
  trees: GoalTree[];
  onGoalClick: (goalId: number) => void;
}

export default function GoalTreeView({ trees, onGoalClick }: GoalTreeViewProps) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const toggleExpand = (goalId: number) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(goalId)) {
      newExpanded.delete(goalId);
    } else {
      newExpanded.add(goalId);
    }
    setExpanded(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case "active":
        return <Circle className="w-4 h-4 text-blue-400" />;
      case "paused":
        return <Circle className="w-4 h-4 text-yellow-400" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getProgress = (tree: GoalTree): number => {
    if (tree.goal.progress_entries && tree.goal.progress_entries.length > 0) {
      return tree.goal.progress_entries[0].progress_percent;
    }
    return 0;
  };

  const renderTree = (tree: GoalTree, depth: number = 0) => {
    const hasChildren = tree.children && tree.children.length > 0;
    const isExpanded = expanded.has(tree.goal.id);
    const progress = getProgress(tree);

    return (
      <div key={tree.goal.id} className={depth > 0 ? "ml-6 mt-2" : "mt-2"}>
        <div
          className="flex items-center gap-2 p-3 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-gray-600 cursor-pointer transition-all"
          onClick={() => onGoalClick(tree.goal.id)}
        >
          {/* Expand/Collapse Button */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(tree.goal.id);
              }}
              className="text-gray-400 hover:text-white"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-4" />}

          {/* Status Icon */}
          {getStatusIcon(tree.goal.status)}

          {/* Goal Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">{tree.goal.title}</span>
              <span className="text-xs text-gray-500">
                ({progress}%)
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
              <span>{tree.goal.owner}</span>
              <span>Priority: {tree.goal.priority}/5</span>
              {tree.children.length > 0 && (
                <span className="text-blue-400">{tree.children.length} sub-goals</span>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Render Children */}
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {tree.children.map((child) => renderTree(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (trees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <Target className="w-12 h-12 mb-3 opacity-50" />
        <p>No goals created yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {trees.map((tree) => renderTree(tree))}
    </div>
  );
}
