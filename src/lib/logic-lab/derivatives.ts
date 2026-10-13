import {
  choice,
  randomInt,
} from "./random"

import {
  differentiateExpression,
  humanizeExpression,
} from "./math-engine"

import type {
  CalculusQuestion,
  LogicDifficulty,
} from "./types"

function signed(
  value: number
) {
  if (
    value >= 0
  ) {
    return `+${value}`
  }

  return `${value}`
}

function createDerivative(
  difficulty:
    LogicDifficulty,

  expression:
    string,

  ruleLabel:
    string,

  hints: [
    string,
    string,
    string,
  ],

  explanation:
    string[]
): CalculusQuestion {
  const answer =
    differentiateExpression(
      expression,
      "x"
    )

  return {
    id: `derivative-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`,

    category:
      "derivatives",

    categoryLabel:
      "Derivatives",

    difficulty,

    prompt:
      "Bestimme f'(x).",

    expression,

    displayExpression:
      humanizeExpression(
        expression
      ),

    variable:
      "x",

    answer,

    answerType:
      "expression",

    answerVariable:
      "x",

    solutionDisplay:
      humanizeExpression(
        answer
      ),

    ruleLabel,

    hints,

    explanation,
  }
}

function polynomial(
  difficulty:
    LogicDifficulty
) {
  const a =
    randomInt(
      2,
      7
    )

  const b =
    randomInt(
      2,
      8
    )

  const c =
    randomInt(
      -8,
      8
    )

  const n =
    randomInt(
      3,
      6
    )

  const m =
    randomInt(
      1,
      n - 1
    )

  const expression =
    `${a}*x^${n}+${b}*x^${m}${signed(
      c
    )}`

  return createDerivative(
    difficulty,

    expression,

    "Potenzregel",

    [
      "Leite jeden Summanden einzeln ab.",

      "Für x^n gilt: n · x^(n−1).",

      "Konstanten verschwinden beim Ableiten.",
    ],

    [
      `Die Potenzregel wird auf jeden Potenzterm angewendet.`,

      `${a}x^${n} wird zu ${
        a * n
      }x^${n - 1}.`,

      `${b}x^${m} wird zu ${
        b * m
      }x^${m - 1}.`,
    ]
  )
}

function trigExponential(
  difficulty:
    LogicDifficulty
) {
  const a =
    randomInt(
      2,
      6
    )

  const b =
    randomInt(
      2,
      5
    )

  const c =
    randomInt(
      2,
      6
    )

  const d =
    randomInt(
      2,
      5
    )

  const expression =
    `${a}*sin(${b}*x)+${c}*e^(${d}*x)`

  return createDerivative(
    difficulty,

    expression,

    "Kettenregel bei trigonometrischer und exponentieller Funktion",

    [
      "Behandle beide Summanden getrennt.",

      "Bei sin(bx) und e^(dx) muss jeweils die innere Ableitung berücksichtigt werden.",

      `Die inneren Ableitungen sind ${b} beziehungsweise ${d}.`,
    ],

    [
      `d/dx sin(${b}x) = ${b}cos(${b}x).`,

      `d/dx e^(${d}x) = ${d}e^(${d}x).`,

      "Anschließend werden die äußeren Faktoren wieder berücksichtigt.",
    ]
  )
}

function chainPower(
  difficulty:
    LogicDifficulty
) {
  const a =
    randomInt(
      2,
      6
    )

  const b =
    randomInt(
      -7,
      7
    )

  const n =
    randomInt(
      3,
      6
    )

  const expression =
    `(${a}*x${signed(
      b
    )})^${n}`

  return createDerivative(
    difficulty,

    expression,

    "Kettenregel",

    [
      "Erkenne die äußere Potenz und die innere lineare Funktion.",

      `Leite zuerst u^${n} nach u ab.`,

      `Multipliziere anschließend mit der inneren Ableitung ${a}.`,
    ],

    [
      `Setze u = ${a}x ${signed(
        b
      )}.`,

      `Die äußere Ableitung ist ${n}u^${
        n - 1
      }.`,

      `Mit u' = ${a} folgt die vollständige Ableitung.`,
    ]
  )
}

