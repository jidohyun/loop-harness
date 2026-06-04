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

Paste this block into your coding agent. The agent can run it as-is; it installs or updates `loop-harness`, links the command, and runs a smoke test.

```text
Install loop-harness for me. Run this exact command, then verify that `loop-harness status --json` works from a temp directory:

bash -lc 'curl -fsSL https://raw.githubusercontent.com/jidohyun/loop-harness/main/scripts/install-agent.sh | bash'
```

If you are installing it yourself instead of through an agent, run the same command directly:

```sh
bash -lc 'curl -fsSL https://raw.githubusercontent.com/jidohyun/loop-harness/main/scripts/install-agent.sh | bash'
```

The installer is idempotent:

- clones or fast-forwards `https://github.com/jidohyun/loop-harness.git`
- installs Bun automatically if `bun` is missing
- runs `bun install --frozen-lockfile`
- links `~/.local/bin/loop-harness`
- verifies `start` and `status` in a temp workspace

If `~/.local/bin` is not already on `PATH`, add it:

```sh
export PATH="$HOME/.local/bin:$PATH"
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
