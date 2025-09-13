# Commit Standards (Conventional Commits)

## Format
```text
<type>(<scope>): <subject>
```

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
- Scope is optional: <type>[(<scope>)]: <subject>
- Use imperative mood; keep subject ≤ 72 chars.
- Breaking changes: append ! after type/scope (e.g., feat!: ...) and add a footer:
  BREAKING CHANGE: <description>

## Examples
- feat(profile): implement user profile page
- test(auth): add smoke test for login
- docs(workflow): document AI automation process
- feat!: remove deprecated auth flow

BREAKING CHANGE: Login API no longer accepts password grant.
