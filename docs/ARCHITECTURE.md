# Architecture

> To be completed in Phase 1-2.

## Overview

AirPlan is an Urban Air Quality Assistant built with Next.js (App Router) + TypeScript.

## Architecture Diagram

```mermaid
flowchart TD
    subgraph Client
        UI["React UI (Setup / Plan / Audit)"]
    end

    subgraph "Next.js API Routes"
        GEO["/api/geocode"]
        FC["/api/forecast"]
        PL["/api/plan"]
        AU["/api/audit"]
        HH["/api/household"]
    end

    subgraph "Business Logic (src/lib)"
        CALC["calc/ — Pure Functions"]
        DATA["data/ — Open-Meteo Adapter + Cache"]
        LLM["llm/ — Anthropic Client + Plan Agent"]
        SEC["security/ — Validation, Rate Limit, Headers"]
        STORE["store/ — Household Repository"]
        I18N["i18n/ — English + Hindi"]
        SCH["schemas/ — Zod (Single Source of Truth)"]
    end

    subgraph External
        OM["Open-Meteo API"]
        AN["Anthropic API"]
    end

    UI --> GEO & FC & PL & AU & HH
    GEO --> DATA --> OM
    FC --> DATA
    PL --> LLM --> AN
    PL --> CALC
    AU --> LLM
    HH --> STORE
    LLM --> CALC
    SEC -.->|validates| GEO & FC & PL & AU & HH
    SCH -.->|types| UI & GEO & FC & PL & AU & HH
```

## Planning Sequence

```mermaid
sequenceDiagram
    participant U as User/UI
    participant API as /api/plan
    participant PA as planAgent
    participant LLM as Anthropic
    participant C as calc/*

    U->>API: POST { householdId, language }
    API->>PA: generatePlan(household, forecast, lang)
    PA->>LLM: messages + tools
    loop Tool-use loop (max 6)
        LLM->>PA: tool_use (calc_exposure, etc.)
        PA->>C: Pure function call
        C->>PA: { central, low, high, formula, inputs }
        PA->>LLM: tool_result
    end
    LLM->>PA: Final JSON (Plan schema)
    PA->>PA: Traceability validation
    PA->>API: Validated Plan
    API->>U: Plan JSON
```

## Architecture Decision Records

### ADR-1: Deterministic Calc Layer vs LLM Numbers

**Decision:** All numerical results come from a pure, unit-tested calculation layer. The LLM never invents numbers.

**Rationale:** LLMs hallucinate numerical values. For health-related exposure calculations, accuracy and reproducibility are critical. A deterministic layer enables unit testing, property-based testing, and traceability from every displayed number to a function call.

**Consequence:** The LLM must use tool calls to get any number. A traceability validator rejects plans with untraceable numbers.

### ADR-2: Direct Anthropic SDK vs Agent Framework

**Decision:** Use `@anthropic-ai/sdk` directly with tool-use, no agent framework.

**Rationale:** Minimal dependencies, full control over the tool-use loop, prompt caching, and token budgets. Frameworks add abstraction that makes debugging and cost control harder at hackathon speed.

### ADR-3: JSON File Store Behind Repository Interface

**Decision:** A `HouseholdRepository` interface with a JSON-file implementation, allowing future PostgreSQL swap.

**Rationale:** No database setup needed to run. The repository pattern isolates storage from business logic. The interface is documented so a PostgreSQL implementation can be added without changing any consumer.
