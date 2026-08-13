import { Component } from '@angular/core';
import { CategoryLandingComponent } from '../../../../shared/category/category-landing/category-landing.component';

/**
 * Building-services landing page (Phase 14). A category-specific shim over
 * the reusable, data-driven CategoryLandingComponent.
 */
@Component({
  selector: 'app-building-services-landing',
  imports: [CategoryLandingComponent],
  templateUrl: 'building-services-landing.component.html',
  styleUrl: 'building-services-landing.component.css',
})
export class BuildingServicesLandingComponent {
  readonly categoryId = 'building-services';
}