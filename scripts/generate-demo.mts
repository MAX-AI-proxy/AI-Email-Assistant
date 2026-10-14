import { readFile, writeFile, mkdir, unlink } from "node:fs/promises"
import { createHash } from "node:crypto"
import { analyzeMail } from "../src/lib/ai/mail-analyzer"
import { getOpenAI } from "../src/lib/ai/openai"
import type { MailAnalysis, MailAnalysisUsage } from "../src/lib/ai/types"
import emails from "../demo/data/emails.json"

// Run only after explicit approval of at most five paid calls. This journal is private.
if (!process.argv.includes("--approved-five-calls")) throw new Error("Explicit five-call approval flag required")
const journalPath = ".max-ai-data/demo-generation.json"
const fixtureHash = createHash("sha256").update(JSON.stringify(emails)).digest("hex")
type Entry = { uid: number; analysis: MailAnalysis; usage: MailAnalysisUsage; analyzedAt: string }
type Journal = { fixtureHash: string; attempted: number[]; entries: Entry[] }
let journal: Journal = { fixtureHash, attempted: [], entries: [] }
try { journal = JSON.parse(await readFile(journalPath, "utf8")) }
catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error }
if (journal.fixtureHash !== fixtureHash) throw new Error("Fixture changed: existing call budget cannot be reset")
const environment = await readFile(".env.local", "utf8")
const key = environment.match(/^OPENAI_API_KEY\s*=\s*(.+)$/m)?.[1]?.trim().replace(/^(["'])(.*)\1$/, "$2")
if (!key) throw new Error("Local OPENAI_API_KEY is missing")
process.env.OPENAI_API_KEY = key
const client = getOpenAI().withOptions({ maxRetries: 0, timeout: 60_000 })
await mkdir(".max-ai-data", { recursive: true, mode: 0o700 })
for (const email of emails) {
  if (journal.entries.some(entry => entry.uid === email.uid)) continue
  if (journal.attempted.includes(email.uid) || journal.attempted.length >= 5) {
    throw new Error("Five-call budget reserved; a failed attempt cannot be retried automatically")
  }
  journal.attempted.push(email.uid)
  await writeFile(journalPath, JSON.stringify(journal, null, 2), { mode: 0o600 })
  try {
    const result = await analyzeMail({ uid: email.uid, from: email.senderAddress,
      to: email.recipients.map(recipient => recipient.address).join(", "),
      subject: email.subject, date: email.date, text: email.text }, client)
    journal.entries.push({ uid: email.uid, analysis: result.analysis, usage: result.usage,
      analyzedAt: new Date().toISOString() })
    await writeFile(journalPath, JSON.stringify(journal, null, 2), { mode: 0o600 })
    console.log(`Validated sample ${email.uid}/5 (${result.usage.totalTokens} tokens)`)
  } catch (error) {
    // Never print raw SDK errors, headers, response IDs, credentials or request bodies.
    console.error("Generation stopped:", error instanceof Error ? error.name : "UnknownError",
      "status", (error as { status?: number }).status ?? "unavailable")
    process.exitCode = 1
    break
  }
}
if (journal.entries.length === 5) {
  await writeFile("demo/data/analyses.json", JSON.stringify({ version: 1,
    source: "openai-responses-api", fixtureHash, generatedAt: new Date().toISOString(),
    entries: journal.entries }, null, 2) + "\n")
  await unlink(".env.local")
  console.log("Five genuine analyses saved; temporary key file removed. No more API calls.")
}
