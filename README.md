# 🌬️ AirPlan — Urban Air Quality Assistant

> Every evening, AirPlan turns tomorrow's smog forecast into a plan for one specific family: when to walk, which mask, when to open a window. It shows how much exposure each choice saves — and the math is on screen.

## Quick Start

```bash
npm install
cp .env.example .env.local   # DEMO_MODE=true (no API keys needed)
npm run dev                   # → http://localhost:3000
```

**Demo households:** Click "Sharma Family" or "Gupta Couple" on the home page to see a personalized plan.

## Verify (single command)

```bash
npm run verify
```

Runs: typecheck → lint → tests with coverage → secret scan → dependency audit → bundle size check. See results for all 6 judging parameters.

## Features

| Feature               | Description                                                                              |
| --------------------- | ---------------------------------------------------------------------------------------- |
| **Household Profile** | City search, family members (age/sensitivity), home details, commute, cooking, masks     |
| **Tomorrow's Plan**   | Personalized hourly recommendations with impact cards showing before/after exposure      |
| **Indoor Audit**      | Upload a room photo → structured findings with confidence and fixes                      |
| **Impact Cards**      | Before/after µg/m³·h, cigarette equivalents, formula, uncertainty range, "Show the math" |
| **Languages**         | English ↔ Hindi toggle for all UI strings and generated text                             |
| **Myth Buster**       | 6 verified claims with sources                                                           |

## Architecture

```
src/
  app/           # Next.js App Router pages + API routes
  lib/
    calc/        # Pure deterministic calculation functions
    schemas/     # Zod schemas (single source of truth)
    security/    # Validation, rate limiting, upload safety
    data/        # Open-Meteo adapter + TTL cache
    llm/         # Plan agent + tool definitions
    i18n/        # English + Hindi translations
    store/       # Repository interface + JSON implementation
  components/    # React components (accessible, tested)
  content/       # Static data (myths.json)
  fixtures/      # Demo mode data
```

**Core rule:** The LLM never invents numbers. All calculations come from the deterministic calc layer (`src/lib/calc/`), unit-tested with hand-calculated examples.

## Tech Stack

- **Next.js 16** (App Router) + **TypeScript** (strict)
- **Tailwind CSS 4** (mobile-first)
- **Zod v4** (schema validation)
- **@anthropic-ai/sdk** (LLM, direct SDK)
- **Jest** + **Playwright** (testing)
- **Open-Meteo** (air quality forecast)

## Environment Variables

See `.env.example`:

```
DEMO_MODE=true              # Runs fully offline from fixtures
ANTHROPIC_API_KEY=           # Required only when DEMO_MODE=false
ANTHROPIC_MODEL=claude-sonnet-4-20250514  # Default model
```

## Documentation

- [`JUDGING.md`](JUDGING.md) — Evidence map for 6 judging parameters
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — System design + ADRs
- [`docs/CALCULATIONS.md`](docs/CALCULATIONS.md) — All formulas with constants
- [`docs/SECURITY.md`](docs/SECURITY.md) — Security model
- [`docs/ACCESSIBILITY.md`](docs/ACCESSIBILITY.md) — WCAG compliance
- [`docs/TESTING.md`](docs/TESTING.md) — Test strategy
- [`docs/ASSUMPTIONS.md`](docs/ASSUMPTIONS.md) — Design decisions

## Contributing

- Conventional commits (`feat:`, `fix:`, `docs:`, `chore:`, `test:`)
- `npm run verify` must pass before merge
- ESLint + Prettier with zero warnings
- All new functions in `lib/calc` need JSDoc with units
