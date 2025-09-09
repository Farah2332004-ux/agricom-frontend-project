"use client"

import * as React from "react"

export default function CropTitleRow({
  title,
  subtitle,
  weeks,
  open,
  onToggle,
  cellMinPx = 34, // must match WeekScroller
}: {
  title: string
  subtitle?: string
  weeks: number[]
  open: boolean
  onToggle: () => void
  cellMinPx?: number
}) {
  return (
    <div className="mb-2 grid grid-cols-[180px_minmax(0,1fr)_auto] items-center">
      {/* Left: crop label + chevron toggle */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex items-center gap-2 px-1 text-left"
        title={open ? "Collapse" : "Expand"}
      >
        <span className="inline-block h-3 w-3 rounded-[2px] bg-[#02A78B]" />
        <div className="leading-tight">
          <div className="text-[16px] font-semibold">{title}</div>
          {subtitle ? <div className="text-[11px] text-muted-foreground">{subtitle}</div> : null}
        </div>
        <svg
          className={`ml-1 size-4 text-[#02A78B] transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Middle: EMPTY cells aligned to the week grid */}
      <div className="flex min-w-0 items-center gap-1.5 -ml-2">
        <div className="h-8 w-9 shrink-0" /> {/* matches scroller's left arrow width */}
        <div
          className="grid min-w-0 grow gap-1.5"
          style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(${cellMinPx}px, 1fr))` }}
        >
          {weeks.map((w) => (
            <div key={w} className="h-8 w-full rounded-[6px] border bg-white" />
          ))}
        </div>
        <div className="h-8 w-9 shrink-0" /> {/* matches scroller's right arrow width */}
      </div>

      {/* Right: EMPTY pill (aligned with totals column) */}
      <div
        className="ml-2 inline-flex h-8 min-w-[80px] items-center justify-center rounded-[6px]
                   border border-[#02A78B] bg-white px-3 text-sm font-semibold text-[#02A78B]"
      />
    </div>
  )
}
