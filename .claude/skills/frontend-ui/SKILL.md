---
name: frontend-ui
description: Build or refactor frontend UI components with clean structure, responsive behaviour, design-system consistency, and polished implementation. Use when building new components, implementing pages, refactoring UI code, fixing layout or responsive issues, or aligning code with existing design tokens and patterns.
---

# Frontend UI

## When to use
- Building a new component or page section
- Refactoring UI code for clarity or consistency
- Fixing responsive layout issues
- Aligning implementation with the existing design system
- Converting rough UI into production-quality code

## Stack context
- Next.js 16 App Router — Server Components by default, `"use client"` only when needed
- React 19, Tailwind v4 (CSS-based config, no `tailwind.config.ts`)
- Theme tokens defined as CSS variables in `web/app/globals.css`
- Existing utility classes: `.glass-card`, `.cta-btn`, `.btn-secondary`, `.parallax-bg`
- Animation: framer-motion and gsap available
- Icons: lucide-react
- Path alias: `@/*` → `web/*`

## Workflow
1. Inspect nearby components in `web/components/` and reuse existing patterns
2. Check `globals.css` for available tokens, custom properties, and utility classes
3. Build the smallest sensible component structure
4. Separate concerns: layout, presentation, state, behaviour
5. Handle responsive behaviour across mobile, tablet, and desktop
6. Verify accessibility basics are covered

## Implementation standards
- Prefer semantic structure: `<section>`, `<nav>`, `<main>`, `<article>` over generic `<div>`
- Keep conditional rendering readable
- Keep prop names clear and unsurprising
- Extract subcomponents only when they improve clarity or reuse
- Do not add dependencies unless clearly justified
- Flatten or extract when JSX nesting exceeds 4-5 levels

## Design system alignment
- Use existing CSS variables over hard-coded values: `var(--primary)`, `var(--background)`, `var(--gold)`, etc.
- Use existing spacing rhythm — check nearby components for patterns
- Reuse existing component primitives before creating new ones
- Preserve visual consistency: border radii, shadows, interaction states should match existing components
- If introducing a new pattern, explain why existing ones are insufficient
- Allow one-off styling only when genuinely required

## Responsive layout
- Design mobile-first unless the surrounding code clearly does otherwise
- Let content define layout: prefer `flex-wrap`, `grid` with `auto-fit`/`auto-fill`
- Avoid hard-coded widths unless necessary
- Ensure controls are comfortably tappable on touch devices (minimum 44px target)
- Stack cards and form rows sensibly on narrow viewports
- Ensure text remains readable and important actions stay prominent on small screens
- Check for horizontal overflow

## Accessibility baseline
- Interactive elements must be keyboard reachable
- Buttons and links must be used correctly for their purpose
- Form fields must have associated labels
- Headings should follow a logical structure
- Focus states must not be removed
- Respect `prefers-reduced-motion` when adding animations

## Response format
1. Briefly describe the UI structure
2. Explain responsive decisions
3. Note accessibility considerations
4. Note any design-system alignment choices
5. Provide production-ready code
