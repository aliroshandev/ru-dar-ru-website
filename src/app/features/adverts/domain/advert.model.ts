import type { AdvertCategoryId, AdvertSubcategoryId } from './advert-category';
import type { AdvertLocation } from './advert-location';
import type { AdvertMedia } from './advert-media';
import type { AdvertPricing } from './advert-pricing';
import type { AdvertStatus } from './advert-status';
import type { AdvertType } from './advert-type';

/**
 * Root domain model for an advert.
 * Category-specific fields NEVER live here — they belong in `attributes`,
 * which is controlled entirely by category configuration (Sections 6/7).
 */
export interface Advert {
  id: string;
  type: AdvertType;
  category: AdvertCategoryId;
  subcategory?: AdvertSubcategoryId;
  title: string;
  description?: string;
  location?: AdvertLocation;
  pricing?: AdvertPricing;
  attributes: Readonly<Record<string, unknown>>;
  media: readonly AdvertMedia[];
  status: AdvertStatus;
  createdAt: string;
  updatedAt: string;
}
