import type { AdvertType } from './advert-type';

/**
 * The concrete input shapes a Dynamic Form Engine must render.
 * Domain-agnostic — a category-expressed list of field types, never a
 * Real Estate layout.
 */
export type FieldType =
  | 'text'
  | 'number'
  | 'select'
  | 'multi-select'
  | 'boolean'
  | 'range'
  | 'location-picker'
  | 'media'
  | 'textarea';

/** Configuration-driven field definition (see master roadmap §5/8). */
export interface FieldDefinition {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: { value: string; label: string }[];
  /** Validation config interpreted by the form engine — not hard-coded here. */
  validation?: Record<string, unknown>;
  /**
   * Expression evaluated against other field values.
   * The engine interprets it generically; no interpretation hard-coded here.
   */
  visibilityRule?: string;
  /** Which advert types this field applies to (e.g. only 'provider', or both). */
  appliesTo?: AdvertType[];
  /** Other field keys whose values this field's visibility/options depend on. */
  dependsOn?: string[];
}