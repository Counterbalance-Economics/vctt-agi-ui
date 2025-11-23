
import { X, Activity, ListChecks } from 'lucide-react';
import GoalActivityFeed from './GoalActivityFeed';
import GoalSubtasks from './GoalSubtasks';
import { Goal } from '../services/goals-api';

interface Props {
  goal: Goal;
  isOpen: boolean;
  onClose: () => void;
}

export default function GoalDetailsModal({ goal, isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-900 border border-gray-700 rounded-lg shadow-2xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-blue-400" />
            <div>
              <h2 className="text-xl font-bold text-white">{goal.title}</h2>
              <p className="text-sm text-gray-400">Goal Details & Activity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 pb-16 space-y-6">
          {/* Goal Info */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-sm text-gray-500">Status</span>
                <div className={`mt-1 inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  goal.status === 'active' ? 'bg-green-500/20 text-green-400' :
                  goal.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                  goal.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                  goal.status === 'abandoned' ? 'bg-red-500/20 text-red-400' :
                  'bg-gray-700/50 text-gray-400'
                }`}>
                  {goal.status}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Priority</span>
                <div className="mt-1 text-white font-medium">
                  {'⭐'.repeat(goal.priority)} ({goal.priority}/5)
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Owner</span>
                <div className="mt-1 text-white capitalize">{goal.owner}</div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Created By</span>
                <div className="mt-1 text-white">{goal.created_by}</div>
              </div>
            </div>
            {goal.description && (
              <div>
                <span className="text-sm text-gray-500">Description</span>
                <p className="mt-1 text-gray-300">{goal.description}</p>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 bg-gray-800/50 border border-gray-700 rounded-lg p-1">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md flex-1">
              <ListChecks className="w-4 h-4" />
              Subtasks
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md flex-1">
              <Activity className="w-4 h-4" />
              Activity Feed
            </button>
          </div>

          {/* Subtasks Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-blue-400" />
              Subtasks
            </h3>
            <GoalSubtasks goalId={goal.id} autoRefresh={true} />
          </div>

          {/* Activity Feed Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              Activity Timeline
            </h3>
            <GoalActivityFeed goalId={goal.id} autoRefresh={true} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-800">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
