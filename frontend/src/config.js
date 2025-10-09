// Auto-detect the best API URL
const getApiBaseUrl = () => {
  // Use Vite environment variable first
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Auto-detect based on current host
  const { hostname, protocol } = window.location;
  
  // If we're in production (not localhost)
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    // Use the same host but different port for backend
    return `${protocol}//${hostname}:8001`;
  }
  
  // Default development URL
  return 'http://localhost:8001';
};

export const API_BASE_URL = getApiBaseUrl();