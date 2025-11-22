
/**
 * React Hook for API Reference
 * 
 * Usage in components:
 * const { isReady, validateEndpoint } = useApiReference();
 */

import { useState, useEffect } from 'react';
import { apiReferenceService } from '../services/api-reference';

export function useApiReference() {
  const [isReady, setIsReady] = useState(false);
  const [version, setVersion] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      await apiReferenceService.initialize();
      setIsReady(apiReferenceService.isReady());
      setVersion(apiReferenceService.getVersion());
    };

    init();
  }, []);

  return {
    isReady,
    version,
    validateEndpoint: apiReferenceService.validateEndpoint.bind(apiReferenceService),
    getEndpointInfo: apiReferenceService.getEndpointInfo.bind(apiReferenceService),
    getEndpointsByCategory: apiReferenceService.getEndpointsByCategory.bind(apiReferenceService),
  };
}
