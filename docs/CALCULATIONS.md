# Calculations Reference

> All formulas used in AirPlan's calculation layer. Every constant has a source comment and an `isAssumption` flag in `src/lib/calc/constants.ts`.

## Exposure (µg/m³·h)

```
E = Σ_h (C_h × t_h)
```

Where:
- `C_h` = PM2.5 concentration in the place occupied during hour `h` (µg/m³)
- `t_h` = time spent in that place during hour `h` (hours, typically 1.0)
- Places: outdoor, indoor, in transit

## Indoor Concentration (Steady State)

```
C_in = (P × a × C_out + S/V) / (a + k + CADR/V)
```

Where:
- `P` = penetration factor (default 0.8) — fraction of outdoor PM2.5 that enters
- `a` = air exchange rate (per hour):
  - Tight windows: 0.3/h
  - Average windows: 0.7/h
  - Leaky windows: 1.5/h
  - Open window: 4.0/h
- `C_out` = outdoor PM2.5 concentration (µg/m³)
- `k` = deposition rate (default 0.2/h)
- `CADR` = Clean Air Delivery Rate of purifier (m³/h), 0 if none
- `V` = room volume (m³) = area × ceiling height
- `S` = indoor source emission rate (µg/h), e.g. cooking or incense (**assumption**)

## Mask Effectiveness

```
C_breathed = C_ambient × (1 - filtration_efficiency × fit_factor)
```

| Mask Type | Filtration Efficiency | Fit Factor | Effective Reduction |
|---|---|---|---|
| N95 | 0.95 | 0.80 | 76% |
| Surgical | 0.40 | 1.00 | 40% |
| Cloth | 0.20 | 1.00 | 20% |
| None | 0.00 | 0.00 | 0% |

**Infants:** Masks are not recommended for infants (suffocation risk). The system computes zero mask benefit and explains why.

## Cigarette Equivalent

```
cigarettes = (total_exposure_ug_m3_h) / (22 × 24)
```

Based on Berkeley Earth rule of thumb: 22 µg/m³ PM2.5 sustained over 24 hours ≈ 1 cigarette. **Always labeled as "rough analogy".**

## Ventilation Window

Best contiguous hours where:
1. Outdoor PM2.5 < Indoor PM2.5 (steady state, windows closed)
2. Duration ≥ 30 minutes
3. If no such window exists: "keep windows closed today"

## Uncertainty

- Default forecast uncertainty band: ±25% (**assumption**)
- Beyond 24h ahead: band widens by 10% per additional 12h
- Propagated through all calculations: `low = central × (1 - band)`, `high = central × (1 + band)`
- Every result returns `{ central, low, high, formula, inputs }`

## Before/After Comparison

Each recommendation runs:
1. **Baseline scenario:** current behavior through the calc functions
2. **Recommended scenario:** recommended behavior through the same functions
3. **Delta:** `baseline.central - recommended.central` = exposure saved

## Sources

- Indoor air model: based on mass-balance steady-state model (Nazaroff & Cass, 1986)
- Mask filtration: WHO guidelines for PM2.5 protection
- Cigarette equivalence: Berkeley Earth (berkeleyearth.org)
- Penetration factor: US EPA indoor air quality guidance
- Air exchange rates: ASHRAE standards (simplified ranges)

> Constants marked `isAssumption: true` are estimates that could be refined with better data. They are always disclosed in the UI.
