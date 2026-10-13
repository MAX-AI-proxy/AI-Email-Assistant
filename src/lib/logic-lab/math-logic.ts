import {
  choice,
  randomInt,
} from "./random"

import type {
  LogicDifficulty,
  MathLogicQuestion,
  MathLogicSubtype,
} from "./types"

type Operator =
  | "+"
  | "-"
  | "*"
  | "/"

function signed(
  value: number
) {
  if (
    value >= 0
  ) {
    return `+ ${value}`
  }

  return `- ${Math.abs(
    value
  )}`
}

function makeQuestion(
  difficulty:
    LogicDifficulty,

  subtype:
    MathLogicSubtype,

  prompt:
    string,

  lines:
    string[],

  answer:
    number | string,

  ruleLabel:
    string,

  hints: [
    string,
    string,
    string,
  ],

  explanation:
    string[],

  extras: Partial<
    MathLogicQuestion
  > = {}
): MathLogicQuestion {
  return {
    id: `math-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`,

    category:
      "math-logic",

    categoryLabel:
      "Math Logic",

    difficulty,

    subtype,

    prompt,

    lines,

    answer,

    ruleLabel,

    hints,

    explanation,

    answerType:
      "number",

    ...extras,
  }
}

function generateAffineEquation(
  difficulty:
    LogicDifficulty
) {
  const root =
    randomInt(
      -8,
      12
    )

  const a =
    randomInt(
      2,
      6
    )

  const b =
    randomInt(
      2,
      7
    )

  const c =
    randomInt(
      -8,
      8
    )

  const d =
    randomInt(
      -10,
      10
    )

  let e =
    randomInt(
      1,
      8
    )

  if (
    a * b === e
  ) {
    e++
  }

  const rightConstant =
    a *
      (
        b * root +
        c
      ) +
    d -
    e * root

  const leftExpandedConstant =
    a * c + d

  const coefficient =
    a * b - e

  const constantDifference =
    rightConstant -
    leftExpandedConstant

  return makeQuestion(
    difficulty,

    "solve-x",

    "Löse die Gleichung nach x auf.",

    [
      `${a} · (${b}x ${signed(
        c
      )}) ${signed(
        d
      )} = ${e}x ${signed(
        rightConstant
      )}`,
    ],

    root,

    "Mehrstufige lineare Gleichung",

    [
      "Löse zuerst die Klammer auf.",

      "Bringe anschließend alle Terme mit x auf dieselbe Seite.",

      `Nach dem Zusammenfassen erhältst du ${coefficient}x = ${constantDifference}.`,
    ],

    [
      `Klammer ausmultiplizieren: ${a * b}x ${signed(
        a * c
      )} ${signed(
        d
      )} = ${e}x ${signed(
        rightConstant
      )}.`,

      `Alle x-Terme auf eine Seite und die Konstanten auf die andere Seite bringen.`,

      `${coefficient}x = ${constantDifference}.`,

      `Damit ist x = ${root}.`,
    ],

    {
      answerVariable:
        "x",

      solutionDisplay:
        `x = ${root}`,
    }
  )
}

function generateMissingNumber(
  difficulty:
    LogicDifficulty
) {
  const missing =
    randomInt(
      2,
      18
    )

  const a =
    randomInt(
      3,
      9
    )

  const b =
    randomInt(
      2,
      8
    )

  const c =
    randomInt(
      4,
      18
    )

  const result =
    a *
      (
        missing +
        b
      ) -
    c

  return makeQuestion(
    difficulty,

    "missing-number",

    "Welche Zahl muss für ? eingesetzt werden?",

    [
      `${a} · (? + ${b}) - ${c} = ${result}`,
    ],

    missing,

    "Unbekannte innerhalb einer Rechenkette",

    [
      "Arbeite die Rechenoperationen rückwärts ab.",

      `Addiere zunächst ${c} auf beiden Seiten.`,

      `Teile danach durch ${a} und entferne anschließend die Addition von ${b}.`,
    ],

    [
      `${result} + ${c} = ${
        result + c
      }.`,

      `${
        result + c
      } ÷ ${a} = ${
        missing + b
      }.`,

      `${
        missing + b
      } - ${b} = ${missing}.`,
    ],

    {
      solutionDisplay:
        String(
          missing
        ),
    }
  )
}

