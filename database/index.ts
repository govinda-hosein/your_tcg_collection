/**
 * Database Models Export
 *
 * Central export point for all database models.
 * Import models from here to ensure consistent usage across the application.
 *
 * @example
 * ```typescript
 * import { Event, Booking } from '@/database';
 * ```
 */

export { default as Set } from "./set.model";

// Export types for TypeScript consumers
export type { SetDocument } from "./set.model";
