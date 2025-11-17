
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { api, type AggregateAnalytics, type TrustMetric } from '../services/api';

interface Props {
  onClose: () => void;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

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
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-vctt-dark border border-vctt-accent p-8 rounded-lg">
          <div className="text-vctt-accent text-xl">Loading Analytics...</div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-vctt-dark border border-vctt-accent p-8 rounded-lg">
          <div className="text-red-500 text-xl mb-4">No analytics data available</div>
          <button onClick={onClose} className="px-4 py-2 bg-vctt-accent text-black rounded hover:bg-vctt-accent/80">
            Close
          </button>
        </div>
      </div>
    );
  }

  const regulationData = [
    { name: 'Normal', value: analytics.regulation.normal, color: COLORS[0] },
    { name: 'Clarify', value: analytics.regulation.clarify, color: COLORS[1] },
    { name: 'Slow Down', value: analytics.regulation.slow_down, color: COLORS[2] },
  ];

  const trustChartData = trustMetrics.map(m => ({
    time: new Date(m.timestamp).toLocaleTimeString(),
    trust: m.trust_tau,
    contradiction: m.contradiction,
  })).slice(-20);

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-vctt-dark border-2 border-vctt-accent rounded-lg max-w-7xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-vctt-dark border-b border-vctt-accent p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-vctt-accent">📊 VCTT-AGI Analytics Dashboard</h2>
          <button onClick={onClose} className="text-vctt-accent hover:text-white text-2xl">✕</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-black/40 border border-vctt-accent/30 rounded-lg p-6">
              <div className="text-vctt-accent/70 text-sm mb-2">Total Sessions</div>
              <div className="text-4xl font-bold text-vctt-accent">{analytics.overview.total_sessions}</div>
            </div>
            <div className="bg-black/40 border border-vctt-accent/30 rounded-lg p-6">
              <div className="text-vctt-accent/70 text-sm mb-2">Total Messages</div>
              <div className="text-4xl font-bold text-vctt-accent">{analytics.overview.total_messages}</div>
            </div>
            <div className="bg-black/40 border border-vctt-accent/30 rounded-lg p-6">
              <div className="text-vctt-accent/70 text-sm mb-2">Avg Messages/Session</div>
              <div className="text-4xl font-bold text-vctt-accent">{analytics.overview.avg_messages_per_session.toFixed(1)}</div>
            </div>
          </div>

          {/* Trust Metrics */}
          <div className="bg-black/40 border border-vctt-accent/30 rounded-lg p-6">
            <h3 className="text-xl font-bold text-vctt-accent mb-4">Trust Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <div className="text-vctt-accent/70 text-sm">Average Trust (τ)</div>
                <div className="text-2xl font-bold text-green-400">{(analytics.trust_metrics.average_trust_tau * 100).toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-vctt-accent/70 text-sm">Min Trust</div>
                <div className="text-2xl font-bold text-yellow-400">{(analytics.trust_metrics.min_trust * 100).toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-vctt-accent/70 text-sm">Max Trust</div>
                <div className="text-2xl font-bold text-green-400">{(analytics.trust_metrics.max_trust * 100).toFixed(1)}%</div>
              </div>
            </div>

            {trustChartData.length > 0 && (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trustChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="time" stroke="#10b981" />
                  <YAxis stroke="#10b981" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #10b981' }}
                    labelStyle={{ color: '#10b981' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="trust" stroke="#10b981" name="Trust (τ)" strokeWidth={2} />
                  <Line type="monotone" dataKey="contradiction" stroke="#ef4444" name="Contradiction" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Repair Metrics & Regulation Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Repair Metrics */}
            <div className="bg-black/40 border border-vctt-accent/30 rounded-lg p-6">
              <h3 className="text-xl font-bold text-vctt-accent mb-4">Repair Metrics</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-vctt-accent/70 text-sm">Total Repairs</div>
                  <div className="text-2xl font-bold">{analytics.repair_metrics.total_repairs}</div>
                </div>
                <div>
                  <div className="text-vctt-accent/70 text-sm">Avg Repairs/Session</div>
                  <div className="text-2xl font-bold">{analytics.repair_metrics.avg_repairs_per_session.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-vctt-accent/70 text-sm">Max Repairs</div>
                  <div className="text-2xl font-bold">{analytics.repair_metrics.max_repairs}</div>
                </div>
              </div>
            </div>

            {/* Regulation Distribution */}
            <div className="bg-black/40 border border-vctt-accent/30 rounded-lg p-6">
              <h3 className="text-xl font-bold text-vctt-accent mb-4">Regulation Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={regulationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {regulationData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-vctt-dark border-t border-vctt-accent p-4 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-vctt-accent text-black rounded-lg hover:bg-vctt-accent/80 font-semibold">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
