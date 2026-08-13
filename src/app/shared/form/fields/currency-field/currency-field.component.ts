import { Component, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import type { Field } from '@angular/forms/signals';
import type { DynamicFieldDefinition } from '../../dynamic-field.model';
import type { DynamicFieldAdapter } from '../../dynamic-field-adapter';

@Component({
  selector: 'ui-field-currency',
  imports: [FormField],
  template: `
    <input
      type="number"
      inputmode="numeric"
      step="1"
      [formField]="control()"
      class="w-full text-start border border-border bg-surface text-text rounded-lg px-3 py-2 text-body-medium placeholder:text-text-tertiary focus:outline-2 focus:outline-border-focus disabled:opacity-50 disabled:cursor-not-allowed"
    />
  `,
})
export class UiFieldCurrency implements DynamicFieldAdapter<number | null> {
  readonly field = input.required<DynamicFieldDefinition>();
  readonly control = input.required<Field<number | null>>();
}