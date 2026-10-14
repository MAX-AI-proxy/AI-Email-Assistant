import { CalendarClock, CheckCircle2, Reply, Sparkles, Tag } from "lucide-react"
import type { AnalyzeMailResponse } from "@/lib/ai/types"

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

export default function MailAnalysisCard({ result, recorded = false }: { result: Pick<AnalyzeMailResponse, "analysis" | "usage" | "cached">; recorded?: boolean }) {
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
              {recorded ? " · aufgezeichnetes Ergebnis" : result.cached ? " · lokal geladen" : ""}
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
        {recorded && <p className="mb-1">Verbrauch der ursprünglichen Beispielanalyse · keine neuen API-Aufrufe</p>}
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