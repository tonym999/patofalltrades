---
name: repo-bootstrap
description: Bootstrap this repository in a fresh shell or agent session, including loading Node from `.nvmrc`, using Corepack for the pinned `pnpm` version, running package-manager commands from `web/`, validating the environment, and troubleshooting missing pnpm or bootstrap drift.
---

# Repo Bootstrap

## When to use
- Starting work in a fresh local shell or Codex session
- `pnpm` is missing, unexpected, or prompting for Corepack setup
- A task depends on `web/` commands and you need to confirm the right working directory
- `.codex/environments/environment.toml`, `.nvmrc`, or `web/package.json` changed and you want to verify the bootstrap still works

## Source of truth
- Node version: repo-root `.nvmrc`
- Package manager and version: `web/package.json`
- Session bootstrap for Codex: `.codex/environments/environment.toml`

## Standard bootstrap flow
1. From the repo root, load `nvm` and activate the Node version from `.nvmrc`.
2. Change into `web/` before running package-manager commands so Corepack sees the pinned `pnpm` version from `web/package.json`.
3. Run `pnpm install` from `web/`.
4. Run the smallest relevant command for the ticket from `web/` after install.

Example:

```bash
source "$HOME/.nvm/nvm.sh"
nvm use
cd web
pnpm install
```

## Verification checklist
- `command -v node` resolves
- `node -v` matches the version from `.nvmrc`
- `cd web && command -v pnpm` resolves
- `cd web && pnpm -v` runs without falling back to an unexpected global install
- `cd web && pnpm install` completes without version or engine surprises

## Troubleshooting

### `pnpm` is missing
- Confirm `nvm use` ran successfully from the repo root instead of another directory.
- Do not assume `pnpm` lives in `~/.local/share/pnpm`; this repo expects it to come from Corepack through the active Node installation.
- Re-run from `web/`, because Corepack reads the pinned package manager version from `web/package.json`.

### Corepack prompts for a download unexpectedly
- Check that the active Node version still matches `.nvmrc`.
- Confirm you are running `pnpm` from `web/`, not the repo root.
- On a fresh machine or cache, let Corepack prepare the pinned version once, then retry the command.
- If this started after bootstrap-related changes, re-check `.codex/environments/environment.toml` for missing `nvm` setup or temp/cache paths.

### Fresh-session bootstrap drift
- If `.codex/environments/environment.toml` changed, restart Codex before judging the fix.
- After restart, re-run the verification checklist in a fresh session instead of relying on an older shell.
- If `node` resolves but `pnpm` behavior changed, compare `.nvmrc`, `web/package.json`, and `.codex/environments/environment.toml` together before changing docs or scripts.

## Practical guardrails
- Run package-manager, build, lint, and Playwright commands from `web/`.
- Keep bootstrap documentation aligned across `AGENTS.md` and `docs/ai-workflow.md`; update those when the repo bootstrap changes.
- Prefer documenting repo-specific surprises in `docs/ai-workflow.md` so future agents can detect them quickly.

## Related files
- `.nvmrc`
- `web/package.json`
- `.codex/environments/environment.toml`
- `AGENTS.md`
- `docs/ai-workflow.md`
