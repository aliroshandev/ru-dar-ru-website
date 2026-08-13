import { describe, expect, it } from 'vitest';
import { priceText, toDisplay } from './advert-pricing.presenter';
import type { AdvertPricing } from '../../features/adverts/domain/advert-pricing';

describe('advert-pricing presenter (Phase 31)', () => {
  it('formats a flat price with currency', () => {
    const p: AdvertPricing = { price: 12000000, currency: 'Toman' };
    expect(priceText(p)).toBe('۱۲٬۰۰۰٬۰۰۰ Toman');
  });

  it('prefers flat price over per-unit when both are set', () => {
    const p: AdvertPricing = { price: 12000000, pricePerUnit: 50000, currency: 'Toman' };
    const d = toDisplay(p);
    expect(d.isPerUnit).toBe(false);
    expect(d.text).toContain('۱۲٬۰۰۰٬۰۰۰');
  });

  it('renders a per-unit rate with an optional unit label', () => {
    const p: AdvertPricing = { pricePerUnit: 50000, currency: 'Toman' };
    expect(priceText(p)).toBe('۵۰٬۰۰۰ Toman');
    expect(priceText(p, { perUnitLabel: 'هر متر' })).toBe('۵۰٬۰۰۰ هر متر Toman');
    expect(toDisplay(p).isPerUnit).toBe(true);
  });

  it('renders negotiable when everything is empty', () => {
    expect(priceText({ negotiable: true })).toBe('توافقی');
  });

  it('is undefined without any pricing info', () => {
    expect(priceText(undefined)).toBeUndefined();
    expect(priceText({})).toBeUndefined();
  });
});