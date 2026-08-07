import { useQuery } from '@tanstack/react-query';
import { commentsApi } from '@/lib/api';

export function useCommentsByAuthor(authorId: string) {
  return useQuery({
    queryKey: ['comments', 'author', authorId],
    queryFn: () => commentsApi.listByAuthor(authorId),
    enabled: !!authorId,
    staleTime: 30_000,
  });
}
