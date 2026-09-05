/**
 * core/logging/logger.ts
 *
 * Application-wide structured logger built on Pino.
 * In development: pretty-printed, colourised output.
 * In production:  JSON lines for log-aggregation pipelines.
 */
import pino from 'pino';
import { config } from '../../config/index.js';

export const logger = pino({
  level: config.NODE_ENV === 'production' ? 'info' : 'debug',
  ...(config.NODE_ENV !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
      },
    },
  }),
});
