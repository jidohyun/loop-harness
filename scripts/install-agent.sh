#!/usr/bin/env bash
set -euo pipefail

repo_url="${LOOP_HARNESS_REPO_URL:-https://github.com/jidohyun/loop-harness.git}"
install_dir="${LOOP_HARNESS_HOME:-$HOME/.local/share/loop-harness}"
bin_dir="${LOOP_HARNESS_BIN_DIR:-$HOME/.local/bin}"
update_profile="${LOOP_HARNESS_UPDATE_PROFILE:-1}"
command_path="$bin_dir/loop-harness"
original_path="$PATH"

need_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    printf 'missing required command: %s\n' "$1" >&2
    exit 1
  fi
}

ensure_bun() {
  if command -v bun >/dev/null 2>&1; then
    return 0
  fi

  need_command curl
  printf 'bun not found; installing bun for this user...\n'
  curl -fsSL https://bun.sh/install | bash
  export PATH="$HOME/.bun/bin:$PATH"

  if ! command -v bun >/dev/null 2>&1; then
    printf 'bun install finished, but bun is still not on PATH. Add $HOME/.bun/bin to PATH and rerun.\n' >&2
    exit 1
  fi
}

profile_file() {
  shell_name="$(basename "${SHELL:-sh}")"
  case "$shell_name" in
    zsh) printf '%s\n' "$HOME/.zshrc" ;;
    bash) printf '%s\n' "$HOME/.bashrc" ;;
    *) printf '%s\n' "$HOME/.profile" ;;
  esac
}

ensure_profile_path() {
  if printf '%s' ":$original_path:" | grep -q ":$bin_dir:"; then
    return 0
  fi

  if [ "$update_profile" != "1" ]; then
    printf 'add this to PATH: export PATH="%s:$PATH"\n' "$bin_dir"
    return 0
  fi

  profile="$(profile_file)"
  mkdir -p "$(dirname "$profile")"
  touch "$profile"

  if grep -F "$bin_dir" "$profile" >/dev/null 2>&1; then
    printf 'PATH entry already present in %s\n' "$profile"
    return 0
  fi

  if [ "$bin_dir" = "$HOME/.local/bin" ]; then
    printf '\nexport PATH="$HOME/.local/bin:$PATH"\n' >>"$profile"
  else
    printf '\nexport PATH="%s:$PATH"\n' "$bin_dir" >>"$profile"
  fi

  printf 'updated PATH in %s\n' "$profile"
}

need_command git
ensure_bun
mkdir -p "$bin_dir" "$(dirname "$install_dir")"

if [ -d "$install_dir/.git" ]; then
  git -C "$install_dir" fetch origin main
  git -C "$install_dir" checkout main
  git -C "$install_dir" pull --ff-only origin main
elif [ -e "$install_dir" ]; then
  printf 'install path exists but is not a git repo: %s\n' "$install_dir" >&2
  printf 'Set LOOP_HARNESS_HOME to another path or move the existing directory.\n' >&2
  exit 1
else
  git clone --depth 1 "$repo_url" "$install_dir"
fi

cd "$install_dir"
bun install --frozen-lockfile
chmod +x bin/loop-harness.ts
ln -sf "$install_dir/bin/loop-harness.ts" "$command_path"

tmp_dir="$(mktemp -d)"
cleanup() {
  rm -rf "$tmp_dir"
}
trap cleanup EXIT

PATH="$bin_dir:$PATH"
cd "$tmp_dir"
loop-harness start --task install-smoke --json >/dev/null
loop-harness status --json >/dev/null
ensure_profile_path

printf 'loop-harness installed successfully.\n'
printf 'command: %s\n' "$command_path"
printf 'install_dir: %s\n' "$install_dir"
