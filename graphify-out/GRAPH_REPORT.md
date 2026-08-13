# Graph Report - .  (2026-08-13)

## Corpus Check
- Corpus is ~27,184 words - fits in a single context window. You may not need a graph.

## Summary
- 514 nodes · 1247 edges · 31 communities (17 shown, 14 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Dynamic Form Engine & Conditions|Dynamic Form Engine & Conditions]]
- [[_COMMUNITY_Advert Core Domain (DTOModels)|Advert Core Domain (DTO/Models)]]
- [[_COMMUNITY_Create & Search Pages (Category+Form)|Create & Search Pages (Category+Form)]]
- [[_COMMUNITY_Angular Build Configuration|Angular Build Configuration]]
- [[_COMMUNITY_CLI & Dependencies|CLI & Dependencies]]
- [[_COMMUNITY_Marketplace Category Definitions|Marketplace Category Definitions]]
- [[_COMMUNITY_App Bootstrap & Routes|App Bootstrap & Routes]]
- [[_COMMUNITY_Create Serializer & Submit Flow|Create Serializer & Submit Flow]]
- [[_COMMUNITY_UiSelect Component|UiSelect Component]]
- [[_COMMUNITY_UiInput Component|UiInput Component]]
- [[_COMMUNITY_UiTextarea Component|UiTextarea Component]]
- [[_COMMUNITY_ESLint Configuration|ESLint Configuration]]
- [[_COMMUNITY_Opencode Plugin|Opencode Plugin]]
- [[_COMMUNITY_Adverts Routes|Adverts Routes]]
- [[_COMMUNITY_Advert Detail Page|Advert Detail Page]]
- [[_COMMUNITY_Advert Edit Page|Advert Edit Page]]
- [[_COMMUNITY_Advert List Page|Advert List Page]]
- [[_COMMUNITY_Building Materials Routes|Building Materials Routes]]
- [[_COMMUNITY_Building Materials Landing|Building Materials Landing]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]

## God Nodes (most connected - your core abstractions)
1. `Advert` - 47 edges
2. `DynamicFieldDefinition` - 28 edges
3. `CategoryRegistry` - 26 edges
4. `AdvertSearchQuery` - 20 edges
5. `MockAdvertRepository` - 19 edges
6. `AdvertCategoryDefinition` - 19 edges
7. `DynamicFieldAdapter` - 19 edges
8. `AdvertCategoryId` - 18 edges
9. `AdvertRepository` - 16 edges
10. `AdvertType` - 16 edges

## Surprising Connections (you probably didn't know these)
- `TestHost` --references--> `Advert`  [EXTRACTED]
  src/app/shared/ui/ui-advert-card/ui-advert-card.component.spec.ts → src/app/features/adverts/domain/advert.model.ts
- `AttributeDisplayRow` --references--> `DynamicFieldDefinition`  [EXTRACTED]
  src/app/shared/category/advert-attributes.presenter.ts → src/app/shared/form/dynamic-field.model.ts
- `AdvertCategoryDefinition` --references--> `AdvertCategoryId`  [EXTRACTED]
  src/app/shared/category/advert-category.model.ts → src/app/features/adverts/domain/advert-category.ts
- `AdvertListComponent` --references--> `AdvertSort`  [EXTRACTED]
  src/app/features/adverts/pages/advert-list/advert-list.component.ts → src/app/features/adverts/domain/advert-search.ts
- `AdvertCategoryDefinition` --references--> `AdvertType`  [EXTRACTED]
  src/app/shared/category/advert-category.model.ts → src/app/features/adverts/domain/advert-type.ts

## Import Cycles
- None detected.

## Communities (31 total, 14 thin omitted)

### Community 0 - "Dynamic Form Engine & Conditions"
Cohesion: 0.07
Nodes (49): routes, AdvertDto, AdvertListDto, AdvertMediaDto, CreateAdvertRequestDto, UpdateAdvertRequestDto, ADVERT_FIXTURES, advertMapper (+41 more)

### Community 1 - "Advert Core Domain (DTO/Models)"
Cohesion: 0.06
Nodes (42): ConditionValueResolver, evaluateCondition(), evaluateOperator(), DynamicFieldAdapter, DynamicFieldBootstrap, BuiltInValidatorName, DynamicFieldCondition, DynamicFieldDefinition (+34 more)

