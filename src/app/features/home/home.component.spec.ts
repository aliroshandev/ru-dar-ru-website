import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HomeComponent } from './home.component';
import { CategoryRegistry } from '../../shared/category/category-registry';
import type { AdvertCategoryDefinition } from '../../shared/category/advert-category.model';
import { AdvertRepository } from '../../features/adverts/data/advert.repository';
import { MockAdvertRepository } from '../../features/adverts/data/advert.mock-repository';

describe('HomeComponent (Phase 15)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
        { provide: AdvertRepository, useClass: MockAdvertRepository },
      ],
    }).compileComponents();
  });

  it('surfaces the registered root categories from the registry', () => {
    const registry = TestBed.inject(CategoryRegistry);
    registry.registerDefinition({
      id: 'real-estate',
      label: 'املاک',
      supportedAdvertTypes: ['provider', 'consumer'],
      sections: [],
    } satisfies AdvertCategoryDefinition<'real-estate'>);

    const component = TestBed.createComponent(HomeComponent).componentInstance;
    expect(component.rootCategories().map((c) => c.id)).toEqual(['real-estate']);
  });

  it('shows an empty category list when the registry is empty', () => {
    const component = TestBed.createComponent(HomeComponent).componentInstance;
    expect(component.rootCategories()).toEqual([]);
  });

  it('loads the latest adverts from the repository', async () => {
    const repo = TestBed.inject(AdvertRepository) as MockAdvertRepository;
    repo.seed();

    const component = TestBed.createComponent(HomeComponent).componentInstance;
    await new Promise((r) => setTimeout(r, 200));

    expect(component.latestLoaded()).toBe(true);
    expect(component.latest().items.length).toBeGreaterThan(0);
  });
});