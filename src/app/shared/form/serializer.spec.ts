import { describe, expect, it } from 'vitest';
import { advertiseFromForm, advertToFormValues, advertUpdateFromForm, buildSearchQuery } from './serializer';
import type { Advert } from '../../features/adverts/domain/advert.model';

describe('advertiseFromForm (Phase 10 serializer)', () => {
  it('returns null when no category is selected', () => {
    const result = advertiseFromForm({ title: 'اتاق' }, {});
    expect(result).toBeNull();
  });

  it('maps title/description to the top-level request fields', () => {
    const result = advertiseFromForm(
      { title: 'آپارتمان ۷۵ متری', description: 'جنب مترو' },
      { category: 'real-estate', subcategory: 'apartment' },
    );
    expect(result).not.toBeNull();
    expect(result!.title).toBe('آپارتمان ۷۵ متری');
    expect(result!.description).toBe('جنب مترو');
    expect(result!.category).toBe('real-estate');
    expect(result!.subcategory).toBe('apartment');
    expect(result!.type).toBe('consumer');
    expect(result!.media).toEqual([]);
  });

  it('maps aware location keys into location and keeps origins in attributes', () => {
    const result = advertiseFromForm(
      { city: 'تهران', district: 'سعادت‌آباد', address: 'خیابان ۱۲', phone: '0912' },
      { category: 'real-estate' },
    );
    expect(result!.location).toEqual({
      city: 'تهران',
      district: 'سعادت‌آباد',
      address: 'خیابان ۱۲',
    });
    expect(result!.attributes).toEqual({ phone: '0912' });
  });

  it('maps the first non-empty price key into pricing and the rest into attributes', () => {
    const result = advertiseFromForm(
      { price: '', rentPrice: 12000000, mortgageAmount: 0, rooms: 2 },
      { category: 'real-estate' },
    );
    expect(result!.pricing).toEqual({ price: 12000000, currency: 'Toman' });
    expect(result!.attributes).toEqual({ rooms: 2 });
  });

  it('omits location and pricing when all their keys are empty', () => {
    const result = advertiseFromForm(
      { title: 'محل', city: '', rooms: 3 },
      { category: 'commercial' },
    );
    expect(result!.location).toBeUndefined();
    expect(result!.pricing).toBeUndefined();
    expect(result!.attributes).toEqual({ rooms: 3 });
  });

  it('collects non-empty image keys into media and keeps them out of attributes', () => {
    const result = advertiseFromForm(
      { title: 'ملک', imageMain: 'https://x/img-a.jpg', image1: '', image2: 'https://x/img-b.jpg', bedroom: 2 },
      { category: 'real-estate' },
    );
    expect(result!.media).toEqual([
      { type: 'image', url: 'https://x/img-a.jpg', sortOrder: 0 },
      { type: 'image', url: 'https://x/img-b.jpg', sortOrder: 1 },
    ]);
    expect(result!.attributes).toEqual({ bedroom: 2 });
  });

  it('drops empty/null/undefined attribute values but keeps falsy-but-real numbers', () => {
    const result = advertiseFromForm(
      { title: 'x', floor: 0, garage: false, note: '', empty: null, skip: undefined, area: 120 },
      { category: 'real-estate', type: 'provider' },
    );
    expect(result!.attributes).toEqual({ floor: 0, garage: false, area: 120 });
    expect(result!.type).toBe('provider');
  });
});

function sampleAdvert(): Advert {
  return {
    id: 'a1',
    type: 'provider',
    category: 'real-estate',
    subcategory: 'sell',
    title: 'آپارتمان',
    description: 'جنب مترو',
    location: { city: 'تهران', district: 'سعادت‌آباد', address: 'خیابان ۱۲' },
    pricing: { price: 12000000, currency: 'Toman' },
    attributes: { rooms: 3, facing: 'north', meta: 'keep' },
    media: [],
    status: 'active',
    createdAt: '',
    updatedAt: '',
  };
}

describe('advertToFormValues (Phase 12 edit seed)', () => {
  const advert = sampleAdvert();

  it('maps core fields and attributes back onto form keys', () => {
    const values = advertToFormValues(advert, [
      'title',
      'description',
      'city',
      'district',
      'address',
      'price',
      'rooms',
      'facing',
    ]);
    expect(values['title']).toBe('آپارتمان');
    expect(values['city']).toBe('تهران');
    expect(values['district']).toBe('سعادت‌آباد');
    expect(values['price']).toBe(12000000);
    expect(values['rooms']).toBe(3);
    expect(values['facing']).toBe('north');
  });

  it('only maps the price field that is actually present', () => {
    const values = advertToFormValues(advert, ['rentPrice', 'rooms']);
    expect(values['rentPrice']).toBe(12000000);
    expect(values['rooms']).toBe(3);
  });

  it('does not emit empty keys absent from the advert', () => {
    const values = advertToFormValues(advert, ['description', 'address', 'missing']);
    expect('missing' in values).toBe(false);
  });

  it('seeds image keys from stored media in sort order', () => {
    const withMedia: Advert = {
      ...advert,
      media: [
        { id: 'm2', type: 'image', url: 'https://x/b.jpg', sortOrder: 1 },
        { id: 'm1', type: 'image', url: 'https://x/a.jpg', sortOrder: 0 },
        { id: 'm3', type: 'video', url: 'https://x/c.mp4', sortOrder: 2 },
      ],
    };
    const values = advertToFormValues(withMedia, [
      'title',
      'imageMain',
      'image1',
      'image2',
    ]);
    expect(values['imageMain']).toBe('https://x/a.jpg');
    expect(values['image1']).toBe('https://x/b.jpg');
    expect(values['image2']).toBeUndefined();
  });
});