function generateRationalEquation(
  difficulty:
    LogicDifficulty
) {
  const root =
    randomInt(
      -6,
      10
    )

  let c =
    randomInt(
      2,
      8
    )

  if (
    root + c ===
    0
  ) {
    c++
  }

  let a =
    randomInt(
      2,
      8
    )

  const ratio =
    randomInt(
      2,
      6
    )

  if (
    a === ratio
  ) {
    a++
  }

  const b =
    ratio *
      (
        root + c
      ) -
    a * root

  return makeQuestion(
    difficulty,

    "solve-x",

    "Löse die Bruchgleichung nach x auf.",

    [
      `(${a}x ${signed(
        b
      )}) / (x + ${c}) = ${ratio}`,
    ],

    root,

    "Bruchgleichung",

    [
      "Beseitige zuerst den Nenner durch Multiplikation mit x + c.",

      `Danach steht links ${a}x ${signed(
        b
      )} und rechts ${ratio}(x + ${c}).`,

      "Fasse anschließend alle x-Terme zusammen.",
    ],

    [
      `${a}x ${signed(
        b
      )} = ${ratio}x + ${
        ratio * c
      }.`,

      `${a - ratio}x = ${
        ratio * c -
        b
      }.`,

      `Damit folgt x = ${root}.`,
    ],

    {
      answerVariable:
        "x",

      solutionDisplay:
        `x = ${root}`,
    }
  )
}

function generateTranscendentalEquation(
  difficulty:
    LogicDifficulty
) {
  const variant =
    choice([
      "exponential",
      "logarithmic",
    ] as const)

  if (
    variant ===
    "exponential"
  ) {
    const base =
      choice([
        2,
        3,
        5,
      ])

    const a =
      randomInt(
        2,
        4
      )

    const b =
      randomInt(
        -4,
        5
      )

    let right =
      randomInt(
        5,
        20
      )

    while (
      Number.isInteger(
        Math.log(
          right
        ) /
          Math.log(
            base
          )
      )
    ) {
      right++
    }

    const answer =
      `(log(${right})/log(${base})-${b})/${a}`

    return makeQuestion(
      difficulty,

      "solve-x",

      "Löse die Exponentialgleichung nach x auf. Eine exakte Antwort ist erlaubt.",

      [
        `${base}^(${a}x ${signed(
          b
        )}) = ${right}`,
      ],

      answer,

      "Exponentialgleichung mit Logarithmus",

      [
        "Logarithmiere beide Seiten.",

        `Nutze ln(${base}^u) = u · ln(${base}).`,

        `Danach lässt sich die entstandene lineare Gleichung nach x auflösen.`,
      ],

      [
        `(${a}x ${signed(
          b
        )}) · ln(${base}) = ln(${right}).`,

        `${a}x ${signed(
          b
        )} = ln(${right}) / ln(${base}).`,

        `x = (ln(${right}) / ln(${base}) - (${b})) / ${a}.`,
      ],

      {
        answerType:
          "expression",

        answerVariable:
          "x",

        solutionDisplay:
          `x = (ln(${right}) / ln(${base}) - (${b})) / ${a}`,
      }
    )
  }

  const a =
    randomInt(
      2,
      6
    )

  const b =
    randomInt(
      1,
      8
    )

  const exponent =
    randomInt(
      2,
      4
    )

  const answer =
    `(e^${exponent}-${b})/${a}`

  return makeQuestion(
    difficulty,

    "solve-x",

    "Löse die logarithmische Gleichung nach x auf.",

    [
      `ln(${a}x + ${b}) = ${exponent}`,
    ],

    answer,

    "Logarithmische Gleichung",

    [
      "Wende auf beide Seiten die Exponentialfunktion an.",

      `Aus ln(u) = ${exponent} folgt u = e^${exponent}.`,

      "Danach bleibt nur noch eine lineare Gleichung.",
    ],

    [
      `${a}x + ${b} = e^${exponent}.`,

      `${a}x = e^${exponent} - ${b}.`,

      `x = (e^${exponent} - ${b}) / ${a}.`,
    ],

    {
      answerType:
        "expression",

      answerVariable:
        "x",

      solutionDisplay:
        `x = (e^${exponent} - ${b}) / ${a}`,
    }
  )
}

