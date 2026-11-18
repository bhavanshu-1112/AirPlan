# AirPlan — Judging Evidence Map

> **Quick start:** `npm install && npm run verify` runs all checks with a single command.
> Demo mode runs fully offline — no API keys needed.

## How to Run

```bash
git clone <repo>
cd urban-air-ai
npm install
cp .env.example .env.local   # DEMO_MODE=true is already set
npm run verify                # Runs all 6 parameter checks
npm run dev                   # Start dev server, visit http://localhost:3000
```

---

## Parameter 1: Code Quality

| What we did                                                               | Evidence                                                   |
| ------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Layered architecture (route → service → calc)                             | `docs/ARCHITECTURE.md` (mermaid diagrams + 3 ADRs)         |
| TypeScript strict + noUncheckedIndexedAccess + exactOptionalPropertyTypes | `tsconfig.json`                                            |
| Zod schemas as single source of truth                                     | `src/lib/schemas/*.ts`                                     |
| Pure calc functions with JSDoc                                            | `src/lib/calc/*.ts` (all exported functions documented)    |
| AppError hierarchy + errorToResponse                                      | `src/lib/security/errors.ts`                               |
| No `any`, no dead code, no console.log                                    | ESLint rules in `eslint.config.mjs`                        |
| Complexity ≤ 10                                                           | `eslint.config.mjs` → `complexity: ['error', { max: 10 }]` |
| Conventional commits                                                      | `git log --oneline`                                        |

**Verify:** `npm run typecheck && npm run lint`

---

## Parameter 2: Security

| What we did                     | Evidence                                                                            |
| ------------------------------- | ----------------------------------------------------------------------------------- |
| Zod `.strict()` on all schemas  | `src/lib/schemas/*.ts`                                                              |
| Upload magic byte validation    | `src/lib/security/validateUpload.ts` + `tests/unit/security/validateUpload.test.ts` |
| Rate limiting                   | `src/lib/security/rateLimit.ts` + `tests/unit/security/rateLimit.test.ts`           |
| CSP + security headers          | `next.config.ts`                                                                    |
| Secret scan in verify           | `scripts/verify.js` → `secretScan()`                                                |
| LLM user content isolation      | `src/lib/llm/prompts.ts` → `<USER_DATA>` tags                                       |
| Prompt injection tests          | `tests/evals/injection.test.ts`                                                     |
| Sensitive key redaction in logs | `src/lib/security/logger.ts` + test                                                 |

**Verify:** `npm run verify` (includes secret scan + security lint rules)

---

## Parameter 3: Efficiency

| What we did                               | Evidence                                                                                 |
| ----------------------------------------- | ---------------------------------------------------------------------------------------- |
| TTL cache with in-flight dedup            | `src/lib/data/cache.ts` + `tests/unit/data/cache.test.ts`                                |
| Pure sync calc functions (no I/O)         | `src/lib/calc/*.ts`                                                                      |
| Server components where possible          | `src/components/AqiBadge.tsx`, `MemberChip.tsx`, `MythBuster.tsx`, `LoadingSkeleton.tsx` |
| Client-side image downscale before upload | `src/components/PhotoUpload.tsx`                                                         |
| Bundle size check in verify               | `scripts/verify.js` → `bundleSizeCheck()`                                                |
| No heavy frameworks (no LangChain)        | `package.json` — only `@anthropic-ai/sdk` + `zod`                                        |

**Verify:** `npm run verify` (includes bundle size check) and `npm run bench`

---

## Parameter 4: Testing

| What we did                                        | Evidence                                                              |
| -------------------------------------------------- | --------------------------------------------------------------------- |
| Calc layer: 8 test files, hand-calculated examples | `tests/unit/calc/*.test.ts`                                           |
| Security: 6 test files                             | `tests/unit/security/*.test.ts`                                       |
| Data/Store: 3 test files                           | `tests/unit/data/*.test.ts`, `tests/unit/store/*.test.ts`             |
| LLM: 2 test files                                  | `tests/unit/llm/*.test.ts`                                            |
| Schemas: 2 test files                              | `tests/unit/schemas/*.test.ts`, `tests/unit/security/schemas.test.ts` |
| i18n: 1 test file                                  | `tests/unit/i18n/*.test.ts`                                           |
| API routes: 2 test files                           | `tests/unit/api/*.test.ts`                                            |
| Evals (injection): 1 test file                     | `tests/evals/injection.test.ts`                                       |
| Coverage threshold: 80% global                     | `jest.config.ts`                                                      |

**Verify:** `npm run test:coverage`

---

## Parameter 5: Accessibility

| What we did                    | Evidence                                                                                |
| ------------------------------ | --------------------------------------------------------------------------------------- |
| Skip-to-content link           | `src/app/layout.tsx` line 1 of body                                                     |
| Semantic landmarks             | `header[role=banner]`, `main[role=main]`, `footer[role=contentinfo]`, `nav[aria-label]` |
| Form labels + aria-describedby | `src/components/HouseholdForm.tsx`                                                      |
| Never color-only (AQI badge)   | `src/components/AqiBadge.tsx` (icon + text + pattern)                                   |
| aria-expanded on ImpactCard    | `src/components/ImpactCard.tsx`                                                         |
| aria-pressed on LanguageToggle | `src/components/LanguageToggle.tsx`                                                     |
| role="alert" for errors        | `src/components/HouseholdForm.tsx`, `src/app/plan/page.tsx`, `src/app/audit/page.tsx`   |
| 44px min touch targets         | All interactive elements                                                                |
| prefers-reduced-motion         | `src/app/globals.css`                                                                   |
| eslint-plugin-jsx-a11y         | `eslint.config.mjs`                                                                     |

**Verify:** `npm run lint` (includes jsx-a11y rules)

See `docs/ACCESSIBILITY.md` for full details.

---

## Parameter 6: Problem Statement Alignment

| What we did                                          | Evidence                                                                         |
| ---------------------------------------------------- | -------------------------------------------------------------------------------- |
| Household profile with all fields                    | `src/components/HouseholdForm.tsx`, `src/lib/schemas/household.ts`               |
| Tomorrow's Air Plan with impact cards                | `src/app/plan/page.tsx`, `src/lib/llm/planAgent.ts`                              |
| Indoor Audit (photo upload)                          | `src/app/audit/page.tsx`, `src/app/api/audit/route.ts`                           |
| Impact card: before/after, formula, range, cig equiv | `src/components/ImpactCard.tsx`                                                  |
| English + Hindi toggle                               | `src/lib/i18n/translations.ts`, `src/components/LanguageToggle.tsx`              |
| Myth buster with sources                             | `src/components/MythBuster.tsx`, `src/content/myths.json`                        |
| LLM never invents numbers                            | `src/lib/llm/planAgent.ts` → deterministic calc, `tests/evals/injection.test.ts` |
| Different households → different plans               | `tests/evals/injection.test.ts` → "different households" test                    |
| Demo households A vs B                               | `src/fixtures/households.json`                                                   |

See `docs/ALIGNMENT.md` for full analysis.

---

## Known Limitations

1. **EXIF stripping** not yet implemented — files are validated but EXIF metadata is not removed before analysis.
2. **Live LLM mode** exists but is untested in CI — demo mode is the tested path.
3. **Rate limiting** is in-memory and resets on server restart.
4. **No authentication** — household data accessible by ID (out of scope per spec).
5. **E2E tests** cover basic page load; full flow E2E planned but not complete.
