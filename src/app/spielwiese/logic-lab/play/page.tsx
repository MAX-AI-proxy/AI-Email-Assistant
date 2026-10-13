"use client"

import Link from "next/link"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"

import {
  ArrowLeft,
  Calculator,
  CheckCircle2,
  Clock3,
  Eye,
  Grid3X3,
  Infinity,
  ListOrdered,
  RefreshCw,
  Sigma,
  Trophy,
} from "lucide-react"

import ConfirmDialog from "@/components/confirm-dialog"

import AnswerControls from "@/components/logic-lab/answer-controls"

import QuestionView from "@/components/logic-lab/question-view"

import {
  generateLogicQuestion,
} from "@/lib/logic-lab/generator"

import type {
  LogicCategorySelection,
} from "@/lib/logic-lab/generator"

import {
  checkLogicAnswer,
} from "@/lib/logic-lab/math-engine"

import {
  loadLogicStats,
  recordLogicResult,
} from "@/lib/logic-lab/statistics"

import type {
  LogicDifficulty,
  LogicQuestion,
  LogicStats,
} from "@/lib/logic-lab/types"

type PlayMode =
  | "quick"
  | "endless"

type QuestionStatus =
  | "playing"
  | "correct"
  | "revealed"

type LogicTaskSlot = {
  question:
    LogicQuestion

  answer:
    string

  attempts:
    number

  hintsUsed:
    number

  status:
    QuestionStatus

  feedback:
    string

  elapsedSeconds:
    number

  questionScore:
    number
}

type StoredTaskSlots = {
  version: 1

  slots: Record<
    string,
    LogicTaskSlot
  >
}

const DIFFICULTY_STORAGE =
  "max-ai-logic-lab-difficulty"

const CATEGORY_STORAGE =
  "max-ai-logic-lab-category"

const TASK_SLOTS_STORAGE =
  "max-ai-logic-lab-task-slots-v1"

const difficulties: {
  id:
    LogicDifficulty

  name:
    string
}[] = [
  {
    id: "normal",
    name: "Normal",
  },
  {
    id: "hard",
    name: "Hard",
  },
  {
    id: "expert",
    name: "Expert",
  },
]

const categories: {
  id:
    LogicCategorySelection

  name:
    string

  shortName:
    string

  icon:
    typeof ListOrdered
}[] = [
  {
    id: "all",
    name:
      "All Categories",
    shortName:
      "Alle",
    icon:
      Trophy,
  },
  {
    id:
      "number-sequences",
    name:
      "Number Sequences",
    shortName:
      "Sequences",
    icon:
      ListOrdered,
  },
  {
    id:
      "number-grids",
    name:
      "Number Grids",
    shortName:
      "Grids",
    icon:
      Grid3X3,
  },
  {
    id:
      "math-logic",
    name:
      "Math Logic",
    shortName:
      "Math",
    icon:
      Calculator,
  },
  {
    id:
      "derivatives",
    name:
      "Derivatives",
    shortName:
      "Ableiten",
    icon:
      Sigma,
  },
  {
    id:
      "integrals",
    name:
      "Integrals",
    shortName:
      "Integrale",
    icon:
      Sigma,
  },
  {
    id:
      "limits",
    name:
      "Limits",
    shortName:
      "Limits",
    icon:
      Infinity,
  },
]

function isDifficulty(
  value:
    string | null
): value is LogicDifficulty {
  return (
    value === "normal" ||
    value === "hard" ||
    value === "expert"
  )
}

function isCategorySelection(
  value:
    string | null
): value is LogicCategorySelection {
  return (
    value === "all" ||
    value ===
      "number-sequences" ||
    value ===
      "number-grids" ||
    value ===
      "math-logic" ||
    value ===
      "derivatives" ||
    value ===
      "integrals" ||
    value ===
      "limits"
  )
}

function difficultyLabel(
  difficulty:
    LogicDifficulty
) {
  if (
    difficulty ===
    "normal"
  ) {
    return "NORMAL"
  }

  if (
    difficulty ===
    "hard"
  ) {
    return "HARD"
  }

  return "EXPERT"
}

