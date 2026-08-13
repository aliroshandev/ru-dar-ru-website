import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { MockAdvertRepository } from './advert.mock-repository';
import { AdvertRepository } from './advert.repository';
import type { CreateAdvertRequest } from '../domain/advert-requests';
import type { AdvertSearchQuery } from '../domain/advert-search';

async function searchAll(repo: MockAdvertRepository, query: Partial<AdvertSearchQuery>) {
  const result = await firstValueFrom(
    repo.search({ filters: {}, ...query } as AdvertSearchQuery),
  );
  return { total: result.total, titles: result.items.map((a) => a.title) };
}

describe('MockAdvertRepository', () => {
  let repo: MockAdvertRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: AdvertRepository, useClass: MockAdvertRepository }],
    });
    repo = TestBed.inject(AdvertRepository) as MockAdvertRepository;
  });

  it('provides the AdvertRepository contract', () => {
    expect(repo).toBeInstanceOf(AdvertRepository);
  });

  it('seeds fixture adverts idempotently', async () => {
    repo.seed();
    const once = await searchAll(repo, {});
    repo.seed();
    const twice = await searchAll(repo, {});
    expect(once.total).toBeGreaterThan(0);
    expect(twice.total).toBe(once.total);
  });

  it('creates and then retrieves an advert', async () => {
    const request: CreateAdvertRequest = {
      type: 'provider',
      category: 'real-estate',
      subcategory: 'rent',
      title: 'ویلایی',
      attributes: { bedrooms: 3 },
      media: [],
    };
    const created = await firstValueFrom(repo.create(request));
    expect(created.id).toBeTruthy();
    expect(created.status).toBe('active');

    const found = await firstValueFrom(repo.getById(created.id));
    expect(found.title).toBe('ویلایی');
  });

  it('deletes an advert and removes it from search', async () => {
    const created = await firstValueFrom(
      repo.create({
        type: 'consumer',
        category: 'building-materials',
        title: 'آجر',
        attributes: { materialType: 'brick' },
        media: [],
      }),
    );
    await firstValueFrom(repo.delete(created.id));

    await expect(firstValueFrom(repo.getById(created.id))).rejects.toThrow();
    const result = await searchAll(repo, { q: 'آجر' });
    expect(result.total).toBe(0);
  });

  it('updates an advert status', async () => {
    const created = await firstValueFrom(
      repo.create({
        type: 'consumer',
        category: 'real-estate',
        title: 'زمین',
        attributes: { propertyType: 'land' },
        media: [],
      }),
    );
    expect(created.status).toBe('active');

    const updated = await firstValueFrom(repo.update(created.id, { status: 'sold' }));
    expect(updated.status).toBe('sold');

    const reloaded = await firstValueFrom(repo.getById(created.id));
    expect(reloaded.status).toBe('sold');
  });
});

describe('MockAdvertRepository search filtering (Phase 16)', () => {
  let repo: MockAdvertRepository;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [{ provide: AdvertRepository, useClass: MockAdvertRepository }],
    });
    repo = TestBed.inject(AdvertRepository) as MockAdvertRepository;

    const seed: CreateAdvertRequest[] = [
      {
        type: 'consumer', category: 'real-estate', subcategory: 'sell', title: 'ویلایی شمال',
        location: { city: 'تهران', district: 'سعادت‌آباد' }, pricing: { price: 5_000_000_000 },
        attributes: { rooms: 4, facing: 'north' }, media: [],
      },
      {
        type: 'consumer', category: 'real-estate', subcategory: 'sell', title: 'آپارتمان',
        location: { city: 'تهران', district: 'ولنجک' }, pricing: { price: 3_000_000_000 },
        attributes: { rooms: 2, facing: 'south' }, media: [],
      },
      {
        type: 'consumer', category: 'building-materials', title: 'سیمان ۵۰ کیلویی',
        pricing: { price: 300_000 }, attributes: { brand: 'خزر' }, media: [],
      },
      {
        type: 'provider', category: 'building-services', title: 'خدمات نقاشی',
        attributes: { serviceType: 'renovation' }, media: [],
      },
    ];
    for (const s of seed) await firstValueFrom(repo.create(s));
  });

  it('filters by a category-specific attribute', async () => {
    const result = await searchAll(repo, { filters: { facing: 'north' } });
    expect(result.titles).toEqual(['ویلایی شمال']);
  });

  it('matches array-valued attributes by membership', async () => {
    await firstValueFrom(
      repo.create({
        type: 'consumer', category: 'real-estate', title: 'مغازه',
        attributes: { features: ['elevator', 'parking'] }, media: [],
      } satisfies CreateAdvertRequest),
    );
    const result = await searchAll(repo, { filters: { features: ['elevator'] } });
    expect(result.titles).toContain('مغازه');
  });

  it('filters by exact location field', async () => {
    const result = await searchAll(repo, { location: { district: 'ولنجک' } });
    expect(result.titles).toEqual(['آپارتمان']);
  });

  it('performs fuzzy location matching across location parts', async () => {
    const result = await searchAll(repo, { location: { q: 'تهران' } });
    expect(result.total).toBe(2);
  });

  it('filters by price range', async () => {
    const result = await searchAll(repo, { pricing: { min: 1_000_000_000, max: 4_000_000_000 } });
    expect(result.titles).toEqual(['آپارتمان']);
  });

  it('sorts by price ascending and newest', async () => {
    const asc = await searchAll(repo, { sort: 'price-asc' });
    expect(asc.titles[0]).toBe('سیمان ۵۰ کیلویی');
    const newest = await searchAll(repo, { category: 'real-estate', sort: 'newest' });
    expect(newest.titles.length).toBe(2);
  });

  it('returns no results when a filter matches nothing', async () => {
    const result = await searchAll(repo, { filters: { facing: 'east' } });
    expect(result.total).toBe(0);
  });

  it('performs free-text search across title and description', async () => {
    const result = await searchAll(repo, { q: 'ویلایی شمال' });
    expect(result.titles).toEqual(['ویلایی شمال']);
  });

  it('applies a numeric range filter', async () => {
    const result = await searchAll(repo, { filters: { rooms: { min: 3 } } });
    expect(result.titles).toEqual(['ویلایی شمال']);
  });

  it('restricts results to a specific set of ids', async () => {
    const { items } = await firstValueFrom(repo.search({ filters: {} }));
    const ids = items.slice(0, 2).map((a) => a.id);
    const result = await searchAll(repo, { ids });
    expect(result.total).toBe(ids.length);
  });

  it('filters by advert type', async () => {
    const result = await searchAll(repo, { type: 'provider' });
    expect(result.titles).toEqual(['خدمات نقاشی']);
  });

  it('excludes non-active adverts when a status gate is set', async () => {
    const { items } = await firstValueFrom(repo.search({ filters: {} }));
    const sold = items[0];
    await firstValueFrom(repo.update(sold.id, { status: 'sold' }));

    const gated = await searchAll(repo, { statuses: ['active'] });
    expect(gated.titles).not.toContain(sold.title);

    const ungated = await searchAll(repo, {});
    expect(ungated.titles).toContain(sold.title);
  });
});
