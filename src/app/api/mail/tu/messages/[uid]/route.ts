import { requireLocalRequest } from "@/lib/server/request-security"

import { ImapFlow } from "imapflow"
import { simpleParser } from "mailparser"

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

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ uid: string }>
  }
) {
  const denied = requireLocalRequest(request)
  if (denied) return denied

  const email = process.env.TU_EMAIL_ADDRESS
  const username = process.env.TU_EMAIL_USERNAME
  const password = process.env.TU_EMAIL_PASSWORD

  if (!email || !username || !password) {
    return Response.json(
      {
        ok: false,
        error: "TU-Zugangsdaten fehlen. Trage TU_EMAIL_ADDRESS, TU_EMAIL_USERNAME und TU_EMAIL_PASSWORD in .env.local ein und starte MAX AI neu.",
      },
      {
        status: 503,
      }
    )
  }

  const { uid: uidString } = await params

  const uid = Number(uidString)

  if (!Number.isSafeInteger(uid) || uid <= 0) {
    return Response.json(
      {
        ok: false,
        error: "Ungültige Mail-ID.",
      },
      {
        status: 400,
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

    const lock = await client.getMailboxLock(
      "INBOX",
      {
        readOnly: true,
      }
    )

    try {
      const message = await client.fetchOne(
        uid,
        {
          uid: true,
          envelope: true,
          flags: true,
          source: true,
          internalDate: true,
        },
        {
          uid: true,
        }
      )

      if (!message || !message.source) {
        return Response.json(
          {
            ok: false,
            error: "Mail wurde nicht gefunden.",
          },
          {
            status: 404,
          }
        )
      }

      const parsed = await simpleParser(
        message.source
      )

      const sender =
        message.envelope?.from?.[0]

      const recipients =
        message.envelope?.to ?? []

      const attachments =
        parsed.attachments.map(
          (attachment, index) => ({
            id: index,

            filename:
              attachment.filename ||
              "Unbenannter Anhang",

            contentType:
              attachment.contentType,

            size:
              attachment.size,
          })
        )

      return Response.json({
        ok: true,

        message: {
          uid: message.uid,

          subject:
            message.envelope?.subject ||
            parsed.subject ||
            "(Kein Betreff)",

          senderName:
            sender?.name ||
            sender?.address ||
            parsed.from?.text ||
            "Unbekannter Absender",

          senderAddress:
            sender?.address || "",

          recipients:
            recipients.map(
              (recipient) => ({
                name:
                  recipient.name ||
                  recipient.address ||
                  "",

                address:
                  recipient.address || "",
              })
            ),

          date:
            toISOStringSafe(
              message.envelope?.date ??
                message.internalDate ??
                parsed.date
            ),

          unread:
            !message.flags?.has("\\Seen"),

          text:
            parsed.text?.trim() ||
            "Für diese Mail konnte kein Textinhalt dargestellt werden.",

          attachments,
        },
      })
    } finally {
      lock.release()
    }
  } catch {
        return Response.json(
      {
        ok: false,

        error:
           "Unbekannter Fehler beim Abrufen der TU-Mail.",
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