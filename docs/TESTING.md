# AirPlan — Testing Strategy

## Test Pyramid

```
        ╱ E2E (Playwright) ╲        ← 3-5 flows
       ╱ Integration (API)   ╲      ← API route tests
      ╱ Evals (LLM safety)    ╲     ← Injection resilience
     ╱ Unit (Jest)              ╲   ← Calc, schemas, security, data, store, i18n
    ╱─────────────────────────────╲
```

## Unit Tests (`tests/unit/`)

### Calculation Layer (`tests/unit/calc/`)
- `exposure.test.ts` — hand-calculated examples, zero input, property: low ≤ central ≤ high
- `indoor.test.ts` — mass balance verification, purifier effect, cooking source
- `mask.test.ts` — N95/surgical/cloth/none, infant zero benefit, property: better mask ≤ exposure
- `cigarettes.test.ts` — round-trip, known equivalence (528 µg·h/m³ = 1 cigarette)
- `ventilation.test.ts` — no windows when outdoor > indoor, minimum duration
- `uncertainty.test.ts` — ±25% band, widening beyond 24h
- `commuteSwap.test.ts` — car vs metro, same mode = zero diff
- `aqi.test.ts` — category boundaries, all 6 bands

### Security (`tests/unit/security/`)
- `errors.test.ts` — error hierarchy, errorToResponse mapping
- `rateLimit.test.ts` — allows up to limit, blocks after, resets after window
- `validateUpload.test.ts` — JPEG/PNG/WebP magic bytes, size limit, bad file rejection
- `sanitize.test.ts` — string trimming, coordinate redaction, API key redaction
- `schemas.test.ts` — Zod schema validation for all data types
- `logger.test.ts` — JSON output format, sensitive key redaction

### Data (`tests/unit/data/`)
- `cache.test.ts` — TTL expiry, in-flight dedup, concurrent requests
- `openmeteo.test.ts` — demo mode fixture returns, field validation

### Store (`tests/unit/store/`)
- `jsonStore.test.ts` — CRUD operations, file persistence, UUID generation

### LLM (`tests/unit/llm/`)
- `planAgent.test.ts` — plan generation, schema validation, infant mask handling, Hindi output
- `planTools.test.ts` — tool definitions structure, tool execution dispatch

### i18n (`tests/unit/i18n/`)
- `translations.test.ts` — key parity EN/HI, Devanagari detection, t() function

### API Routes (`tests/unit/api/`)
- `plan.test.ts` — POST handler with rate limiting, schema validation
- `audit.test.ts` — file upload validation, demo mode response

## Eval Tests (`tests/evals/`)

- `injection.test.ts` — Prompt injection in member names, city names; schema still valid, numbers still from calc layer; infant invariant holds; different households produce different plans

## Integration Tests (`tests/integration/`)

- API route integration with store and data layer

## E2E Tests (`tests/e2e/`)

- `home.spec.ts` — Page loads, accessibility check
- Full demo flow: setup → plan → verify (planned)

## Coverage Thresholds

```
Global: 80% lines, branches, functions, statements
```

## Running Tests

```bash
npm run test:unit          # Unit tests only
npm run test:coverage      # With coverage report
npm run test:e2e           # Playwright E2E
npm run verify             # Full 6-parameter check
```
