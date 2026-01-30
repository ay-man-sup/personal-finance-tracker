// Axios instance with JWT auth and error handling

import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Attach JWT to outgoing requests
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

// Handle auth errors and redirect to login when token expires
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      
      // Avoid redirect loop on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    if (!error.response) {
      error.message = 'Network error. Please check your connection.';
    }
    
    return Promise.reject(error);
  }
);

// Convenience wrappers

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePassword: (data) => api.put('/auth/password', data),
};

export const transactionAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  getOne: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  getSummary: (period) => api.get('/transactions/summary', { params: { period } }),
  exportCSV: (params) => api.get('/transactions/export/csv', {
    params,
    responseType: 'blob',
  }),
};

export const budgetAPI = {
  getAll: () => api.get('/budgets'),
  getWithStatus: () => api.get('/budgets/status/all'),
  getAlerts: () => api.get('/budgets/alerts'),
  create: (data) => api.post('/budgets', data),
  update: (category, data) => api.put(`/budgets/${category}`, data),
  delete: (category) => api.delete(`/budgets/${category}`),
};

export default api;
