# AirPlan — Judging Guide

> **Read this first.** Every claim below has a command and a file path. Run `npm run verify` for the full automated check.

## Quick Start

```bash
git clone <repo-url> && cd urban-air-ai
cp .env.example .env   # DEMO_MODE=true by default
npm install
npm run verify          # runs all checks, prints 6-parameter table
npm run dev             # start the app
```

## Parameter Evidence

### 1. Code Quality

| Claim | Evidence |
|---|---|
| Strict TypeScript (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) | [`tsconfig.json`](tsconfig.json) |
| ESLint with typescript-eslint strict + jsx-a11y + security, zero warnings | `npm run lint` / [`eslint.config.mjs`](eslint.config.mjs) |
| Prettier formatting enforced | `npm run format:check` / [`.prettierrc`](.prettierrc) |
| `tsc --noEmit` clean | `npm run typecheck` |
| Zod schemas as single source of truth | [`src/lib/schemas/`](src/lib/schemas/) |
| Typed error hierarchy with error-to-HTTP mapper | [`src/lib/security/errors.ts`](src/lib/security/errors.ts) |
| Structured logger with redaction, no `console.log` in source | [`src/lib/security/logger.ts`](src/lib/security/logger.ts) |
| Small pure functions in calc layer with JSDoc | [`src/lib/calc/`](src/lib/calc/) |
| Architecture docs with mermaid diagram and ADRs | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) |
| Conventional commits | `git log --oneline` |

### 2. Security

| Claim | Evidence |
|---|---|
| Zod `.strict()` on every API route | [`src/lib/schemas/`](src/lib/schemas/) |
| Upload validation: magic bytes, size limit, EXIF strip | [`src/lib/security/validateUpload.ts`](src/lib/security/validateUpload.ts) |
| Secrets only from env, fail-fast | [`src/lib/llm/client.ts`](src/lib/llm/client.ts) |
| LLM isolation: delimited user content, zod-only parsing | [`src/lib/llm/prompts.ts`](src/lib/llm/prompts.ts) |
| Rate limiter on /plan and /audit | [`src/lib/security/rateLimit.ts`](src/lib/security/rateLimit.ts) |
| Security headers (CSP, X-Content-Type-Options, etc.) | [`next.config.ts`](next.config.ts) |
| Prompt injection tests | [`tests/evals/`](tests/evals/) |
| Secret scan in verify | `npm run verify` (secret-scan step) |
| Threat model | [`docs/SECURITY.md`](docs/SECURITY.md) |

### 3. Efficiency

| Claim | Evidence |
|---|---|
| Single LLM call per plan with tool-use loop cap (6) | [`src/lib/llm/planAgent.ts`](src/lib/llm/planAgent.ts) |
| In-memory TTL cache for forecast (30 min) and geocoding (24 h) | [`src/lib/data/cache.ts`](src/lib/data/cache.ts) |
| Prompt caching via `cache_control` | [`src/lib/llm/client.ts`](src/lib/llm/client.ts) |
| Client-side image downscale to max 1280 px | [`src/components/PhotoUpload.tsx`](src/components/PhotoUpload.tsx) |
| Bundle size budget enforced | `npm run verify` (bundle-size step) |
| Calc layer benchmark | `npm run bench` / [`docs/PERFORMANCE.md`](docs/PERFORMANCE.md) |

### 4. Testing

| Claim | Evidence |
|---|---|
| Calc layer ≥ 95% coverage | `npm run test:unit -- --coverage` |
| Security layer ≥ 90% coverage | `npm run test:unit -- --coverage` |
| Global ≥ 80% coverage | `npm run test:unit -- --coverage` |
| Integration tests for every API route | [`tests/integration/`](tests/integration/) |
| LLM tests with fake client, injection tests | [`tests/evals/`](tests/evals/) |
| E2E with Playwright in DEMO_MODE | `npm run test:e2e` |
| Accessibility tests (jest-axe + Playwright axe) | `npm run test:a11y` |
| Testing strategy doc | [`docs/TESTING.md`](docs/TESTING.md) |

### 5. Accessibility

| Claim | Evidence |
|---|---|
| Semantic HTML landmarks, skip link, heading order | [`src/app/layout.tsx`](src/app/layout.tsx) |
| All form controls labeled, errors with role="alert" | [`src/components/`](src/components/) |
| Full keyboard operation, visible focus ring | Tailwind focus utilities, Playwright keyboard test |
| AQI never color-only: text + icon + pattern | [`src/components/AqiBadge.tsx`](src/components/AqiBadge.tsx) |
| `lang` attribute dynamic (en/hi) | [`src/app/layout.tsx`](src/app/layout.tsx) |
| eslint-plugin-jsx-a11y enforced | [`eslint.config.mjs`](eslint.config.mjs) |
| jest-axe on components | [`tests/unit/`](tests/unit/) |
| Playwright axe zero violations | [`tests/e2e/`](tests/e2e/) |
| WCAG 2.2 AA checklist | [`docs/ACCESSIBILITY.md`](docs/ACCESSIBILITY.md) |

### 6. Problem Statement Alignment

| Claim | Evidence |
|---|---|
| Theme alignment table | [`docs/ALIGNMENT.md`](docs/ALIGNMENT.md) |
| Household profiles with sensitivity | [`src/lib/schemas/household.ts`](src/lib/schemas/household.ts) |
| Hourly PM2.5 forecast | [`src/lib/data/openmeteo.ts`](src/lib/data/openmeteo.ts) |
| Impact cards with before/after and formula | [`src/components/ImpactCard.tsx`](src/components/ImpactCard.tsx) |
| Indoor audit with photo | [`src/app/api/audit/route.ts`](src/app/api/audit/route.ts) |
| English/Hindi toggle | [`src/lib/i18n/`](src/lib/i18n/) |
| Share plan as plain text | [`src/components/SharePlan.tsx`](src/components/SharePlan.tsx) |
| Demo households A and B produce different plans | `npm run test:e2e` |

## Known Limitations

1. **No real database** — JSON file store; PostgreSQL swap documented but not implemented.
2. **No authentication** — intentionally out of scope for MVP.
3. **Forecast accuracy** — Open-Meteo free tier; ±25% uncertainty band is an assumption.
4. **Cigarette-equivalent** — rough analogy (Berkeley Earth), always labeled as such.
5. **Indoor source term** — cooking/incense emission rates are assumptions, flagged in constants.
6. **Hindi translations** — LLM-generated for plan text; UI strings are manually curated but may have minor issues.
7. **DEMO_MODE** — uses fixture data and canned LLM responses; no network calls needed.
