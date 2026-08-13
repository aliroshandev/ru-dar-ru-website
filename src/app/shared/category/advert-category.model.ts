import type { AdvertCategoryId } from '../../features/adverts/domain/advert-category';
import type { AdvertType } from '../../features/adverts/domain/advert-type';
import type { DynamicFieldCondition } from '../form/dynamic-field.model';
import type { DynamicFieldDefinition } from '../form/dynamic-field.model';

export type SectionLayout = 'stack' | 'grid-two' | 'grid-three';

/**
 * A logical group of fields within a category's form/search schema.
 * `visibleWhen` (a generic condition) gates the whole section.
 */
export interface AdvertSectionDefinition {
  id: string;
  title: string;
  description?: string;
  fields: readonly DynamicFieldDefinition[];
  visibleWhen?: DynamicFieldCondition;
  layout?: SectionLayout;
}

/**
 * Single source of truth for a category (Section 8).
 * Adding a category requires ONLY: id + this definition (+ sections/fields);
 * the Dynamic Form Engine (Phase 5) must render it unmodified.
 */
export interface AdvertCategoryDefinition<TCategoryId extends string = AdvertCategoryId> {
  id: TCategoryId;
  label: string;
  description?: string;
  /** Parent category id — present only for subcategory definitions. */
  parentId?: AdvertCategoryId | string;
  supportedAdvertTypes: readonly AdvertType[];
  /** Label shown after a per-unit price, e.g. «هر متر» (real estate/services). */
  perUnitLabel?: string;
  sections: readonly AdvertSectionDefinition[];
  /** Optional separate schema used by the search page (Section 9/10). */
  searchSections?: readonly AdvertSectionDefinition[];
}

export type { DynamicFieldDefinition };
