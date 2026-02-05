import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analyticsService';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => analyticsService.getDashboard(),
  });
}

export function useTopLinks(limit: number = 10) {
  return useQuery({
    queryKey: ['topLinks', limit],
    queryFn: () => analyticsService.getTopLinks(limit),
  });
}

export function useLinkStats(linkId: number, days: number = 30) {
  return useQuery({
    queryKey: ['linkStats', linkId, days],
    queryFn: () => analyticsService.getLinkStats(linkId, days),
    enabled: !!linkId,
  });
}

export function useLinkClicks(linkId: number, page: number = 1, limit: number = 50) {
  return useQuery({
    queryKey: ['linkClicks', linkId, page, limit],
    queryFn: () => analyticsService.getLinkClicks(linkId, page, limit),
    enabled: !!linkId,
  });
}

export function useGeoDistribution(linkId: number) {
  return useQuery({
    queryKey: ['geoDistribution', linkId],
    queryFn: () => analyticsService.getGeoDistribution(linkId),
    enabled: !!linkId,
  });
}
