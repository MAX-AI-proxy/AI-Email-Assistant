"use client"

import {
  useEffect,
  useState,
} from "react"

import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  LoaderCircle,
  Reply,
  Sparkles,
  Tag,
} from "lucide-react"

import type {
  AnalyzeMailResponse,
  MailForAnalysis,
} from "@/lib/ai/types"

type Props = {
  mail:
    MailForAnalysis | null
}

function importanceClasses(
  importance:
    "Niedrig" |
    "Mittel" |
    "Hoch"
) {
  if (
    importance ===
    "Hoch"
  ) {
    return "border-[#ff453a]/20 bg-[#ff453a]/10 text-[#ff6961]"
  }

  if (
    importance ===
    "Mittel"
  ) {
    return "border-[#ff9f0a]/20 bg-[#ff9f0a]/10 text-[#ffb340]"
  }

  return "border-white/[0.08] bg-white/[0.04] text-[#98989f]"
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

  const {
    analysis,
  } =
    result

  return (
    <section className="overflow-hidden rounded-[18px] border border-white/[0.07] bg-[#14161a]">
      <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#0a84ff]/12 text-[#64a8ff]">
            <Sparkles
              size={16}
              strokeWidth={1.8}
            />
          </div>

          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.07em] text-[#aaaab0]">
              AI Analyse
            </p>

            <p className="mt-0.5 text-[10px] text-[#55565c]">
              {result.usage.model}
              {result.cached
                ? " · lokal geladen"
                : ""}
            </p>
          </div>
        </div>

        <span
          className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${importanceClasses(
            analysis.importance
          )}`}
        >
          {
            analysis.importance
          }
        </span>
      </div>

      <div className="border-b border-white/[0.06] px-5 py-3 text-[11px] text-[#86868b]">
        {result.usage.totalTokens.toLocaleString("de-DE")} Tokens · geschätzte Kosten dieser Analyse: ${result.usage.estimatedCostUsd.toFixed(6)} USD
        {result.cached && " · keine neue API-Anfrage"}
      </div>

      <div className="p-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#595a60]">
            Zusammenfassung
          </p>

          <p className="mt-2 text-[13px] leading-6 text-[#c7c7cb]">
            {
              analysis.summary
            }
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[12px] border border-white/[0.055] bg-white/[0.02] p-3.5">
            <div className="flex items-center gap-2 text-[#6d6e74]">
              <CheckCircle2
                size={14}
                strokeWidth={1.7}
              />

              <span className="text-[10px] font-semibold uppercase tracking-[0.06em]">
                Handlungsbedarf
              </span>
            </div>

            <p className="mt-2 text-[13px] font-medium text-[#dedee1]">
              {
                analysis.actionRequired
              }
            </p>
          </div>

          <div className="rounded-[12px] border border-white/[0.055] bg-white/[0.02] p-3.5">
            <div className="flex items-center gap-2 text-[#6d6e74]">
              <CalendarClock
                size={14}
                strokeWidth={1.7}
              />

              <span className="text-[10px] font-semibold uppercase tracking-[0.06em]">
                Deadline
              </span>
            </div>

            <p className="mt-2 text-[13px] font-medium text-[#dedee1]">
              {
                analysis.deadline
              }
            </p>
          </div>

          <div className="rounded-[12px] border border-white/[0.055] bg-white/[0.02] p-3.5">
            <div className="flex items-center gap-2 text-[#6d6e74]">
              <Reply
                size={14}
                strokeWidth={1.7}
              />

              <span className="text-[10px] font-semibold uppercase tracking-[0.06em]">
                Antwort empfohlen
              </span>
            </div>

            <p className="mt-2 text-[13px] font-medium text-[#dedee1]">
              {
                analysis.replyRecommended
              }
            </p>
          </div>

          <div className="rounded-[12px] border border-white/[0.055] bg-white/[0.02] p-3.5">
            <div className="flex items-center gap-2 text-[#6d6e74]">
              <Tag
                size={14}
                strokeWidth={1.7}
              />

              <span className="text-[10px] font-semibold uppercase tracking-[0.06em]">
                Kategorie
              </span>
            </div>

            <p className="mt-2 text-[13px] font-medium text-[#dedee1]">
              {
                analysis.category
              }
            </p>
          </div>
        </div>

        <div className="mt-3 rounded-[12px] border border-white/[0.055] bg-white/[0.02] p-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#6d6e74]">
            Nächster Schritt
          </p>

          <p className="mt-2 text-[13px] leading-5 text-[#dedee1]">
            {
              analysis.action
            }
          </p>
        </div>
      </div>
    </section>
  )
}