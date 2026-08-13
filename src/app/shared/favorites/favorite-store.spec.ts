import { TestBed } from '@angular/core/testing';
import { FavoriteStore } from './favorite-store';

describe('FavoriteStore', () => {
  let store: FavoriteStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FavoriteStore],
    });
    store = TestBed.inject(FavoriteStore);
  });

  it('starts empty', () => {
    expect(store.ids()).toEqual([]);
    expect(store.has('a')).toBe(false);
  });

  it('toggles favorites on and off', () => {
    store.toggle('a');
    expect(store.has('a')).toBe(true);
    expect(store.ids()).toEqual(['a']);

    store.toggle('b');
    expect(store.ids().sort()).toEqual(['a', 'b']);

    store.toggle('a');
    expect(store.has('a')).toBe(false);
    expect(store.ids()).toEqual(['b']);
  });
});
