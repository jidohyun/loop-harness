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

아래 블록을 본인 코딩 에이전트에게 그대로 붙여 넣으세요. 에이전트가 그대로 실행하면 `loop-harness`를 설치 또는 업데이트하고, 명령을 링크하고, smoke test까지 수행합니다.

```text
loop-harness를 설치해줘. 아래 명령을 정확히 실행한 다음, 임시 디렉터리에서 `loop-harness status --json`이 동작하는지 검증해줘.

bash -lc 'curl -fsSL https://raw.githubusercontent.com/jidohyun/loop-harness/main/scripts/install-agent.sh | bash'
```

에이전트가 아니라 직접 설치한다면 같은 명령을 터미널에서 실행하면 됩니다.

```sh
bash -lc 'curl -fsSL https://raw.githubusercontent.com/jidohyun/loop-harness/main/scripts/install-agent.sh | bash'
```

설치 스크립트는 idempotent합니다.

- `https://github.com/jidohyun/loop-harness.git`을 clone하거나 fast-forward 업데이트합니다.
- `bun`이 없으면 자동으로 설치합니다.
- `bun install --frozen-lockfile`을 실행합니다.
- `~/.local/bin/loop-harness`를 링크합니다.
- 임시 작업공간에서 `start`와 `status`를 검증합니다.

`~/.local/bin`이 아직 `PATH`에 없다면 추가하세요.

```sh
export PATH="$HOME/.local/bin:$PATH"
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
