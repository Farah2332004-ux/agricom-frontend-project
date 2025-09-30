"use client";

import * as React from "react";
import WeekScroller from "../common/WeekScroller";
import { visibleWeeks } from "../common/weeks";
import {
  ChevronDown,
  // big headers
  Sprout as Plant,
  Users,
  // order sections
  ListChecks,
  Clipboard,
  FileClock,
  // metrics/icons
  Boxes,
  CircleDollarSign,
  Megaphone,
  Layers, // generic "mix" pictogram
  // order types
  ShoppingBasket,  // standing
  Receipt,         // online (icon-style)
  Mail,            // email
  Landmark,        // institution
  Package,         // pack
  BookOpen,        // recipe
  Box,             // box-based
  // client/channel icons
  Store, Smartphone, Home, Utensils, Factory, Building,
} from "lucide-react";
import { useSalesUI } from "../../sales/ui";

/* ---------------- Theme & grid ---------------- */
const BORDER = "#E0F0ED";
const BRAND  = "#02A78B";

const LABEL_PX    = 180;
const TOTAL_PX    = 100;
const CELL_MIN_PX = 34;
const GAP_REM     = 0.375;
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

/* ---------------- RNG + demo values ---------------- */
function rng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ i ^ seed.charCodeAt(i), 16777619);
  return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507)), (h >>> 0) / 2 ** 32);
}
const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

type OrderType = "confirmed" | "potential" | "expected";
type Metric = "quantity" | "revenue";

/** synthetic numbers */
function valueFor(key: string, orderType: OrderType, metric: Metric, week: number) {
  const r = rng(`${key}:${orderType}:${metric}:${week}`)();
  if (metric === "quantity") {
    const base = orderType === "confirmed" ? 22 : orderType === "expected" ? 17 : 14;
    return Math.round(base + r * 12);
  }
  const q = valueFor(key, orderType, "quantity", week);
  const price = 1.8 + r * 2.2;
  return Math.round(q * price);
}

/* ---------------- Catalogs & helpers ---------------- */
type CatItem = { key: string; label: string; Icon: React.ElementType };

// Order types (keys match OrdersDropdown values)
const ORDER_TYPES: CatItem[] = [
  { key: "standing",    label: "Standing",     Icon: ShoppingBasket },
  { key: "online",      label: "Online shop",  Icon: Receipt },
  { key: "email",       label: "Email Ads",    Icon: Mail },
  { key: "institution", label: "Institutional",Icon: Landmark },
  { key: "pack",        label: "Pack station", Icon: Package },
  { key: "recipe",      label: "Recipe Packs", Icon: BookOpen },
  { key: "box",         label: "Box-Based",    Icon: Box },
];

// Promotions (keys match PromotionsDropdown values)
const PROMO_TYPES: CatItem[] = [
  { key: "discount",  label: "Discount",      Icon: Megaphone },
  { key: "bundle",    label: "Bundle",        Icon: Box },
  { key: "free",      label: "Free Delivery", Icon: Megaphone },
  { key: "flash",     label: "Flash Offer",   Icon: Megaphone },
  { key: "reward",    label: "Reward",        Icon: Megaphone },
  { key: "referral",  label: "Pack Referral", Icon: Megaphone },
];

// Channels for Channel Mix
const CHANNELS: CatItem[] = [
  { key: "retailer",    label: "Retailer",      Icon: Store },
  { key: "online",      label: "Online Shop",   Icon: Smartphone },
  { key: "warehouse",   label: "Warehouse",     Icon: Home },
  { key: "horcea",      label: "HORCEA",        Icon: Utensils },
  { key: "institution", label: "Institution",   Icon: Landmark },
  { key: "processor",   label: "Processor",     Icon: Factory },
  { key: "association", label: "Association",   Icon: Users },
  { key: "public",      label: "Public Sector", Icon: Building },
];

