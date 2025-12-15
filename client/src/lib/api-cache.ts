import { QueryClient } from '@tanstack/react-query';

// Create a query client with default options
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes (matches server cache)
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false, // Disable refetch on window focus for dashboard
      refetchOnReconnect: true, // Refetch on reconnect
      retry: 1, // Retry failed requests once
    },
    mutations: {
      retry: 1,
    },
  },
});

// Query keys for consistent cache invalidation
export const queryKeys = {
  products: ['products'] as const,
  product: (id: string) => ['products', id] as const,
  plans: (productId?: string) => productId ? ['plans', productId] as const : ['plans'] as const,
  plan: (id: string) => ['plans', id] as const,
  licenses: (planId?: string) => planId ? ['licenses', planId] as const : ['licenses'] as const,
  license: (id: string) => ['licenses', id] as const,
  licenseUsage: (id: string) => ['licenses', id, 'usage'] as const,
  users: (externalId?: string) => externalId ? ['users', externalId] as const : ['users'] as const,
  auditLogs: (entityType?: string, entityId?: string) => {
    if (entityType && entityId) return ['audit-logs', entityType, entityId] as const;
    if (entityType) return ['audit-logs', entityType] as const;
    return ['audit-logs'] as const;
  },
};

