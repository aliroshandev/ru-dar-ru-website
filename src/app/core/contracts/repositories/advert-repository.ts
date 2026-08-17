// PROPOSED CONTRACT — no backend exists yet; this is the frontend-facing shape both mock and future HTTP implementations must satisfy.
import type { Advert } from '../advert.model';

/**
 * Data-access contract for adverts. Components never talk to HTTP directly;
 * they go through this repository abstraction.
 */
export interface AdvertRepository {
  getById(id: string): Promise<Advert | null>;
  /** PROPOSED CONTRACT — params shape belongs to Phase 6 (Search Engine); do not design it now. */
  search(params: unknown): Promise<Advert[]>;
  create(advert: Partial<Advert>): Promise<Advert>;
  update(id: string, advert: Partial<Advert>): Promise<Advert>;
}