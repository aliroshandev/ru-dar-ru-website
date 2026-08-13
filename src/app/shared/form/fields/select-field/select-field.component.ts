import { Component, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import type { Field } from '@angular/forms/signals';
import type { DynamicFieldDefinition } from '../../dynamic-field.model';
import type { DynamicFieldAdapter } from '../../dynamic-field-adapter';

@Component({
  selector: 'ui-field-select',
  imports: [FormField],
  template: `
    <select
      [formField]="control()"
      class="w-full border border-border bg-surface text-text rounded-lg px-3 py-2 text-body-medium focus:outline-2 focus:outline-border-focus disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <option value="" disabled>—</option>
      @for (option of field().options ?? []; track option.value) {
        <option [value]="option.value">{{ option.label }}</option>
      }
    </select>
  `,
})
export class UiFieldSelect implements DynamicFieldAdapter<string> {
  readonly field = input.required<DynamicFieldDefinition>();
  readonly control = input.required<Field<string>>();
}