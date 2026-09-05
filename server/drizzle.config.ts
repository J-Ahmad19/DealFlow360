/**
 * drizzle.config.ts
 *
 * Drizzle Kit configuration.
 *
 * Migration strategy: GENERATED MIGRATIONS (not push).
 *   db:generate  → reads schema files, computes diff, writes SQL to migrations/
 *   db:migrate   → applies pending SQL migration files against the database
 *   db:check     → validates migration consistency without applying
 *   db:studio    → opens Drizzle Studio UI for the connected database
 *
 * Run all commands from the server/ directory:
 *   npm run db:generate
 *   npm run db:migrate
 */
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadDotenv } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Load .env from repo root (one directory above server/)
const __dirname = fileURLToPath(new URL('.', import.meta.url));
loadDotenv({ path: resolve(__dirname, '..', '.env') });

const databaseUrl = process.env['DATABASE_URL'];
if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is not set. Copy .env.example to .env and fill in your credentials.',
  );
}

export default defineConfig({
  // ── Schema ──────────────────────────────────────────────────────────────────
  // Point at the barrel file; drizzle-kit resolves all exported tables from here
  schema: './src/db/schema/index.ts',

  // ── Migrations ──────────────────────────────────────────────────────────────
  // SQL files are written here by db:generate and read by db:migrate.
  // Committed to version control so every environment runs the same history.
  out: './src/db/migrations',

  // ── Dialect ─────────────────────────────────────────────────────────────────
  dialect: 'postgresql',

  // ── Connection ──────────────────────────────────────────────────────────────
  dbCredentials: {
    url: databaseUrl,
  },

  // ── Options ─────────────────────────────────────────────────────────────────
  // Verbose output during generate/migrate — remove in CI if noisy
  verbose: true,
  // Strict mode: fails if drizzle-kit finds any ambiguities in the schema
  strict: true,
});
