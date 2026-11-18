# AirPlan — Architecture

## Overview

AirPlan is a Next.js App Router application that generates personalized air quality action plans for families during winter smog. The system is designed around a **deterministic calculation layer** — the LLM never invents numbers.

## Component Diagram

```mermaid
flowchart TD
    subgraph Client["Browser (React)"]
        Setup["Setup Page"]
        PlanView["Plan Page"]
        Audit["Audit Page"]
        Home["Home / Myths"]
    end

    subgraph API["API Routes (Next.js)"]
        GeoAPI["/api/geocode"]
        ForecastAPI["/api/forecast"]
        HouseholdAPI["/api/household"]
        PlanAPI["/api/plan"]
        AuditAPI["/api/audit"]
    end

    subgraph Core["Core Library"]
        Calc["calc/ — Pure Functions"]
        Schemas["schemas/ — Zod (single source of truth)"]
        Security["security/ — Validation, Rate Limit, Upload"]
        Data["data/ — Open-Meteo + TTL Cache"]
        Store["store/ — Repository + JSON impl"]
        LLM["llm/ — Plan Agent + Tools"]
        I18n["i18n/ — EN/HI Translations"]
    end

    subgraph External["External"]
        OpenMeteo["Open-Meteo API"]
        Anthropic["Anthropic API"]
    end

    Setup -->|POST| HouseholdAPI
    Setup -->|GET| GeoAPI
    PlanView -->|POST| PlanAPI
    Audit -->|POST| AuditAPI

    GeoAPI --> Data
    ForecastAPI --> Data
    HouseholdAPI --> Store
    PlanAPI --> LLM
    PlanAPI --> Store
    PlanAPI --> Data
    AuditAPI --> Security

    LLM -->|tool calls| Calc
    LLM --> Anthropic
    Data --> OpenMeteo
    Data -->|fallback| Fixtures["Fixtures"]

    Schemas -.->|validates| API
    Schemas -.->|types| Core
    Security -.->|guards| API
```

## Planning Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant P as Plan API
    participant S as Store
    participant D as Data (Open-Meteo)
    participant L as Plan Agent
    participant C as Calc Layer

    U->>P: POST /api/plan {householdId, language}
    P->>P: Rate limit check
    P->>P: Validate request (Zod)
    P->>S: Get household by ID
    S-->>P: Household data
    P->>D: Fetch forecast (lat, lng)
    D-->>P: Hourly PM2.5/AQI

    alt DEMO_MODE
        P->>L: generatePlan(household, forecast, lang)
        L->>C: calcIndoorConcentration()
        C-->>L: CalcResult {central, low, high, formula, inputs}
        L->>C: calcVentilationWindows()
        C-->>L: VentWindow[]
        L->>C: calcExposure()
        C-->>L: CalcResult
        L->>C: calcMaskEffect() per member
        C-->>L: CalcResult
        L->>C: calcCigaretteEquivalent()
        C-->>L: CalcResult
        L-->>P: Plan (schema-validated)
    else Live Mode
        P->>L: generatePlan with Anthropic tool use
        L->>L: Model calls tools → calc functions
        L-->>P: Plan (schema-validated)
    end

    P-->>U: Plan JSON
```

## Architecture Decision Records

### ADR-1: Deterministic Calc Layer vs LLM Numbers

**Decision:** All exposure, mask, indoor, and cigarette-equivalent calculations use pure, deterministic functions. The LLM only selects which actions to recommend and explains results in plain language.

**Rationale:** LLMs hallucinate numbers. For health-related exposure calculations, every number must be verifiable and reproducible. The calc layer is unit-tested with hand-calculated examples and property-based invariants (e.g., "better mask never increases exposure").

**Consequence:** The LLM uses tool calling to invoke calc functions. Every number on an impact card traces to a CalcResult with its formula and inputs.

### ADR-2: Direct Anthropic SDK vs Agent Framework

**Decision:** Use `@anthropic-ai/sdk` directly instead of LangChain, Vercel AI SDK, or similar.

**Rationale:** The planning flow is a single tool-use loop with at most 6 iterations. An agent framework adds bundle size, abstraction layers, and framework-specific bugs for a simple use case. Direct SDK usage gives full control over prompts, tool definitions, and error handling.

**Consequence:** Tool definitions are plain objects in `planTools.ts`. The agent loop in `planAgent.ts` is ~100 lines. In DEMO_MODE, the same function runs deterministically without any LLM call.

### ADR-3: JSON File Store Behind Repository Interface

**Decision:** Persist household data in a JSON file, accessed through a `HouseholdRepository` interface.

**Rationale:** No database setup required to run. The interface allows swapping to PostgreSQL or any other store without changing API routes. For a hackathon MVP, file-based storage is sufficient and simplifies the demo experience.

**Consequence:** `JsonHouseholdStore` reads/writes `data/households.json`. The `HouseholdRepository` interface in `repository.ts` defines `get`, `save`, `delete`, `list` methods that any implementation must provide.
