import type { FieldDefinition } from './field-definition';

/** A logical group of fields within a category's form/search schema. */
export interface SectionDefinition {
  key: string;
  label: string;
  fields: FieldDefinition[];
}