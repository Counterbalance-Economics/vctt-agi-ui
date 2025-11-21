
import React, { useState, useEffect } from 'react';

interface Goal {
  id: number;
  title: string;
  description: string;
  priority: number;
  status: string;
  progress: number;
  created_at: string;
}

export const GoalsPanel: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    priority: 3,
  });

  // Fetch goals from backend
  const fetchGoals = async () => {
    try {
      const response = await fetch('https://vctt-agi-phase3-complete.abacusai.app/goals?status=active');
      if (response.ok) {
        const data = await response.json();
        setGoals(data);
      }
    } catch (error) {
      console.error('Failed to fetch goals:', error);
    }
  };

  // Auto-refresh every 10 seconds
  useEffect(() => {
    fetchGoals();
    const interval = setInterval(fetchGoals, 10000);
    return () => clearInterval(interval);
  }, []);

  // Create new goal
  const handleCreateGoal = async () => {
    if (!newGoal.title.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('https://vctt-agi-phase3-complete.abacusai.app/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newGoal.title,
          description: newGoal.description,
          priority: newGoal.priority,
          status: 'active',
          target_criteria: {},
          metadata: {},
        }),
      });

      if (response.ok) {
        setShowModal(false);
        setNewGoal({ title: '', description: '', priority: 3 });
        fetchGoals();
      }
    } catch (error) {
      console.error('Failed to create goal:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 5) return 'text-red-400';
    if (priority >= 3) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getPriorityLabel = (priority: number) => {
    if (priority >= 5) return 'Critical';
    if (priority >= 3) return 'High';
    return 'Normal';
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="p-3 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <h3 className="text-sm font-semibold">Goals</h3>
          <span className="text-xs text-gray-500">({goals.length})</span>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium transition-colors"
          title="Create new goal"
        >
          + New
        </button>
      </div>

      {/* Goals List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {goals.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            <p>No active goals</p>
            <p className="text-xs mt-1">Click "+ New" to create one</p>
          </div>
        ) : (
          goals.map((goal) => (
            <div
              key={goal.id}
              className="bg-gray-800 border border-gray-700 rounded-lg p-3 hover:border-blue-500 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-semibold text-white flex-1">{goal.title}</h4>
                <span className={`text-xs font-medium ${getPriorityColor(goal.priority)}`}>
                  {getPriorityLabel(goal.priority)}
                </span>
              </div>
              
              {goal.description && (
                <p className="text-xs text-gray-400 mb-2 line-clamp-2">{goal.description}</p>
              )}
              
              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Progress</span>
                  <span className="text-gray-400">{goal.progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
              
              {/* Status Badge */}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 bg-green-900 text-green-300 rounded">
                  {goal.status}
                </span>
                <span className="text-xs text-gray-600">
                  #{goal.id}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-full max-w-md mx-4">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Create New Goal</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="e.g., Launch Tier-4 AGI"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
                  rows={3}
                  placeholder="Optional description..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  value={newGoal.priority}
                  onChange={(e) => setNewGoal({ ...newGoal, priority: parseInt(e.target.value) })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value={1}>1 - Normal</option>
                  <option value={2}>2 - Normal</option>
                  <option value={3}>3 - High</option>
                  <option value={4}>4 - High</option>
                  <option value={5}>5 - Critical</option>
                </select>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-800 flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGoal}
                disabled={!newGoal.title.trim() || loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Goal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
