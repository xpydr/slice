import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getLicenses,
  createLicense,
  getLicenseUsage,
  type License,
  type LicenseUsage,
  type ApiResponse,
} from '@/lib/api';
import { queryKeys } from '@/lib/api-cache';

export function useLicenses(planId?: string) {
  return useQuery<ApiResponse<License[]>>({
    queryKey: queryKeys.licenses(planId),
    queryFn: () => getLicenses(planId),
    select: (response) => response,
  });
}

export function useLicenseUsage(id: string) {
  return useQuery<ApiResponse<LicenseUsage>>({
    queryKey: queryKeys.licenseUsage(id),
    queryFn: () => getLicenseUsage(id),
    enabled: !!id,
    select: (response) => response,
  });
}

export function useCreateLicense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, expiresInDays }: { planId: string; expiresInDays?: number }) =>
      createLicense(planId, expiresInDays),
    onSuccess: (_, variables) => {
      // Invalidate all licenses queries and plan-specific licenses
      queryClient.invalidateQueries({ queryKey: queryKeys.licenses() });
      queryClient.invalidateQueries({ queryKey: queryKeys.licenses(variables.planId) });
    },
  });
}