// Crops for Crop Mix (Clients tab)
const CROPS: CatItem[] = [
  { key:"broccoli", label:"Broccoli", Icon: Plant },
  { key:"tomato",   label:"Tomato",   Icon: Plant },
  { key:"potato",   label:"Potato",   Icon: Plant },
  { key:"cabbage",  label:"Cabbage",  Icon: Plant },
  { key:"onion",    label:"Onion",    Icon: Plant },
  { key:"spinach",  label:"Spinach",  Icon: Plant },
];

/* pick 1..3 items with % split (stable) */
function pickDistribution(seed: string, catalog: CatItem[], minItems=1, maxItems=3) {
  const r = rng(seed);
  const count = Math.max(minItems, Math.min(maxItems, 1 + Math.floor(r() * maxItems)));
  const pool = [...catalog];
  const chosen: CatItem[] = [];
  for (let i=0;i<count && pool.length;i++){
    const idx = Math.floor(r()*pool.length);
    chosen.push(pool.splice(idx,1)[0]);
  }
  const weights = chosen.map(()=> 1 + r());
  const total = sum(weights);
  const pctRounded = chosen.map((_,i)=>{
    const pct = (weights[i]/total)*100;
    return i === chosen.length-1
      ? Math.max(0, 100 - sum(weights.slice(0,-1).map(w => Math.round((w/total)*100))))
      : Math.round(pct);
  });
  return chosen.map((c,i)=>({ key:c.key, label:c.label, Icon:c.Icon, pct: pctRounded[i] }));
}
const dominant = <T extends {pct:number}>(dist: T[]) =>
  dist.slice().sort((a,b)=>b.pct-a.pct)[0];

/* -------------- UI atoms -------------- */
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
        className="inline-flex h-6 w-6 items-center justify-center rounded-[6px] border transition-transform"
        style={{ borderColor: BORDER, color: BRAND }}
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
function SubRowLabel({
  Icon, children, unitLabel,
}: { Icon: React.ElementType; children: React.ReactNode; unitLabel?: string }) {
  return (
    <div className="flex items-center gap-2 px-2 text-[15px]">
      <span className="inline-flex h-6 w-6 shrink-0" />
      <Icon className="size-4" style={{ color: BRAND }} />
      <span>{children}</span>
      {unitLabel ? <span className="ml-1 text-sm text-muted-foreground">{unitLabel}</span> : null}
    </div>
  );
}

