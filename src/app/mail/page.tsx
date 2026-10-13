"use client"

import {
  useCallback,
  useEffect,
  useState,
  useMemo,
  useRef,
} from "react"

import {
  Inbox,
  Mail,
  Paperclip,
  RefreshCw,
  User,
} from "lucide-react"

import MailAiAnalysis from "@/components/mail/mail-ai-analysis"

type AccountId =
  | "t-online"
  | "tu"

type EmailMessage = {
  uid: number
  subject: string
  senderName: string
  senderAddress: string
  date: string | null
  unread: boolean
}

type MailResponse = {
  ok: boolean
  account?: string
  totalMessages?: number
  messages?: EmailMessage[]
  error?: string
}

type Recipient = {
  name: string
  address: string
}

type Attachment = {
  id: number
  filename: string
  contentType: string
  size: number
}

type DetailedMessage = {
  uid: number
  subject: string
  senderName: string
  senderAddress: string
  recipients: Recipient[]
  date: string | null
  unread: boolean
  text: string
  attachments: Attachment[]
}

type MessageResponse = {
  ok: boolean
  message?: DetailedMessage
  error?: string
}

type AccountData = {
  messages: EmailMessage[]
  totalMessages: number
  loading: boolean
  error: string | null
}

const accounts: {
  id: AccountId
  name: string
  description: string
}[] = [
  {
    id: "t-online",
    name: "T-Online",
    description: "Privat",
  },
  {
    id: "tu",
    name: "Uni",
    description: "TU Braunschweig",
  },
]

function createEmptyAccountData(): AccountData {
  return {
    messages: [],
    totalMessages: 0,
    loading: true,
    error: null,
  }
}

function formatListDate(
  dateString: string | null
) {
  if (!dateString) {
    return ""
  }

  const date =
    new Date(dateString)

  const now =
    new Date()

  const isToday =
    date.getDate() ===
      now.getDate() &&
    date.getMonth() ===
      now.getMonth() &&
    date.getFullYear() ===
      now.getFullYear()

  if (isToday) {
    return new Intl.DateTimeFormat(
      "de-DE",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    ).format(date)
  }

  const isCurrentYear =
    date.getFullYear() ===
    now.getFullYear()

  return new Intl.DateTimeFormat(
    "de-DE",
    {
      day: "2-digit",
      month: "2-digit",
      year: isCurrentYear
        ? undefined
        : "2-digit",
    }
  ).format(date)
}

