import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import type { ApiResponse, VM, VMFilters } from '../types';

export const useVMs = (filters: VMFilters) => {
  return useQuery({
    queryKey: ['vms', filters],
    queryFn: async () => {
      const params: Record<string, string> = {};
      
      if (filters.node) params.node = filters.node;
      if (filters.status) params.status = filters.status;
      if (filters.tags && filters.tags.length > 0) {
        params.tags = filters.tags.join(',');
      }
      
      const { data } = await api.get<ApiResponse<VM[]>>('/vms', { params });
      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};