# patofalltrades
 Next.js website for "Pat Of All Trades" handyman service in London

## GitHub SSH setup (WSL-friendly)

We include `scripts/setup_github_ssh_ci.sh` to streamline SSH setup for pushing to GitHub from WSL. It:
- Creates an SSH key if missing and configures host aliases (`github` and `github-443`).
- Optionally logs in `gh` (GitHub CLI) via browser and adds your public key to your account.
- Switches the repo remote to SSH and falls back to port 443 if port 22 is blocked.
- Optionally pushes your current branch.

It is safe to keep this script in the repo: all potentially sensitive actions are opt-in via flags or environment variables.

### Quickstart

Run from the repo root. This installs dependencies if needed and pushes the current branch at the end:
```bash
INSTALL_DEPS=1 PUSH=1 bash scripts/setup_github_ssh_ci.sh
```

If you want the script to set your global git identity (only if missing):
```bash
bash scripts/setup_github_ssh_ci.sh --set-git-identity --name "Your Name" --email you@example.com
```

### Useful flags
- `--key PATH` (or `SSH_KEY_PATH`): path to your SSH private key (default `~/.ssh/id_ed25519`).
- `--install-deps` (`INSTALL_DEPS=1`): install `gh` and `jq` if missing.
- `--gh-login` / `--no-gh-login` (`GH_LOGIN=1|0`): control GitHub CLI login (default on).
- `--add-key` / `--no-add-key` (`ADD_KEY_VIA_GH=1|0`): add the public key to your GitHub account (default on).
- `--push` / `--no-push` (`PUSH=1|0`): push the current branch after setup (default off).
- `--force-443` (`FORCE_SSH_443=1`): force SSH over port 443 host alias immediately.
- `--name` / `--email` (`USER_NAME_DEFAULT` / `EMAIL_DEFAULT`): values used when `--set-git-identity` is provided.

### Examples
- First-time setup (no push)
```bash
bash scripts/setup_github_ssh_ci.sh --install-deps --gh-login --add-key
```
- Force SSH over 443 (corporate networks) and push
```bash
bash scripts/setup_github_ssh_ci.sh --force-443 --push
```

### Troubleshooting
- Permission denied (publickey):
  - Ensure the key is loaded: `ssh-add -l`; if not, `ssh-add ~/.ssh/id_ed25519`.
  - Add the public key to GitHub: copy `~/.ssh/id_ed25519.pub` into `https://github.com/settings/keys`.
- Port 22 blocked:
  - Re-run with `--force-443` or rely on automatic fallback.
- Windows browser login from WSL:
  - Keep `--gh-login` enabled (default); the script will use the device code flow and open your Windows browser.

For full options:
```bash
bash scripts/setup_github_ssh_ci.sh --help
```

## End-to-end testing

The E2E suite lives under `web/` and uses Playwright. Local installs skip Playwright's postinstall hook, so browser binaries are not downloaded automatically. When you want to run smoke or full tests locally:

```bash
cd web
pnpm run setup:e2e
```

The script runs `pnpm install` followed by `pnpm run playwright:install` to ensure Playwright downloads the required browsers. Afterwards you can run:

- `pnpm run test:e2e:smoke` for the fast smoke pack (the same suite GitHub Actions runs in the `Smoke Tests` workflow).
- `pnpm run test:e2e` for the full regression suite.
