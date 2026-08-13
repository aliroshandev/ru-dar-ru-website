import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AdvertListComponent } from './advert-list.component';
import { AdvertRepository } from '../../data/advert.repository';
import { MockAdvertRepository } from '../../data/advert.mock-repository';
import type { CreateAdvertRequest } from '../../domain/advert-requests';

async function flush(delay = 200): Promise<void> {
  await new Promise((r) => setTimeout(r, delay));
}

describe('AdvertListComponent (Phase 13)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvertListComponent],
      providers: [
        provideRouter([]),
        { provide: AdvertRepository, useClass: MockAdvertRepository },
      ],
    }).compileComponents();
  });

  it('creates and loads adverts via the repository on init', async () => {
    const repo = TestBed.inject(AdvertRepository) as MockAdvertRepository;
    await firstValueFrom(
      repo.create({ type: 'consumer', category: 'real-estate', title: 'آپارتمان', attributes: {}, media: [] } satisfies CreateAdvertRequest),
    );

    const component = TestBed.createComponent(AdvertListComponent).componentInstance;
    await flush();

    const results = component.results();
    expect(results).toBeDefined();
    expect(results!.items.some((a) => a.title === 'آپارتمان')).toBe(true);
  });

  it('shows an empty result set when no adverts exist', async () => {
    const component = TestBed.createComponent(AdvertListComponent).componentInstance;
    await flush();
    const results = component.results();
    expect(results).toBeDefined();
    expect(results!.items.length).toBe(0);
  });
});