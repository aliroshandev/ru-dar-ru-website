import { computed, Service, signal } from '@angular/core';

const STORAGE_KEY = 'rudarru.favorites';

/**
 * Persistent set of favorited advert ids (Phase 21). Exposed as a signal so
 * components react to toggles reactively. Persists to web storage when
 * available (browser); degrades gracefully to in-memory otherwise.
 */
@Service()
export class FavoriteStore {
  private readonly favs = signal<ReadonlySet<string>>(new Set());

  readonly ids = computed(() => [...this.favs()]);

  constructor() {
    const stored = this.read();
    if (stored) this.favs.set(new Set(stored));
  }

  has(id: string): boolean {
    return this.favs().has(id);
  }

  toggle(id: string): void {
    this.favs.update((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    this.write(this.favs());
  }

  private read(): string[] | undefined {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return undefined;
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return undefined;
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : undefined;
    } catch {
      return undefined;
    }
  }

  private write(values: ReadonlySet<string>): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...values]));
    } catch {
      // ignore storage quota/availability errors
    }
  }
}
