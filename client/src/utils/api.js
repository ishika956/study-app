import axios from 'axios';

// Create a pre-configured axios instance
const api = axios.create({
  baseURL: 'https://study-app-1-dyv3.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to dynamically inject the bearer JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('study_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle authorization errors (e.g. expired tokens)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend returns 401 Unauthorized, clean state and redirect to login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('study_token');
      localStorage.removeItem('study_user');
      // If we are not already on register or login page, redirect
      if (
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/register'
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
