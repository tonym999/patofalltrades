#!/usr/bin/env bash
# WSL-friendly GitHub SSH + gh setup + repo settings check
# Run from your repo root.
set -euo pipefail

# --- Defaults (override via env vars or flags) ---
USER_NAME_DEFAULT="${USER_NAME_DEFAULT:-}"
EMAIL_DEFAULT="${EMAIL_DEFAULT:-}"
KEY="${SSH_KEY_PATH:-${HOME}/.ssh/id_ed25519}"
SSH_CONFIG="${SSH_CONFIG:-${HOME}/.ssh/config}"
ADD_KEY_VIA_GH="${ADD_KEY_VIA_GH:-1}"      # 0 to skip auto-adding the SSH key to GitHub
GH_LOGIN="${GH_LOGIN:-1}"                  # 0 to skip gh auth login
INSTALL_DEPS="${INSTALL_DEPS:-0}"          # 1 to apt install gh/jq if missing
SET_GIT_IDENTITY="${SET_GIT_IDENTITY:-0}"  # 1 to set global git user.name/email if missing
PUSH="${PUSH:-0}"                          # 1 to push after setup
FORCE_SSH_443="${FORCE_SSH_443:-0}"        # 1 to force port 443 alias immediately
# -----------------------------------------------

log() { printf "\033[1;32m▶ %s\033[0m\n" "$*"; }
warn(){ printf "\033[1;33m! %s\033[0m\n" "$*"; }
err() { printf "\033[1;31m✗ %s\033[0m\n" "$*" >&2; }

usage() {
  cat <<EOF
Usage: scripts/setup_github_ssh_ci.sh [flags]

Flags (env var equivalents in parentheses):
  --name NAME                Set global git user.name if missing (USER_NAME_DEFAULT)
  --email EMAIL              Set global git user.email if missing (EMAIL_DEFAULT)
  --key PATH                 SSH private key path (SSH_KEY_PATH). Default: ~/.ssh/id_ed25519
  --install-deps | --no-install-deps  Install missing gh/jq via apt (INSTALL_DEPS=1|0). Default: 0
  --set-git-identity         Allow script to set global git identity if missing (SET_GIT_IDENTITY=1). Default: 0
  --gh-login | --no-gh-login Login gh via browser if needed (GH_LOGIN=1|0). Default: 1
  --add-key | --no-add-key   Add SSH key to GitHub via gh (ADD_KEY_VIA_GH=1|0). Default: 1
  --push | --no-push         Push current branch at end (PUSH=1|0). Default: 0
  --force-443                Force SSH over port 443 host alias immediately (FORCE_SSH_443=1). Default: 0
  --owner OWNER              Override repo owner (detected from remote otherwise)
  --repo REPO                Override repo name (detected from remote otherwise)
  -h, --help                 Show this help

Examples:
  # Typical first-time setup and push
  INSTALL_DEPS=1 PUSH=1 bash scripts/setup_github_ssh_ci.sh

  # Safer: set identity explicitly and skip push
  bash scripts/setup_github_ssh_ci.sh --set-git-identity --name "Your Name" --email you@example.com
EOF
}

require_repo_root() {
  git rev-parse --is-inside-work-tree >/dev/null 2>&1 || { err "Run this from your repo root."; exit 1; }
}

ensure_deps() {
  # Basic tools
  for bin in git ssh ssh-keygen curl; do
    command -v "$bin" >/dev/null || { err "Missing '$bin'. Install it (sudo apt install -y $bin) and re-run."; exit 1; }
  done

  local need_gh=0 need_jq=0
  command -v gh >/dev/null 2>&1 || need_gh=1
  command -v jq >/dev/null 2>&1 || need_jq=1

  if [[ "$need_gh" -eq 0 && "$need_jq" -eq 0 ]]; then
    return
  fi

  if [[ "$INSTALL_DEPS" -eq 1 ]]; then
    log "Installing missing dependencies (gh/jq)…"
    sudo apt update -y
    sudo apt install -y curl ca-certificates gnupg
    if [[ "$need_gh" -eq 1 ]]; then
      curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
        | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg 2>/dev/null
      sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg
      echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
        | sudo tee /etc/apt/sources.list.d/github-cli.list >/dev/null
    fi
    sudo apt update -y
    [[ "$need_gh" -eq 1 ]] && sudo apt install -y gh
    [[ "$need_jq" -eq 1 ]] && sudo apt install -y jq
  else
    if [[ "$need_gh" -eq 1 ]]; then warn "'gh' missing. Re-run with --install-deps or INSTALL_DEPS=1."; fi
    if [[ "$need_jq" -eq 1 ]]; then warn "'jq' missing. Re-run with --install-deps or INSTALL_DEPS=1."; fi
  fi
}

