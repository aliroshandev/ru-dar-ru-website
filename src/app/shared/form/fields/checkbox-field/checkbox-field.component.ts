import { Component, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import type { Field } from '@angular/forms/signals';
import type { DynamicFieldDefinition } from '../../dynamic-field.model';
import type { DynamicFieldAdapter } from '../../dynamic-field-adapter';

@Component({
  selector: 'ui-field-checkbox',
  imports: [FormField],
  template: `
    <label class="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        [formField]="control()"
        class="h-5 w-5 rounded border-border text-text focus:outline-2 focus:outline-border-focus disabled:opacity-50"
      />
      <span class="text-body-medium text-text">{{ field().label }}</span>
    </label>
  `,
})
export class UiFieldCheckbox implements DynamicFieldAdapter<boolean> {
  readonly field = input.required<DynamicFieldDefinition>();
  readonly control = input.required<Field<boolean>>();
}