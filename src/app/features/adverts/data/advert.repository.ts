import type { Observable } from 'rxjs';
import type { Advert } from '../domain/advert.model';
import type { AdvertSearchQuery, AdvertSearchResult } from '../domain/advert-search';
import type { CreateAdvertRequest, UpdateAdvertRequest } from '../domain/advert-requests';

/**
 * Data-access contract. Components never talk to HttpClient directly.
 * Implementations handle DTO↔domain mapping and error normalization.
 */
export abstract class AdvertRepository {
  abstract getById(id: string): Observable<Advert>;
  abstract search(query: AdvertSearchQuery): Observable<AdvertSearchResult>;
  abstract create(request: CreateAdvertRequest): Observable<Advert>;
  abstract update(id: string, request: UpdateAdvertRequest): Observable<Advert>;
  abstract delete(id: string): Observable<void>;
  /** Idempotently populates the store with fixture data (no-op in production). */
  abstract seed(): void;
}
