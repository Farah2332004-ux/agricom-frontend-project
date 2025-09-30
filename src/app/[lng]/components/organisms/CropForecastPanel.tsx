// src/app/[lng]/components/organisms/CropForecastPanel.tsx
"use client";

import * as React from "react";
import {
  X,
  AlertTriangle,
  Sprout,
  ShoppingCart,
  CircleDollarSign,
  BadgeCheck,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/* ---------------- Alignment with WeekScroller ---------------- */
const LEFT_OFFSET = "calc(2.25rem + 0.375rem - 0.5rem)";
const RIGHT_OFFSET = "calc(2.25rem + 0.375rem)";
const BRAND = "#02A78B";
const BORDER = "#E0F0ED";

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

/** ISO week number (UTC basis; good enough here) */
function isoWeek(d: Date): number {
  const dt = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = dt.getUTCDay() || 7;
  dt.setUTCDate(dt.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1));
  return Math.ceil(((dt.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

type Props = {
  weeks: number[];
  cropLabel: string;
  onClose: () => void;
  className?: string;
};

type ShortData = {
  week: number;
  stockKg: number;
  demandKg: number;
  pricePerKg: number;
  fulfillmentPct: number;
};

/* ---------------- Color ramps ---------------- */
const demandColor = (v: number) =>
  v >= 1000 ? "#EA4A3C" : v >= 800 ? "#F2AE48" : v >= 600 ? "#02A78B" : "#7AC4B2";

const priceColor = (v: number) =>
  v >= 2.8 ? "#EA4A3C" : v >= 2.3 ? "#F2AE48" : v >= 1.8 ? "#02A78B" : "#7AC4B2";

/* Qualitative phrases that match the colors */
function demandQualitative(v: number) {
  const c = demandColor(v);
  if (c === "#EA4A3C")
    return { headline: "Demand surge", reason: "sharp uptick expected; plan stock" };
  if (c === "#F2AE48")
    return { headline: "Above-average demand", reason: "uptrend vs. recent weeks" };
  if (c === "#02A78B")
    return { headline: "Stable demand", reason: "orders in line with plan" };
  return { headline: "Soft demand", reason: "seasonal slowdown / lower interest" };
}
function priceQualitative(v: number) {
  const c = priceColor(v);
  if (c === "#EA4A3C")
    return { headline: "Price peak", reason: "tight supply & strong pull" };
  if (c === "#F2AE48")
    return { headline: "Firm pricing", reason: "solid market interest" };
  if (c === "#02A78B")
    return { headline: "Healthy pricing", reason: "balanced supply and demand" };
  return { headline: "Soft pricing", reason: "discount pressure / promos" };
}

/* ---------------- Subcomponents ---------------- */
function SegmentedBar({
  values,
  getColor,
  labelBuilder,
  isClickableIndex,
  onClickIndex,
  warnings,
}: {
  values: number[];
  getColor: (v: number) => string;
  labelBuilder: (v: number, i: number) => React.ReactNode;
  isClickableIndex: (i: number) => boolean;
  onClickIndex: (i: number) => void;
  warnings?: (v: number) => boolean;
}) {
  const barOuterStyle: React.CSSProperties = { marginLeft: LEFT_OFFSET, marginRight: RIGHT_OFFSET };

  return (
    <div className="relative" style={barOuterStyle}>
      <div className="h-4 rounded-full relative overflow-hidden">
        <div
          className="h-full w-full rounded-full relative"
          style={{
            background: `linear-gradient(to right, ${values
              .map((v, i) => {
                const color = getColor(v);
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

      {values.map((v, i) => {
        const position = (i / values.length) * 100;
        const width = 100 / values.length;
        const clickable = isClickableIndex(i);
        const click = () => clickable && onClickIndex(i);

        return (
          <Tooltip key={`wk-${i}`}>
            <TooltipTrigger asChild>
              <div
                role={clickable ? "button" : "presentation"}
                tabIndex={clickable ? 0 : -1}
                className={`absolute top-0 h-4 ${clickable ? "cursor-pointer" : "cursor-default"}`}
                style={{ left: `${position}%`, width: `${width}%` }}
                onClick={click}
                onKeyDown={(e) => (clickable && (e.key === "Enter" || e.key === " ")) ? click() : undefined}
              />
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={6}>
              <div className="max-w-[260px] text-xs">{labelBuilder(v, i)}</div>
            </TooltipContent>
          </Tooltip>
        );
      })}

      {values.map((v, i) => {
        const show = warnings ? warnings(v) : false;
        if (!show) return null;
        const position = (i / values.length) * 100 + 100 / values.length / 2;
        return (
          <div
            key={`warning-${i}`}
            className="absolute top-0 -translate-x-1/2 -translate-y-1"
            style={{ left: `${position}%` }}
          >
            <AlertTriangle className="size-4 rounded-full bg-white p-0.5 text-red-500" />
          </div>
        );
      })}
    </div>
  );
}

function ShortTermStrip({
  data,
  onClose,
}: {
  data: ShortData;
  onClose: () => void;
}) {
  const priceTag =
    data.pricePerKg >= 2.8 ? "Very High 🔥" : data.pricePerKg >= 2.3 ? "High 🔥" : "Average";
  const stockTag = "Average";
  const demandTag = "Average";
  const fulfillTag = data.fulfillmentPct >= 95 ? "Excellent" : data.fulfillmentPct >= 85 ? "Good" : "Fair";

  return (
    <div className="mt-3 rounded-2xl border bg-white px-4 py-3" style={{ borderColor: BORDER }}>
      <div className="grid grid-cols-4 items-center gap-4">
        <div className="flex items-center gap-3">
          <Sprout className="h-5 w-5" style={{ color: BRAND }} />
          <div>
            <div className="text-[13px] text-gray-700">Available Stock</div>
            <div className="text-[18px] font-semibold text-black">
              {data.stockKg.toLocaleString()} <span className="text-[13px] font-normal">kg</span>
            </div>
            <div className="text-xs text-emerald-600">{stockTag}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-l pl-4" style={{ borderColor: BORDER }}>
          <ShoppingCart className="h-5 w-5" style={{ color: BRAND }} />
          <div>
            <div className="text-[13px] text-gray-700">Total Demand</div>
            <div className="text-[18px] font-semibold text-black">
              {data.demandKg.toLocaleString()} <span className="text-[13px] font-normal">kg</span>
            </div>
            <div className="text-xs text-emerald-600">{demandTag}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-l pl-4" style={{ borderColor: BORDER }}>
          <CircleDollarSign className="h-5 w-5" style={{ color: BRAND }} />
          <div>
            <div className="text-[13px] text-gray-700">Price</div>
            <div className="text-[18px] font-semibold text-black">
              {data.pricePerKg.toFixed(2)}
              <span className="text-[13px] font-normal">$/kg</span>
            </div>
            <div className={`text-xs ${priceTag.includes("High") ? "text-orange-600" : "text-emerald-600"}`}>
              {priceTag}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-l pl-4" style={{ borderColor: BORDER }}>
          <div className="flex items-center gap-3">
            <BadgeCheck className="h-5 w-5" style={{ color: BRAND }} />
            <div>
              <div className="text-[13px] text-gray-700">Order Fulfillment</div>
              <div className="text-[18px] font-semibold text-black">{data.fulfillmentPct}%</div>
              <div className="text-xs text-emerald-600">{fulfillTag}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close short-term panel"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Main ---------------- */
export default function CropForecastPanel({
  weeks,
  cropLabel,
  onClose,
  className = "",
}: Props) {
  const count = weeks?.length ?? 0;
  if (!count) return null;

  const demand = React.useMemo(
    () => seriesInt(count, `dem-${cropLabel}-${weeks.join(",")}`, 420, 1200),
    [count, weeks, cropLabel]
  );
  const price = React.useMemo(
    () => seriesInt(count, `prc-${cropLabel}-${weeks.join(",")}`, 140, 320).map((v) => v / 100),
    [count, weeks, cropLabel]
  );
  const stock = React.useMemo(
    () => seriesInt(count, `stk-${cropLabel}-${weeks.join(",")}`, 700, 1300),
    [count, weeks, cropLabel]
  );

  const currentWk = isoWeek(new Date());
  const currentIndex = weeks.findIndex((w) => w === currentWk);

  const [short, setShort] = React.useState<ShortData | null>(null);

  const nowStr = new Date().toLocaleString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    weekday: "short",
    month: "short",
    day: "2-digit",
  });

  const isClickableIndex = (i: number) => i === currentIndex && currentIndex !== -1;
  const openShortAt = (i: number) => {
    if (i !== currentIndex) return;
    const week = weeks[i];
    const s = stock[i] ?? 0;
    const d = demand[i] ?? 0;
    const p = price[i] ?? 0;
    const fulfill = Math.max(0, Math.min(100, Math.round((s / Math.max(1, d)) * 100)));
    setShort({
      week,
      stockKg: s,
      demandKg: d,
      pricePerKg: p,
      fulfillmentPct: fulfill,
    });
  };

  // Hover labels
  const demandLabel = (v: number, i: number) => {
    const isCurrent = isClickableIndex(i);
    if (isCurrent) {
      return (
        <>
          <div className="font-medium">Week {weeks[i]} • Current</div>
          <div className="mt-1 text-muted-foreground">
            Demand: <b>{v} kg</b>
          </div>
        </>
      );
    }
    const q = demandQualitative(v);
    return (
      <>
        <div className="font-medium">Week {weeks[i]} • Outlook</div>
        <div className="mt-1 text-muted-foreground">
          {q.headline} — <span className="italic">due to {q.reason}</span>
        </div>
      </>
    );
  };

  const priceLabel = (v: number, i: number) => {
    const isCurrent = isClickableIndex(i);
    if (isCurrent) {
      return (
        <>
          <div className="font-medium">Week {weeks[i]} • Current</div>
          <div className="mt-1 text-muted-foreground">
            Price: <b>{v.toFixed(2)} $/kg</b>
          </div>
        </>
      );
    }
    const q = priceQualitative(v);
    return (
      <>
        <div className="font-medium">Week {weeks[i]} • Outlook</div>
        <div className="mt-1 text-muted-foreground">
          {q.headline} — <span className="italic">due to {q.reason}</span>
        </div>
      </>
    );
  };

  const demandWarn = (v: number) => v >= 1000;
  const priceWarn = (v: number) => v >= 2.8;

  return (
    <TooltipProvider delayDuration={120}>
      <section
        className={`rounded-2xl border bg-white p-4 shadow-sm ${className}`}
        aria-label="Weekly Crop Forecast"
        style={{ borderColor: BORDER }}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="text-[15px] font-semibold text-[#02A78B]">
              Weekly Crop Forecast <span className="font-normal text-black">– {cropLabel}</span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">As of {nowStr}</div>
          </div>
          <button
            onClick={onClose}
            aria-label="Collapse crop forecast"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Demand row */}
        <div className="mb-4 flex items-center gap-4">
          <div className="w-40 flex-shrink-0 text-[15px] font-medium" style={{ color: BRAND }}>
            Forecast Demand
          </div>
          <div className="flex-1">
            <SegmentedBar
              values={demand}
              getColor={demandColor}
              labelBuilder={demandLabel}
              isClickableIndex={isClickableIndex}
              onClickIndex={openShortAt}
              warnings={demandWarn}
            />
          </div>
        </div>

        {/* Price row */}
        <div className="flex items-center gap-4">
          <div className="w-40 flex-shrink-0 text-[15px] font-medium" style={{ color: BRAND }}>
            Forecast Price /kg
          </div>
          <div className="flex-1">
            <SegmentedBar
              values={price}
              getColor={priceColor}
              labelBuilder={priceLabel}
              isClickableIndex={isClickableIndex}
              onClickIndex={openShortAt}
              warnings={priceWarn}
            />
          </div>
        </div>

        {short && (
          <ShortTermStrip
            data={short}
            onClose={() => setShort(null)}
          />
        )}
      </section>
    </TooltipProvider>
  );
}
