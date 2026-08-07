import { useQuery } from '@tanstack/react-query';
import { changelogApi } from '@/lib/api';

export function useChangelog() {
  return useQuery({
    queryKey: ['changelog'],
    queryFn: changelogApi.list,
    staleTime: 5 * 60 * 1000,
  });
}
