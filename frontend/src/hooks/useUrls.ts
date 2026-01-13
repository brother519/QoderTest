import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { urlService } from '../services/api';
import type { CreateUrlRequest, UpdateUrlRequest } from '../types';

export function useUrls(page = 1, limit = 20, search?: string) {
  return useQuery({
    queryKey: ['urls', page, limit, search],
    queryFn: () => urlService.list(page, limit, search),
  });
}

export function useUrl(id: string) {
  return useQuery({
    queryKey: ['url', id],
    queryFn: () => urlService.get(id),
    enabled: !!id,
  });
}

export function useUrlAnalytics(id: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['url-analytics', id, startDate, endDate],
    queryFn: () => urlService.getAnalytics(id, startDate, endDate),
    enabled: !!id,
  });
}

export function useCreateUrl() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateUrlRequest) => urlService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['urls'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateUrl() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUrlRequest }) =>
      urlService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['urls'] });
      queryClient.invalidateQueries({ queryKey: ['url', id] });
    },
  });
}

export function useDeleteUrl() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => urlService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['urls'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
