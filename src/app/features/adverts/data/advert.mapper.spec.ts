import { describe, expect, it } from 'vitest';
import { advertMapper } from './advert.mapper';
import type { AdvertDto } from './advert.dto';

describe('advertMapper', () => {
  const dto: AdvertDto = {
    id: 'a1',
    type: 'provider',
    category: 'real-estate',
    subcategory: 'rent',
    title: 'آپارتمان',
    attributes: { bedrooms: 2 },
    media: [{ id: 'm1', type: 'image', url: '/img.png' }],
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  it('maps a DTO into a domain Advert', () => {
    const advert = advertMapper.fromDto(dto);
    expect(advert.id).toBe('a1');
    expect(advert.type).toBe('provider');
    expect(advert.category).toBe('real-estate');
    expect(advert.attributes).toEqual({ bedrooms: 2 });
    expect(advert.media[0].url).toBe('/img.png');
    expect(advert.status).toBe('active');
  });

  it('coerces an unknown status gracefully', () => {
    const advert = advertMapper.fromDto({ ...dto, status: 'weird' });
    expect(advert.status).toBe('moderation');
  });
});
