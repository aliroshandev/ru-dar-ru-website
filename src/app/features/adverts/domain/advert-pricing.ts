/**
 * Price-related fields.
 * `price` and `pricePerUnit` are category-agnostic; specific pricing semantics
 * (e.g. mortgage vs rent) are expressed via attributes in category config.
 */
export interface AdvertPricing {
  price?: number;
  /** e.g. price per square meter for real-estate. */
  pricePerUnit?: number;
  /** ISO 4217 currency code, e.g. 'IRR' or 'Toman'. */
  currency?: string;
  negotiable?: boolean;
}

/** Min/max bounds used in search (price range filter). */
export interface AdvertPricingFilter {
  currency?: string;
  min?: number;
  max?: number;
}
