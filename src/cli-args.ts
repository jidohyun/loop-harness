import { CliUsageError } from "./errors"
import { type Stage, StageSchema, type StopMode } from "./schemas"

export type CliCommand =
  | {
      readonly kind: "start"
      readonly task: string
      readonly stopBefore: Stage | null
      readonly json: boolean
    }
  | { readonly kind: "advance"; readonly through: Stage; readonly json: boolean }
  | {
      readonly kind: "record"
      readonly stage: Stage
      readonly evidence: string
      readonly json: boolean
    }
  | { readonly kind: "status"; readonly json: boolean }

export function parseCliCommand(argv: readonly string[]): CliCommand {
  const args = argv.slice(2)
  const command = args[0]

  switch (command) {
    case "start":
      return parseStart(args.slice(1))
    case "advance":
      return parseAdvance(args.slice(1))
    case "record":
      return parseRecord(args.slice(1))
    case "status":
      return { kind: "status", json: args.includes("--json") }
    case undefined:
      throw new CliUsageError("missing command: start | advance | record | status")
    default:
      throw new CliUsageError(`unknown command: ${command}`)
  }
}

export function stopModeFromStopBefore(stage: Stage | null): StopMode {
  if (stage === null) {
    return "full_autopilot"
  }
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

function parseStart(args: readonly string[]): CliCommand {
  const options = parseOptions(args, ["--task", "--stop-before"])
  const task = options.values["--task"]
  if (task === undefined || task.trim().length === 0) {
    throw new CliUsageError("start requires --task <text>")
  }

  return {
    kind: "start",
    task,
    stopBefore: parseOptionalStage(options.values["--stop-before"]),
    json: options.json,
  }
}

function parseAdvance(args: readonly string[]): CliCommand {
  const options = parseOptions(args, ["--through"])
  const through = options.values["--through"]
  if (through === undefined) {
    throw new CliUsageError("advance requires --through <stage>")
  }

  return { kind: "advance", through: parseStage(through), json: options.json }
}

function parseRecord(args: readonly string[]): CliCommand {
  const stageToken = args[0]
  if (stageToken === undefined) {
    throw new CliUsageError("record requires a stage")
  }
  const options = parseOptions(args.slice(1), ["--evidence"])
  const evidence = options.values["--evidence"]
  if (evidence === undefined || evidence.trim().length === 0) {
    throw new CliUsageError("record requires --evidence <path>")
  }

  return { kind: "record", stage: parseStage(stageToken), evidence, json: options.json }
}

function parseOptionalStage(value: string | undefined): Stage | null {
  if (value === undefined) {
    return null
  }
  return parseStage(value)
}

function parseStage(value: string): Stage {
  return StageSchema.parse(value)
}

function parseOptions(
  args: readonly string[],
  valueFlags: readonly string[],
): { readonly values: Record<string, string>; readonly json: boolean } {
  const values: Record<string, string> = {}
  let json = false
  let index = 0

  while (index < args.length) {
    const token = args[index]
    if (token === undefined) {
      break
    }

    if (token === "--json") {
      json = true
      index += 1
      continue
    }

    if (valueFlags.includes(token)) {
      const value = args[index + 1]
      if (value === undefined) {
        throw new CliUsageError(`${token} requires a value`)
      }
      values[token] = value
      index += 2
      continue
    }

    throw new CliUsageError(`unknown option: ${token}`)
  }

  return { values, json }
}

function assertNever(value: never): never {
  throw new Error(`unexpected value: ${String(value)}`)
}
