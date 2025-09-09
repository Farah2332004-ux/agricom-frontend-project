"use client"

import * as React from "react"
import {
  GAP, GRID_CELL_SHELL, TOTAL_CHIP,
} from "./scheduleTokens"

export type GridRow = {
  key: string
  label: React.ReactNode
  renderCell: (week: number) => React.ReactNode     // you render only the *content*
  renderTotal?: (weeks: number[]) => React.ReactNode | number
}

type Props = {
  weeks: number[]
  rows: GridRow[]
  labelColPx: number
  totalColPx: number
  cellMinPx: number
}

export default function ScheduleGrid({
  weeks,
  rows,
  labelColPx,
  totalColPx,
  cellMinPx,
}: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      {rows.map((row) => (
        <div
          key={row.key}
          className="grid grid-cols-[var(--label)_minmax(0,1fr)_var(--total)] items-center border-b p-2"
          style={
            {
              // px values from caller
              // @ts-ignore CSS custom props
              "--label": `${labelColPx}px`,
              "--total": `${totalColPx}px`,
            } as React.CSSProperties
          }
        >
          {/* left label */}
          <div className="px-2 text-[15px]">{row.label}</div>

          {/* week cells — same gap and pill shell as week scroller */}
          <div
            className={`grid min-w-0 ${GAP}`}
            style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(${cellMinPx}px, 1fr))` }}
          >
            {weeks.map((w) => (
              <div key={w} className={GRID_CELL_SHELL}>
                {/* your cell content (can color itself, e.g., production stage) */}
                {row.renderCell(w)}
              </div>
            ))}
          </div>

          {/* total chip */}
          <div className="flex items-center justify-end">
            {row.renderTotal ? (
              <div className={TOTAL_CHIP}>{row.renderTotal(weeks)}</div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}
