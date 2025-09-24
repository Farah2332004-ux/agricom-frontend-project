// src/app/[lng]/components/organisms/SalesSchedule.tsx
"use client";

import * as React from "react";
import WeekScroller from "../common/WeekScroller";
import { visibleWeeks } from "../common/weeks";
import {
  ChevronDown,

  // Crop header
  Sprout,

  // Order-type pictos (same set used in filters)
  ShoppingBasket,  // Standing
  Smartphone,      // Online shop
  Mail,            // Email Ads
  Landmark,        // Institutional
  Package,         // Pack station
  Boxes,           // Box-Based

  // Section headers / indicators
  ListChecks,      // Confirmed Orders
  Clipboard,       // Potential Orders
  FileClock,       // Expected Orders
  CircleDollarSign,
  Megaphone,
  Users,
  ClipboardList,   // "Orders" icon (match Filters)

  // Channels (client types)
  Store,           // Retailer
  Home,            // Warehouse (closest)
  Utensils,        // HORCEA
  Factory,         // Processor
  Building,        // Public Sector

  // “Mixed” glyphs
  Layers,

  // Clearer promo icons
  BadgePercent,    // Discount
  Truck,           // Free Delivery
  Zap,             // Flash Offer
  Trophy,          // Reward
} from "lucide-react";

import { useSalesUI } from "../../sales/ui";

/* ---------------- Theme ---------------- */
const BORDER = "#E0F0ED";
const BRAND  = "#02A78B";

/* ---------------- Grid (same as Production) ---------------- */
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

/* ---------------- Demo data (seeded) ---------------- */
function rng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507)), (h >>> 0) / 2 ** 32);
}
const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

type OrderType = "confirmed" | "potential" | "expected";
type Metric = "quantity" | "revenue";

function valueFor(crop: string, orderType: OrderType, metric: Metric, week: number) {
  const r = rng(`${crop}:${orderType}:${metric}:${week}`)();
  if (metric === "quantity") {
    const base = orderType === "confirmed" ? 22 : orderType === "expected" ? 17 : 14;
    return Math.round(base + r * 12);
  }
  const q = valueFor(crop, orderType, "quantity", week);
  const price = 1.8 + r * 2.2;
  return Math.round(q * price);
}

/* ---------------- Catalogs (icons + labels) ---------------- */
type CatalogItem = { key:string; label:string; Icon: React.ElementType };

const ORDER_TYPES = [
  { key: "standing",    label: "Standing",      Icon: ShoppingBasket },
  { key: "online",      label: "Online shop",   Icon: Smartphone },
  { key: "email",       label: "Email Ads",     Icon: Mail },
  { key: "institution", label: "Institutional", Icon: Landmark },
  { key: "pack",        label: "Pack station",  Icon: Package },
  { key: "box",         label: "Box-Based",     Icon: Boxes },
] as const;

const PROMO_TYPES = [
  { key: "discount",  label: "Discount",      Icon: BadgePercent },
  { key: "bundle",    label: "Bundle",        Icon: Boxes },
  { key: "free",      label: "Free Delivery", Icon: Truck },
  { key: "flash",     label: "Flash Offer",   Icon: Zap },
  { key: "reward",    label: "Reward",        Icon: Trophy },
  { key: "referral",  label: "Pack Referral", Icon: Package },
] as const;

const CHANNELS = [
  { key: "retailer",   label: "Retailer",      Icon: Store },
  { key: "online",     label: "Online Shop",   Icon: Smartphone },
  { key: "warehouse",  label: "Warehouse",     Icon: Home },
  { key: "horcea",     label: "HORCEA",        Icon: Utensils },
  { key: "institution",label: "Institution",   Icon: Landmark },
  { key: "processor",  label: "Processor",     Icon: Factory },
  { key: "association",label: "Association",   Icon: Users },
  { key: "public",     label: "Public Sector", Icon: Building },
] as const;

