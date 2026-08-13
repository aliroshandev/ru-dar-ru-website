import type { InputSignal } from '@angular/core';
import type { Field } from '@angular/forms/signals';
import type { DynamicFieldDefinition } from './dynamic-field.model';

/**
 * Contract implemented by every dynamic field component. The registry instantiates
 * components implementing this adapter; the renderer supplies `field` (definition)
 * and `control` (the Signal Forms `Field` node bound to the field's value).
 * Components must NEVER branch on category — only on field definition/type.
 *
 * `TValue` is the concrete value type the field manages (e.g. string, number,
 * boolean). Components set it so their native control binds to a typed Field.
 */
export interface DynamicFieldAdapter<TValue = unknown> {
  field: InputSignal<DynamicFieldDefinition>;
  control: InputSignal<Field<TValue>>;
}

export type { Field, InputSignal };