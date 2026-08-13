import { Routes } from '@angular/router';

export const realEstateRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'rent',
  },
  {
    path: 'rent',
    loadComponent: () =>
      import('./pages/real-estate-landing/real-estate-landing.component').then(
        (m) => m.RealEstateLandingComponent,
      ),
  },
  {
    path: 'sell',
    loadComponent: () =>
      import('./pages/real-estate-landing/real-estate-landing.component').then(
        (m) => m.RealEstateLandingComponent,
      ),
  },
  {
    path: 'mortgage',
    loadComponent: () =>
      import('./pages/real-estate-landing/real-estate-landing.component').then(
        (m) => m.RealEstateLandingComponent,
      ),
  },
  {
    path: 'daily-rent',
    loadComponent: () =>
      import('./pages/real-estate-landing/real-estate-landing.component').then(
        (m) => m.RealEstateLandingComponent,
      ),
  },
];
