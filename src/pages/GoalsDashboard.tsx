
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Target,
  Plus,
  List,
  GitBranch,
  TrendingUp,
  Home,
  RefreshCw,
  Filter,
  BarChart3,
  ArrowLeft,
  HelpCircle,
} from "lucide-react";
import { goalsApi, Goal, GoalTree, StateAwareness, CreateGoalDto } from "../services/goals-api";
import GoalCard from "../components/GoalCard";
import GoalTreeView from "../components/GoalTreeView";
import CreateGoalModal from "../components/CreateGoalModal";
import GoalsHelpModal from "../components/GoalsHelpModal";
import ExecutionControls from "../components/ExecutionControls";
import GoalDetailsModal from "../components/GoalDetailsModal";

type ViewMode = "list" | "tree" | "stats";

export default function GoalsDashboard() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalTree, setGoalTree] = useState<GoalTree[]>([]);
  const [stateAwareness, setStateAwareness] = useState<StateAwareness | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [selectedGoalForDetails, setSelectedGoalForDetails] = useState<Goal | null>(null);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [filterStatus]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load goals with filters
      const filters: any = {};
      if (filterStatus !== "all") filters.status = filterStatus;

      const [goalsData, treeData, awarenessData] = await Promise.all([
        goalsApi.getAllGoals(filters),
        goalsApi.getGoalTree(),
        goalsApi.getStateAwareness(),
      ]);

      setGoals(goalsData);
      setGoalTree(treeData);
      setStateAwareness(awarenessData);
    } catch (error) {
      console.error("Error loading goals data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGoal = async (dto: CreateGoalDto) => {
    try {
      if (editingGoal) {
        await goalsApi.updateGoal(editingGoal.id, dto);
      } else {
        await goalsApi.createGoal(dto);
      }
      await loadData();
      setEditingGoal(null);
    } catch (error) {
      console.error("Error creating/updating goal:", error);
      throw error;
    }
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleDeleteGoal = async (id: number) => {
    try {
      await goalsApi.deleteGoal(id);
      await loadData();
    } catch (error) {
      console.error("Error deleting goal:", error);
      alert("Failed to delete goal");
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await goalsApi.updateGoalStatus(id, status);
      await loadData();
    } catch (error: any) {
      console.error("Error updating goal status:", error);
      const errorMsg = error?.message || "Failed to update goal status";
      
      // Check if backend is in RESEARCH mode
      if (errorMsg.includes("RESEARCH") || errorMsg.includes("read-only")) {
        alert("⚠️ Backend is in RESEARCH mode (read-only)\n\nWrite operations are currently disabled for safety. The backend is collecting data but not making changes.\n\nTo enable writes, contact your system administrator.");
      } else {
        alert(`Failed to update goal status:\n${errorMsg}`);
      }
    }
  };

  const handleProgressUpdate = async (id: number, progress: number) => {
    try {
      await goalsApi.updateGoalProgress({
        goal_id: id,
        progressPercent: progress,
        recordedBy: "admin", // TODO: Get from auth context
        notes: `Progress updated to ${progress}%`,
      });
      await loadData();
    } catch (error) {
      console.error("Error updating goal progress:", error);
      alert("Failed to update goal progress");
    }
  };

  const handleGoalClick = (goalId: number) => {
    const goal = goals.find((g) => g.id === goalId);
    if (goal) {
      handleEditGoal(goal);
    }
  };

  const stats = stateAwareness?.goal_statistics || {
    total_goals: goals.length,
    active_goals: goals.filter((g) => g.status === "active").length,
    completed_goals: goals.filter((g) => g.status === "completed").length,
    completion_rate: goals.length > 0
      ? (goals.filter((g) => g.status === "completed").length / goals.length) * 100
      : 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                title="Go to previous page"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back</span>
              </button>
              <Link
                to="/"
                className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                title="Go to home page"
              >
                <Home className="w-4 h-4" />
                <span className="text-sm">Home</span>
              </Link>
              <div className="w-px h-6 bg-gray-700" />
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-blue-400" />
                <div>
                  <h1 className="text-2xl font-bold text-white">Goals Dashboard</h1>
                  <p className="text-sm text-gray-400">Manage and track your objectives</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsHelpOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-white transition-colors"
                title="Help & Guide"
              >
                <HelpCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Help</span>
              </button>
              <button
                onClick={loadData}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-white transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={() => {
                  setEditingGoal(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                New Goal
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Total Goals</span>
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white">{stats.total_goals}</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Active</span>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white">{stats.active_goals}</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Completed</span>
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white">{stats.completed_goals}</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Completion Rate</span>
              <BarChart3 className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white">
              {stats.completion_rate.toFixed(0)}%
            </div>
          </div>
        </div>

        {/* BETA LIMITATIONS BANNER */}
        <div className="mb-6 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-700/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-yellow-400 font-semibold mb-1">⚠️ Beta Feature - Execution Limitations</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                <strong>Current State:</strong> MIN can decompose goals and generate recommendations, but <strong>cannot yet execute actual code changes</strong>. 
                When you activate a goal, MIN will analyze it and provide text-based suggestions, but won't create files or modify your codebase. 
                Full autonomous execution (file creation, code modification) is in development.
              </p>
              <p className="text-xs text-gray-400 mt-2">
                💡 <strong>Tip:</strong> Use goals for planning and tracking. Review MIN's suggestions in the Activity Feed, then implement them manually or use the DeepAgent IDE at <code className="bg-gray-800 px-1 rounded">/deep</code> for actual coding.
              </p>
            </div>
          </div>
        </div>

        {/* MIN Execution Controls */}
        <div className="mb-8 bg-gray-800/30 border border-gray-700 rounded-lg p-5">
          <ExecutionControls />
        </div>

        {/* View Mode Tabs & Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 bg-gray-800/50 border border-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <List className="w-4 h-4" />
              List
            </button>
            <button
              onClick={() => setViewMode("tree")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                viewMode === "tree"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <GitBranch className="w-4 h-4" />
              Tree
            </button>
            <button
              onClick={() => setViewMode("stats")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                viewMode === "stats"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Statistics
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="proposed">Proposed</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="abandoned">Abandoned</option>
            </select>
          </div>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        ) : (
          <>
            {viewMode === "list" && (
              <div className="space-y-4">
                {goals.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <Target className="w-16 h-16 mb-4 opacity-50" />
                    <p className="text-lg mb-2">No goals found</p>
                    <p className="text-sm">Create your first goal to get started!</p>
                  </div>
                ) : (
                  goals.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onEdit={handleEditGoal}
                      onDelete={handleDeleteGoal}
                      onStatusChange={handleStatusChange}
                      onProgressUpdate={handleProgressUpdate}
                      onViewDetails={setSelectedGoalForDetails}
                    />
                  ))
                )}
              </div>
            )}

            {viewMode === "tree" && (
              <>
                {goalTree.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <GitBranch className="w-16 h-16 text-gray-600 mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Goal Hierarchy Yet</h3>
                    <p className="text-gray-400 mb-4">
                      Create parent-child goal relationships to see the tree view
                    </p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Create First Goal
                    </button>
                  </div>
                ) : (
                  <GoalTreeView trees={goalTree} onGoalClick={handleGoalClick} />
                )}
              </>
            )}

            {viewMode === "stats" && (
              <>
                {!stateAwareness ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <BarChart3 className="w-16 h-16 text-gray-600 mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Statistics Available</h3>
                    <p className="text-gray-400 mb-4">
                      Create some goals to see statistics and insights
                    </p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Create First Goal
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Active Goals */}
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Active Goals</h3>
                      <div className="space-y-3">
                        {stateAwareness.active_goals.length === 0 ? (
                          <p className="text-gray-400 text-sm text-center py-4">No active goals</p>
                        ) : (
                          stateAwareness.active_goals.slice(0, 5).map((goal) => (
                            <div
                              key={goal.id}
                              className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg"
                            >
                              <span className="text-white text-sm">{goal.title}</span>
                              <span className={`text-sm font-medium ${
                                goal.status === 'completed' ? 'text-green-400' :
                                goal.status === 'active' ? 'text-blue-400' :
                                'text-gray-400'
                              }`}>
                                {goal.status}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Recent Goals */}
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Recent Goals</h3>
                      <div className="space-y-3">
                        {stateAwareness.recent_goals.length === 0 ? (
                          <p className="text-gray-400 text-sm text-center py-4">No recent goals</p>
                        ) : (
                          stateAwareness.recent_goals.slice(0, 5).map((goal) => (
                            <div
                              key={goal.id}
                              className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg"
                            >
                              <span className="text-white text-sm">{goal.title}</span>
                              <span className="text-gray-400 text-xs">
                                {new Date(goal.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      <CreateGoalModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingGoal(null);
        }}
        onSubmit={handleCreateGoal}
        editGoal={editingGoal}
        parentGoals={goals.filter((g) => g.status !== "completed")}
      />

      {/* Help Modal */}
      <GoalsHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* Goal Details Modal (Activity & Subtasks) */}
      {selectedGoalForDetails && (
        <GoalDetailsModal
          goal={selectedGoalForDetails}
          isOpen={!!selectedGoalForDetails}
          onClose={() => setSelectedGoalForDetails(null)}
        />
      )}
    </div>
  );
}
