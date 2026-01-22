import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApiKeys, createApiKey, type TenantApiKey, type ApiResponse } from '@/lib/api';
import { queryKeys } from '@/lib/api-cache';

export function useApiKeys() {
  return useQuery<ApiResponse<TenantApiKey[]>>({
    queryKey: queryKeys.apiKeys,
    queryFn: () => getApiKeys(),
    select: (response) => response, // Return full response for error handling
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, expiresInDays }: { name?: string; expiresInDays?: number }) =>
      createApiKey(name, expiresInDays),
    onSuccess: () => {
      // Invalidate API keys query to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys });
    },
  });
}

