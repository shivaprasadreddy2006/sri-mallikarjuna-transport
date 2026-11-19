import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const invoiceApi = {
  getDashboardStats: async () => {
    const res = await api.get('/invoices/dashboard-stats');
    return res.data;
  },

  getAll: async (params) => {
    const res = await api.get('/invoices', { params });
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/invoices/${id}`);
    return res.data;
  },

  getNextNumber: async () => {
    const res = await api.get('/invoices/next-number');
    return res.data;
  },

  create: async (data) => {
    const res = await api.post('/invoices', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/invoices/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/invoices/${id}`);
    return res.data;
  },

  getPdfUrl: (id) => `${API_BASE}/invoices/${id}/pdf`,
  getPreviewUrl: (id) => `${API_BASE}/invoices/${id}/preview`,
};

export const settingsApi = {
  get: async () => {
    const res = await api.get('/settings');
    return res.data;
  },
  update: async (data) => {
    const res = await api.put('/settings', data);
    return res.data;
  },
};

export const aiApi = {
  interpretVoice: async (transcript) => {
    const res = await api.post('/ai/interpret', { transcript });
    return res.data;
  },
};

export default api;
