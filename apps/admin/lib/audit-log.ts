import { auditLogsRepository } from '@repo/database';

import { getAuditMetadata } from '@/lib/api-auth';

import type { AuthContext } from '@/lib/api-auth';
import type { AuditAction, AuditEntityType } from '@repo/shared';

interface AuditLogInput {
  request: Request;
  context: AuthContext;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string | null;
  changes?: Record<string, unknown> | null;
}

export async function createAuditLog({
  request,
  context,
  action,
  entityType,
  entityId,
  changes,
}: AuditLogInput) {
  const { ipAddress, userAgent } = getAuditMetadata(request);
  const serializedChanges = changes ? JSON.stringify(changes) : undefined;

  await auditLogsRepository.create({
    userId: context.userId,
    action,
    entityType,
    entityId: entityId ?? null,
    ...(serializedChanges !== undefined ? { changes: serializedChanges } : {}),
    ipAddress: ipAddress ?? null,
    userAgent: userAgent ?? null,
  });
}
