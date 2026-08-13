import { Service, inject } from '@angular/core';
import { CategoryRegistry } from './category-registry';
import { buildingMaterialsCategoryDefinition } from '../../features/building-materials/category/building-materials.definitions';
import { buildingServicesCategoryDefinition } from '../../features/building-services/category/building-services.definitions';
import {
  realEstateCategoryDefinition,
  realEstateSubcategoryDefinitions,
} from '../../features/real-estate/category/real-estate.definitions';

/**
 * Central registration point. Called once at app startup (on APP_INITIALIZER)
 * to seed the CategoryRegistry with all known category definitions.
 */
@Service()
export class CategoryBootstrap {
  private readonly registry = inject(CategoryRegistry);

  registerAll(): void {
    this.registry.registerDefinition(
      realEstateCategoryDefinition,
      ...realEstateSubcategoryDefinitions,
      buildingMaterialsCategoryDefinition,
      buildingServicesCategoryDefinition,
    );
  }
}
