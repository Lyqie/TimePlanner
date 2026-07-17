import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export function useDashboard(date?: string) {
  return useQuery({ queryKey: ['dashboard', date], queryFn: () => api.dashboard(date) });
}

export function useReports(params?: Record<string, string>) {
  return useQuery({ queryKey: ['reports', params], queryFn: () => api.reports(params) });
}