function calculateScore(
  difficulty:
    LogicDifficulty,

  seconds:
    number,

  wrongAttempts:
    number,

  hintsUsed:
    number
) {
  const base =
    difficulty ===
    "normal"
      ? 100
      : difficulty ===
          "hard"
        ? 140
        : 180

  const attemptPenalty =
    wrongAttempts * 12

  const hintPenalty =
    hintsUsed * 18

  const timePenalty =
    Math.min(
      35,

      Math.floor(
        Math.max(
          0,
          seconds - 20
        ) / 10
      ) * 3
    )

  return Math.max(
    20,

    base -
      attemptPenalty -
      hintPenalty -
      timePenalty
  )
}

function formatTime(
  seconds:
    number
) {
  const minutes =
    Math.floor(
      seconds / 60
    )

  const remaining =
    seconds % 60

  if (
    minutes === 0
  ) {
    return `${remaining} s`
  }

  return `${minutes}:${String(
    remaining
  ).padStart(
    2,
    "0"
  )}`
}

function getSlotKey(
  category:
    LogicCategorySelection,

  difficulty:
    LogicDifficulty
) {
  return `${category}:${difficulty}`
}

function loadTaskSlots(): Record<
  string,
  LogicTaskSlot
> {
  try {
    const stored =
      localStorage.getItem(
        TASK_SLOTS_STORAGE
      )

    if (!stored) {
      return {}
    }

    const parsed =
      JSON.parse(
        stored
      ) as StoredTaskSlots

    if (
      parsed.version !==
        1 ||
      !parsed.slots ||
      typeof parsed.slots !==
        "object"
    ) {
      return {}
    }

    return parsed.slots
  } catch {
    return {}
  }
}

function solutionText(
  question:
    LogicQuestion
) {
  if (
    question.solutionDisplay
  ) {
    return question.solutionDisplay
  }

  return String(
    question.answer
  )
}

