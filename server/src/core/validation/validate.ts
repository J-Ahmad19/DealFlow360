/**
 * core/validation/validate.ts
 *
 * Zod request validator middleware factory.
 * Usage:
 *   router.post('/deals', validate({ body: CreateDealSchema }), handler)
 *
 * Validates req.body, req.query, and req.params against provided schemas.
 * Throws a ValidationError with formatted messages on failure.
 */
import type { Request, Response, NextFunction } from 'express';
import { z, type ZodSchema } from 'zod';
import { ValidationError } from '../errors/AppError.js';

interface ValidateSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export function validate(schemas: ValidateSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as Record<string, string>;
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as Record<string, string>;
      }
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const message = err.issues
          .map((i) => `${i.path.join('.')}: ${i.message}`)
          .join('; ');
        next(new ValidationError(message));
      } else {
        next(err);
      }
    }
  };
}
