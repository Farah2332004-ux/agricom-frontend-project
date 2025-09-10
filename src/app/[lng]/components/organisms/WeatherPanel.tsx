"use client"

import * as React from "react"
import { AlertTriangle, X } from "lucide-react"
import { useProductionUI } from "../../production/ui"
import { visibleWeeks } from "../common/weeks"

// --- styling helpers (same tone as app) ---
const CARD = "rounded-xl border bg-white shadow-sm"
const ROW  = "flex items-center gap-4"
const LABEL = "w-[160px] shrink-0 text-[15px] font-medium text-[#02A78B]"
const BAR_WRAP = "relative h-4 w-full rounded-full overflow-hidden"
const TICKS = "absolute inset-0 pointer-events-none"
const NOTE = "text-xs text-muted-foreground"

// --- trivial PRNG for deterministic demo values (by location + week) ---
function rng(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
  return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507)), (h >>> 0) / 2 ** 32)
}

// derive a (city, country) from first selected plot; fallback
function deriveLocation(selectedPlots: string[]) {
  // You can expand this map to your real plot metadata
  const map: Record<string, { city: string; country: string }> = {
    "P1.1": { city: "Rome", country: "Italy" },
    "P1.2": { city: "Rome", country: "Italy" },
    "P2.1": { city: "Milan", country: "Italy" },
    "P3.1": { city: "Seville", country: "Spain" },
    "P3.2": { city: "Seville", country: "Spain" },
  }
  const first = selectedPlots[0]
  if (first && map[first]) return map[first]
  return { city: "Berlin", country: "Germany" } // fallback demo location
}

// make a nice temp gradient (blue→green→yellow→orange→red)
function tempGradientCss() {
  return {
    background:
      "linear-gradient(90deg, #1f9ae0 0%, #37a16b 35%, #f6cf3c 60%, #ffa146 80%, #ef4444 100%)",
  } as React.CSSProperties
}

// make a precip gradient (blue→green→yellow→orange)
function rainGradientCss() {
  return {
    background:
      "linear-gradient(90deg, #1f9ae0 0%, #37a16b 60%, #f6cf3c 82%, #ef4444 100%)",
  } as React.CSSProperties
}

// draw week separators over bars
function WeekTicks({ count }: { count: number }) {
  return (
    <div className={TICKS}>
      {Array.from({ length: count - 1 }).map((_, i) => (
        <div
          key={i}
          className="absolute top-0 h-full w-px bg-white/50"
          style={{ left: `${((i + 1) / count) * 100}%` }}
        />
      ))}
    </div>
  )
}

// little square bracket to indicate a “watch range”
function Bracket({ startPct, endPct }: { startPct: number; endPct: number }) {
  const left = Math.min(startPct, endPct)
  const right = Math.max(startPct, endPct)
  return (
    <>
      <div
        className="absolute -top-[6px] h-[8px] w-[2px] rounded bg-black/70"
        style={{ left: `calc(${left}% - 1px)` }}
      />
      <div
        className="absolute -top-[6px] h-[8px] w-[2px] rounded bg-black/70"
        style={{ left: `calc(${right}% - 1px)` }}
      />
      <div
        className="absolute -top-[2px] h-[2px] rounded bg-black/70"
        style={{ left: `${left}%`, width: `calc(${right - left}%)` }}
      />
    </>
  )
}

export default function WeatherPanel() {
  const ui = useProductionUI()
  const weeks = visibleWeeks(ui.weekStart, ui.window, 1, 52, true)
  const { city, country } = deriveLocation(ui.selectedPlots)

  // generate demo weekly temp/precip values deterministically per location
  const seed = `${city}-${country}-${weeks[0]}-${weeks[weeks.length - 1]}`
  const r = React.useMemo(() => rng(seed), [seed])

  // Temperature (°C) and Precipitation (mm) arrays for visible weeks
  const temps = weeks.map(() => Math.round(14 + r() * 22))   // 14..36 °C
  const rains = weeks.map(() => Math.round(r() * 35))        // 0..35 mm

  // simple risk logic
  const heatRisk = temps.some((t) => t >= 34)
  const droughtRisk = average(rains) < 8 || rains.slice(-3).every((mm) => mm < 4)

  // markers/brackets
  const maxTemp = 40
  const tempBracket = {
    startPct: (Math.max(...temps) / maxTemp) * 100,
    endPct: (Math.min(...temps) / maxTemp) * 100,
  }

  const maxRain = 40
  const rainBracket = {
    startPct: (Math.max(...rains) / maxRain) * 100,
    endPct: (Math.min(...rains) / maxRain) * 100,
  }

  const now = new Date()
  const asOf = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })

  return (
    <section className={`${CARD} mb-4 p-4`}>
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="text-[15px] font-semibold text-[#02A78B]">
            Weekly Weather Forecast <span className="text-black">— {city}, {country}</span>
          </div>
          <div className={NOTE}>As of {asOf}</div>
        </div>

        <button
          className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-[#E0F0ED]/70"
          onClick={() => ui.toggleIndicator("weather", false)}
          aria-label="Close weather"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Temperature */}
      <div className={`${ROW} mb-4`}>
        <div className={LABEL}>Temperature</div>
        <div className={BAR_WRAP} style={tempGradientCss()}>
          <WeekTicks count={weeks.length} />
          <Bracket {...tempBracket} />
        </div>
        {heatRisk && (
          <div className="ml-3 flex items-center gap-2 text-xs text-[#b42318]">
            <AlertTriangle className="size-4" />
            <span>High Temp Risk – may affect crop flowering</span>
          </div>
        )}
      </div>

      {/* Precipitation */}
      <div className={`${ROW}`}>
        <div className={LABEL}>Water Precipitation</div>
        <div className={BAR_WRAP} style={rainGradientCss()}>
          <WeekTicks count={weeks.length} />
          <Bracket {...rainBracket} />
        </div>
        {droughtRisk && (
          <div className="ml-3 flex items-center gap-2 text-xs text-[#b42318]">
            <AlertTriangle className="size-4" />
            <span>Insufficient – may cause crop stress</span>
          </div>
        )}
      </div>
    </section>
  )
}

function average(arr: number[]) {
  return arr.reduce((a, b) => a + b, 0) / (arr.length || 1)
}
