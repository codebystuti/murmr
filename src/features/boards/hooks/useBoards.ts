import { useQuery } from '@tanstack/react-query';
import { boardsApi } from '@/lib/api';

export function useBoards() {
  return useQuery({
    queryKey: ['boards'],
    queryFn: boardsApi.list,
    staleTime: Infinity,
  });
}
