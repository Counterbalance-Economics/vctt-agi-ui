// API Configuration
// Fallback to production backend if env var not set
const PRODUCTION_BACKEND = "https://vctt-agi-backend.onrender.com";
const backendUrl = (import.meta as any).env?.VITE_BACKEND_URL || PRODUCTION_BACKEND;

export const API_CONFIG = {
  // Set to 'mock' to use mock backend, or provide backend URL
  BACKEND_URL: backendUrl,
  USE_MOCK: backendUrl === "mock" || !backendUrl,
};

export const getApiUrl = () => {
  console.log(
    "🌐 getApiUrl called, BACKEND_URL:",
    API_CONFIG.BACKEND_URL,
    "USE_MOCK:",
    API_CONFIG.USE_MOCK
  );
  if (API_CONFIG.USE_MOCK) {
    return null;
  }
  return API_CONFIG.BACKEND_URL;
};