function formatFullDate(
  dateString: string | null
) {
  if (!dateString) {
    return ""
  }

  return new Intl.DateTimeFormat(
    "de-DE",
    {
      weekday: "short",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(
    new Date(dateString)
  )
}

function formatFileSize(
  bytes: number
) {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  if (
    bytes <
    1024 * 1024
  ) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`
  }

  return `${(
    bytes /
    1024 /
    1024
  ).toFixed(1)} MB`
}

export default function MailPage() {
  const [
    activeAccount,
    setActiveAccount,
  ] =
    useState<AccountId>(
      "t-online"
    )

  const [
    accountData,
    setAccountData,
  ] = useState<
    Record<
      AccountId,
      AccountData
    >
  >({
    "t-online":
      createEmptyAccountData(),

    tu:
      createEmptyAccountData(),
  })

  const [
    selectedUid,
    setSelectedUid,
  ] =
    useState<
      number | null
    >(null)

  const [
    selectedMessage,
    setSelectedMessage,
  ] =
    useState<
      DetailedMessage | null
    >(null)

  const [
    messageLoading,
    setMessageLoading,
  ] =
    useState(false)

  const [
    messageError,
    setMessageError,
  ] =
    useState<
      string | null
    >(null)

  const loadAccount =
    useCallback(
      async (
        account:
          AccountId
      ) => {
        setAccountData(
          (
            current
          ) => ({
            ...current,

            [account]: {
              ...current[
                account
              ],

              loading:
                true,

              error:
                null,
            },
          })
        )

        try {
          const response =
            await fetch(
              `/api/mail/${account}/messages`,
              {
                cache:
                  "no-store",
              }
            )

          const data:
            MailResponse =
              await response.json()

          if (
            !response.ok ||
            !data.ok
          ) {
            throw new Error(
              data.error ||
                "Mails konnten nicht geladen werden."
            )
          }

          setAccountData(
            (
              current
            ) => ({
              ...current,

              [account]: {
                messages:
                  data.messages ??
                  [],

                totalMessages:
                  data.totalMessages ??
                  0,

                loading:
                  false,

                error:
                  null,
              },
            })
          )
        } catch (
          error
        ) {
          setAccountData(
            (
              current
            ) => ({
              ...current,

              [account]: {
                ...current[
                  account
                ],

                loading:
                  false,

                error:
                  error instanceof
                  Error
                    ? error.message
                    : "Mails konnten nicht geladen werden.",
              },
            })
          )
        }
      },
      []
    )

  const loadAllAccounts =
    useCallback(
      async () => {
        await Promise.all([
          loadAccount(
            "t-online"
          ),

          loadAccount(
            "tu"
          ),
        ])
      },
      [
        loadAccount,
      ]
    )

  useEffect(() => {
    loadAllAccounts()
  }, [
    loadAllAccounts,
  ])

  const messageRequestRef = useRef(0)

  function selectAccount(
    account:
      AccountId
  ) {
    messageRequestRef.current += 1
    setMessageLoading(false)
    setActiveAccount(
      account
    )

    setSelectedUid(
      null
    )

    setSelectedMessage(
      null
    )

    setMessageError(
      null
    )
  }

  const loadMessage =
    useCallback(
      async (
        uid:
          number
      ) => {
        const requestId = ++messageRequestRef.current
        setSelectedUid(
          uid
        )

        setMessageLoading(
          true
        )

        setMessageError(
          null
        )

        setSelectedMessage(
          null
        )

        try {
          const response =
            await fetch(
              `/api/mail/${activeAccount}/messages/${uid}`,
              {
                cache:
                  "no-store",
              }
            )

          const data:
            MessageResponse =
              await response.json()

          if (
            !response.ok ||
            !data.ok ||
            !data.message
          ) {
            throw new Error(
              data.error ||
                "Mail konnte nicht geladen werden."
            )
          }

          if (requestId !== messageRequestRef.current) return
          setSelectedMessage(
            data.message
          )
        } catch (
          error
        ) {
          if (requestId !== messageRequestRef.current) return
          setMessageError(
            error instanceof
            Error
              ? error.message
              : "Mail konnte nicht geladen werden."
          )
        } finally {
          if (requestId === messageRequestRef.current) setMessageLoading(false)
        }
      },
      [
        activeAccount,
      ]
    )

  const current =
    accountData[
      activeAccount
    ]

  const analysisMail = useMemo(() => selectedMessage && activeAccount === "t-online" ? {
    uid: selectedMessage.uid,
    from: selectedMessage.senderAddress || selectedMessage.senderName || "-",
    to: selectedMessage.recipients.map(recipient => recipient.address).filter(Boolean).join(", ") || "-",
    subject: selectedMessage.subject || "-",
    date: selectedMessage.date || "-",
    text: selectedMessage.text || "-",
  } : null, [selectedMessage, activeAccount])

  return (
    <div className="w-full px-6 pb-16 pt-10 md:px-10 md:pt-14 lg:px-12">
      {/* Header */}

      <header className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-[14px] font-medium text-[#86868b]">
            Kommunikation
          </p>

          <h1 className="text-[32px] font-semibold tracking-[-0.035em] text-[#f5f5f7] md:text-[38px]">
            Mail
          </h1>

          <p className="mt-2 text-[16px] text-[#86868b]">
            Deine privaten
            und universitären
            Postfächer an einem
            Ort.
          </p>
        </div>

        <button
          onClick={
            loadAllAccounts
          }
          disabled={
            accountData[
              "t-online"
            ].loading ||
            accountData.tu
              .loading
          }
          className="flex h-10 w-fit items-center gap-2 rounded-[10px] bg-white/[0.06] px-3.5 text-[13px] font-medium text-[#b4b4b8] transition hover:bg-white/[0.09] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={15}
            strokeWidth={
              1.8
            }
            className={
              accountData[
                "t-online"
              ].loading ||
              accountData
                .tu
                .loading
                ? "animate-spin"
                : ""
            }
          />

          Aktualisieren
        </button>
      </header>

      {/* Mail app */}

      <div className="grid min-h-[700px] overflow-hidden rounded-[18px] border border-white/[0.07] bg-[#15171b] lg:grid-cols-[200px_390px_minmax(0,1fr)]">
        {/* Accounts */}

        <aside className="border-b border-white/[0.06] bg-[#121418] p-3 lg:border-b-0 lg:border-r lg:border-white/[0.06]">
          <p className="mb-2 px-3 pt-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5f6066]">
            Postfächer
          </p>

          <div className="space-y-1">
            {accounts.map(
              (
                account
              ) => {
                const data =
                  accountData[
                    account.id
                  ]

                const active =
                  activeAccount ===
                  account.id

                return (
                  <button
                    key={
                      account.id
                    }
                    onClick={() =>
                      selectAccount(
                        account.id
                      )
                    }
                    className={`flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left transition ${
                      active
                        ? "bg-white/[0.08]"
                        : "hover:bg-white/[0.04]"
                    }`}
                  >
                    <Mail
                      size={
                        17
                      }
                      strokeWidth={
                        1.7
                      }
                      className={`shrink-0 ${
                        active
                          ? "text-[#0a84ff]"
                          : "text-[#6c6d73]"
                      }`}
                    />

                    <div className="min-w-0 flex-1">
                      <div
                        className={`truncate text-[14px] ${
                          active
                            ? "font-medium text-white"
                            : "text-[#9b9ca2]"
                        }`}
                      >
                        {
                          account.name
                        }
                      </div>

                      <div className="mt-0.5 truncate text-[11px] text-[#626369]">
                        {data.loading
                          ? "Wird geladen …"
                          : data.error
                            ? "Fehler"
                            : `${data.totalMessages.toLocaleString(
                                "de-DE"
                              )} Mails`}
                      </div>
                    </div>
                  </button>
                )
              }
            )}
          </div>
        </aside>

        {/* Message list */}

        <section className="min-w-0 border-b border-white/[0.06] lg:border-b-0 lg:border-r lg:border-white/[0.06]">
          <div className="flex h-14 items-center border-b border-white/[0.06] px-4">
            <Inbox
              size={17}
              strokeWidth={
                1.7
              }
              className="mr-2.5 text-[#8e8e93]"
            />

            <h2 className="text-[14px] font-medium text-[#e8e8ea]">
              Posteingang
            </h2>

            {!current.loading &&
              !current.error && (
                <span className="ml-2 text-[12px] text-[#626268]">
                  Letzte{" "}
                  {
                    current
                      .messages
                      .length
                  }
                </span>
              )}
          </div>

          {current.loading &&
            current
              .messages
              .length ===
              0 && (
              <div className="flex min-h-[500px] items-center justify-center">
                <div className="text-center">
                  <RefreshCw
                    size={
                      22
                    }
                    strokeWidth={
                      1.6
                    }
                    className="mx-auto animate-spin text-[#68686e]"
                  />

                  <p className="mt-4 text-[14px] text-[#68686e]">
                    Mails werden
                    geladen …
                  </p>
                </div>
              </div>
            )}

          {current.error && (
            <div className="m-4 rounded-[14px] border border-red-500/20 bg-red-500/[0.06] p-4">
              <p className="text-[14px] font-medium text-red-300">
                Mails konnten
                nicht geladen
                werden
              </p>

              <p className="mt-1 text-[13px] leading-5 text-red-300/70">
                {
                  current.error
                }
              </p>
            </div>
          )}

          {!current.loading &&
            !current.error &&
            current
              .messages
              .length ===
              0 && (
              <div className="flex min-h-[500px] items-center justify-center">
                <p className="text-[14px] text-[#68686e]">
                  Keine Mails
                  gefunden.
                </p>
              </div>
            )}

          {current.messages
            .length >
            0 && (
            <div>
              {current.messages.map(
                (
                  message
                ) => {
                  const selected =
                    selectedUid ===
                    message.uid

                  return (
                    <button
                      key={
                        message.uid
                      }
                      onClick={() =>
                        loadMessage(
                          message.uid
                        )
                      }
                      className={`flex w-full gap-3 border-b border-white/[0.055] px-4 py-4 text-left transition ${
                        selected
                          ? "bg-white/[0.07]"
                          : "hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className="flex w-2 shrink-0 justify-center pt-[6px]">
                        {message.unread && (
                          <div className="h-2 w-2 rounded-full bg-[#0a84ff]" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center justify-between gap-3">
                          <p
                            className={`truncate text-[13px] ${
                              message.unread
                                ? "font-semibold text-[#f5f5f7]"
                                : "text-[#a0a0a5]"
                            }`}
                          >
                            {
                              message.senderName
                            }
                          </p>

                          <span className="shrink-0 text-[11px] text-[#66676d]">
                            {formatListDate(
                              message.date
                            )}
                          </span>
                        </div>

                        <p
                          className={`truncate text-[13px] ${
                            message.unread
                              ? "font-medium text-[#dedee1]"
                              : "text-[#7e7f85]"
                          }`}
                        >
                          {
                            message.subject
                          }
                        </p>
                      </div>
                    </button>
                  )
                }
              )}
            </div>
          )}
        </section>

        {/* Message detail */}

        <section className="min-w-0 bg-[#15171b]">
          {!selectedUid && (
            <div className="flex min-h-[600px] items-center justify-center px-8">
              <div className="max-w-xs text-center">
                <Mail
                  size={30}
                  strokeWidth={
                    1.4
                  }
                  className="mx-auto text-[#45464c]"
                />

                <p className="mt-4 text-[15px] font-medium text-[#77787e]">
                  Wähle eine Mail
                  aus
                </p>

                <p className="mt-1 text-[13px] leading-5 text-[#55565b]">
                  Der Inhalt
                  erscheint
                  anschließend
                  hier.
                </p>
              </div>
            </div>
          )}

          {selectedUid &&
            messageLoading && (
              <div className="flex min-h-[600px] items-center justify-center">
                <div className="text-center">
                  <RefreshCw
                    size={
                      22
                    }
                    strokeWidth={
                      1.6
                    }
                    className="mx-auto animate-spin text-[#68686e]"
                  />

                  <p className="mt-4 text-[14px] text-[#68686e]">
                    Mail wird
                    geladen …
                  </p>
                </div>
              </div>
            )}

          {messageError && (
            <div className="m-6 rounded-[14px] border border-red-500/20 bg-red-500/[0.06] p-4">
              <p className="text-[14px] font-medium text-red-300">
                Mail konnte
                nicht geladen
                werden
              </p>

              <p className="mt-1 text-[13px] leading-5 text-red-300/70">
                {
                  messageError
                }
              </p>
            </div>
          )}

          {selectedMessage &&
            !messageLoading && (
              <div>
                <div className="border-b border-white/[0.06] px-6 py-6 md:px-8">
                  <h2 className="text-[21px] font-semibold leading-7 tracking-[-0.02em] text-[#f5f5f7]">
                    {
                      selectedMessage.subject
                    }
                  </h2>

                  <div className="mt-5 flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.07] text-[#a4a4aa]">
                      <User
                        size={
                          18
                        }
                        strokeWidth={
                          1.6
                        }
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <div className="min-w-0">
                          <p className="truncate text-[14px] font-medium text-[#e5e5e7]">
                            {
                              selectedMessage.senderName
                            }
                          </p>

                          <p className="truncate text-[12px] text-[#68696f]">
                            {
                              selectedMessage.senderAddress
                            }
                          </p>
                        </div>

                        <p className="shrink-0 text-[11px] text-[#66676d]">
                          {formatFullDate(
                            selectedMessage.date
                          )}
                        </p>
                      </div>

                      {selectedMessage
                        .recipients
                        .length >
                        0 && (
                        <p className="mt-2 text-[11px] text-[#5e5f65]">
                          An:{" "}
                          {selectedMessage.recipients
                            .map(
                              (
                                recipient
                              ) =>
                                recipient.name ||
                                recipient.address
                            )
                            .join(
                              ", "
                            )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="px-6 py-7 md:px-8">
                  {/* AI analysis only for T-Online */}

                  {activeAccount ===
                    "t-online" && (
                    <div className="mb-7 max-w-[850px]">
                      <MailAiAnalysis mail={analysisMail} />
                    </div>
                  )}

                  {/* Original mail */}

                  <div className="max-w-[850px] whitespace-pre-wrap break-words text-[14px] leading-7 text-[#d0d0d3]">
                    {
                      selectedMessage.text
                    }
                  </div>

                  {/* Attachments */}

                  {selectedMessage
                    .attachments
                    .length >
                    0 && (
                    <div className="mt-10 border-t border-white/[0.06] pt-6">
                      <div className="mb-3 flex items-center gap-2">
                        <Paperclip
                          size={
                            15
                          }
                          strokeWidth={
                            1.7
                          }
                          className="text-[#7c7d83]"
                        />

                        <p className="text-[13px] font-medium text-[#9b9ca2]">
                          Anhänge
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {selectedMessage.attachments.map(
                          (
                            attachment
                          ) => (
                            <div
                              key={
                                attachment.id
                              }
                              className="rounded-[10px] border border-white/[0.07] bg-white/[0.035] px-3 py-2"
                            >
                              <p className="max-w-[240px] truncate text-[12px] font-medium text-[#c8c8cc]">
                                {
                                  attachment.filename
                                }
                              </p>

                              <p className="mt-0.5 text-[10px] text-[#66676d]">
                                {formatFileSize(
                                  attachment.size
                                )}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
        </section>
      </div>
    </div>
  )
}