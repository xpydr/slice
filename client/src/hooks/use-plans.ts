import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPlans, createPlan, getPlan, type Plan, type ApiResponse } from '@/lib/api';
import { queryKeys } from '@/lib/api-cache';

export function usePlans(productId?: string) {
  return useQuery<ApiResponse<Plan[]>>({
    queryKey: queryKeys.plans(productId),
    queryFn: () => getPlans(productId),
    select: (response) => response,
  });
}

export function usePlan(id: string) {
  return useQuery<ApiResponse<Plan>>({
    queryKey: queryKeys.plan(id),
    queryFn: () => getPlan(id),
    enabled: !!id,
    select: (response) => response,
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      name,
      description,
      maxSeats,
      expiresInDays,
      features,
    }: {
      productId: string;
      name: string;
      description?: string;
      maxSeats?: number;
      expiresInDays?: number;
      features?: string[];
    }) => createPlan(productId, name, description, maxSeats, expiresInDays, features),
    onSuccess: (_, variables) => {
      // Invalidate all plans queries and product-specific plans
      queryClient.invalidateQueries({ queryKey: queryKeys.plans() });
      queryClient.invalidateQueries({ queryKey: queryKeys.plans(variables.productId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.products }); // Plans affect products view
    },
  });
}

