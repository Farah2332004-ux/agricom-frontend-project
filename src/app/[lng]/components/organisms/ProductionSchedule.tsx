"use client"

import * as React from "react"
import {
  Scissors, Hammer, Droplets, Sprout, Wheat, Shovel, FlaskConical, Shield,
  ChevronDown
} from "lucide-react"

import WeekScroller from "../common/WeekScroller"
import { visibleWeeks } from "../common/weeks"
import { useProductionUI } from "../../production/ui"

// ---------------- Column system (match WeekScroller) ----------------
const LABEL_PX = 180        // left label column width (same as scroller)
const TOTAL_PX = 80         // right total chip width  (same as scroller)
const CELL_MIN_PX = 34      // min width for each week cell
const GAP_REM = 0.375       // grid gap used in scroller (gap-1.5)

// WeekScroller center strip: [ <left-arrow 2.25rem> gap 0.375rem | week grid | gap 0.375rem <right-arrow 2.25rem> ]
// plus scroller wrapper has "-ml-2" (−0.5rem), so we replicate that *net* on schedule rows:
const LEFT_OFFSET = "calc(2.25rem + 0.375rem - 0.5rem)"   // arrow + gap - (-ml-2)
const RIGHT_OFFSET = "calc(2.25rem + 0.375rem)"           // gap + right arrow

// ---------------- Demo data / helpers ----------------
type Stage = "seedling" | "growing" | "ripening" | "harvest"
type TaskKey =
  | "pruning" | "staking" | "irrigation" | "weeding"
  | "harvest" | "soil-prep" | "fertilization" | "protection"

const groups = [
  { id: "p1-1-broc-01", label: "P1.1-broc-01" },
  { id: "p1-1-broc-02", label: "P1.1-broc-02" },
  { id: "p1-1-broc-03", label: "P1.1-broc-03" },
] as const

const taskIcon: Record<TaskKey, React.ComponentType<{ className?: string }>> = {
  pruning: Scissors, staking: Hammer, irrigation: Droplets, weeding: Sprout,
  harvest: Wheat, "soil-prep": Shovel, fertilization: FlaskConical, protection: Shield,
}

function stageColor(s: Stage) {
  return s === "seedling" ? "#bfe9cf" : s === "growing" ? "#37a16b" : s === "ripening" ? "#f6cf3c" : "#0a6a3f"
}

function rng(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
  return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507)), (h >>> 0) / 2 ** 32)
}

function cellFor(groupId: string, week: number) {
  const r = rng(`${groupId}-${week}`)
  const roll = r()
  const stage: Stage = roll < 0.25 ? "seedling" : roll < 0.55 ? "growing" : roll < 0.82 ? "ripening" : "harvest"
  const base = stage === "seedling" ? 2 : stage === "growing" ? 6 : stage === "ripening" ? 9 : 12
  const prod = Math.round(base + r() * 3)

  const tasks: TaskKey[] = []
  if (stage !== "seedling" && r() > 0.5) tasks.push("pruning")
  if (stage === "growing" && r() > 0.6) tasks.push("staking")
  if (r() > 0.7) tasks.push("irrigation")
  if (stage === "ripening" && r() > 0.6) tasks.push("fertilization")
  if (stage === "harvest" && r() > 0.5) tasks.push("harvest")
  if (r() > 0.8) tasks.push("protection")

  return { stage, prod, tasks }
}

const demandForWeek = (w: number) => 20 + ((w * 7) % 8)
const lossForWeek   = (w: number) => Math.max(0, ((w * 3) % 5) - 1)
const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0)
const showTask = (sel: string[], cell: TaskKey[]) => (sel.length === 0 ? cell.length > 0 : cell.some(t => sel.includes(t)))

// ---------------- tiny layout helpers ----------------
function rowGridStyle(): React.CSSProperties {
  return {
    display: "grid",
    gridTemplateColumns: `${LABEL_PX}px minmax(0,1fr) ${TOTAL_PX}px`,
    columnGap: `${GAP_REM}rem`,
    alignItems: "center",
  }
}
function weekColsStyle(count: number): React.CSSProperties {
  return {
    display: "grid",
    gridTemplateColumns: `repeat(${count}, minmax(${CELL_MIN_PX}px, 1fr))`,
    gap: `${GAP_REM}rem`,
    minWidth: 0,
    marginLeft: LEFT_OFFSET,   // <-- offset to align with scroller first pill
    marginRight: RIGHT_OFFSET, // <-- keep the small space before Total (same as scroller)
  }
}

