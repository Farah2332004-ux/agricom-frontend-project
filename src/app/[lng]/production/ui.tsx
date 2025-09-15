"use client";

import { create } from "zustand";

export type IndicatorKey = "weather" | "production" | "demand" | "loss" | "sort";

/* ---------- ISO week helpers (Beirut-aware) ---------- */
function toTZ(date: Date, tz?: string): Date {
  return tz ? new Date(new Date(date).toLocaleString("en-US", { timeZone: tz })) : new Date(date);
}
function isoWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const diffDays = Math.floor((d.getTime() - yearStart.getTime()) / 86400000) + 1;
  return Math.ceil(diffDays / 7);
}
function weeksInISOYearFor(date: Date): number {
  const dec28 = new Date(Date.UTC(date.getFullYear(), 11, 28));
  return isoWeek(dec28) === 53 ? 53 : 52;
}
function currentISOWeek(tz: string = "Asia/Beirut"): { week: number; year: number; date: Date } {
  const now = toTZ(new Date(), tz);
  return { week: isoWeek(now), year: now.getFullYear(), date: now };
}

export const { week: NOW_WEEK, date: NOW_DATE } = currentISOWeek("Asia/Beirut");
export const ISO_MAX_THIS_YEAR = weeksInISOYearFor(NOW_DATE);

/* ---------------- Types ---------------- */
type ProductionUI = {
  crop: string;                setCrop(c: string): void;
  method: string | null;       setMethod(m: string | null): void;

  selectedCrops: string[];     setSelectedCrops(crops: string[]): void;
  hideAllCrops: boolean;       setHideAllCrops(v: boolean): void;

  selectedPlots: string[];     setSelectedPlots(plots: string[]): void;
  hideAllPlots: boolean;       setHideAllPlots(v: boolean): void;

  selectedTasks: string[];     setSelectedTasks(t: string[]): void;
  hideAllTasks: boolean;       setHideAllTasks(v: boolean): void;

  weekStart: number;           setWeekStart(w: number): void;
  window: number;              setWindow(n: number): void;

  // short-term details
  selectedWeatherWeek: number | null;
  setSelectedWeatherWeek: (w: number | null) => void;

  locationLabel: string;       setLocationLabel(s: string): void;

  indicators: Record<IndicatorKey, boolean>;
  toggleIndicator(k: IndicatorKey, v: boolean): void;

  indicatorOrder: IndicatorKey[];
  setIndicatorOrder(o: IndicatorKey[]): void;
};

/* ---------------- Store ---------------- */
export const useProductionUI = create<ProductionUI>((set, get) => ({
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

  weekStart: NOW_WEEK,   // start at current ISO week
  window: 16,
  setWeekStart: (w) => set({ weekStart: w }),
  setWindow: (n) => set({ window: n }),

  // short-term details selection (null = none)
  selectedWeatherWeek: null,
  setSelectedWeatherWeek: (w) => set({ selectedWeatherWeek: w }),

  locationLabel: "Berlin, Germany",
  setLocationLabel: (s) => set({ locationLabel: s }),

  indicators: { weather: false, production: true, demand: true, loss: true, sort: false },
  toggleIndicator: (k, v) => set({ indicators: { ...get().indicators, [k]: v } }),

  indicatorOrder: ["production", "demand", "loss"],
  setIndicatorOrder: (o) => set({ indicatorOrder: o }),
}));
