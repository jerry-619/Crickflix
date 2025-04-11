import axios from 'axios';
import https from 'https';

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance with SSL verification disabled for IP addresses
const api = axios.create({
  baseURL: API_URL,
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
});

// Add request interceptor
api.interceptors.request.use((config) => {
  // Log the request in development
  if (import.meta.env.DEV) {
    console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`);
  }
  return config;
});

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Log errors in development
    if (import.meta.env.DEV) {
      console.error('[API Error]', error);
    }
    return Promise.reject(error);
  }
);

export default api; 