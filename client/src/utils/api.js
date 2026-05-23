import axios from 'axios';

const resolveBaseURL = () => {
  const configured = import.meta.env.VITE_API_URL?.replace(/\/$/, '');

  if (configured) {
    return `${configured}/api`;
  }

  // Local dev: Vite proxies /api to localhost:5000
  if (import.meta.env.DEV) {
    return '/api';
  }

  // Production fallback when VITE_API_URL is not set on Vercel
  return 'https://study-app-1-dyv3.onrender.com/api';
};

const api = axios.create({
  baseURL: resolveBaseURL(),
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
