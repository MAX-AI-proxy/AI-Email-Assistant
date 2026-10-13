import {
  Eye,
  Lightbulb,
  Send,
} from "lucide-react"

import MathField from "./math-field"

import type {
  LogicQuestion,
} from "@/lib/logic-lab/types"

function operatorSymbol(
  value: string
) {
  if (
    value === "*"
  ) {
    return "×"
  }

  if (
    value === "/"
  ) {
    return "÷"
  }

  return value
}

export default function AnswerControls({
  question,
  answer,
  setAnswer,
  feedback,
  hintsUsed,
  onSubmit,
  onHint,
  onReveal,
}: {
  question:
    LogicQuestion

  answer:
    string

  setAnswer:
    (
      value: string
    ) => void

  feedback:
    string

  hintsUsed:
    number

  onSubmit:
    () => void

  onHint:
    () => void

  onReveal:
    () => void
}) {
  const operatorQuestion =
    question.category ===
      "math-logic" &&
    question.answerType ===
      "operators" &&
    question.operatorPuzzle

  const expressionQuestion =
    question.answerType ===
      "expression" ||
    question.answerType ===
      "antiderivative"

  if (
    operatorQuestion
  ) {
    const tokens =
      answer
        ? answer.split(
            "|"
          )
        : []

    return (
      <div className="mx-auto mt-10 max-w-[520px]">
        <p className="mb-3 text-center text-[12px] font-medium text-[#77787e]">
          Operatoren auswählen
        </p>

        <div className="space-y-3">
          {Array.from(
            {
              length:
                operatorQuestion.slots,
            },
            (
              _,
              slotIndex
            ) => (
              <div
                key={
                  slotIndex
                }
                className="grid grid-cols-[90px_1fr] items-center gap-3"
              >
                <span className="text-[12px] text-[#66676d]">
                  Operator{" "}
                  {
                    slotIndex +
                    1
                  }
                </span>

                <div
                  className={`grid gap-2 ${
                    operatorQuestion
                      .options
                      .length ===
                    4
                      ? "grid-cols-4"
                      : "grid-cols-3"
                  }`}
                >
                  {operatorQuestion.options.map(
                    (
                      option
                    ) => (
                      <button
                        key={
                          option
                        }
                        type="button"
                        onClick={() => {
                          const next =
                            Array.from(
                              {
                                length:
                                  operatorQuestion.slots,
                              },
                              (
                                _,
                                index
                              ) =>
                                tokens[
                                  index
                                ] ??
                                ""
                            )

                          next[
                            slotIndex
                          ] =
                            option

                          setAnswer(
                            next.join(
                              "|"
                            )
                          )
                        }}
                        className={`h-11 rounded-[10px] text-[18px] font-semibold transition ${
                          tokens[
                            slotIndex
                          ] ===
                          option
                            ? "bg-[#0a84ff]/20 text-[#64a8ff]"
                            : "bg-white/[0.05] text-[#aaaab0] hover:bg-white/[0.09] hover:text-white"
                        }`}
                      >
                        {operatorSymbol(
                          option
                        )}
                      </button>
                    )
                  )}
                </div>
              </div>
            )
          )}
        </div>

        {feedback && (
          <p className="mt-3 text-[12px] text-[#ff6961]">
            {
              feedback
            }
          </p>
        )}

        <ActionButtons
          hintsUsed={
            hintsUsed
          }
          onSubmit={
            onSubmit
          }
          onHint={
            onHint
          }
          onReveal={
            onReveal
          }
        />
      </div>
    )
  }

  if (
    expressionQuestion
  ) {
    return (
      <div className="mx-auto mt-10 max-w-[600px]">
        <label className="mb-2 block text-[12px] font-medium text-[#77787e]">
          Deine Antwort
        </label>

        <MathField
          value={
            answer
          }
          onChange={
            setAnswer
          }
          variant="input"
          ariaLabel="Mathematische Antwort"
        />

        <p className="mt-2 text-[11px] leading-5 text-[#56575d]">
          Brüche, Potenzen, Wurzeln und Funktionen werden direkt in mathematischer Schreibweise dargestellt.
        </p>

        {feedback && (
          <p className="mt-2 text-[12px] text-[#ff6961]">
            {
              feedback
            }
          </p>
        )}

        <ActionButtons
          hintsUsed={
            hintsUsed
          }
          onSubmit={
            onSubmit
          }
          onHint={
            onHint
          }
          onReveal={
            onReveal
          }
        />
      </div>
    )
  }

  return (
    <form
      onSubmit={(
        event
      ) => {
        event.preventDefault()

        onSubmit()
      }}
      className="mx-auto mt-10 max-w-[520px]"
    >
      <label className="mb-2 block text-[12px] font-medium text-[#77787e]">
        Deine Antwort
      </label>

      <input
        value={
          answer
        }
        onChange={(
          event
        ) =>
          setAnswer(
            event.target.value
          )
        }
        inputMode="decimal"
        autoFocus
        placeholder="?"
        className="h-14 w-full rounded-[12px] border border-white/[0.08] bg-[#0f1114] px-4 text-center text-[22px] font-medium text-white outline-none transition placeholder:text-[#46474d] focus:border-[#0a84ff]/60"
      />

      {feedback && (
        <p className="mt-2 text-[12px] text-[#ff6961]">
          {
            feedback
          }
        </p>
      )}

      <ActionButtons
        hintsUsed={
          hintsUsed
        }
        onSubmit={
          onSubmit
        }
        onHint={
          onHint
        }
        onReveal={
          onReveal
        }
      />
    </form>
  )
}

function ActionButtons({
  hintsUsed,
  onSubmit,
  onHint,
  onReveal,
}: {
  hintsUsed:
    number

  onSubmit:
    () => void

  onHint:
    () => void

  onReveal:
    () => void
}) {
  return (
    <div className="mt-4 grid grid-cols-3 gap-2">
      <button
        type="button"
        onClick={
          onSubmit
        }
        className="flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[#0a84ff] text-[13px] font-semibold text-white transition hover:bg-[#2997ff]"
      >
        <Send
          size={15}
          strokeWidth={1.8}
        />

        Submit
      </button>

      <button
        type="button"
        onClick={
          onHint
        }
        disabled={
          hintsUsed >=
          3
        }
        className="flex h-11 items-center justify-center gap-2 rounded-[10px] bg-white/[0.055] text-[13px] font-medium text-[#aaaab0] transition hover:bg-white/[0.09] hover:text-white disabled:cursor-default disabled:opacity-40"
      >
        <Lightbulb
          size={15}
          strokeWidth={1.8}
        />

        Hint
      </button>

      <button
        type="button"
        onClick={
          onReveal
        }
        className="flex h-11 items-center justify-center gap-2 rounded-[10px] bg-white/[0.035] text-[13px] font-medium text-[#77787e] transition hover:bg-white/[0.07] hover:text-white"
      >
        <Eye
          size={15}
          strokeWidth={1.8}
        />

        Lösung
      </button>
    </div>
  )
}