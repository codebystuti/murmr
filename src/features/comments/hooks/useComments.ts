import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { commentsApi } from '@/lib/api';
import type { Comment } from '@/types';

export function useComments(postId: string) {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: () => commentsApi.listByPost(postId),
    staleTime: 30_000,
    enabled: !!postId,
  });
}

export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: commentsApi.create,

    onMutate: async (newComment) => {
      await qc.cancelQueries({ queryKey: ['comments', newComment.postId] });
      const previous = qc.getQueryData<Comment[]>(['comments', newComment.postId]);
      qc.setQueryData<Comment[]>(['comments', newComment.postId], (old = []) => [
        ...old,
        {
          ...newComment,
          id: `temp-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
      return { previous };
    },

    onError: (_err, newComment, context) => {
      if (context?.previous) {
        qc.setQueryData(['comments', newComment.postId], context.previous);
      }
      toast.error("Couldn't post your comment. Try again.");
    },

    onSettled: (_data, _err, newComment) => {
      qc.invalidateQueries({ queryKey: ['comments', newComment.postId] });
      qc.invalidateQueries({ queryKey: ['post', newComment.postId] });
      qc.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useUpdateComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string; postId: string }) =>
      commentsApi.update(id, body),

    onMutate: async ({ id, body, postId }) => {
      await qc.cancelQueries({ queryKey: ['comments', postId] });
      const previous = qc.getQueryData<Comment[]>(['comments', postId]);
      if (previous) {
        qc.setQueryData(
          ['comments', postId],
          previous.map((c) =>
            c.id !== id ? c : { ...c, body, updatedAt: new Date().toISOString() },
          ),
        );
      }
      return { previous };
    },

    onError: (_err, { postId }, context) => {
      if (context?.previous) qc.setQueryData(['comments', postId], context.previous);
    },

    onSettled: (_data, _err, { postId }) => {
      qc.invalidateQueries({ queryKey: ['comments', postId] });
      qc.invalidateQueries({ queryKey: ['post', postId] });
      qc.invalidateQueries({ queryKey: ['comments', 'author'] });
    },
  });
}

export function useDeleteComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, postId }: { id: string; postId: string }) =>
      commentsApi.remove(id, postId),

    onMutate: async ({ id, postId }) => {
      await qc.cancelQueries({ queryKey: ['comments', postId] });
      const previous = qc.getQueryData<Comment[]>(['comments', postId]);
      if (previous) {
        qc.setQueryData(
          ['comments', postId],
          previous.filter((c) => c.id !== id),
        );
      }
      return { previous };
    },

    onError: (_err, { postId }, context) => {
      if (context?.previous) qc.setQueryData(['comments', postId], context.previous);
    },

    onSettled: (_data, _err, { postId }) => {
      qc.invalidateQueries({ queryKey: ['comments', postId] });
      qc.invalidateQueries({ queryKey: ['post', postId] });
      qc.invalidateQueries({ queryKey: ['posts'] });
      qc.invalidateQueries({ queryKey: ['comments', 'author'] });
    },
  });
}
