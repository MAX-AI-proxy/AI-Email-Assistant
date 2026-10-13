import {
  choice,
  randomInt,
} from "./random"

import {
  humanizeExpression,
  simplifyExpression,
} from "./math-engine"

import type {
  CalculusQuestion,
  LogicDifficulty,
} from "./types"

function createLimit(
  difficulty:
    LogicDifficulty,

  expression:
    string,

  target:
    string,

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
    string[]
): CalculusQuestion {
  const simplifiedAnswer =
    typeof answer ===
    "number"
      ? String(
          answer
        )
      : simplifyExpression(
          answer
        )

  return {
    id: `limit-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`,

    category:
      "limits",

    categoryLabel:
      "Limits",

    difficulty,

    prompt:
      "Bestimme den Grenzwert.",

    expression,

    displayExpression:
      humanizeExpression(
        expression
      ),

    variable:
      "x",

    limitTarget:
      target,

    answer:
      simplifiedAnswer,

    answerType:
      "expression",

    answerVariable:
      "x",

    solutionDisplay:
      humanizeExpression(
        simplifiedAnswer
      ),

    ruleLabel,

    hints,

    explanation,
  }
}

function sineStandard(
  difficulty:
    LogicDifficulty
) {
  const a =
    randomInt(
      2,
      8
    )

  return createLimit(
    difficulty,

    `sin(${a}*x)/x`,

    "0",

    a,

    "Trigonometrischer Standardgrenzwert",

    [
      "Nutze den bekannten Grenzwert sin(u)/u für u → 0.",

      `Forme den Ausdruck so um, dass ${a}x sowohl im Sinus als auch im Nenner vorkommt.`,

      `sin(${a}x)/x = ${a} · sin(${a}x)/(${a}x).`,
    ],

    [
      `Setze u = ${a}x.`,

      "Für x → 0 gilt auch u → 0.",

      "sin(u)/u → 1.",

      `Der verbleibende Faktor ist ${a}.`,
    ]
  )
}

function cancellationLimit(
  difficulty:
    LogicDifficulty
) {
  const a =
    randomInt(
      2,
      9
    )

  return createLimit(
    difficulty,

    `(x^2-${a * a})/(x-${a})`,

    String(
      a
    ),

    2 * a,

    "Faktorisieren und Kürzen",

    [
      "Direktes Einsetzen führt zunächst zu 0/0.",

      "Nutze die Differenz zweier Quadrate.",

      `x² − ${a * a} = (x − ${a})(x + ${a}).`,
    ],

    [
      "Der Zähler wird faktorisiert.",

      `Der Faktor x − ${a} kann für x ≠ ${a} gekürzt werden.`,

      `Übrig bleibt x + ${a}.`,

      `Für x → ${a} ergibt sich ${
        2 * a
      }.`,
    ]
  )
}

function rationalInfinity(
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
      1,
      8
    )

  const c =
    randomInt(
      2,
      9
    )

  const d =
    randomInt(
      1,
      8
    )

  const answer =
    `${a}/${c}`

  return createLimit(
    difficulty,

    `(${a}*x^3+${b}*x)/(${c}*x^3-${d}*x^2)`,

    "Infinity",

    answer,

    "Vergleich der höchsten Potenzen",

    [
      "Für x → ∞ dominieren die höchsten Potenzen.",

      "Teile Zähler und Nenner durch x³.",

      `Nur die Leitkoeffizienten ${a} und ${c} bleiben im Grenzwert übrig.`,
    ],

    [
      "Alle Terme niedrigerer Ordnung verschwinden relativ zu x³.",

      `Damit bleibt ${a}/${c}.`,
    ]
  )
}

function exponentialStandard(
  difficulty:
    LogicDifficulty
) {
  const a =
    randomInt(
      2,
      7
    )

  return createLimit(
    difficulty,

    `(e^(${a}*x)-1)/x`,

    "0",

    a,

    "Exponentialer Standardgrenzwert",

    [
      "Nutze den Standardgrenzwert (e^u − 1)/u für u → 0.",

      `Setze u = ${a}x.`,

      `Es entsteht der zusätzliche Faktor ${a}.`,
    ],

    [
      `Mit u = ${a}x gilt x = u/${a}.`,

      `Der Ausdruck wird zu ${a} · (e^u − 1)/u.`,

      "Der zweite Faktor geht gegen 1.",

      `Der Grenzwert ist daher ${a}.`,
    ]
  )
}

