/**
 * db/client.ts
 *
 * Drizzle ORM client backed by a node-postgres pool.
 * The pool is created once and shared across all requests.
 * Schema will be imported and attached when modules are added.
 */
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { config } from '../config/index.js';
import { logger } from '../core/logging/logger.js';
import * as schema from './schema/index.js';

const { Pool } = pg;

// ─── Connection pool ──────────────────────────────────────────────────────────

const pool = new Pool({
  connectionString: config.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on('error', (err) => {
  logger.error({ err }, 'Unexpected database pool error');
});

// ─── Drizzle client ───────────────────────────────────────────────────────────

// Schema map will be extended as modules are added:
// import * as schema from './schema/index.js';
export const db = drizzle(pool, { schema });

// ─── Health check helper ──────────────────────────────────────────────────────

export async function checkDbConnection(): Promise<boolean> {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    return true;
  } catch {
    return false;
  } finally {
    client.release();
  }
}

// ─── Graceful shutdown ────────────────────────────────────────────────────────

export async function closeDbPool(): Promise<void> {
  await pool.end();
  logger.info('Database pool closed');
}
