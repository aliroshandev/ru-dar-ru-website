/**
 * Shared dynamic-form field model (Section 9).
 * These are TYPES consumed by both the Category Registry (Phase 4) and the
 * Dynamic Form Engine (Phase 5). No engine logic lives here.
 */

export type DynamicFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'currency'
  | 'select'
  | 'multi-select'
  | 'checkbox'
  | 'radio'
  | 'switch'
  | 'date'
  | 'date-range'
  | 'location'
  | 'range'
  | 'image'
  | 'file'
  | 'phone'
  | 'email';

export interface DynamicFieldOption<TValue = string | number> {
  value: TValue;
  label: string;
}

/** Built-in validator kinds handled directly by the form engine factory. */
export type BuiltInValidatorName =
  | 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'email';

/**
 * Name of a validator on a field. Built-ins are strongly typed; any other
 * string is a REGISTERED validator resolved by the DynamicValidatorRegistry
 * (e.g. 'phone', 'postalCode'). Keeping this open means adding a custom
 * validator requires only a registry registration — never a model change.
 */
export type DynamicFieldValidatorName = BuiltInValidatorName | 'custom' | 'async' | (string & {});

export interface DynamicFieldValidator {
  name: DynamicFieldValidatorName;
  /** Params (e.g. required=true, min=2, pattern as string/RegExp). */
  params?: unknown;
  /** Message shown when validation fails. */
  message?: string;
}

/** Referenced by its field `key` when browsing sibling fields in the same form. */
export interface DynamicFieldOperator {
  fieldKey: string;
  /** Expected match for equality-based conditions. */
  equals?: unknown;
  /** Expected match for inequality-based conditions. */
  notEquals?: unknown;
}

export interface DynamicFieldCondition {
  /** Single condition against another field. */
  op?: DynamicFieldOperator;
  /** All conditions must hold (AND). */
  and?: readonly DynamicFieldCondition[];
  /** Any condition may hold (OR). */
  or?: readonly DynamicFieldCondition[];
}

export type FieldLayout = 'single' | 'half' | 'third' | 'two-thirds' | 'full' | 'inline';

/**
 * Configuration-driven field definition. Category-specific fields are
 * expressed purely as data here; the renderer (Phase 5) resolves the
 * component via the DynamicFieldRegistry.
 */
export interface DynamicFieldDefinition<TValue = unknown> {
  key: string;
  type: DynamicFieldType;
  label: string;
  description?: string;
  placeholder?: string;
  defaultValue?: TValue;
  options?: readonly DynamicFieldOption[];
  validators?: readonly DynamicFieldValidator[];
  visibleWhen?: DynamicFieldCondition;
  disabledWhen?: DynamicFieldCondition;
  requiredWhen?: DynamicFieldCondition;
  layout?: FieldLayout;
  metadata?: Readonly<Record<string, unknown>>;
}
