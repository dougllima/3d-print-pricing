# AGENTS.md

## Project

This is a React + Vite + TypeScript MVP for calculating prices and real production costs of FDM 3D printed products.

The application is intended for personal use, portfolio value, and future evolution into a backend-backed app.

## Product context

Before implementing features, read these documents:

- `docs/PROJECT_BRIEF.md`
- `docs/DOMAIN_MODEL.md`
- `docs/CALCULATION_RULES.md`
- `docs/IMPLEMENTATION_PLAN.md`
- `docs/CODEX_TASKS.md`

## Tech stack

Use:

- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- Context API + useReducer
- Vitest
- React Testing Library when component tests are useful

## Architecture rules

- Use feature-based folders.
- Keep calculation logic isolated from React components.
- Do not access `localStorage` directly from components.
- Use a repository/storage abstraction so localStorage can later be replaced by Firebase, Supabase, or an API.
- Treat cost calculations as business logic and cover them with unit tests.
- Prefer explicit domain types over loose objects.
- Prefer small components and small functions.
- Keep UI labels in Portuguese.
- Keep code, types, functions, and file names in English.

## Business rules

- MVP supports FDM only.
- Do not add resin support in MVP v1.
- Product and PrintProfile are separate concepts.
- UI should call PrintProfile "Impressões".
- A Product is a catalog item.
- A PrintProfile is a specific way to manufacture a product.
- A CostCalculation is a snapshot and must not change when material or printer data changes later.
- Material color HEX/RGB is optional.
- Finishing is optional and calculated by labor hours plus extra material cost.
- Suggested price uses real margin over final price: `totalCost / (1 - margin)`.

## Testing expectations

Before finishing a task involving business logic, run:

```bash
npm run test
```

Before finishing broader implementation tasks, run:

```bash
npm run lint
npm run test
npm run build
```

If scripts do not exist yet, create or update them when appropriate.

## Review guidelines

When reviewing code, check:

- calculation correctness;
- TypeScript type safety;
- form validation;
- separation between UI and business logic;
- localStorage abstraction;
- whether historical calculations use snapshots;
- whether UI remains understandable in Portuguese.
