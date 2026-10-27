import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import type { User } from '@/types';

const usersQuery = {
  queryKey: ['users'],
  queryFn: usersApi.list,
  staleTime: 5 * 60 * 1000,
};

export function useUserMap(): Map<string, User> {
  const { data: users = [] } = useQuery(usersQuery);
  return useMemo(
    () => new Map<string, User>(users.map((u) => [u.id, u])),
    [users],
  );
}

// Pages that render names wait on this so rows never flash "Someone" before the real name.
export function useUsersLoading(): boolean {
  return useQuery(usersQuery).isLoading;
}
