#!/bin/bash
# Ensure the jev-skills CLI (used by .claude/skills/jev-*) is available.
set -euo pipefail

export PATH="$HOME/.local/bin:$PATH"
if ! command -v jev-skills >/dev/null 2>&1; then
  uv tool install 'git+https://github.com/n23eos/jev-skills.git' >/dev/null 2>&1 || exit 0
fi
if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  echo "export PATH=\"$HOME/.local/bin:\$PATH\"" >> "$CLAUDE_ENV_FILE"
fi
