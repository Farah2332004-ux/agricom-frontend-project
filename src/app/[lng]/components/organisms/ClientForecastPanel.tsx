// src/app/[lng]/components/organisms/ClientForecastPanel.tsx
"use client";

import * as React from "react";
import {
  X,
  AlertTriangle,
  BarChart3,
  CircleDollarSign,
  Users,
  BadgeCheck,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/* Gutters aligned with WeekScroller */
const LEFT_OFFSET = "calc(2.25rem + 0.375rem - 0.5rem)";
const RIGHT_OFFSET = "calc(2.25rem + 0.375rem)";
const BRAND = "#02A78B";
const BORDER = "#E0F0ED";

/* ---------------- Helpers ---------------- */
function rng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++)
    h = Math.imul(h ^ seed.charCodeAt(i) ^ i, 16777619);
  return () =>
    ((h = Math.imul(h ^ (h >>> 15), 2246822507)), (h >>> 0) / 2 ** 32);
}

function seriesInt(n: number, seed: string, min: number, max: number) {
  const r = rng(seed);
  return Array.from({ length: n }, () => Math.round(min + r() * (max - min)));
}

/** ISO week (UTC basis) */
function isoWeek(d: Date): number {
  const dt = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = dt.getUTCDay() || 7;
  dt.setUTCDate(dt.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1));
  return Math.ceil(((dt.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/* Color ramps */
const perfColor = (v: number) =>
  v >= 80 ? "#02A78B" : v >= 60 ? "#F2AE48" : "#EA4A3C"; // higher → greener
const sensColor = (v: number) =>
  v >= 80 ? "#EA4A3C" : v >= 60 ? "#F2AE48" : "#02A78B"; // higher sensitivity → redder

/* Human text */
const perfText = (v: number) =>
  v >= 80 ? "High activity and engagement"
  : v >= 60 ? "Steady engagement"
  : "Soft activity vs recent weeks";

const sensText = (v: number) =>
  v >= 80 ? "Highly price-reactive"
  : v >= 60 ? "Price-aware"
  : "Less price-driven";

/* -------- Short-term KPI strip (current week only) -------- */
type ShortData = {
  week: number;
  performance: number;     // %
  sensitivity: number;     // %
  churnRiskClients: number;
  fulfillmentPct: number;  // %
  trendPct: number;        // vs last week
};

function ShortTermStrip({ data, onClose }: { data: ShortData; onClose: () => void }) {
  const perfTag =
    data.performance >= 80 ? "High"
  : data.performance >= 60 ? "Medium"
  : "Low";

  const sensTag =
    data.sensitivity >= 80 ? "High Sensitivity"
  : data.sensitivity >= 60 ? "Moderate Sensitivity"
  : "Low Sensitivity";

  const churnTag =
    data.churnRiskClients >= 8 ? "High"
  : data.churnRiskClients >= 4 ? "Moderate"
  : "Low";

  const fulfillTag =
    data.fulfillmentPct >= 95 ? "Excellent"
  : data.fulfillmentPct >= 85 ? "Good"
  : "Fair";

  const trendStr = `${data.trendPct >= 0 ? "▲" : "▼"} ${Math.abs(data.trendPct)}% vs. last week`;
  const trendClass = data.trendPct >= 0 ? "text-emerald-600" : "text-red-600";

  return (
    <div className="mt-3 rounded-2xl border bg-white px-4 py-3" style={{ borderColor: BORDER }}>
      <div className="grid grid-cols-4 items-center gap-4">
        {/* Performance (now shows EXACT % to match hover) */}
        <div className="flex items-center gap-3">
          <BarChart3 className="h-5 w-5" style={{ color: BRAND }} />
          <div>
            <div className="text-[13px] text-gray-700">Performance</div>
            <div className="text-[18px] font-semibold text-black">
              {data.performance}% <span className="text-[13px] font-normal">({perfTag})</span>
            </div>
            <div className={`text-xs ${trendClass}`}>{trendStr}</div>
          </div>
        </div>

        {/* Price Sensitivity */}
        <div className="flex items-center gap-3 border-l pl-4" style={{ borderColor: BORDER }}>
          <CircleDollarSign className="h-5 w-5" style={{ color: BRAND }} />
          <div>
            <div className="text-[13px] text-gray-700">Price Sensitivity</div>
            <div className="text-[18px] font-semibold text-black">
              {data.sensitivity}% <span className="text-[13px] font-normal">{sensTag}</span>
            </div>
          </div>
        </div>

        {/* Churn Risk */}
        <div className="flex items-center gap-3 border-l pl-4" style={{ borderColor: BORDER }}>
          <Users className="h-5 w-5" style={{ color: BRAND }} />
          <div>
            <div className="text-[13px] text-gray-700">Churn Risk Clients</div>
            <div className="text-[18px] font-semibold text-black">
              {data.churnRiskClients} <span className="text-[13px] font-normal">Clients</span>
            </div>
            <div className={`text-xs ${data.churnRiskClients >= 8 ? "text-red-600" : "text-emerald-600"}`}>
              {churnTag}
            </div>
          </div>
        </div>

        {/* Fulfillment + close */}
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

/* -------- Segmented bar (tooltips + click current) -------- */
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
          <Tooltip key={`seg-${i}`}>
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

      {/* warnings */}
      {values.map((v, i) => {
        const show = warnings ? warnings(v) : false;
        if (!show) return null;
        const position = (i / values.length) * 100 + 100 / values.length / 2;
        return (
          <div
            key={`warn-${i}`}
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

/* ---------------- Component ---------------- */
type Props = {
  weeks: number[];
  clientLabel: string; // e.g., "Online Shop, VIP"
  onClose: () => void;
  className?: string;
};

function ClientForecastPanelComponent({
  weeks,
  clientLabel,
  onClose,
  className = "",
}: Props) {
  const count = weeks?.length ?? 0;
  if (!count) return null;

  // Stable synthetic series
  const perf = React.useMemo(
    () => seriesInt(count, `perf-${clientLabel}-${weeks.join(",")}`, 35, 96),
    [count, weeks, clientLabel]
  );
  const sens = React.useMemo(
    () => seriesInt(count, `sens-${clientLabel}-${weeks.join(",")}`, 30, 95),
    [count, weeks, clientLabel]
  );

  const currentWk = isoWeek(new Date());
  const currentIndex = weeks.findIndex((w) => w === currentWk);

  // Headline % beside “Client Performance”
  const headlineIndex = currentIndex !== -1 ? currentIndex : 0;
  const perfHeadline = perf[headlineIndex];

  const [short, setShort] = React.useState<ShortData | null>(null);

  const reasonForPerf = (v: number) =>
    v >= 80 ? "expected uplift from active campaigns"
    : v >= 60 ? "steady repeat purchases"
    : "softness from seasonality and price pressure";

  const reasonForSens = (v: number) =>
    v >= 80 ? "heavy discount hunting"
    : v >= 60 ? "promotional environment"
    : "stable pricing and loyalty";

  const perfLabel = (v: number, i: number) => {
    const isNow = i === currentIndex && currentIndex !== -1;
    return (
      <>
        <div className="font-medium">
          Week {weeks[i]} • {isNow ? "Current" : "Outlook"}
        </div>
        <div className="mt-0.5 text-muted-foreground">
          {isNow ? `${v}% performance`
                 : `${perfText(v)} — ${reasonForPerf(v)}`}
        </div>
      </>
    );
  };

  const sensLabel = (v: number, i: number) => {
    const isNow = i === currentIndex && currentIndex !== -1;
    return (
      <>
        <div className="font-medium">
          Week {weeks[i]} • {isNow ? "Current" : "Outlook"}
        </div>
        <div className="mt-0.5 text-muted-foreground">
          {isNow ? `${v}% price sensitivity`
                 : `${sensText(v)} — ${reasonForSens(v)}`}
        </div>
      </>
    );
  };

  const isClickableIndex = (i: number) => i === currentIndex && currentIndex !== -1;

  const openShortAt = (i: number) => {
    if (i !== currentIndex || currentIndex === -1) return;
    const p = perf[i] ?? 0;         // EXACT value used in hover
    const s = sens[i] ?? 0;
    const prev = perf[i - 1] ?? p;
    const trend = Math.max(-99, Math.min(99, Math.round(((p - prev) / Math.max(1, prev)) * 100)));
    const churn = Math.max(0, Math.round((100 - p) / 8 + (s - 50) / 20)); // 0..~12
    const fulfill = Math.max(70, Math.min(99, Math.round(88 + (p - 60) / 4 - (s - 60) / 10)));

    setShort({
      week: weeks[i],
      performance: p,          // <- passes exact % to panel
      sensitivity: s,
      churnRiskClients: churn,
      fulfillmentPct: fulfill,
      trendPct: trend,
    });
  };

  const nowStr = new Date().toLocaleString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    weekday: "short",
    month: "short",
    day: "2-digit",
  });

  const perfWarn = (v: number) => v <= 45;
  const sensWarn = (v: number) => v >= 85;

  return (
    <TooltipProvider delayDuration={120}>
      <section
        className={`rounded-2xl border bg-white p-4 shadow-sm ${className}`}
        aria-label="Weekly Client Forecast"
        style={{ borderColor: BORDER }}
      >
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="text-[15px] font-semibold" style={{ color: BRAND }}>
              Weekly Client Forecast{" "}
              <span className="font-normal text-black">– {clientLabel}</span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">As of {nowStr}</div>
          </div>
          <button
            onClick={onClose}
            aria-label="Collapse client forecast"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Client Performance — shows headline % matching hover of current week */}
        <div className="mb-4 flex items-center gap-4">
          <div className="w-40 flex-shrink-0 text-[15px] font-medium" style={{ color: BRAND }}>
            Client Performance
            {typeof perfHeadline === "number" && (
              <span className="ml-2 text-[15px] font-semibold text-black">
                {perfHeadline}%
              </span>
            )}
          </div>
          <div className="flex-1">
            <SegmentedBar
              values={perf}
              getColor={perfColor}
              labelBuilder={perfLabel}
              isClickableIndex={isClickableIndex}
              onClickIndex={openShortAt}
              warnings={perfWarn}
            />
          </div>
        </div>

        {/* Price Sensitivity */}
        <div className="flex items-center gap-4">
          <div className="w-40 flex-shrink-0 text-[15px] font-medium" style={{ color: BRAND }}>
            Price Sensitivity
          </div>
          <div className="flex-1">
            <SegmentedBar
              values={sens}
              getColor={sensColor}
              labelBuilder={sensLabel}
              isClickableIndex={isClickableIndex}
              onClickIndex={openShortAt}
              warnings={sensWarn}
            />
          </div>
        </div>

        {/* Short-term (appears when clicking the current week) */}
        {short && <ShortTermStrip data={short} onClose={() => setShort(null)} />}
      </section>
    </TooltipProvider>
  );
}

const ClientForecastPanel = ClientForecastPanelComponent;
export default ClientForecastPanel;
export { ClientForecastPanel };
