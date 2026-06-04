export const STAGES = ["research", "plan", "implement", "verify"] as const

export const STOP_MODES = [
  "before_research",
  "before_plan",
  "before_implement",
  "before_verify",
  "full_autopilot",
] as const

export const STATUS_VALUES = ["running", "waiting_for_permission", "complete"] as const

export const HARNESS_NAME = "loop-harness" as const
export const HARNESS_VERSION = 1 as const
export const DEFAULT_STOP_MODE = "full_autopilot" as const
