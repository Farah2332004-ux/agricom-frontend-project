"use client";

import * as React from "react";
import WeekScroller from "../common/WeekScroller";
import { visibleWeeks } from "../common/weeks";
import {
  ChevronDown,
  FileText,
  CheckCircle2,
  Clipboard,
  Zap,
  FileClock,
  Boxes,
  CircleDollarSign,
  Megaphone,
  User,
  Sprout,
} from "lucide-react";
import { useSalesUI } from "../../sales/ui";

const BORDER = "#E0F0ED";
const BRAND  = "#02A78B";

/* ---------------- Column system (same as Production) ---------------- */
const LABEL_PX = 180;
const TOTAL_PX = 100;
const CELL_MIN_PX = 34;
const GAP_REM = 0.375;
const LEFT_OFFSET  = "calc(2.25rem + 0.375rem - 0.5rem)";
const RIGHT_OFFSET = "calc(2.25rem + 0.375rem)";

function rowGridStyle(): React.CSSProperties {
  return {
    display: "grid",
    gridTemplateColumns: `${LABEL_PX}px minmax(0,1fr) ${TOTAL_PX}px`,
    columnGap: `${GAP_REM}rem`,
    alignItems: "center",
  };
}
function weekColsStyle(count: number): React.CSSProperties {
  return {
    display: "grid",
    gridTemplateColumns: `repeat(${count}, minmax(${CELL_MIN_PX}px, 1fr))`,
    gap: `${GAP_REM}rem`,
    minWidth: 0,
    marginLeft: LEFT_OFFSET,
    marginRight: RIGHT_OFFSET,
  };
}

/* ---------------- Helpers: seeded RNG + demo values ---------------- */
function rng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507)), (h >>> 0) / 2 ** 32);
}
const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

type OrderType = "confirmed" | "potential" | "expected";
type Metric = "quantity" | "revenue" | "promo" | "channel";

function valueFor(crop: string, orderType: OrderType, metric: Metric, week: number) {
  const r = rng(`${crop}:${orderType}:${metric}:${week}`)();
  if (metric === "quantity") {
    const base = orderType === "confirmed" ? 22 : orderType === "expected" ? 17 : 14;
    return Math.round(base + r * 12);           // kg
  }
  if (metric === "revenue") {
    const q = valueFor(crop, orderType, "quantity", week);
    const price = 1.8 + r * 2.2;
    return Math.round(q * price);               // $
  }
  if (metric === "promo") {
    const base = orderType === "confirmed" ? 0.18 : orderType === "expected" ? 0.24 : 0.30;
    return Math.round((base + r * 0.2) * 100);  // %
  }
  const base = orderType === "confirmed" ? 0.35 : orderType === "expected" ? 0.45 : 0.55;
  return Math.round((base + r * 0.25) * 100);   // %
}

/* screenshot-style icons */
const ConfirmedIcon: React.FC<{ className?: string }> = ({ className }) => (
  <span className="relative inline-flex">
    <FileText className={className} />
    <CheckCircle2 className="absolute -right-0.5 -bottom-0.5 h-3.5 w-3.5" style={{ color: BRAND }} />
  </span>
);
const PotentialIcon: React.FC<{ className?: string }> = ({ className }) => (
  <span className="relative inline-flex">
    <Clipboard className={className} />
    <Zap className="absolute -right-0.5 -bottom-0.5 h-3.5 w-3.5 text-emerald-600" />
  </span>
);

/* small cells */
function HeaderCell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-8 items-center justify-center rounded-[6px] border bg-white text-[12px]" style={{ borderColor: BORDER }}>
      {children}
    </div>
  );
}
function ValueCell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-8 items-center justify-center rounded-[6px] border bg-white text-[12px]" style={{ borderColor: BORDER }}>
      {children}
    </div>
  );
}

