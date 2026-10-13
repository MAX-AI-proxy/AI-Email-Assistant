import {
  choice,
  randomInt,
} from "./random"

import type {
  LogicDifficulty,
  LogicQuestion,
} from "./types"

type SequenceGenerator = (
  difficulty: LogicDifficulty
) => LogicQuestion

function makeQuestion(
  difficulty: LogicDifficulty,
  sequence: number[],
  answer: number,
  ruleLabel: string,
  hints: [
    string,
    string,
    string,
  ],
  explanation: string[]
): LogicQuestion {
  return {
    id: `sequence-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`,
    category:
      "number-sequences",
    categoryLabel:
      "Number Sequence",
    difficulty,
    sequence,
    answer,
    ruleLabel,
    hints,
    explanation,
  }
}

function generateGrowingDifferences(
  difficulty: LogicDifficulty
): LogicQuestion {
  const shownCount =
    difficulty === "normal"
      ? 5
      : 6

  const start =
    randomInt(2, 18)

  const firstDifference =
    difficulty === "normal"
      ? randomInt(3, 7)
      : difficulty === "hard"
        ? randomInt(4, 10)
        : randomInt(5, 12)

  const differenceIncrease =
    difficulty === "normal"
      ? randomInt(2, 4)
      : difficulty === "hard"
        ? randomInt(3, 6)
        : randomInt(5, 9)

  const terms = [start]
  const differences: number[] = []

  let difference =
    firstDifference

  for (
    let index = 0;
    index < shownCount;
    index++
  ) {
    differences.push(
      difference
    )

    terms.push(
      terms[
        terms.length - 1
      ] + difference
    )

    difference +=
      differenceIncrease
  }

  const sequence =
    terms.slice(
      0,
      shownCount
    )

  const answer =
    terms[shownCount]

  const shownDifferences =
    differences.slice(
      0,
      shownCount - 1
    )

  const nextDifference =
    differences[
      shownCount - 1
    ]

  return makeQuestion(
    difficulty,
    sequence,
    answer,
    "Steigende Differenzen",
    [
      "Betrachte zuerst die Abstände zwischen den aufeinanderfolgenden Zahlen.",
      `Die sichtbaren Differenzen sind ${shownDifferences.join(", ")}.`,
      `Die Differenzen steigen jeweils um ${differenceIncrease}. Die nächste Differenz beträgt daher ${nextDifference}.`,
    ],
    [
      `Die Differenzen zwischen den sichtbaren Zahlen lauten: ${shownDifferences.join(", ")}.`,
      `Jede Differenz ist um ${differenceIncrease} größer als die vorherige.`,
      `Die nächste Differenz ist deshalb ${nextDifference}.`,
      `${sequence[sequence.length - 1]} + ${nextDifference} = ${answer}.`,
    ]
  )
}

function generateMultiplyAdd(
  difficulty: LogicDifficulty
): LogicQuestion {
  const shownCount =
    difficulty === "normal"
      ? 5
      : 6

  const start =
    randomInt(2, 7)

  const multiplier =
    difficulty === "normal"
      ? 2
      : choice([2, 3])

  const addition =
    difficulty === "normal"
      ? randomInt(1, 5)
      : randomInt(2, 8)

  const terms = [start]

  while (
    terms.length <
    shownCount + 1
  ) {
    const previous =
      terms[
        terms.length - 1
      ]

    terms.push(
      previous *
        multiplier +
        addition
    )
  }

  const sequence =
    terms.slice(
      0,
      shownCount
    )

  const answer =
    terms[shownCount]

  return makeQuestion(
    difficulty,
    sequence,
    answer,
    "Multiplikation und Addition",
    [
      "Versuche, jede Zahl direkt aus der vorherigen Zahl zu erzeugen.",
      `In jedem Schritt wird zunächst mit ${multiplier} multipliziert.`,
      `Die vollständige Regel lautet: × ${multiplier}, danach + ${addition}.`,
    ],
    [
      `Jeder Wert entsteht durch dieselbe Operation: vorherige Zahl × ${multiplier} + ${addition}.`,
      `${sequence[sequence.length - 1]} × ${multiplier} + ${addition} = ${answer}.`,
    ]
  )
}

