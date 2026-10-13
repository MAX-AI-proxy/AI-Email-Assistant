import { expect, test, vi } from "vitest"
import { generateSudoku } from "@/lib/sudoku"
import { availableLogicCategories, generateLogicQuestion } from "@/lib/logic-lab/generator"
import { antiderivativesEquivalent, checkLogicAnswer, expressionsEquivalent } from "@/lib/logic-lab/math-engine"

function seededRandom(seed: number) {
  let state = seed
  return () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296 }
}
// Independent backtracking solver verifies uniqueness of generated puzzles.
function solutions(board: number[][]): number {
  const copy = board.map(row => [...row])
  const found: number[][][] = []
  function solve() {
    if (found.length >= 2) return
    let best: { r: number; c: number; choices: number[] } | null = null
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
      if (copy[r][c]) continue
      const choices = Array.from({ length: 9 }, (_, i) => i + 1).filter(n =>
        !copy[r].includes(n) && !copy.some(row => row[c] === n) &&
        !copy.slice(Math.floor(r / 3) * 3, Math.floor(r / 3) * 3 + 3).some(row => row.slice(Math.floor(c / 3) * 3, Math.floor(c / 3) * 3 + 3).includes(n)))
      if (!choices.length) return
      if (!best || choices.length < best.choices.length) best = { r, c, choices }
    }
    if (!best) { found.push(copy.map(row => [...row])); return }
    for (const n of best.choices) { copy[best.r][best.c] = n; solve(); copy[best.r][best.c] = 0 }
  }
  solve()
  return found.length
}

test.each(["leicht", "mittel", "schwer"] as const)("Sudoku %s has valid rows, columns, boxes and a unique solution", difficulty => {
  vi.spyOn(Math, "random").mockImplementation(seededRandom(42))
  const { puzzle, solution } = generateSudoku(difficulty)
  const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  for (let i = 0; i < 9; i++) {
    expect([...solution[i]].sort()).toEqual(expected)
    expect(solution.map(row => row[i]).sort()).toEqual(expected)
    const r = Math.floor(i / 3) * 3, c = (i % 3) * 3
    expect(solution.slice(r, r + 3).flatMap(row => row.slice(c, c + 3)).sort()).toEqual(expected)
  }
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (puzzle[r][c]) expect(puzzle[r][c]).toBe(solution[r][c])
  expect(solutions(puzzle)).toBe(1)
})

test.each(availableLogicCategories)("Logic Lab %s generates solvable questions at all difficulties", category => {
  vi.spyOn(Math, "random").mockImplementation(seededRandom(2026))
  for (const difficulty of ["normal", "hard", "expert"] as const) for (let i = 0; i < 8; i++) {
    const question = generateLogicQuestion(category, difficulty)
    expect(question.category).toBe(category)
    expect(question.hints).toHaveLength(3)
    expect(question.explanation.length).toBeGreaterThan(0)
    const result = checkLogicAnswer(question, String(question.answer))
    expect(result.correct, `${category}/${difficulty}: ${String(question.answer)}`).toBe(true)
  }
})

test("symbolic equivalents and arbitrary integration constants are accepted", () => {
  expect(expressionsEquivalent("(x+1)^2", "x^2+2*x+1")).toBe(true)
  expect(expressionsEquivalent("x^2", "x^3")).toBe(false)
  expect(antiderivativesEquivalent("x^3/3+7", "x^2")).toBe(true)
  expect(antiderivativesEquivalent("x^2", "x^2")).toBe(false)
})