ensure_git_identity() {
  local name email
  name="$(git config --global user.name || true)"
  email="$(git config --global user.email || true)"

  if [[ -z "${name}" || -z "${email}" ]]; then
    if [[ "$SET_GIT_IDENTITY" -eq 1 ]]; then
      [[ -z "${name}" && -n "${USER_NAME_DEFAULT}" ]] && { git config --global user.name "${USER_NAME_DEFAULT}"; log "Set git user.name → ${USER_NAME_DEFAULT}"; }
      [[ -z "${email}" && -n "${EMAIL_DEFAULT}" ]] && { git config --global user.email "${EMAIL_DEFAULT}"; log "Set git user.email → ${EMAIL_DEFAULT}"; }
    else
      warn "Global git identity missing. Set with: git config --global user.name 'Your Name'; git config --global user.email you@example.com"
    fi
  fi
  git config --global init.defaultBranch main >/dev/null 2>&1 || true
}

ensure_ssh_dir() { mkdir -p ~/.ssh && chmod 700 ~/.ssh; }

ensure_key() {
  if [[ ! -f "${KEY}" ]]; then
    local email
    email="$(git config --global user.email || echo "${EMAIL_DEFAULT}")"
    log "Generating SSH key (${KEY}) with email ${email}"
    ssh-keygen -t ed25519 -C "${email}" -f "${KEY}" -N ""
  else
    log "SSH key exists: ${KEY}"
  fi
  chmod 600 "${KEY}"
  [[ -f "${KEY}.pub" ]] && chmod 644 "${KEY}.pub"
}

ensure_agent_and_add_key() {
  # Prefer probing agent directly; start if needed
  if ! ssh-add -l >/dev/null 2>&1; then
    eval "$(ssh-agent -s)" >/dev/null 2>&1 || true
  fi
  local key_fpr
  key_fpr="$(ssh-keygen -lf "${KEY}" | awk '{print $2}')"
  if ! ssh-add -l 2>/dev/null | grep -q "${key_fpr}"; then
    ssh-add "${KEY}" >/dev/null 2>&1 || true
  fi
}

ensure_config() {
  touch "${SSH_CONFIG}" && chmod 600 "${SSH_CONFIG}"
  if ! grep -qE '^Host (github|github\.com)([[:space:]]|$)' "${SSH_CONFIG}"; then
    cat >> "${SSH_CONFIG}" <<EOF

Host github.com github
  HostName github.com
  User git
  IdentityFile "${KEY}"
  AddKeysToAgent yes
  IdentitiesOnly yes

Host github-443
  HostName ssh.github.com
  User git
  Port 443
  IdentityFile "${KEY}"
  AddKeysToAgent yes
  IdentitiesOnly yes
EOF
    log "Wrote GitHub entries to ${SSH_CONFIG}"
  fi

  # Ensure IdentityFile reflects KEY for existing entries
  if grep -qE '^Host (github|github\.com|github-443)([[:space:]]|$)' "${SSH_CONFIG}"; then
    awk -v key="${KEY}" -v q='"' '
      BEGIN{host=""}
      /^Host /{host=$0}
      # Update IdentityFile lines within github-related Host blocks, quoting the path
      (host ~ /(^|[[:space:]])github(\\.com)?([[:space:]]|$)/ || host ~ /(^|[[:space:]])github-443([[:space:]]|$)/) && $1=="IdentityFile"{$2=q key q}
      {print}
    ' "${SSH_CONFIG}" > "${SSH_CONFIG}.tmp" && mv "${SSH_CONFIG}.tmp" "${SSH_CONFIG}"
  fi
}

