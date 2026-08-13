import { Routes } from '@angular/router';

export const advertsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/advert-list/advert-list.component').then((m) => m.AdvertListComponent),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./pages/advert-create/advert-create.component').then((m) => m.AdvertCreateComponent),
  },
  {
    path: 'favorites',
    loadComponent: () =>
      import('./pages/advert-favorites/advert-favorites.component').then(
        (m) => m.AdvertFavoritesComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/advert-detail/advert-detail.component').then((m) => m.AdvertDetailComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/advert-edit/advert-edit.component').then((m) => m.AdvertEditComponent),
  },
];