function generateAlternatingOperations(
  difficulty: LogicDifficulty
): LogicQuestion {
  const shownCount =
    difficulty === "expert"
      ? 6
      : 5

  const start =
    randomInt(2, 8)

  const multiplier =
    difficulty === "normal"
      ? choice([2, 3])
      : randomInt(2, 4)

  const addition =
    difficulty === "normal"
      ? randomInt(2, 6)
      : randomInt(3, 10)

  const terms = [start]

  for (
    let transition = 0;
    transition < shownCount;
    transition++
  ) {
    const previous =
      terms[
        terms.length - 1
      ]

    if (
      transition % 2 === 0
    ) {
      terms.push(
        previous *
          multiplier
      )
    } else {
      terms.push(
        previous +
          addition
      )
    }
  }

  const sequence =
    terms.slice(
      0,
      shownCount
    )

  const answer =
    terms[shownCount]

  return makeQuestion(
    difficulty,
    sequence,
    answer,
    "Wechselnde Operationen",
    [
      "Nicht jeder Schritt verwendet dieselbe Rechenoperation.",
      "Betrachte jeden zweiten Übergang getrennt.",
      `Die Operationen wechseln sich ab: × ${multiplier}, dann + ${addition}.`,
    ],
    [
      `Die Folge verwendet abwechselnd × ${multiplier} und + ${addition}.`,
      `Nach ${sequence[sequence.length - 1]} ist wieder die Multiplikation mit ${multiplier} an der Reihe.`,
      `${sequence[sequence.length - 1]} × ${multiplier} = ${answer}.`,
    ]
  )
}

function generateInterleavedArithmetic(
  difficulty: LogicDifficulty
): LogicQuestion {
  const startA =
    randomInt(2, 12)

  const startB =
    randomInt(15, 30)

  const stepA =
    randomInt(3, 9)

  let stepB =
    randomInt(2, 8)

  if (stepB === stepA) {
    stepB += 1
  }

  const a = [
    startA,
    startA + stepA,
    startA + 2 * stepA,
    startA + 3 * stepA,
  ]

  const b = [
    startB,
    startB + stepB,
    startB + 2 * stepB,
  ]

  const sequence = [
    a[0],
    b[0],
    a[1],
    b[1],
    a[2],
    b[2],
  ]

  const answer = a[3]

  return makeQuestion(
    difficulty,
    sequence,
    answer,
    "Zwei verschachtelte Folgen",
    [
      "Betrachte einmal nur jede zweite Zahl.",
      "Die Positionen 1, 3, 5, 7 bilden eine eigene Folge.",
      `Die erste Teilfolge steigt immer um ${stepA}.`,
    ],
    [
      `Die ungeraden Positionen ergeben: ${a[0]}, ${a[1]}, ${a[2]}, ...`,
      `Diese Teilfolge steigt jeweils um ${stepA}.`,
      `${a[2]} + ${stepA} = ${answer}.`,
      `Die dazwischenliegenden Werte bilden unabhängig davon eine zweite Folge mit Schrittweite ${stepB}.`,
    ]
  )
}

function generateMixedInterleaved(
  difficulty: LogicDifficulty
): LogicQuestion {
  const startA =
    randomInt(2, 5)

  const multiplier =
    choice([2, 3])

  const startB =
    randomInt(12, 28)

  const stepB =
    randomInt(4, 9)

  const a = [
    startA,
    startA * multiplier,
    startA *
      multiplier *
      multiplier,
    startA *
      multiplier *
      multiplier *
      multiplier,
  ]

  const b = [
    startB,
    startB + stepB,
    startB + 2 * stepB,
  ]

  const sequence = [
    a[0],
    b[0],
    a[1],
    b[1],
    a[2],
    b[2],
  ]

  const answer = a[3]

  return makeQuestion(
    difficulty,
    sequence,
    answer,
    "Verschachtelte unterschiedliche Folgen",
    [
      "Die Folge besteht aus zwei unabhängigen Mustern.",
      "Untersuche die ungeraden und geraden Positionen getrennt.",
      `Die Werte an den ungeraden Positionen werden jeweils mit ${multiplier} multipliziert.`,
    ],
    [
      `Die ungeraden Positionen lauten ${a[0]}, ${a[1]}, ${a[2]}, ...`,
      `Sie werden jeweils mit ${multiplier} multipliziert.`,
      `${a[2]} × ${multiplier} = ${answer}.`,
      `Die geraden Positionen bilden parallel eine arithmetische Folge mit + ${stepB}.`,
    ]
  )
}

function generateSquareDifferences(
  difficulty: LogicDifficulty
): LogicQuestion {
  const shownCount =
    difficulty === "hard"
      ? 5
      : 6

  const start =
    randomInt(2, 12)

  const factor =
    difficulty === "expert"
      ? randomInt(1, 2)
      : 1

  const offset =
    difficulty === "expert"
      ? randomInt(1, 4)
      : randomInt(0, 2)

  const terms = [start]
  const differences: number[] = []

  for (
    let index = 1;
    index <= shownCount;
    index++
  ) {
    const difference =
      factor *
        index *
        index +
      offset

    differences.push(
      difference
    )

    terms.push(
      terms[
        terms.length - 1
      ] + difference
    )
  }

  const sequence =
    terms.slice(
      0,
      shownCount
    )

  const answer =
    terms[shownCount]

  const shownDifferences =
    differences.slice(
      0,
      shownCount - 1
    )

  const nextDifference =
    differences[
      shownCount - 1
    ]

  return makeQuestion(
    difficulty,
    sequence,
    answer,
    "Quadratische Differenzen",
    [
      "Die Abstände zwischen den Zahlen sind wichtiger als die Zahlen selbst.",
      `Die sichtbaren Differenzen sind ${shownDifferences.join(", ")}.`,
      `Die Differenzen folgen der Regel ${factor} × n² + ${offset}.`,
    ],
    [
      `Die sichtbaren Differenzen sind ${shownDifferences.join(", ")}.`,
      `Für den n-ten Schritt gilt: ${factor} × n² + ${offset}.`,
      `Die nächste Differenz beträgt deshalb ${nextDifference}.`,
      `${sequence[sequence.length - 1]} + ${nextDifference} = ${answer}.`,
    ]
  )
}

