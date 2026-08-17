import type { AdvertLocation } from './advert-location';
import type { AdvertType } from './advert-type';
import type { Media } from './media';

/**
 * Root domain model for an advert.
 * Category-specific fields NEVER live here — they belong in `fields`, which
 * is controlled entirely by category configuration (see core-contracts
 * discipline: engines must not know the shape of `fields`).
 */
export interface Advert {
  id: string;
  /** Links to a CategoryDefinition by slug, not a hard enum. */
  categorySlug: string;
  advertType: AdvertType;
  ownerId: string;
  title: string;
  description: string;
  location: AdvertLocation;
  media: Media[];
  /** Category-defined field values — shape unknown to generic engines. */
  fields: Record<string, unknown>;
  publishingState: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}