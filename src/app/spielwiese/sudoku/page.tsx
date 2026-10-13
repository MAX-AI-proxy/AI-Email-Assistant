"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

import {
  ArrowLeft,
  CheckCircle2,
  Eraser,
  Keyboard,
  LoaderCircle,
  PencilLine,
  RotateCcw,
  Save,
  Sparkles,
} from "lucide-react"

import ConfirmDialog from "@/components/confirm-dialog"
import { generateSudoku } from "@/lib/sudoku"

import type {
  SudokuBoard,
  SudokuDifficulty,
} from "@/lib/sudoku"

type SelectedCell = {
  row: number
  column: number
} | null

type SudokuNotes = number[][][]

type SavedSudoku = {
  version: 1
  difficulty: SudokuDifficulty
  puzzle: SudokuBoard
  solution: SudokuBoard
  board: SudokuBoard
  notes: SudokuNotes
  solved: boolean
}

type PendingAction =
  | {
      type: "new-game"
    }
  | {
      type: "change-difficulty"
      level: SudokuDifficulty
    }
  | {
      type: "reset"
    }
  | null

const STORAGE_KEY = "max-ai-sudoku-current-v1"

const difficulties: {
  id: SudokuDifficulty
  name: string
}[] = [
  {
    id: "leicht",
    name: "Leicht",
  },
  {
    id: "mittel",
    name: "Mittel",
  },
  {
    id: "schwer",
    name: "Schwer",
  },
]

function copyBoard(board: SudokuBoard): SudokuBoard {
  return board.map((row) => [...row])
}

function createEmptyNotes(): SudokuNotes {
  return Array.from(
    {
      length: 9,
    },
    () =>
      Array.from(
        {
          length: 9,
        },
        () => [] as number[]
      )
  )
}

function copyNotes(notes: SudokuNotes): SudokuNotes {
  return notes.map((row) =>
    row.map((cell) => [...cell])
  )
}

function isValidBoard(value: unknown): value is SudokuBoard {
  if (!Array.isArray(value) || value.length !== 9) {
    return false
  }

  return value.every(
    (row) =>
      Array.isArray(row) &&
      row.length === 9 &&
      row.every(
        (cell) =>
          typeof cell === "number" &&
          Number.isInteger(cell) &&
          cell >= 0 &&
          cell <= 9
      )
  )
}

function isValidNotes(value: unknown): value is SudokuNotes {
  if (!Array.isArray(value) || value.length !== 9) {
    return false
  }

  return value.every(
    (row) =>
      Array.isArray(row) &&
      row.length === 9 &&
      row.every(
        (cell) =>
          Array.isArray(cell) &&
          cell.every(
            (number) =>
              typeof number === "number" &&
              Number.isInteger(number) &&
              number >= 1 &&
              number <= 9
          )
      )
  )
}

function isValidDifficulty(
  value: unknown
): value is SudokuDifficulty {
  return (
    value === "leicht" ||
    value === "mittel" ||
    value === "schwer"
  )
}

