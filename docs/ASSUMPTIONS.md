# Assumptions

> Design decisions made autonomously during development. Each is flagged where it affects output.

## Calculation Assumptions

1. **Penetration factor P = 0.8** — Fraction of outdoor PM2.5 entering indoors. Based on US EPA guidance for typical residential buildings. Flagged as assumption in `constants.ts`.

2. **Air exchange rates** — Tight 0.3/h, Average 0.7/h, Leaky 1.5/h, Open window 4.0/h. Based on simplified ASHRAE ranges. These vary significantly by building.

3. **Deposition rate k = 0.2/h** — PM2.5 deposition onto indoor surfaces. Literature range is 0.1-0.4/h. Flagged as assumption.

4. **Forecast uncertainty ±25%** — Default band on PM2.5 forecasts. Open-Meteo does not publish confidence intervals. Widened by 10% per 12h beyond 24h ahead.

5. **Cigarette equivalence: 22 µg/m³ × 24h ≈ 1 cigarette** — Berkeley Earth rule of thumb. Always labeled "rough analogy" in the UI.

6. **Indoor cooking source: 300 µg/h** — Emission rate for gas stove cooking. Literature ranges from 100-1000 µg/h depending on fuel, ventilation, and food type. Flagged as assumption.

7. **Incense source: 150 µg/h** — Flagged as assumption.

8. **Mask fit factors** — N95: 0.8 (accounting for typical imperfect seal), Surgical: 1.0 (no seal assumed), Cloth: 1.0. These are simplified from occupational health data.

## Technical Assumptions

9. **Anthropic model default: `claude-sonnet-4-20250514`** — Chosen for best tool-use performance at reasonable cost. Configurable via `ANTHROPIC_MODEL` env var.

10. **Room ceiling height default: 2.7m** — Used when not specified. Typical for Indian residential buildings.

11. **Demo household locations: Gurugram** — Chosen as representative severe-winter-smog city in India.

12. **Rate limit: 10 requests/minute per IP** — Reasonable for a single-user app. In-memory, resets on restart.

13. **Image downscale to 1280 px** — Balances quality for vision model analysis with upload size.

14. **Font stack for Devanagari** — Using system fonts (`Noto Sans Devanagari` as preferred, falling back to system default).

15. **Plan cache key** — `hash(householdId, forecastDay, language)`. Assumes same household + same day + same language = same plan.
