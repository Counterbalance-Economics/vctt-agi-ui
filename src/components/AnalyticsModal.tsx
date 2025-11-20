import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { api, type AggregateAnalytics, type TrustMetric } from "../services/api";
import { TrendingUp, X, Activity, BarChart3 } from "lucide-react";

interface Props {
  onClose: () => void;
}

const COLORS = {
  green: "#10b981",
  yellow: "#f59e0b",
  red: "#ef4444",
  blue: "#3b82f6",
};

export default function AnalyticsModal({ onClose }: Props) {
  const [analytics, setAnalytics] = useState<AggregateAnalytics | null>(null);
  const [trustMetrics, setTrustMetrics] = useState<TrustMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🔵 AnalyticsModal mounted, loading analytics...");
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    console.log("🔵 loadAnalytics: Starting fetch...");
    try {
      console.log("🔵 Fetching aggregate analytics and trust metrics...");
      const [agg, metrics] = await Promise.all([
        api.getAggregateAnalytics(),
        api.getTrustMetrics(),
      ]);
      console.log("🔵 Fetch complete! Aggregate:", agg, "Metrics:", metrics);
      setAnalytics(agg);
      setTrustMetrics(metrics);
      console.log(
        "🔵 State updated. Analytics:",
        agg ? "HAS DATA" : "NULL",
        "Metrics count:",
        metrics?.length || 0
      );
    } catch (error) {
      console.error("❌ Error loading analytics:", error);
    } finally {
      setLoading(false);
      console.log("🔵 Loading complete, loading=false");
    }
  };

  if (loading) {
    console.log("🔵 AnalyticsModal: Rendering LOADING state");
    return (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={(e) => {
          e.stopPropagation();
          console.log("🔴 Loading state backdrop clicked - IGNORING (do not close while loading)");
        }}
      >
        <div className="bg-gray-900 border-2 border-vctt-gold rounded-xl p-8 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-vctt-gold border-t-transparent"></div>
            <span className="text-vctt-gold text-xl font-medium">Loading Analytics...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    console.log("🔵 AnalyticsModal: Rendering NO DATA state");
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-gray-900 border-2 border-red-500 rounded-xl p-8 shadow-2xl max-w-md">
          <div className="text-red-400 text-xl mb-4 font-semibold">📊 No Analytics Data</div>
          <p className="text-gray-300 mb-6">Start a conversation to generate analytics.</p>
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
    { name: "Normal", value: analytics.regulation.normal, fill: COLORS.green },
    { name: "Clarify", value: analytics.regulation.clarify, fill: COLORS.yellow },
    { name: "Slow Down", value: analytics.regulation.slow_down, fill: COLORS.red },
  ];

  const trustChartData = trustMetrics
    .map((m) => ({
      time: new Date(m.timestamp).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      trust: Math.round(m.trust_tau * 100),
      contradiction: Math.round(m.contradiction * 100),
    }))
    .slice(-10); // Last 10 points for compact view

  const avgTrust = Math.round(analytics.trust_metrics.average_trust_tau * 100);
  const getTrustColor = (trust: number) => {
    if (trust >= 80) return COLORS.green;
    if (trust >= 60) return COLORS.yellow;
    return COLORS.red;
  };

  console.log("🔵 AnalyticsModal: Rendering NORMAL state with data:", analytics);
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={() => {
        console.log("🔴 Backdrop clicked, closing modal");
        onClose();
      }}
    >
      {/* Centered Modal - Click inside doesn't close */}
      <div
        className="bg-gray-900 border-2 border-vctt-gold rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-vctt-gold/30 p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BarChart3 className="text-vctt-gold" size={24} />
            <h2 className="text-xl font-bold text-white">Analytics Dashboard</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-160px)] p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Avg Trust</div>
              <div className="text-2xl font-bold" style={{ color: getTrustColor(avgTrust) }}>
                {avgTrust}%
              </div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Sessions</div>
              <div className="text-2xl font-bold text-blue-400">
                {analytics.overview.total_sessions}
              </div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Messages</div>
              <div className="text-2xl font-bold text-purple-400">
                {analytics.overview.total_messages}
              </div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Repairs</div>
              <div className="text-2xl font-bold text-orange-400">
                {analytics.repair_metrics.total_repairs}
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trust Timeline */}
            {trustChartData.length > 0 && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <TrendingUp size={16} className="text-vctt-gold" />
                  Trust Timeline
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={trustChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9ca3af" style={{ fontSize: "10px" }} />
                    <YAxis stroke="#9ca3af" style={{ fontSize: "10px" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "1px solid #374151",
                        borderRadius: "6px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    <Line
                      type="monotone"
                      dataKey="trust"
                      stroke={COLORS.green}
                      name="Trust"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="contradiction"
                      stroke={COLORS.red}
                      name="Contradiction"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Regulation Distribution */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Activity size={16} className="text-vctt-gold" />
                Regulation Modes
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={regulationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: "11px" }} />
                  <YAxis stroke="#9ca3af" style={{ fontSize: "10px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {regulationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-bold text-white mb-3">System Performance</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-400 text-xs mb-1">Avg Messages/Session</div>
                <div className="text-white font-semibold">
                  {analytics.overview.avg_messages_per_session.toFixed(1)}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-1">Avg Repairs/Session</div>
                <div className="text-white font-semibold">
                  {analytics.repair_metrics.avg_repairs_per_session.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-1">Trust Range</div>
                <div className="text-white font-semibold">
                  {Math.round(analytics.trust_metrics.min_trust * 100)}% -{" "}
                  {Math.round(analytics.trust_metrics.max_trust * 100)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-800 border-t border-vctt-gold/30 p-4 flex justify-between items-center">
          <div className="text-xs text-gray-400">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-vctt-gold hover:bg-yellow-600 text-gray-900 font-semibold rounded-lg transition-colors text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
