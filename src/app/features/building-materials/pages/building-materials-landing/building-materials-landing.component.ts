import { Component } from '@angular/core';
import { CategoryLandingComponent } from '../../../../shared/category/category-landing/category-landing.component';

/**
 * Building-materials landing page (Phase 14). A category-specific shim over
 * the reusable, data-driven CategoryLandingComponent.
 */
@Component({
  selector: 'app-building-materials-landing',
  imports: [CategoryLandingComponent],
  templateUrl: 'building-materials-landing.component.html',
  styleUrl: 'building-materials-landing.component.css',
})
export class BuildingMaterialsLandingComponent {
  readonly categoryId = 'building-materials';
}