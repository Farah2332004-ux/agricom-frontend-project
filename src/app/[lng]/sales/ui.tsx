"use client";

import { create } from "zustand";
import { currentISOWeek } from "../components/common/weeks";

/** ==== Simulator baseline (used by SalesSimulator) ==== */
export type SalesSimBaseline = {
  salesKg: number;
  invKg: number;
  wasteKg: number;
  price: number; // $/kg
};

export type OrderChannelKey =
  | "standing"
  | "online"
  | "email"
  | "institution"
  | "pack"
  | "recipe"
  | "box";

export type PromoKey =
  | "discount"
  | "bundle"
  | "free"
  | "flash"
  | "reward"
  | "referral";

type SalesUI = {
  // filters
  selectedCrops: string[];
  setSelectedCrops: (c: string[]) => void;
  ordersFilter: OrderChannelKey[];
  setOrdersFilter: (v: OrderChannelKey[]) => void;
  promotionsFilter: PromoKey[];
  setPromotionsFilter: (v: PromoKey[]) => void;

  // indicators (what to show)
  showConfirmed: boolean;
  setShowConfirmed: (v: boolean) => void;
  showPotential: boolean;
  setShowPotential: (v: boolean) => void;
  showExpected: boolean;
  setShowExpected: (v: boolean) => void;

  showQuantity: boolean;
  setShowQuantity: (v: boolean) => void;
  showRevenue: boolean;
  setShowRevenue: (v: boolean) => void;
  showPromoLinked: boolean;
  setShowPromoLinked: (v: boolean) => void;

  // crops tab only
  showChannelMix: boolean;
  setShowChannelMix: (v: boolean) => void;

  // clients tab only
  showCropMix?: boolean;
  setShowCropMix?: (v: boolean) => void;

  // week scroller
  weekStart: number;
  window: number;
  setWeekStart: (w: number) => void;
  setWindow: (n: number) => void;

  // tab
  tab: "crops" | "clients";
  setTab: (t: "crops" | "clients") => void;

  // primary crop (used when none selected)
  crop: string;
  setCrop: (c: string) => void;

  // clients dropdown (flat selection across Channel / Segment / Persona)
  clientsSelected?: string[];
  setClientsSelected?: (vals: string[]) => void;

  /** ===== Sales Simulator state ===== */
  salesSimOpen: boolean;
  salesSimCtx: {
    label: string;                // crop/client header label
    weeks: number[];              // 4 consecutive weeks (wrapped)
    baselines: Record<number, SalesSimBaseline>;
  } | null;
  openSalesSimulator: (ctx: {
    label: string;
    weeks: number[];
    baselines: Record<number, SalesSimBaseline>;
  }) => void;
  closeSalesSimulator: () => void;
};

const { week } = currentISOWeek(); // local tz
export const useSalesUI = create<SalesUI>((set) => ({
  selectedCrops: [],
  setSelectedCrops: (selectedCrops) => set({ selectedCrops }),

  ordersFilter: [],
  setOrdersFilter: (ordersFilter) => set({ ordersFilter }),

  promotionsFilter: [],
  setPromotionsFilter: (promotionsFilter) => set({ promotionsFilter }),

  showConfirmed: true,
  setShowConfirmed: (v) => set({ showConfirmed: v }),
  showPotential: true,
  setShowPotential: (v) => set({ showPotential: v }),
  showExpected: true,
  setShowExpected: (v) => set({ showExpected: v }),

  showQuantity: true,
  setShowQuantity: (v) => set({ showQuantity: v }),
  showRevenue: true,
  setShowRevenue: (v) => set({ showRevenue: v }),
  showPromoLinked: true,
  setShowPromoLinked: (v) => set({ showPromoLinked: v }),

  showChannelMix: true,
  setShowChannelMix: (v) => set({ showChannelMix: v }),

  // for clients tab
  showCropMix: true,
  setShowCropMix: (v) => set({ showCropMix: v }),
  clientsSelected: [],
  setClientsSelected: (vals) => set({ clientsSelected: vals }),

  weekStart: week,
  window: 16,
  setWeekStart: (w) => set({ weekStart: w }),
  setWindow: (n) => set({ window: n }),

  tab: "crops",
  setTab: (t) => set({ tab: t }),

  crop: "Broccoli",
  setCrop: (crop) => set({ crop }),

  /** simulator */
  salesSimOpen: false,
  salesSimCtx: null,
  openSalesSimulator: (ctx) => set({ salesSimOpen: true, salesSimCtx: ctx }),
  closeSalesSimulator: () => set({ salesSimOpen: false, salesSimCtx: null }),
}));