/* Seeded distribution helper */
function pickDistribution(seed: string, catalog: readonly CatalogItem[], minItems=1, maxItems=3) {
  const r = rng(seed);
  const count = Math.max(minItems, Math.min(maxItems, 1 + Math.floor(r() * maxItems)));
  const pool = [...catalog];
  const chosen: CatalogItem[] = [];
  for (let i=0;i<count && pool.length;i++){
    const idx = Math.floor(r()*pool.length);
    chosen.push(pool.splice(idx,1)[0]);
  }
  const weights = chosen.map(()=> 1 + r());
  const total = sum(weights);
  const pct = weights.map((w,i)=>
    i === weights.length-1
      ? Math.max(0, 100 - sum(weights.slice(0,-1).map(v=>Math.round((v/total)*100))))
      : Math.round((w/total)*100)
  );
  return chosen.map((c,i)=>({ label: c.label, Icon: c.Icon, pct: pct[i] }));
}
function dominant<T extends {pct:number}>(dist: T[]) {
  return dist.slice().sort((a,b)=>b.pct-a.pct)[0];
}

/* ---------------- Small building blocks ---------------- */
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

/** Left-label aligned EXACTLY under section title. */
function SubRowLabel({
  Icon, children, unitLabel,
}: {
  Icon: React.ElementType;
  children: React.ReactNode;
  unitLabel?: string;
}) {
  return (
    <div className="flex items-center gap-2 px-2 text-[15px]">
      {/* Spacer equal to chevron button (keeps same x as section title) */}
      <span className="inline-flex h-6 w-6 shrink-0" />
      <Icon className="size-4" style={{ color: BRAND }} />
      <span>{children}</span>
      {unitLabel ? <span className="ml-1 text-sm text-muted-foreground">{unitLabel}</span> : null}
    </div>
  );
}

/** White popup card (no arrow) shown via CSS on hover */
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

