"use client"

import * as React from "react"
// src/app/[lng]/components/organisms/ProductionFilters.tsx
import {
  CloudSun, Factory, ShoppingCart, Trash2, AlertTriangle, ArrowUpDown,
  Scissors, Hammer, Droplets, Wheat, Shovel, FlaskConical, Shield, Sprout,
  MinusCircle, // ← add this
} from "lucide-react"



import PlotsDropdown, { type PlotNode } from "../molecules/PlotsDropdown"
import CropsDropdown from "../molecules/CropsDropdown"
import TasksDropdown, { type TaskItem } from "../molecules/TasksDropdown"
import IndicatorToggle from "../molecules/IndicatorToggle"

export type IndicatorKey = "weather" | "production" | "demand" | "loss" | "sort"

export default function ProductionFilters() {
  // ---- plots
  const [plotsSel, setPlotsSel] = React.useState<string[]>([])
  const plotItems: PlotNode[] = [
    { country: "Italy", city: "Rome", plot: "P1.1", id: "it-rome-p1-1" },
    { country: "Italy", city: "Rome", plot: "P1.2", id: "it-rome-p1-2" },
    { country: "Italy", city: "Milan", plot: "P2.1", id: "it-mil-p2-1" },
    { country: "Spain", city: "Seville", plot: "P3.1", id: "es-sev-p3-1" },
    { country: "Spain", city: "Seville", plot: "P3.2", id: "es-sev-p3-2" },
  ]

  // ---- crops
  const [cropSel, setCropSel] = React.useState<{
    crop: string | null
    method: string | null
  }>({
    crop: "Broccoli",
    method: "Conventional",
  })
  const crops = ["Tomato", "Broccoli", "Potato", "Cabbage", "Onion", "Spinach"]
  const methods = [
    "Organic",
    "Conventional",
    "Hydroponic",
    "Urban",
    "Aquaponic",
    "Tunnel",
    "GreenHouse",
    "Open Field",
    "Vertical Farming",
  ]

  // ---- tasks
  const [taskSel, setTaskSel] = React.useState<string[]>([])
const tasks = [
  { label: "Pruning",          value: "pruning",        icon: Scissors },
  { label: "Staking",          value: "staking",        icon: Hammer },
  { label: "Irrigation",       value: "irrigation",     icon: Droplets },
  { label: "Thinning",         value: "thinning",       icon: MinusCircle }, // ← changed
  { label: "Weeding",          value: "weeding",        icon: Sprout },
  { label: "Harvest",          value: "harvest",        icon: Wheat },
  { label: "Soil Preparation", value: "soil-prep",      icon: Shovel },
  { label: "Fertilization",    value: "fertilization",  icon: FlaskConical },
  { label: "Protection",       value: "protection",     icon: Shield },
]


  // ---- indicators
  const [inds, setInds] = React.useState<Record<IndicatorKey, boolean>>({
    weather: false,
    production: true,
    demand: false,
    loss: false,
    sort: false,
  })
  const setInd = (k: IndicatorKey, v: boolean) =>
    setInds((p) => ({ ...p, [k]: v }))

  return (
    <section className="mb-3 w-full">
      {/* Left = Filters (fill), Right = Indicators (hug right). Top aligned */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto] md:items-start">
        {/* Left: Filters */}
        <div className="flex flex-col gap-1">
          <span className="text-sm leading-none text-muted-foreground">
            Filter By:
          </span>
          <div className="flex flex-wrap items-center gap-4">
            <PlotsDropdown
              items={plotItems}
              value={plotsSel}
              onChange={setPlotsSel}
            />
            <CropsDropdown
              crops={crops}
              methods={methods}
              value={cropSel}
              onChange={setCropSel}
            />
            <TasksDropdown tasks={tasks} value={taskSel} onChange={setTaskSel} />
          </div>
        </div>

        {/* Right: Indicators — label ABOVE first icon, left-aligned inside its column */}
        <div className="flex flex-col gap-1">
          <span className="text-sm leading-none text-muted-foreground">
            Show:
          </span>
      <div className="flex flex-wrap items-center gap-2">
  <IndicatorToggle
    icon={CloudSun}
    label="Weather"
    pressed={inds.weather}
    onPressedChange={(v) => setInd("weather", v)}
  />
  {/* ⬇ replace Factory with Sprout (crop icon) */}
  <IndicatorToggle
    icon={Sprout}
    label="Production"
    pressed={inds.production}
    onPressedChange={(v) => setInd("production", v)}
  />
  <IndicatorToggle
    icon={ShoppingCart}
    label="Potential Demand"
    pressed={inds.demand}
    onPressedChange={(v) => setInd("demand", v)}
  />
  {/* ⬇ replace AlertTriangle with Trash2 (recycle bin) */}
  <IndicatorToggle
    icon={Trash2}
    label="Potential Loss"
    pressed={inds.loss}
    onPressedChange={(v) => setInd("loss", v)}
  />
  <IndicatorToggle
    icon={ArrowUpDown}
    label="Sort"
    pressed={inds.sort}
    onPressedChange={(v) => setInd("sort", v)}
  />
</div>

        </div>
      </div>

      {/* divider under the whole section */}
      <div className="mt-3 h-px w-full bg-[#E0F0ED]" />
    </section>
  )
}
