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
