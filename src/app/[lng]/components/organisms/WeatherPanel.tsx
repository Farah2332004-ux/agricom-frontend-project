// src/app/[lng]/components/organisms/WeatherPanel.tsx
"use client"

import * as React from "react"
import { X, AlertTriangle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const LEFT_OFFSET = "calc(2.25rem + 0.375rem - 0.5rem)"
const RIGHT_OFFSET = "calc(2.25rem + 0.375rem)"

/* helpers */
function rng(seed: string) { let h = 2166136261; for (let i=0;i<seed.length;i++) h=Math.imul(h^seed.charCodeAt(i),16777619); return ()=>((h=Math.imul(h^(h>>>15),2246822507)),(h>>>0)/2**32) }
function series(n: number, seed: string, min = 0, max = 100) {
  const r = rng(seed); return Array.from({ length: n }, () => Math.round(min + r() * (max - min)))
}
const C_HOT = 30, C_WARM = 21, C_COOL = 10
const getColorForValue = (value: number, type: "temp" | "rain") => (type === "temp" ? (value >= C_HOT ? "#EA4A3C" : value >= C_COOL ? "#F2AE48" : "#02A78B") : (value <= 15 ? "#EA4A3C" : value <= 70 ? "#F2AE48" : "#02A78B"))

type Props = {
  weeks: number[]
  locationLabel: string
  onClose: () => void
  className?: string
  // provide exact arrays so ProductionSchedule can mirror values
  temps?: number[]
  rain?: number[]
  // click handler returns exact numbers for the clicked week
  onPickShortTermWeek?: (data: { week: number; tempC: number; rainMm: number }) => void
}

export default function WeatherPanel({ weeks, locationLabel, onClose, className = "", temps: tempsProp, rain: rainProp, onPickShortTermWeek }: Props) {
  const count = weeks?.length ?? 0
  const temps = React.useMemo(() => tempsProp ?? series(count, `wx-temps-${weeks.join(",")}`, -5, 40), [count, weeks, tempsProp])
  const rain  = React.useMemo(() => rainProp  ?? series(count, `wx-rain-${weeks.join(",")}`,   5, 95), [count, weeks, rainProp])
  if (!count) return null

  const PRECISE_WEEKS = 2
  const tempLabel = (v: number) => (v >= C_HOT ? "High heat risk" : v >= C_WARM ? "Warm" : v >= C_COOL ? "Optimal" : "Cool")
  const rainLabel = (v: number) => (v <= 15 ? "Very low precip" : v <= 30 ? "Low precip" : v <= 70 ? "Adequate precip" : "Heavy precip")
  const barOuterStyle: React.CSSProperties = { marginLeft: LEFT_OFFSET, marginRight: RIGHT_OFFSET }

  const renderBarWithWarnings = (values: number[], type: "temp" | "rain") => (
    <div className="relative" style={barOuterStyle}>
      <div className="h-4 rounded-full relative overflow-hidden">
        <div className="h-full w-full rounded-full relative" style={{ background: `linear-gradient(to right, ${values.map((v, i) => {
          const color = getColorForValue(v, type)
          const startPos = (i / values.length) * 100
          const endPos = ((i + 1) / values.length) * 100
          return `${color} ${startPos}%, ${color} ${endPos}%`
        }).join(", ")})` }}>
          {values.slice(0, -1).map((_, i) => <div key={`divider-${i}`} className="absolute top-0 bottom-0 w-px bg-white/60" style={{ left: `${((i + 1) / values.length) * 100}%` }} />)}
        </div>
      </div>

      {values.map((v, i) => {
        const position = (i / values.length) * 100
        const width = 100 / values.length
        const isPrecise = i < PRECISE_WEEKS
        const label = type === "temp" ? tempLabel(v) : rainLabel(v)
        const hasWarning = type === "temp" ? v >= C_HOT : v <= 15

        const handleClick = () => {
          if (!isPrecise || !onPickShortTermWeek) return
          const payload = type === "temp"
            ? { week: weeks[i], tempC: temps[i], rainMm: rain[i] }
            : { week: weeks[i], tempC: temps[i], rainMm: rain[i] }
          onPickShortTermWeek(payload)
        }

        return (
          <Tooltip key={`week-${type}-${i}`}>
            <TooltipTrigger asChild>
              <div
                className={`absolute top-0 h-4 ${isPrecise ? "cursor-pointer" : "cursor-default"}`}
                style={{ left: `${position}%`, width: `${width}%` }}
                onClick={handleClick}
                aria-label={`Week ${weeks[i]} ${type === "temp" ? "temperature" : "precipitation"}`}
              />
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={6}>
              <div className="max-w-[260px] text-xs">
                <div className="font-medium">Week {weeks[i]} • {isPrecise ? "Forecast" : "Outlook"}</div>
                {isPrecise ? <div className="mt-0.5 text-muted-foreground">{type === "temp" ? `${v}°C` : `${v} mm`}</div> : null}
                <div className="mt-1 flex items-start gap-2">
                  {hasWarning && <AlertTriangle className="mt-[1px] size-4 text-red-500" />}
                  <span className={hasWarning ? "text-red-600" : "text-muted-foreground"}>{label}</span>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        )
      })}

      {values.map((v, i) => {
        const show = type === "temp" ? v >= C_HOT : v <= 15
        if (!show) return null
        const position = (i / values.length) * 100 + 100 / values.length / 2
        return (
          <div key={`warning-${type}-${i}`} className="absolute top-0 -translate-x-1/2 -translate-y-1" style={{ left: `${position}%` }}>
            <AlertTriangle className="size-4 text-red-500 bg-white rounded-full p-0.5" />
          </div>
        )
      })}
    </div>
  )

  const nowStr = new Date().toLocaleString(undefined, { timeZone: "Asia/Beirut", hour: "numeric", minute: "2-digit", weekday: "short", month: "short", day: "2-digit" })

  return (
    <TooltipProvider delayDuration={120}>
      <section className={`rounded-2xl border bg-white p-4 shadow-sm ${className}`} aria-label="Weekly Weather Forecast">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="text-[15px] font-semibold text-[#02A78B]">
              Weekly Weather Forecast <span className="font-normal text-black">– {locationLabel}</span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">As of {nowStr}</div>
          </div>
          <button onClick={onClose} aria-label="Close weather panel" className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted">
            <X className="size-4" />
          </button>
        </div>

        <div className="mb-4 flex items-center gap-4">
          <div className="text-[15px] font-medium text-[#02A78B] w-32 flex-shrink-0">Temperature</div>
          <div className="flex-1">{renderBarWithWarnings(temps, "temp")}</div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-[15px] font-medium text-[#02A78B] w-32 flex-shrink-0">Water Precipitation</div>
          <div className="flex-1">{renderBarWithWarnings(rain, "rain")}</div>
        </div>
      </section>
    </TooltipProvider>
  )
}
