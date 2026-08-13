import type { AdvertCategoryDefinition } from '../../../shared/category/advert-category.model';
import type { RealEstateSubcategoryId } from '../../adverts/domain/advert-category';

/**
 * Real estate category configuration (Phase 7).
 *
 * Everything here is DATA consumed generically by the Dynamic Form Engine:
 *   - sections/fields rendered by DynamicSectionRenderer (Phase 5)
 *   - field components resolved via DynamicFieldRegistry (Phase 5)
 *   - `visibleWhen` / `disabledWhen` / `requiredWhen` via native rules (Phase 6)
 *   - custom validators (`phone`, `postalCode`, `nonBlank`) via DynamicValidatorRegistry (Phase 6)
 *
 * No branch on a category id exists in shared/engine code — this file only
 * declares what each deal type (rent/sell/mortgage/daily-rent) asks for.
 */

/* ---------------------------------------------------------------------------
 * Basic info — shared by every deal type.
 * ------------------------------------------------------------------------- */

const basicInfoSection: AdvertCategoryDefinition['sections'][number] = {
  id: 'basic-info',
  title: 'اطلاعات پایه',
  layout: 'grid-two',
  fields: [
    {
      key: 'title',
      type: 'text',
      label: 'عنوان آگهی',
      placeholder: 'مثال: آپارتمان ۷۵ متری دوخواب در سعادت‌آباد',
      validators: [
        { name: 'required', message: 'عنوان آگهی الزامی است.' },
        { name: 'minLength', params: 5, message: 'عنوان باید حداقل ۵ حرف باشد.' },
        { name: 'maxLength', params: 120, message: 'عنوان حداکثر ۱۲۰ حرف می‌باشد.' },
      ],
      layout: 'full',
    },
    {
      key: 'description',
      type: 'textarea',
      label: 'توضیحات',
      placeholder: 'جزئیات بیشتر درباره ملک...',
      validators: [
        { name: 'minLength', params: 10, message: 'توضیحات حداقل ۱۰ حرف الزامی است.' },
      ],
      layout: 'full',
    },
    {
      key: 'propertyType',
      type: 'select',
      label: 'نوع ملک',
      options: [
        { value: 'apartment', label: 'آپارتمان' },
        { value: 'villa', label: 'ویلا' },
        { value: 'land', label: 'زمین' },
        { value: 'office', label: 'اداری / تجاری' },
        { value: 'store', label: 'مغازه' },
        { value: 'warehouse', label: 'انبار / سوله' },
      ],
      validators: [{ name: 'required', message: 'نوع ملک الزامی است.' }],
    },
    {
      key: 'dealType',
      type: 'select',
      label: 'نوع معامله',
      options: [
        { value: 'rent', label: 'اجاره' },
        { value: 'sell', label: 'فروش' },
        { value: 'mortgage', label: 'رهن و اجاره' },
        { value: 'daily-rent', label: 'اجاره روزانه' },
      ],
      validators: [{ name: 'required', message: 'نوع معامله الزامی است.' }],
    },
  ],
};

/* ---------------------------------------------------------------------------
 * Property particulars — most fields only make sense for certain property types.
 * ------------------------------------------------------------------------- */

const propertySection: AdvertCategoryDefinition['sections'][number] = {
  id: 'property',
  title: 'مشخصات ملک',
  layout: 'grid-three',
  fields: [
    {
      key: 'area',
      type: 'number',
      label: 'متراژ (متر مربع)',
      validators: [
        { name: 'required', message: 'متراژ الزامی است.' },
        { name: 'min', params: 1, message: 'متراژ نمی‌تواند صفر باشد.' },
        { name: 'max', params: 1000000, message: 'متراژ وارد شده بیش از حد است.' },
      ],
    },
    {
      key: 'buildYear',
      type: 'number',
      label: 'سال ساخت',
      // Land has no building year.
      visibleWhen: { op: { fieldKey: 'propertyType', notEquals: 'land' } },
      validators: [
        { name: 'min', params: 1300, message: 'سال ساخت معتبر نیست.' },
        { name: 'max', params: 1404, message: 'سال ساخت نمی‌تواند در آینده باشد.' },
      ],
    },
    {
      key: 'rooms',
      type: 'number',
      label: 'تعداد اتاق‌ها',
      // Only homes/apartments/villas/store have rooms.
      visibleWhen: {
        or: [
          { op: { fieldKey: 'propertyType', equals: 'apartment' } },
          { op: { fieldKey: 'propertyType', equals: 'villa' } },
          { op: { fieldKey: 'propertyType', equals: 'store' } },
        ],
      },
    },
    {
      key: 'floor',
      type: 'number',
      label: 'طبقه',
      visibleWhen: { op: { fieldKey: 'propertyType', equals: 'apartment' } },
    },
    {
      key: 'parking',
      type: 'checkbox',
      label: 'پارکینگ',
      visibleWhen: {
        or: [
          { op: { fieldKey: 'propertyType', equals: 'apartment' } },
          { op: { fieldKey: 'propertyType', equals: 'villa' } },
        ],
      },
    },
    {
      key: 'elevator',
      type: 'checkbox',
      label: 'آسانسور',
      visibleWhen: { op: { fieldKey: 'propertyType', equals: 'apartment' } },
    },
  ],
};

