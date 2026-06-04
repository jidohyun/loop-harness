import { z } from "zod"
import {
  DEFAULT_STOP_MODE,
  HARNESS_NAME,
  HARNESS_VERSION,
  STAGES,
  STATUS_VALUES,
  STOP_MODES,
} from "./constants"

export const StageSchema = z.enum(STAGES)
export type Stage = z.infer<typeof StageSchema>

export const StopModeSchema = z.enum(STOP_MODES)
export type StopMode = z.infer<typeof StopModeSchema>

export const LoopStatusSchema = z.enum(STATUS_VALUES)
export type LoopStatus = z.infer<typeof LoopStatusSchema>

export const LoopStateSchema = z.object({
  version: z.literal(HARNESS_VERSION),
  harness: z.literal(HARNESS_NAME),
  sessionId: z.string().min(1),
  task: z.string().min(1),
  defaultStopMode: z.literal(DEFAULT_STOP_MODE),
  selectedStopMode: StopModeSchema,
  stage: StageSchema,
  status: LoopStatusSchema,
  blockedStage: StageSchema.optional(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
})
export type LoopState = z.infer<typeof LoopStateSchema>

export const LedgerEventSchema = z.object({
  eventId: z.string().min(1),
  kind: z.literal("stage_evidence_recorded"),
  stage: StageSchema,
  evidence: z.string().min(1),
  recordedAt: z.string().min(1),
})
export type LedgerEvent = z.infer<typeof LedgerEventSchema>
