export class CliUsageError extends Error {
  readonly name = "CliUsageError"

  constructor(readonly detail: string) {
    super(detail)
  }
}

export class MissingStateError extends Error {
  readonly name = "MissingStateError"

  constructor(readonly statePath: string) {
    super(`loop state not found at ${statePath}; run loop-harness start first`)
  }
}
