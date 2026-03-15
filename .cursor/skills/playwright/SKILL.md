---
name: playwright
description: Run or debug Playwright work in this repo, including choosing between repo E2E tests and ad hoc browser automation, bootstrapping Node and pnpm from `web/`, and storing artifacts using the repo's existing conventions.
---

# Playwright

## When to use
- Running or updating Playwright coverage under `web/tests/e2e/`
- Debugging a UI flow in a real browser before deciding whether a repo test is needed
- Reproducing a bug, collecting screenshots, or capturing traces for a ticket or PR
- Validating a UI change with the repo's smoke or accessibility suites

## Choose the right path
- Use repo tests when the behavior should be repeatable, CI-covered, or committed with the ticket.
- Use ad hoc browser automation when exploring a flow, reproducing a bug, or gathering one-off evidence.
- Default post-change validation in this repo is `pnpm run test:e2e:smoke` from `web/`.
- If the change is accessibility-critical, also run `pnpm run test:e2e:a11y`.
- Do not add new E2E coverage unless the ticket needs lasting regression protection.

## Repo layout
- Run package-manager and Playwright commands from `web/` so Corepack uses the pinned `pnpm` version.
- Playwright config lives at `web/playwright.config.ts`.
- Tests live under `web/tests/e2e/` with `smoke/`, `functional/`, `fixtures/`, and `utils/`.
- Local test runs use `pnpm run start:test` on port `3000` unless `BASE_URL` is set.

## Bootstrap
1. From the repo root, load Node with `source "$HOME/.nvm/nvm.sh" && nvm use`.
2. Change into `web/`.
3. Run `pnpm install`.
4. If Playwright browsers are missing, run `pnpm exec playwright install` locally or `pnpm exec playwright install --with-deps` on Linux/CI.

## Common commands
- Smoke suite: `pnpm run test:e2e:smoke`
- Full suite: `pnpm run test:e2e`
- Accessibility baseline: `pnpm run test:e2e:a11y`
- Single spec: `pnpm exec playwright test tests/e2e/smoke/logo.smoke.spec.ts`
- Filter by title or tag: `pnpm exec playwright test --grep "menu"`
- Interactive runner: `pnpm run test:e2e:ui`
- Reuse an existing server: `BASE_URL=http://127.0.0.1:3000 pnpm run test:e2e`

## Authoring and maintenance
- Put durable happy-path coverage in `web/tests/e2e/smoke/*.smoke.spec.ts` and keep the `@smoke` tag so the default smoke command picks it up.
- Put deeper behavior-specific coverage in `web/tests/e2e/functional/`.
- Reuse helpers from `web/tests/e2e/fixtures/` and `web/tests/e2e/utils/` before adding new setup code.
- Include a basic accessibility check in at least one critical-path test.
- In sandboxed Linux environments, prefer Axe or DOM-level assertions over `page.accessibility.snapshot()` unless you have already confirmed snapshot calls are stable here.

## Artifact conventions
- `@playwright/test` already keeps failure traces, videos, and screenshots under `web/test-results/` because `web/playwright.config.ts` uses `retain-on-failure` and `only-on-failure`.
- HTML reports live in `web/playwright-report/` and can be opened with `pnpm run test:e2e:report`.
- For ad hoc browser automation outside the test runner, place screenshots, traces, and notes under `web/test-results/manual/<ticket-or-date>/` so they stay untracked with the repo's existing ignore rules.
- Clean up one-off artifacts when the ticket is done unless they are still needed for review.

## Ad hoc browser automation
- If your agent environment exposes a Playwright CLI or browser automation wrapper, use it for manual exploration instead of writing a temporary repo test.
- Point ad hoc runs at the repo app you are actually changing: local dev server, `pnpm run start:test`, or an explicitly chosen preview URL.
- Once a manually reproduced bug becomes clearly repeatable and worth guarding, convert that knowledge into a repo test if the ticket calls for regression coverage.

## Related skills
- Pair this with `accessibility-audit` when the task centers on keyboard, focus, semantics, or Axe coverage.
- Pair this with `frontend-ui` when a Playwright failure is rooted in layout or interaction code that still needs implementation work.
