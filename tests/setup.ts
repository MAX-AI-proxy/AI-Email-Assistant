import { afterEach, beforeEach, vi } from "vitest"

vi.mock("server-only", () => ({}))
beforeEach(() => {
  // Tests never load .env.local. Fail any accidental external fetch.
  vi.stubGlobal("fetch", vi.fn(() => { throw new Error("Network calls are forbidden in unit tests") }))
})
afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})
