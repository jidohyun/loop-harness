import { expect, test } from "bun:test"
import { existsSync } from "node:fs"
import { join } from "node:path"
import { LoopStateSchema } from "../src/schemas"
import { makeTempWorkspace, parseJson, runCli } from "./helpers"

test("starts with full_autopilot default when no stop mode is provided", async () => {
  // Given: an empty workspace and no explicit stop mode.
  const cwd = await makeTempWorkspace("loop-harness-start-")

  // When: the loop harness starts a task through its CLI surface.
  const result = await runCli(cwd, ["start", "--task", "demo", "--json"])

  // Then: state is persisted locally and the loop begins at Research under full autopilot.
  expect(result.exitCode).toBe(0)
  const body = parseJson(result.stdout, LoopStateSchema)
  expect(body.defaultStopMode).toBe("full_autopilot")
  expect(body.selectedStopMode).toBe("full_autopilot")
  expect(body.stage).toBe("research")
  expect(body.status).toBe("running")
  expect(existsSync(join(cwd, ".omo", "loop-harness", "state.json"))).toBe(true)
})
