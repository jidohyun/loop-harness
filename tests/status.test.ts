import { expect, test } from "bun:test"
import { LoopStateSchema } from "../src/schemas"
import { makeTempWorkspace, parseJson, runCli } from "./helpers"

test("reports persisted loop state when status is requested", async () => {
  // Given: a loop started with a selectable stop mode.
  const cwd = await makeTempWorkspace("loop-harness-status-")
  const started = await runCli(cwd, [
    "start",
    "--task",
    "demo",
    "--stop-before",
    "verify",
    "--json",
  ])
  expect(started.exitCode).toBe(0)

  // When: status is requested through the CLI surface.
  const status = await runCli(cwd, ["status", "--json"])

  // Then: the persisted state is returned without repo-specific coupling.
  expect(status.exitCode).toBe(0)
  const body = parseJson(status.stdout, LoopStateSchema)
  expect(body.task).toBe("demo")
  expect(body.selectedStopMode).toBe("before_verify")
  expect(body.harness).toBe("loop-harness")
})
