// Simple configuration - use environment variable directly
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";

// Debug logging
console.log('🔧 Frontend Config:');
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('Final API_BASE_URL:', API_BASE_URL);