import { Service } from '@angular/core';

/**
 * A named validation check, mirroring the data-driven model: it receives the
 * field value and the validator params and returns a human-readable error
 * message, or null when the value is valid. Custom logic stays OUT of
 * category data — it is registered here by name (Section 9).
 */
export type DynamicValidatorCheck = (
  value: unknown,
  params: unknown,
) => string | null;

/**
 * Registry mapping validated field names → their implementations. Category
 * definitions only reference names; this registry provides the logic. Adding
 * a validator requires only a registration here — no changes to categories.
 */
@Service()
export class DynamicValidatorRegistry {
  private readonly checks = new Map<string, DynamicValidatorCheck>();

  register(name: string, check: DynamicValidatorCheck): void {
    this.checks.set(name, check);
  }

  registerMany(registrations: readonly { name: string; check: DynamicValidatorCheck }[]): void {
    for (const registration of registrations) {
      this.register(registration.name, registration.check);
    }
  }

  resolve(name: string): DynamicValidatorCheck | undefined {
    return this.checks.get(name);
  }

  has(name: string): boolean {
    return this.checks.has(name);
  }
}