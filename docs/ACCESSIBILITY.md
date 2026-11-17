# Accessibility (WCAG 2.2 AA)

> To be completed with measured results in Phase 9.

## Automated Checks
- `eslint-plugin-jsx-a11y` — lint-time (zero warnings required)
- `jest-axe` — component-level (zero violations required)
- `@axe-core/playwright` — page-level E2E (zero violations required)

## Implementation Checklist

### Structure
- [ ] Semantic HTML landmarks: `header`, `nav`, `main`, `footer`
- [ ] One `h1` per page, logical heading order
- [ ] Visible "Skip to content" link

### Forms
- [ ] All controls have programmatic labels
- [ ] Helper text via `aria-describedby`
- [ ] Errors announced with `role="alert"` and linked to field
- [ ] No placeholder-only labels

### Keyboard
- [ ] Logical tab order
- [ ] Visible focus ring (≥ 3:1 contrast)
- [ ] No keyboard traps
- [ ] "Show the math" expander: real `button` with `aria-expanded`
- [ ] Language toggle: real `button` with `aria-pressed`

### Color and Contrast
- [ ] AQI never conveyed by color alone: text + icon + pattern/label
- [ ] All text ≥ 4.5:1 contrast (3:1 for large text and UI components)
- [ ] Contrast verified over token palette

### Dynamic Content
- [ ] `aria-live="polite"` for plan ready, audit complete, errors
- [ ] Loading states have accessible text

### Language
- [ ] `<html lang>` set dynamically (`en` / `hi`)
- [ ] Mixed-language fragments marked with `lang`
- [ ] Font stack renders Devanagari properly
- [ ] No fixed-size containers that clip Hindi text

### Responsive
- [ ] Touch targets ≥ 44×44 px
- [ ] Layout works at 320 px width
- [ ] 200% zoom without horizontal scroll
- [ ] `prefers-reduced-motion` respected
- [ ] `prefers-color-scheme` respected

### Images
- [ ] Upload previews have alt text
- [ ] Findings described in text, not only via photo
- [ ] Charts have text summary + data table alternative

### Writing
- [ ] Short sentences, plain language
- [ ] No jargon without inline explanation

## Manual Checklist (not automated)
- [ ] Keyboard-only navigation test (all flows reachable)
- [ ] Screen reader test notes (NVDA/VoiceOver)
- [ ] High-contrast mode verification
