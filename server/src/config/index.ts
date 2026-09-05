/**
 * config/index.ts
 *
 * Typed, Zod-validated environment loader.
 * The server will throw at startup if any required variable is missing
 * or has an invalid format — fail-fast before any service is created.
 */
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadDotenv } from 'dotenv';

// Resolve .env from the repo root (one level above server/)
const __dirname = fileURLToPath(new URL('.', import.meta.url));
loadDotenv({ path: resolve(__dirname, '..', '..', '..', '.env') });

import { z } from 'zod';

// ─── Schema ──────────────────────────────────────────────────────────────────

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  PORT: z.coerce.number().int().positive().default(4000),

  DATABASE_URL: z
    .string()
    .url('DATABASE_URL must be a valid PostgreSQL connection string'),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),

  // Redis is optional in dev — leave blank to disable
  REDIS_URL: z.string().url().optional().or(z.literal('')),
  REDIS_TOKEN: z.string().optional(),

  // Comma-separated list: "http://localhost:5173,https://app.dealflow360.com"
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:5173')
    .transform((val) => val.split(',').map((s) => s.trim())),
});

// ─── Parse ────────────────────────────────────────────────────────────────────

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌  Invalid environment configuration:\n');
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join('.')} — ${issue.message}`);
  }
  process.exit(1);
}

// ─── Export ───────────────────────────────────────────────────────────────────

export const config = parsed.data;

export type Config = typeof config;
