import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { catchError, of, tap } from 'rxjs';
import { AdvertRepository } from '../../data/advert.repository';
import type { AdvertSearchQuery, AdvertSearchResult, AdvertSort } from '../../domain/advert-search';
import type { Advert } from '../../domain/advert.model';
import type { AdvertType } from '../../domain/advert-type';
import { CategoryRegistry } from '../../../../shared/category/category-registry';
import {
  UiAdvertCard,
  UiButton,
  UiCard,
  UiEmptyState,
  UiErrorState,
  UiLoading,
  UiSelect,
} from '../../../../shared/ui';

const PAGE_SIZE = 12;

/**
 * Advert list / marketplace browse page (Phase 13). Loads a paginated slice of
 * adverts via AdvertRepository.search() and lets the user filter by category,
 * choose a sort order, and page through results. The card grid is reused and
 * category-agnostic — no branching on a specific category.
 */
@Component({
  selector: 'app-advert-list',
  imports: [RouterModule, CommonModule, UiButton, UiCard, UiSelect, UiAdvertCard, UiEmptyState, UiLoading, UiErrorState],
  templateUrl: 'advert-list.component.html',
  styleUrl: 'advert-list.component.css',
})
export class AdvertListComponent {
  private readonly repository = inject(AdvertRepository);
  private readonly registry = inject(CategoryRegistry);
  private readonly route = inject(ActivatedRoute);

  readonly rootCategories = computed(() => this.registry.rootCategories());

  readonly typeOptions = computed<{ value: AdvertType; label: string }[]>(() => {
    const categoryId = this.selectedCategory();
    const supported = categoryId
      ? this.registry.getById(categoryId)?.supportedAdvertTypes
      : (['provider', 'consumer'] as const);
    return [...(supported ?? ['provider', 'consumer'])].map((type) => ({
      value: type,
      label: type === 'provider' ? 'ارائه‌دهنده' : 'خریدار / مصرف‌کننده',
    }));
  });

  readonly allTypeOptions = computed<{ value: AdvertType | ''; label: string }[]>(() => [
    { value: '', label: 'همه' },
    ...this.typeOptions(),
  ]);

  readonly selectedCategory = signal<string>('');
  readonly selectedType = signal<AdvertType | ''>('');
  readonly selectedSort = signal<AdvertSort>('newest');
  readonly page = signal(1);

  readonly state = signal<{ loading: boolean; data?: AdvertSearchResult; error?: string }>({
    loading: true,
  });

  readonly sortOptions: { value: AdvertSort; label: string }[] = [
    { value: 'newest', label: 'جدیدترین' },
    { value: 'oldest', label: 'قدیمی‌ترین' },
    { value: 'price-asc', label: 'ارزان‌ترین' },
    { value: 'price-desc', label: 'گران‌ترین' },
  ];

  readonly results = computed(() => this.state().data);

  readonly totalPages = computed(() => {
    const data = this.state().data;
    if (!data) return 0;
    return Math.max(1, Math.ceil(data.total / data.pageSize));
  });

  constructor() {
    this.load();
  }

  /** Preselects the category filter from query params (landing page links). */
  protected readonly queryPreselection = effect(() => {
    const categoryId = this.route.snapshot.queryParamMap.get('categoryId');
    if (categoryId && this.registry.getById(categoryId)) {
      this.selectedCategory.set(categoryId);
      this.load();
    }
  });

  onCategoryChange(value: string): void {
    this.selectedCategory.set(value);
    const supported = value ? this.registry.getById(value)?.supportedAdvertTypes : undefined;
    if (this.selectedType() && supported && !supported.includes(this.selectedType() as AdvertType)) {
      this.selectedType.set('');
    }
    this.page.set(1);
    this.load();
  }

  onTypeChange(value: string): void {
    this.selectedType.set(value as AdvertType | '');
    this.page.set(1);
    this.load();
  }

  onSortChange(value: string): void {
    this.selectedSort.set(value as AdvertSort);
    this.page.set(1);
    this.load();
  }

  goTo(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.page.set(page);
    this.load();
  }

  retry(): void {
    this.load();
  }

  private load(): void {
    this.state.set({ loading: true });
    const query: AdvertSearchQuery = {
      category: (this.selectedCategory() || undefined) as AdvertSearchQuery['category'],
      type: (this.selectedType() || undefined) as AdvertSearchQuery['type'],
      statuses: ['active'],
      filters: {},
      sort: this.selectedSort(),
      page: this.page(),
      pageSize: PAGE_SIZE,
    };
    this.repository
      .search(query)
      .pipe(
        tap((result) => this.state.set({ loading: false, data: result })),
        catchError(() => {
          this.state.set({ loading: false, error: 'خطا در بارگذاری آگهی‌ها.' });
          return of(null as unknown as AdvertSearchResult);
        }),
      )
      .subscribe();
  }

  protected categoryLabel(id: string): string {
    return this.registry.getById(id)?.label ?? id;
  }

  protected typeLabel(type: AdvertType): string {
    return type === 'provider' ? 'ارائه‌دهنده' : 'مصرف‌کننده';
  }

  protected locationText(advert: Advert): string | undefined {
    const parts = [advert.location?.city, advert.location?.district].filter((p): p is string => !!p);
    return parts.length ? parts.join('، ') : undefined;
  }

  protected perUnitLabel(advert: Advert): string | undefined {
    return this.registry.getById(advert.category)?.perUnitLabel;
  }
}