function generateEquationSystem(
  difficulty:
    LogicDifficulty
) {
  const a =
    randomInt(
      2,
      9
    )

  const b =
    randomInt(
      2,
      9
    )

  const c =
    randomInt(
      2,
      9
    )

  if (
    difficulty ===
    "normal"
  ) {
    const first =
      a + b

    const second =
      b + c

    const third =
      a + c

    const answer =
      a * b

    return makeQuestion(
      difficulty,

      "equation-system",

      "Bestimme A · B.",

      [
        `A + B = ${first}`,

        `B + C = ${second}`,

        `A + C = ${third}`,
      ],

      answer,

      "Lineares Gleichungssystem",

      [
        "Addiere die erste und dritte Gleichung und nutze anschließend die zweite.",

        "Damit kannst du zuerst A bestimmen.",

        `Die eindeutigen Werte sind A = ${a}, B = ${b} und C = ${c}.`,
      ],

      [
        `Aus den drei Gleichungen erhält man A = ${a}.`,

        `Damit folgt B = ${first} - ${a} = ${b}.`,

        `C ergibt sich entsprechend zu ${c}.`,

        `Gesucht ist A · B = ${a} · ${b} = ${answer}.`,
      ],

      {
        solutionDisplay:
          String(
            answer
          ),
      }
    )
  }

  if (
    difficulty ===
    "hard"
  ) {
    const first =
      2 * a + b

    const second =
      b + 2 * c

    const third =
      a + c

    const answer =
      a * b + c

    return makeQuestion(
      difficulty,

      "equation-system",

      "Bestimme A · B + C.",

      [
        `2A + B = ${first}`,

        `B + 2C = ${second}`,

        `A + C = ${third}`,
      ],

      answer,

      "Gewichtetes Gleichungssystem",

      [
        "Nutze A + C, um eine Variable durch die andere auszudrücken.",

        "Setze diese Beziehung in eine der anderen Gleichungen ein.",

        `Die Lösung des Systems lautet A = ${a}, B = ${b}, C = ${c}.`,
      ],

      [
        `Das lineare System besitzt die eindeutige Lösung A = ${a}, B = ${b}, C = ${c}.`,

        `Damit ist A · B + C = ${a} · ${b} + ${c}.`,

        `Das Ergebnis ist ${answer}.`,
      ],

      {
        solutionDisplay:
          String(
            answer
          ),
      }
    )
  }

  const first =
    2 * a +
    b -
    c

  const second =
    a -
    2 * b +
    3 * c

  const third =
    3 * a +
    b +
    2 * c

  const answer =
    a * b - c

  return makeQuestion(
    difficulty,

    "equation-system",

    "Bestimme A · B − C.",

    [
      `2A + B - C = ${first}`,

      `A - 2B + 3C = ${second}`,

      `3A + B + 2C = ${third}`,
    ],

    answer,

    "Dreidimensionales lineares Gleichungssystem",

    [
      "Eliminiere zunächst eine Variable aus zwei Paaren von Gleichungen.",

      "Löse anschließend das verbleibende 2×2-System.",

      `Die Variablen lauten A = ${a}, B = ${b}, C = ${c}.`,
    ],

    [
      `Durch Eliminieren erhält man die eindeutige Lösung A = ${a}, B = ${b}, C = ${c}.`,

      `Gesucht ist A · B − C.`,

      `${a} · ${b} − ${c} = ${answer}.`,
    ],

    {
      solutionDisplay:
        String(
          answer
        ),
    }
  )
}

function applyOperator(
  left: number,
  right: number,
  operator: Operator
) {
  if (
    operator === "+"
  ) {
    return (
      left + right
    )
  }

  if (
    operator === "-"
  ) {
    return (
      left - right
    )
  }

  if (
    operator === "*"
  ) {
    return (
      left * right
    )
  }

  if (
    right === 0
  ) {
    return NaN
  }

  return (
    left / right
  )
}

function evaluateOperators(
  numbers: number[],
  operators: Operator[]
) {
  let result =
    numbers[0]

  for (
    let index = 0;
    index <
    operators.length;
    index++
  ) {
    result =
      applyOperator(
        result,
        numbers[
          index + 1
        ],
        operators[index]
      )
  }

  return result
}

function operatorCombinations(
  options: Operator[],
  slots: number
): Operator[][] {
  if (
    slots === 0
  ) {
    return [[]]
  }

  const smaller =
    operatorCombinations(
      options,
      slots - 1
    )

  return options.flatMap(
    (operator) =>
      smaller.map(
        (rest) => [
          operator,
          ...rest,
        ]
      )
  )
}

function operatorSymbol(
  operator: Operator
) {
  if (
    operator === "*"
  ) {
    return "×"
  }

  if (
    operator === "/"
  ) {
    return "÷"
  }

  return operator
}

function buildOperatorLine(
  numbers: number[],
  slots: number,
  target: number
) {
  if (
    slots === 2
  ) {
    return `(${numbers[0]} ? ${numbers[1]}) ? ${numbers[2]} = ${target}`
  }

  return `((${numbers[0]} ? ${numbers[1]}) ? ${numbers[2]}) ? ${numbers[3]} = ${target}`
}

