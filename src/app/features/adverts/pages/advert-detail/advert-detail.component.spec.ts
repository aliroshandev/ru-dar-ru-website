import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AdvertDetailComponent } from './advert-detail.component';
import { AdvertRepository } from '../../data/advert.repository';
import { MockAdvertRepository } from '../../data/advert.mock-repository';
import { CategoryRegistry } from '../../../../shared/category/category-registry';
import type { Advert } from '../../domain/advert.model';
import type { AdvertCategoryDefinition } from '../../../../shared/category/advert-category.model';

async function flush(delay = 200): Promise<void> {
  await new Promise((r) => setTimeout(r, delay));
}

function makeAdvert(over: Partial<Advert> = {}): Advert {
  return {
    id: 'current',
    type: 'consumer',
    category: 'real-estate',
    subcategory: 'sell',
    title: 'جاری',
    attributes: {},
    media: [],
    status: 'active',
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
    ...over,
  };
}

describe('AdvertDetailComponent (Phase 25 similar adverts)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvertDetailComponent],
      providers: [
        provideRouter([]),
        { provide: AdvertRepository, useClass: MockAdvertRepository },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: 'current' }),
            snapshot: {
              queryParamMap: { get: () => null },
              params: { id: 'current' },
            },
          },
        },
      ],
    }).compileComponents();
  });

  it('loads similar active adverts from the same category, excluding the current one', async () => {
    const registry = TestBed.inject(CategoryRegistry);
    registry.registerDefinition({
      id: 'real-estate',
      label: 'املاک',
      supportedAdvertTypes: ['provider', 'consumer'],
      sections: [],
    } satisfies AdvertCategoryDefinition<'real-estate'>);

    const repo = TestBed.inject(AdvertRepository) as MockAdvertRepository;
    const current = makeAdvert({ id: 'c1', title: 'جاری' });
    const sim1 = makeAdvert({ id: 's1', title: 'مشابه یک' });
    const sim2 = makeAdvert({ id: 's2', title: 'مشابه دو' });

    vi.spyOn(repo, 'getById').mockReturnValue(of(current));
    vi.spyOn(repo, 'search').mockReturnValue(
      of({ items: [sim1, current, sim2], total: 3, page: 1, pageSize: 4 }),
    );

    const component = TestBed.createComponent(AdvertDetailComponent).componentInstance;
    await flush();

    const titles = component.similarAdverts().map((a) => a.title);
    expect(titles).not.toContain(current.title);
    expect(titles).toContain('مشابه یک');
    expect(titles).toContain('مشابه دو');

    // The query must gate on active status and scope to the current category.
    const query = (vi.mocked(repo.search).mock.calls.at(-1)?.[0] ?? {}) as {
      statuses?: unknown;
      category?: unknown;
    };
    expect(query.statuses).toEqual(['active']);
    expect(query.category).toBe('real-estate');
  });
});