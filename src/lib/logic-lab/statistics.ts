import type {
  LogicCategoryStats,
  LogicResult,
  LogicStats,
} from "./types"

const STORAGE_KEY =
  "max-ai-logic-lab-stats-v1"

function createEmptyStats(): LogicStats {
  return {
    version: 1,
    solved: 0,
    correct: 0,
    totalTimeSeconds: 0,
    totalScore: 0,
    byCategory: {},
    recent: [],
  }
}

export function loadLogicStats(): LogicStats {
  if (
    typeof window ===
    "undefined"
  ) {
    return createEmptyStats()
  }

  const stored =
    localStorage.getItem(
      STORAGE_KEY
    )

  if (!stored) {
    return createEmptyStats()
  }

  try {
    const parsed =
      JSON.parse(
        stored
      ) as LogicStats

    if (
      parsed.version !== 1
    ) {
      return createEmptyStats()
    }

    return parsed
  } catch {
    return createEmptyStats()
  }
}

export function recordLogicResult(
  result: LogicResult
): LogicStats {
  const stats =
    loadLogicStats()

  stats.solved += 1

  if (result.correct) {
    stats.correct += 1
  }

  stats.totalTimeSeconds +=
    result.timeSeconds

  stats.totalScore +=
    result.score

  const currentCategory:
    LogicCategoryStats =
      stats.byCategory[
        result.category
      ] ?? {
        solved: 0,
        correct: 0,
        totalTimeSeconds: 0,
        totalScore: 0,
      }

  currentCategory.solved += 1

  if (result.correct) {
    currentCategory.correct += 1
  }

  currentCategory.totalTimeSeconds +=
    result.timeSeconds

  currentCategory.totalScore +=
    result.score

  stats.byCategory[
    result.category
  ] = currentCategory

  stats.recent = [
    result,
    ...stats.recent,
  ].slice(0, 50)

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(stats)
  )

  return stats
}