# AirPlan — Accessibility

## Approach

AirPlan follows WCAG 2.1 AA guidelines. Accessibility is built into every component, not bolted on after.

## Structural Accessibility

- **Skip-to-content link:** First focusable element in `layout.tsx`, visually hidden until focused
- **Semantic HTML:** `<header>`, `<nav>`, `<main>`, `<footer>` landmarks with ARIA roles
- **Heading hierarchy:** Every page has a single `<h1>`, sections use `<h2>`+, with `aria-labelledby`
- **Language attribute:** `<html lang="en">` updated dynamically when switching to Hindi

## Form Accessibility (`HouseholdForm.tsx`)

- Every input has a visible `<label>` linked via `htmlFor`/`id`
- Error messages use `role="alert"` for screen reader announcement
- Error text linked to inputs via `aria-describedby`
- Minimum touch target: 44×44px on all interactive elements
- Required fields marked with `aria-required`

## Color & Visual

- **Never color-only:** AQI badges use color + icon + text pattern (e.g., ✓ Good, ⚠ Moderate, ✕ Unhealthy)
- **Confidence bars** include numeric text values alongside visual bars
- **Dark mode** support via `prefers-color-scheme` and Tailwind dark: variants
- **Contrast:** Text colors meet 4.5:1 ratio (gray-900 on white, gray-100 on gray-950)

## Interactive Components

- **ImpactCard "Show the math":** Uses `aria-expanded` and `aria-controls` for the expandable section
- **LanguageToggle:** Uses `aria-pressed` for toggle state
- **MythBuster:** Uses native `<details>`/`<summary>` for expand/collapse (natively accessible)
- **Loading states:** `aria-busy="true"`, `role="status"`, visually hidden "Loading..." text

## Motion

- **`prefers-reduced-motion`:** Global CSS rule disables all animations and transitions when user prefers reduced motion
- Loading skeleton uses `motion-reduce:animate-none`

## Internationalization

- Full Hindi (Devanagari) support with `Noto Sans Devanagari` font
- `<html lang>` attribute updates on language toggle
- All UI strings available in both English and Hindi

## Testing

- **jest-axe:** Component-level accessibility testing (axe-core rules)
- **@axe-core/playwright:** Page-level accessibility testing in E2E
- **eslint-plugin-jsx-a11y:** Lint-time accessibility rule enforcement
- Zero violations target in `npm run verify`

## Keyboard Navigation

- All interactive elements focusable via Tab
- Skip-to-content link on first Tab press
- Focus ring visible on all focusable elements (Tailwind `focus:ring-2`)
- No keyboard traps
