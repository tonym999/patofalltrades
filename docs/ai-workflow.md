# AI-Powered GitHub Workflow — Operational Detail

The canonical rules live in [`AGENTS.md`](../AGENTS.md). This document covers supporting detail, CI specifics, review integration, and troubleshooting.

## MCP Step Sequence

Get Project Items → Get Issue Details → Return to Main → Update Main from Origin → Create Branch → Sync Deps → Implement → Test → Commit → Push → Open Linked PR → Verify Issue in In Review (or move it manually if automation is unavailable) → Triage Review → Fix → Resolve Threads → Merge → Verify Issue in Done (or move it manually if automation is unavailable)

## Branch Base Hygiene

Before starting a new ticket, especially after the previous PR was merged, switch back to `main`, update it from `origin`, and create the next feature branch from that refreshed base. Do not branch from the previous feature branch or from a stale local `main`.

Typical sequence:

```bash
git checkout main
git pull --ff-only origin main
git checkout -b feature/[ticket-id]-[kebab-description]
```

When creating new work items or PRs, use the GitHub issue and PR templates in `.github/` so CodeRabbit receives consistent ticket context for validation.

## Project Board Status Flow

The GitHub project board is issue-focused in normal operation. Keep the issue on the board as the single tracking item for the work and link the PR back to that issue instead of creating a separate PR card.

Use status changes like this:

- `Todo`: scoped work item exists but implementation has not started yet
- `In Progress`: active implementation is underway on a branch
- `In Review`: a linked PR is open and the issue is waiting on review, follow-up fixes, or merge
- `Done`: the linked work has landed, or the issue is otherwise fully completed

The GitHub Project built-in workflows should handle the normal transitions automatically:

- `Pull request linked to issue`: move the issue to `In Review`
- `Pull request merged`: move the issue to `Done`

If either workflow is disabled or unavailable, make those status updates manually. Only add PRs to the board if there is a deliberate exception to the repo's default issue-only tracking practice.

## Issue Label Taxonomy

Use labels intentionally so open issues can be filtered, prioritized, and triaged without rereading every ticket.

### Label Rules

- Every open issue should have labels before implementation starts.
- Work items should usually have one primary type label, 1-3 area labels, and one priority label.
- The work-item issue template may prefill `enhancement`; keep it only when it still matches the ticket.
- When touching older open issues, normalize legacy labels instead of stacking synonyms.

### Canonical Labels

| Group | Guidance | Canonical labels |
|---|---|---|
| Type | Use one when it adds signal about the nature of the work. | `enhancement`, `bug`, `chore`, `question` |
| Area | Add 1-3 labels describing the product area, discipline, or workflow affected. | `frontend`, `cms`, `content`, `build`, `testing`, `tooling`, `developer-experience`, `automation`, `deployment`, `security`, `documentation`, `ux`, `ui`, `ui-polish`, `design-system`, `visual`, `branding`, `mobile`, `a11y`, `seo`, `analytics`, `quality`, `schema`, `data-fetching`, `preview`, `compliance`, `performance` |
| Priority | Use exactly one on planned work items. | `priority: high`, `priority: medium`, `priority: low` |

### Legacy Label Normalization

- Prefer `enhancement` over `feat` for issue labels. `feat` remains valid for commit messages, but not as the preferred issue label.
- Prefer `performance` over `perf` for issue labels. `perf` remains valid for commit messages, but not as the preferred issue label.
- If a ticket is documentation-heavy, `documentation` can stand alone or pair with area labels such as `developer-experience` or `automation`.
- If a ticket spans multiple concerns, favor the few labels that best improve board filtering over exhaustive tagging.

## Environment Bootstrap

Use the repo-root [`.nvmrc`](../.nvmrc) to select the project's Node version in fresh shells before running project commands. In this repository, `pnpm` is pinned in [`web/package.json`](../web/package.json) and is typically provided by Corepack through the active `nvm` Node installation rather than a standalone binary in `~/.local/share/pnpm`.

For Codex sessions, [`.codex/environments/environment.toml`](../.codex/environments/environment.toml) should:

- point temp/cache directories at writable Linux paths
- source `nvm`
- run `nvm use` from the repo root
- avoid hard-coding an unrelated pnpm path

If those settings change, fully restart Codex and validate the fresh session before continuing work. A minimal verification looks like:

```bash
command -v node
node -v
cd web
command -v pnpm
pnpm -v
```