/* ---------------------------------------------------------------------------
 * Location — a structured block with a validated postal code.
 * ------------------------------------------------------------------------- */

const locationSection: AdvertCategoryDefinition['sections'][number] = {
  id: 'location',
  title: 'موقعیت',
  layout: 'grid-two',
  fields: [
    { key: 'district', type: 'text', label: 'محله' },
    { key: 'address', type: 'textarea', label: 'آدرس کامل', layout: 'full' },
    {
      key: 'postalCode',
      type: 'text',
      label: 'کد پستی',
      validators: [{ name: 'postalCode', message: 'کد پستی معتبر نیست.' }],
    },
  ],
};

/* ---------------------------------------------------------------------------
 * Pricing — deal-type specific; each block appears only for its deal type.
 * ------------------------------------------------------------------------- */

const rentPriceSection: AdvertCategoryDefinition['sections'][number] = {
  id: 'rent-pricing',
  title: 'قیمت اجاره',
  layout: 'grid-two',
  visibleWhen: {
    or: [
      { op: { fieldKey: 'dealType', equals: 'rent' } },
      { op: { fieldKey: 'dealType', equals: 'daily-rent' } },
    ],
  },
  fields: [
    {
      key: 'rentPrice',
      type: 'currency',
      label: 'اجاره ماهانه (تومان)',
      validators: [{ name: 'required', message: 'مبلغ اجاره الزامی است.' }],
    },
    {
      key: 'deposit',
      type: 'currency',
      label: 'ودیعه (تومان)',
      // Daily rent normally has no large deposit.
      visibleWhen: { op: { fieldKey: 'dealType', equals: 'rent' } },
    },
  ],
};

const mortgagePriceSection: AdvertCategoryDefinition['sections'][number] = {
  id: 'mortgage-pricing',
  title: 'رهن و اجاره',
  layout: 'grid-two',
  visibleWhen: { op: { fieldKey: 'dealType', equals: 'mortgage' } },
  fields: [
    {
      key: 'mortgageAmount',
      type: 'currency',
      label: 'مبلغ رهن (تومان)',
      validators: [{ name: 'required', message: 'مبلغ رهن الزامی است.' }],
    },
    {
      key: 'rentPrice',
      type: 'currency',
      label: 'اجاره ماهانه (تومان)',
      validators: [{ name: 'required', message: 'اجاره ماهانه الزامی است.' }],
    },
  ],
};

const sellPriceSection: AdvertCategoryDefinition['sections'][number] = {
  id: 'sell-pricing',
  title: 'قیمت فروش',
  layout: 'grid-two',
  visibleWhen: { op: { fieldKey: 'dealType', equals: 'sell' } },
  fields: [
    {
      key: 'sellPrice',
      type: 'currency',
      label: 'قیمت کل (تومان)',
      validators: [{ name: 'required', message: 'قیمت فروش الزامی است.' }],
    },
    {
      key: 'pricePerMeter',
      type: 'currency',
      label: 'قیمت هر متر (تومان)',
      // Not applicable to land, but relevant for buildings.
      visibleWhen: { op: { fieldKey: 'propertyType', notEquals: 'land' } },
    },
  ],
};

/* ---------------------------------------------------------------------------
 * Media — image galleries. Listing authors paste image URLs; the serializer
 * collects any non-empty `image*` key into the request's media array.
 * ------------------------------------------------------------------------- */

const mediaSection: AdvertCategoryDefinition['sections'][number] = {
  id: 'media',
  title: 'تصاویر',
  description: 'لینک تصاویر ملک (اختیاری).',
  layout: 'grid-two',
  fields: [
    {
      key: 'imageMain',
      type: 'image',
      label: 'تصویر اصلی',
      layout: 'full',
    },
    {
      key: 'image1',
      type: 'image',
      label: 'تصویر دیگر',
    },
    {
      key: 'image2',
      type: 'image',
      label: 'تصویر دیگر',
    },
  ],
};

/* ---------------------------------------------------------------------------
 * Contact — always required for a valid advert.
 * ------------------------------------------------------------------------- */

