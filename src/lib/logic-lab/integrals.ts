import {
  choice,
  randomInt,
} from "./random"

import {
  definiteIntegralExpression,
  humanizeExpression,
  simplifyExpression,
} from "./math-engine"

import type {
  CalculusQuestion,
  LogicDifficulty,
} from "./types"

function createIndefiniteIntegral(
  difficulty:
    LogicDifficulty,

  integrand:
    string,

  answer:
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
  const simplified =
    simplifyExpression(
      answer
    )

  return {
    id: `integral-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`,

    category:
      "integrals",

    categoryLabel:
      "Integrals",

    difficulty,

    prompt:
      "Bestimme eine Stammfunktion F(x).",

    expression:
      integrand,

    displayExpression:
      humanizeExpression(
        integrand
      ),

    integrand,

    variable:
      "x",

    answer:
      simplified,

    answerType:
      "antiderivative",

    answerVariable:
      "x",

    solutionDisplay:
      `${humanizeExpression(
        simplified
      )} + C`,

    ruleLabel,

    hints,

    explanation,
  }
}

function createDefiniteIntegral(
  difficulty:
    LogicDifficulty,

  integrand:
    string,

  from:
    string,

  to:
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
    definiteIntegralExpression(
      integrand,
      from,
      to,
      "x"
    )

  return {
    id: `definite-integral-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`,

    category:
      "integrals",

    categoryLabel:
      "Integrals",

    difficulty,

    prompt:
      "Berechne das bestimmte Integral.",

    expression:
      integrand,

    displayExpression:
      humanizeExpression(
        integrand
      ),

    integrand,

    variable:
      "x",

    bounds: {
      from,
      to,
    },

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

function polynomialIntegral(
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
      7
    )

  const n =
    randomInt(
      2,
      5
    )

  const m =
    randomInt(
      1,
      n - 1
    )

  const integrand =
    `${a}*x^${n}+${b}*x^${m}`

  const answer =
    `${a}/${n + 1}*x^${
      n + 1
    }+${b}/${m + 1}*x^${
      m + 1
    }`

  return createIndefiniteIntegral(
    difficulty,

    integrand,

    answer,

    "Potenzregel für Stammfunktionen",

    [
      "Integriere die Summanden getrennt.",

      "Bei x^n wird der Exponent um 1 erhöht.",

      "Anschließend wird durch den neuen Exponenten geteilt.",
    ],

    [
      `Aus x^${n} wird x^${
        n + 1
      }/${n + 1}.`,

      `Aus x^${m} wird x^${
        m + 1
      }/${m + 1}.`,

      "Die Faktoren vor den Potenzen bleiben erhalten.",
    ]
  )
}

function exponentialIntegral(
  difficulty:
    LogicDifficulty
) {
  const a =
    randomInt(
      2,
      7
    )

  const k =
    randomInt(
      2,
      5
    )

  const integrand =
    `${a}*e^(${k}*x)`

  const answer =
    `${a}/${k}*e^(${k}*x)`

  return createIndefiniteIntegral(
    difficulty,

    integrand,

    answer,

    "Exponentialfunktion integrieren",

    [
      "Die Stammfunktion von e^(kx) besitzt wieder dieselbe Exponentialfunktion.",

      `Beim Ableiten entsteht jedoch der zusätzliche Faktor ${k}.`,

      `Deshalb muss beim Integrieren durch ${k} geteilt werden.`,
    ],

    [
      `∫ e^(${k}x) dx = e^(${k}x) / ${k}.`,

      `Der äußere Faktor ${a} bleibt erhalten.`,

      "Eine additive Konstante ist beliebig.",
    ]
  )
}

function trigIntegral(
  difficulty:
    LogicDifficulty
) {
  const a =
    randomInt(
      2,
      7
    )

  const k =
    randomInt(
      2,
      5
    )

  const integrand =
    `${a}*cos(${k}*x)`

  const answer =
    `${a}/${k}*sin(${k}*x)`

  return createIndefiniteIntegral(
    difficulty,

    integrand,

    answer,

    "Trigonometrische Stammfunktion",

    [
      "Welche Funktion ergibt beim Ableiten einen Kosinus?",

      `Wegen des inneren Faktors ${k} ist eine Korrektur nötig.`,

      `Teile den äußeren Faktor durch ${k}.`,
    ],

    [
      `Die Ableitung von sin(${k}x) ist ${k}cos(${k}x).`,

      `Daher ist ${
        a
      }/${k} · sin(${k}x) eine Stammfunktion.`,
    ]
  )
}

function substitutionIntegral(
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
      2,
      8
    )

  const n =
    randomInt(
      2,
      5
    )

  const integrand =
    `${2 * a}*x*(${a}*x^2+${b})^${n}`

  const answer =
    `(${a}*x^2+${b})^${
      n + 1
    }/${n + 1}`

  return createIndefiniteIntegral(
    difficulty,

    integrand,

    answer,

    "Substitution",

    [
      `Der Ausdruck ${a}x² + ${b} eignet sich als innere Variable.`,

      `Seine Ableitung ist ${
        2 * a
      }x und steht bereits als Faktor im Integranden.`,

      "Nach der Substitution bleibt nur eine Potenzintegration.",
    ],

    [
      `Setze u = ${a}x² + ${b}.`,

      `Dann ist du = ${
        2 * a
      }x dx.`,

      `Es bleibt ∫u^${n} du.`,

      `Damit ergibt sich u^${
        n + 1
      }/${n + 1} + C.`,
    ]
  )
}

