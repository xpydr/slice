import { useQuery } from '@tanstack/react-query';
import { getUsers, type LaaSUser, type ApiResponse } from '@/lib/api';
import { queryKeys } from '@/lib/api-cache';

export function useUsers(externalId?: string) {
  return useQuery<ApiResponse<LaaSUser[]>>({
    queryKey: queryKeys.users(externalId),
    queryFn: () => getUsers(externalId),
    select: (response) => response,
  });
}

