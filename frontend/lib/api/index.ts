import axios from 'axios';
import type { ApiResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const { response } = error;

    if (response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(error);
  },
);

// Generic API functions
export const apiRequest = {
  get: async <T>(url: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> => {
    const response = await api.get(url, { params });
    return response.data;
  },

  post: async <T>(url: string, data?: unknown): Promise<ApiResponse<T>> => {
    const response = await api.post(url, data);
    return response.data;
  },

  put: async <T>(url: string, data?: unknown): Promise<ApiResponse<T>> => {
    const response = await api.put(url, data);
    return response.data;
  },

  patch: async <T>(url: string, data?: unknown): Promise<ApiResponse<T>> => {
    const response = await api.patch(url, data);
    return response.data;
  },

  delete: async <T>(url: string): Promise<ApiResponse<T>> => {
    const response = await api.delete(url);
    return response.data;
  },
};

// Auth API functions
export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data; // Backend returns data directly
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  refreshToken: async () => {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  register: async (data: {
    company: {
      name: string;
      email: string;
      phone: string;
      address: string;
    };
    user: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
    };
  }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },

  verifyEmail: async (token: string) => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },

  updateProfile: async (data: Partial<{ firstName: string; lastName: string; phone: string }>) => {
    const response = await api.patch('/auth/profile', data);
    return response.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const response = await api.patch('/auth/change-password', data);
    return response.data;
  },

  getSessions: async () => {
    const response = await api.get('/auth/sessions');
    return response.data;
  },

  revokeSession: async (sessionId: string) => {
    const response = await api.delete(`/auth/sessions/${sessionId}`);
    return response.data;
  },

  revokeAllSessions: async () => {
    const response = await api.delete('/auth/sessions');
    return response.data;
  },
};

// Companies API
export const companiesApi = {
  getAll: (params?: Record<string, unknown>) => apiRequest.get('/companies', params),
  getById: (id: string) => apiRequest.get(`/companies/${id}`),
  create: (data: unknown) => apiRequest.post('/companies', data),
  update: (id: string, data: unknown) => apiRequest.put(`/companies/${id}`, data),
  delete: (id: string) => apiRequest.delete(`/companies/${id}`),
};

// Users API
export const usersApi = {
  getAll: (params?: Record<string, unknown>) => apiRequest.get('/users', params),
  getById: (id: string) => apiRequest.get(`/users/${id}`),
  create: (data: unknown) => apiRequest.post('/users', data),
  update: (id: string, data: unknown) => apiRequest.put(`/users/${id}`, data),
  delete: (id: string) => apiRequest.delete(`/users/${id}`),
  assignRole: (userId: string, roleId: string) =>
    apiRequest.post(`/users/${userId}/roles`, { roleId }),
  removeRole: (userId: string, roleId: string) =>
    apiRequest.delete(`/users/${userId}/roles/${roleId}`),
};

// Products API
export const productsApi = {
  getAll: (params?: Record<string, unknown>) => apiRequest.get('/products', params),
  getById: (id: string) => apiRequest.get(`/products/${id}`),
  create: (data: unknown) => apiRequest.post('/products', data),
  update: (id: string, data: unknown) => apiRequest.put(`/products/${id}`, data),
  delete: (id: string) => apiRequest.delete(`/products/${id}`),
  getInventory: (id: string) => apiRequest.get(`/products/${id}/inventory`),
};

// Inventory API
export const inventoryApi = {
  getAll: (params?: Record<string, unknown>) => apiRequest.get('/inventory', params),
  getByWarehouse: (warehouseId: string, params?: Record<string, unknown>) =>
    apiRequest.get(`/inventory/warehouse/${warehouseId}`, params),
  getByProduct: (productId: string, params?: Record<string, unknown>) =>
    apiRequest.get(`/inventory/product/${productId}`, params),
  updateStock: (data: {
    productId: string;
    warehouseId: string;
    quantity: number;
    type: string;
    notes?: string;
  }) => apiRequest.post('/inventory/movements', data),
  getLowStock: (params?: Record<string, unknown>) =>
    apiRequest.get('/inventory/low-stock', params),
  getExpiring: (params?: Record<string, unknown>) =>
    apiRequest.get('/inventory/expiring', params),
};

// Warehouses API
export const warehousesApi = {
  getAll: (params?: Record<string, unknown>) => apiRequest.get('/warehouses', params),
  getById: (id: string) => apiRequest.get(`/warehouses/${id}`),
  create: (data: unknown) => apiRequest.post('/warehouses', data),
  update: (id: string, data: unknown) => apiRequest.put(`/warehouses/${id}`, data),
  delete: (id: string) => apiRequest.delete(`/warehouses/${id}`),
  getInventory: (id: string, params?: Record<string, unknown>) =>
    apiRequest.get(`/warehouses/${id}/inventory`, params),
};

// Purchase Orders API
export const purchaseOrdersApi = {
  getAll: (params?: Record<string, unknown>) => apiRequest.get('/purchase-orders', params),
  getById: (id: string) => apiRequest.get(`/purchase-orders/${id}`),
  create: (data: unknown) => apiRequest.post('/purchase-orders', data),
  update: (id: string, data: unknown) => apiRequest.put(`/purchase-orders/${id}`, data),
  delete: (id: string) => apiRequest.delete(`/purchase-orders/${id}`),
  approve: (id: string) => apiRequest.patch(`/purchase-orders/${id}/approve`),
  receive: (id: string, data: unknown) => apiRequest.patch(`/purchase-orders/${id}/receive`, data),
  cancel: (id: string) => apiRequest.patch(`/purchase-orders/${id}/cancel`),
};

// Reports API
export const reportsApi = {
  getInventoryReport: (params?: Record<string, unknown>) =>
    apiRequest.get('/reports/inventory', params),
  getStockMovements: (params?: Record<string, unknown>) =>
    apiRequest.get('/reports/stock-movements', params),
  getLowStockAlert: (params?: Record<string, unknown>) =>
    apiRequest.get('/reports/low-stock', params),
  getExpiringProducts: (params?: Record<string, unknown>) =>
    apiRequest.get('/reports/expiring', params),
  getSalesReport: (params?: Record<string, unknown>) =>
    apiRequest.get('/reports/sales', params),
  getPurchaseReport: (params?: Record<string, unknown>) =>
    apiRequest.get('/reports/purchases', params),
};