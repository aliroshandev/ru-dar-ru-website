import { Service, inject } from '@angular/core';
import { DynamicValidatorRegistry } from './dynamic-validator-registry';

/**
 * Registers a small set of built-in reusable custom validators.
 * Adding a custom validator requires only: a check here + a registration.
 * Category definitions reference these by `name` (data stays logic-free).
 */
@Service()
export class DynamicValidatorBootstrap {
  private readonly registry = inject(DynamicValidatorRegistry);

  registerValidators(): void {
    this.registry.registerMany([
      {
        // At least one non-whitespace character.
        name: 'nonBlank',
        check: (value) => {
          if (typeof value !== 'string') return null;
          return value.trim().length > 0 ? null : 'این فیلد باید دارای مقدار باشد';
        },
      },
      {
        // A valid Persian (09xx) mobile number.
        name: 'phone',
        check: (value) => {
          if (value == null || value === '') return null;
          const phone = String(value).replace(/[\s-]/g, '');
          return /^09\d{9}$/.test(phone) ? null : 'شماره موبایل معتبر نیست';
        },
      },
      {
        // Persian national ID (10 digits).
        name: 'nationalId',
        check: (value) => {
          if (value == null || value === '') return null;
          const id = String(value).replace(/\s/g, '');
          return /^\d{10}$/.test(id) ? null : 'کد ملی باید ۱۰ رقم باشد';
        },
      },
      {
        // Postal code (10 digits).
        name: 'postalCode',
        check: (value) => {
          if (value == null || value === '') return null;
          const code = String(value).replace(/\s/g, '');
          return /^\d{10}$/.test(code) ? null : 'کد پستی معتبر نیست';
        },
      },
    ]);
  }
}