
/**
 * API Reference Service
 * 
 * DeepAgent Protocol: Fetch MIN's API reference on startup
 * and validate all actions against it to prevent breakages.
 */

import { api } from './api';

interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  frontend_usage?: string;
}

interface ApiReference {
  version: string;
  last_updated: string;
  endpoints: {
    [category: string]: {
      [endpoint: string]: ApiEndpoint;
    };
  };
}

class ApiReferenceService {
  private apiReference: ApiReference | null = null;
  private isLoading = false;
  private isInitialized = false;

  /**
   * Initialize the API reference from MIN's memory
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      console.log('📚 API Reference already initialized');
      return true;
    }

    if (this.isLoading) {
      console.log('⏳ API Reference loading in progress...');
      return false;
    }

    this.isLoading = true;

    try {
      console.log('🔄 DeepAgent: Fetching API reference from MIN...');
      
      // Fetch from MIN's memory
      const memories = await api.getMemories('min_system', 'system_api_reference', 1);
      
      if (!memories || memories.length === 0) {
        console.warn('⚠️ No API reference found in MIN memory. Using fallback mode.');
        this.apiReference = this.createFallbackReference();
        this.isInitialized = true;
        this.isLoading = false;
        return true;
      }

      // Parse reference
      this.apiReference = JSON.parse(memories[0].content) as ApiReference;
      this.isInitialized = true;
      
      console.log(`✅ API Reference loaded: v${this.apiReference.version} (${this.apiReference.last_updated})`);
      console.log(`📊 Total endpoints: ${this.countEndpoints(this.apiReference)}`);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to load API reference:', error);
      console.warn('⚠️ Using fallback reference');
      
      this.apiReference = this.createFallbackReference();
      this.isInitialized = true;
      return false;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Validate endpoint before making API call
   */
  validateEndpoint(method: string, path: string): { valid: boolean; message: string } {
    if (!this.apiReference) {
      return {
        valid: true, // Fallback: allow all calls if reference not loaded
        message: 'API reference not loaded, skipping validation',
      };
    }

    // Normalize method and path
    const normalizedMethod = method.toUpperCase();
    const endpoint = `${normalizedMethod} ${path}`;

    // Check if endpoint exists in reference
    for (const category in this.apiReference.endpoints) {
      if (endpoint in this.apiReference.endpoints[category]) {
        return {
          valid: true,
          message: `Valid endpoint in category: ${category}`,
        };
      }
    }

    // Not found in reference
    return {
      valid: false,
      message: `Endpoint not found in API reference: ${endpoint}`,
    };
  }

  /**
   * Get endpoint details
   */
  getEndpointInfo(method: string, path: string): ApiEndpoint | null {
    if (!this.apiReference) return null;

    const normalizedMethod = method.toUpperCase();
    const endpoint = `${normalizedMethod} ${path}`;

    for (const category in this.apiReference.endpoints) {
      if (endpoint in this.apiReference.endpoints[category]) {
        return this.apiReference.endpoints[category][endpoint];
      }
    }

    return null;
  }

  /**
   * Get all endpoints by category
   */
  getEndpointsByCategory(category: string): Record<string, ApiEndpoint> {
    if (!this.apiReference) return {};
    return this.apiReference.endpoints[category] || {};
  }

  /**
   * Get API reference version
   */
  getVersion(): string | null {
    return this.apiReference?.version || null;
  }

  /**
   * Check if initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Helper: Count total endpoints
   */
  private countEndpoints(reference: ApiReference): number {
    return Object.values(reference.endpoints).reduce(
      (sum, cat) => sum + Object.keys(cat).length,
      0,
    );
  }

  /**
   * Create fallback reference with essential endpoints
   */
  private createFallbackReference(): ApiReference {
    return {
      version: 'fallback-1.0.0',
      last_updated: new Date().toISOString(),
      endpoints: {
        core: {
          'POST /api/v1/session/start': {
            method: 'POST',
            path: '/api/v1/session/start',
            description: 'Start new conversation session',
          },
          'POST /api/v1/session/step': {
            method: 'POST',
            path: '/api/v1/session/step',
            description: 'Send message in conversation',
          },
          'GET /api/v1/session/:id': {
            method: 'GET',
            path: '/api/v1/session/:id',
            description: 'Get session details',
          },
        },
        analytics: {
          'GET /api/v1/analytics/sessions': {
            method: 'GET',
            path: '/api/v1/analytics/sessions',
            description: 'Get conversation history',
          },
          'GET /api/v1/analytics/sessions/:id/history': {
            method: 'GET',
            path: '/api/v1/analytics/sessions/:id/history',
            description: 'Get full conversation',
          },
        },
        memory: {
          'GET /api/memory/retrieve': {
            method: 'GET',
            path: '/api/memory/retrieve',
            description: 'Retrieve memories',
          },
        },
      },
    };
  }
}

// Export singleton instance
export const apiReferenceService = new ApiReferenceService();
