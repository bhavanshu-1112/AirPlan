# AirPlan — Problem Statement Alignment

## Theme: Urban Air Quality Assistant

AirPlan directly addresses the hackathon theme of helping families navigate severe winter smog with personalized, actionable guidance.

## Core Promise Delivered

> "Every evening, AirPlan turns tomorrow's smog forecast into a plan for one specific family."

### What AirPlan Does

1. **Personalizes by household:** Each family's plan considers their specific members (ages, health conditions), home characteristics (window seal, purifier), commute patterns, cooking habits, and mask availability.

2. **Uses real forecast data:** Integrates with Open-Meteo Air Quality API for hourly PM2.5/PM10/AQI forecasts. Falls back to realistic fixtures in DEMO_MODE.

3. **Quantifies every recommendation:** Every action comes with an Impact Card showing:
   - Before vs. after exposure (µg/m³·h)
   - Cigarette equivalents saved (labeled "rough analogy")
   - The formula with inputs substituted
   - Low/central/high uncertainty range
   - Data source label

4. **Tailors to vulnerable members:** Infants get "no mask" recommendations with explanation. Asthma and heart-condition members get activity restrictions. Elderly get adjusted fit factors.

5. **Covers indoor air quality:** Room photo audit identifies ventilation issues, pollution sources, purifier placement. Findings adjust planning parameters.

6. **Bilingual:** Full English and Hindi (Devanagari) support for all UI strings and generated plan text.

## Features Mapped to Requirements

| Requirement         | Feature                                                    | Status |
| ------------------- | ---------------------------------------------------------- | ------ |
| Household profile   | Full setup form with city search, members, home details    | ✅     |
| Tomorrow's Air Plan | Personalized hourly plan with top 3 actions                | ✅     |
| Indoor Audit        | Photo upload → structured findings                         | ✅     |
| Impact cards        | Before/after, formula, range, cigarette equiv, "Show math" | ✅     |
| Languages           | English/Hindi toggle with Devanagari                       | ✅     |
| Myth-buster         | 6 myths with verdicts and sources                          | ✅     |

## The LLM Role (bounded)

The LLM:

- ✅ Chooses actions by calling calc tools
- ✅ Reads room photos (vision model for indoor audit)
- ✅ Explains results in plain language
- ❌ Never invents numbers (enforced by schema validation and traceability)

## Sustainability Angle

AirPlan recommends low-emission alternatives:

- Metro/bus over car (commute swap with exposure comparison)
- Optimal ventilation windows (reducing purifier energy use)
- Activity timing (reducing need for masks and air filtration)
- Cooking habit awareness (ventilation during/after cooking)

## Differentiation

- **Transparent math:** Every number has a "Show the math" button revealing the exact formula and inputs
- **Honest uncertainty:** ±25% bands on all estimates, clearly labeled
- **No black box:** The calc layer is 100% unit-tested with hand-calculated examples
- **Offline-capable:** DEMO_MODE runs the full app from fixtures, no API keys needed