function logarithmicIntegral(
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
      9
    )

  const integrand =
    `${a}/(${a}*x+${b})`

  const answer =
    `log(${a}*x+${b})`

  return createIndefiniteIntegral(
    difficulty,

    integrand,

    answer,

    "Logarithmische Stammfunktion",

    [
      "Der Zähler entspricht der Ableitung des Nenners.",

      "Erkenne die Form f'(x)/f(x).",

      "Die Stammfunktion dieser Form ist ln|f(x)|.",
    ],

    [
      `Setze f(x) = ${a}x + ${b}.`,

      `Dann ist f'(x) = ${a}.`,

      "Damit besitzt der Integrand die Struktur f'/f.",

      `Eine Stammfunktion ist ln(${a}x + ${b}).`,
    ]
  )
}

function integrationByParts(
  difficulty:
    LogicDifficulty
) {
  const a =
    randomInt(
      2,
      4
    )

  const integrand =
    `x*e^(${a}*x)`

  const answer =
    `e^(${a}*x)*(${a}*x-1)/${
      a * a
    }`

  return createIndefiniteIntegral(
    difficulty,

    integrand,

    answer,

    "Partielle Integration",

    [
      "Das Produkt aus x und einer Exponentialfunktion legt partielle Integration nahe.",

      "Wähle u = x und dv = e^(ax) dx.",

      "Nutze ∫u dv = uv − ∫v du.",
    ],

    [
      "u = x und du = dx.",

      `v = e^(${a}x) / ${a}.`,

      `Damit folgt x · e^(${a}x)/${a} − ∫e^(${a}x)/${a} dx.`,

      "Nach dem zweiten Integral erhält man die angegebene Stammfunktion.",
    ]
  )
}

function trigProductIntegral(
  difficulty:
    LogicDifficulty
) {
  const a =
    randomInt(
      2,
      5
    )

  const integrand =
    `sin(${a}*x)*cos(${a}*x)`

  const answer =
    `sin(${a}*x)^2/${
      2 * a
    }`

  return createIndefiniteIntegral(
    difficulty,

    integrand,

    answer,

    "Trigonometrische Substitution",

    [
      `Setze u = sin(${a}x).`,

      `Die Ableitung enthält cos(${a}x).`,

      "Danach entsteht ein Integral der Form ∫u du.",
    ],

    [
      `u = sin(${a}x).`,

      `du = ${a}cos(${a}x) dx.`,

      `Nach Herausziehen von 1/${a} bleibt ∫u du.`,

      `Das ergibt u²/(2·${a}) + C.`,
    ]
  )
}

function definitePolynomial(
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
      1,
      5
    )

  const upper =
    randomInt(
      2,
      5
    )

  const integrand =
    `${a}*x^2+${b}*x`

  return createDefiniteIntegral(
    difficulty,

    integrand,

    "0",

    String(
      upper
    ),

    "Bestimmtes Integral mit Hauptsatz",

    [
      "Bestimme zunächst eine Stammfunktion.",

      "Setze anschließend obere und untere Grenze ein.",

      "Berechne F(oben) − F(unten).",
    ],

    [
      `Eine Stammfunktion von ${humanizeExpression(
        integrand
      )} wird zunächst bestimmt.`,

      `Danach werden x = ${upper} und x = 0 eingesetzt.`,

      "Die Differenz der beiden Funktionswerte ist das bestimmte Integral.",
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
    polynomialIntegral,
    exponentialIntegral,
    trigIntegral,
  ],

  hard: [
    substitutionIntegral,
    logarithmicIntegral,
    definitePolynomial,
    trigIntegral,
  ],

  expert: [
    integrationByParts,
    trigProductIntegral,
    substitutionIntegral,
    definitePolynomial,
  ],
}

export function generateIntegral(
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