function rationalizationLimit(
  difficulty:
    LogicDifficulty
) {
  const c =
    choice([
      1,
      4,
      9,
      16,
      25,
    ])

  const root =
    Math.sqrt(
      c
    )

  const answer =
    `1/${2 * root}`

  return createLimit(
    difficulty,

    `(sqrt(x+${c})-${root})/x`,

    "0",

    answer,

    "Rationalisieren",

    [
      "Direktes Einsetzen ergibt 0/0.",

      "Erweitere mit dem konjugierten Ausdruck.",

      `Multipliziere mit (sqrt(x+${c}) + ${root}).`,
    ],

    [
      "Durch die dritte binomische Formel wird der Zähler zu x.",

      "Dieser Faktor x kürzt sich mit dem Nenner.",

      `Übrig bleibt 1/(sqrt(x+${c}) + ${root}).`,

      `Für x → 0 ergibt sich 1/${
        2 * root
      }.`,
    ]
  )
}

function logarithmicStandard(
  difficulty:
    LogicDifficulty
) {
  const a =
    randomInt(
      2,
      8
    )

  return createLimit(
    difficulty,

    `log(1+${a}*x)/x`,

    "0",

    a,

    "Logarithmischer Standardgrenzwert",

    [
      "Nutze ln(1+u)/u → 1 für u → 0.",

      `Setze u = ${a}x.`,

      `Dadurch entsteht außerhalb des Standardgrenzwerts der Faktor ${a}.`,
    ],

    [
      `ln(1+${a}x)/x = ${a} · ln(1+${a}x)/(${a}x).`,

      "Der zweite Faktor geht gegen 1.",

      `Damit ist der Grenzwert ${a}.`,
    ]
  )
}

function cosineLimit(
  difficulty:
    LogicDifficulty
) {
  const a =
    randomInt(
      2,
      6
    )

  const answer =
    `${a * a}/2`

  return createLimit(
    difficulty,

    `(1-cos(${a}*x))/x^2`,

    "0",

    answer,

    "Trigonometrischer Grenzwert zweiter Ordnung",

    [
      "Der Ausdruck ist mit 1 − cos(u) verknüpft.",

      "Nutze 1 − cos(u) ~ u²/2 für u → 0.",

      `Hier ist u = ${a}x.`,
    ],

    [
      `Für kleine u gilt (1 − cos(u))/u² → 1/2.`,

      `Mit u = ${a}x entsteht zusätzlich der Faktor ${a}².`,

      `Der Grenzwert ist daher ${a}²/2 = ${answer}.`,
    ]
  )
}

function cubicSineLimit(
  difficulty:
    LogicDifficulty
) {
  const a =
    randomInt(
      2,
      5
    )

  const answer =
    `-${a * a * a}/6`

  return createLimit(
    difficulty,

    `(sin(${a}*x)-${a}*x)/x^3`,

    "0",

    answer,

    "Taylorentwicklung dritten Grades",

    [
      "Der Standardgrenzwert sin(x)/x reicht hier nicht aus.",

      "Betrachte die Taylorentwicklung von sin(u) um 0 bis zur dritten Ordnung.",

      "sin(u) = u − u³/6 + höhere Ordnungen.",
    ],

    [
      `Setze u = ${a}x.`,

      `sin(${a}x) = ${a}x − (${a}x)³/6 + höhere Terme.`,

      `Nach Abzug von ${a}x bleibt −${a}³x³/6.`,

      `Nach Division durch x³ ergibt sich ${answer}.`,
    ]
  )
}

function infinityExponential(
  difficulty:
    LogicDifficulty
) {
  const a =
    randomInt(
      2,
      7
    )

  return createLimit(
    difficulty,

    `x*(e^(${a}/x)-1)`,

    "Infinity",

    a,

    "Substitution bei Grenzwert gegen unendlich",

    [
      "Für x → ∞ geht a/x gegen 0.",

      `Setze u = ${a}/x.`,

      "Nutze anschließend den Standardgrenzwert (e^u − 1)/u.",
    ],

    [
      `Mit u = ${a}/x gilt x = ${a}/u.`,

      `Der Ausdruck wird zu ${a} · (e^u − 1)/u.`,

      "Für u → 0 geht der zweite Faktor gegen 1.",

      `Der Grenzwert ist ${a}.`,
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
    sineStandard,
    cancellationLimit,
    rationalInfinity,
  ],

  hard: [
    exponentialStandard,
    rationalizationLimit,
    logarithmicStandard,
    rationalInfinity,
  ],

  expert: [
    cosineLimit,
    cubicSineLimit,
    infinityExponential,
    logarithmicStandard,
  ],
}

export function generateLimit(
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