"use client"

import * as React from "react"
import { X, AlertTriangle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

/** Keep these aligned with your grid/WeekScroller math */
const LEFT_OFFSET = "calc(2.25rem + 0.375rem - 0.5rem)"
const RIGHT_OFFSET = "calc(2.25rem + 0.375rem)"

/* ---------------- Helpers ---------------- */
function rng(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
  return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507)), (h >>> 0) / 2 ** 32)
}
function series(n: number, seed: string, min = 0, max = 100) {
  const r = rng(seed)
  return Array.from({ length: n }, () => Math.round(min + r() * (max - min)))
}

/** Smooth multi-stop color scale */
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}
function hexToRgb(hex: string) {
  const h = hex.replace("#", "")
  return [Number.parseInt(h.slice(0, 2), 16), Number.parseInt(h.slice(2, 4), 16), Number.parseInt(h.slice(4, 6), 16)]
}
function rgbToHex([r, g, b]: number[]) {
  const h = (n: number) => n.toString(16).padStart(2, "0")
  return `#${h(Math.round(r))}${h(Math.round(g))}${h(Math.round(b))}`
}
function makeScale(stops: string[]) {
  const rgb = stops.map(hexToRgb)
  return (t: number) => {
    const clamped = Math.max(0, Math.min(0.9999, t))
    const seg = Math.floor(clamped * (stops.length - 1))
    const localT = clamped * (stops.length - 1) - seg
    const [r1, g1, b1] = rgb[seg],
      [r2, g2, b2] = rgb[seg + 1] ?? rgb[seg]
    return rgbToHex([lerp(r1, r2, localT), lerp(g1, g2, localT), lerp(b1, b2, localT)])
  }
}

/** Palettes (more steps for a smoother gradient look) */
const tempScale = makeScale([
  "#2EA6D7",
  "#3CB4C8",
  "#49C1B9",
  "#60C98D",
  "#7BC16C",
  "#A8C653",
  "#D9C94A",
  "#F2AE48",
  "#F28A47",
  "#EA4A3C",
])

const rainScale = makeScale([
  "#2EA6D7",
  "#36B0CC",
  "#3CB98D",
  "#67BF7A",
  "#8DC568",
  "#B9C857",
  "#E0B94F",
  "#F2AE48",
  "#EA6E40",
])

type Props = {
  weeks: number[]
  locationLabel: string
  onClose: () => void
  className?: string
}

export default function WeatherPanel({ weeks, locationLabel, onClose, className = "" }: Props) {
  const count = weeks?.length ?? 0
  const temps = React.useMemo(() => series(count, "wx-temps", 10, 95), [count])
  const rain = React.useMemo(() => series(count, "wx-rain", 10, 95), [count])

  if (!count) return null

  const tempMsg = (v: number) =>
    v >= 85
      ? "High Temp Risk – May affect crop flowering"
      : v >= 70
        ? "Warm – monitor irrigation and heat stress"
        : v >= 50
          ? "Optimal range"
          : "Cool – growth may slow"

  const rainMsg = (v: number) =>
    v <= 15
      ? "Insufficient – May cause crop stress"
      : v <= 30
        ? "Low precipitation – watch soil moisture"
        : v <= 70
          ? "Adequate precipitation"
          : "Heavy precipitation – watch disease risk"

  const barOuterStyle: React.CSSProperties = {
    marginLeft: LEFT_OFFSET,
    marginRight: RIGHT_OFFSET,
  }

  const renderBarWithWarnings = (values: number[], scale: (t: number) => string, type: "temp" | "rain") => {
    return (
      <div className="relative" style={barOuterStyle}>
        {/* Background gradient bar */}
        <div className="h-4 rounded-full relative overflow-hidden">
          <div
            className="h-full w-full rounded-full"
            style={{
              background: `linear-gradient(to right, ${values
                .map((v, i) => {
                  const t = v / 100
                  const position = (i / (values.length - 1)) * 100
                  return `${scale(t)} ${position}%`
                })
                .join(", ")})`,
            }}
          />
        </div>

        {/* Warning indicators */}
        {values.map((v, i) => {
          const shouldShowWarning = type === "temp" ? v >= 85 : v <= 15
          if (!shouldShowWarning) return null

          const position = (i / (values.length - 1)) * 100
          const message = type === "temp" ? tempMsg(v) : rainMsg(v)

          return (
            <Tooltip key={`warning-${type}-${i}`}>
              <TooltipTrigger asChild>
                <div
                  className="absolute top-0 transform -translate-x-1/2 -translate-y-1"
                  style={{ left: `${position}%` }}
                >
                  <AlertTriangle className="size-4 text-red-500 bg-white rounded-full p-0.5" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={6}>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 size-4 text-red-500" />
                  <div className="max-w-[240px] text-xs">
                    <div className="font-medium">Week {weeks[i]}</div>
                    <div>{message}</div>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    )
  }

  const nowStr = "3:43 PM CEST"

  return (
    <TooltipProvider delayDuration={120}>
      <section
        className={`rounded-2xl border bg-white p-4 shadow-sm ${className}`}
        aria-label="Weekly Weather Forecast"
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="text-[15px] font-semibold text-[#02A78B]">
              Weekly Weather Forecast <span className="font-normal text-black">– {locationLabel}</span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">As of {nowStr}</div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close weather panel"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Temperature */}
        <div className="mb-4 flex items-center gap-4">
          <div className="text-[15px] font-medium text-[#02A78B] w-32 flex-shrink-0">Temperature</div>
          <div className="flex-1">{renderBarWithWarnings(temps, tempScale, "temp")}</div>
        </div>

        {/* Water Precipitation */}
        <div className="flex items-center gap-4">
          <div className="text-[15px] font-medium text-[#02A78B] w-32 flex-shrink-0">Water Precipitation</div>
          <div className="flex-1">{renderBarWithWarnings(rain, rainScale, "rain")}</div>
        </div>
      </section>
    </TooltipProvider>
  )
}
