import { execFile } from "node:child_process"
import { promisify } from "node:util"
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { auditPublic } from "./audit-public.mjs"
const exec = promisify(execFile)
const root = await mkdtemp(path.join(os.tmpdir(), "ai-email-staging-"))
try {
  const { stdout } = await exec("git", ["ls-files", "--stage", "-z"])
  const names = []
  for (const record of stdout.split("\0").filter(Boolean)) {
    const match = record.match(/^(\d+) ([a-f0-9]+) (\d)\t(.+)$/s)
    if (!match || match[1] !== "100644" || match[3] !== "0") throw new Error("Unapproved Git mode or unresolved index entry")
    const name = match[4]
    if (path.isAbsolute(name) || name.split("/").includes("..")) throw new Error("Invalid Git path")
    const { stdout: bytes } = await exec("git", ["show", `:${name}`], { encoding: "buffer", maxBuffer: 20_000_000 })
    await mkdir(path.dirname(path.join(root, name)), { recursive: true })
    await writeFile(path.join(root, name), bytes)
    names.push(name)
  }
  // Bind the scanner's allowlist to the actual index as well.
  if (!(await readFile(path.join(root, "scripts/public-files.json"))).equals(await readFile("scripts/public-files.json"))) throw new Error("Staged allowlist differs from audited allowlist")
  const result = await auditPublic(root)
  console.log("Actual Git index audited:", result, `${names.length} blobs, no credentials or private mail data detected`)
} finally { await rm(root, { recursive: true, force: true }) }
