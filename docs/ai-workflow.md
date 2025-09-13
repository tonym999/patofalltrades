# AI-Powered GitHub Workflow Automation

## Overview
This document explains the automated development workflow powered by Cursor AI and GitHub MCP, with CodeRabbit review integration.

## Workflow
1. Select an in-progress ticket from the project board.
2. Create a feature branch from `main` using `feature/[ticket-id]-[description]`.
3. Implement changes and add tests.
4. Commit using conventional commits and push the branch.
   - Include issue references in commit footers (e.g., `Closes #29`).
5. Open a PR and follow review process with CodeRabbit.
6. After CodeRabbit review completes, address actionable items and nitpicks, push fixes, and resolve comment threads.

## MCP Steps
- Get Project Items → Get Issue Details → Create Branch → Create/Modify Files → Create Test Files → Commit Changes → Push Branch

## Testing
- At least one smoke test per feature under `tests/smoke/`.
- Functional tests under `tests/functional/`.
 - Run locally: `npx playwright test`

## CodeRabbit Patterns
- Actionable markers: `🔧 Actionable:`, `⚠️ Issue:`, `🐛 Bug:`, `🚨 Critical:`
- Nitpick markers: `💭 Nitpick:`, `💡 Suggestion:`, `📝 Style:`, `✨ Enhancement:`

## Troubleshooting
- Ensure GitHub authentication is configured.
- If Playwright is missing, install browsers (Linux/CI): `npx playwright install --with-deps`.
- Retry transient network steps before escalating.

## Onboarding
- Review `prompts/` templates, `.cursorrules`, and branch/commit conventions.
