export type SudokuBoard = number[][]

export type SudokuDifficulty =
  | "leicht"
  | "mittel"
  | "schwer"

export type GeneratedSudoku = {
  puzzle: SudokuBoard
  solution: SudokuBoard
}

const SIZE = 9
const BOX_SIZE = 3

const TARGET_CLUES: Record<
  SudokuDifficulty,
  number
> = {
  leicht: 42,
  mittel: 35,
  schwer: 30,
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items]

  for (
    let i = result.length - 1;
    i > 0;
    i--
  ) {
    const j = Math.floor(
      Math.random() * (i + 1)
    )

    ;[result[i], result[j]] = [
      result[j],
      result[i],
    ]
  }

  return result
}

function pattern(
  row: number,
  column: number
) {
  return (
    (row * BOX_SIZE +
      Math.floor(row / BOX_SIZE) +
      column) %
    SIZE
  )
}

function generateSolvedBoard(): SudokuBoard {
  const base = [0, 1, 2]

  const rows = shuffle(base).flatMap(
    (group) =>
      shuffle(base).map(
        (row) =>
          group * BOX_SIZE + row
      )
  )

  const columns = shuffle(base).flatMap(
    (group) =>
      shuffle(base).map(
        (column) =>
          group * BOX_SIZE + column
      )
  )

  const numbers = shuffle([
    1, 2, 3, 4, 5, 6, 7, 8, 9,
  ])

  return rows.map((row) =>
    columns.map(
      (column) =>
        numbers[
          pattern(row, column)
        ]
    )
  )
}

function getCandidates(
  board: SudokuBoard,
  row: number,
  column: number
): number[] {
  const used = new Set<number>()

  for (
    let index = 0;
    index < SIZE;
    index++
  ) {
    used.add(
      board[row][index]
    )

    used.add(
      board[index][column]
    )
  }

  const boxRow =
    Math.floor(row / BOX_SIZE) *
    BOX_SIZE

  const boxColumn =
    Math.floor(column / BOX_SIZE) *
    BOX_SIZE

  for (
    let currentRow = boxRow;
    currentRow <
    boxRow + BOX_SIZE;
    currentRow++
  ) {
    for (
      let currentColumn =
        boxColumn;
      currentColumn <
      boxColumn + BOX_SIZE;
      currentColumn++
    ) {
      used.add(
        board[currentRow][
          currentColumn
        ]
      )
    }
  }

  const candidates: number[] = []

  for (
    let number = 1;
    number <= SIZE;
    number++
  ) {
    if (!used.has(number)) {
      candidates.push(number)
    }
  }

  return candidates
}

function findBestEmptyCell(
  board: SudokuBoard
):
  | {
      row: number
      column: number
      candidates: number[]
    }
  | null {
  let best:
    | {
        row: number
        column: number
        candidates: number[]
      }
    | null = null

  for (
    let row = 0;
    row < SIZE;
    row++
  ) {
    for (
      let column = 0;
      column < SIZE;
      column++
    ) {
      if (
        board[row][column] !== 0
      ) {
        continue
      }

      const candidates =
        getCandidates(
          board,
          row,
          column
        )

      if (
        candidates.length === 0
      ) {
        return {
          row,
          column,
          candidates: [],
        }
      }

      if (
        !best ||
        candidates.length <
          best.candidates.length
      ) {
        best = {
          row,
          column,
          candidates,
        }
      }

      if (
        candidates.length === 1
      ) {
        return best
      }
    }
  }

  return best
}

function countSolutions(
  originalBoard: SudokuBoard,
  limit = 2
): number {
  const board =
    originalBoard.map((row) => [
      ...row,
    ])

  let solutions = 0

  function solve() {
    if (solutions >= limit) {
      return
    }

    const cell =
      findBestEmptyCell(board)

    if (!cell) {
      solutions++
      return
    }

    if (
      cell.candidates.length === 0
    ) {
      return
    }

    for (
      const number of
      cell.candidates
    ) {
      board[cell.row][
        cell.column
      ] = number

      solve()

      board[cell.row][
        cell.column
      ] = 0

      if (solutions >= limit) {
        return
      }
    }
  }

  solve()

  return solutions
}

export function generateSudoku(
  difficulty: SudokuDifficulty
): GeneratedSudoku {
  const solution =
    generateSolvedBoard()

  const puzzle =
    solution.map((row) => [
      ...row,
    ])

  const targetClues =
    TARGET_CLUES[difficulty]

  const positions = shuffle(
    Array.from(
      {
        length: 81,
      },
      (_, index) => index
    )
  )

  let clues = 81

  for (
    const position of positions
  ) {
    if (
      clues <= targetClues
    ) {
      break
    }

    const row = Math.floor(
      position / SIZE
    )

    const column =
      position % SIZE

    const previousValue =
      puzzle[row][column]

    puzzle[row][column] = 0

    const solutionCount =
      countSolutions(
        puzzle,
        2
      )

    if (
      solutionCount === 1
    ) {
      clues--
    } else {
      puzzle[row][column] =
        previousValue
    }
  }

  return {
    puzzle,
    solution,
  }
}