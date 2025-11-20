import { Shield } from "lucide-react";

interface TrustIndicatorProps {
  trustScore: number; // 0-100
  compact?: boolean;
}

export default function TrustIndicator({ trustScore, compact = false }: TrustIndicatorProps) {
  const getTrustColor = (score: number) => {
    if (score >= 90) return "text-green-400 border-green-400";
    if (score >= 70) return "text-yellow-400 border-yellow-400";
    return "text-red-400 border-red-400";
  };

  const getTrustBgColor = (score: number) => {
    if (score >= 90) return "bg-green-400/20";
    if (score >= 70) return "bg-yellow-400/20";
    return "bg-red-400/20";
  };

  const getTrustLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 70) return "Good";
    return "Low";
  };

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTrustBgColor(trustScore)} ${getTrustColor(trustScore)}`}
      >
        <Shield size={12} />
        <span>{trustScore}%</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 p-3 rounded-lg border ${getTrustBgColor(trustScore)} ${getTrustColor(trustScore)}`}
    >
      <Shield size={18} />
      <div className="flex-1">
        <div className="text-sm font-semibold">Trust Score (τ)</div>
        <div className="text-xs opacity-80">{getTrustLabel(trustScore)}</div>
      </div>
      <div className="text-2xl font-bold">{trustScore}%</div>
    </div>
  );
}
