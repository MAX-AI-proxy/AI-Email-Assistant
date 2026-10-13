import "server-only"
import { createHash } from "node:crypto"
import path from "node:path"

// Keep different users' caches and automatic-analysis baselines separate.
// Account addresses never appear in file names.
export function getDataDirectory() {
  const account = (process.env.T_ONLINE_EMAIL ?? "unconfigured").trim().toLowerCase()
  const scope = createHash("sha256").update(account).digest("hex")
  return path.join(process.cwd(), ".max-ai-data", scope)
}
