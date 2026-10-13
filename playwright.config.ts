import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  use: { baseURL: "http://127.0.0.1:3100", viewport: { width: 1440, height: 1000 } },
  webServer: {
    command: "npm run start -- --port 3100",
    url: "http://127.0.0.1:3100/mail",
    reuseExistingServer: false,
    env: {
      T_ONLINE_EMAIL: "", T_ONLINE_APP_PASSWORD: "",
      TU_EMAIL_ADDRESS: "", TU_EMAIL_USERNAME: "", TU_EMAIL_PASSWORD: "",
      OPENAI_API_KEY: "", MAX_AI_AUTO_ANALYSIS: "false",
    },
  },
})
