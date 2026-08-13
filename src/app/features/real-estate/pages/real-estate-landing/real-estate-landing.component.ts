import { Component } from '@angular/core';
import { CategoryLandingComponent } from '../../../../shared/category/category-landing/category-landing.component';

/**
 * Real-estate landing page (Phase 14). A category-specific shim over the
 * reusable, data-driven CategoryLandingComponent.
 */
@Component({
  selector: 'app-real-estate-landing',
  imports: [CategoryLandingComponent],
  templateUrl: 'real-estate-landing.component.html',
  styleUrl: 'real-estate-landing.component.css',
})
export class RealEstateLandingComponent {
  readonly categoryId = 'real-estate';
}