import { Component, computed, input } from '@angular/core';

export type UiAlertTone = 'info' | 'success' | 'warning' | 'error';

@Component({
  selector: 'ui-alert',
  standalone: true,
  host: {
    role: 'alert',
    '[class]': 'hostClasses()',
  },
  template: `<ng-content />`,
})
export class UiAlert {
  readonly tone = input<UiAlertTone>('info');

  protected readonly hostClasses = computed(() => {
    const base = ['flex', 'items-start', 'gap-2', 'rounded-lg', 'p-3', 'text-body-small'];
    const tones: Record<UiAlertTone, string[]> = {
      info: ['bg-feedback-info-subtle', 'text-text-secondary', 'border', 'border-feedback-info'],
      success: [
        'bg-feedback-success-subtle',
        'text-text-success',
        'border',
        'border-feedback-success',
      ],
      warning: [
        'bg-feedback-warning-subtle',
        'text-text-warning',
        'border',
        'border-feedback-warning',
      ],
      error: ['bg-feedback-error-subtle', 'text-text-error', 'border', 'border-feedback-error'],
    };
    return [...base, ...tones[this.tone()]].join(' ');
  });
}
