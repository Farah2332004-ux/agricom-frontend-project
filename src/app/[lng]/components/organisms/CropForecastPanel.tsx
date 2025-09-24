// src/app/[lng]/components/organisms/CropForecastPanel.tsx
"use client";

import * as React from "react";
import { X, Plus, AlertTriangle, Flame } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/* Align with WeekScroller */
const LEFT_OFFSET  = "calc(2.25rem + 0.375rem - 0.5rem)";
const RIGHT_OFFSET = "calc(2.25rem + 0.375rem)";
const BORDER = "#E0F0ED";
const BRAND  = "#02A78B";

/* ---- helpers ---- */
function rng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507)), (h >>> 0) / 2 ** 32);
}
function seriesInt(n: number, seed: string, min: number, max: number) {
  const r = rng(seed);
  return Array.from({ length: n }, () => Math.round(min + r() * (max - min)));
}
function colorFor(v: number, kind: "demand" | "price") {
  if (kind === "demand") return v >= 85 ? "#EA4A3C" : v >= 65 ? "#F2AE48" : v >= 40 ? "#02A78B" : "#7AC4B2";
  // price in $/kg 1–5
  return v >= 4.2 ? "#EA4A3C" : v >= 3.2 ? "#F2AE48" : v >= 2.2 ? "#02A78B" : "#7AC4B2";
}
function bestWindow3(values: number[]) {
  if (values.length < 3) return { start: 0, end: Math.min(2, values.length - 1) };
  let bi = 0, bs = values[0] + values[1] + values[2];
  for (let i = 1; i <= values.length - 3; i++) {
    const s = values[i] + values[i + 1] + values[i + 2];
    if (s > bs) { bs = s; bi = i; }
  }
  return { start: bi, end: bi + 2 };
}

type Props = {
  weeks: number[];
  cropLabel: string;
  className?: string;
};

export default function CropForecastPanel({ weeks, cropLabel, className = "" }: Props) {
  const count = weeks.length;
  const [collapsed, setCollapsed] = React.useState(false);

  // synthetic demo series (stable)
  const demandIdx = React.useMemo(
    () => seriesInt(count, `dem-${cropLabel}-${weeks.join(",")}`, 20, 100),
    [count, cropLabel, weeks]
  );
  const priceKg = React.useMemo(
    () => seriesInt(count, `prc-${cropLabel}-${weeks.join(",")}`, 12, 48).map(v => v / 10), // $1.2..$4.8
    [count, cropLabel, weeks]
  );

  const demandWin = bestWindow3(demandIdx);
  const priceWin  = bestWindow3(priceKg);

  const barFrameStyle: React.CSSProperties = { marginLeft: LEFT_OFFSET, marginRight: RIGHT_OFFSET };
  const nowStr = new Date().toLocaleString(undefined, {
    timeZone: "Europe/Berlin",
    hour: "numeric",
    minute: "2-digit",
  });

  function WarningDot({
    leftPct,
    tooltipTitle,
    tooltipBody,
  }: {
    leftPct: number;
    tooltipTitle: string;
    tooltipBody: string;
  }) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="absolute top-0 -translate-x-1/2 -translate-y-1"
            style={{ left: `${leftPct}%` }}
          >
            <div className="rounded-full bg-white p-0.5 shadow">
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          sideOffset={8}
          className="bg-black text-white border-0 px-3 py-2 rounded-md text-xs"
        >
          <div className="font-semibold">{tooltipTitle}</div>
          <div className="mt-0.5 opacity-90">{tooltipBody}</div>
        </TooltipContent>
      </Tooltip>
    );
  }

  function renderStrip(values: number[], kind: "demand" | "price") {
    return (
      <div className="relative" style={barFrameStyle}>
        {/* Segmented gradient bar */}
        <div className="h-4 rounded-full relative overflow-hidden">
          <div
            className="h-full w-full rounded-full"
            style={{
              background: `linear-gradient(to right, ${values.map((v, i) => {
                const c = colorFor(v as number, kind);
                const a = (i / values.length) * 100;
                const b = ((i + 1) / values.length) * 100;
                return `${c} ${a}%, ${c} ${b}%`;
              }).join(", ")})`,
            }}
          />
          {values.slice(0, -1).map((_, i) => (
            <div
              key={`sep-${i}`}
              className="absolute top-0 bottom-0 w-px bg-white/60"
              style={{ left: `${((i + 1) / values.length) * 100}%` }}
            />
          ))}
        </div>

        {/* Warning markers (overlay) */}
        {values.map((v, i) => {
          const show =
            kind === "demand" ? v >= 85 : (v as number) >= 4.2; // high demand / high price
          if (!show) return null;
          const left = (i / values.length) * 100 + (100 / values.length) / 2;
          return (
            <WarningDot
              key={`${kind}-warn-${i}`}
              leftPct={left}
              tooltipTitle={`Week ${weeks[i]} • Outlook`}
              tooltipBody={kind === "demand" ? "High demand risk" : "Price peak risk"}
            />
          );
        })}
      </div>
    );
  }

  function renderBracket(win: { start: number; end: number }, values: number[], kind: "demand" | "price") {
    const segW = 100 / values.length;
    const leftPct = win.start * segW;
    const widthPct = (win.end - win.start + 1) * segW;
   


  }

  return (
    <TooltipProvider delayDuration={120}>
      <section className={`rounded-2xl border bg-white p-4 shadow-sm ${className}`}>
        {/* Header */}
        <div className="mb-1 flex items-start justify-between">
          <div
            className="cursor-pointer select-none"
            onClick={() => setCollapsed((v) => !v)}
            aria-label="Toggle forecast panel"
          >
            <div className="text-[15px] font-semibold" style={{ color: BRAND }}>
              Weekly Crop Forecast <span className="font-normal text-black">– {cropLabel}</span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">As of {nowStr}</div>
          </div>
          <button
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Expand" : "Collapse"}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted"
          >
            {collapsed ? <Plus className="size-4" /> : <X className="size-4" />}
          </button>
        </div>

        {/* Collapsible body */}
        {!collapsed && (
          <>
            {/* Demand */}
            <div className="relative mb-4 flex items-center gap-4">
              <div className="w-40 flex-shrink-0 text-[15px] font-medium" style={{ color: BRAND }}>
                Forecast Demand
              </div>
              <div className="relative flex-1">
                {renderStrip(demandIdx, "demand")}
                <div className="pointer-events-none absolute inset-0" style={barFrameStyle}>
                  {renderBracket(demandWin, demandIdx, "demand")}
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="relative flex items-center gap-4">
              <div className="w-40 flex-shrink-0 text-[15px] font-medium" style={{ color: BRAND }}>
                Forecast Price /kg
              </div>
              <div className="relative flex-1">
                {renderStrip(priceKg, "price")}
                <div className="pointer-events-none absolute inset-0" style={barFrameStyle}>
                  {renderBracket(priceWin, priceKg, "price")}
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </TooltipProvider>
  );
}
