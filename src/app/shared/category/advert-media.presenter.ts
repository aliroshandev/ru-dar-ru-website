import type { Advert } from '../../features/adverts/domain/advert.model';
import type { AdvertMedia } from '../../features/adverts/domain/advert-media';

/**
 * Read-only presenter for advert media (Phase 28).
 *
 * Gives cards and grids a single, pure way to pick a representative image
 * URL without reaching into the media array shape themselves. No network,
 * no mutation — just data transformation.
 */

/** Returns the first image media entry (by sort order), if any. */
export function primaryImage(advert: Advert): AdvertMedia | undefined {
  return [...advert.media]
    .filter((m) => m.type === 'image')
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))[0];
}