// ---------------- Component ----------------
export default function ProductionSchedule() {
  const ui = useProductionUI()
  const weeks = visibleWeeks(ui.weekStart, ui.window, 1, 52, true)

  // optional: row type sorting by totals
  const totalsByType = {
    production: groups.reduce((s, g) => s + sum(weeks.map(w => cellFor(g.id, w).prod)), 0),
    demand: sum(weeks.map(demandForWeek)),
    loss: sum(weeks.map(lossForWeek)),
  }
  const typeOrder = (ui.indicators.sort
    ? (["production", "demand", "loss"] as const).sort((a, b) => totalsByType[b] - totalsByType[a])
    : (["production", "demand", "loss"] as const))

  // expand / collapse
  const [open, setOpen] = React.useState(true)

  return (
    <section className="mt-6">
      <p className="mb-3 text-[15px]">
        Showing plantation schedule and expected production for <b>{ui.crop}</b>, matched with forecasted demand
      </p>

      <WeekScroller
        weekStart={ui.weekStart}
        window={ui.window}
        onChange={ui.setWeekStart}
        min={1}
        max={52}
        wrap
      />

      {/* Crop header row (aligned shells + toggle) */}
      <div className="mb-2" style={rowGridStyle()}>
        <div className="flex h-8 items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            aria-expanded={open}
            className="inline-flex h-6 w-6 items-center justify-center rounded-[6px] border text-[#02A78B] transition-transform"
          >
            <ChevronDown className={`size-4 transition-transform ${open ? "" : "-rotate-90"}`} />
          </button>
          <div className="text-[15px] font-semibold">
            {ui.crop} <span className="ml-1 align-middle text-sm text-muted-foreground">(2100 m²)</span>
          </div>
        </div>

        <div style={weekColsStyle(weeks.length)}>
          {weeks.map((w) => (
            <div key={`hdr-${w}`} className="h-8 rounded-[6px] border bg-white" />
          ))}
        </div>

        {/* empty total box for header */}
        <div className="h-8 rounded-[6px] border bg-white" />
      </div>

      {/* Collapsible content */}
      {open && (
        <>
          {/* PRODUCTION rows */}
          {ui.indicators.production && groups.map((g) => {
            const rowTotal = sum(weeks.map(w => cellFor(g.id, w).prod))
            return (
              <div key={g.id} className="mb-2" style={rowGridStyle()}>
                <div className="px-2 text-[15px]">{g.label}</div>

                <div style={weekColsStyle(weeks.length)}>
                  {weeks.map((w) => {
                    const c = cellFor(g.id, w)
                    const onDark = c.stage === "harvest"
                    return (
                      <div
                        key={`${g.id}-${w}`}
                        className="flex h-8 items-center justify-center rounded-[6px] border"
                        style={{ background: stageColor(c.stage), color: onDark ? "white" : "inherit" }}
                      >
                        {showTask(ui.selectedTasks, c.tasks) &&
                          c.tasks.slice(0, 2).map((tk, i) => {
                            const Icon = taskIcon[tk]
                            return <Icon key={`${tk}-${i}`} className="mx-0.5 size-4 opacity-90" />
                          })}
                      </div>
                    )
                  })}
                </div>

                <div className="flex h-8 items-center justify-center rounded-[6px] border bg-white text-sm font-semibold text-[#02A78B]">
                  {rowTotal}
                </div>
              </div>
            )
          })}

          {/* DEMAND row */}
          {ui.indicators.demand && (
            <div className="mb-2" style={rowGridStyle()}>
              <div className="px-2 text-[15px]">Demand (kg)*</div>
              <div style={weekColsStyle(weeks.length)}>
                {weeks.map((w) => (
                  <div key={`dem-${w}`} className="flex h-8 items-center justify-center rounded-[6px] border bg-white text-[12px]">
                    {demandForWeek(w)}
                  </div>
                ))}
              </div>
              <div className="flex h-8 items-center justify-center rounded-[6px] border bg-white text-sm font-semibold text-[#02A78B]">
                {sum(weeks.map(demandForWeek))}
              </div>
            </div>
          )}

          {/* LOSS row */}
          {ui.indicators.loss && (
            <div className="mb-2" style={rowGridStyle()}>
              <div className="px-2 text-[15px]">Potential Loss*</div>
              <div style={weekColsStyle(weeks.length)}>
                {weeks.map((w) => (
                  <div key={`loss-${w}`} className="flex h-8 items-center justify-center rounded-[6px] border bg-white text-[12px]">
                    {lossForWeek(w)}
                  </div>
                ))}
              </div>
              <div className="flex h-8 items-center justify-center rounded-[6px] border bg-white text-sm font-semibold text-[#02A78B]">
                {sum(weeks.map(lossForWeek))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-[12px]">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-3 w-5 rounded" style={{ background: "#bfe9cf" }} /> Seedling
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-3 w-5 rounded" style={{ background: "#37a16b" }} /> Growing
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-3 w-5 rounded" style={{ background: "#f6cf3c" }} /> Ripening
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-3 w-5 rounded" style={{ background: "#0a6a3f" }} /> Harvest
        </span>
        <span className="ml-6 opacity-70">* = estimated values based on predictive models.</span>
      </div>
    </section>
  )
}
