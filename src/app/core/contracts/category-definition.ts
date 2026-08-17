import type { FilterDefinition } from './filter-definition';
import type { SectionDefinition } from './section-definition';

/**
 * Configuration for a whole category. Engines (form, search, advert)
 * consume this data; they never branch on a specific category id.
 * Domain-agnostic — Real Estate is one configuration of this shape.
 */
export interface CategoryDefinition {
  slug: string;
  label: string;
  /** Present only for subcategory definitions. */
  parentSlug?: string;
  sections: SectionDefinition[];
  filters: FilterDefinition[];
}