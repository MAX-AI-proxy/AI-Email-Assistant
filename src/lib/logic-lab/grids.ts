import {
  choice,
  randomInt,
  shuffle,
} from "./random"

import type {
  LogicDifficulty,
  NumberGridQuestion,
} from "./types"

type GridGenerator = (
  difficulty: LogicDifficulty
) => NumberGridQuestion

function transpose<T>(
  grid: T[][]
): T[][] {
  return grid[0].map(
    (_, columnIndex) =>
      grid.map(
        (row) =>
          row[columnIndex]
      )
  )
}

function createQuestion(
  difficulty: LogicDifficulty,
  completeRows: number[][],
  ruleLabel: string,
  hints: [
    string,
    string,
    string,
  ],
  explanation: string[],
  allowTranspose = true
): NumberGridQuestion {
  const rows =
    completeRows.map(
      (row) => [...row]
    )

  const missingSourceRow =
    randomInt(0, 2)

  const answer =
    rows[
      missingSourceRow
    ][2]

  const useTranspose =
    allowTranspose &&
    Math.random() < 0.5

  let orientedGrid = rows

  let missing = {
    row: missingSourceRow,
    column: 2,
  }

  if (useTranspose) {
    orientedGrid =
      transpose(rows)

    missing = {
      row: 2,
      column:
        missingSourceRow,
    }
  }

  const grid:
    (number | null)[][] =
      orientedGrid.map(
        (row) => [...row]
      )

  grid[
    missing.row
  ][
    missing.column
  ] = null

  return {
    id: `grid-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`,

    category:
      "number-grids",

    categoryLabel:
      "Number Grid",

    difficulty,

    grid,

    missing,

    answer,

    ruleLabel,

    hints,

    explanation,
  }
}

function generateProductPlusConstant(
  difficulty: LogicDifficulty
): NumberGridQuestion {
  const offset =
    difficulty ===
    "normal"
      ? randomInt(2, 6)
      : randomInt(4, 10)

  const rows = shuffle(
    Array.from(
      {
        length: 3,
      },
      () => {
        const first =
          randomInt(2, 8)

        const second =
          randomInt(3, 9)

        return [
          first,
          second,
          first *
            second +
            offset,
        ]
      }
    )
  )

  return createQuestion(
    difficulty,

    rows,

    "Produkt plus Konstante",

    [
      "Untersuche jeweils drei zusammengehörige Felder in einer Zeile oder Spalte.",

      "Die ersten beiden Werte werden zunächst miteinander multipliziert.",

      `Zu diesem Produkt wird jedes Mal ${offset} addiert.`,
    ],

    [
      "Für jede vollständige Dreiergruppe gilt dieselbe Regel.",

      `Dritter Wert = erster Wert × zweiter Wert + ${offset}.`,

      "Setze die beiden Werte der unvollständigen Gruppe in dieselbe Regel ein.",
    ]
  )
}

function generateSumTimesFactor(
  difficulty: LogicDifficulty
): NumberGridQuestion {
  const factor =
    difficulty ===
    "normal"
      ? choice([2, 3])
      : choice([3, 4])

  const rows = shuffle(
    Array.from(
      {
        length: 3,
      },
      () => {
        const first =
          randomInt(2, 11)

        const second =
          randomInt(3, 12)

        return [
          first,
          second,
          (
            first +
            second
          ) * factor,
        ]
      }
    )
  )

  return createQuestion(
    difficulty,

    rows,

    "Summe mit anschließendem Faktor",

    [
      "Betrachte die ersten beiden Werte einer vollständigen Dreiergruppe gemeinsam.",

      "Addiere die ersten beiden Werte zunächst.",

      `Die Summe wird anschließend mit ${factor} multipliziert.`,
    ],

    [
      `Die Regel lautet: (erster Wert + zweiter Wert) × ${factor}.`,

      "Diese Regel gilt für jede Zeile beziehungsweise nach Drehung für jede Spalte.",

      "Wende sie auf die unvollständige Dreiergruppe an.",
    ]
  )
}

