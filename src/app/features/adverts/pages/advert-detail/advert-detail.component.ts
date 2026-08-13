import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, finalize, of, tap } from 'rxjs';
import { AdvertRepository } from '../../data/advert.repository';
import type { Advert } from '../../domain/advert.model';
import type { AdvertStatus } from '../../domain/advert-status';
import type { AdvertSearchQuery } from '../../domain/advert-search';
import { CategoryRegistry } from '../../../../shared/category/category-registry';
import { groupAttributes } from '../../../../shared/category/advert-attributes.presenter';
import { priceText as priceTextOf } from '../../../../shared/category/advert-pricing.presenter';
import { FavoriteStore } from '../../../../shared/favorites';
import {
  UiAlert,
  UiBadge,
  UiButton,
  UiCard,
  UiEmptyState,
  UiErrorState,
  UiLoading,
} from '../../../../shared/ui';

/**
 * Advert detail page (Phase 11). Loads an advert by route id and renders its
 * shared core fields (title, description, location, pricing, status) plus the
 * category-driven attribute groups. No category-specific branching — all
 * attribute labels/formatting come from the category's field definitions via
 * the read-only presenter.
 */
@Component({
  selector: 'app-advert-detail',
  imports: [
    UiCard,
    UiBadge,
    UiLoading,
    UiErrorState,
    UiEmptyState,
    UiAlert,
    UiButton,
    RouterLink,
  ],
  templateUrl: 'advert-detail.component.html',
  styleUrl: 'advert-detail.component.css',
})
export class AdvertDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly repository = inject(AdvertRepository);
  private readonly registry = inject(CategoryRegistry);
  private readonly favorites = inject(FavoriteStore);

  readonly advert = signal<Advert | undefined>(undefined);
  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly failed = signal(false);
  readonly confirmingDelete = signal(false);
  readonly deleting = signal(false);
  readonly deleteError = signal<string | undefined>(undefined);
  readonly stateUpdating = signal(false);
  readonly stateError = signal<string | undefined>(undefined);
  readonly similarAdverts = signal<readonly Advert[]>([]);

  readonly isFavorite = computed(() => {
    const advert = this.advert();
    return advert ? this.favorites.has(advert.id) : false;
  });

  readonly groups = computed(() => {
    const advert = this.advert();
    return advert ? groupAttributes(advert, this.registry) : [];
  });

  readonly categoryLabel = computed(() => {
    const advert = this.advert();
    return advert ? this.registry.getById(advert.category)?.label ?? advert.category : '';
  });

  readonly subcategoryLabel = computed(() => {
    const advert = this.advert();
    if (!advert?.subcategory) return undefined;
    return this.registry.getById(advert.subcategory)?.label ?? advert.subcategory;
  });

  readonly statusTone = computed(() => {
    const advert = this.advert();
    switch (advert?.status) {
      case 'active':
        return 'success';
      case 'sold':
        return 'info';
      case 'rejected':
        return 'error';
      case 'moderation':
        return 'warning';
      default:
        return 'neutral';
    }
  });

  constructor() {
    this.route.params.subscribe((params) => this.load(params['id']));
  }

  private load(id: string | undefined): void {
    if (!id) {
      this.notFound.set(true);
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.failed.set(false);
    this.notFound.set(false);
    this.repository
      .getById(id)
      .pipe(
        tap((advert) => {
          this.advert.set(advert);
          this.similarAdverts.set([]);
          this.loadSimilar(advert);
        }),
        catchError((err: unknown) => {
          const message = err instanceof Error ? err.message : 'load error';
          this.notFound.set(/not found/i.test(message));
          this.failed.set(!/not found/i.test(message));
          return of(undefined);
        }),
      )
      .subscribe(() => this.loading.set(false));
  }

  protected retry(): void {
    this.load(this.route.snapshot.params['id']);
  }

  /** Fetches other active adverts in the same subcategory (else category). */
  private loadSimilar(current: Advert): void {
    const query: AdvertSearchQuery = {
      category: current.category,
      subcategory: current.subcategory,
      statuses: ['active'],
      filters: {},
      sort: 'newest',
      page: 1,
      pageSize: 4,
    };
    this.repository
      .search(query)
      .pipe(
        tap((result) =>
          this.similarAdverts.set(result.items.filter((a) => a.id !== current.id)),
        ),
        catchError(() => {
          this.similarAdverts.set([]);
          return of(null as unknown as never);
        }),
      )
      .subscribe();
  }

  protected toggleDeleteConfirm(): void {
    this.confirmingDelete.set(!this.confirmingDelete());
    this.deleteError.set(undefined);
  }

  protected toggleFavorite(): void {
    const advert = this.advert();
    if (advert) this.favorites.toggle(advert.id);
  }

  protected setStatus(status: AdvertStatus): void {
    const id = this.route.snapshot.params['id'];
    if (!id) return;
    this.stateUpdating.set(true);
    this.stateError.set(undefined);
    this.repository
      .update(id, { status })
      .pipe(
        tap((advert) => this.advert.set(advert)),
        finalize(() => this.stateUpdating.set(false)),
        catchError((err: unknown) => {
          this.stateError.set(err instanceof Error ? err.message : 'خطا در تغییر وضعیت');
          return of(undefined);
        }),
      )
      .subscribe();
  }

  protected deleteAdvert(): void {
    const id = this.route.snapshot.params['id'];
    if (!id) return;
    this.deleting.set(true);
    this.deleteError.set(undefined);
    this.repository
      .delete(id)
      .pipe(
        finalize(() => this.deleting.set(false)),
        catchError((err: unknown) => {
          this.deleteError.set(err instanceof Error ? err.message : 'خطا در حذف آگهی');
          return of(undefined);
        }),
      )
      .subscribe(() => {
        if (!this.deleteError()) {
          this.router.navigate(['/adverts']);
        }
      });
  }

  protected priceText(advert: Advert): string | undefined {
    return priceTextOf(advert.pricing);
  }

  protected locationText(advert: Advert): string | undefined {
    const parts = [
      advert.location?.city,
      advert.location?.district,
      advert.location?.address,
    ].filter((p): p is string => !!p);
    return parts.length ? parts.join('، ') : undefined;
  }
}