/** Icon-only cell (+clean popup on hover). */
function MixCell({
  dist,
  mixIcon: MixIcon,
  title,
}: {
  dist: Array<{ label:string; pct:number; Icon: React.ElementType }>;
  mixIcon: React.ElementType;
  title: string;
}) {
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

/** Whole row showing icon-only cells for each week + popup */
function MixRow({
  rowIcon: RowIcon,
  label,
  catalog,
  titleForPopup,
  seedOf,
  weeks,
  mixIcon: MixIcon,
}: {
  rowIcon: React.ElementType;
  label: string;
  catalog: readonly CatalogItem[];
  titleForPopup: string;
  seedOf: (w: number) => string;
  weeks: number[];
  mixIcon: React.ElementType;
}) {
  return (
    <div className="mb-2" style={rowGridStyle()}>
      <SubRowLabel Icon={RowIcon}>{label}</SubRowLabel>

      <div style={weekColsStyle(weeks.length)}>
        {weeks.map((w) => {
          const dist = pickDistribution(seedOf(w), catalog as CatalogItem[], 1, 3);
          return (
            <MixCell
              key={`${label}-${w}`}
              dist={dist}
              mixIcon={MixIcon}
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

/** Quantity/Revenue numeric row (cells show numbers only). */
function NumericRow({
  label,
  icon: Icon,
  unitLabel,
  getVal,
  weeks,
}: {
  label: string;
  icon: React.ElementType;
  unitLabel: string; // "(kg)" or "($)"
  getVal: (w: number) => number;
  weeks: number[];
}) {
  const vals = weeks.map(getVal);
  const total = sum(vals);

  return (
    <div className="mb-2" style={rowGridStyle()}>
      <SubRowLabel Icon={Icon} unitLabel={unitLabel}>{label}</SubRowLabel>

      <div style={weekColsStyle(weeks.length)}>
        {weeks.map((w, i) => (
          <ValueCell key={`${label}-${w}`}>{vals[i]}</ValueCell>
        ))}
      </div>

      <div className="flex h-8 items-center justify-center rounded-[6px] border bg-white text-sm font-semibold" style={{ borderColor: BORDER, color: BRAND }}>
        {total}
      </div>
    </div>
  );
}

/* ---------------- Main ---------------- */
export default function SalesSchedule() {
  const ui = useSalesUI();

  if ((ui.tab ?? "crops") !== "crops") {
    return (
      <section className="mt-6 rounded-2xl border border-[#E0F0ED] bg-white p-6 text-sm text-muted-foreground">
        Clients view — coming next.
      </section>
    );
  }

  const weeks = visibleWeeks(ui.weekStart, ui.window, 1, 52, true);
  const cropsToRender = (ui.selectedCrops?.length ? ui.selectedCrops : [ui.crop ?? "Broccoli"]) as string[];

  // crop-level expand/collapse
  const [cropOpen, setCropOpen] = React.useState<Record<string, boolean>>({});
  const toggleCrop = (c: string) => setCropOpen((m) => ({ ...m, [c]: !(m[c] ?? true) }));

  // per-order-type expand/collapse
  const [openMap, setOpenMap] = React.useState<Record<string, { confirmed: boolean; potential: boolean; expected: boolean }>>({});
  const toggleType = (crop: string, key: keyof (typeof openMap)[string]) =>
    setOpenMap((m) => ({ ...m, [crop]: { confirmed: true, potential: true, expected: true, ...m[crop], [key]: !(m[crop]?.[key] ?? true) } }));

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
        const headerTotals = weeks.map((w) => valueFor(cropName, "confirmed", "quantity", w));
        const headerTotal = sum(headerTotals);
        const cropIsOpen = cropOpen[cropName] ?? true;
        const typeState = openMap[cropName] ?? { confirmed: true, potential: true, expected: true };

        return (
          <React.Fragment key={cropName}>
            {/* Crop header row (with working chevron) */}
            <div className="mb-2 mt-6" style={rowGridStyle()}>
              <div className="flex h-8 items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleCrop(cropName)}
                  aria-expanded={cropIsOpen}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-[6px] border"
                  style={{ borderColor: BORDER, color: BRAND }}
                >
                  <ChevronDown className={`size-4 transition-transform ${cropIsOpen ? "" : "-rotate-90"}`} />
                </button>

                <div className="flex items-center gap-2 text-[15px] font-semibold">
                  <Sprout className="size-4" style={{ color: BRAND }} />
                  {cropName}
                </div>
              </div>

              <div style={weekColsStyle(weeks.length)}>
                {headerTotals.map((val, i) => (
                  <HeaderCell key={`hdr-${cropName}-${i}`}>{val}</HeaderCell>
                ))}
              </div>

              <div className="flex h-8 items-center justify-center rounded-[6px] border bg-white text-sm font-semibold" style={{ borderColor: BORDER, color: BRAND }}>
                {headerTotal}
              </div>
            </div>

            {!cropIsOpen ? null : (
              <>
                {/* Confirmed */}
                {ui.showConfirmed && (
                  <>
                    <div className="mt-3" style={rowGridStyle()}>
                      <SectionHeading
                        open={typeState.confirmed}
                        onToggle={() => toggleType(cropName, "confirmed")}
                        Icon={ListChecks}
                        label="Confirmed Orders"
                      />
                      <div />
                      <div />
                    </div>

                    {typeState.confirmed && (
                      <>
                        <MixRow
                          rowIcon={ClipboardList}  // SAME icon as Filters “Orders”
                          label="Order Type"
                          catalog={ORDER_TYPES as unknown as CatalogItem[]}
                          titleForPopup="Order Type mix"
                          seedOf={(w) => `${cropName}:confirmed:orders:${w}`}
                          weeks={weeks}
                          mixIcon={Layers}
                        />

                        {ui.showQuantity && (
                          <NumericRow
                            label="Quantity"
                            icon={Boxes}
                            unitLabel="(kg)"
                            getVal={(w) => valueFor(cropName, "confirmed", "quantity", w)}
                            weeks={weeks}
                          />
                        )}
                        {ui.showRevenue && (
                          <NumericRow
                            label="Revenue"
                            icon={CircleDollarSign}
                            unitLabel="($)"
                            getVal={(w) => valueFor(cropName, "confirmed", "revenue", w)}
                            weeks={weeks}
                          />
                        )}

                        {ui.showPromoLinked && (
                          <MixRow
                            rowIcon={Megaphone}
                            label="Promotion"
                            catalog={PROMO_TYPES as unknown as CatalogItem[]}
                            titleForPopup="Promotion mix"
                            seedOf={(w) => `${cropName}:confirmed:promos:${w}`}
                            weeks={weeks}
                            mixIcon={Megaphone}
                          />
                        )}

                        {ui.showChannelMix && (
                          <MixRow
                            rowIcon={Users}
                            label="Channel Mix"
                            catalog={CHANNELS as unknown as CatalogItem[]}
                            titleForPopup="Channel mix"
                            seedOf={(w) => `${cropName}:confirmed:channels:${w}`}
                            weeks={weeks}
                            mixIcon={Users}
                          />
                        )}
                      </>
                    )}
                  </>
                )}

                {/* Potential */}
                {ui.showPotential && (
                  <>
                    <div className="mt-3" style={rowGridStyle()}>
                      <SectionHeading
                        open={typeState.potential}
                        onToggle={() => toggleType(cropName, "potential")}
                        Icon={Clipboard}
                        label="Potential Orders"
                      />
                      <div />
                      <div />
                    </div>

                    {typeState.potential && (
                      <>
                        <MixRow
                          rowIcon={ClipboardList}
                          label="Order Type"
                          catalog={ORDER_TYPES as unknown as CatalogItem[]}
                          titleForPopup="Order Type mix"
                          seedOf={(w) => `${cropName}:potential:orders:${w}`}
                          weeks={weeks}
                          mixIcon={Layers}
                        />

                        {ui.showQuantity && (
                          <NumericRow
                            label="Quantity"
                            icon={Boxes}
                            unitLabel="(kg)"
                            getVal={(w) => valueFor(cropName, "potential", "quantity", w)}
                            weeks={weeks}
                          />
                        )}
                        {ui.showRevenue && (
                          <NumericRow
                            label="Revenue"
                            icon={CircleDollarSign}
                            unitLabel="($)"
                            getVal={(w) => valueFor(cropName, "potential", "revenue", w)}
                            weeks={weeks}
                          />
                        )}

                        {ui.showPromoLinked && (
                          <MixRow
                            rowIcon={Megaphone}
                            label="Promotion"
                            catalog={PROMO_TYPES as unknown as CatalogItem[]}
                            titleForPopup="Promotion mix"
                            seedOf={(w) => `${cropName}:potential:promos:${w}`}
                            weeks={weeks}
                            mixIcon={Megaphone}
                          />
                        )}

                        {ui.showChannelMix && (
                          <MixRow
                            rowIcon={Users}
                            label="Channel Mix"
                            catalog={CHANNELS as unknown as CatalogItem[]}
                            titleForPopup="Channel mix"
                            seedOf={(w) => `${cropName}:potential:channels:${w}`}
                            weeks={weeks}
                            mixIcon={Users}
                          />
                        )}
                      </>
                    )}
                  </>
                )}

                {/* Expected */}
                {ui.showExpected && (
                  <>
                    <div className="mt-3" style={rowGridStyle()}>
                      <SectionHeading
                        open={typeState.expected}
                        onToggle={() => toggleType(cropName, "expected")}
                        Icon={FileClock}
                        label="Expected Orders"
                      />
                      <div />
                      <div />
                    </div>

                    {typeState.expected && (
                      <>
                        <MixRow
                          rowIcon={ClipboardList}
                          label="Order Type"
                          catalog={ORDER_TYPES as unknown as CatalogItem[]}
                          titleForPopup="Order Type mix"
                          seedOf={(w) => `${cropName}:expected:orders:${w}`}
                          weeks={weeks}
                          mixIcon={Layers}
                        />

                        {ui.showQuantity && (
                          <NumericRow
                            label="Quantity"
                            icon={Boxes}
                            unitLabel="(kg)"
                            getVal={(w) => valueFor(cropName, "expected", "quantity", w)}
                            weeks={weeks}
                          />
                        )}
                        {ui.showRevenue && (
                          <NumericRow
                            label="Revenue"
                            icon={CircleDollarSign}
                            unitLabel="($)"
                            getVal={(w) => valueFor(cropName, "expected", "revenue", w)}
                            weeks={weeks}
                          />
                        )}

                        {ui.showPromoLinked && (
                          <MixRow
                            rowIcon={Megaphone}
                            label="Promotion"
                            catalog={PROMO_TYPES as unknown as CatalogItem[]}
                            titleForPopup="Promotion mix"
                            seedOf={(w) => `${cropName}:expected:promos:${w}`}
                            weeks={weeks}
                            mixIcon={Megaphone}
                          />
                        )}

                        {ui.showChannelMix && (
                          <MixRow
                            rowIcon={Users}
                            label="Channel Mix"
                            catalog={CHANNELS as unknown as CatalogItem[]}
                            titleForPopup="Channel mix"
                            seedOf={(w) => `${cropName}:expected:channels:${w}`}
                            weeks={weeks}
                            mixIcon={Users}
                          />
                        )}
                      </>
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
