import { Service } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import type { Advert } from '../domain/advert.model';
import type { AdvertMedia } from '../domain/advert-media';
import type { AdvertSearchQuery, AdvertSearchResult, AdvertSort } from '../domain/advert-search';
import type { CreateAdvertRequest, UpdateAdvertRequest } from '../domain/advert-requests';
import { AdvertRepository } from './advert.repository';
import { advertMapper } from './advert.mapper';
import type { AdvertDto } from './advert.dto';
import { ADVERT_FIXTURES } from './advert.fixtures';
import { isAdvertStatus } from '../domain/advert-status';

/**
 * In-memory mock repository — the only executable consumer until a backend
 * exists. Implements the full AdvertRepository contract and performs DTO
 * mapping so components/providers stay backend-agnostic.
 * No API endpoints are invented; this is purely local fixture behavior.
 */
@Service()
export class MockAdvertRepository extends AdvertRepository {
  private readonly db = new Map<string, Advert>();

  override getById(id: string): Observable<Advert> {
    const found = this.db.get(id);
    if (!found) {
      return throwError(() => new Error(`Advert not found: ${id}`));
    }
    return of(found);
  }

  override search(query: AdvertSearchQuery): Observable<AdvertSearchResult> {
    let items = [...this.db.values()];

    if (query.category) items = items.filter((a) => a.category === query.category);
    if (query.subcategory) items = items.filter((a) => a.subcategory === query.subcategory);
    if (query.type) items = items.filter((a) => a.type === query.type);
    if (query.statuses) {
      const statuses = new Set(query.statuses);
      items = items.filter((a) => statuses.has(a.status));
    }
    if (query.ids) {
      const ids = new Set(query.ids);
      items = items.filter((a) => ids.has(a.id));
    }
    if (query.location) items = items.filter((a) => this.matchesLocation(a, query.location!));
    if (query.pricing) items = items.filter((a) => this.matchesPricing(a, query.pricing!));
    if (query.q) items = items.filter((a) => this.matchesFreeText(a, query.q!));
    items = items.filter((a) => this.matchesFilters(a, query.filters));

    if (query.sort && query.sort !== 'relevance') items = this.sortItems(items, query.sort);

    const pageSize = query.pageSize ?? 20;
    const page = query.page ?? 1;
    const total = items.length;
    const start = (page - 1) * pageSize;
    const paged = items.slice(start, start + pageSize);

    return of({ items: paged, total, page, pageSize }).pipe(delay(150));
  }

  override create(request: CreateAdvertRequest): Observable<Advert> {
    const now = new Date().toISOString();
    const dto: AdvertDto = {
      ...advertMapper.createRequestToDto(request),
      id: crypto.randomUUID(),
      media: request.media.map((m, i) => ({
        id: crypto.randomUUID(),
        type: m.type,
        url: m.url,
        sortOrder: m.sortOrder ?? i,
      })),
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };
    const advert = advertMapper.fromDto(dto);
    this.db.set(advert.id, advert);
    return of(advert);
  }

  override update(id: string, request: UpdateAdvertRequest): Observable<Advert> {
    const existing = this.db.get(id);
    if (!existing) {
      return throwError(() => new Error(`Advert not found: ${id}`));
    }
    const dtoUpdate = advertMapper.updateRequestToDto(request);
    const merged: Advert = {
      ...existing,
      title: dtoUpdate.title ?? existing.title,
      description: dtoUpdate.description ?? existing.description,
      location: dtoUpdate.location ?? existing.location,
      pricing: dtoUpdate.pricing ?? existing.pricing,
      attributes: dtoUpdate.attributes ?? existing.attributes,
      status: isAdvertStatus(dtoUpdate.status) ? dtoUpdate.status : existing.status,
      media:
        dtoUpdate.media?.map((m, i) => ({
          id: crypto.randomUUID(),
          type: (m.type as AdvertMedia['type']) ?? 'image',
          url: m.url,
          sortOrder: m.sortOrder ?? i,
        })) ?? existing.media,
      updatedAt: new Date().toISOString(),
    };
    this.db.set(id, merged);
    return of(merged);
  }

  override delete(id: string): Observable<void> {
    if (!this.db.has(id)) {
      return throwError(() => new Error(`Advert not found: ${id}`));
    }
    this.db.delete(id);
    return of(undefined);
  }

