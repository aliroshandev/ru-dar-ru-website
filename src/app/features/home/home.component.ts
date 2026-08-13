import { Component, computed, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { catchError, of, tap } from 'rxjs';
import { AdvertRepository } from '../../features/adverts/data/advert.repository';
import type { Advert } from '../../features/adverts/domain/advert.model';
import type { AdvertSearchQuery } from '../../features/adverts/domain/advert-search';
import { CategoryRegistry } from '../../shared/category/category-registry';
import { UiCard, UiLoading } from '../../shared/ui';

/**
 * Home / marketplace hub (Phase 15, enriched Phase 23). Surfaces the registered
 * root categories as navigation cards plus live marketplace data — the latest
 * adverts and a per-category advert count — both sourced through the
 * AdvertRepository.search() contract (category-agnostic). A newly added category
 * appears here automatically with a live count.
 */
@Component({
  selector: 'app-home',
  imports: [RouterModule, UiCard, UiLoading],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  private readonly registry = inject(CategoryRegistry);
  private readonly repository = inject(AdvertRepository);

  readonly rootCategories = computed(() => this.registry.rootCategories());

  readonly states = signal<Record<string, { count: number; error?: boolean }>>({});
  readonly latest = signal<{ loading: boolean; items: readonly Advert[]; error?: boolean }>({
    loading: true,
    items: [],
  });

  readonly latestLoaded = computed(() => !this.latest().loading);

  constructor() {
    this.loadLatest();
    this.loadCounts();
  }

  countFor(categoryId: string): number | undefined {
    return this.states()[categoryId]?.count;
  }

  hasCount(categoryId: string): boolean {
    return this.states()[categoryId] !== undefined;
  }

  protected priceText(advert: Advert): string | undefined {
    if (advert.pricing?.price == null) return undefined;
    return advert.pricing.price.toLocaleString('fa-IR');
  }

  private loadLatest(): void {
    this.repository
      .search({ filters: {}, statuses: ['active'], sort: 'newest', page: 1, pageSize: 3 })
      .pipe(
        tap((result) => this.latest.set({ loading: false, items: result.items })),
        catchError(() => {
          this.latest.set({ loading: false, items: [], error: true });
          return of(null as unknown as never);
        }),
      )
      .subscribe();
  }

  private loadCounts(): void {
    for (const category of this.rootCategories()) {
      this.repository
        .search({
          category: category.id as AdvertSearchQuery['category'],
          statuses: ['active'],
          filters: {},
          page: 1,
          pageSize: 1,
        })
        .pipe(
          tap((result) =>
            this.states.update((prev) => ({ ...prev, [category.id]: { count: result.total } })),
          ),
          catchError(() => {
            this.states.update((prev) => ({
              ...prev,
              [category.id]: { count: 0, error: true },
            }));
            return of(null as unknown as never);
          }),
        )
        .subscribe();
    }
  }
}