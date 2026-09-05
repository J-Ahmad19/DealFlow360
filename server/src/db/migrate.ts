/**
 * db/migrate.ts
 *
 * Programmatic migration runner — called once at server startup.
 *
 * Strategy:
 *   - Uses Drizzle's built-in `migrate()` from the node-postgres migrator.
 *   - Reads SQL files from `./migrations/` (the same folder drizzle-kit writes to).
 *   - Drizzle tracks applied migrations in a `__drizzle_migrations` table.
 *     This makes the operation fully idempotent: already-applied migrations are
 *     skipped automatically, so re-running the server never causes duplicate
 *     SQL execution or data loss.
 *   - If the database is unreachable the function throws, which causes
 *     server.ts to abort startup — fast-fail is intentional.
 */
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from '../config/index.js';
import { logger } from '../core/logging/logger.js';

const { Pool } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));

export async function runMigrations(): Promise<void> {
  const pool = new Pool({
    connectionString: config.DATABASE_URL,
    // Keep this pool minimal — it's only used during the startup window.
    max: 1,
    connectionTimeoutMillis: 10_000,
  });

  try {
    logger.info('⏳ [DB] Running pending migrations...');

    const db = drizzle(pool);

    await migrate(db, {
      // __dirname = /server/src/db/  →  migrations are in /server/src/db/migrations/
      migrationsFolder: resolve(__dirname, 'migrations'),
    });

    logger.info('✅ [DB] All migrations applied successfully.');
  } catch (err) {
    logger.fatal({ err }, '❌ [DB] Migration failed — aborting startup.');
    throw err; // Propagate so server.ts exits with a non-zero code.
  } finally {
    // Always close this ephemeral pool so it doesn't leak alongside the main pool.
    await pool.end();
  }
}
