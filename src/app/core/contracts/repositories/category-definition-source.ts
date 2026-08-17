// PROPOSED CONTRACT — no backend exists yet; this is the frontend-facing shape both mock and future HTTP implementations must satisfy.
import type { CategoryDefinition } from '../category-definition';

/**
 * Source of category definitions, swappable between a local seed/mock and the
 * future Admin Panel API. Engines consume definitions through this abstraction.
 */
export interface CategoryDefinitionSource {
  getBySlug(slug: string): Promise<CategoryDefinition | null>;
  list(): Promise<CategoryDefinition[]>;
}