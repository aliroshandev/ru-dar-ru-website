# core/contracts

Domain-agnostic **Core Contracts** for the marketplace engine.

## What lives here

TypeScript interfaces/types only — no components, no services, no business logic,
no mocks. These types describe the stable, generic contracts that the Category
Engine, Advert Engine, Dynamic Form Engine, and Search Engine all consume.

## Constraint

This folder must stay **domain-agnostic**. Do **not** put any Real Estate-specific
type or field here — no `rooms`, `floor`, `dealType`, `rent`, `mortgage`,
`deposit`, `area`, etc.

Real Estate (and any future domain) is expressed as **configuration data**, not as
types or branching in generic contracts. Any domain-specific type belongs in a
future category-configuration module (master roadmap **Phase 2 — Category
Configuration**), never here.

Adding a new domain must require adding configuration/data, not editing these
contracts or any generic engine.
