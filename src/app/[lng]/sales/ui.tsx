"use client";

import { create } from "zustand";
import { currentISOWeek } from "../components/common/weeks";

/* ---------------- Types for filters ---------------- */
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

/* ---------------- Sales Simulator types ---------------- */
export type SalesSimBaseline = {
  salesKg: number;   // baseline expected sales
  invKg: number;     // baseline expected inventory
  wasteKg: number;   // baseline expected waste
  price: number;     // baseline price
};
export type SalesSimCtx = {
  label: string;                         // crop or client label to display
  weeks: number[];                       // 3-week window around the clicked week
  baselines: Record<number, SalesSimBaseline>;
};

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

  // NOTE: crops tab had "Channel Mix"; clients tab has "Crop Mix".
  // We keep both flags so the same schedule component can read them safely.
  showChannelMix: boolean;
  setShowChannelMix: (v: boolean) => void;
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

  // clients dropdown (flat selection of keys)
  clientsSelected: string[];
  setClientsSelected: (v: string[]) => void;

  /* ---------------- Sales Simulator state ---------------- */
  salesSimOpen: boolean;
  salesSimCtx: SalesSimCtx | null;
  openSalesSimulator: (ctx: SalesSimCtx) => void;
  closeSalesSimulator: () => void;
};

const { week } = currentISOWeek();

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
  showCropMix: true,
  setShowCropMix: (v) => set({ showCropMix: v }),

  weekStart: week,
  window: 16,
  setWeekStart: (w) => set({ weekStart: w }),
  setWindow: (n) => set({ window: n }),

  tab: "crops",
  setTab: (t) => set({ tab: t }),

  crop: "Broccoli",
  setCrop: (crop) => set({ crop }),

  clientsSelected: [],
  setClientsSelected: (v) => set({ clientsSelected: v }),

  salesSimOpen: false,
  salesSimCtx: null,
  openSalesSimulator: (ctx) => set({ salesSimOpen: true, salesSimCtx: ctx }),
  closeSalesSimulator: () => set({ salesSimOpen: false, salesSimCtx: null }),
}));
