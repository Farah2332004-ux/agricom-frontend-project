// src/app/[lng]/components/organisms/ShortTermWeatherPanel.tsx
"use client"

import * as React from "react"
import {
  X,
  ThermometerSun,
  Droplets,
  CloudRain,
  CloudDrizzle,
  Cloud,
  Sun,
  Wind,
  Plus,
  Minus,
  CloudSun,
} from "lucide-react"

type Props = {
  week: number
  locationLabel: string
  onClose: () => void
  tempC: number
  rainMm: number
  humidity: number
  windKmh: number
}

const BORDER = "#E0F0ED"
const BRAND = "#02A78B"
const GRID_COLS = "repeat(5, minmax(0,1fr))" // 5 equal columns

const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n))

/** Slim temp band (orange→red) */
function TempBand({ min, max }: { min: number; max: number }) {
  const total = 40 // 0..40 °C domain
  const start = clamp(min, 0, total)
  const end = clamp(max, 0, total)
  const leftPct = (start / total) * 100
  const widthPct = Math.max(6, ((end - start) / total) * 100)
  return (
    <div className="mt-1 h-1.5 w-full rounded-full bg-[#F1F5F4]">
      <div
        className="h-1.5 rounded-full"
        style={{
          marginLeft: `${leftPct}%`,
          width: `${widthPct}%`,
          background: "linear-gradient(90deg, #FFA135 0%, #FF6B4A 100%)",
        }}
      />
    </div>
  )
}

/** Different icon per day; compact and consistent */
function DayIcon({ idx }: { idx: number }) {
  const i = idx % 7
  const common = "h-5 w-5"
  switch (i) {
    case 0: // Mon
      return <CloudSun className={`${common} text-[#7AC4B2]`} />
    case 1: // Tue
      return <CloudDrizzle className={`${common} text-[#2E90FA]`} />
    case 2: // Wed
      return <CloudRain className={`${common} text-[#2E90FA]`} />
    case 3: // Thu
      return <Sun className={`${common} text-amber-400`} />
    case 4: // Fri
      return <Cloud className={`${common} text-[#7AC4B2]`} />
    case 5: // Sat
      return <CloudSun className={`${common} text-[#7AC4B2]`} />
    case 6: // Sun
    default:
      return <Sun className={`${common} text-amber-400`} />
  }
}

