// src/app/[lng]/components/organisms/ProductionFilters.tsx
"use client";

import * as React from "react";
import {
  CloudSun,
  ShoppingCart,
  Trash2,
  Scissors,
  Hammer,
  Droplets,
  Wheat,
  Shovel,
  FlaskConical,
  Shield,
  Sprout,
  MinusCircle,
  Filter as FilterIcon,
  ClipboardList,
  MapPin,
} from "lucide-react";

import PlotsDropdown, { type PlotNode } from "../molecules/PlotsDropdown";
import CropsDropdown from "../molecules/CropsDropdown";
import TasksDropdown, { type TaskItem } from "../molecules/TasksDropdown";
import IndicatorToggle from "../molecules/IndicatorToggle";
import { useProductionUI } from "../../production/ui";

export default function ProductionFilters() {
  const ui = useProductionUI();

  /* ------------ Demo data ------------ */
  const plotItems: PlotNode[] = [
    { country: "Italy", city: "Rome",    plot: "P1.1", id: "it-rome-p1-1" },
    { country: "Italy", city: "Rome",    plot: "P1.2", id: "it-rome-p1-2" },
    { country: "Italy", city: "Milan",   plot: "P2.1", id: "it-mil-p2-1" },
    { country: "Spain", city: "Seville", plot: "P3.1", id: "es-sev-p3-1" },
    { country: "Spain", city: "Seville", plot: "P3.2", id: "es-sev-p3-2" },
  ];
  const allPlotCodes = Array.from(new Set(plotItems.map((p) => p.plot)));

  const crops = ["Tomato", "Broccoli", "Potato", "Cabbage", "Onion", "Spinach"];
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
  ];

  const tasks: TaskItem[] = [
    { label: "Pruning",          value: "pruning",        icon: Scissors },
    { label: "Staking",          value: "staking",        icon: Hammer },
    { label: "Irrigation",       value: "irrigation",     icon: Droplets },
    { label: "Thinning",         value: "thinning",       icon: MinusCircle },
    { label: "Weeding",          value: "weeding",        icon: Sprout },
    { label: "Harvest",          value: "harvest",        icon: Wheat },
    { label: "Soil Preparation", value: "soil-prep",      icon: Shovel },
    { label: "Fertilization",    value: "fertilization",  icon: FlaskConical },
    { label: "Protection",       value: "protection",     icon: Shield },
  ];

  /* ------------ Handlers ------------ */
  const clearTasks = () => {
    ui.setSelectedTasks([]);
    ui.setHideAllTasks(true);
    // IMPORTANT: do NOT auto-open the Task Details panel from the filter
    ui.closeTaskPanel?.();
  };
  const selectAllTasks = () => {
    const all = tasks.map((t) => t.value);
    ui.setSelectedTasks(all as any);
    ui.setHideAllTasks(false);
    // IMPORTANT: do NOT auto-open the Task Details panel from the filter
    ui.closeTaskPanel?.();
  };

  const clearCrops = () => {
    ui.setSelectedCrops([]);
    ui.setMethod(null);
    ui.setHideAllCrops(true);
  };
  const selectAllCrops = () => {
    ui.setSelectedCrops(crops);
    ui.setHideAllCrops(false);
  };

  const clearPlots = () => {
    ui.setSelectedPlots([]);
    ui.setHideAllPlots(true);
  };
  const selectAllPlots = () => {
    ui.setSelectedPlots(allPlotCodes);
    ui.setHideAllPlots(false);
  };

  return (
    <section className="mb-3 w-full">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto] md:items-start">
        {/* Left: Filters */}
        <div className="flex flex-col gap-1">
          <span className="inline-flex items-center gap-2 text-sm leading-none text-muted-foreground">
            <FilterIcon className="size-4" />
            Filter By:
          </span>

          <div className="flex flex-wrap items-center gap-5">
            {/* Plots */}
            <div className="inline-flex items-center gap-2">
              <MapPin className="size-4 text-[#02A78B]" />
              <PlotsDropdown
                items={plotItems}
                value={ui.selectedPlots}
                onChange={(next) => {
                  ui.setSelectedPlots(next);
                  ui.setHideAllPlots(false);
                }}
                onClearAll={clearPlots}
                onSelectAll={selectAllPlots}
                label="Plots"
              />
            </div>

            {/* Crops */}
            <div className="inline-flex items-center gap-2">
              <Sprout className="size-4 text-[#02A78B]" />
              <CropsDropdown
                crops={crops}
                methods={methods}
                value={{ crops: ui.selectedCrops, method: ui.method }}
                onChange={(next) => {
                  ui.setSelectedCrops(next.crops ?? []);
                  ui.setMethod(next.method ?? null);
                  ui.setHideAllCrops(false);
                  if (next.crops && next.crops.length === 1) ui.setCrop(next.crops[0]);
                }}
                onClearAll={clearCrops}
                onSelectAll={selectAllCrops}
                label="Crops"
              />
            </div>

            {/* Tasks */}
            <div className="inline-flex items-center gap-2">
              <ClipboardList className="size-4 text-[#02A78B]" />
              <TasksDropdown
                tasks={tasks}
                value={ui.selectedTasks as any}
                onChange={(next) => {
                  ui.setSelectedTasks(next as any);
                  ui.setHideAllTasks(false);
                  // IMPORTANT: do NOT open panel here; single-click on a cell will open it
                  ui.closeTaskPanel?.();
                }}
                onClearAll={clearTasks}
                onSelectAll={selectAllTasks}
                label="Tasks"
              />
            </div>
          </div>
        </div>

        {/* Right: Indicators (no "Sort" anymore) */}
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
          </div>
        </div>
      </div>

      {/* divider */}
      <div className="mt-3 h-px w-full bg-[#E0F0ED]" />
    </section>
  );
}
