import type { CreateAdvertRequest } from '../domain/advert-requests';

/**
 * Fixture adverts used to seed the in-memory repository at startup (Phase 18) so
 * the marketplace hub, list, search, and detail pages show content on first load.
 * Realistic cross-category entries exercise the serializer / presenter / search.
 */
export const ADVERT_FIXTURES: readonly CreateAdvertRequest[] = [
  {
    type: 'consumer',
    category: 'real-estate',
    subcategory: 'sell',
    title: 'آپارتمان ۹۵ متری سعادت‌آباد',
    description: 'دو خوابه، نوساز، طبقه سوم با آسانسور و پارکینگ.',
    location: { city: 'تهران', district: 'سعادت‌آباد', address: 'بلوار دریا' },
    pricing: { price: 7_500_000_000, currency: 'Toman' },
    attributes: { propertyType: 'apartment', dealType: 'sell', area: 95, rooms: 2, floor: 3 },
    media: [{ type: 'image', url: 'https://picsum.photos/seed/apartment/640/400' }],
  },
  {
    type: 'provider',
    category: 'real-estate',
    subcategory: 'rent',
    title: 'ویلایی اجاره شبانه چالوس',
    description: 'اجاره روزانه ویلای لوکس در جنب دریا.',
    location: { city: 'چالوس', district: 'نمکآبرود' },
    pricing: { price: 3_500_000, currency: 'Toman' },
    attributes: { propertyType: 'villa', dealType: 'daily-rent', area: 220, rooms: 4 },
    media: [],
  },
  {
    type: 'consumer',
    category: 'building-materials',
    title: 'سیمان پاکتی ۵۰ کیلو',
    description: 'نو، تاریخ تولید اخیر، تحویل در محل.',
    pricing: { price: 285_000, currency: 'Toman' },
    attributes: { materialType: 'cement', condition: 'new', brand: 'خزر', unit: 'bag', quantity: 40 },
    media: [{ type: 'image', url: 'https://picsum.photos/seed/cement/640/400' }],
  },
  {
    type: 'provider',
    category: 'building-services',
    title: 'خدمات نصب کاشی و سرامیک',
    description: 'نصب کاشی و سرامیک با نیروی ماهر و گارانتی.',
    pricing: { price: 2_500_000, pricePerUnit: 50_000, currency: 'Toman' },
    attributes: {
      serviceType: 'installation',
      priceModel: 'per-meter',
      warranty: true,
      estimatedDays: 5,
      city: 'تهران',
      districts: 'تهران و کرج',
    },
    media: [{ type: 'image', url: 'https://picsum.photos/seed/tiling/640/400' }],
  },
];