function generateRecursive(
  difficulty: LogicDifficulty
): LogicQuestion {
  const shownCount = 6

  const first =
    randomInt(2, 7)

  const second =
    randomInt(3, 9)

  const weight =
    difficulty === "expert"
      ? choice([1, 2])
      : 1

  const offset =
    difficulty === "expert"
      ? randomInt(2, 6)
      : randomInt(1, 4)

  const terms = [
    first,
    second,
  ]

  while (
    terms.length <
    shownCount + 1
  ) {
    const last =
      terms[
        terms.length - 1
      ]

    const beforeLast =
      terms[
        terms.length - 2
      ]

    terms.push(
      last +
        weight *
          beforeLast +
        offset
    )
  }

  const sequence =
    terms.slice(
      0,
      shownCount
    )

  const answer =
    terms[shownCount]

  return makeQuestion(
    difficulty,
    sequence,
    answer,
    "Rekursive Folge",
    [
      "Ein neuer Wert hängt nicht nur von seinem direkten Vorgänger ab.",
      "Betrachte jeweils die beiden vorherigen Zahlen.",
      weight === 1
        ? `Addiere die beiden vorherigen Zahlen und anschließend ${offset}.`
        : `Nimm die letzte Zahl plus ${weight} × die vorletzte Zahl und addiere anschließend ${offset}.`,
    ],
    [
      weight === 1
        ? `Jede neue Zahl entsteht aus den beiden vorherigen Zahlen plus ${offset}.`
        : `Jede neue Zahl ist: letzte Zahl + ${weight} × vorletzte Zahl + ${offset}.`,
      `${sequence[sequence.length - 1]} + ${weight} × ${sequence[sequence.length - 2]} + ${offset} = ${answer}.`,
    ]
  )
}

function generateAlternatingAffine(
  difficulty: LogicDifficulty
): LogicQuestion {
  const shownCount = 6

  const start =
    randomInt(2, 7)

  const multiplier = 2

  const addition =
    randomInt(2, 6)

  const subtraction =
    randomInt(1, 5)

  const terms = [start]

  for (
    let transition = 0;
    transition < shownCount;
    transition++
  ) {
    const previous =
      terms[
        terms.length - 1
      ]

    if (
      transition % 2 === 0
    ) {
      terms.push(
        previous *
          multiplier +
          addition
      )
    } else {
      terms.push(
        previous *
          multiplier -
          subtraction
      )
    }
  }

  const sequence =
    terms.slice(
      0,
      shownCount
    )

  const answer =
    terms[shownCount]

  return makeQuestion(
    difficulty,
    sequence,
    answer,
    "Wechselnde affine Operationen",
    [
      "Die Schritte wechseln sich ab, sind aber komplexer als reine Addition oder Multiplikation.",
      `Jeder Schritt enthält eine Multiplikation mit ${multiplier}.`,
      `Die Regeln wechseln zwischen × ${multiplier} + ${addition} und × ${multiplier} - ${subtraction}.`,
    ],
    [
      `Die Operationen wechseln sich ab.`,
      `Schritt A: × ${multiplier} + ${addition}.`,
      `Schritt B: × ${multiplier} - ${subtraction}.`,
      `Für den nächsten Wert ist Schritt B an der Reihe: ${sequence[sequence.length - 1]} × ${multiplier} - ${subtraction} = ${answer}.`,
    ]
  )
}

const generators: Record<
  LogicDifficulty,
  SequenceGenerator[]
> = {
  normal: [
    generateGrowingDifferences,
    generateMultiplyAdd,
    generateAlternatingOperations,
  ],

  hard: [
    generateGrowingDifferences,
    generateAlternatingOperations,
    generateInterleavedArithmetic,
    generateSquareDifferences,
    generateRecursive,
  ],

  expert: [
    generateSquareDifferences,
    generateRecursive,
    generateMixedInterleaved,
    generateAlternatingAffine,
  ],
}

export function generateNumberSequence(
  difficulty: LogicDifficulty
): LogicQuestion {
  const generator =
    choice(
      generators[difficulty]
    )

  return generator(
    difficulty
  )
}