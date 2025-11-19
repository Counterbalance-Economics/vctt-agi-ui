
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { api, type AggregateAnalytics, type TrustMetric } from '../services/api';
import { TrendingUp, MessageSquare, RefreshCw, Activity, AlertTriangle, CheckCircle } from 'lucide-react';

interface Props {
  onClose: () => void;
}

const COLORS = {
  green: '#10b981',
  yellow: '#f59e0b',
  red: '#ef4444',
  blue: '#3b82f6',
  purple: '#8b5cf6',
};

export default function AnalyticsDashboard({ onClose }: Props) {
  const [analytics, setAnalytics] = useState<AggregateAnalytics | null>(null);
  const [trustMetrics, setTrustMetrics] = useState<TrustMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [agg, metrics] = await Promise.all([
        api.getAggregateAnalytics(),
        api.getTrustMetrics(),
      ]);
      setAnalytics(agg);
      setTrustMetrics(metrics);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/70 backdrop-blur-sm z-[100]">
        <div className="fixed left-64 right-80 top-1/2 -translate-y-1/2 mx-auto bg-gray-900 border border-vctt-gold rounded-xl p-8 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-vctt-gold border-t-transparent"></div>
            <span className="text-vctt-gold text-xl font-medium">Loading Analytics...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/70 backdrop-blur-sm z-[100]">
        <div className="fixed left-64 right-80 top-1/2 -translate-y-1/2 mx-auto bg-gray-900 border border-red-500 rounded-xl p-8 shadow-2xl max-w-md">
          <div className="text-red-400 text-xl mb-4 font-semibold">📊 No Analytics Data</div>
          <p className="text-gray-300 mb-6">No data available yet. Start a conversation to generate analytics.</p>
          <button 
            onClick={onClose} 
            className="w-full px-6 py-3 bg-vctt-gold hover:bg-yellow-600 text-gray-900 font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const regulationData = [
    { name: 'Normal', value: analytics.regulation.normal, fill: COLORS.green },
    { name: 'Clarify', value: analytics.regulation.clarify, fill: COLORS.yellow },
    { name: 'Slow Down', value: analytics.regulation.slow_down, fill: COLORS.red },
  ];

  const trustChartData = trustMetrics
    .map(m => ({
      time: new Date(m.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      trust: Math.round(m.trust_tau * 100),
      contradiction: Math.round(m.contradiction * 100),
    }))
    .slice(-15); // Show last 15 data points for clarity

  const getTrustColor = (trust: number) => {
    if (trust >= 80) return COLORS.green;
    if (trust >= 60) return COLORS.yellow;
    return COLORS.red;
  };

  const avgTrust = Math.round(analytics.trust_metrics.average_trust_tau * 100);
  const trustColor = getTrustColor(avgTrust);

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/80 backdrop-blur-sm z-[100]">
      <div className="fixed left-64 right-80 top-1/2 -translate-y-1/2 mx-auto bg-gray-900 rounded-2xl w-[90%] max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Activity className="text-vctt-gold" size={28} />
            <div>
              <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
              <p className="text-gray-400 text-sm mt-1">System performance and trust metrics</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-180px)] p-6 space-y-6">
          
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Average Trust */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-vctt-gold transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${trustColor}20` }}>
                  <TrendingUp size={20} style={{ color: trustColor }} />
                </div>
                <span className="text-3xl font-bold" style={{ color: trustColor }}>
                  {avgTrust}%
                </span>
              </div>
              <div className="text-gray-300 font-medium">Average Trust</div>
              <div className="text-xs text-gray-500 mt-1">Overall system confidence</div>
            </div>

            {/* Total Sessions */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-blue-500 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <MessageSquare size={20} className="text-blue-400" />
                </div>
                <span className="text-3xl font-bold text-blue-400">
                  {analytics.overview.total_sessions}
                </span>
              </div>
              <div className="text-gray-300 font-medium">Total Sessions</div>
              <div className="text-xs text-gray-500 mt-1">Conversations started</div>
            </div>

            {/* Total Messages */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-purple-500 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <MessageSquare size={20} className="text-purple-400" />
                </div>
                <span className="text-3xl font-bold text-purple-400">
                  {analytics.overview.total_messages}
                </span>
              </div>
              <div className="text-gray-300 font-medium">Total Messages</div>
              <div className="text-xs text-gray-500 mt-1">Questions & responses</div>
            </div>

            {/* Total Repairs */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-orange-500 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <RefreshCw size={20} className="text-orange-400" />
                </div>
                <span className="text-3xl font-bold text-orange-400">
                  {analytics.repair_metrics.total_repairs}
                </span>
              </div>
              <div className="text-gray-300 font-medium">Total Repairs</div>
              <div className="text-xs text-gray-500 mt-1">Trust corrections made</div>
            </div>
          </div>

          {/* Trust Timeline */}
          {trustChartData.length > 0 && (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <TrendingUp size={20} className="text-vctt-gold" />
                  Trust Timeline
                </h3>
                <p className="text-sm text-gray-400 mt-1">Trust (τ) and contradiction over time (last 15 points)</p>
              </div>
              <div className="bg-gray-900 rounded-lg p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trustChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#9ca3af" 
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="#9ca3af" 
                      style={{ fontSize: '12px' }}
                      label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af' } }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151', 
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                      labelStyle={{ color: '#f3f4f6', fontWeight: 'bold' }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="trust" 
                      stroke={COLORS.green} 
                      name="Trust (τ)" 
                      strokeWidth={3}
                      dot={{ fill: COLORS.green, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="contradiction" 
                      stroke={COLORS.red} 
                      name="Contradiction" 
                      strokeWidth={3}
                      dot={{ fill: COLORS.red, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Two Column Layout: Regulation & Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Regulation Distribution */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Activity size={20} className="text-vctt-gold" />
                  Regulation Mode Distribution
                </h3>
                <p className="text-sm text-gray-400 mt-1">How often each mode was triggered</p>
              </div>
              <div className="bg-gray-900 rounded-lg p-4">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={regulationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#9ca3af" 
                      style={{ fontSize: '13px', fontWeight: '500' }}
                    />
                    <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151', 
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {regulationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle size={16} className="text-green-400" />
                  <span className="text-gray-300">Normal: System operating optimally</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle size={16} className="text-yellow-400" />
                  <span className="text-gray-300">Clarify: User input needs clarification</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle size={16} className="text-red-400" />
                  <span className="text-gray-300">Slow Down: High contradiction detected</span>
                </div>
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white">Detailed Statistics</h3>
                <p className="text-sm text-gray-400 mt-1">In-depth system performance</p>
              </div>
              
              <div className="space-y-4">
                {/* Trust Range */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-2 font-medium">Trust Range</div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-500">Min</div>
                      <div className="text-lg font-bold text-yellow-400">
                        {Math.round(analytics.trust_metrics.min_trust * 100)}%
                      </div>
                    </div>
                    <div className="text-gray-600">→</div>
                    <div>
                      <div className="text-xs text-gray-500">Avg</div>
                      <div className="text-lg font-bold text-green-400">
                        {avgTrust}%
                      </div>
                    </div>
                    <div className="text-gray-600">→</div>
                    <div>
                      <div className="text-xs text-gray-500">Max</div>
                      <div className="text-lg font-bold text-green-400">
                        {Math.round(analytics.trust_metrics.max_trust * 100)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Engagement */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-3 font-medium">Engagement</div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">Avg Messages/Session</span>
                      <span className="text-lg font-bold text-purple-400">
                        {analytics.overview.avg_messages_per_session.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">Avg Repairs/Session</span>
                      <span className="text-lg font-bold text-orange-400">
                        {analytics.repair_metrics.avg_repairs_per_session.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">Max Repairs (Single)</span>
                      <span className="text-lg font-bold text-red-400">
                        {analytics.repair_metrics.max_repairs}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Health Indicator */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-3 font-medium">System Health</div>
                  <div className="flex items-center gap-3">
                    {avgTrust >= 80 ? (
                      <>
                        <CheckCircle size={24} className="text-green-400" />
                        <div>
                          <div className="text-sm font-semibold text-green-400">Excellent</div>
                          <div className="text-xs text-gray-400">System performing optimally</div>
                        </div>
                      </>
                    ) : avgTrust >= 60 ? (
                      <>
                        <AlertTriangle size={24} className="text-yellow-400" />
                        <div>
                          <div className="text-sm font-semibold text-yellow-400">Good</div>
                          <div className="text-xs text-gray-400">Minor fluctuations detected</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={24} className="text-red-400" />
                        <div>
                          <div className="text-sm font-semibold text-red-400">Attention Needed</div>
                          <div className="text-xs text-gray-400">Trust levels below optimal</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-800 border-t border-gray-700 p-4 flex justify-between items-center">
          <div className="text-sm text-gray-400">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
          <button 
            onClick={onClose} 
            className="px-6 py-2.5 bg-vctt-gold hover:bg-yellow-600 text-gray-900 font-semibold rounded-lg transition-colors shadow-lg"
          >
            Close Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
