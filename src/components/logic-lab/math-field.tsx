"use client"

import {
  useEffect,
  useRef,
} from "react"

import type {
  MathfieldElement,
} from "mathlive"

type MathFieldProps = {
  value: string
  onChange?: (
    value: string
  ) => void
  readOnly?: boolean
  ariaLabel?: string
  variant?:
    | "display"
    | "input"
}

export default function MathField({
  value,
  onChange,
  readOnly = false,
  ariaLabel = "Mathematischer Ausdruck",
  variant = "display",
}: MathFieldProps) {
  const containerRef =
    useRef<HTMLDivElement | null>(
      null
    )

  const mathfieldRef =
    useRef<MathfieldElement | null>(
      null
    )

  const latestValueRef = useRef(value)
  useEffect(() => { latestValueRef.current = value }, [value])

  const onChangeRef =
    useRef(onChange)

  useEffect(() => {
    onChangeRef.current =
      onChange
  }, [onChange])

  useEffect(() => {
    let cancelled =
      false

    let inputHandler:
      (() => void) |
      null = null

    async function createMathfield() {
      const {
        MathfieldElement,
      } =
        await import(
          "mathlive"
        )

      if (
        cancelled ||
        !containerRef.current
      ) {
        return
      }

      const mathfield =
        new MathfieldElement()

      mathfieldRef.current =
        mathfield

      mathfield.value =
        latestValueRef.current

      mathfield.readOnly =
        readOnly

      mathfield.smartFence =
        true

      mathfield.mathVirtualKeyboardPolicy =
        "auto"

      mathfield.setAttribute(
        "aria-label",
        ariaLabel
      )

      mathfield.style.display =
        "block"

      mathfield.style.width =
        "100%"

      mathfield.style.boxSizing =
        "border-box"

      mathfield.style.color =
        "#f5f5f7"

      mathfield.style.outline =
        "none"

      if (
        variant ===
        "input"
      ) {
        mathfield.style.minHeight =
          "64px"

        mathfield.style.padding =
          "14px 16px"

        mathfield.style.border =
          "1px solid rgba(255,255,255,0.08)"

        mathfield.style.borderRadius =
          "12px"

        mathfield.style.background =
          "#0f1114"

        mathfield.style.fontSize =
          "22px"
      } else {
        mathfield.style.border =
          "none"

        mathfield.style.background =
          "transparent"

        mathfield.style.padding =
          "0"

        mathfield.style.fontSize =
          "30px"

        mathfield.style.pointerEvents =
          "none"

        mathfield.tabIndex =
          -1
      }

      inputHandler =
        () => {
          onChangeRef.current?.(
            mathfield.value
          )
        }

      mathfield.addEventListener(
        "input",
        inputHandler
      )

      containerRef.current.replaceChildren(
        mathfield
      )
    }

    void createMathfield()

    return () => {
      cancelled =
        true

      if (
        mathfieldRef.current &&
        inputHandler
      ) {
        mathfieldRef.current.removeEventListener(
          "input",
          inputHandler
        )
      }

      mathfieldRef.current =
        null
    }
  }, [ariaLabel, readOnly, variant])

  useEffect(() => {
    const mathfield =
      mathfieldRef.current

    if (
      !mathfield
    ) {
      return
    }

    if (
      mathfield.value !==
      value
    ) {
      mathfield.value =
        value
    }
  }, [value])

  useEffect(() => {
    if (
      mathfieldRef.current
    ) {
      mathfieldRef.current.readOnly =
        readOnly
    }
  }, [readOnly])

  return (
    <div
      ref={
        containerRef
      }
      className="w-full"
    />
  )
}