#!/usr/bin/env bun
import { printError, run } from "../src/cli"

try {
  await run(process.argv, process.cwd())
} catch (error) {
  if (error instanceof Error) {
    printError(error)
  } else {
    printError(error)
  }
}