export default function ShortTermWeatherPanel({
  week,
  locationLabel,
  onClose,
  tempC,
  rainMm,
  humidity,
  windKmh,
}: Props) {
  const [expanded, setExpanded] = React.useState(false)

  // ⏰ Use Berlin, Germany time
  const nowStr = new Date().toLocaleString(undefined, {
    timeZone: "Europe/Berlin",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  })

  const humTag = humidity >= 70 ? "High" : humidity >= 50 ? "Normal" : "Low"
  const rainTag = rainMm >= 20 ? "Heavy" : rainMm >= 8 ? "Normal" : "Low"
  const windTag = windKmh <= 8 ? "Calm" : windKmh <= 16 ? "Moderate" : "Windy"

  const minBand = Math.round(tempC - 1)
  const maxBand = Math.round(tempC + 1)

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const rows = days.map((d) => ({
    day: d,
    minC: minBand,
    maxC: maxBand,
    humidity,
    rain: rainMm,
    wind: windKmh,
  }))

  const StripDivider = () => <div className="h-6 w-px" style={{ backgroundColor: BORDER }} />

  const Tile: React.FC<{
    icon: React.ReactNode
    title: string
    primary: React.ReactNode
    sub?: React.ReactNode
  }> = ({ icon, title, primary, sub }) => (
    <div className="flex flex-1 items-center gap-3 px-4">
      <div className="text-[#7AC4B2]">{icon}</div>
      <div className="text-xs">
        <div className="text-gray-500">{title}</div>
        <div className="mt-0.5 text-sm font-semibold text-gray-900">{primary}</div>
        {sub && <div className="text-[11px]">{sub}</div>}
      </div>
    </div>
  )

  return (
    <section className="mb-3 rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: BORDER }}>
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="text-[15px] font-semibold" style={{ color: BRAND }}>
            Week {week} Weather Forecast <span className="font-normal text-black">– {locationLabel}</span>
          </div>
          <div className="mt-1 text-xs text-gray-500">As of {nowStr}</div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-gray-100"
        >
          <X className="size-4 text-gray-500" />
        </button>
      </div>

      {/* Top strip */}
      <div className="flex items-center justify-between rounded-xl border bg-white py-2" style={{ borderColor: BORDER }}>
        <div className="flex flex-1 items-center">
          <Tile
            icon={<ThermometerSun className="size-4" />}
            title="Avg Temperature"
            primary={
              <div className="flex items-center gap-2">
                <span className="text-gray-900">{minBand}°</span>
                <div className="w-[88px]">
                  <TempBand min={minBand} max={maxBand} />
                </div>
                <span className="text-gray-900">{maxBand}°</span>
              </div>
            }
          />
          <StripDivider />
          <Tile
            icon={<Droplets className="size-4" />}
            title="Average Humidity"
            primary={
              <span className="text-gray-900">
                {humidity} %{" "}
                <span
                  className="ml-1 text-[11px]"
                  style={{ color: humTag === "Normal" ? BRAND : humTag === "High" ? "#EF4444" : "#F59E0B" }}
                >
                  {humTag}
                </span>
              </span>
            }
          />
          <StripDivider />
          <Tile
            icon={<CloudRain className="size-4 text-[#2E90FA]" />}
            title="Rainfall"
            primary={
              <span className="text-gray-900">
                {rainMm} mm <span className="ml-1 text-[11px] text-[#2E90FA]">{rainTag}</span>
              </span>
            }
          />
          <StripDivider />
          <Tile
            icon={<Wind className="size-4 text-gray-500" />}
            title="Wind Speed"
            primary={
              <span className="text-gray-900">
                {windKmh} km/h <span className="ml-1 text-[11px] text-gray-400">{windTag === "Calm" ? "Calm" : windTag}</span>
              </span>
            }
          />
        </div>

        <button
          className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded hover:bg-gray-100"
          aria-label={expanded ? "Collapse daily breakdown" : "Expand daily breakdown"}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? <Minus className="size-4 text-gray-600" /> : <Plus className="size-4 text-gray-600" />}
        </button>
      </div>

      {/* Daily table — equal columns + bigger gaps + more inner spacing in Temp */}
      {expanded && (
        <div className="mt-3 overflow-hidden rounded-xl border bg-white" style={{ borderColor: BORDER }}>
          {/* Header */}
          <div
            className="grid items-center px-4 py-2 text-xs font-medium text-gray-500 gap-x-12"
            style={{ gridTemplateColumns: GRID_COLS }}
          >
            <div className="px-3">Day</div>
            <div className="px-3">Temperature</div>
            <div className="px-3">Humidity</div>
            <div className="px-3">Rainfall</div>
            <div className="px-3">Wind</div>
          </div>

          {/* Rows */}
          {rows.map((row, idx) => (
            <div
              key={row.day}
              className="grid items-center px-4 py-2 text-sm gap-x-12"
              style={{
                gridTemplateColumns: GRID_COLS,
                borderTop: `1px solid ${BORDER}`,
                backgroundColor: idx % 2 ? "rgba(243, 247, 246, 0.6)" : "white",
              }}
            >
              {/* Day FIRST, then icon */}
              <div className="flex items-center gap-3 px-3 text-gray-800">
                <span>{row.day}</span>
                <DayIcon idx={idx} />
              </div>

              {/* Temperature — more inner gap so it breathes before Humidity */}
              <div className="flex min-w-0 items-center gap-5 px-3">
                <span className="whitespace-nowrap text-gray-900">{row.minC}°</span>
                <div className="flex-1 min-w-0">
                  <TempBand min={row.minC} max={row.maxC} />
                </div>
                <span className="whitespace-nowrap text-gray-900">{row.maxC}°</span>
              </div>

              {/* Humidity */}
              <div className="flex items-center gap-2 px-3 text-gray-700">
                <Droplets className="size-4" style={{ color: BRAND }} />
                <span>{row.humidity}%</span>
              </div>

              {/* Rainfall */}
              <div className="flex items-center gap-2 px-3 text-gray-700">
                <CloudRain className="size-4 text-[#2E90FA]" />
                <span>{row.rain} mm</span>
              </div>

              {/* Wind */}
              <div className="flex items-center gap-2 px-3 text-gray-700">
                <Wind className="size-4 text-gray-400" />
                <span>{row.wind} km/h</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
