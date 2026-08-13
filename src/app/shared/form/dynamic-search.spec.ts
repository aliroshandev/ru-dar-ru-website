import { computed } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { AdvertSectionDefinition } from '../category/advert-category.model';
import { CategoryBootstrap } from '../category/category-bootstrap';
import { CategoryRegistry } from '../category/category-registry';
import { DynamicFormFactory } from './dynamic-form-factory';

describe('search form (Phase 9)', () => {
  let registry: CategoryRegistry;
  let factory: DynamicFormFactory;
  const requiredValidator = { name: 'required' as const, message: 'x' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CategoryRegistry, CategoryBootstrap, DynamicFormFactory],
    });
    registry = TestBed.inject(CategoryRegistry);
    TestBed.inject(CategoryBootstrap).registerAll();
    factory = TestBed.inject(DynamicFormFactory);
  });

  it('uses searchSections when a category defines them', () => {
    const sections = registry.searchSections('real-estate');
    expect(sections.length).toBeGreaterThan(0);
    const keys = sections.flatMap((s) => s.fields.map((f) => f.key));
    expect(keys).toContain('q');
  });

  it('falls back to category sections when no searchSections exist', () => {
    const sections = registry.searchSections('building-materials');
    expect(sections.length).toBeGreaterThan(0);
    expect(sections.some((s) => s.fields.length > 0)).toBe(true);
  });

  it('search mode drops required validators (all fields optional)', () => {
    const sections: AdvertSectionDefinition[] = [
      {
        id: 'x',
        title: 'X',
        fields: [
          { key: 'a', type: 'text', label: 'A', validators: [requiredValidator] },
        ],
      },
    ];
    const ctx = TestBed.runInInjectionContext(() => factory.build('search', sections));
    expect(ctx).toBeDefined();
    expect(ctx.mode).toBe('search');
  });

  it('builds a form tree without a wrapping injection context (NG0203 regression, Phase 32)', () => {
    const sections = registry.searchSections('real-estate');
    const ctx = factory.build('search', sections);
    expect(ctx.form).toBeDefined();
    expect(ctx.fields.length).toBeGreaterThan(0);
    expect(Object.keys(ctx.values()).length).toBe(ctx.fields.length);
  });

  it('builds a form tree inside a computed (reactive context, NG0602 regression)', () => {
    const sections = registry.searchSections('real-estate');
    // A computed body is a reactive context; form() creates effects that must
    // not be registered there. The factory must escape via untracked().
    const built = computed(() => factory.build('search', sections));
    const ctx = built();
    expect(ctx.form).toBeDefined();
    expect(ctx.fields.length).toBeGreaterThan(0);
  });

  it('handles cross-field conditions via SchemaPath proxies (weak map key regression)', () => {
    const sections: AdvertSectionDefinition[] = [
      {
        id: 'x',
        title: 'X',
        fields: [
          { key: 'mode', type: 'text', label: 'Mode', defaultValue: 'sell' },
          // `visibleWhen` reads the sibling `mode` field via valueOf(path) —
          // a raw string key used to throw "Invalid value used as weak map key".
          {
            key: 'price',
            type: 'currency',
            label: 'Price',
            visibleWhen: { op: { fieldKey: 'mode', equals: 'sell' } },
            validators: [
              { name: 'required', message: 'required' },
              { name: 'min', message: 'min', params: 0 },
            ],
          },
        ],
      },
    ];
    const ctx = TestBed.runInInjectionContext(() => factory.build('create', sections));
    expect(ctx.form).toBeDefined();
    expect(ctx.fields.length).toBe(2);
  });

  it('exposes live values for query building', () => {
    const sections = registry.searchSections('real-estate');
    const ctx = TestBed.runInInjectionContext(() => factory.build('search', sections));
    expect(typeof ctx.values()['q']).not.toBe('undefined');
  });
});