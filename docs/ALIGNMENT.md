# Problem Statement Alignment

## Theme Mapping

| Theme Phrase | Where It Is Delivered | Files | Demo Step |
|---|---|---|---|
| **helps families** | Household profiles with infant/elderly/asthma sensitivity; per-member recommendations | `src/lib/schemas/household.ts`, `src/components/HouseholdForm.tsx` | Create household with varied members |
| **and communities** | "Share plan" action producing plain-text summary a family can forward | `src/components/SharePlan.tsx` | Click "Share Plan" to copy text |
| **severe winter smog** | Hourly PM2.5 forecast, severe-day fixtures (250-350 µg/m³ morning), ventilation/outdoor logic | `src/lib/data/openmeteo.ts`, `src/fixtures/forecast.json` | View plan page with high-AQI forecast |
| **urban air pollution** | City-based geocoding, AQI bands, pollution data visualization | `src/lib/data/openmeteo.ts`, `src/components/AqiBadge.tsx` | Search for Gurugram, see AQI badge |
| **low-emission daily routines** | Commute swap recommendations with computed emission savings | `src/lib/calc/commuteSwap.ts`, impact cards | View "switch to metro" recommendation |
| **indoor air quality hacks** | Photo-based Indoor Audit, purifier placement and sealing advice, myth-buster | `src/app/api/audit/route.ts`, `src/content/myths.json` | Upload room photo, view findings |
| **sustainable alternatives** | Commute-mode and cooking alternatives with emission-aware impact | `src/lib/calc/commuteSwap.ts`, `src/lib/calc/indoor.ts` | See cooking method alternatives |
| **tailored to their location** | Geocoded forecast specific to household's city | `src/app/api/geocode/route.ts`, `src/lib/data/openmeteo.ts` | Search city, get local forecast |
| **and lifestyle** | Schedule-aware plan, household parameters (commute, cooking, purifier) | `src/lib/schemas/household.ts`, `src/lib/llm/planAgent.ts` | Household A vs B produce different plans |
| **clearly explaining the direct impact** | Impact cards with before/after exposure, formula with inputs, cigarette-equivalent, low/central/high range | `src/components/ImpactCard.tsx`, `src/lib/calc/exposure.ts` | Expand "Show the math" on any card |

## README and UI Alignment

The README opening paragraph and the app's home screen copy directly reference the problem statement:
- "Every evening, AirPlan turns tomorrow's smog forecast into a plan for one specific family"
- Impact of choices is shown numerically, not just described

## Features NOT Added (Intentionally Out of Scope)

Per the spec, these are excluded:
- Carpool matching
- Route optimization
- Kids' game / gamification
- Community reporting
- Authentication
- Payments
