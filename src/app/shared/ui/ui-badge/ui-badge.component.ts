import { Component, computed, input } from '@angular/core';

export type UiBadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'error' | 'info';

@Component({
  selector: 'ui-badge',
  standalone: true,
  host: {
    '[class]': 'hostClasses()',
  },
  template: `<ng-content />`,
})
export class UiBadge {
  readonly tone = input<UiBadgeTone>('neutral');

  protected readonly hostClasses = computed(() => {
    const base = [
      'inline-flex',
      'items-center',
      'gap-1',
      'rounded-full',
      'px-2',
      'py-0.5',
      'text-label-small',
      'font-medium',
    ];
    const tones: Record<UiBadgeTone, string[]> = {
      neutral: ['bg-surface-sunken', 'text-text-secondary'],
      brand: ['bg-bg-brand-subtle', 'text-text-brand'],
      success: ['bg-feedback-success-subtle', 'text-text-success'],
      warning: ['bg-feedback-warning-subtle', 'text-text-warning'],
      error: ['bg-feedback-error-subtle', 'text-text-error'],
      info: ['bg-feedback-info-subtle', 'text-text-secondary'],
    };
    return [...base, ...tones[this.tone()]].join(' ');
  });
}
