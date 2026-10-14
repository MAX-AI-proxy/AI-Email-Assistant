import { test, expect } from "@playwright/test"
import emails from "../../demo/data/emails.json"
import recorded from "../../demo/data/analyses.json"

test("all five emails show their genuine saved analysis without API requests", async ({ page }) => {
  const requests: string[] = []
  const errors: string[] = []
  page.on("request", request => requests.push(request.url()))
  page.on("pageerror", error => errors.push(error.message))
  await page.goto("./")
  await expect(page.getByRole("status")).toContainText("Demo Mode – Sample Emails")
  for (const email of emails) {
    await page.getByRole("button", { name: new RegExp(email.subject.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) }).click()
    const reader = page.getByRole("region", { name: "Mailansicht" })
    await expect(reader).toContainText(email.text)
    await expect(reader).toContainText(email.senderAddress)
    await page.getByRole("button", { name: "Aufgezeichnete KI-Analyse öffnen" }).click()
    const result = recorded.entries.find(entry => entry.uid === email.uid)!
    for (const value of Object.values(result.analysis).filter(value => value !== "-")) await expect(reader).toContainText(value)
    await expect(reader).toContainText(`${result.usage.totalTokens.toLocaleString("de-DE")} Tokens`)
    await page.getByRole("button", { name: "KI-Analyse schließen" }).click()
    await expect(reader.getByText(result.analysis.summary)).toHaveCount(0)
  }
  expect(requests.every(url => new URL(url).origin === "http://127.0.0.1:3200" && !new URL(url).pathname.includes("/api/"))).toBe(true)
  expect(errors).toEqual([])
})

test("mobile switching, reader back navigation and menu", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("./")
  for (const email of emails) {
    await page.getByRole("button", { name: new RegExp(email.subject.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) }).click()
    await page.getByRole("button", { name: "Aufgezeichnete KI-Analyse öffnen" }).click()
    await expect(page.getByText(recorded.entries.find(entry => entry.uid === email.uid)!.analysis.summary)).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    await page.getByRole("button", { name: "Zur Mailübersicht" }).click()
  }
  await page.getByRole("button", { name: "Menü öffnen" }).click()
  await page.getByRole("link", { name: "Mail", exact: true }).click()
  await expect(page.getByRole("region", { name: "Mailübersicht" })).toBeVisible()
})

test("capture real demo screenshots", async ({ page }) => {
  test.skip(process.env.CAPTURE_DEMO_SCREENSHOTS !== "true", "Screenshots are captured explicitly for reviewed documentation")
  await page.goto("./")
  await expect(page.getByRole("button", { name: /Freigabe für Beispielprojekt/ })).toBeVisible()
  await page.screenshot({ path: "docs/screenshots/inbox.png", fullPage: true })
  await page.getByRole("button", { name: /Freigabe für Beispielprojekt/ }).click()
  await page.getByRole("button", { name: "Aufgezeichnete KI-Analyse öffnen" }).click()
  await expect(page.getByText(recorded.entries[0].analysis.summary)).toBeVisible()
  await page.screenshot({ path: "docs/screenshots/analysis.png", fullPage: true })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.reload()
  await page.getByRole("button", { name: /Freigabe für Beispielprojekt/ }).click()
  await page.getByRole("button", { name: "Aufgezeichnete KI-Analyse öffnen" }).click()
  await expect(page.getByText(recorded.entries[0].analysis.summary)).toBeVisible()
  await expect.poll(() => page.getByRole("complementary", { name: "Hauptnavigation" }).evaluate(element => element.getBoundingClientRect().right)).toBeLessThanOrEqual(0)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({ path: "docs/screenshots/mobile.png", fullPage: true })
})
