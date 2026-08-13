import { Component, input } from '@angular/core';
import type { FieldTree } from '@angular/forms/signals';
import { DynamicSectionRenderer } from '../dynamic-section-renderer/dynamic-section-renderer.component';
import type { AdvertSectionDefinition } from '../../category/advert-category.model';

/**
 * Top-level dynamic form renderer. Consumes section definitions (from the
 * CategoryRegistry) and a Signal Forms FieldTree, rendering each section.
 * The same component serves create/edit/search/preview — mode is data.
 */
@Component({
  selector: 'ui-dynamic-form',
  standalone: true,
  imports: [DynamicSectionRenderer],
  template: `
    <div class="flex flex-col gap-8">
      @for (section of sections(); track section.id) {
        <ui-dynamic-section [section]="section" [tree]="tree()" />
      }
    </div>
  `,
})
export class DynamicFormRenderer {
  readonly sections = input.required<readonly AdvertSectionDefinition[]>();
  readonly tree = input.required<FieldTree<Record<string, unknown>>>();
}