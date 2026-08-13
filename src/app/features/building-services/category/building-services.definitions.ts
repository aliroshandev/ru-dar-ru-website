import type { AdvertCategoryDefinition } from '../../../shared/category/advert-category.model';

/**
 * Building services category configuration (Phase 8 marketplace extension).
 *
 * Pure data consumed generically by the Dynamic Form Engine. Provider-driven
 * (`supportedAdvertTypes: ['provider']`); uses `visibleWhen` conditions and
 * custom validators from Phase 6. No category-specific branch in shared code.
 */

const basicInfoSection: AdvertCategoryDefinition['sections'][number] = {
  id: 'basic-info',
  title: 'اطلاعات پایه',
  layout: 'grid-two',
  fields: [
    {
      key: 'title',
      type: 'text',
      label: 'عنوان آگهی / نام شرکت',
      placeholder: 'مثال: اجرای سقف کاذب و پوشش دیوار',
      validators: [
        { name: 'required', message: 'عنوان الزامی است.' },
        { name: 'minLength', params: 5, message: 'عنوان حداقل ۵ حرف الزامی است.' },
      ],
      layout: 'full',
    },
    {
      key: 'description',
      type: 'textarea',
      label: 'توضیحات خدمات',
      placeholder: 'محل فعالیت، سابقه، تجهیزات...',
      validators: [{ name: 'minLength', params: 10, message: 'توضیحات حداقل ۱۰ حرف الزامی است.' }],
      layout: 'full',
    },
    {
      key: 'serviceType',
      type: 'select',
      label: 'نوع خدمت',
      options: [
        { value: 'construction', label: 'ساخت' },
        { value: 'renovation', label: 'بازسازی' },
        { value: 'design', label: 'طراحی و مشاوره' },
        { value: 'electrical', label: 'برق' },
        { value: 'plumbing', label: 'لوله‌کشی' },
        { value: 'installation', label: 'نصب' },
        { value: 'maintenance', label: 'نگهداری و تعمیرات' },
        { value: 'other', label: 'سایر' },
      ],
      validators: [{ name: 'required', message: 'نوع خدمت الزامی است.' }],
    },
  ],
};

const scopeSection: AdvertCategoryDefinition['sections'][number] = {
  id: 'scope',
  title: 'محدوده خدمات',
  layout: 'grid-two',
  description: 'اگر بخشی از هزینه به‌صورت توافقی است، این بخش را کامل کنید.',
  fields: [
    {
      key: 'priceModel',
      type: 'select',
      label: 'مدل قیمت‌گذاری',
      options: [
        { value: 'fixed', label: 'قیمت ثابت' },
        { value: 'per-meter', label: 'بر اساس متراژ' },
        { value: 'quote', label: 'استعلام / توافقی' },
      ],
      validators: [{ name: 'required', message: 'مدل قیمت‌گذاری الزامی است.' }],
    },
    {
      key: 'price',
      type: 'currency',
      label: 'قیمت پیشنهادی (تومان)',
      // Not shown for open "quote" pricing.
      visibleWhen: { op: { fieldKey: 'priceModel', notEquals: 'quote' } },
    },
    {
      key: 'estimatedDays',
      type: 'number',
      label: 'مدت تقریبی انجام (روز)',
      validators: [{ name: 'min', params: 1, message: 'مدت باید حداقل ۱ روز باشد.' }],
    },
    {
      key: 'warranty',
      type: 'checkbox',
      label: 'دارای گارانتی',
    },
  ],
};

const coverageSection: AdvertCategoryDefinition['sections'][number] = {
  id: 'coverage',
  title: 'منطقه پوشش',
  layout: 'grid-three',
  fields: [
    { key: 'city', type: 'text', label: 'شهر', validators: [{ name: 'required', message: 'شهر الزامی است.' }] },
    { key: 'districts', type: 'textarea', label: 'مناطق فعال', layout: 'full' },
    {
      key: 'remoteQuoting',
      type: 'checkbox',
      label: 'پذیرش استعلام آنلاین',
    },
  ],
};

const contactSection: AdvertCategoryDefinition['sections'][number] = {
  id: 'contact',
  title: 'اطلاعات تماس',
  layout: 'grid-two',
  description: 'برای ارتباط مشتریان استفاده می‌شود.',
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

export const buildingServicesCategoryDefinition: AdvertCategoryDefinition<'building-services'> = {
  id: 'building-services',
  label: 'خدمات ساختمانی',
  description: 'خدمات ساخت و ساز',
  supportedAdvertTypes: ['provider'],
  perUnitLabel: 'هر متر',
  sections: [
    basicInfoSection,
    scopeSection,
    coverageSection,
    contactSection,
  ],
};