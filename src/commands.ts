import { advanceThrough, createInitialState, createLedgerEvent } from "./domain"
import { MissingStateError } from "./errors"
import { ensureHarnessDirs, resolveHarnessPaths } from "./paths"
import type { Stage, StopMode } from "./schemas"
import { appendLedgerEvent, readState, writeState } from "./storage"

export async function startLoop(input: {
  readonly cwd: string
  readonly task: string
  readonly selectedStopMode: StopMode
  readonly now: string
}): Promise<Record<string, unknown>> {
  const paths = resolveHarnessPaths(input.cwd)
  await ensureHarnessDirs(paths)
  const state = createInitialState({
    task: input.task,
    selectedStopMode: input.selectedStopMode,
    now: input.now,
  })
  await writeState(paths, state)
  return state
}

export async function advanceLoop(input: {
  readonly cwd: string
  readonly through: Stage
  readonly now: string
}): Promise<Record<string, unknown>> {
  const paths = resolveHarnessPaths(input.cwd)
  await ensureHarnessDirs(paths)
  const state = await requireState(paths.state, await readState(paths))
  const next = advanceThrough(state, input.through, input.now)
  await writeState(paths, next)
  return next
}

export async function recordEvidence(input: {
  readonly cwd: string
  readonly stage: Stage
  readonly evidence: string
  readonly now: string
}): Promise<Record<string, unknown>> {
  const paths = resolveHarnessPaths(input.cwd)
  await ensureHarnessDirs(paths)
  const state = await requireState(paths.state, await readState(paths))
  const event = createLedgerEvent({ stage: input.stage, evidence: input.evidence, now: input.now })
  await appendLedgerEvent(paths, event)
  const next = advanceThrough(state, input.stage, input.now)
  await writeState(paths, next)
  return event
}

export async function readLoopStatus(input: {
  readonly cwd: string
}): Promise<Record<string, unknown>> {
  const paths = resolveHarnessPaths(input.cwd)
  const state = await requireState(paths.state, await readState(paths))
  return state
}

async function requireState<T>(statePath: string, state: T | null): Promise<T> {
  if (state === null) {
    throw new MissingStateError(statePath)
  }
  return state
}
