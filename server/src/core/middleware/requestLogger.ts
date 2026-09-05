/**
 * core/middleware/requestLogger.ts
 *
 * HTTP request/response logger using pino-http.
 * Logs method, url, status code, and response time on every request.
 */
import { pinoHttp } from 'pino-http';
import type { Logger } from 'pino';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { logger } from '../logging/logger.js';

export const requestLogger = pinoHttp({
  // Cast is required: pino() returns Logger<never> but pino-http expects Logger<string>
  logger: logger as unknown as Logger<string>,
  // Don't log health checks — they're noisy in production
  autoLogging: {
    ignore: (req: IncomingMessage) => req.url === '/api/v1/health',
  },
  customLogLevel: (
    _req: IncomingMessage,
    res: ServerResponse,
    _err: Error | undefined,
  ): string => {
    if (res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  serializers: {
    req: (req: IncomingMessage & { url?: string; method?: string }) => ({
      method: req.method,
      url: req.url,
    }),
    res: (res: ServerResponse) => ({ statusCode: res.statusCode }),
  },
});
