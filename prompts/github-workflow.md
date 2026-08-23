# GitHub Workflow Agent Prompt Template

## Agent Instructions

You are a development automation agent driving a ticket from the project board to a review-ready PR.
All GitHub access goes through the [`gh` CLI](https://cli.github.com/) — this repo configures no MCP
servers. Run `gh auth status` before starting; if it reports no credential, stop and ask rather than
guessing at an alternative auth path.

[`AGENTS.md`](../AGENTS.md) is authoritative for workflow, commit, and testing rules. This template
holds the command-level detail only. In particular, follow the AI Agent Access Policy: reads are
free, but every remote write below — creating issues, branches, PRs, comments, labels, or project
item changes — needs explicit user approval first.

Repo constants used throughout: owner `tonym999`, repo `patofalltrades`, project `2`, base branch
`main`, app directory `web/`.

## Primary Workflow

### 1. Project and Ticket Management

```bash
gh project item-list 2 --owner tonym999 --limit 200 --format json
```

- `--limit` is required. The default returns only 30 items and the board holds more than that, so an
  In Progress ticket past position 30 is silently invisible without it.
- Pick the top item whose status is In Progress. Column naming varies ("In-Progress", "In Progress") — match flexibly.
- If none exists, ask the user for a new ticket idea instead of inventing one.
- Fetch the full ticket, including acceptance criteria and linked PRs:

```bash
gh issue view <ISSUE_NUMBER> --repo tonym999/patofalltrades --json number,title,body,labels,state,projectItems
```

- New issues must be created from the templates in `.github/` and added to the project board:

```bash
# Interactive: opens the rendered Work Item form in a browser
gh issue create --repo tonym999/patofalltrades --web

# Non-interactive: write the body yourself, matching the form's sections exactly
gh issue create --repo tonym999/patofalltrades --title "<title>" --body-file <path> \
  --label "<type>" --label "<area>" --label "priority: <level>"

gh project item-add 2 --owner tonym999 --url <ISSUE_URL>
```

`--template` does not work here. `work-item.yml` is a YAML issue *form*, and GitHub's
`issueTemplates` API exposes only markdown templates — it returns an empty list for this repo, so
`gh` cannot resolve the form by name or filename. When using `--body-file`, read
[`.github/ISSUE_TEMPLATE/work-item.yml`](../.github/ISSUE_TEMPLATE/work-item.yml) first and reproduce
its sections — Problem, Expected Solution, Affected Components, Acceptance Criteria, Non-Goals,
Implementation Notes — in that order, then apply one type label, one to three area labels, and
exactly one priority label.

### 2. Branch Creation

```bash
git checkout main && git pull --ff-only origin main
git checkout -b feature/<ticket-id>-<brief-description>
cd web && pnpm install
```

- Always branch from a freshly updated `main`, never from the previous feature branch.
- If `pnpm` is missing or Corepack prompts unexpectedly, use [`.claude/skills/repo-bootstrap/SKILL.md`](../.claude/skills/repo-bootstrap/SKILL.md).

### 3. Code Implementation

- Implement only the scope the ticket calls for.
- Follow existing patterns in `web/`, and [`docs/frontend-standards.md`](../docs/frontend-standards.md) for UI code.
- For component work, read [`.claude/skills/frontend-ui/SKILL.md`](../.claude/skills/frontend-ui/SKILL.md) first.

### 4. Playwright Test Creation

Structure and conventions live in [`.claude/skills/playwright/SKILL.md`](../.claude/skills/playwright/SKILL.md) and
[`prompts/test-creation.md`](./test-creation.md). At minimum:

```text
web/tests/e2e/
├── smoke/       [feature-name].smoke.spec.ts   # required, tagged @smoke
├── functional/  [feature-name].spec.ts         # when behaviour is worth isolating
└── fixtures/    [test-data].json               # shared setup
```

Include an accessibility check on at least one critical path. Prefer `@axe-core/playwright` or
DOM-level assertions: [`docs/ai-workflow.md`](../docs/ai-workflow.md#troubleshooting) records that
`page.accessibility.snapshot()` can hard-crash headless Chromium in sandboxed Linux agent sessions,
so reach for it only after confirming it is stable in the current environment. Use
[`.claude/skills/accessibility-audit/SKILL.md`](../.claude/skills/accessibility-audit/SKILL.md) when
the change touches forms, dialogs, or navigation.

### 5. Code Quality Checks

From `web/`:

```bash
pnpm run lint
pnpm run test:e2e:smoke
pnpm run test:e2e:a11y
```

Run the smallest relevant set first, then broaden if the risk justifies it.

### 6. Commit and Push

Use [Conventional Commits](https://www.conventionalcommits.org/) per AGENTS.md, with `Closes #N` when
the work completes the ticket:

```bash
git commit -m "feat(auth): implement user login

- Added login form component
- Added session management

Closes #<ISSUE_NUMBER>"

git push -u origin feature/<ticket-id>-<brief-description>
gh pr create --repo tonym999/patofalltrades --base main --title "<conventional commit title>" \
  --body-file <path>
```

Do not use `--fill`. It builds the body from commit messages and silently skips the required
structure in [`.github/pull_request_template.md`](../.github/pull_request_template.md). Read that
template and match its sections — Summary, Linked Issue, Validation Against Issue, Changes, Testing,
Risks, Screenshots / Evidence, Checklist. `--web` is the interactive alternative.

Board automation moves the linked issue to In Review once the PR is linked, and to Done on merge. Do
not add PRs to the board by default. Verify both halves rather than assuming either — that the PR
links to the issue, and that automation actually moved the issue's board status:

```bash
# 1. the PR closes the issue
gh pr view <PR_NUMBER> --repo tonym999/patofalltrades --json number,title,url,state,closingIssuesReferences

# 2. automation moved the issue to In Review
gh issue view <ISSUE_NUMBER> --repo tonym999/patofalltrades --json number,projectItems \
  -q '.projectItems[] | "\(.title): \(.status.name)"'
```

Both are read-only. If the status did not move, report the mismatch and ask before changing it —
editing a project field value is a remote write that requires explicit approval under
[`AGENTS.md`](../AGENTS.md#ai-agent-access-policy). Do not silently correct it.

## Required `gh` Operations

1. **List project items** — `gh project item-list 2 --owner tonym999 --limit 200 --format json`
2. **Read issue** — `gh issue view <N> --json ...`
3. **Create issue (approval required)** — `gh issue create --web`, or `--body-file` matching the form
4. **Add to project (approval required)** — `gh project item-add 2 --owner tonym999 --url <URL>`
5. **Branch, implement, commit, test** — local git and `pnpm`, no approval needed
6. **Push branch (approval required)** — `git push -u origin <branch>`
7. **Open PR (approval required)** — `gh pr create --base main --body-file <path>`
8. **Verify board status** — `gh issue view <N> --json projectItems`; report a mismatch, do not silently fix it
9. **Check CI** — `gh pr checks <N>` / `gh run list --branch <branch>`
10. **Triage review feedback** — see below
11. **Resolve threads (approval required)** — GraphQL `resolveReviewThread`

## Output Requirements

```markdown
## Workflow Summary

### Ticket
- Issue: #[N] — [title]
- Board status: [current column]

### Branch
- Branch: [name] (base: main)
- Commits: [n]

### Implementation
- Files added/modified: [list]
- Diffstat: [+X/-Y]

### Tests
- Smoke: [count, pass/fail]
- Functional: [count, pass/fail]
- Accessibility: [covered path, result]

### Next Steps
- [ ] PR opened and linked to the issue
- [ ] CI green
- [ ] CodeRabbit review triaged
- [ ] Issue confirmed In Review via `projectItems`, not assumed
```

## Error Handling

Per AGENTS.md: retry a failing automation or network step up to twice with exponential backoff, then
surface the blocker with context rather than continuing silently. Note that `gh auth status` can
report an invalid credential even while `gh api` calls succeed — confirm with an actual API call
before concluding it is an auth failure. Document repo-specific surprises in
[`docs/ai-workflow.md`](../docs/ai-workflow.md).

## Configuration

- Auth: `gh auth status`. Prefer a fine-grained token scoped to this repo over a broad classic PAT. Never echo a token into logs, files, or artifacts.
- Project board: <https://github.com/users/tonym999/projects/2>
- Base branch: `main`
- Playwright config: `web/playwright.config.ts`

## Additional Considerations

- **Branch protection**: `main` is governed by a *ruleset*, not classic branch protection. Query
  `gh api repos/tonym999/patofalltrades/rules/branches/main` for the rules that apply, or
  `gh api repos/tonym999/patofalltrades/rulesets` for the rulesets themselves. The classic
  `/branches/main/protection` endpoint returns 404 "Branch not protected" here, which reads as
  unprotected when it is not.
- **CI/CD**: confirm the push triggered the expected workflows
- **Docs**: update `docs/ai-workflow.md` when workflow expectations change
- **Dependencies**: avoid new dependencies unless clearly justified
- **Env vars**: add any new ones to `.env.example`

## Example Usage

```text
Agent, please:
1. Get the current in-progress ticket from the project board
2. Create a feature branch from an updated main
3. Implement the required changes
4. Add Playwright smoke coverage
5. Run lint and the smoke suite
6. Commit, then ask me before pushing and opening the PR
7. After CodeRabbit reviews, triage the feedback and apply the fixes
8. Push the fixes and ask before resolving the threads
9. Summarise the completed work including review fixes
```

## CodeRabbit Integration

[`.claude/skills/coderabbit-triage/SKILL.md`](../.claude/skills/coderabbit-triage/SKILL.md) is the source of truth for
the fetch, classification, and resolution flow. The essentials:

```bash
gh api --paginate repos/tonym999/patofalltrades/pulls/<PR>/reviews
gh api --paginate repos/tonym999/patofalltrades/pulls/<PR>/comments
gh api --paginate repos/tonym999/patofalltrades/issues/<PR>/comments
```

Resolution state is only exposed via GraphQL, never the REST endpoints:

```bash
gh api graphql -f query='
  query($owner:String!, $repo:String!, $pr:Int!) {
    repository(owner:$owner, name:$repo) {
      pullRequest(number:$pr) {
        reviewThreads(first: 100) {
          nodes { id isResolved path line
            comments(first: 20) { nodes { databaseId body author { login } url } } }
        }
      }
    }
  }' -f owner=tonym999 -f repo=patofalltrades -F pr=<PR>
```

- Filter to comments authored by `coderabbitai[bot]`.
- Address change requests first, then reasonable nitpicks; informational comments are optional.
- Commit fixes as `fix(review): address CodeRabbit feedback`, push, then resolve **only** the threads actually addressed:

```bash
gh api graphql -f query='
  mutation($threadId:ID!) {
    resolveReviewThread(input:{threadId:$threadId}) { thread { id isResolved } }
  }' -f threadId=<THREAD_ID>
```

---

*This repo configures no MCP servers. If an agent session presents MCP-specific GitHub credentials, treat them as stale — see the audit table in [`docs/ai-workflow.md`](../docs/ai-workflow.md).*
