import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import type { ApiResponse } from '../types';

export const useTags = () => {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<string[]>>('/tags');
      return data;
    },
    staleTime: 60000, // 1 minute
  });
};