import { mkdir } from "node:fs/promises"
import { join } from "node:path"

export type HarnessPaths = {
  readonly root: string
  readonly state: string
  readonly ledger: string
  readonly evidenceDir: string
  readonly brief: string
  readonly handoff: string
}

export function resolveHarnessPaths(cwd: string): HarnessPaths {
  const root = join(cwd, ".omo", "loop-harness")
  return {
    root,
    state: join(root, "state.json"),
    ledger: join(root, "ledger.jsonl"),
    evidenceDir: join(root, "evidence"),
    brief: join(root, "brief.md"),
    handoff: join(root, "handoff.md"),
  }
}

export async function ensureHarnessDirs(paths: HarnessPaths): Promise<void> {
  await mkdir(paths.evidenceDir, { recursive: true })
}
