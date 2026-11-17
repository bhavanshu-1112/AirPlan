# AirPlan — Urban Air Quality Assistant

> Every evening, AirPlan turns tomorrow's smog forecast into a plan for one specific family: when to walk, which mask, when to open a window. It shows how much exposure each choice saves, and the math is on screen.

## 🎯 Problem

Severe winter smog affects millions of families in Indian cities. AirPlan helps families navigate poor air quality with low-emission daily routines, indoor air quality hacks, and sustainable alternatives — tailored to their location and lifestyle, while clearly explaining the direct impact of their choices.

## 🚀 Quick Start

```bash
# Clone and install
git clone <repo-url> && cd urban-air-ai
cp .env.example .env   # DEMO_MODE=true by default
npm install

# Run the app
npm run dev             # http://localhost:3000

# Run all checks
npm run verify          # Typecheck, lint, test, audit, bundle check
```

## 📋 Features

1. **Household Profile** — Location, family members with age/sensitivity, home type, windows, purifier, commute, cooking, masks
2. **Tomorrow's Air Plan** — Hourly PM2.5 forecast mapped to your schedule with per-member recommendations
3. **Indoor Audit** — Upload a room photo for AI-powered findings with confidence levels
4. **Impact Cards** — Before/after exposure with formula, range, and cigarette-equivalent
5. **Bilingual** — English and Hindi toggle for all text
6. **Myth Buster** — Verified claims with sources

## 🏗️ Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full diagram and ADRs.

```
src/
  app/           # Next.js App Router pages and API routes
  lib/
    calc/        # Pure calculation functions (no I/O)
    data/        # Open-Meteo adapter + cache
    llm/         # Anthropic client + plan agent
    security/    # Validation, rate limiting, headers
    i18n/        # English + Hindi
    store/       # Repository pattern (JSON file store)
    schemas/     # Zod schemas (single source of truth)
  components/    # Accessible React components
  content/       # Static content (myths)
  fixtures/      # Demo data
```

## 🔍 Verification

```bash
npm run verify    # Runs all 6 judging parameters
```

See [JUDGING.md](JUDGING.md) for the full evidence map.

## 📖 Documentation

- [JUDGING.md](JUDGING.md) — What we did, how to verify it
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — System design and ADRs
- [docs/CALCULATIONS.md](docs/CALCULATIONS.md) — All formulas with sources
- [docs/SECURITY.md](docs/SECURITY.md) — Threat model and mitigations
- [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md) — WCAG 2.2 AA compliance
- [docs/PERFORMANCE.md](docs/PERFORMANCE.md) — Budgets and benchmarks
- [docs/TESTING.md](docs/TESTING.md) — Strategy and coverage
- [docs/ALIGNMENT.md](docs/ALIGNMENT.md) — Theme-to-feature mapping
- [docs/ASSUMPTIONS.md](docs/ASSUMPTIONS.md) — Design decisions

## 🧪 Demo

### Demo Households

- **Household A (Sharma family):** Gurugram, infant + 6-year-old with asthma + two adults, apartment, average windows, no purifier
- **Household B (Gupta couple):** Gurugram, elderly couple, independent house, leaky windows, purifier CADR 250 m³/h

### 2-Minute Demo Script

1. Open `http://localhost:3000` → Click "Load Demo Household A"
2. View the personalized plan → Note infant gets no mask recommendation
3. Expand "Show the math" on any impact card → See the formula
4. Toggle to Hindi → All text changes, `lang` attribute updates
5. Click "Indoor Audit" → Upload demo photo → See findings
6. Click "Apply to my plan" → See the exposure delta
7. Load Demo Household B → Different recommendations for same AQI

## ⚙️ Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | Live mode only | — | Anthropic API key |
| `ANTHROPIC_MODEL` | No | `claude-sonnet-4-20250514` | Model for LLM calls |
| `DEMO_MODE` | No | `true` | Run with fixtures, no API keys needed |

## 📝 Contributing

- Conventional commits: `feat:`, `fix:`, `docs:`, `test:`, `chore:`
- Run `npm run verify` before pushing
- See `.editorconfig` for formatting

## 📄 License

MIT