preseed_known_hosts() {
  ssh-keyscan -t rsa,ecdsa,ed25519 github.com 2>/dev/null >> ~/.ssh/known_hosts || true
  ssh-keyscan -t rsa,ecdsa,ed25519 ssh.github.com 2>/dev/null >> ~/.ssh/known_hosts || true
  sort -u ~/.ssh/known_hosts -o ~/.ssh/known_hosts || true
  chmod 644 ~/.ssh/known_hosts || true
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --name) USER_NAME_DEFAULT="$2"; shift;;
      --email) EMAIL_DEFAULT="$2"; shift;;
      --key|--key-path) KEY="$2"; shift;;
      --install-deps) INSTALL_DEPS=1;;
      --no-install-deps) INSTALL_DEPS=0;;
      --set-git-identity) SET_GIT_IDENTITY=1;;
      --gh-login) GH_LOGIN=1;;
      --no-gh-login) GH_LOGIN=0;;
      --add-key) ADD_KEY_VIA_GH=1;;
      --no-add-key) ADD_KEY_VIA_GH=0;;
      --push) PUSH=1;;
      --no-push) PUSH=0;;
      --force-443) FORCE_SSH_443=1;;
      --owner) OWNER="$2"; shift;;
      --repo) REPO="$2"; shift;;
      -h|--help) usage; exit 0;;
      *) warn "Unknown argument: $1"; usage; exit 1;;
    esac
    shift
  done
}

gh_auth_login_if_needed() {
  if [[ "$GH_LOGIN" -eq 0 ]]; then
    warn "Skipping gh auth login (disabled)."
    return
  fi
  if gh auth status --hostname github.com >/dev/null 2>&1; then
    log "gh is already authenticated."
  else
    log "Authenticating gh (browser flow)…"
    # This will show a one-time code and open your Windows browser from WSL.
    gh auth login --hostname github.com --git-protocol ssh --web
  fi
}

add_ssh_key_to_github() {
  [[ "${ADD_KEY_VIA_GH}" -eq 1 ]] || { warn "Skipping auto-adding SSH key to GitHub."; return; }

  local pub="${KEY}.pub"
  [[ -f "${pub}" ]] || { err "Public key not found: ${pub}"; return; }

  # Check if this fingerprint already exists on GitHub
  local fpr
  fpr="$(ssh-keygen -lf "${pub}" | awk '{print $2}')"
  local existing
  existing="$(gh ssh-key list --json fingerprint --jq ".[] | select(.fingerprint==\"${fpr}\") | .fingerprint" || true)"
  if [[ -n "${existing}" ]]; then
    log "SSH key already present on GitHub (fingerprint ${fpr})."
  else
    log "Adding SSH key to GitHub account…"
    gh ssh-key add "${pub}" -t "WSL $(hostname) $(date +%F)" >/dev/null
    log "SSH key added."
  fi
}

