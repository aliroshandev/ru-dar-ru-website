import { Service, inject } from '@angular/core';
import { DynamicFieldRegistry } from './dynamic-field-registry';
import { UiFieldText } from './fields/text-field/text-field.component';
import { UiFieldTextarea } from './fields/textarea-field/textarea-field.component';
import { UiFieldNumber } from './fields/number-field/number-field.component';
import { UiFieldCurrency } from './fields/currency-field/currency-field.component';
import { UiFieldSelect } from './fields/select-field/select-field.component';
import { UiFieldEmail } from './fields/email-field/email-field.component';
import { UiFieldCheckbox } from './fields/checkbox-field/checkbox-field.component';
import { UiFieldImage } from './fields/image-field/image-field.component';

/**
 * Registers the built-in field components into the DynamicFieldRegistry.
 * Adding a new field type requires only: a component + a registration here.
 */
@Service()
export class DynamicFieldBootstrap {
  private readonly registry = inject(DynamicFieldRegistry);

  registerFields(): void {
    this.registry.registerMany([
      { type: 'text', component: UiFieldText },
      { type: 'textarea', component: UiFieldTextarea },
      { type: 'number', component: UiFieldNumber },
      { type: 'currency', component: UiFieldCurrency },
      { type: 'select', component: UiFieldSelect },
      { type: 'email', component: UiFieldEmail },
      { type: 'checkbox', component: UiFieldCheckbox },
      { type: 'image', component: UiFieldImage },
    ]);
  }
}