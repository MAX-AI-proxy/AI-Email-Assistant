"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"

import {
  CheckCircle2,
  LoaderCircle,
  Sparkles,
  TriangleAlert,
} from "lucide-react"

type EmailMessage = {
  uid:
    number

  subject:
    string

  senderName:
    string

  senderAddress:
    string

  date:
    string | null

  unread:
    boolean
}

type MailListResponse = {
  ok:
    boolean

  messages?:
    EmailMessage[]

  error?:
    string
}

type Recipient = {
  name:
    string

  address:
    string
}

type DetailedMessage = {
  uid:
    number

  subject:
    string

  senderName:
    string

  senderAddress:
    string

  recipients:
    Recipient[]

  date:
    string | null

  unread:
    boolean

  text:
    string
}

type DetailResponse = {
  ok:
    boolean

  message?:
    DetailedMessage

  error?:
    string
}

type SyncResponse = {
  ok:
    boolean

  initializedNow?:
    boolean

  baselineCount?:
    number

  pendingUids?:
    number[]

  error?:
    string
}

type Status =
  | {
      type:
        "idle"
    }
  | {
      type:
        "baseline"

      count:
        number
    }
  | {
      type:
        "analyzing"

      total:
        number

      completed:
        number

      failed:
        number
    }
  | {
      type:
        "done"

      total:
        number
    }
  | {
      type:
        "error"

      message:
        string
    }

const CHECK_INTERVAL =
  60_000