/* ---------- Hover popup card (no arrow), restored ---------- */
function DistPopupCard({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; pct: number; Icon: React.ElementType }>;
}) {
  return (
    <div
      className="w-56 rounded-xl border bg-white p-3 text-[12px] shadow-lg"
      style={{ borderColor: BORDER }}
    >
      <div className="mb-2 text-[12px] font-semibold text-gray-900">{title}</div>
      <div className="space-y-2">
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full" style={{ background:"#E8F7F3" }}>
              <it.Icon className="h-3.5 w-3.5" style={{ color: BRAND }} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-gray-800">{it.label}</span>
                <span className="tabular-nums text-gray-800">{it.pct}%</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded bg-[#F1F5F4]">
                <div className="h-full rounded" style={{ width: `${it.pct}%`, background: BRAND }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Icon-only cell with popup on hover */
function MixCell({
  dist,
  mixIcon: MixIcon,
  show,
  title,
}: {
  dist: Array<{ key:string; label:string; pct:number; Icon: React.ElementType }>;
  mixIcon: React.ElementType;
  show: boolean;
  title: string;
}) {
  if (!show) {
    return (
      <div
        className="flex h-8 items-center justify-center rounded-[6px] border bg-white"
        style={{ borderColor: BORDER }}
      />
    );
  }
  const isMix = dist.length > 1;
  const dom = dominant(dist);
  const Icon = isMix ? MixIcon : dom.Icon;

  return (
    <div className="relative group">
      <div
        className="flex h-8 items-center justify-center rounded-[6px] border bg-white"
        style={{ borderColor: BORDER }}
      >
        <Icon className="h-4 w-4" style={{ color: BRAND }} />
      </div>

      {/* Popup (no arrow) */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 z-50 -translate-x-1/2 -translate-y-[calc(100%+8px)]
                   opacity-0 group-hover:opacity-100 group-hover:visible invisible transition-opacity duration-100"
      >
        <DistPopupCard title={title} items={dist} />
      </div>
    </div>
  );
}

function NumericRow({
  label, icon: Icon, unitLabel, weeks, getVal, showCell,
}: {
  label: string;
  icon: React.ElementType;
  unitLabel: string;
  weeks: number[];
  getVal: (w: number) => number;
  showCell: (w: number) => boolean;
}) {
  const vals = weeks.map((w) => (showCell(w) ? getVal(w) : null));
  const total = vals.reduce((acc, v) => acc + (v ?? 0), 0);

  return (
    <div className="mb-2" style={rowGridStyle()}>
      <SubRowLabel Icon={Icon} unitLabel={unitLabel}>{label}</SubRowLabel>
      <div style={weekColsStyle(weeks.length)}>
        {weeks.map((w, i) => (
          <ValueCell key={`${label}-${w}`}>{vals[i] ?? ""}</ValueCell>
        ))}
      </div>
      <div className="flex h-8 items-center justify-center rounded-[6px] border bg-white text-sm font-semibold" style={{ borderColor: BORDER, color: BRAND }}>
        {total}
      </div>
    </div>
  );
}

function MixRow({
  rowIcon: RowIcon,
  label,
  catalog,
  seedOf,
  weeks,
  mixIcon: MixIcon,
  showCell,
  titleForPopup,
}: {
  rowIcon: React.ElementType;
  label: string;
  catalog: CatItem[];
  seedOf: (w: number) => string;
  weeks: number[];
  mixIcon: React.ElementType;
  showCell: (w: number) => boolean;
  titleForPopup: string;
}) {
  return (
    <div className="mb-2" style={rowGridStyle()}>
      <SubRowLabel Icon={RowIcon}>{label}</SubRowLabel>
      <div style={weekColsStyle(weeks.length)}>
        {weeks.map((w) => {
          const dist = pickDistribution(seedOf(w), catalog, 1, 3);
          return (
            <MixCell
              key={`${label}-${w}`}
              dist={dist}
              mixIcon={MixIcon}
              show={showCell(w)}
              title={titleForPopup}
            />
          );
        })}
      </div>
      <div className="flex h-8 items-center justify-center rounded-[6px] border bg-white text-sm font-semibold" style={{ borderColor: BORDER, color: BRAND }}>
        —
      </div>
    </div>
  );
}

/* build client groups from flat selection */
type ClientGroup = { key: string; label: string };

function buildClientGroups(selectedFlat: string[]): ClientGroup[] {
  // Partition into channel / segment / persona by known keys
  const CHANNEL_KEYS = new Set(CHANNELS.map(x => x.key));
  const SEGMENT_KEYS = new Set(["vip","family","student","business"]);
  const PERSONA_KEYS = new Set(["bulk","chef","procurement","health"]);

  const selCh = selectedFlat.filter(k => CHANNEL_KEYS.has(k));
  const selSe = selectedFlat.filter(k => SEGMENT_KEYS.has(k));
  const selPe = selectedFlat.filter(k => PERSONA_KEYS.has(k));

  const anySelected = selCh.length + selSe.length + selPe.length > 0;
  if (!anySelected) return [{ key: "all", label: "All Clients" }];

  const channels = selCh.length ? selCh : [null];
  const segments = selSe.length ? selSe : [null];
  const personas = selPe.length ? selPe : [null];

  // label helpers
  const labelOf = (k: string | null): string | null => {
    if (!k) return null;
    const item =
      CHANNELS.find(c => c.key === k)
      || SEGMENTS.find(s => s.key === k)
      || undefined;
    if (item) return item.label;
    const p = { bulk:"Bulk Buyer", chef:"Chef/Caterer", procurement:"Procurement", health:"Health-Conscious" } as Record<string,string>;
    return p[k] ?? null;
  };

  const groups: ClientGroup[] = [];
  for (const c of channels) {
    for (const s of segments) {
      for (const p of personas) {
        const parts = [labelOf(c), labelOf(s), labelOf(p)].filter(Boolean) as string[];
        if (!parts.length) continue;
        const label = parts.join(", ");
        groups.push({ key: label.toLowerCase().replace(/\s+/g, "-"), label });
      }
    }
  }
  // de-dup
  const seen = new Set<string>();
  return groups.filter(g => (seen.has(g.key) ? false : (seen.add(g.key), true)));
}

/* ---------------- Component ---------------- */
export default function SalesSchedule() {
  const ui = useSalesUI();

  const tab = ui.tab ?? "crops";
  const weeks = visibleWeeks(ui.weekStart, ui.window, 1, 52, true);

  // expand/collapse per big group (crop or client)
  const [openMap, setOpenMap] = React.useState<Record<string, boolean>>({});
  const toggleOpen = (k: string) => setOpenMap(m => ({ ...m, [k]: !(m[k] ?? true) }));

  // common filters
  const ordersFilter = (ui.ordersFilter ?? []) as string[];
  const promotionsFilter = (ui.promotionsFilter ?? []) as string[];

  const gateByFilters = ({
    week, groupKey, orderType,
  }: { week: number; groupKey: string; orderType: OrderType }) => {
    // If no filters applied -> always show
    if (!ordersFilter.length && !promotionsFilter.length) return true;
    const od = pickDistribution(`${groupKey}:${orderType}:orders:${week}`, ORDER_TYPES);
    const pd = pickDistribution(`${groupKey}:${orderType}:promos:${week}`, PROMO_TYPES);
    const hasOrder = !ordersFilter.length || od.some(o => ordersFilter.includes(o.key));
    const hasPromo = !promotionsFilter.length || pd.some(p => promotionsFilter.includes(p.key));
    return hasOrder && hasPromo;
  };

  /* ---------- CROPS TAB ---------- */
  if (tab === "crops") {
    const cropsToRender = (ui.selectedCrops?.length ? ui.selectedCrops : [ui.crop ?? "Broccoli"]) as string[];

    return (
      <section className="mt-6">
        <WeekScroller
          weekStart={ui.weekStart}
          window={ui.window}
          onChange={ui.setWeekStart}
          min={1}
          max={52}
          wrap
        />

        {cropsToRender.map((cropName) => {
          const groupKey = cropName.toLowerCase();
          const open = openMap[groupKey] ?? true;
          const headerTotals = weeks.map((w) => valueFor(groupKey, "confirmed", "quantity", w));
          const headerTotal = sum(headerTotals);

          return (
            <React.Fragment key={groupKey}>
              {/* crop header */}
              <div className="mb-2 mt-6" style={rowGridStyle()}>
                <div className="flex h-8 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleOpen(groupKey)}
                    aria-expanded={open}
                    className="inline-flex h-6 w-6 items-center justify-center rounded-[6px] border"
                    style={{ borderColor: BORDER, color: BRAND }}
                  >
                    <ChevronDown className={`size-4 transition-transform ${open ? "" : "-rotate-90"}`} />
                  </button>
                  <div className="flex items-center gap-2 text-[15px] font-semibold">
                    <Plant className="size-4" style={{ color: BRAND }} />
                    {cropName}
                  </div>
                </div>

                <div style={weekColsStyle(weeks.length)}>
                  {headerTotals.map((val, i) => <HeaderCell key={`hdr-c-${i}`}>{val}</HeaderCell>)}
                </div>

                <div className="flex h-8 items-center justify-center rounded-[6px] border bg-white text-sm font-semibold" style={{ borderColor: BORDER, color: BRAND }}>
                  {headerTotal}
                </div>
              </div>

              {open && (
                <>
                  {/* Confirmed */}
                  {ui.showConfirmed && (
                    <>
                      <div className="mt-3" style={rowGridStyle()}>
                        <SectionHeading open={true} onToggle={()=>{}} Icon={ListChecks} label="Confirmed Orders" />
                        <div />
                        <div />
                      </div>

                      <MixRow
                        rowIcon={BookOpen}
                        label="Order Type"
                        catalog={ORDER_TYPES}
                        seedOf={(w)=> `${groupKey}:confirmed:orders:${w}`}
                        weeks={weeks}
                        mixIcon={Layers}
                        showCell={(w)=> gateByFilters({ week:w, groupKey, orderType:"confirmed" })}
                        titleForPopup="Order Type mix"
                      />

                      {ui.showQuantity && (
                        <NumericRow
                          label="Quantity"
                          icon={Boxes}
                          unitLabel="(kg)"
                          weeks={weeks}
                          getVal={(w)=> valueFor(groupKey, "confirmed", "quantity", w)}
                          showCell={(w)=> gateByFilters({ week:w, groupKey, orderType:"confirmed" })}
                        />
                      )}

                      {ui.showRevenue && (
                        <NumericRow
                          label="Revenue"
                          icon={CircleDollarSign}
                          unitLabel="($)"
                          weeks={weeks}
                          getVal={(w)=> valueFor(groupKey, "confirmed", "revenue", w)}
                          showCell={(w)=> gateByFilters({ week:w, groupKey, orderType:"confirmed" })}
                        />
                      )}

                      {ui.showPromoLinked && (
                        <MixRow
                          rowIcon={Megaphone}
                          label="Promotion"
                          catalog={PROMO_TYPES}
                          seedOf={(w)=> `${groupKey}:confirmed:promos:${w}`}
                          weeks={weeks}
                          mixIcon={Megaphone}
                          showCell={(w)=> gateByFilters({ week:w, groupKey, orderType:"confirmed" })}
                          titleForPopup="Promotion mix"
                        />
                      )}

                      {ui.showChannelMix && (
                        <MixRow
                          rowIcon={Users}
                          label="Channel Mix"
                          catalog={CHANNELS}
                          seedOf={(w)=> `${groupKey}:confirmed:channels:${w}`}
                          weeks={weeks}
                          mixIcon={Users}
                          showCell={()=> true}
                          titleForPopup="Channel mix"
                        />
                      )}
                    </>
                  )}

                  {/* Potential */}
                  {ui.showPotential && (
                    <>
                      <div className="mt-3" style={rowGridStyle()}>
                        <SectionHeading open={true} onToggle={()=>{}} Icon={Clipboard} label="Potential Orders" />
                        <div />
                        <div />
                      </div>

                      <MixRow
                        rowIcon={BookOpen}
                        label="Order Type"
                        catalog={ORDER_TYPES}
                        seedOf={(w)=> `${groupKey}:potential:orders:${w}`}
                        weeks={weeks}
                        mixIcon={Layers}
                        showCell={(w)=> gateByFilters({ week:w, groupKey, orderType:"potential" })}
                        titleForPopup="Order Type mix"
                      />
                      {ui.showQuantity && (
                        <NumericRow
                          label="Quantity"
                          icon={Boxes}
                          unitLabel="(kg)"
                          weeks={weeks}
                          getVal={(w)=> valueFor(groupKey, "potential", "quantity", w)}
                          showCell={(w)=> gateByFilters({ week:w, groupKey, orderType:"potential" })}
                        />
                      )}
                      {ui.showRevenue && (
                        <NumericRow
                          label="Revenue"
                          icon={CircleDollarSign}
                          unitLabel="($)"
                          weeks={weeks}
                          getVal={(w)=> valueFor(groupKey, "potential", "revenue", w)}
                          showCell={(w)=> gateByFilters({ week:w, groupKey, orderType:"potential" })}
                        />
                      )}
                      {ui.showPromoLinked && (
                        <MixRow
                          rowIcon={Megaphone}
                          label="Promotion"
                          catalog={PROMO_TYPES}
                          seedOf={(w)=> `${groupKey}:potential:promos:${w}`}
                          weeks={weeks}
                          mixIcon={Megaphone}
                          showCell={(w)=> gateByFilters({ week:w, groupKey, orderType:"potential" })}
                          titleForPopup="Promotion mix"
                        />
                      )}
                      {ui.showChannelMix && (
                        <MixRow
                          rowIcon={Users}
                          label="Channel Mix"
                          catalog={CHANNELS}
                          seedOf={(w)=> `${groupKey}:potential:channels:${w}`}
                          weeks={weeks}
                          mixIcon={Users}
                          showCell={()=> true}
                          titleForPopup="Channel mix"
                        />
                      )}
                    </>
                  )}

                  {/* Expected */}
                  {ui.showExpected && (
                    <>
                      <div className="mt-3" style={rowGridStyle()}>
                        <SectionHeading open={true} onToggle={()=>{}} Icon={FileClock} label="Expected Orders" />
                        <div />
                        <div />
                      </div>

                      <MixRow
                        rowIcon={BookOpen}
                        label="Order Type"
                        catalog={ORDER_TYPES}
                        seedOf={(w)=> `${groupKey}:expected:orders:${w}`}
                        weeks={weeks}
                        mixIcon={Layers}
                        showCell={(w)=> gateByFilters({ week:w, groupKey, orderType:"expected" })}
                        titleForPopup="Order Type mix"
                      />
                      {ui.showQuantity && (
                        <NumericRow
                          label="Quantity"
                          icon={Boxes}
                          unitLabel="(kg)"
                          weeks={weeks}
                          getVal={(w)=> valueFor(groupKey, "expected", "quantity", w)}
                          showCell={(w)=> gateByFilters({ week:w, groupKey, orderType:"expected" })}
                        />
                      )}
                      {ui.showRevenue && (
                        <NumericRow
                          label="Revenue"
                          icon={CircleDollarSign}
                          unitLabel="($)"
                          weeks={weeks}
                          getVal={(w)=> valueFor(groupKey, "expected", "revenue", w)}
                          showCell={(w)=> gateByFilters({ week:w, groupKey, orderType:"expected" })}
                        />
                      )}
                      {ui.showPromoLinked && (
                        <MixRow
                          rowIcon={Megaphone}
                          label="Promotion"
                          catalog={PROMO_TYPES}
                          seedOf={(w)=> `${groupKey}:expected:promos:${w}`}
                          weeks={weeks}
                          mixIcon={Megaphone}
                          showCell={(w)=> gateByFilters({ week:w, groupKey, orderType:"expected" })}
                          titleForPopup="Promotion mix"
                        />
                      )}
                      {ui.showChannelMix && (
                        <MixRow
                          rowIcon={Users}
                          label="Channel Mix"
                          catalog={CHANNELS}
                          seedOf={(w)=> `${groupKey}:expected:channels:${w}`}
                          weeks={weeks}
                          mixIcon={Users}
                          showCell={()=> true}
                          titleForPopup="Channel mix"
                        />
                      )}
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

  /* ---------- CLIENTS TAB ---------- */
  const clientGroups = buildClientGroups(ui.clientsSelected ?? []);
  return (
    <section className="mt-6">
      <WeekScroller
        weekStart={ui.weekStart}
        window={ui.window}
        onChange={ui.setWeekStart}
        min={1}
        max={52}
        wrap
      />

      {clientGroups.map((cg) => {
        const groupKey = `client-${cg.key}`;
        const open = openMap[groupKey] ?? true;
        const headerTotals = weeks.map((w) => valueFor(groupKey, "confirmed", "quantity", w));
        const headerTotal = sum(headerTotals);

        const gate = (ot: OrderType) => (w: number) =>
          ((): boolean => {
            // same gating as crops, but reuse catalog seeds under client-key
            if (!(ui.ordersFilter?.length) && !(ui.promotionsFilter?.length)) return true;
            const od = pickDistribution(`${groupKey}:${ot}:orders:${w}`, ORDER_TYPES);
            const pd = pickDistribution(`${groupKey}:${ot}:promos:${w}`, PROMO_TYPES);
            const hasOrder = !(ui.ordersFilter?.length) || od.some(o => ui.ordersFilter!.includes(o.key as any));
            const hasPromo = !(ui.promotionsFilter?.length) || pd.some(p => ui.promotionsFilter!.includes(p.key as any));
            return hasOrder && hasPromo;
          })();

        return (
          <React.Fragment key={groupKey}>
            {/* client header */}
            <div className="mb-2 mt-6" style={rowGridStyle()}>
              <div className="flex h-8 items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleOpen(groupKey)}
                  aria-expanded={open}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-[6px] border"
                  style={{ borderColor: BORDER, color: BRAND }}
                >
                  <ChevronDown className={`size-4 transition-transform ${open ? "" : "-rotate-90"}`} />
                </button>
                <div className="flex items-center gap-2 text-[15px] font-semibold">
                  <Users className="size-4" style={{ color: BRAND }} />
                  {cg.label}
                </div>
              </div>

              <div style={weekColsStyle(weeks.length)}>
                {headerTotals.map((val, i) => <HeaderCell key={`hdr-g-${i}`}>{val}</HeaderCell>)}
              </div>

              <div className="flex h-8 items-center justify-center rounded-[6px] border bg-white text-sm font-semibold" style={{ borderColor: BORDER, color: BRAND }}>
                {headerTotal}
              </div>
            </div>

            {open && (
              <>
                {/* Confirmed */}
                {ui.showConfirmed && (
                  <>
                    <div className="mt-3" style={rowGridStyle()}>
                      <SectionHeading open={true} onToggle={()=>{}} Icon={ListChecks} label="Confirmed Orders" />
                      <div />
                      <div />
                    </div>

                    <MixRow
                      rowIcon={BookOpen}
                      label="Order Type"
                      catalog={ORDER_TYPES}
                      seedOf={(w)=> `${groupKey}:confirmed:orders:${w}`}
                      weeks={weeks}
                      mixIcon={Layers}
                      showCell={gate("confirmed")}
                      titleForPopup="Order Type mix"
                    />

                    {ui.showQuantity && (
                      <NumericRow
                        label="Quantity"
                        icon={Boxes}
                        unitLabel="(kg)"
                        weeks={weeks}
                        getVal={(w)=> valueFor(groupKey, "confirmed", "quantity", w)}
                        showCell={gate("confirmed")}
                      />
                    )}
                    {ui.showRevenue && (
                      <NumericRow
                        label="Revenue"
                        icon={CircleDollarSign}
                        unitLabel="($)"
                        weeks={weeks}
                        getVal={(w)=> valueFor(groupKey, "confirmed", "revenue", w)}
                        showCell={gate("confirmed")}
                      />
                    )}
                    {ui.showPromoLinked && (
                      <MixRow
                        rowIcon={Megaphone}
                        label="Promotion"
                        catalog={PROMO_TYPES}
                        seedOf={(w)=> `${groupKey}:confirmed:promos:${w}`}
                        weeks={weeks}
                        mixIcon={Megaphone}
                        showCell={gate("confirmed")}
                        titleForPopup="Promotion mix"
                      />
                    )}
                    {ui.showCropMix && (
                      <MixRow
                        rowIcon={Plant}
                        label="Crop Mix"
                        catalog={CROPS}
                        seedOf={(w)=> `${groupKey}:confirmed:crops:${w}`}
                        weeks={weeks}
                        mixIcon={Layers}
                        showCell={()=> true}
                        titleForPopup="Crop mix"
                      />
                    )}
                  </>
                )}

                {/* Potential */}
                {ui.showPotential && (
                  <>
                    <div className="mt-3" style={rowGridStyle()}>
                      <SectionHeading open={true} onToggle={()=>{}} Icon={Clipboard} label="Potential Orders" />
                      <div />
                      <div />
                    </div>

                    <MixRow
                      rowIcon={BookOpen}
                      label="Order Type"
                      catalog={ORDER_TYPES}
                      seedOf={(w)=> `${groupKey}:potential:orders:${w}`}
                      weeks={weeks}
                      mixIcon={Layers}
                      showCell={gate("potential")}
                      titleForPopup="Order Type mix"
                    />
                    {ui.showQuantity && (
                      <NumericRow
                        label="Quantity"
                        icon={Boxes}
                        unitLabel="(kg)"
                        weeks={weeks}
                        getVal={(w)=> valueFor(groupKey, "potential", "quantity", w)}
                        showCell={gate("potential")}
                      />
                    )}
                    {ui.showRevenue && (
                      <NumericRow
                        label="Revenue"
                        icon={CircleDollarSign}
                        unitLabel="($)"
                        weeks={weeks}
                        getVal={(w)=> valueFor(groupKey, "potential", "revenue", w)}
                        showCell={gate("potential")}
                      />
                    )}
                    {ui.showPromoLinked && (
                      <MixRow
                        rowIcon={Megaphone}
                        label="Promotion"
                        catalog={PROMO_TYPES}
                        seedOf={(w)=> `${groupKey}:potential:promos:${w}`}
                        weeks={weeks}
                        mixIcon={Megaphone}
                        showCell={gate("potential")}
                        titleForPopup="Promotion mix"
                      />
                    )}
                    {ui.showCropMix && (
                      <MixRow
                        rowIcon={Plant}
                        label="Crop Mix"
                        catalog={CROPS}
                        seedOf={(w)=> `${groupKey}:potential:crops:${w}`}
                        weeks={weeks}
                        mixIcon={Layers}
                        showCell={()=> true}
                        titleForPopup="Crop mix"
                      />
                    )}
                  </>
                )}

                {/* Expected */}
                {ui.showExpected && (
                  <>
                    <div className="mt-3" style={rowGridStyle()}>
                      <SectionHeading open={true} onToggle={()=>{}} Icon={FileClock} label="Expected Orders" />
                      <div />
                      <div />
                    </div>

                    <MixRow
                      rowIcon={BookOpen}
                      label="Order Type"
                      catalog={ORDER_TYPES}
                      seedOf={(w)=> `${groupKey}:expected:orders:${w}`}
                      weeks={weeks}
                      mixIcon={Layers}
                      showCell={gate("expected")}
                      titleForPopup="Order Type mix"
                    />
                    {ui.showQuantity && (
                      <NumericRow
                        label="Quantity"
                        icon={Boxes}
                        unitLabel="(kg)"
                        weeks={weeks}
                        getVal={(w)=> valueFor(groupKey, "expected", "quantity", w)}
                        showCell={gate("expected")}
                      />
                    )}
                    {ui.showRevenue && (
                      <NumericRow
                        label="Revenue"
                        icon={CircleDollarSign}
                        unitLabel="($)"
                        weeks={weeks}
                        getVal={(w)=> valueFor(groupKey, "expected", "revenue", w)}
                        showCell={gate("expected")}
                      />
                    )}
                    {ui.showPromoLinked && (
                      <MixRow
                        rowIcon={Megaphone}
                        label="Promotion"
                        catalog={PROMO_TYPES}
                        seedOf={(w)=> `${groupKey}:expected:promos:${w}`}
                        weeks={weeks}
                        mixIcon={Megaphone}
                        showCell={gate("expected")}
                        titleForPopup="Promotion mix"
                      />
                    )}
                    {ui.showCropMix && (
                      <MixRow
                        rowIcon={Plant}
                        label="Crop Mix"
                        catalog={CROPS}
                        seedOf={(w)=> `${groupKey}:expected:crops:${w}`}
                        weeks={weeks}
                        mixIcon={Layers}
                        showCell={()=> true}
                        titleForPopup="Crop mix"
                      />
                    )}
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
