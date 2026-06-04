import { mkdtemp, readFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import type { z } from "zod"

const cliPath = new URL("../bin/loop-harness.ts", import.meta.url).pathname

export type CliResult = {
  readonly exitCode: number
  readonly stdout: string
  readonly stderr: string
}

export async function makeTempWorkspace(prefix: string): Promise<string> {
  return mkdtemp(join(tmpdir(), prefix))
}

export async function runCli(cwd: string, args: readonly string[]): Promise<CliResult> {
  const proc = Bun.spawn(["bun", "run", cliPath, ...args], {
    cwd,
    stdout: "pipe",
    stderr: "pipe",
  })

  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ])

  return { exitCode, stdout, stderr }
}

export function parseJson<T>(stdout: string, schema: z.ZodType<T>): T {
  return schema.parse(JSON.parse(stdout))
}

export async function readJsonl<T>(path: string, schema: z.ZodType<T>): Promise<readonly T[]> {
  const text = await readFile(path, "utf8")
  return text
    .trim()
    .split("\n")
    .filter((line) => line.length > 0)
    .map((line) => schema.parse(JSON.parse(line)))
}
