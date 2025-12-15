import { useQuery } from '@tanstack/react-query';
import { getAuditLogs, type AuditLog, type ApiResponse } from '@/lib/api';
import { queryKeys } from '@/lib/api-cache';

export function useAuditLogs(entityType?: string, entityId?: string) {
  return useQuery<ApiResponse<AuditLog[]>>({
    queryKey: queryKeys.auditLogs(entityType, entityId),
    queryFn: () => getAuditLogs(entityType, entityId),
    select: (response) => response,
  });
}

