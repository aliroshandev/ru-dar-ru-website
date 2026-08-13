import { Component, computed, input, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CategoryRegistry } from '../category-registry';
import { UiCard } from '../../ui';

/**
 * Reusable, data-driven category landing page (Phase 14).
 *
 * Takes a category id and renders the category's title/description plus its
 * subcategories as navigation cards linking to the marketplace search/create/
 * list views with that category (or subcategory) preselected. Everything is
 * read from the CategoryRegistry — no branching on a specific category here;
 * the same component serves every domain.
 */
@Component({
  selector: 'app-category-landing',
  imports: [RouterModule, UiCard],
  templateUrl: './category-landing.component.html',
  styleUrl: './category-landing.component.css',
})
export class CategoryLandingComponent {
  private readonly registry = inject(CategoryRegistry);

  readonly categoryId = input.required<string>();

  readonly category = computed(() => this.registry.getById(this.categoryId()));

  readonly subcategories = computed(() =>
    this.category()
      ? this.registry.subcategories(this.categoryId())
      : [],
  );
}