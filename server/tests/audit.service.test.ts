import { randomUUID } from 'node:crypto';
import { db } from '../src/db/client.js';
import { auditLogs, users } from '../src/db/schema/dealflow.js';
import { eq } from 'drizzle-orm';
import { AuditService } from '../src/core/audit/audit.service.js';
import { AuditAction } from '../src/core/audit/audit.types.js';

describe('AuditService', () => {
  let actorId: string;
  const testEntityId = randomUUID();

  beforeAll(async () => {
    actorId = randomUUID();
    await db.insert(users).values({
      id: actorId,
      email: `audit-test-${actorId.slice(0, 8)}@test.com`,
      fullName: 'Audit Test User',
      role: 'admin',
    });
  });

  afterAll(async () => {
    await db.delete(auditLogs).where(eq(auditLogs.actorId, actorId));
    await db.delete(users).where(eq(users.id, actorId));
  });

  // ── Test 1: Basic write outside transaction ────────────────────────────────

  it('should write an audit record with all fields', async () => {
    await AuditService.log({
      actorId,
      entityType: 'quotation',
      entityId: testEntityId,
      action: AuditAction.QUOTATION_CREATED,
      reason: 'Test quotation created',
      before: null,
      after: { title: 'Test Quote', status: 'draft' },
      ipAddress: '192.168.1.1',
      userAgent: 'Jest/Test',
    });

    const [record] = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.entityId, testEntityId));

    expect(record).toBeDefined();
    expect(record.actorId).toBe(actorId);
    expect(record.action).toBe(AuditAction.QUOTATION_CREATED);
    expect(record.reason).toBe('Test quotation created');
    expect(record.ipAddress).toBe('192.168.1.1');
    expect(record.afterJson).toMatchObject({ title: 'Test Quote', status: 'draft' });
    expect(record.beforeJson).toBeNull();
  });

  // ── Test 2: Credential redaction ──────────────────────────────────────────

  it('should redact sensitive credential fields from before/after JSON', async () => {
    const entityId = randomUUID();
    await AuditService.log({
      actorId,
      entityType: 'user',
      entityId,
      action: AuditAction.USER_SIGNUP,
      before: null,
      after: {
        email: 'test@example.com',
        passwordHash: 'argon2id$v=19$...',   // MUST be redacted
        refreshToken: 'secret-refresh-token', // MUST be redacted
        role: 'sales_rep',
      },
    });

    const [record] = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.entityId, entityId));

    const after = record.afterJson as any;
    expect(after.email).toBe('test@example.com');
    expect(after.role).toBe('sales_rep');
    expect(after.passwordHash).toBe('[REDACTED]');
    expect(after.refreshToken).toBe('[REDACTED]');
  });

  // ── Test 3: Transaction atomicity — commit ─────────────────────────────────

  it('should write audit inside a transaction that commits', async () => {
    const entityId = randomUUID();

    await db.transaction(async (tx) => {
      await AuditService.log({
        actorId,
        entityType: 'quotation',
        entityId,
        action: AuditAction.QUOTATION_SUBMITTED,
        reason: 'Submitted in transaction',
      }, tx as any);
    });

    const [record] = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.entityId, entityId));

    expect(record).toBeDefined();
    expect(record.reason).toBe('Submitted in transaction');
  });

  // ── Test 4: Transaction atomicity — rollback ───────────────────────────────

  it('should roll back audit when transaction is rolled back', async () => {
    const entityId = randomUUID();

    await expect(
      db.transaction(async (tx) => {
        await AuditService.log({
          actorId,
          entityType: 'quotation',
          entityId,
          action: AuditAction.APPROVAL_APPROVED,
          reason: 'This should be rolled back',
        }, tx as any);

        // Force rollback
        throw new Error('Intentional rollback');
      })
    ).rejects.toThrow('Intentional rollback');

    // Audit record should NOT exist because the tx was rolled back
    const records = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.entityId, entityId));

    expect(records).toHaveLength(0);
  });

  // ── Test 5: fromRequest extracts IP and UA ─────────────────────────────────

  it('fromRequest should extract ip and user-agent from a mock request', () => {
    const mockReq = {
      headers: {
        'x-forwarded-for': '10.0.0.1, 172.16.0.1',
        'user-agent': 'Mozilla/5.0 (Test)',
      },
      socket: { remoteAddress: '127.0.0.1' },
    } as any;

    const ctx = AuditService.fromRequest(mockReq);
    expect(ctx.ipAddress).toBe('10.0.0.1'); // First in X-Forwarded-For
    expect(ctx.userAgent).toBe('Mozilla/5.0 (Test)');
  });

  // ── Test 6: Never throws outside transaction ───────────────────────────────

  it('should not throw when actorId is invalid (outside tx) — swallows error silently', async () => {
    // Passing a non-existent actorId that will fail FK constraint
    await expect(
      AuditService.log({
        actorId: randomUUID(), // non-existent user — FK will fail
        entityType: 'quotation',
        entityId: randomUUID(),
        action: AuditAction.QUOTATION_CREATED,
      })
    ).resolves.toBeUndefined(); // Resolves without throwing
  });
});
