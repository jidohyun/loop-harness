import { expect, test } from "bun:test"
import { existsSync } from "node:fs"
import { join } from "node:path"
import { makeTempWorkspace, runCli } from "./helpers"

test("keeps state repo neutral across independent workspaces", async () => {
  // Given: two unrelated directories.
  const first = await makeTempWorkspace("loop-harness-one-")
  const second = await makeTempWorkspace("loop-harness-two-")

  // When: the harness starts independently in each directory.
  const firstResult = await runCli(first, ["start", "--task", "one", "--json"])
  const secondResult = await runCli(second, ["start", "--task", "two", "--json"])

  // Then: each directory owns its own neutral .omo state and no wcw path appears.
  expect(firstResult.exitCode).toBe(0)
  expect(secondResult.exitCode).toBe(0)
  const firstState = join(first, ".omo", "loop-harness", "state.json")
  const secondState = join(second, ".omo", "loop-harness", "state.json")
  expect(existsSync(firstState)).toBe(true)
  expect(existsSync(secondState)).toBe(true)
  expect(firstState.includes(".wcw")).toBe(false)
  expect(secondState.includes(".wcw")).toBe(false)
})
