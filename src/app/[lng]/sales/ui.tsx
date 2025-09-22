"use client";

import { create } from "zustand";

type TabKey = "crops" | "clients";

type SalesUI = {
  // crop + method
  crop: string | null;
  setCrop: (c: string | null) => void;
  method: string | null;
  setMethod: (m: string | null) => void;

  // filters
  selectedCrops: string[];
  setSelectedCrops: (v: string[]) => void;
  selectedOrders: string[];
  setSelectedOrders: (v: string[]) => void;
  selectedPromos: string[];
  setSelectedPromos: (v: string[]) => void;

  // tabs
  tab: TabKey;
  setTab: (t: TabKey) => void;

  // scroller
  weekStart: number;
  window: number;
  setWeekStart: (w: number) => void;
  setWindow: (n: number) => void;

  // order-types
  showConfirmed: boolean;
  setShowConfirmed: (v: boolean) => void;
  showPotential: boolean;
  setShowPotential: (v: boolean) => void;
  showExpected: boolean;
  setShowExpected: (v: boolean) => void;

  // metrics
  showQuantity: boolean;
  setShowQuantity: (v: boolean) => void;
  showRevenue: boolean;
  setShowRevenue: (v: boolean) => void;
  showPromoLinked: boolean;
  setShowPromoLinked: (v: boolean) => void;
  showChannelMix: boolean;
  setShowChannelMix: (v: boolean) => void;
};

export const useSalesUI = create<SalesUI>((set) => ({
  crop: "Broccoli",
  setCrop: (crop) => set({ crop }),
  method: null,
  setMethod: (method) => set({ method }),

  selectedCrops: ["Broccoli"],
  setSelectedCrops: (selectedCrops) => set({ selectedCrops }),
  selectedOrders: [],
  setSelectedOrders: (selectedOrders) => set({ selectedOrders }),
  selectedPromos: [],
  setSelectedPromos: (selectedPromos) => set({ selectedPromos }),

  tab: "crops",
  setTab: (tab) => set({ tab }),

  weekStart: 40,
  window: 12,
  setWeekStart: (weekStart) => set({ weekStart }),
  setWindow: (window) => set({ window }),

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
}));
