import { readFile } from "node:fs/promises"
import { createHash } from "node:crypto"
import { validateAnalysis } from "../src/lib/ai/mail-analyzer"
import emails from "../demo/data/emails.json"
const data = JSON.parse(await readFile("demo/data/analyses.json", "utf8"))
if (emails.length !== 5 || data.version !== 1 || data.source !== "openai-responses-api" ||
    data.fixtureHash !== createHash("sha256").update(JSON.stringify(emails)).digest("hex") ||
    data.entries.length !== 5) throw new Error("Five genuine, fixture-bound analyses required")
const ids = new Set<number>()
for (const entry of data.entries) {
  if (ids.has(entry.uid) || !emails.some(mail => mail.uid === entry.uid)) throw new Error("Invalid sample mapping")
  ids.add(entry.uid)
  validateAnalysis(entry.analysis)
  if (!Number.isFinite(Date.parse(entry.analyzedAt)) || entry.usage.model !== "gpt-6-luna") throw new Error("Missing generation metadata")
  for (const field of ["inputTokens", "cachedInputTokens", "cacheWriteTokens", "outputTokens", "totalTokens", "estimatedCostUsd"]) {
    if (!Number.isFinite(entry.usage[field]) || entry.usage[field] < 0) throw new Error("Invalid recorded usage")
  }
  if (entry.usage.totalTokens <= 0) throw new Error("No recorded token usage")
}
console.log("Five genuine demo records validated without API calls")
