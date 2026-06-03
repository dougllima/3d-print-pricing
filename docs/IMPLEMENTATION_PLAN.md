# Implementation Plan

## Phase 1 - Project setup

Tasks:

- Create Vite React TypeScript project.
- Configure Tailwind CSS.
- Configure shadcn/ui.
- Configure path alias `@`.
- Configure Vitest.
- Create base folder structure.
- Create base app layout with navigation.

Suggested commit:

```txt
chore: setup project foundation
```

## Phase 2 - Domain and calculation engine

Tasks:

- Create domain types.
- Create Zod schemas.
- Create calculation service.
- Add unit tests for calculation rules.
- Add number/currency/date helpers.

Suggested commit:

```txt
feat: add domain model and calculation engine
```

## Phase 3 - Storage abstraction

Tasks:

- Create repository interfaces.
- Create localStorage repository implementation.
- Create storage keys.
- Create app data context.
- Seed initial global settings.

Suggested commit:

```txt
feat: add local storage repositories
```

## Phase 4 - Materials

Tasks:

- Create materials page.
- Create material form.
- Add optional HEX color picker.
- Add optional stock fields.
- Add material stock status.
- Add material list.
- Add create/edit/archive behavior.

Suggested commit:

```txt
feat: add material management
```

## Phase 4.1 - Material stock tracking

Tasks:

- Add nominal spool weight field.
- Add remaining filament weight field.
- Add low stock threshold field.
- Validate remaining weight against spool weight.
- Show stock status in materials list.
- Show low-stock summary in dashboard.
- Warn in calculation flow when required material weight exceeds remaining stock.
- Do not automatically subtract material stock when saving calculations.

Suggested commit:

```txt
feat: add material stock tracking
```

## Phase 5 - Printers

Tasks:

- Create printers page.
- Create printer form.
- Add printer list.
- Add create/edit/archive behavior.

Suggested commit:

```txt
feat: add printer management
```

## Phase 6 - Products

Tasks:

- Create products page.
- Create product form.
- Add product list.
- Add create/edit/archive behavior.

Suggested commit:

```txt
feat: add product management
```

## Phase 7 - Print profiles

Tasks:

- Create print profiles page.
- Create print profile form.
- Allow linking to product.
- Allow standalone print profiles.
- Add create/edit/duplicate/favorite/archive behavior.

Suggested commit:

```txt
feat: add print profile management
```

## Phase 8 - New calculation

Tasks:

- Create new calculation page.
- Allow standalone calculation.
- Allow calculation from print profile.
- Allow overriding copied values.
- Add finishing tasks.
- Show detailed breakdown.
- Save calculation to history.

Suggested commit:

```txt
feat: add cost calculation flow
```

## Phase 9 - History and dashboard

Tasks:

- Create history page.
- List saved calculations.
- Show calculation details.
- Create dashboard summary.

Suggested commit:

```txt
feat: add history and dashboard
```

## Phase 10 - Polish

Tasks:

- Improve empty states.
- Improve responsive layout.
- Improve validation messages.
- Review accessibility basics.
- Review README.
- Run final build and tests.

Suggested commit:

```txt
chore: polish MVP
```
