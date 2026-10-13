import nerdamer from "nerdamer/all.min"

import type {
  LogicQuestion,
} from "./types"

type AnswerCheckResult = {
  valid: boolean
  correct: boolean
  message?: string
}

function stripAssignment(
  value: string
) {
  if (
    !value.includes("=")
  ) {
    return value
  }

  const parts =
    value.split("=")

  return (
    parts[
      parts.length - 1
    ] ?? value
  )
}

function normalizeInfinity(
  value: string
) {
  const cleaned =
    value
      .trim()
      .toLowerCase()
      .replaceAll(
        " ",
        ""
      )

  if (
    cleaned === "∞" ||
    cleaned === "+∞" ||
    cleaned === "inf" ||
    cleaned === "+inf" ||
    cleaned ===
      "infinity" ||
    cleaned ===
      "+infinity" ||
    cleaned ===
      "\\infty" ||
    cleaned ===
      "+\\infty"
  ) {
    return "Infinity"
  }

  if (
    cleaned === "-∞" ||
    cleaned ===
      "-inf" ||
    cleaned ===
      "-infinity" ||
    cleaned ===
      "-\\infty"
  ) {
    return "-Infinity"
  }

  return null
}

function looksLikeLatex(
  value: string
) {
  return (
    value.includes(
      "\\"
    ) ||
    value.includes(
      "{"
    ) ||
    value.includes(
      "}"
    )
  )
}

