import { Component, output } from '@angular/core';

@Component({
  selector: 'ui-error-state',
  standalone: true,
  host: {
    role: 'alert',
    'aria-live': 'assertive',
    class: 'flex flex-col items-center justify-center gap-3 p-8 text-center',
  },
  template: `
    <div class="text-4xl" aria-hidden="true">⚠️</div>
    <p class="text-body-medium font-medium text-text-error">خطا در بارگذاری</p>
    <p class="text-body-small text-text-secondary">مشکلی پیش آمد. لطفاً دوباره تلاش کنید.</p>
    <button type="button" (click)="retry.emit()" class="text-body-small text-text-link underline">
      تلاش مجدد
    </button>
  `,
})
export class UiErrorState {
  readonly retry = output();
}
