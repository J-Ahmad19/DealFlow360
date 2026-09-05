/**
 * server.ts
 *
 * Express application bootstrap and graceful shutdown.
 *
 * Startup order:
 *   1. Load & validate environment (config/index.ts — fails fast)
 *   2. Create Express app
 *   3. Apply global middleware (helmet, cors, json, request logger)
 *   4. Mount API routes
 *   5. 404 handler
 *   6. Centralized error handler
 *   7. Start HTTP server
 *   8. Register SIGTERM / SIGINT handlers for graceful shutdown
 */
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { config } from './config/index.js';
import { logger } from './core/logging/logger.js';
import { requestLogger } from './core/middleware/requestLogger.js';
import { notFound } from './core/middleware/notFound.js';
import { errorHandler } from './core/middleware/errorHandler.js';
import { closeDbPool } from './db/client.js';
import { runMigrations } from './db/migrate.js';
import apiRouter from './routes/index.js';
import { startJobScheduler, stopJobScheduler } from './jobs/index.js';

// ─── Create app ───────────────────────────────────────────────────────────────

const app = express();

// ─── Security headers ─────────────────────────────────────────────────────────

app.use(helmet());
app.use(cookieParser());

// ─── CORS ─────────────────────────────────────────────────────────────────────

app.use(
  cors({
    origin: config.CORS_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// ─── Body parsers ─────────────────────────────────────────────────────────────

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ─── Request logging ──────────────────────────────────────────────────────────

app.use(requestLogger);

// ─── API routes ───────────────────────────────────────────────────────────────

app.use('/api/v1', apiRouter);

// ─── 404 → must come after all routes ────────────────────────────────────────

app.use(notFound);

// ─── Centralized error handler → must be last ────────────────────────────────

app.use(errorHandler);

// ─── Start HTTP server ────────────────────────────────────────────────────────

// Run migrations first, then start listening.
// If migrations fail the process exits immediately with a non-zero code.
async function bootstrap(): Promise<void> {
  await runMigrations();

  const server = app.listen(config.PORT, () => {
    logger.info(
      { port: config.PORT, env: config.NODE_ENV },
      `🚀  DealFlow360 API running on http://localhost:${config.PORT.toString()}/api/v1`,
    );
    // Start background job workers (billing, deal health, recommendations, notifications)
    startJobScheduler();
  });

  // ─── Graceful shutdown ────────────────────────────────────────────────────────

  async function shutdown(signal: string): Promise<void> {
    logger.info(`${signal} received — shutting down gracefully`);

    server.close(async () => {
      logger.info('HTTP server closed');
      stopJobScheduler();
      await closeDbPool();
      logger.info('All connections drained. Goodbye.');
      process.exit(0);
    });

    // Force exit after 10 s if connections don't drain
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10_000);
  }

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT',  () => void shutdown('SIGINT'));
}

void bootstrap().catch((err) => {
  logger.fatal({ err }, 'Bootstrap failed — exiting.');
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception — process will exit');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'Unhandled promise rejection — process will exit');
  process.exit(1);
});

export default app;
