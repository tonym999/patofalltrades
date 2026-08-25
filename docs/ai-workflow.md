# AI-Powered GitHub Workflow — Operational Detail

The canonical rules live in [`AGENTS.md`](../AGENTS.md). This document covers supporting detail, CI specifics, review integration, and troubleshooting.

## Workflow Step Sequence

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

For reusable step-by-step setup and troubleshooting guidance, use [`.claude/skills/repo-bootstrap/SKILL.md`](../.claude/skills/repo-bootstrap/SKILL.md). Keep that skill aligned with the repo instructions here and in [`AGENTS.md`](../AGENTS.md).

Codex has two separate environment mechanisms:

- [`.codex/environments/environment.toml`](../.codex/environments/environment.toml) is a versioned, tracked worktree-creation script. Its Linux setup should use `CODEX_WORKTREE_PATH`, point setup-time temp/cache directories at writable Linux paths, source `nvm`, activate the version from `.nvmrc`, and run `pnpm install` from `web/`.
- The user-level `~/.codex/config.toml` `[shell_environment_policy.set]` table supplies persistent variables to later Codex commands. This machine-local file should set `TMPDIR`, `TMP`, `TEMP`, `XDG_CACHE_HOME`, and `COREPACK_HOME` to writable Linux paths and must not be committed.

An agent must obtain explicit user approval before making this persistent machine-local edit and must limit the change to the five keys below. If `[shell_environment_policy.set]` already exists, merge these entries into that table and preserve every other value; do not add a duplicate table header. If it does not exist, add the complete block:

```toml
[shell_environment_policy.set]
TMPDIR = "/tmp"
TMP = "/tmp"
TEMP = "/tmp"
XDG_CACHE_HOME = "/tmp/codex-cache"
COREPACK_HOME = "/tmp/corepack"
```

Exports in the worktree setup script do not persist into subsequent commands. After changing the user-level shell policy, fully restart Codex and validate a fresh task. After changing the tracked worktree setup, ask the user to create, or explicitly approve creating, a fresh Codex task/worktree to exercise it. A minimal fresh-task verification looks like:

```bash
printf '%s\n' "$TMPDIR" "$TMP" "$TEMP" "$XDG_CACHE_HOME" "$COREPACK_HOME"
command -v node
node -v
cd web
command -v pnpm
pnpm -v
```

If `pnpm` prompts Corepack to download a version unexpectedly, confirm the active Node version from [`.nvmrc`](../.nvmrc), the persistent shell-policy values, and whether the machine has already prepared the package-manager version pinned in [`web/package.json`](../web/package.json) at least once.

### Codex Desktop v1 environment migration

Codex Desktop 26.818.5229.0 exposed a schema and lifecycle mismatch in the previous tracked configuration. The legacy `[env]` table and `[setup].linux` string were replaced or ignored, and an empty autogenerated v1 stub could appear instead. The current v1 file requires top-level `version` and `name` values, a `[setup]` table with `script`, and platform tables such as `[setup.linux]` with their own `script`.

Detect this regression quickly by checking for an unexpected autogenerated stub or by running `pnpm -v` in a fresh task. A Corepack error targeting `/mnt/c/Users/.../AppData/Local/node/corepack/v1` indicates that Windows temp paths reached the Linux shell. Restore the tracked v1 worktree setup, configure persistent temp/Corepack paths in the user-level shell policy, restart Codex, and verify both a fresh task and a newly created worktree. If Codex overwrites a valid v1 file again, track that as a desktop tooling regression rather than accepting the stub.

## AI Agent Access Policy Support

The canonical AI agent access policy lives in [`AGENTS.md`](../AGENTS.md). Use this document for supporting implementation detail, audit notes, and troubleshooting.

### Enforcement Split

- Technically enforced controls in the current setup include the local filesystem sandbox used by Codex sessions, approval prompts for outside-sandbox command execution, repository rulesets, and the default read-only workflow permissions on GitHub Actions.
- Trust-based or process-based controls include whether an agent actually follows `AGENTS.md`, whether it loads repo skills at the right time, and whether user-managed credentials or connectors are used only after explicit approval.
- When a control is trust-based rather than enforced, say so directly in docs and prefer a narrower credential or a stronger approval gate instead of implying the repo already enforces it.

### Current Audit Snapshot

Re-verified on 2026-08-23. The Codex workspace, GitHub CLI, Actions, and ruleset rows were
re-checked against the live repository on that date and were unchanged from the first audit on
2026-03-29. The GitHub connector and CodeRabbit rows were **not** re-verified — their permission
maps need the GitHub UI, which repo-local tooling cannot read. Treat those two rows as carrying
the 2026-03-29 date.

