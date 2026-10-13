import {
  generateDerivative,
} from "./derivatives"

import {
  generateNumberGrid,
} from "./grids"

import {
  generateIntegral,
} from "./integrals"

import {
  generateLimit,
} from "./limits"

import {
  generateMathLogic,
} from "./math-logic"

import {
  choice,
} from "./random"

import {
  generateNumberSequence,
} from "./sequences"

import type {
  LogicCategory,
  LogicDifficulty,
  LogicQuestion,
} from "./types"

export type LogicCategorySelection =
  | "all"
  | LogicCategory

export const availableLogicCategories:
  LogicCategory[] = [
    "number-sequences",
    "number-grids",
    "math-logic",
    "derivatives",
    "integrals",
    "limits",
  ]

export function generateLogicQuestion(
  selection:
    LogicCategorySelection,

  difficulty:
    LogicDifficulty
): LogicQuestion {
  const category =
    selection === "all"
      ? choice(
          availableLogicCategories
        )
      : selection

  if (
    category ===
    "number-grids"
  ) {
    return generateNumberGrid(
      difficulty
    )
  }

  if (
    category ===
    "math-logic"
  ) {
    return generateMathLogic(
      difficulty
    )
  }

  if (
    category ===
    "derivatives"
  ) {
    return generateDerivative(
      difficulty
    )
  }

  if (
    category ===
    "integrals"
  ) {
    return generateIntegral(
      difficulty
    )
  }

  if (
    category ===
    "limits"
  ) {
    return generateLimit(
      difficulty
    )
  }

  return generateNumberSequence(
    difficulty
  )
}