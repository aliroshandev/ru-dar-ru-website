import { Service } from '@angular/core';
import type { Type } from '@angular/core';
import type { DynamicFieldType } from './dynamic-field.model';

/**
 * Maps a DynamicFieldType to its rendering component. This is the single,
 * permitted place where field-type → component resolution lives (Section 9).
 * Adding a field type requires only: (1) a field component (typically
 * implementing DynamicFieldAdapter), (2) a registration here.
 * Category code is untouched.
 */
export interface DynamicFieldRendererRegistration {
  type: DynamicFieldType;
  /** The field component. Stored structural so each component may type its
   * own `field`/`control` Signal inputs per its concrete value type. */
  component: Type<unknown>;
}

@Service()
export class DynamicFieldRegistry {
  private readonly registrations = new Map<DynamicFieldType, Type<unknown>>();

  register(registration: DynamicFieldRendererRegistration): void {
    this.registrations.set(registration.type, registration.component);
  }

  registerMany(registrations: readonly DynamicFieldRendererRegistration[]): void {
    for (const registration of registrations) {
      this.register(registration);
    }
  }

  resolve(type: DynamicFieldType): Type<unknown> | undefined {
    return this.registrations.get(type);
  }

  has(type: DynamicFieldType): boolean {
    return this.registrations.has(type);
  }
}