function generateSquarePlusLinear(
  difficulty: LogicDifficulty
): NumberGridQuestion {
  const multiplier =
    difficulty ===
    "normal"
      ? 1
      : randomInt(2, 3)

  const rows = shuffle(
    Array.from(
      {
        length: 3,
      },
      () => {
        const first =
          randomInt(2, 8)

        const second =
          randomInt(2, 10)

        return [
          first,
          second,

          first *
            first +
            multiplier *
              second,
        ]
      }
    )
  )

  return createQuestion(
    difficulty,

    rows,

    "Quadrat und linearer Anteil",

    [
      "Einer der beiden Ausgangswerte wird stärker gewichtet als der andere.",

      "Quadriere den ersten Wert der jeweiligen Dreiergruppe.",

      multiplier === 1
        ? "Addiere anschließend den zweiten Wert."
        : `Addiere anschließend ${multiplier} × den zweiten Wert.`,
    ],

    [
      multiplier === 1
        ? "Die Regel lautet: erster Wert² + zweiter Wert."
        : `Die Regel lautet: erster Wert² + ${multiplier} × zweiter Wert.`,

      "Dieselbe Beziehung gilt in allen drei Dreiergruppen.",

      "Setze die Werte der unvollständigen Gruppe ein.",
    ]
  )
}

function generateProductPlusDifference(
  difficulty: LogicDifficulty
): NumberGridQuestion {
  const rows = shuffle(
    Array.from(
      {
        length: 3,
      },
      () => {
        const first =
          randomInt(2, 8)

        const second =
          randomInt(
            first + 1,
            first + 7
          )

        return [
          first,

          second,

          first *
            second +
            (
              second -
              first
            ),
        ]
      }
    )
  )

  return createQuestion(
    difficulty,

    rows,

    "Produkt plus Differenz",

    [
      "Eine reine Multiplikation kommt dem dritten Wert bereits nahe.",

      "Nach dem Produkt spielt zusätzlich der Abstand der ersten beiden Zahlen eine Rolle.",

      "Addiere zum Produkt die Differenz aus zweitem minus erstem Wert.",
    ],

    [
      "Zuerst werden die ersten beiden Werte multipliziert.",

      "Danach wird ihre Differenz addiert.",

      "Regel: erster × zweiter + (zweiter − erster).",
    ]
  )
}

function generateDifferenceOfSquares(
  difficulty: LogicDifficulty
): NumberGridQuestion {
  const rows = shuffle(
    Array.from(
      {
        length: 3,
      },
      () => {
        const first =
          randomInt(2, 7)

        const second =
          randomInt(
            first + 2,
            first + 8
          )

        return [
          first,

          second,

          second *
            second -
            first *
              first,
        ]
      }
    )
  )

  return createQuestion(
    difficulty,

    rows,

    "Differenz zweier Quadrate",

    [
      "Die dritten Werte entstehen nicht durch eine lineare Kombination.",

      "Betrachte die Quadrate der ersten beiden Werte.",

      "Ziehe das Quadrat des ersten Werts vom Quadrat des zweiten Werts ab.",
    ],

    [
      "Für jede Dreiergruppe werden zunächst beide Ausgangswerte quadriert.",

      "Regel: zweiter Wert² − erster Wert².",

      "Die gesuchte Zahl entsteht mit exakt derselben Beziehung.",
    ]
  )
}

function generateProgressiveOffset(
  difficulty: LogicDifficulty
): NumberGridQuestion {
  const step =
    difficulty === "hard"
      ? randomInt(2, 5)
      : randomInt(4, 8)

  const rows =
    Array.from(
      {
        length: 3,
      },

      (
        _,
        rowIndex
      ) => {
        const first =
          randomInt(2, 8)

        const second =
          randomInt(3, 9)

        const offset =
          (
            rowIndex +
            1
          ) * step

        return [
          first,

          second,

          first *
            second +
            offset,
        ]
      }
    )

  return createQuestion(
    difficulty,

    rows,

    "Produkt mit positionsabhängigem Offset",

    [
      "Das Grundprinzip ist in allen drei Zeilen gleich, aber ein Zusatzterm verändert sich.",

      "Multipliziere zunächst die ersten beiden Zahlen jeder Zeile.",

      `Der Zusatzterm steigt von Zeile zu Zeile um ${step}.`,
    ],

    [
      "Zuerst gilt in jeder Zeile: erster Wert × zweiter Wert.",

      `Anschließend werden in den drei Zeilen ${step}, ${
        2 * step
      } und ${
        3 * step
      } addiert.`,

      "Für die fehlende Zahl wird der zur Position gehörende Offset verwendet.",
    ],

    false
  )
}

