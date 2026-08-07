import { useQuery } from '@tanstack/react-query';
import { postsApi } from '@/lib/api';

export function usePosts(boardId?: string) {
  return useQuery({
    queryKey: ['posts', boardId ?? 'all'],
    queryFn: () => postsApi.list(boardId),
    staleTime: 30_000,
  });
}

export function usePost(id: string) {
  return useQuery({
    queryKey: ['post', id],
    queryFn: () => postsApi.get(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
}