If `pnpm` prompts Corepack to download a version unexpectedly, confirm the active Node version from [`.nvmrc`](../.nvmrc), whether the environment runner actually applied the repo bootstrap, and whether the machine has already prepared the package-manager version pinned in [`web/package.json`](../web/package.json) at least once.

## Testing — CI Specifics

- Run locally: `pnpm run test:e2e:smoke` (from `web/`)
- Run the cross-device accessibility baseline locally when accessibility-critical UI changes: `pnpm run test:e2e:a11y` (from `web/`)
- CI: cache Playwright browsers and run `pnpm exec playwright install --with-deps && pnpm run test:e2e:smoke && pnpm run test:e2e:a11y`
- Optionally capture navigation timing metrics for performance monitoring when meaningful.

## CodeRabbit Review Integration

The triage workflow is defined in [AGENTS.md — Code Review Handling](../AGENTS.md#code-review-handling). This section covers operational detail.

### Marker Conventions

CodeRabbit uses emoji markers to classify feedback (not machine-parsed, but useful for triage):

| Priority | Markers | Action |
|---|---|---|
| Change request | `🔧 Actionable:`, `⚠️ Issue:`, `🐛 Bug:`, `🚨 Critical:` | Must address |
| Nitpick | `💭 Nitpick:`, `📝 Style:` | Address if reasonable |
| Informational | `💡 Suggestion:`, `✨ Enhancement:` | Optional |

### Fetching Review Threads

Use the GitHub API to get all review data:

```bash
# All reviews (includes CodeRabbit's summary review)
gh api --paginate repos/tonym999/patofalltrades/pulls/{PR_NUMBER}/reviews

# All inline comments (file-level feedback)
gh api --paginate repos/tonym999/patofalltrades/pulls/{PR_NUMBER}/comments

# Issue-style comments (top-level summary)
gh api --paginate repos/tonym999/patofalltrades/issues/{PR_NUMBER}/comments

# Thread resolution metadata
gh api graphql -f query='query { repository(owner: "tonym999", name: "patofalltrades") { pullRequest(number: {PR_NUMBER}) { reviewThreads(first: 100) { nodes { id isResolved path line comments(first: 20) { nodes { id databaseId body author { login } createdAt url } } } } } } }'
```

The GraphQL example above is intentionally bounded to the first 100 review threads and the first 20 comments per thread. For unusually large PRs, use cursor pagination or GitHub MCP to avoid missing additional threads or replies.

### Processing Flow

1. Collect all comments from the three REST endpoints above and fetch `reviewThreads` via GraphQL for thread resolution metadata. The example query shown here is a bounded fetch, not full cursor pagination.
2. Keep only those authored by `coderabbitai[bot]`.
3. Group inline review comments from `/pulls/{PR}/comments` by `in_reply_to_id`; top-level review summaries from `/pulls/{PR}/reviews` and issue comments from `/issues/{PR}/comments` should be handled separately because they do not use `in_reply_to_id`.
4. Use GraphQL `reviewThreads.isResolved` to distinguish unresolved and resolved inline threads; resolved threads can be skipped unless the user asks.
5. Within each unresolved thread, use the latest comment as the primary summary and keep earlier comments for context.
6. Classify each thread by its markers. If no marker is present, infer from tone: direct instructions are change requests; questions or "consider" phrasing are informational.
7. Present the remaining items to the user grouped by priority, with file path and line number where applicable.

### After Fixing

- Push fix commits referencing the review (e.g., `fix(scope): address CodeRabbit feedback`).
- Resolve addressed threads on GitHub, or prompt the user to do so.
- Do not resolve threads that haven't been addressed — leave them for the next pass.

## Troubleshooting

- Ensure GitHub authentication is configured (`gh auth status`).
- If Playwright browsers are missing: `pnpm exec playwright install` (add `--with-deps` on Linux/CI).
- Retry transient network steps before escalating.

## Security & Secrets

- Store GITHUB_TOKEN via GitHub CLI (`gh auth login`) or repo/org secrets; never commit tokens.
- Minimum scopes: `repo`, `workflow`. For PR automation from forks, use a fine-grained PAT or `GITHUB_TOKEN` with `permissions` set in the workflow.
- Add a `.env.example` documenting required env vars if the project needs them.

## Onboarding

- Read [`AGENTS.md`](../AGENTS.md) first for workflow and rules.
- Start each new ticket from a freshly updated `main`, not from the last feature branch.
- Check `.cursorrules` for Cursor-specific behaviour.
- Check `.cursor/skills/` for domain-specific AI guidance (UI, accessibility, design review).
- Review `.cursor/rules/frontend-standards.mdc` for frontend coding standards.
