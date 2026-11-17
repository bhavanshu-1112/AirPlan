# Testing Strategy

> To be completed with coverage results after Phase 9-10.

## Layers

### Unit Tests (Jest + ts-jest)
- **Scope:** `src/lib/calc/*`, `src/lib/security/*`, `src/lib/schemas/*`, `src/lib/data/*`, `src/lib/store/*`
- **Coverage gates:**
  - `lib/calc`: 95% lines/branches
  - `lib/security`: 90% lines/branches
  - Global: 80% lines/branches
- **Run:** `npm run test:unit`

### Integration Tests (Jest)
- **Scope:** Every API route (`/api/geocode`, `/api/forecast`, `/api/plan`, `/api/audit`, `/api/household`)
- **Cases per route:** valid input, invalid input, oversized input, rate-limit exceeded, upstream failure (mocked), demo-mode path
- **Run:** `npm run test:integration`

### LLM Tests (Jest, no network)
- **Scope:** `planAgent` with a fake LLM client
- **Cases:** Happy path, untraceable number rejected + retried, malformed JSON, tool-call loop cap, prompt injection strings, Hindi output
- **Run:** `npm run test:unit` (in `tests/evals/`)

### E2E Tests (Playwright)
- **Scope:** Full user flows in `DEMO_MODE`
- **Flows:** Load demo household A → view plan → expand "Show the math" → switch to Hindi → upload photo → apply findings → see delta
- **Run:** `npm run test:e2e`

### Accessibility Tests
- **Component level:** `jest-axe` on all components (zero violations)
- **Page level:** `@axe-core/playwright` axe checks on every page (zero violations)
- **Run:** Included in `npm run test:unit` and `npm run test:e2e`

## What Is Not Tested and Why

1. **Real LLM responses** — requires API key and costs money; tested with fake client and golden fixtures instead.
2. **Real Open-Meteo responses** — external dependency; tested with fixtures and mock adapters.
3. **PostgreSQL implementation** — not implemented (JSON store only); repository interface is tested.
4. **Browser-specific rendering** — Playwright covers Chrome; Safari/Firefox not tested in CI.
5. **Performance under load** — no load testing; single-user benchmarks only.

## Running All Tests

```bash
npm run verify    # Runs everything in order
npm run test:unit
npm run test:integration
npm run test:e2e
```

## Coverage Summary

> To be filled after final test run.
