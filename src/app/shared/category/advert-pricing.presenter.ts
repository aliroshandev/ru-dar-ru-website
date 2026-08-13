import type { Advert } from '../../features/adverts/domain/advert.model';

/**
 * Read-only presenter for advert pricing (Phase 31).
 *
 * Centralizes how an advert's price is turned into display text so the card,
 * detail, and similar-adverts lists never duplicate the formatting rules. Pure
 * data transformation — no network, no mutation.
 */

export interface PriceDisplay {
  /** News the formatted primary figure (could be price or pricePerUnit). */
  amount: string | undefined;
  /** Whether the primary figure is a per-unit rate rather than a flat price. */
  isPerUnit: boolean;
  /** `amount` combined with the per-unit label and currency, for quick display. */
  text: string | undefined;
}

/** Formats a localized figure with the given unit and currency. */
export function priceText(
  pricing: Advert['pricing'],
  opts?: { perUnitLabel?: string },
): string | undefined {
  return toDisplay(pricing, opts).text;
}

export function toDisplay(
  pricing: Advert['pricing'],
  opts?: { perUnitLabel?: string },
): PriceDisplay {
  if (!pricing) return { amount: undefined, isPerUnit: false, text: undefined };

  const number = (v: number | undefined): string | undefined =>
    v == null ? undefined : v.toLocaleString('fa-IR');

  if (pricing.price != null) {
    const amount = number(pricing.price);
    return {
      amount,
      isPerUnit: false,
      text: [amount, currencyText(pricing.currency)].filter(Boolean).join(' '),
    };
  }

  if (pricing.pricePerUnit != null) {
    const amount = number(pricing.pricePerUnit);
    return {
      amount,
      isPerUnit: true,
      text: [amount, opts?.perUnitLabel, currencyText(pricing.currency)]
        .filter(Boolean)
        .join(' '),
    };
  }

  if (pricing.negotiable === true) {
    return { amount: undefined, isPerUnit: false, text: 'توافقی' };
  }

  return { amount: undefined, isPerUnit: false, text: undefined };
}

function currencyText(currency: string | undefined): string | undefined {
  return currency || undefined;
}