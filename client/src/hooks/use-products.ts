import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProducts, createProduct, getProduct, type Product, type ApiResponse } from '@/lib/api';
import { queryKeys } from '@/lib/api-cache';

export function useProducts() {
  return useQuery<ApiResponse<Product[]>>({
    queryKey: queryKeys.products,
    queryFn: () => getProducts(),
    select: (response) => response, // Return full response for error handling
  });
}

export function useProduct(id: string) {
  return useQuery<ApiResponse<Product>>({
    queryKey: queryKeys.product(id),
    queryFn: () => getProduct(id),
    enabled: !!id,
    select: (response) => response,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, description }: { name: string; description?: string }) =>
      createProduct(name, description),
    onSuccess: () => {
      // Invalidate products query to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
    },
  });
}

