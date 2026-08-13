import type { CreateAdvertRequest, UpdateAdvertRequest } from '../../features/adverts/domain/advert-requests';
import type { AdvertLocation } from '../../features/adverts/domain/advert-location';
import type { AdvertPricing, AdvertPricingFilter } from '../../features/adverts/domain/advert-pricing';
import type { AdvertType } from '../../features/adverts/domain/advert-type';
import type { Advert } from '../../features/adverts/domain/advert.model';
import type { AdvertSearchQuery } from '../../features/adverts/domain/advert-search';
import type { AdvertCategoryId, AdvertSubcategoryId } from '../../features/adverts/domain/advert-category';
import { ADVERT_TYPES } from '../../features/adverts/domain/advert-type';

/**
 * Serializer — maps a dynamic form's live values into a CreateAdvertRequest.
 *
 * The category schema defines which field keys map to the shared core model
 * (title, description, location fields, pricing fields) vs. which are
 * advert-specific (→ `attributes`). This mapping is data-agnostic: any field
 * key is classified here, never in the engine.
 *
 * Recognized core keys:
 *  - title, description          → top-level
 *  - city, district, address     → location
 *  - price (or sellPrice/rentPrice/mortgageAmount/deposit) → pricing
 *  - phone, email                → intentionally kept as attributes
 * Everything else → attributes.
 */

/** Field keys mapped onto the shared location model. */
const LOCATION_KEYS = new Set(['city', 'district', 'address']);

/** Field keys that denote a monetary value mapped onto pricing.price. */
const PRICE_KEYS = new Set(['price', 'sellPrice', 'rentPrice', 'mortgageAmount', 'deposit']);

const EMPTY_PRICE = new Set([0, null, '', undefined]);
const PRICE_KEYS_ORDER: readonly string[] = ['price', 'sellPrice', 'rentPrice', 'mortgageAmount', 'deposit'];

export interface CreateAdvertAllocationOptions {
  /** The advert type. Defaults to 'consumer'. */
  type?: AdvertType;
  category?: AdvertCategoryId | string;
  subcategory?: AdvertSubcategoryId | string;
}

/**
 * Builds a CreateAdvertRequest from the category key selection plus the form's
 * live values. Returns null when no category has been selected.
 */
export function advertiseFromForm(
  values: Readonly<Record<string, unknown>>,
  options: CreateAdvertAllocationOptions,
): CreateAdvertRequest | null {
  if (!options.category) return null;

  const type = options.type && ADVERT_TYPES.includes(options.type) ? options.type : 'consumer';

  const request: CreateAdvertRequest = {
    type,
    category: options.category as AdvertCategoryId,
    subcategory: (options.subcategory as AdvertSubcategoryId) || undefined,
    title: asString(values['title']) ?? '',
    media: [],
    attributes: {},
  };

  const description = asString(values['description']);
  if (description) request.description = description;

  const location = buildLocation(values);
  if (location) request.location = location;

  const pricing = buildPricing(values);
  if (pricing) request.pricing = pricing;

  request.attributes = buildAttributes(values);
  const media = buildMedia(values);
  if (media) request.media = media;
  return request;
}

function buildLocation(values: Readonly<Record<string, unknown>>): AdvertLocation | undefined {
  const location: AdvertLocation = {};
  let found = false;
  for (const key of LOCATION_KEYS) {
    const value = asString(values[key]);
    if (!value) continue;
    if (key === 'city') location.city = value;
    else if (key === 'district') location.district = value;
    else if (key === 'address') location.address = value;
    found = true;
  }
  return found ? location : undefined;
}

function buildPricing(values: Readonly<Record<string, unknown>>): AdvertPricing | undefined {
  let price: number | undefined;
  for (const key of PRICE_KEYS_ORDER) {
    const value = asNumber(values[key]);
    if (value == null || EMPTY_PRICE.has(value)) continue;
    price = value;
    break;
  }
  if (price == null) return undefined;
  return { price, currency: 'Toman' };
}

/** Field keys treated as image/URL inputs for media capture (Phase 26). */
const MEDIA_KEYS = ['imageMain', 'image1', 'image2', 'image3', 'image'];

