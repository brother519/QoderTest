import api from './api';
import { ApiResponse, LinkStats, DashboardStats, Link, PaginatedResponse } from '../types';

interface Click {
  id: number;
  clicked_at: string;
  ip_address: string;
  country: string;
  city: string;
  browser: string;
  os: string;
  device_type: string;
  referer: string;
}

interface GeoDistribution {
  by_country: { country: string; count: number }[];
  by_city: { city: string; country: string; count: number; lat: number; lng: number }[];
}

export const analyticsService = {
  async getDashboard(): Promise<DashboardStats> {
    const response = await api.get<ApiResponse<DashboardStats>>('/analytics/dashboard');
    return response.data.data!;
  },

  async getTopLinks(limit: number = 10): Promise<Link[]> {
    const response = await api.get<ApiResponse<Link[]>>('/analytics/top-links', {
      params: { limit },
    });
    return response.data.data!;
  },

  async getLinkStats(linkId: number, days: number = 30): Promise<LinkStats> {
    const response = await api.get<ApiResponse<LinkStats>>(`/analytics/links/${linkId}/stats`, {
      params: { days },
    });
    return response.data.data!;
  },

  async getLinkClicks(
    linkId: number,
    page: number = 1,
    limit: number = 50
  ): Promise<PaginatedResponse<Click>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Click>>>(
      `/analytics/links/${linkId}/clicks`,
      { params: { page, limit } }
    );
    return response.data.data!;
  },

  async getGeoDistribution(linkId: number): Promise<GeoDistribution> {
    const response = await api.get<ApiResponse<GeoDistribution>>(
      `/analytics/links/${linkId}/geo`
    );
    return response.data.data!;
  },
};