  /**
   * Populates the in-memory store with fixture adverts (idempotent). Called
   * once at startup so the marketplace hub/list/search/detail show content.
   */
  seed(): void {
    if (this.db.size > 0) return;
    for (const request of ADVERT_FIXTURES) {
      this.create(request);
    }
  }

  /**
   * Category-specific predicates: each key/value in `filters` matches against
   * the advert's `attributes`. A value of shape `{ min?, max? }` is treated as
   * a numeric range. Empty values are ignored.
   */
  private matchesFilters(advert: Advert, filters: Readonly<Record<string, unknown>>): boolean {
    for (const [key, expected] of Object.entries(filters)) {
      if (expected === '' || expected === null || expected === undefined) continue;
      const actual = (advert.attributes as Record<string, unknown>)[key];
      if (isRange(expected)) {
        if (!inRange(actual, expected)) return false;
      } else if (!valuesMatch(actual, expected)) {
        return false;
      }
    }
    return true;
  }

  /** Free-text search across title, description, and location parts. */
  private matchesFreeText(advert: Advert, q: string): boolean {
    const parts = [
      advert.title,
      advert.description,
      advert.location?.country,
      advert.location?.state,
      advert.location?.city,
      advert.location?.district,
      advert.location?.address,
    ];
    const haystack = parts.filter((p): p is string => !!p).join(' ').toLowerCase();
    return q.toLowerCase().split(/\s+/).every((word) => haystack.includes(word));
  }

  /** Location constraints: exact field matches plus a fuzzy `q` across parts. */
  private matchesLocation(advert: Advert, filter: NonNullable<AdvertSearchQuery['location']>): boolean {
    const loc = advert.location;
    if (!loc) return false;
    if (filter.country && loc.country !== filter.country) return false;
    if (filter.state && loc.state !== filter.state) return false;
    if (filter.city && loc.city !== filter.city) return false;
    if (filter.district && loc.district !== filter.district) return false;
    if (filter.q) {
      const haystack = [loc.country, loc.state, loc.city, loc.district, loc.address]
        .filter((p): p is string => !!p)
        .join(' ')
        .toLowerCase();
      if (!filter.q.toLowerCase().split(/\s+/).every((word) => haystack.includes(word))) return false;
    }
    return true;
  }

  /** Price range bounds against `price` and (fallback) `pricePerUnit`. */
  private matchesPricing(advert: Advert, filter: NonNullable<AdvertSearchQuery['pricing']>): boolean {
    if (filter.currency && advert.pricing?.currency !== filter.currency) return false;
    const price = advert.pricing?.price ?? advert.pricing?.pricePerUnit;
    if (price == null) return false;
    if (filter.min != null && price < filter.min) return false;
    if (filter.max != null && price > filter.max) return false;
    return true;
  }

  private sortItems(items: Advert[], sort: Exclude<AdvertSort, 'relevance'>): Advert[] {
    const sorted = [...items];
    switch (sort) {
      case 'newest':
        sorted.sort((a, b) => time(b.createdAt) - time(a.createdAt));
        break;
      case 'oldest':
        sorted.sort((a, b) => time(a.createdAt) - time(b.createdAt));
        break;
      case 'price-asc':
        sorted.sort((a, b) => priceOf(a) - priceOf(b));
        break;
      case 'price-desc':
        sorted.sort((a, b) => priceOf(b) - priceOf(a));
        break;
    }
    return sorted;
  }
}

function time(value: string): number {
  const t = Date.parse(value);
  return Number.isNaN(t) ? 0 : t;
}

function priceOf(advert: Advert): number {
  return advert.pricing?.price ?? advert.pricing?.pricePerUnit ?? Number.POSITIVE_INFINITY;
}

/** Loose value comparison: primitives by value, arrays by membership. */
function valuesMatch(actual: unknown, expected: unknown): boolean {
  if (Array.isArray(expected)) {
    if (!Array.isArray(actual)) return false;
    return (expected as unknown[]).every((e) => (actual as unknown[]).includes(e));
  }
  if (Array.isArray(actual)) {
    return (actual as unknown[]).includes(expected);
  }
  return String(actual) === String(expected);
}

interface RangeFilter { min?: number; max?: number }

function isRange(value: unknown): value is RangeFilter {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    ('min' in value || 'max' in value)
  );
}

function inRange(actual: unknown, range: RangeFilter): boolean {
  const value = typeof actual === 'number' ? actual : Number(actual);
  if (!Number.isFinite(value)) return false;
  if (range.min != null && value < range.min) return false;
  if (range.max != null && value > range.max) return false;
  return true;
}
