import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./features/search/pages/search-page/search-page.component').then(
        (m) => m.SearchPageComponent,
      ),
  },
  {
    path: 'adverts',
    loadChildren: () => import('./features/adverts/adverts.routes').then((m) => m.advertsRoutes),
  },
  {
    path: 'real-estate',
    loadChildren: () =>
      import('./features/real-estate/real-estate.routes').then((m) => m.realEstateRoutes),
  },
  {
    path: 'building-materials',
    loadChildren: () =>
      import('./features/building-materials/building-materials.routes').then(
        (m) => m.buildingMaterialsRoutes,
      ),
  },
  {
    path: 'building-services',
    loadChildren: () =>
      import('./features/building-services/building-services.routes').then(
        (m) => m.buildingServicesRoutes,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
