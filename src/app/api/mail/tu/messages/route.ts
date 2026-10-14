import { requireLocalRequest } from "@/lib/server/request-security"

import { ImapFlow } from "imapflow"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function toISOStringSafe(value: unknown): string | null {
  if (!value) {
    return null
  }

  const date =
    value instanceof Date
      ? value
      : new Date(String(value))

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date.toISOString()
}

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
        error: "TU-Zugangsdaten fehlen. Trage TU_EMAIL_ADDRESS, TU_EMAIL_USERNAME und TU_EMAIL_PASSWORD in .env.local ein und starte AI Email Assistant neu.",
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
    })

    const totalMessages = inboxStatus.messages ?? 0

    if (totalMessages === 0) {
      return Response.json({
        ok: true,
        account: "Uni",
        totalMessages: 0,
        messages: [],
      })
    }

    const lock = await client.getMailboxLock("INBOX", {
      readOnly: true,
    })

    try {
      const amount = 20

      const firstMessage = Math.max(
        1,
        totalMessages - amount + 1
      )

      const range = `${firstMessage}:${totalMessages}`

      const fetchedMessages = await client.fetchAll(
        range,
        {
          uid: true,
          envelope: true,
          flags: true,
          internalDate: true,
        }
      )

      const messages = fetchedMessages
        .map((message) => {
          const sender =
            message.envelope?.from?.[0]

          const messageDate =
            message.envelope?.date ??
            message.internalDate ??
            null

          return {
            uid: message.uid,

            subject:
              message.envelope?.subject ||
              "(Kein Betreff)",

            senderName:
              sender?.name ||
              sender?.address ||
              "Unbekannter Absender",

            senderAddress:
              sender?.address || "",

            date: toISOStringSafe(messageDate),

            unread:
              !message.flags?.has("\\Seen"),
          }
        })
        .reverse()

      return Response.json({
        ok: true,
        account: "Uni",
        totalMessages,
        messages,
      })
    } finally {
      lock.release()
    }
  } catch {
        return Response.json(
      {
        ok: false,

        error:
           "Unbekannter Fehler beim Abrufen der TU-Mails.",
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