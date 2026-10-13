import { requireLocalRequest } from "@/lib/server/request-security"

import { ImapFlow } from "imapflow"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const denied = requireLocalRequest(request)
  if (denied) return denied

  const email = process.env.T_ONLINE_EMAIL
  const password = process.env.T_ONLINE_APP_PASSWORD

  if (!email || !password) {
    return Response.json(
      {
        ok: false,
        error: "T-Online-Zugangsdaten fehlen in .env.local",
      },
      { status: 503 }
    )
  }

  const client = new ImapFlow({
    host: "secureimap.t-online.de",
    port: 993,
    secure: true,
    auth: {
      user: email,
      pass: password,
    },
    logger: false,
  })

  try {
    await client.connect()

    const inbox = await client.status("INBOX", {
      messages: true,
      unseen: true,
    })

    return Response.json({
      ok: true,
      message: "T-Online-Verbindung erfolgreich",
      inbox: {
        messages: inbox.messages ?? 0,
        unseen: inbox.unseen ?? 0,
      },
    })
  } catch {
        return Response.json(
      {
        ok: false,
        error:
           "Unbekannter Fehler bei der T-Online-Verbindung",
      },
      { status: 500 }
    )
  } finally {
    if (client.usable) {
      await client.logout().catch(() => {})
    }
  }
}