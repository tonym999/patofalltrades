# GitHub AI Workflow Template

## Overview
End-to-end automation of ticket execution using Cursor AI + GitHub MCP.

## Inputs
- Project board: https://github.com/users/tonym999/projects/2/views/1?layout=board
- Base branch: main
- Branch pattern: feature/[ticket-id]-[description]
- Commit format: conventional commits

## Steps
1. Fetch in-progress ticket
   - Use GitHub MCP to query the project board and select one in-progress item.
   - Extract ticket id and concise description.
2. Create feature branch
   - Branch name: `feature/[ticket-id]-[kebab-description]` from `main`.
3. Implement changes
   - Apply minimal, targeted edits to meet acceptance criteria.
   - Keep changes cohesive and well-structured.
4. Generate tests
   - Create at least one Playwright smoke test under `tests/smoke/`.
   - Add functional tests under `tests/functional/` as needed.
5. Commit and push
   - Use conventional commits, e.g., `feat(scope): short description`.
   - Push to origin and open a pull request (if instructed).

## Error Handling
- Retry transient failures up to 2 times with backoff.
- Log context and continue to next step when safe.

## Output Artifacts
- New branch pushed to origin
- Updated code and tests
- Documentation updates (if necessary)
