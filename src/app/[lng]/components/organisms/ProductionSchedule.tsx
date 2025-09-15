// src/app/[lng]/components/organisms/ProductionSchedule.tsx
"use client";

import * as React from "react";
import {
  Scissors, Hammer, Droplets, Sprout, Wheat, Shovel, FlaskConical, Shield,
  ChevronDown, Leaf, SunMedium,
} from "lucide-react";

import WeekScroller from "../common/WeekScroller";
import { visibleWeeks } from "../common/weeks";
import { useProductionUI, NOW_WEEK, ISO_MAX_THIS_YEAR } from "../../production/ui";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import WeatherPanel from "./WeatherPanel";
import ShortTermWeatherPanel from "./ShortTermWeatherPanel";

/* ---------- layout constants ---------- */
const LABEL_PX = 180;
const TOTAL_PX = 80;
const CELL_MIN_PX = 34;
const GAP_REM = 0.375;
const LEFT_OFFSET = "calc(2.25rem + 0.375rem - 0.5rem)";
const RIGHT_OFFSET = "calc(2.25rem + 0.375rem)";
const rowGridStyle = (): React.CSSProperties => ({ display: "grid", gridTemplateColumns: `${LABEL_PX}px minmax(0,1fr) ${TOTAL_PX}px`, columnGap: `${GAP_REM}rem`, alignItems: "center" });
const weekColsStyle = (count: number): React.CSSProperties => ({ display: "grid", gridTemplateColumns: `repeat(${count}, minmax(${CELL_MIN_PX}px, 1fr))`, gap: `${GAP_REM}rem`, minWidth: 0, marginLeft: LEFT_OFFSET, marginRight: RIGHT_OFFSET });

/* ---------- demo helpers ---------- */
type Stage = "seedling" | "growing" | "ripening" | "harvest";
type TaskKey = "pruning" | "staking" | "irrigation" | "weeding" | "harvest" | "soil-prep" | "fertilization" | "protection";
const taskIcon: Record<TaskKey, React.ComponentType<{ className?: string }>> = { pruning: Scissors, staking: Hammer, irrigation: Droplets, weeding: Sprout, harvest: Wheat, "soil-prep": Shovel, fertilization: FlaskConical, protection: Shield };
const stageColor = (s: Stage) => (s === "seedling" ? "#bfe9cf" : s === "growing" ? "#37a16b" : s === "ripening" ? "#f6cf3c" : "#0a6a3f");
const stageMeta  = (s: Stage) => (s === "seedling" ? { label: "Seedling", Icon: Sprout } : s === "growing" ? { label: "Growing", Icon: Leaf } : s === "ripening" ? { label: "Ripening", Icon: SunMedium } : { label: "Harvest", Icon: Wheat });
const rng = (seed: string) => { let h = 2166136261; for (let i=0;i<seed.length;i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619); return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507)), (h >>> 0) / 2 ** 32); };
const series = (n: number, seed: string, min = 0, max = 100) => { const r = rng(seed); return Array.from({ length: n }, () => Math.round(min + r() * (max - min))); };

function cellFor(groupId: string, week: number) {
  const r = rng(`${groupId}-${week}`);
  const roll = r();
  const stage: Stage = roll < 0.25 ? "seedling" : roll < 0.55 ? "growing" : roll < 0.82 ? "ripening" : "harvest";
  const base = stage === "seedling" ? 2 : stage === "growing" ? 6 : stage === "ripening" ? 9 : 12;
  const prod = Math.round(base + r() * 3);
  const tasks: TaskKey[] = [];
  if (stage !== "seedling" && r() > 0.5) tasks.push("pruning");
  if (stage === "growing" && r() > 0.6) tasks.push("staking");
  if (r() > 0.7) tasks.push("irrigation");
  if (stage === "ripening" && r() > 0.6) tasks.push("fertilization");
  if (stage === "harvest" && r() > 0.5) tasks.push("harvest");
  if (r() > 0.8) tasks.push("protection");
  return { stage, prod, tasks };
}