### Community 2 - "Create & Search Pages (Category+Form)"
Cohesion: 0.09
Nodes (26): BuildingMaterialsLandingComponent, BuildingServicesLandingComponent, RealEstateLandingComponent, AdvertCategoryDefinition, AdvertSectionDefinition, SectionLayout, CategoryLandingComponent, CategoryRegistry (+18 more)

### Community 3 - "Angular Build Configuration"
Cohesion: 0.10
Nodes (24): AdvertCreateComponent, AdvertEditComponent, advertiseFromForm(), advertToFormValues(), advertUpdateFromForm(), asNumber(), asString(), buildAttributes() (+16 more)

### Community 4 - "CLI & Dependencies"
Cohesion: 0.08
Nodes (24): basicInfoSection, buildingMaterialsCategoryDefinition, contactSection, deliverySection, locationPricingSection, quantitySection, basicInfoSection, buildingServicesCategoryDefinition (+16 more)

### Community 5 - "Marketplace Category Definitions"
Cohesion: 0.07
Nodes (29): build, lint, serve, test, builder, configurations, defaultConfiguration, options (+21 more)

### Community 6 - "App Bootstrap & Routes"
Cohesion: 0.14
Nodes (14): devDependencies, @angular/build, @angular/compiler-cli, angular-eslint, eslint, @eslint/js, jsdom, postcss (+6 more)

### Community 9 - "UiInput Component"
Cohesion: 0.27
Nodes (9): AttributeDisplayRow, AttributeGroup, DisplayValue, formatRawValue(), formatValue(), groupAttributes(), isCurrencyField(), isEmpty() (+1 more)

### Community 11 - "ESLint Configuration"
Cohesion: 0.22
Nodes (9): dependencies, @angular/common, @angular/compiler, @angular/core, @angular/forms, @angular/platform-browser, @angular/router, rxjs (+1 more)

### Community 17 - "Building Materials Routes"
Cohesion: 0.29
Nodes (7): scripts, build, lint, ng, start, test, watch

### Community 18 - "Building Materials Landing"
Cohesion: 0.43
Nodes (3): App, appConfig, AppNavComponent

### Community 20 - "Community 20"
Cohesion: 0.33
Nodes (6): ru-dar-ru-website, prefix, projectType, root, schematics, sourceRoot

### Community 21 - "Community 21"
Cohesion: 0.60
Nodes (4): currencyText(), PriceDisplay, priceText(), toDisplay()

### Community 22 - "Community 22"
Cohesion: 0.40
Nodes (4): newProjectRoot, projects, $schema, version

### Community 23 - "Community 23"
Cohesion: 0.40
Nodes (5): cli, analytics, packageManager, schematicCollections, @angular/cli

### Community 24 - "Community 24"
Cohesion: 0.40
Nodes (4): angular, { defineConfig }, eslint, tseslint

### Community 25 - "Community 25"
Cohesion: 0.40
Nodes (4): name, packageManager, private, version

## Knowledge Gaps
- **112 isolated node(s):** `@opencode-ai/plugin`, `$schema`, `version`, `packageManager`, `schematicCollections` (+107 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Advert` connect `Dynamic Form Engine & Conditions` to `Create & Search Pages (Category+Form)`, `Angular Build Configuration`, `Create Serializer & Submit Flow`, `UiSelect Component`, `UiInput Component`, `Advert Edit Page`, `Community 19`, `Community 21`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Why does `DynamicFieldDefinition` connect `Advert Core Domain (DTO/Models)` to `UiInput Component`, `Create & Search Pages (Category+Form)`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `CategoryRegistry` connect `Create & Search Pages (Category+Form)` to `Dynamic Form Engine & Conditions`, `UiInput Component`, `CLI & Dependencies`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **What connects `@opencode-ai/plugin`, `$schema`, `version` to the rest of the system?**
  _112 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Dynamic Form Engine & Conditions` be split into smaller, more focused modules?**
  _Cohesion score 0.06743986254295532 - nodes in this community are weakly interconnected._
- **Should `Advert Core Domain (DTO/Models)` be split into smaller, more focused modules?**
  _Cohesion score 0.06442127773322641 - nodes in this community are weakly interconnected._
- **Should `Create & Search Pages (Category+Form)` be split into smaller, more focused modules?**
  _Cohesion score 0.08633879781420765 - nodes in this community are weakly interconnected._