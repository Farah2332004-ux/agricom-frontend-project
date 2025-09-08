// src/app/[lng]/components/molecules/PlotsDropdown.tsx
"use client"

import * as React from "react"
import { MapPin, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type PlotNode = {
  country: string
  city: string
  plot: string   // e.g. "P1.1"
  id: string     // unique
}

type Props = {
  label?: string
  items: PlotNode[]
  value: string[]
  onChange?: (next: string[]) => void
}

export default function PlotsDropdown({ label = "Plots", items, value, onChange }: Props) {
  // group by country → city
  const grouped = React.useMemo(() => {
    const map = new Map<string, Map<string, PlotNode[]>>() // country -> city -> plots
    for (const n of items) {
      if (!map.has(n.country)) map.set(n.country, new Map())
      const cityMap = map.get(n.country)!
      if (!cityMap.has(n.city)) cityMap.set(n.city, [])
      cityMap.get(n.city)!.push(n)
    }
    return map
  }, [items])

  const toggle = (id: string) => {
    const exists = value.includes(id)
    const next = exists ? value.filter(x => x !== id) : [...value, id]
    onChange?.(next)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* icon + text only (no pill) */}
        <button
          type="button"
          className="inline-flex items-center gap-2 text-[16px] font-medium text-foreground hover:text-[#02A78B]"
        >
          <MapPin className="size-4 text-[#02A78B]" />
          {label}
          <ChevronDown className="size-4 opacity-70" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="p-0">
        <div className="w-[320px] p-3">
          {[...grouped.keys()].map((country) => {
            const cityMap = grouped.get(country)!
            return (
              <div key={country} className="mb-3">
                <div className="text-[13px] font-medium text-muted-foreground">{country}</div>
                {[...cityMap.keys()].map((city) => (
                  <div key={city} className="mt-1 pl-2">
                    <div className="text-xs text-muted-foreground/80">{city}</div>
                  <div className="mt-1 grid grid-cols-[auto_auto] justify-start gap-x-3 gap-y-2">

                      {cityMap.get(city)!.map((n) => {
                        const selected = value.includes(n.id)
                        return (
                          <button
                            type="button"
                            key={n.id}
                            onClick={() => toggle(n.id)}
                            className={[
                              "flex items-center gap-2 rounded-md px-1.5 py-1 text-sm transition-colors",
                              selected ? "text-[#02A78B]" : "hover:bg-[#E0F0ED]/60",
                            ].join(" ")}
                          >
                            <MapPin className="size-4 text-[#02A78B]" />
                            {n.plot}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
