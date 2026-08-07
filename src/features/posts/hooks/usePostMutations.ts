import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { postsApi } from '@/lib/api';
import type { Post } from '@/types';

export function useToggleUpvote() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, userId }: { postId: string; userId: string }) =>
      postsApi.toggleUpvote(postId, userId),

    onMutate: async ({ postId, userId }) => {
      await qc.cancelQueries({ queryKey: ['posts'] });
      await qc.cancelQueries({ queryKey: ['post', postId] });

      // Snapshot all post-list caches
      const snapshots: Array<{ queryKey: readonly unknown[]; data: unknown }> = [];
      qc.getQueriesData<Post[]>({ queryKey: ['posts'] }).forEach(([key, data]) => {
        snapshots.push({ queryKey: key, data });
        if (!data) return;
        qc.setQueryData(
          key,
          data.map((p) =>
            p.id !== postId
              ? p
              : {
                  ...p,
                  upvotes: p.upvotedBy.includes(userId) ? p.upvotes - 1 : p.upvotes + 1,
                  upvotedBy: p.upvotedBy.includes(userId)
                    ? p.upvotedBy.filter((id) => id !== userId)
                    : [...p.upvotedBy, userId],
                },
          ),
        );
      });

      // Snapshot single-post cache
      const previousPost = qc.getQueryData<Post>(['post', postId]);
      if (previousPost) {
        qc.setQueryData(['post', postId], {
          ...previousPost,
          upvotes: previousPost.upvotedBy.includes(userId)
            ? previousPost.upvotes - 1
            : previousPost.upvotes + 1,
          upvotedBy: previousPost.upvotedBy.includes(userId)
            ? previousPost.upvotedBy.filter((id) => id !== userId)
            : [...previousPost.upvotedBy, userId],
        });
      }

      return { snapshots, previousPost };
    },

    onError: (_err, { postId }, context) => {
      context?.snapshots.forEach(({ queryKey, data }) => {
        qc.setQueryData(queryKey, data);
      });
      if (context?.previousPost) {
        qc.setQueryData(['post', postId], context.previousPost);
      }
    },

    onSettled: (_data, _err, { postId }) => {
      qc.invalidateQueries({ queryKey: ['posts'] });
      qc.invalidateQueries({ queryKey: ['post', postId] });
    },
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: () => toast.error('Failed to submit post.'),
  });
}

export function useUpdatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
      title?: string;
      body?: string;
      tags?: string[];
    }) => postsApi.update(id, data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ['posts'] });
      qc.setQueryData(['post', updated.id], updated);
      toast.success('Post updated.');
    },
    onError: () => toast.error('Failed to update post.'),
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => postsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post deleted.');
    },
    onError: () => toast.error('Failed to delete post.'),
  });
}

export function useUpdateStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Post['status'] }) =>
      postsApi.updateStatus(id, status),

    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ['posts'] });
      await qc.cancelQueries({ queryKey: ['post', id] });
      const previous = qc.getQueryData<Post>(['post', id]);
      if (previous) {
        qc.setQueryData(['post', id], { ...previous, status });
      }
      qc.getQueriesData<Post[]>({ queryKey: ['posts'] }).forEach(([key, data]) => {
        if (!data) return;
        qc.setQueryData(
          key,
          data.map((p) => (p.id !== id ? p : { ...p, status })),
        );
      });
      return { previous };
    },

    onError: (_err, { id }, context) => {
      if (context?.previous) qc.setQueryData(['post', id], context.previous);
      qc.invalidateQueries({ queryKey: ['posts'] });
    },

    onSettled: (_data, _err, { id }) => {
      qc.invalidateQueries({ queryKey: ['posts'] });
      qc.invalidateQueries({ queryKey: ['post', id] });
    },
  });
}