export default function SudokuPage() {
  const [difficulty, setDifficulty] =
    useState<SudokuDifficulty>("mittel")

  const [puzzle, setPuzzle] =
    useState<SudokuBoard | null>(null)

  const [solution, setSolution] =
    useState<SudokuBoard | null>(null)

  const [board, setBoard] =
    useState<SudokuBoard | null>(null)

  const [notes, setNotes] =
    useState<SudokuNotes>(createEmptyNotes)

  const [selectedCell, setSelectedCell] =
    useState<SelectedCell>(null)

  const [generating, setGenerating] =
    useState(true)

  const [solved, setSolved] =
    useState(false)

  const [noteMode, setNoteMode] =
    useState(false)

  const [pendingAction, setPendingAction] =
    useState<PendingAction>(null)

  const persistGame = useCallback(
    (
      nextDifficulty: SudokuDifficulty,
      nextPuzzle: SudokuBoard,
      nextSolution: SudokuBoard,
      nextBoard: SudokuBoard,
      nextNotes: SudokuNotes,
      nextSolved: boolean
    ) => {
      const saveData: SavedSudoku = {
        version: 1,
        difficulty: nextDifficulty,
        puzzle: nextPuzzle,
        solution: nextSolution,
        board: nextBoard,
        notes: nextNotes,
        solved: nextSolved,
      }

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(saveData)
      )
    },
    []
  )

  const generateGame = useCallback(
    (level: SudokuDifficulty) => {
      setGenerating(true)

      const game = generateSudoku(level)

      const newPuzzle = copyBoard(game.puzzle)
      const newSolution = copyBoard(game.solution)
      const newBoard = copyBoard(game.puzzle)
      const newNotes = createEmptyNotes()

      setDifficulty(level)
      setPuzzle(newPuzzle)
      setSolution(newSolution)
      setBoard(newBoard)
      setNotes(newNotes)
      setSelectedCell(null)
      setSolved(false)
      setNoteMode(false)

      persistGame(
        level,
        newPuzzle,
        newSolution,
        newBoard,
        newNotes,
        false
      )

      setGenerating(false)
    },
    [persistGame]
  )

  useEffect(() => {
    const timer = window.setTimeout(() => {
    const savedGame = localStorage.getItem(STORAGE_KEY)

    if (!savedGame) {
      generateGame("mittel")
      return
    }

    try {
      const parsed = JSON.parse(
        savedGame
      ) as Partial<SavedSudoku>

      if (
        parsed.version !== 1 ||
        !isValidDifficulty(parsed.difficulty) ||
        !isValidBoard(parsed.puzzle) ||
        !isValidBoard(parsed.solution) ||
        !isValidBoard(parsed.board)
      ) {
        throw new Error("Ungültiger Spielstand")
      }

      const restoredNotes = isValidNotes(parsed.notes)
        ? copyNotes(parsed.notes)
        : createEmptyNotes()

      setDifficulty(parsed.difficulty)
      setPuzzle(copyBoard(parsed.puzzle))
      setSolution(copyBoard(parsed.solution))
      setBoard(copyBoard(parsed.board))
      setNotes(restoredNotes)
      setSolved(Boolean(parsed.solved))
      setSelectedCell(null)
      setGenerating(false)
    } catch {
      localStorage.removeItem(STORAGE_KEY)
      generateGame("mittel")
    }
    }, 0)
    return () => window.clearTimeout(timer)
  }, [generateGame])

  function hasProgress() {
    if (!board || !puzzle) {
      return false
    }

    const changedBoard = board.some(
      (row, rowIndex) =>
        row.some(
          (value, columnIndex) =>
            value !== puzzle[rowIndex][columnIndex]
        )
    )

    const hasNotes = notes.some((row) =>
      row.some((cell) => cell.length > 0)
    )

    return changedBoard || hasNotes
  }

  function requestNewGame() {
    if (hasProgress() && !solved) {
      setPendingAction({
        type: "new-game",
      })

      return
    }

    generateGame(difficulty)
  }

  function changeDifficulty(level: SudokuDifficulty) {
    if (level === difficulty) {
      return
    }

    if (hasProgress() && !solved) {
      setPendingAction({
        type: "change-difficulty",
        level,
      })

      return
    }

    generateGame(level)
  }

  function isGiven(row: number, column: number) {
    return puzzle?.[row]?.[column] !== 0
  }

  function isRelatedCell(row: number, column: number) {
    if (!selectedCell) {
      return false
    }

    const sameRow = selectedCell.row === row
    const sameColumn = selectedCell.column === column

    const sameBox =
      Math.floor(selectedCell.row / 3) ===
        Math.floor(row / 3) &&
      Math.floor(selectedCell.column / 3) ===
        Math.floor(column / 3)

    return sameRow || sameColumn || sameBox
  }

  function isSameValue(row: number, column: number) {
    if (!selectedCell || !board) {
      return false
    }

    const selectedValue =
      board[selectedCell.row][selectedCell.column]

    if (selectedValue === 0) {
      return false
    }

    return board[row][column] === selectedValue
  }

  const isSolvedBoard = useCallback((nextBoard: SudokuBoard) => {
    if (!solution) {
      return false
    }

    return nextBoard.every(
      (row, rowIndex) =>
        row.every(
          (value, columnIndex) =>
            value !== 0 &&
            value === solution[rowIndex][columnIndex]
        )
    )
  }, [solution])

  function removeCandidateFromPeers(
    currentNotes: SudokuNotes,
    row: number,
    column: number,
    number: number
  ) {
    const nextNotes = copyNotes(currentNotes)

    for (let index = 0; index < 9; index++) {
      nextNotes[row][index] =
        nextNotes[row][index].filter(
          (candidate) => candidate !== number
        )

      nextNotes[index][column] =
        nextNotes[index][column].filter(
          (candidate) => candidate !== number
        )
    }

    const boxRow = Math.floor(row / 3) * 3
    const boxColumn = Math.floor(column / 3) * 3

    for (
      let currentRow = boxRow;
      currentRow < boxRow + 3;
      currentRow++
    ) {
      for (
        let currentColumn = boxColumn;
        currentColumn < boxColumn + 3;
        currentColumn++
      ) {
        nextNotes[currentRow][currentColumn] =
          nextNotes[currentRow][currentColumn].filter(
            (candidate) => candidate !== number
          )
      }
    }

    return nextNotes
  }

  const enterNumber = useCallback(
    (number: number) => {
      if (
        !selectedCell ||
        !board ||
        !puzzle ||
        !solution ||
        solved
      ) {
        return
      }

      const { row, column } = selectedCell

      if (puzzle[row][column] !== 0) {
        return
      }

      if (noteMode) {
        if (board[row][column] !== 0) {
          return
        }

        const nextNotes = copyNotes(notes)
        const currentNotes = nextNotes[row][column]

        if (currentNotes.includes(number)) {
          nextNotes[row][column] =
            currentNotes.filter(
              (candidate) => candidate !== number
            )
        } else {
          nextNotes[row][column] = [
            ...currentNotes,
            number,
          ].sort((a, b) => a - b)
        }

        setNotes(nextNotes)

        persistGame(
          difficulty,
          puzzle,
          solution,
          board,
          nextNotes,
          false
        )

        return
      }

      const nextBoard = copyBoard(board)

      nextBoard[row][column] = number

      let nextNotes = copyNotes(notes)

      nextNotes[row][column] = []

      nextNotes = removeCandidateFromPeers(
        nextNotes,
        row,
        column,
        number
      )

      const complete = isSolvedBoard(nextBoard)

      setBoard(nextBoard)
      setNotes(nextNotes)
      setSolved(complete)

      persistGame(
        difficulty,
        puzzle,
        solution,
        nextBoard,
        nextNotes,
        complete
      )
    },
    [
      selectedCell,
      board,
      puzzle,
      solution,
      solved,
      noteMode,
      notes,
      difficulty,
      persistGame,
      isSolvedBoard,
    ]
  )

  const eraseCell = useCallback(() => {
    if (
      !selectedCell ||
      !board ||
      !puzzle ||
      !solution ||
      solved
    ) {
      return
    }

    const { row, column } = selectedCell

    if (puzzle[row][column] !== 0) {
      return
    }

    const nextBoard = copyBoard(board)
    const nextNotes = copyNotes(notes)

    nextBoard[row][column] = 0
    nextNotes[row][column] = []

    setBoard(nextBoard)
    setNotes(nextNotes)
    setSolved(false)

    persistGame(
      difficulty,
      puzzle,
      solution,
      nextBoard,
      nextNotes,
      false
    )
  }, [
    selectedCell,
    board,
    puzzle,
    solution,
    solved,
    notes,
    difficulty,
    persistGame,
  ])

  function performResetGame() {
    if (!puzzle || !solution) {
      return
    }

    const nextBoard = copyBoard(puzzle)
    const nextNotes = createEmptyNotes()

    setBoard(nextBoard)
    setNotes(nextNotes)
    setSelectedCell(null)
    setSolved(false)
    setNoteMode(false)

    persistGame(
      difficulty,
      puzzle,
      solution,
      nextBoard,
      nextNotes,
      false
    )
  }

  function requestResetGame() {
    if (!hasProgress()) {
      return
    }

    setPendingAction({
      type: "reset",
    })
  }

  function confirmPendingAction() {
    if (!pendingAction) {
      return
    }

    const action = pendingAction

    setPendingAction(null)

    if (action.type === "new-game") {
      generateGame(difficulty)
      return
    }

    if (action.type === "change-difficulty") {
      generateGame(action.level)
      return
    }

    if (action.type === "reset") {
      performResetGame()
    }
  }

  const moveSelection = useCallback(
    (rowChange: number, columnChange: number) => {
      setSelectedCell((current) => {
        if (!current) {
          return {
            row: 0,
            column: 0,
          }
        }

        return {
          row: (current.row + rowChange + 9) % 9,
          column:
            (current.column + columnChange + 9) % 9,
        }
      })
    },
    []
  )

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (pendingAction) {
        return
      }

      if (event.key >= "1" && event.key <= "9") {
        event.preventDefault()
        enterNumber(Number(event.key))
        return
      }

      if (
        event.key === "Backspace" ||
        event.key === "Delete" ||
        event.key === "0"
      ) {
        event.preventDefault()
        eraseCell()
        return
      }

      if (event.key.toLowerCase() === "n") {
        event.preventDefault()

        setNoteMode(
          (current) => !current
        )

        return
      }

      if (event.key === "ArrowUp") {
        event.preventDefault()
        moveSelection(-1, 0)
        return
      }

      if (event.key === "ArrowDown") {
        event.preventDefault()
        moveSelection(1, 0)
        return
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault()
        moveSelection(0, -1)
        return
      }

      if (event.key === "ArrowRight") {
        event.preventDefault()
        moveSelection(0, 1)
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    )

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      )
    }
  }, [
    enterNumber,
    eraseCell,
    moveSelection,
    pendingAction,
  ])

  const dialogConfig =
    pendingAction?.type === "new-game"
      ? {
          title: "Aktuelles Sudoku verwerfen?",
          description:
            "Dein bisheriger Fortschritt und alle Notizen werden durch ein neues Sudoku ersetzt.",
          confirmLabel: "Neues Spiel",
        }
      : pendingAction?.type === "change-difficulty"
        ? {
            title: "Schwierigkeit wechseln?",
            description:
              "Beim Wechsel des Schwierigkeitsgrads wird dein aktuelles Sudoku verworfen und ein neues Rätsel generiert.",
            confirmLabel: "Wechseln",
          }
        : pendingAction?.type === "reset"
          ? {
              title: "Sudoku zurücksetzen?",
              description:
                "Alle von dir eingetragenen Zahlen und Notizen werden gelöscht. Das aktuelle Rätsel bleibt bestehen.",
              confirmLabel: "Zurücksetzen",
            }
          : null

  if (
    generating ||
    !board ||
    !puzzle ||
    !solution
  ) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center md:min-h-screen">
        <div className="text-center">
          <LoaderCircle
            size={28}
            strokeWidth={1.5}
            className="mx-auto animate-spin text-[#6d6e74]"
          />

          <p className="mt-4 text-[14px] text-[#77787e]">
            Sudoku wird generiert …
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full px-4 pb-12 pt-7 sm:px-6 md:px-10 md:pb-16 md:pt-12 lg:px-12">
      <div className="mx-auto max-w-[1180px]">
        {/* Header */}
        <header className="mb-8">
          <Link
            href="/spielwiese"
            className="mb-5 flex w-fit items-center gap-1.5 text-[13px] text-[#77787e] transition hover:text-white"
          >
            <ArrowLeft
              size={15}
              strokeWidth={1.8}
            />

            Spielwiese
          </Link>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <h1 className="text-[32px] font-semibold tracking-[-0.035em] text-[#f5f5f7] md:text-[38px]">
              Sudoku
            </h1>

            <button
              onClick={requestNewGame}
              className="flex h-10 w-fit items-center gap-2 rounded-[10px] bg-white/[0.07] px-4 text-[13px] font-medium text-[#d0d0d3] transition hover:bg-white/[0.11] hover:text-white"
            >
              <Sparkles
                size={16}
                strokeWidth={1.7}
              />

              Neues Spiel
            </button>
          </div>
        </header>

        <div className="grid gap-10 xl:grid-cols-[minmax(0,620px)_280px] xl:items-start xl:justify-center">
          {/* Spielfeld */}
          <div className="w-full">
            <div className="mx-auto grid aspect-square w-full max-w-[620px] grid-cols-9 overflow-hidden rounded-[12px] border-2 border-[#62636a] bg-[#15171b]">
              {board.map(
                (row, rowIndex) =>
                  row.map(
                    (
                      value,
                      columnIndex
                    ) => {
                      const selected =
                        selectedCell?.row ===
                          rowIndex &&
                        selectedCell?.column ===
                          columnIndex

                      const given = isGiven(
                        rowIndex,
                        columnIndex
                      )

                      const related =
                        isRelatedCell(
                          rowIndex,
                          columnIndex
                        )

                      const sameValue =
                        isSameValue(
                          rowIndex,
                          columnIndex
                        )

                      const wrong =
                        !given &&
                        value !== 0 &&
                        value !==
                          solution[rowIndex][
                            columnIndex
                          ]

                      const thickRight =
                        columnIndex === 2 ||
                        columnIndex === 5

                      const thickBottom =
                        rowIndex === 2 ||
                        rowIndex === 5

                      const cellNotes =
                        notes[rowIndex][
                          columnIndex
                        ]

                      return (
                        <button
                          key={`${rowIndex}-${columnIndex}`}
                          onClick={() =>
                            setSelectedCell({
                              row: rowIndex,
                              column:
                                columnIndex,
                            })
                          }
                          className={`
                            relative flex aspect-square items-center justify-center
                            text-[18px] transition sm:text-[22px] md:text-[25px]

                            ${
                              columnIndex < 8
                                ? thickRight
                                  ? "border-r-2 border-r-[#62636a]"
                                  : "border-r border-r-white/[0.10]"
                                : ""
                            }

                            ${
                              rowIndex < 8
                                ? thickBottom
                                  ? "border-b-2 border-b-[#62636a]"
                                  : "border-b border-b-white/[0.10]"
                                : ""
                            }

                            ${
                              selected
                                ? "bg-[#0a84ff]/22"
                                : sameValue
                                  ? "bg-[#0a84ff]/11"
                                  : related
                                    ? "bg-white/[0.035]"
                                    : "hover:bg-white/[0.025]"
                            }

                            ${
                              given
                                ? "font-semibold text-[#f5f5f7]"
                                : wrong
                                  ? "font-medium text-[#ff6961]"
                                  : "font-medium text-[#64a8ff]"
                            }
                          `}
                        >
                          {value !== 0 ? (
                            value
                          ) : cellNotes.length > 0 ? (
                            <div className="absolute inset-[4px] grid grid-cols-3 grid-rows-3">
                              {Array.from(
                                {
                                  length: 9,
                                },
                                (_, index) => {
                                  const number =
                                    index + 1

                                  return (
                                    <span
                                      key={number}
                                      className="flex items-center justify-center text-[7px] font-medium text-[#8d9eb3] sm:text-[9px] md:text-[10px]"
                                    >
                                      {cellNotes.includes(
                                        number
                                      )
                                        ? number
                                        : ""}
                                    </span>
                                  )
                                }
                              )}
                            </div>
                          ) : null}
                        </button>
                      )
                    }
                  )
              )}
            </div>

            {/* Zahlen */}
            <div className="mx-auto mt-5 grid w-full max-w-[620px] grid-cols-9 gap-1.5 sm:gap-2">
              {[
                1, 2, 3, 4, 5, 6, 7, 8, 9,
              ].map((number) => (
                <button
                  key={number}
                  onClick={() =>
                    enterNumber(number)
                  }
                  className={`aspect-square rounded-[10px] text-[16px] font-medium transition active:scale-95 sm:text-[18px] ${
                    noteMode
                      ? "bg-[#0a84ff]/10 text-[#64a8ff] hover:bg-[#0a84ff]/18"
                      : "bg-white/[0.055] text-[#d8d8db] hover:bg-white/[0.10]"
                  }`}
                >
                  {number}
                </button>
              ))}
            </div>

            {/* Steuerung */}
            <div className="mx-auto mt-3 grid w-full max-w-[620px] grid-cols-3 gap-2">
              <button
                onClick={() =>
                  setNoteMode(
                    (current) => !current
                  )
                }
                className={`flex h-11 items-center justify-center gap-2 rounded-[10px] text-[13px] transition ${
                  noteMode
                    ? "bg-[#0a84ff]/15 text-[#64a8ff]"
                    : "bg-white/[0.04] text-[#999aa0] hover:bg-white/[0.075] hover:text-white"
                }`}
              >
                <PencilLine
                  size={16}
                  strokeWidth={1.7}
                />

                Notizen
              </button>

              <button
                onClick={eraseCell}
                className="flex h-11 items-center justify-center gap-2 rounded-[10px] bg-white/[0.04] text-[13px] text-[#999aa0] transition hover:bg-white/[0.075] hover:text-white"
              >
                <Eraser
                  size={16}
                  strokeWidth={1.7}
                />

                Löschen
              </button>

              <button
                onClick={requestResetGame}
                className="flex h-11 items-center justify-center gap-2 rounded-[10px] bg-white/[0.04] text-[13px] text-[#999aa0] transition hover:bg-white/[0.075] hover:text-white"
              >
                <RotateCcw
                  size={16}
                  strokeWidth={1.7}
                />

                Zurücksetzen
              </button>
            </div>
          </div>

          {/* Rechte Spalte */}
          <aside className="mx-auto w-full max-w-[620px] xl:max-w-none">
            {/* Schwierigkeit */}
            <div className="rounded-[18px] border border-white/[0.07] bg-[#15171b] p-5">
              <p className="text-[12px] font-semibold uppercase tracking-[0.07em] text-[#606167]">
                Schwierigkeit
              </p>

              <div className="mt-4 space-y-1.5">
                {difficulties.map(
                  (level) => (
                    <button
                      key={level.id}
                      onClick={() =>
                        changeDifficulty(
                          level.id
                        )
                      }
                      className={`flex h-11 w-full items-center justify-between rounded-[10px] px-3.5 text-[14px] transition ${
                        difficulty ===
                        level.id
                          ? "bg-white/[0.08] font-medium text-white"
                          : "text-[#8c8d93] hover:bg-white/[0.04] hover:text-white"
                      }`}
                    >
                      {level.name}

                      {difficulty ===
                        level.id && (
                        <div className="h-2 w-2 rounded-full bg-[#0a84ff]" />
                      )}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Status */}
            <div className="mt-4 rounded-[18px] border border-white/[0.07] bg-[#15171b] p-5">
              <p className="text-[12px] font-semibold uppercase tracking-[0.07em] text-[#606167]">
                Status
              </p>

              {solved ? (
                <div className="mt-4 flex items-start gap-3">
                  <CheckCircle2
                    size={20}
                    strokeWidth={1.8}
                    className="mt-0.5 shrink-0 text-[#30d158]"
                  />

                  <div>
                    <p className="text-[14px] font-medium text-[#f5f5f7]">
                      Geschafft!
                    </p>

                    <p className="mt-1 text-[12px] leading-5 text-[#77787e]">
                      Das Sudoku ist vollständig
                      gelöst.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  <p className="text-[13px] leading-6 text-[#77787e]">
                    Wähle ein freies Feld aus und
                    trage eine Zahl ein.
                  </p>

                  <div className="flex items-center gap-2 text-[12px] text-[#65666c]">
                    <Save
                      size={14}
                      strokeWidth={1.7}
                    />

                    Fortschritt wird automatisch
                    gespeichert.
                  </div>

                  {noteMode && (
                    <div className="flex items-center gap-2 text-[12px] text-[#64a8ff]">
                      <PencilLine
                        size={14}
                        strokeWidth={1.7}
                      />

                      Notizmodus aktiv
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tastatur */}
            <div className="mt-4 rounded-[18px] border border-white/[0.07] bg-[#15171b] p-5">
              <div className="flex items-center gap-2">
                <Keyboard
                  size={16}
                  strokeWidth={1.7}
                  className="text-[#77787e]"
                />

                <p className="text-[12px] font-semibold uppercase tracking-[0.07em] text-[#606167]">
                  Tastatur
                </p>
              </div>

              <div className="mt-4 space-y-2 text-[12px] text-[#77787e]">
                <div className="flex justify-between gap-4">
                  <span>Zahl setzen</span>

                  <span className="text-[#aaaab0]">
                    1 – 9
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span>Feld wechseln</span>

                  <span className="text-[#aaaab0]">
                    Pfeiltasten
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span>Löschen</span>

                  <span className="text-[#aaaab0]">
                    Entf / Backspace
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span>Notizmodus</span>

                  <span className="text-[#aaaab0]">
                    N
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* MAX-AI Bestätigungsdialog */}
      {dialogConfig && (
        <ConfirmDialog
          open={pendingAction !== null}
          title={dialogConfig.title}
          description={
            dialogConfig.description
          }
          confirmLabel={
            dialogConfig.confirmLabel
          }
          destructive
          onCancel={() =>
            setPendingAction(null)
          }
          onConfirm={
            confirmPendingAction
          }
        />
      )}
    </div>
  )
}