"use client"

import {
  useEffect,
  useState,
} from "react"

import {
  AlertTriangle,
  LoaderCircle,
} from "lucide-react"

import type {
  AnalyzeMailResponse,
  MailForAnalysis,
} from "@/lib/ai/types"

import MailAnalysisCard from "./mail-analysis-card"

type Props = {
  mail:
    MailForAnalysis | null
}

export default function MailAiAnalysis({
  mail,
}: Props) {
  const [
    result,
    setResult,
  ] =
    useState<AnalyzeMailResponse | null>(
      null
    )

  const [
    loading,
    setLoading,
  ] =
    useState(false)

  const [
    error,
    setError,
  ] =
    useState("")

  useEffect(() => {
    if (!mail) return

    const controller =
      new AbortController()

    async function run() {
      setLoading(
        true
      )

      setError("")

      setResult(
        null
      )

      try {
        const response =
          await fetch(
            "/api/ai/mail/analyze",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              signal:
                controller.signal,

              body:
                JSON.stringify({
                  account:
                    "t-online",

                  mail,
                }),
            }
          )

        const data =
          await response.json()

        if (
          !response.ok
        ) {
          throw new Error(
            data.error ??
              "AI-Analyse fehlgeschlagen."
          )
        }

        if (controller.signal.aborted) return
        setResult(
          data as
            AnalyzeMailResponse
        )
      } catch (error) {
        if (
          error instanceof
            DOMException &&
          error.name ===
            "AbortError"
        ) {
          return
        }

        if (controller.signal.aborted) return
        setError(
          error instanceof
            Error
            ? error.message
            : "AI-Analyse fehlgeschlagen."
        )
      } finally {
        if (
          !controller
            .signal
            .aborted
        ) {
          setLoading(
            false
          )
        }
      }
    }

    const timer = window.setTimeout(() => { void run() }, 0)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [mail])

  if (!mail) {
    return null
  }

  if (loading) {
    return (
      <section className="rounded-[16px] border border-[#0a84ff]/15 bg-[#0a84ff]/[0.035] p-5">
        <div className="flex items-center gap-3">
          <LoaderCircle
            size={18}
            strokeWidth={1.8}
            className="animate-spin text-[#64a8ff]"
          />

          <div>
            <p className="text-[13px] font-semibold text-[#e9e9ec]">
              AI analysiert die Mail …
            </p>

            <p className="mt-1 text-[11px] text-[#66676d]">
              Zusammenfassung und Handlungsbedarf werden ermittelt.
            </p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="rounded-[16px] border border-[#ff453a]/15 bg-[#ff453a]/[0.035] p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle
            size={18}
            strokeWidth={1.8}
            className="mt-0.5 text-[#ff6961]"
          />

          <div>
            <p className="text-[13px] font-semibold text-[#e9e9ec]">
              AI-Analyse nicht verfügbar
            </p>

            <p className="mt-1 text-[12px] text-[#8d8e94]">
              {error}
            </p>
          </div>
        </div>
      </section>
    )
  }

  if (!result) {
    return null
  }

  return <MailAnalysisCard result={result} />
}
