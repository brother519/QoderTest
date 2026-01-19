import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { linkService } from '../services/linkService';
import { CreateLinkInput, UpdateLinkInput } from '../types';

export function useLinks(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ['links', page, limit],
    queryFn: () => linkService.getLinks(page, limit),
  });
}

export function useLink(id: number) {
  return useQuery({
    queryKey: ['link', id],
    queryFn: () => linkService.getLink(id),
    enabled: !!id,
  });
}

export function useCreateLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateLinkInput) => linkService.createLink(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateLinkInput }) =>
      linkService.updateLink(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      queryClient.invalidateQueries({ queryKey: ['link', id] });
    },
  });
}

export function useDeleteLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => linkService.deleteLink(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useQRCode(id: number, size: 'small' | 'medium' | 'large' = 'medium') {
  return useQuery({
    queryKey: ['qrcode', id, size],
    queryFn: () => linkService.getQRCode(id, size),
    enabled: !!id,
  });
}
