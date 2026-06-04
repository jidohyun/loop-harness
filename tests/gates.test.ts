import { expect, test } from "bun:test"
import { LoopStateSchema } from "../src/schemas"
import { makeTempWorkspace, parseJson, runCli } from "./helpers"

test("stops before selected stage when advancing through previous stage", async () => {
  // Given: a task configured to stop before Implement.
  const cwd = await makeTempWorkspace("loop-harness-gate-")
  const started = await runCli(cwd, [
    "start",
    "--task",
    "demo",
    "--stop-before",
    "implement",
    "--json",
  ])
  expect(started.exitCode).toBe(0)

  // When: the loop advances through Plan.
  const advanced = await runCli(cwd, ["advance", "--through", "plan", "--json"])

  // Then: it waits for permission before Implement instead of continuing.
  expect(advanced.exitCode).toBe(0)
  const body = parseJson(advanced.stdout, LoopStateSchema)
  expect(body.status).toBe("waiting_for_permission")
  expect(body.blockedStage).toBe("implement")
})
