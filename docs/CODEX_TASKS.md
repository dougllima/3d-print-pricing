# Codex Tasks

## Task 1 - Inspect project

```txt
Read AGENTS.md and all files in docs/. Then inspect the current project structure. Summarize what exists, what is missing, and propose the next safest implementation step. Do not change files yet.
```

## Task 2 - Setup Tailwind and shadcn

```txt
Read AGENTS.md and docs/IMPLEMENTATION_PLAN.md.

Configure Tailwind CSS and shadcn/ui for this Vite React TypeScript project.

Requirements:
- keep code in English;
- keep UI labels in Portuguese;
- configure path alias @;
- update or create any required config files;
- do not implement business features yet;
- run build if possible;
- summarize changed files.
```

## Task 3 - Create domain model

```txt
Read AGENTS.md, docs/DOMAIN_MODEL.md, and docs/CALCULATION_RULES.md.

Create the initial domain types and Zod schemas.

Requirements:
- create feature-based folders when appropriate;
- use English names in code;
- do not create UI yet;
- export types cleanly;
- validate optional HEX color when present;
- keep Product separate from PrintProfile;
- run typecheck/build if possible;
- summarize changed files.
```

## Task 4 - Implement calculation service

```txt
Read AGENTS.md and docs/CALCULATION_RULES.md.

Implement the cost calculation service and unit tests.

Requirements:
- keep calculation logic independent from React;
- do not access localStorage;
- return raw numbers, not formatted currency strings;
- cover material cost, energy cost, machine cost, maintenance cost, finishing cost, failure reserve, suggested price, profit, margin and waste percentage;
- use Vitest;
- run tests;
- summarize changed files and test results.
```

## Task 5 - Implement storage abstraction

```txt
Read AGENTS.md, docs/DOMAIN_MODEL.md, and docs/IMPLEMENTATION_PLAN.md.

Create the localStorage-based storage abstraction.

Requirements:
- components must not access localStorage directly;
- define repository contracts;
- create localStorage implementation;
- support materials, printers, products, print profiles, settings and cost calculations;
- make future replacement by Firebase/Supabase/API straightforward;
- add basic tests if useful;
- summarize changed files.
```

## Task 6 - Implement materials feature

```txt
Read AGENTS.md and docs/DOMAIN_MODEL.md.

Implement the Materials feature.

Requirements:
- UI labels in Portuguese;
- create material form;
- create material list;
- support create, edit and archive/deactivate;
- include optional HEX color field with visual preview;
- validate with Zod and React Hook Form;
- do not permanently delete by default;
- use repository abstraction;
- summarize changed files.
```

## Task 6.1 - Implement material stock tracking

```txt
Read AGENTS.md, docs/DOMAIN_MODEL.md, and docs/CALCULATION_RULES.md.

Implement lightweight stock tracking for Materials.

Requirements:
- UI labels in Portuguese;
- add optional spool weight, remaining weight and low-stock threshold fields;
- validate stock fields with Zod and React Hook Form;
- remaining weight may be greater than spool weight and should be interpreted as multiple spools;
- show stock status in the material list;
- show low-stock information in the dashboard;
- show a warning in the calculation flow when required material weight exceeds remaining stock;
- do not automatically subtract stock when saving calculations;
- use repository abstraction;
- summarize changed files.
```

## Task 7 - Implement printers feature

```txt
Read AGENTS.md and docs/DOMAIN_MODEL.md.

Implement the Printers feature.

Requirements:
- UI labels in Portuguese;
- create printer form;
- create printer list;
- support create, edit and archive/deactivate;
- keep depreciation fields optional;
- use repository abstraction;
- validate with Zod and React Hook Form;
- summarize changed files.
```

## Task 8 - Implement products and print profiles

```txt
Read AGENTS.md and docs/DOMAIN_MODEL.md.

Implement Products and Print Profiles.

Requirements:
- UI label for PrintProfile must be "Impressões";
- Product must not store material, weight, print time or slicer settings;
- PrintProfile can be linked to a Product or standalone;
- support create, edit, duplicate, favorite and archive where practical;
- use repository abstraction;
- validate with Zod and React Hook Form;
- summarize changed files.
```

## Task 9 - Implement new calculation flow

```txt
Read AGENTS.md, docs/DOMAIN_MODEL.md, and docs/CALCULATION_RULES.md.

Legacy note: this standalone flow is planned to be removed from the main navigation. Prefer calculations from saved PrintProfiles and PrintQueueItems in future work.

Implement the New Calculation page.

Requirements:
- allow standalone calculation;
- allow calculation from a saved PrintProfile;
- copied values may be overridden before calculating;
- support optional finishing tasks;
- show detailed cost breakdown;
- save CostCalculation snapshot to history;
- do not mutate Product, Material, Printer or PrintProfile when saving calculation;
- summarize changed files.
```

## Task 9.1 - Refine print profiles as production configurations

```txt
Read AGENTS.md, docs/DOMAIN_MODEL.md, and docs/CALCULATION_RULES.md.

Refactor PrintProfile so Impressões represent real production configurations.

Requirements:
- Product remains independent from materials, printer, weights and slicer settings;
- PrintProfile belongs to a Product optionally and one Printer;
- PrintProfile supports one or more quantity-specific print runs;
- each print run supports one or more materials;
- each material usage stores model, support, purge and other waste weights in grams;
- print time must be stored in minutes and collected as hours + minutes in the UI;
- saved print runs use slicer totals directly and must not multiply weights/time by quantity again;
- show generated cost and suggested price inside the Impressões list;
- keep standalone calculation available only as an optional simulation flow;
- keep repository abstraction;
- update tests and summarize changed files.
```

## Task 9.2 - Implement print queue

```txt
Read AGENTS.md, docs/DOMAIN_MODEL.md, and docs/CALCULATION_RULES.md.

Implement the print queue feature.

Requirements:
- UI labels in Portuguese;
- create PrintQueueItem domain type and Zod schema;
- add repository/storage support for print queue items;
- remove the standalone New Calculation page from the main navigation;
- add a Fila page;
- queue items must reference one PrintProfile and one PrintProfileRun;
- only runs with all material slots filled can be added to the queue;
- materials are inherited from the PrintProfile and cannot be overridden in the queue in v1;
- optional queue fields: client name, price and deadline;
- show a table with product name, selected filaments, plate count, total print time, client, price, deadline and status;
- support manual reordering;
- support queued, started, finished and canceled statuses;
- starting a queued item must subtract material stock exactly once and set stockConsumedAt;
- starting must be blocked when controlled stock is insufficient;
- finishing an item must not change stock;
- use repository abstraction;
- cover stock consumption rules with unit tests;
- run lint, test and build;
- summarize changed files.
```

## Task 10 - Review implementation

```txt
Read AGENTS.md and docs/.

Review the current implementation against the MVP scope.

Check:
- calculation correctness;
- TypeScript safety;
- separation between UI and business logic;
- localStorage abstraction;
- snapshot behavior in history;
- Portuguese UI labels;
- missing tests;
- build/test status.

Do not change files. Return a prioritized list of issues.
```
