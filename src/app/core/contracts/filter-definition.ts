import type { FieldType } from './field-definition';

/** A category-defined filter used in search/listing. Domain-agnostic. */
export interface FilterDefinition {
  key: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
}