"use client"

import {
  useCallback,
  useEffect,
  useState,
  useMemo,
  useRef,
} from "react"

import MailAiAnalysis from "@/components/mail/mail-ai-analysis"

type AccountId =
  | "t-online"
  | "tu"

import MailWorkspace from "./mail-workspace"
import type { AccountData, MailResponse, MessageResponse, DetailedMessage } from "./types"

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

export default function LiveMailClient() {
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

  const analysisMail = useMemo(() => selectedMessage && activeAccount === "t-online" ? {
    uid: selectedMessage.uid,
    from: selectedMessage.senderAddress || selectedMessage.senderName || "-",
    to: selectedMessage.recipients.map(recipient => recipient.address).filter(Boolean).join(", ") || "-",
    subject: selectedMessage.subject || "-",
    date: selectedMessage.date || "-",
    text: selectedMessage.text || "-",
  } : null, [selectedMessage, activeAccount])

  function closeMessage() {
    messageRequestRef.current += 1
    setSelectedUid(null)
    setSelectedMessage(null)
    setMessageLoading(false)
    setMessageError(null)
  }

  return <MailWorkspace
    accounts={accounts} accountData={accountData} activeAccount={activeAccount}
    onAccountChange={account => { if (account === "t-online" || account === "tu") selectAccount(account) }}
    onRefresh={() => { void loadAllAccounts() }} selectedUid={selectedUid}
    selectedMessage={selectedMessage} messageLoading={messageLoading} messageError={messageError}
    onMessageOpen={uid => { void loadMessage(uid) }} onMessageClose={closeMessage}
    analysisPanel={analysisMail ? <MailAiAnalysis mail={analysisMail} /> : undefined}
  />
}