function buildMedia(
  values: Readonly<Record<string, unknown>>,
): readonly { type: string; url: string; sortOrder: number }[] | undefined {
  const media: { type: string; url: string; sortOrder: number }[] = [];
  for (const key of MEDIA_KEYS) {
    const url = asString(values[key]);
    if (url) media.push({ type: 'image', url, sortOrder: media.length });
  }
  return media.length ? media : undefined;
}

function buildAttributes(values: Readonly<Record<string, unknown>>): Record<string, unknown> {
  const attributes: Record<string, unknown> = {};
  const reserved = new Set<string>(['title', 'description', ...LOCATION_KEYS, ...PRICE_KEYS, ...MEDIA_KEYS]);
  for (const [key, value] of Object.entries(values)) {
    if (reserved.has(key)) continue;
    if (value === '' || value === null || value === undefined) continue;
    attributes[key] = value;
  }
  return attributes;
}

/** Coerces a value to a string, or undefined when empty. */
function asString(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim() !== '') return value;
  if (typeof value === 'number') return String(value);
  return undefined;
}

/** Coerces a value to a number, or undefined when empty/NaN. */
function asNumber(value: unknown): number | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

/**
 * Inverse mapping of `advertiseFromForm`: seeds a dynamic form (edit/preview
 * mode) with an advert's stored values. Core keys (title/description/location/
 * pricing) are mapped back onto their form field keys; everything else is read
 * from `attributes` by key. Returns only keys present in `fieldKeys`.
 */
export function advertToFormValues(
  advert: Advert,
  fieldKeys: readonly string[],
): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  const imageKeys = fieldKeys.filter((k) => MEDIA_KEYS.includes(k));
  const mediaByOrder = [...advert.media]
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .filter((m) => m.type === 'image')
    .map((m) => m.url);
  for (const key of fieldKeys) {
    if (key === 'title') {
      values[key] = advert.title;
    } else if (key === 'description') {
      if (advert.description) values[key] = advert.description;
    } else if (LOCATION_KEYS.has(key)) {
      const value = advert.location?.[key as 'city' | 'district' | 'address'];
      if (value) values[key] = value;
    } else if (PRICE_KEYS.has(key)) {
      // The first price-like field receives the advert's stored price.
      if (!(key in values) && advert.pricing?.price != null) {
        values[key] = advert.pricing.price;
      }
    } else if (MEDIA_KEYS.includes(key)) {
      // Media is flattened onto the form's image keys in sort order.
      const index = imageKeys.indexOf(key);
      const url = mediaByOrder[index];
      if (url) values[key] = url;
    } else if (key in advert.attributes) {
      values[key] = advert.attributes[key];
    }
  }
  return values;
}

/**
 * Builds an UpdateAdvertRequest from a create-mode form in edit context.
 * Emits only changed top-level/location/pricing values. Attributes are rebuilt
 * from the form while preserving any non-form keys already on the advert.
 */
export function advertUpdateFromForm(
  advert: Advert,
  values: Readonly<Record<string, unknown>>,
  fieldKeys: readonly string[],
): UpdateAdvertRequest {
  const request: UpdateAdvertRequest = {};

  const title = asString(values['title']);
  const description = asString(values['description']);
  if (title !== undefined && title !== advert.title) request.title = title;
  if (description !== undefined && description !== advert.description) {
    request.description = description;
  }

  const location = buildLocation(values);
  if (location && !locationsEqual(location, advert.location)) request.location = location;

  const pricing = buildPricing(values);
  if (pricing && !pricingEqual(pricing, advert.pricing)) request.pricing = pricing;

  const media = buildMedia(values);
  if (media && !mediaEqual(media, advert.media)) request.media = media;

  const formSet = new Set(fieldKeys);
  const attributes: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(advert.attributes)) {
    // Preserve attributes that the form does not surface.
    if (!formSet.has(key)) attributes[key] = value;
  }
  Object.assign(attributes, buildAttributes(values));
  request.attributes = attributes;

  return request;
}

function locationsEqual(a: AdvertLocation | undefined, b: AdvertLocation | undefined): boolean {
  if (!a || !b) return a === b;
  return a.city === b.city && a.district === b.district && a.address === b.address;
}

