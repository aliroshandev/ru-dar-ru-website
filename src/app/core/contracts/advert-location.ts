/**
 * Reusable, cross-category location model.
 *
 * PRIVACY: `approximateZone` is always backend-computed. This type carries only
 * the representation the backend hands to the frontend — the frontend never
 * derives an approximate zone from exact coordinates, and non-owners never
 * receive exact coordinates for a privacy-protected advert.
 * Domain-agnostic: no Real Estate fields.
 */
export interface AdvertLocation {
  city: string;
  district?: string;
  coordinates?: { lat: number; lng: number };
  hideExactLocation: boolean;
  approximateZone?: { center: { lat: number; lng: number }; radiusMeters: number };
}