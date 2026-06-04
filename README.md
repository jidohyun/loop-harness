# loop-harness

A standalone TypeScript CLI package for a personal Research → Plan → Implement → Verify loop harness.

## v0 contract

- Session-first CLI surface.
- Default stop mode is `full_autopilot`.
- Optional stop gates: before Research, Plan, Implement, or Verify.
- Persists state and JSONL ledger under `.omo/loop-harness/` in the current working directory.
- No wcw coupling, dashboard, daemon, or repo-specific hardcoding.

## Usage

```sh
loop-harness start --task "demo" --json
loop-harness start --task "demo" --stop-before implement --json
loop-harness advance --through plan --json
loop-harness record research --evidence evidence/research.txt --json
loop-harness status --json
```

During local development, run the executable directly:

```sh
bun run bin/loop-harness.ts start --task "demo" --json
```

## Development gate

```sh
bun run qa
NODE_PATH="$PWD/node_modules" bun run /Users/dnp-jidohyun/.codex/plugins/cache/sisyphuslabs/omo/0.1.0/skills/programming/scripts/typescript/check-no-excuse-rules.ts src tests bin
```
