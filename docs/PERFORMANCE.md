# Performance

> To be completed with measured numbers in Phase 10.

## Budgets

| Metric | Target | Measured | Status |
|---|---|---|---|
| Calc layer per plan | < 5 ms | TBD | — |
| Cached plan response | < 150 ms | TBD | — |
| First load JS (main route, gzipped) | < 150 kB | TBD | — |

## Efficiency Strategies

1. **LLM calls:** One planning call per household per forecast. Tool-use loop capped at 6 iterations.
2. **Prompt caching:** `cache_control` on static system prompt and tool definitions.
3. **Data caching:** In-memory TTL cache — forecast 30 min, geocoding 24 h.
4. **Calc layer:** Pure functions, O(hours × members), memoized scenario runs.
5. **Frontend:** Server components, lazy-loaded audit/myth panels, client-side image downscale to 1280 px max.
6. **Bundle:** No heavy UI libraries, skeletons instead of blocking spinners.

## Running Benchmarks

```bash
npm run bench
```

> Will print calc layer timing results when implemented.
