import { describe, expect, it } from 'vitest';
import type { Advert } from '../../features/adverts/domain/advert.model';
import type { AdvertCategoryDefinition } from './advert-category.model';
import { groupAttributes } from './advert-attributes.presenter';
import { CategoryRegistry } from './category-registry';

function buildRegistry(): CategoryRegistry {
  const registry = new CategoryRegistry();
  const definition: AdvertCategoryDefinition<'real-estate'> = {
    id: 'real-estate',
    label: 'املاک',
    supportedAdvertTypes: ['provider', 'consumer'],
    sections: [
      {
        id: 'basic',
        title: 'مشخصات عمومی',
        fields: [
          { key: 'rooms', type: 'number', label: 'تعداد اتاق' },
          { key: 'facing', type: 'select', label: 'جهت', options: [{ value: 'north', label: 'شمالی' }] },
          { key: 'price', type: 'currency', label: 'قیمت' },
        ],
      },
    ],
  };
  registry.registerDefinition(definition);
  return registry;
}

describe('groupAttributes (Phase 11 presenter)', () => {
  it('groups known fields under their section, mapping labels and options', () => {
    const registry = buildRegistry();
    const advert: Advert = {
      id: 'a1',
      type: 'consumer',
      category: 'real-estate',
      title: 'آپارتمان',
      attributes: { rooms: 3, facing: 'north' },
      media: [],
      status: 'active',
      createdAt: '',
      updatedAt: '',
    };
    const groups = groupAttributes(advert, registry);
    expect(groups).toHaveLength(1);
    expect(groups[0].title).toBe('مشخصات عمومی');
    expect(groups[0].rows.map((r) => r.label)).toEqual(['تعداد اتاق', 'جهت']);
    expect(groups[0].rows[1].value.text).toBe('شمالی');
  });

  it('formats currency values with Persian locale digits', () => {
    const registry = buildRegistry();
    const advert: Advert = {
      id: 'a2',
      type: 'consumer',
      category: 'real-estate',
      title: 'ویلایی',
      attributes: { price: 12000000 },
      media: [],
      status: 'active',
      createdAt: '',
      updatedAt: '',
    };
    const groups = groupAttributes(advert, registry);
    const row = groups[0].rows.find((r) => r.key === 'price')!;
    expect(row.value.kind).toBe('currency');
    const fa = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const normalized = row.value.text
      .replace(/٬/g, '')
      .replace(/[۰-۹]/g, (d) => String(fa.indexOf(d)));
    expect(normalized).toBe('12000000');
  });

  it('sends unknown attribute keys to a trailing "other" group (no data loss)', () => {
    const registry = buildRegistry();
    const advert: Advert = {
      id: 'a3',
      type: 'consumer',
      category: 'real-estate',
      title: 'x',
      attributes: { rooms: 2, customNotes: 'چیز اضافه' },
      media: [],
      status: 'active',
      createdAt: '',
      updatedAt: '',
    };
    const groups = groupAttributes(advert, registry);
    expect(groups).toHaveLength(2);
    expect(groups[1].title).toBe('سایر مشخصات');
    expect(groups[1].rows[0].label).toBe('customNotes');
  });

  it('drops empty, null, and false attribute values', () => {
    const registry = buildRegistry();
    const advert: Advert = {
      id: 'a4',
      type: 'consumer',
      category: 'real-estate',
      title: 'x',
      attributes: { rooms: 0, isEmpty: false, nothing: null, blank: '' },
      media: [],
      status: 'active',
      createdAt: '',
      updatedAt: '',
    };
    const groups = groupAttributes(advert, registry);
    const rows = groups.flatMap((g) => g.rows);
    expect(rows.map((r) => r.key)).toEqual(['rooms']);
  });
});