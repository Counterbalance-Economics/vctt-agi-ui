import { X, Target, Brain, Shield, Calendar, Users, TrendingUp, GitBranch, BarChart3, Zap } from "lucide-react";

interface GoalsHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GoalsHelpModal({ isOpen, onClose }: GoalsHelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border-2 border-gray-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Goals System Guide</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-gray-300">
          {/* What is the Goals System? */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-blue-400" />
              <h3 className="text-xl font-semibold text-white">What is the Goals System?</h3>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-2">
              <p className="leading-relaxed">
                The Goals System is <strong className="text-blue-400">MIN's task management interface</strong> - it's how you give objectives to your AI agent and track its autonomous progress.
              </p>
              <div className="bg-blue-900/20 border border-blue-700/30 rounded p-3 mt-2">
                <p className="text-blue-300 text-sm flex items-start gap-2">
                  <Zap className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span><strong>Important:</strong> Goals are NOT a personal journal - they are <strong>objectives for MIN (your AI agent) to work on autonomously.</strong></span>
                </p>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-semibold text-white">How Human-AI Collaboration Works</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">👤</span>
                  <h4 className="font-semibold text-white">Human's Role</h4>
                </div>
                <ul className="space-y-1 text-sm">
                  <li>• Create high-level objectives</li>
                  <li>• Set priorities (1-5)</li>
                  <li>• Review MIN's progress</li>
                  <li>• Approve/modify proposals</li>
                  <li>• Mark goals complete</li>
                </ul>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-5 h-5 text-blue-400" />
                  <h4 className="font-semibold text-white">MIN's Role (AI)</h4>
                </div>
                <ul className="space-y-1 text-sm">
                  <li>• Break goals into subtasks</li>
                  <li>• Execute work autonomously</li>
                  <li>• Update progress regularly</li>
                  <li>• Propose improvements</li>
                  <li>• Learn from feedback</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Creating Goals */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-green-400" />
              <h3 className="text-xl font-semibold text-white">Creating Goals</h3>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3">
              <div>
                <h4 className="font-semibold text-white mb-1">Good Goal Examples:</h4>
                <ul className="space-y-1 text-sm">
                  <li className="text-green-400">✓ "Build a customer analytics dashboard with charts"</li>
                  <li className="text-green-400">✓ "Research and implement OAuth authentication"</li>
                  <li className="text-green-400">✓ "Optimize database queries for 10x speed improvement"</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Avoid:</h4>
                <ul className="space-y-1 text-sm">
                  <li className="text-red-400">✗ "Think about the project" (too vague)</li>
                  <li className="text-red-400">✗ "Fix everything" (no clear scope)</li>
                  <li className="text-red-400">✗ "Personal reminders" (use a journal app instead)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* View Modes */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <GitBranch className="w-5 h-5 text-yellow-400" />
              <h3 className="text-xl font-semibold text-white">View Modes</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-blue-400" />
                  <h4 className="font-semibold text-white text-sm">List View</h4>
                </div>
                <p className="text-xs text-gray-400">See all goals in a flat list with filters and search</p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <GitBranch className="w-4 h-4 text-purple-400" />
                  <h4 className="font-semibold text-white text-sm">Tree View</h4>
                </div>
                <p className="text-xs text-gray-400">Visualize parent-child goal relationships and dependencies</p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-green-400" />
                  <h4 className="font-semibold text-white text-sm">Statistics</h4>
                </div>
                <p className="text-xs text-gray-400">Track completion rates, active goals, and progress trends</p>
              </div>
            </div>
          </section>

          {/* Goal Status */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-orange-400" />
              <h3 className="text-xl font-semibold text-white">Goal Status</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full mb-2"></div>
                <h4 className="font-semibold text-white text-sm">Active</h4>
                <p className="text-xs text-gray-400">MIN is working on this</p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mb-2"></div>
                <h4 className="font-semibold text-white text-sm">Paused</h4>
                <p className="text-xs text-gray-400">Temporarily on hold</p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                <div className="w-3 h-3 bg-green-500 rounded-full mb-2"></div>
                <h4 className="font-semibold text-white text-sm">Completed</h4>
                <p className="text-xs text-gray-400">Successfully finished</p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                <div className="w-3 h-3 bg-red-500 rounded-full mb-2"></div>
                <h4 className="font-semibold text-white text-sm">Abandoned</h4>
                <p className="text-xs text-gray-400">No longer relevant</p>
              </div>
            </div>
          </section>

          {/* Safety & Monitoring */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-red-400" />
              <h3 className="text-xl font-semibold text-white">Safety & Monitoring</h3>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-2">
              <p className="text-sm leading-relaxed">
                MIN operates under <strong className="text-red-400">strict safety governance</strong>:
              </p>
              <ul className="space-y-1 text-sm ml-4">
                <li>• <strong className="text-white">Safety Steward</strong> monitors all goal execution</li>
                <li>• <strong className="text-white">Memory consent</strong> required for data access</li>
                <li>• <strong className="text-white">Regulation mode</strong> controls AI capabilities (currently: RESEARCH)</li>
                <li>• <strong className="text-white">Kill switch</strong> available for immediate halt</li>
              </ul>
            </div>
          </section>

          {/* Coming Soon */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-cyan-400" />
              <h3 className="text-xl font-semibold text-white">Coming Soon</h3>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">🔮</span>
                  <span><strong className="text-white">Real-time MIN activity:</strong> See when MIN is actively working on goals</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">💬</span>
                  <span><strong className="text-white">AI progress updates:</strong> MIN will post status updates and questions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">🤝</span>
                  <span><strong className="text-white">Coach proposals:</strong> View and approve MIN's improvement suggestions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">📊</span>
                  <span><strong className="text-white">Time allocation:</strong> See how MIN schedules work across goals</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Quick Tips */}
          <section className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">💡 Quick Tips</h3>
            <ul className="space-y-1 text-sm">
              <li>• <strong>Priority 5</strong> = Urgent, MIN will focus on this first</li>
              <li>• <strong>Priority 1</strong> = Low priority, MIN will work on when available</li>
              <li>• Use <strong>parent goals</strong> to break complex projects into manageable pieces</li>
              <li>• Check the <strong>Coach dashboard</strong> for MIN's improvement proposals</li>
              <li>• Review <strong>Statistics</strong> to track overall progress trends</li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 px-6 py-4 bg-gray-900/50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
