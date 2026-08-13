import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { AdvertRepository } from './features/adverts/data/advert.repository';
import { MockAdvertRepository } from './features/adverts/data/advert.mock-repository';
import { CategoryBootstrap } from './shared/category/category-bootstrap';
import { DynamicFieldBootstrap } from './shared/form/dynamic-field-bootstrap';
import { DynamicValidatorBootstrap } from './shared/form/dynamic-validator-bootstrap';

/**
 * Seeds the CategoryRegistry, DynamicFieldRegistry, and custom validator set
 * before the app renders so category definitions, field components, and
 * validation checks are always available to lazy-loaded features and the
 * form engine.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    CategoryBootstrap,
    DynamicFieldBootstrap,
    DynamicValidatorBootstrap,
    { provide: AdvertRepository, useClass: MockAdvertRepository },
    provideAppInitializer(() => {
      inject(CategoryBootstrap).registerAll();
      inject(DynamicFieldBootstrap).registerFields();
      inject(DynamicValidatorBootstrap).registerValidators();
      inject(AdvertRepository).seed();
    }),
  ],
};