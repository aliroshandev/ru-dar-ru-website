import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { UiAdvertCard } from './ui-advert-card.component';
import type { Advert } from '../../../features/adverts/domain/advert.model';

function sampleAdvert(): Advert {
  return {
    id: 'a1',
    type: 'provider',
    category: 'real-estate',
    subcategory: 'sell',
    title: 'آپارتمان ۹۵ متری',
    description: 'نوساز',
    location: { city: 'تهران', district: 'سعادت‌آباد' },
    pricing: { price: 12000000, currency: 'Toman' },
    attributes: {},
    media: [{ id: 'm1', type: 'image', url: 'https://x/a.jpg', sortOrder: 0 }],
    status: 'active',
    createdAt: '',
    updatedAt: '',
  };
}

describe('UiAdvertCard', () => {
  it('renders title, price, and thumbnail', () => {
    TestBed.configureTestingModule({
      imports: [UiAdvertCard],
      providers: [provideRouter([])],
    });
    const host = TestBed.createComponent(TestHost);
    host.componentInstance.advert = sampleAdvert();
    host.detectChanges();

    const title = host.debugElement.query(By.css('h3'));
    expect(title.nativeElement.textContent).toContain('آپارتمان ۹۵ متری');

    const img = host.debugElement.query(By.css('img'));
    expect(img).toBeTruthy();
    expect(img.properties['src']).toBe('https://x/a.jpg');

    const price = host.debugElement.query(By.css('.text-caption.text-text-tertiary'));
    expect(price.nativeElement.textContent).toContain('Toman');
  });
});

@Component({
  standalone: true,
  imports: [UiAdvertCard],
  template: `<ui-advert-card [advert]="advert" />`,
})
class TestHost {
  advert!: Advert;
}