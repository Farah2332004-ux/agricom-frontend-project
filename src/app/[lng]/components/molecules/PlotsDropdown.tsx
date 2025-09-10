"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type PlotNode = {
  country: string;
  city: string;
  plot: string;  // "P1.1"
  id: string;
};

type Props = {
  items: PlotNode[];
  value: string[];                     // selected plot codes (e.g. ["P1.1"])
  onChange: (next: string[]) => void;
  onClearAll?: () => void;
  onSelectAll?: (all: string[]) => void;
  label?: string;
};

const PANEL = "min-w-[560px] p-4";
const GRID  = "grid grid-cols-2 gap-2";
const CHIP  = "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors";
const ACTIVE= "bg-[#E0F0ED] text-[#02A78B]";

function group(items: PlotNode[]) {
  const byCountry = new Map<string, Map<string, PlotNode[]>>();
  items.forEach((it) => {
    if (!byCountry.has(it.country)) byCountry.set(it.country, new Map());
    const byCity = byCountry.get(it.country)!;
    if (!byCity.has(it.city)) byCity.set(it.city, []);
    byCity.get(it.city)!.push(it);
  });
  return Array.from(byCountry.entries()).map(([country, citiesMap]) => ({
    country,
    cities: Array.from(citiesMap.entries()).map(([city, items]) => ({ city, items })),
  }));
}

export default function PlotsDropdown({
  items,
  value,
  onChange,
  onClearAll,
  onSelectAll,
  label = "Plots",
}: Props) {
  const selected = new Set(value);
  const grouped = group(items);
  const allPlotCodes = Array.from(new Set(items.map(i => i.plot)));

  const togglePlot = (code: string) => {
    const next = new Set(selected);
    next.has(code) ? next.delete(code) : next.add(code);
    onChange(Array.from(next));
  };

  const clearAll = () => { onChange([]); onClearAll?.(); };
  const selectAll = () => { onChange(allPlotCodes); onSelectAll?.(allPlotCodes); };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* plain label + chevron (icons live in the filter bar) */}
        <button className="inline-flex items-center gap-2 text-[16px] font-medium hover:text-[#02A78B]">
          {label}
          <ChevronDown className="size-4 opacity-70" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className={PANEL}>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-medium">Plots</div>
          <div className="flex items-center gap-4">
            <button className="text-[#02A78B] text-sm" onClick={selectAll}>Select all</button>
            <button className="text-[#02A78B] text-sm" onClick={clearAll}>Clear</button>
          </div>
        </div>

        {grouped.map(({ country, cities }) => (
          <div key={country} className="mb-4">
            <div className="text-sm font-medium">{country}</div>
            {cities.map(({ city, items }) => (
              <div key={city} className="mt-2">
                <div className="text-xs text-muted-foreground mb-2">{city}</div>
                <div className={GRID}>
                  {items.map((p) => {
                    const active = selected.has(p.plot);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => togglePlot(p.plot)}
                        className={[CHIP, active ? ACTIVE : "hover:bg-[#E0F0ED]/60"].join(" ")}
                      >
                        <span>{p.plot}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
