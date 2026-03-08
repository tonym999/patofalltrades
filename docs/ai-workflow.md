# AI-Powered GitHub Workflow — Operational Detail

The canonical rules live in [`AGENTS.md`](../AGENTS.md). This document covers supporting detail, CI specifics, review integration, and troubleshooting.

## MCP Step Sequence

Get Project Items → Get Issue Details → Create Branch → Sync Deps → Implement → Test → Commit → Push → Open PR → Triage Review → Fix → Resolve Threads

When creating new work items or PRs, use the GitHub issue and PR templates in `.github/` so CodeRabbit receives consistent ticket context for validation.

## Testing — CI Specifics

- Run locally: `pnpm run test:e2e:smoke` (from `web/`)
- CI: cache Playwright browsers and run `pnpm exec playwright install --with-deps && pnpm run test:e2e:smoke`
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
gh api repos/tonym999/patofalltrades/pulls/{PR}/reviews

# All inline comments (file-level feedback)
gh api repos/tonym999/patofalltrades/pulls/{PR}/comments

# Issue-style comments (top-level summary)
gh api repos/tonym999/patofalltrades/issues/{PR}/comments
```

### Processing Flow

1. Collect all comments from the three endpoints above.
2. Keep only those authored by `coderabbitai[bot]`.
3. Group by review thread (comments sharing `in_reply_to_id` belong to the same thread).
4. Check thread resolution status — resolved threads can be skipped unless the user asks.
5. Within each unresolved thread, use the **latest comment** as the primary summary (it often contains CodeRabbit's refined position after discussion). Keep earlier comments for context.
6. Classify each thread by its markers. If no marker is present, infer from tone: direct instructions are change requests; questions or "consider" phrasing are informational.
7. Present to the user grouped by priority, with file path and line number for each.

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
- Check `.cursorrules` for Cursor-specific behaviour.
- Check `.cursor/skills/` for domain-specific AI guidance (UI, accessibility, design review).
- Review `.cursor/rules/frontend-standards.mdc` for frontend coding standards.
