import { Component, ElementRef, forwardRef, inject } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import type { ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'textarea[ui-textarea]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiTextarea),
      multi: true,
    },
  ],
  host: {
    class:
      'w-full border border-border bg-surface text-text rounded-lg px-3 py-2 text-body-medium ' +
      'placeholder:text-text-tertiary ' +
      'focus:outline-2 focus:outline-border-focus focus:outline-offset-0 ' +
      'disabled:opacity-50 disabled:cursor-not-allowed resize-y min-h-24',
    '(input)': 'onInput($event)',
    '(blur)': 'onBlur()',
  },
  template: ``,
})
export class UiTextarea implements ControlValueAccessor {
  private readonly host = inject(ElementRef).nativeElement as HTMLTextAreaElement;

  private value = '';
  private onChanged: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: string): void {
    this.value = value ?? '';
    this.host.value = this.value;
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChanged = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onInput(event: Event): void {
    this.value = (event.target as HTMLTextAreaElement).value;
    this.onChanged(this.value);
  }

  onBlur(): void {
    this.onTouched();
  }
}
