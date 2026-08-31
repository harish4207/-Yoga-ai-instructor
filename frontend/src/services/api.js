/**
 * api.js
 * Axios client instance with automatic JWT Bearer token attachment and non-destructive 401 handling.
 */

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

// Attach JWT token to every request automatically if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('yc_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401 Unauthorized, clear expired token without destructive page reloads
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      // Only clear token if not an intentional login/register credential check
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        localStorage.removeItem('yc_token');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
