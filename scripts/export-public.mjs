import { mkdir, readFile, writeFile, lstat } from "node:fs/promises"
import { createHash } from "node:crypto"
import path from "node:path"
import { auditPublic, publicFiles } from "./audit-public.mjs"

const source = process.cwd()
const target = path.join(source, "MAX-AI_Public")
// No recursive copy, no Git initialization, no overwrite of an existing export.
const files = await publicFiles()
for (const name of files) {
  if (path.isAbsolute(name) || name.split("/").includes("..")) throw new Error("Invalid allowlist path")
  let prefix = source
  for (const segment of name.split("/")) {
    prefix = path.join(prefix, segment)
    if ((await lstat(prefix)).isSymbolicLink()) throw new Error("Symlinks cannot be exported")
  }
  if (!(await lstat(path.join(source, name))).isFile()) throw new Error(`Missing source file: ${name}`)
}
await mkdir(target, { mode: 0o755 })
const manifest = { version: 1, files: [] }
for (const name of files) {
  const bytes = await readFile(path.join(source, name))
  const destination = path.join(target, name)
  await mkdir(path.dirname(destination), { recursive: true, mode: 0o755 })
  // Writing bytes anew excludes extended attributes and resource forks.
  await writeFile(destination, bytes, { mode: 0o644, flag: "wx" })
  manifest.files.push({ path: name, bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") })
}
await writeFile(path.join(target, "PUBLIC_MANIFEST.json"), JSON.stringify(manifest, null, 2) + "\n", { mode: 0o644, flag: "wx" })
const result = await auditPublic(target)
console.log("Public export created and audited:", target, result)
