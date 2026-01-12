import api from './api';
import { ApiResponse, Link, CreateLinkInput, UpdateLinkInput, PaginatedResponse } from '../types';

export const linkService = {
  async createLink(input: CreateLinkInput): Promise<Link> {
    const response = await api.post<ApiResponse<Link>>('/links', input);
    return response.data.data!;
  },

  async getLinks(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Link>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Link>>>('/links', {
      params: { page, limit },
    });
    return response.data.data!;
  },

  async getLink(id: number): Promise<Link> {
    const response = await api.get<ApiResponse<Link>>(`/links/${id}`);
    return response.data.data!;
  },

  async updateLink(id: number, input: UpdateLinkInput): Promise<Link> {
    const response = await api.put<ApiResponse<Link>>(`/links/${id}`, input);
    return response.data.data!;
  },

  async deleteLink(id: number): Promise<void> {
    await api.delete(`/links/${id}`);
  },

  async getQRCode(id: number, size: 'small' | 'medium' | 'large' = 'medium'): Promise<string> {
    const response = await api.get<ApiResponse<{ dataUrl: string }>>(`/links/${id}/qrcode`, {
      params: { size, format: 'dataurl' },
    });
    return response.data.data!.dataUrl;
  },
};
