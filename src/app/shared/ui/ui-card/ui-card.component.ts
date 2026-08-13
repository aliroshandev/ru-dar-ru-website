import { Component, computed, input } from '@angular/core';

export type UiCardElevation = 'flat' | 'raised';

@Component({
  selector: 'ui-card',
  standalone: true,
  host: {
    '[class]': 'hostClasses()',
  },
  template: `<ng-content />`,
})
export class UiCard {
  readonly elevation = input<UiCardElevation>('raised');

  protected readonly hostClasses = computed(() => {
    const base = ['rounded-xl', 'bg-surface', 'border', 'border-border'];
    const elevation = this.elevation() === 'raised' ? 'shadow-md' : 'shadow-none';
    return [...base, elevation].join(' ');
  });
}
