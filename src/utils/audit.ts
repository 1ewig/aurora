/**
 * Aurora — src/utils/audit.ts
 *
 * Admin action audit logger. Inserts a row into the audit_logs table
 * tracking who performed what action on which target resource.
 */

import { pool } from '@/utils/db';

export async function logAudit(opts: {
  adminId: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, any>;
}) {
  await pool.query(
    `INSERT INTO audit_logs (admin_id, admin_email, action, target_type, target_id, metadata)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [opts.adminId, opts.adminEmail, opts.action, opts.targetType, opts.targetId, opts.metadata ? JSON.stringify(opts.metadata) : null]
  );
}