function SectionHeading({
  open, onToggle, Icon, label,
}: { open: boolean; onToggle: () => void; Icon: React.ElementType; label: string }) {
  return (
    <div className="flex h-8 items-center gap-2">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="inline-flex h-6 w-6 items-center justify-center rounded-[6px] border text-[var(--brand,#02A78B)] transition-transform"
        style={{ borderColor: BORDER }}
      >
        <ChevronDown className={`size-4 transition-transform ${open ? "" : "-rotate-90"}`} />
      </button>
      <div className="flex items-center gap-2 text-[15px] font-semibold">
        <Icon className="size-4" style={{ color: BRAND }} />
        {label}
      </div>
    </div>
  );
}

function IndicatorRow({
  label, icon: Icon, unit, getVal, weeks,
}: {
  label: string;
  icon: React.ElementType;
  unit?: "kg" | "$" | "%";
  getVal: (w: number) => number;
  weeks: number[];
}) {
  const values = weeks.map(getVal);
  const summary =
    unit === "%" ? Math.round(sum(values) / Math.max(1, values.length)) : sum(values);

  return (
    <div className="mb-2" style={rowGridStyle()}>
      <div className="flex items-center gap-2 px-2 text-[15px]">
        <Icon className="size-4" style={{ color: BRAND }} />
        {label}
      </div>
      <div style={weekColsStyle(weeks.length)}>
        {weeks.map((w, i) => (
          <ValueCell key={`${label}-${w}`}>{values[i]}{unit ?? ""}</ValueCell>
        ))}
      </div>
      <div
        className="flex h-8 items-center justify-center rounded-[6px] border bg-white text-sm font-semibold"
        style={{ borderColor: BORDER, color: BRAND }}
      >
        {summary}{unit ?? ""}
      </div>
    </div>
  );
}

