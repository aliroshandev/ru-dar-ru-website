import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CategoryLandingComponent } from './category-landing.component';
import { CategoryRegistry } from '../category-registry';
import type { AdvertCategoryDefinition } from '../advert-category.model';

describe('CategoryLandingComponent (Phase 14)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryLandingComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const registry = TestBed.inject(CategoryRegistry);
    const root: AdvertCategoryDefinition<'real-estate'> = {
      id: 'real-estate',
      label: 'املاک',
      description: 'خرید و فروش',
      supportedAdvertTypes: ['provider', 'consumer'],
      sections: [],
    };
    registry.registerDefinition(root, {
      id: 'rent',
      parentId: 'real-estate',
      label: 'اجاره',
      description: 'اجاره مسکونی',
      supportedAdvertTypes: ['provider', 'consumer'],
      sections: [],
    } as AdvertCategoryDefinition<'rent'>);
  });

  it('derives the category and its subcategories from the registry', () => {
    const fixture = TestBed.createComponent(CategoryLandingComponent);
    fixture.componentRef.setInput('categoryId', 'real-estate');
    fixture.detectChanges();
    const component = fixture.componentInstance;
    expect(component.category()?.label).toBe('املاک');
    expect(component.subcategories().map((s) => s.id)).toEqual(['rent']);
  });

  it('returns no subcategories for an unknown category id', () => {
    const fixture = TestBed.createComponent(CategoryLandingComponent);
    fixture.componentRef.setInput('categoryId', 'nope');
    fixture.detectChanges();
    expect(fixture.componentInstance.subcategories()).toEqual([]);
  });
});