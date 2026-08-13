/**
 * Top-level category IDs supported by the platform.
 * Each maps to an AdvertCategoryDefinition in the CategoryRegistry (Phase 4).
 * Adding a category must NOT require editing the Dynamic Form Engine.
 */
export const ADVERT_CATEGORY_IDS = [
  'real-estate',
  'building-materials',
  'building-services',
] as const;
export type AdvertCategoryId = (typeof ADVERT_CATEGORY_IDS)[number];

export function isAdvertCategoryId(value: unknown): value is AdvertCategoryId {
  return typeof value === 'string' && (ADVERT_CATEGORY_IDS as readonly string[]).includes(value);
}

/**
 * Subcategory IDs. Real-estate subcategories are listed here as the bridge to
 * Phase 4 category definitions; future categories may add more.
 */
export const REAL_ESTATE_SUBCATEGORY_IDS = ['rent', 'sell', 'mortgage', 'daily-rent'] as const;
export type RealEstateSubcategoryId = (typeof REAL_ESTATE_SUBCATEGORY_IDS)[number];

/** Every subcategory ID known to the platform today. */
export const ADVERT_SUBCATEGORY_IDS = [...REAL_ESTATE_SUBCATEGORY_IDS] as const;
export type AdvertSubcategoryId = RealEstateSubcategoryId;

export function isAdvertSubcategoryId(value: unknown): value is AdvertSubcategoryId {
  return typeof value === 'string' && (ADVERT_SUBCATEGORY_IDS as readonly string[]).includes(value);
}
