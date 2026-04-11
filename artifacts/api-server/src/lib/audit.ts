import { db } from "@workspace/db";
import { auditLogsTable } from "@workspace/db";
import { logger } from "./logger";

export async function logAudit(opts: {
  adminId?: number;
  adminName?: string;
  action: string;
  entityType: string;
  entityId?: string;
  previousValue?: unknown;
  newValue?: unknown;
}) {
  try {
    await db.insert(auditLogsTable).values({
      adminId: opts.adminId ?? null,
      adminName: opts.adminName ?? null,
      action: opts.action,
      entityType: opts.entityType,
      entityId: opts.entityId ?? null,
      previousValue: opts.previousValue ? JSON.stringify(opts.previousValue) : null,
      newValue: opts.newValue ? JSON.stringify(opts.newValue) : null,
    });
  } catch (err) {
    logger.error({ err }, "Failed to write audit log");
  }
}
