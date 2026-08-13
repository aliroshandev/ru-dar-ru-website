import type { CategoryRegistry } from './category-registry';
import type { Advert } from '../../features/adverts/domain/advert.model';
import type { DynamicFieldDefinition } from '../form/dynamic-field.model';

/**
 * Read-only presenter for the advert detail page (Phase 11).
 *
 * Converts a stored advert's `attributes` record plus the category's field
 * definitions into displayable, grouped rows. Pure data transformation:
 * no network, no mutation of the advert or the registry.
 */

/**
 * Read-only presenter for the advert detail page (Phase 11).
 *
 * Converts a stored advert's `attributes` record plus the category's field
 * definitions into displayable, grouped rows. Pure data transformation:
 * no network, no mutation of the advert or the registry.
 */

export interface AttributeDisplayRow {
  key: string;
  /** Field definition used for the label + value formatting, if known. */
  definition?: DynamicFieldDefinition;
  label: string;
  value: DisplayValue;
}

export interface DisplayValue {
  text: string;
  kind: 'text' | 'currency' | 'image' | 'code' | 'empty';
}

/** A flat (fields, label, value) row is decorated with a heading group. */
export interface AttributeGroup {
  sectionId: string;
  title: string;
  rows: AttributeDisplayRow[];
}

/**
 * Splits an advert's attributes into logical display groups using the
 * category's section/field configuration. Unknown keys (not in the schema)
 * fall into a trailing "other" group so no data is ever dropped.
 */
export function groupAttributes(
  advert: Advert,
  registry: CategoryRegistry,
): AttributeGroup[] {
  const sections = registry.sections(advert.category, advert.subcategory);

  const fieldByKey = new Map<string, DynamicFieldDefinition>();
  for (const section of sections) {
    for (const field of section.fields) {
      fieldByKey.set(field.key, field);
    }
  }

  const groups: AttributeGroup[] = [];
  const grouped = new Set<string>();

  for (const section of sections) {
    const rows: AttributeDisplayRow[] = [];
    for (const field of section.fields) {
      if (!(field.key in advert.attributes)) continue;
      const value = advert.attributes[field.key];
      if (isEmpty(value)) continue;
      rows.push({
        key: field.key,
        definition: field,
        label: field.label,
        value: formatValue(field, value),
      });
      grouped.add(field.key);
    }
    if (rows.length > 0) {
      groups.push({ sectionId: section.id, title: section.title ?? section.id, rows });
    }
  }

  const otherRows: AttributeDisplayRow[] = [];
  const knownKeys = new Set(fieldByKey.keys());
  for (const [key, value] of Object.entries(advert.attributes)) {
    if (grouped.has(key) || knownKeys.has(key)) continue;
    if (isEmpty(value)) continue;
    otherRows.push({ key, label: key, value: formatRawValue(value) });
  }
  if (otherRows.length > 0) {
    groups.push({ sectionId: '__other__', title: 'سایر مشخصات', rows: otherRows });
  }

  return groups;
}

/**
 * Formats a stored value against its field definition so options become their
 * labels and numbers/currency get localized.
 */
export function formatValue(
  field: DynamicFieldDefinition,
  value: unknown,
): DisplayValue {
  // Select / radio / multi-select — map value(s) to the matching option label(s).
  if (field.options && field.options.length > 0 && field.type !== 'image') {
    const labels = (Array.isArray(value) ? value : [value])
      .map((v) => field.options?.find((o) => equalsOption(o.value, v))?.label)
      .filter((l): l is string => !!l);
    if (labels.length > 0) {
      return { kind: 'text', text: labels.join('، ') };
    }
  }

  if (isImageField(field, value)) {
    return { kind: 'image', text: String(value) };
  }

  if (field.type === 'currency' || isCurrencyField(field)) {
    const num = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(num)) return { kind: 'text', text: String(value) };
    return { kind: 'currency', text: num.toLocaleString('fa-IR') };
  }

  if (typeof value === 'boolean') {
    return { kind: 'text', text: value ? 'بله' : 'خیر' };
  }

  const text = String(value);
  if (!text) return { kind: 'empty', text: '' };
  return { kind: text.length > 24 ? 'code' : 'text', text };
}

function formatRawValue(value: unknown): DisplayValue {
  if (typeof value === 'number') {
    return { kind: 'code', text: value.toLocaleString('fa-IR') };
  }
  return { kind: 'text', text: String(value) };
}

function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || value === '' || value === false;
}

function isImageField(field: DynamicFieldDefinition, value: unknown): boolean {
  return field.type === 'image' && typeof value === 'string' && value.length > 8;
}

function isCurrencyField(field: DynamicFieldDefinition): boolean {
  const meta = field.metadata;
  return !!meta && (meta['kind'] === 'currency' || meta['unit'] === 'تومان');
}

function equalsOption(left: unknown, right: unknown): boolean {
  return String(left) === String(right);
}