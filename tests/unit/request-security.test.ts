import { expect, test } from "vitest"
import { requireLocalRequest } from "@/lib/server/request-security"

test("accepts Next.js internal localhost normalization with the browser's local Host", () => {
  expect(requireLocalRequest(new Request("http://localhost:3100/api/mail", {
    headers: { host: "127.0.0.1:3100", origin: "http://127.0.0.1:3100", "sec-fetch-site": "same-origin" },
  }))).toBeNull()
})

test.each(["http://localhost:3000", "http://127.0.0.1:3000", "http://[::1]:3000"])("allows local origin %s", origin => {
  expect(requireLocalRequest(new Request(`${origin}/api/mail`, { headers: { origin, "sec-fetch-site": "same-origin" } }))).toBeNull()
})
test.each([
  ["https://example.test", {}],
  ["http://127.0.0.1:3000", { origin: "https://example.test" }],
  ["http://127.0.0.1:3000", { host: "example.test" }],
  ["http://127.0.0.1:3000", { origin: "null" }],
  ["http://127.0.0.1:3000", { "sec-fetch-site": "cross-site" }],
  ["http://localhost:3000", { origin: "http://localhost:4000" }],
] as [string, Record<string, string>][])("rejects remote or mismatched request %s %j", (origin, headers) => {
  expect(requireLocalRequest(new Request(`${origin}/api/mail`, { headers }))?.status).toBe(403)
})