export default function TOnlineAutoAnalyzer() {
  const [
    status,
    setStatus,
  ] =
    useState<Status>({
      type:
        "idle",
    })

  const runningRef =
    useRef(
      false
    )

  const hideTimerRef =
    useRef<
      number | null
    >(null)

  const scheduleHide =
    useCallback(
      (
        delay =
          4500
      ) => {
        if (
          hideTimerRef.current !==
          null
        ) {
          window.clearTimeout(
            hideTimerRef.current
          )
        }

        hideTimerRef.current =
          window.setTimeout(
            () => {
              setStatus({
                type:
                  "idle",
              })
            },
            delay
          )
      },
      []
    )

  const markComplete =
    useCallback(
      async (
        uid:
          number
      ) => {
        const response =
          await fetch(
            "/api/ai/mail/auto-state",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  action:
                    "complete",

                  uids: [
                    uid,
                  ],
                }),
            }
          )

        if (
          !response.ok
        ) {
          throw new Error(
            "Auto-Analyse-Status konnte nicht gespeichert werden."
          )
        }
      },
      []
    )

  const analyzeUid =
    useCallback(
      async (
        uid:
          number
      ) => {
        const detailResponse =
          await fetch(
            `/api/mail/t-online/messages/${uid}`,
            {
              cache:
                "no-store",
            }
          )

        const detailData =
          await detailResponse.json() as
            DetailResponse

        if (
          !detailResponse.ok ||
          !detailData.ok ||
          !detailData.message
        ) {
          throw new Error(
            detailData.error ||
              `Mail ${uid} konnte nicht geladen werden.`
          )
        }

        const message =
          detailData.message

        const analysisResponse =
          await fetch(
            "/api/ai/mail/analyze",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  account:
                    "t-online",

                  mail: {
                    uid:
                      message.uid,

                    from:
                      message.senderAddress ||
                      message.senderName ||
                      "-",

                    to:
                      message.recipients
                        .map(
                          (
                            recipient
                          ) =>
                            recipient.address
                        )
                        .filter(
                          Boolean
                        )
                        .join(
                          ", "
                        ) ||
                      "-",

                    subject:
                      message.subject ||
                      "-",

                    date:
                      message.date ||
                      "-",

                    text:
                      message.text ||
                      "-",
                  },
                }),
            }
          )

        const analysisData =
          await analysisResponse.json()

        if (
          !analysisResponse.ok
        ) {
          throw new Error(
            analysisData.error ||
              `AI-Analyse für Mail ${uid} fehlgeschlagen.`
          )
        }

        await markComplete(
          uid
        )
      },
      [
        markComplete,
      ]
    )

  const checkForNewMail =
    useCallback(
      async () => {
        if (
          runningRef.current
        ) {
          return
        }

        runningRef.current =
          true

        try {
          const listResponse =
            await fetch(
              "/api/mail/t-online/messages",
              {
                cache:
                  "no-store",
              }
            )

          const listData =
            await listResponse.json() as
              MailListResponse

          if (
            !listResponse.ok ||
            !listData.ok
          ) {
            throw new Error(
              listData.error ||
                "T-Online-Mails konnten nicht geprüft werden."
            )
          }

          const messages =
            listData.messages ??
            []

          const uids =
            messages.map(
              (
                message
              ) =>
                message.uid
            )

          const stateResponse =
            await fetch(
              "/api/ai/mail/auto-state",
              {
                method:
                  "POST",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body:
                  JSON.stringify({
                    action:
                      "sync",

                    uids,
                  }),
              }
            )

          const stateData =
            await stateResponse.json() as
              SyncResponse

          if (
            !stateResponse.ok ||
            !stateData.ok
          ) {
            throw new Error(
              stateData.error ||
                "AI-Autoanalyse konnte nicht synchronisiert werden."
            )
          }

          if (
            stateData.initializedNow
          ) {
            setStatus({
              type:
                "baseline",

              count:
                stateData.baselineCount ??
                0,
            })

            scheduleHide(
              5500
            )

            return
          }

          const pending =
            stateData.pendingUids ??
            []

          if (
            pending.length ===
            0
          ) {
            setStatus({
              type:
                "idle",
            })

            return
          }

          setStatus({
            type:
              "analyzing",

            total:
              pending.length,

            completed:
              0,

            failed:
              0,
          })

          let nextIndex =
            0

          let completed =
            0

          let failed =
            0

          async function worker() {
            while (
              nextIndex <
              pending.length
            ) {
              const index =
                nextIndex

              nextIndex +=
                1

              const uid =
                pending[
                  index
                ]

              try {
                await analyzeUid(
                  uid
                )

                completed +=
                  1
              } catch (
                error
              ) {
                failed +=
                  1

                console.error(
                  `Automatische AI-Analyse für T-Online UID ${uid} fehlgeschlagen:`,
                  error
                )
              }

              setStatus({
                type:
                  "analyzing",

                total:
                  pending.length,

                completed,

                failed,
              })
            }
          }

          const workerCount =
            Math.min(
              2,
              pending.length
            )

          await Promise.all(
            Array.from(
              {
                length:
                  workerCount,
              },
              () =>
                worker()
            )
          )

          if (
            failed >
            0
          ) {
            setStatus({
              type:
                "error",

              message:
                `${failed} Mail${failed === 1 ? "" : "s"} konnte${failed === 1 ? "" : "n"} noch nicht analysiert werden. Neuer Versuch folgt automatisch.`,
            })

            scheduleHide(
              7000
            )
          } else {
            setStatus({
              type:
                "done",

              total:
                completed,
            })

            scheduleHide(
              5000
            )
          }
        } catch (
          error
        ) {
          console.error(
            "T-Online Auto Analyzer Error:",
            error
          )

          setStatus({
            type:
              "error",

            message:
              error instanceof
                Error
                ? error.message
                : "Automatische Mailprüfung fehlgeschlagen.",
          })

          scheduleHide(
            7000
          )
        } finally {
          runningRef.current =
            false
        }
      },
      [
        analyzeUid,
        scheduleHide,
      ]
    )

  useEffect(() => {
    const initialCheck = window.setTimeout(() => { void checkForNewMail() }, 0)

    const interval =
      window.setInterval(
        () => {
          void checkForNewMail()
        },
        CHECK_INTERVAL
      )

    return () => {
      window.clearTimeout(initialCheck)
      window.clearInterval(
        interval
      )

      if (
        hideTimerRef.current !==
        null
      ) {
        window.clearTimeout(
          hideTimerRef.current
        )
      }
    }
  }, [
    checkForNewMail,
  ])

  if (
    status.type ===
    "idle"
  ) {
    return null
  }

  return (
    <div className="fixed bottom-5 right-5 z-[100] w-[330px] max-w-[calc(100vw-40px)] rounded-[16px] border border-white/[0.08] bg-[#17191e]/95 p-4 shadow-2xl backdrop-blur-xl">
      {status.type ===
        "baseline" && (
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-[#0a84ff]/12 text-[#64a8ff]">
            <Sparkles
              size={
                16
              }
              strokeWidth={
                1.8
              }
            />
          </div>

          <div>
            <p className="text-[13px] font-semibold text-[#ededf0]">
              AI-Autoanalyse
              aktiviert
            </p>

            <p className="mt-1 text-[11px] leading-5 text-[#77787e]">
              {
                status.count
              }{" "}
              bestehende
              T-Online-Mails
              wurden als
              Altbestand
              markiert und
              nicht analysiert.
            </p>
          </div>
        </div>
      )}

      {status.type ===
        "analyzing" && (
        <div className="flex items-start gap-3">
          <LoaderCircle
            size={
              18
            }
            strokeWidth={
              1.8
            }
            className="mt-0.5 shrink-0 animate-spin text-[#64a8ff]"
          />

          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-[#ededf0]">
              Neue Mail
              erkannt
            </p>

            <p className="mt-1 text-[11px] leading-5 text-[#77787e]">
              AI analysiert{" "}
              {
                status.completed +
                status.failed
              }
              /
              {
                status.total
              }{" "}
              neue Mail
              {status.total ===
              1
                ? ""
                : "s"}
              .
            </p>
          </div>
        </div>
      )}

      {status.type ===
        "done" && (
        <div className="flex items-start gap-3">
          <CheckCircle2
            size={
              18
            }
            strokeWidth={
              1.8
            }
            className="mt-0.5 shrink-0 text-[#30d158]"
          />

          <div>
            <p className="text-[13px] font-semibold text-[#ededf0]">
              AI-Analyse
              fertig
            </p>

            <p className="mt-1 text-[11px] text-[#77787e]">
              {
                status.total
              }{" "}
              neue Mail
              {status.total ===
              1
                ? ""
                : "s"}{" "}
              analysiert und
              lokal
              gespeichert.
            </p>
          </div>
        </div>
      )}

      {status.type ===
        "error" && (
        <div className="flex items-start gap-3">
          <TriangleAlert
            size={
              18
            }
            strokeWidth={
              1.8
            }
            className="mt-0.5 shrink-0 text-[#ff9f0a]"
          />

          <div>
            <p className="text-[13px] font-semibold text-[#ededf0]">
              AI-Mailprüfung
            </p>

            <p className="mt-1 text-[11px] leading-5 text-[#8c8d93]">
              {
                status.message
              }
            </p>
          </div>
        </div>
      )}
    </div>
  )
}