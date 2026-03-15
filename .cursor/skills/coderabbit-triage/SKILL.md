---
name: coderabbit-triage
description: Triage CodeRabbit review feedback for this repo by fetching summary reviews, inline comments, issue comments, and GraphQL review-thread resolution metadata; classify unresolved feedback; and resolve only the threads that were actually addressed.
---

# CodeRabbit Triage

## When to use
- A PR in this repo has received CodeRabbit feedback
- You need to collect all CodeRabbit comments before making follow-up fixes
- You need to distinguish unresolved versus resolved inline threads
- You need a repo-specific checklist for which threads to resolve after pushing fixes

## Goal
Use the same repeatable flow every time:
1. Fetch all CodeRabbit review surfaces for the PR.
2. Separate unresolved inline threads from already resolved ones.
3. Classify unresolved feedback into change requests, nitpicks, and informational items.
4. Address required items first.
5. Resolve only the threads that were actually addressed.

## Required data sources
Collect data from all four sources because no single endpoint contains the whole picture.

### 1. Review summaries
Use this to capture CodeRabbit's review-level summary entries:

```bash
gh api --paginate repos/tonym999/patofalltrades/pulls/{PR_NUMBER}/reviews
```

### 2. Inline review comments
Use this to capture file and line-specific feedback:

```bash
gh api --paginate repos/tonym999/patofalltrades/pulls/{PR_NUMBER}/comments
```

### 3. Issue comments
Use this to capture top-level PR discussion comments that are not inline review comments:

```bash
gh api --paginate repos/tonym999/patofalltrades/issues/{PR_NUMBER}/comments
```

### 4. Review thread resolution metadata
Use GraphQL `reviewThreads` because the REST review-comment endpoints do not expose `isResolved`:

```bash
gh api graphql -f query='query {
  repository(owner: "tonym999", name: "patofalltrades") {
    pullRequest(number: {PR_NUMBER}) {
      reviewThreads(first: 100) {
        nodes {
          id
          isResolved
          path
          line
          comments(first: 20) {
            nodes {
              id
              databaseId
              body
              author { login }
              createdAt
              url
            }
          }
        }
      }
    }
  }
}'
```

The example above is intentionally bounded. For unusually large PRs, use cursor pagination or GitHub MCP so additional threads or replies are not missed.

## Triage flow

### 1. Filter to CodeRabbit-authored feedback
- Keep entries where the author login is `coderabbitai[bot]`.
- Apply that filter across review summaries, inline comments, issue comments, and GraphQL thread comments.

### 2. Group inline comments into threads
- Group `/pulls/{PR}/comments` results by `in_reply_to_id`.
- Treat top-level review summaries from `/pulls/{PR}/reviews` separately because they are not threaded through `in_reply_to_id`.
- Treat `/issues/{PR}/comments` separately for the same reason.

### 3. Split unresolved and resolved inline threads
- Match inline comment threads against GraphQL `reviewThreads`.
- Use `reviewThreads.isResolved` as the source of truth for resolution state.
- Skip resolved inline threads unless the user explicitly asks for a full audit.

### 4. Summarize each unresolved thread using the latest comment
- Use the latest comment in the thread as the short summary.
- Keep earlier comments available for context, especially if the latest message is a reply or clarification.
- Include file path and line number when the thread is inline.

### 5. Classify unresolved feedback
Use CodeRabbit's markers when present:

| Class | Markers | Default handling |
|---|---|---|
| Change request | `🔧 Actionable:`, `⚠️ Issue:`, `🐛 Bug:`, `🚨 Critical:` | Must address |
| Nitpick | `💭 Nitpick:`, `📝 Style:` | Address if reasonable |
| Informational | `💡 Suggestion:`, `✨ Enhancement:` | Optional |

If no marker is present, infer from tone:
- direct defect or correctness language -> change request
- minor naming/style wording -> nitpick
- "consider", "could", or future-looking suggestions -> informational

### 6. Present findings in priority order
Share results grouped like this:
1. Change requests
2. Nitpicks
3. Informational items

For each item, include:
- short summary from the latest comment
- file path and line number when applicable
- thread URL or enough identifying detail to relocate it quickly

## After fixes
- Push the follow-up commit(s), for example `fix(scope): address CodeRabbit feedback`.
- Resolve only the threads that were actually addressed in code or by an intentional documented decision.
- Leave unresolved threads open if the feedback is still pending, partially addressed, or intentionally deferred.
- Do not mass-resolve all CodeRabbit threads just because a new commit was pushed.

## Practical notes
- Review summaries and issue comments do not carry `isResolved`; use them as triage input, not as thread-resolution state.
- GraphQL thread metadata is the authoritative way to distinguish unresolved from resolved inline feedback in this repo.
- If a PR is unusually large, prefer paginated GraphQL or GitHub MCP over assuming the `first: 100` and `first: 20` bounds are sufficient.

## Related repo docs
- `AGENTS.md`
- `docs/ai-workflow.md`
