import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect to login for auth/me endpoint (used for token verification)
    // Also don't redirect for GET requests that might be public
    // And don't redirect for login/register/2fa endpoints
    if (error.response?.status === 401 && 
        !error.config.url.includes('/auth/me') && 
        !error.config.url.includes('/auth/login') &&
        !error.config.url.includes('/auth/register') &&
        !error.config.url.includes('/auth/verify-2fa') &&
        error.config.method !== 'get') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
