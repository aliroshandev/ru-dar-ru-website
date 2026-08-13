import { computed, Service, signal } from '@angular/core';
import type {
  AdvertCategoryId,
  AdvertSubcategoryId,
} from '../../features/adverts/domain/advert-category';
import type { AdvertSectionDefinition } from './advert-category.model';
import type { AdvertCategoryDefinition } from './advert-category.model';

/**
 * Category Registry — the single source of truth for category definitions.
 *
 * Adding a category must require ONLY: a new category id + a definition
 * (sections + fields). Nothing here branches on a specific category;
 * parent/subcategory relationships are resolved generically via `parentId`.
 */
@Service()
export class CategoryRegistry {
  private readonly definitions = signal<readonly AdvertCategoryDefinition<string>[]>([]);

  /** Always-be-fresh derived lookup maps built from the flat list. */
  private readonly byId = computed(() => {
    const map = new Map<string, AdvertCategoryDefinition<string>>();
    for (const def of this.definitions()) {
      map.set(def.id, def);
    }
    return map;
  });

  private readonly byParent = computed(() => {
    const map = new Map<string, AdvertCategoryDefinition<string>[]>();
    for (const def of this.definitions()) {
      const parent = def.parentId ?? def.id;
      const list = map.get(parent) ?? [];
      list.push(def);
      map.set(parent, list);
    }
    return map;
  });

  /** Register one or more category definitions (idempotent by id). */
  registerDefinition(...defs: readonly AdvertCategoryDefinition<string>[]): void {
    this.definitions.update((current) => {
      const existing = new Map(current.map((d) => [d.id, d]));
      for (const def of defs) {
        existing.set(def.id, def);
      }
      return [...existing.values()];
    });
  }

  all(): readonly AdvertCategoryDefinition<string>[] {
    return this.definitions();
  }

  getById(id: AdvertCategoryId | string): AdvertCategoryDefinition<string> | undefined {
    return this.byId().get(id);
  }

  /** Top-level categories (those without a parentId). */
  rootCategories(): readonly AdvertCategoryDefinition<string>[] {
    return this.definitions().filter((d) => d.parentId === undefined);
  }

  /** Subcategories of a given category id, resolved via parentId. */
  subcategories<TParentId extends string>(
    parentId: TParentId,
  ): readonly AdvertCategoryDefinition<string>[] {
    return (
      this.byParent()
        .get(parentId)
        ?.filter((d) => d.parentId !== undefined) ?? []
    );
  }

  /**
   * Effective sections for a category + optional subcategory.
   * Falls back to the category's own sections when no subcategory is selected
   * or when the subcategory has no dedicated override.
   */
  sections(
    categoryId: AdvertCategoryId | string,
    subcategory?: AdvertSubcategoryId | string,
  ): readonly AdvertSectionDefinition[] {
    if (subcategory) {
      const sub = this.byId().get(subcategory);
      if (sub && sub.sections.length > 0) {
        return sub.sections;
      }
    }
    return this.byId().get(categoryId)?.sections ?? [];
  }

  searchSections(
    categoryId: AdvertCategoryId | string,
    subcategory?: AdvertSubcategoryId | string,
  ): readonly AdvertSectionDefinition[] {
    if (subcategory) {
      const sub = this.byId().get(subcategory);
      if (sub && sub.searchSections) {
        return sub.searchSections;
      }
      const subSections = sub?.sections ?? [];
      if (subSections.length > 0) {
        return subSections;
      }
    }
    const override = this.byId().get(categoryId)?.searchSections;
    if (override && override.length > 0) {
      return override;
    }
    return this.byId().get(categoryId)?.sections ?? [];
  }

  /**
   * All fields across a category's (or subcategory's) sections, in order.
   * Useful for serialization/deserialization and search filter building.
   */
  fieldKeys(
    categoryId: AdvertCategoryId | string,
    subcategory?: AdvertSubcategoryId | string,
  ): readonly string[] {
    return this.sections(categoryId, subcategory).flatMap((section) =>
      section.fields.map((field) => field.key),
    );
  }
}
