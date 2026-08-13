import { Component, computed, effect, inject, signal } from '@angular/core';
import type { FieldTree } from '@angular/forms/signals';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { catchError, of, tap } from 'rxjs';
import { AdvertRepository } from '../../data/advert.repository';
import type { Advert } from '../../domain/advert.model';
import { CategoryRegistry } from '../../../../shared/category/category-registry';
import {
  advertiseFromForm,
  DynamicFormFactory,
  DynamicFormRenderer,
} from '../../../../shared/form';
import type {
  AdvertSectionDefinition,
} from '../../../../shared/category/advert-category.model';
import {
  UiAlert,
  UiButton,
  UiCard,
  UiEmptyState,
  UiLoading,
  UiSelect,
} from '../../../../shared/ui';

/**
 * Advert creation page (Phase 10). Select a category/subcategory, fill the
 * dynamic create-mode form, and on submit serialize the live values into a
 * CreateAdvertRequest via the shared serializer, then persist via the
 * repository. No category-specific branch exists here.
 */
@Component({
  selector: 'app-advert-create',
  imports: [
    RouterModule,
    DynamicFormRenderer,
    UiButton,
    UiCard,
    UiSelect,
    UiEmptyState,
    UiLoading,
    UiAlert,
  ],
  templateUrl: 'advert-create.component.html',
  styleUrl: 'advert-create.component.css',
})
export class AdvertCreateComponent {
  private readonly registry = inject(CategoryRegistry);
  private readonly formFactory = inject(DynamicFormFactory);
  private readonly repository = inject(AdvertRepository);
  private readonly route = inject(ActivatedRoute);

  readonly rootCategories = computed(() => this.registry.rootCategories());
  readonly selectedCategoryId = signal<string>('');

  readonly subcategories = computed(() =>
    this.selectedCategoryId() ? this.registry.subcategories(this.selectedCategoryId()) : [],
  );
  readonly selectedSubcategoryId = signal<string>('');

  readonly submitState = signal<{ submitting: boolean; error?: string }>({ submitting: false });

  /** Create-mode sections for the selected category (or subcategory). */
  protected readonly sections = computed<readonly AdvertSectionDefinition[]>(() => {
    const category = this.selectedCategoryId();
    if (!category) return [];
    return this.registry.sections(category, this.selectedSubcategoryId() || undefined);
  });

  protected readonly formContext = computed(() => {
    const sections = this.sections();
    if (sections.length === 0) return undefined;
    return this.formFactory.build('create', sections);
  });

  protected readonly formTree = computed<FieldTree<Record<string, unknown>> | undefined>(() => {
    const ctx = this.formContext();
    return ctx ? (ctx.form as FieldTree<Record<string, unknown>>) : undefined;
  });

  protected readonly canSubmit = computed(
    () => !!this.selectedCategoryId() && !!this.formContext(),
  );

  onCategoryChange(value: string): void {
    this.selectedCategoryId.set(value);
    this.selectedSubcategoryId.set('');
    this.submitState.set({ submitting: false });
  }

  onSubcategoryChange(value: string): void {
    this.selectedSubcategoryId.set(value);
    this.submitState.set({ submitting: false });
  }

  /** Preselects category/subcategory from query params (landing-page links). */
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
    const request = advertiseFromForm(ctx.values(), {
      category: this.selectedCategoryId(),
      subcategory: this.selectedSubcategoryId() || undefined,
    });
    if (!request) return;
    this.persist(request);
  }

  protected readonly createdAdvert = signal<Advert | undefined>(undefined);
  protected readonly failed = signal(false);

  private persist(
    request: NonNullable<ReturnType<typeof advertiseFromForm>>,
  ): void {
    this.submitState.set({ submitting: true });
    this.failed.set(false);
    this.repository
      .create(request)
      .pipe(
        tap((advert) => this.createdAdvert.set(advert)),
        catchError(() => {
          this.failed.set(true);
          return of(undefined as unknown as Advert);
        }),
      )
      .subscribe(() => this.submitState.set({ submitting: false }));
  }
}