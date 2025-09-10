"use client";

import { create } from "zustand";

export type IndicatorKey = "weather" | "production" | "demand" | "loss" | "sort";

type ProductionUI = {
  // crop + method
  crop: string;
  setCrop: (c: string) => void;
  method: string | null;
  setMethod: (m: string | null) => void;

  // multi-crop select + hide all
  selectedCrops: string[];
  setSelectedCrops: (crops: string[]) => void;
  hideAllCrops: boolean;
  setHideAllCrops: (v: boolean) => void;

  // plots select + hide all
  selectedPlots: string[]; // e.g. ["P1.1","P1.2"]
  setSelectedPlots: (plots: string[]) => void;
  hideAllPlots: boolean;
  setHideAllPlots: (v: boolean) => void;

  // tasks select + hide all
  selectedTasks: string[]; // keys like "pruning"
  setSelectedTasks: (t: string[]) => void;
  hideAllTasks: boolean;
  setHideAllTasks: (v: boolean) => void;

  // weeks
  weekStart: number;
  window: number;
  setWeekStart: (w: number) => void;
  setWindow: (n: number) => void;

  // indicators + sorting order
  indicators: Record<IndicatorKey, boolean>;
  toggleIndicator: (k: IndicatorKey, v: boolean) => void;
  indicatorOrder: IndicatorKey[];
  setIndicatorOrder: (o: IndicatorKey[]) => void;
};

export const useProductionUI = create<ProductionUI>((set, get) => ({
  // defaults
  crop: "Broccoli",
  setCrop: (crop) => set({ crop }),

  method: null,
  setMethod: (method) => set({ method }),

  selectedCrops: [],
  setSelectedCrops: (selectedCrops) => set({ selectedCrops }),
  hideAllCrops: false,
  setHideAllCrops: (v) => set({ hideAllCrops: v }),

  selectedPlots: [],
  setSelectedPlots: (selectedPlots) => set({ selectedPlots }),
  hideAllPlots: false,
  setHideAllPlots: (v) => set({ hideAllPlots: v }),

  selectedTasks: [],
  setSelectedTasks: (t) =>
    set({
      selectedTasks: t,
      // don't force-hide unless explicitly requested via setHideAllTasks
      hideAllTasks: get().hideAllTasks && t.length === 0 ? true : false,
    }),
  hideAllTasks: false,
  setHideAllTasks: (v) => set({ hideAllTasks: v }),

  weekStart: 12,
  window: 16,
  setWeekStart: (w) => set({ weekStart: w }),
  setWindow: (n) => set({ window: n }),

  indicators: { weather: false, production: true, demand: true, loss: true, sort: false },
  toggleIndicator: (k, v) => set({ indicators: { ...get().indicators, [k]: v } }),
  indicatorOrder: ["production", "demand", "loss"],
  setIndicatorOrder: (o) => set({ indicatorOrder: o }),
}));