function normalizeExpression(
  value: string
) {
  let result =
    stripAssignment(
      value.trim()
    )
      .trim()
      .replaceAll(
        "×",
        "*"
      )
      .replaceAll(
        "·",
        "*"
      )
      .replaceAll(
        "÷",
        "/"
      )
      .replaceAll(
        "−",
        "-"
      )
      .replaceAll(
        "π",
        "pi"
      )

  if (
    !result
  ) {
    return ""
  }

  if (
    looksLikeLatex(
      result
    )
  ) {
    try {
      result =
        nerdamer
          .convertFromLaTeX(
            result
          )
          .toString()
    } catch {
      return ""
    }
  }

  return result.replace(
    /\bln\s*\(/gi,
    "log("
  )
}

function expressionForLatex(
  expression: string
) {
  return expression
    .replaceAll(
      "×",
      "*"
    )
    .replaceAll(
      "·",
      "*"
    )
    .replaceAll(
      "÷",
      "/"
    )
    .replaceAll(
      "−",
      "-"
    )
    .replace(
      /\bln\s*\(/gi,
      "log("
    )
}

function evaluateNumber(
  expression: string,
  variable: string,
  value: number
) {
  try {
    const result =
      nerdamer(
        expression
      )
        .evaluate({
          [variable]:
            value,
        })
        .text(
          "decimals"
        )

    const numeric =
      Number(result)

    if (
      !Number.isFinite(
        numeric
      )
    ) {
      return null
    }

    return numeric
  } catch {
    return null
  }
}

export function expressionToLatex(
  expression: string
) {
  const infinity =
    normalizeInfinity(
      expression
    )

  if (
    infinity ===
    "Infinity"
  ) {
    return "\\infty"
  }

  if (
    infinity ===
    "-Infinity"
  ) {
    return "-\\infty"
  }

  try {
    return nerdamer
      .convertToLaTeX(
        expressionForLatex(
          expression
        )
      )
      .toString()
  } catch {
    return expression
  }
}

export function equationToLatex(
  equation: string
) {
  const parts =
    equation.split("=")

  if (
    parts.length !==
    2
  ) {
    return expressionToLatex(
      equation
    )
  }

  return `${expressionToLatex(
    parts[0].trim()
  )} = ${expressionToLatex(
    parts[1].trim()
  )}`
}

export function mathLineToLatex(
  line: string
) {
  if (
    line.includes("?")
  ) {
    return line
      .replaceAll(
        "·",
        "\\cdot "
      )
      .replaceAll(
        "×",
        "\\times "
      )
      .replaceAll(
        "÷",
        "\\div "
      )
      .replaceAll(
        "?",
        "\\boxed{?}"
      )
  }

  return equationToLatex(
    line
  )
}

export function limitTargetToLatex(
  target: string
) {
  if (
    target ===
    "Infinity"
  ) {
    return "\\infty"
  }

  if (
    target ===
    "-Infinity"
  ) {
    return "-\\infty"
  }

  return expressionToLatex(
    target
  )
}

export function simplifyExpression(
  expression: string
) {
  try {
    return nerdamer(
      `simplify(${expression})`
    ).toString()
  } catch {
    return expression
  }
}

export function differentiateExpression(
  expression: string,
  variable = "x"
) {
  return nerdamer(
    `diff(${expression},${variable})`
  ).toString()
}

export function integrateExpression(
  expression: string,
  variable = "x"
) {
  return nerdamer(
    `integrate(${expression},${variable})`
  ).toString()
}

export function definiteIntegralExpression(
  expression: string,
  from: string,
  to: string,
  variable = "x"
) {
  return nerdamer(
    `defint(${expression},${from},${to},${variable})`
  ).toString()
}

export function limitExpression(
  expression: string,
  target: string,
  variable = "x"
) {
  return nerdamer(
    `limit(${expression},${variable},${target})`
  ).toString()
}

export function humanizeExpression(
  expression: string
) {
  return expression
}

export function expressionsEquivalent(
  userInput: string,
  expectedInput: string,
  variable = "x"
) {
  const userInfinity =
    normalizeInfinity(
      userInput
    )

  const expectedInfinity =
    normalizeInfinity(
      expectedInput
    )

  if (
    userInfinity ||
    expectedInfinity
  ) {
    return (
      userInfinity !==
        null &&
      userInfinity ===
        expectedInfinity
    )
  }

  const user =
    normalizeExpression(
      userInput
    )

  const expected =
    normalizeExpression(
      expectedInput
    )

  if (
    !user ||
    !expected
  ) {
    return false
  }

  try {
    const difference =
      nerdamer(
        `simplify((${user})-(${expected}))`
      ).toString()

    if (
      difference ===
      "0"
    ) {
      return true
    }
  } catch {
    return false
  }

  const samples = [
    -2.3,
    -1.1,
    -0.4,
    0.6,
    1.25,
    2.4,
    3.7,
  ]

  let validSamples =
    0

  for (
    const sample of
    samples
  ) {
    const left =
      evaluateNumber(
        user,
        variable,
        sample
      )

    const right =
      evaluateNumber(
        expected,
        variable,
        sample
      )

    if (
      left === null ||
      right === null
    ) {
      continue
    }

    validSamples++

    const scale =
      Math.max(
        1,
        Math.abs(
          left
        ),
        Math.abs(
          right
        )
      )

    if (
      Math.abs(
        left -
          right
      ) >
      1e-7 *
        scale
    ) {
      return false
    }
  }

  return (
    validSamples >=
    2
  )
}

export function antiderivativesEquivalent(
  userInput: string,
  integrand: string,
  variable = "x"
) {
  const user =
    normalizeExpression(
      userInput
    )

  if (
    !user
  ) {
    return false
  }

  try {
    const derivative =
      differentiateExpression(
        user,
        variable
      )

    return expressionsEquivalent(
      derivative,
      integrand,
      variable
    )
  } catch {
    return false
  }
}

function normalizeOperator(
  operator: string
) {
  if (
    operator === "×"
  ) {
    return "*"
  }

  if (
    operator === "÷"
  ) {
    return "/"
  }

  return operator
}

function checkOperators(
  input: string,
  acceptedAnswers:
    string[]
) {
  const normalizedInput =
    input
      .split("|")
      .map(
        normalizeOperator
      )
      .join("|")

  return acceptedAnswers.some(
    (accepted) =>
      accepted
        .split("|")
        .map(
          normalizeOperator
        )
        .join("|") ===
      normalizedInput
  )
}

export function checkLogicAnswer(
  question:
    LogicQuestion,
  input: string
): AnswerCheckResult {
  if (
    question.answerType ===
    "operators"
  ) {
    const expected =
      question.acceptedAnswers ??
      [
        String(
          question.answer
        ),
      ]

    const slots =
      question.category ===
        "math-logic"
        ? question
            .operatorPuzzle
            ?.slots ?? 0
        : 0

    const entered =
      input
        .split("|")
        .filter(
          Boolean
        )

    if (
      entered.length !==
      slots
    ) {
      return {
        valid: false,
        correct: false,
        message:
          "Wähle zuerst alle fehlenden Operatoren aus.",
      }
    }

    return {
      valid: true,
      correct:
        checkOperators(
          input,
          expected
        ),
    }
  }

  if (
    input.trim() ===
    ""
  ) {
    return {
      valid: false,
      correct: false,
      message:
        "Gib zuerst eine Antwort ein.",
    }
  }

  if (
    question.answerType ===
    "antiderivative"
  ) {
    if (
      question.category !==
        "integrals" ||
      !question.integrand
    ) {
      return {
        valid: false,
        correct: false,
        message:
          "Diese Aufgabe konnte intern nicht geprüft werden.",
      }
    }

    try {
      return {
        valid: true,
        correct:
          antiderivativesEquivalent(
            input,
            question.integrand,
            question.variable
          ),
      }
    } catch {
      return {
        valid: false,
        correct: false,
        message:
          "Ich konnte den mathematischen Ausdruck nicht lesen.",
      }
    }
  }

  try {
    const correct =
      expressionsEquivalent(
        input,
        String(
          question.answer
        ),
        question.answerVariable ??
          (
            question.category ===
                "derivatives" ||
            question.category ===
                "integrals" ||
            question.category ===
                "limits"
              ? question.variable
              : "x"
          )
      )

    return {
      valid: true,
      correct,
    }
  } catch {
    return {
      valid: false,
      correct: false,
      message:
        "Ich konnte den mathematischen Ausdruck nicht lesen.",
    }
  }
}