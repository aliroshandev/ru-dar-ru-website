import type { AdvertCategoryDefinition } from '../../../shared/category/advert-category.model';

/**
 * Building materials category configuration (Phase 8 marketplace extension).
 *
 * Pure data consumed generically by the Dynamic Form Engine:
 * the registry renders it unmodified, field components resolve via the
 * DynamicFieldRegistry, and `visibleWhen`/custom validators come from Phase 6.
 * No category-specific branch exists in shared/engine code.
 */

const basicInfoSection: AdvertCategoryDefinition['sections'][number] = {
  id: 'basic-info',
  title: 'اطلاعات پایه',
  layout: 'grid-two',
  fields: [
    {
      key: 'title',
      type: 'text',
      label: 'عنوان آگهی',
      placeholder: 'مثال: سیمان تیپ ۲، کیسه ۵۰ کیلویی',
      validators: [
        { name: 'required', message: 'عنوان الزامی است.' },
        { name: 'minLength', params: 5, message: 'عنوان حداقل ۵ حرف الزامی است.' },
      ],
      layout: 'full',
    },
    {
      key: 'description',
      type: 'textarea',
      label: 'توضیحات',
      placeholder: 'برند، کیفیت، تاریخ تولید...',
      layout: 'full',
    },
    {
      key: 'materialType',
      type: 'select',
      label: 'نوع مصالح',
      options: [
        { value: 'cement', label: 'سیمان' },
        { value: 'steel', label: 'فولاد' },
        { value: 'brick', label: 'آجر' },
        { value: 'block', label: 'بلوک' },
        { value: 'wood', label: 'چوب' },
        { value: 'insulation', label: 'عایق' },
        { value: 'paint', label: 'رنگ و پوشش' },
        { value: 'tiles', label: 'سرامیک و کاشی' },
      ],
      validators: [{ name: 'required', message: 'نوع مصالح الزامی است.' }],
    },
    {
      key: 'condition',
      type: 'select',
      label: 'وضعیت کالا',
      options: [
        { value: 'new', label: 'نو' },
        { value: 'remainder', label: 'باقیمانده' },
        { value: 'used', label: 'دست دوم' },
      ],
      validators: [{ name: 'required', message: 'وضعیت کالا الزامی است.' }],
    },
  ],
};

const quantitySection: AdvertCategoryDefinition['sections'][number] = {
  id: 'quantity',
  title: 'مقدار و واحد',
  layout: 'grid-two',
  description: 'مقدار موجود و واحد فروش را مشخص کنید.',
  fields: [
    {
      key: 'quantity',
      type: 'number',
      label: 'مقدار',
      validators: [
        { name: 'required', message: 'مقدار الزامی است.' },
        { name: 'min', params: 1, message: 'مقدار باید حداقل ۱ باشد.' },
      ],
      layout: 'full',
    },
    {
      key: 'unit',
      type: 'select',
      label: 'واحد',
      validators: [{ name: 'required', message: 'انتخاب واحد الزامی است.' }],
      options: [
        { value: 'kg', label: 'کیلوگرم' },
        { value: 'ton', label: 'تن' },
        { value: 'bag', label: 'کیسه' },
        { value: 'bundle', label: 'بسته' },
        { value: 'sheet', label: 'ورق' },
        { value: 'piece', label: 'تعداد' },
        { value: 'm2', label: 'متر مربع' },
        { value: 'm3', label: 'متر مکعب' },
      ],
    },
    {
      key: 'brand',
      type: 'text',
      label: 'برند',
      visibleWhen: { op: { fieldKey: 'condition', notEquals: 'used' } },
    },
  ],
};

const locationPricingSection: AdvertCategoryDefinition['sections'][number] = {
  id: 'location-pricing',
  title: 'موقعیت و قیمت',
  layout: 'grid-two',
  fields: [
    { key: 'city', type: 'text', label: 'شهر', validators: [{ name: 'required', message: 'شهر الزامی است.' }] },
    { key: 'district', type: 'text', label: 'منطقه' },
    {
      key: 'price',
      type: 'currency',
      label: 'قیمت واحد (تومان)',
      validators: [{ name: 'required', message: 'قیمت الزامی است.' }],
    },
    {
      key: 'negotiable',
      type: 'checkbox',
      label: 'قابل مذاکره',
    },
  ],
};

const deliverySection: AdvertCategoryDefinition['sections'][number] = {
  id: 'delivery',
  title: 'تحویل',
  layout: 'grid-two',
  fields: [
    {
      key: 'deliveryType',
      type: 'select',
      label: 'نوع تحویل',
      options: [
        { value: 'pickup', label: 'تحویل حضوری' },
        { value: 'freight', label: 'حمل بار' },
        { value: 'seller-free', label: 'ارسال رایگان توسط فروشنده' },
      ],
    },
    {
      key: 'leadTime',
      type: 'number',
      label: 'زمان آماده‌سازی (روز)',
      visibleWhen: { op: { fieldKey: 'deliveryType', notEquals: 'pickup' } },
    },
  ],
};

const contactSection: AdvertCategoryDefinition['sections'][number] = {
  id: 'contact',
  title: 'اطلاعات تماس',
  layout: 'grid-two',
  description: 'برای ارتباط خریداران استفاده می‌شود.',
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
  ],
};

export const buildingMaterialsCategoryDefinition: AdvertCategoryDefinition<'building-materials'> = {
  id: 'building-materials',
  label: 'مصالح ساختمانی',
  description: 'خرید و فروش مصالح ساختمانی',
  supportedAdvertTypes: ['provider', 'consumer'],
  perUnitLabel: 'هر پاکت',
  sections: [
    basicInfoSection,
    quantitySection,
    locationPricingSection,
    deliverySection,
    contactSection,
  ],
};