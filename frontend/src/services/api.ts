import axios from 'axios';
import type {
  UrlResponse,
  CreateUrlRequest,
  UpdateUrlRequest,
  PaginatedResponse,
  AnalyticsResponse,
  DashboardAnalyticsResponse,
  ApiKeyResponse,
  CreateApiKeyRequest,
} from '../types';

const API_BASE = '/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

// URL Service
export const urlService = {
  create: async (data: CreateUrlRequest): Promise<UrlResponse> => {
    const response = await api.post<UrlResponse>('/urls', data);
    return response.data;
  },

  list: async (
    page = 1,
    limit = 20,
    search?: string
  ): Promise<PaginatedResponse<UrlResponse>> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set('search', search);
    const response = await api.get<PaginatedResponse<UrlResponse>>(`/urls?${params}`);
    return response.data;
  },

  get: async (id: string): Promise<UrlResponse> => {
    const response = await api.get<UrlResponse>(`/urls/${id}`);
    return response.data;
  },

  update: async (id: string, data: UpdateUrlRequest): Promise<UrlResponse> => {
    const response = await api.patch<UrlResponse>(`/urls/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/urls/${id}`);
  },

  getAnalytics: async (
    id: string,
    startDate?: string,
    endDate?: string
  ): Promise<AnalyticsResponse> => {
    const params = new URLSearchParams();
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);
    const response = await api.get<AnalyticsResponse>(`/urls/${id}/analytics?${params}`);
    return response.data;
  },

  getQrCode: (id: string, size = 300, format: 'png' | 'svg' = 'png'): string => {
    const token = api.defaults.headers.common['Authorization'];
    return `${API_BASE}/urls/${id}/qr?size=${size}&format=${format}`;
  },
};

// Analytics Service
export const analyticsService = {
  getDashboard: async (
    startDate?: string,
    endDate?: string
  ): Promise<DashboardAnalyticsResponse> => {
    const params = new URLSearchParams();
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);
    const response = await api.get<DashboardAnalyticsResponse>(`/analytics/dashboard?${params}`);
    return response.data;
  },
};

// API Key Service
export const apiKeyService = {
  create: async (data: CreateApiKeyRequest): Promise<ApiKeyResponse> => {
    const response = await api.post<ApiKeyResponse>('/api-keys', data);
    return response.data;
  },

  list: async (): Promise<ApiKeyResponse[]> => {
    const response = await api.get<ApiKeyResponse[]>('/api-keys');
    return response.data;
  },

  revoke: async (id: string): Promise<void> => {
    await api.delete(`/api-keys/${id}`);
  },
};

export default api;
