import { Component, forwardRef, input, output, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import type { ControlValueAccessor } from '@angular/forms';

export interface UiSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'ui-select',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiSelect),
      multi: true,
    },
  ],
  template: `
    <div class="relative">
      <select
        class="w-full appearance-none border border-border bg-surface text-text rounded-lg px-3 py-2 text-body-medium focus:outline-2 focus:outline-border-focus disabled:opacity-50 disabled:cursor-not-allowed"
        [disabled]="disabled()"
        [value]="value()"
        (change)="onSelect($event)"
        (blur)="onBlur()"
      >
        <option value="" disabled>—</option>
        @for (option of options(); track option.value) {
          <option [value]="option.value" [disabled]="option.disabled">{{ option.label }}</option>
        }
      </select>
    </div>
  `,
})
export class UiSelect implements ControlValueAccessor {
  readonly options = input<UiSelectOption[]>([]);
  readonly disabled = input(false);
  readonly valueChange = output<string>();

  protected readonly value = signal('');

  private onChanged: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: string): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChanged = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onSelect(event: Event): void {
    this.value.set((event.target as HTMLSelectElement).value);
    this.onChanged(this.value());
    this.valueChange.emit(this.value());
  }

  onBlur(): void {
    this.onTouched();
  }
}
