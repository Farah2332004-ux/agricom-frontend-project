// src/app/[lng]/components/organisms/SalesSimulator.tsx
"use client";

import * as React from "react";
import { X, Euro, Leaf, Building2, DollarSign, Volume2, BadgePercent } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { SalesSimBaseline } from "../../sales/ui";

/* ===== Theme (kept aligned with Harvest) ===== */
const BRAND = "#02A78B";
const BORDER = "#E0F0ED";
const SALES = "#55D759";   // Expected Sales
const STOCK = "#8FC4C8";   // Expected Inventory
const WASTE = "#FF4500";   // Expected Waste

/* ===== Helpers ===== */
const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));
const kg = (n: number) => `${Math.round(n)} kg`;
// keep weeks in 1..52
const wrapWeek = (w: number) => ((w - 1 + 52) % 52) + 1;

function mondayOfISOWeek(week: number, year: number) {
  const d = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + (1 - day));
  return d;
}
function endOfISOWeek(week: number, year: number) {
  const s = mondayOfISOWeek(week, year);
  const e = new Date(s);
  e.setUTCDate(s.getUTCDate() + 6);
  return e;
}
function fmtRange(week: number, year: number, tz = "Europe/Berlin") {
  const s = mondayOfISOWeek(week, year);
  const e = endOfISOWeek(week, year);
  const fmt = (d: Date) =>
    new Intl.DateTimeFormat("en-GB", { timeZone: tz, day: "2-digit", month: "short" }).format(d);
  return `${fmt(s)} to ${fmt(e)}`;
}

/* ===== Bars (same structure as Harvest) ===== */
function MetricBar({
  salesKg,
  invKg,
  wasteKg,
}: {
  salesKg: number;
  invKg: number;
  wasteKg: number;
}) {
  const Seg: React.FC<{ color: string; value: number; label?: string }> = ({ color, value, label }) => {
    if (value <= 0) return null;
    return (
      <div className="relative flex items-center justify-center" style={{ background: color, flex: value, minWidth: 10 }}>
        {label ? (
          <span
            className="pointer-events-none select-none text-sm font-semibold text-white"
            style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap" }}
          >
            {label}
          </span>
        ) : null}
      </div>
    );
  };

  return (
    <div className="w-full rounded-full bg-[#EAF4F3]">
      <div className="flex h-10 w-full overflow-hidden rounded-full">
        <Seg color={SALES} value={salesKg} label={kg(salesKg)} />
        <Seg color={STOCK} value={invKg} label={invKg > 0 ? kg(invKg) : undefined} />
        <Seg color={WASTE} value={wasteKg} label={wasteKg > 0 ? kg(wasteKg) : undefined} />
      </div>
    </div>
  );
}

/* ===== Indicators (exact same styling as Harvest) ===== */
function Indicator({
  label,
  color,
  Icon,
  tip,
}: {
  label: string;
  color: string;
  Icon: React.ElementType;
  tip: string;
}) {
  const ring = color;
  const bg = color === "#E11D48" ? "#FDECEE" : color === "#F59E0B" ? "#FFF7E6" : "#E8F7F3";
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex w-24 select-none flex-col items-center" title={tip}>
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full" style={{ background: bg, border: `2px solid ${ring}` }}>
            <Icon className="h-5 w-5" style={{ color: ring }} />
          </span>
          <span className="mt-1 text-xs text-gray-700">{label}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        sideOffset={8}
        className="z-[70] max-w-sm rounded-lg border bg-white/95 px-3 py-2 text-[12px] leading-5 text-gray-800 shadow-lg backdrop-blur-sm"
        style={{ borderColor: BORDER }}
      >
        {tip}
      </TooltipContent>
    </Tooltip>
  );
}

/* ===== Recompute given actions ===== */
type Scenario = {
  priceDelta: number; // -0.2 .. +0.2
  marketing: "off" | "light" | "strong";
  promoOn: boolean;
};

