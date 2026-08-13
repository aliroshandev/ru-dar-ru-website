import type { AdvertCategoryId, AdvertSubcategoryId } from './advert-category';
import type { AdvertLocation } from './advert-location';
import type { AdvertPricing } from './advert-pricing';
import type { AdvertStatus } from './advert-status';
import type { AdvertType } from './advert-type';

/** Fields required to create an advert. */
export interface CreateAdvertRequest {
  type: AdvertType;
  category: AdvertCategoryId;
  subcategory?: AdvertSubcategoryId;
  title: string;
  description?: string;
  location?: AdvertLocation;
  pricing?: AdvertPricing;
  attributes: Readonly<Record<string, unknown>>;
  media: readonly { type: string; url: string; sortOrder?: number }[];
}

/** Fields allowed when updating an existing advert. */
export interface UpdateAdvertRequest {
  title?: string;
  description?: string;
  location?: AdvertLocation;
  pricing?: AdvertPricing;
  attributes?: Readonly<Record<string, unknown>>;
  media?: readonly { type: string; url: string; sortOrder?: number }[];
  status?: AdvertStatus;
}
