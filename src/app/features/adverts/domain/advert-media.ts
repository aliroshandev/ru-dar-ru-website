/** Media types reused across all categories (Section 16). */
export const ADVERT_MEDIA_TYPES = ['image', 'video', 'document'] as const;
export type AdvertMediaType = (typeof ADVERT_MEDIA_TYPES)[number];

export interface AdvertMedia {
  id: string;
  type: AdvertMediaType;
  /** Storage-relative URL or absolute URL as returned by the backend. */
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  /** Display order within the advert. */
  sortOrder?: number;
  /** MIME type of the underlying file, when known. */
  mimeType?: string;
}
