# core-contracts — vibe-prep checklist
Generated: 2026-08-17
Project: ru-dar-ru (رو در رو)
Implements: Master Roadmap **Phase 1 — Core Contracts** (domain-agnostic, no UI, no Real Estate branching)
Swagger: none (backend API not yet provided — pair-programming later)
Angular refs fetched: best-practices.md, llms-full.txt (2026-08-17) — Angular 22 target confirmed by angular.dev; standalone-by-default, `input()`/`output()`/`model()`, signal-based state, `inject()`, native control flow (`@if`/`@for`/`@switch`), Signal Forms for new forms
opencode skills to invoke: all skills available globally in this opencode setup (no per-project subset) — apply `angular-developer` for framework conventions, `ui-ux-pro-max` only if any UI leaks in (it shouldn't this phase)

## Observed / Assumed
- OBSERVED: this is the first vibe-prep run for ru-dar-ru — no project-graph.json exists yet, so there is nothing to reuse.
- OBSERVED: the master prompt (§32 / Phase 1) restricts this phase to contracts only — no UI, no Real Estate branching, no future-phase work.
- ASSUMED: I (Claude/vibe-prep) do not have direct access to this repository. The master prompt's own **Phase 0 — Repository Audit** (Angular/TypeScript/Node versions, existing folder structure, lint/test config, etc.) has not been confirmed by me. If that audit hasn't been run yet in opencode, run it first — the observed Angular version, strictness settings, and existing conventions may require adjusting Phase 0 below (e.g. if the repo isn't actually on Angular 22 yet, per the master prompt's §10 version-discipline rule, do not silently target 22).
- ASSUMED: repo uses TypeScript strict mode and a `src/` feature-folder structure per Angular's official style guide (no confirmation from an actual audit) — verify and correct in Phase 0 below if the real repo differs.

## Reuse Check
- Advert, AdvertType, AdvertLocation, CategoryDefinition, SectionDefinition, FieldDefinition, FilterDefinition, Media, repository interfaces: all **new** — nothing exists in the project graph to reuse or extend. This is expected for a Phase 1 checklist on a fresh project.

## Dependencies
(none needed for this phase — pure TypeScript interfaces/types, no new package required)

## Side Effects & Critical Sections
- [ ] Confirm actual installed Angular version before assuming v22 conventions apply — UNRESOLVED, run master-prompt Phase 0 (repository audit) first if not already done, and report `Observed: X / Target: 22 / Upgrade: out of scope` if they differ.
- [ ] Confirm actual folder/module structure before creating a `core/` or `contracts/` directory — UNRESOLVED, same reason as above.

---

## Phase 0 — Setup & Contracts

You are implementing **Phase 1 of a larger marketplace-engine master roadmap**: domain-agnostic core
contracts only. Do NOT write any component, service logic, or Real Estate-specific field. These
types must stay usable by any future domain, not just Real Estate.

Create TypeScript interfaces/enums only, in a new folder (adjust the path below if the real repo's
convention differs — check first):

```
src/app/core/contracts/
  advert.model.ts
  advert-type.ts
  advert-location.ts
  category-definition.ts
  section-definition.ts
  field-definition.ts
  filter-definition.ts
  media.ts
  repositories/
    advert-repository.ts
    category-definition-source.ts
```

Required shapes (do not add Real Estate fields — these are generic):

```ts
// advert-type.ts
export type AdvertType = 'provider' | 'consumer';

// advert-location.ts
export interface AdvertLocation {
  city: string;
  district?: string;
  coordinates?: { lat: number; lng: number };
  hideExactLocation: boolean;
  approximateZone?: { center: { lat: number; lng: number }; radiusMeters: number };
}

// media.ts
export interface Media {
  id: string;
  url: string;
  type: 'image' | 'video';
  order: number;
}

// advert.model.ts
export interface Advert {
  id: string;
  categorySlug: string;       // links to CategoryDefinition, not a hard enum
  advertType: AdvertType;
  ownerId: string;
  title: string;
  description: string;
  location: AdvertLocation;
  media: Media[];
  fields: Record<string, unknown>; // category-defined field values — engine must not know their shape
  publishingState: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

// field-definition.ts
export type FieldType =
  | 'text' | 'number' | 'select' | 'multi-select' | 'boolean'
  | 'range' | 'location-picker' | 'media' | 'textarea';

export interface FieldDefinition {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: { value: string; label: string }[];
  validation?: Record<string, unknown>;
  visibilityRule?: string;      // expression evaluated against other field values — do not hard-code interpretation here
  appliesTo?: AdvertType[];     // e.g. only 'provider', or both
  dependsOn?: string[];         // other field keys this one's visibility/options depend on
}

// section-definition.ts
export interface SectionDefinition {
  key: string;
  label: string;
  fields: FieldDefinition[];
}

// filter-definition.ts
export interface FilterDefinition {
  key: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
}

// category-definition.ts
export interface CategoryDefinition {
  slug: string;
  label: string;
  parentSlug?: string;          // for subcategories
  sections: SectionDefinition[];
  filters: FilterDefinition[];
}
```

Repository interfaces (contracts only — no implementation yet):

```ts
// repositories/category-definition-source.ts
export interface CategoryDefinitionSource {
  getBySlug(slug: string): Promise<CategoryDefinition | null>;
  list(): Promise<CategoryDefinition[]>;
}

// repositories/advert-repository.ts
export interface AdvertRepository {
  getById(id: string): Promise<Advert | null>;
  search(params: unknown): Promise<Advert[]>; // PROPOSED CONTRACT — params shape belongs to Phase 6 (Search Engine), do not design it now
  create(advert: Partial<Advert>): Promise<Advert>;
  update(id: string, advert: Partial<Advert>): Promise<Advert>;
}
```

Mark both repository files with a top-of-file comment: `// PROPOSED CONTRACT — no backend exists yet;
this is the frontend-facing shape both mock and future HTTP implementations must satisfy.`

Update `project-graph.json` with nodes for every type/interface above (`type: "type"`), tagged
`feature: "core-contracts"`, before stopping.

**Stop here. Do not begin Phase 1 (Structure) in this same response.**

---

## Phase 1 — Structure & Scaffolding

No mock implementations or component logic yet. Just wire the module boundary:

- Create `src/app/core/contracts/index.ts` barrel file exporting everything from Phase 0.
- Confirm (do not assume) how the rest of the repo currently imports shared types — if there's an
  existing `core/` or `shared/` barrel convention, follow it instead of introducing a new one.
- No routes, no components — this phase is skeleton only, and for Phase 1 of the master roadmap
  there is no UI at all.

Update `project-graph.json` with the barrel file path before stopping.

**Stop here. Do not begin Phase 2 (Implementation) in this same response.**

---

## Phase 2 — Implementation

There is no business logic for this phase — Core Contracts is types and interfaces only, per the
master prompt's explicit Phase 1 scope ("Do not implement UI. Do not implement Real Estate-specific
branching. Do not implement future functionality."). If deepseek finds itself writing a class with
methods beyond a barrel export, stop — that belongs to Phase 3 (Advert Engine) or later, not here.

The only thing to add here: a short `README.md` inside `src/app/core/contracts/` documenting that
this folder holds domain-agnostic contracts only, and that any Real Estate-specific type belongs in
a future category-configuration module (master roadmap Phase 2), never here.

Update `project-graph.json` with a note that this constraint is documented.

**Stop here. Do not begin Phase 3 (Integration) in this same response.**

---

## Phase 3 — Integration

Nothing to integrate yet — no services or forms consume these contracts in this phase. Instead, do a
self-check pass:

- Re-read every interface from Phase 0 and confirm none of them contain a Real Estate-specific
  field (no `rooms`, `floor`, `dealType`, `rent`, `mortgage`, etc. anywhere in this folder). If you
  find one, remove it — Real Estate specifics belong in Phase 2 of the master roadmap
  (Category Configuration), expressed as data, not in these generic contracts.
- Confirm `AdvertLocation` has no logic for computing `approximateZone` from `coordinates` — per the
  master prompt, that's backend-owned; the frontend only ever renders what it's given.

Update `project-graph.json` if any correction was made.

**Stop here. Do not begin Phase 4 (Polish) in this same response.**

---

## Phase 4 — Polish & Verification

- Run the repo's actual `tsc`/type-check and lint scripts (use whatever `package.json` defines —
  don't invent commands). Fix any type errors introduced by this phase only.
- Re-check every entry in "Side Effects & Critical Sections" above and mark it handled or not.
- Confirm the `PROPOSED CONTRACT` comments are present on both repository interface files.

Produce your final output in this exact report template, filled in for what you actually did:

```markdown
### Implemented
- {what was actually built}

### Files Changed
- {path}: {created | modified}

### Verification
- {command run} → {result}

### Observed
- {confirmed facts encountered while implementing}

### Assumed
- {anything inferred or unverified — flag clearly}

### Risks / Issues
- {anything that might need a second look}

### Deferred / Next Steps
- {work spotted but out of scope for this phase}
```

Update `project-graph.json` one final time with anything from this phase, then paste the filled-in
report back into the Claude chat that generated this checklist for review.

**Stop here. Do not continue to any other feature or phase automatically.**
