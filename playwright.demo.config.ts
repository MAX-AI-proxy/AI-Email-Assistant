import { defineConfig } from "@playwright/test"
export default defineConfig({
  testDir: "tests/demo", workers: 1, fullyParallel: false, timeout: 30_000,
  use: { baseURL: "http://127.0.0.1:3200/AI-Email-Assistant/", viewport: { width: 1600, height: 1100 } },
  webServer: { command: "npm run preview:demo", url: "http://127.0.0.1:3200/AI-Email-Assistant/", reuseExistingServer: false },
})
