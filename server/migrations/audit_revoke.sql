-- ─── Immutable Audit Trail — Append-Only Enforcement ─────────────────────────
--
-- This migration revokes DELETE and UPDATE privileges on the audit_logs table
-- from the PUBLIC role (which covers the application DB user).
--
-- After this runs, the application can only INSERT to audit_logs.
-- Records are immutable once written.
--
-- To inspect or purge audit logs in emergencies, a superuser or dedicated
-- audit_admin role with explicit GRANT is required.

REVOKE DELETE ON TABLE audit_logs FROM PUBLIC;
REVOKE UPDATE ON TABLE audit_logs FROM PUBLIC;

-- Optional: Confirm the effective privileges (for CI verification)
-- SELECT grantee, privilege_type, is_grantable
-- FROM information_schema.role_table_grants
-- WHERE table_name = 'audit_logs';
