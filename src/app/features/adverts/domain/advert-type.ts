/**
 * The type of an ADVERT, independent of any auth role.
 * A User (with an auth role) creates Adverts that carry their own AdvertType.
 */
export const ADVERT_TYPES = ['provider', 'consumer'] as const;
export type AdvertType = (typeof ADVERT_TYPES)[number];

export function isAdvertType(value: unknown): value is AdvertType {
  return typeof value === 'string' && (ADVERT_TYPES as readonly string[]).includes(value);
}
