import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import type { Field } from '@angular/forms/signals';
import { DynamicFieldBootstrap } from '../dynamic-field-bootstrap';
import { DynamicFieldRegistry } from '../dynamic-field-registry';
import { DynamicFormFactory } from '../dynamic-form-factory';
import { DynamicFieldRenderer } from './dynamic-field-renderer.component';
import type { DynamicFieldDefinition } from '../dynamic-field.model';
import type { AdvertSectionDefinition } from '../../category/advert-category.model';

describe('DynamicFieldRenderer (label rendering)', () => {
  let factory: DynamicFormFactory;
  let registry: DynamicFieldRegistry;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DynamicFieldRenderer],
      providers: [DynamicFieldRegistry, DynamicFieldBootstrap, DynamicFormFactory],
    });
    registry = TestBed.inject(DynamicFieldRegistry);
    TestBed.inject(DynamicFieldBootstrap).registerFields();
    factory = TestBed.inject(DynamicFormFactory);
  });

  /** Builds a real single-field form so the field's FormField directive works. */
  function controlFor(field: DynamicFieldDefinition): Field<unknown> {
    const section: AdvertSectionDefinition = {
      id: 's',
      title: 'S',
      fields: [field],
    };
    const ctx = TestBed.runInInjectionContext(() => factory.build('create', [section]));
    const tree = ctx.form as unknown as Record<string, Field<unknown>>;
    return tree[field.key];
  }

  function mount(field: DynamicFieldDefinition) {
    const fixture = TestBed.createComponent(DynamicFieldRenderer);
    fixture.componentRef.setInput('field', field);
    fixture.componentRef.setInput('control', controlFor(field));
    fixture.detectChanges();
    return fixture;
  }

  it('renders the field label above a non-checkbox control', () => {
    const fixture = mount({ key: 'a', type: 'text', label: 'عنوان آگهی' });
    const label = fixture.debugElement.query(By.css('label'));
    expect(label).toBeTruthy();
    expect(label.nativeElement.textContent.trim()).toBe('عنوان آگهی');
  });

  it('renders the field description when present', () => {
    const fixture = mount({
      key: 'a',
      type: 'text',
      label: 'عنوان',
      description: 'جزئیات بیشتر',
    });
    const desc = fixture.debugElement.query(By.css('p.text-caption'));
    expect(desc).toBeTruthy();
    expect(desc.nativeElement.textContent.trim()).toBe('جزئیات بیشتر');
  });

  it('does not render an external label for checkbox (it has an inline one)', () => {
    const fixture = mount({ key: 'a', type: 'checkbox', label: 'پارکینگ' });
    // The renderer must not add its own `for`-labelled label for checkbox.
    const external = fixture.debugElement.query(By.css('label[for]'));
    expect(external).toBeNull();
  });

  it('instantiates registered field components with a single label each', () => {
    const fields: DynamicFieldDefinition[] = [
      { key: 'a', type: 'text', label: 'متن' },
      { key: 'b', type: 'number', label: 'عدد' },
      { key: 'c', type: 'select', label: 'انتخاب' },
      { key: 'd', type: 'email', label: 'ایمیل' },
      { key: 'e', type: 'currency', label: 'قیمت' },
      { key: 'f', type: 'textarea', label: 'توضیح' },
      { key: 'g', type: 'image', label: 'تصویر' },
    ];
    for (const field of fields) {
      expect(registry.has(field.type)).toBe(true);
      const fixture = mount(field);
      const labels = fixture.debugElement.queryAll(By.css('label'));
      expect(labels.length).toBe(1);
    }
  });
});