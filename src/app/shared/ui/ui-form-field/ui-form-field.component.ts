import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'ui-form-field',
  standalone: true,
  host: {
    class: 'block w-full',
  },
  template: `
    <div class="flex flex-col gap-1.5">
      @if (label()) {
        <label [attr.for]="forId()" class="text-label-medium text-text-secondary">
          {{ label() }}
        </label>
      }
      <ng-content />
      @if (error()) {
        <p [id]="hintId()" class="text-caption text-text-error">
          {{ error() }}
        </p>
      }
    </div>
  `,
})
export class UiFormField {
  readonly label = input<string>();
  readonly error = input<string>();
  readonly hint = input<string>();
  readonly forId = input<string>();
  readonly fieldId = input<string>();

  readonly labelId = computed(() => (this.forId() ? `${this.forId()}-label` : undefined));
  readonly hintId = computed(() => (this.forId() ? `${this.forId()}-hint` : undefined));
}
