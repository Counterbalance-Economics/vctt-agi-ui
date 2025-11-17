
// API Configuration
const backendUrl = (import.meta as any).env?.VITE_BACKEND_URL || 'mock';

export const API_CONFIG = {
  // Set to 'mock' to use mock backend, or provide backend URL
  BACKEND_URL: backendUrl,
  USE_MOCK: backendUrl === 'mock' || !backendUrl
};

export const getApiUrl = () => {
  if (API_CONFIG.USE_MOCK) {
    return null;
  }
  return API_CONFIG.BACKEND_URL;
};
