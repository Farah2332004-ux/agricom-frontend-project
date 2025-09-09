"use client"

import * as React from "react"
import {
  CloudSun, ShoppingCart, Trash2, ArrowUpDown,
  Scissors, Hammer, Droplets, Wheat, Shovel, FlaskConical, Shield, Sprout,
  MinusCircle,
} from "lucide-react"

import PlotsDropdown, { type PlotNode } from "../molecules/PlotsDropdown"
import CropsDropdown from "../molecules/CropsDropdown"
import TasksDropdown from "../molecules/TasksDropdown"
import IndicatorToggle from "../molecules/IndicatorToggle"
import { useProductionUI } from "../../production/ui"

export type IndicatorKey = "weather" | "production" | "demand" | "loss" | "sort"

export default function ProductionFilters() {
  const ui = useProductionUI()

  // ---- plots (now from UI store)
  const plotItems: PlotNode[] = [
    { country: "Italy", city: "Rome",   plot: "P1.1", id: "it-rome-p1-1" },
    { country: "Italy", city: "Rome",   plot: "P1.2", id: "it-rome-p1-2" },
    { country: "Italy", city: "Milan",  plot: "P2.1", id: "it-mil-p2-1" },
    { country: "Spain", city: "Seville",plot: "P3.1", id: "es-sev-p3-1" },
    { country: "Spain", city: "Seville",plot: "P3.2", id: "es-sev-p3-2" },
  ]

  // ---- crops (keep local pair for method; sync crop name to UI store)
  const [cropSel, setCropSel] = React.useState<{ crop: string | null; method: string | null }>({
    crop: "Broccoli",
    method: "Conventional",
  })
  const crops = ["Tomato", "Broccoli", "Potato", "Cabbage", "Onion", "Spinach"]
  const methods = ["Organic","Conventional","Hydroponic","Urban","Aquaponic","Tunnel","GreenHouse","Open Field","Vertical Farming"]

  // ---- tasks (from UI store)
  const tasks = [
    { label: "Pruning",          value: "pruning",        icon: Scissors },
    { label: "Staking",          value: "staking",        icon: Hammer },
    { label: "Irrigation",       value: "irrigation",     icon: Droplets },
    { label: "Thinning",         value: "thinning",       icon: MinusCircle },
    { label: "Weeding",          value: "weeding",        icon: Sprout },
    { label: "Harvest",          value: "harvest",        icon: Wheat },
    { label: "Soil Preparation", value: "soil-prep",      icon: Shovel },
    { label: "Fertilization",    value: "fertilization",  icon: FlaskConical },
    { label: "Protection",       value: "protection",     icon: Shield },
  ] as const

  return (
    <section className="mb-3 w-full">
      {/* Left = Filters, Right = Indicators */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto] md:items-start">
        {/* Filters */}
        <div className="flex flex-col gap-1">
          <span className="text-sm leading-none text-muted-foreground">Filter By:</span>
          <div className="flex flex-wrap items-center gap-4">
            <PlotsDropdown
              items={plotItems}
              value={ui.selectedPlots}
              onChange={ui.setSelectedPlots}
            />

            <CropsDropdown
              crops={crops}
              methods={methods}
              value={cropSel}
              onChange={(next) => {
                setCropSel(next)
                if (next.crop) ui.setCrop(next.crop)
              }}
            />

            <TasksDropdown
              tasks={tasks as any}
              value={ui.selectedTasks}
              onChange={ui.setSelectedTasks}
            />
          </div>
        </div>

        {/* Indicators */}
        <div className="flex flex-col gap-1">
          <span className="text-sm leading-none text-muted-foreground">Show:</span>
          <div className="flex flex-wrap items-center gap-2">
            <IndicatorToggle
              icon={CloudSun}
              label="Weather"
              pressed={ui.indicators.weather}
              onPressedChange={(v) => ui.toggleIndicator("weather", v)}
            />
            <IndicatorToggle
              icon={Sprout}
              label="Production"
              pressed={ui.indicators.production}
              onPressedChange={(v) => ui.toggleIndicator("production", v)}
            />
            <IndicatorToggle
              icon={ShoppingCart}
              label="Potential Demand"
              pressed={ui.indicators.demand}
              onPressedChange={(v) => ui.toggleIndicator("demand", v)}
            />
            <IndicatorToggle
              icon={Trash2}
              label="Potential Loss"
              pressed={ui.indicators.loss}
              onPressedChange={(v) => ui.toggleIndicator("loss", v)}
            />
            <IndicatorToggle
              icon={ArrowUpDown}
              label="Sort"
              pressed={ui.indicators.sort}
              onPressedChange={(v) => ui.toggleIndicator("sort", v)}
            />
          </div>
        </div>
      </div>

      {/* divider */}
      <div className="mt-3 h-px w-full bg-[#E0F0ED]" />
    </section>
  )
}
