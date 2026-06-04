# loop-harness

[English README](./README.md) | [한국어](./README.ko.md)

**추천: 모든 작업을 durable한 Research → Plan → Implement → Verify 루프로 시작하고 싶을 때, 에이전트 로컬 CLI로 설치하세요.**

`loop-harness`는 에이전트 워크플로를 위한 독립 TypeScript CLI입니다. 에이전트가 현재 작업 단계, 허락을 받아야 하는 지점, 생성한 증거를 작고 repo-neutral한 상태 파일로 기록하게 해줍니다.

## 핵심 아이디어

새 작업이 시작되면 하네스는 루프를 명시적으로 만듭니다.

1. **Research** — 결정하기 전에 컨텍스트와 증거를 모읍니다.
2. **Plan** — 진행 경로와 acceptance check를 적습니다.
3. **Implement** — 선택된 permission mode 안에서 작업합니다.
4. **Verify** — 주장 대신 실제 증거를 기록합니다.

상태는 현재 작업 디렉터리의 `.omo/loop-harness/` 아래에 저장됩니다. 그래서 각 repo나 임시 작업공간은 서로 독립적인 loop state를 갖습니다.

## 에이전트용 추천 설치 방법

코딩 에이전트나 로컬 autonomous workflow에 설치할 때 이 방식을 권장합니다. 패키지는 프로젝트 repo 밖에 두고, 안정적인 `loop-harness` 명령만 `PATH`에 노출합니다.

```sh
mkdir -p ~/.local/share ~/.local/bin
git clone https://github.com/jidohyun/loop-harness.git ~/.local/share/loop-harness
cd ~/.local/share/loop-harness
bun install --frozen-lockfile
ln -sf "$PWD/bin/loop-harness.ts" ~/.local/bin/loop-harness
chmod +x bin/loop-harness.ts
```

`~/.local/bin`이 아직 `PATH`에 없다면:

```sh
export PATH="$HOME/.local/bin:$PATH"
```

아무 작업공간에서 smoke test:

```sh
mkdir -p /tmp/loop-harness-demo
cd /tmp/loop-harness-demo
loop-harness start --task "demo" --json
loop-harness status --json
```

## 하는 일

- stop mode를 고르지 않으면 기본값으로 `full_autopilot`을 사용합니다.
- Research, Plan, Implement, Verify 전에 명시적인 permission gate를 둘 수 있습니다.
- `.omo/loop-harness/` 아래에 `state.json`과 append-only `ledger.jsonl`을 저장합니다.
- 에이전트가 파싱하기 쉬운 안정적인 JSON 출력으로 stage evidence를 기록합니다.
- `wcw`, dashboard, daemon, 특정 repo에 대한 coupling을 피합니다.

## CLI 사용법

```sh
loop-harness start --task "demo" --json
loop-harness start --task "demo" --stop-before implement --json
loop-harness advance --through plan --json
loop-harness record research --evidence evidence/research.txt --json
loop-harness status --json
```

`--stop-before`로 노출되는 stop mode:

| Option | 효과 |
| --- | --- |
| `research` | 상태를 만들고 Research 전에 대기합니다. |
| `plan` | Research를 지나 Plan 전에 대기합니다. |
| `implement` | Plan까지 지나고 Implement 전에 대기합니다. |
| `verify` | Implement까지 지나고 Verify 전에 대기합니다. |
| 생략 | `full_autopilot`을 사용합니다. |

## 로컬 개발

repo에서 직접 실행:

```sh
bun run bin/loop-harness.ts start --task "demo" --json
```

품질 게이트:

```sh
bun run qa
NODE_PATH="$PWD/node_modules" bun run /Users/dnp-jidohyun/.codex/plugins/cache/sisyphuslabs/omo/0.1.0/skills/programming/scripts/typescript/check-no-excuse-rules.ts src tests bin
```
