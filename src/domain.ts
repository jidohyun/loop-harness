import { randomUUID } from "node:crypto"
import { DEFAULT_STOP_MODE, HARNESS_NAME, HARNESS_VERSION } from "./constants"
import type { LedgerEvent, LoopState, Stage, StopMode } from "./schemas"

export function stopModeForStage(stage: Stage): StopMode {
  switch (stage) {
    case "research":
      return "before_research"
    case "plan":
      return "before_plan"
    case "implement":
      return "before_implement"
    case "verify":
      return "before_verify"
    default:
      return assertNever(stage)
  }
}

export function nextStage(stage: Stage): Stage | "complete" {
  switch (stage) {
    case "research":
      return "plan"
    case "plan":
      return "implement"
    case "implement":
      return "verify"
    case "verify":
      return "complete"
    default:
      return assertNever(stage)
  }
}

export function stageIndex(stage: Stage): number {
  switch (stage) {
    case "research":
      return 0
    case "plan":
      return 1
    case "implement":
      return 2
    case "verify":
      return 3
    default:
      return assertNever(stage)
  }
}

export function createInitialState(input: {
  readonly task: string
  readonly selectedStopMode: StopMode
  readonly now: string
}): LoopState {
  const waitingBeforeResearch = input.selectedStopMode === "before_research"
  return {
    version: HARNESS_VERSION,
    harness: HARNESS_NAME,
    sessionId: randomUUID(),
    task: input.task,
    defaultStopMode: DEFAULT_STOP_MODE,
    selectedStopMode: input.selectedStopMode,
    stage: "research",
    status: waitingBeforeResearch ? "waiting_for_permission" : "running",
    ...(waitingBeforeResearch ? { blockedStage: "research" } : {}),
    createdAt: input.now,
    updatedAt: input.now,
  }
}

export function advanceThrough(state: LoopState, through: Stage, now: string): LoopState {
  const targetIndex = stageIndex(through)
  const currentIndex = stageIndex(state.stage)
  const effectiveStage = targetIndex < currentIndex ? state.stage : through
  const next = nextStage(effectiveStage)

  if (next === "complete") {
    return {
      ...withoutBlockedStage(state),
      stage: "verify",
      status: "complete",
      updatedAt: now,
    }
  }

  const nextStopMode = stopModeForStage(next)
  if (state.selectedStopMode === nextStopMode) {
    return {
      ...state,
      stage: next,
      status: "waiting_for_permission",
      blockedStage: next,
      updatedAt: now,
    }
  }

  return {
    ...withoutBlockedStage(state),
    stage: next,
    status: "running",
    updatedAt: now,
  }
}

export function createLedgerEvent(input: {
  readonly stage: Stage
  readonly evidence: string
  readonly now: string
}): LedgerEvent {
  return {
    eventId: randomUUID(),
    kind: "stage_evidence_recorded",
    stage: input.stage,
    evidence: input.evidence,
    recordedAt: input.now,
  }
}

function withoutBlockedStage(state: LoopState): LoopState {
  return {
    version: state.version,
    harness: state.harness,
    sessionId: state.sessionId,
    task: state.task,
    defaultStopMode: state.defaultStopMode,
    selectedStopMode: state.selectedStopMode,
    stage: state.stage,
    status: state.status,
    createdAt: state.createdAt,
    updatedAt: state.updatedAt,
  }
}

function assertNever(value: never): never {
  throw new Error(`unexpected value: ${String(value)}`)
}
