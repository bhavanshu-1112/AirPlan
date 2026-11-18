# AirPlan — Calculations Reference

All calculations are implemented in `src/lib/calc/` as pure functions with no I/O. Every function returns a `CalcResult` with `{ central, low, high, formula, inputs }`.

## Constants (`constants.ts`)

All constants carry `{ value, unit, source, isAssumption }` metadata.

| Constant               | Value | Unit          | Source                             | Assumption? |
| ---------------------- | ----- | ------------- | ---------------------------------- | ----------- |
| Penetration factor (P) | 0.8   | dimensionless | US EPA indoor air quality guidance | No          |
| Deposition rate (k)    | 0.2   | 1/h           | Lai & Nazaroff (2000)              | No          |
| Air exchange – tight   | 0.3   | 1/h           | ASHRAE 62.2                        | No          |
| Air exchange – average | 0.7   | 1/h           | ASHRAE 62.2                        | No          |
| Air exchange – leaky   | 1.5   | 1/h           | ASHRAE 62.2                        | No          |
| Air exchange – open    | 4.0   | 1/h           | ASHRAE 62.2 / field                | No          |
| N95 efficiency         | 0.95  | dimensionless | NIOSH certification                | No          |
| Surgical efficiency    | 0.60  | dimensionless | CDC guidance                       | No          |
| Cloth efficiency       | 0.30  | dimensionless | Clase et al. (2020)                | No          |
| Mask fit – adult       | 0.90  | dimensionless | OSHA fit-testing                   | No          |
| Mask fit – child       | 0.50  | dimensionless | Assumed                            | **Yes**     |
| Mask fit – elderly     | 0.70  | dimensionless | Assumed                            | **Yes**     |
| Mask fit – infant      | 0.00  | dimensionless | AAP: not recommended               | No          |
| Cigarette equiv.       | 528   | µg·h/m³       | Berkeley Earth (22 µg/m³ × 24h)    | No          |
| Uncertainty band       | 0.25  | dimensionless | Conservative default               | **Yes**     |
| Cooking source         | 300   | µg/h          | He et al. (2004)                   | No          |
| Incense source         | 150   | µg/h          | Jetter et al. (2002)               | No          |
| Default ceiling        | 2.7   | m             | Typical residential                | **Yes**     |
| Default room area      | 20    | m²            | Typical residential                | **Yes**     |
| Commute – car          | 0.6   | dimensionless | In-vehicle filtration              | No          |
| Commute – metro        | 0.4   | dimensionless | Subway air quality                 | No          |
| Commute – bus          | 0.7   | dimensionless | Transit exposure                   | No          |
| Commute – bicycle      | 1.2   | dimensionless | Increased ventilation              | No          |
| Commute – walk         | 1.0   | dimensionless | Baseline                           | No          |

## Formulas

### 1. Total Exposure (`exposure.ts`)

$$E = \sum_{h} C_h \times t_h$$

Where $C_h$ is the concentration in hour $h$ (µg/m³) and $t_h$ is the duration (hours, default 1).

### 2. Indoor Concentration (`indoor.ts`)

Steady-state mass balance:

$$C_{in} = \frac{P \times a \times C_{out} + S/V}{a + k + \text{CADR}/V}$$

Where:

- $P$ = penetration factor (0.8)
- $a$ = air exchange rate (1/h, by window condition)
- $C_{out}$ = outdoor PM2.5 (µg/m³)
- $S$ = indoor source emission (µg/h)
- $V$ = room volume (m³) = area × ceiling height
- $k$ = deposition rate (0.2/h)
- CADR = clean air delivery rate (m³/h)

### 3. Mask Effect (`mask.ts`)

$$C_{breathed} = C_{ambient} \times (1 - \eta \times f)$$

Where $\eta$ is filtration efficiency and $f$ is fit factor (by age group). Infants: mask benefit set to zero (safety concern).

### 4. Cigarette Equivalent (`cigarettes.ts`)

$$\text{cigarettes} = \frac{E}{528}$$

Based on Berkeley Earth rule of thumb: 22 µg/m³ daily average ≈ 1 cigarette/day. Always labeled "rough analogy".

### 5. Ventilation Windows (`ventilation.ts`)

Finds contiguous hours where outdoor PM2.5 < indoor PM2.5 (closed windows), with minimum duration of 1 hour. Returns sorted list by average PM2.5 (best first).

### 6. Commute Swap (`commuteSwap.ts`)

$$\Delta E = C_{ambient} \times t_{commute} \times (m_{current} - m_{alternative})$$

Where $m$ is the commute mode multiplier.

### 7. Uncertainty (`uncertainty.ts`)

$$\text{low} = \text{central} \times (1 - b)$$
$$\text{high} = \text{central} \times (1 + b)$$

Default band $b$ = 0.25 (±25%). Widened by +10% per 12 hours beyond 24 hours ahead.

## Property Invariants (tested)

1. Better mask never increases exposure
2. CADR = 0 is equivalent to no purifier
3. Ventilation window never recommended when outdoor > indoor
4. low ≤ central ≤ high for all CalcResults
5. Zero PM2.5 → zero exposure
