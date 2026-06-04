import { expect, test } from "bun:test"
import { join } from "node:path"
import { LedgerEventSchema } from "../src/schemas"
import { makeTempWorkspace, parseJson, readJsonl, runCli } from "./helpers"

test("appends research and plan evidence events without overwriting prior events", async () => {
  // Given: a started loop in an empty workspace.
  const cwd = await makeTempWorkspace("loop-harness-ledger-")
  const started = await runCli(cwd, ["start", "--task", "demo", "--json"])
  expect(started.exitCode).toBe(0)

  // When: Research and Plan evidence are recorded.
  const research = await runCli(cwd, [
    "record",
    "research",
    "--evidence",
    "evidence/research.txt",
    "--json",
  ])
  const plan = await runCli(cwd, ["record", "plan", "--evidence", "evidence/plan.txt", "--json"])

  // Then: both events are observable in JSON output and durable JSONL state.
  expect(research.exitCode).toBe(0)
  expect(plan.exitCode).toBe(0)
  expect(parseJson(research.stdout, LedgerEventSchema).stage).toBe("research")
  expect(parseJson(plan.stdout, LedgerEventSchema).stage).toBe("plan")
  const rows = await readJsonl(join(cwd, ".omo", "loop-harness", "ledger.jsonl"), LedgerEventSchema)
  expect(rows.at(-2)?.stage).toBe("research")
  expect(rows.at(-2)?.evidence).toBe("evidence/research.txt")
  expect(rows.at(-1)?.stage).toBe("plan")
  expect(rows.at(-1)?.evidence).toBe("evidence/plan.txt")
})
