import Link from "next/link"

import {
  BrainCircuit,
  ChevronRight,
  Grid3X3,
} from "lucide-react"

export default function SpielwiesePage() {
  return (
    <div className="w-full px-6 pb-16 pt-10 md:px-10 md:pt-14 lg:px-12">
      <header className="mb-12">
        <p className="mb-2 text-[14px] font-medium text-[#86868b]">
          Spielwiese
        </p>

        <h1 className="text-[32px] font-semibold tracking-[-0.035em] text-[#f5f5f7] md:text-[38px]">
          Einfach ein bisschen Spaß.
        </h1>

        <p className="mt-2 max-w-2xl text-[16px] leading-7 text-[#86868b]">
          Kleine Spiele, Experimente und Tools direkt in MAX AI.
        </p>
      </header>

      <section>
        <h2 className="mb-4 text-[19px] font-semibold tracking-[-0.02em]">
          Spiele
        </h2>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {/* Sudoku */}
          <Link
            href="/spielwiese/sudoku"
            className="group relative min-h-[220px] overflow-hidden rounded-[20px] border border-white/[0.07] bg-[#15171b] p-6 transition duration-200 hover:border-white/[0.12] hover:bg-[#181a1f]"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#0a84ff]/15 text-[#0a84ff]">
                  <Grid3X3
                    size={23}
                    strokeWidth={1.7}
                  />
                </div>

                <ChevronRight
                  size={18}
                  strokeWidth={1.8}
                  className="mt-1 text-[#55565c] transition duration-200 group-hover:translate-x-1 group-hover:text-[#9b9ca2]"
                />
              </div>

              <div className="mt-auto pt-10">
                <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-[#f5f5f7]">
                  Sudoku
                </h3>

                <p className="mt-2 max-w-sm text-[14px] leading-6 text-[#86868b]">
                  Generierte Sudokus mit unterschiedlichen
                  Schwierigkeitsgraden.
                </p>
              </div>
            </div>
          </Link>

          {/* Logic Lab */}
          <Link
            href="/spielwiese/logic-lab"
            className="group relative min-h-[220px] overflow-hidden rounded-[20px] border border-white/[0.07] bg-[#15171b] p-6 transition duration-200 hover:border-white/[0.12] hover:bg-[#181a1f]"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#bf5af2]/15 text-[#d18cff]">
                  <BrainCircuit
                    size={23}
                    strokeWidth={1.7}
                  />
                </div>

                <ChevronRight
                  size={18}
                  strokeWidth={1.8}
                  className="mt-1 text-[#55565c] transition duration-200 group-hover:translate-x-1 group-hover:text-[#9b9ca2]"
                />
              </div>

              <div className="mt-auto pt-10">
                <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-[#f5f5f7]">
                  Logic Lab
                </h3>

                <p className="mt-2 max-w-sm text-[14px] leading-6 text-[#86868b]">
                  Mathematische Logik, Mustererkennung und
                  prozedural generierte Herausforderungen.
                </p>
              </div>
            </div>
          </Link>


        </div>
      </section>
    </div>
  )
}