function recomputeFromBaseline(base: SalesSimBaseline, sc: Scenario) {
  const priceElasticity = clamp(1 - sc.priceDelta * 1.25, 0.6, 1.45);
  const marketingBoost = sc.marketing === "off" ? 1 : sc.marketing === "light" ? 1.08 : 1.16;
  const promoBoost = sc.promoOn ? 1.1 : 1.0;

  const sales = Math.round(base.salesKg * priceElasticity * marketingBoost * promoBoost);
  const inv = Math.max(0, Math.round(base.invKg * (sc.promoOn ? 0.95 : 1.05)));
  const waste = Math.max(0, Math.round(base.wasteKg * (sc.priceDelta > 0 ? 1.05 : 0.95)));

  const revenueNow = sales * base.price * (1 + sc.priceDelta);
  const revenueBase = base.salesKg * base.price;
  const econColor =
    revenueNow >= revenueBase * 1.03 ? BRAND : revenueNow <= revenueBase * 0.95 ? "#E11D48" : "#F59E0B";

  const total = Math.max(1, sales + inv + waste);
  const wasteShare = waste / total;
  const envColor = wasteShare > 0.2 ? "#E11D48" : wasteShare > 0.12 ? "#F59E0B" : BRAND;

  const agrColor = sc.marketing === "strong" ? "#F59E0B" : BRAND;

  return { sales, inv, waste, econColor, envColor, agrColor };
}

/* ===== Week Row (NO stage rail; spacing adjusted) ===== */
function WeekRow({
  week,
  base,
  scenario,
}: {
  week: number;
  base: SalesSimBaseline;
  scenario: Scenario;
}) {
  const year = new Date().getFullYear();
  const { sales, inv, waste, econColor, envColor, agrColor } = recomputeFromBaseline(base, scenario);

  return (
    <div
      className="grid items-center gap-6 py-5"
      style={{ gridTemplateColumns: "150px minmax(540px,1fr) 320px", borderTop: `1px solid ${BORDER}` }}
    >
      {/* Left: week & range */}
      <div className="pl-1">
        <div className="text-lg font-semibold text-gray-800">Week {week}</div>
        <div className="mt-1 text-[13px]" style={{ color: BRAND }}>
          {fmtRange(week, year)}
        </div>
      </div>

      {/* Middle: ONLY the main metric bar now */}
      <div className="min-w-0">
        <MetricBar salesKg={sales} invKg={inv} wasteKg={waste} />
        <div className="mt-2 text-[15px]">
          Total <b>{sales + inv + waste} kg</b>
          <span className="ml-3 text-[13px] text-gray-500">
            Revenue ${(sales * base.price * (1 + scenario.priceDelta)).toFixed(0)}
          </span>
        </div>
      </div>

      {/* Right: indicators update with actions */}
      <div className="flex items-center justify-start gap-6 pr-2">
        <Indicator
          label="Agricultural"
          color={agrColor}
          Icon={Building2}
          tip={`Operational effort: ${scenario.marketing === "strong" ? "campaign in full swing" : scenario.marketing === "light" ? "light push" : "baseline"}.`}
        />
        <Indicator
          label="Environmental"
          color={envColor}
          Icon={Leaf}
          tip={`Waste share responds to pricing/promo. Lower share is greener.`}
        />
        <Indicator
          label="Economical"
          color={econColor}
          Icon={Euro}
          tip={`Revenue relative to baseline price/sales.`}
        />
      </div>
    </div>
  );
}

