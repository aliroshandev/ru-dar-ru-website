import { Component, ComponentRef, computed, ElementRef, inject, input, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import type { Field } from '@angular/forms/signals';
import type { DynamicFieldDefinition } from '../dynamic-field.model';
import { DynamicFieldRegistry } from '../dynamic-field-registry';

/**
 * Resolves and instantiates the correct field component for a DynamicFieldType.
 * The type→component lookup lives ONLY in the DynamicFieldRegistry — no
 * if/switch on field type here, and never any category branching.
 *
 * Renders the field's `label` (and optional `description`) ABOVE every control.
 * The checkbox field renders its own inline label, so it is skipped here to
 * avoid a duplicated label. Any field type could likewise opt out by rendering
 * its own label; the registry never branches by category.
 */
@Component({
  selector: 'ui-dynamic-field',
  standalone: true,
  template: `
    <div class="flex flex-col gap-1.5">
      @if (field().label && field().type !== 'checkbox') {
        <label [attr.for]="controlId()" class="text-label-medium text-text-secondary">{{ field().label }}</label>
      }
      @if (field().description && field().type !== 'checkbox') {
        <p class="text-caption text-text-tertiary">{{ field().description }}</p>
      }
      <ng-container #container></ng-container>
    </div>
  `,
})
export class DynamicFieldRenderer implements OnInit, OnDestroy {
  readonly field = input.required<DynamicFieldDefinition>();
  readonly control = input.required<Field<unknown>>();

  private readonly registry = inject(DynamicFieldRegistry);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly host = inject(ElementRef).nativeElement as HTMLElement;

  private componentRef?: ComponentRef<unknown>;

  /** Stable id for the label/control association (accessibility). */
  protected readonly controlId = computed(() => `field-${this.field().key}`);

  ngOnInit(): void {
    const componentType = this.registry.resolve(this.field().type);
    if (!componentType) {
      this.host.textContent = `[no component for type: ${this.field().type}]`;
      return;
    }
    this.componentRef = this.viewContainer.createComponent(componentType);
    this.componentRef.setInput('field', this.field());
    this.componentRef.setInput('control', this.control());
  }

  ngOnDestroy(): void {
    this.componentRef?.destroy();
  }
}