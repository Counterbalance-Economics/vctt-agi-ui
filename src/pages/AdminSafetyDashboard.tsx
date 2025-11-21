
import { useState, useEffect } from "react";
import { Shield, Power, Database, AlertTriangle, Activity, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { getApiUrl } from "../config/api";

interface SafetyStatus {
  regulationMode: "RESEARCH" | "DEVELOPMENT" | "PRODUCTION";
  agiModeEnabled: boolean;
  memoryEnabled: boolean;
  killSwitchActive: boolean;
  lastUpdate: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details: string;
  severity: "info" | "warning" | "critical";
}

export default function AdminSafetyDashboard() {
  const [status, setStatus] = useState<SafetyStatus>({
    regulationMode: "RESEARCH",
    agiModeEnabled: false,
    memoryEnabled: false,
    killSwitchActive: false,
    lastUpdate: new Date().toISOString(),
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActivatingKillSwitch, setIsActivatingKillSwitch] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isUpdatingMode, setIsUpdatingMode] = useState(false);
  const [isTogglingMemory, setIsTogglingMemory] = useState(false);

  const apiUrl = getApiUrl();

  // Show toast for 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch initial status
  useEffect(() => {
    fetchStatus();
    fetchAuditLogs();
    // Poll for updates every 3 seconds
    const interval = setInterval(() => {
      fetchStatus();
      fetchAuditLogs();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      if (!apiUrl) {
        setError("Backend URL not configured");
        setLoading(false);
        return;
      }

      const response = await fetch(`${apiUrl}/api/safety/status`);
      if (!response.ok) throw new Error("Failed to fetch safety status");

      const data = await response.json();
      setStatus({
        regulationMode: data.regulationMode,
        agiModeEnabled: data.agiModeEnabled || false,
        memoryEnabled: data.memoryEnabled || false,
        killSwitchActive: data.killSwitchActive || false,
        lastUpdate: new Date().toISOString(),
      });
      setError(null);
    } catch (err) {
      console.error("Error fetching safety status:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      if (!apiUrl) return;

      const response = await fetch(`${apiUrl}/api/safety/audit-log?limit=50`);
      if (!response.ok) throw new Error("Failed to fetch audit logs");

      const data = await response.json();
      setAuditLogs(data.logs || []);
    } catch (err) {
      console.error("Error fetching audit logs:", err);
    }
  };

  const updateRegulationMode = async (mode: "RESEARCH" | "DEVELOPMENT" | "PRODUCTION") => {
    setIsUpdatingMode(true);
    try {
      if (!apiUrl) {
        setToast({ message: "Backend URL not configured", type: "error" });
        return;
      }

      const response = await fetch(`${apiUrl}/api/safety/mode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });

      if (!response.ok) throw new Error("Failed to update regulation mode");

      await fetchStatus();
      await fetchAuditLogs();
      setToast({ message: `✅ Regulation mode changed to ${mode}`, type: "success" });
    } catch (err) {
      console.error("Error updating regulation mode:", err);
      setToast({ 
        message: `❌ Error: ${err instanceof Error ? err.message : "Unknown error"}`, 
        type: "error" 
      });
    } finally {
      setIsUpdatingMode(false);
    }
  };

  const toggleMemory = async () => {
    setIsTogglingMemory(true);
    try {
      if (!apiUrl) {
        setToast({ message: "Backend URL not configured", type: "error" });
        return;
      }

      const newState = !status.memoryEnabled;
      const response = await fetch(`${apiUrl}/api/safety/memory/${newState ? "enable" : "disable"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "admin" }),
      });

      if (!response.ok) throw new Error("Failed to toggle memory");

      await fetchStatus();
      await fetchAuditLogs();
      setToast({ 
        message: `✅ Memory ${newState ? "ENABLED" : "DISABLED"}`, 
        type: "success" 
      });
    } catch (err) {
      console.error("Error toggling memory:", err);
      setToast({ 
        message: `❌ Error: ${err instanceof Error ? err.message : "Unknown error"}`, 
        type: "error" 
      });
    } finally {
      setIsTogglingMemory(false);
    }
  };

  const activateKillSwitch = async () => {
    const confirmed = window.confirm(
      "⚠️ KILL SWITCH ACTIVATION\n\nThis will immediately halt all AGI operations:\n- All agents stopped\n- Memory writes blocked\n- Knowledge graph updates blocked\n- System enters emergency lockdown\n\nAre you ABSOLUTELY sure?"
    );

    if (!confirmed) return;

    setIsActivatingKillSwitch(true);
    try {
      if (!apiUrl) {
        setToast({ message: "Backend URL not configured", type: "error" });
        return;
      }

      const response = await fetch(`${apiUrl}/api/safety/kill-switch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Admin-initiated emergency stop" }),
      });

      if (!response.ok) throw new Error("Failed to activate kill switch");

      await fetchStatus();
      await fetchAuditLogs();
      setToast({ 
        message: "🛑 KILL SWITCH ACTIVATED - All AGI operations halted", 
        type: "success" 
      });
    } catch (err) {
      console.error("Error activating kill switch:", err);
      setToast({ 
        message: `❌ Error: ${err instanceof Error ? err.message : "Unknown error"}`, 
        type: "error" 
      });
    } finally {
      setIsActivatingKillSwitch(false);
    }
  };

  const deactivateKillSwitch = async () => {
    const confirmed = window.confirm(
      "Resume AGI operations?\n\nThis will restore normal operation after the kill switch."
    );

    if (!confirmed) return;

    setIsActivatingKillSwitch(true);
    try {
      if (!apiUrl) {
        setToast({ message: "Backend URL not configured", type: "error" });
        return;
      }

      const response = await fetch(`${apiUrl}/api/safety/kill-switch/deactivate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!response.ok) throw new Error("Failed to deactivate kill switch");

      await fetchStatus();
      await fetchAuditLogs();
      setToast({ 
        message: "✅ Kill switch deactivated - System restored", 
        type: "success" 
      });
    } catch (err) {
      console.error("Error deactivating kill switch:", err);
      setToast({ 
        message: `❌ Error: ${err instanceof Error ? err.message : "Unknown error"}`, 
        type: "error" 
      });
    } finally {
      setIsActivatingKillSwitch(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-500";
      case "warning":
        return "text-yellow-500";
      default:
        return "text-blue-500";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Safety Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-slide-in ${
          toast.type === "success" ? "bg-green-600" : "bg-red-600"
        } text-white font-medium`}>
          {toast.type === "success" ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link
              to="/deep"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={20} />
              <span>Back to IDE</span>
            </Link>
            <div className="h-6 w-px bg-gray-700" />
            <Shield className="text-orange-500" size={28} />
            <div>
              <h1 className="text-xl font-bold">Admin Safety Dashboard</h1>
              <p className="text-sm text-gray-400">Tier-4 AGI Control Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Activity className="text-green-500 animate-pulse" size={20} />
            <span className="text-sm text-gray-400">
              Last update: {new Date(status.lastUpdate).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-400">⚠️ {error}</p>
          </div>
        )}

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Regulation Mode */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={20} className="text-blue-500" />
              <h3 className="font-semibold">Regulation Mode</h3>
            </div>
            <select
              value={status.regulationMode}
              onChange={(e) =>
                updateRegulationMode(e.target.value as "RESEARCH" | "DEVELOPMENT" | "PRODUCTION")
              }
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={status.killSwitchActive || isUpdatingMode}
            >
              <option value="RESEARCH">RESEARCH</option>
              <option value="DEVELOPMENT">DEVELOPMENT</option>
              <option value="PRODUCTION">PRODUCTION</option>
            </select>
            <p className="text-xs text-gray-500 mt-2">
              {status.regulationMode === "RESEARCH" && "All AGI features disabled"}
              {status.regulationMode === "DEVELOPMENT" && "Testing mode enabled"}
              {status.regulationMode === "PRODUCTION" && "⚠️ Full AGI active"}
            </p>
          </div>

          {/* AGI Mode */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <Power size={20} className="text-purple-500" />
              <h3 className="font-semibold">AGI Mode</h3>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {status.agiModeEnabled ? "ON" : "OFF"}
              </span>
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  status.agiModeEnabled ? "bg-green-500/20 text-green-500" : "bg-gray-700 text-gray-500"
                }`}
              >
                <Power size={24} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {status.agiModeEnabled ? "Autonomous operations enabled" : "Standard mode"}
            </p>
          </div>

          {/* Memory Status */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <Database size={20} className="text-cyan-500" />
              <h3 className="font-semibold">Memory System</h3>
            </div>
            <button
              onClick={toggleMemory}
              disabled={status.killSwitchActive || isTogglingMemory}
              className={`w-full px-4 py-2 rounded font-medium transition-colors flex items-center justify-center gap-2 ${
                status.memoryEnabled
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-700 hover:bg-gray-600 text-gray-300"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isTogglingMemory ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <span>{status.memoryEnabled ? "ENABLED" : "DISABLED"}</span>
              )}
            </button>
            <p className="text-xs text-gray-500 mt-2">
              {status.memoryEnabled ? "Persistent memory active" : "Memory writes blocked"}
            </p>
          </div>

          {/* Kill Switch */}
          <div className="bg-gray-900 rounded-lg p-6 border border-red-900">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={20} className="text-red-500" />
              <h3 className="font-semibold text-red-400">Kill Switch</h3>
            </div>
            {status.killSwitchActive ? (
              <button
                onClick={deactivateKillSwitch}
                disabled={isActivatingKillSwitch}
                className="w-full px-4 py-2 rounded font-medium bg-orange-600 hover:bg-orange-700 text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isActivatingKillSwitch ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Resuming...</span>
                  </>
                ) : (
                  <span>RESUME</span>
                )}
              </button>
            ) : (
              <button
                onClick={activateKillSwitch}
                disabled={isActivatingKillSwitch}
                className="w-full px-4 py-2 rounded font-medium bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isActivatingKillSwitch ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Activating...</span>
                  </>
                ) : (
                  <span>ACTIVATE</span>
                )}
              </button>
            )}
            <p className="text-xs text-gray-500 mt-2">
              {status.killSwitchActive ? "⚠️ SYSTEM HALTED" : "Emergency stop"}
            </p>
          </div>
        </div>

        {/* Safety Charter */}
        <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-orange-400 mb-2 flex items-center gap-2">
            <Shield size={20} />
            VCTT AGI Safety Charter Active
          </h3>
          <p className="text-sm text-gray-400">
            All operations are governed by the VCTT Safety Charter. Mode-gating enforced. All
            actions audited. Human oversight required for PRODUCTION mode activation.
          </p>
        </div>

        {/* Audit Log */}
        <div className="bg-gray-900 rounded-lg border border-gray-800">
          <div className="px-6 py-4 border-b border-gray-800">
            <h3 className="font-semibold flex items-center gap-2">
              <Activity size={20} className="text-blue-500" />
              Live Audit Log
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {auditLogs.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No audit logs available</p>
              ) : (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 text-sm bg-gray-800/50 rounded p-3 hover:bg-gray-800 transition-colors"
                  >
                    <span className={`text-xs ${getSeverityColor(log.severity)} font-mono`}>
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{log.action}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-400 text-xs">{log.actor}</span>
                      </div>
                      <p className="text-gray-400 text-xs">{log.details}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
