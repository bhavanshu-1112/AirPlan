# Security

## Threat Model

### Assets
1. **User household data** — location, family members, health conditions
2. **API keys** — Anthropic API key
3. **Uploaded photos** — may contain EXIF location data, personal content
4. **LLM prompts/responses** — contain user-specific data

### Trust Boundaries
1. Browser ↔ Next.js server
2. Next.js server ↔ External APIs (Open-Meteo, Anthropic)
3. User input ↔ LLM context (prompt injection boundary)

### Top 8 Threats and Mitigations

| # | Threat | Mitigation | Evidence |
|---|---|---|---|
| T1 | Prompt injection via household fields | Delimited user content blocks; system prompt instructs model to ignore embedded instructions; zod validates output | `src/lib/llm/prompts.ts`, `tests/evals/injection.test.ts` |
| T2 | Prompt injection via uploaded image text | Image content treated as untrusted; structured output only; zod validation | `src/lib/llm/auditVision.ts` |
| T3 | API key exposure | Env-only, fail-fast, never sent to client, `.env` in `.gitignore` | `src/lib/llm/client.ts`, `.gitignore` |
| T4 | Malicious file upload | Magic byte verification, size limit (5 MB), EXIF stripping, type whitelist, no public storage | `src/lib/security/validateUpload.ts` |
| T5 | Denial of service | Rate limiter (10 req/min on /plan, /audit), request body size limits, outbound timeouts | `src/lib/security/rateLimit.ts` |
| T6 | XSS via LLM output | Zod-parsed JSON only, no `dangerouslySetInnerHTML`, CSP without `unsafe-eval` | `next.config.ts`, component code |
| T7 | EXIF location leakage | EXIF stripped before storage or model submission | `src/lib/security/validateUpload.ts` |
| T8 | Supply chain attack | Pinned lockfile, `npm audit --audit-level=high` in verify, minimal deps | `package-lock.json`, `npm run verify` |

### Residual Risks
1. **Open-Meteo API availability** — no SLA; mitigated by fixture fallback but not eliminated.
2. **LLM output quality** — model may produce unhelpful but schema-valid plans; mitigated by traceability but not fully eliminated.
3. **In-memory rate limiter** — resets on restart; acceptable for hackathon MVP.
4. **No HTTPS enforcement** — noted for deployment; HSTS header configured for production.
5. **No authentication** — intentionally out of scope; any user can read/write any household by ID.

## Privacy
- No real names required (display labels only)
- No analytics or tracking
- Coordinates and household details redacted in logs
- Photos deleted after analysis (unless DEMO_MODE)
- Short privacy note displayed in UI footer
- Data stored locally in JSON files, not transmitted to third parties except Anthropic (for plan generation) and Open-Meteo (for forecasts, with coordinates only)

## Dependency Justifications

| Package | Justification |
|---|---|
| `next` | App framework (App Router, API routes, SSR) |
| `react`, `react-dom` | UI rendering |
| `zod` | Runtime validation, single source of truth for types |
| `@anthropic-ai/sdk` | LLM API client |
| `tailwindcss` | Utility-first CSS, mobile-first responsive |
| `jest`, `ts-jest` | Unit/integration testing |
| `@playwright/test` | E2E testing |
| `jest-axe`, `@axe-core/playwright` | Accessibility testing |
| `eslint-plugin-jsx-a11y` | Lint-time accessibility checks |
| `eslint-plugin-security` | Lint-time security pattern detection |

## HTTP Security Headers

Configured in `next.config.ts`:
- `Content-Security-Policy`: no `unsafe-eval`, strict source lists
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`: restrictive
- `X-Frame-Options: DENY`
- `Strict-Transport-Security`: noted for production deployment behind HTTPS