function generateOperatorPuzzle(
  difficulty:
    LogicDifficulty
): MathLogicQuestion {
  const slots =
    difficulty ===
    "expert"
      ? 3
      : 2

  const options:
    Operator[] =
      difficulty ===
      "normal"
        ? [
            "+",
            "-",
            "*",
          ]
        : [
            "+",
            "-",
            "*",
            "/",
          ]

  for (
    let attempt = 0;
    attempt < 300;
    attempt++
  ) {
    const numbers =
      Array.from(
        {
          length:
            slots + 1,
        },
        () =>
          randomInt(
            2,
            12
          )
      )

    const hiddenOperators =
      Array.from(
        {
          length:
            slots,
        },
        () =>
          choice(
            options
          )
      )

    const target =
      evaluateOperators(
        numbers,
        hiddenOperators
      )

    if (
      !Number.isFinite(
        target
      ) ||
      !Number.isInteger(
        target
      ) ||
      Math.abs(
        target
      ) > 500
    ) {
      continue
    }

    const allSolutions =
      operatorCombinations(
        options,
        slots
      ).filter(
        (operators) =>
          Math.abs(
            evaluateOperators(
              numbers,
              operators
            ) -
              target
          ) <
          1e-10
      )

    if (
      allSolutions.length !==
      1
    ) {
      continue
    }

    const solution =
      allSolutions[0]

    const answer =
      solution.join("|")

    const readable =
      solution
        .map(
          operatorSymbol
        )
        .join(
          " , "
        )

    return makeQuestion(
      difficulty,

      "operators",

      "Setze die fehlenden Operatoren ein. Die Klammern legen die Reihenfolge eindeutig fest.",

      [
        buildOperatorLine(
          numbers,
          slots,
          target
        ),
      ],

      answer,

      "Eindeutiges Operator-Puzzle",

      [
        "Arbeite entsprechend der eingezeichneten Klammern von innen nach außen.",

        "Teste zuerst, ob Multiplikation oder Division nötig sind, um die Größenordnung des Ergebnisses zu erreichen.",

        `Die eindeutige Operatorfolge lautet ${readable}.`,
      ],

      [
        `Die Klammern legen eine eindeutige Reihenfolge der Rechenschritte fest.`,

        `Nur die Kombination ${readable} führt zum Zielwert ${target}.`,

        `Alle anderen zulässigen Operatorfolgen ergeben einen anderen Wert.`,
      ],

      {
        answerType:
          "operators",

        acceptedAnswers:
          [
            answer,
          ],

        solutionDisplay:
          readable,

        operatorPuzzle:
          {
            numbers,

            target,

            slots,

            options,
          },
      }
    )
  }

  return makeQuestion(
    difficulty,

    "operators",

    "Setze die fehlenden Operatoren ein.",

    [
      "(8 ? 4) ? 2 = 18",
    ],

    "+",

    "Operator-Puzzle",

    [
      "Beginne mit der Klammer.",

      "Die erste Operation muss das Zwischenergebnis sinnvoll vorbereiten.",

      "Versuche Addition und Multiplikation.",
    ],

    [
      "Diese Ersatzaufgabe wurde erzeugt, weil der Zufallsgenerator keine geeignete eindeutige Aufgabe gefunden hat.",
    ],

    {
      answerType:
        "operators",

      acceptedAnswers:
        [
          "*|-",
        ],

      solutionDisplay:
        "× , −",

      operatorPuzzle:
        {
          numbers:
            [
              5,
              4,
              2,
            ],

          target:
            18,

          slots:
            2,

          options:
            [
              "+",
              "-",
              "*",
            ],
        },

      lines:
        [
          "(5 ? 4) ? 2 = 18",
        ],
    }
  )
}

const generators: Record<
  LogicDifficulty,
  ((
    difficulty:
      LogicDifficulty
  ) =>
    MathLogicQuestion)[]
> = {
  normal: [
    generateAffineEquation,
    generateMissingNumber,
    generateEquationSystem,
    generateOperatorPuzzle,
  ],

  hard: [
    generateRationalEquation,
    generateMissingNumber,
    generateEquationSystem,
    generateOperatorPuzzle,
  ],

  expert: [
    generateTranscendentalEquation,
    generateRationalEquation,
    generateEquationSystem,
    generateOperatorPuzzle,
  ],
}

export function generateMathLogic(
  difficulty:
    LogicDifficulty
): MathLogicQuestion {
  return choice(
    generators[
      difficulty
    ]
  )(
    difficulty
  )
}