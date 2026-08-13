import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { catchError, of, tap } from 'rxjs';
import { AdvertRepository } from '../../data/advert.repository';
import type { AdvertSearchResult } from '../../domain/advert-search';
import type { Advert } from '../../domain/advert.model';
import { CategoryRegistry } from '../../../../shared/category/category-registry';
import { FavoriteStore } from '../../../../shared/favorites';
import {
  UiAdvertCard,
  UiButton,
  UiEmptyState,
  UiErrorState,
  UiLoading,
} from '../../../../shared/ui';

/**
 * Favorites page (Phase 21). Lists the adverts the user has saved via the
 * FavoriteStore, loading them through AdvertRepository.search({ ids }). The
 * list is driven reactively by the store's id signal, so removing a favorite
 * here immediately drops it from the page.
 */
@Component({
  selector: 'app-advert-favorites',
  imports: [RouterModule, CommonModule, UiAdvertCard, UiEmptyState, UiErrorState, UiLoading, UiButton],
  templateUrl: 'advert-favorites.component.html',
  styleUrl: 'advert-favorites.component.css',
})
export class AdvertFavoritesComponent {
  private readonly repository = inject(AdvertRepository);
  private readonly registry = inject(CategoryRegistry);
  private readonly favorites = inject(FavoriteStore);

  readonly state = signal<{ loading: boolean; data?: AdvertSearchResult; error?: string }>({
    loading: true,
  });

  readonly results = computed(() => this.state().data);

  readonly favoriteIds = computed(() => this.favorites.ids());

  constructor() {
    this.load();
  }

  protected load(): void {
    const ids = this.favoriteIds();
    if (ids.length === 0) {
      this.state.set({ loading: false, data: { items: [], total: 0, page: 1, pageSize: ids.length } });
      return;
    }
    this.state.set({ loading: true });
    this.repository
      .search({ ids, filters: {}, sort: 'newest' })
      .pipe(
        tap((result) => this.state.set({ loading: false, data: result })),
        catchError(() => {
          this.state.set({ loading: false, error: 'خطا در بارگذاری علاقه‌مندی‌ها.' });
          return of(null as unknown as AdvertSearchResult);
        }),
      )
      .subscribe();
  }

  protected removeFavorite(id: string): void {
    this.favorites.toggle(id);
    this.load();
  }

  protected isFavorite(id: string): boolean {
    return this.favorites.has(id);
  }

  protected categoryLabel(id: string): string {
    return this.registry.getById(id)?.label ?? id;
  }

  protected locationText(advert: Advert): string | undefined {
    const parts = [advert.location?.city, advert.location?.district].filter((p): p is string => !!p);
    return parts.length ? parts.join('، ') : undefined;
  }

  protected perUnitLabel(advert: Advert): string | undefined {
    return this.registry.getById(advert.category)?.perUnitLabel;
  }
}
