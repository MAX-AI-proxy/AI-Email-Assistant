"use client"

import { useEffect } from "react"

import {
  TriangleAlert,
  X,
} from "lucide-react"

type ConfirmDialogProps = {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Abbrechen",
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) {
      return
    }

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        onCancel()
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
  }, [open, onCancel])

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-5">
      {/* Hintergrund */}
      <button
        type="button"
        aria-label="Dialog schließen"
        onClick={onCancel}
        className="absolute inset-0 cursor-default bg-black/65 backdrop-blur-[6px]"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="relative w-full max-w-[420px] overflow-hidden rounded-[22px] border border-white/[0.09] bg-[#1b1d22]/95 shadow-[0_30px_100px_rgba(0,0,0,0.65)] backdrop-blur-2xl"
      >
        <button
          type="button"
          onClick={onCancel}
          aria-label="Schließen"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.055] text-[#77787e] transition hover:bg-white/[0.09] hover:text-white"
        >
          <X
            size={16}
            strokeWidth={1.8}
          />
        </button>

        <div className="px-6 pb-6 pt-7 sm:px-7 sm:pb-7">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-[13px] bg-[#ff453a]/10 text-[#ff6961]">
            <TriangleAlert
              size={21}
              strokeWidth={1.7}
            />
          </div>

          <h2
            id="confirm-dialog-title"
            className="pr-8 text-[20px] font-semibold tracking-[-0.025em] text-[#f5f5f7]"
          >
            {title}
          </h2>

          <p className="mt-2.5 text-[14px] leading-6 text-[#929298]">
            {description}
          </p>

          <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="h-10 rounded-[10px] bg-white/[0.055] px-4 text-[13px] font-medium text-[#c1c1c5] transition hover:bg-white/[0.09] hover:text-white"
            >
              {cancelLabel}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className={`h-10 rounded-[10px] px-4 text-[13px] font-semibold transition ${
                destructive
                  ? "bg-[#ff453a] text-white hover:bg-[#ff5b52]"
                  : "bg-[#0a84ff] text-white hover:bg-[#2997ff]"
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}