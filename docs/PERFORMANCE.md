# AirPlan — Performance

## Design Principles

1. **Minimal bundle:** No heavy frameworks (no LangChain, no heavy SDK wrappers). Zero-dependency native fetch Google Gemini client + Zod + Tailwind.
2. **Server-side where possible:** Myth Buster, AQI Badge, Member Chip, and Loading Skeleton are server components.
3. **Cache everything:** TTL cache on forecast (30 min) and geocoding (24 h) with in-flight dedup.
4. **Demo mode:** Fully offline from fixtures — zero network latency.

## Caching Strategy

| Data                 | TTL             | Dedup           |
| -------------------- | --------------- | --------------- |
| Air quality forecast | 30 minutes      | Yes (in-flight) |
| Geocoding results    | 24 hours        | Yes (in-flight) |
| Household data       | N/A (file read) | N/A             |

The `TTLCache` class in `src/lib/data/cache.ts` supports:

- Time-based expiry
- In-flight request deduplication (concurrent requests for the same key share one fetch)

## Calculation Layer Performance

All calc functions are pure and synchronous — no I/O, no async overhead:

- `calcExposure`: O(n) where n = hourly data points (~72 for 3-day forecast)
- `calcIndoorConcentration`: O(1) — single formula evaluation
- `calcMaskEffect`: O(1)
- `calcVentilationWindows`: O(n) sliding window
- `calcCommuteSwap`: O(1)
- `calcCigaretteEquivalent`: O(1)

Benchmark target: entire calc suite < 1ms for a typical household.

## Bundle Size

Target: < 500 kB raw JS (≈ 150 kB gzipped) for the main route.

Checked by `npm run verify` which runs `next build` and measures total JS in `.next/static/`.

## Network Requests

| Page  | API Calls    | Notes                                     |
| ----- | ------------ | ----------------------------------------- |
| Home  | 0            | Static content + myths.json (bundled)     |
| Setup | 1+ geocode   | Debounced at 300ms                        |
| Plan  | 1 plan POST  | Single request, includes all calc results |
| Audit | 1 audit POST | Image upload, single response             |

## Image Handling

- Client-side downscale to max 1280px before upload (reduces transfer size)
- Max upload size: 5 MB
- No image storage — analyzed and discarded (unless DEMO_MODE)
