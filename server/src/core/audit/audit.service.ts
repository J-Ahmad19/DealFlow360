import { Request } from 'express';
import { db } from '../../db/client.js';
import { auditLogs } from '../../db/schema/dealflow.js';
import { logger } from '../logging/logger.js';
import { EntityType } from './audit.types.js';

// ─── Sensitive field redaction ─────────────────────────────────────────────────
// These keys are stripped from before/after snapshots before persistence.

const REDACTED_KEYS = new Set([
  'password',
  'passwordHash',
  'password_hash',
  'token',
  'refreshToken',
  'refresh_token',
  'accessToken',
  'access_token',
  'tokenHash',
  'token_hash',
  'secret',
  'apiKey',
  'api_key',
]);

function redact(obj: object | null | undefined): object | null {
  if (!obj) return null;
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (REDACTED_KEYS.has(key)) {
      result[key] = '[REDACTED]';
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = redact(value as object);
    } else {
      result[key] = value;
    }
  }
  return result;
}

// ─── Audit Input Interface ─────────────────────────────────────────────────────

export interface AuditInput {
  actorId: string;
  entityType: EntityType;
  entityId: string;
  action: string;
  reason?: string;
  before?: object | null;
  after?: object | null;
  ipAddress?: string;
  userAgent?: string;
}

// ─── Request Context Extraction ────────────────────────────────────────────────

export function extractRequestContext(req: Request): Pick<AuditInput, 'ipAddress' | 'userAgent'> {
  const headers = req.headers ?? {};

  // Respect X-Forwarded-For for apps behind a proxy/load balancer
  const forwarded = headers['x-forwarded-for'];
  const ipAddress = typeof forwarded === 'string'
    ? forwarded.split(',')[0].trim()
    : req.socket?.remoteAddress ?? 'unknown';

  const userAgent = (headers['user-agent'] ?? 'unknown').slice(0, 512);

  return { ipAddress, userAgent };
}

// ─── AuditService ──────────────────────────────────────────────────────────────

/**
 * Centralized, append-only audit logger.
 *
 * Usage:
 *
 *   // Outside a transaction (fire and forget):
 *   await AuditService.log({ actorId, entityType: 'user', entityId, action: AuditAction.USER_LOGIN });
 *
 *   // Inside a Drizzle transaction (same atomic write):
 *   await db.transaction(async (tx) => {
 *     await tx.update(quotations).set(...).where(...);
 *     await AuditService.log({ ... }, tx);
 *   });
 */
export const AuditService = {
  /**
   * Write an audit record. Optionally pass a Drizzle `tx` to write inside
   * the same database transaction as the surrounding mutation.
   *
   * This method NEVER throws. Audit failures are logged but do not propagate,
   * so they cannot silently roll back a legitimate business operation.
   * Exception: when `tx` is provided, the audit participates in that
   * transaction and a failure WILL roll back the whole transaction — which
   * is the correct behavior (we want mutation + audit to be atomic).
   */
  async log(input: AuditInput, tx?: typeof db): Promise<void> {
    const writer = tx ?? db;
    const auditRecord = {
      actorId: input.actorId,
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      reason: input.reason ?? null,
      beforeJson: input.before ? redact(input.before) : null,
      afterJson: input.after ? redact(input.after) : null,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
    };

    if (tx) {
      // Inside transaction — let it throw naturally so the tx rolls back on failure
      await (writer as any).insert(auditLogs).values(auditRecord);
    } else {
      // Outside transaction — swallow errors, log them
      try {
        await (writer as any).insert(auditLogs).values(auditRecord);
      } catch (err) {
        logger.error({ err, auditRecord }, '[AuditService] Failed to write audit log');
      }
    }
  },

  /**
   * Convenience: build request context fields from an Express Request object.
   */
  fromRequest(req: Request): Pick<AuditInput, 'ipAddress' | 'userAgent'> {
    return extractRequestContext(req);
  },
};