export default function SalesSchedule() {
  const ui = useSalesUI();

  // show only on Crops tab
  if (ui.tab !== "crops") {
    return (
      <section className="mt-6 rounded-2xl border border-[#E0F0ED] bg-white p-6 text-sm text-muted-foreground">
        Clients view — coming next.
      </section>
    );
  }

  const weeks = visibleWeeks(ui.weekStart, ui.window, 1, 52, true);
  const crops = ui.selectedCrops?.length ? ui.selectedCrops : [ui.crop ?? "Broccoli"];

  // expand/collapse per crop per order-type
  const [openMap, setOpenMap] = React.useState<Record<string, { confirmed: boolean; potential: boolean; expected: boolean }>>({});
  const toggle = (crop: string, key: "confirmed" | "potential" | "expected") =>
    setOpenMap((m) => ({
      ...m,
      [crop]: { confirmed: true, potential: true, expected: true, ...m[crop], [key]: !(m[crop]?.[key] ?? true) },
    }));

  return (
    <section className="mt-6">
      <WeekScroller weekStart={ui.weekStart} window={ui.window} onChange={ui.setWeekStart} min={1} max={52} wrap />

      {crops.map((crop) => {
        const headerTotals = weeks.map((w) => valueFor(crop, "confirmed", "quantity", w));
        const headerTotal  = sum(headerTotals);
        const openState    = openMap[crop] ?? { confirmed: true, potential: true, expected: true };

        return (
          <React.Fragment key={crop}>
            {/* Crop header row */}
            <div className="mb-2 mt-6" style={rowGridStyle()}>
              <div className="flex h-8 items-center gap-2">
                <div className="inline-flex h-6 w-6 items-center justify-center rounded-[6px] border opacity-0" style={{ borderColor: BORDER }}>
                  <ChevronDown className="size-4" />
                </div>
                <div className="flex items-center gap-2 text-[15px] font-semibold">
                  <Sprout className="size-4" style={{ color: BRAND }} />
                  {crop}
                  <span className="ml-1 align-middle text-sm text-muted-foreground">(sales)</span>
                </div>
              </div>

              <div style={weekColsStyle(weeks.length)}>
                {headerTotals.map((v, i) => <HeaderCell key={`${crop}-hdr-${i}`}>{v}</HeaderCell>)}
              </div>

              <div className="flex h-8 items-center justify-center rounded-[6px] border bg-white text-sm font-semibold" style={{ borderColor: BORDER, color: BRAND }}>
                {headerTotal}
              </div>
            </div>

            {/* Confirmed */}
            {ui.showConfirmed && (
              <>
                <div className="mt-3" style={rowGridStyle()}>
                  <SectionHeading open={openState.confirmed} onToggle={() => toggle(crop, "confirmed")} Icon={ConfirmedIcon} label="Confirmed Orders" />
                  <div />
                  <div />
                </div>
                {openState.confirmed && (
                  <>
                    {ui.showQuantity && <IndicatorRow label="Quantity" icon={Boxes} unit="kg" getVal={(w) => valueFor(crop, "confirmed", "quantity", w)} weeks={weeks} />}
                    {ui.showRevenue  && <IndicatorRow label="Revenue"  icon={CircleDollarSign} unit="$" getVal={(w) => valueFor(crop, "confirmed", "revenue",  w)} weeks={weeks} />}
                    {ui.showPromoLinked && <IndicatorRow label="Promotion (linked)" icon={Megaphone} unit="%" getVal={(w) => valueFor(crop, "confirmed", "promo", w)} weeks={weeks} />}
                    {ui.showChannelMix && <IndicatorRow label="Channel Mix (online)" icon={User} unit="%" getVal={(w) => valueFor(crop, "confirmed", "channel", w)} weeks={weeks} />}
                  </>
                )}
              </>
            )}

            {/* Potential */}
            {ui.showPotential && (
              <>
                <div className="mt-3" style={rowGridStyle()}>
                  <SectionHeading open={openState.potential} onToggle={() => toggle(crop, "potential")} Icon={PotentialIcon} label="Potential Orders" />
                  <div />
                  <div />
                </div>
                {openState.potential && (
                  <>
                    {ui.showQuantity && <IndicatorRow label="Quantity" icon={Boxes} unit="kg" getVal={(w) => valueFor(crop, "potential", "quantity", w)} weeks={weeks} />}
                    {ui.showRevenue  && <IndicatorRow label="Revenue"  icon={CircleDollarSign} unit="$" getVal={(w) => valueFor(crop, "potential", "revenue",  w)} weeks={weeks} />}
                    {ui.showPromoLinked && <IndicatorRow label="Promotion (linked)" icon={Megaphone} unit="%" getVal={(w) => valueFor(crop, "potential", "promo", w)} weeks={weeks} />}
                    {ui.showChannelMix && <IndicatorRow label="Channel Mix (online)" icon={User} unit="%" getVal={(w) => valueFor(crop, "potential", "channel", w)} weeks={weeks} />}
                  </>
                )}
              </>
            )}

            {/* Expected */}
            {ui.showExpected && (
              <>
                <div className="mt-3" style={rowGridStyle()}>
                  <SectionHeading open={openState.expected} onToggle={() => toggle(crop, "expected")} Icon={FileClock} label="Expected Orders" />
                  <div />
                  <div />
                </div>
                {openState.expected && (
                  <>
                    {ui.showQuantity && <IndicatorRow label="Quantity" icon={Boxes} unit="kg" getVal={(w) => valueFor(crop, "expected", "quantity", w)} weeks={weeks} />}
                    {ui.showRevenue  && <IndicatorRow label="Revenue"  icon={CircleDollarSign} unit="$" getVal={(w) => valueFor(crop, "expected", "revenue",  w)} weeks={weeks} />}
                    {ui.showPromoLinked && <IndicatorRow label="Promotion (linked)" icon={Megaphone} unit="%" getVal={(w) => valueFor(crop, "expected", "promo", w)} weeks={weeks} />}
                    {ui.showChannelMix && <IndicatorRow label="Channel Mix (online)" icon={User} unit="%" getVal={(w) => valueFor(crop, "expected", "channel", w)} weeks={weeks} />}
                  </>
                )}
              </>
            )}
          </React.Fragment>
        );
      })}
    </section>
  );
}
