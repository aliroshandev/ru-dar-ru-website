/** Reusable, cross-category location model (Section 16). */
export interface AdvertLocation {
  country?: string;
  state?: string;
  city?: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
}

/** Location constraints used in search queries. */
export interface AdvertLocationFilter {
  country?: string;
  state?: string;
  city?: string;
  district?: string;
  /** Fuzzy match against state/city/district/address. */
  q?: string;
}
