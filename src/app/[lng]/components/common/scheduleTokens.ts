// src/app/[lng]/components/common/scheduleTokens.ts
export const LABEL_COL = 180        // left label column width (px)
export const TOTAL_COL = 84         // right total column width (px)
export const CELL_MIN  = 42         // min pill width (px) — matches WeekScroller
export const ROW_H     = "h-8"      // pill height
export const RADIUS    = "rounded-[6px]"
export const GAP       = "gap-1.5"  // 6px between pills

// neutral pill (numbers, demand/loss)
export const GRID_CELL_PILL = "border bg-white text-[12px]"

// right-hand total chip, same radius as pills
export const TOTAL_CHIP =
  "inline-flex h-8 min-w-[80px] items-center justify-center rounded-[6px] " +
  "border border-[#02A78B] bg-white px-3 text-sm font-semibold text-[#02A78B]"
