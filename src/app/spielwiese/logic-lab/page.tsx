import Link from "next/link"

import {
  ArrowLeft,
  Calculator,
  ChevronRight,
  Grid3X3,
  Infinity,
  Play,
  Sigma,
  Sparkles,
  TrendingUp,
} from "lucide-react"

const categories = [
  {
    name:
      "Number Sequences",

    description:
      "Anspruchsvolle Zahlenfolgen mit prozedural erzeugten Regeln.",

    icon:
      TrendingUp,

    href:
      "/spielwiese/logic-lab/play?mode=endless&category=number-sequences",
  },

  {
    name:
      "Number Grids",

    description:
      "Mathematische Beziehungen innerhalb automatisch erzeugter Zahlenraster.",

    icon:
      Grid3X3,

    href:
      "/spielwiese/logic-lab/play?mode=endless&category=number-grids",
  },

  {
    name:
      "Math Logic",

    description:
      "Gleichungen, Operatoren, Gleichungssysteme und anspruchsvolles Auflösen nach x.",

    icon:
      Calculator,

    href:
      "/spielwiese/logic-lab/play?mode=endless&category=math-logic",
  },

  {
    name:
      "Derivatives",

    description:
      "Ableitungen von Polynomen bis zu Produkt-, Quotienten- und Kettenregel.",

    icon:
      Sigma,

    href:
      "/spielwiese/logic-lab/play?mode=endless&category=derivatives",
  },

  {
    name:
      "Integrals",

    description:
      "Stammfunktionen, Substitution, partielle Integration und bestimmte Integrale.",

    icon:
      Sigma,

    href:
      "/spielwiese/logic-lab/play?mode=endless&category=integrals",
  },

  {
    name:
      "Limits",

    description:
      "Grenzwerte mit Faktorisierung, Rationalisierung, Trigonometrie und Standardgrenzwerten.",

    icon:
      Infinity,

    href:
      "/spielwiese/logic-lab/play?mode=endless&category=limits",
  },
]

export default function LogicLabPage() {
  return (
    <div className="w-full px-5 pb-16 pt-8 md:px-10 md:pt-12 lg:px-12">
      <div className="mx-auto max-w-[1180px]">
        <Link
          href="/spielwiese"
          className="mb-6 flex w-fit items-center gap-1.5 text-[13px] text-[#77787e] transition hover:text-white"
        >
          <ArrowLeft
            size={15}
            strokeWidth={1.8}
          />

          Spielwiese
        </Link>

        <header className="mb-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#bf5af2]/15 text-[#d18cff]">
              <Sparkles
                size={20}
                strokeWidth={1.7}
              />
            </div>

            <h1 className="text-[32px] font-semibold tracking-[-0.04em] text-[#f5f5f7] md:text-[40px]">
              Logic Lab
            </h1>
          </div>
        </header>

        <section className="mb-10">
          <h2 className="mb-4 text-[18px] font-semibold tracking-[-0.02em]">
            Spielmodi
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <Link
              href="/spielwiese/logic-lab/play?mode=quick&category=all"
              className="group rounded-[20px] border border-white/[0.07] bg-[#15171b] p-6 transition hover:border-white/[0.12] hover:bg-[#181a1f]"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-[#0a84ff]/15 text-[#64a8ff]">
                  <Play
                    size={20}
                    strokeWidth={1.8}
                  />
                </div>

                <ChevronRight
                  size={18}
                  className="text-[#55565c] transition group-hover:translate-x-1 group-hover:text-[#999aa0]"
                />
              </div>

              <h3 className="mt-8 text-[18px] font-semibold">
                Quick Play
              </h3>

              <p className="mt-2 text-[14px] leading-6 text-[#7f8086]">
                Direkt eine zufällige Aufgabe aus allen
                sechs Kategorien starten.
              </p>
            </Link>

            <Link
              href="/spielwiese/logic-lab/play?mode=endless&category=all"
              className="group rounded-[20px] border border-white/[0.07] bg-[#15171b] p-6 transition hover:border-white/[0.12] hover:bg-[#181a1f]"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-[#30d158]/10 text-[#5ee777]">
                  <Infinity
                    size={21}
                    strokeWidth={1.8}
                  />
                </div>

                <ChevronRight
                  size={18}
                  className="text-[#55565c] transition group-hover:translate-x-1 group-hover:text-[#999aa0]"
                />
              </div>

              <h3 className="mt-8 text-[18px] font-semibold">
                Endless
              </h3>

              <p className="mt-2 text-[14px] leading-6 text-[#7f8086]">
                Kategorie und Schwierigkeit jederzeit
                wechseln und unbegrenzt neue Aufgaben
                erzeugen.
              </p>
            </Link>
          </div>
        </section>

        <section className="mb-10">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-[18px] font-semibold tracking-[-0.02em]">
              Kategorien
            </h2>

            <p className="text-[12px] text-[#5f6066]">
              6 / 6 verfügbar
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {categories.map(
              (
                category
              ) => {
                const Icon =
                  category.icon

                return (
                  <Link
                    key={
                      category.name
                    }
                    href={
                      category.href
                    }
                    className="rounded-[18px] border border-white/[0.08] bg-[#15171b] p-5 transition hover:border-white/[0.13] hover:bg-[#181a1f]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-white/[0.05] text-[#9b9ca2]">
                        <Icon
                          size={18}
                          strokeWidth={1.7}
                        />
                      </div>

                      <span className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[#30d158]">
                        Verfügbar
                      </span>
                    </div>

                    <h3 className="mt-5 text-[15px] font-semibold text-[#e7e7e9]">
                      {
                        category.name
                      }
                    </h3>

                    <p className="mt-2 text-[13px] leading-5 text-[#707177]">
                      {
                        category.description
                      }
                    </p>
                  </Link>
                )
              }
            )}
          </div>
        </section>

      </div>
    </div>
  )
}