| Integration / path | Identity or credential | Observed access | Approval gate | Control type | Alignment | Notes |
|---|---|---|---|---|---|---|
| Codex local workspace | Codex desktop session with workspace-write sandbox | Read repository contents, edit local files, create local branches, and run local validation inside the checkout | Outside-sandbox commands require explicit user approval; local draft work does not | Technical | Aligned | Matches the `auto-read` plus local-draft model. |
| GitHub CLI | Personal GitHub identity `tonym999`, authenticated with a `gho_` OAuth app token issued by the `gh` CLI | Repo permission is `admin`; `X-Oauth-Scopes` reports `admin:public_key`, `gist`, `project`, `read:org`, `repo` — unchanged since 2026-03-29 | Mixed: some network escapes are technically approval-gated, but the credential itself is not repo-enforced | Mixed technical/process | Partially aligned | More access than least privilege. `gh auth status` reported healthy on 2026-08-23, but it can report invalid credentials even while `gh api` works — confirm with a real API call before concluding auth failed. |
| GitHub connector / app path in Codex | GitHub app installation on user account `tonym999` | Issue, PR, repository, check, and status workflows are available through the connector | Process-based: agents must follow repo policy before using write-capable connector actions | Trust-based | Partially aligned | The installation is present, but the exact permission map is not fully visible from repo-local tooling. |
| Claude Code local agent | User-managed local toolchain via `CLAUDE.md` -> `AGENTS.md` | Local repo access and whatever remote access the user's configured credentials allow | Depends on local tool prompts and user-managed credentials | Mostly trust-based | Partially aligned | Repo skills in `.claude/skills/` are auto-discovered, so skill discovery is no longer documentation-only. Credential scope is still user-managed. |
| GitHub Actions `GITHUB_TOKEN` | Workflow-scoped token issued by GitHub | Actions are enabled; default workflow permission is `read`; pull request review approval is disabled for this token; an active ruleset protects `main` (all re-verified 2026-08-23) | Governed by workflow permissions and repository settings | Technical | Aligned | Safer default than a broad personal token; jobs must opt into more when justified. |
| CodeRabbit | GitHub App used for review comments and status checks | Active on repo PR workflows and expected by repo process | Governed by app installation and repo settings | Technical + process | Partially aligned | Review surfaces are active, but a deeper app-permission inventory would need GitHub UI confirmation. |
| Cursor local agent | Formerly a user-managed local toolchain with `.cursorrules`, `.cursor/rules/`, `.cursor/skills/`, and `.cursor/mcp.json` | None. Cursor is no longer used for this repo and all of its configuration was deleted on 2026-08-23 | Not applicable | Removed | Removed | The skills moved to `.claude/skills/` and the frontend rules to `docs/frontend-standards.md`; both are tool-neutral and stay in use. The two Docker-hosted MCP servers it configured went with it. Re-adding Cursor would mean re-auditing this row. |
| GitHub MCP environment path | Session-provided MCP-oriented credential path | The GitHub MCP server was not running when this audit checked it, and the exposed MCP token path did not behave like a normal GitHub API token when tested directly | Opaque | Unknown | Removed | The repo no longer configures any MCP server. The Docker-hosted GitHub and Playwright MCP servers were removed with the Cursor config; agent GitHub access now goes through the `gh` CLI path audited above. |

### Gaps And Follow-Ups

