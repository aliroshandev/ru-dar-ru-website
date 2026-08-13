/**
 * Auth roles for Users. Deliberately separate from AdvertType.
 * A User has exactly one auth role; Adverts have their own independent type.
 */
export const USER_ROLES = ['admin', 'moderator', 'user'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && (USER_ROLES as readonly string[]).includes(value);
}
