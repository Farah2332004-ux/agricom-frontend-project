"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

type Props = {
  weekStart: number
  window: number
  onChange: (nextStart: number) => void
  min?: number
  max?: number
  wrap?: boolean
  className?: string
  label?: string
  totalLabel?: string
  cellMinPx?: number

  // NEW: short-term selection
  selectedWeek?: number | null
  onSelectWeek?: (week: number) => void
  selectableWeeks?: number[] // e.g., [NOW_WEEK, NEXT_WEEK]
}

export default function WeekScroller({
  weekStart,
  window,
  onChange,
  min = 1,
  max = 52,
  wrap = true,
  className = "",
  label = "Week Number",
  totalLabel = "Total",
  cellMinPx = 34,
  selectedWeek = null,
  onSelectWeek,
  selectableWeeks = [],
}: Props) {
  const span = max - min + 1

  const weeks = React.useMemo(
    () =>
      Array.from({ length: window }, (_, i) => {
        const raw = weekStart + i
        if (!wrap) return Math.max(min, Math.min(max, raw))
        return ((raw - min) % span + span) % span + min
      }),
    [weekStart, window, min, max, wrap, span]
  )

  const goLeft  = () => onChange(wrap ? (weekStart === min ? max : weekStart - 1) : Math.max(min, weekStart - 1))
  const goRight = () => onChange(wrap ? (weekStart === max ? min : weekStart + 1) : Math.min(max, weekStart + 1))

  const isSelectable = (w: number) => selectableWeeks.includes(w)

  return (
    <div className={`mb-3 grid grid-cols-[180px_minmax(0,1fr)_auto] items-center ${className}`}>
      {/* Left label */}
      <div className="text-[15px] font-medium">{label}</div>

      {/* Center: pills + arrows */}
      <div className="flex min-w-0 items-center gap-1.5 -ml-2">
        <button
          onClick={goLeft}
          aria-label="Previous weeks"
          className="inline-flex h-8 w-9 shrink-0 items-center justify-center rounded-[6px] border bg-white text-[#02A78B]"
        >
          <ChevronLeft className="size-4" />
        </button>

        <div
          className="grid min-w-0 grow gap-1.5"
          style={{ gridTemplateColumns: `repeat(${window}, minmax(${cellMinPx}px, 1fr))` }}
        >
          {weeks.map((w) => {
            const selected = selectedWeek === w
            const allowed  = isSelectable(w)
            const base = "flex h-8 items-center justify-center rounded-[6px] px-2 text-xs font-medium"
            const style = selected
              ? "bg-white border-2 border-[#02A78B] text-[#02A78B]"
              : allowed
              ? "bg-[#0AA37A] text-white hover:opacity-90 cursor-pointer"
              : "bg-[#0AA37A] text-white opacity-60 cursor-default"

            return (
              <button
                key={w}
                type="button"
                className={`${base} ${style}`}
                onClick={() => allowed && onSelectWeek?.(w)}
                aria-pressed={selected}
                aria-disabled={!allowed}
              >
                {w}
              </button>
            )
          })}
        </div>

        <button
          onClick={goRight}
          aria-label="Next weeks"
          className="inline-flex h-8 w-9 shrink-0 items-center justify-center rounded-[6px] border bg-white text-[#02A78B]"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* Right: Total chip */}
      <div className="ml-2 inline-flex h-8 min-w-[80px] items-center justify-center rounded-[6px]
                      border border-[#02A78B] bg-white px-3 text-sm font-semibold text-[#02A78B]">
        {totalLabel}
      </div>
    </div>
  )
}
