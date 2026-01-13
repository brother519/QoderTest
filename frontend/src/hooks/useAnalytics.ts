import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/api';

export function useDashboardAnalytics(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['dashboard', startDate, endDate],
    queryFn: () => analyticsService.getDashboard(startDate, endDate),
  });
}
