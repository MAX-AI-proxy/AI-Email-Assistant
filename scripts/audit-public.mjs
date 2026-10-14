import { readFile, readdir, lstat } from "node:fs/promises"
import { createHash } from "node:crypto"
import path from "node:path"
import { pathToFileURL } from "node:url"

const listPath = new URL("./public-files.json", import.meta.url)
export async function publicFiles() { return JSON.parse(await readFile(listPath, "utf8")) }

// Only these manually reviewed screenshots are binary publishable assets.
const screenshots = new Set(["docs/screenshots/inbox.png", "docs/screenshots/analysis.png", "docs/screenshots/mobile.png"])
export function validateScreenshot(bytes) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  if (!bytes.subarray(0, 8).equals(signature)) throw new Error("Invalid PNG signature")
  let offset = 8
  const chunks = []
  while (offset < bytes.length) {
    if (offset + 12 > bytes.length) throw new Error("Truncated PNG")
    const length = bytes.readUInt32BE(offset)
    const type = bytes.toString("ascii", offset + 4, offset + 8)
    if (!["IHDR", "IDAT", "IEND"].includes(type)) throw new Error("PNG metadata or unapproved chunk")
    if (offset + length + 12 > bytes.length) throw new Error("Truncated PNG chunk")
    // Verify CRC to reject damaged or disguised content.
    let crc = 0xffffffff
    for (const byte of bytes.subarray(offset + 4, offset + 8 + length)) {
      crc ^= byte
      for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0)
    }
    if (((crc ^ 0xffffffff) >>> 0) !== bytes.readUInt32BE(offset + 8 + length)) throw new Error("Invalid PNG CRC")
    if (type === "IHDR" && (length !== 13 || bytes.readUInt32BE(offset + 8) > 4000 || bytes.readUInt32BE(offset + 12) > 4000)) throw new Error("Invalid screenshot dimensions")
    if (type === "IEND" && length !== 0) throw new Error("Invalid PNG end")
    chunks.push(type)
    offset += length + 12
  }
  if (chunks[0] !== "IHDR" || chunks.filter(type => type === "IHDR").length !== 1 || chunks.at(-1) !== "IEND" || chunks.filter(type => type === "IEND").length !== 1 || !chunks.includes("IDAT")) throw new Error("Invalid PNG structure")
}

export async function auditPublic(root, { requireManifest = true } = {}) {
  const allowed = new Set(await publicFiles())
  const failures = []
  const files = []
  async function walk(relative = "") {
    for (const item of await readdir(path.join(root, relative), { withFileTypes: true })) {
      const name = relative ? `${relative}/${item.name}` : item.name
      if (item.isSymbolicLink()) { failures.push(`${name}: symbolic link`); continue }
      if (item.isDirectory()) {
        if (![...allowed].some(file => file.startsWith(`${name}/`))) {
          failures.push(`${name}: directory outside public allowlist`); continue
        }
        await walk(name)
      } else if (item.isFile()) files.push(name)
      else failures.push(`${name}: unsupported filesystem entry`)
    }
  }
  await walk()
  for (const name of files) {
    if (name === "PUBLIC_MANIFEST.json") continue
    if (!allowed.has(name)) { failures.push(`${name}: file outside public allowlist`); continue }
    const bytes = await readFile(path.join(root, name))
    if (screenshots.has(name)) {
      try { validateScreenshot(bytes) } catch { failures.push(`${name}: invalid PNG or embedded metadata`) }
      continue
    }
    if (bytes.includes(0)) { failures.push(`${name}: unreviewed binary content`); continue }
    const text = bytes.toString("utf8")
    const patterns = [
      ["likely API token", /\b(?:sk-|ghp_|github_pat_|xox[baprs]-)[A-Za-z0-9_-]{16,}/g],
      ["private key material", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g],
      ["personal filesystem path", /\/(?:Users|home)\/[a-zA-Z][a-zA-Z0-9_.-]*\//g],
      ["non-example email address", /[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi],
    ]
    for (const [kind, expression] of patterns) for (const match of text.matchAll(expression)) {
      if (kind === "non-example email address" && /@(example\.(test|com|org)|localhost)$/i.test(match[0])) continue
      const line = text.slice(0, match.index).split("\n").length
      failures.push(`${name}:${line}: ${kind}`)
    }
    if (name === ".env.example") {
      for (const line of text.split("\n")) {
        if (/^[A-Z_]*(PASSWORD|API_KEY|USERNAME|EMAIL)[A-Z_]*=.+/.test(line)) failures.push(`${name}: credential template is not empty`)
      }
    }
  }
  for (const name of allowed) if (!files.includes(name)) failures.push(`${name}: missing required public file`)
  const manifestPath = path.join(root, "PUBLIC_MANIFEST.json")
  if (requireManifest) {
    try {
      const manifest = JSON.parse(await readFile(manifestPath, "utf8"))
      if (manifest.version !== 1 || !Array.isArray(manifest.files)) throw new Error("Invalid manifest")
      const recorded = new Set()
      for (const entry of manifest.files) {
        if (!allowed.has(entry.path) || recorded.has(entry.path)) { failures.push("Manifest: unapproved or duplicate path"); continue }
        recorded.add(entry.path)
        const bytes = await readFile(path.join(root, entry.path))
        if (bytes.length !== entry.bytes || createHash("sha256").update(bytes).digest("hex") !== entry.sha256) failures.push(`${entry.path}: manifest checksum mismatch`)
      }
      if (recorded.size !== allowed.size) failures.push("Manifest: incomplete file inventory")
    } catch { failures.push("Manifest: missing or invalid") }
  }
  if (failures.length) throw new Error(`Public audit failed:\n${failures.join("\n")}`)
  return { files: files.length, allowlisted: allowed.size }
}

// Separate invocation performs a fresh traversal of the completed public folder.
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const root = path.resolve(process.argv[2] ?? "MAX-AI_Public")
  if (!(await lstat(root)).isDirectory()) throw new Error("Expected a public directory")
  console.log("Public audit passed:", await auditPublic(root))
}
