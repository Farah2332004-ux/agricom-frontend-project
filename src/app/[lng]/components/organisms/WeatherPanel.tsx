// src/app/[lng]/components/organisms/WeatherPanel.tsx
"use client";

import * as React from "react";
import { X, AlertTriangle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/* ---------------- Alignment with WeekScroller ---------------- */
const LEFT_OFFSET = "calc(2.25rem + 0.375rem - 0.5rem)";
const RIGHT_OFFSET = "calc(2.25rem + 0.375rem)";

/* ---------------- Helpers ---------------- */
function rng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507)), (h >>> 0) / 2 ** 32);
}
function seriesInt(n: number, seed: string, min: number, max: number) {
  const r = rng(seed);
  return Array.from({ length: n }, () => Math.round(min + r() * (max - min)));
}

/** ISO week (UTC-based; good enough for Berlin daily bins already localized by API) */
function isoWeek(d: Date): number {
  const dt = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = dt.getUTCDay() || 7;
  dt.setUTCDate(dt.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1));
  return Math.ceil(((dt.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

type WeeklyReal = Record<
  number,
  { tempC: number; rainMm: number; humidity: number; windKmh: number }
>;

const getColorForValue = (value: number, type: "temp" | "rain") => {
  if (type === "temp") {
    // Celsius thresholds
    return value >= 32 ? "#EA4A3C" : value >= 24 ? "#F2AE48" : value >= 15 ? "#02A78B" : "#7AC4B2";
  }
  // Rain (mm) per week: low precip is risky
  return value <= 5 ? "#EA4A3C" : value <= 20 ? "#F2AE48" : "#02A78B";
};

type Props = {
  weeks: number[];
  locationLabel: string; // keep your existing label; we fetch for Berlin regardless (as requested)
  onClose: () => void;
  className?: string;
  onPickShortTermWeek?: (
    week: number,
    data?: { tempC: number; rainMm: number; humidity: number; windKmh: number }
  ) => void;
};

export default function WeatherPanel({
  weeks,
  locationLabel,
  onClose,
  className = "",
  onPickShortTermWeek,
}: Props) {
  const count = weeks?.length ?? 0;

  // -------- Fetch real Berlin daily forecast (current + next week)
  const [realWeekly, setRealWeekly] = React.useState<WeeklyReal>({});
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;

    async function loadBerlin() {
      try {
        // Berlin: 52.52, 13.405 – 14 days daily forecast
        const url =
          "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.405" +
          "&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,relative_humidity_2m_mean" +
          "&timezone=Europe%2FBerlin";

        const res = await fetch(url, { cache: "no-store" });
        const json = await res.json();

        const days: string[] = json?.daily?.time ?? [];
        const tmax: number[] = json?.daily?.temperature_2m_max ?? [];
        const tmin: number[] = json?.daily?.temperature_2m_min ?? [];
        const rain: number[] = json?.daily?.precipitation_sum ?? [];
        const hum: number[] = json?.daily?.relative_humidity_2m_mean ?? [];
        const wind: number[] = json?.daily?.wind_speed_10m_max ?? [];

        const byWeek: Record<number, { tSum: number; n: number; rain: number; humSum: number; windSum: number }> = {};
        for (let i = 0; i < days.length; i++) {
          const d = new Date(days[i]); // API is Berlin-local calendar; Date parses as UTC midnight for that date
          const wk = isoWeek(d);
          const avgT = (Number(tmax[i] ?? 0) + Number(tmin[i] ?? 0)) / 2;
          if (!byWeek[wk]) byWeek[wk] = { tSum: 0, n: 0, rain: 0, humSum: 0, windSum: 0 };
          byWeek[wk].tSum += avgT;
          byWeek[wk].humSum += Number(hum[i] ?? 0);
          byWeek[wk].windSum += Number(wind[i] ?? 0);
          byWeek[wk].rain += Number(rain[i] ?? 0);
          byWeek[wk].n += 1;
        }

        const wkReal: WeeklyReal = {};
        Object.keys(byWeek).forEach((k) => {
          const w = Number(k);
          const o = byWeek[w];
          if (!o?.n) return;
          wkReal[w] = {
            tempC: Math.round(o.tSum / o.n),
            rainMm: Math.round(o.rain),
            humidity: Math.round(o.humSum / o.n),
            windKmh: Math.round((o.windSum / o.n) * 3.6), // m/s -> km/h (Open-Meteo returns m/s for hourly; daily_*_max is already in m/s)
          };
        });

        if (mounted) setRealWeekly(wkReal);
      } catch {
        // fall back to synthetic
      } finally {
        if (mounted) setLoaded(true);
      }
    }

    loadBerlin();
    return () => {
      mounted = false;
    };
  }, []);

  // -------- Prepare arrays for the bar (first 2 from real if available)
  const PRECISE_WEEKS = 2;

  // synthetic fallback + fill for outlook
  const tempsSynthetic = React.useMemo(
    () => seriesInt(count, `wxC-${weeks.join(",")}`, 12, 34),
    [count, weeks]
  );
  const rainSynthetic = React.useMemo(
    () => seriesInt(count, `wxR-${weeks.join(",")}`, 0, 28),
    [count, weeks]
  );

  // Compose final arrays
  const temps: number[] = weeks.map((w, i) =>
    i < PRECISE_WEEKS && realWeekly[w]?.tempC != null ? realWeekly[w]!.tempC : tempsSynthetic[i] ?? 18
  );
  const rain: number[] = weeks.map((w, i) =>
    i < PRECISE_WEEKS && realWeekly[w]?.rainMm != null ? realWeekly[w]!.rainMm : rainSynthetic[i] ?? 10
  );
  const humidity: number[] = weeks.map((w, i) =>
    i < PRECISE_WEEKS && realWeekly[w]?.humidity != null ? realWeekly[w]!.humidity : 60
  );
  const windKmh: number[] = weeks.map((w, i) =>
    i < PRECISE_WEEKS && realWeekly[w]?.windKmh != null ? realWeekly[w]!.windKmh : 12
  );

  const tempLabel = (v: number) =>
    v >= 32 ? "High heat risk" : v >= 24 ? "Warm" : v >= 15 ? "Optimal" : "Cool";
  const rainLabel = (v: number) =>
    v <= 5 ? "Very low precip" : v <= 20 ? "Low–Adequate precip" : "Adequate precip";

  const barOuterStyle: React.CSSProperties = { marginLeft: LEFT_OFFSET, marginRight: RIGHT_OFFSET };

  const renderBarWithWarnings = (values: number[], type: "temp" | "rain") => (
    <div className="relative" style={barOuterStyle}>
      {/* background bar (striped by segment) */}
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
          {/* segment dividers */}
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

        const isPrecise = i < PRECISE_WEEKS; // only current & next
        const label = type === "temp" ? tempLabel(v) : rainLabel(v);
        const hasWarning = type === "temp" ? v >= 32 : v <= 5;

        const handleClick = () => {
          if (!isPrecise) return;
          onPickShortTermWeek?.(weeks[i], {
            tempC: temps[i],
            rainMm: rain[i],
            humidity: humidity[i],
            windKmh: windKmh[i],
          });
        };

        return (
          <Tooltip key={`week-${type}-${i}`}>
            <TooltipTrigger asChild>
              <div
                role={isPrecise ? "button" : "presentation"}
                tabIndex={isPrecise ? 0 : -1}
                className={`absolute top-0 h-4 ${isPrecise ? "cursor-pointer" : "cursor-default"}`}
                style={{ left: `${position}%`, width: `${width}%` }}
                onClick={handleClick}
                onKeyDown={(e) => (isPrecise && (e.key === "Enter" || e.key === " ")) ? handleClick() : undefined}
                aria-label={`Week ${weeks[i]} ${type === "temp" ? "temperature" : "precipitation"}`}
                title={isPrecise ? "Click for short-term forecast" : undefined}
              />
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={6}>
              <div className="max-w-[260px] text-xs">
                <div className="font-medium">
                  Week {weeks[i]} • {isPrecise ? "Forecast (Berlin)" : "Outlook"}
                </div>
                {isPrecise ? (
                  <div className="mt-0.5 text-muted-foreground">
                    {type === "temp" ? `${v}°C` : `${v} mm`}
                  </div>
                ) : null}
                <div className="mt-1 flex items-start gap-2">
                  {hasWarning && <AlertTriangle className="mt-[1px] size-4 text-red-500" />}
                  <span className={hasWarning ? "text-red-600" : "text-muted-foreground"}>{label}</span>
                </div>
                {isPrecise && type === "temp" ? (
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    Humidity ~{humidity[i]}% • Wind ~{windKmh[i]} km/h
                  </div>
                ) : null}
              </div>
            </TooltipContent>
          </Tooltip>
        );
      })}

      {/* warning glyphs (overlay) */}
      {values.map((v, i) => {
        const show = type === "temp" ? v >= 32 : v <= 5;
        if (!show) return null;
        const position = (i / values.length) * 100 + 100 / values.length / 2;
        return (
          <div
            key={`warning-${type}-${i}`}
            className="absolute top-0 -translate-x-1/2 -translate-y-1"
            style={{ left: `${position}%` }}
          >
            <AlertTriangle className="size-4 rounded-full bg-white p-0.5 text-red-500" />
          </div>
        );
      })}
    </div>
  );

  if (!count) return null;

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
      <section
        className={`rounded-2xl border bg-white p-4 shadow-sm ${className}`}
        aria-label="Weekly Weather Forecast"
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="text-[15px] font-semibold text-[#02A78B]">
              Weekly Weather Forecast <span className="font-normal text-black">– Berlin, Germany</span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              As of {nowStr} {loaded ? "" : "• loading…"}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close weather panel"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mb-4 flex items-center gap-4">
          <div className="w-32 flex-shrink-0 text-[15px] font-medium text-[#02A78B]">Temperature</div>
          <div className="flex-1">{renderBarWithWarnings(temps, "temp")}</div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-32 flex-shrink-0 text-[15px] font-medium text-[#02A78B]">Water Precipitation</div>
          <div className="flex-1">{renderBarWithWarnings(rain, "rain")}</div>
        </div>
      </section>
    </TooltipProvider>
  );
}
