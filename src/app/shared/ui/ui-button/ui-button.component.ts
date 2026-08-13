import { Component, computed, input } from '@angular/core';

export type UiButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost';
export type UiButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'button[ui-button], a[ui-button]',
  standalone: true,
  host: {
    '[class]': 'hostClasses()',
  },
  template: `<ng-content />`,
})
export class UiButton {
  readonly variant = input<UiButtonVariant>('primary');
  readonly size = input<UiButtonSize>('md');

  protected readonly hostClasses = computed(() => {
    const base = [
      'inline-flex',
      'items-center',
      'justify-center',
      'gap-2',
      'font-medium',
      'rounded-lg',
      'select-none',
      'cursor-pointer',
      'focus-visible:outline-2',
      'focus-visible:outline-offset-2',
      'focus-visible:outline-border-focus',
      'disabled:cursor-not-allowed',
      'disabled:opacity-50',
      'transition',
    ];

    const variants: Record<UiButtonVariant, string[]> = {
      primary: ['bg-action-primary', 'text-text-inverse', 'hover:bg-action-primary/90'],
      secondary: [
        'bg-action-secondary',
        'text-text',
        'border',
        'border-border',
        'hover:bg-surface-sunken',
      ],
      destructive: ['bg-action-destructive', 'text-text-inverse', 'hover:bg-action-destructive/90'],
      ghost: ['bg-transparent', 'text-text', 'hover:bg-surface-secondary'],
    };

    const sizes: Record<UiButtonSize, string[]> = {
      sm: ['text-sm', 'h-8', 'px-3'],
      md: ['text-sm', 'h-10', 'px-4'],
      lg: ['text-base', 'h-12', 'px-6'],
    };

    return [...base, ...variants[this.variant()], ...sizes[this.size()]].join(' ');
  });
}