describe('advertUpdateFromForm (Phase 12 update request)', () => {
  const advert = sampleAdvert();

  it('emits only changed core/location/pricing values', () => {
    const request = advertUpdateFromForm(
      advert,
      { title: 'آپارتمان', description: 'جنب مترو', city: 'تهران', price: 15000000, rooms: 4 },
      ['title', 'description', 'city', 'price', 'rooms'],
    );
    expect(request.title).toBeUndefined();
    expect(request.description).toBeUndefined();
    expect(request.pricing).toEqual({ price: 15000000, currency: 'Toman' });
    expect(request.attributes).toMatchObject({ rooms: 4, meta: 'keep' });
  });

  it('preserves non-form attributes and merges form attributes', () => {
    const request = advertUpdateFromForm(
      advert,
      { title: 'آپارتمان', rooms: 5, facing: 'south' },
      ['title', 'rooms', 'facing'],
    );
    expect(request.attributes).toEqual({ meta: 'keep', rooms: 5, facing: 'south' });
  });

  it('omits location/pricing when unchanged', () => {
    const request = advertUpdateFromForm(
      advert,
      { title: 'آپارتمان', city: 'تهران', district: 'سعادت‌آباد', address: 'خیابان ۱۲', price: 12000000 },
      ['title', 'city', 'district', 'address', 'price'],
    );
    expect(request.location).toBeUndefined();
    expect(request.pricing).toBeUndefined();
  });

  it('emits media only when the form images changed', () => {
    const withMedia: Advert = { ...advert, media: [
      { id: 'm1', type: 'image', url: 'https://x/a.jpg', sortOrder: 0 },
    ] };
    expect(advertUpdateFromForm(
      withMedia,
      { title: 'آپارتمان', imageMain: 'https://x/a.jpg', image1: '' },
      ['title', 'imageMain', 'image1'],
    ).media).toBeUndefined();

    const changed = advertUpdateFromForm(
      withMedia,
      { title: 'آپارتمان', imageMain: 'https://x/new.jpg', image1: '' },
      ['title', 'imageMain', 'image1'],
    );
    expect(changed.media).toEqual([
      { type: 'image', url: 'https://x/new.jpg', sortOrder: 0 },
    ]);
  });
});

describe('buildSearchQuery (Phase 17)', () => {
  it('maps q, district, price range and area range onto the query model', () => {
    const query = buildSearchQuery(
      { q: 'آپارتمان', district: 'سعادت‌آباد', minPrice: 1000, maxPrice: 5000, minArea: 80, maxArea: 150, propertyType: 'apartment' },
      { category: 'real-estate' },
    );
    expect(query.q).toBe('آپارتمان');
    expect(query.location).toEqual({ district: 'سعادت‌آباد' });
    expect(query.pricing).toEqual({ min: 1000, max: 5000 });
    expect(query.filters).toEqual({
      area: { min: 80, max: 150 },
      propertyType: 'apartment',
    });
  });

  it('omits empty values and leaves no empty sections', () => {
    const query = buildSearchQuery({ q: '', district: '', minPrice: '', rooms: '' });
    expect(query.q).toBeUndefined();
    expect(query.location).toBeUndefined();
    expect(query.pricing).toBeUndefined();
    expect(query.filters).toEqual({});
  });

  it('keeps unknown non-empty keys as attribute filters', () => {
    const query = buildSearchQuery({ facing: 'north', dealType: 'sell' });
    expect(query.filters).toEqual({ facing: 'north', dealType: 'sell' });
  });

  it('attaches category/subcategory/type from options', () => {
    const query = buildSearchQuery(
      { q: 'x' },
      { category: 'real-estate', subcategory: 'rent', type: 'provider' },
    );
    expect(query.category).toBe('real-estate');
    expect(query.subcategory).toBe('rent');
    expect(query.type).toBe('provider');
  });

  it('gates public search to active adverts by default', () => {
    const query = buildSearchQuery({ q: 'خانه' });
    expect(query.statuses).toEqual(['active']);
  });
});