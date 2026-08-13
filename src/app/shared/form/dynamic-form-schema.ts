import type { Signal, WritableSignal } from '@angular/core';
import type { DynamicFieldDefinition } from './dynamic-field.model';

/** Rendering mode for the dynamic form engine (Section 9). */
export type DynamicFormMode = 'create' | 'edit' | 'search' | 'preview';

/**
 * A prepared dynamic form: the Signal Forms FieldTree plus the schema that
 * drove it. Consumed by DynamicFormRenderer, the serializer (Phase 10) and
 * search/query builders (Phase 9).
 */
export interface DynamicFormContext {
  /** Mode the form was built for. */
  mode: DynamicFormMode;
  /** The form field tree node (root) bound to the model. */
  form: unknown;
  /** The reactive model keyed by field key. Read for serialization/querying. */
  values: WritableSignal<Record<string, unknown>>;
  /** Flattened fields in render order. */
  fields: readonly DynamicFieldDefinition[];
}

/**
 * A read-only view of a built form's current values, for building search
 * queries or serializing (Phase 9/10).
 */
export type DynamicFormValues = Signal<Record<string, unknown>>;