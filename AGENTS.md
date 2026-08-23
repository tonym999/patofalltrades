# AGENTS.md

Repository-level instructions for any AI coding agent working in `patofalltrades`.
Repo-defined skills live in [`.claude/skills/`](.claude/skills/); any tool-specific configuration beyond that is local to the machine and not tracked here.
Supporting workflow detail lives in [`docs/ai-workflow.md`](docs/ai-workflow.md).

## Project Context

- Repo: `tonym999/patofalltrades`
- Stack: Next.js 16, React 19, Tailwind CSS v4, Playwright, TypeScript
- App directory: [`web/`](web/)
- Package manager: `pnpm` (run from `web/`)
- Node version: root [`.nvmrc`](.nvmrc)
- Hosting: Vercel (auto-deploys on merge to `main`)
- Project board: [GitHub Projects v2](https://github.com/users/tonym999/projects/2) (`tonym999`, project `2`)
- AI skills: [`.claude/skills/`](.claude/skills/) — repo-bootstrap, frontend-ui, accessibility-audit, design-review, playwright, coderabbit-triage
- Frontend standards: [`docs/frontend-standards.md`](docs/frontend-standards.md)

## Skills

Repo-defined skills live in [`.claude/skills/`](.claude/skills/) and apply to every agent working in
this repo, not to one specific tool. Each is a plain `SKILL.md` — read the relevant one directly
before doing that kind of work. [`.claude/skills/README.md`](.claude/skills/README.md) indexes them
with a when-to-use column.

- **Claude Code** auto-discovers them from that path, so they load without being asked for.
- **Codex and any other AGENTS.md-aware agent** reach them through this section — the files are ordinary markdown and carry no Claude-specific content.
- The directory name reflects Claude Code's discovery convention only. Do not treat a skill as Claude-only, and do not duplicate its guidance into another tool's config.
- When adding a skill, follow the checklist in [`.claude/skills/README.md`](.claude/skills/README.md).

## AI Agent Access Policy

This policy applies to all AI agents, coding assistants, automations, integrations, and MCP/app connectors operating in or against this repository. `AGENTS.md` is the canonical policy location. Supporting workflow detail and the current audit snapshot live in [`docs/ai-workflow.md`](docs/ai-workflow.md).

### Default Model

- `auto-read`: agents may inspect repository contents, local git state, issue and pull request metadata, project items, CI status, workflow definitions, labels, and other read-only GitHub state without extra approval
- `ask-before-write`: agents must obtain explicit user approval before any remote, persistent, administrative, or destructive write

### Action Classes

- Local draft work allowed without extra approval:
  - read files and history
  - search the repo and linked docs
  - create local branches
  - edit files in the working tree
  - stage local changes
  - run non-destructive local builds, tests, and validation
  - draft commit messages, issues, PR text, or review replies without publishing them
- Normal remote writes require explicit approval:
  - create, edit, close, or reopen issues
  - add, edit, remove, or reprioritize project items and project field values
  - add, edit, or remove labels, milestones, assignees, comments, or other repository metadata
  - create remote branches, push commits or tags, or open, update, or merge pull requests
  - resolve review threads or publish review replies
  - publish local changes that modify `.github/workflows/`
- Administrative or destructive actions always require explicit approval:
  - change repository settings, rulesets, branch protection, secrets, environments, Actions settings, webhooks, or app installations
  - rotate or replace credentials or tokens
  - delete branches, tags, releases, project items, issues, or comments
  - rewrite history, force-push, or run destructive local commands

### Enforcement Expectations

- Prefer technically enforced controls where available. If a tool cannot be constrained technically, treat the control as trust-based and document that plainly.
- If a task needs broader access than the current session enforces, pause, explain why, and obtain approval before continuing.
- Least privilege is the default for tokens, apps, and automations. Credentials should be scoped only to the repository surfaces the agent actually needs.

## Workflow

1. Select the active ticket from the project board (In Progress column). If none exists, create or confirm a new issue first.
2. Before starting the next ticket after a merge, switch back to `main` and update it from `origin` so the next branch includes the latest merged docs, templates, and code.
3. Create a fresh branch from that updated `main`: `feature/[ticket-id]-[kebab-description]`
4. Run `pnpm install` in `web/` after branching.
5. Implement only the scope needed for the ticket.
6. Run smoke tests: `pnpm run test:e2e:smoke` (from `web/`).
7. Commit with a conventional commit message. Include `Closes #N` when the work completes a ticket.
8. Push the branch and create a PR scoped to the ticket. Link the PR to the issue.
9. Keep the issue as the project board item of record. The board automation moves linked issues from `In Progress` to `In Review` when a PR is linked, then to `Done` when that PR is merged. Do not add PRs to the board by default.
10. After code review (CodeRabbit), triage feedback and address it. Use [`.claude/skills/coderabbit-triage/SKILL.md`](.claude/skills/coderabbit-triage/SKILL.md).

When creating issues or PRs, use the GitHub templates under `.github/` so linked tickets contain the structured context CodeRabbit uses for PR validation.

## Definition of Done

A ticket is done when all of the following hold:

- Branch created from an updated `main` following the naming pattern
- Implementation complete and lint-clean
- Playwright smoke test present for the change
- Commit(s) use conventional commits
- Branch pushed and PR created, linked to the issue
- Issue sits in the correct project board column

## Issue Labels

- When creating or grooming an open issue, apply labels before work starts.
- Follow the canonical label taxonomy in [`docs/ai-workflow.md`](docs/ai-workflow.md#issue-label-taxonomy).
- For planned work items, use one primary type label, 1-3 area labels, and exactly one priority label.
- Normalize legacy labels to the documented canonical labels instead of keeping both.

## Environment Bootstrap

- Use `nvm` with the repo-root [`.nvmrc`](.nvmrc) before running project commands in a fresh shell.
- `pnpm` is pinned in [`web/package.json`](web/package.json) and is expected to be launched via Corepack from the active Node installation.
- Do not assume `pnpm` lives in `~/.local/share/pnpm`; in this repo it may resolve from the active `nvm` Node toolchain instead.
- Run package-manager commands from [`web/`](web/) so Corepack sees the version pinned by the `packageManager` field in [`web/package.json`](web/package.json).
- A fresh machine or cache may still require Corepack to prepare that pinned version once before offline agent sessions can use it.
- After changing [`.codex/environments/environment.toml`](.codex/environments/environment.toml), restart Codex and verify a fresh session resolves `node` and `pnpm` before treating the fix as complete.
- For repo-specific setup, verification, or troubleshooting steps in fresh shells and agent sessions, use [`.claude/skills/repo-bootstrap/SKILL.md`](.claude/skills/repo-bootstrap/SKILL.md).

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
- For repo-specific Playwright setup, command choices, and artifact conventions, read `.claude/skills/playwright/SKILL.md` instead of duplicating that guidance elsewhere.

## Implementation Rules

- Follow [`docs/frontend-standards.md`](docs/frontend-standards.md) for UI code under `web/app/`, `web/components/`, and `web/hooks/`.
- Prefer focused changes over broad cleanup.
- Preserve the existing Next.js App Router and Playwright structure unless the ticket requires otherwise.
- Keep code production-ready and lint-clean.
- Avoid adding dependencies unless clearly justified.

## Git Rules

- Branch naming: `feature/[ticket-id]-[description]` (lowercase kebab-case)
- After a PR is merged, return to `main`, update it from `origin`, and branch fresh for the next ticket.
- Do not create a new ticket branch from an older feature branch or a stale local `main`.
- Keep PRs scoped to a single ticket when possible.
- Do not commit secrets or environment-specific credentials.
- Avoid destructive git operations (`push --force`, `reset --hard`) unless explicitly requested.

## Code Review Handling

PRs are reviewed by CodeRabbit. Use [`.claude/skills/coderabbit-triage/SKILL.md`](.claude/skills/coderabbit-triage/SKILL.md) for the repo's exact fetch, classification, and resolution flow.

Keep these guardrails in mind:

1. Fetch all CodeRabbit review surfaces before deciding what is unresolved.
2. Use GraphQL `reviewThreads` resolution metadata, not REST review comments alone, to tell resolved from unresolved inline feedback.
3. Address change requests first, then nitpicks if reasonable; informational comments are optional.
4. Resolve only the threads that were actually addressed.

## Error Handling

- If automation or network steps fail, retry up to 2 times with exponential backoff.
- If still failing, surface the blocker with context rather than silently continuing.
- When a failure reveals a repo-specific surprise, environment quirk, or misleading tool behaviour, document it in [`docs/ai-workflow.md`](docs/ai-workflow.md) before considering the work complete so future agents do not rediscover it the hard way.

## Documentation

- Update `docs/ai-workflow.md` when workflow or operational expectations change.
- Reconcile new instructions with this file rather than duplicating across multiple config files.
- Treat unexpected-but-important findings as documentation work, not tribal knowledge. Add a short note covering what happened, how to detect it quickly, and the preferred workaround.