- The observed GitHub CLI credential path is broader than least privilege for routine agent work. Prefer a fine-grained token scoped to this repo, and separate read-mostly automation from human-admin access where possible.
- If workflow-file changes are rare, do not grant workflow-edit capability to always-on agent credentials by default. Use a narrower token for day-to-day repo work and a separately approved path when `.github/workflows/` changes must be published.
- The GitHub connector path is only partially auditable from inside the repo. If it will remain part of the workflow, record its installed permission set in the relevant tool config or in a future audit ticket.
- The MCP path was resolved by removal: the repo no longer ships MCP configuration, so no MCP-specific credential is expected in an agent session. If one appears, stop using it, report it to the user, and request explicit approval before rotating it — rotation is an administrative action under the policy in [`AGENTS.md`](../AGENTS.md#ai-agent-access-policy). Any future MCP server must be added with its permission set documented in this table before use.

## Testing — CI Specifics

- Repo-specific Playwright workflow guidance lives in [`.claude/skills/playwright/SKILL.md`](../.claude/skills/playwright/SKILL.md). Keep this document focused on policy, CI, and troubleshooting.
- Run locally: `pnpm run test:e2e:smoke` (from `web/`)
- Run the cross-device accessibility baseline locally when accessibility-critical UI changes: `pnpm run test:e2e:a11y` (from `web/`)
- CI: cache Playwright browsers and run `pnpm exec playwright install --with-deps && pnpm run test:e2e:smoke && pnpm run test:e2e:a11y`
- Optionally capture navigation timing metrics for performance monitoring when meaningful.

## CodeRabbit Review Integration

Use [`.claude/skills/coderabbit-triage/SKILL.md`](../.claude/skills/coderabbit-triage/SKILL.md) for the repo-defined CodeRabbit workflow. That skill is the source of truth for:

- the required REST and GraphQL fetch steps
- how to separate resolved versus unresolved inline threads
- how to classify unresolved feedback into change requests, nitpicks, and informational items
- the rule that only addressed threads should be resolved

## Troubleshooting

- Ensure GitHub authentication is configured (`gh auth status`).
- If Playwright browsers are missing: `pnpm exec playwright install` (add `--with-deps` on Linux/CI).
- In sandboxed Linux agent sessions, `page.accessibility.snapshot()` can hard-crash headless Chromium even when normal Playwright and Axe scans succeed. Prefer Axe-based assertions or DOM-level checks for CI-stable accessibility coverage unless you have confirmed the snapshot call is safe in the current environment.
- Production builds should not require live Google Fonts access. The app vendors its Inter subset at [`web/public/fonts/inter-latin-variable.woff2`](../web/public/fonts/inter-latin-variable.woff2); if `pnpm build` fails with `next/font/google`, `fonts.googleapis.com`, or `fonts.gstatic.com`, treat that as a regression and switch the font loading back to local assets before continuing.
- Retry transient network steps before escalating.

### GitHub CLI in sandboxed sessions

Some Codex or agent sessions can reach GitHub inconsistently depending on sandbox/network restrictions. A confusing but observed failure mode is:

- `gh auth status` reports invalid or stale credentials
- read-only commands such as `gh api user` or `gh project view 2 --owner tonym999` still succeed
- write or mutating commands such as `gh issue create` fail with `error connecting to api.github.com`

In practice, this can mean the blocker is sandboxed network access rather than expired GitHub auth.

Use this quick check sequence before assuming credentials are broken:

```bash
gh auth status
gh api user
gh project view 2 --owner tonym999
```

Interpret the results like this:

- If `gh api user` and `gh project view` succeed, GitHub CLI access is at least partially working even if `gh auth status` looks unhealthy.
- If a mutating command fails with `error connecting to api.github.com`, treat it as a likely sandbox/network restriction first.
- Retry up to 2 times with exponential backoff as required by repo policy before escalating.
- If you need to audit the live credential rather than just test connectivity, inspect the headers from `gh api -i user` and read `X-Oauth-Scopes` instead of inferring scopes from `gh auth status`. That header is not a complete audit: it is populated only for classic PATs and OAuth app tokens, which is what the `gh` CLI issues today. A fine-grained PAT returns no scopes header at all — audit its repository access and granular permissions instead — and a GitHub App credential needs its installation permissions checked separately. Since the follow-up below recommends moving to a fine-grained token, expect this check to stop applying once that happens.

Preferred handling for agents:

1. Try the `gh` command in the sandbox first.
2. If it fails with a likely network/sandbox error, retry up to 2 times.
3. If it still fails, rerun the required command outside the sandbox with explicit approval rather than assuming the user must re-authenticate.

There is no guaranteed sandbox-safe way to always access `gh` for every operation. Reads may work while writes fail, and behavior can vary by session. Treat sandbox access as opportunistic, verify with a real `gh api` call, and escalate when the task depends on GitHub network access.

## Security & Secrets

- Never commit tokens or copy live secrets into docs, comments, or issues.
- Prefer fine-grained tokens scoped to this repository and only to the actions the agent is expected to perform.
- If a classic PAT must be used, record its scopes in the audit and keep them no broader than necessary. Workflow-file publishing may require additional scope; do not grant that to always-on agent credentials unless the task needs it.
- Store GitHub credentials via GitHub CLI, OS keychain, or repo/org secrets rather than ad hoc environment files.
- Add a `.env.example` documenting required env vars if the project needs them.

## Onboarding

- Read [`AGENTS.md`](../AGENTS.md) first for workflow and rules.
- Start each new ticket from a freshly updated `main`, not from the last feature branch.
- Use [`.claude/skills/repo-bootstrap/SKILL.md`](../.claude/skills/repo-bootstrap/SKILL.md) when validating a fresh shell, a Codex environment change, or any `pnpm` / Corepack bootstrap issue.
- Check [`.claude/skills/`](../.claude/skills/) for domain-specific AI guidance (UI, accessibility, design review, Playwright workflow, CodeRabbit triage).
- Review [`docs/frontend-standards.md`](frontend-standards.md) for frontend coding standards.
