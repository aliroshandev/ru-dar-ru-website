/**
 * The type of an ADVERT, independent of any auth role.
 * A User (with an auth role) creates Adverts that carry their own AdvertType.
 * Domain-agnostic: applies to any future category, not just Real Estate.
 */
export type AdvertType = 'provider' | 'consumer';