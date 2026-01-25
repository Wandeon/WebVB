import { db } from '../client';

import type { Prisma } from '@prisma/client';

export interface CreateAuditLogInput {
  userId?: string | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  changes?: Prisma.InputJsonValue;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export const auditLogsRepository = {
  async create(data: CreateAuditLogInput) {
    const createData: Prisma.AuditLogUncheckedCreateInput = {
      userId: data.userId ?? null,
      action: data.action,
      entityType: data.entityType ?? null,
      entityId: data.entityId ?? null,
      ipAddress: data.ipAddress ?? null,
      userAgent: data.userAgent ?? null,
      ...(data.changes !== undefined ? { changes: data.changes } : {}),
    };

    return db.auditLog.create({ data: createData });
  },
};
