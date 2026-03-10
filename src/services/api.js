/**
 * API Service for Cliente Management
 * Following DRY and KISS principles - centralized API logic
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('[API] Response error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('[API] No response received:', error.message);
    } else {
      console.error('[API] Error:', error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * Cliente API Service
 * Encapsulates all API calls for cliente management
 */
export const clienteAPI = {
  /**
   * Get all clients
   */
  getAll: async () => {
    const response = await apiClient.get('/api/clientes/');
    return response.data;
  },

  /**
   * Get a single client by ID
   */
  getById: async (id) => {
    const response = await apiClient.get(`/api/clientes/${id}/`);
    return response.data;
  },

  /**
   * Create a new client
   */
  create: async (clienteData) => {
    const response = await apiClient.post('/api/clientes/', clienteData);
    return response.data;
  },

  /**
   * Update an existing client
   */
  update: async (id, clienteData) => {
    const response = await apiClient.put(`/api/clientes/${id}/`, clienteData);
    return response.data;
  },

  /**
   * Delete a client
   */
  delete: async (id) => {
    const response = await apiClient.delete(`/api/clientes/${id}/`);
    return response.data;
  },

  /**
   * Search clients
   */
  search: async (query) => {
    const response = await apiClient.get(`/api/clientes/search/?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  /**
   * Get client count
   */
  getCount: async () => {
    const response = await apiClient.get('/api/clientes/count/');
    return response.data;
  },
};

export default apiClient;