const demandForWeek = (w: number) => 20 + ((w * 7) % 8);
const lossForWeek   = (w: number) => Math.max(0, ((w * 3) % 5) - 1);
const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
const cropSlug = (name: string) => name.toLowerCase().slice(0, 4);
function buildGroupsForCrop(plots: string[], cropName: string) {
  const slug = cropSlug(cropName);
  const srcPlots = plots.length ? plots : ["P1.1", "P1.2", "P2.1"];
  return srcPlots.flatMap((plot) => [1, 2, 3].map((n) => ({ id: `${plot}-${slug}-${String(n).padStart(2, "0")}`, label: `${plot}-${slug}-${String(n).padStart(2, "0")}`.toUpperCase() })));
}

export default function ProductionSchedule() {
  const ui = useProductionUI();

  const weeks = visibleWeeks(ui.weekStart, ui.window, 1, ISO_MAX_THIS_YEAR, true);

  // Generate the SAME temp/precip series used by WeatherPanel (so values match tooltips exactly)
  const temps = React.useMemo(() => series(weeks.length, `wx-temps-${weeks.join(",")}`, -5, 40), [weeks]);
  const rain  = React.useMemo(() => series(weeks.length, `wx-rain-${weeks.join(",")}`,   5, 95), [weeks]);

  // small helpers for short-term extras
  const humidityFor = (wk: number) => { const r = rng(`hum-${wk})`)(); return Math.round(50 + r * 40); } // 50–90%
  const windFor     = (wk: number) => { const r = rng(`wind-${wk}`)(); return Math.round(5 + r * 17); }  // 5–22 km/h

  // short-term selectable weeks: current & next ISO week (wrap)
  const nextWeek = (NOW_WEEK % ISO_MAX_THIS_YEAR) + 1;
  const selectableWeeks = [NOW_WEEK, nextWeek];

  // local state for exact short-term numbers
  const [shortData, setShortData] = React.useState<null | { tempC: number; rainMm: number; humidity: number; windKmh: number }>(null);

  // choose a week and populate short-term metrics (from bars payload or from arrays)
  const pickShort = (w: number, payload?: { tempC: number; rainMm: number }) => {
    if (!selectableWeeks.includes(w)) return;
    const idx = weeks.indexOf(w);
    const tempC  = payload?.tempC ?? temps[idx];
    const rainMm = payload?.rainMm ?? rain[idx];
    setShortData({ tempC, rainMm, humidity: humidityFor(w), windKmh: windFor(w) });
    ui.setSelectedWeatherWeek(w);
  };

  // crops to render
  const cropsToRender = ui.hideAllCrops ? [] : ui.selectedCrops.length > 0 ? ui.selectedCrops : [ui.crop];

  // groups
  const allGroups = React.useMemo(() => {
    if (ui.hideAllPlots) return [];
    return cropsToRender.flatMap((c) => buildGroupsForCrop(ui.selectedPlots, c));
  }, [cropsToRender, ui.selectedPlots, ui.hideAllPlots]);

  // totals for sort
  const totalsByType = {
    production: allGroups.reduce((s, g) => s + sum(weeks.map((w) => cellFor(g.id, w).prod)), 0),
    demand: sum(weeks.map(demandForWeek)),
    loss: sum(weeks.map(lossForWeek)),
  };
  const typeOrder: Array<"production" | "demand" | "loss"> =
    ui.indicators.sort ? (["production", "demand", "loss"] as const).sort((a, b) => totalsByType[b] - totalsByType[a]) : ["production", "demand", "loss"];

  // expand/collapse per crop
  const [openMap, setOpenMap] = React.useState<Record<string, boolean>>({});
  const toggleCrop = (c: string) => setOpenMap((m) => ({ ...m, [c]: !(m[c] ?? true) }));

  const cropsLabel = cropsToRender.length ? cropsToRender.join(", ") : "—";
  const showShortTerm = ui.indicators.weather && ui.selectedWeatherWeek !== null && selectableWeeks.includes(ui.selectedWeatherWeek) && shortData;

  return (
    <section className="mt-6">
      <p className="mb-3 text-[15px]">
        Showing plantation schedule and expected production for <b>{cropsLabel}</b>, matched with forecasted demand
      </p>

      {/* Long-term weather bars (pass arrays so tooltips & clicks map 1:1) */}
      {ui.indicators.weather && (
        <WeatherPanel
          className="mb-4"
          weeks={weeks}
          temps={temps}
          rain={rain}
          locationLabel={ui.locationLabel}
          onClose={() => ui.toggleIndicator("weather", false)}
          onPickShortTermWeek={({ week, tempC, rainMm }) => pickShort(week, { tempC, rainMm })}
        />
      )}

      {/* Short-term details (only for current/next week, with exact numbers) */}
      {showShortTerm && (
        <ShortTermWeatherPanel
          week={ui.selectedWeatherWeek!}
          locationLabel={ui.locationLabel}
          onClose={() => { ui.setSelectedWeatherWeek(null); setShortData(null); }}
          tempC={shortData!.tempC}
          rainMm={shortData!.rainMm}
          humidity={shortData!.humidity}
          windKmh={shortData!.windKmh}
        />
      )}

      {/* Week scroller — selecting current/next also opens short-term with exact values */}
      <WeekScroller
        weekStart={ui.weekStart}
        window={ui.window}
        onChange={ui.setWeekStart}
        min={1}
        max={ISO_MAX_THIS_YEAR}
        wrap
        selectedWeek={ui.selectedWeatherWeek ?? undefined}
        onSelectWeek={(w) => pickShort(w)}            // derive exact numbers from temps/rain arrays
        selectableWeeks={selectableWeeks}
      />

      {/* ====== rest of your schedule grid (unchanged) ====== */}
      <TooltipProvider delayDuration={150}>
        {cropsToRender.map((cropName) => {
          const groups = ui.hideAllPlots ? [] : buildGroupsForCrop(ui.selectedPlots, cropName);
          const open = openMap[cropName] ?? true;

          const headerWeekTotals = weeks.map((w) => sum(groups.map((g) => cellFor(g.id, w).prod)));
          const cropHeaderTotal = sum(headerWeekTotals);

          return (
            <React.Fragment key={cropName}>
              <div className="mb-2" style={rowGridStyle()}>
                <div className="flex h-8 items-center gap-2">
                  <button type="button" onClick={() => toggleCrop(cropName)} aria-expanded={open} className="inline-flex h-6 w-6 items-center justify-center rounded-[6px] border text-[#02A78B] transition-transform">
                    <ChevronDown className={`size-4 transition-transform ${open ? "" : "-rotate-90"}`} />
                  </button>
                  <div className="flex items-center gap-2 text-[15px] font-semibold">
                    <Sprout className="size-4 text-[#02A78B]" />
                    {cropName}
                    <span className="ml-1 align-middle text-sm text-muted-foreground">(kg)</span>
                  </div>
                </div>

                <div style={weekColsStyle(weeks.length)}>
                  {headerWeekTotals.map((val, i) => (
                    <div key={`hdr-${cropName}-${i}`} className="flex h-8 items-center justify-center rounded-[6px] border bg-white text-[12px]">
                      {val}
                    </div>
                  ))}
                </div>

                <div className="flex h-8 items-center justify-center rounded-[6px] border bg-white text-sm font-semibold text-[#02A78B]">
                  {cropHeaderTotal}
                </div>
              </div>

              {open &&
                (ui.indicators.sort ? (["production", "demand", "loss"] as const).sort((a, b) => totalsByType[b] - totalsByType[a]) : (["production", "demand", "loss"] as const))
                  .map((type) => {
                    if (type === "production" && ui.indicators.production) {
                      return (
                        <React.Fragment key={`${cropName}-production`}>
                          {groups.map((g) => {
                            const rowTotal = sum(weeks.map((w) => cellFor(g.id, w).prod));
                            return (
                              <div key={g.id} className="mb-2" style={rowGridStyle()}>
                                <div className="px-2 text-[15px]">{g.label}</div>
                                <div style={weekColsStyle(weeks.length)}>
                                  {weeks.map((w) => {
                                    const c = cellFor(g.id, w);
                                    const onDark = c.stage === "harvest";
                                    const iconsToShow = ui.hideAllTasks ? [] : ui.selectedTasks.length === 0 ? c.tasks : c.tasks.filter((t) => ui.selectedTasks.includes(t));
                                    const { label, Icon } = stageMeta(c.stage);
                                    const Cell = (
                                      <div className="flex h-8 items-center justify-center rounded-[6px] border" style={{ background: stageColor(c.stage), color: onDark ? "white" : "inherit" }}>
                                        {iconsToShow.slice(0, 3).map((tk, i) => {
                                          const TIcon = taskIcon[tk];
                                          return <TIcon key={`${tk}-${i}`} className="mx-0.5 size-4 opacity-90" />;
                                        })}
                                      </div>
                                    );
                                    return (
                                      <Tooltip key={`${g.id}-${w}`}>
                                        <TooltipTrigger asChild>{Cell}</TooltipTrigger>
                                        <TooltipContent side="top" sideOffset={6} className="flex items-center gap-2">
                                          <Icon className="size-4" />
                                          <span className="text-xs">{label}</span>
                                        </TooltipContent>
                                      </Tooltip>
                                    );
                                  })}
                                </div>
                                <div className="flex h-8 items-center justify-center rounded-[6px] border bg-white text-sm font-semibold text-[#02A78B]">
                                  {rowTotal}
                                </div>
                              </div>
                            );
                          })}
                        </React.Fragment>
                      );
                    }

                    if (type === "demand" && ui.indicators.demand) {
                      const total = sum(weeks.map(demandForWeek));
                      return (
                        <div key={`${cropName}-demand`} className="mb-2" style={rowGridStyle()}>
                          <div className="px-2 text-[15px]">Demand (kg)*</div>
                          <div style={weekColsStyle(weeks.length)}>
                            {weeks.map((w) => (
                              <div key={`dem-${cropName}-${w}`} className="flex h-8 items-center justify-center rounded-[6px] border bg-white text-[12px]">
                                {demandForWeek(w)}
                              </div>
                            ))}
                          </div>
                          <div className="flex h-8 items-center justify-center rounded-[6px] border bg-white text-sm font-semibold text-[#02A78B]">
                            {total}
                          </div>
                        </div>
                      );
                    }

                    if (type === "loss" && ui.indicators.loss) {
                      const total = sum(weeks.map(lossForWeek));
                      return (
                        <div key={`${cropName}-loss`} className="mb-2" style={rowGridStyle()}>
                          <div className="px-2 text-[15px]">Potential Loss (kg)*</div>
                          <div style={weekColsStyle(weeks.length)}>
                            {weeks.map((w) => (
                              <div key={`loss-${cropName}-${w}`} className="flex h-8 items-center justify-center rounded-[6px] border bg-white text-[12px]">
                                {lossForWeek(w)}
                              </div>
                            ))}
                          </div>
                          <div className="flex h-8 items-center justify-center rounded-[6px] border bg-white text-sm font-semibold text-[#02A78B]">
                            {total}
                          </div>
                        </div>
                      );
                    }

                    return null;
                  })}
            </React.Fragment>
          );
        })}
      </TooltipProvider>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-4 text-[12px]">
        <span className="inline-flex items-center gap-2"><span className="inline-block h-3 w-5 rounded" style={{ background: "#bfe9cf" }} />Seedling</span>
        <span className="inline-flex items-center gap-2"><span className="inline-block h-3 w-5 rounded" style={{ background: "#37a16b" }} />Growing</span>
        <span className="inline-flex items-center gap-2"><span className="inline-block h-3 w-5 rounded" style={{ background: "#f6cf3c" }} />Ripening</span>
        <span className="inline-flex items-center gap-2"><span className="inline-block h-3 w-5 rounded" style={{ background: "#0a6a3f" }} />Harvest</span>
        <span className="ml-6 opacity-70">* = estimated values based on predictive models.</span>
      </div>
    </section>
  );
}
