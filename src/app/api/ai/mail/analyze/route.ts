import { analyzeMail } from "@/lib/ai/mail-analyzer"
import {
  createMailCacheKey, getCachedMailAnalysis, logMailAnalysisUsage, saveMailAnalysis,
} from "@/lib/ai/mail-analysis-store"
import { requireLocalRequest } from "@/lib/server/request-security"
import type { AnalyzeMailResponse, MailForAnalysis } from "@/lib/ai/types"

export const runtime = "nodejs"
const runningAnalyses = new Map<string, Promise<AnalyzeMailResponse>>()
const MAX_BODY_BYTES = 500_000

function isValidMail(mail: unknown): mail is MailForAnalysis {
  if (!mail || typeof mail !== "object") return false
  const value = mail as Record<string, unknown>
  return ["from", "subject", "date", "text"].every(key => typeof value[key] === "string") &&
    (value.to === undefined || typeof value.to === "string") &&
    (value.uid === undefined || (typeof value.uid === "number" && Number.isSafeInteger(value.uid) && value.uid > 0)) &&
    (value.text as string).length <= 100_000 &&
    ["from", "to", "subject", "date"].every(key => value[key] === undefined || (value[key] as string).length <= 4_000)
}

async function createAnalysis(mail: MailForAnalysis, cacheKey: string): Promise<AnalyzeMailResponse> {
  const result = await analyzeMail(mail)
  const analyzedAt = new Date().toISOString()
  const response: AnalyzeMailResponse = {
    analysis: result.analysis, usage: result.usage, cached: false, cacheKey, analyzedAt,
  }
  await saveMailAnalysis(cacheKey, response)
  await logMailAnalysisUsage({ cacheKey, responseId: result.responseId, analyzedAt, response })
  return response
}

export async function POST(request: Request) {
  const denied = requireLocalRequest(request)
  if (denied) return denied
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return Response.json({ error: "JSON-Daten erforderlich." }, { status: 415 })
  }
  // Bound actual body consumption even if Content-Length is omitted or incorrect.
  const reader = request.body?.getReader()
  if (!reader) return Response.json({ error: "Ungültige Mail-Daten." }, { status: 400 })
  const chunks: Uint8Array[] = []
  let size = 0
  let body: Record<string, unknown>
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > MAX_BODY_BYTES) {
        await reader.cancel()
        return Response.json({ error: "Mail-Daten sind zu groß." }, { status: 413 })
      }
      chunks.push(value)
    }
    const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"))
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid JSON")
    body = parsed as Record<string, unknown>
  } catch {
    return Response.json({ error: "Ungültige JSON-Daten." }, { status: 400 })
  } finally {
    reader.releaseLock()
  }
  if (body.account !== "t-online") {
    return Response.json({ error: "Die AI-Analyse ist nur für T-Online aktiviert." }, { status: 400 })
  }
  if (!isValidMail(body.mail)) {
    return Response.json({ error: "Ungültige Mail-Daten. Maximal 100.000 Zeichen Text." }, { status: 400 })
  }
  try {
    const cacheKey = createMailCacheKey(body.mail)
    const cached = await getCachedMailAnalysis(cacheKey)
    if (cached) return Response.json({ ...cached, cached: true })
    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ error: "OPENAI_API_KEY fehlt. Trage deinen eigenen API-Key in .env.local ein und starte AI Email Assistant neu." }, { status: 503 })
    }
    const existing = runningAnalyses.get(cacheKey)
    if (existing) return Response.json({ ...await existing, cached: true })
    const job = createAnalysis(body.mail, cacheKey)
    runningAnalyses.set(cacheKey, job)
    try {
      return Response.json(await job)
    } finally {
      runningAnalyses.delete(cacheKey)
    }
  } catch {
    // Provider errors may include request bodies, credentials, or mail contents.
    return Response.json({ error: "Die AI-Analyse konnte nicht durchgeführt werden. Prüfe API-Key, Modellzugriff und Verbindung." }, { status: 502 })
  }
}
