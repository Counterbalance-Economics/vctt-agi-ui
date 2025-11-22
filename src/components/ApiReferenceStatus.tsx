
/**
 * API Reference Status Component
 * 
 * Shows API reference loading status in the UI
 * Usage: <ApiReferenceStatus /> in App.tsx or ChatbotLanding.tsx
 */

import { useApiReference } from '../hooks/useApiReference';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function ApiReferenceStatus() {
  const { isReady, version } = useApiReference();

  if (!isReady) {
    return (
      <div className="fixed bottom-4 right-4 bg-yellow-900 text-yellow-100 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm z-50">
        <Loader size={16} className="animate-spin" />
        Loading API reference...
      </div>
    );
  }

  if (version?.startsWith('fallback')) {
    return (
      <div className="fixed bottom-4 right-4 bg-orange-900 text-orange-100 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm z-50">
        <AlertCircle size={16} />
        Using fallback API reference
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-green-900 text-green-100 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm z-50 opacity-0 hover:opacity-100 transition-opacity">
      <CheckCircle size={16} />
      API Reference: v{version}
    </div>
  );
}
