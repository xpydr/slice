import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getLicenses,
  createLicense,
  getLicenseUsage,
  assignLicense,
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

export function useAssignLicense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ licenseId, userId, metadata }: { licenseId: string; userId: string; metadata?: Record<string, any> }) =>
      assignLicense(licenseId, userId, metadata),
    onSuccess: (_, variables) => {
      // Invalidate license usage to show updated activations
      queryClient.invalidateQueries({ queryKey: queryKeys.licenseUsage(variables.licenseId) });
      // Also invalidate licenses list in case it shows assignment info
      queryClient.invalidateQueries({ queryKey: queryKeys.licenses() });
    },
  });
}