/* ===== Main modal (same shell as Harvest) ===== */
export default function SalesSimulator({
  open,
  crop,
  weeks,
  baselines,
  onClose,
}: {
  open: boolean;
  crop: string;
  weeks: number[];
  baselines: Record<number, SalesSimBaseline>;
  onClose: () => void;
}) {
  if (!open) return null;

  // 🔒 DO NOT change the controls — only render 4 weeks.
  const baseWeek = weeks?.[0] ?? 1;
  const weeksToRender = React.useMemo(
    () => Array.from({ length: 4 }, (_, i) => wrapWeek(baseWeek + i)),
    [baseWeek]
  );
  const fallbackBase: SalesSimBaseline =
    baselines[baseWeek] ?? { salesKg: 20, invKg: 6, wasteKg: 2, price: 2.3 };

  const [priceDeltaPct, setPriceDeltaPct] = React.useState(0); // -20..+20
  const [marketing, setMarketing] = React.useState<"off" | "light" | "strong">("off");
  const [promoOn, setPromoOn] = React.useState(false);

  const scenario: Scenario = {
    priceDelta: clamp(priceDeltaPct / 100, -0.2, 0.2),
    marketing,
    promoOn,
  };

  return (
    <TooltipProvider delayDuration={100}>
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/30" onClick={onClose} />

        <div
          role="dialog"
          aria-modal="true"
          className="absolute inset-x-4 top-6 mx-auto flex max-h-[88vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-3" style={{ borderColor: BORDER }}>
            <div className="text-[18px] font-semibold" style={{ color: BRAND }}>
              Sales Simulator
            </div>
            <button
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Body */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            {/* Selected + legend */}
            <div className="flex items-start justify-between gap-6 px-6 pt-4">
              <div className="flex-1">
                <div className="mb-2 text-sm text-gray-600">Selected</div>
                <div className="flex flex-wrap gap-2">
                  <span
                    className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
                    style={{ borderColor: BORDER, background: "#F7FBFA" }}
                  >
                    {crop}
                  </span>
                </div>
              </div>

              <div className="mt-6 shrink-0 flex items-center gap-6 pr-1 text-xs text-gray-700">
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-2 w-3 rounded-sm" style={{ background: SALES }} />
                  Expected Sales
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-2 w-3 rounded-sm" style={{ background: STOCK }} />
                  Expected Inventory
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-2 w-3 rounded-sm" style={{ background: WASTE }} />
                  Expected Waste
                </span>
              </div>
            </div>

            {/* Quick actions (aligned with Harvest) */}
            <div
              className="mt-4 flex flex-wrap items-center justify-center gap-4 border-t px-6 py-3 text-sm"
              style={{ borderColor: BORDER }}
            >
              <div className="inline-flex items-center gap-3">
                <span className="text-gray-600">
                  <DollarSign className="mr-1 inline-block h-4 w-4 -translate-y-[2px]" />
                  Price Δ
                </span>
                <input
                  type="range"
                  min={-20}
                  max={20}
                  step={1}
                  value={priceDeltaPct}
                  onChange={(e) => setPriceDeltaPct(clamp(parseInt(e.target.value, 10), -20, 20))}
                />
                <span className="w-10 text-right">{priceDeltaPct}%</span>
              </div>

              <div className="inline-flex items-center gap-2">
                <Volume2 className="h-4 w-4" style={{ color: BRAND }} />
                <span className="text-gray-600">Marketing</span>
                <button
                  className={`h-8 rounded-md border px-3 ${marketing === "off" ? "bg-[#F1F5F4]" : ""}`}
                  style={{ borderColor: BORDER }}
                  onClick={() => setMarketing("off")}
                >
                  Off
                </button>
                <button
                  className={`h-8 rounded-md border px-3 ${marketing === "light" ? "bg-[#F1F5F4]" : ""}`}
                  style={{ borderColor: BORDER }}
                  onClick={() => setMarketing("light")}
                >
                  Light
                </button>
                <button
                  className={`h-8 rounded-md border px-3 ${marketing === "strong" ? "bg-[#F1F5F4]" : ""}`}
                  style={{ borderColor: BORDER }}
                  onClick={() => setMarketing("strong")}
                >
                  Strong
                </button>
              </div>

              <div className="inline-flex items-center gap-2">
                <BadgePercent className="h-4 w-4" style={{ color: BRAND }} />
                <span className="text-gray-600">Promo</span>
                <button
                  className={`h-8 rounded-md border px-3 ${!promoOn ? "bg-[#F1F5F4]" : ""}`}
                  style={{ borderColor: BORDER }}
                  onClick={() => setPromoOn(false)}
                >
                  None
                </button>
                <button
                  className={`h-8 rounded-md border px-3 ${promoOn ? "bg-[#F1F5F4]" : ""}`}
                  style={{ borderColor: BORDER }}
                  onClick={() => setPromoOn(true)}
                >
                  −10%
                </button>
              </div>
            </div>

            {/* Week rows — always render 4 consecutive weeks */}
            <div className="px-6 pb-2">
              {weeksToRender.map((w) => (
                <WeekRow
                  key={`sales-${w}`}
                  week={w}
                  base={baselines[w] ?? fallbackBase}
                  scenario={scenario}
                />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t px-6 py-3" style={{ borderColor: BORDER }}>
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-lg border px-4 py-2 text-gray-800 hover:bg-gray-50"
              style={{ borderColor: BORDER }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
