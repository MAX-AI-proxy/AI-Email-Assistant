import { requireLocalRequest } from "@/lib/server/request-security"

import { ImapFlow } from "imapflow"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const denied = requireLocalRequest(request)
  if (denied) return denied

  const email = process.env.TU_EMAIL_ADDRESS
  const username = process.env.TU_EMAIL_USERNAME
  const password = process.env.TU_EMAIL_PASSWORD

  if (!email || !username || !password) {
    return Response.json(
      {
        ok: false,
        error: "TU-Zugangsdaten fehlen in .env.local",
      },
      {
        status: 503,
      }
    )
  }

  const client = new ImapFlow({
    host: "mail.tu-braunschweig.de",
    port: 993,
    secure: true,

    auth: {
      user: username,
      pass: password,
    },

    logger: false,
  })

  try {
    await client.connect()

    const inboxStatus = await client.status("INBOX", {
      messages: true,
      unseen: true,
    })

    return Response.json({
      ok: true,
      message: "TU-Mail-Verbindung erfolgreich",
      account: email,

      inbox: {
        messages: inboxStatus.messages ?? 0,
        unseen: inboxStatus.unseen ?? 0,
      },
    })
  } catch {
        return Response.json(
      {
        ok: false,

        error:
           "Unbekannter Fehler bei der TU-Mail-Verbindung",
      },
      {
        status: 500,
      }
    )
  } finally {
    if (client.usable) {
      await client.logout().catch(() => {})
    }
  }
}