import { existsSync } from "node:fs"
import { appendFile, readFile, writeFile } from "node:fs/promises"
import type { HarnessPaths } from "./paths"
import { type LedgerEvent, LedgerEventSchema, type LoopState, LoopStateSchema } from "./schemas"

export async function readState(paths: HarnessPaths): Promise<LoopState | null> {
  if (!existsSync(paths.state)) {
    return null
  }
  const text = await readFile(paths.state, "utf8")
  return LoopStateSchema.parse(JSON.parse(text))
}

export async function writeState(paths: HarnessPaths, state: LoopState): Promise<void> {
  const parsed = LoopStateSchema.parse(state)
  await writeFile(paths.state, `${JSON.stringify(parsed, null, 2)}\n`, "utf8")
}

export async function appendLedgerEvent(paths: HarnessPaths, event: LedgerEvent): Promise<void> {
  const parsed = LedgerEventSchema.parse(event)
  await appendFile(paths.ledger, `${JSON.stringify(parsed)}\n`, "utf8")
}
