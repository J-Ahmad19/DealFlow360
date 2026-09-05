/**
 * db/schema/index.ts
 *
 * Drizzle schema barrel file.
 * All application table schemas must be exported from this file so that
 * Drizzle Kit can discover them during `db:generate`.
 *
 * Example:
 * export * from '../../modules/deals/deals.schema.js';
 * export * from '../../modules/users/users.schema.js';
 */

export * from './dealflow.js';
