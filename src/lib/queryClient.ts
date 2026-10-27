import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 1,
    },
  },
});

/** Mutation key of the upvote toggle, so background refreshes can tell when a vote is in flight. */
export const TOGGLE_UPVOTE_KEY = ['toggleUpvote'] as const;
