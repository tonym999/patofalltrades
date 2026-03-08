# AGENTS.md

## Purpose

This file is the repository-local entrypoint for coding agents working in `patofalltrades`.
Use it for the high-signal rules that should be easy to discover at the repo root.
Use [`docs/ai-workflow.md`](docs/ai-workflow.md) for supporting workflow detail.

## Project Context

- Repo: `tonym999/patofalltrades`
- Base branch: `main`
- Main app: [`web/`](web/)
- Package manager: `pnpm` in [`web/`](web/)
- Project board: GitHub Projects v2, `tonym999` project `2`

## Canonical Workflow

1. Select the active ticket from the project board. If none exists, create or confirm a new issue first.
2. Create a branch from `main` named `feature/[ticket-id]-[kebab-description]`.
3. Implement only the scope needed for the ticket.
4. Run relevant verification before finishing.
5. Commit with a conventional commit message and include an issue-closing footer when appropriate.
6. Push the branch and prepare a PR.

## Implementation Rules

- Prefer focused changes over broad cleanup.
- Preserve the existing Next.js and Playwright structure unless the ticket requires otherwise.
- Reconcile new agent-facing instructions with `.cursorrules` and [`docs/ai-workflow.md`](docs/ai-workflow.md) instead of duplicating large blocks of text.
- Update documentation when the workflow or operational expectations change.

## Testing Rules

- Keep at least one smoke test covering each shipped feature area under [`web/tests/e2e/smoke/`](web/tests/e2e/smoke/).
- Add functional tests under [`web/tests/e2e/functional/`](web/tests/e2e/functional/) when a change introduces detailed behavior worth isolating.
- Include a basic accessibility check in at least one critical-path Playwright test when feasible.
- For web changes, run the smallest relevant test set first, then broaden if risk justifies it.

## Git And GitHub Rules

- Branch naming: `feature/[ticket-id]-[description]`
- Commit format: conventional commits such as `feat(scope): description`
- Keep PRs scoped to a single ticket when possible.
- Ensure the issue and PR are associated with the project board.

## Safety

- Do not commit secrets or environment-specific credentials.
- Avoid destructive git operations unless explicitly requested.
- If automation or network steps fail, retry a small number of times and then surface the blocker with context.
