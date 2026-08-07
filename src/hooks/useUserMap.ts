import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import type { User } from '@/types';

export function useUserMap(): Map<string, User> {
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.list,
    staleTime: 5 * 60 * 1000,
  });
  return useMemo(
    () => new Map<string, User>(users.map((u) => [u.id, u])),
    [users],
  );
}
