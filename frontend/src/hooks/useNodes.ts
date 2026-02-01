import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import type { ApiResponse, Node } from '../types';

export const useNodes = () => {
  return useQuery({
    queryKey: ['nodes'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Node[]>>('/nodes');
      return data;
    },
    staleTime: 60000, // 1 minute
  });
};