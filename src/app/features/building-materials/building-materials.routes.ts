import { Routes } from '@angular/router';

export const buildingMaterialsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/building-materials-landing/building-materials-landing.component').then(
        (m) => m.BuildingMaterialsLandingComponent,
      ),
  },
];
