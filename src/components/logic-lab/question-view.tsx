import MathField from "./math-field"

import {
  expressionToLatex,
  limitTargetToLatex,
  mathLineToLatex,
} from "@/lib/logic-lab/math-engine"

import type {
  LogicQuestion,
} from "@/lib/logic-lab/types"

export default function QuestionView({
  question,
}: {
  question:
    LogicQuestion
}) {
  if (
    question.category ===
    "number-grids"
  ) {
    return (
      <div className="mx-auto grid w-full max-w-[420px] grid-cols-3 overflow-hidden rounded-[16px] border-2 border-[#55565d] bg-[#101216]">
        {question.grid.map(
          (
            row,
            rowIndex
          ) =>
            row.map(
              (
                value,
                columnIndex
              ) => {
                const borderRight =
                  columnIndex <
                  2

                const borderBottom =
                  rowIndex <
                  2

                const missing =
                  question
                    .missing
                    .row ===
                    rowIndex &&
                  question
                    .missing
                    .column ===
                    columnIndex

                return (
                  <div
                    key={`${rowIndex}-${columnIndex}`}
                    className={`flex aspect-square items-center justify-center text-[26px] font-semibold tracking-[-0.03em] md:text-[32px] ${
                      borderRight
                        ? "border-r border-r-white/[0.12]"
                        : ""
                    } ${
                      borderBottom
                        ? "border-b border-b-white/[0.12]"
                        : ""
                    } ${
                      missing
                        ? "bg-[#0a84ff]/10 text-[#64a8ff]"
                        : "text-[#f5f5f7]"
                    }`}
                  >
                    {value ===
                    null
                      ? "?"
                      : value}
                  </div>
                )
              }
            )
        )}
      </div>
    )
  }

  if (
    question.category ===
    "number-sequences"
  ) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-4 md:gap-x-6">
        {question.sequence.map(
          (
            value,
            index
          ) => (
            <div
              key={`${value}-${index}`}
              className="flex items-center gap-4 md:gap-6"
            >
              <span className="text-[27px] font-semibold tracking-[-0.035em] text-[#f5f5f7] md:text-[36px]">
                {value}
              </span>

              <span className="text-[18px] text-[#45464c]">
                –
              </span>
            </div>
          )
        )}

        <span className="text-[30px] font-semibold text-[#64a8ff] md:text-[38px]">
          ?
        </span>
      </div>
    )
  }

  if (
    question.category ===
    "math-logic"
  ) {
    return (
      <div className="mx-auto max-w-[680px]">
        <p className="text-center text-[14px] text-[#85868c]">
          {
            question.prompt
          }
        </p>

        <div className="mt-7 space-y-3">
          {question.lines.map(
            (
              line,
              index
            ) => (
              <div
                key={
                  index
                }
                className="rounded-[14px] border border-white/[0.07] bg-[#101216] px-5 py-5"
              >
                <MathField
                  value={
                    mathLineToLatex(
                      line
                    )
                  }
                  readOnly
                  ariaLabel={
                    `Gleichung ${
                      index +
                      1
                    }`
                  }
                />
              </div>
            )
          )}
        </div>
      </div>
    )
  }

  if (
    question.category ===
    "derivatives"
  ) {
    return (
      <div className="mx-auto max-w-[740px] text-center">
        <p className="text-[14px] text-[#85868c]">
          {
            question.prompt
          }
        </p>

        <div className="mt-7 rounded-[16px] border border-white/[0.07] bg-[#101216] px-5 py-8">
          <MathField
            value={`f(x)=${expressionToLatex(
              question.expression
            )}`}
            readOnly
            ariaLabel="Funktion zum Ableiten"
          />
        </div>
      </div>
    )
  }

  if (
    question.category ===
    "integrals"
  ) {
    const expression =
      expressionToLatex(
        question.expression
      )

    const latex =
      question.bounds
        ? `\\int_{${expressionToLatex(
            question.bounds.from
          )}}^{${expressionToLatex(
            question.bounds.to
          )}} ${expression}\\,dx`
        : `\\int ${expression}\\,dx`

    return (
      <div className="mx-auto max-w-[740px] text-center">
        <p className="text-[14px] text-[#85868c]">
          {
            question.prompt
          }
        </p>

        <div className="mt-7 rounded-[16px] border border-white/[0.07] bg-[#101216] px-5 py-8">
          <MathField
            value={
              latex
            }
            readOnly
            ariaLabel="Integral"
          />
        </div>
      </div>
    )
  }

  const target =
    limitTargetToLatex(
      question.limitTarget ??
        "0"
    )

  return (
    <div className="mx-auto max-w-[740px] text-center">
      <p className="text-[14px] text-[#85868c]">
        {
          question.prompt
        }
      </p>

      <div className="mt-7 rounded-[16px] border border-white/[0.07] bg-[#101216] px-5 py-8">
        <MathField
          value={`\\lim_{x\\to ${target}} ${expressionToLatex(
            question.expression
          )}`}
          readOnly
          ariaLabel="Grenzwert"
        />
      </div>
    </div>
  )
}