export default function LogicLabPlayPage() {
  const taskSlotsRef =
    useRef<
      Record<
        string,
        LogicTaskSlot
      >
    >({})

  const [
    hydrated,
    setHydrated,
  ] =
    useState(false)

  const [
    mode,
    setMode,
  ] =
    useState<PlayMode>(
      "quick"
    )

  const [
    difficulty,
    setDifficulty,
  ] =
    useState<LogicDifficulty>(
      "normal"
    )

  const [
    category,
    setCategory,
  ] =
    useState<LogicCategorySelection>(
      "all"
    )

  const [
    question,
    setQuestion,
  ] =
    useState<LogicQuestion | null>(
      null
    )

  const [
    answer,
    setAnswer,
  ] =
    useState("")

  const [
    attempts,
    setAttempts,
  ] =
    useState(0)

  const [
    hintsUsed,
    setHintsUsed,
  ] =
    useState(0)

  const [
    status,
    setStatus,
  ] =
    useState<QuestionStatus>(
      "playing"
    )

  const [
    feedback,
    setFeedback,
  ] =
    useState("")

  const [
    startedAt,
    setStartedAt,
  ] =
    useState(0)

  const [
    elapsedSeconds,
    setElapsedSeconds,
  ] =
    useState(0)

  const [
    questionScore,
    setQuestionScore,
  ] =
    useState(0)

  const [
    sessionScore,
    setSessionScore,
  ] =
    useState(0)

  const [
    questionNumber,
    setQuestionNumber,
  ] =
    useState(1)

  const [
    stats,
    setStats,
  ] =
    useState<LogicStats | null>(
      null
    )

  const [
    confirmNewQuestionOpen,
    setConfirmNewQuestionOpen,
  ] =
    useState(false)

  const writeTaskSlots =
    useCallback(
      (
        slots: Record<
          string,
          LogicTaskSlot
        >
      ) => {
        taskSlotsRef.current =
          slots

        const stored:
          StoredTaskSlots = {
            version: 1,

            slots,
          }

        localStorage.setItem(
          TASK_SLOTS_STORAGE,

          JSON.stringify(
            stored
          )
        )
      },
      []
    )

  const storeSlot =
    useCallback(
      (
        key:
          string,

        slot:
          LogicTaskSlot
      ) => {
        writeTaskSlots({
          ...taskSlotsRef.current,

          [key]:
            slot,
        })
      },
      [
        writeTaskSlots,
      ]
    )

  const createFreshSlot =
    useCallback(
      (
        level:
          LogicDifficulty,

        selectedCategory:
          LogicCategorySelection
      ): LogicTaskSlot => {
        return {
          question:
            generateLogicQuestion(
              selectedCategory,
              level
            ),

          answer: "",

          attempts: 0,

          hintsUsed: 0,

          status:
            "playing",

          feedback: "",

          elapsedSeconds:
            0,

          questionScore:
            0,
        }
      },
      []
    )

  const applySlot =
    useCallback(
      (
        slot:
          LogicTaskSlot
      ) => {
        setQuestion(
          slot.question
        )

        setAnswer(
          slot.answer
        )

        setAttempts(
          slot.attempts
        )

        setHintsUsed(
          slot.hintsUsed
        )

        setStatus(
          slot.status
        )

        setFeedback(
          slot.feedback
        )

        setElapsedSeconds(
          slot.elapsedSeconds
        )

        setQuestionScore(
          slot.questionScore
        )

        if (
          slot.status ===
          "playing"
        ) {
          setStartedAt(
            Date.now() -
              slot.elapsedSeconds *
                1000
          )
        } else {
          setStartedAt(
            0
          )
        }
      },
      []
    )

  const openSlot =
    useCallback(
      (
        level:
          LogicDifficulty,

        selectedCategory:
          LogicCategorySelection
      ) => {
        const key =
          getSlotKey(
            selectedCategory,
            level
          )

        const existing =
          taskSlotsRef.current[
            key
          ]

        if (
          existing
        ) {
          applySlot(
            existing
          )

          return
        }

        const fresh =
          createFreshSlot(
            level,
            selectedCategory
          )

        storeSlot(
          key,
          fresh
        )

        applySlot(
          fresh
        )
      },
      [
        applySlot,
        createFreshSlot,
        storeSlot,
      ]
    )

  useEffect(() => {
    const timer = window.setTimeout(() => {
    const params =
      new URLSearchParams(
        window.location.search
      )

    const requestedMode =
      params.get(
        "mode"
      )

    const requestedCategory =
      params.get(
        "category"
      )

    const nextMode:
      PlayMode =
        requestedMode ===
        "endless"
          ? "endless"
          : "quick"

    const savedDifficulty =
      localStorage.getItem(
        DIFFICULTY_STORAGE
      )

    const savedCategory =
      localStorage.getItem(
        CATEGORY_STORAGE
      )

    const nextDifficulty =
      isDifficulty(
        savedDifficulty
      )
        ? savedDifficulty
        : "normal"

    const nextCategory =
      isCategorySelection(
        requestedCategory
      )
        ? requestedCategory
        : isCategorySelection(
              savedCategory
            )
          ? savedCategory
          : "all"

    taskSlotsRef.current =
      loadTaskSlots()

    setMode(
      nextMode
    )

    setDifficulty(
      nextDifficulty
    )

    setCategory(
      nextCategory
    )

    setStats(
      loadLogicStats()
    )

    openSlot(
      nextDifficulty,
      nextCategory
    )

    setHydrated(
      true
    )
    }, 0)
    return () => window.clearTimeout(timer)
  }, [
    openSlot,
  ])

  useEffect(() => {
    if (
      !hydrated ||
      !question
    ) {
      return
    }

    const key =
      getSlotKey(
        category,
        difficulty
      )

    storeSlot(
      key,
      {
        question,

        answer,

        attempts,

        hintsUsed,

        status,

        feedback,

        elapsedSeconds,

        questionScore,
      }
    )
  }, [
    hydrated,
    question,
    answer,
    attempts,
    hintsUsed,
    status,
    feedback,
    elapsedSeconds,
    questionScore,
    category,
    difficulty,
    storeSlot,
  ])

  useEffect(() => {
    if (
      status !==
        "playing" ||
      !question ||
      startedAt ===
        0
    ) {
      return
    }

    const timer =
      window.setInterval(
        () => {
          setElapsedSeconds(
            Math.floor(
              (
                Date.now() -
                startedAt
              ) / 1000
            )
          )
        },
        1000
      )

    return () => {
      window.clearInterval(
        timer
      )
    }
  }, [
    status,
    question,
    startedAt,
  ])

  const saveCurrentSlot =
    useCallback(() => {
      if (
        !question
      ) {
        return
      }

      const key =
        getSlotKey(
          category,
          difficulty
        )

      storeSlot(
        key,
        {
          question,

          answer,

          attempts,

          hintsUsed,

          status,

          feedback,

          elapsedSeconds,

          questionScore,
        }
      )
    }, [
      question,
      category,
      difficulty,
      answer,
      attempts,
      hintsUsed,
      status,
      feedback,
      elapsedSeconds,
      questionScore,
      storeSlot,
    ])

  function hasInteraction() {
    return (
      answer.trim() !==
        "" ||
      attempts > 0 ||
      hintsUsed > 0
    )
  }

  function replaceCurrentQuestion() {
    const fresh =
      createFreshSlot(
        difficulty,
        category
      )

    const key =
      getSlotKey(
        category,
        difficulty
      )

    storeSlot(
      key,
      fresh
    )

    applySlot(
      fresh
    )

    setQuestionNumber(
      (
        current
      ) =>
        current + 1
    )
  }

  function requestNewQuestion() {
    if (
      status ===
        "playing" &&
      hasInteraction()
    ) {
      setConfirmNewQuestionOpen(
        true
      )

      return
    }

    replaceCurrentQuestion()
  }

  function changeDifficulty(
    level:
      LogicDifficulty
  ) {
    if (
      level ===
      difficulty
    ) {
      return
    }

    saveCurrentSlot()

    setDifficulty(
      level
    )

    localStorage.setItem(
      DIFFICULTY_STORAGE,
      level
    )

    openSlot(
      level,
      category
    )
  }

  function changeCategory(
    selectedCategory:
      LogicCategorySelection
  ) {
    if (
      selectedCategory ===
      category
    ) {
      return
    }

    saveCurrentSlot()

    setCategory(
      selectedCategory
    )

    localStorage.setItem(
      CATEGORY_STORAGE,
      selectedCategory
    )

    openSlot(
      difficulty,
      selectedCategory
    )
  }

  function completeQuestion(
    correct:
      boolean,

    score:
      number,

    finalAttempts:
      number
  ) {
    if (
      !question
    ) {
      return
    }

    const seconds =
      Math.max(
        1,

        Math.floor(
          (
            Date.now() -
            startedAt
          ) / 1000
        )
      )

    setElapsedSeconds(
      seconds
    )

    const nextStats =
      recordLogicResult({
        questionId:
          question.id,

        category:
          question.category,

        difficulty:
          question.difficulty,

        correct,

        timeSeconds:
          seconds,

        attempts:
          finalAttempts,

        hintsUsed,

        score,

        createdAt:
          new Date()
            .toISOString(),
      })

    setStats(
      nextStats
    )

    if (
      correct
    ) {
      setSessionScore(
        (
          current
        ) =>
          current +
          score
      )
    }
  }

  function submitAnswer() {
    if (
      !question ||
      status !==
        "playing"
    ) {
      return
    }

    const result =
      checkLogicAnswer(
        question,
        answer
      )

    if (
      !result.valid
    ) {
      setFeedback(
        result.message ??
          "Die Eingabe konnte nicht geprüft werden."
      )

      return
    }

    if (
      result.correct
    ) {
      const seconds =
        Math.max(
          1,

          Math.floor(
            (
              Date.now() -
              startedAt
            ) / 1000
          )
        )

      const score =
        calculateScore(
          question.difficulty,

          seconds,

          attempts,

          hintsUsed
        )

      setQuestionScore(
        score
      )

      setStatus(
        "correct"
      )

      setFeedback("")

      completeQuestion(
        true,

        score,

        attempts +
          1
      )

      return
    }

    setAttempts(
      (
        current
      ) =>
        current + 1
    )

    setFeedback(
      "Noch nicht richtig. Versuch es noch einmal."
    )
  }

  function requestHint() {
    if (
      !question ||
      status !==
        "playing"
    ) {
      return
    }

    setHintsUsed(
      (
        current
      ) =>
        Math.min(
          3,
          current + 1
        )
    )
  }

  function revealSolution() {
    if (
      !question ||
      status !==
        "playing"
    ) {
      return
    }

    setStatus(
      "revealed"
    )

    setQuestionScore(
      0
    )

    setFeedback("")

    completeQuestion(
      false,
      0,
      attempts
    )
  }

  const accuracy =
    stats &&
    stats.solved > 0
      ? Math.round(
          (
            stats.correct /
            stats.solved
          ) * 100
        )
      : 0

  const averageTime =
    stats &&
    stats.solved > 0
      ? Math.round(
          stats.totalTimeSeconds /
            stats.solved
        )
      : 0

  const currentCategoryStats =
    question
      ? stats
          ?.byCategory[
            question.category
          ]
      : undefined

  const categoryAccuracy =
    currentCategoryStats &&
    currentCategoryStats
      .solved > 0
      ? Math.round(
          (
            currentCategoryStats
              .correct /
            currentCategoryStats
              .solved
          ) * 100
        )
      : 0

  if (
    !question
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[14px] text-[#77787e]">
        Logic Lab wird
        vorbereitet …
      </div>
    )
  }

  return (
    <div className="w-full px-5 pb-16 pt-8 md:px-10 md:pt-12 lg:px-12">
      <div className="mx-auto max-w-[1120px]">
        <header className="mb-8">
          <Link
            href="/spielwiese/logic-lab"
            className="mb-6 flex w-fit items-center gap-1.5 text-[13px] text-[#77787e] transition hover:text-white"
          >
            <ArrowLeft
              size={15}
              strokeWidth={1.8}
            />

            Logic Lab
          </Link>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-[32px] font-semibold tracking-[-0.04em] text-[#f5f5f7] md:text-[38px]">
                {mode ===
                "endless"
                  ? "Endless"
                  : "Quick Play"}
              </h1>

              <p className="mt-2 text-[14px] text-[#77787e]">
                {category ===
                "all"
                  ? "Zufällige Kategorien"
                  : categories.find(
                      (
                        item
                      ) =>
                        item.id ===
                        category
                    )?.name}
              </p>
            </div>

            <button
              onClick={
                requestNewQuestion
              }
              className="flex h-10 w-fit items-center gap-2 rounded-[10px] bg-white/[0.06] px-4 text-[13px] font-medium text-[#c7c7cb] transition hover:bg-white/[0.10] hover:text-white"
            >
              <RefreshCw
                size={15}
                strokeWidth={1.8}
              />

              Neue Aufgabe
            </button>
          </div>
        </header>

        <section className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#56575d]">
              Kategorie
            </p>

            <div className="flex flex-wrap gap-2">
              {categories.map(
                (
                  item
                ) => {
                  const Icon =
                    item.icon

                  return (
                    <button
                      key={
                        item.id
                      }
                      onClick={() =>
                        changeCategory(
                          item.id
                        )
                      }
                      className={`flex h-9 items-center gap-2 rounded-[9px] px-3 text-[12px] font-medium transition ${
                        category ===
                        item.id
                          ? "bg-white/[0.10] text-white"
                          : "bg-white/[0.035] text-[#77787e] hover:bg-white/[0.07] hover:text-white"
                      }`}
                    >
                      <Icon
                        size={14}
                        strokeWidth={1.7}
                      />

                      {
                        item.shortName
                      }
                    </button>
                  )
                }
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#56575d] lg:text-right">
              Schwierigkeit
            </p>

            <div className="flex flex-wrap gap-2">
              {difficulties.map(
                (
                  level
                ) => (
                  <button
                    key={
                      level.id
                    }
                    onClick={() =>
                      changeDifficulty(
                        level.id
                      )
                    }
                    className={`h-9 rounded-[9px] px-4 text-[12px] font-medium transition ${
                      difficulty ===
                      level.id
                        ? "bg-white/[0.10] text-white"
                        : "bg-white/[0.035] text-[#77787e] hover:bg-white/[0.07] hover:text-white"
                    }`}
                  >
                    {
                      level.name
                    }
                  </button>
                )
              )}
            </div>
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
          <main>
            <section className="overflow-hidden rounded-[22px] border border-white/[0.07] bg-[#15171b]">
              <div className="border-b border-white/[0.06] px-6 py-5 md:px-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-[#77787e]">
                    {
                      question.categoryLabel
                    }{" "}
                    ·{" "}
                    {difficultyLabel(
                      question.difficulty
                    )}
                  </p>

                  <div className="flex items-center gap-2 text-[12px] text-[#66676d]">
                    <Clock3
                      size={14}
                      strokeWidth={1.7}
                    />

                    {formatTime(
                      elapsedSeconds
                    )}
                  </div>
                </div>
              </div>

              <div className="px-5 py-10 md:px-8 md:py-14">
                <QuestionView
                  question={
                    question
                  }
                />

                {status ===
                  "playing" && (
                  <AnswerControls
                    question={
                      question
                    }
                    answer={
                      answer
                    }
                    setAnswer={
                      setAnswer
                    }
                    feedback={
                      feedback
                    }
                    hintsUsed={
                      hintsUsed
                    }
                    onSubmit={
                      submitAnswer
                    }
                    onHint={
                      requestHint
                    }
                    onReveal={
                      revealSolution
                    }
                  />
                )}

                {hintsUsed >
                  0 &&
                  status ===
                    "playing" && (
                    <div className="mx-auto mt-7 max-w-[600px] space-y-2">
                      {question.hints
                        .slice(
                          0,
                          hintsUsed
                        )
                        .map(
                          (
                            hint,
                            index
                          ) => (
                            <div
                              key={
                                index
                              }
                              className="rounded-[12px] border border-[#ff9f0a]/10 bg-[#ff9f0a]/[0.055] px-4 py-3"
                            >
                              <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#c48628]">
                                Hint{" "}
                                {index +
                                  1}
                              </p>

                              <p className="mt-1 text-[13px] leading-5 text-[#aaa39a]">
                                {
                                  hint
                                }
                              </p>
                            </div>
                          )
                        )}
                    </div>
                  )}

                {status !==
                  "playing" && (
                  <div className="mx-auto mt-8 max-w-[650px]">
                    <div
                      className={`rounded-[16px] border p-5 ${
                        status ===
                        "correct"
                          ? "border-[#30d158]/15 bg-[#30d158]/[0.055]"
                          : "border-[#ff9f0a]/15 bg-[#ff9f0a]/[0.045]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {status ===
                        "correct" ? (
                          <CheckCircle2
                            size={21}
                            strokeWidth={1.8}
                            className="mt-0.5 shrink-0 text-[#30d158]"
                          />
                        ) : (
                          <Eye
                            size={20}
                            strokeWidth={1.8}
                            className="mt-0.5 shrink-0 text-[#ff9f0a]"
                          />
                        )}

                        <div>
                          <p className="text-[16px] font-semibold text-[#f5f5f7]">
                            {status ===
                            "correct"
                              ? "Correct"
                              : "Solution"}
                          </p>

                          <p className="mt-2 break-words font-mono text-[13px] leading-6 text-[#aaaab0]">
                            {
                              solutionText(
                                question
                              )
                            }
                          </p>

                          {status ===
                            "correct" && (
                            <p className="mt-2 text-[14px] font-semibold text-[#30d158]">
                              +
                              {
                                questionScore
                              }{" "}
                              Punkte
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 rounded-[16px] border border-white/[0.06] bg-white/[0.02] p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#626369]">
                        Lösungsweg
                      </p>

                      <p className="mt-3 text-[14px] font-medium text-[#d7d7da]">
                        {
                          question.ruleLabel
                        }
                      </p>

                      <div className="mt-3 space-y-2">
                        {question.explanation.map(
                          (
                            line,
                            index
                          ) => (
                            <p
                              key={
                                index
                              }
                              className="text-[13px] leading-5 text-[#85868c]"
                            >
                              {
                                line
                              }
                            </p>
                          )
                        )}
                      </div>
                    </div>

                    <button
                      onClick={
                        replaceCurrentQuestion
                      }
                      className="mt-4 h-11 w-full rounded-[11px] bg-white/[0.07] text-[13px] font-semibold text-[#dedee1] transition hover:bg-white/[0.11] hover:text-white"
                    >
                      {mode ===
                      "endless"
                        ? "Nächste Aufgabe"
                        : "Neue Quick-Play-Aufgabe"}
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] px-6 py-4 text-[11px] text-[#5e5f65] md:px-8">
                <span>
                  Question{" "}
                  {
                    questionNumber
                  }
                </span>

                <span>
                  Fehlversuche:{" "}
                  {
                    attempts
                  }
                </span>

                <span>
                  Session Score:{" "}
                  {
                    sessionScore
                  }
                </span>
              </div>
            </section>
          </main>

          <aside className="space-y-4">
            <div className="rounded-[18px] border border-white/[0.07] bg-[#15171b] p-5">
              <div className="flex items-center gap-2">
                <Trophy
                  size={16}
                  strokeWidth={1.7}
                  className="text-[#77787e]"
                />

                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#626369]">
                  Performance
                </p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5 lg:grid-cols-1">
                <div>
                  <p className="text-[11px] text-[#626369]">
                    Gelöst
                  </p>

                  <p className="mt-1 text-[20px] font-semibold">
                    {stats
                      ?.solved ??
                      0}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] text-[#626369]">
                    Genauigkeit
                  </p>

                  <p className="mt-1 text-[20px] font-semibold">
                    {
                      accuracy
                    }{" "}
                    %
                  </p>
                </div>

                <div>
                  <p className="text-[11px] text-[#626369]">
                    Ø Zeit
                  </p>

                  <p className="mt-1 text-[20px] font-semibold">
                    {formatTime(
                      averageTime
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] text-[#626369]">
                    Gesamtpunkte
                  </p>

                  <p className="mt-1 text-[20px] font-semibold">
                    {stats
                      ?.totalScore ??
                      0}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[18px] border border-white/[0.07] bg-[#15171b] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#626369]">
                Aktuelle Kategorie
              </p>

              <p className="mt-3 text-[14px] font-medium text-[#d7d7da]">
                {
                  question.categoryLabel
                }
              </p>

              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] text-[#626369]">
                    Gelöst
                  </p>

                  <p className="mt-1 text-[18px] font-semibold">
                    {currentCategoryStats
                      ?.solved ??
                      0}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[11px] text-[#626369]">
                    Genauigkeit
                  </p>

                  <p className="mt-1 text-[18px] font-semibold">
                    {
                      categoryAccuracy
                    }{" "}
                    %
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[18px] border border-white/[0.06] bg-white/[0.018] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#56575d]">
                Aufgaben-Speicher
              </p>

              <p className="mt-3 text-[12px] leading-5 text-[#707177]">
                Jede Kombination aus
                Kategorie und
                Schwierigkeit behält
                ihre eigene aktuelle
                Aufgabe.
              </p>
            </div>
          </aside>
        </div>
      </div>

      <ConfirmDialog
        open={
          confirmNewQuestionOpen
        }
        title="Neue Aufgabe starten?"
        description="Die aktuelle Aufgabe dieses Schwierigkeitsgrads wird verworfen und durch eine neue Aufgabe ersetzt."
        confirmLabel="Neue Aufgabe"
        destructive
        onCancel={() =>
          setConfirmNewQuestionOpen(
            false
          )
        }
        onConfirm={() => {
          setConfirmNewQuestionOpen(
            false
          )

          replaceCurrentQuestion()
        }}
      />
    </div>
  )
}