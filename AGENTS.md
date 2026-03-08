# AGENTS.md

Repository-level instructions for any AI coding agent working in `patofalltrades`.
Tool-specific configuration lives in `.cursorrules` (Cursor) or equivalent.
Supporting workflow detail lives in [`docs/ai-workflow.md`](docs/ai-workflow.md).

## Project Context

- Repo: `tonym999/patofalltrades`
- Stack: Next.js 16, React 19, Tailwind CSS v4, Playwright, TypeScript
- App directory: [`web/`](web/)
- Package manager: `pnpm` (run from `web/`)
- Hosting: Vercel (auto-deploys on merge to `main`)
- Project board: [GitHub Projects v2](https://github.com/users/tonym999/projects/2) (`tonym999`, project `2`)
- AI skills: `.cursor/skills/` — frontend-ui, accessibility-audit, design-review

## Workflow

1. Select the active ticket from the project board (In Progress column). If none exists, create or confirm a new issue first.
2. Create a branch from `main`: `feature/[ticket-id]-[kebab-description]`
3. Run `pnpm install` in `web/` after branching.
4. Implement only the scope needed for the ticket.
5. Run smoke tests: `pnpm run test:e2e:smoke` (from `web/`).
6. Commit with a conventional commit message. Include `Closes #N` when the work completes a ticket.
7. Push the branch and create a PR scoped to the ticket.
8. Ensure the issue and PR are on the project board in the correct column.
9. After code review (CodeRabbit), triage feedback and address it. See [Code Review Handling](#code-review-handling).

When creating issues or PRs, use the GitHub templates under `.github/` so linked tickets contain the structured context CodeRabbit uses for PR validation.

## Commit Standards

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat(scope): description` — new feature
- `fix(scope): description` — bug fix
- `chore(scope): description` — maintenance
- `test(scope): description` — test additions/changes
- `docs(scope): description` — documentation
- `refactor(scope): description` — restructuring without behaviour change
- `perf(scope): description` — performance improvement
- `build(scope): description` — build system or dependency changes
- `ci(scope): description` — CI/CD changes

## Testing

- At least one smoke test per feature under `web/tests/e2e/smoke/`.
- Functional tests under `web/tests/e2e/functional/` when a change introduces detailed behaviour worth isolating.
- Include a basic accessibility check (axe-core or `page.accessibility.snapshot()`) in at least one critical-path test.
- Use shared fixtures under `web/tests/e2e/fixtures/` when setup is common across tests.
- Run the smallest relevant test set first, then broaden if risk justifies it.

## Implementation Rules

- Prefer focused changes over broad cleanup.
- Preserve the existing Next.js App Router and Playwright structure unless the ticket requires otherwise.
- Keep code production-ready and lint-clean.
- Avoid adding dependencies unless clearly justified.

## Git Rules

- Branch naming: `feature/[ticket-id]-[description]` (lowercase kebab-case)
- Keep PRs scoped to a single ticket when possible.
- Do not commit secrets or environment-specific credentials.
- Avoid destructive git operations (`push --force`, `reset --hard`) unless explicitly requested.

## Code Review Handling

PRs are reviewed by CodeRabbit. After a review is posted:

1. **Fetch** all review threads on the PR.
2. **Filter** to threads where any comment author is `coderabbitai` (or the CodeRabbit bot).
3. **Split** into unresolved and resolved threads.
4. **Classify** unresolved threads:
   - **Change requests** — direct issues, bugs, or required fixes (`🔧`, `⚠️`, `🐛`, `🚨`)
   - **Nitpicks** — minor style or naming suggestions (`💭`, `📝`)
   - **Informational** — suggestions or enhancements with no required action (`💡`, `✨`)
5. **Summarise** each thread using the latest comment, but keep the full thread available for context.
6. **Address** change requests first, then nitpicks if reasonable. Informational items are optional.
7. **Push** fixes and resolve threads. Do not resolve threads that haven't been addressed.

## Error Handling

- If automation or network steps fail, retry up to 2 times with exponential backoff.
- If still failing, surface the blocker with context rather than silently continuing.

## Documentation

- Update `docs/ai-workflow.md` when workflow or operational expectations change.
- Reconcile new instructions with this file rather than duplicating across multiple config files.
