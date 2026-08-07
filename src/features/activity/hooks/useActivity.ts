import { useQuery } from '@tanstack/react-query';
import { activityApi } from '@/lib/api';

export function useActivity(limit = 60) {
  return useQuery({
    queryKey: ['activity', limit],
    queryFn: () => activityApi.list(limit),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}
