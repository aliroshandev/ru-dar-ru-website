import { Component, computed, effect, inject, signal, Signal } from '@angular/core';
import type { FieldTree } from '@angular/forms/signals';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AdvertRepository } from '../../../adverts/data/advert.repository';
import type { AdvertSearchQuery, AdvertSearchResult } from '../../../adverts/domain/advert-search';
import { CategoryRegistry } from '../../../../shared/category/category-registry';
import {
  buildSearchQuery,
  DynamicFormFactory,
  DynamicFormRenderer,
  DynamicFormValues,
} from '../../../../shared/form';
import type {
  AdvertCategoryDefinition,
  AdvertSectionDefinition,
} from '../../../../shared/category/advert-category.model';
import {
  UiAdvertCard,
  UiAlert,
  UiButton,
  UiCard,
  UiEmptyState,
  UiLoading,
  UiSelect,
} from '../../../../shared/ui';

/**
 * Search page (Phase 9). Composes:
 *   1. category + optional subcategory selection (registry-driven)
 *   2. a dynamic search form built from the category's searchSections (or its
 *      sections) in 'search' mode — fields are optional there
 *   3. an AdvertSearchQuery from the live form values
 *   4. results via AdvertRepository.search()
 * The page contains NO category-specific branch — everything is driven by the
 * registry and form engine.
 */
@Component({
  selector: 'app-search-page',
  imports: [
    RouterModule,
    DynamicFormRenderer,
    UiButton,
    UiCard,
    UiSelect,
    UiAdvertCard,
    UiEmptyState,
    UiLoading,
    UiAlert,
  ],
  templateUrl: 'search-page.component.html',
  styleUrl: 'search-page.component.css',
})
export class SearchPageComponent {
  private readonly registry = inject(CategoryRegistry);
  private readonly formFactory = inject(DynamicFormFactory);
  private readonly repository = inject(AdvertRepository);
  private readonly route = inject(ActivatedRoute);

  /** Root categories for the primary selector. */
  readonly rootCategories: Signal<readonly AdvertCategoryDefinition<string>[]> = computed(() =>
    this.registry.rootCategories(),
  );

  readonly selectedCategoryId = signal<string>('');

  /** Subcategories of the selected category (empty when none or none chosen). */
  readonly subcategories: Signal<readonly AdvertCategoryDefinition<string>[]> = computed(() =>
    this.selectedCategoryId() ? this.registry.subcategories(this.selectedCategoryId()) : [],
  );

  readonly selectedSubcategoryId = signal<string>('');

  protected readonly queryResult = signal<{ loading: boolean; data?: AdvertSearchResult; error?: string }>(
    { loading: false },
  );

  /**
   * Sections for the dynamic form, in search mode. Uses searchSections when
   * the category defines them, else falls back to its regular sections.
   */
  protected readonly sections: Signal<readonly AdvertSectionDefinition[]> = computed(() => {
    const category = this.selectedCategoryId();
    if (!category) return [];
    return this.registry.searchSections(category, this.selectedSubcategoryId() || undefined);
  });

  /** Prepared dynamic search form (rebuilt when the category/subcategory changes). */
  protected readonly formContext = computed(() => {
    const sections = this.sections();
    if (sections.length === 0) return undefined;
    return this.formFactory.build('search', sections);
  });

  protected readonly canSearch = computed(
    () => !!this.selectedCategoryId() && !!this.formContext(),
  );

  /** The Signal Forms root tree as consumed by the renderer. */
  protected readonly formTree = computed<FieldTree<Record<string, unknown>> | undefined>(() => {
    const ctx = this.formContext();
    return ctx ? (ctx.form as FieldTree<Record<string, unknown>>) : undefined;
  });

  /** Latest successful results (undefined until a search completes). */
  protected readonly results = computed(() => this.queryResult().data);

  onCategoryChange(value: string): void {
    this.selectedCategoryId.set(value);
    // Reset subcategory and results when switching category.
    this.selectedSubcategoryId.set('');
    this.queryResult.set({ loading: false });
  }

  onSubcategoryChange(value: string): void {
    this.selectedSubcategoryId.set(value);
    this.queryResult.set({ loading: false });
  }

  /** Reads categoryId/subcategoryId query params (from landing-page links). */
  protected readonly queryPreselection = effect(() => {
    const params = this.route.snapshot.queryParamMap;
    const categoryId = params.get('categoryId');
    if (categoryId && this.registry.getById(categoryId)) {
      this.selectedCategoryId.set(categoryId);
    }
    const subcategoryId = params.get('subcategoryId');
    if (subcategoryId && this.registry.getById(subcategoryId)) {
      this.selectedSubcategoryId.set(subcategoryId);
    }
  });

  onSubmit(): void {
    const ctx = this.formContext();
    if (!ctx) return;
    this.runSearch(ctx.values);
  }

  private runSearch(values: DynamicFormValues): void {
    this.queryResult.set({ loading: true });
    const query = this.toQuery(values());
    this.repository
      .search(query)
      .pipe(
        catchError(() => {
          this.queryResult.set({ loading: false, error: 'خطا در جستجو. دوباره تلاش کنید.' });
          return of(null as unknown as AdvertSearchResult);
        }),
      )
      .subscribe((result) => {
        if (result) this.queryResult.set({ loading: false, data: result });
      });
  }

  protected perUnitLabel(categoryId: string): string | undefined {
    return this.registry.getById(categoryId)?.perUnitLabel;
  }

  /** Builds an AdvertSearchQuery from the live form values. */
  private toQuery(values: Readonly<Record<string, unknown>>): AdvertSearchQuery {
    return buildSearchQuery(values, {
      category: this.selectedCategoryId(),
      subcategory: this.selectedSubcategoryId() || undefined,
    });
  }
}