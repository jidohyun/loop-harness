# loop-harness

[한국어 README](./README.ko.md) | [English](./README.md)

**Recommand: install this as an agent-local CLI when you want every task to start with a durable Research → Plan → Implement → Verify loop.**

`loop-harness` is a standalone TypeScript CLI for agent workflows. It gives an agent a small, repo-neutral harness that records what stage the work is in, where it should stop for permission, and what evidence was produced.

## Core idea

When a new task starts, the harness makes the loop explicit:

1. **Research** — gather context and evidence before deciding.
2. **Plan** — write the intended path and acceptance checks.
3. **Implement** — do the work inside the selected permission mode.
4. **Verify** — record real evidence, not just claims.

The state lives in the current working directory under `.omo/loop-harness/`, so each repo or temp workspace gets its own independent loop state.

## Recommended agent install

Use this when installing for a coding agent or local autonomous workflow. It keeps the package outside any project repo and exposes a stable `loop-harness` command on `PATH`.

```sh
mkdir -p ~/.local/share ~/.local/bin
git clone https://github.com/jidohyun/loop-harness.git ~/.local/share/loop-harness
cd ~/.local/share/loop-harness
bun install --frozen-lockfile
ln -sf "$PWD/bin/loop-harness.ts" ~/.local/bin/loop-harness
chmod +x bin/loop-harness.ts
```

If `~/.local/bin` is not already on `PATH`:

```sh
export PATH="$HOME/.local/bin:$PATH"
```

Smoke test from any workspace:

```sh
mkdir -p /tmp/loop-harness-demo
cd /tmp/loop-harness-demo
loop-harness start --task "demo" --json
loop-harness status --json
```

## What it does

- Defaults to `full_autopilot` when no stop mode is selected.
- Supports explicit permission gates before Research, Plan, Implement, or Verify.
- Persists `state.json` and append-only `ledger.jsonl` under `.omo/loop-harness/`.
- Records stage evidence with stable JSON output for agents to parse.
- Avoids `wcw`, dashboard, daemon, or repo-specific coupling.

## CLI usage

```sh
loop-harness start --task "demo" --json
loop-harness start --task "demo" --stop-before implement --json
loop-harness advance --through plan --json
loop-harness record research --evidence evidence/research.txt --json
loop-harness status --json
```

Stop modes exposed through `--stop-before`:

| Option | Effect |
| --- | --- |
| `research` | Create state, then wait before Research. |
| `plan` | Run Research, then wait before Plan. |
| `implement` | Run through Plan, then wait before Implement. |
| `verify` | Run through Implement, then wait before Verify. |
| omitted | Use `full_autopilot`. |

## Local development

Run directly from the repo:

```sh
bun run bin/loop-harness.ts start --task "demo" --json
```

Quality gate:

```sh
bun run qa
NODE_PATH="$PWD/node_modules" bun run /Users/dnp-jidohyun/.codex/plugins/cache/sisyphuslabs/omo/0.1.0/skills/programming/scripts/typescript/check-no-excuse-rules.ts src tests bin
```
