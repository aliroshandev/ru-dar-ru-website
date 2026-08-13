import { Component, computed, input } from '@angular/core';

export type UiLoadingSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-loading',
  standalone: true,
  host: {
    role: 'status',
    'aria-live': 'polite',
    class: 'flex flex-col items-center justify-center gap-3 p-8',
  },
  template: `
    <span
      class="inline-block animate-spin rounded-full border-2 border-border border-t-action-primary"
      [class]="sizeClasses()"
      aria-hidden="true"
    ></span>
    @if (label()) {
      <span class="text-body-small text-text-secondary">{{ label() }}</span>
    }
  `,
})
export class UiLoading {
  readonly label = input<string>();
  readonly size = input<UiLoadingSize>('md');

  protected readonly sizeClasses = computed(() => {
    const sizes: Record<UiLoadingSize, string> = {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
    };
    return sizes[this.size()];
  });
}
