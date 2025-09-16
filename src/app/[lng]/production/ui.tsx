// src/app/[lng]/production/ui.tsx
"use client";

import { create } from "zustand";

export type IndicatorKey = "weather" | "production" | "demand" | "loss" | "sort";

export type ImpactDialogConfig = {
  severity?: "warning" | "error" | "info";
  title: string;
  message?: string;
  bullets?: string[];
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

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
  selectedTasks: string[];
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

  // Task panel context (you already use this)
  taskPanelOpen?: boolean;
  taskPanelCtx?: any;
  openTaskPanel?: (ctx: any) => void;
  closeTaskPanel?: () => void;

  // NEW: global impact dialog
  impactDialogOpen: boolean;
  impactConfig: ImpactDialogConfig | null;
  openImpactDialog: (cfg: ImpactDialogConfig) => void;
  closeImpactDialog: () => void;
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

  // optional task panel helpers (if you use them)
  openTaskPanel: (ctx) => set({ taskPanelOpen: true, taskPanelCtx: ctx }),
  closeTaskPanel: () => set({ taskPanelOpen: false, taskPanelCtx: null }),

  // NEW: global impact dialog actions
  impactDialogOpen: false,
  impactConfig: null,
  openImpactDialog: (cfg) => set({ impactDialogOpen: true, impactConfig: cfg }),
  closeImpactDialog: () => set({ impactDialogOpen: false, impactConfig: null }),
}));
