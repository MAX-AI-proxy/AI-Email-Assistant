import { readFile, writeFile } from "node:fs/promises"
import { createHash } from "node:crypto"
import { publicFiles } from "./audit-public.mjs"
const files = []
for (const path of await publicFiles()) {
  const bytes = await readFile(path)
  files.push({ path, bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") })
}
await writeFile("PUBLIC_MANIFEST.json", JSON.stringify({ version: 1, files }, null, 2) + "\n")
console.log(`Manifest updated for ${files.length} allowlisted files`)
