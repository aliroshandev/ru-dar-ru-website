import { Component, computed, input } from '@angular/core';
import type { Field, FieldTree } from '@angular/forms/signals';
import { DynamicFieldRenderer } from '../dynamic-field-renderer/dynamic-field-renderer.component';
import type { AdvertSectionDefinition } from '../../category/advert-category.model';
import { evaluateCondition } from '../dynamic-condition';
import type { DynamicFieldDefinition } from '../dynamic-field.model';

/**
 * Renders one section: an optional title and its fields in layout order.
 * Field components are resolved generically via the field renderer → registry.
 * Conditional visibility (`visibleWhen`) is honored: hidden fields are omitted
 * from the DOM. Disabled/readonly availability is applied by the schema
 * factory via the native `disabled`/`hidden` rules and reflected by the
 * `FormField` directive on each bound control.
 */
@Component({
  selector: 'ui-dynamic-section',
  standalone: true,
  imports: [DynamicFieldRenderer],
  template: `
    <section class="flex flex-col gap-4">
      @if (section().title) {
        <h2 class="text-h3 font-semibold text-text">{{ section().title }}</h2>
      }
      <div [class]="layoutClasses()">
        @for (field of visibleFields(); track field.key) {
          <ui-dynamic-field [field]="field" [control]="fieldControl(field.key)" />
        }
      </div>
      @if (section().description) {
        <p class="text-caption text-text-tertiary">{{ section().description }}</p>
      }
    </section>
  `,
})
export class DynamicSectionRenderer {
  readonly section = input.required<AdvertSectionDefinition>();
  readonly tree = input.required<FieldTree<Record<string, unknown>>>();

  /** Fields that pass their `visibleWhen` condition (or have none). */
  protected readonly visibleFields = computed(() =>
    this.section().fields.filter((field) => this.fieldVisible(field)),
  );

  protected readonly layoutClasses = computed(() => {
    const layout = this.section().layout ?? 'stack';
    switch (layout) {
      case 'grid-two':
        return 'grid grid-cols-1 md:grid-cols-2 gap-4';
      case 'grid-three':
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4';
      default:
        return 'flex flex-col gap-4';
    }
  });

  protected fieldControl(key: string): Field<unknown> {
    // FieldTree exposes child nodes via index access keyed by model field name.
    // The model is Record<string, unknown>, so we index generically by key.
    return (this.tree() as unknown as Record<string, Field<unknown>>)[key];
  }

  private fieldVisible(field: DynamicFieldDefinition): boolean {
    if (field.visibleWhen) return this.conditionHolds(field.visibleWhen);
    return true;
  }

  private conditionHolds(condition: NonNullable<DynamicFieldDefinition['visibleWhen']>): boolean {
    return evaluateCondition(condition, (key) => {
      const node = this.fieldControl(key);
      return node?.();
    });
  }
}