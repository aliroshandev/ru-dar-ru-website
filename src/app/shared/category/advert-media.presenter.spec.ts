import { describe, expect, it } from 'vitest';
import { primaryImage } from './advert-media.presenter';
import type { Advert } from '../../features/adverts/domain/advert.model';

function advert(media: Advert['media']): Advert {
  return {
    id: 'a1',
    type: 'provider',
    category: 'real-estate',
    subcategory: 'sell',
    title: 'ملک',
    attributes: {},
    media,
    status: 'active',
    createdAt: '',
    updatedAt: '',
  };
}

describe('primaryImage (Phase 28)', () => {
  it('returns the first image by sort order', () => {
    const result = primaryImage(advert([
      { id: 'm2', type: 'image', url: 'b.jpg', sortOrder: 1 },
      { id: 'm1', type: 'image', url: 'a.jpg', sortOrder: 0 },
    ]));
    expect(result?.url).toBe('a.jpg');
  });

  it('skips non-image media', () => {
    const result = primaryImage(advert([
      { id: 'v1', type: 'video', url: 'c.mp4', sortOrder: 0 },
    ]));
    expect(result).toBeUndefined();
  });

  it('is undefined when there is no image media', () => {
    expect(primaryImage(advert([]))).toBeUndefined();
  });
});