function generateQuadraticBlend(
  difficulty: LogicDifficulty
): NumberGridQuestion {
  const offset =
    randomInt(2, 8)

  const rows = shuffle(
    Array.from(
      {
        length: 3,
      },
      () => {
        const first =
          randomInt(2, 8)

        const second =
          randomInt(2, 9)

        return [
          first,

          second,

          first *
            first +
            second *
              second +
            offset,
        ]
      }
    )
  )

  return createQuestion(
    difficulty,

    rows,

    "Quadratsumme mit Konstante",

    [
      "Beide Ausgangswerte gehen nicht linear in das Ergebnis ein.",

      "Quadriere beide Ausgangswerte und addiere die Ergebnisse.",

      `Zu dieser Quadratsumme wird noch ${offset} addiert.`,
    ],

    [
      "Die ersten beiden Werte werden jeweils quadriert.",

      `Regel: erster Wert² + zweiter Wert² + ${offset}.`,

      "Die gleiche Regel liefert die fehlende Zahl.",
    ]
  )
}

function generateProductLinearBlend(
  difficulty: LogicDifficulty
): NumberGridQuestion {
  const offset =
    randomInt(2, 7)

  const rows = shuffle(
    Array.from(
      {
        length: 3,
      },
      () => {
        const first =
          randomInt(3, 9)

        const second =
          randomInt(2, 8)

        return [
          first,

          second,

          first *
            second +
            2 *
              first -
            second +
            offset,
        ]
      }
    )
  )

  return createQuestion(
    difficulty,

    rows,

    "Produkt mit linearem Korrekturterm",

    [
      "Das Produkt der ersten beiden Werte ist nur der Ausgangspunkt.",

      "Zusätzlich wird der erste Wert doppelt addiert und der zweite einmal abgezogen.",

      `Zum Schluss wird noch die Konstante ${offset} addiert.`,
    ],

    [
      `Regel: erster × zweiter + 2 × erster − zweiter + ${offset}.`,

      "Alle vollständigen Dreiergruppen folgen exakt dieser Beziehung.",

      "Einsetzen der beiden bekannten Werte liefert die gesuchte Zahl.",
    ]
  )
}

function generateDifferenceProduct(
  difficulty: LogicDifficulty
): NumberGridQuestion {
  const offset =
    randomInt(1, 6)

  const rows = shuffle(
    Array.from(
      {
        length: 3,
      },
      () => {
        const first =
          randomInt(2, 7)

        const second =
          randomInt(
            first + 2,
            first + 8
          )

        return [
          first,

          second,

          (
            first +
            second
          ) *
            (
              second -
              first
            ) +
            offset,
        ]
      }
    )
  )

  return createQuestion(
    difficulty,

    rows,

    "Summe-Differenz-Produkt",

    [
      "Bilde aus den ersten beiden Zahlen sowohl eine Summe als auch eine Differenz.",

      "Multipliziere diese beiden Zwischenergebnisse miteinander.",

      `Addiere anschließend ${offset}.`,
    ],

    [
      "Aus den beiden Ausgangswerten werden Summe und Differenz gebildet.",

      `Regel: (erster + zweiter) × (zweiter − erster) + ${offset}.`,

      "Mit dieser Regel ist der fehlende Wert direkt berechenbar.",
    ]
  )
}

const generators: Record<
  LogicDifficulty,
  GridGenerator[]
> = {
  normal: [
    generateProductPlusConstant,
    generateSumTimesFactor,
    generateSquarePlusLinear,
  ],

  hard: [
    generateProductPlusConstant,
    generateSquarePlusLinear,
    generateProductPlusDifference,
    generateDifferenceOfSquares,
    generateProgressiveOffset,
  ],

  expert: [
    generateProgressiveOffset,
    generateQuadraticBlend,
    generateProductLinearBlend,
    generateDifferenceProduct,
  ],
}

export function generateNumberGrid(
  difficulty: LogicDifficulty
): NumberGridQuestion {
  const generator =
    choice(
      generators[
        difficulty
      ]
    )

  return generator(
    difficulty
  )
}