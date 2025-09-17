// src/app/[lng]/components/organisms/HarvestSimulator.tsx
"use client";

import * as React from "react";
import { X, Euro, Leaf, Building2 } from "lucide-react";
import { useProductionUI } from "../../production/ui";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/* ============ Theme / palette ============ */
const BRAND = "#02A78B";
const BORDER = "#E0F0ED";
const YIELD = "#55D759";
const SURPLUS = "#8FC4C8";
const WASTE = "#FF4500";

/* ============ Helpers (mirror schedule) ============ */
function rng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507)), (h >>> 0) / 2 ** 32);
}

type Stage = "seedling" | "growing" | "ripening" | "harvest";
function cellFor(groupId: string, week: number) {
  const r = rng(`${groupId}-${week}`);
  const roll = r();
  const stage: Stage =
    roll < 0.25 ? "seedling" : roll < 0.55 ? "growing" : roll < 0.82 ? "ripening" : "harvest";
  const base = stage === "seedling" ? 2 : stage === "growing" ? 6 : stage === "ripening" ? 9 : 12;
  const prod = Math.round(base + r() * 3);
  return { stage, prod };
}

// keep same helpers used in schedule so numbers feel connected
const demandForWeek = (w: number) => 20 + ((w * 7) % 8);
const lossForWeek = (w: number) => Math.max(0, ((w * 3) % 5) - 1);

function mondayOfISOWeek(week: number, year: number) {
  const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
  const dow = simple.getUTCDay();
  const ISOwkStart = simple;
  const diff = (dow <= 1 ? 7 : 0) + (1 - dow);
  ISOwkStart.setUTCDate(simple.getUTCDate() + diff);
  return ISOwkStart;
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

/* ============ UI pieces ============ */
function StageRail() {
  const blocks = Array.from({ length: 6 }, (_, i) => i);
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-[#EFF6F4]">
      <div className="flex h-3 w-full gap-[2px]">
        {blocks.map((i) => (
          <div
            key={i}
            className="h-3 flex-1 rounded-[3px]"
            style={{ background: i === 5 ? "#F4C84A" : "#30A46C" }}
          />
        ))}
      </div>
    </div>
  );
}

const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));
const kg = (n: number) => `${Math.round(n)} kg`;

/* indicators coloring */
function agrColor(stage: Stage, irrigationDelta: number) {
  if (irrigationDelta <= -0.12) return "#F59E0B";
  return stage === "ripening" ? "#F59E0B" : BRAND;
}
function envColor(surplusShare: number) {
  if (surplusShare > 0.25) return "#E11D48";
  if (surplusShare > 0.15) return "#F59E0B";
  return BRAND;
}
function ecoColor(wasteShare: number, protectionOn: boolean) {
  const penalty = protectionOn ? 0.05 : 0;
  const eff = wasteShare + penalty;
  if (eff > 0.2) return "#E11D48";
  if (eff > 0.1) return "#F59E0B";
  return BRAND;
}

/* quick actions */
type Scenario = {
  harvestShift: -1 | 0 | 1;
  irrigationDelta: number; // -0.2..+0.2
  protectionOn: boolean;
};
function applyScenario(baseYield: number, baseWaste: number, sc: Scenario) {
  let y = baseYield;
  let w = baseWaste;

  y = y * (1 + sc.irrigationDelta);
  if (sc.irrigationDelta < 0) w = w * (1 + Math.abs(sc.irrigationDelta) * 0.6);
  if (sc.protectionOn) w = w * 0.75;

  return { yieldAdj: Math.max(0, y), wasteAdj: Math.max(0, w) };
}

