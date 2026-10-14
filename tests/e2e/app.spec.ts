import { expect, test } from "@playwright/test"

test("mail entry, missing configuration, real API safeguards and navigation", async ({ page, request }) => {
  await page.goto("/")
  await expect(page).toHaveURL(/\/mail$/)
  await expect(page.getByRole("heading", { name: "Mail", exact: true })).toBeVisible()
  await expect(page.getByText("T-Online Zugangsdaten fehlen in .env.local.", { exact: true })).toBeVisible()
  await page.getByRole("button", { name: /^Uni/ }).click()
  await expect(page.getByText(/TU-Zugangsdaten fehlen\. Trage/)).toBeVisible()
  const links = page.locator("nav a")
  expect(await links.allTextContents()).toEqual(["Mail"])
  const response = await request.get("/api/mail/t-online/messages")
  expect(response.status()).toBe(503)
  expect(response.headers()["cache-control"]).toContain("no-store")
  expect((await request.get("/api/mail/t-online/messages", { headers: { origin: "https://example.test" } })).status()).toBe(403)

})

test("fictional mail, AI results and fast account switch do not show stale content", async ({ page }) => {
  const envelope = { uid: 42, subject: "Fictional invoice", senderName: "Example Sender", senderAddress: "sender@example.test", date: "2026-01-01T12:00:00Z", unread: true }
  await page.route("**/api/**", async route => {
    const pathname = new URL(route.request().url()).pathname
    if (pathname.endsWith("/messages")) return route.fulfill({ json: { ok: true, totalMessages: 1, messages: [envelope] } })
    if (pathname.endsWith("/messages/42")) {
      await new Promise(resolve => setTimeout(resolve, 300))
      return route.fulfill({ json: { ok: true, message: { ...envelope, recipients: [{ name: "Example Recipient", address: "recipient@example.test" }], text: "This is a completely fictional invoice. Please check it by January 10.", attachments: [{ id: 0, filename: "fictional.txt", contentType: "text/plain", size: 20 }] } } })
    }
    if (pathname === "/api/ai/mail/analyze") return route.fulfill({ json: {
      analysis: { summary: "Eine fiktive Rechnung muss geprüft werden.", importance: "Hoch", actionRequired: "Ja", action: "Rechnung prüfen", deadline: "2026-01-10", replyRecommended: "Nein", category: "Rechnung" },
      usage: { model: "gpt-6-luna", inputTokens: 1000, cachedInputTokens: 200, cacheWriteTokens: 100, outputTokens: 100, totalTokens: 1100, estimatedCostUsd: 0.0001345 },
      cached: true, cacheKey: "fictional-cache-key", analyzedAt: "2026-01-01T12:01:00Z",
    } })
    throw new Error(`Unexpected API request: ${pathname}`)
  })
  await page.goto("/mail")
  await page.getByRole("button", { name: /Fictional invoice/ }).click()
  await expect(page.getByText("Eine fiktive Rechnung muss geprüft werden.")).toBeVisible()
  await expect(page.getByText("Rechnung prüfen", { exact: true })).toBeVisible()
  await expect(page.getByText("Hoch", { exact: true })).toBeVisible()
  await expect(page.getByText(/This is a completely fictional invoice/)).toBeVisible()
  await expect(page.getByText("fictional.txt")).toBeVisible()
  await expect(page.getByText(/geschätzte Kosten dieser Analyse/)).toBeVisible()
  await page.getByRole("button", { name: /^Uni/ }).click()
  await expect(page.getByText("Eine fiktive Rechnung muss geprüft werden.")).toHaveCount(0)
  await page.getByRole("button", { name: /^T-Online/ }).click()
  await page.getByRole("button", { name: /Fictional invoice/ }).click()
  await page.getByRole("button", { name: /^Uni/ }).click()
  await page.waitForTimeout(500)
  await expect(page.getByText(/This is a completely fictional invoice/)).toHaveCount(0)
})

test("mobile mail navigation and removed game routes", async ({ page, request }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/mail")
  await page.getByRole("button", { name: "Menü öffnen" }).click()
  await page.getByRole("link", { name: "Mail", exact: true }).click()
  await expect(page.getByRole("heading", { name: "Mail", exact: true })).toBeVisible()
  for (const route of ["/spielwiese", "/spielwiese/sudoku", "/spielwiese/logic-lab"]) {
    expect((await request.get(route)).status()).toBe(404)
  }
})
