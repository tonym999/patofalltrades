# Commit Standards (Conventional Commits)

## Format
Spec: https://www.conventionalcommits.org/en/v1.0.0/
```text
<type>(<scope>): <subject>
```
Notes:
- Use lowercase <type>.
- Do not end <subject> with a period.

## Types
- feat: new feature
- fix: bug fix
- docs: documentation changes
- test: adding or refactoring tests
- chore: tooling or maintenance
- refactor: code change that neither fixes a bug nor adds a feature
- perf: performance improvements
- style: formatting-only changes (no code behavior)
- build: build system or dependency changes
- ci: CI configuration and scripts
- revert: revert a previous commit

Notes:
- Scope is optional. Examples:
  - <type>: <subject>
  - <type>(<scope>): <subject>
- Use imperative mood; keep subject ≤ 72 chars.
- Breaking changes: append ! after type/scope (e.g., feat!: ...) and add a footer:
  BREAKING CHANGE: <description>

## Examples
- feat(profile): implement user profile page
- test(auth): add smoke test for login
- docs(workflow): document AI automation process
- feat!: remove deprecated auth flow

```text
feat(auth)!: remove password grant

This removes the legacy password grant and updates client flows.

BREAKING CHANGE: Login API no longer accepts password grant.
Closes #123
```
