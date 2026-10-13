import { completeTOnlineAutoAnalysis, syncTOnlineAutoAnalysis } from "@/lib/ai/t-online-auto-analysis-store"
import { requireLocalRequest } from "@/lib/server/request-security"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const denied = requireLocalRequest(request)
  if (denied) return denied
  let body: Record<string, unknown>
  try {
    const value: unknown = await request.json()
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid JSON")
    body = value as Record<string, unknown>
  } catch {
    return Response.json({ ok: false, error: "Ungültige JSON-Daten." }, { status: 400 })
  }
  if (!Array.isArray(body.uids) || body.uids.length > 100 ||
      !body.uids.every(uid => Number.isSafeInteger(uid) && uid > 0) ||
      !["sync", "complete"].includes(String(body.action))) {
    return Response.json({ ok: false, error: "Ungültige Aktion oder UID-Liste (maximal 100)." }, { status: 400 })
  }
  const uids = Array.from(new Set(body.uids as number[]))
  try {
    if (body.action === "sync") {
      return Response.json({ ok: true, ...await syncTOnlineAutoAnalysis(uids) })
    }
    const state = await completeTOnlineAutoAnalysis(uids)
    return Response.json({ ok: true, pendingUids: state.pendingUids, highWatermark: state.highWatermark })
  } catch {
    return Response.json({ ok: false, error: "Auto-Analyse-Status konnte nicht gespeichert werden." }, { status: 500 })
  }
}
