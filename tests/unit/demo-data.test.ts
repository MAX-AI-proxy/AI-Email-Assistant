import { expect, test } from "vitest"
import { createHash } from "node:crypto"
import { validateAnalysis } from "../../src/lib/ai/mail-analyzer"
import emails from "../../demo/data/emails.json"
import results from "../../demo/data/analyses.json"

test("demo contains five fictional messages bound to five validated recorded API results", () => {
  expect(emails).toHaveLength(5)
  expect(results.entries).toHaveLength(5)
  expect(results.source).toBe("openai-responses-api")
  expect(results.fixtureHash).toBe(createHash("sha256").update(JSON.stringify(emails)).digest("hex"))
  expect(new Set(results.entries.map(entry => entry.uid)).size).toBe(5)
  for (const email of emails) {
    expect(email.senderAddress).toMatch(/@example\.com$/)
    expect(email.recipients.every(recipient => recipient.address.endsWith("@example.com"))).toBe(true)
    expect(email.attachments).toEqual([])
    const entry = results.entries.find(entry => entry.uid === email.uid)!
    expect(validateAnalysis(entry.analysis)).toEqual(entry.analysis)
    expect(entry.usage.totalTokens).toBe(entry.usage.inputTokens + entry.usage.outputTokens)
    expect(entry.usage.totalTokens).toBeGreaterThan(0)
  }
})