function pricingEqual(a: AdvertPricing | undefined, b: AdvertPricing | undefined): boolean {
  if (!a || !b) return a === b;
  return a.price === b.price && a.currency === b.currency;
}

function mediaEqual(
  a: readonly { url: string }[],
  b: readonly { url: string }[],
): boolean {
  if (a.length !== b.length) return false;
  return a.every((item, i) => item.url === b[i]?.url);
}

/** Field keys carrying location constraints (→ location). */
const LOCATION_FILTER_KEYS = new Set(['country', 'state', 'city', 'district']);

/** Range prefixes: `minArea`/`maxArea` map onto the `area` attribute range. */
const RANGE_PREFIXES = ['min', 'max'] as const;
/** Attribute keys that are numeric and may be ranged (e.g. area, rooms). */
const RANGEABLE = new Set(['area', 'rooms', 'landArea', 'builtArea', 'floor']);

export interface SearchQueryAllocationOptions {
  category?: AdvertCategoryId | string;
  subcategory?: AdvertSubcategoryId | string;
  type?: AdvertType;
}

/**
 * Builds an AdvertSearchQuery from live search-form values (Phase 17).
 *
 * Recognizes the well-known semantic keys produced by search schemas and maps
 * them onto the shared query model; everything else becomes an attribute
 * filter. This is data-agnostic — the same mapping serves any category:
 *  - `q`                      → free-text
 *  - country/state/city/district → location
 *  - `minPrice`/`maxPrice`    → pricing range
 *  - `min<Attr>`/`max<Attr>`  → numeric attribute range (e.g. minArea/maxArea)
 */
export function buildSearchQuery(
  values: Readonly<Record<string, unknown>>,
  options: SearchQueryAllocationOptions = {},
): AdvertSearchQuery {
  const location: AdvertLocation = {};
  const pricing: AdvertPricingFilter = {};
  const filters: Record<string, unknown> = {};
  const ranges: Record<string, { min?: number; max?: number }> = {};

  let hasLocation = false;
  let hasPricing = false;

  for (const [key, value] of Object.entries(values)) {
    if (value === '' || value === null || value === undefined) continue;

    if (key === 'q') {
      continue; // set after loop
    } else if (key === 'minPrice') {
      const n = asNumber(value);
      if (n != null) { pricing.min = n; hasPricing = true; }
    } else if (key === 'maxPrice') {
      const n = asNumber(value);
      if (n != null) { pricing.max = n; hasPricing = true; }
    } else if (LOCATION_FILTER_KEYS.has(key)) {
      const s = asString(value);
      if (s) { (location as Record<string, string>)[key] = s; hasLocation = true; }
    } else {
      const matched = tryRange(key, value, ranges);
      if (!matched) {
        filters[key] = value;
      }
    }
  }

  for (const [key, range] of Object.entries(ranges)) {
    if (range.min != null || range.max != null) {
      filters[key] = { min: range.min, max: range.max };
    }
  }

  const query: AdvertSearchQuery = {
    category: (options.category as AdvertSearchQuery['category']) || undefined,
    subcategory: (options.subcategory as AdvertSearchQuery['subcategory']) || undefined,
    // Public search surfaces only active listings.
    statuses: ['active'],
    filters,
  };
  if (options.type) query.type = options.type;
  const q = asString(values['q']);
  if (q) query.q = q;
  if (hasLocation) query.location = location;
  if (hasPricing) query.pricing = pricing;
  return query;
}

/** Detects `minX`/`maxX` keys that map to a numeric attribute range. */
function tryRange(
  key: string,
  value: unknown,
  ranges: Record<string, { min?: number; max?: number }>,
): boolean {
  for (const prefix of RANGE_PREFIXES) {
    if (key.startsWith(prefix)) {
      const attr = key.slice(prefix.length).toLowerCase();
      if (RANGEABLE.has(attr)) {
        const n = asNumber(value);
        if (n == null) return true;
        ranges[attr] = { ...ranges[attr], [prefix]: n };
        return true;
      }
    }
  }
  return false;
}