parse_owner_repo_from_remote() {
  local url
  url="$(git remote get-url origin 2>/dev/null || true)"
  if [[ -z "${url}" ]]; then
    warn "No 'origin' remote set. I’ll infer from package.json or prompt."
  fi

  if [[ "${url}" =~ ^git@([^:]+):([^/]+)/([^.]+)(\.git)?$ ]]; then
    OWNER="${BASH_REMATCH[2]}"
    REPO="${BASH_REMATCH[3]}"
  elif [[ "${url}" =~ ^https://github\.com/([^/]+)/([^.]+)(\.git)?$ ]]; then
    OWNER="${BASH_REMATCH[1]}"
    REPO="${BASH_REMATCH[2]}"
  else
    # Fallback: try gh to detect current repo from cwd
    if gh repo view --json nameWithOwner >/dev/null 2>&1; then
      IFS='/' read -r OWNER REPO <<<"$(gh repo view --json nameWithOwner --jq .nameWithOwner)"
    else
      # Final fallback: prompt once
      read -rp "GitHub owner (e.g., tonym999): " OWNER
      read -rp "Repo name (e.g., patofalltrades): " REPO
    fi
  fi
  [[ -n "${OWNER:-}" && -n "${REPO:-}" ]] || { err "Could not determine owner/repo."; exit 1; }
}

set_remote_to_ssh() {
  local remote
  if [[ "$FORCE_SSH_443" -eq 1 ]]; then
    remote="git@github-443:${OWNER}/${REPO}.git"
  else
    remote="git@github:${OWNER}/${REPO}.git"
  fi
  if git remote get-url origin >/dev/null 2>&1; then
    git remote set-url origin "${remote}"
  else
    git remote add origin "${remote}"
  fi
  log "Remote 'origin' → ${remote}"
}

try_auth() {
  local out
  out="$(ssh -T "$1" -o StrictHostKeyChecking=accept-new 2>&1 || true)"
  if echo "${out}" | grep -qi 'successfully authenticated'; then
    return 0
  fi
  return 1
}

maybe_switch_to_443() {
  if [[ "$FORCE_SSH_443" -eq 1 ]]; then
    log "Using forced SSH over 443 host alias."
    return
  fi
  if try_auth git@github; then
    log "SSH auth to github.com (port 22) OK."
  else
    warn "Port 22 blocked? Trying port 443…"
    if try_auth git@github-443; then
      local remote="git@github-443:${OWNER}/${REPO}.git"
      git remote set-url origin "${remote}"
      log "Switched remote to ${remote}"
    else
      err "Could not authenticate to GitHub over SSH.
Add this key to https://github.com/settings/keys then re-run.
----- PUBLIC KEY -----
$(cat "${KEY}.pub")
----------------------"
      exit 1
    fi
  fi
}

ensure_upstream_and_push() {
  if [[ "$PUSH" -eq 0 ]]; then
    warn "Skipping push (enable with --push)."
    return
  fi
  if git rev-parse --abbrev-ref --symbolic-full-name @{upstream} >/dev/null 2>&1; then
    log "Upstream already set; pushing normally…"
    git push
  else
    local branch
    branch="$(git rev-parse --abbrev-ref HEAD)"
    log "First push: setting upstream → origin/${branch}"
    git push -u origin "${branch}"
  fi
}

check_repo_settings() {
  log "Checking repo settings for ${OWNER}/${REPO}…"
  # Basic repo info
  local info
  info="$(gh repo view "${OWNER}/${REPO}" --json nameWithOwner,visibility,defaultBranchRef,mergeCommitAllowed,squashMergeAllowed,rebaseMergeAllowed,deleteBranchOnMerge \
           --jq '{repo:.nameWithOwner,visibility:.visibility,defaultBranch:.defaultBranchRef.name,mergeCommitAllowed:.mergeCommitAllowed,squashMergeAllowed:.squashMergeAllowed,rebaseMergeAllowed:.rebaseMergeAllowed,deleteBranchOnMerge:.deleteBranchOnMerge}')"
  echo "${info}" | jq -C .

  local default_branch
  default_branch="$(echo "${info}" | jq -r '.defaultBranch')"

  # Branch protection (requires admin on the repo; otherwise 404)
  local prot raw
  set +e
  raw="$(gh api -H "Accept: application/vnd.github+json" \
        "/repos/${OWNER}/${REPO}/branches/${default_branch}/protection" 2>/dev/null)"
  set -e
  if [[ -z "${raw}" ]]; then
    warn "No branch protection on '${default_branch}'."
    echo "  → Suggestion: protect '${default_branch}' with required PRs and status checks (e.g. your Playwright a11y job)."
  else
    prot="$(echo "${raw}" | jq '{enforce_admins:.enforce_admins.enabled,
                                 required_status_checks:(.required_status_checks // {}) | {strict,contexts},
                                 required_pull_request_reviews:(.required_pull_request_reviews // {}) | {required_approving_review_count,require_code_owner_reviews,dismiss_stale_reviews},
                                 restrictions: (.restrictions // null)}')"
    echo "Branch protection on '${default_branch}':"
    echo "${prot}" | jq -C .

    # Nudge if e2e-a11y not in required contexts
    local contexts
    contexts="$(echo "${prot}" | jq -r '.required_status_checks.contexts[]?' || true)"
    if ! grep -qiE '^e2e-a11y$' <<<"${contexts}"; then
      warn "Required status checks do not include 'e2e-a11y'."
      echo "  → After your CI is green once, add it as a required check in branch protection."
    fi
  fi
}

main() {
  parse_args "$@"
  require_repo_root
  ensure_deps
  ensure_git_identity
  ensure_ssh_dir
  ensure_key
  ensure_agent_and_add_key
  ensure_config
  preseed_known_hosts
  gh_auth_login_if_needed
  add_ssh_key_to_github
  parse_owner_repo_from_remote
  set_remote_to_ssh
  maybe_switch_to_443
  ensure_upstream_and_push
  check_repo_settings
  log "All done."
  # Bonus: copy key to Windows clipboard for reference
  if command -v clip.exe >/dev/null 2>&1; then
    clip.exe < "${KEY}.pub" && log "Public key copied to Windows clipboard."
  fi
}

main "$@"
