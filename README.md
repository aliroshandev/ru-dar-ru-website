# ru-dar-ru-website

رو در رو (Face-to-Face) Frontend Website — Angular 22.
Universal Marketplace Engine (advert/category-driven). Real estate is the
first domain; building materials and building services are planned.

## Development

```bash
npm install
npm start            # ng serve
npm run test         # ng test (Vitest)
npm run lint         # ng lint
npm run build        # ng build (production, strict TS)
npm run watch        # ng build --watch --configuration development
```

## Structure

- `src/app/core/` — singleton infra (auth, config, errors, guards, http)
- `src/app/shared/` — domain-agnostic UI primitives, dynamic form engine, pipes, directives
  - `ui/ui-advert-card` — shared, category-agnostic advert card (thumbnail via `primaryImage`, title, description, category/type badges, price, location, «مشاهده» link, plus an `advert-footer` projection slot for page-specific actions); used by the list, favorites, and search result grids so presentation stays consistent; prices formatted via the pricing presenter (supports category-aware per-unit labels)
  - `favorites/favorite-store.ts` — persistent, signal-based set of favorited advert ids (web-storage-backed, browser-only)
  - `form/fields/image-field` + `form/dynamic-field-bootstrap.ts` — `image` field type (URL input for photo galleries) registered as a first-class dynamic field, so category configs can declare reusable media sections; media flows both ways: create form → `CreateAdvertRequest.media` and `Advert.media` → edit form image fields
  - `form/dynamic-field-renderer` — instantiates the field component for each type via the registry and renders the field's `label`/`description` above every control (checkbox renders its own inline label, so it's skipped to avoid duplication)
  - `form/dynamic-form-factory.ts` — builds a Signal Forms `FieldTree` from category sections/fields and runs it inside an injection context + `untracked()`, so it can be called safely from anywhere (including `computed()` bodies in the create/edit/search pages); cross-field `when` conditions resolve siblings through `SchemaPath` proxies (not raw string keys — those are invalid WeakMap keys); invalidators/availability are data-driven and conditional
  - `form/serializer.ts` — `advertiseFromForm()` maps live dynamic-form values → `CreateAdvertRequest` (title/description/location/pricing recognized, everything else → `attributes`); collects non-empty `image*` keys into `media`; plus the edit round-trip: `advertToFormValues()` seeds an edit form from an `Advert` (media images flattened onto the form's image keys in sort order), and `advertUpdateFromForm()` builds a partial `UpdateAdvertRequest` (changed-only + preserved non-form attributes, media emitted only when the form image URLs change); and `buildSearchQuery()` maps search-form values (`q`, location, `minPrice/maxPrice`, `minArea/maxArea`) onto an `AdvertSearchQuery`
  - `category/advert-attributes.presenter.ts` — read-only presenter grouping an advert's `attributes` by the category's field definitions (labels + localized option/currency values)
  - `category/advert-media.presenter.ts` — read-only presenter exposing `primaryImage(advert)` (first image by sort order) so browse/list/favorites card grids can show a representative thumbnail without reaching into the media array shape
  - `category/advert-pricing.presenter.ts` — read-only presenter `priceText(advert.pricing)` that formats a flat price, a per-unit rate (with an optional unit label, e.g. «هر متر»), or «توافقی» when negotiable, shared by the card, detail, and similar-adverts price displays
  - `category/category-landing` — reusable, data-driven category landing page (title/description + subcategory nav cards; deep-links to search/list/create via query params). Domain landings are thin shims over it
- `nav/app-nav` — persistent app header (brand + home/search/adverts/create links, sticky, router active states)
- `src/app/features/` — business features (adverts, search, home, real-estate, building-materials, building-services)
  - `home` — data-driven marketplace hub (root-category cards + live per-category advert counts + latest-adverts section, all via `AdvertRepository.search()`, category-agnostic)
  - `search/pages/search-page` — category-driven search (registry + dynamic search form in search mode) mapping live values to an `AdvertSearchQuery` via `buildSearchQuery`, with a result grid that shows a media thumbnail per card via `primaryImage`
  - `adverts/pages/advert-list` — marketplace browse page (category filter + type filter (provider/consumer, derived from the category's `supportedAdvertTypes`) + sort + paginated card grid via `AdvertRepository.search()`; each card shows a media thumbnail via `primaryImage`)
  - `adverts/pages/advert-favorites` — saved-adverts page driven by `FavoriteStore` ids + `search({ ids })`, with remove toggle
  - `adverts/pages/advert-detail` — advert detail (core fields + presenter-driven attribute groups) with edit link, favorite toggle, confirm-to-delete (`AdvertRepository.delete()`), status transitions (mark sold / reactivate via `update({ status })`), and a similar-adverts cross-sell section (other active adverts in the same subcategory via `search()`, current excluded)
  - `adverts/data/advert.mock-repository` — in-memory repository implementing the full contract (`getById/search/create/update/delete`), including category-specific `filters` (against `attributes`, incl. `{min,max}` numeric ranges), location + fuzzy `q`, free-text `q`, price-range, `ids`/`statuses` scoping, and sort; `seed()` (idempotent) populates it from `advert.fixtures.ts` at startup so the hub/list/search/detail pages have content. Public browse gates on `statuses: ['active']` so sold/inactive listings stay out of search while favorites/moderation see all
- Lazy-loaded feature routes; Persian (Farsi) RTL-first.