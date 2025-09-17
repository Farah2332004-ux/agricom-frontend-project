"use client";

import * as React from "react";
import { X, AlertTriangle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/** Keep these aligned with your grid/WeekScroller math */
const LEFT_OFFSET = "calc(2.25rem + 0.375rem - 0.5rem)";
const RIGHT_OFFSET = "calc(2.25rem + 0.375rem)";

/* ---------------- Helpers ---------------- */
function rng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507)), (h >>> 0) / 2 ** 32);
}
function series(n: number, seed: string, min = 0, max = 100) {
  const r = rng(seed);
  return Array.from({ length: n }, () => Math.round(min + r() * (max - min)));
}
const getColorForValue = (value: number, type: "temp" | "rain") => {
  if (type === "temp") return value >= 30 ? "#EA4A3C" : value >= 18 ? "#F2AE48" : "#02A78B"; // °C
  return value <= 15 ? "#EA4A3C" : value <= 70 ? "#F2AE48" : "#02A78B"; // mm (% scale proxy)
};

type Props = {
  weeks: number[];
  locationLabel: string;
  onClose: () => void;
  className?: string;
  /** Called when a precise week (current/next) is clicked */
  onPickShortTermWeek?: (week: number, payload?: { tempC: number; rainMm: number; humidity: number; windKmh: number }) => void;
};

export default function WeatherPanel({ weeks, locationLabel, onClose, className = "", onPickShortTermWeek }: Props) {
  const count = weeks?.length ?? 0;

  // Random but stable demo data
  const tempsC = React.useMemo(() => series(count, `wx-tempsC-${weeks.join(",")}`, 6, 34), [count, weeks]); // 6..34°C
  const rainMm = React.useMemo(() => series(count, `wx-rain-${weeks.join(",")}`, 5, 45), [count, weeks]);  // 5..45 mm
  const humid  = React.useMemo(() => series(count, `wx-humid-${weeks.join(",")}`, 40, 92), [count, weeks]); // 40..92%
  const wind   = React.useMemo(() => series(count, `wx-wind-${weeks.join(",")}`, 3, 22), [count, weeks]);   // 3..22 km/h

  if (!count) return null;

  const PRECISE_WEEKS = 2; // only 0 and 1 (current & next) are precise
  const tempLabel = (v: number) => (v >= 30 ? "High heat risk" : v >= 22 ? "Warm" : v >= 14 ? "Mild" : "Cool");
  const rainLabel = (v: number) => (v <= 8 ? "Very low precip" : v <= 20 ? "Low precip" : v <= 35 ? "Adequate precip" : "Heavy precip");

  const barOuterStyle: React.CSSProperties = { marginLeft: LEFT_OFFSET, marginRight: RIGHT_OFFSET };

  /** Generic segmented bar with hit-targets */
  const renderBar = (values: number[], type: "temp" | "rain") => (
    <div className="relative" style={barOuterStyle}>
      {/* gradient background with segment divisions */}
      <div className="h-4 rounded-full relative overflow-hidden">
        <div
          className="h-full w-full rounded-full relative"
          style={{
            background: `linear-gradient(to right, ${values
              .map((v, i) => {
                const color = getColorForValue(v, type);
                const startPos = (i / values.length) * 100;
                const endPos = ((i + 1) / values.length) * 100;
                return `${color} ${startPos}%, ${color} ${endPos}%`;
              })
              .join(", ")})`,
          }}
        >
          {values.slice(0, -1).map((_, i) => (
            <div
              key={`divider-${i}`}
              className="absolute top-0 bottom-0 w-px bg-white/60"
              style={{ left: `${((i + 1) / values.length) * 100}%` }}
            />
          ))}
        </div>
      </div>

      {/* hit targets + tooltips */}
      {values.map((v, i) => {
        const position = (i / values.length) * 100;
        const width = 100 / values.length;
        const isPrecise = i < PRECISE_WEEKS;
        const label = type === "temp" ? tempLabel(v) : rainLabel(v);
        const hasWarning = type === "temp" ? v >= 32 : v <= 8; // example thresholds

        const handleClick = () => {
          if (!isPrecise) return;
          onPickShortTermWeek?.(weeks[i], {
            tempC: tempsC[i],
            rainMm: rainMm[i],
            humidity: humid[i],
            windKmh: wind[i],
          });
        };

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
                {isPrecise ? (
                  <div className="mt-0.5 text-muted-foreground">
                    {type === "temp" ? `${v}°C` : `${v} mm`}
                  </div>
                ) : null}
                <div className="mt-1 flex items-start gap-2">
                  {hasWarning && <AlertTriangle className="mt-[1px] size-4 text-red-500" />}
                  <span className={hasWarning ? "text-red-600" : "text-muted-foreground"}>{label}</span>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );

  const nowStr = new Date().toLocaleString(undefined, {
    timeZone: "Europe/Berlin",
    hour: "numeric",
    minute: "2-digit",
    weekday: "short",
    month: "short",
    day: "2-digit",
  });

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
          <div className="flex-1">{renderBar(tempsC, "temp")}</div>
        </div>

        {/* Water Precipitation */}
        <div className="flex items-center gap-4">
          <div className="text-[15px] font-medium text-[#02A78B] w-32 flex-shrink-0">Water Precipitation</div>
          <div className="flex-1">{renderBar(rainMm, "rain")}</div>
        </div>
      </section>
    </TooltipProvider>
  );
}
