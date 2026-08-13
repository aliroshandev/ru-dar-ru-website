import { TestBed } from '@angular/core/testing';
import { CategoryRegistry } from './category-registry';
import { CategoryBootstrap } from './category-bootstrap';

describe('CategoryRegistry', () => {
  let registry: CategoryRegistry;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [CategoryRegistry, CategoryBootstrap] });
    registry = TestBed.inject(CategoryRegistry);
    TestBed.inject(CategoryBootstrap).registerAll();
  });

  it('registers all known categories at bootstrap', () => {
    expect(registry.all().length).toBeGreaterThan(0);
  });

  it('resolves root categories', () => {
    const roots = registry.rootCategories().map((c) => c.id);
    expect(roots).toContain('real-estate');
    expect(roots).toContain('building-materials');
    expect(roots).toContain('building-services');
  });

  it('resolves real-estate subcategories via parentId', () => {
    const subs = registry.subcategories('real-estate').map((c) => c.id);
    expect(subs).toEqual(['rent', 'sell', 'mortgage', 'daily-rent']);
  });

  it('exposes a per-unit label for categories priced by unit (Phase 32)', () => {
    expect(registry.getById('real-estate')?.perUnitLabel).toBe('هر متر');
    expect(registry.getById('building-services')?.perUnitLabel).toBe('هر متر');
    expect(registry.getById('building-materials')?.perUnitLabel).toBe('هر پاکت');
  });

  it('returns sections for a category', () => {
    const sections = registry.sections('real-estate', 'rent');
    expect(sections.length).toBeGreaterThan(0);
    expect(sections[0].fields.length).toBeGreaterThan(0);
  });

  it('real-estate config uses only registered field types', () => {
    const sections = registry.sections('real-estate');
    const types = new Set(
      sections.flatMap((s) => s.fields.map((f) => f.type)),
    );
    // All types must have a resolvable field component (text/textarea/number/
    // currency/select/email/checkbox/switch/date etc. — the registry contract).
    expect(types.size).toBeGreaterThan(0);
    for (const type of types) {
      expect(['text', 'textarea', 'number', 'currency', 'select', 'email', 'checkbox', 'image'])
        .toContain(type);
    }
  });

  it('real-estate sections/fields declare conditions & custom validators (Phase 6)', () => {
    const sections = registry.sections('real-estate');
    const hasConditional = sections.some(
      (s) =>
        s.visibleWhen ||
        s.fields.some((f) => f.visibleWhen || f.disabledWhen || f.requiredWhen),
    );
    const hasCustomValidator = sections.some((s) =>
      s.fields.some((f) =>
        (f.validators ?? []).some((v) => ['phone', 'postalCode', 'nonBlank'].includes(v.name)),
      ),
    );
    expect(hasConditional).toBe(true);
    expect(hasCustomValidator).toBe(true);
  });

  it('marketplace: every category config uses only registered field types & validators', () => {
    const registeredTypes = ['text', 'textarea', 'number', 'currency', 'select', 'email', 'checkbox', 'image'];
    const registeredValidators = ['required', 'min', 'max', 'minLength', 'maxLength', 'pattern', 'email', 'phone', 'postalCode', 'nonBlank'];
    for (const id of ['real-estate', 'building-materials', 'building-services']) {
      const sections = registry.sections(id);
      expect(sections.length).toBeGreaterThan(0);
      for (const section of sections) {
        for (const field of section.fields) {
          expect(registeredTypes).toContain(field.type);
          for (const validator of field.validators ?? []) {
            expect(registeredValidators).toContain(validator.name);
          }
        }
      }
    }
  });

  it('acceptance: adding a custom category needs only id + definition + fields', () => {
    registry.registerDefinition({
      id: 'test-category',
      label: 'Test',
      supportedAdvertTypes: ['provider'],
      sections: [
        {
          id: 's1',
          title: 'S1',
          fields: [{ key: 'name', type: 'text', label: 'Name' }],
        },
      ],
    });
    expect(registry.getById('test-category')).toBeDefined();
    expect(registry.sections('test-category')[0].fields[0].key).toBe('name');
  });
});
