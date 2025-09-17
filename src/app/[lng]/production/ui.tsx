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

type SimulatorCtx = {
  week: number;
  groupId: string;
  crop: string;
  plots: string[];
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

  // Task panel context
  taskPanelOpen?: boolean;
  taskPanelCtx?: any;
  openTaskPanel?: (ctx: any) => void;
  closeTaskPanel?: () => void;

  // Global impact dialog
  impactDialogOpen: boolean;
  impactConfig: ImpactDialogConfig | null;
  openImpactDialog: (cfg: ImpactDialogConfig) => void;
  closeImpactDialog: () => void;

  // Harvest simulator
  simulatorOpen: boolean;
  simulatorCtx: SimulatorCtx | null;
  openSimulator: (ctx: SimulatorCtx) => void;
  closeSimulator: () => void;
};

/* ---------- Helpers: ISO week in Berlin ---------- */
function toBerlinDate(d: Date): Date {
  // Same wall-clock time in Europe/Berlin (client-safe)
  return new Date(new Date(d).toLocaleString("en-US", { timeZone: "Europe/Berlin" }));
}

function isoWeek(date: Date): number {
  // ISO week (1..52/53), computed in UTC to avoid DST issues
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;          // Sun=0 -> 7
  d.setUTCDate(d.getUTCDate() + 4 - day);  // move to Thursday of current week
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const diffDays = Math.floor((d.getTime() - yearStart.getTime()) / 86400000) + 1;
  return Math.ceil(diffDays / 7);
}

const defaultWeekStart = (() => {
  const nowBerlin = toBerlinDate(new Date());
  const wk = isoWeek(nowBerlin);
  // Your grid uses 1..52; clamp in case ISO week is 53
  return Math.min(52, Math.max(1, wk));
})();

/* ---------- Store ---------- */
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

  // Weeks
  weekStart: defaultWeekStart, // ← current ISO week in Berlin by default
  window: 16,
  setWeekStart: (w) => set({ weekStart: w }),
  setWindow: (n) => set({ window: n }),

  // Indicators
  indicators: { weather: false, production: true, demand: true, loss: true, sort: false },
  toggleIndicator: (k, v) => set({ indicators: { ...get().indicators, [k]: v } }),
  indicatorOrder: ["production", "demand", "loss"],
  setIndicatorOrder: (o) => set({ indicatorOrder: o }),

  // Task details drawer
  taskPanelOpen: false,
  taskPanelCtx: null,
  openTaskPanel: (ctx) => set({ taskPanelOpen: true, taskPanelCtx: ctx }),
  closeTaskPanel: () => set({ taskPanelOpen: false, taskPanelCtx: null }),

  // Impact dialog
  impactDialogOpen: false,
  impactConfig: null,
  openImpactDialog: (cfg) => set({ impactDialogOpen: true, impactConfig: cfg }),
  closeImpactDialog: () => set({ impactDialogOpen: false, impactConfig: null }),

  // Harvest simulator
  simulatorOpen: false,
  simulatorCtx: null,
  openSimulator: (ctx) => set({ simulatorOpen: true, simulatorCtx: ctx }),
  closeSimulator: () => set({ simulatorOpen: false, simulatorCtx: null }),
}));
