import { requireLocalRequest } from "@/lib/server/request-security"

import {
  ImapFlow,
} from "imapflow"

import {
  NextResponse,
} from "next/server"

export const runtime =
  "nodejs"

function safeIsoString(
  value:
    Date | string | null | undefined
) {
  if (!value) {
    return null
  }

  try {
    const date =
      value instanceof Date
        ? value
        : new Date(value)

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return null
    }

    return date.toISOString()
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  const denied = requireLocalRequest(request)
  if (denied) return denied

  const email =
    process.env
      .T_ONLINE_EMAIL

  const password =
    process.env
      .T_ONLINE_APP_PASSWORD

  if (
    !email ||
    !password
  ) {
    return NextResponse.json(
      {
        ok: false,

        error:
          "T-Online Zugangsdaten fehlen in .env.local.",
      },
      {
        status: 503,
      }
    )
  }

  const client =
    new ImapFlow({
      host:
        "secureimap.t-online.de",

      port:
        993,

      secure:
        true,

      auth: {
        user:
          email,

        pass:
          password,
      },

      logger:
        false,
    })

  let lock: {
    release: () => void
  } | null = null

  try {
    await client.connect()

    const status =
      await client.status(
        "INBOX",
        {
          messages:
            true,
        }
      )

    const totalMessages =
      status.messages ??
      0

    if (
      totalMessages ===
      0
    ) {
      return NextResponse.json({
        ok:
          true,

        account:
          "t-online",

        totalMessages:
          0,

        messages:
          [],
      })
    }

    lock =
      await client.getMailboxLock(
        "INBOX",
        {
          readOnly:
            true,
        }
      )

    const amount =
      100

    const firstMessage =
      Math.max(
        1,
        totalMessages -
          amount +
          1
      )

    const range =
      `${firstMessage}:*`

    const fetched =
      await client.fetchAll(
        range,
        {
          uid:
            true,

          envelope:
            true,

          flags:
            true,

          internalDate:
            true,
        }
      )

    const messages =
      fetched
        .map(
          (
            message
          ) => {
            const sender =
              message.envelope
                ?.from?.[0]

            const senderAddress =
              sender
                ?.address ??
              ""

            const senderName =
              sender
                ?.name
                ?.trim() ||
              senderAddress ||
              "Unbekannt"

            const date =
              safeIsoString(
                message
                  .envelope
                  ?.date ??
                  message
                    .internalDate
              )

            const unread =
              !message
                .flags
                ?.has(
                  "\\Seen"
                )

            return {
              uid:
                message.uid,

              subject:
                message
                  .envelope
                  ?.subject ??
                "(Kein Betreff)",

              senderName,

              senderAddress,

              date,

              unread,
            }
          }
        )
        .reverse()

    return NextResponse.json({
      ok:
        true,

      account:
        "t-online",

      totalMessages,

      messages,
    })
  } catch {
        return NextResponse.json(
      {
        ok:
          false,

        error:
           "T-Online-Mails konnten nicht geladen werden.",
      },
      {
        status: 500,
      }
    )
  } finally {
    if (lock) {
      try {
        lock.release()
      } catch {
        // Nothing to do
      }
    }

    try {
      await client.logout()
    } catch {
      // Connection may already be closed
    }
  }
}