import { Routes } from '@angular/router';

export const buildingServicesRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/building-services-landing/building-services-landing.component').then(
        (m) => m.BuildingServicesLandingComponent,
      ),
  },
];
