import { Component, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import type { Field } from '@angular/forms/signals';
import type { DynamicFieldDefinition } from '../../dynamic-field.model';
import type { DynamicFieldAdapter } from '../../dynamic-field-adapter';

/**
 * Image URL field. Holds a single storage/absolute image URL; listing authors
 * paste URLs rather than upload files (a real upload pipe can swap this later
 * without touching the schema).
 */
@Component({
  selector: 'ui-field-image',
  imports: [FormField],
  template: `
    <input
      type="url"
      [formField]="control()"
      placeholder="https://..."
      class="w-full border border-border bg-surface text-text rounded-lg px-3 py-2 text-body-medium placeholder:text-text-tertiary focus:outline-2 focus:outline-border-focus disabled:opacity-50 disabled:cursor-not-allowed"
    />
  `,
})
export class UiFieldImage implements DynamicFieldAdapter<string> {
  readonly field = input.required<DynamicFieldDefinition>();
  readonly control = input.required<Field<string>>();
}