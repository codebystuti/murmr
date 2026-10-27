import { useQuery, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '@/lib/api';
import type { Post } from '@/types';

export function usePosts(boardId?: string) {
  return useQuery({
    queryKey: ['posts', boardId ?? 'all'],
    queryFn: () => postsApi.list(boardId),
    staleTime: 30_000,
  });
}

export function usePost(id: string) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: ['post', id],
    queryFn: () => postsApi.get(id),
    staleTime: 30_000,
    enabled: !!id,
    // Render instantly from the list the user just clicked in; refetches once that list data is stale.
    initialData: () => qc.getQueryData<Post[]>(['posts', 'all'])?.find((p) => p.id === id),
    initialDataUpdatedAt: () => qc.getQueryState(['posts', 'all'])?.dataUpdatedAt,
  });
}