const contactSection: AdvertCategoryDefinition['sections'][number] = {
  id: 'contact',
  title: 'اطلاعات تماس',
  layout: 'grid-two',
  description: 'این اطلاعات برای ارتباط خریداران و فروشندگان استفاده می‌شود.',
  fields: [
    {
      key: 'phone',
      type: 'text',
      label: 'شماره موبایل',
      validators: [
        { name: 'required', message: 'شماره تماس الزامی است.' },
        { name: 'phone', message: 'شماره موبایل معتبر نیست.' },
      ],
    },
    {
      key: 'email',
      type: 'email',
      label: 'ایمیل (اختیاری)',
    },
  ],
};

/* ---------------------------------------------------------------------------
 * Definition & subcategory overrides.
 * Each subcategory references the same sections; the engine renders only the
 * sections/fields relevant to the chosen deal type via conditions. Keeping the
 * config shared means the four deal types stay DRY while remaining generic.
 * ------------------------------------------------------------------------- */

const RE_SECTIONS = [
  basicInfoSection,
  propertySection,
  locationSection,
  rentPriceSection,
  mortgagePriceSection,
  sellPriceSection,
  mediaSection,
  contactSection,
];

/**
 * Search-mode schema for real estate (Phase 9). A stripped-down, filter-focused
 * form: free-text query, property type, deal type, area/price ranges, district.
 * Fields are intentionally lighter than the create form — search never
 * requires them to be filled.
 */
const reSearchSections: AdvertCategoryDefinition['sections'] = [
  {
    id: 'search-filters',
    title: 'فیلترهای جستجو',
    layout: 'grid-two',
    fields: [
      {
        key: 'q',
        type: 'text',
        label: 'جستجوی آزاد',
        placeholder: 'عنوان، محله، آدرس...',
        layout: 'full',
      },
      {
        key: 'propertyType',
        type: 'select',
        label: 'نوع ملک',
        options: [
          { value: 'apartment', label: 'آپارتمان' },
          { value: 'villa', label: 'ویلا' },
          { value: 'land', label: 'زمین' },
          { value: 'office', label: 'اداری / تجاری' },
          { value: 'store', label: 'مغازه' },
        ],
      },
      {
        key: 'dealType',
        type: 'select',
        label: 'نوع معامله',
        options: [
          { value: 'rent', label: 'اجاره' },
          { value: 'sell', label: 'فروش' },
          { value: 'mortgage', label: 'رهن و اجاره' },
        ],
      },
      { key: 'district', type: 'text', label: 'محله' },
      { key: 'minArea', type: 'number', label: 'حداقل متراژ' },
      { key: 'maxArea', type: 'number', label: 'حداکثر متراژ' },
      { key: 'minPrice', type: 'currency', label: 'حداقل قیمت' },
      { key: 'maxPrice', type: 'currency', label: 'حداکثر قیمت' },
    ],
  },
];

export const realEstateCategoryDefinition: AdvertCategoryDefinition<'real-estate'> = {
  id: 'real-estate',
  label: 'املاک',
  description: 'خرید، فروش، رهن و اجاره املاک',
  supportedAdvertTypes: ['provider', 'consumer'],
  perUnitLabel: 'هر متر',
  sections: RE_SECTIONS,
  searchSections: reSearchSections,
};

export const realEstateSubcategoryDefinitions: AdvertCategoryDefinition<RealEstateSubcategoryId>[] =
  [
    {
      id: 'rent',
      parentId: 'real-estate',
      label: 'اجاره',
      description: 'اجاره مسکونی و تجاری',
      supportedAdvertTypes: ['provider', 'consumer'],
      sections: [
        basicInfoSection,
        propertySection,
        locationSection,
        rentPriceSection,
        contactSection,
      ],
    },
    {
      id: 'sell',
      parentId: 'real-estate',
      label: 'فروش',
      description: 'فروش ملک',
      supportedAdvertTypes: ['provider', 'consumer'],
      sections: [
        basicInfoSection,
        propertySection,
        locationSection,
        sellPriceSection,
        contactSection,
      ],
    },
    {
      id: 'mortgage',
      parentId: 'real-estate',
      label: 'رهن و اجاره',
      description: 'رهن و اجاره',
      supportedAdvertTypes: ['provider', 'consumer'],
      sections: [
        basicInfoSection,
        propertySection,
        locationSection,
        mortgagePriceSection,
        contactSection,
      ],
    },
    {
      id: 'daily-rent',
      parentId: 'real-estate',
      label: 'اجاره روزانه',
      description: 'اجاره کوتاه‌مدت',
      supportedAdvertTypes: ['provider'],
      sections: [
        basicInfoSection,
        propertySection,
        locationSection,
        rentPriceSection,
        contactSection,
      ],
    },
  ];