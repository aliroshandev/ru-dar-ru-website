/**
 * Domain-agnostic core contracts barrel.
 * Exports all Phase 1 types/interfaces for imports elsewhere.
 * See README.md in this folder for the domain-agnostic constraint.
 */
export type { Advert } from './advert.model';
export type { AdvertType } from './advert-type';
export type { AdvertLocation } from './advert-location';
export type { Media } from './media';

export type { FieldType, FieldDefinition } from './field-definition';
export type { SectionDefinition } from './section-definition';
export type { FilterDefinition } from './filter-definition';
export type { CategoryDefinition } from './category-definition';

export type { CategoryDefinitionSource } from './repositories/category-definition-source';
export type { AdvertRepository } from './repositories/advert-repository';