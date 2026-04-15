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

export { default as PokemonCard } from "./pokemonCard.model";
export { default as Set } from "./set.model";

// Export types for TypeScript consumers
export type { PokemonCardDocument } from "./pokemonCard.model";
export type { SetDocument } from "./set.model";
