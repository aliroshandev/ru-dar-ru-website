/** Lifecycle status of an advert. */
export const ADVERT_STATUSES = [
  'draft',
  'active',
  'moderation',
  'rejected',
  'sold',
  'archived',
] as const;
export type AdvertStatus = (typeof ADVERT_STATUSES)[number];

export function isAdvertStatus(value: unknown): value is AdvertStatus {
  return typeof value === 'string' && (ADVERT_STATUSES as readonly string[]).includes(value);
}