/* metric bar — segments are flex items, labels centered */
function MetricBar({
  yieldVal,
  surplusVal,
  wasteVal,
}: {
  yieldVal: number;
  surplusVal: number;
  wasteVal: number;
}) {
  const Seg: React.FC<{ color: string; value: number; label?: string; align?: "center" | "left" | "right" }> = ({
    color,
    value,
    label,
    align = "center",
  }) => {
    if (value <= 0) return null;
    return (
      <div
        className="relative flex items-center justify-center"
        style={{
          background: color,
          flex: value, // proportional
          minWidth: 10, // ensure visibility for tiny segments
        }}
      >
        {label ? (
          <span
            className="pointer-events-none select-none text-white text-sm font-semibold"
            style={{
              position: "absolute",
              left: align === "left" ? 8 : "50%",
              right: align === "right" ? 8 : undefined,
              transform: align === "center" ? "translateX(-50%)" : undefined,
              whiteSpace: "nowrap",
            }}
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
        <Seg color={YIELD} value={yieldVal} label={kg(yieldVal)} />
        <Seg color={SURPLUS} value={surplusVal} label={surplusVal > 0 ? kg(surplusVal) : undefined} />
        <Seg color={WASTE} value={wasteVal} label={wasteVal > 0 ? kg(wasteVal) : undefined} />
      </div>
    </div>
  );
}

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
        <div className="flex w-24 select-none flex-col items-center">
          <span
            className="inline-flex h-10 w-10 items-center justify-center rounded-full"
            style={{ background: bg, border: `2px solid ${ring}` }}
          >
            <Icon className="h-5 w-5" style={{ color: ring }} />
          </span>
          <span className="mt-1 text-xs text-gray-700">{label}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        sideOffset={8}
        className="z-[70] max-w-sm rounded-lg border bg-white/95 px-3 py-2 text-[12px] leading-5 shadow-lg backdrop-blur-sm"
        style={{ borderColor: BORDER }}
      >
        {tip}
      </TooltipContent>
    </Tooltip>
  );
}

/* one row */
function WeekRow({
  week,
  year,
  ctx,
  groupsCount,
  scenario,
}: {
  week: number;
  year: number;
  ctx: { groupId: string; crop: string };
  groupsCount: number;
  scenario: Scenario;
}) {
  const { stage, prod } = cellFor(ctx.groupId, week);

  // --- Demand variability to guarantee *some* surplus and *some* tight weeks ---
  // We vary demand around the (adjusted) yield using a seeded factor [0.7 .. 1.3]
  const marketRng = rng(`market-${ctx.groupId}-${week}`)();
  const demandFactor = 0.7 + marketRng * 0.6; // 0.7..1.3
  const demandTotal = Math.max(1, Math.round(prod * demandFactor + (week % 3))); // small offset
  const demandPerGroup = Math.max(1, Math.round(demandTotal / Math.max(1, groupsCount)));

  // waste baseline tied to schedule’s loss model (so it’s sometimes non-zero)
  const baseWaste = Math.max(0, lossForWeek(week));

  // Apply quick actions (irrigation/protection)
  const { yieldAdj, wasteAdj } = applyScenario(prod, baseWaste, scenario);
  const yieldVal = Math.round(yieldAdj);
  const wasteVal = Math.round(wasteAdj);
  const surplusVal = Math.max(0, Math.round(yieldVal - demandPerGroup));

  // shares for indicator coloring
  const total = Math.max(1, yieldVal + surplusVal + wasteVal);
  const sShare = surplusVal / total;
  const wShare = wasteVal / total;

  const agr = agrColor(stage, scenario.irrigationDelta);
  const env = envColor(sShare);
  const eco = ecoColor(wShare, scenario.protectionOn);

  return (
    <div
      className="grid items-center gap-6 py-6"
      style={{
        gridTemplateColumns: "150px minmax(540px,1fr) 320px",
        borderTop: `1px solid ${BORDER}`,
      }}
    >
      <div className="pl-1">
        <div className="text-lg font-semibold text-gray-800">Week {week}</div>
        <div className="mt-1 text-[13px]" style={{ color: BRAND }}>
          {fmtRange(week, year)}
        </div>
      </div>

      <div className="min-w-0">
        <StageRail />
        <div className="mt-3">
          <MetricBar yieldVal={yieldVal} surplusVal={surplusVal} wasteVal={wasteVal} />
        </div>
      </div>

      <div className="flex items-center justify-start gap-6 pr-2">
        <Indicator
          label="Agricultural"
          color={agr}
          Icon={Building2}
          tip={`Stage: ${stage}. Irrigation Δ: ${Math.round(scenario.irrigationDelta * 100)}%.`}
        />
        <Indicator
          label="Environmental"
          color={env}
          Icon={Leaf}
          tip={`Surplus: ${kg(surplusVal)} (${Math.round(sShare * 100)}% of total). Lower is better for the environment.`}
        />
        <Indicator
          label="Economical"
          color={eco}
          Icon={Euro}
          tip={`Waste: ${kg(wasteVal)} (${Math.round(wShare * 100)}% of total).${scenario.protectionOn ? " Includes a small protection cost impact." : ""}`}
        />
      </div>
    </div>
  );
}

/* modal */
export default function HarvestSimulator() {
  const ui = useProductionUI() as any;
  if (!ui.simulatorOpen || !ui.simulatorCtx) return null;

  const { week, groupId, crop, plots } = ui.simulatorCtx!;
  const year = new Date().getFullYear();

  const groupsCount = 1; // simulate the clicked stream

  const [harvestShift, setHarvestShift] = React.useState<-1 | 0 | 1>(0);
  const [irrigationDelta, setIrrigationDelta] = React.useState(0);
  const [protectionOn, setProtectionOn] = React.useState(false);

  const scenario: Scenario = { harvestShift, irrigationDelta, protectionOn };

  const base = ((week - 1 + (harvestShift as number) + 52) % 52) + 1;
  const fourWeeks = [0, 1, 2, 3].map((off) => ((base - 1 + off) % 52) + 1);

  const chips = [crop, String(groupId).toUpperCase(), ...(plots?.length ? [plots.join(", ")] : [])];

  const close = () => ui.closeSimulator();

  return (
    <TooltipProvider delayDuration={100}>
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/30" onClick={close} />
        <div className="absolute inset-x-6 top-8 mx-auto max-w-6xl rounded-2xl bg-white shadow-xl">
          {/* header */}
          <div className="flex items-center justify-between px-6 py-4">
            <div className="text-[18px] font-semibold" style={{ color: BRAND }}>
              Harvest Simulator
            </div>
            <button
              onClick={close}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* selected filters + legend (legend on the right) */}
          <div className="flex items-start justify-between gap-6 px-6">
            <div className="flex-1">
              <div className="mb-2 text-sm text-gray-600">Selected Filters</div>
              <div className="flex flex-wrap gap-2">
                {chips.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
                    style={{ borderColor: BORDER, background: "#F7FBFA" }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 shrink-0 flex items-center gap-6 text-xs text-gray-700">
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-2 w-3 rounded-sm" style={{ background: YIELD }} />
                Expected Yield
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-2 w-3 rounded-sm" style={{ background: SURPLUS }} />
                Expected Surplus
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-2 w-3 rounded-sm" style={{ background: WASTE }} />
                Expected Waste
              </span>
            </div>
          </div>

          {/* quick actions — CENTERED */}
          <div
            className="mt-4 flex flex-wrap items-center justify-center gap-4 border-t px-6 py-3 text-sm"
            style={{ borderColor: BORDER }}
          >
            <div className="inline-flex items-center gap-2">
              <span className="text-gray-600">↔ Harvest shift</span>
              <button
                className={`h-8 rounded-md border px-3 ${harvestShift === -1 ? "bg-[#F1F5F4]" : ""}`}
                style={{ borderColor: BORDER }}
                onClick={() => setHarvestShift(-1)}
              >
                −1w
              </button>
              <button
                className={`h-8 rounded-md border px-3 ${harvestShift === 0 ? "bg-[#F1F5F4]" : ""}`}
                style={{ borderColor: BORDER }}
                onClick={() => setHarvestShift(0)}
              >
                0
              </button>
              <button
                className={`h-8 rounded-md border px-3 ${harvestShift === 1 ? "bg-[#F1F5F4]" : ""}`}
                style={{ borderColor: BORDER }}
                onClick={() => setHarvestShift(1)}
              >
                +1w
              </button>
            </div>

            <div className="inline-flex items-center gap-3">
              <span className="text-gray-600">💧 Irrigation Δ</span>
              <input
                type="range"
                min={-20}
                max={20}
                step={1}
                value={Math.round(irrigationDelta * 100)}
                onChange={(e) => setIrrigationDelta(clamp(parseInt(e.target.value, 10) / 100, -0.2, 0.2))}
              />
              <span className="w-10 text-right">{Math.round(irrigationDelta * 100)}%</span>
            </div>

            <div className="inline-flex items-center gap-2">
              <span className="text-gray-600">🛡 Protection</span>
              <button
                className={`h-8 rounded-md border px-3 ${protectionOn ? "bg-[#E6FAF5] text-[#0F766E]" : ""}`}
                style={{ borderColor: BORDER }}
                onClick={() => setProtectionOn((v) => !v)}
              >
                {protectionOn ? "On" : "Off"}
              </button>
            </div>
          </div>

          {/* rows */}
          <div className="px-6 pb-2">
            {fourWeeks.map((w) => (
              <WeekRow
                key={`${groupId}-${w}`}
                week={w}
                year={year}
                ctx={{ groupId, crop }}
                groupsCount={groupsCount}
                scenario={{ harvestShift, irrigationDelta, protectionOn }}
              />
            ))}
          </div>

          {/* footer with a single Close CTA */}
          <div
            className="flex items-center justify-end gap-3 border-t px-6 py-4"
            style={{ borderColor: BORDER }}
          >
            <button
              onClick={close}
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
