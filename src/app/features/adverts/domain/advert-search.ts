import type { AdvertCategoryId, AdvertSubcategoryId } from './advert-category';
import type { AdvertLocationFilter } from './advert-location';
import type { AdvertPricingFilter } from './advert-pricing';
import type { AdvertStatus } from './advert-status';
import type { AdvertType } from './advert-type';
import type { Advert } from './advert.model';

export type AdvertSort = 'relevance' | 'newest' | 'oldest' | 'price-asc' | 'price-desc';

/**
 * Search query. Category-specific predicate values go in `filters` (keys are
 * the field `key`s from the category search schema) — never as flat params.
 * `statuses` gates visibility: public browse passes `['active']`; callers that
 * need all statuses (e.g. favorites, moderation) omit it to see every advert.
 */
export interface AdvertSearchQuery {
  type?: AdvertType;
  category?: AdvertCategoryId;
  subcategory?: AdvertSubcategoryId;
  /** Restrict to a specific set of advert ids (e.g. favorites). */
  ids?: readonly string[];
  /** Restrict to specific lifecycle statuses (empty = all statuses). */
  statuses?: readonly AdvertStatus[];
  /** Free-text across title/description/location. */
  q?: string;
  location?: AdvertLocationFilter;
  pricing?: AdvertPricingFilter;
  filters: Readonly<Record<string, unknown>>;
  page?: number;
  pageSize?: number;
  sort?: AdvertSort;
}

export interface AdvertSearchResult {
  items: readonly Advert[];
  total: number;
  page: number;
  pageSize: number;
}