function productRule(
  difficulty:
    LogicDifficulty
) {
  const a =
    randomInt(
      2,
      5
    )

  const b =
    randomInt(
      -6,
      6
    )

  const c =
    randomInt(
      -6,
      6
    )

  const k =
    randomInt(
      2,
      4
    )

  const expression =
    `(${a}*x^2${signed(
      b
    )}*x${signed(
      c
    )})*e^(${k}*x)`

  return createDerivative(
    difficulty,

    expression,

    "Produktregel und Kettenregel",

    [
      "Die Funktion ist ein Produkt aus einem Polynom und einer Exponentialfunktion.",

      "Nutze (u · v)' = u'v + uv'.",

      `Beim Ableiten von e^(${k}x) entsteht zusätzlich der Faktor ${k}.`,
    ],

    [
      "Setze u als Polynom und v als Exponentialfunktion.",

      "Berechne u' und v' getrennt.",

      "Setze beide in u'v + uv' ein und fasse bei Bedarf zusammen.",
    ]
  )
}

function quotientRule(
  difficulty:
    LogicDifficulty
) {
  const a =
    randomInt(
      2,
      6
    )

  const b =
    randomInt(
      -6,
      7
    )

  const c =
    randomInt(
      2,
      7
    )

  const expression =
    `(${a}*x^2${signed(
      b
    )})/(x+${c})`

  return createDerivative(
    difficulty,

    expression,

    "Quotientenregel",

    [
      "Zähler und Nenner müssen getrennt abgeleitet werden.",

      "Nutze (u/v)' = (u'v − uv') / v².",

      "Der Nenner x + c hat die Ableitung 1.",
    ],

    [
      "Setze u als Zähler und v als Nenner.",

      "Berechne u' und v'.",

      "Setze anschließend in die Quotientenregel ein.",
    ]
  )
}

function expertComposite(
  difficulty:
    LogicDifficulty
) {
  const p =
    randomInt(
      1,
      6
    )

  const a =
    randomInt(
      2,
      4
    )

  const b =
    randomInt(
      2,
      6
    )

  const expression =
    `log(x^2+${p})*e^(${a}*x)/(x+${b})^(1/2)`

  return createDerivative(
    difficulty,

    expression,

    "Produkt-, Quotienten- und Kettenregel",

    [
      "Die Funktion besteht aus mehreren verschachtelten Faktoren.",

      "Betrachte zunächst ln(x²+p) · e^(ax) als Zähler und die Wurzel als Nenner.",

      "Du benötigst Produktregel, Quotientenregel und mehrere Anwendungen der Kettenregel.",
    ],

    [
      "Leite zunächst den Zähler mit der Produktregel ab.",

      "Die Ableitung von ln(x²+p) enthält den Faktor 2x/(x²+p).",

      "Die Wurzel im Nenner kann als (x+b)^(1/2) geschrieben werden.",

      "Danach wird die Quotientenregel angewendet.",
    ]
  )
}

function expertTrigComposite(
  difficulty:
    LogicDifficulty
) {
  const a =
    randomInt(
      2,
      4
    )

  const b =
    randomInt(
      1,
      5
    )

  const c =
    randomInt(
      2,
      5
    )

  const n =
    randomInt(
      2,
      4
    )

  const expression =
    `sin(${a}*x^2+${b}*x)*(${c}*x^${n}+1)`

  return createDerivative(
    difficulty,

    expression,

    "Produktregel mit verschachtelter trigonometrischer Funktion",

    [
      "Du hast ein Produkt aus zwei nichttrivialen Funktionen.",

      "Die Sinusfunktion benötigt zusätzlich die Kettenregel.",

      "Leite beide Faktoren getrennt ab und verwende danach die Produktregel.",
    ],

    [
      `Die innere Funktion des Sinus lautet ${a}x² + ${b}x.`,

      `Ihre Ableitung ist ${
        2 * a
      }x + ${b}.`,

      "Diese wird mit dem Kosinus der inneren Funktion multipliziert.",

      "Anschließend folgt die Produktregel mit dem zweiten Faktor.",
    ]
  )
}

const generators: Record<
  LogicDifficulty,
  ((
    difficulty:
      LogicDifficulty
  ) =>
    CalculusQuestion)[]
> = {
  normal: [
    polynomial,
    trigExponential,
    chainPower,
  ],

  hard: [
    chainPower,
    productRule,
    quotientRule,
  ],

  expert: [
    productRule,
    quotientRule,
    expertComposite,
    expertTrigComposite,
  ],
}

export function generateDerivative(
  difficulty:
    LogicDifficulty
) {
  return choice(
    generators[
      difficulty
    ]
  )(
    difficulty
  )
}