import { parseCliCommand, stopModeFromStopBefore } from "./cli-args"
import { advanceLoop, readLoopStatus, recordEvidence, startLoop } from "./commands"
import { CliUsageError, MissingStateError } from "./errors"

export async function run(argv: readonly string[], cwd: string): Promise<void> {
  const command = parseCliCommand(argv)
  const now = new Date().toISOString()

  switch (command.kind) {
    case "start":
      printOutput(
        await startLoop({
          cwd,
          task: command.task,
          selectedStopMode: stopModeFromStopBefore(command.stopBefore),
          now,
        }),
        command.json,
      )
      return
    case "advance":
      printOutput(await advanceLoop({ cwd, through: command.through, now }), command.json)
      return
    case "record":
      printOutput(
        await recordEvidence({ cwd, stage: command.stage, evidence: command.evidence, now }),
        command.json,
      )
      return
    case "status":
      printOutput(await readLoopStatus({ cwd }), command.json)
      return
    default:
      return assertNever(command)
  }
}

export function printError(error: unknown): void {
  if (error instanceof CliUsageError || error instanceof MissingStateError) {
    console.error(error.message)
    process.exitCode = 1
    return
  }
  if (error instanceof Error) {
    console.error(error.message)
    process.exitCode = 1
    return
  }
  console.error("unknown error")
  process.exitCode = 1
}

function printOutput(value: Record<string, unknown>, json: boolean): void {
  if (json) {
    console.log(JSON.stringify(value))
    return
  }
  console.log(JSON.stringify(value, null, 2))
}

function assertNever(value: never): never {
  throw new Error(`unexpected command: ${String(value)}`)
}
