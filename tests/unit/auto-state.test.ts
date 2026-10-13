import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { mkdtemp, rm } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
let temp: string
beforeEach(async () => {
  vi.resetModules()
  temp = await mkdtemp(path.join(os.tmpdir(), "max-ai-state-"))
  vi.spyOn(process, "cwd").mockReturnValue(temp)
  vi.stubEnv("T_ONLINE_EMAIL", "one@example.test")
})
afterEach(async () => { await rm(temp, { recursive: true, force: true }) })

test("first run creates a baseline; only newer UIDs become pending and failures survive retry", async () => {
  const { syncTOnlineAutoAnalysis: sync, completeTOnlineAutoAnalysis: complete } = await import("@/lib/ai/t-online-auto-analysis-store")
  expect(await sync([3, 1, 2, 3])).toMatchObject({ initializedNow: true, baselineCount: 3, highWatermark: 3, pendingUids: [] })
  expect(await sync([2, 3, 4, 5])).toMatchObject({ initializedNow: false, highWatermark: 5, pendingUids: [4, 5] })
  await complete([4])
  expect((await sync([2, 3, 4, 5])).pendingUids).toEqual([5])
  expect((await sync([1, 2])).pendingUids).toEqual([])
  expect((await sync([2, 3])).pendingUids).toEqual([])
})

test("an initially empty inbox detects its first arrival", async () => {
  const { syncTOnlineAutoAnalysis: sync } = await import("@/lib/ai/t-online-auto-analysis-store")
  expect((await sync([])).pendingUids).toEqual([])
  expect((await sync([1])).pendingUids).toEqual([1])
})

test("separate account configurations have separate baselines", async () => {
  const one = await import("@/lib/ai/t-online-auto-analysis-store")
  await one.syncTOnlineAutoAnalysis([100])
  vi.stubEnv("T_ONLINE_EMAIL", "two@example.test"); vi.resetModules()
  const two = await import("@/lib/ai/t-online-auto-analysis-store")
  expect(await two.syncTOnlineAutoAnalysis([1])).toMatchObject({ initializedNow: true, highWatermark: 1, pendingUids: [] })
})

test.each([null, {}, { action: "delete", uids: [1] }, { action: "sync", uids: ["1"] }, { action: "sync", uids: [-1] }, { action: "sync", uids: Array(101).fill(1) }])("state API rejects malformed input: %j", async body => {
  const { POST } = await import("@/app/api/ai/mail/auto-state/route")
  const request = new Request("http://127.0.0.1:3000/api/ai/mail/auto-state", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) })
  expect((await POST(request)).status).toBe(400)
})
