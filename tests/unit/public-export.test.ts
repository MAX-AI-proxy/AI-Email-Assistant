import { afterEach, beforeEach, expect, test } from "vitest"
import { mkdtemp, mkdir, readFile, writeFile, rm, symlink } from "node:fs/promises"
import path from "node:path"
import os from "node:os"
import { createHash } from "node:crypto"
import { auditPublic, publicFiles, validateScreenshot } from "../../scripts/audit-public.mjs"
let temp: string
beforeEach(async () => {
  temp = await mkdtemp(path.join(os.tmpdir(), "max-ai-export-test-"))
  const manifest = { version: 1, files: [] as { path: string; bytes: number; sha256: string }[] }
  for (const name of await publicFiles()) {
    const bytes = await readFile(path.resolve(name))
    await mkdir(path.dirname(path.join(temp, name)), { recursive: true })
    await writeFile(path.join(temp, name), bytes)
    manifest.files.push({ path: name, bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") })
  }
  await writeFile(path.join(temp, "PUBLIC_MANIFEST.json"), JSON.stringify(manifest))
})
afterEach(async () => { await rm(temp, { recursive: true, force: true }) })

test("clean allowlisted export passes its independent checksum audit", async () => {
  expect((await auditPublic(temp)).allowlisted).toBe((await publicFiles()).length)
})
test.each([".env.local", ".git", ".max-ai-data", "node_modules", ".next", ".DS_Store"])("rejects forbidden export entry %s", async name => {
  await writeFile(path.join(temp, name), "fictional private data")
  await expect(auditPublic(temp)).rejects.toThrow("outside public allowlist")
})
test("rejects likely tokens without showing their value", async () => {
  const token = "sk-" + "a".repeat(64)
  await writeFile(path.join(temp, "README.md"), token)
  try { await auditPublic(temp); throw new Error("Audit should reject token") }
  catch (error) {
    expect(String(error)).toContain("likely API token")
    expect(String(error)).not.toContain(token)
  }
})
test("rejects non-example email addresses and unreviewed binaries", async () => {
  await writeFile(path.join(temp, "README.md"), "person@" + "private.invalid")
  await expect(auditPublic(temp)).rejects.toThrow("non-example email address")
  await writeFile(path.join(temp, "README.md"), Buffer.from([0, 1, 2]))
  await expect(auditPublic(temp)).rejects.toThrow("unreviewed binary content")
})
test("rejects symlinks and changed manifest content", async () => {
  await symlink(path.join(temp, "README.md"), path.join(temp, "unexpected-link"))
  await expect(auditPublic(temp)).rejects.toThrow("symbolic link")
  await rm(path.join(temp, "unexpected-link"))
  await writeFile(path.join(temp, "README.md"), "Changed public document")
  await expect(auditPublic(temp)).rejects.toThrow("checksum mismatch")
})

test("only reviewed screenshots accept PNG pixels; metadata and corrupt files are rejected", async () => {
  const pixels = await readFile("docs/screenshots/inbox.png")
  expect(() => validateScreenshot(pixels)).not.toThrow()
  const metadataChunk = Buffer.concat([Buffer.from([0, 0, 0, 0]), Buffer.from("tEXt"), Buffer.alloc(4)])
  const withMetadata = Buffer.concat([pixels.subarray(0, 33), metadataChunk, pixels.subarray(33)])
  await writeFile(path.join(temp, "docs/screenshots/inbox.png"), withMetadata)
  await expect(auditPublic(temp)).rejects.toThrow("invalid PNG or embedded metadata")
  const corrupt = Buffer.from(pixels)
  corrupt[40] ^= 1
  expect(() => validateScreenshot(corrupt)).toThrow()
  await writeFile(path.join(temp, "README.md"), pixels)
  await expect(auditPublic(temp)).rejects.toThrow("unreviewed binary content")
})
