import { Component, input } from '@angular/core';

@Component({
  selector: 'ui-empty-state',
  standalone: true,
  host: {
    class: 'flex flex-col items-center justify-center gap-3 p-8 text-center',
  },
  template: `
    <div class="text-4xl" aria-hidden="true">{{ icon() }}</div>
    <p class="text-body-medium font-medium text-text">{{ title() }}</p>
    @if (description()) {
      <p class="text-body-small text-text-secondary">{{ description() }}</p>
    }
    <ng-content />
  `,
})
export class UiEmptyState {
  readonly icon = input('📭');
  readonly title = input('خالی است');
  readonly description = input<string>();
}
