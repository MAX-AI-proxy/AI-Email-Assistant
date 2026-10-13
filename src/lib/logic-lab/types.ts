export type LogicDifficulty =
  | "normal"
  | "hard"
  | "expert"

export type LogicCategory =
  | "number-sequences"
  | "number-grids"
  | "math-logic"
  | "derivatives"
  | "integrals"
  | "limits"

export type LogicAnswerType =
  | "number"
  | "expression"
  | "antiderivative"
  | "operators"

export type LogicQuestionBase = {
  id: string
  category: LogicCategory
  categoryLabel: string
  difficulty: LogicDifficulty
  answer: number | string
  answerType?: LogicAnswerType
  answerVariable?: string
  solutionDisplay?: string
  acceptedAnswers?: string[]
  ruleLabel: string
  hints: [
    string,
    string,
    string,
  ]
  explanation: string[]
}

export type NumberSequenceQuestion =
  LogicQuestionBase & {
    category: "number-sequences"
    sequence: number[]
  }

export type NumberGridQuestion =
  LogicQuestionBase & {
    category: "number-grids"
    grid: (number | null)[][]
    missing: {
      row: number
      column: number
    }
  }

export type MathLogicSubtype =
  | "solve-x"
  | "missing-number"
  | "equation-system"
  | "operators"

export type MathLogicQuestion =
  LogicQuestionBase & {
    category: "math-logic"
    subtype: MathLogicSubtype
    prompt: string
    lines: string[]
    operatorPuzzle?: {
      numbers: number[]
      target: number
      slots: number
      options: string[]
    }
  }

export type CalculusQuestion =
  LogicQuestionBase & {
    category:
      | "derivatives"
      | "integrals"
      | "limits"

    prompt: string
    expression: string
    displayExpression: string
    variable: string

    integrand?: string

    bounds?: {
      from: string
      to: string
    }

    limitTarget?: string
  }

export type LogicQuestion =
  | NumberSequenceQuestion
  | NumberGridQuestion
  | MathLogicQuestion
  | CalculusQuestion

export type LogicResult = {
  questionId: string
  category: LogicCategory
  difficulty: LogicDifficulty
  correct: boolean
  timeSeconds: number
  attempts: number
  hintsUsed: number
  score: number
  createdAt: string
}

export type LogicCategoryStats = {
  solved: number
  correct: number
  totalTimeSeconds: number
  totalScore: number
}

export type LogicStats = {
  version: 1
  solved: number
  correct: number
  totalTimeSeconds: number
  totalScore: number
  byCategory: Partial<
    Record<
      LogicCategory,
      LogicCategoryStats
    >
  >
  recent: LogicResult[]
}