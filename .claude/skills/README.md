# Repo Skills

Tool-neutral, repo-defined guidance for AI coding agents working in `patofalltrades`.
Each skill is a `SKILL.md` with `name` and `description` frontmatter followed by plain markdown, so
any agent can read one directly — no tool-specific loader required. The `.claude/` path is where
Claude Code auto-discovers them; the content is not Claude-specific and applies to every agent.

| Skill | Read it when |
|---|---|
| [`repo-bootstrap`](repo-bootstrap/SKILL.md) | Starting in a fresh shell or agent session, or `pnpm` / Corepack / Node resolution misbehaves |
| [`frontend-ui`](frontend-ui/SKILL.md) | Building or refactoring UI components and pages |
| [`accessibility-audit`](accessibility-audit/SKILL.md) | Reviewing or testing semantics, keyboard support, focus, and screen-reader behaviour |
| [`design-review`](design-review/SKILL.md) | Reviewing visual hierarchy, spacing, consistency, and polish |
| [`playwright`](playwright/SKILL.md) | Running or debugging E2E tests, or capturing screenshots, traces, and other artifacts |
| [`coderabbit-triage`](coderabbit-triage/SKILL.md) | Processing CodeRabbit feedback on a PR and resolving the threads actually addressed |

## How agents pick these up

- **Claude Code**: loads every subdirectory here as a native skill automatically.
- **Codex and other AGENTS.md-aware agents**: [`AGENTS.md`](../../AGENTS.md) points here in its Skills section; read the relevant `SKILL.md` before doing that kind of work.
- **Any other tool**: these are ordinary markdown files — read them from this path.

## Adding a skill

1. Create `.claude/skills/<name>/SKILL.md` with `name` and `description` frontmatter. Keep the description specific about *when* to use the skill — that text is what an agent matches against.
2. Add a row to the table above and to the skills list in [`AGENTS.md`](../../AGENTS.md).

Note: skills must be real directories here. A symlink into another directory is **not** discovered
by Claude Code — verified on 2026-08-23 — so keep the files themselves at this path rather than
aliasing them from elsewhere.
