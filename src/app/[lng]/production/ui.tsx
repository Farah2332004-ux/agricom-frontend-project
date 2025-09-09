"use client"

import * as React from "react"

export type IndicatorKey = "production" | "demand" | "loss" | "sort"

type UIState = {
  crop: string
  selectedPlots: string[]
  selectedTasks: string[]
  indicators: Record<IndicatorKey, boolean>
  weekStart: number
  window: number
  setCrop: (v: string) => void
  setSelectedPlots: (v: string[]) => void
  setSelectedTasks: (v: string[]) => void
  toggleIndicator: (k: IndicatorKey, v: boolean) => void
  setWeekStart: (n: number) => void
}

const Ctx = React.createContext<UIState | null>(null)

export function ProductionUIProvider({ children }: { children: React.ReactNode }) {
  const [crop, setCrop] = React.useState("Broccoli")
  const [selectedPlots, setSelectedPlots] = React.useState<string[]>([])
  const [selectedTasks, setSelectedTasks] = React.useState<string[]>([])
  const [indicators, setIndicators] = React.useState<Record<IndicatorKey, boolean>>({
    production: true,
    demand: false,
    loss: false,
    sort: false,
  })
  const [weekStart, setWeekStart] = React.useState(12)
  const window = 16

  const toggleIndicator = (k: IndicatorKey, v: boolean) =>
    setIndicators((p) => ({ ...p, [k]: v }))

  const value: UIState = {
    crop,
    selectedPlots,
    selectedTasks,
    indicators,
    weekStart,
    window,
    setCrop,
    setSelectedPlots,
    setSelectedTasks,
    toggleIndicator,
    setWeekStart,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useProductionUI() {
  const v = React.useContext(Ctx)
  if (!v) throw new Error("useProductionUI must be used inside <ProductionUIProvider>")
  return v
}
