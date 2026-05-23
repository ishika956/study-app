import axios from 'axios';

const PRODUCTION_API = 'https://study-app-1-dyv3.onrender.com';

const resolveBaseURL = () => {
  const configured = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');

  if (configured) {
    return configured.endsWith('/api') ? configured : `${configured}/api`;
  }

  if (import.meta.env.DEV) {
    return '/api';
  }

  return `${PRODUCTION_API}/api`;
};

export const getApiErrorMessage = (error, fallback) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.code === 'ECONNABORTED') {
    return 'Server is waking up (Render free tier). Wait a minute and try again.';
  }

  if (!error.response) {
    return 'Cannot reach the server. Check your internet or try again in a minute.';
  }

  return fallback;
};

const api = axios.create({
  baseURL: resolveBaseURL(),
  timeout: 120000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('study_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('study_token');
      localStorage.removeItem('study_user');

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
